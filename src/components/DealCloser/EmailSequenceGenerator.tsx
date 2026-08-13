// Tool 4/7 — "Client Follow-Up Email Sequence". Ported field-for-field from
// thedealcloserai's index.html (see plan Section 2, Tool 4), including the
// ===EMAIL[N]START/END=== delimiter parsing scheme from the source.
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import {
  usePropertyMode,
  TextField,
  TextAreaField,
  SelectField,
  GenerateButton,
  ErrorBanner,
  CopyButton,
  callDealCloserAI,
  trackDealCloserUsage,
} from './shared';

const RESIDENTIAL_LEAD_TYPES = [
  'First-Time Buyer',
  'Move-Up Buyer (selling + buying)',
  'Real Estate Investor',
  'Corporate Relocation',
  'Empty Nester / Downsizer',
  'Potential Seller Lead',
  'Open House Visitor',
  'Cold Lead (30+ days no contact)',
];

const COMMERCIAL_LEAD_TYPES = [
  'Investor / Cap Rate Buyer',
  'Developer',
  'Business Owner / Tenant',
  '1031 Exchange Buyer',
  'Institutional Buyer',
  'Cold Lead (30+ days no contact)',
];

const TONE_OPTIONS = ['Warm & Professional', 'Direct with Urgency', 'Consultative Advisor', 'Casual & Friendly'];

interface ParsedEmail {
  subject: string;
  body: string;
}

function parseEmailSequence(text: string): ParsedEmail[] {
  const emails: ParsedEmail[] = [];
  for (let i = 1; i <= 5; i++) {
    const pattern = new RegExp(`===EMAIL${i}START===([\\s\\S]*?)===EMAIL${i}END===`, 'i');
    const match = text.match(pattern);
    if (!match) continue;
    const block = match[1].trim();
    const subjectMatch = block.match(/subject:?\s*(.+)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : `Email ${i}`;
    const body = block.replace(/subject:?\s*.+/i, '').trim();
    emails.push({ subject, body: body || block });
  }
  return emails;
}

export const EmailSequenceGenerator: React.FC = () => {
  const mode = usePropertyMode();
  const isCommercial = mode === 'commercial';
  const leadTypes = isCommercial ? COMMERCIAL_LEAD_TYPES : RESIDENTIAL_LEAD_TYPES;

  const [leadType, setLeadType] = useState(leadTypes[0]);
  const [name, setName] = useState('');
  const [situation, setSituation] = useState('');
  const [agent, setAgent] = useState('');
  const [tone, setTone] = useState(TONE_OPTIONS[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [activeEmail, setActiveEmail] = useState(0);

  const handleGenerate = async () => {
    if (!name.trim() || !situation.trim() || !agent.trim()) {
      setError('Please fill in client name(s), their situation, and your name/brokerage.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const systemPrompt = 'You are an elite real estate agent writing a 5-email follow-up drip sequence for a specific client lead.';
      const userPrompt = `Lead Type: ${leadType}
Client Name(s): ${name}
Their Situation: ${situation}
Agent: ${agent}
Tone: ${tone}

Write a 5-email drip sequence for this lead:
Email 1: Immediate reconnect — reference their specific situation.
Email 2: Value-add — a market insight or tip.
Email 3: Social proof — a similar client success story.
Email 4: Soft urgency — market condition or opportunity.
Email 5: Final check-in — no pressure, keeps the door open.

Each email should be 120-180 words. Format EACH email EXACTLY like this, with no extra text outside the delimiters:
===EMAIL1START===
Subject: <subject line>
<email body>
===EMAIL1END===
===EMAIL2START===
Subject: <subject line>
<email body>
===EMAIL2END===
(continue through EMAIL5)`;

      const text = await callDealCloserAI(systemPrompt, userPrompt);
      const parsed = parseEmailSequence(text);
      if (parsed.length === 0) {
        throw new Error('Could not parse the generated email sequence. Please try again.');
      }
      setEmails(parsed);
      setActiveEmail(0);
      trackDealCloserUsage('emailSequence', mode);
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating your email sequence.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            Client Follow-Up Email Sequence
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NEW</span>
          </h2>
          <p className="text-xs text-ink-muted">A 5-email drip sequence tailored to the lead type and their exact situation.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-2xl p-5 space-y-4">
        <SelectField label="Lead Type" value={leadType} onChange={setLeadType} options={leadTypes.map((t) => ({ value: t, label: t }))} />
        <TextField label="Client Name(s)" value={name} onChange={setName} placeholder="e.g. Marcus & Tanya" />
        <TextAreaField
          label="Their Situation (more detail = better emails)"
          value={situation}
          onChange={setSituation}
          rows={3}
          placeholder={isCommercial ? 'e.g. 1031 exchange from $2.1M sale...' : 'e.g. Pre-approved for $420K...'}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Your Name & Brokerage" value={agent} onChange={setAgent} placeholder="e.g. Keisha Williams, KW Metro" />
          <SelectField label="Sequence Tone" value={tone} onChange={setTone} options={TONE_OPTIONS.map((t) => ({ value: t, label: t }))} />
        </div>

        <GenerateButton onClick={handleGenerate} loading={loading} label="✉️ Generate 5-Email Drip Sequence" />
        {error && <ErrorBanner message={error} />}
      </div>

      {emails.length > 0 && (
        <div className="bg-surface-0 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex flex-wrap gap-1 p-2 bg-surface-2/60 border-b border-white/10">
            {emails.map((e, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveEmail(idx)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 ${
                  activeEmail === idx ? 'bg-accent-rosegold-400 text-slate-950' : 'text-ink-muted hover:text-white hover:bg-surface-1'
                }`}
              >
                Email {idx + 1}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-rosegold-300">{emails[activeEmail]?.subject}</span>
              <CopyButton text={emails[activeEmail]?.body || ''} copyKey={`email-${activeEmail}`} />
            </div>
            <div className="text-xs text-ink-secondary leading-[1.7] whitespace-pre-wrap">{emails[activeEmail]?.body}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSequenceGenerator;
