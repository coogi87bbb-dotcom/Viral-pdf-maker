import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Target, 
  Sparkles, 
  Copy, 
  Check, 
  TrendingUp, 
  Flame, 
  HelpCircle, 
  RefreshCw,
  Zap,
  Filter,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Volume2,
  Smartphone,
  Linkedin,
  Twitter,
  Video,
  Eye,
  Sliders,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Wand2,
  Maximize2,
  X,
  Share2,
  Layers,
  Award,
  Clock,
  MessageSquare,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { ViralHook } from '../types';
import { PRESET_NICHES } from '../data/niches';
import {
  EXTENDED_HOOK_FRAMEWORKS, 
  ICONIC_SWIPE_FILE_HOOKS, 
  PRESET_SWIPE_TOPICS,
  ExtendedFrameworkInfo
} from '../data/hookPresets';

interface HookStudioProps {
  onSelectHookForCampaign?: (hookText: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const HookStudio: React.FC<HookStudioProps> = ({
  onSelectHookForCampaign,
  onNavigateTab
}) => {
  // Navigation / Mode Switcher
  const [studioTab, setStudioTab] = useState<'generator' | 'swipefile' | 'frameworks' | 'vault'>('generator');

  // Input states
  const [topic, setTopic] = useState('How to use AI to replace a $50k/mo marketing agency');
  const [niche, setNiche] = useState('Saas & Tech Growth');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [formatStyle, setFormatStyle] = useState<string>('all');
  const [audienceTemp, setAudienceTemp] = useState<string>('cold');
  const [spiciness, setSpiciness] = useState<'mild' | 'spicy' | 'nuclear'>('spicy');
  
  // App states
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedHooks, setSavedHooks] = useState<ViralHook[]>(() => {
    try {
      const stored = localStorage.getItem('viralos_saved_hooks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Active Hooks list
  const [hooks, setHooks] = useState<ViralHook[]>(ICONIC_SWIPE_FILE_HOOKS);

  // Card view state
  const [activePlatformEmulator, setActivePlatformEmulator] = useState<Record<string, 'x' | 'linkedin' | 'tiktok' | 'carousel'>>({});
  const [activeVariation, setActiveVariation] = useState<Record<string, 'standard' | 'punchy' | 'storyDriven' | 'question' | 'metricDriven'>>({});

  // Teleprompter / Audio sprint modal
  const [sprintHook, setSprintHook] = useState<ViralHook | null>(null);
  const [sprintTimer, setSprintTimer] = useState<number>(3);
  const [isSprintRunning, setIsSprintRunning] = useState(false);

  // Save hooks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('viralos_saved_hooks', JSON.stringify(savedHooks));
    } catch (e) {
      console.error(e);
    }
  }, [savedHooks]);

  // Handle Sprint Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isSprintRunning && sprintTimer > 0) {
      interval = setInterval(() => {
        setSprintTimer(prev => prev - 1);
      }, 1000);
    } else if (sprintTimer === 0) {
      setIsSprintRunning(false);
    }
    return () => clearInterval(interval);
  }, [isSprintRunning, sprintTimer]);

  const handleGenerateHooks = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await apiFetch('/api/viral/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          niche, 
          count: 10,
          formatStyle,
          audienceTemp,
          spiciness,
          selectedFramework 
        })
      });

      if (!response.ok) throw new Error('Failed to generate hooks');

      const data = await response.json();
      if (data.hooks && Array.isArray(data.hooks)) {
        setHooks(data.hooks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSaveHook = (hook: ViralHook) => {
    const isSaved = savedHooks.some(h => h.id === hook.id || h.hookText === hook.hookText);
    if (isSaved) {
      setSavedHooks(prev => prev.filter(h => h.id !== hook.id && h.hookText !== hook.hookText));
    } else {
      setSavedHooks(prev => [hook, ...prev]);
    }
  };

  const speakHookText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startSprint = (hook: ViralHook) => {
    setSprintHook(hook);
    setSprintTimer(3);
    setIsSprintRunning(true);
    speakHookText(getDisplayText(hook));
  };

  const getDisplayText = (hook: ViralHook): string => {
    const hookId = hook.id;
    const variationType = activeVariation[hookId] || 'standard';
    if (variationType !== 'standard' && hook.variations && hook.variations[variationType]) {
      return hook.variations[variationType] || hook.hookText;
    }
    return hook.hookText;
  };

  const filteredHooks = selectedFramework === 'all'
    ? hooks
    : hooks.filter(h => h.framework.toLowerCase().includes(selectedFramework.toLowerCase()));

  const isHookSaved = (hook: ViralHook) => {
    return savedHooks.some(h => h.id === hook.id || h.hookText === hook.hookText);
  };

  return (
    <div className="space-y-8">
      {/* Studio Banner & Navigation */}
      <div className="relative overflow-hidden bg-surface-1 p-6 sm:p-8 rounded-3xl border border-hairline shadow-[var(--shadow-panel-brass)] space-y-6">
        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 bg-accent-brass-500/[0.07] rounded-full blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-brass-500/40 to-transparent" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent-brass-500/10 border border-accent-brass-500/25 text-[11px] font-mono font-bold uppercase tracking-wider text-accent-brass-300 mb-3">
              <BrainCircuit className="h-3.5 w-3.5 text-accent-brass-400" />
              <span>Cognitive Psychology & Attention Mechanics Engine</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-primary tracking-[-0.02em]">
              Psychological Hook Studio
            </h2>
            <p className="text-sm text-ink-muted mt-2 max-w-3xl leading-[1.7]">
              The first 3 seconds dictate 90% of your post or video performance. Engineer irresistible, high-conversion scroll-stoppers using behavioral economics, cognitive biases, and viral pattern interrupts.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-surface-0 p-3 rounded-xl border border-hairline shrink-0">
            <div className="px-3 py-1.5 text-center border-r border-hairline">
              <div className="text-lg font-black text-accent-brass-300">10x</div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Retention</div>
            </div>
            <div className="px-3 py-1.5 text-center border-r border-hairline">
              <div className="text-lg font-black text-accent-brass-400">0.5s</div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Scroll Stop</div>
            </div>
            <div className="px-3 py-1.5 text-center">
              <div className="text-lg font-black text-ink-primary">{savedHooks.length}</div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">In Vault</div>
            </div>
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-3 overflow-x-auto">
          <button
            onClick={() => setStudioTab('generator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap active:scale-[0.98] cursor-pointer ${
              studioTab === 'generator'
                ? 'bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-slate-950 shadow-[var(--shadow-glow-brass)]'
                : 'bg-surface-1/80 text-ink-secondary hover:text-ink-primary hover:bg-surface-2 border border-hairline'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            <span>AI Psychological Generator</span>
          </button>

          <button
            onClick={() => setStudioTab('swipefile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap active:scale-[0.98] cursor-pointer ${
              studioTab === 'swipefile'
                ? 'bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-slate-950 shadow-[var(--shadow-glow-brass)]'
                : 'bg-surface-1/80 text-ink-secondary hover:text-ink-primary hover:bg-surface-2 border border-hairline'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Viral Swipe File (30 Iconic Hooks)</span>
          </button>

          <button
            onClick={() => setStudioTab('frameworks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap active:scale-[0.98] cursor-pointer ${
              studioTab === 'frameworks'
                ? 'bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-slate-950 shadow-[var(--shadow-glow-brass)]'
                : 'bg-surface-1/80 text-ink-secondary hover:text-ink-primary hover:bg-surface-2 border border-hairline'
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>10 Cognitive Psychology Frameworks</span>
          </button>

          <button
            onClick={() => setStudioTab('vault')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap active:scale-[0.98] cursor-pointer ${
              studioTab === 'vault'
                ? 'bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-slate-950 shadow-[var(--shadow-glow-brass)]'
                : 'bg-surface-1/80 text-ink-secondary hover:text-ink-primary hover:bg-surface-2 border border-hairline'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Hook Vault ({savedHooks.length})</span>
          </button>
        </div>

        {/* TAB 1: AI GENERATOR */}
        {studioTab === 'generator' && (
          <div className="space-y-6">
            <form onSubmit={handleGenerateHooks} className="space-y-4">
              {/* Main Topic Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Core Topic or Premise
                  </label>
                  <span className="text-[11px] text-accent-brass-300 font-medium">
                    Be specific for maximum psychological accuracy
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. How to use AI agents to automate social media marketing..."
                    className="w-full bg-surface-0 border-2 border-brass-500/30 rounded-2xl px-5 py-3.5 text-ink-primary text-sm focus:outline-none focus:border-accent-brass-400 focus:ring-1 focus:ring-brass-400 pr-12 shadow-inner"
                    required
                  />
                  <Sparkles className="absolute right-4 top-3.5 h-5 w-5 text-accent-brass-400 pointer-events-none" />
                </div>
              </div>

              {/* Quick Topic Chips */}
              <div>
                <label className="text-[11px] font-semibold text-ink-muted block mb-2">
                  Quick Preset Topics (Click to Auto-fill)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SWIPE_TOPICS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(preset)}
                      className="px-3 py-1.5 rounded-lg bg-surface-1 border border-hairline hover:border-accent-brass-400/60 hover:bg-surface-2 text-[11px] text-ink-secondary transition-colors text-left truncate max-w-xs cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Parameter Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {/* Niche */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                    Niche / Field
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3 py-2.5 text-xs text-ink-secondary focus:outline-none focus:border-accent-brass-400"
                  >
                    {PRESET_NICHES.map((n) => (
                      <option key={n.id} value={n.name}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Format */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                    Target Format / Style
                  </label>
                  <select
                    value={formatStyle}
                    onChange={(e) => setFormatStyle(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3 py-2.5 text-xs text-ink-secondary focus:outline-none focus:border-accent-brass-400"
                  >
                    <option value="all">All Social Formats</option>
                    <option value="video-0-3s">Short Video Script (0-3s Voiceover)</option>
                    <option value="x-thread">X / Twitter Thread Opener</option>
                    <option value="linkedin-fold">LinkedIn "...see more" Cutoff</option>
                    <option value="carousel-cover">Carousel Slide 1 Cover</option>
                    <option value="email-subject">Email Subject Line</option>
                  </select>
                </div>

                {/* Audience Temp */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                    Audience Temperature
                  </label>
                  <select
                    value={audienceTemp}
                    onChange={(e) => setAudienceTemp(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3 py-2.5 text-xs text-ink-secondary focus:outline-none focus:border-accent-brass-400"
                  >
                    <option value="cold">Cold Audience (Skeptic / Stranger)</option>
                    <option value="warm">Warm Followers (Engaged)</option>
                    <option value="hot">Hot Prospects (Ready to Buy)</option>
                  </select>
                </div>

                {/* Spiciness Level */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                    Controversy / Spiciness
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-surface-0 p-1 rounded-xl border border-hairline">
                    <button
                      type="button"
                      onClick={() => setSpiciness('mild')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                        spiciness === 'mild' ? 'bg-surface-2 text-status-positive' : 'text-ink-muted hover:text-ink-primary'
                      }`}
                    >
                      Mild
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpiciness('spicy')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                        spiciness === 'spicy' ? 'bg-surface-2 text-accent-brass-400' : 'text-ink-muted hover:text-ink-primary'
                      }`}
                    >
                      Spicy
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpiciness('nuclear')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                        spiciness === 'nuclear' ? 'bg-surface-2 text-status-danger' : 'text-ink-muted hover:text-ink-primary'
                      }`}
                    >
                      Nuclear
                    </button>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 hover:brightness-105 text-slate-950 font-black text-sm shadow-[var(--shadow-glow-brass)] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin text-slate-950" />
                      <span>Synthesizing Cognitive Psychology Hooks...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 text-slate-950 fill-slate-950" />
                      <span>Generate 10 High-Conversion Viral Hooks</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Framework Selector Badges */}
            <div className="pt-2 border-t border-hairline">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Filter By Cognitive Framework:
                </label>
                <span className="text-[11px] text-ink-muted">
                  Click to isolate specific psychological mechanisms
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={() => setSelectedFramework('all')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-colors text-center ${
                    selectedFramework === 'all'
                      ? 'bg-brass-400 text-slate-950 font-black border-brass-300 shadow'
                      : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  All Frameworks
                </button>
                {EXTENDED_HOOK_FRAMEWORKS.slice(0, 9).map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-colors text-left truncate ${
                      selectedFramework === fw.id
                        ? 'bg-brass-400 text-slate-950 font-black border-brass-300 shadow'
                        : 'bg-surface-1/90 border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink-secondary'
                    }`}
                    title={fw.description}
                  >
                    {fw.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIRAL SWIPE FILE */}
        {studioTab === 'swipefile' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-0 border border-brass-500/30 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent-brass-400" />
                  <span>30 Iconic Viral Hook Formulas</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Hand-curated formulas responsible for over 100M total impressions across X, TikTok, and LinkedIn.
                </p>
              </div>

              <button
                onClick={() => {
                  setHooks(ICONIC_SWIPE_FILE_HOOKS);
                  setStudioTab('generator');
                }}
                className="px-4 py-2 rounded-xl bg-brass-400 text-slate-950 text-xs font-extrabold hover:bg-brass-300 transition-colors shrink-0 cursor-pointer shadow"
              >
                Load into Studio
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ICONIC_SWIPE_FILE_HOOKS.map((swipe, idx) => (
                <div
                  key={swipe.id || idx}
                  className="bg-surface-0 border border-hairline rounded-2xl p-5 hover:border-brass-500/40 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent-brass-500/10 text-accent-brass-300 border border-brass-500/20">
                      Formula #{idx + 1}: {swipe.framework}
                    </span>
                    <span className="text-xs font-black text-status-positive">
                      {swipe.viralityScore}/100 Virality
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-ink-primary bg-surface-1 p-3.5 rounded-xl border border-hairline leading-snug">
                    &quot;{swipe.hookText}&quot;
                  </div>

                  <div className="text-xs text-ink-muted space-y-1">
                    <div><strong>Trigger:</strong> {swipe.emotionalTrigger}</div>
                    <div><strong>Why It Works:</strong> {swipe.whyItWorks}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-hairline">
                    <button
                      onClick={() => {
                        setTopic(swipe.hookText);
                        setStudioTab('generator');
                      }}
                      className="text-xs font-bold text-accent-brass-400 hover:text-accent-brass-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Use Formula to Generate Variations</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopy(`swipe-${idx}`, swipe.hookText)}
                      className="p-1.5 rounded-lg bg-surface-1 hover:bg-surface-2 text-ink-secondary text-xs cursor-pointer"
                    >
                      {copiedId === `swipe-${idx}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COGNITIVE PSYCHOLOGY MATRIX */}
        {studioTab === 'frameworks' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-0 border border-brass-500/30">
              <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-accent-brass-400" />
                <span>The 10 Psychological Principles of Content Virality</span>
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                Learn the behavioral science mechanisms behind why users stop scrolling, click expand, and share content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXTENDED_HOOK_FRAMEWORKS.map((fw) => (
                <div
                  key={fw.id}
                  className="bg-surface-0 border border-hairline rounded-2xl p-5 space-y-3 hover:border-brass-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${fw.badgeColor}`}>
                        {fw.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-ink-muted bg-surface-1 px-2 py-0.5 rounded">
                      Bias: {fw.cognitiveBias}
                    </span>
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed font-medium">
                    {fw.description}
                  </p>

                  <div className="bg-surface-1/80 p-3 rounded-xl border border-hairline space-y-1 text-xs">
                    <div className="text-accent-brass-400 font-bold">Scroll-Stop Mechanism:</div>
                    <div className="text-ink-muted">{fw.scrollStopMechanism}</div>
                  </div>

                  <div className="bg-surface-1/50 p-3 rounded-xl border border-hairline text-xs space-y-1">
                    <div className="text-status-positive font-bold">Real Example:</div>
                    <div className="text-ink-primary italic">&quot;{fw.example}&quot;</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
                    <span>Ideal Platforms: <strong className="text-ink-secondary">{fw.idealPlatform}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedFramework(fw.id);
                        setStudioTab('generator');
                      }}
                      className="text-accent-brass-400 hover:underline font-bold cursor-pointer"
                    >
                      Generate with {fw.name} &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SAVED VAULT */}
        {studioTab === 'vault' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-0 border border-brass-500/30 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-accent-brass-400" />
                  <span>My Saved Hook Vault ({savedHooks.length})</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Your personal swipe file of high-performing hooks saved for future campaigns.
                </p>
              </div>

              {savedHooks.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = savedHooks.map((h, i) => `${i + 1}. [${h.framework}] "${h.hookText}"`).join('\n\n');
                      navigator.clipboard.writeText(text);
                      setCopiedId('vault-all');
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-surface-1 border border-hairline text-ink-secondary text-xs font-bold hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    {copiedId === 'vault-all' ? 'Copied All Markdown!' : 'Copy All Saved'}
                  </button>

                  <button
                    onClick={() => setSavedHooks([])}
                    className="p-2 rounded-xl bg-status-danger-dim border border-status-danger/20 text-status-danger hover:bg-status-danger-dim/80 transition-colors text-xs cursor-pointer"
                    title="Clear Vault"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {savedHooks.length === 0 ? (
              <div className="p-12 text-center bg-surface-0 rounded-2xl border border-hairline space-y-3">
                <Bookmark className="h-10 w-10 text-ink-muted mx-auto" />
                <h4 className="text-base font-bold text-ink-primary">Your Vault is Empty</h4>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  Click the bookmark icon on any generated hook to save it to your personal swipe file.
                </p>
                <button
                  onClick={() => setStudioTab('generator')}
                  className="px-4 py-2 rounded-xl bg-brass-400 text-slate-950 font-black text-xs shadow-lg shadow-brass-500/20 cursor-pointer"
                >
                  Generate Hooks Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedHooks.map((hook, idx) => (
                  <div
                    key={hook.id || idx}
                    className="bg-surface-0 border border-hairline rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent-brass-500/10 text-accent-brass-300 border border-brass-500/20">
                        {hook.framework}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(hook.id, hook.hookText)}
                          className="px-3 py-1 rounded-lg bg-surface-1 border border-hairline text-xs text-ink-secondary cursor-pointer"
                        >
                          {copiedId === hook.id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => toggleSaveHook(hook)}
                          className="p-1.5 rounded-lg bg-status-danger-dim text-status-danger hover:bg-status-danger-dim/80 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-base font-extrabold text-ink-primary bg-surface-1 p-4 rounded-xl border border-hairline">
                      &quot;{hook.hookText}&quot;
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-ink-muted">
                        Trigger: <strong className="text-ink-secondary">{hook.emotionalTrigger}</strong>
                      </div>

                      {onSelectHookForCampaign && (
                        <button
                          onClick={() => onSelectHookForCampaign(hook.hookText)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md border-b-2 border-brass-700 cursor-pointer"
                        >
                          <span>Launch Campaign</span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-950" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* GENERATED HOOKS LIST (VISIBLE ON GENERATOR TAB) */}
      {studioTab === 'generator' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-extrabold text-ink-primary flex items-center gap-2.5">
              <Flame className="h-6 w-6 text-accent-brass-400 animate-pulse" />
              <span>Generated Viral Hooks ({filteredHooks.length})</span>
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-1 px-3 py-1.5 rounded-xl border border-hairline text-xs text-ink-secondary">
                <Filter className="h-3.5 w-3.5 text-ink-muted" />
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs text-ink-secondary font-semibold"
                >
                  <option value="all">All Frameworks</option>
                  <option value="pattern-interrupt">Pattern Interrupt</option>
                  <option value="curiosity-gap">Curiosity Gap</option>
                  <option value="high-stakes">High-Stakes Transformation</option>
                  <option value="polarizing-truth">Polarizing Truth</option>
                  <option value="data-backed">Data-Backed Proof</option>
                  <option value="anti-guru">Anti-Guru Callout</option>
                  <option value="secret-vault">Secret Vault</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredHooks.map((hook, idx) => {
              const hookId = hook.id || `generated-${idx}`;
              const isSaved = isHookSaved(hook);
              const activeEmul = activePlatformEmulator[hookId] || 'x';
              const currentVar = activeVariation[hookId] || 'standard';
              const displayText = getDisplayText(hook);

              return (
                <div
                  key={hookId}
                  className="bg-surface-1/90 rounded-3xl border border-hairline p-6 shadow-[var(--shadow-panel)] hover:border-brass-500/40 transition-colors space-y-5 relative overflow-hidden"
                >
                  {/* Card Top Metadata & Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-accent-brass-500/10 text-accent-brass-300 border border-brass-500/20 uppercase tracking-wide">
                        {hook.framework}
                      </span>

                      {hook.cognitiveBias && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-brass-500/10 text-accent-brass-300 border border-accent-brass-500/20 inline-flex items-center gap-1">
                          <BrainCircuit className="h-3 w-3" />
                          {hook.cognitiveBias}
                        </span>
                      )}

                      {hook.spicinessLevel && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                          hook.spicinessLevel === 'Nuclear Viral'
                            ? 'bg-accent-brass-500/20 text-accent-brass-300 border-accent-brass-500/30'
                            : hook.spicinessLevel === 'Spicy'
                            ? 'bg-accent-brass-500/20 text-accent-brass-300 border-accent-brass-500/30'
                            : 'bg-status-positive-dim text-status-positive border-status-positive/30'
                        }`}>
                          <Flame className="h-3 w-3" />
                          {hook.spicinessLevel === 'Nuclear Viral' ? 'Nuclear' : hook.spicinessLevel === 'Spicy' ? 'Spicy' : 'Mild'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-black text-status-positive bg-status-positive-dim px-2.5 py-1 rounded-lg border border-status-positive/20">
                        <TrendingUp className="h-4 w-4" />
                        <span>{hook.viralityScore}/100 Virality</span>
                      </div>

                      <button
                        onClick={() => toggleSaveHook(hook)}
                        className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                          isSaved 
                            ? 'bg-brass-400 text-slate-950 font-black border-brass-300' 
                            : 'bg-surface-2 hover:bg-surface-3 text-ink-secondary border-hairline-strong'
                        }`}
                        title={isSaved ? "Saved to Vault" : "Save to Vault"}
                      >
                        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => handleCopy(hookId, displayText)}
                        className="p-2 rounded-xl bg-surface-1 hover:bg-surface-2 border border-hairline-strong text-ink-secondary transition-colors"
                        title="Copy Hook"
                      >
                        {copiedId === hookId ? (
                          <Check className="h-4 w-4 text-status-positive" />
                        ) : (
                          <Copy className="h-4 w-4 text-accent-brass-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* A/B Variation Tabs Selector */}
                  <div className="flex items-center gap-1.5 bg-surface-0 p-1.5 rounded-xl border border-accent-brass-500/30 overflow-x-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-brass-400 px-2 shrink-0">
                      A/B Variations:
                    </span>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'standard' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                        currentVar === 'standard' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      <Sliders className="h-3 w-3" />
                      Standard
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'punchy' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                        currentVar === 'punchy' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Punchy 1-Liner
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'storyDriven' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                        currentVar === 'storyDriven' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      <BookOpen className="h-3 w-3" />
                      Story Opener
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'question' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                        currentVar === 'question' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      <HelpCircle className="h-3 w-3" />
                      Curiosity Question
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'metricDriven' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                        currentVar === 'metricDriven' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      <BarChart2 className="h-3 w-3" />
                      Metric-Heavy
                    </button>
                  </div>

                  {/* Main Hook Headline Display */}
                  <div className="relative group">
                    <div className="text-lg sm:text-xl font-black text-ink-primary bg-surface-0 p-5 rounded-xl border border-accent-brass-500/40 leading-snug tracking-tight">
                      &quot;{displayText}&quot;
                    </div>

                    {/* Quick Speak Button overlay */}
                    <button
                      onClick={() => speakHookText(displayText)}
                      className="absolute right-3 bottom-3 p-2 rounded-lg bg-surface-1/90 hover:bg-accent-brass-500 text-ink-secondary hover:text-slate-950 transition-colors border border-accent-brass-500/40 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
                      title="Listen Aloud (Speech Preview)"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Psychology Rationale & Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 text-xs text-ink-secondary bg-surface-0/80 p-3.5 rounded-xl border border-accent-brass-500/20 flex items-start gap-2.5">
                      <HelpCircle className="h-4 w-4 text-accent-brass-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-accent-brass-300 block mb-0.5">Psychology Rationale:</strong>
                        <span className="text-ink-secondary leading-relaxed">{hook.whyItWorks}</span>
                      </div>
                    </div>

                    <div className="bg-surface-0/60 p-3.5 rounded-xl border border-hairline flex flex-col justify-between gap-2 text-xs">
                      <div className="flex items-center justify-between text-ink-muted">
                        <span>Emotional Trigger:</span>
                        <strong className="text-ink-secondary">{hook.emotionalTrigger}</strong>
                      </div>
                      <div className="flex items-center justify-between text-ink-muted">
                        <span>Speaking Speed:</span>
                        <strong className="text-accent-brass-400">{hook.spokenDurationSec || 2.4}s (WPM optimal)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Platform Visual Simulator Controls */}
                  <div className="space-y-3 pt-2 border-t border-hairline">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-muted flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-accent-brass-400" />
                        <span>Platform Render Simulator:</span>
                      </span>

                      <div className="flex items-center gap-1 bg-surface-0 p-1 rounded-xl border border-hairline">
                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'x' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            activeEmul === 'x' ? 'bg-sky-500 text-slate-950' : 'text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          <Twitter className="h-3 w-3" />
                          <span>X Tweet</span>
                        </button>

                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'linkedin' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            activeEmul === 'linkedin' ? 'bg-accent-brass-500 text-slate-950' : 'text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          <Linkedin className="h-3 w-3" />
                          <span>LinkedIn Cutoff</span>
                        </button>

                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'tiktok' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            activeEmul === 'tiktok' ? 'bg-accent-brass-400 text-slate-950 font-black' : 'text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          <Video className="h-3 w-3" />
                          <span>TikTok 0-3s</span>
                        </button>

                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'carousel' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            activeEmul === 'carousel' ? 'bg-brass-400 text-slate-950 font-black' : 'text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          <Layers className="h-3 w-3" />
                          <span>Carousel Cover</span>
                        </button>
                      </div>
                    </div>

                    {/* PREVIEW CONTAINER BASED ON SELECTED PLATFORM */}
                    {activeEmul === 'x' && (
                      <div className="bg-surface-0 p-4 rounded-2xl border border-hairline space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-400 to-accent-brass-600 flex items-center justify-center font-bold text-ink-primary text-xs">
                            OS
                          </div>
                          <div>
                            <div className="text-xs font-bold text-ink-primary flex items-center gap-1">
                              <span>Viral Growth Director</span>
                              <span className="text-sky-400">✓</span>
                            </div>
                            <div className="text-[11px] text-ink-muted">@viralos_official</div>
                          </div>
                        </div>
                        <div className="text-sm font-normal text-ink-primary whitespace-pre-wrap leading-relaxed font-sans">
                          {displayText}
                        </div>
                        <div className="text-[11px] text-ink-muted pt-2 border-t border-hairline flex items-center justify-between">
                          <span>{displayText.length} / 280 characters</span>
                          <span className="text-status-positive font-bold">Optimal Thread Opening Length</span>
                        </div>
                      </div>
                    )}

                    {activeEmul === 'linkedin' && (
                      <div className="bg-surface-0 p-4 rounded-2xl border border-accent-brass-500/20 space-y-2">
                        <div className="text-[11px] text-accent-brass-400 font-bold flex items-center gap-1">
                          <Linkedin className="h-3.5 w-3.5" />
                          <span>LinkedIn First 140 Characters (&quot;...see more&quot; Fold Check):</span>
                        </div>
                        <div className="text-sm font-semibold text-ink-primary leading-snug">
                          {displayText.slice(0, 140)}
                          <span className="text-accent-brass-400 font-black cursor-pointer bg-accent-brass-500/10 px-1 rounded ml-1">
                            ...see more
                          </span>
                        </div>
                        <div className="text-[11px] text-ink-muted pt-1">
                          {displayText.length <= 140 ? (
                            <span className="text-status-positive font-bold">✓ 100% visible before fold</span>
                          ) : (
                            <span className="text-accent-brass-400 font-bold">⚠️ Payload extends after fold — curiosity gap triggered!</span>
                          )}
                        </div>
                      </div>
                    )}

                    {activeEmul === 'tiktok' && (
                      <div className="bg-surface-0 p-4 rounded-2xl border border-accent-brass-500/20 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-48 aspect-[9/16] bg-surface-1 rounded-xl border border-accent-brass-500/30 p-3 flex flex-col justify-between relative overflow-hidden shrink-0 shadow-[var(--shadow-panel-brass)]">
                          <div className="flex justify-between items-center text-[10px] text-accent-brass-400 font-bold">
                            <span>0:00 - 0:03</span>
                            <span className="px-1.5 py-0.5 rounded bg-accent-brass-500/20">HOOK ZONE</span>
                          </div>

                          <div className="bg-surface-0/90 backdrop-blur p-2 rounded-lg border border-accent-brass-400/50 text-center space-y-1">
                            <span className="text-[9px] font-black uppercase text-accent-brass-400 block tracking-wider">
                              On-Screen Headline
                            </span>
                            <div className="text-xs font-black text-ink-primary leading-tight">
                              &quot;{displayText.slice(0, 45)}...&quot;
                            </div>
                          </div>

                          <div className="text-[9px] text-ink-muted text-center">
                            Speak time: ~{hook.spokenDurationSec || 2.4}s
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-ink-secondary">
                          <div className="font-bold text-ink-primary">Video Retention Guidelines:</div>
                          <ul className="space-y-1 text-ink-muted list-disc list-inside">
                            <li>Deliver the audio hook in under 3.0 seconds.</li>
                            <li>Include bold visual pattern interrupt in frame 1.</li>
                            <li>Use auto-captions positioned in the middle third safe zone.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeEmul === 'carousel' && (
                      <div className="bg-surface-0 p-4 rounded-2xl border border-accent-brass-500/20 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-56 aspect-[4/5] bg-gradient-to-br from-surface-1 via-surface-0 to-surface-1 rounded-xl border border-accent-brass-500/30 p-4 flex flex-col justify-between shrink-0 shadow-[var(--shadow-panel)]">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-brass-500/20 text-accent-brass-300 w-fit">
                            Slide 1 / 10
                          </span>

                          <div className="space-y-2">
                            <h4 className="text-sm font-extrabold text-ink-primary leading-snug">
                              {displayText}
                            </h4>
                            <p className="text-[10px] text-ink-muted">Swipe for full strategy &rarr;</p>
                          </div>

                          <div className="text-[10px] text-ink-muted flex justify-between items-center">
                            <span>@viralos</span>
                            <span>Save Post</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-ink-secondary">
                          <div className="font-bold text-ink-primary">Carousel Slide 1 Best Practices:</div>
                          <ul className="space-y-1 text-ink-muted list-disc list-inside">
                            <li>High contrast typography against dark canvas.</li>
                            <li>Clear swipe prompt arrow to maximize engagement rate.</li>
                            <li>Optimized for Instagram feed bookmarking.</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-hairline">
                    <button
                      onClick={() => startSprint(hook)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-secondary text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-accent-brass-400" />
                      <span>Practice 3-Sec Teleprompter Delivery</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('teleprompter')}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-secondary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Video className="h-3.5 w-3.5 text-accent-brass-400" />
                          <span>Teleprompter</span>
                        </button>
                      )}

                      {onSelectHookForCampaign && (
                        <button
                          onClick={() => onSelectHookForCampaign(displayText)}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 hover:brightness-105 text-slate-950 font-black text-xs shadow-[var(--shadow-glow-brass)] flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer"
                        >
                          <span>Launch Campaign</span>
                          <ArrowRight className="h-4 w-4 text-slate-950" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPRINT TELEPROMPTER DELIVERY MODAL */}
      {sprintHook && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-0 border border-accent-brass-500/50 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-[var(--shadow-panel-brass)] relative">
            <button
              onClick={() => {
                setSprintHook(null);
                setIsSprintRunning(false);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className="absolute right-4 top-4 p-2 rounded-xl bg-surface-1 border border-hairline text-accent-brass-300 hover:text-ink-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brass-400 text-slate-950 text-xs font-black border border-brass-300 shadow">
                <Clock className="h-3.5 w-3.5" />
                <span>3-Second Video Retention Sprint Test</span>
              </div>
              <h3 className="text-2xl font-black text-ink-primary">Deliver Your Hook Aloud</h3>
              <p className="text-xs text-accent-brass-200/80">
                Practice speaking this hook with energy in under 3.0 seconds!
              </p>
            </div>

            {/* Countdown Ring */}
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className={`h-24 w-24 rounded-full border-4 flex items-center justify-center font-black text-4xl transition-colors ${
                sprintTimer > 0 ? 'border-accent-brass-400 text-accent-brass-300 animate-pulse shadow-[var(--shadow-glow-brass)]' : 'border-status-positive text-status-positive'
              }`}>
                {sprintTimer > 0 ? sprintTimer : 'GO!'}
              </div>

              <div className="text-xs font-bold text-ink-secondary">
                {isSprintRunning ? 'Deliver hook with high energy...' : 'Delivery Sprint Completed!'}
              </div>
            </div>

            {/* Hook text teleprompter box */}
            <div className="bg-surface-0 p-6 rounded-xl border border-accent-brass-500/40 text-center text-xl font-black text-ink-primary leading-snug">
              &quot;{getDisplayText(sprintHook)}&quot;
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => speakHookText(getDisplayText(sprintHook))}
                className="px-4 py-2.5 rounded-xl bg-surface-1 hover:bg-surface-2 text-ink-secondary text-xs font-bold flex items-center gap-2 border border-hairline-strong"
              >
                <Volume2 className="h-4 w-4 text-accent-brass-400" />
                <span>Replay AI Voiceover</span>
              </button>

              <button
                onClick={() => {
                  setSprintTimer(3);
                  setIsSprintRunning(true);
                  speakHookText(getDisplayText(sprintHook));
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 hover:brightness-105 text-slate-950 font-black text-xs shadow-[var(--shadow-glow-brass)] flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4 text-slate-950" />
                <span>Retry Sprint</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
