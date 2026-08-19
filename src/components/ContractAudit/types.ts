// Shared types for the Contract Audit tool — a native Studio OS wrapper
// around the separately-deployed High-Ticket-Contract-Financial-Auditing
// FastAPI service (github.com/coogi87bbb-dotcom/High-Ticket-Contract-
// Financial-Auditing). The Decimal-precision variance-detection engine
// stays in that service; server.ts proxies to it (/api/contract-audit/*)
// and this directory is purely the native UI + report rendering.

export const USE_CASE_IDS = ['lease_cam', 'freight', 'saas', 'expense', 'medical'] as const;
export type ContractAuditUseCase = (typeof USE_CASE_IDS)[number];

export const USE_CASE_LABELS: Record<ContractAuditUseCase, string> = {
  lease_cam: 'Commercial Lease / CAM',
  freight: 'Freight & Logistics',
  saas: 'SaaS Subscription',
  expense: 'Expense Reimbursement',
  medical: 'Medical Billing',
};

export const SEVERITY_IDS = ['critical', 'high', 'medium', 'low', 'info'] as const;
export type AuditSeverity = (typeof SEVERITY_IDS)[number];

export const SEVERITY_LABELS: Record<AuditSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export interface AuditFinding {
  id: string;
  clause: string;
  description: string;
  contractAmount: number | null;
  invoiceAmount: number | null;
  variance: number | null;
  severity: AuditSeverity;
  recommendation?: string;
}

export interface AuditSummary {
  totalVariance: number;
  findingCounts: Record<AuditSeverity, number>;
}

export interface AuditResult {
  auditId: string;
  useCase: ContractAuditUseCase;
  jurisdiction: string;
  summary: AuditSummary;
  findings: AuditFinding[];
}

// Matches the { fileName, mimeType, base64Data } JSON-body convention
// /api/docs/parse-file already uses elsewhere in this app.
export interface EncodedUpload {
  fileName: string;
  mimeType: string;
  base64Data: string;
}

// A persisted "My Audits" history record — the findings/summary are saved
// to Firestore so they outlive the upstream Python service's ephemeral
// temp-file storage; see ContractAudit/shared.tsx's saveContractAudit.
export interface SavedAudit extends AuditResult {
  docId: string;
  createdAt: string; // ISO string, converted from a Firestore Timestamp on read
}
