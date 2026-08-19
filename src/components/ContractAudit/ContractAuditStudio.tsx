// Contract Audit shell — a native, entirely client-side Studio OS tool
// (see types.ts's header comment). runAudit (engine/auditEngine.ts) parses
// both CSVs, matches line items, and classifies every variance in the
// browser — no server round-trip, no separately-hosted service. This
// component only collects inputs and renders results/history in this app's
// brass "Modern Grand Hotel" Studio OS design system. Wired to this app's
// existing auth (no separate login — reaching this tab already means the
// user is signed into Studio OS), matching the DealCloser precedent.
import React, { useRef, useState } from 'react';
import { FileSearch, ScrollText, Download, FileOutput, History, Clock, DollarSign, ListChecks, AlertOctagon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatTile } from '../ui/StatTile';
import { Panel } from '../ui/Panel';
import { Badge, BadgeTone } from '../ui/Badge';
import { exportPdfFromRef } from '../../utils/pdfExport';
import type { DocumentData } from '../../types';
import {
  trackContractAuditUsage,
  saveContractAudit,
  listMyContractAudits,
  MAX_UPLOAD_BYTES,
  TextField,
  SelectField,
  ErrorBanner,
  RunAuditButton,
  SecondaryButton,
  FileDropField,
} from './shared';
import { USE_CASE_IDS, USE_CASE_LABELS, SEVERITY_LABELS } from './types';
import type { AuditResult, Severity, ContractAuditUseCase, SavedAudit } from './types';
import { runAudit } from './engine/auditEngine';
import { generateDisputeLetter, generateFindingsCsv, triggerTextDownload } from './engine/reportGenerator';
import { formatCurrency } from './engine/decimalUtils';
import { ContractAuditReportDocument, auditResultToDocument } from './ContractAuditReportDocument';

const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  WITHIN_TOLERANCE: 'positive',
  REVIEW: 'warning',
  DISPUTE: 'danger',
};

interface ContractAuditStudioProps {
  onSendReportToPdf: (doc: DocumentData) => void;
}

type View = 'form' | 'results' | 'history';

export const ContractAuditStudio: React.FC<ContractAuditStudioProps> = ({ onSendReportToPdf }) => {
  const { user } = useAuth();
  const [view, setView] = useState<View>('form');

  // Form state
  const [useCase, setUseCase] = useState<ContractAuditUseCase>('expense');
  const [jurisdiction, setJurisdiction] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);

  // Results / errors
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);

  // History
  const [history, setHistory] = useState<SavedAudit[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const reportRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setContractFile(null);
    setInvoiceFile(null);
    setError('');
  };

  const handleRunAudit = async () => {
    setError('');
    if (!contractFile || !invoiceFile) {
      setError('Choose both a contract CSV and an invoice CSV before running the audit.');
      return;
    }
    if (contractFile.size > MAX_UPLOAD_BYTES || invoiceFile.size > MAX_UPLOAD_BYTES) {
      setError('Each file must be 10MB or smaller.');
      return;
    }

    setRunning(true);
    try {
      const auditResult = await runAudit(useCase, contractFile, invoiceFile, jurisdiction.trim());
      setResult(auditResult);
      setView('results');
      // Best-effort, non-blocking — never delay showing results on these.
      trackContractAuditUsage(useCase);
      if (user?.uid) saveContractAudit(user.uid, auditResult);
    } catch (err: any) {
      setError(err?.message || 'Contract audit failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = (kind: 'csv' | 'letter') => {
    if (!result) return;
    if (kind === 'csv') {
      triggerTextDownload(generateFindingsCsv(result), `contract-audit-${result.auditId}-findings.csv`, 'text/csv');
    } else {
      triggerTextDownload(generateDisputeLetter(result), `contract-audit-${result.auditId}-dispute-letter.md`, 'text/markdown');
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setError('');
    setExportingPdf(true);
    try {
      await exportPdfFromRef(reportRef, `contract-audit-${result.auditId}`);
    } catch (err: any) {
      setError(err?.message || 'PDF export failed. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  const openHistory = async () => {
    setView('history');
    if (!user?.uid) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const audits = await listMyContractAudits(user.uid);
      setHistory(audits);
    } catch (err: any) {
      setHistoryError(err?.message || 'Could not load past audits.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const openSavedAudit = (saved: SavedAudit) => {
    setResult(saved.result);
    setView('results');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-accent-brass-500 via-accent-brass-400 to-accent-brass-600 p-0.5 shadow-[var(--shadow-glow-brass)] flex items-center justify-center border border-accent-brass-400/30">
            <div className="h-full w-full bg-surface-0 rounded-[10px] flex items-center justify-center">
              <FileSearch className="h-5 w-5 text-accent-brass-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em] font-display text-ink-primary">Contract Audit</h1>
            <p className="text-xs text-ink-muted">
              Decimal-precision variance detection — expense reimbursement and SaaS subscriptions, entirely in your browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          {view !== 'form' && (
            <SecondaryButton
              icon={ArrowLeft}
              label="New Audit"
              onClick={() => {
                setView('form');
                setResult(null);
                resetForm();
              }}
            />
          )}
          <SecondaryButton icon={History} label="My Audits" onClick={openHistory} />
        </div>
      </div>

      {view === 'form' && (
        <Panel className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectField
              label="Use Case"
              value={useCase}
              onChange={(v) => setUseCase(v as ContractAuditUseCase)}
              options={USE_CASE_IDS.map((id) => ({ value: id, label: USE_CASE_LABELS[id] }))}
            />
            <TextField
              label="Jurisdiction"
              value={jurisdiction}
              onChange={setJurisdiction}
              placeholder="e.g. California, USA (optional)"
              hint="Optional"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FileDropField label="Contract CSV" file={contractFile} onChange={setContractFile} />
            <FileDropField label="Invoice CSV" file={invoiceFile} onChange={setInvoiceFile} />
          </div>

          {error && <ErrorBanner message={error} />}

          <RunAuditButton onClick={handleRunAudit} loading={running} label="Run Audit" />
        </Panel>
      )}

      {view === 'history' && (
        <Panel className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-ink-primary">
            <History className="h-4 w-4 text-accent-brass-400" />
            <span>My Audits</span>
          </div>
          {historyLoading && <p className="text-xs text-ink-muted">Loading past audits…</p>}
          {historyError && <ErrorBanner message={historyError} />}
          {!historyLoading && history && history.length === 0 && (
            <p className="text-xs text-ink-muted">No audits yet — run your first one from "New Audit".</p>
          )}
          {!historyLoading && history && history.length > 0 && (
            <div className="divide-y divide-hairline">
              {history.map((saved) => (
                <button
                  key={saved.docId}
                  type="button"
                  onClick={() => openSavedAudit(saved)}
                  className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-surface-0/60 rounded-lg px-2 -mx-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink-primary truncate">{USE_CASE_LABELS[saved.result.useCase]}</p>
                    <p className="text-[11px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {saved.result.createdAt ? new Date(saved.result.createdAt).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-accent-brass-400">{formatCurrency(saved.result.totalRecoverable)}</p>
                    <p className="text-[11px] text-ink-muted">{saved.result.findings.length} findings</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>
      )}

      {view === 'results' && result && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <StatTile icon={DollarSign} label="Potentially Recoverable" value={formatCurrency(result.totalRecoverable)} />
            <StatTile icon={ListChecks} label="Findings" value={result.findings.length} />
            <StatTile
              icon={AlertOctagon}
              label="Dispute-Grade"
              value={result.findings.filter((f) => f.severity === 'DISPUTE').length}
              hint={result.findings.some((f) => f.severity === 'DISPUTE') ? 'Requires immediate review' : undefined}
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex flex-wrap items-center gap-3">
            <SecondaryButton icon={Download} label="Download Findings CSV" onClick={() => handleDownload('csv')} />
            <SecondaryButton icon={ScrollText} label="Download Dispute Letter" onClick={() => handleDownload('letter')} />
            <SecondaryButton icon={Download} label="Download PDF Report" onClick={handleDownloadPdf} loading={exportingPdf} />
            <SecondaryButton icon={FileOutput} label="Send Report to PDF Studio" onClick={() => onSendReportToPdf(auditResultToDocument(result))} />
          </div>

          <Panel padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-0/60 border-b border-hairline">
                    {['Item Code', 'Description', 'Agreed', 'Billed', 'Variance', 'Severity'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-bold uppercase tracking-wide text-[10px] text-ink-muted whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {result.findings.map((f) => (
                    <tr key={f.id}>
                      <td className="px-4 py-2.5 text-ink-primary whitespace-nowrap">{f.itemCode}</td>
                      <td className="px-4 py-2.5 text-ink-secondary max-w-xs">{f.description}</td>
                      <td className="px-4 py-2.5 text-ink-secondary whitespace-nowrap">{formatCurrency(f.agreedAmount)}</td>
                      <td className="px-4 py-2.5 text-ink-secondary whitespace-nowrap">{formatCurrency(f.billedAmount)}</td>
                      <td className="px-4 py-2.5 font-bold text-ink-primary whitespace-nowrap">{formatCurrency(f.varianceAmount)}</td>
                      <td className="px-4 py-2.5">
                        <Badge tone={SEVERITY_TONE[f.severity]}>{SEVERITY_LABELS[f.severity]}</Badge>
                      </td>
                    </tr>
                  ))}
                  {result.findings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-ink-muted">
                        No variance findings — the invoice matches the contract within tolerance.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Branded report preview — also the source html2canvas captures for the quick "Download PDF Report" export above. */}
          <div className="rounded-2xl overflow-auto border border-hairline bg-surface-0/50 p-4">
            <div ref={reportRef}>
              <ContractAuditReportDocument result={result} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractAuditStudio;
