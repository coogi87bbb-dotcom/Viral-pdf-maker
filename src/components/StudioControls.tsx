import React, { useState } from 'react';
import {
  Palette,
  Layout,
  Type,
  Sparkles,
  BookOpen,
  Layers,
  Sliders,
  Check,
  FileText,
  Edit3,
  Image as ImageIcon,
  Heading,
  AlignCenter,
  Shield,
  FileCode,
  Droplet,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Upload,
  Trash2,
  Crown,
  Award,
  ShoppingBag,
  Share2,
  Feather,
  Star,
  Plus,
  Search,
  Globe,
  Flame,
  Anchor,
  CircleDot,
  Zap,
  Compass,
  Key,
  Triangle,
  Infinity as InfinityIcon,
  Leaf,
  Sun,
  Settings as SettingsIcon,
  Hexagon,
  ShieldCheck,
  BadgeCheck,
  Tag,
  Stamp,
  Box,
  Columns
} from 'lucide-react';
import { StudioTheme, StudioSettings, CoverStyle, FontPairingId, PageSize, PageMargin, PaperBgStyle } from '../types';
import { STUDIO_THEMES } from '../data/themes';
import { FONT_PAIRINGS_DATA, INDIVIDUAL_HEADER_FONTS, INDIVIDUAL_BODY_FONTS } from '../data/fontPairings';

interface StudioControlsProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onSelectTheme: (theme: StudioTheme) => void;
  onOpenAiEnhancer: () => void;
  onOpenImporter: () => void;
  onOpenEditor: () => void;
  onOpenMockupModal?: () => void;
  onOpenDigitalKitStudio?: () => void;
  isSplitScreen?: boolean;
  onToggleSplitScreen?: () => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  settings,
  onUpdateSettings,
  onSelectTheme,
  onOpenAiEnhancer,
  onOpenImporter,
  onOpenEditor,
  onOpenMockupModal,
  onOpenDigitalKitStudio,
  isSplitScreen = true,
  onToggleSplitScreen
}) => {
  const [activeSection, setActiveSection] = useState<'themes' | 'cover' | 'logo' | 'typography' | 'paper' | 'headers' | 'elements' | 'colors'>('themes');
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<string>('All');
  const [themeSearchQuery, setThemeSearchQuery] = useState<string>('');

  const [selectedCoverCategory, setSelectedCoverCategory] = useState<string>('All');
  const [coverSearchQuery, setCoverSearchQuery] = useState<string>('');

  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('All');
  const [fontSearchQuery, setFontSearchQuery] = useState<string>('');

  const fontCategories = [
    'All',
    'Editorial & Serif',
    'Corporate & Sans',
    'Tech & Cyber',
    'Luxury & Gold',
    'Creative & Display',
    'Vintage & Retro',
    'Academic & Research',
    'Swiss & Minimal',
    'Friendly & Modern',
    'Magazine & Press'
  ];

  const themeCategories = [
    'All',
    'Editorial & Literary',
    'Digital & Ebook Creators',
    'Luxury & Design',
    'Business & Corporate',
    'Tech & Engineering',
    'Lifestyle & Wellbeing',
    'Vintage & Period Press'
  ];

  const coverCategories = [
    'All',
    'Editorial & Fashion',
    'Swiss & Minimal',
    'Modern Banner',
    'Luxury & Gold',
    'Academic & Press',
    'Tech & Digital'
  ];

  const filteredThemes = STUDIO_THEMES.filter((theme) => {
    const matchesCategory = selectedThemeCategory === 'All' || theme.category === selectedThemeCategory;
    const matchesSearch =
      !themeSearchQuery ||
      theme.name.toLowerCase().includes(themeSearchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(themeSearchQuery.toLowerCase()) ||
      theme.tag.toLowerCase().includes(themeSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentTheme = STUDIO_THEMES.find((t) => t.id === settings.themeId) || STUDIO_THEMES[0];

  const coverStyles: { id: CoverStyle; label: string; desc: string; category: string }[] = [
    { id: 'editorial-vogue', label: 'Vogue Editorial', desc: 'Oversized serif title, issue tag & author bar', category: 'Editorial & Fashion' },
    { id: 'geometric', label: 'Geometric Gold Crest', desc: 'Modern abstract geometric shapes & gold badge', category: 'Luxury & Gold' },
    { id: 'banner', label: 'Full Color Banner', desc: 'Top full-width accent color hero block', category: 'Modern Banner' },
    { id: 'framed', label: 'Luxury Double Frame', desc: 'Double hairline frame border layout', category: 'Luxury & Gold' },
    { id: 'split', label: 'Split Graphic Side Accent', desc: 'Dual-column colored side accent split', category: 'Modern Banner' },
    { id: 'bold-title', label: 'Bold Swiss Display', desc: 'Ultra-high impact display headline with colored bar', category: 'Swiss & Minimal' },
    { id: 'monogram-header', label: 'Monogram Crest Badge', desc: 'Classic centered emblem or round logo crest', category: 'Editorial & Fashion' },
    { id: 'magazine-full', label: 'Full Magazine Cover', desc: 'Full-canvas background block & issue stamp', category: 'Editorial & Fashion' },
    { id: 'classic-academic', label: 'Academic University Press', desc: 'Formal university press layout with seals & Latin rule', category: 'Academic & Press' },
    { id: 'tech-dark', label: 'Cyber Tech Dark Terminal', desc: 'Terminal grid dark cover for technical docs & code', category: 'Tech & Digital' },
    { id: 'minimalist', label: 'Minimalist Ivory', desc: 'Clean off-white centered typography with bullet dot', category: 'Swiss & Minimal' },
    { id: 'minimal-type', label: 'Pure Minimal Stark Type', desc: 'Stark white high-contrast editorial monotype grid', category: 'Swiss & Minimal' },
    { id: 'penguin-tri-band', label: 'Penguin Tri-Band Paperback', desc: 'Classic 3-band paperback with top/bottom color blocks', category: 'Academic & Press' },
    { id: 'diagonal-slash', label: 'Diagonal Slash Angle Block', desc: 'Bold diagonal slash angle block with split text', category: 'Modern Banner' },
    { id: 'oversized-drop-cap', label: 'Poster Giant Drop Capital', desc: 'Giant initial letter graphic behind headline', category: 'Editorial & Fashion' },
    { id: 'floating-card-frame', label: 'Floating Elevated Card Frame', desc: 'Floating elevated card with subtle shadow on paper', category: 'Luxury & Gold' },
    { id: 'volume-edition-num', label: 'Volume Edition Number Overlay', desc: 'Big bold edition number (VOL 01) background overlay', category: 'Academic & Press' },
    { id: 'index-table-summary', label: 'Executive Table Index Cover', desc: 'Executive summary cover with preview index table & metadata', category: 'Tech & Digital' },
    { id: 'double-ribbon-stripe', label: 'Double Ribbon Band Seal', desc: 'Top & bottom dual accent ribbon bands with gold seal badge', category: 'Academic & Press' },
    { id: 'centered-oval-seal', label: 'Centered Oval Crest Seal', desc: 'Traditional leatherbound book style with embossed seal', category: 'Luxury & Gold' },
    { id: 'obsidian-spotlight-glow', label: 'Obsidian Radial Spotlight', desc: 'Deep dark canvas with radial spotlight glow behind title', category: 'Tech & Digital' },
    { id: 'newsletter-substack', label: 'Substack Digest Lead', desc: 'Digital newsletter hero tag & author subscriber bar', category: 'Tech & Digital' },
    { id: 'blueprint-wireframe', label: 'Blueprint Technical Grid', desc: 'Blueprint navy grid background with technical crosshairs', category: 'Tech & Digital' },
    { id: 'risograph-duotone', label: 'Risograph Indie Zine', desc: 'Retro indie zine layout with high-energy duotone blocks', category: 'Editorial & Fashion' },
    { id: 'polaroid-gallery-box', label: 'Polaroid Gallery Photo Frame', desc: 'Framing box styled like a classic photograph border', category: 'Editorial & Fashion' },
    { id: 'corner-ribbon-tag', label: 'Corner Folded Sash Badge', desc: 'Corner folded sash ribbon ("SPECIAL EDITION") with title box', category: 'Academic & Press' },
    { id: 'newspaper-front-page', label: 'Newspaper Broadsheet Masthead', desc: 'Classic broadsheet newspaper masthead with multi-column lead', category: 'Editorial & Fashion' },
    { id: 'inverted-block-hero', label: 'Inverted High-Contrast Block', desc: 'High contrast dark block hero with inverted text', category: 'Modern Banner' },
    { id: 'vertical-spine-display', label: 'Vertical Sideways Spine Banner', desc: 'Modern rotated vertical spine title banner on left edge', category: 'Swiss & Minimal' },
    { id: 'botanical-crest-frame', label: 'Botanical Archway Crest', desc: 'Archway frame with leaf motif crest and serif lettering', category: 'Luxury & Gold' }
  ];

  const filteredCoverStyles = coverStyles.filter((style) => {
    const matchesCategory = selectedCoverCategory === 'All' || style.category === selectedCoverCategory;
    const matchesSearch =
      !coverSearchQuery ||
      style.label.toLowerCase().includes(coverSearchQuery.toLowerCase()) ||
      style.desc.toLowerCase().includes(coverSearchQuery.toLowerCase()) ||
      style.category.toLowerCase().includes(coverSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFontPairings = FONT_PAIRINGS_DATA.filter((pair) => {
    const matchesCategory = selectedFontCategory === 'All' || pair.category === selectedFontCategory;
    const matchesSearch =
      !fontSearchQuery ||
      pair.name.toLowerCase().includes(fontSearchQuery.toLowerCase()) ||
      pair.description.toLowerCase().includes(fontSearchQuery.toLowerCase()) ||
      pair.headerFont.toLowerCase().includes(fontSearchQuery.toLowerCase()) ||
      pair.bodyFont.toLowerCase().includes(fontSearchQuery.toLowerCase()) ||
      pair.category.toLowerCase().includes(fontSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pageSizes: { id: PageSize; label: string; desc: string }[] = [
    { id: 'letter', label: 'US Letter Standard', desc: '8.5" x 11" (215.9 x 279.4 mm)' },
    { id: 'a4', label: 'A4 Global Standard', desc: '8.27" x 11.69" (210 x 297 mm)' },
    { id: 'a5', label: 'A5 Compact Booklet', desc: '5.83" x 8.27" (148 x 210 mm)' },
    { id: 'a6', label: 'A6 Pocket Mini', desc: '4.13" x 5.83" (105 x 148 mm)' },
    { id: 'square', label: 'Square 8x8 Workbook', desc: '8" x 8" (203.2 x 203.2 mm)' },
    { id: 'square-large', label: 'Large Square 10x10', desc: '10" x 10" (254 x 254 mm)' },
    { id: 'executive', label: 'Executive Planner', desc: '7.25" x 10.5" (184.15 x 266.7 mm)' },
    { id: 'legal', label: 'US Legal Report', desc: '8.5" x 14" (215.9 x 355.6 mm)' },
    { id: 'trade-6x9', label: 'Trade Paperback 6x9', desc: '6" x 9" (152.4 x 228.6 mm)' },
    { id: 'digest-5.5x8.5', label: 'Digest Ebook 5.5x8.5', desc: '5.5" x 8.5" (139.7 x 215.9 mm)' },
    { id: 'royal-6.14x9.21', label: 'Royal Octavo 6.14x9.21', desc: '6.14" x 9.21" (156 x 234 mm)' },
    { id: 'crown-quarto', label: 'Crown Quarto 7.44x9.68', desc: '7.44" x 9.68" (189 x 246 mm)' },
    { id: 'b5', label: 'B5 ISO Standard', desc: '6.93" x 9.84" (176 x 250 mm)' },
    { id: 'tablet-4x3', label: 'iPad / Tablet 4:3 Ratio', desc: '8.0" x 10.67" (iPad Display)' },
    { id: 'widescreen-16x9', label: 'Landscape Slide 16:9', desc: '11" x 6.18" (Horizontal Presentation)' },
    { id: 'mobile-9x16', label: 'Smartphone Vertical 9:16', desc: '5" x 8.88" (Mobile Reader)' },
    { id: 'pocket-4x6', label: 'Pocket Mini 4x6', desc: '4" x 6" (101.6 x 152.4 mm)' },
    { id: 'workbook-8.5x11', label: 'Heavy Workbook 8.5x11', desc: '8.5" x 11" (Thick Margin)' },
    { id: 'manga-5x7.5', label: 'Manga / Comic 5x7.5', desc: '5" x 7.5" (127 x 190.5 mm)' },
    { id: 'architect-arch-a', label: 'Arch A Architectural 9x12', desc: '9" x 12" (228.6 x 304.8 mm)' },
    { id: 'broadsheet-mini', label: 'Broadsheet Tabloid 11x17', desc: '11" x 17" (Newspaper Format)' }
  ];

  const paperTones: { id: PaperBgStyle; label: string; bgHex: string; desc: string }[] = [
    { id: 'default', label: 'Theme Default', bgHex: currentTheme.colors.paperBg, desc: 'Matches theme palette' },
    { id: 'pure-white', label: 'Pure Studio White', bgHex: '#FFFFFF', desc: 'Crisp digital white' },
    { id: 'warm-ivory', label: 'Warm Vellum Ivory', bgHex: '#FAF9F6', desc: 'Warm bookbinder vellum' },
    { id: 'cream-parchment', label: 'Parchment Cream', bgHex: '#F5F2E9', desc: 'Classic antique parchment' },
    { id: 'soft-sand', label: 'Desert Sand', bgHex: '#F4F1EA', desc: 'Organic matte sand canvas' },
    { id: 'recycled-kraft', label: 'Recycled Kraft Paper', bgHex: '#E5D8C5', desc: 'Unbleached natural kraft' },
    { id: 'linen-cotton', label: 'French Linen Cotton', bgHex: '#F7F7F3', desc: 'Woven cotton cloth grain' },
    { id: 'rose-quartz', label: 'Soft Rose Quartz', bgHex: '#FDF5F5', desc: 'Blush pink tone' },
    { id: 'sage-botanical', label: 'Botanical Soft Sage', bgHex: '#F1F5F2', desc: 'Natural green tint' },
    { id: 'blueprint-cyan', label: 'Blueprint Grid Navy', bgHex: '#0F172A', desc: 'Architectural navy grid' },
    { id: 'dot-grid-journal', label: 'Bullet Journal Grid', bgHex: '#FAF9F5', desc: 'Dot matrix journal overlay' },
    { id: 'cool-grey', label: 'Slate Cool Grey', bgHex: '#F1F5F9', desc: 'Modern tech grey' },
    { id: 'aged-sepia', label: 'Vintage Sepia', bgHex: '#F3EDE0', desc: 'Antique 19th c. page' },
    { id: 'slate-obsidian', label: 'Obsidian Midnight Dark', bgHex: '#121417', desc: 'High-end obsidian dark' },
    { id: 'midnight-espresso', label: 'Dark Espresso Velvet', bgHex: '#1A1614', desc: 'Dark espresso coffee tone' },
    { id: 'frost-matte', label: 'Frosted Translucent', bgHex: '#F8FAFC', desc: 'Minimalist frost paper' },
    { id: 'vintage-newsprint', label: 'Broadsheet Newsprint', bgHex: '#EFEBE2', desc: 'Classic newsprint press' },
    { id: 'marble-flourish', label: 'Carrara Marble', bgHex: '#FAFAFA', desc: 'Subtle marble vein' },
    { id: 'blue-lined-notepad', label: 'Legal Yellow Lined', bgHex: '#FEFCE8', desc: 'Yellow with blue rules' }
  ];

  const pageMargins: { id: PageMargin; label: string; desc: string }[] = [
    { id: 'compact', label: 'Compact', desc: '16px / 0.5" tight' },
    { id: 'standard', label: 'Standard', desc: '28px / 0.75" balanced' },
    { id: 'wide', label: 'Wide Editorial', desc: '40px / 1.0" spacious' },
    { id: 'ultra', label: 'Ultra Luxury', desc: '52px / 1.5" book style' },
    { id: 'magazine-bleed', label: 'Magazine Bleed', desc: '8px / 0.25" edge bleed' },
    { id: 'academic-mirror', label: 'Academic Mirror', desc: 'Inside 36px / Out 18px' },
    { id: 'side-column-notes', label: 'Side Notes Column', desc: 'Left 20px / Right 64px' },
    { id: 'bottom-heavy', label: 'Bottom Heavy', desc: 'Top 24px / Bottom 56px' },
    { id: 'pocket-dense', label: 'Pocket Dense', desc: '12px mobile dense' }
  ];

  const logoSettings = settings.logoSettings || {
    showLogo: true,
    logoType: 'text',
    logoText: 'STUDIO PRESS',
    logoSubtext: 'DIGITAL PUBLICATION',
    logoImageUrl: '',
    logoPlacement: 'cover-only',
    logoAlignment: 'center',
    logoHeight: 28
  };

  const handleUpdateLogo = (partial: Partial<typeof logoSettings>) => {
    onUpdateSettings({
      logoSettings: { ...logoSettings, ...partial }
    });
  };

  return (
    <div
      id="studio-controls-bar"
      className="w-full bg-surface-1 border border-hairline rounded-3xl text-ink-secondary flex flex-col h-[calc(100vh-210px)] min-h-[660px] max-h-[880px] shadow-[var(--shadow-floating)] overflow-hidden select-none"
    >
      {/* Controls Header */}
      <div className="p-3.5 border-b border-hairline flex items-center justify-between bg-surface-0/90 shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-accent-rosegold-400" />
          <h2 className="font-bold text-xs text-white">Studio Design Controls</h2>
        </div>
        {onToggleSplitScreen && (
          <button
            type="button"
            onClick={onToggleSplitScreen}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center space-x-1 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 ${
              isSplitScreen
                ? 'bg-accent-rosegold-500/20 text-accent-rosegold-300 border-accent-rosegold-400/50'
                : 'bg-surface-2 text-ink-muted border-hairline hover:text-ink-secondary'
            }`}
            title="Toggle Side-by-Side Split Screen"
          >
            <Columns className="w-3 h-3 text-accent-rosegold-400" />
            <span>Split View: {isSplitScreen ? 'ON' : 'OFF'}</span>
          </button>
        )}
      </div>

      <div className="p-3.5 space-y-4 flex-1 overflow-y-auto">
        {/* Pinterest Pins & 3D Cover Mockups Quick Launch Banner */}
        {onOpenMockupModal && (
          <button
            onClick={onOpenMockupModal}
            className="w-full p-2.5 bg-gradient-to-r from-surface-1 via-surface-0 to-surface-1 border border-accent-rosegold-500/40 hover:border-accent-rosegold-400 rounded-xl text-ink-primary flex items-center justify-between shadow-[var(--shadow-elevated)] transition-colors active:scale-[0.98] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
            title="Generate Pinterest Pin graphics, Gumroad 3D covers, and marketing text"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-surface-1 border border-accent-rosegold-500/50 text-accent-rosegold-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-accent-rosegold-300 transition-colors">
                    Pinterest & 3D Mockup
                  </span>
                  <span className="text-[9px] bg-accent-rosegold-400 text-slate-950 px-1 py-0.2 rounded font-extrabold uppercase">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-ink-secondary">Generate Pinterest Pin graphics & sales copy</p>
              </div>
            </div>
            <span className="text-accent-rosegold-400 text-xs font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
          </button>
        )}

        {/* Quick Utility Action Bar */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onOpenImporter}
            className="flex flex-col items-center justify-center p-2 bg-surface-1 hover:bg-surface-2 border border-hairline rounded-xl text-[11px] font-semibold text-ink-secondary transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
            title="Import Word doc, Google Doc link, or text file"
          >
            <FileText className="w-3.5 h-3.5 text-accent-rosegold-400 mb-0.5" />
            <span>Load Doc</span>
          </button>
          <button
            onClick={onOpenEditor}
            className="flex flex-col items-center justify-center p-2 bg-surface-1 hover:bg-surface-2 border border-hairline rounded-xl text-[11px] font-semibold text-accent-rosegold-300 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
            title="Edit titles, chapters, and content directly"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent-rosegold-400 mb-0.5" />
            <span>Edit Text</span>
          </button>
          <button
            onClick={onOpenAiEnhancer}
            className="flex flex-col items-center justify-center p-2 bg-accent-rosegold-500 hover:brightness-105 rounded-xl text-[11px] font-bold text-slate-950 shadow-[var(--shadow-glow-rosegold)] transition-[transform,opacity,filter] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
            title="AI Polish with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 mb-0.5" />
            <span>AI Polish</span>
          </button>
        </div>

        {/* Section Accordion Navigation Tabs */}
        <div className="flex border-b border-hairline bg-surface-0 p-1 rounded-xl gap-1 overflow-x-auto text-[11px] font-semibold">
          {[
            { id: 'themes', label: 'Themes', icon: Palette },
            { id: 'cover', label: 'Cover', icon: Layout },
            { id: 'logo', label: 'Logo / Brand', icon: ImageIcon },
            { id: 'typography', label: 'Type', icon: Type },
            { id: 'paper', label: 'Paper & Page', icon: BookOpen },
            { id: 'headers', label: 'Headers', icon: AlignCenter },
            { id: 'elements', label: 'Elements', icon: Layers },
            { id: 'colors', label: 'Colors', icon: Droplet }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 ${
                  active
                    ? 'bg-accent-rosegold-500 text-slate-950 font-bold shadow-[var(--shadow-glow-rosegold)]'
                    : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-1'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SECTION 1: THEMES */}
        {activeSection === 'themes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-accent-rosegold-400" />
                <span>{STUDIO_THEMES.length} Publishing Themes</span>
              </label>
              <span className="text-[10px] text-ink-muted font-mono">
                {filteredThemes.length} matches
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search themes (e.g. Vogue, Cyber, Academic)..."
                value={themeSearchQuery}
                onChange={(e) => setThemeSearchQuery(e.target.value)}
                className="w-full bg-surface-0 border border-hairline focus:border-accent-rosegold-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink-secondary placeholder-slate-500 outline-none transition-colors"
              />
              {themeSearchQuery && (
                <button
                  onClick={() => setThemeSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[10px] text-ink-muted hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-semibold">
              {themeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedThemeCategory(cat)}
                  className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
                    selectedThemeCategory === cat
                      ? 'bg-accent-rosegold-500 text-slate-950 font-bold'
                      : 'bg-surface-0 text-ink-muted hover:text-ink-secondary border border-hairline'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Theme List Grid */}
            <div className="grid grid-cols-1 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredThemes.length === 0 ? (
                <div className="p-4 text-center text-xs text-ink-muted bg-surface-0/50 rounded-xl border border-hairline">
                  No themes found matching "{themeSearchQuery}". Try clearing your search.
                </div>
              ) : (
                filteredThemes.map((theme) => {
                  const isSelected = settings.themeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => onSelectTheme(theme)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-2 border-accent-rosegold-400 shadow-lg shadow-rosegold-500/5 ring-1 ring-rosegold-400/50'
                          : 'bg-surface-0/70 border-hairline hover:border-white/15 hover:bg-surface-2/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>{theme.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent-rosegold-400" />}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-2 text-accent-rosegold-300 border border-white/15 font-mono">
                          {theme.tag}
                        </span>
                      </div>

                      <p className="text-[10px] text-ink-muted mb-2 leading-snug line-clamp-2">
                        {theme.description}
                      </p>

                      {/* Color Swatches */}
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/15"
                          style={{ backgroundColor: theme.colors.paperBg }}
                          title="Paper Color"
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: theme.colors.primary }}
                          title="Primary Color"
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: theme.colors.secondary }}
                          title="Secondary Color"
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                          title="Accent Color"
                        />
                        <span className="text-[9px] text-ink-muted ml-auto font-mono uppercase">
                          {theme.fontFamily}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: COVER PAGE LAYOUTS */}
        {activeSection === 'cover' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <Layout className="w-3.5 h-3.5 text-purple-400" />
                <span>{coverStyles.length} Cover Layout Styles</span>
              </label>
              <span className="text-[10px] text-ink-muted font-mono">
                {filteredCoverStyles.length} matches
              </span>
            </div>

            {/* Cover Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search covers (e.g. Vogue, Penguin, Blueprint)..."
                value={coverSearchQuery}
                onChange={(e) => setCoverSearchQuery(e.target.value)}
                className="w-full bg-surface-0 border border-hairline focus:border-purple-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink-secondary placeholder-slate-500 outline-none transition-colors"
              />
              {coverSearchQuery && (
                <button
                  onClick={() => setCoverSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[10px] text-ink-muted hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cover Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-semibold">
              {coverCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCoverCategory(cat)}
                  className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
                    selectedCoverCategory === cat
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-surface-0 text-ink-muted hover:text-ink-secondary border border-hairline'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Cover Style Grid */}
            <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredCoverStyles.length === 0 ? (
                <div className="p-4 text-center text-xs text-ink-muted bg-surface-0/50 rounded-xl border border-hairline">
                  No cover layout styles found matching "{coverSearchQuery}".
                </div>
              ) : (
                filteredCoverStyles.map((style) => {
                  const active = settings.coverStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => onUpdateSettings({ coverStyle: style.id })}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        active
                          ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/40'
                          : 'bg-surface-0 border-hairline text-ink-muted hover:text-ink-secondary hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white">{style.label}</span>
                        {active && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <p className="text-[10px] text-ink-muted leading-tight">{style.desc}</p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Confidential Badge Toggle */}
            <div className="pt-2 border-t border-hairline space-y-2">
              <label className="flex items-center justify-between p-2.5 bg-surface-0 rounded-xl border border-hairline cursor-pointer text-xs">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-ink-secondary font-semibold">Show "CONFIDENTIAL" Cover Badge</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.confidentialBadge}
                  onChange={(e) => onUpdateSettings({ confidentialBadge: e.target.checked })}
                  className="w-4 h-4 rounded bg-surface-1 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                />
              </label>
            </div>
          </div>
        )}

        {/* SECTION 3: LOGO & HEADER BRANDING */}
        {activeSection === 'logo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-accent-rosegold-400" />
                <span>Logo & Brand Crest Creator</span>
              </label>
              <span className="text-[10px] text-accent-rosegold-400 font-mono">25 Formats • 25 Crests</span>
            </div>

            {/* Logo Enable Toggle */}
            <label className="flex items-center justify-between p-2.5 bg-surface-0 rounded-xl border border-hairline cursor-pointer text-xs">
              <span className="text-ink-secondary font-semibold">Enable Top Logo / Brand Badge</span>
              <input
                type="checkbox"
                checked={logoSettings.showLogo}
                onChange={(e) => handleUpdateLogo({ showLogo: e.target.checked })}
                className="w-4 h-4 rounded bg-surface-1 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
              />
            </label>

            {logoSettings.showLogo && (
              <div className="space-y-4 bg-surface-0/80 p-3.5 rounded-xl border border-hairline text-xs">
                
                {/* 1. UNIFIED IMAGE LOGO & PHOTO FILE STUDIO */}
                <div className="space-y-3 p-3 bg-surface-1/80 rounded-xl border border-hairline">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-accent-rosegold-300 flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5 text-accent-rosegold-400" />
                      <span>Image Logo & Brand Photo File Studio</span>
                    </label>
                    <span className="text-[9px] text-ink-muted font-mono">Upload / URL / Crests</span>
                  </div>

                  {/* Direct Image File Drag & Drop Upload Zone */}
                  <div className="border-2 border-dashed border-white/15 hover:border-accent-rosegold-400 rounded-xl p-3 bg-surface-0/80 text-center transition-colors relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              handleUpdateLogo({
                                logoType: 'image',
                                logoImageUrl: result
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    {logoSettings.logoType === 'image' && logoSettings.logoImageUrl ? (
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <img
                            src={logoSettings.logoImageUrl}
                            alt="Logo Preview"
                            className="w-10 h-10 object-contain rounded bg-white/10 p-1 border border-accent-rosegold-400/50 shadow-md"
                          />
                          <div className="text-left">
                            <p className="text-[11px] font-bold text-accent-rosegold-300 truncate">Logo Photo File Active</p>
                            <p className="text-[9px] text-ink-muted">Rendering on Covers & Running Headers</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateLogo({ logoImageUrl: '', logoType: 'text' });
                          }}
                          className="relative z-20 p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                          title="Remove Logo Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1 py-1.5">
                        <Upload className="w-5 h-5 text-accent-rosegold-400 group-hover:scale-110 transition-transform" />
                        <p className="text-[11px] font-bold text-ink-secondary">Click or Drag Logo Image File Here</p>
                        <p className="text-[9px] text-ink-muted">PNG, JPG, SVG, WEBP high-res supported</p>
                      </div>
                    )}
                  </div>

                  {/* Or Paste Direct Image URL */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted mb-1">Or Paste Direct Web Image URL</label>
                    <input
                      type="text"
                      value={logoSettings.logoImageUrl || ''}
                      onChange={(e) =>
                        handleUpdateLogo({
                          logoImageUrl: e.target.value,
                          logoType: e.target.value ? 'image' : logoSettings.logoType
                        })
                      }
                      placeholder="https://example.com/brand-logo.png"
                      className="w-full bg-surface-0 border border-hairline rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-accent-rosegold-400 font-mono"
                    />
                  </div>

                  {/* Preset Brand Crest Picker (Over 20 Options) */}
                  <div className="space-y-1.5 border-t border-hairline pt-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-ink-secondary flex items-center space-x-1">
                        <Crown className="w-3 h-3 text-accent-rosegold-400" />
                        <span>Pick Preset Brand Crest (25 Options)</span>
                      </label>
                      <span className="text-[9px] text-slate-500 font-mono">1-Click Apply</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {[
                        {
                          name: 'Royal Crown',
                          icon: Crown,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23F59E0B" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-5-4 5-6-7z"/><path d="M5 20h14"/></svg>`
                        },
                        {
                          name: 'Shield Guard',
                          icon: Shield,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%236366F1" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`
                        },
                        {
                          name: 'Feather Pen',
                          icon: Feather,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2310B981" stroke-width="2"><path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></svg>`
                        },
                        {
                          name: 'Luxury Star',
                          icon: Star,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23EC4899" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
                        },
                        {
                          name: 'Award Badge',
                          icon: Award,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%233B82F6" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`
                        },
                        {
                          name: 'Golden Flame',
                          icon: Flame,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23F59E0B" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
                        },
                        {
                          name: 'Globe Compass',
                          icon: Globe,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2306B6D4" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`
                        },
                        {
                          name: 'Diamond Jewel',
                          icon: Sparkles,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23A855F7" stroke-width="2"><path d="m12 3 8 6-8 12L4 9z"/><path d="M4 9h16"/></svg>`
                        },
                        {
                          name: 'Maritime Anchor',
                          icon: Anchor,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230284C7" stroke-width="2"><circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="8" y2="21"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`
                        },
                        {
                          name: 'Monogram Ring',
                          icon: CircleDot,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23EAB308" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`
                        },
                        {
                          name: 'Library Book',
                          icon: BookOpen,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2384CC16" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
                        },
                        {
                          name: 'Phoenix Wings',
                          icon: Zap,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23EF4444" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
                        },
                        {
                          name: 'Compass Rose',
                          icon: Compass,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2314B8A6" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
                        },
                        {
                          name: 'Heritage Key',
                          icon: Key,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23D97706" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3"/></svg>`
                        },
                        {
                          name: 'Apex Pyramid',
                          icon: Triangle,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23F43F5E" stroke-width="2"><path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>`
                        },
                        {
                          name: 'Infinity Loop',
                          icon: InfinityIcon,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%238B5CF6" stroke-width="2"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>`
                        },
                        {
                          name: 'Botanical Leaf',
                          icon: Leaf,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2322C55E" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`
                        },
                        {
                          name: 'Solstice Sun',
                          icon: Sun,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23F59E0B" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
                        },
                        {
                          name: 'Tech Gear',
                          icon: SettingsIcon,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2364748B" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
                        },
                        {
                          name: 'Cyber Hex',
                          icon: Hexagon,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2338BDF8" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`
                        },
                        {
                          name: 'Shield Check',
                          icon: ShieldCheck,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2310B981" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`
                        },
                        {
                          name: 'Verified Crest',
                          icon: BadgeCheck,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%233B82F6" stroke-width="2"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>`
                        },
                        {
                          name: 'Ribbon Tag',
                          icon: Tag,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23EC4899" stroke-width="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`
                        },
                        {
                          name: 'Vintage Stamp',
                          icon: Stamp,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23D97706" stroke-width="2"><path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11a2.5 2.5 0 0 0-1.77.73A2.5 2.5 0 0 0 4 15.5V18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5a2.5 2.5 0 0 0-.73-1.77Z"/><path d="M12 13V2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v11"/></svg>`
                        },
                        {
                          name: '3D Box Crest',
                          icon: Box,
                          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%238B5CF6" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`
                        }
                      ].map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = logoSettings.logoType === 'image' && logoSettings.logoImageUrl === preset.url;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              handleUpdateLogo({
                                logoType: 'image',
                                logoImageUrl: preset.url
                              });
                            }}
                            className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center space-y-1 transition-colors ${
                              isSelected
                                ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 ring-1 ring-rosegold-400/50'
                                : 'bg-surface-0 border-hairline text-ink-muted hover:border-white/15 hover:text-ink-secondary'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 text-accent-rosegold-400" />
                            <span className="text-[8px] font-bold truncate w-full">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. 25 PROFITABLE LOGO FORMAT MODES */}
                <div className="space-y-2 border-t border-hairline pt-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-ink-secondary flex items-center space-x-1.5">
                      <Layout className="w-3.5 h-3.5 text-accent-rosegold-400" />
                      <span>25 Profitable Logo Format Modes</span>
                    </label>
                    <span className="text-[9px] text-accent-rosegold-400 font-mono">Select Badge Layout</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {[
                      { id: 'text', label: '1. Text Badge', desc: 'Standard bold uppercase mono text' },
                      { id: 'image', label: '2. Image Photo Logo', desc: 'Uploaded or preset graphic image' },
                      { id: 'badge', label: '3. Crest Pill', desc: 'Solid filled pill container' },
                      { id: 'gold-monogram', label: '4. Gold Monogram', desc: 'Gold bordered circular monogram badge' },
                      { id: 'circle-seal', label: '5. Minimal Circle Seal', desc: 'Refined thin circular seal stamp' },
                      { id: 'archway-shield', label: '6. Archway Shield', desc: 'Classic heraldic archway shield crest' },
                      { id: 'vintage-stamp', label: '7. Vintage Stamp', desc: 'Textured retro rubber stamp border' },
                      { id: 'diamond-emblem', label: '8. Diamond Geometry', desc: 'Rotated diamond geometry frame' },
                      { id: 'ribbon-sash', label: '9. Ribbon Sash Banner', desc: 'Top/bottom ribbon accent lines banner' },
                      { id: 'cyber-hex', label: '10. Cyber Hexagon', desc: 'Futuristic hexagon badge with glow' },
                      { id: 'university-seal', label: '11. University Seal', desc: 'Double ring academic seal badge' },
                      { id: 'luxury-crest', label: '12. Luxury Monogram', desc: 'Garamond style luxury gold serif badge' },
                      { id: 'metallic-foil', label: '13. Metallic Foil', desc: 'Shimmering gold/silver stamped block' },
                      { id: 'minimalist-box', label: '14. Minimalist Box', desc: 'Clean square hairline wireframe box' },
                      { id: 'neon-glow', label: '15. Neon Glow Pill', desc: 'Vibrant neon outline pill with glow' },
                      { id: 'modern-monoline', label: '16. Modern Monoline', desc: 'Clean single-weight monoline border' },
                      { id: 'gothic-monogram', label: '17. Gothic Monogram', desc: 'Classic Old English heritage crest' },
                      { id: 'executive-bar', label: '18. Executive Dark Bar', desc: 'Solid black executive header bar' },
                      { id: 'botanical-leaf', label: '19. Botanical Leaf Seal', desc: 'Organic botanical leaf wreath' },
                      { id: 'double-ring', label: '20. Double Ring Seal', desc: 'Concentric double-ring crest border' },
                      { id: 'floating-shadow', label: '21. Floating Card Shadow', desc: 'Elevated floating card with deep shadow' },
                      { id: 'broadsheet-masthead', label: '22. Broadsheet Masthead', desc: 'Traditional newspaper lead masthead' },
                      { id: 'minimal-dot', label: '23. Minimal Dot Tag', desc: 'Tiny colored dot tag with clean text' },
                      { id: 'retro-badge', label: '24. Retro Wavy Starburst', desc: 'Vintage starburst seal border emblem' },
                      { id: 'crown-royal', label: '25. Crown Royal Seal', desc: 'Regal crown emblem badge with gold border' }
                    ].map((mode) => {
                      const isActive = logoSettings.logoType === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleUpdateLogo({ logoType: mode.id as any })}
                          className={`p-2 rounded-xl text-left border transition-colors ${
                            isActive
                              ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-rosegold-200 ring-1 ring-rosegold-400/50 shadow-md'
                              : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-secondary hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-bold text-white">{mode.label}</span>
                            {isActive && <Check className="w-3 h-3 text-accent-rosegold-400" />}
                          </div>
                          <p className="text-[9px] text-ink-muted leading-tight truncate">{mode.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. LOGO TEXT INPUTS */}
                {logoSettings.logoType !== 'image' && (
                  <div className="space-y-2 border-t border-hairline pt-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">Brand Name / Logo Text</label>
                      <input
                        type="text"
                        value={logoSettings.logoText}
                        onChange={(e) => handleUpdateLogo({ logoText: e.target.value })}
                        placeholder="e.g. SOLOPRENEUR LABS"
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">Subtext / Tagline</label>
                      <input
                        type="text"
                        value={logoSettings.logoSubtext || ''}
                        onChange={(e) => handleUpdateLogo({ logoSubtext: e.target.value })}
                        placeholder="e.g. DIGITAL PRESS EDITION"
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-[11px] text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                    </div>
                  </div>
                )}

                {/* 4. POSITION & ALIGNMENT */}
                <div className="grid grid-cols-2 gap-2 border-t border-hairline pt-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted mb-1">Logo Position</label>
                    <select
                      value={logoSettings.logoPlacement}
                      onChange={(e) => handleUpdateLogo({ logoPlacement: e.target.value as any })}
                      className="w-full bg-surface-1 border border-white/15 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400 font-medium"
                    >
                      <option value="cover-only">Cover Header Only</option>
                      <option value="header-all">Running Header on All Pages</option>
                      <option value="header-cover-top">Cover Top Center Banner</option>
                      <option value="none">Hidden</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted mb-1">Alignment</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => handleUpdateLogo({ logoAlignment: align })}
                          className={`py-1 rounded-lg text-[10px] capitalize border transition-colors ${
                            logoSettings.logoAlignment === align
                              ? 'bg-accent-rosegold-500/30 border-accent-rosegold-400 text-accent-rosegold-300 font-bold'
                              : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-secondary'
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. SIZE SLIDER */}
                <div className="border-t border-hairline pt-3">
                  <div className="flex justify-between text-[11px] text-ink-muted mb-1">
                    <span>Logo Scale / Height</span>
                    <span className="font-mono text-accent-rosegold-300 font-bold">{logoSettings.logoHeight || 28}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="80"
                    value={logoSettings.logoHeight || 28}
                    onChange={(e) => handleUpdateLogo({ logoHeight: parseInt(e.target.value) })}
                    className="w-full accent-rosegold-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: TYPOGRAPHY & FONT PAIRINGS */}
        {activeSection === 'typography' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                <span>108 Font Pairings & Type Controls</span>
              </label>
              <span className="text-[10px] text-accent-rosegold-400 font-mono font-bold">
                {filteredFontPairings.length} Pairs
              </span>
            </div>

            {/* Custom Override Active Banner */}
            {(settings.customHeaderFont || settings.customBodyFont) && (
              <div className="p-2.5 bg-indigo-950/80 border border-indigo-500/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-indigo-200 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Custom Font Override Active</span>
                  </span>
                  <span className="text-[9px] text-indigo-300/80 font-mono">
                    Header: {settings.customHeaderFont ? 'Custom' : 'Preset'} • Body: {settings.customBodyFont ? 'Custom' : 'Preset'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ customHeaderFont: undefined, customBodyFont: undefined })}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-colors"
                >
                  Reset Overrides
                </button>
              </div>
            )}

            {/* Font Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search 108+ font pairings (e.g. Playfair, Inter, Cyber)..."
                value={fontSearchQuery}
                onChange={(e) => setFontSearchQuery(e.target.value)}
                className="w-full bg-surface-0 border border-hairline focus:border-indigo-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink-secondary placeholder-slate-500 outline-none transition-colors"
              />
              {fontSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFontSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[10px] text-ink-muted hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Font Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-semibold">
              {fontCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFontCategory(cat)}
                  className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
                    selectedFontCategory === cat
                      ? 'bg-indigo-500 text-white font-bold'
                      : 'bg-surface-0 text-ink-muted hover:text-ink-secondary border border-hairline'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 108 Font Pairings List */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-ink-muted">
                <span>Select Curated Pairing</span>
                <span className="font-mono text-[9px]">{filteredFontPairings.length} results</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                {filteredFontPairings.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs italic bg-surface-0 rounded-xl border border-hairline">
                    No font pairings matching "{fontSearchQuery}"
                  </div>
                ) : (
                  filteredFontPairings.map((pair) => {
                    const active = settings.fontPairingId === pair.id && !settings.customHeaderFont && !settings.customBodyFont;
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        onClick={() => onUpdateSettings({ fontPairingId: pair.id, customHeaderFont: undefined, customBodyFont: undefined })}
                        className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                          active
                            ? 'bg-indigo-950/90 border-indigo-500 text-indigo-200 font-bold shadow-md ring-1 ring-indigo-400/50'
                            : 'bg-surface-0 border-hairline text-ink-muted hover:text-ink-secondary hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <span>{pair.name}</span>
                            {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                          </span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-surface-1 text-indigo-300 border border-hairline font-mono">
                            {pair.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-muted leading-snug line-clamp-1">
                          {pair.description}
                        </p>
                        <p className="text-[9px] text-indigo-300/80 font-mono mt-1">
                          Header: {pair.headerFont} • Body: {pair.bodyFont}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* INDIVIDUAL FONT SELECTION (SELECT ONE AT A TIME) */}
            <div className="space-y-3 border-t border-hairline pt-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-ink-secondary flex items-center space-x-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-accent-rosegold-400" />
                  <span>Select Individual Fonts</span>
                </label>
                <span className="text-[9px] text-accent-rosegold-400 font-mono">Custom Override</span>
              </div>
              <p className="text-[10px] text-ink-muted leading-tight">
                Don't like a preset pairing? Customize your Header font or Body font one at a time.
              </p>

              {/* Header Font Picker */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-ink-secondary">
                  Custom Header Font (Headings, Chapter Titles & Covers)
                </label>
                <select
                  value={settings.customHeaderFont || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateSettings({ customHeaderFont: val ? val : undefined });
                  }}
                  className="w-full bg-surface-0 border border-white/15 focus:border-accent-rosegold-400 rounded-lg p-2 text-xs text-white outline-none font-medium"
                >
                  <option value="">-- Use Preset Pairing Header Font --</option>
                  {INDIVIDUAL_HEADER_FONTS.map((f) => (
                    <option key={f.id} value={f.css}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Body Font Picker */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-ink-secondary">
                  Custom Body Font (Paragraphs, Callouts & Tables)
                </label>
                <select
                  value={settings.customBodyFont || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateSettings({ customBodyFont: val ? val : undefined });
                  }}
                  className="w-full bg-surface-0 border border-white/15 focus:border-accent-rosegold-400 rounded-lg p-2 text-xs text-white outline-none font-medium"
                >
                  <option value="">-- Use Preset Pairing Body Font --</option>
                  {INDIVIDUAL_BODY_FONTS.map((f) => (
                    <option key={f.id} value={f.css}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Font Size Scale */}
            <div className="space-y-1.5 border-t border-hairline pt-3">
              <label className="block text-[11px] font-semibold text-ink-muted">Body Font Size Scale</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'compact', label: '13px' },
                  { id: 'regular', label: '15px' },
                  { id: 'large', label: '17px' },
                  { id: 'extra-large', label: '19px' }
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => onUpdateSettings({ fontSizeScale: sz.id as any })}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      (settings.fontSizeScale || 'regular') === sz.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-surface-0 border-hairline text-ink-muted hover:text-ink-secondary'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink-muted">Line Height Spacing</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'compact', label: '1.4' },
                  { id: 'comfortable', label: '1.6' },
                  { id: 'spacious', label: '1.8' },
                  { id: 'double', label: '2.0' }
                ].map((ls) => (
                  <button
                    key={ls.id}
                    type="button"
                    onClick={() => onUpdateSettings({ lineSpacing: ls.id as any })}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      (settings.lineSpacing || 'comfortable') === ls.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-surface-0 border-hairline text-ink-muted hover:text-ink-secondary'
                    }`}
                  >
                    {ls.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drop Cap Initial Letter */}
            <label className="flex items-center justify-between p-2.5 bg-surface-0 rounded-xl border border-hairline cursor-pointer text-xs">
              <span className="text-ink-secondary font-semibold">Drop Cap Large Initial Letter</span>
              <input
                type="checkbox"
                checked={!!settings.dropCap}
                onChange={(e) => onUpdateSettings({ dropCap: e.target.checked })}
                className="w-4 h-4 rounded bg-surface-1 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
              />
            </label>

            {/* TEXT, LETTERS & WORDS COLOR CUSTOMIZER */}
            <div className="bg-surface-0/90 p-3.5 rounded-xl border border-hairline space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="font-bold text-accent-rosegold-400 text-xs flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Text, Letters & Words Color Studio</span>
                </span>
                {(settings.customTextColorPrimary || settings.customTextColorSecondary || settings.customHeadingColor) && (
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({
                      customTextColorPrimary: undefined,
                      customTextColorSecondary: undefined,
                      customHeadingColor: undefined
                    })}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Reset Colors
                  </button>
                )}
              </div>

              {/* Primary Body Text / Letters Color */}
              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                  Primary Text Color (Body Paragraphs & Letters)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.customTextColorPrimary || currentTheme.colors.textPrimary || '#1A1A1A'}
                    onChange={(e) => onUpdateSettings({ customTextColorPrimary: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/15 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.customTextColorPrimary || currentTheme.colors.textPrimary || ''}
                    onChange={(e) => onUpdateSettings({ customTextColorPrimary: e.target.value })}
                    placeholder="Theme Default"
                    className="flex-1 bg-surface-1 border border-white/15 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400 font-mono"
                  />
                </div>
              </div>

              {/* Headings / Chapter Titles Color */}
              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                  Heading & Chapter Title Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.customHeadingColor || currentTheme.colors.primary || '#1A1A1A'}
                    onChange={(e) => onUpdateSettings({ customHeadingColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/15 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.customHeadingColor || currentTheme.colors.primary || ''}
                    onChange={(e) => onUpdateSettings({ customHeadingColor: e.target.value })}
                    placeholder="Theme Default"
                    className="flex-1 bg-surface-1 border border-white/15 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400 font-mono"
                  />
                </div>
              </div>

              {/* Secondary Subtitle / Metadata Color */}
              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                  Secondary Subtext & Meta Words Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.customTextColorSecondary || currentTheme.colors.textSecondary || '#5A5A5A'}
                    onChange={(e) => onUpdateSettings({ customTextColorSecondary: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/15 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.customTextColorSecondary || currentTheme.colors.textSecondary || ''}
                    onChange={(e) => onUpdateSettings({ customTextColorSecondary: e.target.value })}
                    placeholder="Theme Default"
                    className="flex-1 bg-surface-1 border border-white/15 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400 font-mono"
                  />
                </div>
              </div>

              {/* Quick Preset Color Swatches */}
              <div>
                <label className="block text-[10px] font-semibold text-ink-muted mb-1">Quick Word Color Palettes</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Obsidian Ink', hex: '#0F172A' },
                    { name: 'Charcoal', hex: '#262626' },
                    { name: 'Crisp White', hex: '#FFFFFF' },
                    { name: 'Navy Blue', hex: '#1E3A8A' },
                    { name: 'Deep Crimson', hex: '#881337' },
                    { name: 'Warm Sepia', hex: '#451A03' },
                    { name: 'Royal Gold', hex: '#B45309' },
                    { name: 'Dark Emerald', hex: '#064E3B' },
                    { name: 'Imperial Violet', hex: '#581C87' }
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => onUpdateSettings({
                        customTextColorPrimary: preset.hex,
                        customHeadingColor: preset.hex
                      })}
                      className="px-2 py-1 bg-surface-1 border border-hairline hover:border-slate-600 rounded-lg text-[10px] text-ink-secondary flex items-center space-x-1"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-white/15" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: PAPER & DIMENSIONS */}
        {activeSection === 'paper' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Paper Size, Margins & Texture Studio</span>
              </label>
            </div>

            {/* Paper Sizes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-ink-muted">Paper Format & Dimensions ({pageSizes.length} Sizes)</label>
                <span className="text-[10px] text-emerald-400 font-mono">Inches & Millimeters</span>
              </div>
              <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 rounded-xl border border-hairline bg-surface-0 p-2">
                {pageSizes.map((size) => {
                  const active = settings.pageSize === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => onUpdateSettings({ pageSize: size.id })}
                      className={`p-2 rounded-lg border text-left transition-colors ${
                        active
                          ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-bold shadow-xs'
                          : 'bg-surface-1/60 border-hairline text-ink-muted hover:text-ink-secondary hover:bg-surface-1'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-white truncate">{size.label}</div>
                      <div className="text-[9px] text-ink-muted">{size.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Page Margins */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink-muted">Page Margins & Padding ({pageMargins.length} Styles)</label>
              <div className="max-h-40 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 rounded-xl border border-hairline bg-surface-0 p-2">
                {pageMargins.map((m) => {
                  const active = (settings.pageMargin || 'standard') === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onUpdateSettings({ pageMargin: m.id })}
                      className={`p-2 rounded-lg border text-left transition-colors ${
                        active
                          ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-bold'
                          : 'bg-surface-1/60 border-hairline text-ink-muted hover:text-ink-secondary hover:bg-surface-1'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-white">{m.label}</div>
                      <div className="text-[9px] text-ink-muted">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paper Background Tone */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink-muted">Paper Tone & Texture Color ({paperTones.length} Tones)</label>
              <div className="max-h-52 overflow-y-auto pr-1 grid grid-cols-3 gap-1.5 rounded-xl border border-hairline bg-surface-0 p-2">
                {paperTones.map((tone) => {
                  const active = (settings.paperBgStyle || 'default') === tone.id;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => onUpdateSettings({ paperBgStyle: tone.id })}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 text-[10px] transition-colors ${
                        active
                          ? 'border-accent-rosegold-400 bg-surface-2 text-accent-rosegold-300 font-bold shadow-xs'
                          : 'border-hairline bg-surface-1/60 text-ink-muted hover:text-ink-secondary hover:bg-surface-1'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/15 shadow-sm shrink-0"
                        style={{ backgroundColor: tone.bgHex }}
                      />
                      <span className="truncate w-full text-center text-[10px]">{tone.label}</span>
                      <span className="text-[8px] text-slate-500 truncate w-full text-center">{tone.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: HEADERS, FOOTERS & PAGE NUMBERS */}
        {activeSection === 'headers' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <AlignCenter className="w-3.5 h-3.5 text-accent-rosegold-400" />
                <span>Header, Footer & Page Number Studio</span>
              </label>
            </div>

            {/* Master Toggle */}
            <label className="flex items-center justify-between p-3 bg-surface-0 rounded-xl border border-hairline cursor-pointer text-xs shadow-sm">
              <div className="flex flex-col">
                <span className="text-slate-100 font-bold">Enable Running Headers & Footers</span>
                <span className="text-[10px] text-ink-muted">Display persistent headers and page numbers on publication pages</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showHeadersFooters}
                onChange={(e) => onUpdateSettings({ showHeadersFooters: e.target.checked })}
                className="w-4 h-4 rounded bg-surface-1 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
              />
            </label>

            {settings.showHeadersFooters && (
              <div className="space-y-4">
                {/* --- CARD 1: HEADER LAYOUT & TYPOGRAPHY --- */}
                <div className="bg-surface-0/90 p-3.5 rounded-xl border border-hairline space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <span className="font-bold text-accent-rosegold-400 text-xs flex items-center space-x-1.5">
                      <span>1. Running Header Style & Layout</span>
                    </span>
                  </div>

                  {/* Header Presets */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1.5">Header Style Preset</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'classic-minimal', name: 'Classic Split', desc: 'Title left, tag right' },
                        { id: 'centered-serif', name: 'Centered Serif', desc: '✦ Title ✦ Centered' },
                        { id: 'pill-badge', name: 'Pill Badge', desc: 'Rounded pill highlight' },
                        { id: 'three-part', name: 'Three-Part Grid', desc: 'Category | Title | Tag' },
                        { id: 'editorial-masthead', name: 'Editorial Masthead', desc: 'Bold line masthead' },
                        { id: 'accent-top-bar', name: 'Top Accent Bar', desc: 'Colored top bar' },
                        { id: 'logo-inline', name: 'Inline Brand Logo', desc: 'Logo icon in header' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => onUpdateSettings({ headerStyle: preset.id as any })}
                          className={`p-2 rounded-lg text-left border transition-colors ${
                            (settings.headerStyle || 'classic-minimal') === preset.id
                              ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-rosegold-200 font-bold shadow-xs'
                              : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-secondary'
                          }`}
                        >
                          <div className="text-[11px] font-bold text-white">{preset.name}</div>
                          <div className="text-[9px] text-ink-muted">{preset.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Header Text inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-muted mb-1">Header Title Text</label>
                      <input
                        type="text"
                        value={settings.runningHeaderText || ''}
                        onChange={(e) => onUpdateSettings({ runningHeaderText: e.target.value })}
                        placeholder="Default: Document Title"
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-muted mb-1">Header Subtext / Tag</label>
                      <input
                        type="text"
                        value={settings.runningHeaderSubtext || ''}
                        onChange={(e) => onUpdateSettings({ runningHeaderSubtext: e.target.value })}
                        placeholder="e.g. CONFIDENTIAL / v2.0"
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                    </div>
                  </div>

                  {/* Formatting Controls: Text Transform & Alignment & Size */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-muted mb-1">Text Case</label>
                      <select
                        value={settings.headerTextTransform || 'uppercase'}
                        onChange={(e) => onUpdateSettings({ headerTextTransform: e.target.value as any })}
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-accent-rosegold-400"
                      >
                        <option value="uppercase">UPPERCASE</option>
                        <option value="capitalize">Capitalize</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-ink-muted mb-1">Font Size</label>
                      <select
                        value={settings.headerFontSize || 'xs'}
                        onChange={(e) => onUpdateSettings({ headerFontSize: e.target.value as any })}
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-accent-rosegold-400"
                      >
                        <option value="xs">Small (10px)</option>
                        <option value="sm">Medium (12px)</option>
                        <option value="base">Standard (14px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-ink-muted mb-1">Text Color</label>
                      <select
                        value={settings.headerColorOption || 'muted'}
                        onChange={(e) => onUpdateSettings({ headerColorOption: e.target.value as any })}
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-accent-rosegold-400"
                      >
                        <option value="muted">Muted Secondary</option>
                        <option value="primary">Theme Primary</option>
                        <option value="accent">Theme Accent</option>
                      </select>
                    </div>
                  </div>

                  {/* Header Alignment */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted mb-1">Header Alignment</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'between', label: 'Space Between' },
                        { id: 'left', label: 'Left' },
                        { id: 'center', label: 'Center' },
                        { id: 'right', label: 'Right' }
                      ].map((align) => (
                        <button
                          key={align.id}
                          type="button"
                          onClick={() => onUpdateSettings({ headerAlignment: align.id as any })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            (settings.headerAlignment || 'between') === align.id
                              ? 'bg-accent-rosegold-500 text-slate-950 border-accent-rosegold-400'
                              : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-secondary'
                          }`}
                        >
                          {align.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider Line Style */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted mb-1">Header Divider Line Style</label>
                    <select
                      value={settings.headerDividerStyle || 'solid'}
                      onChange={(e) => onUpdateSettings({ headerDividerStyle: e.target.value as any })}
                      className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                    >
                      <option value="solid">Solid Hairline Line</option>
                      <option value="double">Double Rule Line</option>
                      <option value="dotted">Dotted Rule Line</option>
                      <option value="accent-bar">Thick Accent Color Bar</option>
                      <option value="none">No Divider Line</option>
                    </select>
                  </div>

                  {/* Show Logo Checkbox */}
                  <label className="flex items-center justify-between p-2 bg-surface-1 rounded-lg border border-hairline cursor-pointer text-xs">
                    <span className="text-ink-secondary text-[11px] font-medium">Show Miniature Logo in Header</span>
                    <input
                      type="checkbox"
                      checked={!!settings.showHeaderLogo}
                      onChange={(e) => onUpdateSettings({ showHeaderLogo: e.target.checked })}
                      className="w-4 h-4 rounded bg-surface-0 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                    />
                  </label>
                </div>

                {/* --- CARD 2: FOOTER LAYOUT & COPYRIGHT --- */}
                <div className="bg-surface-0/90 p-3.5 rounded-xl border border-hairline space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <span className="font-bold text-accent-rosegold-400 text-xs flex items-center space-x-1.5">
                      <span>2. Running Footer Style & Options</span>
                    </span>
                  </div>

                  {/* Footer Style Presets */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1.5">Footer Style Preset</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'classic-split', name: 'Classic Split', desc: 'Copyright left, Page right' },
                        { id: 'centered-flanked', name: 'Centered Flanked', desc: '— 04 — Centered' },
                        { id: 'pill-badge', name: 'Pill Badge', desc: 'Solid page pill badge' },
                        { id: 'three-part', name: 'Three-Part Grid', desc: 'Author | Date | Page' },
                        { id: 'bracket-modern', name: 'Bracket Modern', desc: '[ 04 ] Bracket style' },
                        { id: 'accent-bottom-bar', name: 'Bottom Accent Bar', desc: 'Colored bottom line' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => onUpdateSettings({ footerStyle: preset.id as any })}
                          className={`p-2 rounded-lg text-left border transition-colors ${
                            (settings.footerStyle || 'classic-split') === preset.id
                              ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-rosegold-200 font-bold shadow-xs'
                              : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-secondary'
                          }`}
                        >
                          <div className="text-[11px] font-bold text-white">{preset.name}</div>
                          <div className="text-[9px] text-ink-muted">{preset.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer Text Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-muted mb-1">Copyright / Author Text</label>
                      <input
                        type="text"
                        value={settings.runningFooterText || ''}
                        onChange={(e) => onUpdateSettings({ runningFooterText: e.target.value })}
                        placeholder="Default: Author Name"
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-muted mb-1">Footer Subtext / Tag</label>
                      <input
                        type="text"
                        value={settings.runningFooterSubtext || ''}
                        onChange={(e) => onUpdateSettings({ runningFooterSubtext: e.target.value })}
                        placeholder="e.g. ALL RIGHTS RESERVED"
                        className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                    </div>
                  </div>

                  {/* Show Date & Custom Date String */}
                  <div className="grid grid-cols-2 gap-2 bg-surface-1/60 p-2 rounded-lg border border-hairline">
                    <label className="flex items-center space-x-2 cursor-pointer text-[11px] font-medium text-ink-secondary">
                      <input
                        type="checkbox"
                        checked={!!settings.footerShowDate}
                        onChange={(e) => onUpdateSettings({ footerShowDate: e.target.checked })}
                        className="w-3.5 h-3.5 rounded bg-surface-0 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                      />
                      <span>Show Date</span>
                    </label>

                    {settings.footerShowDate && (
                      <input
                        type="text"
                        value={settings.footerCustomDate || ''}
                        onChange={(e) => onUpdateSettings({ footerCustomDate: e.target.value })}
                        placeholder="e.g. August 2026"
                        className="w-full bg-surface-0 border border-white/15 rounded p-1 text-[11px] text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                    )}
                  </div>

                  {/* Show Doc ID & Custom ID String */}
                  <div className="grid grid-cols-2 gap-2 bg-surface-1/60 p-2 rounded-lg border border-hairline">
                    <label className="flex items-center space-x-2 cursor-pointer text-[11px] font-medium text-ink-secondary">
                      <input
                        type="checkbox"
                        checked={!!settings.footerShowDocId}
                        onChange={(e) => onUpdateSettings({ footerShowDocId: e.target.checked })}
                        className="w-3.5 h-3.5 rounded bg-surface-0 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                      />
                      <span>Show Document ID</span>
                    </label>

                    {settings.footerShowDocId && (
                      <input
                        type="text"
                        value={settings.footerDocIdText || ''}
                        onChange={(e) => onUpdateSettings({ footerDocIdText: e.target.value })}
                        placeholder="e.g. REF: #2026-X09"
                        className="w-full bg-surface-0 border border-white/15 rounded p-1 text-[11px] text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                    )}
                  </div>

                  {/* Footer Divider Line Style */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted mb-1">Footer Divider Line Style</label>
                    <select
                      value={settings.footerDividerStyle || 'solid'}
                      onChange={(e) => onUpdateSettings({ footerDividerStyle: e.target.value as any })}
                      className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                    >
                      <option value="solid">Solid Hairline Line</option>
                      <option value="double">Double Rule Line</option>
                      <option value="dotted">Dotted Rule Line</option>
                      <option value="accent-bar">Thick Accent Color Bar</option>
                      <option value="none">No Divider Line</option>
                    </select>
                  </div>
                </div>

                {/* --- CARD 3: PAGE NUMBERING & FORMATTING --- */}
                <div className="bg-surface-0/90 p-3.5 rounded-xl border border-hairline space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <span className="font-bold text-accent-rosegold-400 text-xs flex items-center space-x-1.5">
                      <span>3. Page Number Formatting & Position</span>
                    </span>
                  </div>

                  {/* Page Numbering Style */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1.5">Page Number Format</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'number', label: 'Page 01, 02' },
                        { id: 'page-of', label: 'Page 1 of N' },
                        { id: 'minimal', label: 'Minimal (01)' },
                        { id: 'roman', label: 'Roman (I, II)' },
                        { id: 'bracket', label: 'Bracket [ 01 ]' },
                        { id: 'circle-badge', label: 'Circle Badge' },
                        { id: 'custom-prefix', label: 'Custom Prefix/Suffix' }
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => onUpdateSettings({ pageNumberStyle: style.id as any })}
                          className={`p-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                            settings.pageNumberStyle === style.id
                              ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 font-bold'
                              : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-secondary'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Prefix / Suffix when custom-prefix is chosen */}
                  {settings.pageNumberStyle === 'custom-prefix' && (
                    <div className="grid grid-cols-2 gap-2 bg-surface-1 p-2 rounded-lg border border-hairline">
                      <div>
                        <label className="block text-[10px] text-ink-muted mb-0.5">Prefix</label>
                        <input
                          type="text"
                          value={settings.pageNumberPrefix || ''}
                          onChange={(e) => onUpdateSettings({ pageNumberPrefix: e.target.value })}
                          placeholder="e.g. Pg. "
                          className="w-full bg-surface-0 border border-white/15 rounded p-1 text-[11px] text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-ink-muted mb-0.5">Suffix</label>
                        <input
                          type="text"
                          value={settings.pageNumberSuffix || ''}
                          onChange={(e) => onUpdateSettings({ pageNumberSuffix: e.target.value })}
                          placeholder="e.g.  — DRAFT"
                          className="w-full bg-surface-0 border border-white/15 rounded p-1 text-[11px] text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Page Number Position */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1">Page Number Position</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'bottom-right', label: 'Bottom Right' },
                        { id: 'bottom-center', label: 'Bottom Center' },
                        { id: 'bottom-left', label: 'Bottom Left' },
                        { id: 'top-right', label: 'Top Right' },
                        { id: 'top-center', label: 'Top Center' },
                        { id: 'top-left', label: 'Top Left' }
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => onUpdateSettings({ pageNumberPosition: pos.id as any })}
                          className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                            (settings.pageNumberPosition || 'bottom-right') === pos.id
                              ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 font-bold'
                              : 'bg-surface-1 border-hairline text-ink-muted hover:text-ink-secondary'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* --- CARD 4: PAGE SUPPRESSION RULES --- */}
                <div className="bg-surface-0/90 p-3.5 rounded-xl border border-hairline space-y-2.5 text-xs">
                  <span className="font-bold text-accent-rosegold-400 text-xs block border-b border-hairline pb-1.5">
                    4. Page Visibility & Suppression Rules
                  </span>

                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-2 bg-surface-1 rounded-lg border border-hairline cursor-pointer">
                      <span className="text-ink-secondary text-[11px]">Suppress Header on Cover Page</span>
                      <input
                        type="checkbox"
                        checked={settings.suppressHeaderOnCover ?? true}
                        onChange={(e) => onUpdateSettings({ suppressHeaderOnCover: e.target.checked })}
                        className="w-4 h-4 rounded bg-surface-0 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 bg-surface-1 rounded-lg border border-hairline cursor-pointer">
                      <span className="text-ink-secondary text-[11px]">Suppress Footer on Cover Page</span>
                      <input
                        type="checkbox"
                        checked={settings.suppressFooterOnCover ?? true}
                        onChange={(e) => onUpdateSettings({ suppressFooterOnCover: e.target.checked })}
                        className="w-4 h-4 rounded bg-surface-0 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 bg-surface-1 rounded-lg border border-hairline cursor-pointer">
                      <span className="text-ink-secondary text-[11px]">Suppress Header on Table of Contents</span>
                      <input
                        type="checkbox"
                        checked={!!settings.suppressHeaderOnToc}
                        onChange={(e) => onUpdateSettings({ suppressHeaderOnToc: e.target.checked })}
                        className="w-4 h-4 rounded bg-surface-0 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 bg-surface-1 rounded-lg border border-hairline cursor-pointer">
                      <span className="text-ink-secondary text-[11px]">Suppress Footer on Table of Contents</span>
                      <input
                        type="checkbox"
                        checked={!!settings.suppressFooterOnToc}
                        onChange={(e) => onUpdateSettings({ suppressFooterOnToc: e.target.checked })}
                        className="w-4 h-4 rounded bg-surface-0 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 7: DOCUMENT ELEMENTS & LAYOUT */}
        {activeSection === 'elements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-accent-rosegold-400" />
                <span>Document Elements & Layout</span>
              </label>
            </div>

            {/* TOC Toggle & Style */}
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 bg-surface-0 rounded-xl border border-hairline cursor-pointer text-xs">
                <span className="text-ink-secondary font-semibold">Table of Contents Page</span>
                <input
                  type="checkbox"
                  checked={settings.showTableOfContents}
                  onChange={(e) => onUpdateSettings({ showTableOfContents: e.target.checked })}
                  className="w-4 h-4 rounded bg-surface-1 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                />
              </label>

              {settings.showTableOfContents && (
                <div className="grid grid-cols-2 gap-1.5 pl-2">
                  {[
                    { id: 'classic-list', label: 'Classic Dotted List' },
                    { id: 'boxed-grid', label: 'Boxed Grid Index' },
                    { id: 'cards', label: 'Preview Cards' },
                    { id: 'minimal', label: 'Minimal List' }
                  ].map((toc) => (
                    <button
                      key={toc.id}
                      onClick={() => onUpdateSettings({ tocStyle: toc.id as any })}
                      className={`p-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                        (settings.tocStyle || 'classic-list') === toc.id
                          ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 font-bold'
                          : 'bg-surface-0 border-hairline text-ink-muted'
                      }`}
                    >
                      {toc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chapter Badge Style */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink-muted">Chapter Title Badge Style</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'number', label: 'Chapter 01' },
                  { id: 'roman', label: 'Chapter I' },
                  { id: 'boxed', label: 'Solid Box' },
                  { id: 'pill', label: 'Rounded Pill' },
                  { id: 'minimal-line', label: 'Accent Line' },
                  { id: 'none', label: 'No Badge' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => onUpdateSettings({ chapterBadgeStyle: ch.id as any })}
                    className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                      (settings.chapterBadgeStyle || 'number') === ch.id
                        ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 font-bold'
                        : 'bg-surface-0 border-hairline text-ink-muted'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Callout Border Style */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink-muted">Callout Box Border Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'left-accent', label: 'Left Thick Accent' },
                  { id: 'solid', label: 'Solid Full Border' },
                  { id: 'dashed', label: 'Dashed Box' },
                  { id: 'soft-bg', label: 'Borderless Tint' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onUpdateSettings({ calloutBorderStyle: c.id as any })}
                    className={`p-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                      (settings.calloutBorderStyle || 'left-accent') === c.id
                        ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 font-bold'
                        : 'bg-surface-0 border-hairline text-ink-muted'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Back Cover CTA Page */}
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 bg-surface-0 rounded-xl border border-hairline cursor-pointer text-xs">
                <span className="text-ink-secondary font-semibold">Back Cover Call-To-Action</span>
                <input
                  type="checkbox"
                  checked={settings.showCallToActionPage}
                  onChange={(e) => onUpdateSettings({ showCallToActionPage: e.target.checked })}
                  className="w-4 h-4 rounded bg-surface-1 border-white/15 text-rosegold-500 focus:ring-rosegold-500/20"
                />
              </label>

              {settings.showCallToActionPage && (
                <div className="grid grid-cols-2 gap-1.5 pl-2">
                  {[
                    { id: 'banner', label: 'Full Hero Banner' },
                    { id: 'card', label: 'Floating Card' },
                    { id: 'full-page', label: 'Full Page Centered' },
                    { id: 'minimal-link', label: 'Minimal Link Box' }
                  ].map((cta) => (
                    <button
                      key={cta.id}
                      onClick={() => onUpdateSettings({ ctaStyle: cta.id as any })}
                      className={`p-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                        (settings.ctaStyle || 'banner') === cta.id
                          ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 font-bold'
                          : 'bg-surface-0 border-hairline text-ink-muted'
                      }`}
                    >
                      {cta.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 8: CUSTOM COLORS & WATERMARK */}
        {activeSection === 'colors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-secondary flex items-center space-x-1.5">
                <Droplet className="w-3.5 h-3.5 text-accent-rosegold-400" />
                <span>Custom Palette & Watermark</span>
              </label>
            </div>

            {/* Primary Color Picker */}
            <div className="bg-surface-0 p-3 rounded-xl border border-hairline space-y-2 text-xs">
              <label className="block text-[11px] font-semibold text-ink-secondary">Custom Primary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.customPrimaryColor || currentTheme.colors.primary}
                  onChange={(e) => onUpdateSettings({ customPrimaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg bg-transparent border border-white/15 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.customPrimaryColor || currentTheme.colors.primary}
                  onChange={(e) => onUpdateSettings({ customPrimaryColor: e.target.value })}
                  className="flex-1 bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white font-mono"
                />
                {settings.customPrimaryColor && (
                  <button
                    onClick={() => onUpdateSettings({ customPrimaryColor: undefined })}
                    className="text-[10px] text-ink-muted hover:text-rose-400 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="bg-surface-0 p-3 rounded-xl border border-hairline space-y-2 text-xs">
              <label className="block text-[11px] font-semibold text-ink-secondary">Custom Accent Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.customAccentColor || currentTheme.colors.accent}
                  onChange={(e) => onUpdateSettings({ customAccentColor: e.target.value })}
                  className="w-8 h-8 rounded-lg bg-transparent border border-white/15 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.customAccentColor || currentTheme.colors.accent}
                  onChange={(e) => onUpdateSettings({ customAccentColor: e.target.value })}
                  className="flex-1 bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white font-mono"
                />
                {settings.customAccentColor && (
                  <button
                    onClick={() => onUpdateSettings({ customAccentColor: undefined })}
                    className="text-[10px] text-ink-muted hover:text-rose-400 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Custom Paper Color Hex */}
            <div className="bg-surface-0 p-3 rounded-xl border border-hairline space-y-2 text-xs">
              <label className="block text-[11px] font-semibold text-ink-secondary">Custom Paper Tint Hex</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.customPaperBgColor || currentTheme.colors.paperBg}
                  onChange={(e) => onUpdateSettings({ customPaperBgColor: e.target.value })}
                  className="w-8 h-8 rounded-lg bg-transparent border border-white/15 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.customPaperBgColor || currentTheme.colors.paperBg}
                  onChange={(e) => onUpdateSettings({ customPaperBgColor: e.target.value })}
                  className="flex-1 bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white font-mono"
                />
                {settings.customPaperBgColor && (
                  <button
                    onClick={() => onUpdateSettings({ customPaperBgColor: undefined })}
                    className="text-[10px] text-ink-muted hover:text-rose-400 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Watermark Options */}
            <div className="bg-surface-0 p-3 rounded-xl border border-hairline space-y-3 text-xs">
              <label className="block text-[11px] font-semibold text-ink-secondary">Diagonal Watermark Text</label>
              <input
                type="text"
                value={settings.watermarkText || ''}
                onChange={(e) => onUpdateSettings({ watermarkText: e.target.value })}
                placeholder="e.g. DRAFT / CONFIDENTIAL / GUMROAD EDITION"
                className="w-full bg-surface-1 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
              />

              {settings.watermarkText && (
                <div>
                  <div className="flex justify-between text-[11px] text-ink-muted mb-1">
                    <span>Watermark Opacity</span>
                    <span className="font-mono text-accent-rosegold-300 font-bold">{settings.watermarkOpacity ?? 10}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    value={settings.watermarkOpacity ?? 10}
                    onChange={(e) => onUpdateSettings({ watermarkOpacity: parseInt(e.target.value) })}
                    className="w-full accent-rosegold-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
