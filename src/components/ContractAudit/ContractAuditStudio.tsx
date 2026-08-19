// Contract Audit shell — a native Studio OS wrapper around the separately
// deployed High-Ticket-Contract-Financial-Auditing FastAPI service
// (github.com/coogi87bbb-dotcom/High-Ticket-Contract-Financial-Auditing).
// The Decimal-precision variance-detection engine stays in that service;
// this component only collects inputs, calls server.ts's proxy routes
// (/api/contract-audit/*), and renders results/history in this app's brass
// "Modern Grand Hotel" Studio OS design system. Wired to this app's
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
  fileToBase64,
  runContractAudit,
  downloadAuditFile,
  trackContractAuditUsage,
  saveContractAudit,
  listMyContractAudits,
  formatCurrency,
  MAX_UPLOAD_BYTES,
  TextField,
  SelectField,
  ErrorBanner,
  RunAuditButton,
  SecondaryButton,
  FileDropField,
} from './shared';
import { USE_CASE_IDS, USE_CASE_LABELS, SEVERITY_LABELS } from './types';
import type { AuditResult, AuditSeverity, ContractAuditUseCase, SavedAudit } from './types';
import { ContractAuditReportDocument, auditResultToDocument } from './ContractAuditReportDocument';

const SEVERITY_TONE: Record<AuditSeverity, BadgeTone> = {
  critical: 'danger',
  high: 'warning',
  medium: 'warning',
  low: 'neutral',
  info: 'brass',
};

interface ContractAuditStudioProps {
  onSendReportToPdf: (doc: DocumentData) => void;
}

type View = 'form' | 'results' | 'history';

export const ContractAuditStudio: React.FC<ContractAuditStudioProps> = ({ onSendReportToPdf }) => {
  const { user } = useAuth();
  const [view, setView] = useState<View>('form');

  // Form state
  const [useCase, setUseCase] = useState<ContractAuditUseCase>('lease_cam');
  const [jurisdiction, setJurisdiction] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);

  // Results / errors
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [downloadingKind, setDownloadingKind] = useState<'excel' | 'letter' | null>(null);
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
      setError('Choose both a contract file and an invoice file before running the audit.');
      return;
    }
    if (contractFile.size > MAX_UPLOAD_BYTES || invoiceFile.size > MAX_UPLOAD_BYTES) {
      setError('Each file must be 10MB or smaller.');
      return;
    }

    setRunning(true);
    try {
      const [contract, invoice] = await Promise.all([fileToBase64(contractFile), fileToBase64(invoiceFile)]);
      const auditResult = await runContractAudit(useCase, jurisdiction.trim(), contract, invoice);
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

  const handleDownload = async (kind: 'excel' | 'letter') => {
    if (!result) return;
    setError('');
    setDownloadingKind(kind);
    try {
      const ext = kind === 'excel' ? 'xlsx' : 'md';
      await downloadAuditFile(result.auditId, kind, `contract-audit-${result.auditId}.${ext}`);
    } catch (err: any) {
      setError(err?.message || 'Download failed. Please try again.');
    } finally {
      setDownloadingKind(null);
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
    setResult({
      auditId: saved.auditId,
      useCase: saved.useCase,
      jurisdiction: saved.jurisdiction,
      summary: saved.summary,
      findings: saved.findings,
    });
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
              Decimal-precision variance detection — lease/CAM, freight, SaaS, expense, and medical.
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
            <FileDropField label="Contract" file={contractFile} onChange={setContractFile} />
            <FileDropField label="Invoice" file={invoiceFile} onChange={setInvoiceFile} />
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
                    <p className="text-xs font-bold text-ink-primary truncate">{USE_CASE_LABELS[saved.useCase]}</p>
                    <p className="text-[11px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {saved.createdAt ? new Date(saved.createdAt).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-accent-brass-400">{formatCurrency(saved.summary.totalVariance)}</p>
                    <p className="text-[11px] text-ink-muted">{saved.findings.length} findings</p>
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
            <StatTile icon={DollarSign} label="Total Variance" value={formatCurrency(result.summary.totalVariance)} />
            <StatTile icon={ListChecks} label="Findings" value={result.findings.length} />
            <StatTile
              icon={AlertOctagon}
              label="Critical"
              value={result.summary.findingCounts.critical || 0}
              hint={(result.summary.findingCounts.critical || 0) > 0 ? 'Requires immediate review' : undefined}
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex flex-wrap items-center gap-3">
            <SecondaryButton icon={Download} label="Download Excel" onClick={() => handleDownload('excel')} loading={downloadingKind === 'excel'} />
            <SecondaryButton icon={ScrollText} label="Download Dispute Letter" onClick={() => handleDownload('letter')} loading={downloadingKind === 'letter'} />
            <SecondaryButton icon={Download} label="Download PDF Report" onClick={handleDownloadPdf} loading={exportingPdf} />
            <SecondaryButton icon={FileOutput} label="Send Report to PDF Studio" onClick={() => onSendReportToPdf(auditResultToDocument(result))} />
          </div>

          <Panel padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-0/60 border-b border-hairline">
                    {['Clause', 'Description', 'Contract', 'Invoice', 'Variance', 'Severity'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-bold uppercase tracking-wide text-[10px] text-ink-muted whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {result.findings.map((f) => (
                    <tr key={f.id}>
                      <td className="px-4 py-2.5 text-ink-primary whitespace-nowrap">{f.clause}</td>
                      <td className="px-4 py-2.5 text-ink-secondary max-w-xs">{f.description}</td>
                      <td className="px-4 py-2.5 text-ink-secondary whitespace-nowrap">{formatCurrency(f.contractAmount)}</td>
                      <td className="px-4 py-2.5 text-ink-secondary whitespace-nowrap">{formatCurrency(f.invoiceAmount)}</td>
                      <td className="px-4 py-2.5 font-bold text-ink-primary whitespace-nowrap">{formatCurrency(f.variance)}</td>
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
