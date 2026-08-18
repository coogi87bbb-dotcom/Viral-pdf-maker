import React, { useRef, useState } from 'react';
import { 
  ShoppingBag, Copy, Check, Download, ExternalLink, Sparkles, Share2, Layers, 
  BookOpen, Smartphone, Eye, Layout, Sliders, Edit3, Video, MessageSquare, 
  RefreshCw, Zap, Tag, Globe, ArrowRight, CheckCircle2, TrendingUp, SlidersHorizontal,
  Palette, Sun, ShieldCheck, Award, Star, DollarSign, Bookmark, Compass, Maximize2,
  ThumbsUp, UserCheck, Flame, Heart, ChevronRight, HelpCircle, Play, Send, FileText
} from 'lucide-react';
import { DocumentData, StudioTheme } from '../types';
import { STUDIO_THEMES } from '../data/themes';
import html2canvas from 'html2canvas';
import { sanitizeClonedDocForHtml2Canvas } from '../utils/pdfExport';

interface MockupGeneratorProps {
  document: DocumentData;
  themeId: string;
}

type SocialPlatform = 'pinterest' | 'gumroad' | 'twitter' | 'youtube' | 'tiktok' | 'threads' | 'instagram' | 'linkedin';
type GraphicFormat = 'pinterest' | 'gumroad' | 'story' | 'banner' | 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'threads';
type BackgroundStyle = 'studio-dark' | 'minimal-cream' | 'cyber-neon' | 'warm-editorial' | 'gradient-aura' | 'slate-mesh' | 'terracotta-sand' | 'emerald-gold' | 'rose-gold';
type MockupPose = 'single-3d' | 'bundle-tablet' | 'multi-stack' | 'open-spread' | 'flatlay';
type PinTemplate = 
  | 'classic-hook' 
  | 'infographic-bullets' 
  | 'problem-solution' 
  | 'case-study-proof' 
  | 'magazine-cover' 
  | 'cheat-sheet-split' 
  | 'gumroad-product-card' 
  | 'carousel-swipe-cover';

type PinFontPairing = 'modern-sans' | 'editorial-serif' | 'bold-grotesk' | 'handcrafted-display';

interface SocialPack {
  platform: SocialPlatform;
  title: string;
  hook: string;
  body: string;
  hashtags: string;
  pinterestAltText?: string;
  viralTip: string;
}

export const MockupGenerator: React.FC<MockupGeneratorProps> = ({ document, themeId }) => {
  const theme = STUDIO_THEMES.find((t) => t.id === themeId) || STUDIO_THEMES[0];
  const mockupCardRef = useRef<HTMLDivElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'pipeline'>('visual');
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('pinterest');
  const [graphicFormat, setGraphicFormat] = useState<GraphicFormat>('pinterest');
  const [viralAngle, setViralAngle] = useState<number>(0);

  // 3D & Visual Customizer State
  const [bgStyle, setBgStyle] = useState<BackgroundStyle>('studio-dark');
  const [mockupPose, setMockupPose] = useState<MockupPose>('single-3d');
  const [pinTemplate, setPinTemplate] = useState<PinTemplate>('classic-hook');
  const [fontPairing, setFontPairing] = useState<PinFontPairing>('modern-sans');
  const [tiltX, setTiltX] = useState<number>(-8);
  const [tiltY, setTiltY] = useState<number>(12);
  const [showGlare, setShowGlare] = useState<boolean>(true);
  const [badgeText, setBadgeText] = useState<string>('#1 BESTSELLER');
  const [badgeColor, setBadgeColor] = useState<'gold' | 'emerald' | 'amber' | 'purple' | 'rose'>('gold');
  const [priceTag, setPriceTag] = useState<string>('$29');
  const [showPriceTag, setShowPriceTag] = useState<boolean>(true);
  const [showRibbon, setShowRibbon] = useState<boolean>(true);
  const [stickerOverlay, setStickerOverlay] = useState<string>('📌 SAVE THIS PIN');
  const [showStars, setShowStars] = useState<boolean>(true);
  const [downloadsText, setDownloadsText] = useState<string>('18,400+ Creators Downloaded');

  // Mouse drag-to-rotate state for 3D stage
  const [isDragging3D, setIsDragging3D] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startTiltX: number; startTiltY: number }>({
    x: 0,
    y: 0,
    startTiltX: -8,
    startTiltY: 12
  });

  const handleMouseDown3D = (e: React.MouseEvent) => {
    setIsDragging3D(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, startTiltX: tiltX, startTiltY: tiltY };
  };

  const handleMouseMove3D = (e: React.MouseEvent) => {
    if (!isDragging3D) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setTiltY(Math.min(45, Math.max(-45, Math.round(dragStartRef.current.startTiltY + deltaX * 0.35))));
    setTiltX(Math.min(45, Math.max(-45, Math.round(dragStartRef.current.startTiltX - deltaY * 0.35))));
  };

  const handleMouseUp3D = () => {
    setIsDragging3D(false);
  };

  // Helper generator to extract chapter titles
  const chapterTitles = document.sections.map((s, i) => `Chapter ${i + 1}: ${s.title}`).join(', ');
  const mainTopic = document.category || 'Digital Mastery';

  // Editable current custom text overlays for visual pin
  const [customPinOverlay, setCustomPinOverlay] = useState<string>(
    document.marketingCopy?.pinterestPinText || `Stop searching for generic templates. Read ${document.title}!`
  );
  const [problemText, setProblemText] = useState<string>(`Tired of vague advice that never leads to actual revenue?`);
  const [solutionText, setSolutionText] = useState<string>(`The step-by-step ${document.title} playbook gives you battle-tested execution!`);
  const [quoteText, setQuoteText] = useState<string>(`"This guide alone saved me 3 months of trial and error!"`);

  // State for editable social copy packs with 10x genius viral copy frameworks
  const generateInitialPacks = (): Record<SocialPlatform, SocialPack> => {
    return {
      pinterest: {
        platform: 'pinterest',
        title: `How to Master ${document.title} (Step-by-Step High-DPI PDF Guide)`,
        hook: `Stop searching for generic templates. Read ${document.title} to transform your entire workflow!`,
        body: `Ready to elevate your skills? Download the complete high-resolution ${document.title} PDF guide.\n\n` +
          `• **Core Framework**: ${document.subtitle}\n` +
          `• **Key Takeaways**: ${document.keyTakeaways.slice(0, 3).join(', ')}\n` +
          `• **Chapter Breakdown**: ${chapterTitles}\n\n` +
          `Saved by 18,400+ creators & solopreneurs worldwide!`,
        hashtags: `#digitalproducts #pdfguide #${document.title.toLowerCase().replace(/\s+/g, '')} #productivity #gumroad #templates #creativeminds #etsypdf`,
        pinterestAltText: `3D eBook mockup for ${document.title} resting on a premium backdrop. Features chapters on ${document.sections[0]?.title || 'strategy'} and ${document.sections[1]?.title || 'execution'}. Includes instant PDF download link.`,
        viralTip: '📌 Pinterest Viral Tip: Vertical 2:3 pins with high-contrast text overlays get 4.2x more saves. Adding a "SAVE THIS PIN" sticker triggers save intent.'
      },
      gumroad: {
        platform: 'gumroad',
        title: `${document.title}: The Complete Master Execution Blueprint & Interactive Worksheets (2026 Edition)`,
        hook: `Turn theoretical strategy into rapid execution with ${document.title}. Includes high-resolution PDF, printable cheat sheets, & companion frameworks.`,
        body: `### 🚀 WHAT YOU GET INSIDE ${document.title.toUpperCase()}:\n\n` +
          `1. **The Complete 50+ Page Blueprint**: ${document.subtitle}\n` +
          `2. **Master Chapter Breakdown**:\n` +
          document.sections.map((s, i) => `   - **Module ${i + 1} (${s.title})**: ${s.paragraphs[0]?.slice(0, 110) || 'Actionable framework'}...`).join('\n') + `\n\n` +
          `3. **Key Takeaways & Frameworks**:\n` +
          document.keyTakeaways.map(k => `   - ✅ ${k}`).join('\n') + `\n\n` +
          `### 💡 WHO IS THIS FOR?\n` +
          `Creators, founders, and ambitious professionals who want a battle-tested, zero-fluff playbook to achieve immediate results.\n\n` +
          `### 🛡️ 100% RISK-FREE GUARANTEE:\n` +
          `If this guide doesn't save you at least 20 hours of trial and error, email us within 30 days for a full, no-questions-asked refund.\n\n` +
          `👇 **Click 'I Want This!' to get instant lifetime PDF access.**`,
        hashtags: `#gumroad #digitaldownload #pdfguide #bestseller #masterclass #solopreneur #productivity`,
        viralTip: '🛍️ Gumroad Sales Tip: Offer a tiered pricing option ($29 Standard PDF vs $49 PDF + Worksheets) to boost average order value by 34%.'
      },
      twitter: {
        platform: 'twitter',
        title: `🧵 The Ultimate Breakdown of ${document.title} (Steal This Playbook)`,
        hook: `I spent 100+ hours distilling the best lessons from ${document.title} into a 5-minute visual thread.\n\nHere are 5 game-changing insights that will transform how you work 👇`,
        body: `1/ **The Core Principle**: Most people overcomplicate ${mainTopic}.\n${document.keyTakeaways[0] || 'Focus on high-leverage execution.'}\n\n` +
          `2/ **Chapter 1 Highlight (${document.sections[0]?.title || 'Strategy'})**:\n${document.sections[0]?.paragraphs[0]?.slice(0, 150) || 'Build systems that scale.'}\n\n` +
          `3/ **Execution Framework**:\n${document.keyTakeaways[1] || 'Systemize repeatability across operations.'}\n\n` +
          `4/ **The Biggest Pitfall**:\n${document.keyTakeaways[2] || 'Tracking vanity metrics instead of core outcomes.'}\n\n` +
          `5/ Want the full 50-page formatted PDF guide with high-resolution diagrams & worksheets?\n\n` +
          `Grab the complete PDF here (Instant Download) 👇\nhttps://gumroad.com/l/your-product-link\n\n` +
          `🔁 Retweet tweet #1 to share with your audience!`,
        hashtags: `#twitterthread #buildinpublic #solopreneur #${document.title.toLowerCase().replace(/\s+/g, '')} #productivity`,
        viralTip: '🐦 Twitter/X Viral Tip: Retweet your top tweet 6 hours later. Quote-tweet with a snippet of your 3D book cover graphic.'
      },
      youtube: {
        platform: 'youtube',
        title: `How to Master ${document.title} in 2026 (Full PDF Blueprint & Video Walkthrough)`,
        hook: `In this deep-dive tutorial, I break down the exact principles from ${document.title} and show you step-by-step how to implement them.`,
        body: `📚 DOWNLOAD THE FULL 50-PAGE PDF BLUEPRINT:\n` +
          `https://gumroad.com/l/your-product-link\n\n` +
          `📌 CHAPTER TIMESTAMPS:\n` +
          `00:00 - Introduction & The Core Problem in ${mainTopic}\n` +
          `01:45 - ${document.sections[0]?.title || 'Core Strategy Framework'}\n` +
          `04:30 - ${document.sections[1]?.title || 'Step-by-Step Execution Model'}\n` +
          `07:15 - Key Takeaways & Master Cheat Sheet\n` +
          `09:40 - Final Action Plan & PDF Download Instructions\n\n` +
          `THUMBNAIL TEXT IDEA: "FULL 2026 BLUEPRINT [PDF INSIDE]"\n\n` +
          `🔔 Subscribe for weekly digital product breakdowns and solopreneur playbooks!`,
        hashtags: `${document.title}, pdf guide, digital products, ${mainTopic}, tutorial, step by step, gumroad seller, productivity`,
        viralTip: '🎥 YouTube Viral Tip: Place the 3D book mockup graphic prominently on your thumbnail image next to a high-contrast curiosity title.'
      },
      tiktok: {
        platform: 'tiktok',
        title: `POV: You stopped guessing and opened page 4 of ${document.title}`,
        hook: `If you want to master ${mainTopic} in 2026, stop scrolling right now.`,
        body: `[VISUAL CUE: Hold up 3D Book Graphic / Phone Mockup on screen]\n\n` +
          `[SPOKEN SCRIPT / CAPTION]:\n` +
          `"95% of people make this huge mistake when it comes to ${mainTopic}. They consume random advice instead of using a structured system.\n\n` +
          `Page 4 of ${document.title} reveals the secret: ${document.keyTakeaways[0] || 'Focus on high-leverage execution'}.\n\n` +
          `I put the complete high-resolution PDF guide in my bio link so you can grab it right now!"\n\n` +
          `🎵 AUDIO RECOMMENDATION: Use trending calm synth or deep focus instrumental.`,
        hashtags: `#tiktokmademebuyit #pdfguide #digitalcreator #learnontiktok #productivity #gumroad #${document.title.toLowerCase().replace(/\s+/g, '')}`,
        viralTip: '🎵 TikTok Viral Tip: Pair with trending voiceovers or calm synth background audio. Place the 9:16 story mockup graphic on screen.'
      },
      threads: {
        platform: 'threads',
        title: `The 3-Step Playbook from ${document.title}`,
        hook: `Unpopular opinion: 90% of business guides give you fluff. Here is what actually works from ${document.title}:`,
        body: `1. **Lesson 1**: ${document.keyTakeaways[0] || 'Simplify your core workflow'}\n` +
          `2. **Lesson 2**: ${document.keyTakeaways[1] || 'Focus on output quality over volume'}\n` +
          `3. **Lesson 3**: ${document.keyTakeaways[2] || 'Systemize repeatability'}\n\n` +
          `I formatted the full 50-page breakdown into a high-DPI PDF.\n\n` +
          `💬 **Comment 'PDF' below and I will send you the direct download link instantly!**`,
        hashtags: `#threads #creatoreconomy #${mainTopic.toLowerCase().replace(/\s+/g, '')} #digitalproducts #solopreneur`,
        viralTip: '🧵 Threads Tip: Asking users to comment a keyword triggers high engagement algorithms and boosts post reach.'
      },
      instagram: {
        platform: 'instagram',
        title: `Slide to Learn: ${document.title} Carousel Masterclass (5 Slides)`,
        hook: `SWIPE ➡️ The exact step-by-step blueprint to master ${document.title} in under 5 minutes.`,
        body: `📸 CAROUSEL SLIDE BREAKDOWN:\n` +
          `• **Slide 1 (Cover)**: "${document.title}" (Feature 3D Book Graphic + "SWIPE ➡️")\n` +
          `• **Slide 2 (The Problem)**: ${problemText}\n` +
          `• **Slide 3 (The Solution)**: ${solutionText}\n` +
          `• **Slide 4 (Key Execution)**: ${document.keyTakeaways[0] || 'Actionable framework'}\n` +
          `• **Slide 5 (Call to Action)**: "Download the complete PDF Guide! Link in Bio 🔗"\n\n` +
          `📌 Save this post to your collection so you don't lose it!`,
        hashtags: `#instagramcarousel #infographic #pdfguide #digitalcreator #learnoninstagram #${document.title.toLowerCase().replace(/\s+/g, '')} #productivity`,
        viralTip: '📸 Instagram Tip: Carousels get 3x higher re-engagement because Instagram re-shows slide 2 if users skip slide 1.'
      },
      linkedin: {
        platform: 'linkedin',
        title: `Executive Analysis: Key Frameworks from ${document.title}`,
        hook: `I published a comprehensive 50-page executive analysis titled "${document.title}". Here are the top insights for industry leaders:`,
        body: `Over the past quarter, we analyzed how top-performing teams approach ${mainTopic}.\n\n` +
          `Here are the 3 non-negotiable strategic pillars:\n` +
          `1. **${document.keyTakeaways[0] || 'Strategic Alignment'}**: Streamlining high-value objectives with structured execution.\n` +
          `2. **${document.keyTakeaways[1] || 'Process Automation'}**: Eliminating operational friction across recurring workflows.\n` +
          `3. **${document.keyTakeaways[2] || 'Measurable Outcomes'}**: Tracking core metrics that directly drive revenue.\n\n` +
          `I have formatted the entire document into a clean, presentation-ready PDF slide deck.\n\n` +
          `🔗 **Download the full document in the first comment section below.**`,
        hashtags: `#leadership #productivity #management #${mainTopic.toLowerCase().replace(/\s+/g, '')} #businessstrategy #executivesummary`,
        viralTip: '💼 LinkedIn Tip: Place external sales links in the FIRST COMMENT rather than the main post text to avoid algorithm reach penalties.'
      }
    };
  };

  const [packs, setPacks] = useState<Record<SocialPlatform, SocialPack>>(generateInitialPacks());

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const currentPack = packs[activePlatform];

  const handleUpdatePackField = (field: keyof SocialPack, value: string) => {
    setPacks(prev => ({
      ...prev,
      [activePlatform]: {
        ...prev[activePlatform],
        [field]: value
      }
    }));
  };

  const handleCopyFullPlatformPack = () => {
    const fullText = `=== ${activePlatform.toUpperCase()} VIRAL MARKETING PACK ===\n\n` +
      `TITLE/HOOK:\n${currentPack.title}\n\n` +
      `PRIMARY CAPTION/SCRIPT:\n${currentPack.hook}\n\n${currentPack.body}\n\n` +
      `HASHTAGS/TAGS:\n${currentPack.hashtags}\n\n` +
      (currentPack.pinterestAltText ? `PINTEREST SEO ALT TEXT:\n${currentPack.pinterestAltText}\n\n` : '') +
      `VIRAL STRATEGY TIP:\n${currentPack.viralTip}`;
    
    copyToClipboard(fullText, `full-${activePlatform}`);
  };

  const handleRegenerateViralAngles = () => {
    const nextAngle = (viralAngle + 1) % 5;
    setViralAngle(nextAngle);

    const angles = [
      {
        prefix: '🔥 CONTRARIAN ANGLE:',
        hookSuffix: 'Why 95% of people fail at this (and how this PDF fixes it).'
      },
      {
        prefix: '💡 CASE STUDY ANGLE:',
        hookSuffix: 'How this exact framework generated 10x results in 30 days.'
      },
      {
        prefix: '⚡ STEP-BY-STEP ANGLE:',
        hookSuffix: 'The no-nonsense 5-minute blueprint you can steal today.'
      },
      {
        prefix: '⚠️ BIGGEST MISTAKE ANGLE:',
        hookSuffix: 'Stop making this costly mistake when creating digital products.'
      },
      {
        prefix: '📌 ULTIMATE CHEATSHEET ANGLE:',
        hookSuffix: 'The complete PDF reference guide every creator needs saved.'
      }
    ];

    const currentAngleObj = angles[nextAngle];

    setPacks(prev => {
      const updated = { ...prev };
      (Object.keys(updated) as SocialPlatform[]).forEach(plat => {
        updated[plat] = {
          ...updated[plat],
          title: `${currentAngleObj.prefix} ${updated[plat].title.replace(/^(🔥|💡|⚡|⚠️|📌).+?:\s*/, '')}`,
          hook: `${currentAngleObj.hookSuffix}\n\n` + updated[plat].hook.split('\n\n').slice(1).join('\n\n')
        };
      });
      return updated;
    });
  };

  const handleDownloadMockupImage = async () => {
    if (!mockupCardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(mockupCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc, clonedElement) => {
          sanitizeClonedDocForHtml2Canvas(clonedDoc, clonedElement);
        }
      });
      const image = canvas.toDataURL('image/png');
      const link = window.document.createElement('a');
      link.download = `${document.title.toLowerCase().replace(/\s+/g, '-')}-${graphicFormat}-${pinTemplate}-graphic.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Failed to export mockup graphic:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const platformMeta: Record<SocialPlatform, { name: string; icon: string; color: string; border: string }> = {
    pinterest: { name: 'Pinterest', icon: '📌', color: 'from-red-600 to-rose-600', border: 'border-red-500/40' },
    gumroad: { name: 'Gumroad', icon: '🛍️', color: 'from-accent-brass-500 to-brass-600', border: 'border-accent-brass-500/40' },
    twitter: { name: 'Twitter / X', icon: '🐦', color: 'from-accent-brass-400 to-accent-brass-500', border: 'border-accent-brass-400/40' },
    youtube: { name: 'YouTube', icon: '🎥', color: 'from-red-700 to-red-800', border: 'border-red-600/40' },
    tiktok: { name: 'TikTok', icon: '🎵', color: 'from-accent-brass-500 to-accent-brass-600', border: 'border-accent-brass-500/40' },
    threads: { name: 'Threads', icon: '🧵', color: 'from-accent-brass-600 to-accent-brass-700', border: 'border-accent-brass-600/40' },
    instagram: { name: 'Instagram', icon: '📸', color: 'from-accent-brass-500 to-accent-brass-400', border: 'border-accent-brass-500/40' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: 'from-accent-brass-400 to-accent-brass-600', border: 'border-accent-brass-400/40' }
  };

  // Background style classes definition
  const getBgClass = () => {
    switch (bgStyle) {
      case 'minimal-cream':
        return 'bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 text-slate-900 border-amber-200';
      case 'cyber-neon':
        return 'bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950 text-white border-pink-500/30';
      case 'warm-editorial':
        return 'bg-gradient-to-br from-stone-900 via-neutral-900 to-amber-950 text-amber-50 border-amber-800/40';
      case 'gradient-aura':
        return 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white border-indigo-500/30';
      case 'terracotta-sand':
        return 'bg-gradient-to-br from-stone-800 via-stone-900 to-orange-950 text-amber-100 border-orange-800/30';
      case 'emerald-gold':
        return 'bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 text-emerald-50 border-emerald-500/30';
      case 'rose-gold':
        return 'bg-gradient-to-br from-rose-950 via-slate-950 to-pink-950 text-rose-50 border-rose-500/30';
      case 'slate-mesh':
        return 'bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 text-slate-100 border-white/10';
      case 'studio-dark':
      default:
        return 'bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 text-slate-100 border-white/10';
    }
  };

  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-500 text-slate-950 border-emerald-300';
      case 'amber':
        return 'bg-accent-amber-500 text-slate-950 border-amber-300';
      case 'purple':
        return 'bg-purple-600 text-white border-purple-300';
      case 'rose':
        return 'bg-rose-500 text-white border-rose-300';
      case 'gold':
      default:
        return 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 border-yellow-200';
    }
  };

  const getFontFamily = () => {
    switch (fontPairing) {
      case 'editorial-serif':
        return 'Georgia, serif';
      case 'bold-grotesk':
        return '"Trebuchet MS", sans-serif';
      case 'handcrafted-display':
        return '"Impact", sans-serif';
      case 'modern-sans':
      default:
        return 'system-ui, sans-serif';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-ink-secondary">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-accent-brass-900/50 via-surface-1 to-accent-brass-800/40 border border-accent-brass-500/30 p-6 rounded-3xl shadow-[var(--shadow-panel-brass)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-brass-500/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="space-y-1.5 max-w-2xl z-10">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-accent-brass-500/20 text-accent-brass-300 border border-accent-brass-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink-primary tracking-tight">
              Genius 3D Product Mockup & Pinterest Viral Engine
            </h2>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Create high-converting 3D digital product covers, 2:3 viral Pinterest Pin presets, Gumroad hero banners, and complete copy packs across all 8 creator channels!
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 z-10">
          <button
            onClick={handleRegenerateViralAngles}
            className="px-3.5 py-2.5 bg-surface-2 hover:bg-surface-3 text-accent-brass-300 border border-hairline-strong font-bold text-xs rounded-xl shadow-[var(--shadow-panel-brass)] flex items-center space-x-1.5 transition-colors"
            title="Generate a new viral hook angle (Contrarian, Case Study, or Step-by-Step)"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent-brass-400" />
            <span>Switch Viral Angle</span>
          </button>

          <button
            onClick={handleDownloadMockupImage}
            disabled={isExporting}
            className="px-4 py-2.5 bg-gradient-to-r from-accent-brass-500 to-accent-brass-400 hover:from-accent-brass-400 hover:to-brass-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-[var(--shadow-glow-brass)] flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isExporting ? 'Exporting PNG...' : 'Download Graphic PNG'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Navigation Mode Bar */}
      <div className="flex items-center justify-between bg-surface-1 border border-hairline p-2 rounded-2xl gap-2 flex-wrap">
        <div className="flex items-center space-x-1 bg-surface-0 p-1 rounded-xl border border-hairline">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-colors ${
              activeTab === 'visual'
                ? 'bg-gradient-to-r from-accent-brass-500 to-accent-brass-400 text-slate-950 shadow-[var(--shadow-panel-brass)]'
                : 'text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Graphic & Pin Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-gradient-to-r from-accent-brass-600 to-accent-brass-500 text-ink-primary shadow-[var(--shadow-panel-brass)]'
                : 'text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-accent-brass-300" />
            <span>8-Channel Social Copy Pipeline</span>
          </button>
        </div>

        {/* 8 Platforms Quick Selector Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(Object.keys(platformMeta) as SocialPlatform[]).map((platKey) => {
            const meta = platformMeta[platKey];
            const isSelected = activePlatform === platKey;
            return (
              <button
                key={platKey}
                onClick={() => {
                  setActivePlatform(platKey);
                  if (platKey === 'pinterest') setGraphicFormat('pinterest');
                  else if (platKey === 'gumroad') setGraphicFormat('gumroad');
                  else if (platKey === 'tiktok' || platKey === 'instagram') setGraphicFormat('story');
                  else if (platKey === 'twitter' || platKey === 'linkedin' || platKey === 'youtube') setGraphicFormat('banner');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  isSelected
                    ? `bg-surface-2 text-ink-primary ring-1 ${meta.border} shadow-sm`
                    : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-0'
                }`}
              >
                <span>{meta.icon}</span>
                <span className="hidden sm:inline">{meta.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: 3D GRAPHIC & PIN STUDIO CUSTOMIZER */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          {/* Main Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-surface-1 border border-hairline p-3 rounded-2xl text-xs">
            {/* Format Selector */}
            <div className="space-y-1">
              <label className="font-bold text-ink-secondary flex items-center space-x-1">
                <Layout className="w-3.5 h-3.5 text-accent-brass-400" />
                <span>Graphic Ratio</span>
              </label>
              <select
                value={graphicFormat}
                onChange={(e) => setGraphicFormat(e.target.value as GraphicFormat)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-2 text-ink-primary font-medium focus:ring-1 focus:ring-brass-500"
              >
                <option value="pinterest">📌 Pinterest Pin (2:3)</option>
                <option value="gumroad">🛍️ Gumroad Hero (3:2)</option>
                <option value="story">📱 Story / TikTok (9:16)</option>
                <option value="banner">💻 Banner Header (16:9)</option>
              </select>
            </div>

            {/* Layout Preset */}
            <div className="space-y-1">
              <label className="font-bold text-ink-secondary flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-accent-brass-400" />
                <span>Pinterest Pin Preset</span>
              </label>
              <select
                value={pinTemplate}
                onChange={(e) => setPinTemplate(e.target.value as PinTemplate)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-2 text-ink-primary font-medium focus:ring-1 focus:ring-accent-brass-500"
              >
                <option value="classic-hook">1. Classic Headline Hook</option>
                <option value="infographic-bullets">2. Infographic 1-2-3 Blueprint</option>
                <option value="problem-solution">3. Mistake vs. Fix Split Card</option>
                <option value="case-study-proof">4. Social Proof & Star Rating</option>
                <option value="magazine-cover">5. Editorial Minimalist Magazine</option>
                <option value="cheat-sheet-split">6. Split Cheat Sheet Highlight</option>
                <option value="gumroad-product-card">7. Gumroad Product Card</option>
                <option value="carousel-swipe-cover">8. Swipe Carousel Cover</option>
              </select>
            </div>

            {/* 3D Mockup Pose */}
            <div className="space-y-1">
              <label className="font-bold text-ink-secondary flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>3D Mockup Pose</span>
              </label>
              <select
                value={mockupPose}
                onChange={(e) => setMockupPose(e.target.value as MockupPose)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-2 text-ink-primary font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="single-3d">Hardcover 3D Stand</option>
                <option value="bundle-tablet">Hardcover + Tablet Bundle</option>
                <option value="multi-stack">Multi-Book Stack</option>
                <option value="open-spread">Open Book Spread</option>
                <option value="flatlay">Flatlay View</option>
              </select>
            </div>

            {/* Font Pairings */}
            <div className="space-y-1">
              <label className="font-bold text-ink-secondary flex items-center space-x-1">
                <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                <span>Typography Style</span>
              </label>
              <select
                value={fontPairing}
                onChange={(e) => setFontPairing(e.target.value as PinFontPairing)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-2 text-ink-primary font-medium focus:ring-1 focus:ring-rose-500"
              >
                <option value="modern-sans">Modern Sans Display</option>
                <option value="editorial-serif">Editorial Serif Luxury</option>
                <option value="bold-grotesk">Bold Grotesk High-Contrast</option>
                <option value="handcrafted-display">Heavy Impact Display</option>
              </select>
            </div>

            {/* Background Atmosphere */}
            <div className="space-y-1">
              <label className="font-bold text-ink-secondary flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Canvas Atmosphere</span>
              </label>
              <select
                value={bgStyle}
                onChange={(e) => setBgStyle(e.target.value as BackgroundStyle)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-2 text-ink-primary font-medium focus:ring-1 focus:ring-sky-500"
              >
                <option value="studio-dark">Studio Dark Ambient</option>
                <option value="minimal-cream">Warm Editorial Cream</option>
                <option value="cyber-neon">Cyberpunk Neon</option>
                <option value="warm-editorial">Dark Bronze & Amber</option>
                <option value="terracotta-sand">Terracotta & Sand</option>
                <option value="emerald-gold">Emerald & Gold</option>
                <option value="rose-gold">Rose Gold & Pink</option>
                <option value="gradient-aura">Deep Purple Aura</option>
                <option value="slate-mesh">Clean Slate Mesh</option>
              </select>
            </div>
          </div>

          {/* Interactive Stage & Inspector Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Live Render Canvas Stage */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[500px]">
              <div
                ref={mockupCardRef}
                className={`w-full rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-between p-6 sm:p-8 space-y-6 transition-[background-color,border-color] duration-300 border ${getBgClass()} ${
                  graphicFormat === 'pinterest'
                    ? 'max-w-[420px] aspect-[2/3] min-h-[580px]'
                    : graphicFormat === 'story'
                    ? 'max-w-[380px] aspect-[9/16] min-h-[620px]'
                    : graphicFormat === 'banner'
                    ? 'max-w-[640px] aspect-[16/9] min-h-[380px]'
                    : 'max-w-[580px] aspect-[3/2] min-h-[480px]'
                }`}
                style={{ fontFamily: getFontFamily() }}
              >
                {/* Background Atmosphere Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-brass-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* Floating Sticker / Callout Badge */}
                {stickerOverlay && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-2.5 py-1 bg-red-600 text-white font-extrabold text-[9px] tracking-widest uppercase rounded-md shadow-lg border border-red-400 animate-pulse">
                      {stickerOverlay}
                    </span>
                  </div>
                )}

                {/* Floating Bestseller Foil Badge */}
                {badgeText && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border ${getBadgeClass()}`}>
                      <Award className="w-3 h-3 shrink-0" />
                      <span>{badgeText}</span>
                    </span>
                  </div>
                )}

                {/* Floating Ribbon Bookmark */}
                {showRibbon && (
                  <div className="absolute top-0 left-12 z-20 w-5 h-14 bg-gradient-to-b from-red-600 to-brass-500 shadow-xl flex items-end justify-center pb-2 rounded-b-sm">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                )}

                {/* LAYOUT TEMPLATE 1: CLASSIC HEADLINE HOOK */}
                {pinTemplate === 'classic-hook' && (
                  <div className="relative z-10 text-center space-y-2 w-full pt-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brass-500/20 border border-brass-500/30 rounded-full text-[10px] font-mono uppercase tracking-widest text-brass-300">
                      <Sparkles className="w-3 h-3 text-brass-400" />
                      <span>{graphicFormat === 'pinterest' ? 'Pinterest Viral Guide' : 'Digital Masterclass'}</span>
                    </div>

                    <h3 className="text-base sm:text-xl font-black px-4 leading-tight tracking-tight drop-shadow-md">
                      "{customPinOverlay}"
                    </h3>
                  </div>
                )}

                {/* LAYOUT TEMPLATE 2: INFOGRAPHIC BULLETS */}
                {pinTemplate === 'infographic-bullets' && (
                  <div className="relative z-10 w-full space-y-3 pt-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-brass-500/20 text-accent-brass-300 border border-accent-brass-500/30">
                        Step-by-Step Blueprint
                      </span>
                      <h3 className="text-base sm:text-lg font-black leading-tight">
                        {document.title}
                      </h3>
                    </div>

                    <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-3.5 space-y-2 text-[10px]">
                      {document.keyTakeaways.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-slate-200">
                          <span className="w-5 h-5 rounded-full bg-brass-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-[9px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LAYOUT TEMPLATE 3: PROBLEM VS SOLUTION */}
                {pinTemplate === 'problem-solution' && (
                  <div className="relative z-10 w-full space-y-2 text-[10px] pt-4">
                    <div className="bg-red-950/70 border border-red-500/40 p-3 rounded-xl text-red-200 shadow-md">
                      <span className="font-extrabold text-red-400 block uppercase tracking-wider text-[9px] mb-0.5">❌ THE MISTAKE:</span>
                      <p className="font-medium">{problemText}</p>
                    </div>

                    <div className="bg-emerald-950/70 border border-emerald-500/40 p-3 rounded-xl text-emerald-200 shadow-md">
                      <span className="font-extrabold text-emerald-400 block uppercase tracking-wider text-[9px] mb-0.5">✅ THE FIX:</span>
                      <p className="font-medium">{solutionText}</p>
                    </div>
                  </div>
                )}

                {/* LAYOUT TEMPLATE 4: CASE STUDY PROOF */}
                {pinTemplate === 'case-study-proof' && (
                  <div className="relative z-10 w-full space-y-2.5 pt-4 text-center">
                    <div className="inline-flex items-center space-x-1 bg-brass-500/20 border border-brass-500/40 px-3 py-1 rounded-full text-[10px] text-brass-300 font-bold">
                      <Flame className="w-3 h-3 text-brass-400" />
                      <span>{downloadsText}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black leading-tight">
                      {document.title}
                    </h3>

                    <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 italic text-[10px] text-slate-300">
                      {quoteText}
                    </div>
                  </div>
                )}

                {/* LAYOUT TEMPLATE 5: MINIMAL MAGAZINE COVER */}
                {pinTemplate === 'magazine-cover' && (
                  <div className="relative z-10 text-center space-y-1 w-full pt-4">
                    <p className="text-[9px] uppercase tracking-widest font-mono opacity-80">
                      ISSUE 2026 • DIGITAL EDITION
                    </p>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">
                      {document.title}
                    </h2>
                  </div>
                )}

                {/* LAYOUT TEMPLATE 6: CHEAT SHEET SPLIT */}
                {pinTemplate === 'cheat-sheet-split' && (
                  <div className="relative z-10 w-full space-y-2 pt-4">
                    <div className="bg-accent-brass-900/40 border border-accent-brass-500/40 p-3 rounded-xl text-accent-brass-100 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-brass-300 block">
                        PDF CHEAT SHEET
                      </span>
                      <p className="font-black text-xs text-white mt-1">"{customPinOverlay}"</p>
                    </div>
                  </div>
                )}

                {/* LAYOUT TEMPLATE 7: GUMROAD PRODUCT CARD */}
                {pinTemplate === 'gumroad-product-card' && (
                  <div className="relative z-10 w-full space-y-2 pt-4">
                    <div className="bg-slate-950/80 border border-brass-500/30 p-3 rounded-xl text-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{document.title}</span>
                        <span className="text-[10px] text-brass-400">Master PDF & Templates</span>
                      </div>
                      <span className="px-2.5 py-1 bg-brass-400 text-slate-950 font-black rounded-lg text-xs">
                        {priceTag}
                      </span>
                    </div>
                  </div>
                )}

                {/* LAYOUT TEMPLATE 8: CAROUSEL SWIPE COVER */}
                {pinTemplate === 'carousel-swipe-cover' && (
                  <div className="relative z-10 text-center space-y-2 w-full pt-4">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-accent-brass-500/20 border border-accent-brass-500/40 rounded-full text-[10px] font-bold text-accent-brass-300">
                      <span>SWIPE FOR BLUEPRINT</span>
                      <ArrowRight className="w-3 h-3 text-accent-brass-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black leading-tight px-2">
                      "{customPinOverlay}"
                    </h3>
                  </div>
                )}

                {/* 3D BOOK & MULTI-DEVICE GRAPHIC COMPOSITE */}
                <div
                  className="relative z-10 flex items-center justify-center my-auto group cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleMouseDown3D}
                  onMouseMove={handleMouseMove3D}
                  onMouseUp={handleMouseUp3D}
                  onMouseLeave={handleMouseUp3D}
                >
                  {/* 3D Pedestal Base Glow */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-10 rounded-[100%] bg-gradient-to-b from-brass-500/20 via-black/80 to-slate-950/90 border border-brass-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.25)] pointer-events-none transform rotateX(65deg)" />

                  {/* Single 3D Hardcover Pose */}
                  {(mockupPose === 'single-3d' || mockupPose === 'bundle-tablet') && (
                    <div
                      className="w-52 sm:w-60 h-72 sm:h-80 rounded-r-xl shadow-2xl p-5 flex flex-col justify-between transition-transform duration-300 relative border-r border-t border-b border-white/20"
                      style={{
                        backgroundColor: theme.colors.paperBg,
                        color: theme.colors.textPrimary,
                        transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`,
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                        boxShadow: '-20px 28px 60px rgba(0,0,0,0.88), inset 6px 0 14px rgba(255,255,255,0.2)'
                      }}
                    >
                      {/* 3D Spine Thickness Edge (Left Side) */}
                      <div
                        className="absolute top-0 bottom-0 -left-5 w-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 border-r border-brass-500/40 flex flex-col items-center justify-between py-4 text-brass-400 text-[8px] font-mono font-black tracking-widest uppercase overflow-hidden shadow-2xl"
                        style={{
                          transform: 'rotateY(-90deg)',
                          transformOrigin: 'right center'
                        }}
                      >
                        <span className="rotate-180" style={{ writingMode: 'vertical-rl' }}>
                          {document.title.slice(0, 20)}
                        </span>
                        <span className="opacity-70 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                          {document.author || 'STUDIO'}
                        </span>
                      </div>

                      {/* 3D Stacked Page Thickness Edge (Right Side) */}
                      <div
                        className="absolute top-1 bottom-1 -right-4 w-4 bg-[repeating-linear-gradient(to_bottom,#ffffff,#ffffff_2px,#cbd5e1_2px,#cbd5e1_3px)] border-r border-slate-400/50 rounded-r-sm shadow-md"
                        style={{
                          transform: 'rotateY(90deg)',
                          transformOrigin: 'left center'
                        }}
                      />

                      {/* Spine Crease Overlay */}
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 via-black/15 to-transparent border-r border-white/10 pointer-events-none" />

                      {/* Cover Light Glare Reflection */}
                      {showGlare && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none" />
                      )}

                      {/* Top Category Tag */}
                      <div className="relative z-10 pl-2">
                        <span
                          className="text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded shadow-sm"
                          style={{ backgroundColor: theme.colors.primary, color: theme.colors.paperBg }}
                        >
                          {document.category || 'PDF Guide'}
                        </span>
                      </div>

                      {/* Book Title & Subtitle */}
                      <div className="relative z-10 pl-2 my-auto space-y-2">
                        <h3
                          className="text-lg sm:text-xl font-extrabold leading-tight tracking-tight"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {document.title}
                        </h3>
                        <p className="text-[10px] font-medium line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                          {document.subtitle}
                        </p>
                      </div>

                      {/* Cover Footer Author */}
                      <div className="relative z-10 pl-2 pt-2 border-t flex items-center justify-between text-[9px]" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}>
                        <span className="font-bold">By {document.author || 'Studio Creator'}</span>
                        <span className="font-mono">PDF MASTER</span>
                      </div>
                    </div>
                  )}

                  {/* Tablet Companion in Bundle Mode */}
                  {mockupPose === 'bundle-tablet' && (
                    <div className="hidden sm:flex absolute -bottom-4 -right-10 w-40 h-56 bg-slate-900 border-4 border-slate-700 rounded-2xl shadow-2xl p-3 flex-col justify-between transform rotate-6 transition-transform duration-500 group-hover:rotate-3 overflow-hidden">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mx-auto w-8 mb-1" />
                      <div
                        className="w-full flex-1 rounded-lg p-2.5 flex flex-col justify-between text-[8px]"
                        style={{ backgroundColor: theme.colors.paperBg, color: theme.colors.textPrimary }}
                      >
                        <p className="font-bold line-clamp-2">{document.title}</p>
                        <p className="line-clamp-4 text-[7px]" style={{ color: theme.colors.textSecondary }}>
                          {document.sections[0]?.paragraphs[0] || 'Chapter Preview...'}
                        </p>
                        <div className="text-[7px] font-mono border-t pt-1" style={{ borderColor: theme.colors.border }}>
                          Interactive PDF
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-Book Stack Mode */}
                  {mockupPose === 'multi-stack' && (
                    <div className="relative w-64 h-80 flex items-center justify-center">
                      <div className="absolute w-52 h-72 rounded-r-lg bg-slate-800 shadow-xl border border-white/20 transform -rotate-12 translate-x-4 opacity-70" />
                      <div className="absolute w-52 h-72 rounded-r-lg bg-accent-brass-900 shadow-xl border border-white/20 transform -rotate-6 translate-x-2 opacity-85" />
                      <div
                        className="w-52 h-72 rounded-r-lg shadow-2xl p-4 flex flex-col justify-between border-r border-t border-b border-white/20 relative"
                        style={{ backgroundColor: theme.colors.paperBg, color: theme.colors.textPrimary }}
                      >
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brass-400 text-slate-950 self-start">
                          PDF GUIDE
                        </span>
                        <h4 className="text-base font-extrabold leading-tight my-auto">
                          {document.title}
                        </h4>
                        <p className="text-[8px] font-mono">{document.author}</p>
                      </div>
                    </div>
                  )}

                  {/* Open Book Spread Mode */}
                  {mockupPose === 'open-spread' && (
                    <div
                      className="w-80 sm:w-96 h-56 rounded-xl shadow-2xl p-4 flex justify-between border border-white/20 relative"
                      style={{ backgroundColor: theme.colors.paperBg, color: theme.colors.textPrimary }}
                    >
                      {/* Spine Center Shadow */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 bg-gradient-to-r from-black/30 via-black/5 to-black/30" />

                      {/* Left Page */}
                      <div className="w-[48%] pr-2 border-r border-slate-300/40 flex flex-col justify-between text-[8px]">
                        <h5 className="font-bold border-b pb-1">
                          {document.sections[0]?.title || 'Chapter 1'}
                        </h5>
                        <p className="line-clamp-6 leading-relaxed opacity-80">
                          {document.sections[0]?.paragraphs[0] || 'Core principles overview...'}
                        </p>
                        <span className="font-mono text-[7px]">Page 1</span>
                      </div>

                      {/* Right Page */}
                      <div className="w-[48%] pl-2 flex flex-col justify-between text-[8px]">
                        <h5 className="font-bold border-b pb-1">
                          {document.sections[1]?.title || 'Key Execution'}
                        </h5>
                        <p className="line-clamp-6 leading-relaxed opacity-80">
                          {document.sections[1]?.paragraphs[0] || 'Detailed framework analysis...'}
                        </p>
                        <span className="font-mono text-[7px] text-right">Page 2</span>
                      </div>
                    </div>
                  )}

                  {/* Flatlay View Mode */}
                  {mockupPose === 'flatlay' && (
                    <div
                      className="w-56 h-76 rounded-lg shadow-2xl p-5 flex flex-col justify-between border border-white/20 transform rotate-1"
                      style={{ backgroundColor: theme.colors.paperBg, color: theme.colors.textPrimary }}
                    >
                      <span className="text-[8px] font-mono uppercase tracking-widest">{document.category}</span>
                      <h3 className="text-lg font-black leading-tight my-auto">
                        {document.title}
                      </h3>
                      <div className="text-[8px] border-t pt-1 flex justify-between">
                        <span>{document.author}</span>
                        <span>HD PDF</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Stars Overlay */}
                {showStars && (
                  <div className="relative z-10 flex items-center space-x-1 bg-slate-950/80 px-3 py-1 rounded-full border border-brass-500/30 text-[10px] text-brass-300">
                    <div className="flex text-brass-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="font-bold ml-1">5.0 (2,410 Reviews)</span>
                  </div>
                )}

                {/* Bottom Call to Action Badge Banner */}
                <div className="relative z-10 w-full text-center pb-1">
                  <div className="inline-flex items-center space-x-2.5 bg-slate-900/90 border border-brass-500/30 px-3.5 py-1.5 rounded-xl text-[11px] shadow-xl">
                    {showPriceTag && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px]">
                        {priceTag}
                      </span>
                    )}
                    <span className="font-extrabold text-brass-300">Instant PDF Download</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Fine-Tuning Inspector Controls */}
            <div className="lg:col-span-5 space-y-5">
              {/* Overlay Text Customizer */}
              <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Hook Headline Overlay</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(customPinOverlay, 'overlayText')}
                    className="px-2 py-0.5 bg-surface-2 hover:bg-surface-3 text-ink-secondary rounded text-[11px] flex items-center space-x-1"
                  >
                    {copiedField === 'overlayText' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'overlayText' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={customPinOverlay}
                  onChange={(e) => setCustomPinOverlay(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl p-3 text-xs text-ink-primary focus:ring-1 focus:ring-brass-500 focus:outline-none"
                  placeholder="Enter hook headline..."
                />
              </div>

              {/* Sticker / Callout Badge Customizer */}
              <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  Sticker Callout & Price Tag
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-ink-muted block mb-1">Sticker Text:</label>
                    <input
                      type="text"
                      value={stickerOverlay}
                      onChange={(e) => setStickerOverlay(e.target.value)}
                      className="w-full bg-surface-0 border border-hairline rounded-lg p-2 text-ink-primary font-bold"
                      placeholder="e.g. 📌 SAVE THIS PIN"
                    />
                  </div>
                  <div>
                    <label className="text-ink-muted block mb-1">Price Tag:</label>
                    <input
                      type="text"
                      value={priceTag}
                      onChange={(e) => setPriceTag(e.target.value)}
                      className="w-full bg-surface-0 border border-hairline rounded-lg p-2 text-emerald-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Problem vs Solution Editable Fields */}
              {pinTemplate === 'problem-solution' && (
                <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                    Problem & Solution Text
                  </span>
                  <input
                    type="text"
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl p-2.5 text-xs text-red-200"
                    placeholder="Problem text..."
                  />
                  <input
                    type="text"
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl p-2.5 text-xs text-emerald-200"
                    placeholder="Solution text..."
                  />
                </div>
              )}

              {/* 3D Angle & Lighting Sliders */}
              <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-4 text-xs">
                <span className="font-bold text-accent-brass-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>3D Tilt Angle & Glare Lighting</span>
                </span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-muted font-mono">
                      <span>3D Y-Axis Tilt ({tiltY}°)</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={tiltY}
                      onChange={(e) => setTiltY(Number(e.target.value))}
                      className="w-full accent-brass-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-muted font-mono">
                      <span>3D X-Axis Tilt ({tiltX}°)</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={tiltX}
                      onChange={(e) => setTiltX(Number(e.target.value))}
                      className="w-full accent-brass-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-ink-secondary font-medium">Cover Glare Reflection:</span>
                    <button
                      onClick={() => setShowGlare(!showGlare)}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                        showGlare ? 'bg-accent-brass-500 text-slate-950' : 'bg-surface-2 text-ink-muted'
                      }`}
                    >
                      {showGlare ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Badges & Ribbon Controls */}
              <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3 text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Foil Badge & Rating Controls</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-ink-muted block mb-1">Badge Text:</label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      className="w-full bg-surface-0 border border-hairline rounded-lg p-2 text-ink-primary font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-ink-muted block mb-1">Badge Color:</label>
                    <select
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value as any)}
                      className="w-full bg-surface-0 border border-hairline rounded-lg p-2 text-ink-primary"
                    >
                      <option value="gold">Gold Foil</option>
                      <option value="emerald">Emerald</option>
                      <option value="amber">Amber</option>
                      <option value="purple">Purple</option>
                      <option value="rose">Rose</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-ink-secondary">Show Ribbon Bookmark:</span>
                  <button
                    onClick={() => setShowRibbon(!showRibbon)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      showRibbon ? 'bg-emerald-500 text-slate-950' : 'bg-surface-2 text-ink-muted'
                    }`}
                  >
                    {showRibbon ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ink-secondary">Show 5-Star Reviews:</span>
                  <button
                    onClick={() => setShowStars(!showStars)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      showStars ? 'bg-brass-400 text-slate-950' : 'bg-surface-2 text-ink-muted'
                    }`}
                  >
                    {showStars ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 8-CHANNEL SOCIAL COPY PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Active Platform Card & Editable Formats */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Platform Header Banner */}
            <div className={`p-5 rounded-2xl bg-gradient-to-r ${platformMeta[activePlatform].color} text-ink-primary shadow-[var(--shadow-panel)] flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl p-2 bg-black/20 rounded-xl backdrop-blur-sm">
                  {platformMeta[activePlatform].icon}
                </span>
                <div>
                  <h3 className="text-lg font-black">{platformMeta[activePlatform].name} Viral Launch Pack</h3>
                  <p className="text-xs text-white/80 font-medium">Ready-to-post high converting copywriting</p>
                </div>
              </div>

              <button
                onClick={handleCopyFullPlatformPack}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-ink-primary rounded-xl text-xs font-bold backdrop-blur-sm flex items-center space-x-1.5 transition-colors"
              >
                {copiedField === `full-${activePlatform}` ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === `full-${activePlatform}` ? 'Copied Full Pack!' : 'Copy Entire Pack'}</span>
              </button>
            </div>

            {/* Platform Strategy Tip Box */}
            <div className="bg-surface-1 border border-accent-brass-500/30 p-4 rounded-2xl flex items-start space-x-3 text-xs text-brass-200">
              <TrendingUp className="w-4 h-4 text-accent-brass-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-accent-brass-300">VIRAL STRATEGY TIP: </span>
                <span>{currentPack.viralTip}</span>
              </div>
            </div>

            {/* Pinterest SEO Alt Text Box (Only visible when Pinterest is active) */}
            {activePlatform === 'pinterest' && currentPack.pinterestAltText && (
              <div className="bg-surface-1 border border-red-500/30 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Pinterest SEO Alt-Text (Image Description)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentPack.pinterestAltText || '', 'alttext')}
                    className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-ink-secondary rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                  >
                    {copiedField === 'alttext' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'alttext' ? 'Copied' : 'Copy Alt-Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={currentPack.pinterestAltText}
                  onChange={(e) => handleUpdatePackField('pinterestAltText', e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl p-3 text-xs text-ink-secondary font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>
            )}

            {/* Editable Title / Hook */}
            <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Post Title / Viral Headline Hook</span>
                </span>
                <button
                  onClick={() => copyToClipboard(currentPack.title, 'title')}
                  className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-ink-secondary rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'title' ? 'Copied' : 'Copy Title'}</span>
                </button>
              </div>
              <input
                type="text"
                value={currentPack.title}
                onChange={(e) => handleUpdatePackField('title', e.target.value)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-3 text-xs text-ink-primary font-bold focus:ring-1 focus:ring-brass-500 focus:outline-none"
              />
            </div>

            {/* Editable Main Caption / Script / Thread */}
            <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Post Body / Spoken Audio Script / Thread</span>
                </span>
                <button
                  onClick={() => copyToClipboard(`${currentPack.hook}\n\n${currentPack.body}`, 'body')}
                  className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-ink-secondary rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedField === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'body' ? 'Copied Body' : 'Copy Body'}</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={currentPack.hook}
                onChange={(e) => handleUpdatePackField('hook', e.target.value)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-3 text-xs text-accent-brass-300 font-medium focus:ring-1 focus:ring-accent-brass-500 focus:outline-none"
                placeholder="Opening hook..."
              />

              <textarea
                rows={7}
                value={currentPack.body}
                onChange={(e) => handleUpdatePackField('body', e.target.value)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-3 text-xs text-ink-secondary font-mono focus:ring-1 focus:ring-accent-brass-500 focus:outline-none leading-relaxed"
                placeholder="Full content body..."
              />
            </div>

            {/* Editable Hashtags & Tags */}
            <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Target Hashtags & Search Keywords</span>
                </span>
                <button
                  onClick={() => copyToClipboard(currentPack.hashtags, 'hashtags')}
                  className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-ink-secondary rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedField === 'hashtags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'hashtags' ? 'Copied Tags' : 'Copy Tags'}</span>
                </button>
              </div>
              <input
                type="text"
                value={currentPack.hashtags}
                onChange={(e) => handleUpdatePackField('hashtags', e.target.value)}
                className="w-full bg-surface-0 border border-hairline rounded-xl p-3 text-xs text-emerald-300 font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Side: Visual Graphic Companion Preview & Platform Checklist */}
          <div className="lg:col-span-4 space-y-6">
            {/* Graphic Stage Preview Card */}
            <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-accent-brass-400" />
                  <span>Visual Graphic Companion</span>
                </span>
                <button
                  onClick={() => setActiveTab('visual')}
                  className="text-[11px] text-accent-brass-300 hover:underline flex items-center space-x-1"
                >
                  <span>Customize 3D Cover</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Mini Graphic Rendering */}
              <div className="w-full aspect-[4/5] bg-surface-0 border border-hairline rounded-xl p-4 flex flex-col justify-between items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-accent-brass-900/40 to-transparent text-[10px] text-accent-brass-300 font-extrabold uppercase tracking-wider">
                  {platformMeta[activePlatform].name} Graphic Preset
                </div>

                {/* 3D Mini Book */}
                <div className="my-auto transform group-hover:scale-105 transition-transform">
                  <div
                    className="w-32 h-44 rounded-r-lg shadow-[var(--shadow-panel-brass)] p-3 flex flex-col justify-between border-r border-t border-b border-white/20 relative"
                    style={{ backgroundColor: theme.colors.paperBg, color: theme.colors.textPrimary }}
                  >
                    <span className="text-[7px] uppercase tracking-widest font-bold px-1 rounded bg-brass-400 text-slate-950 self-start">
                      PDF
                    </span>
                    <p className="text-xs font-extrabold line-clamp-3 leading-tight text-left">
                      {document.title}
                    </p>
                    <p className="text-[7px] font-mono text-left" style={{ color: theme.colors.textSecondary }}>
                      {document.author}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadMockupImage}
                  className="w-full py-2 bg-surface-2 hover:bg-surface-3 text-xs text-ink-primary font-bold rounded-lg border border-hairline-strong flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-accent-brass-400" />
                  <span>Export PNG Image</span>
                </button>
              </div>
            </div>

            {/* Social Media Distribution Checklist */}
            <div className="bg-surface-1 border border-hairline p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bestseller Launch Checklist</span>
              </h4>
              <ul className="space-y-2 text-xs text-ink-secondary">
                <li className="flex items-start space-x-2 bg-surface-0 p-2.5 rounded-xl border border-hairline">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Post at peak creator engagement hours (8-10 AM or 5-7 PM EST).</span>
                </li>
                <li className="flex items-start space-x-2 bg-surface-0 p-2.5 rounded-xl border border-hairline">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Attach 3D Book Graphic or Pinterest 2:3 Pin PNG asset.</span>
                </li>
                <li className="flex items-start space-x-2 bg-surface-0 p-2.5 rounded-xl border border-hairline">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Include direct PDF checkout link in Bio / 1st comment.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
