// Pure, side-effect-free helpers pulled out of server.ts so they can be
// unit tested without booting the Express app / Vite dev server.
import { lookup as dnsLookup } from 'dns/promises';
import net from 'net';

// --- SSRF guard for the "import from URL" feature (/api/docs/import) ---
// This endpoint fetches whatever URL a caller supplies, so it's a classic
// SSRF surface (OWASP A10 / the #1 target being cloud metadata at
// 169.254.169.254). Only http/https to a publicly-routable address is
// allowed; every resolved IP for the host must be public, and callers
// should pass `redirect: 'error'` to fetch() so a redirect to a private IP
// can't bypass this check after the fact.
export function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 10) return true; // RFC1918
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local (incl. 169.254.169.254 cloud metadata)
    if (a === 0) return true; // "this network"
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true; // loopback
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique-local fc00::/7
    if (lower.startsWith('fe80')) return true; // link-local
    if (lower.startsWith('::ffff:')) {
      const embedded = lower.slice('::ffff:'.length);
      if (net.isIPv4(embedded)) return isPrivateOrReservedIp(embedded);
    }
    return false;
  }
  return true; // couldn't parse it as an IP at all -> fail closed
}

export async function assertSafeExternalUrl(raw: string): Promise<string> {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http/https URLs are allowed.');
  }
  if (url.hostname === 'localhost' || url.hostname === '0.0.0.0') {
    throw new Error('That URL host is not allowed.');
  }
  const addresses = await dnsLookup(url.hostname, { all: true });
  if (addresses.length === 0) {
    throw new Error('Could not resolve that URL.');
  }
  if (addresses.some((addr) => isPrivateOrReservedIp(addr.address))) {
    throw new Error('That URL resolves to a private/internal network address, which is not allowed.');
  }
  return url.toString();
}

// Extract Google Doc ID or Drive File ID from URL or raw string
export function extractDocId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  // Match /d/ID or /file/d/ID
  const matchD = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9-_]+)/);
  if (matchD && matchD[1]) {
    return matchD[1];
  }
  // Match id=ID or open?id=ID
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (matchId && matchId[1]) {
    return matchId[1];
  }
  return trimmed;
}
