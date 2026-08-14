// Tool 3/7 — "Offer & Counter-Offer Generator". Ported field-for-field from
// thedealcloserai's index.html (see plan Section 2, Tool 3).
import React, { useMemo, useState } from 'react';
import { Handshake } from 'lucide-react';
import {
  usePropertyMode,
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  GenerateButton,
  ErrorBanner,
  ResultSection,
  SendToPdfButton,
  callDealCloserAI,
  extractSection,
  trackDealCloserUsage,
} from './shared';

const MOTIVATION_OPTIONS = ['Unknown — Not sure', 'Low', 'Medium', 'High', 'Distressed'];
const DEAL_TYPE_OPTIONS = ['Purchase', 'Lease'];

interface NegotiationScriptGeneratorProps {
  onSendToPdf: (text: string, title: string) => void;
}

export const NegotiationScriptGenerator: React.FC<NegotiationScriptGeneratorProps> = ({ onSendToPdf }) => {
  const mode = usePropertyMode();
  const isCommercial = mode === 'commercial';

  const [side, setSide] = useState<'The Buyer' | 'The Seller'>('The Buyer');
  const [ask, setAsk] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [address, setAddress] = useState('');
  const [dom, setDom] = useState('');
  const [motivation, setMotivation] = useState(MOTIVATION_OPTIONS[0]);
  const [closingTimeline, setClosingTimeline] = useState('');
  const [terms, setTerms] = useState('');

  // Commercial-only
  const [dealType, setDealType] = useState(DEAL_TYPE_OPTIONS[0]);
  const [baseRent, setBaseRent] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('');
  const [cam, setCam] = useState('');
  const [ti, setTi] = useState('');

  // Contingencies
  const [contInspect, setContInspect] = useState(true);
  const [contFinance, setContFinance] = useState(true);
  const [contAppraisal, setContAppraisal] = useState(true);
  const [contDueDiligence, setContDueDiligence] = useState(true);
  const [contFinanceCRE, setContFinanceCRE] = useState(true);
  const [contEnviro, setContEnviro] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const { diffPct, diffDir } = useMemo(() => {
    const a = parseFloat(ask) || 0;
    const o = parseFloat(offerPrice) || 0;
    if (!a) return { diffPct: 0, diffDir: 'at asking' };
    const pct = Math.abs(((a - o) / a) * 100);
    const dir = o < a ? 'below asking' : o > a ? 'above asking' : 'at asking';
    return { diffPct: Math.round(pct * 10) / 10, diffDir: dir };
  }, [ask, offerPrice]);

  const handleGenerate = async () => {
    if (!ask.trim() || !offerPrice.trim() || !address.trim()) {
      setError('Please fill in asking price, offer price, and property address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const contingencies = isCommercial
        ? [contDueDiligence && 'Due Diligence', contFinanceCRE && 'Financing', contEnviro && 'Environmental / Zoning'].filter(Boolean).join(', ')
        : [contInspect && 'Inspection', contFinance && 'Financing', contAppraisal && 'Appraisal'].filter(Boolean).join(', ');

      const leaseDetails = isCommercial && dealType === 'Lease'
        ? `\nDeal Type: Lease\nBase Rent: ${baseRent}\nLease Term: ${leaseTerm} years\nCAM Charges: ${cam}\nTI Allowance: ${ti}`
        : '';

      const systemPrompt = isCommercial
        ? 'You are an elite commercial real estate negotiation strategist advising an agent representing a client in a purchase or lease negotiation.'
        : 'You are an elite residential real estate negotiation strategist advising an agent representing a client.';

      const userPrompt = `Representing: ${side}
Asking / List Price: ${ask}
Offer / Counter Price: ${offerPrice} (${diffPct}% ${diffDir})
Property: ${address}
Days on Market: ${dom}
Seller Motivation: ${motivation}
Closing Timeline: ${closingTimeline}
Special Terms / Concessions: ${terms}
Contingencies: ${contingencies}${leaseDetails}

Generate a negotiation package with EXACTLY these 4 labeled sections:

[NEGOTIATION STRATEGY]: 150-word expert negotiation playbook for this specific situation.
[OFFER LANGUAGE]: Professional, ready-to-use offer/counter-offer contract language.
[OBJECTION RESPONSES]: 3 likely objections from the other side, each with a scripted response.
[WALK-AWAY ANALYSIS]: Specific walk-away numbers and the reasoning behind them.`;

      const text = await callDealCloserAI(systemPrompt, userPrompt);
      setResult(text);
      trackDealCloserUsage('negotiation', mode);
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating your negotiation package.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <Handshake className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            Offer &amp; Counter-Offer Generator
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NEW</span>
          </h2>
          <p className="text-xs text-ink-muted">Negotiation strategy, offer language, objection responses &amp; walk-away numbers.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="You Are Representing"
            value={side}
            onChange={(v) => setSide(v as 'The Buyer' | 'The Seller')}
            options={[{ value: 'The Buyer', label: 'The Buyer' }, { value: 'The Seller', label: 'The Seller' }]}
          />
          <SelectField label="Seller Motivation Level" value={motivation} onChange={setMotivation} options={MOTIVATION_OPTIONS.map((m) => ({ value: m, label: m }))} />
          <TextField label="Asking / List Price ($)" value={ask} onChange={setAsk} placeholder="e.g. 499000" type="number" />
          <TextField label="Offer / Counter Price ($)" value={offerPrice} onChange={setOfferPrice} placeholder="e.g. 472000" type="number" />
          <TextField label="Days on Market" value={dom} onChange={setDom} placeholder="e.g. 47" type="number" />
          <TextField label="Closing Timeline" value={closingTimeline} onChange={setClosingTimeline} placeholder="e.g. 30 days, flexible" />
        </div>

        <TextField
          label="Property Address / Description"
          value={address}
          onChange={setAddress}
          placeholder={isCommercial ? 'e.g. 4500 Commerce Pkwy — 45,000 SF industrial...' : 'e.g. 142 Maple St — 3BR/2BA...'}
        />
        <TextAreaField
          label="Special Terms or Concessions"
          value={terms}
          onChange={setTerms}
          rows={2}
          placeholder={isCommercial ? 'e.g. seller credit for TI, extended due diligence...' : 'e.g. seller pays closing costs...'}
        />

        {isCommercial && (
          <div className="pt-4 border-t border-white/10 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-rosegold-400">Commercial-Only Inputs</span>
            <SelectField label="Deal Type" value={dealType} onChange={setDealType} options={DEAL_TYPE_OPTIONS.map((d) => ({ value: d, label: d }))} />
            {dealType === 'Lease' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Base Rent ($/SF/Yr)" value={baseRent} onChange={setBaseRent} placeholder="e.g. $22.00/SF/yr" />
                <TextField label="Lease Term (Years)" value={leaseTerm} onChange={setLeaseTerm} placeholder="e.g. 5" type="number" />
                <TextField label="CAM Charges ($/SF/Yr)" value={cam} onChange={setCam} placeholder="e.g. $4.50/SF/yr" />
                <TextField label="TI Allowance ($/SF)" value={ti} onChange={setTi} placeholder="e.g. $15/SF" />
              </div>
            )}
          </div>
        )}

        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary mb-2">Contingencies</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isCommercial ? (
              <>
                <CheckboxField label="Due Diligence" checked={contDueDiligence} onChange={setContDueDiligence} />
                <CheckboxField label="Financing" checked={contFinanceCRE} onChange={setContFinanceCRE} />
                <CheckboxField label="Environmental / Zoning" checked={contEnviro} onChange={setContEnviro} />
              </>
            ) : (
              <>
                <CheckboxField label="Inspection" checked={contInspect} onChange={setContInspect} />
                <CheckboxField label="Financing" checked={contFinance} onChange={setContFinance} />
                <CheckboxField label="Appraisal" checked={contAppraisal} onChange={setContAppraisal} />
              </>
            )}
          </div>
        </div>

        <GenerateButton onClick={handleGenerate} loading={loading} label="⚔️ Generate Negotiation Strategy + Offer Language" />
        {error && <ErrorBanner message={error} />}
      </div>

      {result && (
        <div className="space-y-3">
          <SendToPdfButton
            onClick={() => onSendToPdf(result, address ? `${address} — Negotiation Script` : 'Negotiation Script')}
          />
          <ResultSection title="⚔️ Negotiation Strategy" content={extractSection(result, 'NEGOTIATION STRATEGY')} copyKey="strategy" />
          <ResultSection title="📄 Offer Language" content={extractSection(result, 'OFFER LANGUAGE')} copyKey="language" />
          <ResultSection title="🛡️ Objection Responses" content={extractSection(result, 'OBJECTION RESPONSES')} copyKey="objections" />
          <ResultSection title="🚪 Walk-Away Analysis" content={extractSection(result, 'WALK-AWAY ANALYSIS')} copyKey="walkaway" />
        </div>
      )}
    </div>
  );
};

export default NegotiationScriptGenerator;
