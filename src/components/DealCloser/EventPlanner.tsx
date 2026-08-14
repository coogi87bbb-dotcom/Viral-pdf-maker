// Tool 6/7 — Open House / Property Tour Playbook. Ported field-for-field
// from thedealcloserai's index.html (see plan Section 2, Tool 6). The
// heading itself changes by mode, matching the source exactly.
import React, { useState } from 'react';
import { Key, Building2 } from 'lucide-react';
import {
  usePropertyMode,
  TextField,
  TextAreaField,
  SelectField,
  GenerateButton,
  ErrorBanner,
  ResultSection,
  SendToPdfButton,
  callDealCloserAI,
  extractSection,
  trackDealCloserUsage,
} from './shared';

const RES_VISITOR_TYPES = ['Mixed — Families, Investors & Neighbors', 'Luxury Buyers Only', 'Mostly First-Time Buyers', 'Investment-Focused Buyers'];
const CRE_VISITOR_TYPES = ['Institutional Investors', 'Private Equity Buyers', 'Owner-User', 'Tenant Prospects', 'Developers & Brokers (Broker Preview)'];

interface EventPlannerProps {
  onSendToPdf: (text: string, title: string) => void;
}

export const EventPlanner: React.FC<EventPlannerProps> = ({ onSendToPdf }) => {
  const mode = usePropertyMode();
  const isCommercial = mode === 'commercial';

  const [address, setAddress] = useState('');
  const [highlights, setHighlights] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [visitorType, setVisitorType] = useState(isCommercial ? CRE_VISITOR_TYPES[0] : RES_VISITOR_TYPES[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!address.trim() || !highlights.trim() || !budget.trim() || !date.trim()) {
      setError('Please fill in address, highlights, budget, and date/time.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const eventNoun = isCommercial ? 'property tour / broker preview' : 'open house';
      const scriptLabel = isCommercial ? 'COMPLETE TOUR SCRIPT' : 'COMPLETE AGENT SCRIPT';
      const questionsLabel = isCommercial ? 'QUALIFICATION QUESTIONS' : 'LEAD QUALIFICATION QUESTIONS';

      const systemPrompt = isCommercial
        ? 'You are an elite commercial real estate broker planning a property tour / broker preview event.'
        : 'You are an elite residential real estate agent planning an open house event.';

      const userPrompt = `Property Address & Type: ${address}
Top 5 Property Highlights: ${highlights}
${eventNoun} Budget: ${budget}
Date & Time: ${date}
${isCommercial ? 'Attendee' : 'Visitor'} Type: ${visitorType}

Generate a full ${eventNoun} playbook with EXACTLY these 4 labeled sections:

[BUDGET BREAKDOWN]: An itemized spend breakdown with dollar amounts allocated across the budget.
[${scriptLabel}]: A complete, word-for-word delivery script for the event.
[${questionsLabel}]: 6 numbered qualification questions to ask attendees, each with a short note on what the answer reveals.
[FOLLOW-UP TEMPLATES]: 3 post-event follow-up templates (Template A: Serious Buyer, Template B: Undecided, Template C: Tire-Kicker/Referral), 80-100 words each.`;

      const text = await callDealCloserAI(systemPrompt, userPrompt);
      setResult(text);
      trackDealCloserUsage('eventPlanner', mode);
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating your playbook.');
    } finally {
      setLoading(false);
    }
  };

  const Icon = isCommercial ? Building2 : Key;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            {isCommercial ? 'Property Tour & Broker Preview Builder' : 'Open House ROI & Script Builder'}
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NEW</span>
          </h2>
          <p className="text-xs text-ink-muted">Budget allocation, a full delivery script, qualification questions &amp; follow-up templates.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-2xl p-5 space-y-4">
        <TextField
          label="Property Address & Type"
          value={address}
          onChange={setAddress}
          placeholder={isCommercial ? 'e.g. 4500 Commerce Pkwy — industrial flex...' : 'e.g. 318 Oak Blvd — 4BR colonial...'}
        />
        <TextAreaField
          label="Top 5 Property Highlights"
          value={highlights}
          onChange={setHighlights}
          rows={3}
          placeholder={isCommercial ? 'e.g. 24ft clear height, 6 dock-high doors...' : 'e.g. Just renovated, new roof...'}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label={`${isCommercial ? 'Property Tour' : 'Open House'} Budget ($)`} value={budget} onChange={setBudget} placeholder={isCommercial ? 'e.g. 1500' : 'e.g. 500'} type="number" />
          <TextField label="Date & Time" value={date} onChange={setDate} placeholder={isCommercial ? 'e.g. Tues Jun 10, 10 AM–12 PM' : 'e.g. Sat May 31, 1–4 PM'} />
        </div>
        <SelectField
          label={isCommercial ? 'Attendee Type' : 'Visitor Type'}
          value={visitorType}
          onChange={setVisitorType}
          options={(isCommercial ? CRE_VISITOR_TYPES : RES_VISITOR_TYPES).map((t) => ({ value: t, label: t }))}
        />

        <GenerateButton
          onClick={handleGenerate}
          loading={loading}
          label={isCommercial ? '🏢 Generate Property Tour Playbook' : '🏡 Generate Open House Playbook'}
        />
        {error && <ErrorBanner message={error} />}
      </div>

      {result && (
        <div className="space-y-3">
          <SendToPdfButton
            onClick={() => onSendToPdf(result, address ? `${address} — Open House / Tour Plan` : 'Open House / Tour Plan')}
          />
          <ResultSection title="💵 Budget Breakdown & ROI Allocation" content={extractSection(result, 'BUDGET BREAKDOWN')} copyKey="budget" />
          <ResultSection
            title={isCommercial ? '🎤 Complete Tour Script' : '🎤 Complete Agent Script'}
            content={extractSection(result, isCommercial ? 'COMPLETE TOUR SCRIPT' : 'COMPLETE AGENT SCRIPT')}
            copyKey="script"
          />
          <ResultSection
            title={isCommercial ? '🔍 Qualification Questions' : '🔍 Lead Qualification Questions'}
            content={extractSection(result, isCommercial ? 'QUALIFICATION QUESTIONS' : 'LEAD QUALIFICATION QUESTIONS')}
            copyKey="questions"
          />
          <ResultSection title="📬 Post-Event Follow-Up Templates" content={extractSection(result, 'FOLLOW-UP TEMPLATES')} copyKey="followup" />
        </div>
      )}
    </div>
  );
};

export default EventPlanner;
