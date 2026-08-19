// Shared types for the Contract Audit tool — a native, client-side port of
// High-Ticket-Contract-Financial-Auditing's variance-detection engine
// (github.com/coogi87bbb-dotcom/High-Ticket-Contract-Financial-Auditing).
// Field names and the Severity enum below are ported 1:1 from that repo's
// `config/models.py` Pydantic models so this stays a faithful port, not a
// loose reinterpretation — see engine/useCaseConfigs.ts for the source
// use-case profiles and engine/varianceCalculator.ts for the classification
// logic this data feeds.
//
// v1 covers 2 of the source repo's 5 use cases (Expense Reimbursement,
// SaaS Subscription) — the two with the simplest, most self-contained
// tolerance rules — and CSV-only ingestion (no Excel upload/export; see
// engine/ingestion.ts's header comment for why). Runs entirely in the
// browser: no server round-trip, no separately-hosted service.
import Decimal from 'decimal.js';

export const USE_CASE_IDS = ['expense', 'saas'] as const;
export type ContractAuditUseCase = (typeof USE_CASE_IDS)[number];

export const USE_CASE_LABELS: Record<ContractAuditUseCase, string> = {
  expense: 'Expense Reimbursement',
  saas: 'SaaS Subscription',
};

// Ported from config/models.py's Severity(StrEnum).
export const SEVERITY_IDS = ['WITHIN_TOLERANCE', 'REVIEW', 'DISPUTE'] as const;
export type Severity = (typeof SEVERITY_IDS)[number];

export const SEVERITY_LABELS: Record<Severity, string> = {
  WITHIN_TOLERANCE: 'Within Tolerance',
  REVIEW: 'Review',
  DISPUTE: 'Dispute',
};

// Ported from config/models.py's ToleranceProfile.
export interface ToleranceProfile {
  pctTolerance: Decimal;
  absTolerance: Decimal;
  reviewBandMultiplier: Decimal;
}

// Ported from config/models.py's _LineItemBase / ContractLineItem.
export interface ContractLineItem {
  itemCode: string;
  description: string;
  category: string;
  quantity: Decimal;
  billingPeriodStart: string | null; // ISO date, when the column is present
  billingPeriodEnd: string | null;
  agreedRate: Decimal;
  agreedAmount: Decimal;
  capAmount: Decimal | null;
  contractClause: string | null;
  rawSource: Record<string, string>;
}

// Ported from config/models.py's _LineItemBase / InvoiceLineItem.
export interface InvoiceLineItem {
  itemCode: string;
  description: string;
  category: string;
  quantity: Decimal;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  billedRate: Decimal;
  billedAmount: Decimal;
  invoiceRef: string;
  rawSource: Record<string, string>;
}

// Ported from analyzer/matcher.py's MatchMethod.
export type MatchMethod = 'EXACT_KEY' | 'FUZZY';

export interface MatchedPair {
  contract: ContractLineItem;
  invoice: InvoiceLineItem;
  method: MatchMethod;
  confidence: Decimal; // 0.00–100.00
  matchedOn: string;
}

export interface MatchResult {
  pairs: MatchedPair[];
  unmatchedContract: ContractLineItem[];
  unmatchedInvoice: InvoiceLineItem[];
}

// Ported from config/models.py's VarianceFinding.
export interface VarianceFinding {
  id: string;
  itemCode: string;
  description: string;
  invoiceRef: string;
  contractClause: string | null;
  agreedAmount: Decimal;
  billedAmount: Decimal;
  varianceAmount: Decimal;
  variancePct: Decimal | null; // null when agreedAmount is 0 — see varianceCalculator.ts
  capBreached: boolean;
  severity: Severity;
  explanation: string;
}

// Ported from config/models.py's AuditResult, plus a client-generated
// auditId (the source repo's YYYYMMDD_HHMMSS format doesn't apply here —
// there's no server minting it, so this uses a plain timestamp + random
// suffix instead, stamped by the caller since Date.now()/crypto aren't
// available inside pure engine functions that need to stay deterministic
// for testing).
export interface AuditResult {
  auditId: string;
  useCase: ContractAuditUseCase;
  jurisdiction: string;
  createdAt: string; // ISO timestamp
  findings: VarianceFinding[];
  unmatchedContractItems: ContractLineItem[];
  unmatchedInvoiceItems: InvoiceLineItem[];
  totalAgreed: Decimal;
  totalBilled: Decimal;
  totalRecoverable: Decimal; // sum of variance amounts for REVIEW/DISPUTE findings only
  parseErrors: string[];
}

// A persisted "My Audits" history record. Decimal values are serialized to
// plain strings for Firestore (it has no native arbitrary-precision type)
// and re-hydrated back into Decimal on read — see shared.tsx's
// serializeAuditResult/deserializeAuditResult.
export interface SavedAudit {
  docId: string;
  result: AuditResult;
}
