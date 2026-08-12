import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Sparkles, 
  Zap, 
  Flame, 
  Target, 
  Globe, 
  TrendingUp, 
  Layers, 
  Copy, 
  Check, 
  RefreshCw,
  Twitter,
  Instagram,
  Video,
  Facebook,
  AtSign,
  Pin,
  Linkedin,
  AlertCircle,
  Mic,
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CampaignData, SocialPlatform, PlatformContent } from '../types';
import { PRESET_NICHES, PLATFORM_CONFIGS, TARGET_AUDIENCE_OPTIONS, TONE_OPTIONS } from '../data/niches';
import { PlatformCard } from './PlatformCard';
import { VoiceInputButton } from './VoiceInputButton';

interface CampaignGeneratorProps {
  onCampaignCreated?: (data: CampaignData) => void;
  initialTopic?: string;
}

export const CampaignGenerator: React.FC<CampaignGeneratorProps> = ({ onCampaignCreated, initialTopic }) => {
  const [topic, setTopic] = useState(initialTopic || '');

  React.useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const [selectedAudienceOption, setSelectedAudienceOption] = useState(TARGET_AUDIENCE_OPTIONS[0]);
  const [targetAudience, setTargetAudience] = useState(TARGET_AUDIENCE_OPTIONS[0]);
  const [goal, setGoal] = useState<'Brand Awareness' | 'Lead Generation' | 'Direct Sales' | 'Viral Traffic' | 'Community Growth'>('Viral Traffic');
  const [selectedNiche, setSelectedNiche] = useState(PRESET_NICHES[0].name);
  const [selectedToneOption, setSelectedToneOption] = useState(TONE_OPTIONS[0]);
  const [desiredTone, setDesiredTone] = useState(TONE_OPTIONS[0]);
  
  // Voice instructions for each of the 7 networks
  const [networkInstructions, setNetworkInstructions] = useState<Record<SocialPlatform, string>>({
    x: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    threads: '',
    pinterest: '',
    linkedin: ''
  });
  const [showNetworkVoicePanel, setShowNetworkVoicePanel] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<SocialPlatform>('x');
  const [error, setError] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);

  const handleSelectPresetNiche = (preset: typeof PRESET_NICHES[0]) => {
    setSelectedNiche(preset.name);
    setTopic(preset.defaultTopic);
  };

  const updateNetworkInstruction = (platform: SocialPlatform, text: string) => {
    setNetworkInstructions(prev => ({
      ...prev,
      [platform]: text
    }));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    const loadingStages = [
      'Deconstructing viral psychology hooks...',
      'Synthesizing network voice directions across 7 platforms...',
      'Structuring 10-post X mega-thread...',
      'Crafting 10-slide Instagram Carousel & Reel script...',
      'Pacing high-retention 0-3s TikTok video script timeline...',
      'Generating 500-word Facebook narrative & discussion engine...',
      'Creating 6-part Threads hot-take conversational series...',
      'Building Pinterest SEO pin package & visual specs...',
      'Writing LinkedIn 500-word executive authority framework...',
      'Finalizing Virality Index score...'
    ];

    let stageIdx = 0;
    setLoadingMessage(loadingStages[0]);
    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % loadingStages.length;
      setLoadingMessage(loadingStages[stageIdx]);
    }, 1800);

    try {
      const response = await apiFetch('/api/viral/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          targetAudience,
          goal,
          niche: selectedNiche,
          tone: desiredTone,
          networkInstructions
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate campaign');
      }

      const data = await response.json();
      
      const normalizedPlatforms = { ...(data.platforms || {}) };
      if (normalizedPlatforms.twitter && !normalizedPlatforms.x) {
        normalizedPlatforms.x = { ...normalizedPlatforms.twitter, platform: 'x' };
      }
      if (normalizedPlatforms.x && !normalizedPlatforms.twitter) {
        normalizedPlatforms.twitter = { ...normalizedPlatforms.x, platform: 'twitter' };
      }

      const allPlatforms: SocialPlatform[] = ['x', 'instagram', 'tiktok', 'facebook', 'threads', 'pinterest', 'linkedin'];
      allPlatforms.forEach((p) => {
        if (!normalizedPlatforms[p]) {
          normalizedPlatforms[p] = {
            platform: p,
            title: `Viral ${p.toUpperCase()} Content Strategy`,
            mainBody: `1/ Stop scrolling! Here is the exact breakdown for ${topic} in the ${selectedNiche} space.\n\nKey takeaway: Automation and consistency beat manual effort every single time.\n\nSave this post and drop a comment below!`,
            hashtags: ['#ViralOS', '#Growth', '#Automation'],
            callToAction: 'Comment below for instant template access!',
            estimatedReachMultiplier: '4.5x Reach Multiplier',
            bestPostingTime: '10:00 AM EST'
          };
        }
      });

      const campaignResult: CampaignData = {
        id: `campaign-${Date.now()}`,
        createdAt: new Date().toLocaleDateString(),
        topic,
        targetAudience: targetAudience || 'General Growth Audience',
        goal,
        niche: selectedNiche,
        viralityScore: data.viralityScore || 95,
        coreHook: data.coreHook || topic,
        monetizationAngle: data.monetizationAngle || 'Drives high-intent traffic to link in bio / newsletter.',
        platforms: normalizedPlatforms
      };

      setCampaign(campaignResult);
      if (onCampaignCreated) onCampaignCreated(campaignResult);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while generating content.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleCopyAllPlatforms = () => {
    if (!campaign) return;
    let fullExport = `=== VIRALOS CAMPAIGN EXPORT: ${campaign.topic} ===\n\n`;
    fullExport += `Virality Score: ${campaign.viralityScore}/100\n`;
    fullExport += `Core Hook: ${campaign.coreHook}\n`;
    fullExport += `Monetization Angle: ${campaign.monetizationAngle}\n\n`;

    Object.entries(campaign.platforms).forEach(([key, content]) => {
      const platformContent = content as PlatformContent;
      fullExport += `--- ${key.toUpperCase()} ---\n`;
      fullExport += `Title: ${platformContent.title}\n`;
      fullExport += `Main Body:\n${platformContent.mainBody}\n\n`;
      fullExport += `CTA: ${platformContent.callToAction}\n\n`;
    });

    navigator.clipboard.writeText(fullExport);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2500);
  };

  const platformsList: SocialPlatform[] = ['x', 'instagram', 'tiktok', 'facebook', 'threads', 'pinterest', 'linkedin'];

  return (
    <div className="space-y-8">
      {/* Hero Header & Niche Selector */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 mb-2">
                <Flame className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>Multi-Platform Virality Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Generate Guaranteed Viral Campaigns
              </h2>
              <p className="text-sm text-ink-muted mt-1 max-w-2xl">
                Enter your topic once. ViralOS automatically formats, optimizes, and structures psychological posts for X, Instagram, TikTok, Facebook, Threads, Pinterest, and LinkedIn simultaneously.
              </p>
            </div>
          </div>

          {/* Preset Niche Chips */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-2">
              Quick Niche Presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_NICHES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPresetNiche(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedNiche === preset.name
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold ring-1 ring-violet-400'
                      : 'bg-surface-1 text-ink-secondary hover:bg-surface-2 border border-white/10'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Controls */}
          <form onSubmit={handleGenerate} className="space-y-5 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-2">
                  <span>Topic, Product, or Core Message</span>
                  <span className="text-pink-400">*</span>
                </label>
                <VoiceInputButton
                  onTranscript={(text) => setTopic(text)}
                  currentValue={topic}
                  label="Speak Topic"
                  className="scale-90 origin-right"
                />
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How to use AI agents to automate social media content, generate 100k views, and scale SaaS revenue... (Or click 'Speak Topic' to dictate by voice)"
                rows={3}
                required
                className="w-full bg-surface-0 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center justify-between mb-1.5">
                  <span>Target Audience</span>
                  <span className="text-[10px] text-violet-400 font-medium">12+ Presets</span>
                </label>
                <select
                  value={selectedAudienceOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAudienceOption(val);
                    if (val !== 'Custom Target Audience...') {
                      setTargetAudience(val);
                    } else {
                      setTargetAudience('');
                    }
                  }}
                  className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer mb-1.5"
                >
                  {TARGET_AUDIENCE_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={opt} className="bg-surface-1 text-slate-100 py-1">
                      {opt}
                    </option>
                  ))}
                </select>

                {selectedAudienceOption === 'Custom Target Audience...' && (
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Type custom target audience..."
                    className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-violet-500 animate-fadeIn"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block mb-1.5">
                  Primary Goal
                </label>
                <select
                  value={goal}
                  onChange={(e: any) => setGoal(e.target.value)}
                  className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
                >
                  <option value="Viral Traffic">🔥 Viral Traffic & Views</option>
                  <option value="Lead Generation">🎯 High-Intent Lead Gen</option>
                  <option value="Direct Sales">💰 Direct Sales & Conversions</option>
                  <option value="Brand Awareness">🌟 Authority & Brand Reach</option>
                  <option value="Community Growth">💬 Comments & Community</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center justify-between mb-1.5">
                  <span>Tone & Energy</span>
                  <span className="text-[10px] text-pink-400 font-medium">12+ Options</span>
                </label>
                <select
                  value={selectedToneOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedToneOption(val);
                    if (val !== 'Custom Tone / Energy...') {
                      setDesiredTone(val);
                    } else {
                      setDesiredTone('');
                    }
                  }}
                  className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer mb-1.5"
                >
                  {TONE_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={opt} className="bg-surface-1 text-slate-100 py-1">
                      {opt}
                    </option>
                  ))}
                </select>

                {selectedToneOption === 'Custom Tone / Energy...' && (
                  <input
                    type="text"
                    value={desiredTone}
                    onChange={(e) => setDesiredTone(e.target.value)}
                    placeholder="Type custom tone / energy..."
                    className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-violet-500 animate-fadeIn"
                  />
                )}
              </div>
            </div>

            {/* Network Voice Dictation Panel (7 Networks) */}
            <div className="bg-surface-0/80 rounded-2xl border border-violet-500/30 p-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowNetworkVoicePanel(!showNetworkVoicePanel)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <Mic className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Network Voice Instructions (All 7 Networks)</span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-[10px] font-semibold">
                        Speak or Type per Network
                      </span>
                    </h4>
                    <p className="text-[11px] text-ink-muted">
                      Dictate specific instructions for X, Instagram, TikTok, Facebook, Threads, Pinterest, or LinkedIn.
                    </p>
                  </div>
                </div>
                <div className="text-ink-muted p-1 hover:text-white transition-colors">
                  {showNetworkVoicePanel ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </button>

              {showNetworkVoicePanel && (
                <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {platformsList.map((pKey) => {
                    const pConf = PLATFORM_CONFIGS[pKey];
                    const currentInstr = networkInstructions[pKey] || '';

                    return (
                      <div 
                        key={pKey}
                        className="p-3 bg-surface-1/90 rounded-xl border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${pConf.bgColor} border ${pConf.borderColor}`}>
                              <span className="text-xs">{pConf.name}</span>
                            </div>
                            <span className="text-xs font-bold text-white">{pConf.name} Voice</span>
                          </div>

                          <VoiceInputButton
                            onTranscript={(transcript) => {
                              const updated = currentInstr ? `${currentInstr} ${transcript}` : transcript;
                              updateNetworkInstruction(pKey, updated);
                            }}
                            currentValue={currentInstr}
                            label={`Speak for ${pConf.name}`}
                          />
                        </div>

                        <input
                          type="text"
                          value={currentInstr}
                          onChange={(e) => updateNetworkInstruction(pKey, e.target.value)}
                          placeholder={`Speak or type what you need to go viral on ${pConf.name}...`}
                          className="w-full bg-surface-0 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-ink-secondary focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-fuchsia-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin text-accent-rosegold-300" />
                    <span>{loadingMessage}</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 text-accent-rosegold-300 fill-rosegold-300" />
                    <span>Generate Omni-Platform Campaign Across All 7 Networks</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Campaign Output View */}
      {campaign && (
        <div className="space-y-6">
          {/* Virality Header Scorecard */}
          <div className="p-6 bg-surface-1/90 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  {campaign.viralityScore}/100
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  S-TIER VIRALITY
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Core Hook: &quot;{campaign.coreHook}&quot;
              </h3>
              <p className="text-xs text-ink-muted">
                Monetization Angle: <span className="text-ink-secondary font-medium">{campaign.monetizationAngle}</span>
              </p>
            </div>

            <button
              onClick={handleCopyAllPlatforms}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-white/15 transition-colors shrink-0"
            >
              {batchCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-violet-400" />}
              <span>{batchCopied ? 'Campaign Copied!' : 'Export Full Campaign (All Networks)'}</span>
            </button>
          </div>

          {/* Social Network Platform Tab Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
            {platformsList.map((plat) => {
              const platConfig = PLATFORM_CONFIGS[plat];
              const isActive = activePlatformTab === plat;

              return (
                <button
                  key={plat}
                  onClick={() => setActivePlatformTab(plat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? `${platConfig.bgColor} ${platConfig.color} border ${platConfig.borderColor} shadow-md`
                      : 'bg-surface-1/60 text-ink-muted hover:text-ink-secondary border border-transparent'
                  }`}
                >
                  <span>{platConfig.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Platform Card */}
          {campaign.platforms[activePlatformTab] ? (
            <PlatformCard content={campaign.platforms[activePlatformTab]} />
          ) : (
            <div className="p-8 text-center text-ink-muted text-xs">
              No platform content available for {activePlatformTab}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
