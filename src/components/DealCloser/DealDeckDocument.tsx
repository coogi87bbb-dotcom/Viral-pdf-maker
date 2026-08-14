// The exportable "Investor Deal Deck" — a themed report component, ported
// from the standalone underwrittingdealoop tool's PDF pipeline
// (deal-deck.css + letterhead.html + status-banner.lua, originally compiled
// via `pandoc --pdf-engine=wkhtmltopdf`). Neither pandoc nor wkhtmltopdf
// exist in this app's dependency tree, so this renders the same navy+gold
// "Institutional/Banking" visual identity as real DOM, exported via the
// app's existing jsPDF + html2canvas pipeline (exportPdfFromRef, reused
// unmodified from src/utils/pdfExport.ts).
//
// This intentionally keeps its OWN navy/gold identity rather than the app's
// rose-gold Studio OS chrome, mirroring how every other exported document in
// this app (PdfCanvas.tsx's STUDIO_THEMES) already runs its own selected
// theme separate from app chrome — an investor-facing financial document
// reads as more credible in a formal "institutional" register than the
// product's own brand colors. Hex colours only throughout (never oklch()/
// color-mix()) per CLAUDE.md's html2canvas colour-safety rule.
//
// Renders as ONE tall .pdf-page div (fixed Letter width, auto height) rather
// than paginating content across fixed-height Letter pages — html2canvas has
// no text-reflow/pagination model, and the rest of this app's PDF pages are
// pre-split by content authors rather than auto-paginated. A single
// correctly-sized page (exportPdfFromRef measures the div's real rendered
// height) is safer than risking clipped content on a rigid multi-page split.
import React from 'react';
import type { DealStatus } from './underwritingMath';
import { STATUS_COLOR, STATUS_LABEL } from './underwritingMath';
import type { DocumentData, DocSection, CalloutBox } from '../../types';

const NAVY = '#0f172a';
const GOLD = '#9c7a2e';
const SLATE_700 = '#334155';
const SLATE_500 = '#64748b';
const SLATE_300 = '#cbd5e1';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';

export interface DealDeckRow {
  label: string;
  value: string;
}

export interface DealDeckTable {
  headers: string[];
  rows: string[][];
}

export interface DealDeckData {
  address: string;
  propertyTypeLabel: string; // e.g. "Residential", "Commercial — Income", "Commercial — Repositioning"
  status: DealStatus;
  statusMeta: string; // e.g. "Comps: Verified via Google Search research"
  verdictText: string;
  propertySnapshot: DealDeckRow[];
  underwritingCalc: DealDeckTable;
  exitStrategyText: string;
  exitStrategyTable: DealDeckTable;
  compAssumptions: DealDeckRow[];
  verificationGap: { confidence: string; notes: string; flags: string[] };
  sourceDataNotes: string;
  preparedDate: string;
}

// Maps the Deal Deck's own structured data into PDF Studio's generic
// DocumentData/DocSection model, so it can be sent into PDF Studio for
// further editing/theming alongside every other document — deliberately
// NOT round-tripped through parseTextIntoDocument/the AI-enhance raw-text
// pipeline, since this data is already fully structured (tables, stat
// rows, verdict) and flattening it to text first would just lose that
// structure for no benefit.
function statusToCalloutType(status: DealStatus): CalloutBox['type'] {
  if (status === 'REJECTED') return 'warning';
  if (status === 'APPROVED') return 'key-takeaway';
  return 'tip'; // CONDITIONALLY_APPROVED, HOLD
}

function confidenceToCalloutType(confidence: string): CalloutBox['type'] {
  return confidence === 'unverified' ? 'warning' : 'insight';
}

function confidenceToTitle(confidence: string): string {
  if (confidence === 'verified') return 'Verified';
  if (confidence === 'partial') return 'Partially Verified';
  return 'Unverified';
}

export function dealDeckDataToDocument(deal: DealDeckData): DocumentData {
  const sourceNotesParagraphs = deal.verificationGap.flags.length
    ? [deal.sourceDataNotes, ...deal.verificationGap.flags.map((f) => `• ${f}`)]
    : [deal.sourceDataNotes];

  const sections: DocSection[] = [
    {
      id: 'deck-1',
      chapterNumber: 1,
      title: 'Deal Verdict',
      paragraphs: [deal.verdictText],
      callout: {
        type: statusToCalloutType(deal.status),
        title: STATUS_LABEL[deal.status],
        content: deal.statusMeta
      }
    },
    {
      id: 'deck-2',
      chapterNumber: 2,
      title: 'Property Snapshot',
      paragraphs: [],
      bulletCards: deal.propertySnapshot.map((r) => ({ title: r.label, description: r.value }))
    },
    {
      id: 'deck-3',
      chapterNumber: 3,
      title: 'Underwriting Calculation',
      paragraphs: [],
      tableData: deal.underwritingCalc
    },
    {
      id: 'deck-4',
      chapterNumber: 4,
      title: 'Exit Strategy',
      paragraphs: [deal.exitStrategyText],
      tableData: deal.exitStrategyTable
    },
    {
      id: 'deck-5',
      chapterNumber: 5,
      title: 'Comp & Repair Assumptions',
      paragraphs: [],
      bulletCards: deal.compAssumptions.map((r) => ({ title: r.label, description: r.value }))
    },
    {
      id: 'deck-6',
      chapterNumber: 6,
      title: 'Verification & Source Data',
      paragraphs: sourceNotesParagraphs,
      callout: {
        type: confidenceToCalloutType(deal.verificationGap.confidence),
        title: confidenceToTitle(deal.verificationGap.confidence),
        content: deal.verificationGap.notes
      }
    }
  ];

  return {
    title: `Deal Deck — ${deal.address || deal.propertyTypeLabel}`,
    subtitle: `${deal.propertyTypeLabel} · Prepared ${deal.preparedDate}`,
    author: 'Deal Closer — Underwriting & Verification',
    category: 'Investor Deal Deck',
    keyTakeaways: [STATUS_LABEL[deal.status], deal.statusMeta, deal.exitStrategyText],
    sections,
    callToAction: {
      headline: 'Ready to move on this deal?',
      subhead: 'Share this deck with your lender, partner, or investor group.',
      buttonText: 'Contact Agent',
      websiteOrHandle: deal.address
    },
    suggestedCoverStyle: 'minimalist'
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

const SubHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{ fontFamily: 'Georgia, "Noto Serif", serif', fontSize: '12pt', fontWeight: 700, color: SLATE_700, marginTop: 18, marginBottom: 8 }}>
    {children}
  </h3>
);

const DataTable: React.FC<{ table: DealDeckTable }> = ({ table }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0 22px', fontSize: '10pt' }}>
    <thead>
      <tr>
        {table.headers.map((h) => (
          <th
            key={h}
            style={{
              textAlign: 'left',
              padding: '8px 11px',
              border: `1px solid #d1d5db`,
              background: NAVY,
              color: '#ffffff',
              fontWeight: 600,
              borderBottom: `2px solid ${GOLD}`,
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {table.rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td
              key={j}
              style={{
                textAlign: 'left',
                padding: '8px 11px',
                border: '1px solid #d1d5db',
                verticalAlign: 'top',
                background: i % 2 === 1 ? SLATE_50 : 'transparent',
              }}
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const RowList: React.FC<{ rows: DealDeckRow[] }> = ({ rows }) => (
  <div style={{ margin: '8px 0 22px' }}>
    {rows.map((r) => (
      <div
        key={r.label}
        style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 0', borderBottom: `1px solid ${SLATE_200}`, fontSize: '10.5pt' }}
      >
        <span style={{ color: SLATE_500 }}>{r.label}</span>
        <span style={{ color: NAVY, fontWeight: 700 }}>{r.value}</span>
      </div>
    ))}
  </div>
);

export const DealDeckDocument: React.FC<{ deal: DealDeckData }> = ({ deal }) => {
  const colors = STATUS_COLOR[deal.status];

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
      {/* Letterhead — ported from letterhead.html */}
      <div style={{ overflow: 'hidden', borderBottom: `1px solid ${GOLD}`, paddingBottom: 8, marginBottom: 28 }}>
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
          Investor Acquisitions
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
          borderBottom: `3px solid ${GOLD}`,
          paddingBottom: 10,
          margin: '0 0 18px',
          letterSpacing: '-0.01em',
        }}
      >
        Investor Deal Deck: {deal.address}
      </h1>

      {/* Status banner — ported from status-banner.lua's colour/state logic */}
      <div style={{ padding: '11px 16px', margin: '0 0 8px', borderRadius: 2, background: colors.bg }}>
        <p style={{ margin: 0, color: '#ffffff', fontSize: '10.5pt', lineHeight: 1.5, fontWeight: 700 }}>
          Status: {STATUS_LABEL[deal.status]}
        </p>
      </div>
      <div style={{ fontSize: '9.5pt', color: SLATE_500, margin: '0 0 22px' }}>
        <p style={{ margin: 0 }}>{deal.statusMeta} · Prepared {deal.preparedDate}</p>
      </div>

      <SectionHeading>Property Snapshot</SectionHeading>
      <RowList rows={deal.propertySnapshot} />

      <SectionHeading>Underwriting Calculation</SectionHeading>
      <DataTable table={deal.underwritingCalc} />

      <SectionHeading>Deal Assessment</SectionHeading>
      {/* Verdict callout — ported from status-banner.lua's verdict-callout classes */}
      <div style={{ borderLeft: `4px solid ${colors.border}`, background: colors.tint, padding: '12px 16px', margin: '4px 0 22px' }}>
        <p style={{ margin: 0, fontSize: '10.5pt' }}>
          <strong style={{ color: NAVY }}>Verdict:</strong> {deal.verdictText}
        </p>
      </div>

      <SectionHeading>Exit Strategy Analysis</SectionHeading>
      <p style={{ margin: '8px 0', fontSize: '10.5pt' }}>{deal.exitStrategyText}</p>
      <DataTable table={deal.exitStrategyTable} />

      <SectionHeading>Comp &amp; Repair Assumptions</SectionHeading>
      <RowList rows={deal.compAssumptions} />

      <SubHeading>Verification Gap</SubHeading>
      <div style={{ border: `1px solid ${SLATE_300}`, borderRadius: 4, padding: '12px 16px', fontSize: '10pt' }}>
        <p style={{ margin: '0 0 6px' }}>
          <strong style={{ color: NAVY }}>Confidence:</strong> {deal.verificationGap.confidence}
        </p>
        <p style={{ margin: '0 0 8px', color: SLATE_700 }}>{deal.verificationGap.notes}</p>
        {deal.verificationGap.flags.length > 0 && (
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {deal.verificationGap.flags.map((f, i) => (
              <li key={i} style={{ margin: '4px 0', color: SLATE_700, fontSize: '10pt' }}>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      <SectionHeading>Source Data</SectionHeading>
      <p style={{ margin: '8px 0', fontSize: '10pt', color: SLATE_700, whiteSpace: 'pre-wrap' }}>{deal.sourceDataNotes}</p>
    </div>
  );
};

export default DealDeckDocument;
