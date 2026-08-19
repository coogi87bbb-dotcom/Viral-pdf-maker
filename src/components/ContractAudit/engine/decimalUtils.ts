// Decimal-precision helpers — the source repo's #1 hard rule (see its
// CLAUDE.md: "Financial calculations use only Decimal types; floats are
// forbidden"). decimal.js is this app's equivalent of Python's `decimal`
// module: arbitrary-precision, no binary-floating-point rounding error.
// Never use `Number` arithmetic on money in this engine — parse straight
// into Decimal at the ingestion boundary and stay there until formatting.
import Decimal from 'decimal.js';

// Ported from analyzer/variance.py's CENTS/_PCT_PLACES quantize targets:
// amounts round to 2 decimal places, percentages likewise, both
// ROUND_HALF_UP (decimal.js's default rounding mode is ROUND_HALF_UP,
// Decimal.ROUND_HALF_UP === 4, which matches without needing to override
// the library-wide config).
export function quantizeCents(value: Decimal): Decimal {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function quantizePercent(value: Decimal): Decimal {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

// Parses a currency-ish CSV cell ("$1,234.56", "1234.56", "(45.00)" for a
// negative) into a Decimal. Returns null (not zero) for blank/unparseable
// cells so callers can distinguish "no value supplied" from "zero" —
// collapsing that distinction was a real source-repo footgun class this
// deliberately avoids.
export function parseMoneyCell(raw: string | undefined | null): Decimal | null {
  if (raw === undefined || raw === null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const negative = /^\(.*\)$/.test(trimmed);
  const cleaned = trimmed.replace(/[()$,\s]/g, '');
  if (!cleaned || !/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = new Decimal(cleaned);
  return negative ? value.negated() : value;
}

export function parseQuantityCell(raw: string | undefined | null): Decimal {
  const parsed = parseMoneyCell(raw);
  return parsed ?? new Decimal(1);
}

export function formatCurrency(value: Decimal | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const num = value.toNumber();
  if (!Number.isFinite(num)) return '—';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatPercent(value: Decimal | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(2)}%`;
}
