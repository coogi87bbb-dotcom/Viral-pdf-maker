// Tool 1/7 — "Commission Split & Net Sheet Calculator". Pure client-side,
// real-time calculation, no AI call. Ported field-for-field and formula-for-
// formula from thedealcloserai's index.html (see plan Section 2, Tool 1).
import React, { useMemo, useState } from 'react';
import { Crown } from 'lucide-react';
import { usePropertyMode, TextField, SelectField, FieldLabel } from './shared';

const COMMERCIAL_PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Multifamily', 'Mixed-Use', 'Land'];

function fmtCurrency(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtPercent(n: number): string {
  if (!Number.isFinite(n)) return '0%';
  return `${n.toFixed(2)}%`;
}

const StatBox: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</span>
    <div className={`text-xl font-black ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
  </div>
);

export const CommissionCalculator: React.FC = () => {
  const mode = usePropertyMode();

  const [salePrice, setSalePrice] = useState('485000');
  const [commRate, setCommRate] = useState('6');
  const [listSplit, setListSplit] = useState('50');
  const [buySplit, setBuySplit] = useState('50');
  const [agentSplit, setAgentSplit] = useState('80');
  const [fees, setFees] = useState('350');

  // Commercial-only fields
  const [commPropType, setCommPropType] = useState(COMMERCIAL_PROPERTY_TYPES[0]);
  const [noi, setNoi] = useState('145000');
  const [downPayment, setDownPayment] = useState('500000');
  const [debtService, setDebtService] = useState('90000');
  const [commSqft, setCommSqft] = useState('12000');

  const results = useMemo(() => {
    const price = parseFloat(salePrice) || 0;
    const rate = parseFloat(commRate) || 0;
    const list = parseFloat(listSplit) || 0;
    const brokerSplit = parseFloat(agentSplit) || 0;
    const feeAmount = parseFloat(fees) || 0;

    const grossComm = price * (rate / 100);
    const yourSideGross = grossComm * (list / 100);
    const afterBroker = yourSideGross * (brokerSplit / 100);
    const netTakeHome = afterBroker - feeAmount;

    const noiVal = parseFloat(noi) || 0;
    const downVal = parseFloat(downPayment) || 0;
    const debtVal = parseFloat(debtService) || 0;
    const sqftVal = parseFloat(commSqft) || 0;

    const capRate = price > 0 ? (noiVal / price) * 100 : 0;
    const cashOnCash = downVal > 0 ? ((noiVal - debtVal) / downVal) * 100 : 0;
    const pricePerSF = sqftVal > 0 ? price / sqftVal : 0;

    return { grossComm, yourSideGross, afterBroker, netTakeHome, capRate, cashOnCash, pricePerSF };
  }, [salePrice, commRate, listSplit, agentSplit, fees, noi, downPayment, debtService, commSqft]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display">Commission Split &amp; Net Sheet Calculator</h2>
          <p className="text-xs text-ink-muted">Real-time gross-to-net commission breakdown{mode === 'commercial' ? ', plus CRE return metrics' : ''}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-1 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Property Sale Price ($)" value={salePrice} onChange={setSalePrice} placeholder="e.g. 485000" type="number" />
            <TextField label="Total Commission Rate (%)" value={commRate} onChange={setCommRate} placeholder="e.g. 6" type="number" />
          </div>

          <div>
            <FieldLabel>Commission Split — Listing Side (%)</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                inputMode="decimal"
                value={listSplit}
                onChange={(e) => setListSplit(e.target.value)}
                placeholder="Listing agent %"
                className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
              />
              <input
                type="number"
                inputMode="decimal"
                value={buySplit}
                onChange={(e) => setBuySplit(e.target.value)}
                placeholder="Buyer agent %"
                className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Your Agent-to-Broker Split (you keep %)" value={agentSplit} onChange={setAgentSplit} placeholder="e.g. 80" type="number" />
            <TextField label="Transaction Fees & Other Costs ($)" value={fees} onChange={setFees} placeholder="e.g. 350" type="number" />
          </div>

          {mode === 'commercial' && (
            <div className="pt-4 border-t border-white/10 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-rosegold-400">Commercial-Only Inputs</span>
              <SelectField
                label="Property Type (Commercial)"
                value={commPropType}
                onChange={setCommPropType}
                options={COMMERCIAL_PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Net Operating Income — Annual ($)" value={noi} onChange={setNoi} placeholder="e.g. 145000" type="number" />
                <TextField label="Down Payment ($)" value={downPayment} onChange={setDownPayment} placeholder="e.g. 500000" type="number" />
                <TextField label="Annual Debt Service ($)" value={debtService} onChange={setDebtService} placeholder="e.g. 90000" type="number" />
                <TextField label="Building Square Footage" value={commSqft} onChange={setCommSqft} placeholder="e.g. 12000" type="number" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 content-start">
          <StatBox label="Gross Commission" value={fmtCurrency(results.grossComm)} />
          <StatBox label="Your Side Gross" value={fmtCurrency(results.yourSideGross)} />
          <StatBox label="After Broker Split" value={fmtCurrency(results.afterBroker)} />
          <StatBox label="Your Net Take-Home" value={fmtCurrency(results.netTakeHome)} accent />
          {mode === 'commercial' && (
            <>
              <StatBox label="Cap Rate" value={fmtPercent(results.capRate)} />
              <StatBox label="Cash-on-Cash Return" value={fmtPercent(results.cashOnCash)} />
              <StatBox label="Price / SF" value={fmtCurrency(results.pricePerSF)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionCalculator;
