// CSV ingestion + column mapping — a deliberately narrowed port of the
// source repo's ingestion/ layer (csv_ingestor.py, excel_ingestor.py,
// pdf_ingestor.py, factory.py). v1 supports CSV only:
//
//   - Excel (.xlsx) parsing needs a real OOXML-parsing library. The two
//     realistic npm choices both carry unresolved advisories at the time
//     this was built — `xlsx` (SheetJS) has an unpatched-on-npm prototype-
//     pollution + ReDoS pair (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9),
//     `exceljs` transitively pulls a vulnerable `uuid`. Parsing untrusted
//     uploaded files through either felt like the wrong trade for a first
//     pass. CSV needs no such dependency (papaparse has none of the above)
//     and is what most contract/invoice/expense exports produce anyway.
//   - PDF ingestion (turning an unstructured PDF into line items) is a
//     genuinely hard layout-parsing problem the source repo solves with
//     pdfplumber + heuristics — out of scope for this port; contract/
//     invoice files must be CSV for now.
//
// Column mapping: each UseCaseProfile's contractColumns/invoiceColumns
// dict maps a SOURCE CSV header to a LineItemBase field name (ported
// straight from the YAML — see useCaseConfigs.ts). A row that's missing
// its item_code or can't produce a parseable agreed/billed amount is
// dropped and recorded in parseErrors rather than silently producing a
// broken line item.
import Papa from 'papaparse';
import Decimal from 'decimal.js';
import type { ContractLineItem, InvoiceLineItem } from '../types';
import type { UseCaseProfile } from './useCaseConfigs';
import { parseMoneyCell, parseQuantityCell } from './decimalUtils';

export function parseCsvFile(file: File): Promise<{ rows: Record<string, string>[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = results.errors.map((e) => `Row ${e.row ?? '?'}: ${e.message}`);
        resolve({ rows: results.data, errors });
      },
      error: (err) => reject(err),
    });
  });
}

// Best-effort normalization to an ISO (YYYY-MM-DD) date string so
// matcher.ts's periodsOverlap() can compare periods with plain string
// comparison regardless of the source file's date format. Falls back to
// the raw trimmed string (still usable for exact-string comparisons, just
// not guaranteed sortable) rather than dropping the value outright.
function normalizeDateCell(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return trimmed;
}

function invertColumnMap(columnMap: Record<string, string>): Record<string, string> {
  // columnMap is { sourceHeader: targetField } — invert to { targetField: sourceHeader }
  // for lookup-by-field convenience below.
  const inverted: Record<string, string> = {};
  for (const [header, field] of Object.entries(columnMap)) inverted[field] = header;
  return inverted;
}

export function buildContractLineItems(
  rows: Record<string, string>[],
  profile: UseCaseProfile
): { items: ContractLineItem[]; errors: string[] } {
  const byField = invertColumnMap(profile.contractColumns);
  const items: ContractLineItem[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const itemCode = (row[byField.itemCode] || '').trim();
    const agreedAmount = parseMoneyCell(row[byField.agreedAmount]);
    if (!itemCode) {
      errors.push(`Contract row ${index + 2}: missing item code — skipped.`);
      return;
    }
    if (agreedAmount === null) {
      errors.push(`Contract row ${index + 2} ("${itemCode}"): unreadable agreed amount — skipped.`);
      return;
    }

    items.push({
      itemCode,
      description: (row[byField.description] || '').trim(),
      category: (row[byField.category] || '').trim(),
      quantity: parseQuantityCell(row[byField.quantity]),
      billingPeriodStart: normalizeDateCell(row[byField.billingPeriodStart]),
      billingPeriodEnd: normalizeDateCell(row[byField.billingPeriodEnd]),
      agreedRate: parseMoneyCell(row[byField.agreedRate]) ?? new Decimal(0),
      agreedAmount,
      capAmount: byField.capAmount ? parseMoneyCell(row[byField.capAmount]) : null,
      contractClause: byField.contractClause ? (row[byField.contractClause] || '').trim() || null : null,
      rawSource: row,
    });
  });

  return { items, errors };
}

export function buildInvoiceLineItems(
  rows: Record<string, string>[],
  profile: UseCaseProfile
): { items: InvoiceLineItem[]; errors: string[] } {
  const byField = invertColumnMap(profile.invoiceColumns);
  const items: InvoiceLineItem[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const itemCode = (row[byField.itemCode] || '').trim();
    const billedAmount = parseMoneyCell(row[byField.billedAmount]);
    if (!itemCode) {
      errors.push(`Invoice row ${index + 2}: missing item code — skipped.`);
      return;
    }
    if (billedAmount === null) {
      errors.push(`Invoice row ${index + 2} ("${itemCode}"): unreadable billed amount — skipped.`);
      return;
    }

    items.push({
      itemCode,
      description: (row[byField.description] || '').trim(),
      category: (row[byField.category] || '').trim(),
      quantity: parseQuantityCell(row[byField.quantity]),
      billingPeriodStart: normalizeDateCell(row[byField.billingPeriodStart]),
      billingPeriodEnd: normalizeDateCell(row[byField.billingPeriodEnd]),
      billedRate: parseMoneyCell(row[byField.billedRate]) ?? new Decimal(0),
      billedAmount,
      invoiceRef: (row[byField.invoiceRef] || '').trim(),
      rawSource: row,
    });
  });

  return { items, errors };
}
