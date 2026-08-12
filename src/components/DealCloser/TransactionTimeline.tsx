// Tool 7/7 — "Transaction Deadline Tracker". Pure client-side calculation,
// no AI call. Ported field-for-field and offset-for-offset from
// thedealcloserai's index.html (see plan Section 2, Tool 7): milestone
// dates as percentage offsets of total contract-to-close days, color-coded
// by days-remaining urgency.
import React, { useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { usePropertyMode, TextField, SelectField, CheckboxField, FieldLabel } from './shared';

const RES_LOAN_TYPES = ['Conventional Loan', 'FHA Loan', 'VA Loan', 'Cash Purchase', 'Jumbo', 'Non-Conforming'];
const CRE_LOAN_TYPES = ['Conventional CRE Loan', 'SBA 504', 'SBA 7(a)', 'Bridge Loan', 'CMBS Loan', 'All Cash'];

const CASH_LOAN_TYPES = new Set(['Cash Purchase', 'All Cash']);

interface Milestone {
  icon: string;
  label: string;
  offsetPct: number; // 0-1, or special handling for "final walkthrough"/"closing"
  isFinal?: boolean;
  isWalkthrough?: boolean;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.round(days));
  return d;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const urgencyClass = (daysRemaining: number) => {
  if (daysRemaining <= 3) return { dot: 'bg-rose-500', text: 'text-rose-400', label: daysRemaining < 0 ? 'Passed' : `${daysRemaining}d left` };
  if (daysRemaining <= 7) return { dot: 'bg-accent-amber-400', text: 'text-accent-amber-300', label: `${daysRemaining}d left` };
  return { dot: 'bg-emerald-500', text: 'text-emerald-400', label: `${daysRemaining}d left` };
};

export const TransactionTimeline: React.FC = () => {
  const mode = usePropertyMode();
  const isCommercial = mode === 'commercial';

  const [contractDate, setContractDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [state, setState] = useState('');
  const [loanType, setLoanType] = useState(isCommercial ? CRE_LOAN_TYPES[0] : RES_LOAN_TYPES[0]);

  const [hoa, setHoa] = useState(false);
  const [septic, setSeptic] = useState(false);
  const [enviro, setEnviro] = useState(true);
  const [zoning, setZoning] = useState(false);
  const [estoppel, setEstoppel] = useState(true);

  const timeline = useMemo(() => {
    if (!contractDate || !closeDate) return null;
    const contract = new Date(contractDate);
    const closing = new Date(closeDate);
    const totalDays = Math.round((closing.getTime() - contract.getTime()) / 86400000);
    if (!Number.isFinite(totalDays) || totalDays <= 0) return null;

    const isCash = CASH_LOAN_TYPES.has(loanType);

    const milestones: Milestone[] = [{ icon: '📋', label: 'Contract / PSA Executed', offsetPct: 0 }];

    if (isCommercial) {
      if (enviro) milestones.push({ icon: '🌱', label: 'Phase I Environmental Review', offsetPct: 0.25 });
      milestones.push({ icon: '🔍', label: 'Due Diligence Period Ends', offsetPct: 0.35 });
      if (zoning) milestones.push({ icon: '🏛️', label: 'Zoning / Entitlement Approval', offsetPct: 0.5 });
      milestones.push({ icon: '📜', label: 'Title Search Complete', offsetPct: 0.42 });
      if (estoppel) milestones.push({ icon: '📑', label: 'Tenant Estoppel Certificates', offsetPct: 0.6 });
      if (!isCash) milestones.push({ icon: '🏦', label: 'Loan Commitment / Financing Approval', offsetPct: 0.82 });
    } else {
      if (septic) milestones.push({ icon: '🚰', label: 'Septic Inspection', offsetPct: 0.3 });
      milestones.push({ icon: '🔍', label: 'Due Diligence / Inspection Period Ends', offsetPct: 0.35 });
      if (hoa) milestones.push({ icon: '🏘️', label: 'HOA Approval', offsetPct: 0.2 });
      milestones.push({ icon: '📜', label: 'Title Search Complete', offsetPct: 0.45 });
      if (!isCash) milestones.push({ icon: '🏦', label: 'Loan Commitment / Financing Approval', offsetPct: 0.72 });
    }

    milestones.push({ icon: '🚶', label: 'Final Walkthrough', offsetPct: (totalDays - 1) / totalDays, isWalkthrough: true });
    milestones.push({ icon: '🔑', label: 'CLOSING', offsetPct: 1, isFinal: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = milestones
      .sort((a, b) => a.offsetPct - b.offsetPct)
      .map((m) => {
        const date = addDays(contract, totalDays * m.offsetPct);
        const daysRemaining = Math.round((date.getTime() - today.getTime()) / 86400000);
        return { ...m, date, daysRemaining };
      });

    return { totalDays, items };
  }, [contractDate, closeDate, loanType, isCommercial, hoa, septic, enviro, zoning, estoppel]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            Transaction Deadline Tracker
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NEW</span>
          </h2>
          <p className="text-xs text-ink-muted">Full contract-to-close milestone timeline, color-coded by urgency.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel>Contract Acceptance Date</FieldLabel>
            <input
              type="date"
              value={contractDate}
              onChange={(e) => setContractDate(e.target.value)}
              className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
            />
          </div>
          <div>
            <FieldLabel>Target Closing Date</FieldLabel>
            <input
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
            />
          </div>
          <TextField label="State (affects timelines)" value={state} onChange={setState} placeholder="e.g. GA" voice={false} />
        </div>

        <SelectField
          label={isCommercial ? 'Loan Type' : 'Loan Type'}
          value={loanType}
          onChange={setLoanType}
          options={(isCommercial ? CRE_LOAN_TYPES : RES_LOAN_TYPES).map((t) => ({ value: t, label: t }))}
        />

        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary mb-2">Special Conditions</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isCommercial ? (
              <>
                <CheckboxField label="Phase I Environmental Review" checked={enviro} onChange={setEnviro} />
                <CheckboxField label="Zoning / Entitlement Approval" checked={zoning} onChange={setZoning} />
                <CheckboxField label="Tenant Estoppel Certificates" checked={estoppel} onChange={setEstoppel} />
              </>
            ) : (
              <>
                <CheckboxField label="HOA Approval Required" checked={hoa} onChange={setHoa} />
                <CheckboxField label="Septic Inspection Needed" checked={septic} onChange={setSeptic} />
              </>
            )}
          </div>
        </div>
      </div>

      {timeline && (
        <div className="bg-surface-0 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <span className="text-xs font-bold text-white">{timeline.totalDays}-Day Timeline</span>
            <span className="text-[10px] text-ink-muted font-mono">{state ? state.toUpperCase() : 'No state specified'}</span>
          </div>
          {timeline.items.map((item, idx) => {
            const urgency = urgencyClass(item.daysRemaining);
            return (
              <div
                key={idx}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${
                  item.isFinal ? 'bg-accent-rosegold-500/10 border-accent-rosegold-500/30' : 'bg-surface-1 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${urgency.dot}`} />
                  <span className="text-xs text-ink-secondary truncate">
                    {item.icon} {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] font-mono text-ink-muted">{fmtDate(item.date)}</span>
                  <span className={`text-[10px] font-bold ${urgency.text}`}>{urgency.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionTimeline;
