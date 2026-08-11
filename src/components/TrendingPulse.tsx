import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Flame, 
  Search, 
  TrendingUp, 
  Globe, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  Radio, 
  AlertCircle,
  Copy,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { TrendingPulseData, TrendingTopic } from '../types';

interface TrendingPulseProps {
  onSelectTrendForCampaign?: (topic: string) => void;
}

export const TrendingPulse: React.FC<TrendingPulseProps> = ({ onSelectTrendForCampaign }) => {
  const [category, setCategory] = useState('AI & Software SaaS');
  const [customQuery, setCustomQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'AI & Software SaaS',
    'Creator Economy & Marketing',
    'Personal Finance & Wealth',
    'Crypto & Tech Innovation',
    'E-Commerce & DTC Brands',
    'Health, Fitness & Longevity',
    'Real Estate & High-Ticket',
    'B2B Leadership & Sales',
    'Online Education & Courses',
    'Travel & Luxury Lifestyle'
  ];

  const initialTrends: TrendingTopic[] = [
    {
      id: 'trend-1',
      topic: 'Gemini 3.5 & Agentic LLM Automation Workflows',
      platformFocus: 'X / LinkedIn / YouTube',
      searchVolumeGrowth: '+720% Spiking',
      viralityScore: 99,
      summary: 'Massive spike in search activity around zero-employee AI agentic workflows, autonomous LLM software, and replacing $50k marketing retainers with AI tools.',
      suggestedAngle: 'Expose the exact cost breakdown of running an automated SaaS business with Gemini agents versus hiring traditional agencies.',
      recommendedHashtags: ['#AIAgent', '#TechNews', '#Automation', '#GenerativeAI'],
      sourceKeywords: ['Gemini 3.5', 'Agentic Workflows', 'Zero Employee SaaS']
    },
    {
      id: 'trend-2',
      topic: 'Short-Form Video Pattern Interrupts & 0.5s Curiosity Gaps',
      platformFocus: 'TikTok / Instagram Reels / Shorts',
      searchVolumeGrowth: '+540% Spiking',
      viralityScore: 97,
      summary: 'Creators are abandoning long intro greetings in favor of 0.5-second visual shock cuts, on-screen text warnings, and aggressive curiosity gaps.',
      suggestedAngle: 'Break down the top 3 high-retention video hooks working in 2026 with a side-by-side teleprompter demonstration.',
      recommendedHashtags: ['#ContentCreator', '#ViralTikTok', '#ReelsTips', '#Marketing101'],
      sourceKeywords: ['TikTok Algorithm', 'Video Hooks', 'Retention Rate']
    },
    {
      id: 'trend-3',
      topic: 'B2B Direct-Response Pipeline & Comment Lead Magnets',
      platformFocus: 'LinkedIn / X Threads',
      searchVolumeGrowth: '+480% Spiking',
      viralityScore: 95,
      summary: 'Founders are replacing generic links with automated comment keywords ("Comment SCALE below") to multiply lead conversion by 8x.',
      suggestedAngle: 'How to turn 1,000 LinkedIn views into 25 booked sales calls using auto-reply direct messages.',
      recommendedHashtags: ['#B2BMarketing', '#LinkedInGrowth', '#LeadGen', '#Inbound'],
      sourceKeywords: ['Lead Magnet', 'Auto Reply', 'LinkedIn', 'Sales Funnel']
    },
    {
      id: 'trend-4',
      topic: 'Programmatic SEO & AI-Driven Long-Tail Traffic Loops',
      platformFocus: 'Google Search / X / Blogs',
      searchVolumeGrowth: '+410% Spiking',
      viralityScore: 94,
      summary: 'B2B companies are leveraging AI landing page engines to rank for tens of thousands of long-tail intent keywords on Google autonomously.',
      suggestedAngle: 'Show how one brand generated 100k organic search visitors using programmatic SEO and AI landing page templates.',
      recommendedHashtags: ['#SEO2026', '#B2BMarketing', '#OrganicGrowth', '#GrowthHacking'],
      sourceKeywords: ['Programmatic SEO', 'Google Search', 'Organic Traffic']
    },
    {
      id: 'trend-5',
      topic: 'High-CTR Visual Carousels & Saved-Reach Infographics',
      platformFocus: 'Instagram / Pinterest / LinkedIn',
      searchVolumeGrowth: '+390% Spiking',
      viralityScore: 92,
      summary: 'Carousels designed with swipeable cheat-sheets yield 5.2x higher bookmark saves and algorithm distribution.',
      suggestedAngle: 'The 7-slide cheat-sheet framework that generated 50,000 organic saves.',
      recommendedHashtags: ['#CarouselDesign', '#Infographic', '#InstagramTips', '#Design'],
      sourceKeywords: ['Carousels', 'Saved Reach', 'Infographics']
    },
    {
      id: 'trend-6',
      topic: 'Micro-Community Launch & Paid Newsletter Monetization',
      platformFocus: 'Substack / X / Threads',
      searchVolumeGrowth: '+360% Spiking',
      viralityScore: 90,
      summary: 'Top thought leaders are monetizing hyper-niche audiences via private Skool/Discord groups and weekly breakdown letters.',
      suggestedAngle: 'How to build a $5k/month recurring newsletter with under 2,000 total subscribers.',
      recommendedHashtags: ['#Substack', '#Newsletter', '#Monetization', '#Creators'],
      sourceKeywords: ['Paid Newsletter', 'Community', 'Recurring Revenue']
    },
    {
      id: 'trend-7',
      topic: 'AI Audio & Teleprompter Voice Clones in Video Marketing',
      platformFocus: 'TikTok / YouTube Shorts / Instagram',
      searchVolumeGrowth: '+330% Spiking',
      viralityScore: 89,
      summary: 'Ultra-realistic voice clones and instant teleprompter scripts are enabling 10x video creation speed with studio quality.',
      suggestedAngle: 'The exact setup to record 30 viral short-form videos in under 60 minutes.',
      recommendedHashtags: ['#AIAudio', '#Teleprompter', '#VideoProduction', '#ContentStrategy'],
      sourceKeywords: ['Voice Clone', 'Teleprompter', 'Video AI']
    },
    {
      id: 'trend-8',
      topic: 'Contrarian Hot Takes & Audience Polarization Frameworks',
      platformFocus: 'Threads / X / LinkedIn',
      searchVolumeGrowth: '+310% Spiking',
      viralityScore: 88,
      summary: 'Debunking industry consensus beliefs is generating 10x higher reply counts and thread engagement than safe advice.',
      suggestedAngle: 'Why 99% of conventional wisdom in this market is dead wrong, and what to do instead.',
      recommendedHashtags: ['#HotTakes', '#Contrarian', '#DiscussionTrigger', '#ViralPosts'],
      sourceKeywords: ['Debunking', 'Replies', 'Engagement', 'Contrarian']
    },
    {
      id: 'trend-9',
      topic: 'Long-Tail Pinterest SEO Pins & Visual Direct-Traffic Drivers',
      platformFocus: 'Pinterest / Blogs / E-Commerce',
      searchVolumeGrowth: '+280% Spiking',
      viralityScore: 86,
      summary: 'Visual pins with high-contrast text overlays are driving evergreen compounding traffic for up to 18 months post-publish.',
      suggestedAngle: 'How to turn a single blog post or video into 15 evergreen Pinterest pins.',
      recommendedHashtags: ['#PinterestMarketing', '#VisualSEO', '#TrafficHacks'],
      sourceKeywords: ['Pinterest SEO', 'Evergreen Traffic', 'Pin Design']
    },
    {
      id: 'trend-10',
      topic: 'AI-Powered Competitor Domination & Gap Analysis Matrix',
      platformFocus: 'X / LinkedIn / YouTube',
      searchVolumeGrowth: '+260% Spiking',
      viralityScore: 85,
      summary: 'Analyzing competitor top-performing content with AI to spot content gaps and steal viral market share.',
      suggestedAngle: 'How to ethically hijack your competitor\'s highest performing hooks and rewrite them for your brand.',
      recommendedHashtags: ['#CompetitorAnalysis', '#GrowthStrategy', '#MarketDomination'],
      sourceKeywords: ['Competitor Gap', 'Hook Hijack', 'Virality Matrix']
    }
  ];

  const [pulseData, setPulseData] = useState<TrendingPulseData>({
    lastUpdated: 'Live Grounded - Active',
    category: 'AI & Software SaaS',
    trends: initialTrends
  });

  const handleFetchTrends = async (catToFetch?: string) => {
    const targetCat = catToFetch || category;
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/viral/trending-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: targetCat, query: customQuery })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch live search trends');
      }

      const data: TrendingPulseData = await response.json();
      setPulseData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error running search grounded pulse. Ensure Gemini API is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    handleFetchTrends(cat);
  };

  const handleCopyHook = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedTrends = (pulseData.trends || []).filter(t => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      t.topic.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.suggestedAngle.toLowerCase().includes(q) ||
      t.platformFocus.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-300 mb-2">
              <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
              <span>Google Search Grounded 10-Topic Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real-Time 10-Topic Viral Pulse
            </h2>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl">
              Tap into 10 real-time viral web trends, search spikes, and breaking industry discussions. Powered by Google Search Grounding to keep your content ahead of the algorithm curve.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleFetchTrends()}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin text-accent-amber-300" /> : <Globe className="h-4 w-4 text-accent-amber-300" />}
              <span>{loading ? 'Grounding 10 Live Web Trends...' : 'Scan Live Web Pulse (10 Topics)'}</span>
            </button>
          </div>
        </div>

        {/* Category Selector Pills (10 Options) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
              Select Trend Industry Sector (10 Niche Categories):
            </label>
            <span className="text-[11px] text-rose-400 font-medium">Click any to fetch 10 live trends</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-surface-1 border border-white/10 text-ink-secondary hover:bg-surface-2'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Grounding Search & Quick Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Search live topic on Google (e.g., 'SaaS marketing', 'AI video', 'Real Estate')..."
                className="w-full bg-surface-0 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              onClick={() => handleFetchTrends()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-bold transition-colors cursor-pointer"
            >
              Search Web
            </button>
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter these 10 loaded topics..."
              className="w-full bg-surface-0 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Real-time 10-Trend Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span className="font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" />
            <span>Spiking Viral Trends Radar ({displayedTrends.length} Loaded)</span>
          </span>
          <span className="font-mono text-slate-500">{pulseData.lastUpdated}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTrends.map((trend, idx) => (
            <div
              key={trend.id || idx}
              className="bg-surface-1/90 rounded-2xl border border-white/10 p-5 shadow-xl space-y-4 flex flex-col justify-between hover:border-rose-500/50 transition-colors group relative"
            >
              <div className="space-y-3">
                {/* Rank Badge & Metrics Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-xs">
                      #{idx + 1} Trend
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-0 border border-white/10 text-rose-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-rose-400" />
                      {trend.searchVolumeGrowth}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide bg-surface-0 px-2 py-0.5 rounded border border-white/10">
                    {trend.platformFocus}
                  </span>
                </div>

                {/* Topic Headline */}
                <h3 className="text-base font-extrabold text-white group-hover:text-rose-300 transition-colors leading-snug">
                  {trend.topic}
                </h3>

                {/* Virality Score Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-ink-muted">Virality Index:</span>
                    <span className="text-rose-400 font-mono">{trend.viralityScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-0 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full"
                      style={{ width: `${trend.viralityScore}%` }}
                    />
                  </div>
                </div>

                {/* Grounded Summary */}
                <p className="text-xs text-ink-secondary leading-relaxed bg-surface-0 p-3 rounded-xl border border-white/10">
                  {trend.summary}
                </p>

                {/* Suggested High-Converting Hook Angle */}
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-rose-400 block">
                      🧠 Content Hook Angle:
                    </span>
                    <button
                      onClick={() => handleCopyHook(trend.suggestedAngle, trend.id || `t-${idx}`)}
                      className="text-[10px] text-rose-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
                    >
                      {copiedId === (trend.id || `t-${idx}`) ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Hook</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-rose-200 text-[11px] font-medium leading-snug">
                    "{trend.suggestedAngle}"
                  </p>
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {trend.recommendedHashtags?.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded bg-surface-2 text-ink-muted text-[10px] font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {onSelectTrendForCampaign && (
                <button
                  onClick={() => onSelectTrendForCampaign(trend.topic)}
                  className="w-full py-2.5 rounded-xl bg-surface-2 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-rose-600/20 cursor-pointer mt-3"
                >
                  <Zap className="h-3.5 w-3.5 text-accent-amber-300" />
                  <span>Generate Campaign for this Trend</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

