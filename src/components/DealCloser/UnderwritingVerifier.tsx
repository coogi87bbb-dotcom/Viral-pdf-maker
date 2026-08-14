// Tool 8/8 — "Underwriting & Deal Verification". Ported from the standalone
// underwrittingdealoop CLI tool (run-loop.sh + verify-math.js + the PDF deck
// pipeline). See underwritingMath.ts and DealDeckDocument.tsx for the two
// pieces this orchestrates; see server.ts's /api/deal-closer/verify-underwriting
// for the research step.
//
// Three-stage flow: (1) enter property + valuation inputs for one of three
// underwriting approaches, computed live and entirely client-side; (2) run
// AI-assisted comp research (Google Search-grounded) to sanity-check those
// inputs, per CLAUDE.md rule #1's Verification Gap requirement — an
// unverified deal can never read as APPROVED, only HOLD; (3) generate an
// exportable, navy+gold "Institutional" deal deck PDF.
import React, { useMemo, useRef, useState } from 'react';
import { ClipboardCheck, Plus, Trash2, FileDown, ShieldCheck, ShieldAlert, ShieldQuestion, Loader2 } from 'lucide-react';
import {
  usePropertyMode,
  TextField,
  SelectField,
  FieldLabel,
  GenerateButton,
  ErrorBanner,
  SendToPdfButton,
  trackDealCloserUsage,
} from './shared';
import { apiPostJson } from '../../lib/apiClient';
import { exportPdfFromRef } from '../../utils/pdfExport';
import {
  computeResidential,
  computeCommercialIncome,
  computeCommercialReposition,
  REPAIR_RATE_PER_SQFT,
  DEFAULT_WHOLESALE_FEE,
  DEFAULT_COMMERCIAL_ACQUISITION_FEE,
  DEFAULT_INCOME_TARGET_BASIS_PCT,
  DEFAULT_REPOSITION_TARGET_BASIS_PCT,
  formatCurrency,
  formatPercent,
  STATUS_LABEL,
  type ResidentialRepairTier,
  type RepositionValuationMethod,
  type RepositionCostItem,
  type DealStatus,
} from './underwritingMath';
import { DealDeckDocument, dealDeckDataToDocument, type DealDeckData } from './DealDeckDocument';
import type { DocumentData } from '../../types';

type UnderwritingType = 'residential' | 'commercial-income' | 'commercial-reposition';

const TYPE_OPTIONS: { value: UnderwritingType; label: string }[] = [
  { value: 'residential', label: 'Residential (Fix & Flip / Wholesale)' },
  { value: 'commercial-income', label: 'Commercial — Income (Rentals, Multifamily 5+)' },
  { value: 'commercial-reposition', label: 'Commercial — Repositioning (Vacant/Distressed)' },
];

const REPAIR_TIER_OPTIONS: { value: ResidentialRepairTier; label: string }[] = [
  { value: 'light', label: `Light ($${REPAIR_RATE_PER_SQFT.light}/sqft)` },
  { value: 'medium', label: `Medium ($${REPAIR_RATE_PER_SQFT.medium}/sqft)` },
  { value: 'heavy', label: `Heavy ($${REPAIR_RATE_PER_SQFT.heavy}/sqft)` },
];

const VALUATION_METHOD_OPTIONS: { value: RepositionValuationMethod; label: string }[] = [
  { value: 'income', label: 'Income (Post-Reposition NOI ÷ Exit Cap Rate)' },
  { value: 'sqft', label: 'Price per Square Foot' },
  { value: 'perUnit', label: 'Price per Unit' },
];

const StatBox: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="p-4 rounded-2xl bg-surface-0 border border-hairline space-y-1">
    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</span>
    <div className={`text-xl font-black ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
  </div>
);

interface VerificationResult {
  confidence: 'verified' | 'partial' | 'unverified';
  notes: string;
  flags: string[];
}

const CONFIDENCE_STYLE: Record<VerificationResult['confidence'], { icon: React.ElementType; className: string; label: string }> = {
  verified: { icon: ShieldCheck, className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: 'Verified' },
  partial: { icon: ShieldQuestion, className: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: 'Partially Verified' },
  unverified: { icon: ShieldAlert, className: 'text-rose-400 bg-rose-500/10 border-rose-500/30', label: 'Unverified' },
};

interface UnderwritingVerifierProps {
  onSendDealDeckToPdfStudio: (doc: DocumentData) => void;
}

export const UnderwritingVerifier: React.FC<UnderwritingVerifierProps> = ({ onSendDealDeckToPdfStudio }) => {
  const mode = usePropertyMode();
  void mode; // read via context for consistency; this tool drives its own 3-way type below

  const [underwritingType, setUnderwritingType] = useState<UnderwritingType>('residential');
  const [address, setAddress] = useState('');

  // Residential inputs
  const [sqft, setSqft] = useState('1800');
  const [compPricePerSqFt, setCompPricePerSqFt] = useState('185');
  const [repairTier, setRepairTier] = useState<ResidentialRepairTier>('medium');
  const [wholesaleFee, setWholesaleFee] = useState(String(DEFAULT_WHOLESALE_FEE));
  const [resAskingPrice, setResAskingPrice] = useState('165000');

  // Commercial income inputs
  const [gpr, setGpr] = useState('180000');
  const [vacancyPct, setVacancyPct] = useState('5');
  const [opex, setOpex] = useState('54000');
  const [targetCapRate, setTargetCapRate] = useState('7');
  const [incomeTargetBasis, setIncomeTargetBasis] = useState(String(DEFAULT_INCOME_TARGET_BASIS_PCT * 100));
  const [capexReserve, setCapexReserve] = useState('20000');
  const [incomeAcqFee, setIncomeAcqFee] = useState(String(DEFAULT_COMMERCIAL_ACQUISITION_FEE));
  const [incomeAskingPrice, setIncomeAskingPrice] = useState('1500000');
  const [annualDebtService, setAnnualDebtService] = useState('');

  // Commercial reposition inputs
  const [valuationMethod, setValuationMethod] = useState<RepositionValuationMethod>('sqft');
  const [postRepositionNOI, setPostRepositionNOI] = useState('120000');
  const [exitCapRate, setExitCapRate] = useState('7');
  const [repoSqft, setRepoSqft] = useState('20000');
  const [exitCompPricePerSqFt, setExitCompPricePerSqFt] = useState('110');
  const [units, setUnits] = useState('24');
  const [exitCompPricePerUnit, setExitCompPricePerUnit] = useState('95000');
  const [repositionCosts, setRepositionCosts] = useState<RepositionCostItem[]>([{ label: 'Unit turns / renovation', amount: 0 }]);
  const [repoTargetBasis, setRepoTargetBasis] = useState(String(DEFAULT_REPOSITION_TARGET_BASIS_PCT * 100));
  const [repoAcqFee, setRepoAcqFee] = useState(String(DEFAULT_COMMERCIAL_ACQUISITION_FEE));
  const [repoAskingPrice, setRepoAskingPrice] = useState('900000');

  // Verification (AI research) state
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  // Deck export state
  const [showDeck, setShowDeck] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState('');
  const deckRef = useRef<HTMLDivElement>(null);

  const num = (v: string) => parseFloat(v) || 0;

  const residentialResult = useMemo(
    () =>
      computeResidential({
        sqft: num(sqft),
        avgCompPricePerSqFt: num(compPricePerSqFt),
        repairTier,
        wholesaleFee: num(wholesaleFee),
        askingPrice: num(resAskingPrice),
        compsVerified: verification?.confidence === 'verified',
      }),
    [sqft, compPricePerSqFt, repairTier, wholesaleFee, resAskingPrice, verification]
  );

  const incomeResult = useMemo(
    () =>
      computeCommercialIncome({
        grossPotentialRentAnnual: num(gpr),
        vacancyRatePct: num(vacancyPct) / 100,
        operatingExpensesAnnual: num(opex),
        targetCapRatePct: num(targetCapRate) / 100,
        targetBasisPct: num(incomeTargetBasis) / 100,
        immediateCapexReserve: num(capexReserve),
        acquisitionFee: num(incomeAcqFee),
        askingPrice: num(incomeAskingPrice),
        annualDebtService: annualDebtService.trim() ? num(annualDebtService) : undefined,
        compsVerified: verification?.confidence === 'verified',
      }),
    [gpr, vacancyPct, opex, targetCapRate, incomeTargetBasis, capexReserve, incomeAcqFee, incomeAskingPrice, annualDebtService, verification]
  );

  const repositionResult = useMemo(
    () =>
      computeCommercialReposition({
        valuationMethod,
        postRepositionNOI: num(postRepositionNOI),
        exitCapRatePct: num(exitCapRate) / 100,
        sqft: num(repoSqft),
        exitCompPricePerSqFt: num(exitCompPricePerSqFt),
        units: num(units),
        exitCompPricePerUnit: num(exitCompPricePerUnit),
        repositionCostBreakdown: repositionCosts,
        targetBasisPct: num(repoTargetBasis) / 100,
        acquisitionFee: num(repoAcqFee),
        askingPrice: num(repoAskingPrice),
        compsVerified: verification?.confidence === 'verified',
      }),
    [
      valuationMethod,
      postRepositionNOI,
      exitCapRate,
      repoSqft,
      exitCompPricePerSqFt,
      units,
      exitCompPricePerUnit,
      repositionCosts,
      repoTargetBasis,
      repoAcqFee,
      repoAskingPrice,
      verification,
    ]
  );

  const currentStatus: DealStatus =
    underwritingType === 'residential' ? residentialResult.status : underwritingType === 'commercial-income' ? incomeResult.status : repositionResult.status;

  const buildInputSummary = (): string => {
    if (underwritingType === 'residential') {
      return `Comp price/sqft: $${compPricePerSqFt}, Building sqft: ${sqft}, Repair tier: ${repairTier}, Asking price: $${resAskingPrice}`;
    }
    if (underwritingType === 'commercial-income') {
      return `Target cap rate: ${targetCapRate}%, Gross potential rent/yr: $${gpr}, Operating expenses/yr: $${opex}, Vacancy: ${vacancyPct}%, Asking price: $${incomeAskingPrice}`;
    }
    const methodLine =
      valuationMethod === 'income'
        ? `Post-reposition NOI: $${postRepositionNOI}, Exit cap rate: ${exitCapRate}%`
        : valuationMethod === 'sqft'
          ? `Sqft: ${repoSqft}, Exit comp price/sqft: $${exitCompPricePerSqFt}`
          : `Units: ${units}, Exit comp price/unit: $${exitCompPricePerUnit}`;
    return `Valuation method: ${valuationMethod}. ${methodLine}. Asking price: $${repoAskingPrice}`;
  };

  const handleVerify = async () => {
    if (!address.trim()) {
      setVerifyError('Enter the full property address (including city and state) first.');
      return;
    }
    setVerifying(true);
    setVerifyError('');
    try {
      const dealType = underwritingType === 'commercial-income' ? 'income' : underwritingType === 'commercial-reposition' ? 'reposition' : undefined;
      const propertyType = underwritingType === 'residential' ? 'residential' : 'commercial';
      const data = await apiPostJson<VerificationResult>('/api/deal-closer/verify-underwriting', {
        address,
        propertyType,
        dealType,
        inputSummary: buildInputSummary(),
      });
      setVerification(data);
      trackDealCloserUsage('underwriting', propertyType === 'commercial' ? 'commercial' : 'residential');
    } catch (err: any) {
      setVerifyError(err.message || 'Comp research failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const buildDeckData = (): DealDeckData => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const verificationGap = verification
      ? verification
      : { confidence: 'unverified' as const, notes: 'No AI comp research was run for this deal. All inputs are unverified per rule #1.', flags: ['Run "Verify Comps with AI Research" before relying on this deck.'] };

    if (underwritingType === 'residential') {
      const r = residentialResult;
      return {
        address,
        propertyTypeLabel: 'Residential',
        status: r.status,
        statusMeta: `Comps: ${verificationGap.confidence === 'verified' ? 'Verified' : 'Unverified'} · Repair tier: ${repairTier}`,
        verdictText: `${STATUS_LABEL[r.status]} — MAO of ${formatCurrency(r.mao)} vs. asking price of ${formatCurrency(num(resAskingPrice))} (spread ${formatCurrency(r.spread)}). Recommended exit: ${r.exitStrategy}.`,
        propertySnapshot: [
          { label: 'Address', value: address },
          { label: 'Building Size', value: `${Number(sqft).toLocaleString()} sqft` },
          { label: 'Repair Tier', value: `${repairTier[0].toUpperCase()}${repairTier.slice(1)}` },
          { label: 'Asking Price', value: formatCurrency(num(resAskingPrice)) },
        ],
        underwritingCalc: {
          headers: ['Metric', 'Formula', 'Value'],
          rows: [
            ['ARV', 'sqft × avg comp $/sqft', formatCurrency(r.arv)],
            ['Repairs', `sqft × $${REPAIR_RATE_PER_SQFT[repairTier]}/sqft (${repairTier})`, formatCurrency(r.repairs)],
            ['Wholesale Fee', 'default', formatCurrency(num(wholesaleFee))],
            ['MAO', 'ARV × 0.70 − Repairs − Wholesale Fee', formatCurrency(r.mao)],
          ],
        },
        exitStrategyText: `Total Investment ${formatCurrency(r.totalInvestment)}, Projected Profit ${formatCurrency(r.projectedProfit)}, ROI ${formatPercent(r.roi)}.`,
        exitStrategyTable: {
          headers: ['Strategy', 'Trigger', 'Recommended'],
          rows: [
            ['Fix & Flip', 'ROI > 15%', r.exitStrategy === 'Fix & Flip' ? 'Yes' : 'No'],
            ['Wholesale', 'Asking ≤ MAO', r.exitStrategy === 'Wholesale' ? 'Yes' : 'No'],
            ['Creative Finance', 'Otherwise', r.exitStrategy === 'Creative Finance' ? 'Yes' : 'No'],
          ],
        },
        compAssumptions: [
          { label: 'Avg Comp Price / Sqft', value: formatCurrency(num(compPricePerSqFt)) },
          { label: 'Repair Rate / Sqft', value: formatCurrency(REPAIR_RATE_PER_SQFT[repairTier]) },
        ],
        verificationGap,
        sourceDataNotes: verificationGap.notes,
        preparedDate: today,
      };
    }

    if (underwritingType === 'commercial-income') {
      const r = incomeResult;
      return {
        address,
        propertyTypeLabel: 'Commercial — Income',
        status: r.status,
        statusMeta: `Comps: ${verificationGap.confidence === 'verified' ? 'Verified' : 'Unverified'} · DSCR: ${r.dscr !== null ? r.dscr.toFixed(2) : 'N/A (all-cash)'}`,
        verdictText: `${STATUS_LABEL[r.status]} — MAO of ${formatCurrency(r.mao)} vs. asking price of ${formatCurrency(num(incomeAskingPrice))} (spread ${formatCurrency(r.spread)}). Recommended: ${r.recommendation}.`,
        propertySnapshot: [
          { label: 'Address', value: address },
          { label: 'Asking Price', value: formatCurrency(num(incomeAskingPrice)) },
          { label: 'Target Cap Rate', value: `${targetCapRate}%` },
          { label: 'Target Basis', value: `${incomeTargetBasis}%` },
        ],
        underwritingCalc: {
          headers: ['Metric', 'Formula', 'Value'],
          rows: [
            ['EGI', 'GPR × (1 − Vacancy%)', formatCurrency(r.egi)],
            ['NOI', 'EGI − OpEx', formatCurrency(r.noi)],
            ['Stabilized Value', 'NOI ÷ Target Cap Rate', formatCurrency(r.value)],
            ['MAO', 'Value × Target Basis − CapEx Reserve − Acquisition Fee', formatCurrency(r.mao)],
          ],
        },
        exitStrategyText: `Hold vs. Sell-at-Cap-Rate comparison (no repositioning cost to recover): ${r.recommendation}.${r.dscr !== null ? ` DSCR ${r.dscr.toFixed(2)}.` : ''}`,
        exitStrategyTable: {
          headers: ['Option', 'Basis', 'Recommended'],
          rows: [
            ['Hold', 'DSCR ≥ 1.25 and MAO spread ≥ 0', r.recommendation === 'Hold' ? 'Yes' : 'No'],
            ['Sell at Cap Rate', 'Otherwise', r.recommendation === 'Sell at Cap Rate' ? 'Yes' : 'No'],
          ],
        },
        compAssumptions: [
          { label: 'Gross Potential Rent / Yr', value: formatCurrency(num(gpr)) },
          { label: 'Vacancy Rate', value: `${vacancyPct}%` },
          { label: 'Operating Expenses / Yr', value: formatCurrency(num(opex)) },
        ],
        verificationGap,
        sourceDataNotes: verificationGap.notes,
        preparedDate: today,
      };
    }

    const r = repositionResult;
    return {
      address,
      propertyTypeLabel: 'Commercial — Repositioning',
      status: r.status,
      statusMeta: `Comps: ${verificationGap.confidence === 'verified' ? 'Verified' : 'Unverified'} · Valuation method: ${valuationMethod}`,
      verdictText: `${STATUS_LABEL[r.status]} — MAO of ${formatCurrency(r.mao)} vs. asking price of ${formatCurrency(num(repoAskingPrice))} (spread ${formatCurrency(r.spread)}). Recommended exit: ${r.exitStrategy}.`,
      propertySnapshot: [
        { label: 'Address', value: address },
        { label: 'Asking Price', value: formatCurrency(num(repoAskingPrice)) },
        { label: 'Valuation Method', value: valuationMethod },
        { label: 'Target Basis', value: `${repoTargetBasis}%` },
      ],
      underwritingCalc: {
        headers: ['Metric', 'Formula', 'Value'],
        rows: [
          ['Exit Value', valuationMethod === 'income' ? 'Post-Reposition NOI ÷ Exit Cap Rate' : valuationMethod === 'sqft' ? 'Sqft × Exit Comp $/Sqft' : 'Units × Exit Comp $/Unit', formatCurrency(r.exitValue)],
          ['Reposition Costs', 'Sum of itemized breakdown', formatCurrency(r.repositionCosts)],
          ['MAO', 'Exit Value × Target Basis − Reposition Costs − Acquisition Fee', formatCurrency(r.mao)],
        ],
      },
      exitStrategyText: `Total Investment ${formatCurrency(r.totalInvestment)}, Projected Profit ${formatCurrency(r.projectedProfit)}, ROI ${formatPercent(r.roi)}.`,
      exitStrategyTable: {
        headers: ['Strategy', 'Trigger', 'Recommended'],
        rows: [
          ['Reposition & Sell', 'ROI > 20%', r.exitStrategy === 'Reposition & Sell' ? 'Yes' : 'No'],
          ['Reposition & Hold-to-Stabilize', 'Underwriting clears', r.exitStrategy === 'Reposition & Hold-to-Stabilize' ? 'Yes' : 'No'],
          ['Wholesale / Assignment', 'Asking ≤ MAO', r.exitStrategy === 'Wholesale / Assignment' ? 'Yes' : 'No'],
          ['Creative Finance / Pass', 'Otherwise', r.exitStrategy === 'Creative Finance / Pass' ? 'Yes' : 'No'],
        ],
      },
      compAssumptions: repositionCosts.map((c) => ({ label: c.label || 'Untitled item', value: formatCurrency(c.amount) })),
      verificationGap,
      sourceDataNotes: verificationGap.notes,
      preparedDate: today,
    };
  };

  const handleGenerateDeck = () => {
    if (!address.trim()) {
      setExportError('Enter the property address before generating a deck.');
      return;
    }
    setExportError('');
    setShowDeck(true);
  };

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    setExportError('');
    try {
      await exportPdfFromRef(deckRef, `deal-deck-${address}`);
    } catch (err: any) {
      setExportError(err.message || 'PDF export failed. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  const addRepositionCost = () => setRepositionCosts((prev) => [...prev, { label: '', amount: 0 }]);
  const removeRepositionCost = (i: number) => setRepositionCosts((prev) => prev.filter((_, idx) => idx !== i));
  const updateRepositionCost = (i: number, field: 'label' | 'amount', value: string) =>
    setRepositionCosts((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: field === 'amount' ? num(value) : value } : item)));

  const ConfidenceIcon = verification ? CONFIDENCE_STYLE[verification.confidence].icon : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display">Underwriting &amp; Deal Verification</h2>
          <p className="text-xs text-ink-muted">MAO/ROI math, AI-assisted comp research, and an exportable investor deal deck.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-hairline rounded-2xl p-5 space-y-4">
        <SelectField
          label="Underwriting Approach"
          value={underwritingType}
          onChange={(v) => setUnderwritingType(v as UnderwritingType)}
          options={TYPE_OPTIONS}
        />
        <TextField label="Property Address" value={address} onChange={setAddress} placeholder="e.g. 412 Hampton Blvd, Norfolk VA" voice={false} />

        {underwritingType === 'residential' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Building Square Footage" value={sqft} onChange={setSqft} type="number" />
            <TextField label="Avg. Comp Price / Sqft ($)" value={compPricePerSqFt} onChange={setCompPricePerSqFt} type="number" />
            <SelectField label="Repair Tier" value={repairTier} onChange={(v) => setRepairTier(v as ResidentialRepairTier)} options={REPAIR_TIER_OPTIONS} />
            <TextField label="Wholesale Fee ($)" value={wholesaleFee} onChange={setWholesaleFee} type="number" hint="default $15,000" />
            <TextField label="Asking Price ($)" value={resAskingPrice} onChange={setResAskingPrice} type="number" />
          </div>
        )}

        {underwritingType === 'commercial-income' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Gross Potential Rent / Yr ($)" value={gpr} onChange={setGpr} type="number" />
            <TextField label="Vacancy Rate (%)" value={vacancyPct} onChange={setVacancyPct} type="number" />
            <TextField label="Operating Expenses / Yr ($)" value={opex} onChange={setOpex} type="number" />
            <TextField label="Target Cap Rate (%)" value={targetCapRate} onChange={setTargetCapRate} type="number" hint="from verified comps" />
            <TextField label="Target Basis (%)" value={incomeTargetBasis} onChange={setIncomeTargetBasis} type="number" hint="default 90%" />
            <TextField label="Immediate CapEx Reserve ($)" value={capexReserve} onChange={setCapexReserve} type="number" />
            <TextField label="Acquisition Fee ($)" value={incomeAcqFee} onChange={setIncomeAcqFee} type="number" hint="default $25,000" />
            <TextField label="Asking Price ($)" value={incomeAskingPrice} onChange={setIncomeAskingPrice} type="number" />
            <TextField label="Annual Debt Service ($)" value={annualDebtService} onChange={setAnnualDebtService} type="number" hint="optional — for DSCR" />
          </div>
        )}

        {underwritingType === 'commercial-reposition' && (
          <div className="space-y-4">
            <SelectField label="Exit Valuation Method" value={valuationMethod} onChange={(v) => setValuationMethod(v as RepositionValuationMethod)} options={VALUATION_METHOD_OPTIONS} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {valuationMethod === 'income' && (
                <>
                  <TextField label="Post-Reposition NOI ($)" value={postRepositionNOI} onChange={setPostRepositionNOI} type="number" />
                  <TextField label="Exit Cap Rate (%)" value={exitCapRate} onChange={setExitCapRate} type="number" />
                </>
              )}
              {valuationMethod === 'sqft' && (
                <>
                  <TextField label="Square Footage" value={repoSqft} onChange={setRepoSqft} type="number" />
                  <TextField label="Exit Comp Price / Sqft ($)" value={exitCompPricePerSqFt} onChange={setExitCompPricePerSqFt} type="number" />
                </>
              )}
              {valuationMethod === 'perUnit' && (
                <>
                  <TextField label="Unit Count" value={units} onChange={setUnits} type="number" />
                  <TextField label="Exit Comp Price / Unit ($)" value={exitCompPricePerUnit} onChange={setExitCompPricePerUnit} type="number" />
                </>
              )}
              <TextField label="Target Basis (%)" value={repoTargetBasis} onChange={setRepoTargetBasis} type="number" hint="default 75%" />
              <TextField label="Acquisition Fee ($)" value={repoAcqFee} onChange={setRepoAcqFee} type="number" hint="default $25,000" />
              <TextField label="Asking Price ($)" value={repoAskingPrice} onChange={setRepoAskingPrice} type="number" />
            </div>

            <div>
              <FieldLabel>Reposition Cost Breakdown — itemized, never a flat number</FieldLabel>
              <div className="space-y-2">
                {repositionCosts.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={item.label}
                      onChange={(e) => updateRepositionCost(i, 'label', e.target.value)}
                      placeholder="e.g. Roof replacement"
                      className="flex-1 bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary placeholder:text-ink-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={item.amount || ''}
                      onChange={(e) => updateRepositionCost(i, 'amount', e.target.value)}
                      placeholder="Amount ($)"
                      className="w-40 bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary placeholder:text-ink-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeRepositionCost(i)}
                      disabled={repositionCosts.length <= 1}
                      className="p-2.5 rounded-xl bg-surface-0 border border-hairline text-ink-muted hover:text-rose-400 hover:border-rose-500/30 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRepositionCost}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-0 border border-hairline text-xs font-bold text-accent-rosegold-300 hover:border-accent-rosegold-400/40 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Cost Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live-computed figures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {underwritingType === 'residential' && (
          <>
            <StatBox label="ARV" value={formatCurrency(residentialResult.arv)} />
            <StatBox label="Repairs" value={formatCurrency(residentialResult.repairs)} />
            <StatBox label="MAO" value={formatCurrency(residentialResult.mao)} accent />
            <StatBox label="Spread vs. Asking" value={formatCurrency(residentialResult.spread)} />
          </>
        )}
        {underwritingType === 'commercial-income' && (
          <>
            <StatBox label="NOI" value={formatCurrency(incomeResult.noi)} />
            <StatBox label="Stabilized Value" value={formatCurrency(incomeResult.value)} />
            <StatBox label="MAO" value={formatCurrency(incomeResult.mao)} accent />
            <StatBox label="Spread vs. Asking" value={formatCurrency(incomeResult.spread)} />
          </>
        )}
        {underwritingType === 'commercial-reposition' && (
          <>
            <StatBox label="Exit Value" value={formatCurrency(repositionResult.exitValue)} />
            <StatBox label="Reposition Costs" value={formatCurrency(repositionResult.repositionCosts)} />
            <StatBox label="MAO" value={formatCurrency(repositionResult.mao)} accent />
            <StatBox label="Spread vs. Asking" value={formatCurrency(repositionResult.spread)} />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <GenerateButton onClick={handleVerify} loading={verifying} label="🔎 Verify Comps with AI Research" />
        {verification && ConfidenceIcon && (
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${CONFIDENCE_STYLE[verification.confidence].className}`}>
            <ConfidenceIcon className="h-4 w-4" />
            <span>{CONFIDENCE_STYLE[verification.confidence].label}</span>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-hairline bg-surface-0 text-xs font-bold text-ink-secondary">
          <span>Current status:</span>
          <span
            className={
              currentStatus === 'APPROVED'
                ? 'text-emerald-400'
                : currentStatus === 'REJECTED'
                  ? 'text-rose-400'
                  : 'text-amber-400'
            }
          >
            {STATUS_LABEL[currentStatus]}
          </span>
        </div>
      </div>
      {verifyError && <ErrorBanner message={verifyError} />}
      {verification && (
        <div className="bg-surface-0 border border-hairline rounded-2xl p-4 space-y-2">
          <p className="text-xs text-ink-secondary leading-relaxed">{verification.notes}</p>
          {verification.flags.length > 0 && (
            <ul className="space-y-1">
              {verification.flags.map((f, i) => (
                <li key={i} className="text-xs text-amber-300 flex items-start gap-1.5">
                  <span>•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateDeck}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-rosegold-400 hover:brightness-105 text-slate-950 text-xs font-bold shadow-[var(--shadow-glow-rosegold)] transition-[transform,opacity,filter] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
        >
          <FileDown className="h-4 w-4" />
          Generate Deal Deck
        </button>
        {showDeck && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2 border border-hairline hover:border-accent-rosegold-400/40 text-white text-xs font-bold transition-colors active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
          >
            {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {exportingPdf ? 'Exporting…' : 'Download PDF'}
          </button>
        )}
        {showDeck && (
          <SendToPdfButton
            label="Send Deck to PDF Studio"
            onClick={() => onSendDealDeckToPdfStudio(dealDeckDataToDocument(buildDeckData()))}
          />
        )}
      </div>
      {exportError && <ErrorBanner message={exportError} />}

      {showDeck && (
        <div className="rounded-2xl overflow-auto border border-hairline bg-surface-0/50 p-4">
          <div ref={deckRef}>
            <DealDeckDocument deal={buildDeckData()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderwritingVerifier;
