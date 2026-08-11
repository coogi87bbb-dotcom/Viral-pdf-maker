// Thin wrapper around fetch() for calling our own /api/* backend. Every
// route except /api/health now requires a Firebase ID token (see
// auth-middleware.ts on the server), so this attaches
// `Authorization: Bearer <idToken>` automatically instead of every call
// site having to remember to do it.
import { auth } from './firebase';

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

  const res = await fetch(path, { ...init, headers });
  if (res.status === 401) {
    throw new ApiAuthError('Your session expired. Please sign in again.');
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
  return res.json();
}
