import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Zap, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  Maximize2, 
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  LayoutGrid,
  Type,
  Palette,
  Sliders,
  Wand2,
  Monitor,
  Smartphone,
  Share2,
  Award,
  Grid,
  FileImage,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { VisualAsset, SocialPlatform } from '../types';

// Style Archetype Presets for 1-Click Viral Visual Branding
const STYLE_ARCHETYPES = [
  {
    id: 'youtube-clickbait',
    label: '🔥 YouTube Viral Click-Bait',
    badge: '9:16 or 16:9',
    description: 'Ultra-high contrast, bold yellow typography, shocking neon glow accents, dark gradient frame.',
    promptPrefix: 'High-converting viral video thumbnail, dark dramatic cinematic lighting, glowing neon yellow bold 3D typography reading',
    aspectRatio: '16:9',
    themeColor: 'amber'
  },
  {
    id: 'linkedin-tech',
    label: '💼 LinkedIn Executive Tech',
    badge: '16:9 or 1:1',
    description: 'Modern obsidian dark mode, glassmorphism UI card, glowing cyan data charts, clean executive sans-serif.',
    promptPrefix: 'Sleek executive B2B marketing graphic, dark mode glassmorphism UI panel with glowing cyan data chart, reading',
    aspectRatio: '16:9',
    themeColor: 'cyan'
  },
  {
    id: 'instagram-carousel',
    label: '📸 Instagram Aesthetic Carousel',
    badge: '1:1 Square Deck',
    description: 'Warm neutral dark charcoal canvas, clean card border, high-fashion editorial serif typography.',
    promptPrefix: 'Minimalist Instagram carousel slide graphic, dark charcoal background, bright card outline, elegant white headline reading',
    aspectRatio: '1:1',
    themeColor: 'fuchsia'
  },
  {
    id: 'cyberpunk-phonk',
    label: '⚡ Cyberpunk Neon Phonk',
    badge: '9:16 Vertical',
    description: 'Intense magenta & cyan dual lighting, distorted grid background, high-energy 4k tech vibe.',
    promptPrefix: 'Cyberpunk neon social graphic, intense magenta and cyan dual rim lighting, dark futuristic grid, reading',
    aspectRatio: '9:16',
    themeColor: 'pink'
  },
  {
    id: 'data-infographic',
    label: '📊 Data-Backed Infographic',
    badge: '2:3 Pinterest',
    description: 'Clean structured step 1-2-3 layout, high legibility step badges, dark blue slate canvas.',
    promptPrefix: 'Structured Pinterest infographic pin, deep dark slate canvas, numbered step-by-step badge boxes, high resolution typography reading',
    aspectRatio: '2:3',
    themeColor: 'blue'
  }
];

export const VisualStudio: React.FC = () => {
  // Mode selection: Single Graphic vs. 5-Slide Carousel Deck vs. A/B Variant Test
  const [studioMode, setStudioMode] = useState<'single' | 'carousel' | 'ab_variants'>('single');

  // Input & Prompt state
  const [promptText, setPromptText] = useState('3 AI WORKFLOWS TO REPLACE A $50K AGENCY');
  const [selectedArchetype, setSelectedArchetype] = useState(STYLE_ARCHETYPES[0].id);
  const [platform, setPlatform] = useState<SocialPlatform | 'thumbnail' | 'carousel' | 'pinterest' | 'linkedin' | 'tiktok'>('instagram');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Canvas Text Overlay Studio state
  const [headlineOverlay, setHeadlineOverlay] = useState('3 AI WORKFLOWS TO REPLACE $50K AGENCIES');
  const [badgeOverlay, setBadgeOverlay] = useState('DO NOT IGNORE ⚠️');
  const [authorHandle, setAuthorHandle] = useState('@viralos_app');
  const [overlayPosition, setOverlayPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [fontStyle, setFontStyle] = useState<'impact' | 'serif' | 'mono' | 'sans'>('impact');
  const [badgeColor, setBadgeColor] = useState<'amber' | 'rose' | 'cyan' | 'violet' | 'emerald'>('amber');
  const [showSafeZone, setShowSafeZone] = useState(true);

  // Gallery & Selected Asset
  const [gallery, setGallery] = useState<VisualAsset[]>([
    {
      id: 'asset-default-1',
      prompt: 'High-converting viral video thumbnail, dark dramatic cinematic lighting, glowing neon yellow bold 3D typography reading "3 AI WORKFLOWS TO REPLACE A $50K AGENCY"',
      platform: 'instagram',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      createdAt: 'Just now',
      aspectRatio: '1:1',
      headlineOverlay: '3 AI WORKFLOWS TO REPLACE $50K AGENCIES',
      badgeOverlay: 'DO NOT IGNORE ⚠️',
      styleTheme: '🔥 YouTube Viral Click-Bait'
    }
  ]);

  const [selectedAsset, setSelectedAsset] = useState<VisualAsset | null>(gallery[0]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // AI Prompt Magic Enhancer
  const handleEnhancePrompt = () => {
    const archetype = STYLE_ARCHETYPES.find(a => a.id === selectedArchetype) || STYLE_ARCHETYPES[0];
    const enhanced = `${archetype.promptPrefix} "${promptText.toUpperCase()}", high contrast lighting, 4K digital marketing asset, professional social graphic layout`;
    setPromptText(enhanced);
  };

  // Apply archetype preset
  const handleSelectArchetype = (arch: typeof STYLE_ARCHETYPES[0]) => {
    setSelectedArchetype(arch.id);
    setAspectRatio(arch.aspectRatio);
  };

  // Generate Image Handler
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const archetype = STYLE_ARCHETYPES.find(a => a.id === selectedArchetype);
      const fullPrompt = promptText.includes('High-converting') 
        ? promptText 
        : `${archetype?.promptPrefix || ''} "${promptText}", 4k graphic design`;

      const response = await fetch('/api/viral/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: fullPrompt, 
          platform, 
          aspectRatio,
          styleTheme: archetype?.label 
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Visual asset generation failed');
      }

      const data = await response.json();

      // If Carousel mode, mock 5 matching slides
      let mockSlides = undefined;
      if (studioMode === 'carousel') {
        mockSlides = [
          { slideNumber: 1, title: 'HOOOK: ' + promptText.slice(0, 30), description: 'Stop scrolling if you are burning budget on agencies.', imageUrl: data.imageUrl },
          { slideNumber: 2, title: 'THE PROBLEM', description: '90% of creators fail because of inconsistent visual branding.', imageUrl: data.imageUrl },
          { slideNumber: 3, title: 'THE SOLUTION', description: 'Use Gemini 3.1 Flash AI image generation for instant 4K graphics.', imageUrl: data.imageUrl },
          { slideNumber: 4, title: 'THE PROOF', description: 'Generated 1.2M views across TikTok, LinkedIn & Instagram.', imageUrl: data.imageUrl },
          { slideNumber: 5, title: 'CALL TO ACTION', description: 'Comment "VIRAL" to download the full prompt stack!', imageUrl: data.imageUrl }
        ];
      }

      const newAsset: VisualAsset = {
        id: `img-${Date.now()}`,
        prompt: fullPrompt,
        platform,
        imageUrl: data.imageUrl,
        createdAt: new Date().toLocaleTimeString(),
        aspectRatio: data.aspectRatio || aspectRatio,
        headlineOverlay: headlineOverlay || promptText,
        badgeOverlay,
        styleTheme: archetype?.label || 'Custom Graphic',
        slides: mockSlides
      };

      setGallery([newAsset, ...gallery]);
      setSelectedAsset(newAsset);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate visual graphic. Check Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!selectedAsset) return;
    navigator.clipboard.writeText(selectedAsset.imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Font style classes for overlay preview
  const fontStyleClasses = {
    impact: 'font-black tracking-tight uppercase font-sans drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]',
    serif: 'font-serif font-extrabold tracking-normal text-amber-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]',
    mono: 'font-mono font-bold tracking-widest uppercase text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]',
    sans: 'font-sans font-extrabold tracking-wide uppercase text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]'
  };

  // Badge pill color classes
  const badgeColorClasses = {
    amber: 'bg-amber-400 text-slate-950 font-black border-amber-300',
    rose: 'bg-rose-500 text-white font-black border-rose-400',
    cyan: 'bg-cyan-400 text-slate-950 font-black border-cyan-300',
    violet: 'bg-violet-500 text-white font-black border-violet-400',
    emerald: 'bg-emerald-400 text-slate-950 font-black border-emerald-300'
  };

  return (
    <div className="space-y-8">
      {/* Studio Banner Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-xs font-semibold text-fuchsia-300 mb-2">
              <ImageIcon className="h-4 w-4 text-fuchsia-400" />
              <span>Gemini 3.1 Flash-Lite AI Graphic & Overlay Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Thumbnail & Visual Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-bold tracking-normal uppercase">
                v10.0 Pro
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Design high-converting video thumbnails, 5-slide carousel decks, Pinterest SEO pins, and social share cards. Features live canvas typography overlays, social app UI safe-zone guides, and AI prompt engineering.
            </p>
          </div>

          {/* Quick Studio Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setStudioMode('single')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                studioMode === 'single' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileImage className="h-4 w-4" />
              <span>Single Graphic</span>
            </button>

            <button
              onClick={() => setStudioMode('carousel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                studioMode === 'carousel' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>5-Slide Carousel</span>
            </button>

            <button
              onClick={() => setStudioMode('ab_variants')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                studioMode === 'ab_variants' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>A/B Split Test</span>
            </button>
          </div>
        </div>

        {/* Style Archetype Selector Cards */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-fuchsia-400" />
            <span>Select 1-Click Aesthetic Style Archetype:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {STYLE_ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                type="button"
                onClick={() => handleSelectArchetype(arch)}
                className={`p-3 rounded-2xl border text-left transition-all space-y-1.5 relative overflow-hidden ${
                  selectedArchetype === arch.id
                    ? 'bg-slate-900 border-fuchsia-500 ring-2 ring-fuchsia-500/50 shadow-xl'
                    : 'bg-slate-950 border-slate-800/90 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white truncate">{arch.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {arch.description}
                </p>
                <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-fuchsia-300">
                  {arch.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form & Parameters */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Type className="h-4 w-4 text-cyan-400" />
                <span>Headline Concept / Visual Text Prompt:</span>
              </label>

              <button
                type="button"
                onClick={handleEnhancePrompt}
                className="text-xs text-amber-300 font-bold hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
              >
                <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Magic Prompt Engineer (10x)</span>
              </button>
            </div>

            <textarea
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                setHeadlineOverlay(e.target.value);
              }}
              rows={2}
              placeholder="e.g. 3 AI WORKFLOWS TO REPLACE A $50K AGENCY"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-fuchsia-500 leading-relaxed font-sans shadow-inner"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Target Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-fuchsia-500 font-semibold"
              >
                <option value="1:1">1:1 Square (Instagram / LinkedIn Carousel)</option>
                <option value="9:16">9:16 Vertical (TikTok / Reels / Shorts / Story)</option>
                <option value="16:9">16:9 Landscape (YouTube Thumbnail / X Header)</option>
                <option value="2:3">2:3 High-SEO Vertical (Pinterest Pin)</option>
                <option value="4:5">4:5 Feed Portrait (Instagram Main Feed)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Target Social Platform Ruleset
              </label>
              <select
                value={platform}
                onChange={(e: any) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-fuchsia-500 font-semibold"
              >
                <option value="instagram">Instagram Carousel / Reel Thumbnail</option>
                <option value="tiktok">TikTok Video Cover Thumbnail</option>
                <option value="thumbnail">YouTube Video Thumbnail (16:9)</option>
                <option value="pinterest">Pinterest SEO Pin (2:3)</option>
                <option value="linkedin">LinkedIn Document / Article Header</option>
                <option value="x">X / Twitter Banner Graphic</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !promptText.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-violet-500 text-white font-black text-sm shadow-xl shadow-fuchsia-600/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin text-amber-300" />
                <span>Rendering 4K AI Visual Asset & Applying Overlays...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 text-amber-300 fill-amber-300" />
                <span>
                  {studioMode === 'carousel'
                    ? 'Generate 5-Slide AI Carousel Deck'
                    : studioMode === 'ab_variants'
                    ? 'Generate 3 A/B Split-Test Thumbnails'
                    : 'Generate High-Converting Visual Graphic'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* WORKSPACE: LIVE CANVAS OVERLAY EDITOR & ASSET PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN CANVAS PREVIEW CARD */}
        {selectedAsset && (
          <div className="lg:col-span-8 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white uppercase">
                    {selectedAsset.platform.toUpperCase()} GRAPHIC
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
                    {selectedAsset.aspectRatio}
                  </span>
                  {selectedAsset.styleTheme && (
                    <span className="text-xs font-semibold text-slate-400">
                      • {selectedAsset.styleTheme}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{selectedAsset.createdAt}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSafeZone(!showSafeZone)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    showSafeZone ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {showSafeZone ? <Eye className="h-4 w-4 text-amber-400" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  <span>App Safe-Zone Overlay</span>
                </button>

                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedUrl ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-violet-400" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>

                <a
                  href={selectedAsset.imageUrl}
                  download="viral-graphic.png"
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-slate-950" />
                  <span>Download 4K Graphic</span>
                </a>
              </div>
            </div>

            {/* LIVE GRAPHIC CANVAS DISPLAY WITH OVERLAYS */}
            <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex items-center justify-center min-h-[420px] max-h-[520px] overflow-hidden shadow-2xl">
              {/* Background Generated Image */}
              <img
                src={selectedAsset.imageUrl}
                alt="Viral Graphic AI"
                referrerPolicy="no-referrer"
                className="max-h-[480px] w-auto object-contain rounded-xl shadow-2xl"
              />

              {/* LIVE OVERLAY TEXT LAYER */}
              <div 
                className={`absolute inset-x-8 z-20 flex flex-col items-center text-center p-4 transition-all ${
                  overlayPosition === 'top' ? 'top-8' : overlayPosition === 'bottom' ? 'bottom-12' : 'top-1/2 -translate-y-1/2'
                }`}
              >
                {/* Badge Overlay Pill */}
                {badgeOverlay && (
                  <span className={`px-3 py-1 rounded-full text-xs tracking-wider uppercase shadow-2xl mb-2 border ${badgeColorClasses[badgeColor]}`}>
                    {badgeOverlay}
                  </span>
                )}

                {/* Headline Overlay Text */}
                {headlineOverlay && (
                  <h2 className={`text-xl sm:text-2xl lg:text-3xl max-w-lg leading-tight ${fontStyleClasses[fontStyle]}`}>
                    {headlineOverlay}
                  </h2>
                )}

                {/* Author Handle Watermark */}
                {authorHandle && (
                  <span className="mt-2 text-[10px] font-mono font-bold text-slate-300/80 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20">
                    {authorHandle}
                  </span>
                )}
              </div>

              {/* SOCIAL APP SAFE-ZONE UI OVERLAYS (TikTok / Reel / YouTube) */}
              {showSafeZone && (
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/40 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[9px] font-mono text-amber-300 font-bold bg-black/70 px-2 py-1 rounded border border-amber-400/30">
                    <span>⚠️ SOCIAL APP UI SAFE ZONE</span>
                    <span>SAFE HEADER TOP (80px)</span>
                  </div>

                  {/* Right side Reels / TikTok button placeholders */}
                  <div className="absolute right-4 bottom-20 flex flex-col gap-3 items-center opacity-70">
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px] text-white">❤️</div>
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px] text-white">💬</div>
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px] text-white">✈️</div>
                  </div>

                  {/* Bottom Caption Box Overlay */}
                  <div className="bg-black/80 p-2 rounded border border-amber-400/30 text-[9px] font-mono text-amber-300 max-w-xs">
                    📱 CAPTION & USERNAME ZONE (Keep clear of critical text)
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Meta Box */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
              <strong className="text-fuchsia-400">AI Prompt Stack:</strong> {selectedAsset.prompt}
            </div>

            {/* IF CAROUSEL DECK MODE: 5 SEQUENTIAL SLIDES DISPLAY */}
            {selectedAsset.slides && selectedAsset.slides.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-fuchsia-400" />
                  <span>5-Slide Sequential Carousel Deck Preview</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {selectedAsset.slides.map((slide) => (
                    <div key={slide.slideNumber} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-fuchsia-400">
                        <span>SLIDE #{slide.slideNumber}</span>
                      </div>
                      <div className="font-bold text-xs text-white line-clamp-1">{slide.title}</div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{slide.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT SIDEBAR: LIVE TEXT OVERLAY CONTROLS & GALLERY */}
        <div className="lg:col-span-4 space-y-6">
          {/* Text Overlay Customizer Card */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="h-4 w-4 text-fuchsia-400" />
              <span>Canvas Text Overlay Controls</span>
            </h3>

            {/* Badge Pill Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Sticker / Badge Text Overlay:
              </label>
              <input
                type="text"
                value={badgeOverlay}
                onChange={(e) => setBadgeOverlay(e.target.value)}
                placeholder="e.g. DO NOT IGNORE ⚠️"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Headline Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Main Headline Text Overlay:
              </label>
              <textarea
                value={headlineOverlay}
                onChange={(e) => setHeadlineOverlay(e.target.value)}
                rows={2}
                placeholder="e.g. 3 AI WORKFLOWS TO REPLACE $50K AGENCIES"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Typography Font Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Typography Font Style:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFontStyle('impact')}
                  className={`p-2 rounded-xl border text-xs font-black uppercase ${
                    fontStyle === 'impact' ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Heavy Impact
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('serif')}
                  className={`p-2 rounded-xl border text-xs font-serif font-bold ${
                    fontStyle === 'serif' ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Editorial Serif
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('mono')}
                  className={`p-2 rounded-xl border text-xs font-mono font-bold ${
                    fontStyle === 'mono' ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Tech Mono
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('sans')}
                  className={`p-2 rounded-xl border text-xs font-bold ${
                    fontStyle === 'sans' ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Clean Sans
                </button>
              </div>
            </div>

            {/* Position & Badge Color Selectors */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Text Position:
                </label>
                <select
                  value={overlayPosition}
                  onChange={(e: any) => setOverlayPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="top">Top Header</option>
                  <option value="center">Center Focused</option>
                  <option value="bottom">Bottom Footer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Badge Pill Color:
                </label>
                <select
                  value={badgeColor}
                  onChange={(e: any) => setBadgeColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="amber">🟡 Viral Yellow</option>
                  <option value="rose">🔴 Shocking Red</option>
                  <option value="cyan">🔵 Tech Cyan</option>
                  <option value="violet">🟣 Cyber Purple</option>
                  <option value="emerald">🟢 Money Green</option>
                </select>
              </div>
            </div>
          </div>

          {/* Asset Gallery Sidebar */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Studio Asset Gallery ({gallery.length})</span>
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {gallery.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedAsset?.id === asset.id
                      ? 'bg-fuchsia-500/10 border-fuchsia-500 ring-2 ring-fuchsia-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={asset.imageUrl}
                    alt="Thumbnail"
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 object-cover rounded-xl shrink-0 border border-slate-800"
                  />
                  <div className="overflow-hidden space-y-0.5">
                    <span className="text-[10px] font-black text-fuchsia-400 uppercase block">
                      {asset.platform} ({asset.aspectRatio})
                    </span>
                    <p className="text-xs font-bold text-white truncate">{asset.headlineOverlay || asset.prompt}</p>
                    <span className="text-[10px] text-slate-500 block">{asset.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
