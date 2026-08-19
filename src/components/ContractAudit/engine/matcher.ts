// Line-item matcher — ported from analyzer/matcher.py's LineItemMatcher.
// Two-pass strategy: exact item_code match first (100% confidence), then
// fuzzy token-sort matching on description for whatever's left, but only
// between items whose billing periods overlap (so "Office Supplies —
// Jan" never fuzzy-matches "Office Supplies — Jun").
//
// tokenSortRatio below is a genuine port of Python's
// difflib.SequenceMatcher.ratio() (Ratcliff/Obershelp), not an
// approximation — see findLongestMatch/getMatchingBlocks. difflib's
// "autojunk" heuristic (which only kicks in past 200-character sequences)
// is intentionally omitted: normalized, token-sorted line-item
// descriptions never get remotely that long, so it would never trigger,
// and skipping it keeps this port simpler without changing behavior for
// any real input here.
import Decimal from 'decimal.js';
import type { ContractLineItem, InvoiceLineItem, MatchResult, MatchedPair } from '../types';
import type { UseCaseProfile } from './useCaseConfigs';

const SCORE_PLACES = 2;

function findLongestMatch(a: string, b: string): [number, number, number] {
  const b2j = new Map<string, number[]>();
  for (let j = 0; j < b.length; j++) {
    const c = b[j];
    const list = b2j.get(c);
    if (list) list.push(j);
    else b2j.set(c, [j]);
  }

  let bestI = 0;
  let bestJ = 0;
  let bestSize = 0;
  let j2len = new Map<number, number>();

  for (let i = 0; i < a.length; i++) {
    const newJ2len = new Map<number, number>();
    const candidates = b2j.get(a[i]);
    if (candidates) {
      for (const j of candidates) {
        const k = (j2len.get(j - 1) || 0) + 1;
        newJ2len.set(j, k);
        if (k > bestSize) {
          bestI = i - k + 1;
          bestJ = j - k + 1;
          bestSize = k;
        }
      }
    }
    j2len = newJ2len;
  }

  return [bestI, bestJ, bestSize];
}

function getMatchingBlocks(a: string, b: string): Array<[number, number, number]> {
  const queue: Array<[number, number, number, number]> = [[0, a.length, 0, b.length]];
  const blocks: Array<[number, number, number]> = [];

  while (queue.length) {
    const [aLo, aHi, bLo, bHi] = queue.pop()!;
    const [i, j, k] = findLongestMatch(a.slice(aLo, aHi), b.slice(bLo, bHi));
    const ai = i + aLo;
    const bj = j + bLo;
    if (k) {
      blocks.push([ai, bj, k]);
      if (aLo < ai && bLo < bj) queue.push([aLo, ai, bLo, bj]);
      if (ai + k < aHi && bj + k < bHi) queue.push([ai + k, aHi, bj + k, bHi]);
    }
  }

  blocks.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  return blocks;
}

function sequenceMatcherRatio(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  const matches = getMatchingBlocks(a, b).reduce((sum, [, , size]) => sum + size, 0);
  return (2 * matches) / (a.length + b.length);
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

function tokenSort(value: string): string {
  const tokens = normalizeWhitespace(value).match(/[A-Z0-9]+/g) || [];
  return [...tokens].sort().join(' ');
}

export function tokenSortRatio(a: string, b: string): Decimal {
  const ratio = sequenceMatcherRatio(tokenSort(a), tokenSort(b));
  return new Decimal(ratio).times(100).toDecimalPlaces(SCORE_PLACES, Decimal.ROUND_HALF_UP);
}

// Two ranges overlap if each starts on/before the other's end. Missing
// dates on either side are treated as "no constraint" (overlap allowed) —
// real-world exports frequently omit period columns for evergreen items.
function periodsOverlap(
  aStart: string | null,
  aEnd: string | null,
  bStart: string | null,
  bEnd: string | null
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return true;
  return aStart <= bEnd && bStart <= aEnd;
}

export function matchLineItems(
  contractItems: ContractLineItem[],
  invoiceItems: InvoiceLineItem[],
  profile: UseCaseProfile
): MatchResult {
  const pairs: MatchedPair[] = [];
  const matchedInvoiceIndices = new Set<number>();
  const remainingContract: ContractLineItem[] = [];

  // Pass 1: exact item_code match.
  for (const contract of contractItems) {
    const invoiceIndex = invoiceItems.findIndex(
      (inv, idx) => !matchedInvoiceIndices.has(idx) && inv.itemCode === contract.itemCode && contract.itemCode !== ''
    );
    if (invoiceIndex !== -1) {
      matchedInvoiceIndices.add(invoiceIndex);
      pairs.push({
        contract,
        invoice: invoiceItems[invoiceIndex],
        method: 'EXACT_KEY',
        confidence: new Decimal('100.00'),
        matchedOn: 'item_code (exact)',
      });
    } else {
      remainingContract.push(contract);
    }
  }

  // Pass 2: fuzzy match on description, restricted to overlapping periods,
  // among whatever's left after Pass 1.
  const stillUnmatchedContract: ContractLineItem[] = [];
  for (const contract of remainingContract) {
    let bestIndex = -1;
    let bestScore = profile.fuzzyThreshold;
    for (let idx = 0; idx < invoiceItems.length; idx++) {
      if (matchedInvoiceIndices.has(idx)) continue;
      const invoice = invoiceItems[idx];
      if (!periodsOverlap(contract.billingPeriodStart, contract.billingPeriodEnd, invoice.billingPeriodStart, invoice.billingPeriodEnd)) {
        continue;
      }
      const score = tokenSortRatio(contract.description, invoice.description);
      if (score.gte(bestScore)) {
        bestScore = score;
        bestIndex = idx;
      }
    }
    if (bestIndex !== -1) {
      matchedInvoiceIndices.add(bestIndex);
      pairs.push({
        contract,
        invoice: invoiceItems[bestIndex],
        method: 'FUZZY',
        confidence: bestScore,
        matchedOn: `description (${bestScore.toFixed(2)}% match)`,
      });
    } else {
      stillUnmatchedContract.push(contract);
    }
  }

  const unmatchedInvoice = invoiceItems.filter((_, idx) => !matchedInvoiceIndices.has(idx));

  return {
    pairs,
    unmatchedContract: stillUnmatchedContract,
    unmatchedInvoice,
  };
}
