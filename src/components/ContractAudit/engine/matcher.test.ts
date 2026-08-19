import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { tokenSortRatio, matchLineItems } from './matcher';
import { USE_CASE_PROFILES } from './useCaseConfigs';
import type { ContractLineItem, InvoiceLineItem } from '../types';

const profile = USE_CASE_PROFILES.expense; // fuzzyThreshold 85.00

function contractItem(overrides: Partial<ContractLineItem> = {}): ContractLineItem {
  return {
    itemCode: '',
    description: '',
    category: '',
    quantity: new Decimal(1),
    billingPeriodStart: null,
    billingPeriodEnd: null,
    agreedRate: new Decimal(0),
    agreedAmount: new Decimal(100),
    capAmount: null,
    contractClause: null,
    rawSource: {},
    ...overrides,
  };
}

function invoiceItem(overrides: Partial<InvoiceLineItem> = {}): InvoiceLineItem {
  return {
    itemCode: '',
    description: '',
    category: '',
    quantity: new Decimal(1),
    billingPeriodStart: null,
    billingPeriodEnd: null,
    billedRate: new Decimal(0),
    billedAmount: new Decimal(100),
    invoiceRef: '',
    rawSource: {},
    ...overrides,
  };
}

describe('tokenSortRatio', () => {
  it('is 100 for identical strings', () => {
    expect(tokenSortRatio('Hotel Room', 'Hotel Room').toNumber()).toBe(100);
  });

  it('is 100 regardless of word order (token-sorted before comparing)', () => {
    expect(tokenSortRatio('Hotel Per Night', 'Per Night Hotel').toNumber()).toBe(100);
  });

  it('is 100 regardless of case and extra whitespace', () => {
    expect(tokenSortRatio('hotel   room', 'HOTEL ROOM').toNumber()).toBe(100);
  });

  it('is 0 when the two strings share no characters at all', () => {
    // tokenSortRatio is character-level (Ratcliff/Obershelp), not word-level
    // — ordinary English words almost always share some letters even when
    // semantically unrelated (e.g. "Hotel Room" vs "Airport Taxi" still
    // scores >0 on shared letters like R/O/T), so a true zero needs
    // disjoint alphabets, not just disjoint meaning (and no shared spaces —
    // tokenSort collapses each string to one space-joined token list, so a
    // multi-word input would still share that separator character).
    expect(tokenSortRatio('AAAABBBB', 'XXXXYYYY').toNumber()).toBe(0);
  });

  it('is high but under 100 for a near-miss (one differing token)', () => {
    const ratio = tokenSortRatio('Hotel Room Deluxe', 'Hotel Room Standard').toNumber();
    expect(ratio).toBeGreaterThan(50);
    expect(ratio).toBeLessThan(100);
  });
});

describe('matchLineItems', () => {
  it('prefers an exact item_code match over any fuzzy candidate', () => {
    const contract = [contractItem({ itemCode: 'A', description: 'Completely different text' })];
    const invoice = [invoiceItem({ itemCode: 'A', description: 'Nothing alike' })];
    const result = matchLineItems(contract, invoice, profile);
    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0].method).toBe('EXACT_KEY');
    expect(result.pairs[0].confidence.toFixed(2)).toBe('100.00');
  });

  it('falls back to fuzzy description matching when item codes differ, above the profile threshold', () => {
    const contract = [
      contractItem({ itemCode: 'C-001', description: 'Airport Taxi Ground Transport', billingPeriodStart: '2026-01-01', billingPeriodEnd: '2026-01-31' }),
    ];
    const invoice = [
      invoiceItem({ itemCode: 'I-999', description: 'Ground Transport Airport Taxi', billingPeriodStart: '2026-01-05', billingPeriodEnd: '2026-01-05' }),
    ];
    const result = matchLineItems(contract, invoice, profile);
    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0].method).toBe('FUZZY');
    expect(result.unmatchedContract).toHaveLength(0);
    expect(result.unmatchedInvoice).toHaveLength(0);
  });

  it('never fuzzy-matches across non-overlapping billing periods, even with an identical description', () => {
    const contract = [
      contractItem({ itemCode: 'C-001', description: 'Office Supplies', billingPeriodStart: '2026-01-01', billingPeriodEnd: '2026-01-31' }),
    ];
    const invoice = [
      invoiceItem({ itemCode: 'I-999', description: 'Office Supplies', billingPeriodStart: '2026-06-01', billingPeriodEnd: '2026-06-30' }),
    ];
    const result = matchLineItems(contract, invoice, profile);
    expect(result.pairs).toHaveLength(0);
    expect(result.unmatchedContract).toHaveLength(1);
    expect(result.unmatchedInvoice).toHaveLength(1);
  });

  it('leaves items with no viable counterpart in their respective unmatched lists', () => {
    const contract = [contractItem({ itemCode: 'ONLY-CONTRACT', description: 'Nothing matches this' })];
    const invoice = [invoiceItem({ itemCode: 'ONLY-INVOICE', description: 'Totally unrelated text' })];
    const result = matchLineItems(contract, invoice, profile);
    expect(result.pairs).toHaveLength(0);
    expect(result.unmatchedContract.map((c) => c.itemCode)).toEqual(['ONLY-CONTRACT']);
    expect(result.unmatchedInvoice.map((i) => i.itemCode)).toEqual(['ONLY-INVOICE']);
  });

  it('never assigns the same invoice line to two different contract lines', () => {
    const contract = [
      contractItem({ itemCode: 'DUP', description: 'Shared code A' }),
      contractItem({ itemCode: 'DUP', description: 'Shared code B' }),
    ];
    const invoice = [invoiceItem({ itemCode: 'DUP', description: 'Only one invoice line' })];
    const result = matchLineItems(contract, invoice, profile);
    expect(result.pairs).toHaveLength(1);
    expect(result.unmatchedContract).toHaveLength(1);
  });
});
