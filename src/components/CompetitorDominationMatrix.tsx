import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Cpu, 
  Layers, 
  Flame,
  ArrowRight,
  Search,
  RefreshCw,
  Calculator,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Award,
  BarChart3,
  CheckSquare,
  Square,
  FileSpreadsheet
} from 'lucide-react';
import { CompetitorComparison, CustomCompetitorAnalysis } from '../types';

// Data rows below carry a leading emoji token (⚡/❌/⚠️/💎/💸) used purely as a
// machine-checkable prefix for icon-selection (see the `.startsWith(...)` calls
// below) — stripLeadPrefix() removes it for on-screen display only, so the data
// itself and the classification logic stay untouched.
const stripLeadPrefix = (text: string) => text.replace(/^\S+\s+/, '');

const BASE_MATRIX_DATA: CompetitorComparison[] = [
  {
    feature: 'Multi-Platform Sync (7 Networks Simultaneously)',
    viralOS: '⚡ Instant (X, IG, TikTok, FB, Threads, Pinterest, LinkedIn)',
    jasperCopyAI: '❌ Single platform at a time / Manual copy-paste',
    taplioHypefury: '⚠️ X/LinkedIn only (No TikTok/IG/Pinterest)',
    bufferHootsuite: '❌ Scheduling only (No AI viral generation)',
    winner: 'ViralOS',
    category: 'features',
    description: 'Generates algorithm-native content tailored to the unique constraints, character limits, and audience tone of 7 major social networks simultaneously.'
  },
  {
    feature: 'Built-in Gemini 3.6 Visual Graphic & Banner Studio',
    viralOS: '⚡ Native Server-Side Visual Graphic & Banner Engine',
    jasperCopyAI: '⚠️ Extra $20/mo paid add-on module',
    taplioHypefury: '❌ None (Text only)',
    bufferHootsuite: '❌ None (Requires Canva integration)',
    winner: 'ViralOS',
    category: 'ai',
    description: 'Uses Google Gemini 3.6 Flash to render high-converting 1:1, 16:9, and 9:16 viral thumbnails, infographics, and promotional banners in seconds.'
  },
  {
    feature: 'TikTok/Reels Video Teleprompter & Visual Cue Studio',
    viralOS: '⚡ Integrated Frame-by-Frame Recording Cue Studio',
    jasperCopyAI: '❌ None',
    taplioHypefury: '❌ None',
    bufferHootsuite: '❌ None',
    winner: 'ViralOS',
    category: 'video',
    description: 'Provides a live scrolling teleprompter with estimated audio spoken duration, pacing cues, and on-screen graphic instructions for TikTok & Reels creators.'
  },
  {
    feature: 'Cognitive Psychology Hook Generator (10+ Frameworks)',
    viralOS: '⚡ Built-in Pattern Interrupt & Curiosity Gap Engine',
    jasperCopyAI: '⚠️ Generic basic AI templates',
    taplioHypefury: '⚠️ X thread hooks only',
    bufferHootsuite: '❌ None',
    winner: 'ViralOS',
    category: 'ai',
    description: 'Engineered with proven behavioral psychology principles including negative constraint, open loop, loss aversion, and statistical pattern interrupts.'
  },
  {
    feature: '5-Factor Virality Score & Algorithmic Auditor',
    viralOS: '⚡ AI Grade + 3 Rewritten High-Conversion Angles',
    jasperCopyAI: '❌ None (Grammar check only)',
    taplioHypefury: '⚠️ Basic engagement prediction',
    bufferHootsuite: '❌ Basic historical analytics only',
    winner: 'ViralOS',
    category: 'ai',
    description: 'Audits post drafts before publishing against 5 viral factors: Hook Strength, Emotional Intensity, Skimmability, CTA Velocity, and Retention Duration.'
  },
  {
    feature: 'White-Label Agency Client Pitch & Proposal Deck',
    viralOS: '⚡ Built-in $5k/mo Client Audit Deck Generator + E-Signatures',
    jasperCopyAI: '❌ Enterprise plan required ($150+/mo)',
    taplioHypefury: '❌ None',
    bufferHootsuite: '❌ None',
    winner: 'ViralOS',
    category: 'agency',
    description: 'Creates fully customized white-label growth audit proposals, 90-day roadmaps, multi-tier pricing, and digital signature capabilities to close high-ticket retainers.'
  },
  {
    feature: 'Master System Instruction Blueprint (Meta-Architect)',
    viralOS: '⚡ Enterprise Copy-and-Paste LLM System Prompt',
    jasperCopyAI: '❌ Locked proprietary prompts',
    taplioHypefury: '❌ None',
    bufferHootsuite: '❌ None',
    winner: 'ViralOS',
    category: 'agency',
    description: 'Unlocks the master system prompt architecture for developers, prompt engineers, and agencies to integrate into custom internal AI workflows.'
  },
  {
    feature: 'Monthly Cost / Margins for Creators & Agencies',
    viralOS: '💎 Included All-in-One Suite (Save $300-$500/mo)',
    jasperCopyAI: '💸 $49–$149/user/month',
    taplioHypefury: '💸 $65–$149/user/month',
    bufferHootsuite: '💸 $120–$300+/month',
    winner: 'ViralOS',
    category: 'pricing',
    description: 'Consolidates 5 fragmented SaaS subscriptions into 1 cohesive stack, maximizing agency profit margins and eliminating redundant software overhead.'
  }
];

const STACK_TOOL_ITEMS = [
  { id: 'ai-copy', name: 'AI Copywriter (Jasper / Copy.ai)', cost: 65, category: 'AI Copy' },
  { id: 'scheduler', name: 'Social Scheduler (Hootsuite / Sprout / Buffer)', cost: 120, category: 'Scheduling' },
  { id: 'design', name: 'AI Image & Thumbnail Studio (Midjourney / Canva Pro)', cost: 30, category: 'Visuals' },
  { id: 'teleprompter', name: 'Mobile Video Teleprompter App', cost: 15, category: 'Video' },
  { id: 'agency-deck', name: 'White-Label Pitch Proposal Tool', cost: 99, category: 'Agency' },
  { id: 'trend-tool', name: 'Social Listening & Trend Auditor', cost: 75, category: 'Trends' }
];

export const CompetitorDominationMatrix: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'features' | 'video' | 'agency' | 'pricing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  // Custom AI Competitor Analysis State
  const [targetCompetitor, setTargetCompetitor] = useState('');
  const [customAnalysisLoading, setCustomAnalysisLoading] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState<CustomCompetitorAnalysis | null>(null);
  const [customAnalysisError, setCustomAnalysisError] = useState<string | null>(null);

  // Interactive Stack Savings TCO State
  const [selectedStackTools, setSelectedStackTools] = useState<string[]>(['ai-copy', 'scheduler', 'design', 'teleprompter']);

  // Copy / Print State
  const [copiedMatrix, setCopiedMatrix] = useState(false);

  // Toggle stack tool selection
  const toggleStackTool = (id: string) => {
    if (selectedStackTools.includes(id)) {
      setSelectedStackTools(selectedStackTools.filter(item => item !== id));
    } else {
      setSelectedStackTools([...selectedStackTools, id]);
    }
  };

  // Calculate Stack Costs
  const currentMonthlyStackSpend = STACK_TOOL_ITEMS
    .filter(tool => selectedStackTools.includes(tool.id))
    .reduce((sum, tool) => sum + tool.cost, 0);

  const currentAnnualStackSpend = currentMonthlyStackSpend * 12;

  // Filter matrix data
  const filteredMatrix = BASE_MATRIX_DATA.filter(row => {
    const matchesCategory = selectedCategory === 'all' || row.category === selectedCategory;
    const matchesSearch = row.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.viralOS.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Custom AI Teardown Search
  const handleCustomTeardown = async (e?: React.FormEvent, overrideCompetitor?: string) => {
    if (e) e.preventDefault();
    const competitorName = overrideCompetitor || targetCompetitor;
    if (!competitorName.trim()) return;

    setCustomAnalysisLoading(true);
    setCustomAnalysisError(null);

    try {
      const response = await apiFetch('/api/viral/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCompetitor: competitorName,
          industryNiche: 'Social Growth & Content Automation'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI competitor breakdown');
      }

      const data: CustomCompetitorAnalysis = await response.json();
      setCustomAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setCustomAnalysisError(err.message || 'Competitor teardown generation failed.');
    } finally {
      setCustomAnalysisLoading(false);
    }
  };

  // Copy Markdown Report
  const handleCopyMatrix = () => {
    let markdown = `# VIRALOS v10.0 COMPETITIVE PARITY MATRIX\n\n`;
    markdown += `| Core Feature / Capability | ViralOS v10.0 | Jasper / Copy.ai | Taplio / Hypefury | Buffer / Hootsuite |\n`;
    markdown += `| --- | --- | --- | --- | --- |\n`;
    BASE_MATRIX_DATA.forEach(row => {
      markdown += `| **${row.feature}** | ${row.viralOS} | ${row.jasperCopyAI} | ${row.taplioHypefury} | ${row.bufferHootsuite} |\n`;
    });

    navigator.clipboard.writeText(markdown);
    setCopiedMatrix(true);
    setTimeout(() => setCopiedMatrix(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-surface-1 p-6 sm:p-8 rounded-3xl border border-hairline shadow-[var(--shadow-panel-brass)] space-y-6">
        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 bg-accent-brass-500/[0.07] rounded-full blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-brass-500/40 to-transparent" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent-brass-500/10 border border-accent-brass-500/25 text-[11px] font-mono font-bold uppercase tracking-wider text-accent-brass-300 mb-3">
              <Trophy className="h-3.5 w-3.5 text-accent-brass-400" />
              <span>Competitive Parity & Market Domination Benchmark 2026</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-primary tracking-[-0.02em]">
              ViralOS v10.0 vs. The Competition
            </h2>
            <p className="text-sm text-ink-muted mt-2 max-w-3xl leading-[1.7]">
              Compare ViralOS against fragmented legacy SaaS tools. Unify copy, visuals, video teleprompter studio, multi-channel scheduling, and white-label client proposals into 1 autonomous engine.
            </p>
          </div>

          <div className="px-4 py-3 rounded-xl bg-accent-brass-500/10 border border-accent-brass-500/30 text-accent-brass-300 text-xs font-bold flex items-center gap-3 shrink-0 shadow-[var(--shadow-panel-brass)]">
            <Flame className="h-6 w-6 text-accent-brass-400" />
            <div>
              <div className="text-sm font-black text-ink-primary">98/100 Parity Index</div>
              <div className="text-[10px] text-accent-brass-300/80">Replaces $500/mo tool stack</div>
            </div>
          </div>
        </div>

        {/* AI Custom Competitor Teardown Search Bar */}
        <div className="relative bg-surface-0 p-5 rounded-xl border border-hairline space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-brass-400" />
            <span>Generate live AI teardown for any competitor or tool stack</span>
          </label>

          <form onSubmit={(e) => handleCustomTeardown(e)} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                value={targetCompetitor}
                onChange={(e) => setTargetCompetitor(e.target.value)}
                placeholder="e.g. Sprout Social, Metricool, Later, or 'ChatGPT + Canva Pro'"
                className="w-full bg-surface-1 border border-hairline rounded-lg pl-10 pr-4 py-2.5 text-ink-primary text-xs placeholder-ink-muted/70 transition-colors focus:outline-none focus:border-accent-brass-500 focus-visible:ring-2 focus-visible:ring-accent-brass-400/30 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={customAnalysisLoading || !targetCompetitor.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 hover:brightness-105 text-slate-950 font-bold text-xs shrink-0 flex items-center justify-center gap-2 shadow-[var(--shadow-glow-brass)] transition-[filter,transform] disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
            >
              {customAnalysisLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Auditing Competitor…</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Run AI Teardown</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-ink-muted font-bold uppercase">Popular Stack Audits:</span>
            {[
              'Jasper / Copy.ai Stack',
              'Taplio / Hypefury',
              'Hootsuite / Sprout Social',
              'Canva Pro + ChatGPT'
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTargetCompetitor(preset);
                  handleCustomTeardown(undefined, preset);
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-surface-1 border border-hairline text-ink-secondary hover:border-accent-brass-500/50 hover:text-accent-brass-300 transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {customAnalysisError && (
          <div className="relative p-3.5 rounded-lg bg-status-danger-dim border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{customAnalysisError}</span>
          </div>
        )}

        {/* CUSTOM AI TEARDOWN RESULT DRAWER */}
        {customAnalysis && (
          <div className="relative p-6 rounded-2xl bg-surface-0 border border-accent-brass-500/40 space-y-6 shadow-[var(--shadow-panel-brass)] animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-accent-brass-400 tracking-widest block">
                  AI Competitive Teardown Report
                </span>
                <h3 className="font-display text-xl font-semibold text-ink-primary tracking-[-0.01em] flex items-center gap-2">
                  <span>ViralOS v10.0 vs. {customAnalysis.targetCompetitorName}</span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-lg bg-status-positive-dim border border-status-positive/30 text-status-positive text-xs font-mono font-bold">
                  Parity Score: {customAnalysis.overallParityScore}/100
                </div>
                <button
                  onClick={() => setCustomAnalysis(null)}
                  className="text-ink-muted hover:text-ink-primary text-xs underline font-bold transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 rounded px-1"
                >
                  Close Teardown
                </button>
              </div>
            </div>

            <p className="text-xs text-ink-secondary bg-surface-1 p-4 rounded-lg border border-hairline leading-[1.6]">
              {customAnalysis.viralOSAdvantageSummary}
            </p>

            {/* Custom Feature Rows */}
            {customAnalysis.featureRows && customAnalysis.featureRows.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Feature Gap & Capability Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customAnalysis.featureRows.map((row, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-surface-1 border border-hairline space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-primary">{row.featureName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-brass-500/10 text-accent-brass-300 border border-accent-brass-500/20">
                          {row.impactMultiplier}
                        </span>
                      </div>

                      <div className="text-xs text-status-positive font-medium flex items-start gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{row.viralOSCapability}</span>
                      </div>

                      <div className="text-xs text-ink-muted flex items-start gap-1.5">
                        <XCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                        <span>{row.competitorCapability}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rebuttal Battlecards */}
            {customAnalysis.rebuttalBattlecards && customAnalysis.rebuttalBattlecards.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent-brass-400" />
                  <span>Sales Battlecards & Objection Killers</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customAnalysis.rebuttalBattlecards.map((card, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-surface-1 border border-hairline space-y-2 text-xs">
                      <div className="font-bold text-accent-brass-300">Objection: "{card.objection}"</div>
                      <div className="text-ink-secondary leading-[1.6] bg-surface-0 p-3 rounded-md border border-hairline">
                        <strong className="text-status-positive block mb-0.5">Winning Rebuttal</strong>
                        {card.winningRebuttal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3 HIGHLIGHT METRIC CARDS */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-0 border border-hairline space-y-2">
            <div className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              <span>Speed & Automation Multiplier</span>
            </div>
            <div className="text-2xl font-semibold text-ink-primary">10x Faster Execution</div>
            <p className="text-xs text-ink-muted">Generate 7-channel campaigns in 30 seconds vs 3+ hours manually.</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-0 border border-hairline space-y-2">
            <div className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              <span>Multi-Model AI Synergy</span>
            </div>
            <div className="text-2xl font-semibold text-ink-primary">Gemini 3.6 Flash Engine</div>
            <p className="text-xs text-ink-muted">Combines text, visual banners, video teleprompters, and viral scoring.</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-0 border border-hairline space-y-2">
            <div className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>Software Stack Consolidation</span>
            </div>
            <div className="text-2xl font-semibold text-ink-primary">$4,100+/yr Savings</div>
            <p className="text-xs text-ink-muted">Replaces Jasper, Hootsuite, Canva, and Teleprompter subscriptions.</p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STACK COST SAVINGS CALCULATOR (TCO) */}
      <div className="bg-surface-1 rounded-2xl border border-hairline p-6 sm:p-8 shadow-[var(--shadow-panel)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-accent-brass-400 uppercase tracking-wider mb-1">
              <Calculator className="h-4 w-4" />
              <span>Total Cost of Ownership (TCO) Calculator</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary tracking-[-0.01em]">How much are fragmented SaaS tools costing you?</h3>
          </div>

          <div className="px-4 py-2 rounded-lg bg-accent-brass-500/10 border border-accent-brass-500/30 text-accent-brass-300 font-mono text-sm font-bold shrink-0">
            Current Spend: ${currentMonthlyStackSpend}/mo (${currentAnnualStackSpend.toLocaleString()}/yr)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STACK_TOOL_ITEMS.map((tool) => {
            const isSelected = selectedStackTools.includes(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleStackTool(tool.id)}
                aria-pressed={isSelected}
                className={`p-4 rounded-xl border text-left transition-colors flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
                  isSelected
                    ? 'bg-surface-0 border-accent-brass-500/80 ring-1 ring-accent-brass-500/50 shadow-[var(--shadow-panel-brass)]'
                    : 'bg-surface-0/60 border-hairline opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-accent-brass-400 shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-ink-muted shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-ink-primary">{tool.name}</div>
                    <div className="text-[10px] text-ink-muted">{tool.category} Tool</div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-status-danger bg-status-danger-dim px-2 py-1 rounded border border-status-danger/40 shrink-0">
                  ${tool.cost}/mo
                </span>
              </button>
            );
          })}
        </div>

        {/* Savings Metric Box */}
        <div className="p-5 rounded-xl bg-status-positive-dim border border-status-positive/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase text-status-positive tracking-wider">
              Your Potential Annual Margin Boost with ViralOS
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-ink-primary font-mono tabular-nums">
              Save ${currentAnnualStackSpend.toLocaleString()} / year in software subscriptions
            </div>
          </div>

          <button
            onClick={handleCopyMatrix}
            className="px-5 py-3 rounded-lg bg-status-positive hover:brightness-105 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[var(--shadow-panel)] transition-[filter] shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-positive focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
          >
            {copiedMatrix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedMatrix ? 'Report Copied!' : 'Copy Benchmark Matrix'}</span>
          </button>
        </div>
      </div>

      {/* COMPREHENSIVE PARITY COMPARISON TABLE */}
      <div className="bg-surface-1 rounded-2xl border border-hairline p-6 shadow-[var(--shadow-panel)] space-y-6">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Capabilities' },
              { id: 'ai', label: 'AI & Psychology' },
              { id: 'features', label: 'Multi-Channel' },
              { id: 'video', label: 'Video & Visuals' },
              { id: 'agency', label: 'Agency Pitch' },
              { id: 'pricing', label: 'Pricing & TCO' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                aria-pressed={selectedCategory === tab.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
                  selectedCategory === tab.id
                    ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]'
                    : 'bg-surface-0 border border-hairline text-ink-muted hover:bg-surface-2 hover:text-ink-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter feature capability…"
              className="w-full bg-surface-0 border border-hairline rounded-lg pl-9 pr-3 py-2 text-ink-primary text-xs placeholder-ink-muted/70 transition-colors focus:outline-none focus:border-accent-brass-500 focus-visible:ring-2 focus-visible:ring-accent-brass-400/30"
            />
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline text-ink-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-bold">Core Feature / Capability</th>
                <th className="py-3 px-4 font-bold text-accent-brass-300 bg-accent-brass-500/10 border-x border-accent-brass-500/20 text-center">
                  <span className="inline-flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    ViralOS v10.0 (Winner)
                  </span>
                </th>
                <th className="py-3 px-4 font-bold text-ink-secondary">Jasper / Copy.ai</th>
                <th className="py-3 px-4 font-bold text-ink-secondary">Taplio / Hypefury</th>
                <th className="py-3 px-4 font-bold text-ink-secondary">Buffer / Hootsuite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline font-medium">
              {filteredMatrix.map((row, idx) => {
                const isExpanded = expandedRowIndex === idx;
                return (
                  <React.Fragment key={idx}>
                    <tr
                      onClick={() => setExpandedRowIndex(isExpanded ? null : idx)}
                      className="hover:bg-surface-2/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 text-ink-secondary font-bold max-w-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span>{row.feature}</span>
                          <span className="text-ink-muted group-hover:text-accent-brass-400 transition-colors">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-accent-brass-300 bg-accent-brass-500/5 border-x border-accent-brass-500/20">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-status-positive shrink-0 mt-0.5" />
                          <span>{stripLeadPrefix(row.viralOS)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-ink-muted">
                        <div className="flex items-start gap-1.5">
                          {row.jasperCopyAI.startsWith('❌') ? (
                            <XCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-accent-brass-400 shrink-0 mt-0.5" />
                          )}
                          <span>{stripLeadPrefix(row.jasperCopyAI)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-ink-muted">
                        <div className="flex items-start gap-1.5">
                          {row.taplioHypefury.startsWith('❌') ? (
                            <XCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-accent-brass-400 shrink-0 mt-0.5" />
                          )}
                          <span>{stripLeadPrefix(row.taplioHypefury)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-ink-muted">
                        <div className="flex items-start gap-1.5">
                          {row.bufferHootsuite.startsWith('❌') ? (
                            <XCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-accent-brass-400 shrink-0 mt-0.5" />
                          )}
                          <span>{stripLeadPrefix(row.bufferHootsuite)}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Drawer */}
                    {isExpanded && row.description && (
                      <tr className="bg-surface-0/80">
                        <td colSpan={5} className="p-4 text-xs text-ink-secondary border-y border-accent-brass-500/30">
                          <div className="flex items-start gap-3 bg-surface-1 p-3.5 rounded-lg border border-hairline">
                            <Sparkles className="h-5 w-5 text-accent-brass-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-ink-primary block font-bold mb-1">Deep-Dive Workflow Advantage</strong>
                              <p className="text-ink-secondary leading-[1.6]">{row.description}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
