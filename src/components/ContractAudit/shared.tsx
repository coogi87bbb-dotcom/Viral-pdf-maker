// Cross-cutting helpers for the Contract Audit tool: file encoding, the
// server.ts proxy client, Firestore-backed audit history ("My Audits"),
// and styled form primitives scoped to this tool only. Copied and re-themed
// from DealCloser/shared.tsx's pattern rather than cross-imported — keeps
// each tool directory independently editable, matching this app's existing
// one-directory-per-tool convention. Uses this tool's brass Studio OS
// accent throughout (not DealCloser's rosegold — that ramp is reserved for
// pre-login surfaces + Button.tsx's primary variant per CLAUDE.md).
import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { apiFetch, apiPostJson } from '../../lib/apiClient';
import { db, doc, setDoc, increment, serverTimestamp, collection, addDoc, query, where, orderBy, getDocs } from '../../lib/firebase';
import type { AuditResult, ContractAuditUseCase, EncodedUpload, SavedAudit } from './types';

// ---------------------------------------------------------------------------
// File -> base64 upload encoding.
// ---------------------------------------------------------------------------
export function fileToBase64(file: File): Promise<EncodedUpload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.slice(result.indexOf(',') + 1);
      resolve({ fileName: file.name, mimeType: file.type || 'application/octet-stream', base64Data });
    };
    reader.readAsDataURL(file);
  });
}

// Matches the upstream Python service's own 10MB-per-file cap — checked
// client-side before ever hitting the network so the common case never
// round-trips just to fail.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Shared by ContractAuditStudio.tsx's in-app results table and
// ContractAuditReportDocument.tsx's branded PDF report, so both format
// currency identically.
export function formatCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// ---------------------------------------------------------------------------
// POST /api/contract-audit/run (server.ts) — proxies to the deployed
// variance-guard-engine FastAPI service with server-side Basic auth.
// Mirrors DealCloser's callDealCloserAI shape (throw on a failure/error
// response rather than returning it).
// ---------------------------------------------------------------------------
export async function runContractAudit(
  useCase: ContractAuditUseCase,
  jurisdiction: string,
  contract: EncodedUpload,
  invoice: EncodedUpload
): Promise<AuditResult> {
  const res = await apiPostJson<any>('/api/contract-audit/run', { useCase, jurisdiction, contract, invoice });
  if (!res || res.error) {
    throw new Error(res?.error || 'Contract audit failed. Please try again.');
  }
  return res as AuditResult;
}

// Downloads can't be a plain <a href> — /api/contract-audit/download/* sits
// behind the same Firebase-bearer-token gate as every other /api/* route,
// which a static link has no way to attach. Fetch as a Blob and trigger a
// synthetic click instead.
export async function downloadAuditFile(auditId: string, kind: 'excel' | 'letter', suggestedFileName: string): Promise<void> {
  const res = await apiFetch(`/api/contract-audit/download/${auditId}/${kind}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || 'Download failed. Please try again.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
// Per-user audit history ("My Audits") — persists the findings/summary
// record so it survives independently of the upstream Python service's
// ephemeral temp-file storage. Does NOT persist the original Excel/letter
// files themselves; those still depend on that service's own temp-file
// lifecycle (a re-deploy there clears them) — a durable copy would need
// Firebase Storage, which isn't wired into this app yet. Re-running the
// audit is the fallback if a download link has gone stale.
// ---------------------------------------------------------------------------
export async function saveContractAudit(uid: string, result: AuditResult): Promise<void> {
  try {
    await addDoc(collection(db, 'contractAudits'), {
      userId: uid,
      auditId: result.auditId,
      useCase: result.useCase,
      jurisdiction: result.jurisdiction,
      summary: result.summary,
      findings: result.findings,
      createdAt: serverTimestamp(),
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
    return {
      docId: d.id,
      auditId: data.auditId,
      useCase: data.useCase,
      jurisdiction: data.jurisdiction,
      summary: data.summary,
      findings: data.findings,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || '',
    } as SavedAudit;
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

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls,.pdf,.yaml,.yml';

export const FileDropField: React.FC<FileDropFieldProps> = ({ label, file, onChange, hint }) => {
  const inputId = `contract-audit-file-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <label
        htmlFor={inputId}
        className="flex items-center justify-between gap-3 w-full bg-surface-0 border border-dashed border-hairline hover:border-accent-brass-400/50 rounded-xl px-3.5 py-3 text-xs cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accent-brass-400"
      >
        <span className={file ? 'text-ink-primary truncate' : 'text-ink-muted'}>
          {file ? file.name : 'Choose a file (.csv, .xlsx, .pdf, .yaml)'}
        </span>
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
