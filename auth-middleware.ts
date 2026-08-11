// Express middleware that verifies a Firebase Auth ID token sent by the
// client as `Authorization: Bearer <idToken>`.
//
// This deliberately does NOT use firebase-admin: the Admin SDK needs a
// service account / Application Default Credentials to talk to Google,
// which this deployment doesn't have configured. Firebase ID tokens are
// signed RS256 JWTs, so they can be verified with nothing but Google's
// public JWKS — no server-side secret or credential required. See:
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
import type { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import firebaseConfig from './firebase-applet-config.json';

const PROJECT_ID = firebaseConfig.projectId;

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sign in required. Missing Authorization header.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Sign in required. Empty bearer token.' });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      res.status(401).json({ error: 'Invalid session token.' });
      return;
    }

    req.user = {
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : null,
      emailVerified: payload.email_verified === true
    };
    next();
  } catch (err) {
    console.warn('[auth] token verification failed:', err instanceof Error ? err.message : err);
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
}
