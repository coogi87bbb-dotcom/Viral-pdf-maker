// Cross-cutting utilities shared by all 7 Deal Closer tools — ported from
// the source app's own DRY helpers (voice input mic, copyText/showToast,
// extractSection, parseCurrency/parsePercent, loading/error states) so
// none of it is duplicated 7 times across the tool components. Styled
// against this app's design tokens (surface ladder, rosegold accents)
// rather than the source's dark-gold Playfair aesthetic.
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Mic, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';
import { apiPostJson } from '../../lib/apiClient';
import { db, doc, setDoc, increment, serverTimestamp } from '../../lib/firebase';
import type { PropertyMode, DealCloserToolId } from './types';

// ---------------------------------------------------------------------------
// Residential / Commercial mode — lifted to a context so every tool reads it
// without prop-drilling; set once from the DealCloserStudio shell's toggle.
// ---------------------------------------------------------------------------
const PropertyModeContext = createContext<PropertyMode>('residential');
export const PropertyModeProvider = PropertyModeContext.Provider;
export const usePropertyMode = () => useContext(PropertyModeContext);

// ---------------------------------------------------------------------------
// AI call helper — proxies to POST /api/ai/deal-closer-generate (server.ts),
// which replaces the source app's hardcoded, browser-exposed manus.im key
// with this app's existing server-side Gemini setup.
//
// `maxTokens` here (and the various 1800/2000/2400 literals individual
// tool components historically passed) is mostly vestigial: the server
// route enforces its own 32000-token floor regardless of what's passed,
// since those old per-tool numbers were tuned before gemini-3.6-flash's
// reasoning-token overhead was understood and are too low to reliably fit
// both the model's thinking and its final answer (see server.ts's
// clampedMaxTokens comment). Left as a pass-through parameter — a caller
// can still ask for MORE than the floor — rather than removed, so a future
// tool needing a larger budget than the floor still has a path to request one.
export async function callDealCloserAI(systemPrompt: string, userPrompt: string, maxTokens?: number): Promise<string> {
  const data = await apiPostJson<{ success: boolean; text?: string; error?: string }>('/api/ai/deal-closer-generate', {
    systemPrompt,
    userPrompt,
    maxTokens,
  });
  if (!data?.success || !data.text) {
    throw new Error(data?.error || 'AI generation failed. Please try again.');
  }
  return data.text;
}

// ---------------------------------------------------------------------------
// Usage tracking for the repurposed owner-admin analytics section (replaces
// the source app's VIP/revenue-specific admin metrics, which don't apply
// now that there's no separate paywall inside Studio OS).
// ---------------------------------------------------------------------------
export async function trackDealCloserUsage(toolId: DealCloserToolId, mode: PropertyMode): Promise<void> {
  try {
    await setDoc(
      doc(db, 'dealCloserUsage', toolId),
      {
        toolId,
        count: increment(1),
        [`${mode}Count`]: increment(1),
        lastUsedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    // Usage tracking is best-effort analytics, never block the tool on it.
    console.warn('Deal Closer usage tracking notice:', err);
  }
}

// ---------------------------------------------------------------------------
// AI-response section extraction (source's extractSection) + currency/percent
// parsing helpers (source's parseCurrency/parsePercent).
//
// Real bug found via a screen recording ("every box is showing all the
// information"): the model frequently prefixes each [LABEL] with a
// markdown heading marker (e.g. `### [COMPLETE AGENT SCRIPT]`), including
// on the very first section. The boundary lookahead below required the
// NEXT section's `[LABEL]` to follow a newline with nothing in between —
// it never matched against a `###`-prefixed heading, so the non-greedy
// capture ran all the way to the end of the string instead of stopping at
// the next section, and every box after the first ended up rendering the
// entire remaining response. `#{0,6}\s*` tolerates that heading marker
// (0-6 #'s covers every markdown heading level) in both the opening match
// and the boundary lookahead.
// ---------------------------------------------------------------------------
export function extractSection(text: string, label: string): string {
  if (!text) return '';
  const bracketPattern = new RegExp(`#{0,6}\\s*\\[${label}\\]:?\\*{0,2}\\s*([\\s\\S]*?)(?=\\n#{0,6}\\s*\\[[A-Z0-9 _\\/&-]+\\]:?|$)`, 'i');
  const bracketMatch = text.match(bracketPattern);
  if (bracketMatch?.[1]?.trim()) return bracketMatch[1].trim();

  const plainPattern = new RegExp(`${label}:?\\s*\\n?([\\s\\S]*?)(?=\\n#{0,6}\\s*[A-Z][A-Za-z0-9 _\\/&-]{2,40}:|$)`, 'i');
  const plainMatch = text.match(plainPattern);
  if (plainMatch?.[1]?.trim()) return plainMatch[1].trim();

  return '';
}

export function parseCurrency(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  const cleaned = String(value).replace(/[$,\s]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function parsePercent(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null;
  const cleaned = String(value).replace(/[%\s]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// Copy-to-clipboard, keyed so many buttons on one screen can each show their
// own "Copied!" state independently (mirrors the per-button useState pattern
// already used throughout this codebase, e.g. GigScale.tsx).
// ---------------------------------------------------------------------------
export function useCopyToClipboard(resetMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = useCallback(
    (key: string, text: string) => {
      if (!text) return;
      navigator.clipboard?.writeText(text).catch(() => {});
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), resetMs);
    },
    [resetMs]
  );
  return { copiedKey, copy };
}

export const CopyButton: React.FC<{ text: string; copyKey: string }> = ({ text, copyKey }) => {
  const { copiedKey, copy } = useCopyToClipboard();
  const copied = copiedKey === copyKey;
  return (
    <button
      type="button"
      onClick={() => copy(copyKey, text)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-surface-2 border border-white/10 text-ink-secondary hover:text-white hover:border-accent-rosegold-400/40 transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

// ---------------------------------------------------------------------------
// Voice input (source's mic button on any text/textarea field) via the Web
// Speech API, with a listening/confirmed state and a silent no-op fallback
// on unsupported browsers (source showed a note; we just hide the button).
// ---------------------------------------------------------------------------
function getSpeechRecognitionCtor(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export const VoiceMicButton: React.FC<{ onResult: (text: string) => void; className?: string }> = ({
  onResult,
  className = '',
}) => {
  const [listening, setListening] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionCtor = getSpeechRecognitionCtor();
  if (!SpeechRecognitionCtor) return null;

  const start = () => {
    if (listening) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setConfirmed(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onResult(transcript);
        setConfirmed(true);
        window.setTimeout(() => setConfirmed(false), 2000);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={start}
      title={listening ? 'Listening…' : 'Speak to fill this field'}
      className={`absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 ${
        listening
          ? 'bg-accent-rosegold-500/30 text-accent-rosegold-300 animate-pulse'
          : confirmed
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-surface-2 text-ink-muted hover:text-accent-rosegold-300 hover:bg-accent-rosegold-500/10'
      } ${className}`}
    >
      <Mic className="h-3.5 w-3.5" />
    </button>
  );
};

// ---------------------------------------------------------------------------
// Styled form primitives — kept consistent across all 7 tools so restyling
// once here covers the whole suite.
// ---------------------------------------------------------------------------
const INPUT_BASE =
  'w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-ink-primary placeholder:text-ink-muted/60 ' +
  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 focus:border-accent-rosegold-400/60';

export const FieldLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary mb-1.5">
    {children}
    {hint && <span className="ml-1.5 normal-case font-medium text-ink-muted">{hint}</span>}
  </label>
);

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  voice?: boolean;
  hint?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, placeholder, type = 'text', voice = true, hint }) => (
  <div>
    <FieldLabel hint={hint}>{label}</FieldLabel>
    <div className="relative">
      <input
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${INPUT_BASE} ${voice ? 'pr-10' : ''}`}
      />
      {voice && <VoiceMicButton onResult={onChange} />}
    </div>
  </div>
);

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChange, placeholder, rows = 3, hint }) => (
  <div>
    <FieldLabel hint={hint}>{label}</FieldLabel>
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${INPUT_BASE} pr-10 resize-y`}
      />
      <VoiceMicButton onResult={(t) => onChange(value ? `${value} ${t}` : t)} className="top-4 translate-y-0" />
    </div>
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_BASE}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const CheckboxField: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-0 border border-white/10 cursor-pointer text-xs text-ink-secondary hover:border-accent-rosegold-400/30 transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-3.5 w-3.5 rounded accent-[color:var(--color-accent-rosegold-400,#e2a874)]"
    />
    <span>{label}</span>
  </label>
);

// ---------------------------------------------------------------------------
// AI generate button + result sections + error banner.
// ---------------------------------------------------------------------------
export const GenerateButton: React.FC<{ onClick: () => void; loading: boolean; label: string }> = ({
  onClick,
  loading,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-rosegold-400 hover:brightness-105 text-slate-950 text-xs font-bold shadow-[var(--shadow-glow-rosegold)] transition-[transform,opacity,filter] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    <span>{loading ? 'Generating…' : label}</span>
  </button>
);

export const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
    <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);

export const ResultSection: React.FC<{ title: string; content: string; copyKey: string }> = ({ title, content, copyKey }) => {
  if (!content) return null;
  return (
    <div className="bg-surface-0 border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2/60 border-b border-white/10">
        <span className="text-xs font-bold text-accent-rosegold-300">{title}</span>
        <CopyButton text={content} copyKey={copyKey} />
      </div>
      <div className="p-4 text-xs text-ink-secondary leading-[1.7] whitespace-pre-wrap">{content}</div>
    </div>
  );
};
