// Deal Closer shell — ported from thedealcloserai (github.com/coogi87bbb-dotcom/thedealcloserai).
// Full-fidelity React rewrite of the source app's 7 real-estate tools,
// restyled to this app's rose-gold Studio OS design system and wired to
// this app's existing auth (no separate VIP paywall — reaching this tab
// already means the user is signed into Studio OS) and AI proxy
// (/api/ai/deal-closer-generate in server.ts, replacing the source's
// exposed client-side API key). See the plan this was built from for the
// full per-tool field inventory this is checked against.
import React, { useState } from 'react';
import { Crown, Megaphone, Handshake, Mail, Home, Key, CalendarClock, ClipboardCheck } from 'lucide-react';
import { PropertyModeProvider } from './shared';
import type { DealCloserToolId } from './types';
import { CommissionCalculator } from './CommissionCalculator';
import { MarketingCopyGenerator } from './MarketingCopyGenerator';
import { NegotiationScriptGenerator } from './NegotiationScriptGenerator';
import { EmailSequenceGenerator } from './EmailSequenceGenerator';
import { ListingDescriptionGenerator } from './ListingDescriptionGenerator';
import { EventPlanner } from './EventPlanner';
import { TransactionTimeline } from './TransactionTimeline';
import { UnderwritingVerifier } from './UnderwritingVerifier';

const TOOLS: { id: DealCloserToolId; label: string; icon: React.ElementType }[] = [
  { id: 'commission', label: 'Commission Calculator', icon: Crown },
  { id: 'marketing', label: 'Marketing & Strategy', icon: Megaphone },
  { id: 'negotiation', label: 'Offer & Counter-Offer', icon: Handshake },
  { id: 'emailSequence', label: 'Follow-Up Emails', icon: Mail },
  { id: 'listingDescription', label: 'Listing Description', icon: Home },
  { id: 'eventPlanner', label: 'Open House / Tour', icon: Key },
  { id: 'timeline', label: 'Deadline Tracker', icon: CalendarClock },
  { id: 'underwriting', label: 'Underwriting & Verification', icon: ClipboardCheck },
];

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400';

export const DealCloserStudio: React.FC = () => {
  const [activeTool, setActiveTool] = useState<DealCloserToolId>('commission');
  const [mode, setMode] = useState<'residential' | 'commercial'>('residential');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-accent-rosegold-500 via-accent-rosegold-400 to-accent-rosegold-600 p-0.5 shadow-[var(--shadow-glow-rosegold)] flex items-center justify-center border border-accent-rosegold-400/30">
            <div className="h-full w-full bg-surface-0 rounded-[10px] flex items-center justify-center">
              <Handshake className="h-5 w-5 text-accent-rosegold-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em] font-display bg-gradient-to-r from-white via-slate-100 to-accent-rosegold-200 bg-clip-text text-transparent">
              Deal Closer
            </h1>
            <p className="text-xs text-ink-muted">8 AI-powered real-estate tools — commission, marketing, negotiation, listings, underwriting & more.</p>
          </div>
        </div>

        {/* Residential / Commercial mode toggle — global, drives every tool below */}
        <div className="flex items-center bg-surface-0/90 border border-hairline p-1 rounded-xl gap-1 shadow-inner self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setMode('residential')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-[0.98] cursor-pointer ${FOCUS_RING} ${
              mode === 'residential' ? 'bg-accent-rosegold-400 text-slate-950 shadow-[var(--shadow-glow-rosegold)]' : 'text-ink-muted hover:text-ink-primary hover:bg-surface-2'
            }`}
          >
            <span>🏡 Residential</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('commercial')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-[0.98] cursor-pointer ${FOCUS_RING} ${
              mode === 'commercial' ? 'bg-accent-rosegold-400 text-slate-950 shadow-[var(--shadow-glow-rosegold)]' : 'text-ink-muted hover:text-ink-primary hover:bg-surface-2'
            }`}
          >
            <span>🏢 Commercial</span>
          </button>
        </div>
      </div>

      {/* Tool sub-nav */}
      <nav className="flex flex-wrap gap-2 pb-1">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] cursor-pointer ${FOCUS_RING} ${
                isActive
                  ? 'bg-accent-rosegold-500/10 border-2 border-accent-rosegold-500 text-accent-rosegold-300 shadow-md shadow-rosegold-500/10'
                  : 'bg-surface-1 text-ink-muted border border-hairline hover:text-white hover:bg-surface-2'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active tool */}
      <PropertyModeProvider value={mode}>
        <div className="bg-surface-2/50 border border-hairline rounded-2xl p-5">
          {activeTool === 'commission' && <CommissionCalculator />}
          {activeTool === 'marketing' && <MarketingCopyGenerator />}
          {activeTool === 'negotiation' && <NegotiationScriptGenerator />}
          {activeTool === 'emailSequence' && <EmailSequenceGenerator />}
          {activeTool === 'listingDescription' && <ListingDescriptionGenerator />}
          {activeTool === 'eventPlanner' && <EventPlanner />}
          {activeTool === 'timeline' && <TransactionTimeline />}
          {activeTool === 'underwriting' && <UnderwritingVerifier />}
        </div>
      </PropertyModeProvider>
    </div>
  );
};

export default DealCloserStudio;
