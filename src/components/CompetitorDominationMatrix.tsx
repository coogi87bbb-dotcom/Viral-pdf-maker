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
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 mb-2">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Competitive Parity & Market Domination Benchmark 2026</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>ViralOS v10.0 vs. The Competition</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black uppercase">
                10x Advantage
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Compare ViralOS against fragmented legacy SaaS tools. Unify copy, visuals, video teleprompter studio, multi-channel scheduling, and white-label client proposals into 1 autonomous engine.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-3 shrink-0 shadow-lg">
            <Flame className="h-6 w-6 text-amber-400 fill-amber-400 animate-pulse" />
            <div>
              <div className="text-sm font-black text-white">98/100 Parity Index</div>
              <div className="text-[10px] text-amber-200/80">Replaces $500/mo tool stack</div>
            </div>
          </div>
        </div>

        {/* AI Custom Competitor Teardown Search Bar */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>Generate Live AI Teardown for ANY Competitor or Tool Stack:</span>
          </label>

          <form onSubmit={(e) => handleCustomTeardown(e)} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={targetCompetitor}
                onChange={(e) => setTargetCompetitor(e.target.value)}
                placeholder="e.g. Sprout Social, Metricool, Later, or 'ChatGPT + Canva Pro'"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={customAnalysisLoading || !targetCompetitor.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700 disabled:opacity-50 active:translate-y-0.5 cursor-pointer"
            >
              {customAnalysisLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Auditing Competitor...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-slate-950" />
                  <span>Run AI Teardown</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Popular Stack Audits:</span>
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
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {customAnalysisError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{customAnalysisError}</span>
          </div>
        )}

        {/* CUSTOM AI TEARDOWN RESULT DRAWER */}
        {customAnalysis && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
                  AI COMPETITIVE TEARDOWN REPORT
                </span>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>ViralOS v10.0 vs. {customAnalysis.targetCompetitorName}</span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  Parity Score: {customAnalysis.overallParityScore}/100
                </div>
                <button
                  onClick={() => setCustomAnalysis(null)}
                  className="text-slate-400 hover:text-white text-xs underline font-bold"
                >
                  Close Teardown
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed font-sans">
              {customAnalysis.viralOSAdvantageSummary}
            </p>

            {/* Custom Feature Rows */}
            {customAnalysis.featureRows && customAnalysis.featureRows.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Feature Gap & Capability Breakdown:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customAnalysis.featureRows.map((row, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white">{row.featureName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {row.impactMultiplier}
                        </span>
                      </div>

                      <div className="text-xs text-emerald-400 font-medium flex items-start gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{row.viralOSCapability}</span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-start gap-1.5">
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
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
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Sales Battlecards & Objection Killers:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customAnalysis.rebuttalBattlecards.map((card, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="font-extrabold text-amber-300">❓ Objection: "{card.objection}"</div>
                      <div className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <strong className="text-emerald-400 block mb-0.5">💡 Winning Rebuttal:</strong>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              <span>Speed & Automation Multiplier</span>
            </div>
            <div className="text-2xl font-black text-white">10x Faster Execution</div>
            <p className="text-xs text-slate-400">Generate 7-channel campaigns in 30 seconds vs 3+ hours manually.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              <span>Multi-Model AI Synergy</span>
            </div>
            <div className="text-2xl font-black text-white">Gemini 3.6 Flash Engine</div>
            <p className="text-xs text-slate-400">Combines text, visual banners, video teleprompters, and viral scoring.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>Software Stack Consolidation</span>
            </div>
            <div className="text-2xl font-black text-white">$4,100+/yr Savings</div>
            <p className="text-xs text-slate-400">Replaces Jasper, Hootsuite, Canva, and Teleprompter subscriptions.</p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STACK COST SAVINGS CALCULATOR (TCO) */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Calculator className="h-4 w-4" />
              <span>Total Cost of Ownership (TCO) Calculator</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">How Much Are Fragmented SaaS Tools Costing You?</h3>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-sm font-bold shrink-0">
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
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-950 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-600 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-extrabold text-white">{tool.name}</div>
                    <div className="text-[10px] text-slate-400">{tool.category} Tool</div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/40 shrink-0">
                  ${tool.cost}/mo
                </span>
              </button>
            );
          })}
        </div>

        {/* Savings Metric Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-amber-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
              YOUR POTENTIAL ANNUAL MARGIN BOOST WITH VIRALOS:
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              Save ${currentAnnualStackSpend.toLocaleString()} / year in software subscriptions!
            </div>
          </div>

          <button
            onClick={handleCopyMatrix}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shrink-0"
          >
            {copiedMatrix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedMatrix ? 'Report Copied!' : 'Copy Benchmark Matrix'}</span>
          </button>
        </div>
      </div>

      {/* COMPREHENSIVE PARITY COMPARISON TABLE */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Capabilities' },
              { id: 'ai', label: '🧠 AI & Psychology' },
              { id: 'features', label: '⚡ Multi-Channel' },
              { id: 'video', label: '🎥 Video & Visuals' },
              { id: 'agency', label: '💼 Agency Pitch' },
              { id: 'pricing', label: '💰 Pricing & TCO' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter feature capability..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-bold">Core Feature / Capability</th>
                <th className="py-3 px-4 font-black text-amber-400 bg-amber-500/10 border-x border-amber-500/20 text-center">
                  🚀 ViralOS v10.0 (Winner)
                </th>
                <th className="py-3 px-4 font-bold text-slate-300">Jasper / Copy.ai</th>
                <th className="py-3 px-4 font-bold text-slate-300">Taplio / Hypefury</th>
                <th className="py-3 px-4 font-bold text-slate-300">Buffer / Hootsuite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredMatrix.map((row, idx) => {
                const isExpanded = expandedRowIndex === idx;
                return (
                  <React.Fragment key={idx}>
                    <tr 
                      onClick={() => setExpandedRowIndex(isExpanded ? null : idx)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 text-slate-200 font-bold max-w-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span>{row.feature}</span>
                          <span className="text-slate-500 group-hover:text-amber-400 transition-colors">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-amber-300 bg-amber-500/5 border-x border-amber-500/20">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{row.viralOS}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        <div className="flex items-start gap-1.5">
                          {row.jasperCopyAI.startsWith('❌') ? (
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <span className="text-amber-500">⚠️</span>
                          )}
                          <span>{row.jasperCopyAI}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        <div className="flex items-start gap-1.5">
                          {row.taplioHypefury.startsWith('❌') ? (
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <span className="text-amber-500">⚠️</span>
                          )}
                          <span>{row.taplioHypefury}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        <div className="flex items-start gap-1.5">
                          {row.bufferHootsuite.startsWith('❌') ? (
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <span className="text-amber-500">⚠️</span>
                          )}
                          <span>{row.bufferHootsuite}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Drawer */}
                    {isExpanded && row.description && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={5} className="p-4 text-xs text-slate-300 border-y border-amber-500/30">
                          <div className="flex items-start gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                            <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white block font-bold mb-1">Deep-Dive Workflow Advantage:</strong>
                              <p className="text-slate-300 leading-relaxed">{row.description}</p>
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
