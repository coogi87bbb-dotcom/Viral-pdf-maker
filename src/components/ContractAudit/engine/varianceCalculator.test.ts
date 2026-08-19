import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { classifySeverity, calculateFinding, findDuplicateInvoiceItemCodes } from './varianceCalculator';
import type { ContractLineItem, InvoiceLineItem, MatchedPair, ToleranceProfile } from '../types';

const EXPENSE_TOLERANCE: ToleranceProfile = {
  pctTolerance: new Decimal('0.00'),
  absTolerance: new Decimal('0.00'),
  reviewBandMultiplier: new Decimal('2'),
};

// Nonzero abs/pct tolerance, used to exercise the REVIEW band (the expense
// profile's own tolerance is 0.00/0.00, which collapses REVIEW to an
// unreachable zero-width band — see useCaseConfigs.ts).
const LENIENT_TOLERANCE: ToleranceProfile = {
  pctTolerance: new Decimal('5.00'),
  absTolerance: new Decimal('10.00'),
  reviewBandMultiplier: new Decimal('3'),
};

function contractItem(overrides: Partial<ContractLineItem> = {}): ContractLineItem {
  return {
    itemCode: 'X',
    description: 'Item X',
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
    itemCode: 'X',
    description: 'Item X',
    category: '',
    quantity: new Decimal(1),
    billingPeriodStart: null,
    billingPeriodEnd: null,
    billedRate: new Decimal(0),
    billedAmount: new Decimal(100),
    invoiceRef: 'INV-1',
    rawSource: {},
    ...overrides,
  };
}

function pair(contract: Partial<ContractLineItem>, invoice: Partial<InvoiceLineItem>): MatchedPair {
  return {
    contract: contractItem(contract),
    invoice: invoiceItem(invoice),
    method: 'EXACT_KEY',
    confidence: new Decimal('100.00'),
    matchedOn: 'item_code (exact)',
  };
}

describe('classifySeverity', () => {
  it('is WITHIN_TOLERANCE when nothing breaches either threshold', () => {
    expect(classifySeverity(new Decimal(5), new Decimal(2), false, LENIENT_TOLERANCE)).toBe('WITHIN_TOLERANCE');
  });

  it('stays WITHIN_TOLERANCE when only one of the two thresholds is breached (dual-threshold AND)', () => {
    // abs breached (15 > 10) but pct is not (2 <= 5)
    expect(classifySeverity(new Decimal(15), new Decimal(2), false, LENIENT_TOLERANCE)).toBe('WITHIN_TOLERANCE');
    // pct breached (8 > 5) but abs is not (5 <= 10)
    expect(classifySeverity(new Decimal(5), new Decimal(8), false, LENIENT_TOLERANCE)).toBe('WITHIN_TOLERANCE');
  });

  it('is REVIEW when both base thresholds are breached but not the review-band-multiplied ones', () => {
    // absLimit=10, pctLimit=5; dispute band = 30 / 15
    expect(classifySeverity(new Decimal(15), new Decimal(8), false, LENIENT_TOLERANCE)).toBe('REVIEW');
  });

  it('is DISPUTE when both review-band-multiplied thresholds are breached', () => {
    expect(classifySeverity(new Decimal(35), new Decimal(20), false, LENIENT_TOLERANCE)).toBe('DISPUTE');
  });

  it('is always DISPUTE on a cap breach, even with zero variance', () => {
    expect(classifySeverity(new Decimal(0), new Decimal(0), true, LENIENT_TOLERANCE)).toBe('DISPUTE');
  });

  it('treats a null pct (agreed=0) as an automatic pct-threshold breach', () => {
    // abs breached (15 > 10), pct is null (undefined ratio) -> treated as exceeding
    expect(classifySeverity(new Decimal(15), null, false, LENIENT_TOLERANCE)).toBe('REVIEW');
  });

  it('with zero tolerance (the expense profile), any nonzero variance is DISPUTE', () => {
    expect(classifySeverity(new Decimal('0.01'), new Decimal('0.01'), false, EXPENSE_TOLERANCE)).toBe('DISPUTE');
    expect(classifySeverity(new Decimal(0), new Decimal(0), false, EXPENSE_TOLERANCE)).toBe('WITHIN_TOLERANCE');
  });
});

describe('calculateFinding', () => {
  it('computes variance and pct, ROUND_HALF_UP to 2dp', () => {
    const finding = calculateFinding(
      pair({ agreedAmount: new Decimal('99.995') }, { billedAmount: new Decimal('100.00') }),
      LENIENT_TOLERANCE
    );
    expect(finding.varianceAmount.toFixed(2)).toBe('0.01');
    // 0.01 / 99.995 * 100 = 0.01000050... -> rounds to 0.01
    expect(finding.variancePct?.toFixed(2)).toBe('0.01');
  });

  it('produces a null variancePct when agreedAmount is zero, never a division error', () => {
    const finding = calculateFinding(pair({ agreedAmount: new Decimal(0) }, { billedAmount: new Decimal(50) }), LENIENT_TOLERANCE);
    expect(finding.variancePct).toBeNull();
    expect(finding.varianceAmount.toFixed(2)).toBe('50.00');
  });

  it('flags capBreached and forces DISPUTE when billed exceeds the contract cap', () => {
    const finding = calculateFinding(
      pair({ agreedAmount: new Decimal(100), capAmount: new Decimal(105) }, { billedAmount: new Decimal(110) }),
      LENIENT_TOLERANCE
    );
    expect(finding.capBreached).toBe(true);
    expect(finding.severity).toBe('DISPUTE');
    expect(finding.explanation).toContain('exceeds contract cap');
  });

  it('does not flag capBreached when billed is under the cap, even with a large variance', () => {
    const finding = calculateFinding(
      pair({ agreedAmount: new Decimal(100), capAmount: new Decimal(200) }, { billedAmount: new Decimal(150) }),
      LENIENT_TOLERANCE
    );
    expect(finding.capBreached).toBe(false);
  });

  it('falls back to the invoice description/itemCode when the contract side is blank', () => {
    const finding = calculateFinding(
      pair({ itemCode: '', description: '' }, { itemCode: 'INV-CODE', description: 'Invoice description' }),
      LENIENT_TOLERANCE
    );
    expect(finding.itemCode).toBe('INV-CODE');
    expect(finding.description).toBe('Invoice description');
  });
});

describe('findDuplicateInvoiceItemCodes', () => {
  it('returns only codes that appear more than once', () => {
    expect(findDuplicateInvoiceItemCodes(['A', 'B', 'A', 'C', 'B', 'A'])).toEqual(expect.arrayContaining(['A', 'B']));
    expect(findDuplicateInvoiceItemCodes(['A', 'B', 'A', 'C', 'B', 'A'])).toHaveLength(2);
  });

  it('ignores blank/falsy codes entirely', () => {
    expect(findDuplicateInvoiceItemCodes(['', '', '', 'A'])).toEqual([]);
  });

  it('returns an empty array when nothing repeats', () => {
    expect(findDuplicateInvoiceItemCodes(['A', 'B', 'C'])).toEqual([]);
  });
});
