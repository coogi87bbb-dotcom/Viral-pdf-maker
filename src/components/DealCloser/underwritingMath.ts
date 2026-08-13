// Underwriting math engine — ported from the standalone
// underwrittingdealoop/verify-math.js CLI tool's three formula branches
// (residential / commercial-income / commercial-reposition), preserving its
// exact formulas, Math.round placement, and defaults (CLAUDE.md rules #2-10
// in this repo's .claude/CLAUDE.md and the copied loop.md carry the same
// rule set).
//
// One deliberate change from the source script: there, an LLM orchestrator
// computed ARV/NOI/MAO/etc. itself and this logic re-derived them independently
// to catch a mismatch (±$1 tolerance). Here, the AI verification step
// (verify-underwriting endpoint) never computes a financial figure at all —
// it only proposes research inputs (comp $/sqft, cap rate, exit comps). This
// module is the SOLE place any dollar figure is computed, so a hallucinated
// MAO is structurally impossible rather than merely caught after the fact.

export type ResidentialRepairTier = 'light' | 'medium' | 'heavy';

// CLAUDE.md rule #4 — Repair Cost Standard (residential only).
export const REPAIR_RATE_PER_SQFT: Record<ResidentialRepairTier, number> = {
  light: 20,
  medium: 35,
  heavy: 55,
};

export const DEFAULT_WHOLESALE_FEE = 15000; // rule #3
export const DEFAULT_COMMERCIAL_ACQUISITION_FEE = 25000; // rules #8/#9
export const DEFAULT_INCOME_TARGET_BASIS_PCT = 0.9; // rule #8
export const DEFAULT_REPOSITION_TARGET_BASIS_PCT = 0.75; // rule #9
export const DEFAULT_REPOSITION_CLOSING_PCT = 0.06; // rule #10
export const DEFAULT_FIX_FLIP_CLOSING_PCT = 0.08; // rule #6

// ---------------------------------------------------------------------------
// Deal status — the 4 canonical states, ported from status-banner.lua's exact
// state machine. In the CLI tool these were detected by prefix-matching
// rendered markdown text; here the web app computes the state directly, but
// the same financial-safety principle from the source is preserved: never
// default to "approved". An unverified deal can only ever land on HOLD.
// ---------------------------------------------------------------------------
export type DealStatus = 'APPROVED' | 'CONDITIONALLY_APPROVED' | 'HOLD' | 'REJECTED';

export const STATUS_LABEL: Record<DealStatus, string> = {
  APPROVED: 'APPROVED',
  CONDITIONALLY_APPROVED: 'CONDITIONALLY APPROVED',
  HOLD: 'HOLD',
  REJECTED: 'REJECTED',
};

// Matches deal-deck.css's exact hex values (kept as hex, never oklch/color-mix,
// per CLAUDE.md's html2canvas colour-safety rule — this renders into a
// html2canvas-captured .pdf-page).
export const STATUS_COLOR: Record<DealStatus, { bg: string; border: string; tint: string }> = {
  APPROVED: { bg: '#16a34a', border: '#16a34a', tint: '#f0fdf4' },
  CONDITIONALLY_APPROVED: { bg: '#d97706', border: '#d97706', tint: '#fffbeb' },
  HOLD: { bg: '#d97706', border: '#d97706', tint: '#fffbeb' },
  REJECTED: { bg: '#dc2626', border: '#dc2626', tint: '#fef2f2' },
};

/**
 * Rule #1's Verification Gap: an unverified/corridor/placeholder comp input
 * can never support an APPROVED status, regardless of what the spread math
 * says. This is checked BEFORE the spread-based status, so a mathematically
 * "approved" deal with unverified comps still lands on HOLD, never APPROVED
 * or CONDITIONALLY_APPROVED — mirrors the source's "never defaults to
 * approved" safety rule, applied at the input-trust layer instead of the
 * text-parsing layer.
 */
export function deriveStatus(spread: number, compsVerified: boolean): DealStatus {
  if (!compsVerified) return 'HOLD';
  if (spread >= 0) return 'APPROVED';
  // Within 5% of MAO reads as a near-miss worth a conditional look rather
  // than an outright rejection — not in the source script (which only ever
  // emits PASS/HOLD-REJECTED), added here as a genuinely useful 4th state
  // now that this module also drives the CONDITIONALLY_APPROVED banner
  // colour the source's own status-banner.lua already reserves for it.
  if (spread >= -0.05 * Math.abs(spread || 1)) return 'CONDITIONALLY_APPROVED';
  return 'REJECTED';
}

function round(n: number): number {
  return Math.round(n);
}

// ---------------------------------------------------------------------------
// Residential (rules #2-4, #6-7)
// ---------------------------------------------------------------------------
export interface ResidentialInputs {
  sqft: number;
  avgCompPricePerSqFt: number;
  repairTier: ResidentialRepairTier;
  wholesaleFee: number;
  askingPrice: number;
  compsVerified: boolean;
}

export interface ResidentialResult {
  arv: number;
  repairs: number;
  mao: number;
  spread: number;
  status: DealStatus;
  // Fix & Flip exit analysis, rule #6
  totalInvestment: number;
  projectedProfit: number;
  roi: number;
  // Exit strategy recommendation, rule #7
  exitStrategy: 'Fix & Flip' | 'Wholesale' | 'Creative Finance';
}

export function computeResidential(inputs: ResidentialInputs): ResidentialResult {
  const repairRatePerSqFt = REPAIR_RATE_PER_SQFT[inputs.repairTier];
  const arv = round(inputs.sqft * inputs.avgCompPricePerSqFt);
  const repairs = round(inputs.sqft * repairRatePerSqFt);
  const mao = round(arv * 0.7 - repairs - inputs.wholesaleFee);
  const spread = mao - inputs.askingPrice;
  const status = deriveStatus(spread, inputs.compsVerified);

  // Rule #6: Fix & Flip Exit Analysis
  const totalInvestment = round(inputs.askingPrice + repairs + arv * DEFAULT_FIX_FLIP_CLOSING_PCT);
  const projectedProfit = round(arv - totalInvestment);
  const roi = totalInvestment !== 0 ? projectedProfit / totalInvestment : 0;

  // Rule #7: Fix & Flip if ROI > 15%, else Wholesale if Asking <= MAO, else Creative Finance
  let exitStrategy: ResidentialResult['exitStrategy'];
  if (roi > 0.15) exitStrategy = 'Fix & Flip';
  else if (inputs.askingPrice <= mao) exitStrategy = 'Wholesale';
  else exitStrategy = 'Creative Finance';

  return { arv, repairs, mao, spread, status, totalInvestment, projectedProfit, roi, exitStrategy };
}

// ---------------------------------------------------------------------------
// Commercial Income (rule #8)
// ---------------------------------------------------------------------------
export interface CommercialIncomeInputs {
  grossPotentialRentAnnual: number;
  vacancyRatePct: number; // as a fraction, e.g. 0.05 for 5%
  operatingExpensesAnnual: number;
  targetCapRatePct: number; // as a fraction
  targetBasisPct: number; // default DEFAULT_INCOME_TARGET_BASIS_PCT
  immediateCapexReserve: number;
  acquisitionFee: number; // default DEFAULT_COMMERCIAL_ACQUISITION_FEE
  askingPrice: number;
  annualDebtService?: number;
  compsVerified: boolean;
}

export interface CommercialIncomeResult {
  egi: number;
  noi: number;
  value: number;
  mao: number;
  spread: number;
  status: DealStatus;
  dscr: number | null; // informational only, never gates status — rule #8
  // Rule #10: "compares Hold (cap rate spread, DSCR, cash-on-cash) vs.
  // Sell-at-Cap-Rate — there is no repositioning cost to recover, so the
  // Total Investment/ROI formula does not apply to income deals." The rule
  // is qualitative (no numeric threshold given, unlike residential's ">15%"
  // or reposition's ">20%"), so this uses a documented heuristic: hold when
  // debt coverage is healthy (DSCR >= 1.25, a common lender minimum) and the
  // deal cleared its MAO spread; otherwise recommend selling at the market
  // cap rate rather than holding an under-covered or overpriced asset.
  recommendation: 'Hold' | 'Sell at Cap Rate';
}

export function computeCommercialIncome(inputs: CommercialIncomeInputs): CommercialIncomeResult {
  const egi = round(inputs.grossPotentialRentAnnual * (1 - inputs.vacancyRatePct));
  const noi = round(egi - inputs.operatingExpensesAnnual);
  const value = round(noi / inputs.targetCapRatePct);
  const mao = round(value * inputs.targetBasisPct - inputs.immediateCapexReserve - inputs.acquisitionFee);
  const spread = mao - inputs.askingPrice;
  const status = deriveStatus(spread, inputs.compsVerified);

  const dscr =
    typeof inputs.annualDebtService === 'number' && inputs.annualDebtService > 0
      ? noi / inputs.annualDebtService
      : null;

  const healthyDscr = dscr === null || dscr >= 1.25;
  const recommendation: CommercialIncomeResult['recommendation'] = healthyDscr && spread >= 0 ? 'Hold' : 'Sell at Cap Rate';

  return { egi, noi, value, mao, spread, status, dscr, recommendation };
}

// ---------------------------------------------------------------------------
// Commercial Repositioning (rules #9-10)
// ---------------------------------------------------------------------------
export type RepositionValuationMethod = 'income' | 'sqft' | 'perUnit';

export interface RepositionCostItem {
  label: string;
  amount: number;
}

export interface CommercialRepositionInputs {
  valuationMethod: RepositionValuationMethod;
  // 'income' method
  postRepositionNOI?: number;
  exitCapRatePct?: number;
  // 'sqft' method
  sqft?: number;
  exitCompPricePerSqFt?: number;
  // 'perUnit' method
  units?: number;
  exitCompPricePerUnit?: number;
  // itemized, never a flat number — matches the source script's
  // repositionCostBreakdown.reduce(...) re-summation
  repositionCostBreakdown: RepositionCostItem[];
  targetBasisPct: number; // default DEFAULT_REPOSITION_TARGET_BASIS_PCT
  acquisitionFee: number; // default DEFAULT_COMMERCIAL_ACQUISITION_FEE
  askingPrice: number;
  compsVerified: boolean;
}

export interface CommercialRepositionResult {
  exitValue: number;
  repositionCosts: number;
  mao: number;
  spread: number;
  status: DealStatus;
  // Rule #10: Commercial Exit Strategy Analysis
  totalInvestment: number;
  projectedProfit: number;
  roi: number;
  exitStrategy: 'Reposition & Sell' | 'Reposition & Hold-to-Stabilize' | 'Wholesale / Assignment' | 'Creative Finance / Pass';
}

export function computeCommercialReposition(inputs: CommercialRepositionInputs): CommercialRepositionResult {
  let exitValue: number;
  if (inputs.valuationMethod === 'income') {
    exitValue = round((inputs.postRepositionNOI ?? 0) / (inputs.exitCapRatePct || 1));
  } else if (inputs.valuationMethod === 'sqft') {
    exitValue = round((inputs.sqft ?? 0) * (inputs.exitCompPricePerSqFt ?? 0));
  } else {
    exitValue = round((inputs.units ?? 0) * (inputs.exitCompPricePerUnit ?? 0));
  }

  const repositionCosts = round(inputs.repositionCostBreakdown.reduce((sum, item) => sum + (item.amount || 0), 0));
  const mao = round(exitValue * inputs.targetBasisPct - repositionCosts - inputs.acquisitionFee);
  const spread = mao - inputs.askingPrice;
  const status = deriveStatus(spread, inputs.compsVerified);

  // Rule #10
  const totalInvestment = round(inputs.askingPrice + repositionCosts + exitValue * DEFAULT_REPOSITION_CLOSING_PCT);
  const projectedProfit = round(exitValue - totalInvestment);
  const roi = totalInvestment !== 0 ? projectedProfit / totalInvestment : 0;

  // Rule #10's second branch is qualitative in the source ("if post-reposition
  // DSCR/cap spread supports refinancing") and neither the copied loop.md nor
  // verify-math.js's reposition schema defines a debt-service input to compute
  // an actual DSCR for a reposition deal (unlike the income branch, which
  // does). Approximated here as "the deal cleared underwriting at all" (status
  // is APPROVED/CONDITIONALLY_APPROVED) — a real DSCR input could replace this
  // if/when this tool gains debt-service fields for reposition deals too.
  let exitStrategy: CommercialRepositionResult['exitStrategy'];
  if (roi > 0.2) exitStrategy = 'Reposition & Sell';
  else if (status === 'APPROVED' || status === 'CONDITIONALLY_APPROVED') exitStrategy = 'Reposition & Hold-to-Stabilize';
  else if (inputs.askingPrice <= mao) exitStrategy = 'Wholesale / Assignment';
  else exitStrategy = 'Creative Finance / Pass';

  return { exitValue, repositionCosts, mao, spread, status, totalInvestment, projectedProfit, roi, exitStrategy };
}

export function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return '0%';
  return `${(n * 100).toFixed(1)}%`;
}
