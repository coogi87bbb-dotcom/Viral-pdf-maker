// Use-case profiles — ported 1:1 from the source repo's
// config/use_cases/expense.yaml and config/use_cases/saas.yaml (fetched
// and transcribed directly from that repo; not reinterpreted). Values
// here are business rules, not style choices — change them only if the
// source YAML changes, and note the source commit/date if you do.
//
// contractColumns / invoiceColumns map the SOURCE CSV header (as a human
// would label the column in a real contract/policy export) to the
// LineItemBase field it fills — see ingestion.ts's mapColumns().
import Decimal from 'decimal.js';
import type { ContractAuditUseCase, ToleranceProfile } from '../types';

export interface UseCaseProfile {
  useCase: ContractAuditUseCase;
  displayName: string;
  domainLabel: string;
  recipientRole: string;
  responseDeadlineDays: number;
  matchKeys: string[];
  fuzzyThreshold: Decimal; // 0.00–100.00, ported default from config/models.py
  tolerance: ToleranceProfile;
  contractColumns: Record<string, string>;
  invoiceColumns: Record<string, string>;
}

const DEFAULT_FUZZY_THRESHOLD = new Decimal('85.00');

// Source: config/use_cases/expense.yaml
const EXPENSE_PROFILE: UseCaseProfile = {
  useCase: 'expense',
  displayName: 'Expense Policy vs. Employee Receipts',
  domainLabel: 'policy expense limits',
  recipientRole: 'Employee / Expense Administrator',
  responseDeadlineDays: 14,
  matchKeys: ['itemCode'],
  fuzzyThreshold: DEFAULT_FUZZY_THRESHOLD,
  tolerance: {
    pctTolerance: new Decimal('0.00'),
    absTolerance: new Decimal('0.00'),
    reviewBandMultiplier: new Decimal('2'),
  },
  contractColumns: {
    'Policy Code': 'itemCode',
    'Expense Type': 'category',
    Description: 'description',
    'Per-Unit Limit': 'agreedRate',
    Units: 'quantity',
    'Policy Limit': 'agreedAmount',
    'Hard Cap': 'capAmount',
    'Period Start': 'billingPeriodStart',
    'Period End': 'billingPeriodEnd',
    'Policy Section': 'contractClause',
  },
  invoiceColumns: {
    'Policy Code': 'itemCode',
    'Expense Type': 'category',
    Description: 'description',
    'Unit Cost': 'billedRate',
    Units: 'quantity',
    'Receipt Amount': 'billedAmount',
    'Period Start': 'billingPeriodStart',
    'Period End': 'billingPeriodEnd',
    'Receipt ID': 'invoiceRef',
  },
};

// Source: config/use_cases/saas.yaml
const SAAS_PROFILE: UseCaseProfile = {
  useCase: 'saas',
  displayName: 'SaaS Contract vs. Vendor Invoice',
  domainLabel: 'contracted subscription and usage fees',
  recipientRole: 'Vendor Accounts Receivable',
  responseDeadlineDays: 30,
  matchKeys: ['itemCode'],
  fuzzyThreshold: DEFAULT_FUZZY_THRESHOLD,
  tolerance: {
    pctTolerance: new Decimal('0.00'),
    absTolerance: new Decimal('1.00'),
    reviewBandMultiplier: new Decimal('3'),
  },
  contractColumns: {
    SKU: 'itemCode',
    'Product Line': 'category',
    Description: 'description',
    'Unit Price': 'agreedRate',
    Seats: 'quantity',
    'Contract Amount': 'agreedAmount',
    'Spend Cap': 'capAmount',
    'Term Start': 'billingPeriodStart',
    'Term End': 'billingPeriodEnd',
    'Order Form Section': 'contractClause',
  },
  invoiceColumns: {
    SKU: 'itemCode',
    'Product Line': 'category',
    Description: 'description',
    'Unit Price': 'billedRate',
    Seats: 'quantity',
    'Billed Amount': 'billedAmount',
    'Term Start': 'billingPeriodStart',
    'Term End': 'billingPeriodEnd',
    'Invoice Number': 'invoiceRef',
  },
};

export const USE_CASE_PROFILES: Record<ContractAuditUseCase, UseCaseProfile> = {
  expense: EXPENSE_PROFILE,
  saas: SAAS_PROFILE,
};
