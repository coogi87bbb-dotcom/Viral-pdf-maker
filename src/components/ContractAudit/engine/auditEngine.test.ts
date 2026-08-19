import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { buildAuditResult } from './auditEngine';

// Regression coverage for a real bug: an earlier version of buildAuditResult
// synthesized a separate "duplicate billing" finding whose variance amount
// (totalBilledForCode - agreedAmount) was mathematically identical to the
// sum of the per-line findings it was built from, so totalRecoverable
// counted the same overcharge twice (in one repro, $495 instead of the
// real $290). The fix upgrades existing per-line findings to DISPUTE
// in place instead of adding a new finding — see auditEngine.ts's comment
// on the duplicate-handling block.
describe('buildAuditResult — expense use case', () => {
  const contractRows = [
    {
      'Policy Code': 'MEAL-01',
      'Expense Type': 'Meals',
      Description: 'Client dinner meal allowance',
      'Per-Unit Limit': '75',
      Units: '1',
      'Policy Limit': '75',
      'Hard Cap': '150',
      'Period Start': '2026-01-01',
      'Period End': '2026-01-31',
      'Policy Section': 'Section 4.2',
    },
    {
      'Policy Code': 'HOTEL-01',
      'Expense Type': 'Lodging',
      Description: 'Hotel per night',
      'Per-Unit Limit': '220',
      Units: '3',
      'Policy Limit': '660',
      'Hard Cap': '900',
      'Period Start': '2026-01-01',
      'Period End': '2026-01-31',
      'Policy Section': 'Section 4.5',
    },
    {
      'Policy Code': 'FLIGHT-01',
      'Expense Type': 'Travel',
      Description: 'Domestic flight',
      'Per-Unit Limit': '450',
      Units: '1',
      'Policy Limit': '450',
      'Hard Cap': '450',
      'Period Start': '2026-01-01',
      'Period End': '2026-01-31',
      'Policy Section': 'Section 4.1',
    },
  ];

  const invoiceRows = [
    {
      'Policy Code': 'MEAL-01',
      'Expense Type': 'Meals',
      Description: 'Client dinner meal allowance',
      'Unit Cost': '140',
      Units: '1',
      'Receipt Amount': '140',
      'Period Start': '2026-01-05',
      'Period End': '2026-01-05',
      'Receipt ID': 'R-1001',
    },
    {
      'Policy Code': 'HOTEL-01',
      'Expense Type': 'Lodging',
      Description: 'Hotel per night',
      'Unit Cost': '220',
      Units: '3',
      'Receipt Amount': '660',
      'Period Start': '2026-01-10',
      'Period End': '2026-01-13',
      'Receipt ID': 'R-1002',
    },
    {
      'Policy Code': 'TAXI-01',
      'Expense Type': 'Ground',
      Description: 'Airport taxi (not in policy)',
      'Unit Cost': '85',
      Units: '1',
      'Receipt Amount': '85',
      'Period Start': '2026-01-05',
      'Period End': '2026-01-05',
      'Receipt ID': 'R-1003',
    },
    {
      'Policy Code': 'MEAL-01',
      'Expense Type': 'Meals',
      Description: 'Client dinner meal allowance',
      'Unit Cost': '140',
      Units: '1',
      'Receipt Amount': '140',
      'Period Start': '2026-01-06',
      'Period End': '2026-01-06',
      'Receipt ID': 'R-1004',
    },
  ];

  it('produces the expected totals with no double-counted duplicate variance', () => {
    const result = buildAuditResult('expense', contractRows, invoiceRows, [], 'California, USA');

    expect(result.totalAgreed.toFixed(2)).toBe('1185.00'); // 75 + 660 + 450
    expect(result.totalBilled.toFixed(2)).toBe('1025.00'); // 140 + 660 + 85 + 140
    // TAXI-01 (85, unbudgeted) + MEAL-01's real overcharge (280 billed - 75
    // agreed = 205), counted exactly once even though MEAL-01 spans two
    // separate findings (one matched-pair, one unmatched-invoice).
    expect(result.totalRecoverable.toFixed(2)).toBe('290.00');
  });

  it('upgrades every finding sharing a duplicated item code to DISPUTE, without adding a synthetic extra finding', () => {
    const result = buildAuditResult('expense', contractRows, invoiceRows, [], '');
    const mealFindings = result.findings.filter((f) => f.itemCode === 'MEAL-01');

    // Exactly one finding per physical MEAL-01 invoice line (R-1001, R-1004) — not three.
    expect(mealFindings).toHaveLength(2);
    for (const f of mealFindings) {
      expect(f.severity).toBe('DISPUTE');
      expect(f.explanation).toMatch(/billed more than once/i);
    }
  });

  it('never double-counts: totalRecoverable always equals the independent sum of its own findings', () => {
    const result = buildAuditResult('expense', contractRows, invoiceRows, [], '');
    const independentSum = result.findings
      .filter((f) => f.severity === 'REVIEW' || f.severity === 'DISPUTE')
      .reduce((sum, f) => sum.plus(Decimal.max(f.varianceAmount, 0)), new Decimal(0));
    expect(result.totalRecoverable.toFixed(2)).toBe(independentSum.toFixed(2));
  });

  it('classifies an exact match with zero variance as WITHIN_TOLERANCE', () => {
    const result = buildAuditResult('expense', contractRows, invoiceRows, [], '');
    const hotel = result.findings.find((f) => f.itemCode === 'HOTEL-01' && f.invoiceRef === 'R-1002');
    expect(hotel?.severity).toBe('WITHIN_TOLERANCE');
  });

  it('lists a contract line with no invoice counterpart in unmatchedContractItems, not as a finding', () => {
    const result = buildAuditResult('expense', contractRows, invoiceRows, [], '');
    expect(result.unmatchedContractItems.map((c) => c.itemCode)).toEqual(['FLIGHT-01']);
    expect(result.findings.some((f) => f.itemCode === 'FLIGHT-01')).toBe(false);
  });

  it('carries CSV parse errors through untouched', () => {
    const result = buildAuditResult('expense', contractRows, invoiceRows, ['Row 3: bad column count'], '');
    expect(result.parseErrors).toContain('Row 3: bad column count');
  });

  it('stamps a fresh, distinguishable auditId on every call', () => {
    const a = buildAuditResult('expense', contractRows, invoiceRows, [], '');
    const b = buildAuditResult('expense', contractRows, invoiceRows, [], '');
    expect(a.auditId).not.toBe(b.auditId);
  });
});

describe('buildAuditResult — saas use case (cap breach)', () => {
  it('flags a cap breach as DISPUTE even when it would otherwise be within tolerance', () => {
    const contractRows = [
      {
        SKU: 'SEATS-PRO',
        'Product Line': 'Core',
        Description: 'Pro seats',
        'Unit Price': '25',
        Seats: '10',
        'Contract Amount': '250',
        'Spend Cap': '260',
        'Term Start': '2026-01-01',
        'Term End': '2026-01-31',
        'Order Form Section': 'Exhibit A',
      },
    ];
    const invoiceRows = [
      {
        SKU: 'SEATS-PRO',
        'Product Line': 'Core',
        Description: 'Pro seats',
        'Unit Price': '27',
        Seats: '10',
        'Billed Amount': '270',
        'Term Start': '2026-01-01',
        'Term End': '2026-01-31',
        'Invoice Number': 'INV-1',
      },
    ];

    const result = buildAuditResult('saas', contractRows, invoiceRows, [], '');
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].capBreached).toBe(true);
    expect(result.findings[0].severity).toBe('DISPUTE');
  });
});
