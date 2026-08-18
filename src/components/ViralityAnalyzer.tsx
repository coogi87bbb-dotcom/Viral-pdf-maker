import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import {
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Gauge,
  ShieldAlert,
  FileText,
  TrendingUp,
  Activity,
  Eye,
  Target,
  Gem,
  Rocket,
  Lightbulb,
  AlertOctagon
} from 'lucide-react';
import { ViralityAnalysisResult } from '../types';

// Preset sample drafts for instant testing
const PRESET_DRAFTS = [
  {
    label: 'Corporate Announcement (Low Virality 38/100)',
    platform: 'X / Twitter',
    text: 'We are super excited to announce that our team has launched a new software update today! Check out our website link below to learn more about our amazing features.'
  },
  {
    label: 'Engagement Bait (High Volatility Risk 52/100)',
    platform: 'X / Twitter',
    text: 'LIKE AND RETWEET THIS POST RIGHT NOW! IF YOU WANT MY FREE 500-PAGE AI EBOOK COMMENT "YES" AND FOLLOW ME OR YOU WILL MISS OUT FOREVER! LINK IN BIO!'
  },
  {
    label: 'Solid Value Thread (Score 72/100)',
    platform: 'LinkedIn Thought Leadership',
    text: 'Most founders spend too much time on cold outreach. Here are 5 ways we used AI to automate lead generation in 2026 without spending money on ads.'
  },
  {
    label: 'Viral Masterclass (Score 94/100)',
    platform: 'X / Twitter',
    text: 'Stop paying $5,000/mo for social media marketing agencies.\n\nYou are burning money.\n\nWe spent 6 months testing 10,000 viral posts across X, LinkedIn, and TikTok.\n\nHere is the exact 3-step AI workflow that replaces a 5-person agency in 12 minutes (full breakdown below):'
  }
];

export const ViralityAnalyzer: React.FC = () => {
  const [contentToAnalyze, setContentToAnalyze] = useState(PRESET_DRAFTS[3].text);
  const [platform, setPlatform] = useState(PRESET_DRAFTS[3].platform);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Analysis result state with rich defaults
  const [analysis, setAnalysis] = useState<ViralityAnalysisResult | null>({
    score: 94,
    grade: 'S',
    volatilityRisk: 'Low Volatility (Safe)',
    readingGrade: 'Grade 6 (Optimal Mobile Viewport)',
    estimatedReadingTimeSec: 14,
    benchmarkPercentile: 98,
    breakdown: {
      hookStrength: 98,
      emotionalResonance: 92,
      clarityAndPacing: 95,
      callToActionPower: 90,
      algorithmicShareability: 96
    },
    retentionCurve: [
      { time: '0s', retention: 100, note: 'Viewport Pattern Interrupt Triggered' },
      { time: '3s', retention: 88, note: '0.5s Hook Hold Point (Pass)' },
      { time: '10s', retention: 78, note: 'Core Value Delivery & Proof' },
      { time: '20s', retention: 70, note: 'Transition to Action' },
      { time: 'End', retention: 64, note: 'High Share / Bookmark Velocity' }
    ],
    sentenceAnalysis: [
      {
        text: 'Stop paying $5,000/mo for social media marketing agencies.',
        type: 'hook',
        score: 98,
        feedback: 'Nuclear pattern interrupt. Direct attack on a major financial pain point.'
      },
      {
        text: 'You are burning money.',
        type: 'hook',
        score: 95,
        feedback: 'Punchy 4-word sentence. Forces cognitive dissonance and scroll stop.'
      },
      {
        text: 'We spent 6 months testing 10,000 viral posts across X, LinkedIn, and TikTok.',
        type: 'value',
        score: 94,
        feedback: 'Establishes high-sample authority and empirical credibility.'
      },
      {
        text: 'Here is the exact 3-step AI workflow that replaces a 5-person agency in 12 minutes:',
        type: 'cta',
        score: 92,
        feedback: 'Strong curiosity gap combined with an immediate speed & efficiency promise.'
      }
    ],
    algorithmCompliance: [
      {
        rule: 'Mobile Viewport Line-Breaks',
        status: 'pass',
        impact: '+35% Dwell Time (Prevents Text Wall Bouncing)'
      },
      {
        rule: 'Outbound Link Suppression Guard',
        status: 'pass',
        impact: 'No outbound links in main body (Avoids 80% algorithmic penalty)'
      },
      {
        rule: 'Spam & All-Caps Detector',
        status: 'pass',
        impact: 'Clean sentence casing avoids shadowban triggers'
      },
      {
        rule: 'Reading Level Complexity Check',
        status: 'pass',
        impact: 'Grade 6 readability ensures zero cognitive friction'
      }
    ],
    keyStrengths: [
      'Masterclass first line pattern interrupt ("Stop paying $5,000/mo")',
      'Clean 1-sentence line breaks optimized for 6.1-inch mobile viewports',
      'Leverages Loss Aversion bias ("You are burning money")',
      'Data-backed authority anchor (10,000 viral posts sample size)'
    ],
    vulnerabilities: [
      'Could add a specific comment keyword trigger (e.g. Comment "WORKFLOW") to maximize algorithm reply velocity'
    ],
    optimizedVersions: [
      {
        label: '🔥 10x Nuclear Pattern Interrupt & Direct Lead Magnet',
        versionText: 'Stop paying $5,000/mo for marketing agencies.\n\nYou are burning cash.\n\nWe built a 1-click AI prompt stack that generates 30 days of viral content in 12 minutes.\n\nComment "SYSTEM" below and I will send you the exact blueprint for free.',
        expectedBoost: '+420% Comment Velocity & Leads',
        frameworkUsed: 'Pattern Interrupt + Lead Gen'
      },
      {
        label: '📊 10,000 Post Empirical Case Study Angle',
        versionText: 'We analyzed 10,000 viral posts across X, LinkedIn, and TikTok.\n\n90% of creators fail because of 1 formatting mistake: wall-of-text paragraphs.\n\nHere is our 3-part mobile line-break framework that quadruples reach:',
        expectedBoost: '+310% Bookmark Saves',
        frameworkUsed: 'Data-Backed Proof'
      },
      {
        label: '🥊 High-Stakes Storytelling Transformation',
        versionText: '6 months ago I spent $60,000 on high-ticket social media agencies.\n\nThe result? 400 impressions and zero leads.\n\nThen I coded an autonomous 3-prompt AI system. Yesterday it generated 1.2M views.\n\nSteal my exact prompt architecture below:',
        expectedBoost: '+280% High-Intent Retweets',
        frameworkUsed: 'Zero-to-Hero Transformation'
      }
    ]
  });

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!contentToAnalyze.trim()) return;

    setLoading(true);
    try {
      const response = await apiFetch('/api/viral/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToAnalyze, platform })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRewrite = (newText: string) => {
    setContentToAnalyze(newText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-brass-500/10 border border-accent-brass-500/20 text-xs font-semibold text-accent-brass-300 mb-3">
              <Activity className="h-4 w-4 text-accent-brass-400" />
              <span>Real-Time Algorithm Simulator & Virality Diagnostics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Virality Score Auditor</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-gradient-to-r from-accent-brass-400 to-accent-brass-600 text-white font-bold tracking-normal uppercase">
                v10.0 Pro
              </span>
            </h2>
            <p className="text-sm text-ink-muted mt-2 max-w-3xl leading-relaxed">
              Audits draft posts against 2026 social media recommendation algorithms. Simulates 0-30s viewer retention curves, flags shadowban risks, analyzes sentence friction, and generates 10x viral rewrites.
            </p>
          </div>

          {/* Key Metrics Bar */}
          <div className="flex items-center gap-3 bg-surface-0/80 p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="px-3 py-1.5 text-center border-r border-white/10">
              <div className="text-lg font-black text-accent-brass-400">
                {analysis ? `${analysis.score}/100` : '--'}
              </div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Virality Index</div>
            </div>
            <div className="px-3 py-1.5 text-center border-r border-white/10">
              <div className="text-lg font-black text-emerald-400">
                {analysis ? analysis.grade : '--'}
              </div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Overall Grade</div>
            </div>
            <div className="px-3 py-1.5 text-center">
              <div className="text-lg font-black text-accent-brass-300">
                {analysis?.benchmarkPercentile ? `Top ${100 - analysis.benchmarkPercentile}%` : 'Top 5%'}
              </div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Percentile</div>
            </div>
          </div>
        </div>

        {/* Input Form & Presets */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent-brass-400" />
              <span>Draft Post / Script Content to Audit:</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted font-medium">Target Platform Ruleset:</span>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="bg-surface-0 border border-white/10 rounded-xl px-3 py-2 text-xs text-ink-secondary focus:outline-none focus:border-accent-brass-500 font-semibold"
              >
                <option value="X / Twitter">🐤 X / Twitter (280 Char / Thread)</option>
                <option value="Instagram Reel/Carousel">📸 Instagram Reel / Carousel Cover</option>
                <option value="TikTok Video Script">🎥 TikTok Short Video Script (0-3s Hook)</option>
                <option value="LinkedIn Thought Leadership">💼 LinkedIn Thought Leadership (...see more fold)</option>
                <option value="Threads">🧵 Meta Threads (Reply Loops)</option>
                <option value="Facebook Post">📘 Facebook Post</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={contentToAnalyze}
              onChange={(e) => setContentToAnalyze(e.target.value)}
              rows={5}
              placeholder="Paste your post or video script here..."
              className="w-full bg-surface-0 border border-white/10 rounded-2xl p-4 text-slate-100 text-sm focus:outline-none focus:border-accent-brass-500 font-sans leading-relaxed shadow-inner"
              required
            />
            <div className="absolute right-4 bottom-4 text-[11px] text-slate-500 font-mono">
              {contentToAnalyze.length} characters | ~{Math.ceil(contentToAnalyze.split(/\s+/).filter(Boolean).length / 2.5)}s speaking time
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[11px] font-semibold text-ink-muted block mb-2">
              ⚡ Load Benchmark Test Drafts (1-Click Audit Test Cases):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_DRAFTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setContentToAnalyze(preset.text);
                    setPlatform(preset.platform);
                  }}
                  className="p-2.5 rounded-xl bg-surface-1 border border-white/10 hover:border-accent-brass-500/50 hover:bg-surface-2 text-[11px] font-bold text-ink-secondary transition-colors text-left truncate"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Action Button */}
          <button
            type="submit"
            disabled={loading || !contentToAnalyze.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 hover:from-accent-brass-400 hover:via-accent-brass-300 hover:to-accent-brass-400 text-white font-black text-sm shadow-[var(--shadow-glow-brass)] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin text-accent-amber-300" />
                <span>Running Algorithmic Simulation & Shadowban Risk Scan...</span>
              </>
            ) : (
              <>
                <Gauge className="h-5 w-5 text-accent-amber-300" />
                <span>Audit Draft Content & Calculate Virality Index</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ANALYSIS RESULTS DASHBOARD */}
      {analysis && (
        <div className="space-y-8">
          {/* TOP AUDIT SUMMARY CARD */}
          <div className="bg-surface-1/90 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Score Gauge Column */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-surface-0 rounded-2xl border border-white/10 text-center space-y-4">
              <div className="relative">
                <div className="h-28 w-28 rounded-3xl bg-gradient-to-tr from-accent-brass-500/10 via-accent-brass-400/20 to-accent-brass-500/20 border-2 border-accent-brass-500/30 flex flex-col items-center justify-center shadow-inner">
                  <span className={`text-4xl font-black tracking-tight ${
                    analysis.score >= 85 ? 'text-emerald-400' : analysis.score >= 65 ? 'text-accent-amber-400' : 'text-rose-400'
                  }`}>
                    {analysis.score}
                  </span>
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mt-0.5">
                    Virality Index
                  </span>
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-white flex items-center justify-center gap-2">
                  <span>GRADE {analysis.grade}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                    Top {analysis.benchmarkPercentile ? 100 - analysis.benchmarkPercentile : 5}%
                  </span>
                </div>

                <div className="text-xs font-semibold text-ink-muted mt-1">
                  {analysis.volatilityRisk || 'Low Volatility (Safe)'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-900 text-[11px]">
                <div className="bg-surface-1/80 p-2 rounded-xl text-center">
                  <span className="text-ink-muted block text-[10px]">Readability Level</span>
                  <strong className="text-ink-secondary">{analysis.readingGrade || 'Grade 6'}</strong>
                </div>
                <div className="bg-surface-1/80 p-2 rounded-xl text-center">
                  <span className="text-ink-muted block text-[10px]">Est. Reading Time</span>
                  <strong className="text-accent-amber-400">{analysis.estimatedReadingTimeSec || 12}s</strong>
                </div>
              </div>
            </div>

            {/* Right 5-Factor Radar Breakdown */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent-brass-400" />
                  <span>5-Factor Algorithmic Score Diagnostics</span>
                </h3>
                <span className="text-xs text-ink-muted">
                  Target Platform: <strong className="text-accent-brass-300">{platform}</strong>
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(analysis.breakdown).map(([key, value]) => {
                  const val = value as number;
                  const labels: Record<string, { label: string; desc: string }> = {
                    hookStrength: { label: 'Hook Strength & 0.5s Pattern Interrupt', desc: 'Captures scrolling user attention before swipe away' },
                    emotionalResonance: { label: 'Emotional Resonance & Cognitive Bias', desc: 'Triggers FOMO, loss aversion, or intense curiosity' },
                    clarityAndPacing: { label: 'Mobile Viewport Pacing & Readability', desc: 'Line breaks and line length optimized for phone screens' },
                    callToActionPower: { label: 'CTA Conversion & Action Intent', desc: 'Drives comments, retweets, bookmark saves, or link clicks' },
                    algorithmicShareability: { label: 'Algorithmic Shareability / Save Rate', desc: 'Signals algorithm to amplify reach to non-followers' }
                  };

                  const info = labels[key] || { label: key, desc: '' };

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-ink-secondary">{info.label}</span>
                        <span className={`font-mono font-bold ${
                          val >= 85 ? 'text-emerald-400' : val >= 65 ? 'text-accent-amber-400' : 'text-rose-400'
                        }`}>
                          {val} / 100
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface-0 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full rounded-full transition-colors duration-700 ${
                            val >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : val >= 65 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-rose-600 to-red-400'
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500">{info.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIMULATED VIEWER RETENTION CURVE CHART */}
          {analysis.retentionCurve && analysis.retentionCurve.length > 0 && (
            <div className="bg-surface-1/90 rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span>Simulated Viewer Retention & Drop-Off Curve</span>
                </h3>
                <span className="text-xs text-ink-muted">
                  Predicted retention based on hook structure & sentence length
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {analysis.retentionCurve.map((pt, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-0 p-4 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-ink-muted font-bold">{pt.time}</span>
                      <span className={`font-bold ${
                        pt.retention >= 80 ? 'text-emerald-400' : pt.retention >= 65 ? 'text-accent-amber-400' : 'text-rose-400'
                      }`}>
                        {pt.retention}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-surface-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pt.retention >= 80 ? 'bg-emerald-400' : pt.retention >= 65 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${pt.retention}%` }}
                      />
                    </div>

                    <div className="text-[11px] font-semibold text-ink-secondary line-clamp-2">
                      {pt.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALGORITHM COMPLIANCE & SHADOWBAN CHECK */}
          {analysis.algorithmCompliance && analysis.algorithmCompliance.length > 0 && (
            <div className="bg-surface-1/90 rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-accent-amber-400" />
                <span>Algorithm Rule Compliance & Penalty Audit</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.algorithmCompliance.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-surface-0 border border-white/10 flex items-start gap-3"
                  >
                    {rule.status === 'pass' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : rule.status === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-accent-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-white flex items-center justify-between gap-2">
                        <span>{rule.rule}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          rule.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : rule.status === 'warning' ? 'bg-accent-amber-500/10 text-accent-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-ink-muted leading-relaxed">{rule.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SENTENCE-LEVEL HEATMAP BREAKDOWN */}
          {analysis.sentenceAnalysis && analysis.sentenceAnalysis.length > 0 && (
            <div className="bg-surface-1/90 rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-accent-brass-400" />
                <span>Sentence-Level Virality & Friction Breakdown</span>
              </h3>

              <div className="space-y-3">
                {analysis.sentenceAnalysis.map((sent, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        sent.type === 'hook' ? 'bg-accent-brass-500/10 text-accent-brass-300 border-accent-brass-500/20' :
                        sent.type === 'value' ? 'bg-accent-brass-400/10 text-accent-brass-400 border-accent-brass-400/20' :
                        sent.type === 'cta' ? 'bg-accent-brass-600/10 text-accent-brass-300 border-accent-brass-600/30' :
                        'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      }`}>
                        {sent.type === 'hook' ? '🎯 Hook / Pattern Interrupt' : sent.type === 'value' ? '💎 Value Payload' : sent.type === 'cta' ? '🚀 Action CTA' : '⚠️ Potential Friction'}
                      </span>

                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {sent.score}/100 Power
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white bg-surface-1 p-3 rounded-xl border border-white/10">
                      &quot;{sent.text}&quot;
                    </div>

                    <div className="text-xs text-ink-muted leading-relaxed">
                      💡 <strong>Audit Feedback:</strong> {sent.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STRENGTHS VS VULNERABILITIES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-3xl bg-surface-1/90 border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-2 font-black text-emerald-400 text-sm uppercase tracking-wider">
                <CheckCircle2 className="h-5 w-5" />
                <span>Algorithmic Strengths & Accelerators</span>
              </div>
              <ul className="space-y-3 text-xs text-ink-secondary">
                {analysis.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-surface-0 p-3 rounded-xl border border-white/10">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vulnerabilities */}
            <div className="p-6 rounded-3xl bg-surface-1/90 border border-rose-500/20 space-y-4">
              <div className="flex items-center gap-2 font-black text-rose-400 text-sm uppercase tracking-wider">
                <AlertTriangle className="h-5 w-5" />
                <span>Drop-Off Vulnerabilities & Risks</span>
              </div>
              <ul className="space-y-3 text-xs text-ink-secondary">
                {analysis.vulnerabilities.map((vul, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-surface-0 p-3 rounded-xl border border-white/10">
                    <span className="text-rose-400 font-bold">•</span>
                    <span className="leading-relaxed">{vul}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* INSTANT AI VIRAL REWRITES SECTION */}
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-accent-amber-400 animate-pulse" />
                  <span>Instant 10x AI Viral Rewrites</span>
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Transformed draft versions engineered using cognitive psychology and high-converting framework templates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {analysis.optimizedVersions.map((opt, idx) => (
                <div
                  key={idx}
                  className="bg-surface-1/90 rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl hover:border-accent-brass-500/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">
                        Option #{idx + 1}: {opt.label}
                      </span>
                      {opt.frameworkUsed && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-accent-brass-500/10 text-accent-brass-300 border border-accent-brass-500/20">
                          {opt.frameworkUsed}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
                      ⚡ Projected Boost: {opt.expectedBoost}
                    </span>
                  </div>

                  <div className="bg-surface-0 p-5 rounded-2xl border border-white/10 text-sm text-slate-100 whitespace-pre-line leading-relaxed font-sans shadow-inner">
                    {opt.versionText}
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-3 pt-1">
                    <span className="text-[11px] text-slate-500">
                      {opt.versionText.length} characters | ~{Math.ceil(opt.versionText.split(/\s+/).length / 2.5)}s speaking time
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(idx, opt.versionText)}
                        className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-bold flex items-center gap-2 transition-colors"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 text-accent-brass-400" />
                            <span>Copy Rewrite</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleApplyRewrite(opt.versionText)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-brass-500 to-accent-brass-600 hover:from-accent-brass-400 hover:to-accent-brass-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-[var(--shadow-glow-brass)]"
                      >
                        <span>Apply to Editor & Re-Audit</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
