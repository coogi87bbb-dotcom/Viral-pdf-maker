import React, { useState, useEffect } from 'react';
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
import { MotionPanel3D } from './MotionPanel3D';
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
      const response = await fetch('/api/viral/generate-hooks', {
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
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black border border-amber-300 shadow mb-3">
              <BrainCircuit className="h-4 w-4 text-slate-950" />
              <span>Cognitive Psychology & Attention Mechanics Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Psychological Hook Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-black tracking-normal uppercase border-b-2 border-amber-700">
                v10.0 Pro
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              The first 3 seconds dictate 90% of your post or video performance. Engineer irresistible, high-conversion scroll-stoppers using behavioral economics, cognitive biases, and viral pattern interrupts.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 shrink-0">
            <div className="px-3 py-1.5 text-center border-r border-slate-800">
              <div className="text-lg font-black text-amber-300">10x</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Retention</div>
            </div>
            <div className="px-3 py-1.5 text-center border-r border-slate-800">
              <div className="text-lg font-black text-amber-400">0.5s</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Scroll Stop</div>
            </div>
            <div className="px-3 py-1.5 text-center">
              <div className="text-lg font-black text-white">{savedHooks.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">In Vault</div>
            </div>
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
          <button
            onClick={() => setStudioTab('generator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active:translate-y-0.5 cursor-pointer ${
              studioTab === 'generator'
                ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            <span>AI Psychological Generator</span>
          </button>

          <button
            onClick={() => setStudioTab('swipefile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active:translate-y-0.5 cursor-pointer ${
              studioTab === 'swipefile'
                ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Viral Swipe File (30 Iconic Hooks)</span>
          </button>

          <button
            onClick={() => setStudioTab('frameworks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active:translate-y-0.5 cursor-pointer ${
              studioTab === 'frameworks'
                ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>10 Cognitive Psychology Frameworks</span>
          </button>

          <button
            onClick={() => setStudioTab('vault')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active:translate-y-0.5 cursor-pointer ${
              studioTab === 'vault'
                ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Core Topic or Premise
                  </label>
                  <span className="text-[11px] text-amber-300 font-medium">
                    Be specific for maximum psychological accuracy
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. How to use AI agents to automate social media marketing..."
                    className="w-full bg-slate-950 border-2 border-amber-500/30 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 pr-12 shadow-inner"
                    required
                  />
                  <Sparkles className="absolute right-4 top-3.5 h-5 w-5 text-amber-400 pointer-events-none" />
                </div>
              </div>

              {/* Quick Topic Chips */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                  ⚡ Quick Preset Topics (Click to Auto-fill):
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SWIPE_TOPICS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(preset)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/60 hover:bg-slate-800 text-[11px] text-slate-300 transition-all text-left truncate max-w-xs cursor-pointer"
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Niche / Field
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Target Format / Style
                  </label>
                  <select
                    value={formatStyle}
                    onChange={(e) => setFormatStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">⚡ All Social Formats</option>
                    <option value="video-0-3s">🎥 Short Video Script (0-3s Voiceover)</option>
                    <option value="x-thread">🐤 X / Twitter Thread Opener</option>
                    <option value="linkedin-fold">💼 LinkedIn "...see more" Cutoff</option>
                    <option value="carousel-cover">🖼️ Carousel Slide 1 Cover</option>
                    <option value="email-subject">📧 Email Subject Line</option>
                  </select>
                </div>

                {/* Audience Temp */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Audience Temperature
                  </label>
                  <select
                    value={audienceTemp}
                    onChange={(e) => setAudienceTemp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="cold">❄️ Cold Audience (Skeptic / Stranger)</option>
                    <option value="warm">🔥 Warm Followers (Engaged)</option>
                    <option value="hot">💎 Hot Prospects (Ready to Buy)</option>
                  </select>
                </div>

                {/* Spiciness Level */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Controversy / Spiciness
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSpiciness('mild')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        spiciness === 'mild' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Mild 🟢
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpiciness('spicy')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        spiciness === 'spicy' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Spicy 🔥
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpiciness('nuclear')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        spiciness === 'nuclear' ? 'bg-slate-800 text-pink-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Nuclear ⚛️
                    </button>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-sm shadow-[0_8px_30px_rgba(212,175,55,0.4)] border-b-4 border-amber-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:translate-y-0.5"
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
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Filter By Cognitive Framework:
                </label>
                <span className="text-[11px] text-slate-500">
                  Click to isolate specific psychological mechanisms
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={() => setSelectedFramework('all')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    selectedFramework === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ All Frameworks
                </button>
                {EXTENDED_HOOK_FRAMEWORKS.slice(0, 9).map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left truncate ${
                      selectedFramework === fw.id
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
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
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                  <span>30 Iconic Viral Hook Formulas</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hand-curated formulas responsible for over 100M total impressions across X, TikTok, and LinkedIn.
                </p>
              </div>

              <button
                onClick={() => {
                  setHooks(ICONIC_SWIPE_FILE_HOOKS);
                  setStudioTab('generator');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold hover:bg-amber-300 transition-all shrink-0 cursor-pointer shadow"
              >
                Load into Studio
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ICONIC_SWIPE_FILE_HOOKS.map((swipe, idx) => (
                <div
                  key={swipe.id || idx}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Formula #{idx + 1}: {swipe.framework}
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      {swipe.viralityScore}/100 Virality
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-white bg-slate-900 p-3.5 rounded-xl border border-slate-800 leading-snug">
                    &quot;{swipe.hookText}&quot;
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div><strong>Trigger:</strong> {swipe.emotionalTrigger}</div>
                    <div><strong>Why It Works:</strong> {swipe.whyItWorks}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <button
                      onClick={() => {
                        setTopic(swipe.hookText);
                        setStudioTab('generator');
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Use Formula to Generate Variations</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopy(`swipe-${idx}`, swipe.hookText)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs cursor-pointer"
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
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-amber-400" />
                <span>The 10 Psychological Principles of Content Virality</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Learn the behavioral science mechanisms behind why users stop scrolling, click expand, and share content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXTENDED_HOOK_FRAMEWORKS.map((fw) => (
                <div
                  key={fw.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${fw.badgeColor}`}>
                        {fw.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      Bias: {fw.cognitiveBias}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {fw.description}
                  </p>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                    <div className="text-amber-400 font-bold">🎯 Scroll-Stop Mechanism:</div>
                    <div className="text-slate-400">{fw.scrollStopMechanism}</div>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 text-xs space-y-1">
                    <div className="text-emerald-400 font-bold">✨ Real Example:</div>
                    <div className="text-white italic">&quot;{fw.example}&quot;</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Ideal Platforms: <strong className="text-slate-300">{fw.idealPlatform}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedFramework(fw.id);
                        setStudioTab('generator');
                      }}
                      className="text-amber-400 hover:underline font-bold cursor-pointer"
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
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-amber-400" />
                  <span>My Saved Hook Vault ({savedHooks.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
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
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {copiedId === 'vault-all' ? 'Copied All Markdown!' : 'Copy All Saved'}
                  </button>

                  <button
                    onClick={() => setSavedHooks([])}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs cursor-pointer"
                    title="Clear Vault"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {savedHooks.length === 0 ? (
              <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <Bookmark className="h-10 w-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">Your Vault is Empty</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click the bookmark icon on any generated hook to save it to your personal swipe file.
                </p>
                <button
                  onClick={() => setStudioTab('generator')}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Generate Hooks Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedHooks.map((hook, idx) => (
                  <div
                    key={hook.id || idx}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {hook.framework}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(hook.id, hook.hookText)}
                          className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 cursor-pointer"
                        >
                          {copiedId === hook.id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => toggleSaveHook(hook)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-base font-extrabold text-white bg-slate-900 p-4 rounded-xl border border-slate-800">
                      &quot;{hook.hookText}&quot;
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-400">
                        Trigger: <strong className="text-slate-200">{hook.emotionalTrigger}</strong>
                      </div>

                      {onSelectHookForCampaign && (
                        <button
                          onClick={() => onSelectHookForCampaign(hook.hookText)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md border-b-2 border-amber-700 cursor-pointer"
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
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Flame className="h-6 w-6 text-amber-400 animate-pulse" />
              <span>Generated Viral Hooks ({filteredHooks.length})</span>
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs text-slate-200 font-semibold"
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
                  className="bg-slate-900/90 rounded-3xl border border-slate-800/90 p-6 shadow-2xl hover:border-amber-500/40 transition-all space-y-5 relative overflow-hidden"
                >
                  {/* Card Top Metadata & Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wide">
                        {hook.framework}
                      </span>

                      {hook.cognitiveBias && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          🧠 {hook.cognitiveBias}
                        </span>
                      )}

                      {hook.spicinessLevel && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          hook.spicinessLevel === 'Nuclear Viral'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : hook.spicinessLevel === 'Spicy'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {hook.spicinessLevel === 'Nuclear Viral' ? '⚛️ Nuclear' : hook.spicinessLevel === 'Spicy' ? '🔥 Spicy' : '🟢 Mild'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <TrendingUp className="h-4 w-4" />
                        <span>{hook.viralityScore}/100 Virality</span>
                      </div>

                      <button
                        onClick={() => toggleSaveHook(hook)}
                        className={`p-2 rounded-xl transition-all border cursor-pointer ${
                          isSaved 
                            ? 'bg-amber-400 text-slate-950 font-black border-amber-300' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title={isSaved ? "Saved to Vault" : "Save to Vault"}
                      >
                        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => handleCopy(hookId, displayText)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
                        title="Copy Hook"
                      >
                        {copiedId === hookId ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-amber-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* A/B Variation Tabs Selector */}
                  <div className="flex items-center gap-1.5 bg-black p-1.5 rounded-2xl border border-amber-500/30 overflow-x-auto shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 shrink-0">
                      A/B Variations:
                    </span>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'standard' }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        currentVar === 'standard' ? 'bg-amber-400 text-slate-950 shadow border-b-2 border-amber-600' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      ⚡ Standard
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'punchy' }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        currentVar === 'punchy' ? 'bg-amber-400 text-slate-950 shadow border-b-2 border-amber-600' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🥊 Punchy 1-Liner
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'storyDriven' }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        currentVar === 'storyDriven' ? 'bg-amber-400 text-slate-950 shadow border-b-2 border-amber-600' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      📖 Story Opener
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'question' }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        currentVar === 'question' ? 'bg-amber-400 text-slate-950 shadow border-b-2 border-amber-600' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      ❓ Curiosity Question
                    </button>
                    <button
                      onClick={() => setActiveVariation(prev => ({ ...prev, [hookId]: 'metricDriven' }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        currentVar === 'metricDriven' ? 'bg-amber-400 text-slate-950 shadow border-b-2 border-amber-600' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      📊 Metric-Heavy
                    </button>
                  </div>

                  {/* Main Hook Headline Display */}
                  <div className="relative group">
                    <div className="text-lg sm:text-xl font-black text-white bg-black p-5 rounded-2xl border-2 border-amber-500/40 leading-snug tracking-tight shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
                      &quot;{displayText}&quot;
                    </div>

                    {/* Quick Speak Button overlay */}
                    <button
                      onClick={() => speakHookText(displayText)}
                      className="absolute right-3 bottom-3 p-2 rounded-xl bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 transition-all border border-amber-500/40 shadow cursor-pointer"
                      title="Listen Aloud (Speech Preview)"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Psychology Rationale & Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/20 flex items-start gap-2.5">
                      <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 block mb-0.5">Psychology Rationale:</strong>
                        <span className="text-slate-300 leading-relaxed">{hook.whyItWorks}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between gap-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Emotional Trigger:</span>
                        <strong className="text-slate-200">{hook.emotionalTrigger}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Speaking Speed:</span>
                        <strong className="text-amber-400">{hook.spokenDurationSec || 2.4}s (WPM optimal)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Platform Visual Simulator Controls */}
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-amber-400" />
                        <span>Platform Render Simulator:</span>
                      </span>

                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'x' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            activeEmul === 'x' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Twitter className="h-3 w-3" />
                          <span>X Tweet</span>
                        </button>

                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'linkedin' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            activeEmul === 'linkedin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Linkedin className="h-3 w-3" />
                          <span>LinkedIn Cutoff</span>
                        </button>

                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'tiktok' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            activeEmul === 'tiktok' ? 'bg-cyan-500 text-black font-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Video className="h-3 w-3" />
                          <span>TikTok 0-3s</span>
                        </button>

                        <button
                          onClick={() => setActivePlatformEmulator(prev => ({ ...prev, [hookId]: 'carousel' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            activeEmul === 'carousel' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Layers className="h-3 w-3" />
                          <span>Carousel Cover</span>
                        </button>
                      </div>
                    </div>

                    {/* PREVIEW CONTAINER BASED ON SELECTED PLATFORM */}
                    {activeEmul === 'x' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/20 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                            OS
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1">
                              <span>Viral Growth Director</span>
                              <span className="text-sky-400">✓</span>
                            </div>
                            <div className="text-[11px] text-slate-500">@viralos_official</div>
                          </div>
                        </div>
                        <div className="text-sm font-normal text-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
                          {displayText}
                        </div>
                        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900 flex items-center justify-between">
                          <span>{displayText.length} / 280 characters</span>
                          <span className="text-emerald-400 font-bold">Optimal Thread Opening Length</span>
                        </div>
                      </div>
                    )}

                    {activeEmul === 'linkedin' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/20 space-y-2">
                        <div className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
                          <Linkedin className="h-3.5 w-3.5" />
                          <span>LinkedIn First 140 Characters (&quot;...see more&quot; Fold Check):</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-100 leading-snug">
                          {displayText.slice(0, 140)}
                          <span className="text-amber-400 font-black cursor-pointer bg-amber-500/10 px-1 rounded ml-1">
                            ...see more
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-1">
                          {displayText.length <= 140 ? (
                            <span className="text-emerald-400 font-bold">✓ 100% visible before fold</span>
                          ) : (
                            <span className="text-amber-400 font-bold">⚠️ Payload extends after fold — curiosity gap triggered!</span>
                          )}
                        </div>
                      </div>
                    )}

                    {activeEmul === 'tiktok' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/20 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-48 aspect-[9/16] bg-slate-900 rounded-xl border border-cyan-500/30 p-3 flex flex-col justify-between relative overflow-hidden shrink-0 shadow-lg">
                          <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold">
                            <span>0:00 - 0:03</span>
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20">HOOK ZONE</span>
                          </div>

                          <div className="bg-black/80 backdrop-blur p-2 rounded-lg border border-cyan-400/50 text-center space-y-1">
                            <span className="text-[9px] font-black uppercase text-amber-400 block tracking-wider">
                              On-Screen Headline
                            </span>
                            <div className="text-xs font-black text-white leading-tight">
                              &quot;{displayText.slice(0, 45)}...&quot;
                            </div>
                          </div>

                          <div className="text-[9px] text-slate-400 text-center">
                            🔊 Speak time: ~{hook.spokenDurationSec || 2.4}s
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="font-bold text-white">Video Retention Guidelines:</div>
                          <ul className="space-y-1 text-slate-400 list-disc list-inside">
                            <li>Deliver the audio hook in under 3.0 seconds.</li>
                            <li>Include bold visual pattern interrupt in frame 1.</li>
                            <li>Use auto-captions positioned in the middle third safe zone.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeEmul === 'carousel' && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-56 aspect-[4/5] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-amber-500/30 p-4 flex flex-col justify-between shrink-0 shadow-lg">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 w-fit">
                            Slide 1 / 10
                          </span>

                          <div className="space-y-2">
                            <h4 className="text-sm font-extrabold text-white leading-snug">
                              {displayText}
                            </h4>
                            <p className="text-[10px] text-slate-400">Swipe for full strategy &rarr;</p>
                          </div>

                          <div className="text-[10px] text-slate-500 flex justify-between items-center">
                            <span>@viralos</span>
                            <span>Save Post 🔖</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="font-bold text-white">Carousel Slide 1 Best Practices:</div>
                          <ul className="space-y-1 text-slate-400 list-disc list-inside">
                            <li>High contrast typography against dark canvas.</li>
                            <li>Clear swipe prompt arrow to maximize engagement rate.</li>
                            <li>Optimized for Instagram feed bookmarking.</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => startSprint(hook)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span>Practice 3-Sec Teleprompter Delivery</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('teleprompter')}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Video className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Teleprompter</span>
                        </button>
                      )}

                      {onSelectHookForCampaign && (
                        <button
                          onClick={() => onSelectHookForCampaign(displayText)}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-xs shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700 flex items-center justify-center gap-2 transition-all active:translate-y-0.5 cursor-pointer"
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
          <div className="bg-slate-950 border-2 border-amber-500/50 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
            <button
              onClick={() => {
                setSprintHook(null);
                setIsSprintRunning(false);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black border border-amber-300 shadow">
                <Clock className="h-3.5 w-3.5" />
                <span>3-Second Video Retention Sprint Test</span>
              </div>
              <h3 className="text-2xl font-black text-white">Deliver Your Hook Aloud</h3>
              <p className="text-xs text-amber-200/80">
                Practice speaking this hook with energy in under 3.0 seconds!
              </p>
            </div>

            {/* Countdown Ring */}
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className={`h-24 w-24 rounded-full border-4 flex items-center justify-center font-black text-4xl transition-all ${
                sprintTimer > 0 ? 'border-amber-400 text-amber-300 animate-pulse shadow-[0_0_25px_rgba(212,175,55,0.5)]' : 'border-emerald-400 text-emerald-400'
              }`}>
                {sprintTimer > 0 ? sprintTimer : 'GO!'}
              </div>

              <div className="text-xs font-bold text-slate-200">
                {isSprintRunning ? '⏱️ Deliver hook with high energy...' : '✅ Delivery Sprint Completed!'}
              </div>
            </div>

            {/* Hook text teleprompter box */}
            <div className="bg-black p-6 rounded-2xl border-2 border-amber-500/40 text-center text-xl font-black text-white leading-snug shadow-inner">
              &quot;{getDisplayText(sprintHook)}&quot;
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => speakHookText(getDisplayText(sprintHook))}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700"
              >
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span>Replay AI Voiceover</span>
              </button>

              <button
                onClick={() => {
                  setSprintTimer(3);
                  setIsSprintRunning(true);
                  speakHookText(getDisplayText(sprintHook));
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700 flex items-center gap-2 cursor-pointer active:translate-y-0.5"
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
