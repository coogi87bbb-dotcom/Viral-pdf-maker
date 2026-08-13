// Thin wrapper around fetch() for calling our own /api/* backend. Every
// route except /api/health now requires a Firebase ID token (see
// auth-middleware.ts on the server), so this attaches
// `Authorization: Bearer <idToken>` automatically instead of every call
// site having to remember to do it.
import { auth } from './firebase';
import { recordFailure } from './systemMemory';

export class ApiAuthError extends Error {
  constructor(message = 'You need to be signed in to do that.') {
    super(message);
    this.name = 'ApiAuthError';
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new ApiAuthError();
  }

  const idToken = await currentUser.getIdToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${idToken}`);

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch (networkErr) {
    // Network-level failure (offline, DNS, CORS, the exact class of thing
    // that made every /api/* call 404 against Vercel's platform page
    // before this app's serverless routing was fixed) — record it so it
    // shows up as a real, recurring pattern instead of vanishing.
    recordFailure(`apiFetch:${path}`, networkErr, 'fetch() threw');
    throw networkErr;
  }
  if (res.status === 401) {
    throw new ApiAuthError('Your session expired. Please sign in again.');
  }
  if (!res.ok) {
    // Fire-and-forget: don't delay the caller's own error handling on this.
    recordFailure(`apiFetch:${path}`, new Error(`HTTP ${res.status}`), `non-OK response`);
  }
  return res;
}

// Convenience helper for the common "POST JSON, expect JSON back" shape
// that most call sites use.
export async function apiPostJson<T = any>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  try {
    return await res.json();
  } catch (parseErr) {
    // The body wasn't valid JSON — e.g. a platform error page (Vercel's
    // NOT_FOUND/FUNCTION_INVOCATION_FAILED HTML) coming back where JSON was
    // expected. This is exactly the failure mode this session spent a long
    // time reverse-engineering by hand; record it so next time it's a
    // lookup instead of a fresh investigation.
    recordFailure(`apiPostJson:${path}`, parseErr, 'response body was not valid JSON');
    throw parseErr;
  }
}
