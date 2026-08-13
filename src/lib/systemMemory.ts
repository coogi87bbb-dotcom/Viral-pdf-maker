// Real, persistent failure memory — replaces the app's previous
// "self-healing" story, which was entirely decorative: server.ts's
// BackendSelfHealingStore held hardcoded seed events and an in-memory
// array that (a) never recorded anything from actual user-facing failures
// like the Vercel routing/vite crash this app just hit, and (b) resets to
// its 3 fake seed rows on every serverless cold start anyway, so it
// couldn't have remembered anything even if it were fed real data.
//
// This module writes real failures to Firestore (`system_errors`), keyed
// by a signature so repeat occurrences of the same failure accumulate a
// count/lastSeenAt instead of each being a disconnected one-off — the
// literal mechanism for "don't make the same mistake without anyone
// noticing it's the same mistake." It's called from the two chokepoints
// that see nearly every failure in the app without needing every
// component/route to opt in individually: apiClient.ts (every failed
// backend call) and ErrorBoundary.tsx (every uncaught render crash).
import { db, doc, setDoc, getDoc, getDocs, collection, query, orderBy, limit as fbLimit, serverTimestamp, increment } from './firebase';

export interface SystemErrorRecord {
  signature: string;
  source: string;
  message: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  context?: string;
}

// Collapse a raw error message into a stable signature: strip anything
// that varies per-occurrence (numbers, uuids, quoted values) so the same
// underlying failure dedupes into one growing record instead of a fresh
// document every time. Deliberately coarse — false-merging two distinct
// but similarly-worded errors is a smaller cost here than fragmenting one
// real recurring failure into dozens of count:1 rows that never look like
// a pattern.
function toSignature(source: string, message: string): string {
  const normalized = (message || 'unknown error')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '<uuid>')
    .replace(/\d+/g, '<n>')
    .replace(/["'].*?["']/g, '<val>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const raw = `${source}::${normalized}`;
  // Firestore doc IDs can't contain '/', and keeping them bounded-length
  // avoids the 1500-byte doc ID limit on pathological messages.
  return raw.replace(/[/\s]+/g, '_').slice(0, 300) || 'unknown';
}

/**
 * Record a real failure. Safe to call liberally — never throws (a broken
 * error-memory write must never itself break the feature that failed), and
 * is intentionally fire-and-forget from every call site.
 */
export async function recordFailure(source: string, error: unknown, context?: string): Promise<void> {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const signature = toSignature(source, message);
    const nowIso = new Date().toISOString();
    const ref = doc(db, 'system_errors', signature);
    // Read-before-write so firstSeenAt is set once on the initial
    // occurrence and never touched again on repeats (merge:true otherwise
    // leaves omitted fields alone, but we still need to know whether to
    // omit it). One extra read per failure is a fine trade for correct
    // "first seen" data — this path only runs when something already
    // broke, never on the hot path.
    const existing = await getDoc(ref);
    await setDoc(
      ref,
      {
        signature,
        source,
        message: message.slice(0, 500),
        context: context?.slice(0, 300) || null,
        count: increment(1),
        lastSeenAt: nowIso,
        lastSeenAtServer: serverTimestamp(),
        ...(existing.exists() ? {} : { firstSeenAt: nowIso })
      },
      { merge: true }
    );
  } catch (memErr) {
    // Best-effort telemetry — never let a failed write mask or replace the
    // original error the caller is already handling.
    console.warn('[systemMemory] Failed to record failure (non-fatal):', memErr);
  }
}

/** Read back the most-recurring known failures, newest-active first. Used by Master Admin's real system-memory panel. */
export async function getKnownFailures(max = 50): Promise<SystemErrorRecord[]> {
  const q = query(collection(db, 'system_errors'), orderBy('lastSeenAt', 'desc'), fbLimit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SystemErrorRecord);
}
