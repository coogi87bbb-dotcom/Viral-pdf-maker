// The exportable "Contract Audit Report" — mirrors DealDeckDocument.tsx's
// pattern: it keeps its own formal "Institutional / Ledger" identity
// (independent of the app's brass Studio OS chrome) since a financial-audit
// deliverable reads as more credible in a formal register than the
// product's own brand colors, and exports via the app's existing jsPDF +
// html2canvas pipeline (exportPdfFromRef, reused unmodified from
// src/utils/pdfExport.ts). Hex colours only throughout (never oklch()/
// color-mix()) per CLAUDE.md's html2canvas colour-safety rule.
//
// Renders as ONE tall .pdf-page div rather than paginating content across
// fixed-height Letter pages, for the same reason DealDeckDocument.tsx does:
// html2canvas has no text-reflow/pagination model, so a single
// correctly-sized page (exportPdfFromRef measures the div's real rendered
// height) is safer than risking clipped content on a rigid multi-page split.
import React from 'react';
import type { AuditResult, Severity, VarianceFinding } from './types';
import { SEVERITY_LABELS, USE_CASE_LABELS } from './types';
import { formatCurrency } from './engine/decimalUtils';
import type { DocumentData, DocSection, CalloutBox } from '../../types';

const NAVY = '#0f172a';
const LEDGER_GREEN = '#1f5f4a';
const SLATE_700 = '#334155';
const SLATE_500 = '#64748b';
const SLATE_300 = '#cbd5e1';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';

// Ordered most- to least-severe — drives both the bars and the "worst
// finding wins" callout-type selection below.
const SEVERITY_ORDER: Severity[] = ['DISPUTE', 'REVIEW', 'WITHIN_TOLERANCE'];

const SEVERITY_COLOR: Record<Severity, { bg: string; text: string }> = {
  DISPUTE: { bg: '#7f1d1d', text: '#ffffff' },
  REVIEW: { bg: '#b45309', text: '#ffffff' },
  WITHIN_TOLERANCE: { bg: LEDGER_GREEN, text: '#ffffff' },
};

function severityCalloutType(disputeCount: number, reviewCount: number): CalloutBox['type'] {
  if (disputeCount > 0) return 'warning';
  if (reviewCount > 0) return 'tip';
  return 'key-takeaway';
}

function countBySeverity(findings: VarianceFinding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { WITHIN_TOLERANCE: 0, REVIEW: 0, DISPUTE: 0 };
  for (const f of findings) counts[f.severity] += 1;
  return counts;
}

// Maps the client-computed AuditResult into PDF Studio's generic
// DocumentData/DocSection model (same approach as DealCloser's
// dealDeckDataToDocument) so it can flow through the standard PdfCanvas +
// STUDIO_THEMES export pipeline for further editing/theming.
export function auditResultToDocument(result: AuditResult): DocumentData {
  const { findings } = result;
  const counts = countBySeverity(findings);

  const sections: DocSection[] = [
    {
      id: 'audit-1',
      chapterNumber: 1,
      title: 'Executive Summary',
      paragraphs: [
        `This audit compared the submitted contract against the submitted invoice under the ${USE_CASE_LABELS[result.useCase]} use case${
          result.jurisdiction ? ` (${result.jurisdiction} jurisdiction)` : ''
        }, identifying ${findings.length} finding${findings.length === 1 ? '' : 's'} with ${formatCurrency(
          result.totalRecoverable
        )} potentially recoverable.`,
      ],
      callout: {
        type: severityCalloutType(counts.DISPUTE, counts.REVIEW),
        title: `${formatCurrency(result.totalRecoverable)} Potentially Recoverable`,
        content: `${counts.DISPUTE} dispute-grade, ${counts.REVIEW} review, ${counts.WITHIN_TOLERANCE} within tolerance.`,
      },
    },
    {
      id: 'audit-2',
      chapterNumber: 2,
      title: 'Findings',
      paragraphs: [],
      tableData: {
        headers: ['Item Code', 'Description', 'Agreed', 'Billed', 'Variance', 'Severity'],
        rows: findings.map((f) => [
          f.itemCode,
          f.description,
          formatCurrency(f.agreedAmount),
          formatCurrency(f.billedAmount),
          formatCurrency(f.varianceAmount),
          SEVERITY_LABELS[f.severity],
        ]),
      },
    },
    {
      id: 'audit-3',
      chapterNumber: 3,
      title: 'Dispute-Grade Findings',
      paragraphs: counts.DISPUTE
        ? findings.filter((f) => f.severity === 'DISPUTE').map((f) => `${f.itemCode}: ${f.explanation}`)
        : ['No dispute-grade findings were identified in this audit.'],
    },
  ];

  return {
    title: `Contract Audit Report — ${USE_CASE_LABELS[result.useCase]}`,
    subtitle: `Audit ${result.auditId}${result.jurisdiction ? ` · ${result.jurisdiction}` : ''}`,
    author: 'Contract Audit — Variance Detection',
    category: 'Financial Audit Report',
    keyTakeaways: [
      `${formatCurrency(result.totalRecoverable)} potentially recoverable`,
      `${findings.length} finding${findings.length === 1 ? '' : 's'} across ${USE_CASE_LABELS[result.useCase]}`,
      counts.DISPUTE > 0 ? `${counts.DISPUTE} dispute-grade finding${counts.DISPUTE === 1 ? '' : 's'} require immediate review` : 'No dispute-grade findings',
    ],
    sections,
    callToAction: {
      headline: 'Ready to dispute these findings?',
      subhead: 'Download the generated dispute letter or share this report with your finance/legal team.',
      buttonText: 'Review Findings',
      websiteOrHandle: result.auditId,
    },
    suggestedCoverStyle: 'minimalist',
  };
}

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2
    style={{
      fontFamily: 'Georgia, "Noto Serif", serif',
      fontSize: '13.5pt',
      fontWeight: 700,
      color: NAVY,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      borderBottom: `1px solid ${SLATE_300}`,
      paddingBottom: 6,
      marginTop: 30,
      marginBottom: 12,
    }}
  >
    {children}
  </h2>
);

const SeverityPill: React.FC<{ severity: Severity }> = ({ severity }) => {
  const c = SEVERITY_COLOR[severity];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 3,
        background: c.bg,
        color: c.text,
        fontSize: '8.5pt',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
};

function cellStyle(i: number): React.CSSProperties {
  return { textAlign: 'left', padding: '8px 10px', border: '1px solid #d1d5db', verticalAlign: 'top', background: i % 2 === 1 ? SLATE_50 : 'transparent' };
}

const FindingsTable: React.FC<{ findings: VarianceFinding[] }> = ({ findings }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0 22px', fontSize: '9.5pt' }}>
    <thead>
      <tr>
        {['Item Code', 'Description', 'Agreed', 'Billed', 'Variance', 'Severity'].map((h) => (
          <th
            key={h}
            style={{
              textAlign: 'left',
              padding: '8px 10px',
              border: '1px solid #d1d5db',
              background: NAVY,
              color: '#ffffff',
              fontWeight: 600,
              borderBottom: `2px solid ${LEDGER_GREEN}`,
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {findings.map((f, i) => (
        <tr key={f.id}>
          <td style={cellStyle(i)}>{f.itemCode}</td>
          <td style={cellStyle(i)}>{f.description}</td>
          <td style={cellStyle(i)}>{formatCurrency(f.agreedAmount)}</td>
          <td style={cellStyle(i)}>{formatCurrency(f.billedAmount)}</td>
          <td style={{ ...cellStyle(i), fontWeight: 700, color: f.varianceAmount.gt(0) ? '#7f1d1d' : NAVY }}>
            {formatCurrency(f.varianceAmount)}
          </td>
          <td style={cellStyle(i)}>
            <SeverityPill severity={f.severity} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Pure-CSS severity distribution bars — deliberately not a Chart.js canvas:
// html2canvas captures already-painted DOM, and a canvas chart's async draw
// (Chart.js paints on a rAF tick after mount) risks a blank capture if
// export fires before the first paint. Proportional-width <div> bars are
// synchronously painted DOM, so there's no timing race to manage.
const SeverityBars: React.FC<{ counts: Record<Severity, number> }> = ({ counts }) => {
  const max = Math.max(1, ...SEVERITY_ORDER.map((s) => counts[s] || 0));
  return (
    <div style={{ margin: '8px 0 22px' }}>
      {SEVERITY_ORDER.map((sev) => {
        const n = counts[sev] || 0;
        const pct = Math.round((n / max) * 100);
        const c = SEVERITY_COLOR[sev];
        return (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '5px 0' }}>
            <span style={{ width: 110, fontSize: '9pt', color: SLATE_700, flexShrink: 0 }}>{SEVERITY_LABELS[sev]}</span>
            <div style={{ flex: 1, height: 12, background: SLATE_200, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: c.bg }} />
            </div>
            <span style={{ width: 24, fontSize: '9pt', color: NAVY, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{n}</span>
          </div>
        );
      })}
    </div>
  );
};

export const ContractAuditReportDocument: React.FC<{ result: AuditResult }> = ({ result }) => {
  const { findings } = result;
  const counts = countBySeverity(findings);
  const disputeFindings = findings.filter((f) => f.severity === 'DISPUTE');

  return (
    <div
      className="pdf-page"
      style={{
        width: '816px', // 8.5in @ 96dpi
        background: '#ffffff',
        color: '#1e293b',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '11pt',
        lineHeight: 1.6,
        padding: '0.75in 0.75in 0.9in',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ overflow: 'hidden', borderBottom: `1px solid ${LEDGER_GREEN}`, paddingBottom: 8, marginBottom: 28 }}>
        <span
          style={{
            float: 'left',
            fontFamily: 'Georgia, "Noto Serif", serif',
            fontSize: '9.5pt',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: NAVY,
          }}
        >
          Contract Audit
        </span>
        <span
          style={{
            float: 'right',
            fontFamily: 'Georgia, "Noto Serif", serif',
            fontSize: '8.5pt',
            fontStyle: 'italic',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: SLATE_500,
          }}
        >
          Confidential
        </span>
      </div>

      <h1
        style={{
          fontFamily: 'Georgia, "Noto Serif", serif',
          fontSize: '22pt',
          fontWeight: 700,
          color: NAVY,
          borderBottom: `3px solid ${LEDGER_GREEN}`,
          paddingBottom: 10,
          margin: '0 0 18px',
          letterSpacing: '-0.01em',
        }}
      >
        Contract Audit Report
      </h1>

      <div style={{ padding: '11px 16px', margin: '0 0 8px', borderRadius: 2, background: NAVY }}>
        <p style={{ margin: 0, color: '#ffffff', fontSize: '10.5pt', lineHeight: 1.5, fontWeight: 700 }}>
          {USE_CASE_LABELS[result.useCase]}
          {result.jurisdiction ? ` · ${result.jurisdiction}` : ''}
        </p>
      </div>
      <div style={{ fontSize: '9.5pt', color: SLATE_500, margin: '0 0 22px' }}>
        <p style={{ margin: 0 }}>Audit ID: {result.auditId}</p>
      </div>

      <SectionHeading>Executive Summary</SectionHeading>
      <div style={{ display: 'flex', gap: 16, margin: '8px 0 18px' }}>
        <div style={{ flex: 1, border: `1px solid ${SLATE_300}`, borderRadius: 4, padding: '14px 16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.05em', color: SLATE_500 }}>
            Total Agreed
          </p>
          <p style={{ margin: 0, fontSize: '16pt', fontWeight: 700, color: NAVY }}>{formatCurrency(result.totalAgreed)}</p>
        </div>
        <div style={{ flex: 1, border: `1px solid ${SLATE_300}`, borderRadius: 4, padding: '14px 16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.05em', color: SLATE_500 }}>
            Total Billed
          </p>
          <p style={{ margin: 0, fontSize: '16pt', fontWeight: 700, color: NAVY }}>{formatCurrency(result.totalBilled)}</p>
        </div>
        <div style={{ flex: 1, border: `1px solid ${SLATE_300}`, borderRadius: 4, padding: '14px 16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.05em', color: SLATE_500 }}>
            Potentially Recoverable
          </p>
          <p style={{ margin: 0, fontSize: '16pt', fontWeight: 700, color: '#7f1d1d' }}>{formatCurrency(result.totalRecoverable)}</p>
        </div>
      </div>
      <SeverityBars counts={counts} />

      <SectionHeading>Findings Detail</SectionHeading>
      <FindingsTable findings={findings} />

      <SectionHeading>Dispute-Grade Findings</SectionHeading>
      {disputeFindings.length > 0 ? (
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          {disputeFindings.map((f) => (
            <li key={f.id} style={{ margin: '4px 0', color: SLATE_700, fontSize: '10pt' }}>
              <strong style={{ color: NAVY }}>{f.itemCode}:</strong> {f.explanation}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: '8px 0', fontSize: '10pt', color: SLATE_700 }}>No dispute-grade findings were identified in this audit.</p>
      )}

      {(result.unmatchedContractItems.length > 0 || result.parseErrors.length > 0) && (
        <>
          <SectionHeading>Data Notes</SectionHeading>
          {result.unmatchedContractItems.length > 0 && (
            <p style={{ margin: '8px 0', fontSize: '10pt', color: SLATE_700 }}>
              {result.unmatchedContractItems.length} contract line item{result.unmatchedContractItems.length === 1 ? '' : 's'} had no matching
              invoice line and could not be evaluated for variance:{' '}
              {result.unmatchedContractItems.map((c) => c.itemCode || c.description).join(', ')}.
            </p>
          )}
          {result.parseErrors.length > 0 && (
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              {result.parseErrors.map((err, i) => (
                <li key={i} style={{ margin: '2px 0', color: SLATE_500, fontSize: '9pt' }}>
                  {err}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p style={{ marginTop: 34, paddingTop: 12, borderTop: `1px solid ${SLATE_300}`, fontSize: '8.5pt', color: SLATE_500, fontStyle: 'italic' }}>
        Automated variance detection — not legal or financial advice. Verify findings before disputing charges.
      </p>
    </div>
  );
};

export default ContractAuditReportDocument;
