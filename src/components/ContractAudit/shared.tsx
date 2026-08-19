// Cross-cutting helpers for the Contract Audit tool: Firestore-backed audit
// history ("My Audits") and styled form primitives scoped to this tool only.
// Copied and re-themed from DealCloser/shared.tsx's pattern rather than
// cross-imported — keeps each tool directory independently editable,
// matching this app's existing one-directory-per-tool convention. Uses this
// tool's brass Studio OS accent throughout (not DealCloser's rosegold —
// that ramp is reserved for pre-login surfaces + Button.tsx's primary
// variant per CLAUDE.md).
//
// There is no server round-trip anymore (see types.ts's header comment) —
// runAudit (engine/auditEngine.ts) runs entirely in the browser, so this
// file's only job is persisting/loading results, not proxying to one.
import React from 'react';
import Decimal from 'decimal.js';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { db, doc, setDoc, increment, serverTimestamp, collection, addDoc, query, where, orderBy, getDocs } from '../../lib/firebase';
import type { AuditResult, ContractAuditUseCase, SavedAudit } from './types';

// Sanity cap on uploaded CSVs — Papa.parse can handle far larger files, but
// there's no reason to accept an absurdly large one; also keeps the browser
// tab responsive since parsing/matching/classifying all happen synchronously
// on the main thread (see engine/auditEngine.ts).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Firestore serialization — Decimal values (used throughout AuditResult; see
// engine/decimalUtils.ts) have no native Firestore representation, so every
// Decimal instance is written as { __decimal: "<string>" } and rehydrated
// back into a real Decimal on read. rawSource (each line item's full
// original CSV row) is dropped at write time: it's only needed during
// matching/ingestion, never for displaying a saved result, and keeping it
// would multiply every stored line item's size by however many columns the
// source file had.
// ---------------------------------------------------------------------------
function serializeValue(value: any): any {
  if (value instanceof Decimal) return { __decimal: value.toString() };
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, v] of Object.entries(value)) {
      if (key === 'rawSource') continue;
      out[key] = serializeValue(v);
    }
    return out;
  }
  return value;
}

function deserializeValue(value: any): any {
  if (value !== null && typeof value === 'object') {
    if (typeof value.__decimal === 'string') return new Decimal(value.__decimal);
    if (Array.isArray(value)) return value.map(deserializeValue);
    const out: Record<string, any> = {};
    for (const [key, v] of Object.entries(value)) out[key] = deserializeValue(v);
    return out;
  }
  return value;
}

export function serializeAuditResult(result: AuditResult): Record<string, any> {
  return serializeValue(result);
}

export function deserializeAuditResult(data: Record<string, any>): AuditResult {
  const restored = deserializeValue(data) as AuditResult;
  // rawSource was dropped at write time — put back an empty object so the
  // rehydrated line items still satisfy their type; a saved/reopened result
  // only ever gets displayed, never re-matched, so the field is unused.
  for (const item of [...restored.unmatchedContractItems, ...restored.unmatchedInvoiceItems]) {
    (item as any).rawSource = {};
  }
  return restored;
}

// ---------------------------------------------------------------------------
// Best-effort aggregate usage analytics (owner-admin dashboard), mirroring
// DealCloser's trackDealCloserUsage — never blocks the tool on failure.
// ---------------------------------------------------------------------------
export async function trackContractAuditUsage(useCase: ContractAuditUseCase): Promise<void> {
  try {
    await setDoc(
      doc(db, 'contractAuditUsage', useCase),
      { useCase, count: increment(1), lastUsedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn('Contract Audit usage tracking notice:', err);
  }
}

// ---------------------------------------------------------------------------
// Per-user audit history ("My Audits"). Since the engine runs entirely
// client-side now, there's no ephemeral upstream temp-file storage to worry
// about — the saved record is the full, re-displayable result (see
// serializeAuditResult above), so a saved audit never goes stale the way it
// used to when it depended on a separately-deployed service's own file
// lifecycle.
// ---------------------------------------------------------------------------
export async function saveContractAudit(uid: string, result: AuditResult): Promise<void> {
  try {
    await addDoc(collection(db, 'contractAudits'), {
      userId: uid,
      createdAt: serverTimestamp(),
      result: serializeAuditResult(result),
    });
  } catch (err) {
    // Best-effort — a failed history write should never block showing the
    // user their just-completed audit results.
    console.warn('Contract Audit history save notice:', err);
  }
}

export async function listMyContractAudits(uid: string): Promise<SavedAudit[]> {
  const q = query(collection(db, 'contractAudits'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return { docId: d.id, result: deserializeAuditResult(data.result) };
  });
}

// ---------------------------------------------------------------------------
// Styled form primitives, scoped to Contract Audit only.
// ---------------------------------------------------------------------------
const INPUT_BASE =
  'w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary placeholder:text-ink-muted/60 ' +
  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus:border-accent-brass-400/60';

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
  hint?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, placeholder, hint }) => (
  <div>
    <FieldLabel hint={hint}>{label}</FieldLabel>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_BASE}
    />
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

export const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
    <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);

export const RunAuditButton: React.FC<{ onClick: () => void; loading: boolean; disabled?: boolean; label: string }> = ({
  onClick,
  loading,
  disabled,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading || disabled}
    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-brass-500 hover:brightness-105 text-slate-950 text-xs font-bold shadow-[var(--shadow-glow-brass)] transition-[transform,opacity,filter] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    <span>{loading ? 'Running audit…' : label}</span>
  </button>
);

export const SecondaryButton: React.FC<{
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
}> = ({ onClick, loading, disabled, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading || disabled}
    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 border border-hairline hover:border-accent-brass-400/40 text-ink-primary text-xs font-bold transition-colors active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
  >
    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
    <span>{label}</span>
  </button>
);

interface FileDropFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
}

// CSV only — see engine/ingestion.ts's header comment for why Excel/PDF
// ingestion is out of scope for this client-side port.
const ACCEPTED_EXTENSIONS = '.csv';

export const FileDropField: React.FC<FileDropFieldProps> = ({ label, file, onChange, hint }) => {
  const inputId = `contract-audit-file-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <label
        htmlFor={inputId}
        className="flex items-center justify-between gap-3 w-full bg-surface-0 border border-dashed border-hairline hover:border-accent-brass-400/50 rounded-xl px-3.5 py-3 text-xs cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accent-brass-400"
      >
        <span className={file ? 'text-ink-primary truncate' : 'text-ink-muted'}>{file ? file.name : 'Choose a CSV file'}</span>
        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-accent-brass-400">Browse</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
};
