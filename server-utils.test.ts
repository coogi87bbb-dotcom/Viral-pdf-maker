import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIp, assertSafeExternalUrl, extractDocId } from './server-utils';

describe('isPrivateOrReservedIp', () => {
  it('flags RFC1918 and loopback IPv4 ranges as private', () => {
    expect(isPrivateOrReservedIp('10.0.0.5')).toBe(true);
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
  });

  it('flags the cloud metadata link-local address', () => {
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
  });

  it('does not flag 172.32.x.x (just outside the 172.16/12 range)', () => {
    expect(isPrivateOrReservedIp('172.32.0.1')).toBe(false);
  });

  it('allows public IPv4 addresses', () => {
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
  });

  it('flags IPv6 loopback and unique-local/link-local ranges', () => {
    expect(isPrivateOrReservedIp('::1')).toBe(true);
    expect(isPrivateOrReservedIp('fd00::1')).toBe(true);
    expect(isPrivateOrReservedIp('fe80::1')).toBe(true);
  });

  it('unwraps IPv4-mapped IPv6 addresses before checking', () => {
    expect(isPrivateOrReservedIp('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('::ffff:8.8.8.8')).toBe(false);
  });

  it('fails closed on unparseable input', () => {
    expect(isPrivateOrReservedIp('not-an-ip')).toBe(true);
  });
});

describe('assertSafeExternalUrl', () => {
  it('rejects non-http(s) protocols', async () => {
    await expect(assertSafeExternalUrl('file:///etc/passwd')).rejects.toThrow(/http/i);
  });

  it('rejects localhost', async () => {
    await expect(assertSafeExternalUrl('http://localhost/admin')).rejects.toThrow();
  });

  it('rejects hosts that resolve to a private address (loopback)', async () => {
    // 127.0.0.1 as a literal host skips DNS but still resolves to loopback.
    await expect(assertSafeExternalUrl('http://127.0.0.1/secret')).rejects.toThrow();
  });
});

describe('extractDocId', () => {
  it('extracts the id from a /d/ID style Google Docs URL', () => {
    expect(extractDocId('https://docs.google.com/document/d/abc123XYZ-_/edit')).toBe('abc123XYZ-_');
  });

  it('extracts the id from a /file/d/ID style Drive URL', () => {
    expect(extractDocId('https://drive.google.com/file/d/abc123/view')).toBe('abc123');
  });

  it('extracts the id from an id= query param', () => {
    expect(extractDocId('https://drive.google.com/open?id=xyz789')).toBe('xyz789');
  });

  it('falls back to returning the trimmed input when no pattern matches', () => {
    expect(extractDocId('  just-a-raw-id  ')).toBe('just-a-raw-id');
  });
});
