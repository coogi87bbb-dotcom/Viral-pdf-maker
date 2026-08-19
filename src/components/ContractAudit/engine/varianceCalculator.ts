// Variance calculation and severity classification — ported from
// analyzer/variance.py's VarianceCalculator.
//
// variance = (billed - agreed), rounded to cents, ROUND_HALF_UP
// pct = (variance / agreed * 100), rounded to 2dp, ROUND_HALF_UP — only
//   when agreed != 0; see the capBreached-style special case below for why.
//
// Severity hierarchy (checked in this order — first match wins):
//   1. Cap breach (billed > cap_amount, when a cap is set)      -> DISPUTE
//   2. Dual-threshold exceeded at the review-band-multiplied
//      thresholds (|variance| > abs*mult AND |pct| > pct*mult)  -> DISPUTE
//   3. Dual-threshold exceeded at the base thresholds
//      (|variance| > abs AND |pct| > pct)                       -> REVIEW
//   4. Otherwise                                                 -> WITHIN_TOLERANCE
import Decimal from 'decimal.js';
import type { MatchedPair, Severity, ToleranceProfile, VarianceFinding } from '../types';
import { quantizeCents, quantizePercent } from './decimalUtils';

function exceedsBothThresholds(varianceAbs: Decimal, pctAbs: Decimal | null, absLimit: Decimal, pctLimit: Decimal): boolean {
  // When agreed_amount is 0, pct is undefined rather than a real ratio
  // (division by zero) — the source repo's exact branch for this case
  // wasn't visible in what this port was built from, so this takes the
  // conservative, explainable position: an entirely unbudgeted line item
  // (agreed=0) that gets billed anything at all is treated as exceeding
  // the pct threshold outright, since "infinite percent overage" is a
  // reasonable read of "we agreed to pay nothing for this and got billed
  // something" — rather than silently passing it as WITHIN_TOLERANCE
  // because a percentage literally couldn't be computed.
  const pctExceeds = pctAbs === null ? true : pctAbs.gt(pctLimit);
  return varianceAbs.gt(absLimit) && pctExceeds;
}

export function classifySeverity(
  varianceAbs: Decimal,
  pctAbs: Decimal | null,
  capBreached: boolean,
  tolerance: ToleranceProfile
): Severity {
  if (capBreached) return 'DISPUTE';

  const disputeAbsLimit = tolerance.absTolerance.times(tolerance.reviewBandMultiplier);
  const disputePctLimit = tolerance.pctTolerance.times(tolerance.reviewBandMultiplier);
  if (exceedsBothThresholds(varianceAbs, pctAbs, disputeAbsLimit, disputePctLimit)) return 'DISPUTE';

  if (exceedsBothThresholds(varianceAbs, pctAbs, tolerance.absTolerance, tolerance.pctTolerance)) return 'REVIEW';

  return 'WITHIN_TOLERANCE';
}

let findingCounter = 0;
function nextFindingId(): string {
  findingCounter += 1;
  return `finding-${findingCounter}`;
}

export function calculateFinding(pair: MatchedPair, tolerance: ToleranceProfile): VarianceFinding {
  const { contract, invoice } = pair;
  const agreedAmount = contract.agreedAmount;
  const billedAmount = invoice.billedAmount;
  const varianceAmount = quantizeCents(billedAmount.minus(agreedAmount));
  const variancePct = agreedAmount.isZero() ? null : quantizePercent(varianceAmount.div(agreedAmount).times(100));

  const capBreached = contract.capAmount !== null && billedAmount.gt(contract.capAmount);
  const severity = classifySeverity(varianceAmount.abs(), variancePct === null ? null : variancePct.abs(), capBreached, tolerance);

  const explanationParts = [`Billed ${billedAmount.toFixed(2)} vs. agreed ${agreedAmount.toFixed(2)} = ${varianceAmount.toFixed(2)}`];
  if (variancePct !== null) explanationParts.push(`(${variancePct.toFixed(2)}%)`);
  if (capBreached) explanationParts.push(`— exceeds contract cap of ${contract.capAmount!.toFixed(2)}`);

  return {
    id: nextFindingId(),
    itemCode: contract.itemCode || invoice.itemCode,
    description: contract.description || invoice.description,
    invoiceRef: invoice.invoiceRef,
    contractClause: contract.contractClause,
    agreedAmount,
    billedAmount,
    varianceAmount,
    variancePct,
    capBreached,
    severity,
    explanation: explanationParts.join(' '),
  };
}

// Duplicate-billing check — a simplified port of analyzer/variance.py's
// flag_duplicate(): if the same item_code appears more than once on the
// invoice, that's a dispute-grade finding on its own regardless of any
// individual line's variance (a legitimate single overcharge might slip
// under tolerance; a flat-out re-billed line item never should).
export function findDuplicateInvoiceItemCodes(invoiceItemCodes: string[]): string[] {
  const seen = new Map<string, number>();
  for (const code of invoiceItemCodes) {
    if (!code) continue;
    seen.set(code, (seen.get(code) || 0) + 1);
  }
  return [...seen.entries()].filter(([, count]) => count > 1).map(([code]) => code);
}
