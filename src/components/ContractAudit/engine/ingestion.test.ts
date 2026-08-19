import { describe, it, expect } from 'vitest';
import { buildContractLineItems, buildInvoiceLineItems } from './ingestion';
import { USE_CASE_PROFILES } from './useCaseConfigs';

const expenseProfile = USE_CASE_PROFILES.expense;
const saasProfile = USE_CASE_PROFILES.saas;

describe('buildContractLineItems', () => {
  it('maps a well-formed row through the use case profile\'s column map', () => {
    const { items, errors } = buildContractLineItems(
      [
        {
          'Policy Code': 'MEAL-01',
          'Expense Type': 'Meals',
          Description: 'Client dinner',
          'Per-Unit Limit': '75',
          Units: '1',
          'Policy Limit': '75.00',
          'Hard Cap': '150.00',
          'Period Start': '2026-01-01',
          'Period End': '2026-01-31',
          'Policy Section': 'Section 4.2',
        },
      ],
      expenseProfile
    );
    expect(errors).toEqual([]);
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.itemCode).toBe('MEAL-01');
    expect(item.agreedAmount.toFixed(2)).toBe('75.00');
    expect(item.capAmount?.toFixed(2)).toBe('150.00');
    expect(item.contractClause).toBe('Section 4.2');
    expect(item.billingPeriodStart).toBe('2026-01-01');
    expect(item.billingPeriodEnd).toBe('2026-01-31');
  });

  it('skips a row with no item code and records why', () => {
    const { items, errors } = buildContractLineItems(
      [{ 'Policy Code': '', 'Policy Limit': '75.00' }],
      expenseProfile
    );
    expect(items).toHaveLength(0);
    expect(errors[0]).toMatch(/missing item code/i);
  });

  it('skips a row with an unparseable agreed amount and records why', () => {
    const { items, errors } = buildContractLineItems(
      [{ 'Policy Code': 'MEAL-01', 'Policy Limit': 'N/A' }],
      expenseProfile
    );
    expect(items).toHaveLength(0);
    expect(errors[0]).toMatch(/unreadable agreed amount/i);
  });

  it('leaves capAmount null when the cap column is blank, not zero', () => {
    const { items } = buildContractLineItems(
      [{ 'Policy Code': 'MEAL-01', 'Policy Limit': '75.00', 'Hard Cap': '' }],
      expenseProfile
    );
    expect(items[0].capAmount).toBeNull();
  });

  it('leaves contractClause null (not an empty string) when the clause column is blank', () => {
    const { items } = buildContractLineItems(
      [{ 'Policy Code': 'MEAL-01', 'Policy Limit': '75.00', 'Policy Section': '' }],
      expenseProfile
    );
    expect(items[0].contractClause).toBeNull();
  });

  it('defaults quantity to 1 when the quantity column is missing/blank', () => {
    const { items } = buildContractLineItems([{ 'Policy Code': 'MEAL-01', 'Policy Limit': '75.00' }], expenseProfile);
    expect(items[0].quantity.toFixed(0)).toBe('1');
  });
});

describe('buildInvoiceLineItems', () => {
  it('maps a well-formed row through the SaaS profile\'s column map', () => {
    const { items, errors } = buildInvoiceLineItems(
      [
        {
          SKU: 'SEATS-PRO',
          'Product Line': 'Core',
          Description: 'Pro seats',
          'Unit Price': '25',
          Seats: '10',
          'Billed Amount': '260.00',
          'Term Start': '2026-01-01',
          'Term End': '2026-01-31',
          'Invoice Number': 'INV-9001',
        },
      ],
      saasProfile
    );
    expect(errors).toEqual([]);
    expect(items[0].billedAmount.toFixed(2)).toBe('260.00');
    expect(items[0].invoiceRef).toBe('INV-9001');
  });

  it('skips a row with no item code and records why', () => {
    const { items, errors } = buildInvoiceLineItems([{ SKU: '', 'Billed Amount': '260.00' }], saasProfile);
    expect(items).toHaveLength(0);
    expect(errors[0]).toMatch(/missing item code/i);
  });

  it('skips a row with an unparseable billed amount and records why', () => {
    const { items, errors } = buildInvoiceLineItems([{ SKU: 'SEATS-PRO', 'Billed Amount': 'TBD' }], saasProfile);
    expect(items).toHaveLength(0);
    expect(errors[0]).toMatch(/unreadable billed amount/i);
  });
});
