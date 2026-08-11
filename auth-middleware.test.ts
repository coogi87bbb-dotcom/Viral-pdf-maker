import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

const jwtVerifyMock = vi.fn();

// jwtVerify would otherwise make a real network call to Google's JWKS
// endpoint; stub the whole `jose` module so these tests exercise only
// requireAuth's own logic (header parsing, error handling, payload mapping).
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'mock-jwks'),
  jwtVerify: (...args: unknown[]) => jwtVerifyMock(...args)
}));

const { requireAuth } = await import('./auth-middleware');

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('requireAuth', () => {
  beforeEach(() => {
    jwtVerifyMock.mockReset();
  });

  it('rejects requests with no Authorization header', async () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(jwtVerifyMock).not.toHaveBeenCalled();
  });

  it('rejects when the token fails verification', async () => {
    jwtVerifyMock.mockRejectedValue(new Error('signature verification failed'));
    const req = { headers: { authorization: 'Bearer bad-token' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a verified token with no sub claim', async () => {
    jwtVerifyMock.mockResolvedValue({ payload: {} });
    const req = { headers: { authorization: 'Bearer good-token' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches req.user and calls next() on a valid token', async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: { sub: 'uid-123', email: 'owner@example.com', email_verified: true }
    });
    const req = { headers: { authorization: 'Bearer good-token' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toEqual({ uid: 'uid-123', email: 'owner@example.com', emailVerified: true });
  });

  it('defaults emailVerified to false when the claim is absent', async () => {
    jwtVerifyMock.mockResolvedValue({ payload: { sub: 'uid-456' } });
    const req = { headers: { authorization: 'Bearer good-token' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(req.user).toEqual({ uid: 'uid-456', email: null, emailVerified: false });
  });
});
