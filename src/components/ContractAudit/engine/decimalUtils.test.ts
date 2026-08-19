import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { quantizeCents, quantizePercent, parseMoneyCell, parseQuantityCell, formatCurrency, formatPercent } from './decimalUtils';

describe('quantizeCents / quantizePercent', () => {
  it('rounds ROUND_HALF_UP at 2 decimal places', () => {
    expect(quantizeCents(new Decimal('1.005')).toFixed(2)).toBe('1.01');
    expect(quantizeCents(new Decimal('1.004')).toFixed(2)).toBe('1.00');
    expect(quantizeCents(new Decimal('-1.005')).toFixed(2)).toBe('-1.01');
    expect(quantizePercent(new Decimal('12.345')).toFixed(2)).toBe('12.35');
  });
});

describe('parseMoneyCell', () => {
  it('parses plain numbers', () => {
    expect(parseMoneyCell('1234.56')?.toFixed(2)).toBe('1234.56');
  });

  it('strips currency symbols, thousands separators, and whitespace', () => {
    expect(parseMoneyCell('$1,234.56')?.toFixed(2)).toBe('1234.56');
    expect(parseMoneyCell('  $ 99.00 ')?.toFixed(2)).toBe('99.00');
  });

  it('treats parenthesized amounts as negative (accounting convention)', () => {
    expect(parseMoneyCell('(45.00)')?.toFixed(2)).toBe('-45.00');
    expect(parseMoneyCell('($1,200.50)')?.toFixed(2)).toBe('-1200.50');
  });

  it('returns null (not zero) for blank or unparseable cells', () => {
    expect(parseMoneyCell('')).toBeNull();
    expect(parseMoneyCell('   ')).toBeNull();
    expect(parseMoneyCell(undefined)).toBeNull();
    expect(parseMoneyCell(null)).toBeNull();
    expect(parseMoneyCell('N/A')).toBeNull();
    expect(parseMoneyCell('twelve dollars')).toBeNull();
  });

  it('never collapses "no value" and "zero" into the same result', () => {
    expect(parseMoneyCell('0')?.toFixed(2)).toBe('0.00');
    expect(parseMoneyCell('')).toBeNull();
  });
});

describe('parseQuantityCell', () => {
  it('parses a numeric quantity', () => {
    expect(parseQuantityCell('5')?.toFixed(0)).toBe('5');
  });

  it('defaults to 1 (not 0 or null) when unparseable', () => {
    expect(parseQuantityCell('')?.toFixed(0)).toBe('1');
    expect(parseQuantityCell(undefined)?.toFixed(0)).toBe('1');
  });
});

describe('formatCurrency / formatPercent', () => {
  it('formats a Decimal as USD currency', () => {
    expect(formatCurrency(new Decimal('1234.5'))).toBe('$1,234.50');
    expect(formatCurrency(new Decimal('-45'))).toBe('-$45.00');
  });

  it('renders an em dash for null/undefined rather than $0.00 or NaN', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
  });

  it('formats a Decimal as a percent string', () => {
    expect(formatPercent(new Decimal('12.5'))).toBe('12.50%');
    expect(formatPercent(null)).toBe('—');
  });
});
