import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Download, 
  Check, 
  Twitter, 
  Instagram, 
  Video, 
  Facebook, 
  AtSign, 
  Pin, 
  Linkedin, 
  Plus, 
  Trash2,
  Edit3,
  Sparkles,
  Zap,
  RefreshCw,
  Copy,
  Sun,
  Moon,
  Filter,
  Layers,
  Share2,
  X,
  FileText,
  Sliders,
  CheckCircle2,
  BarChart2,
  Wand2,
  Send,
  AlertCircle
} from 'lucide-react';
import { SocialPlatform } from '../types';
import { PLATFORM_CONFIGS } from '../data/niches';

export interface CalendarEvent {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  slot: 'Morning Peak' | 'Evening Peak';
  time: string;
  platform: SocialPlatform;
  title: string;
  caption?: string;
  hashtags?: string[];
  mediaType?: 'Video Reel' | 'Carousel Deck' | 'Text Thread' | 'Infographic Pin' | 'Thought Leadership Article';
  status: 'Scheduled' | 'Draft' | 'Published';
}

// Peak Engagement Hours Guide per Platform
const PLATFORM_PEAK_TIMES: Record<string, { morning: string; evening: string; bestType: string }> = {
  x: { morning: '8:30 AM EST', evening: '6:00 PM EST', bestType: 'Viral Thread / Hot Take' },
  instagram: { morning: '9:00 AM EST', evening: '7:30 PM EST', bestType: '8-Slide Carousel Deck' },
  tiktok: { morning: '7:45 AM EST', evening: '8:00 PM EST', bestType: '0-3s Pattern Interrupt Reel' },
  linkedin: { morning: '8:00 AM EST', evening: '5:30 PM EST', bestType: 'B2B Framework Document' },
  pinterest: { morning: '10:00 AM EST', evening: '9:00 PM EST', bestType: 'High-SEO Infographic Pin' },
  threads: { morning: '9:30 AM EST', evening: '7:00 PM EST', bestType: 'Controversial Discussion' },
  facebook: { morning: '11:00 AM EST', evening: '6:30 PM EST', bestType: 'Storytelling & Community' }
};

export const ContentCalendar: React.FC = () => {
  const [exported, setExported] = useState(false);
  const [exportedMD, setExportedMD] = useState(false);
  const [copiedDigest, setCopiedDigest] = useState(false);

  // Filter state
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // AI Calendar Generator Modal state
  const [campaignNiche, setCampaignNiche] = useState('AI Automation & Growth Marketing');
  const [brandVoice, setBrandVoice] = useState('Bold Direct Response & High Authority');
  const [generatingCalendar, setGeneratingCalendar] = useState(false);
  const [showGeneratorBar, setShowGeneratorBar] = useState(false);

  // Edit / Add Post Modal state
  const [activeModalEvent, setActiveModalEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [generatingCopy, setGeneratingCopy] = useState(false);

  // Default 14 Posts (EXACTLY 2 POSTS PER DAY FOR ALL 7 DAYS)
  const [events, setEvents] = useState<CalendarEvent[]>([
    // MONDAY
    {
      id: 'm1',
      day: 'Monday',
      slot: 'Morning Peak',
      time: '8:30 AM EST',
      platform: 'x',
      title: 'Viral X Thread: 3 AI Workflows to Replace $50k/mo Agency Overhead',
      caption: 'Stop burning budget on bloated agency retainers. Here are the 3 autonomous AI workflows driving 10x ROI in 2026.\n\n1. Autonomous Lead Ingestion\n2. Programmatic Copy Generation\n3. Instant Cross-Platform Distribution\n\nComment "WORKFLOW" to get the free setup guide!',
      hashtags: ['#AIWorkflow', '#GrowthHacking', '#SaaS'],
      mediaType: 'Text Thread',
      status: 'Scheduled'
    },
    {
      id: 'm2',
      day: 'Monday',
      slot: 'Evening Peak',
      time: '6:30 PM EST',
      platform: 'instagram',
      title: 'Instagram Carousel: 8 High-Converting Hook Formula Templates',
      caption: '90% of viewers scroll past your post in the first 0.5 seconds. Here are 8 proven pattern interrupts you can copy today.\n\nSlide 1: The Shocking Stat\nSlide 2: The Direct Callout\nSlide 3: The Unpopular Opinion\n\nSwipe left to read all 8 slides!',
      hashtags: ['#InstagramTips', '#ContentCreator', '#ViralHooks'],
      mediaType: 'Carousel Deck',
      status: 'Scheduled'
    },

    // TUESDAY
    {
      id: 't1',
      day: 'Tuesday',
      slot: 'Morning Peak',
      time: '8:00 AM EST',
      platform: 'linkedin',
      title: 'LinkedIn Executive Thought Leadership: B2B Growth Scaling Architecture',
      caption: 'In 2026, content is no longer a marketing expense — it is an automated software distribution asset. Here is how we scaled client acquisition by 340% without hiring extra staff.\n\nRead the full framework breakdown below.',
      hashtags: ['#B2BMarketing', '#Leadership', '#SaaSGrowth'],
      mediaType: 'Thought Leadership Article',
      status: 'Scheduled'
    },
    {
      id: 't2',
      day: 'Tuesday',
      slot: 'Evening Peak',
      time: '7:45 PM EST',
      platform: 'tiktok',
      title: 'TikTok Talking Head Reel: 0-3s Pattern Interrupt Script',
      caption: '"If you are still writing social posts manually in 2026, you are wasting 20 hours a week." Watch how Gemini 3.6 Flash automates a 14-post weekly calendar in 12 seconds.',
      hashtags: ['#TikTokGrowth', '#AITools', '#TechTok'],
      mediaType: 'Video Reel',
      status: 'Scheduled'
    },

    // WEDNESDAY
    {
      id: 'w1',
      day: 'Wednesday',
      slot: 'Morning Peak',
      time: '9:00 AM EST',
      platform: 'threads',
      title: 'Threads Hot Take: Why 99% of Agencies Will Be Replaced by AI Studios',
      caption: 'Unpopular opinion: Traditional marketing agencies charging $10k/mo for manual posts are going extinct. AI Studio Build platforms deliver 10x output at 1/100th the cost.',
      hashtags: ['#Threads', '#AIRevolution', '#Marketing'],
      mediaType: 'Text Thread',
      status: 'Scheduled'
    },
    {
      id: 'w2',
      day: 'Wednesday',
      slot: 'Evening Peak',
      time: '6:00 PM EST',
      platform: 'x',
      title: 'X Breakout Post: 5 AI Prompt Templates to 10x Copy Velocity',
      caption: 'Steal these 5 system prompts to generate high-converting landing page copy, video teleprompter scripts, and viral hooks in seconds.',
      hashtags: ['#PromptEngineering', '#AITricks', '#Productivity'],
      mediaType: 'Text Thread',
      status: 'Scheduled'
    },

    // THURSDAY
    {
      id: 'th1',
      day: 'Thursday',
      slot: 'Morning Peak',
      time: '8:30 AM EST',
      platform: 'pinterest',
      title: 'Pinterest SEO Pin: Programmatic Keyword Strategy Cheatsheet',
      caption: 'Rank #1 on Pinterest visual search with this step-by-step keyword taxonomy map. Save this pin to your Marketing board!',
      hashtags: ['#PinterestSEO', '#DigitalMarketing', '#SEOStrategy'],
      mediaType: 'Infographic Pin',
      status: 'Scheduled'
    },
    {
      id: 'th2',
      day: 'Thursday',
      slot: 'Evening Peak',
      time: '7:00 PM EST',
      platform: 'instagram',
      title: 'Instagram Reel Breakdown: Behind the Scenes of a $20k/mo AI SaaS',
      caption: 'Here is the raw architecture driving our automated social engine. Watch how AI handles content generation, visual overlays, and scheduling automatically.',
      hashtags: ['#BuildInPublic', '#SaaSFounders', '#Automation'],
      mediaType: 'Video Reel',
      status: 'Scheduled'
    },

    // FRIDAY
    {
      id: 'f1',
      day: 'Friday',
      slot: 'Morning Peak',
      time: '8:15 AM EST',
      platform: 'linkedin',
      title: 'LinkedIn Friday Focus: 4 Metrics That Matter in Programmatic Virality',
      caption: 'Ignore vanity likes. If you want real revenue, track these 4 metrics: 1) Save Rate, 2) Hook Retention Rate, 3) Comment Conversion Velocity, 4) Pipeline ROI.',
      hashtags: ['#Analytics', '#GrowthMetrics', '#B2B'],
      mediaType: 'Thought Leadership Article',
      status: 'Scheduled'
    },
    {
      id: 'f2',
      day: 'Friday',
      slot: 'Evening Peak',
      time: '8:00 PM EST',
      platform: 'tiktok',
      title: 'TikTok Viral Mythbusting: "Hashtags are Dead in 2026?"',
      caption: 'Myth busted! Here is how AI semantic search algorithms read your spoken audio script and text overlays to classify your content in under 5 minutes.',
      hashtags: ['#TikTokTips', '#Algorithm', '#MarketingHacks'],
      mediaType: 'Video Reel',
      status: 'Scheduled'
    },

    // SATURDAY
    {
      id: 's1',
      day: 'Saturday',
      slot: 'Morning Peak',
      time: '10:00 AM EST',
      platform: 'facebook',
      title: 'Facebook Group Storytelling: The $0 to 100k Impression Case Study',
      caption: 'How one indie founder used automated cross-platform distribution to hit 100k impressions in 14 days without spending $1 on paid ads.',
      hashtags: ['#CaseStudy', '#OrganicTraffic', '#Founders'],
      mediaType: 'Thought Leadership Article',
      status: 'Scheduled'
    },
    {
      id: 's2',
      day: 'Saturday',
      slot: 'Evening Peak',
      time: '6:30 PM EST',
      platform: 'pinterest',
      title: 'Pinterest Weekend Inspiration: 10 High-Converting Thumbnail Layouts',
      caption: 'Discover the top 10 visual graphic archetypes driving click-throughs on Pinterest and YouTube. Click the link to generate your own in 1 click.',
      hashtags: ['#GraphicDesign', '#ThumbnailIdeas', '#Visuals'],
      mediaType: 'Infographic Pin',
      status: 'Scheduled'
    },

    // SUNDAY
    {
      id: 'su1',
      day: 'Sunday',
      slot: 'Morning Peak',
      time: '9:30 AM EST',
      platform: 'x',
      title: 'X Weekly Recap: The Top 5 AI Breakthroughs You Missed This Week',
      caption: 'Missed the news this week? Here is your 2-minute digest of the top 5 AI and programmatic growth updates reshaping marketing.',
      hashtags: ['#AIDigest', '#TechNews', '#WeeklyRecap'],
      mediaType: 'Text Thread',
      status: 'Scheduled'
    },
    {
      id: 'su2',
      day: 'Sunday',
      slot: 'Evening Peak',
      time: '7:00 PM EST',
      platform: 'instagram',
      title: 'Instagram Sunday Prep: Your 7-Day Social Content Blueprint',
      caption: 'Get your social content locked in for the week ahead. Here is how to schedule 14 posts across 7 channels in under 10 minutes with ViralOS.',
      hashtags: ['#SundayPrep', '#ContentPlanner', '#ProductivityHacks'],
      mediaType: 'Carousel Deck',
      status: 'Scheduled'
    }
  ]);

  const daysOfWeek: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // AI Generate Full 14-Post Calendar
  const handleGenerateAICalendar = async () => {
    setGeneratingCalendar(true);
    try {
      const response = await apiFetch('/api/viral/generate-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: campaignNiche,
          brandVoice,
          targetPlatforms: ['x', 'instagram', 'tiktok', 'linkedin', 'pinterest', 'threads', 'facebook']
        })
      });

      if (!response.ok) throw new Error('Failed to generate AI calendar');
      const data = await response.json();

      if (data.calendar && data.calendar.length > 0) {
        setEvents(data.calendar);
        setShowGeneratorBar(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCalendar(false);
    }
  };

  // AI Enhancer for Active Post Modal
  const handleEnhanceActivePost = async () => {
    if (!activeModalEvent || !activeModalEvent.title) return;
    setGeneratingCopy(true);

    try {
      const response = await apiFetch('/api/viral/generate-post-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeModalEvent.title,
          platform: activeModalEvent.platform,
          brandVoice
        })
      });

      if (!response.ok) throw new Error('Copy generation failed');
      const data = await response.json();

      setActiveModalEvent({
        ...activeModalEvent,
        caption: data.caption || activeModalEvent.caption,
        hashtags: data.hashtags || activeModalEvent.hashtags,
        time: data.recommendedPostingTime || activeModalEvent.time
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCopy(false);
    }
  };

  // Save Modal Event
  const handleSaveModalEvent = () => {
    if (!activeModalEvent) return;

    if (events.some(e => e.id === activeModalEvent.id)) {
      setEvents(events.map(e => e.id === activeModalEvent.id ? activeModalEvent : e));
    } else {
      setEvents([...events, activeModalEvent]);
    }

    setActiveModalEvent(null);
  };

  // Add new post for specific day and slot
  const handleAddSlotPost = (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday', slot: 'Morning Peak' | 'Evening Peak') => {
    const isMorning = slot === 'Morning Peak';
    const newEvt: CalendarEvent = {
      id: `evt-custom-${Date.now()}`,
      day,
      slot,
      time: isMorning ? '8:30 AM EST' : '6:30 PM EST',
      platform: 'instagram',
      title: `[${slot}] ${campaignNiche} Post`,
      caption: 'Write high-converting post caption here...',
      hashtags: ['#ViralOS', '#Growth'],
      mediaType: 'Carousel Deck',
      status: 'Scheduled'
    };
    setActiveModalEvent(newEvt);
    setIsEditing(true);
  };

  // Exports
  const handleExportCSV = () => {
    let csvContent = 'Day,Slot,Time,Platform,Title,MediaType,Status,Caption,Hashtags\n';
    events.forEach(e => {
      const cleanCap = (e.caption || '').replace(/"/g, '""');
      const cleanTags = (e.hashtags || []).join(' ');
      csvContent += `"${e.day}","${e.slot}","${e.time}","${e.platform}","${e.title.replace(/"/g, '""')}","${e.mediaType || ''}","${e.status}","${cleanCap}","${cleanTags}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viralos-2x-daily-schedule-${Date.now()}.csv`;
    a.click();

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const handleExportMarkdown = () => {
    let md = `# 📅 ViralOS 7-Day 2x Daily Distribution Campaign Brief\n\n`;
    md += `**Campaign Niche:** ${campaignNiche}\n`;
    md += `**Total Scheduled Slots:** ${events.length} Posts (2x / Day)\n\n`;

    daysOfWeek.forEach(day => {
      md += `## 🗓️ ${day}\n\n`;
      const dayEvts = events.filter(e => e.day === day);
      dayEvts.forEach(evt => {
        md += `### [${evt.slot}] ${evt.time} - ${evt.platform.toUpperCase()} (${evt.mediaType || 'Post'})\n`;
        md += `**Title:** ${evt.title}\n\n`;
        md += `**Caption:**\n${evt.caption || 'N/A'}\n\n`;
        md += `**Hashtags:** ${(evt.hashtags || []).join(' ')}\n\n`;
        md += `---\n\n`;
      });
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viralos-2x-daily-campaign-${Date.now()}.md`;
    a.click();

    setExportedMD(true);
    setTimeout(() => setExportedMD(false), 2500);
  };

  const handleCopyTextDigest = () => {
    let digest = `🔥 VIRALOS 14-POST WEEKLY CONTENT DIGEST (2X/DAY)\n\n`;
    events.forEach((evt, idx) => {
      digest += `${idx + 1}. [${evt.day} - ${evt.slot}] ${evt.platform.toUpperCase()} @ ${evt.time}\nHeadline: ${evt.title}\nCaption: ${evt.caption || ''}\nHashtags: ${(evt.hashtags || []).join(' ')}\n\n-------------------\n\n`;
    });
    navigator.clipboard.writeText(digest);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2500);
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'x': return <Twitter className="h-3.5 w-3.5 text-sky-400" />;
      case 'instagram': return <Instagram className="h-3.5 w-3.5 text-pink-400" />;
      case 'tiktok': return <Video className="h-3.5 w-3.5 text-cyan-400" />;
      case 'facebook': return <Facebook className="h-3.5 w-3.5 text-blue-400" />;
      case 'threads': return <AtSign className="h-3.5 w-3.5 text-violet-400" />;
      case 'pinterest': return <Pin className="h-3.5 w-3.5 text-red-400" />;
      case 'linkedin': return <Linkedin className="h-3.5 w-3.5 text-blue-400" />;
      default: return null;
    }
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(events.filter(evt => evt.id !== id));
  };

  // Filtered Events
  const filteredEvents = events.filter(e => {
    const matchPlat = selectedPlatformFilter === 'all' || e.platform === selectedPlatformFilter;
    const matchStatus = selectedStatusFilter === 'all' || e.status.toLowerCase() === selectedStatusFilter.toLowerCase();
    return matchPlat && matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 mb-2">
              <CalendarIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>Multi-Channel 2x Daily Distribution Matrix</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Content Calendar & Distributor Planner</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold tracking-normal uppercase">
                2x Posts / Day
              </span>
            </h2>
            <p className="text-sm text-ink-muted mt-2 max-w-3xl leading-relaxed">
              Programmatic distribution queue enforcing <strong>2 posts per day</strong> (Morning Peak & Evening Peak) across X, Instagram, TikTok, LinkedIn, Pinterest, Threads, and Facebook. Features 1-click AI weekly campaign generation, live post copy enhancer, and multi-format CSV/Markdown exports.
            </p>
          </div>

          {/* Export & AI Generator Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowGeneratorBar(!showGeneratorBar)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-colors flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4 text-accent-brass-300" />
              <span>1-Click AI 2x/Day Generator</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {exported ? <Check className="h-4 w-4 text-emerald-400" /> : <Download className="h-4 w-4 text-emerald-400" />}
              <span>{exported ? 'CSV Exported' : 'Export CSV (Buffer)'}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3.5 py-2.5 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {exportedMD ? <Check className="h-4 w-4 text-emerald-400" /> : <FileText className="h-4 w-4 text-fuchsia-400" />}
              <span>{exportedMD ? 'Brief Exported' : 'Export MD Brief'}</span>
            </button>

            <button
              onClick={handleCopyTextDigest}
              className="px-3.5 py-2.5 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedDigest ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-cyan-400" />}
              <span>{copiedDigest ? 'Copied' : 'Copy All Text'}</span>
            </button>
          </div>
        </div>

        {/* 1-CLICK AI CALENDAR GENERATOR COLLAPSIBLE BAR */}
        {showGeneratorBar && (
          <div className="bg-surface-0 p-5 rounded-2xl border border-emerald-500/30 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>AI Automated 14-Post Weekly Campaign Generator</span>
              </h3>
              <button onClick={() => setShowGeneratorBar(false)} className="text-slate-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block mb-1">
                  Campaign Topic / Brand Niche:
                </label>
                <input
                  type="text"
                  value={campaignNiche}
                  onChange={(e) => setCampaignNiche(e.target.value)}
                  placeholder="e.g. AI Automation & SaaS Growth"
                  className="w-full bg-surface-1 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block mb-1">
                  Brand Voice Profile:
                </label>
                <select
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full bg-surface-1 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Bold Direct Response & High Authority">Bold Direct Response & High Authority</option>
                  <option value="Educational & Step-by-Step Framework">Educational & Step-by-Step Framework</option>
                  <option value="Controversial Pattern Interrupt">Controversial Pattern Interrupt</option>
                  <option value="Casual Authentic Creator Storytelling">Casual Authentic Creator Storytelling</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateAICalendar}
              disabled={generatingCalendar}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generatingCalendar ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-accent-brass-300" />
                  <span>Synthesizing 14 Platform-Optimized Posts (2x / Day)...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-accent-brass-300 fill-brass-300" />
                  <span>Generate Complete 14-Post Weekly Matrix Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* CHANNEL BEST TIME & FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
          {/* Platform Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-ink-muted mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </span>

            {['all', 'x', 'instagram', 'tiktok', 'linkedin', 'pinterest', 'threads', 'facebook'].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatformFilter(plat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors flex items-center gap-1 ${
                  selectedPlatformFilter === plat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-surface-0 text-ink-muted hover:text-white border border-white/10'
                }`}
              >
                {plat !== 'all' && getPlatformIcon(plat as SocialPlatform)}
                <span>{plat}</span>
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-ink-muted">
              Total Queue: <strong className="text-emerald-400">{filteredEvents.length} Slots</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              2x Posts / Day Enforced
            </span>
          </div>
        </div>
      </div>

      {/* WEEKLY 7-DAY GRID (2 SLOTS PER DAY: MORNING & EVENING) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {daysOfWeek.map((day) => {
          const dayEvents = filteredEvents.filter((e) => e.day === day);
          const morningEvents = dayEvents.filter((e) => e.slot === 'Morning Peak');
          const eveningEvents = dayEvents.filter((e) => e.slot === 'Evening Peak');

          return (
            <div key={day} className="bg-surface-1/90 rounded-2xl border border-white/10 p-3 space-y-3 flex flex-col min-h-[480px]">
              {/* Day Column Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-white uppercase">{day}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-2 text-emerald-400">
                  {dayEvents.length}/2 Posts
                </span>
              </div>

              {/* MORNING PEAK SLOT CONTAINER */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-extrabold text-accent-brass-400 bg-accent-brass-500/10 px-2 py-1 rounded border border-brass-500/20">
                  <span className="flex items-center gap-1">
                    <Sun className="h-3 w-3 text-accent-brass-400" />
                    <span>MORNING SLOT 1</span>
                  </span>
                  <span>7:30 - 9:00 AM</span>
                </div>

                {morningEvents.length > 0 ? (
                  morningEvents.map((evt) => {
                    const platConfig = PLATFORM_CONFIGS[evt.platform];
                    return (
                      <div
                        key={evt.id}
                        onClick={() => { setActiveModalEvent(evt); setIsEditing(true); }}
                        className={`p-2.5 rounded-xl border text-xs space-y-2 transition-colors cursor-pointer hover:scale-[1.02] relative group ${platConfig.bgColor} ${platConfig.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {getPlatformIcon(evt.platform)}
                            <span className={`text-[10px] font-bold ${platConfig.color}`}>{platConfig.name}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleDeleteEvent(evt.id, e)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] font-extrabold text-white leading-snug line-clamp-3">
                          {evt.title}
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-ink-muted pt-1 border-t border-white/10 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-accent-brass-400" />
                            {evt.time}
                          </span>
                          <span className="text-ink-secondary font-bold">{evt.mediaType || 'Post'}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <button
                    onClick={() => handleAddSlotPost(day, 'Morning Peak')}
                    className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-brass-500/50 text-[10px] font-bold text-slate-500 hover:text-accent-brass-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Morning Post</span>
                  </button>
                )}
              </div>

              {/* EVENING PEAK SLOT CONTAINER */}
              <div className="space-y-2 flex-1 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-mono font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                  <span className="flex items-center gap-1">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    <span>EVENING SLOT 2</span>
                  </span>
                  <span>5:30 - 8:30 PM</span>
                </div>

                {eveningEvents.length > 0 ? (
                  eveningEvents.map((evt) => {
                    const platConfig = PLATFORM_CONFIGS[evt.platform];
                    return (
                      <div
                        key={evt.id}
                        onClick={() => { setActiveModalEvent(evt); setIsEditing(true); }}
                        className={`p-2.5 rounded-xl border text-xs space-y-2 transition-colors cursor-pointer hover:scale-[1.02] relative group ${platConfig.bgColor} ${platConfig.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {getPlatformIcon(evt.platform)}
                            <span className={`text-[10px] font-bold ${platConfig.color}`}>{platConfig.name}</span>
                          </div>

                          <button
                            onClick={(e) => handleDeleteEvent(evt.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <p className="text-[11px] font-extrabold text-white leading-snug line-clamp-3">
                          {evt.title}
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-ink-muted pt-1 border-t border-white/10 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-indigo-400" />
                            {evt.time}
                          </span>
                          <span className="text-ink-secondary font-bold">{evt.mediaType || 'Post'}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <button
                    onClick={() => handleAddSlotPost(day, 'Evening Peak')}
                    className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/50 text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Evening Post</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* POST DETAIL & AI COPY EDIT MODAL */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {getPlatformIcon(activeModalEvent.platform)}
                <h3 className="text-lg font-extrabold text-white">
                  Edit Scheduled Post Slot ({activeModalEvent.day} - {activeModalEvent.slot})
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="text-ink-muted hover:text-white p-1 rounded-lg bg-surface-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
                    Post Headline / Hook Title:
                  </label>
                  <button
                    type="button"
                    onClick={handleEnhanceActivePost}
                    disabled={generatingCopy}
                    className="text-xs text-accent-brass-300 font-bold hover:text-brass-200 flex items-center gap-1 bg-accent-brass-500/10 px-2.5 py-1 rounded-lg border border-brass-500/20"
                  >
                    {generatingCopy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 text-accent-brass-400" />}
                    <span>✨ AI Sparkle Write Caption</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={activeModalEvent.title}
                  onChange={(e) => setActiveModalEvent({ ...activeModalEvent, title: e.target.value })}
                  className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
                    Social Platform
                  </label>
                  <select
                    value={activeModalEvent.platform}
                    onChange={(e: any) => setActiveModalEvent({ ...activeModalEvent, platform: e.target.value })}
                    className="w-full bg-surface-0 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  >
                    <option value="x">X (Twitter)</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="threads">Threads</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={activeModalEvent.time}
                    onChange={(e) => setActiveModalEvent({ ...activeModalEvent, time: e.target.value })}
                    className="w-full bg-surface-0 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
                    Media Format
                  </label>
                  <select
                    value={activeModalEvent.mediaType || 'Carousel Deck'}
                    onChange={(e: any) => setActiveModalEvent({ ...activeModalEvent, mediaType: e.target.value })}
                    className="w-full bg-surface-0 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  >
                    <option value="Video Reel">Video Reel</option>
                    <option value="Carousel Deck">Carousel Deck</option>
                    <option value="Text Thread">Text Thread</option>
                    <option value="Infographic Pin">Infographic Pin</option>
                    <option value="Thought Leadership Article">Thought Leadership Article</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">
                  Full Caption & Post Body Copy:
                </label>
                <textarea
                  value={activeModalEvent.caption || ''}
                  onChange={(e) => setActiveModalEvent({ ...activeModalEvent, caption: e.target.value })}
                  rows={5}
                  placeholder="Full post text..."
                  className="w-full bg-surface-0 border border-white/10 rounded-xl p-3.5 text-white text-xs font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">
                  Hashtags (Space separated):
                </label>
                <input
                  type="text"
                  value={(activeModalEvent.hashtags || []).join(' ')}
                  onChange={(e) => setActiveModalEvent({ ...activeModalEvent, hashtags: e.target.value.split(' ') })}
                  className="w-full bg-surface-0 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setActiveModalEvent(null)}
                className="px-4 py-2 rounded-xl bg-surface-2 text-ink-secondary text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModalEvent}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20"
              >
                Save Post Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
