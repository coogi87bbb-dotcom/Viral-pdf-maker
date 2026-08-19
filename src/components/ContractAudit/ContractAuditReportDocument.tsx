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
import type { AuditFinding, AuditResult, AuditSeverity } from './types';
import { SEVERITY_LABELS, USE_CASE_LABELS } from './types';
import { formatCurrency } from './shared';
import type { DocumentData, DocSection, CalloutBox } from '../../types';

const NAVY = '#0f172a';
const LEDGER_GREEN = '#1f5f4a';
const SLATE_700 = '#334155';
const SLATE_500 = '#64748b';
const SLATE_300 = '#cbd5e1';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';

const SEVERITY_COLOR: Record<AuditSeverity, { bg: string; text: string }> = {
  critical: { bg: '#7f1d1d', text: '#ffffff' },
  high: { bg: '#b45309', text: '#ffffff' },
  medium: { bg: '#a16207', text: '#ffffff' },
  low: { bg: '#475569', text: '#ffffff' },
  info: { bg: '#1e40af', text: '#ffffff' },
};

function severityCalloutType(critical: number, high: number): CalloutBox['type'] {
  if (critical > 0) return 'warning';
  if (high > 0) return 'tip';
  return 'key-takeaway';
}

// Maps the fetched AuditResult into PDF Studio's generic DocumentData/
// DocSection model (same approach as DealCloser's dealDeckDataToDocument)
// so it can flow through the standard PdfCanvas + STUDIO_THEMES export
// pipeline for further editing/theming — entirely client-side, no re-call
// to the Python service needed, so a saved "My Audits" record can
// regenerate this anytime.
export function auditResultToDocument(result: AuditResult): DocumentData {
  const { summary, findings } = result;
  const critical = summary.findingCounts.critical || 0;
  const high = summary.findingCounts.high || 0;

  const sections: DocSection[] = [
    {
      id: 'audit-1',
      chapterNumber: 1,
      title: 'Executive Summary',
      paragraphs: [
        `This audit compared the submitted contract against the submitted invoice under the ${USE_CASE_LABELS[result.useCase]} use case${
          result.jurisdiction ? ` (${result.jurisdiction} jurisdiction)` : ''
        }, identifying ${findings.length} finding${findings.length === 1 ? '' : 's'} totaling ${formatCurrency(
          summary.totalVariance
        )} in variance.`,
      ],
      callout: {
        type: severityCalloutType(critical, high),
        title: `${formatCurrency(summary.totalVariance)} in Total Variance`,
        content: `${critical} critical, ${high} high, ${summary.findingCounts.medium || 0} medium, ${
          summary.findingCounts.low || 0
        } low, ${summary.findingCounts.info || 0} informational finding(s).`,
      },
    },
    {
      id: 'audit-2',
      chapterNumber: 2,
      title: 'Findings',
      paragraphs: [],
      tableData: {
        headers: ['Clause', 'Description', 'Contract', 'Invoice', 'Variance', 'Severity'],
        rows: findings.map((f) => [
          f.clause,
          f.description,
          formatCurrency(f.contractAmount),
          formatCurrency(f.invoiceAmount),
          formatCurrency(f.variance),
          SEVERITY_LABELS[f.severity],
        ]),
      },
    },
    {
      id: 'audit-3',
      chapterNumber: 3,
      title: 'Recommendations',
      paragraphs: findings.filter((f) => f.recommendation).length
        ? findings.filter((f) => f.recommendation).map((f) => `${f.clause}: ${f.recommendation}`)
        : ['No specific recommendations were generated for this audit.'],
    },
  ];

  return {
    title: `Contract Audit Report — ${USE_CASE_LABELS[result.useCase]}`,
    subtitle: `Audit ${result.auditId}${result.jurisdiction ? ` · ${result.jurisdiction}` : ''}`,
    author: 'Contract Audit — Variance Detection',
    category: 'Financial Audit Report',
    keyTakeaways: [
      `${formatCurrency(summary.totalVariance)} in total variance identified`,
      `${findings.length} finding${findings.length === 1 ? '' : 's'} across ${USE_CASE_LABELS[result.useCase]}`,
      critical > 0 ? `${critical} critical finding${critical === 1 ? '' : 's'} require immediate review` : 'No critical findings',
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

const SeverityPill: React.FC<{ severity: AuditSeverity }> = ({ severity }) => {
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

const FindingsTable: React.FC<{ findings: AuditFinding[] }> = ({ findings }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0 22px', fontSize: '9.5pt' }}>
    <thead>
      <tr>
        {['Clause', 'Description', 'Contract', 'Invoice', 'Variance', 'Severity'].map((h) => (
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
          <td style={cellStyle(i)}>{f.clause}</td>
          <td style={cellStyle(i)}>{f.description}</td>
          <td style={cellStyle(i)}>{formatCurrency(f.contractAmount)}</td>
          <td style={cellStyle(i)}>{formatCurrency(f.invoiceAmount)}</td>
          <td style={{ ...cellStyle(i), fontWeight: 700, color: f.variance && f.variance > 0 ? '#7f1d1d' : NAVY }}>
            {formatCurrency(f.variance)}
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
const SeverityBars: React.FC<{ counts: Record<AuditSeverity, number> }> = ({ counts }) => {
  const order: AuditSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const max = Math.max(1, ...order.map((s) => counts[s] || 0));
  return (
    <div style={{ margin: '8px 0 22px' }}>
      {order.map((sev) => {
        const n = counts[sev] || 0;
        const pct = Math.round((n / max) * 100);
        const c = SEVERITY_COLOR[sev];
        return (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '5px 0' }}>
            <span style={{ width: 70, fontSize: '9pt', color: SLATE_700, flexShrink: 0 }}>{SEVERITY_LABELS[sev]}</span>
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
  const { summary, findings } = result;

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
            Total Variance
          </p>
          <p style={{ margin: 0, fontSize: '18pt', fontWeight: 700, color: NAVY }}>{formatCurrency(summary.totalVariance)}</p>
        </div>
        <div style={{ flex: 1, border: `1px solid ${SLATE_300}`, borderRadius: 4, padding: '14px 16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.05em', color: SLATE_500 }}>
            Findings
          </p>
          <p style={{ margin: 0, fontSize: '18pt', fontWeight: 700, color: NAVY }}>{findings.length}</p>
        </div>
      </div>
      <SeverityBars counts={summary.findingCounts} />

      <SectionHeading>Findings Detail</SectionHeading>
      <FindingsTable findings={findings} />

      <SectionHeading>Recommendations</SectionHeading>
      {findings.filter((f) => f.recommendation).length > 0 ? (
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          {findings
            .filter((f) => f.recommendation)
            .map((f) => (
              <li key={f.id} style={{ margin: '4px 0', color: SLATE_700, fontSize: '10pt' }}>
                <strong style={{ color: NAVY }}>{f.clause}:</strong> {f.recommendation}
              </li>
            ))}
        </ul>
      ) : (
        <p style={{ margin: '8px 0', fontSize: '10pt', color: SLATE_700 }}>No specific recommendations were generated for this audit.</p>
      )}

      <p style={{ marginTop: 34, paddingTop: 12, borderTop: `1px solid ${SLATE_300}`, fontSize: '8.5pt', color: SLATE_500, fontStyle: 'italic' }}>
        Automated variance detection — not legal or financial advice. Verify findings before disputing charges.
      </p>
    </div>
  );
};

export default ContractAuditReportDocument;
