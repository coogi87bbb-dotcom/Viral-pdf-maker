// Top-level orchestrator — the client-side equivalent of the source
// repo's analyzer/engine.py: parse both files, match line items, run
// every matched pair through the variance calculator, flag unmatched
// invoice lines (billed for something with no contract counterpart) and
// duplicate billings, then roll everything up into one AuditResult.
import Decimal from 'decimal.js';
import type { AuditResult, ContractAuditUseCase, VarianceFinding } from '../types';
import { USE_CASE_PROFILES } from './useCaseConfigs';
import { buildContractLineItems, buildInvoiceLineItems, parseCsvFile } from './ingestion';
import { matchLineItems } from './matcher';
import { calculateFinding, classifySeverity, findDuplicateInvoiceItemCodes } from './varianceCalculator';
import { quantizeCents } from './decimalUtils';

let auditCounter = 0;
function nextAuditId(): string {
  auditCounter += 1;
  // No server minting an ID here (unlike the source repo's
  // YYYYMMDD_HHMMSS) — timestamp + an in-session counter is enough to
  // keep audits distinguishable within one browser session, which is all
  // this ID needs to do (Firestore's own doc ID is the real primary key
  // for "My Audits" history — see shared.tsx's saveContractAudit).
  return `audit-${Date.now()}-${auditCounter}`;
}

export async function runAudit(
  useCase: ContractAuditUseCase,
  contractFile: File,
  invoiceFile: File,
  jurisdiction: string
): Promise<AuditResult> {
  const [contractCsv, invoiceCsv] = await Promise.all([parseCsvFile(contractFile), parseCsvFile(invoiceFile)]);
  return buildAuditResult(
    useCase,
    contractCsv.rows,
    invoiceCsv.rows,
    [...contractCsv.errors, ...invoiceCsv.errors],
    jurisdiction
  );
}

// The pure, synchronous half of runAudit — everything after "rows are
// already parsed." Split out so it's testable without a File/FileReader
// (browser-only APIs Node doesn't provide) standing in the way: a test can
// hand this function CSV rows straight from Papa.parse's string-input mode
// and exercise the exact matching/classification/duplicate-handling logic
// runAudit runs, not a reimplementation of it. See auditEngine.test.ts.
export function buildAuditResult(
  useCase: ContractAuditUseCase,
  contractRows: Record<string, string>[],
  invoiceRows: Record<string, string>[],
  csvParseErrors: string[],
  jurisdiction: string
): AuditResult {
  const profile = USE_CASE_PROFILES[useCase];
  const parseErrors: string[] = [...csvParseErrors];

  const contractBuild = buildContractLineItems(contractRows, profile);
  const invoiceBuild = buildInvoiceLineItems(invoiceRows, profile);
  parseErrors.push(...contractBuild.errors, ...invoiceBuild.errors);

  const contractItems = contractBuild.items;
  const invoiceItems = invoiceBuild.items;

  const matchResult = matchLineItems(contractItems, invoiceItems, profile);

  const findings: VarianceFinding[] = matchResult.pairs.map((pair) => calculateFinding(pair, profile.tolerance));

  // Unmatched invoice lines: billed for something with no contract
  // counterpart at all. Treated as agreedAmount = 0, which the variance
  // calculator's classifySeverity already routes to DISPUTE for any
  // nonzero billed amount (see varianceCalculator.ts's comment on why).
  for (const invoice of matchResult.unmatchedInvoice) {
    const billedAmount = invoice.billedAmount;
    const capBreached = false;
    const severity = classifySeverity(billedAmount.abs(), null, capBreached, profile.tolerance);
    findings.push({
      id: `unmatched-${invoice.itemCode || invoice.invoiceRef}-${findings.length}`,
      itemCode: invoice.itemCode,
      description: invoice.description || '(no matching contract line item)',
      invoiceRef: invoice.invoiceRef,
      contractClause: null,
      agreedAmount: new Decimal(0),
      billedAmount,
      varianceAmount: quantizeCents(billedAmount),
      variancePct: null,
      capBreached,
      severity,
      explanation: `Billed ${billedAmount.toFixed(2)} with no matching contract line item — nothing was agreed for this charge.`,
    });
  }

  // Duplicate billing: same item_code billed more than once. Flagged
  // independent of each individual line's own variance — see
  // findDuplicateInvoiceItemCodes's comment. Every physical invoice line
  // already produced exactly one finding above (a matched-pair finding for
  // whichever line the matcher paired to the contract, an unmatched-invoice
  // finding for every other line with that code) — so a duplicated code
  // never needs a NEW finding, only an upgrade: force every finding that
  // already exists for that code to DISPUTE, regardless of its own
  // variance. Synthesizing a separate aggregate finding here (an earlier
  // version of this function did) double-counted the same dollars twice in
  // totalRecoverable below, since totalBilledForCode - agreedAmount is
  // always mathematically identical to summing the per-line findings it
  // was built from.
  const duplicateCodes = new Set(findDuplicateInvoiceItemCodes(invoiceItems.map((i) => i.itemCode)));
  for (const finding of findings) {
    if (!duplicateCodes.has(finding.itemCode)) continue;
    finding.severity = 'DISPUTE';
    finding.explanation += ` Item code "${finding.itemCode}" was billed more than once on this invoice — flagged as dispute-grade regardless of its own variance.`;
  }

  const totalAgreed = contractItems.reduce((sum, c) => sum.plus(c.agreedAmount), new Decimal(0));
  const totalBilled = invoiceItems.reduce((sum, i) => sum.plus(i.billedAmount), new Decimal(0));
  const totalRecoverable = findings
    .filter((f) => f.severity === 'REVIEW' || f.severity === 'DISPUTE')
    .reduce((sum, f) => sum.plus(Decimal.max(f.varianceAmount, 0)), new Decimal(0));

  return {
    auditId: nextAuditId(),
    useCase,
    jurisdiction,
    createdAt: new Date().toISOString(),
    findings,
    unmatchedContractItems: matchResult.unmatchedContract,
    unmatchedInvoiceItems: [], // already folded into `findings` above as DISPUTE-eligible entries
    totalAgreed: quantizeCents(totalAgreed),
    totalBilled: quantizeCents(totalBilled),
    totalRecoverable: quantizeCents(totalRecoverable),
    parseErrors,
  };
}
