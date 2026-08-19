import React from 'react';
import { Sparkles, BookOpen, CheckCircle, Lightbulb, AlertTriangle, Quote, CheckSquare, Compass, ArrowRight, Shield, Crown, Feather, Award, Layers, Star, Hexagon, Flame, Zap, Leaf, Sun, Stamp, Tag, BadgeCheck } from 'lucide-react';
import { DocumentData, StudioSettings, StudioTheme, CoverStyle, FontPairingId, PageSize, PageMargin, PaperBgStyle, DEFAULT_STUDIO_SETTINGS } from '../types';
import { renderFormattedParagraph, cleanChapterTitle } from '../utils/textCleaner';
import { VisualSeparator } from './VisualSeparators';
import { STUDIO_THEMES } from '../data/themes';
import { FONT_PAIRINGS_DATA } from '../data/fontPairings';

interface PdfCanvasProps {
  document: DocumentData;
  settings?: StudioSettings;
  pdfRef: React.RefObject<HTMLDivElement | null>;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({ document, settings: rawSettings, pdfRef }) => {
  const settings = { ...DEFAULT_STUDIO_SETTINGS, ...(rawSettings || {}) };
  const theme = STUDIO_THEMES.find((t) => t.id === settings.themeId) || STUDIO_THEMES[0];

  // Colors
  const primaryColor = settings.customPrimaryColor || theme.colors.primary;
  const accentColor = settings.customAccentColor || theme.colors.accent;
  const textPrimaryColor = settings.customTextColorPrimary || theme.colors.textPrimary;
  const textSecondaryColor = settings.customTextColorSecondary || theme.colors.textSecondary;
  const headingColor = settings.customHeadingColor || primaryColor;

  // Paper Background Color
  const getPaperBg = () => {
    if (settings.customPaperBgColor) return settings.customPaperBgColor;
    const style = settings.paperBgStyle || 'default';
    switch (style) {
      case 'pure-white': return '#FFFFFF';
      case 'warm-ivory': return '#FAF9F6';
      case 'cream-parchment': return '#F5F2E9';
      case 'soft-sand': return '#F4F1EA';
      case 'recycled-kraft': return '#E5D8C5';
      case 'linen-cotton': return '#F7F7F3';
      case 'rose-quartz': return '#FDF5F5';
      case 'sage-botanical': return '#F1F5F2';
      case 'blueprint-cyan': return '#0F172A';
      case 'dot-grid-journal': return '#FAF9F5';
      case 'cool-grey': return '#F1F5F9';
      case 'aged-sepia': return '#F3EDE0';
      case 'slate-obsidian': return '#121417';
      case 'midnight-espresso': return '#1A1614';
      case 'frost-matte': return '#F8FAFC';
      case 'vintage-newsprint': return '#EFEBE2';
      case 'marble-flourish': return '#FAFAFA';
      case 'blue-lined-notepad': return '#FEFCE8';
      default: return theme.colors.paperBg;
    }
  };

  const paperBgColor = getPaperBg();

  // Font Pairings & Custom Font Overrides
  const getFontFamilyMapping = (): { headerFont: string; bodyFont: string } => {
    let resolvedHeader = theme.headerFont;
    let resolvedBody = theme.bodyFont;

    if (settings.fontPairingId) {
      const pairing = FONT_PAIRINGS_DATA.find((p) => p.id === settings.fontPairingId);
      if (pairing) {
        resolvedHeader = pairing.headerCss;
        resolvedBody = pairing.bodyCss;
      }
    } else {
      switch (settings.fontFamily) {
        case 'serif':
          resolvedHeader = "'Playfair Display', serif";
          resolvedBody = "'Newsreader', Georgia, serif";
          break;
        case 'sans':
          resolvedHeader = "'Plus Jakarta Sans', sans-serif";
          resolvedBody = "'Inter', sans-serif";
          break;
        case 'mono':
          resolvedHeader = "'JetBrains Mono', monospace";
          resolvedBody = "'Plus Jakarta Sans', sans-serif";
          break;
        case 'display':
          resolvedHeader = "'Cinzel', 'Playfair Display', serif";
          resolvedBody = "Georgia, serif";
          break;
      }
    }

    // Apply individual custom font overrides if set
    if (settings.customHeaderFont) {
      resolvedHeader = settings.customHeaderFont;
    }
    if (settings.customBodyFont) {
      resolvedBody = settings.customBodyFont;
    }

    return { headerFont: resolvedHeader, bodyFont: resolvedBody };
  };

  const { headerFont, bodyFont } = getFontFamilyMapping();

  // Font Size Scale
  const getFontSizeClass = () => {
    switch (settings.fontSizeScale) {
      case 'compact': return 'text-xs sm:text-sm';
      case 'large': return 'text-base sm:text-lg';
      case 'extra-large': return 'text-lg sm:text-xl';
      case 'regular':
      default: return 'text-sm sm:text-base';
    }
  };

  // Line Spacing Class
  const getLineSpacingClass = () => {
    switch (settings.lineSpacing) {
      case 'compact': return 'leading-snug';
      case 'spacious': return 'leading-loose';
      case 'double': return 'leading-[2.2]';
      case 'comfortable':
      default: return 'leading-relaxed';
    }
  };

  // Dimensions based on pageSize
  const getDimensionsClass = () => {
    switch (settings.pageSize) {
      case 'a4': return 'w-[210mm] min-h-[297mm]';
      case 'a5': return 'w-[148mm] min-h-[210mm]';
      case 'a6': return 'w-[105mm] min-h-[148mm]';
      case 'square': return 'w-[8in] min-h-[8in]';
      case 'square-large': return 'w-[10in] min-h-[10in]';
      case 'executive': return 'w-[7.25in] min-h-[10.5in]';
      case 'legal': return 'w-[8.5in] min-h-[14in]';
      case 'trade-6x9': return 'w-[6in] min-h-[9in]';
      case 'digest-5.5x8.5': return 'w-[5.5in] min-h-[8.5in]';
      case 'royal-6.14x9.21': return 'w-[6.14in] min-h-[9.21in]';
      case 'crown-quarto': return 'w-[7.44in] min-h-[9.68in]';
      case 'b5': return 'w-[176mm] min-h-[250mm]';
      case 'tablet-4x3': return 'w-[8in] min-h-[10.67in]';
      case 'widescreen-16x9': return 'w-[11in] min-h-[6.18in]';
      case 'mobile-9x16': return 'w-[5in] min-h-[8.88in]';
      case 'pocket-4x6': return 'w-[4in] min-h-[6in]';
      case 'workbook-8.5x11': return 'w-[8.5in] min-h-[11in]';
      case 'manga-5x7.5': return 'w-[5in] min-h-[7.5in]';
      case 'architect-arch-a': return 'w-[9in] min-h-[12in]';
      case 'broadsheet-mini': return 'w-[11in] min-h-[17in]';
      case 'letter':
      default: return 'w-[8.5in] min-h-[11in]';
    }
  };

  // Margins
  const getMarginClass = () => {
    switch (settings.pageMargin) {
      case 'compact': return 'p-4 sm:p-5';
      case 'wide': return 'p-10 sm:p-12';
      case 'ultra': return 'p-12 sm:p-16';
      case 'magazine-bleed': return 'p-2 sm:p-3';
      case 'academic-mirror': return 'py-8 pl-12 pr-6';
      case 'side-column-notes': return 'py-8 pl-6 pr-20';
      case 'bottom-heavy': return 'pt-6 px-8 pb-16';
      case 'pocket-dense': return 'p-3 sm:p-4';
      case 'standard': return 'p-8 sm:p-10';
      // Unset (every freshly-created/imported document, before the user
      // has ever touched the Page Margins control in StudioControls.tsx)
      // used to fall through to the same generous 'standard' padding as an
      // explicit choice — per direct feedback, imported content should use
      // as much of the page as possible by default while staying
      // professional, so the out-of-the-box default is now 'compact'
      // (16px/0.5", still a normal print margin, not the more aggressive
      // 'magazine-bleed'/'pocket-dense' options). A user who explicitly
      // selects "Standard" from the control still gets the original wider
      // padding above — only the unset default changed.
      default: return 'p-4 sm:p-5';
    }
  };

  const pageDimensionsClass = `${getDimensionsClass()} ${getMarginClass()}`;

  // Callout Box Icon
  const renderCalloutIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />;
      case 'warning': return <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />;
      case 'quote': return <Quote className="w-5 h-5 shrink-0" style={{ color: accentColor }} />;
      case 'worksheet': return <CheckSquare className="w-5 h-5 shrink-0 text-emerald-500" />;
      case 'insight': return <Compass className="w-5 h-5 shrink-0 text-purple-500" />;
      default: return <CheckCircle className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />;
    }
  };

  // Logo Settings
  const logoSettings = settings.logoSettings;

  const renderLogoElement = () => {
    if (!logoSettings || !logoSettings.showLogo) return null;

    const logoText = logoSettings.logoText || 'STUDIO PRESS';
    const logoSubtext = logoSettings.logoSubtext || '';
    const heightPx = logoSettings.logoHeight || 28;

    // 1. Image Photo Logo
    if (logoSettings.logoType === 'image') {
      if (logoSettings.logoImageUrl) {
        return (
          <img
            src={logoSettings.logoImageUrl}
            alt="Brand Logo"
            className="object-contain transition-all"
            style={{ height: `${heightPx}px` }}
          />
        );
      }
      return (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-amber-400/50 bg-amber-500/10 text-amber-600 font-mono text-xs font-bold">
          <Crown className="w-4 h-4 text-amber-500" />
          <span>{logoText}</span>
        </div>
      );
    }

    // 2. Crest Pill Badge
    if (logoSettings.logoType === 'badge') {
      return (
        <div
          className="inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-full border text-xs font-bold font-mono uppercase shadow-sm"
          style={{
            backgroundColor: primaryColor,
            color: paperBgColor,
            borderColor: primaryColor
          }}
        >
          <span>{logoText}</span>
          {logoSubtext && <span className="text-[8px] opacity-80 font-normal">{logoSubtext}</span>}
        </div>
      );
    }

    // 3. Gold Monogram Badge
    if (logoSettings.logoType === 'gold-monogram') {
      return (
        <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full border-2 border-amber-500 bg-amber-50/80 shadow-sm text-amber-950 font-serif">
          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
            {logoText.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide uppercase">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-amber-800 tracking-widest uppercase">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 4. Minimal Circle Seal
    if (logoSettings.logoType === 'circle-seal') {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-slate-300 bg-white/60 text-slate-900 font-mono text-xs shadow-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          <span className="font-bold tracking-wider uppercase">{logoText}</span>
        </div>
      );
    }

    // 5. Archway Shield
    if (logoSettings.logoType === 'archway-shield') {
      return (
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-t-xl rounded-b-md border-2 border-slate-800 bg-slate-900 text-white font-sans text-xs">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold tracking-wider uppercase text-[11px] text-amber-300">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-slate-400 font-mono">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 6. Vintage Stamp
    if (logoSettings.logoType === 'vintage-stamp') {
      return (
        <div className="inline-flex flex-col items-center justify-center px-3.5 py-1.5 border-2 border-dashed border-amber-800/80 rounded bg-amber-50/90 text-amber-900 font-mono transform -rotate-1 shadow-xs">
          <span className="text-xs font-black tracking-widest uppercase">{logoText}</span>
          {logoSubtext && <span className="text-[8px] tracking-wider uppercase opacity-80">{logoSubtext}</span>}
        </div>
      );
    }

    // 7. Diamond Emblem
    if (logoSettings.logoType === 'diamond-emblem') {
      return (
        <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 bg-slate-950 text-white border border-amber-500/80 shadow-md">
          <div className="w-3.5 h-3.5 rotate-45 border border-amber-400 bg-amber-500/20 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold font-mono tracking-widest uppercase text-amber-200">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-slate-400 uppercase">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 8. Ribbon Sash Banner
    if (logoSettings.logoType === 'ribbon-sash') {
      return (
        <div className="inline-flex flex-col items-center px-4 py-1 border-y-2 border-slate-900 bg-slate-100 text-slate-900 font-serif">
          <span className="text-xs font-black tracking-widest uppercase">{logoText}</span>
          {logoSubtext && <span className="text-[8px] font-sans tracking-widest text-slate-600 uppercase">{logoSubtext}</span>}
        </div>
      );
    }

    // 9. Cyber Hexagon
    if (logoSettings.logoType === 'cyber-hex') {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-cyan-500/80 bg-slate-950 text-cyan-300 font-mono shadow-md shadow-cyan-500/10">
          <Hexagon className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-wider">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-cyan-500 tracking-widest">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 10. University Seal
    if (logoSettings.logoType === 'university-seal') {
      return (
        <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full border-4 border-double border-slate-900 bg-slate-900 text-white font-serif shadow-sm">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-200">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-slate-300 font-sans tracking-widest">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 11. Luxury Crest
    if (logoSettings.logoType === 'luxury-crest') {
      return (
        <div className="inline-flex flex-col items-center px-3 py-1 border-b-2 border-amber-500 text-slate-900 font-serif">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-900">{logoText}</span>
          {logoSubtext && <span className="text-[8px] font-sans tracking-widest text-amber-700/80 uppercase">{logoSubtext}</span>}
        </div>
      );
    }

    // 12. Metallic Foil Stamped
    if (logoSettings.logoType === 'metallic-foil') {
      return (
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 text-slate-950 font-serif font-black shadow-md border border-amber-300">
          <Crown className="w-4 h-4 text-slate-950" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-widest uppercase">{logoText}</span>
            {logoSubtext && <span className="text-[8px] font-sans font-bold tracking-widest opacity-80">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 13. Minimalist Box
    if (logoSettings.logoType === 'minimalist-box') {
      return (
        <div className="inline-flex flex-col px-3 py-1 border border-slate-900 text-slate-900 font-mono text-xs">
          <span className="font-bold tracking-widest uppercase">{logoText}</span>
          {logoSubtext && <span className="text-[8px] tracking-wider text-slate-600">{logoSubtext}</span>}
        </div>
      );
    }

    // 14. Neon Glow Pill
    if (logoSettings.logoType === 'neon-glow') {
      return (
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border-2 border-pink-500 bg-slate-950 text-pink-400 font-mono shadow-md shadow-pink-500/20">
          <Zap className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs font-bold tracking-widest uppercase">{logoText}</span>
        </div>
      );
    }

    // 15. Modern Monoline
    if (logoSettings.logoType === 'modern-monoline') {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border border-slate-800 text-slate-900 font-sans text-xs">
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-xs" />
          <span className="font-semibold tracking-wider uppercase">{logoText}</span>
        </div>
      );
    }

    // 16. Gothic Monogram
    if (logoSettings.logoType === 'gothic-monogram') {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1 border-2 border-slate-900 bg-slate-950 text-amber-300 font-serif shadow-sm">
          <span className="text-sm font-black text-amber-400">{logoText.charAt(0)}</span>
          <span className="text-xs font-bold tracking-widest uppercase font-mono">{logoText}</span>
        </div>
      );
    }

    // 17. Executive Bar
    if (logoSettings.logoType === 'executive-bar') {
      return (
        <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-slate-900 text-white font-sans rounded shadow-sm">
          <div className="w-1 h-5 bg-amber-400" />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-wider uppercase">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-slate-400 tracking-widest font-mono">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 18. Botanical Leaf Seal
    if (logoSettings.logoType === 'botanical-leaf') {
      return (
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-emerald-600 bg-emerald-50/90 text-emerald-900 font-serif">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide uppercase">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-emerald-700 tracking-widest font-sans">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 19. Double Ring Seal
    if (logoSettings.logoType === 'double-ring') {
      return (
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border-2 border-slate-900 outline outline-1 outline-slate-900 bg-white text-slate-900 font-serif">
          <span className="text-xs font-bold tracking-widest uppercase">{logoText}</span>
        </div>
      );
    }

    // 20. Floating Card Shadow
    if (logoSettings.logoType === 'floating-shadow') {
      return (
        <div className="inline-flex flex-col px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-sans shadow-lg shadow-slate-900/10">
          <span className="text-xs font-black tracking-wider uppercase text-slate-950">{logoText}</span>
          {logoSubtext && <span className="text-[8px] font-mono text-slate-500 uppercase">{logoSubtext}</span>}
        </div>
      );
    }

    // 21. Broadsheet Masthead
    if (logoSettings.logoType === 'broadsheet-masthead') {
      return (
        <div className="inline-flex flex-col items-center px-4 py-1.5 border-b-4 border-slate-950 font-serif text-slate-950">
          <span className="text-sm font-black tracking-widest uppercase">{logoText}</span>
          {logoSubtext && <span className="text-[8px] font-sans tracking-widest uppercase text-slate-600">{logoSubtext}</span>}
        </div>
      );
    }

    // 22. Minimal Dot Tag
    if (logoSettings.logoType === 'minimal-dot') {
      return (
        <div className="inline-flex items-center space-x-2 text-slate-900 font-sans text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="font-extrabold tracking-wider uppercase">{logoText}</span>
        </div>
      );
    }

    // 23. Retro Wavy Starburst
    if (logoSettings.logoType === 'retro-badge') {
      return (
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border-2 border-amber-600 bg-amber-100/90 text-amber-950 font-mono shadow-sm">
          <BadgeCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="text-xs font-black tracking-widest uppercase">{logoText}</span>
        </div>
      );
    }

    // 24. Crown Royal Seal
    if (logoSettings.logoType === 'crown-royal') {
      return (
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border-2 border-amber-500 bg-slate-950 text-amber-300 font-serif shadow-md">
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-200">{logoText}</span>
            {logoSubtext && <span className="text-[8px] text-slate-400 font-sans tracking-widest">{logoSubtext}</span>}
          </div>
        </div>
      );
    }

    // 25. Default Text Badge Logo
    return (
      <div className="flex flex-col">
        <span className="font-extrabold tracking-wider uppercase font-mono text-xs" style={{ color: primaryColor }}>
          {logoText}
        </span>
        {logoSubtext && (
          <span className="text-[9px] uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>
            {logoSubtext}
          </span>
        )}
      </div>
    );
  };

  // Calculate total pages dynamically
  const calculatedTotalPages = (settings.showTableOfContents ? 1 : 0) + document.sections.length + (settings.showCallToActionPage && document.callToAction ? 1 : 0) + 1;

  // Format Page Number
  const formatPageNumber = (num: number, totalPagesCount?: number) => {
    const style = settings.pageNumberStyle || 'number';
    const total = totalPagesCount || calculatedTotalPages;
    const prefix = settings.pageNumberPrefix || '';
    const suffix = settings.pageNumberSuffix || '';

    let formatted = '';
    switch (style) {
      case 'page-of':
        formatted = `Page ${num} of ${total}`;
        break;
      case 'minimal':
        formatted = `${num}`;
        break;
      case 'roman': {
        const romanMap = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        formatted = romanMap[num - 1] || `${num}`;
        break;
      }
      case 'bracket':
        formatted = `[ ${num < 10 ? '0' + num : num} ]`;
        break;
      case 'circle-badge':
        formatted = `${num < 10 ? '0' + num : num}`;
        break;
      case 'custom-prefix':
        formatted = `${prefix}${num}${suffix}`;
        break;
      case 'number':
      default:
        formatted = num < 10 ? `Page 0${num}` : `Page ${num}`;
        break;
    }
    return formatted;
  };

  // Header/Footer Divider Border Class
  const getDividerBorderClass = (dividerStyle?: string, position: 'header' | 'footer' = 'header') => {
    const divStyle = dividerStyle || 'solid';
    const borderSide = position === 'header' ? 'border-b' : 'border-t';
    switch (divStyle) {
      case 'double': return position === 'header' ? 'border-b-4 border-double' : 'border-t-4 border-double';
      case 'dotted': return position === 'header' ? 'border-b border-dashed' : 'border-t border-dashed';
      case 'accent-bar': return position === 'header' ? 'border-b-2' : 'border-t-2';
      case 'none': return position === 'header' ? 'border-b-0' : 'border-t-0';
      case 'solid':
      default: return borderSide;
    }
  };

  // Render Custom Running Header
  const renderCustomHeader = (
    pageType: 'cover' | 'toc' | 'chapter' | 'cta',
    chapterIndex?: number
  ) => {
    if (!settings.showHeadersFooters) return null;

    // Suppression rules
    if (pageType === 'cover' && (settings.suppressHeaderOnCover ?? true)) return null;
    if (pageType === 'toc' && settings.suppressHeaderOnToc) return null;

    const style = settings.headerStyle || 'classic-minimal';
    const align = settings.headerAlignment || 'between';
    const transform = settings.headerTextTransform === 'uppercase' ? 'uppercase' : settings.headerTextTransform === 'capitalize' ? 'capitalize' : 'normal-case';
    const fontSize = settings.headerFontSize === 'sm' ? 'text-xs' : settings.headerFontSize === 'base' ? 'text-sm' : 'text-[10px]';

    let headerColor = theme.colors.textSecondary;
    if (settings.headerColorOption === 'primary') headerColor = primaryColor;
    if (settings.headerColorOption === 'accent') headerColor = accentColor;

    const headerTitle = settings.runningHeaderText || document.title;
    const headerSub = settings.runningHeaderSubtext || (pageType === 'toc' ? 'Table of Contents' : chapterIndex !== undefined ? `Chapter 0${chapterIndex + 1}` : 'Digital Publication');

    const alignClass = align === 'left' ? 'justify-start space-x-4' : align === 'center' ? 'justify-center text-center space-x-4' : align === 'right' ? 'justify-end space-x-4' : 'justify-between';

    return (
      <div
        className={`w-full relative pb-2.5 mb-6 ${getDividerBorderClass(settings.headerDividerStyle, 'header')}`}
        style={{ borderColor: settings.headerDividerStyle === 'accent-bar' ? primaryColor : theme.colors.border }}
      >
        {style === 'accent-top-bar' && (
          <div className="absolute -top-2 left-0 right-0 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
        )}

        {style === 'pill-badge' ? (
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold shadow-xs" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}40`, borderWidth: '1px' }}>
              {settings.showHeaderLogo && logoSettings?.showLogo && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              )}
              <span className={transform}>{headerTitle}</span>
            </div>
            {headerSub && (
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider" style={{ color: headerColor }}>
                {headerSub}
              </span>
            )}
          </div>
        ) : style === 'centered-serif' ? (
          <div className="text-center space-y-0.5">
            <div className="flex items-center justify-center space-x-2 text-xs font-serif font-bold tracking-wide" style={{ color: headerColor }}>
              <span className="text-[10px] opacity-60">✦</span>
              <span className={transform}>{headerTitle}</span>
              <span className="text-[10px] opacity-60">✦</span>
            </div>
            {headerSub && (
              <span className="block text-[9px] font-mono tracking-widest uppercase opacity-75" style={{ color: headerColor }}>
                {headerSub}
              </span>
            )}
          </div>
        ) : style === 'three-part' ? (
          <div className="grid grid-cols-3 gap-2 items-center text-xs font-mono">
            <div className="truncate text-left font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
              {document.category || 'PUBLICATION'}
            </div>
            <div className={`truncate text-center font-semibold ${fontSize} ${transform}`} style={{ color: theme.colors.textPrimary }}>
              {headerTitle}
            </div>
            <div className="truncate text-right text-[10px] uppercase opacity-80" style={{ color: headerColor }}>
              {headerSub}
            </div>
          </div>
        ) : style === 'editorial-masthead' ? (
          <div className="flex flex-col border-b-2 pb-1" style={{ borderColor: primaryColor }}>
            <div className="flex items-center justify-between">
              <span className={`font-extrabold tracking-widest text-xs ${transform}`} style={{ color: theme.colors.textPrimary }}>
                {headerTitle}
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                {headerSub}
              </span>
            </div>
          </div>
        ) : style === 'logo-inline' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {renderLogoElement()}
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
              <span className={`font-bold ${fontSize} ${transform}`} style={{ color: theme.colors.textPrimary }}>
                {headerTitle}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold" style={{ color: headerColor }}>
              {headerSub}
            </span>
          </div>
        ) : (
          <div className={`flex items-center ${alignClass} ${fontSize}`}>
            <div className="flex flex-col">
              <span className={`font-semibold tracking-wider ${transform}`} style={{ color: headerColor }}>
                {headerTitle}
              </span>
              {settings.runningHeaderSubtext && (
                <span className="text-[8px] font-mono tracking-widest uppercase opacity-80" style={{ color: headerColor }}>
                  {settings.runningHeaderSubtext}
                </span>
              )}
            </div>
            <span className="font-mono font-bold tracking-wider" style={{ color: primaryColor }}>
              {headerSub}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render Custom Running Footer
  const renderCustomFooter = (
    pageType: 'cover' | 'toc' | 'chapter' | 'cta',
    pageNumber: number
  ) => {
    if (!settings.showHeadersFooters) return null;

    // Suppression rules
    if (pageType === 'cover' && (settings.suppressFooterOnCover ?? true)) return null;
    if (pageType === 'toc' && settings.suppressFooterOnToc) return null;

    const style = settings.footerStyle || 'classic-split';
    const pageNumText = formatPageNumber(pageNumber);
    const footerText = settings.runningFooterText || document.author || 'DocCraft Studio';

    const customDate = settings.footerShowDate
      ? settings.footerCustomDate || new Date().getFullYear().toString()
      : null;

    const docId = settings.footerShowDocId
      ? settings.footerDocIdText || `DOC-0${pageNumber}`
      : null;

    return (
      <div
        className={`w-full relative pt-3 mt-6 text-[10px] ${getDividerBorderClass(settings.footerDividerStyle, 'footer')}`}
        style={{ borderColor: settings.footerDividerStyle === 'accent-bar' ? primaryColor : theme.colors.border, color: theme.colors.textSecondary }}
      >
        {style === 'accent-bottom-bar' && (
          <div className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
        )}

        {style === 'centered-flanked' ? (
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-3 font-mono font-bold text-xs" style={{ color: primaryColor }}>
              <span className="opacity-40">—</span>
              <span>{pageNumText}</span>
              <span className="opacity-40">—</span>
            </div>
            <div className="flex items-center space-x-2 text-[9px] opacity-80">
              <span>{footerText}</span>
              {customDate && <span>• {customDate}</span>}
              {docId && <span>• {docId}</span>}
            </div>
          </div>
        ) : style === 'pill-badge' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="font-semibold">{footerText}</span>
              {customDate && <span className="opacity-60">• {customDate}</span>}
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold font-mono shadow-xs" style={{ backgroundColor: primaryColor, color: paperBgColor }}>
              {pageNumText}
            </div>
          </div>
        ) : style === 'three-part' ? (
          <div className="grid grid-cols-3 gap-2 items-center text-[10px] font-mono">
            <div className="truncate text-left">
              {footerText}
            </div>
            <div className="truncate text-center opacity-80">
              {customDate || docId || settings.runningFooterSubtext || 'DOC CRAFT'}
            </div>
            <div className="truncate text-right font-bold" style={{ color: primaryColor }}>
              {pageNumText}
            </div>
          </div>
        ) : style === 'bracket-modern' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="font-mono font-bold tracking-wider">{footerText}</span>
              {docId && <span className="font-mono text-[9px] opacity-75">[{docId}]</span>}
            </div>
            <div className="font-mono text-xs font-black tracking-widest" style={{ color: primaryColor }}>
              [ {pageNumText.replace(/^Page\s*/i, '')} ]
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{footerText}</span>
              {customDate && <span className="opacity-75 font-mono text-[9px]">• {customDate}</span>}
              {docId && <span className="opacity-75 font-mono text-[9px]">• {docId}</span>}
            </div>
            <span className="font-mono font-semibold">
              {settings.pageNumberStyle === 'circle-badge' ? (
                <span className="w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-[10px]" style={{ backgroundColor: primaryColor, color: paperBgColor }}>
                  {pageNumText.replace(/^Page\s*/i, '')}
                </span>
              ) : (
                pageNumText
              )}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center py-8 bg-slate-950/90 overflow-x-auto min-h-screen">
      {/* Container holding all PDF pages */}
      <div
        ref={pdfRef}
        id="pdf-render-root"
        className="flex flex-col items-center space-y-8 select-text"
        style={{ fontFamily: bodyFont }}
      >
        {/* ================= PAGE 1: COVER PAGE ================= */}
        <div
          className={`pdf-page relative bg-white shadow-2xl overflow-hidden flex flex-col justify-between ${pageDimensionsClass}`}
          style={{
            backgroundColor: paperBgColor,
            color: theme.colors.textPrimary,
            borderColor: theme.colors.border,
            borderWidth: '1px'
          }}
        >
          {/* Decorative Background Pattern */}
          {document.coverArtSvg ? (
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              dangerouslySetInnerHTML={{ __html: document.coverArtSvg }}
            />
          ) : (
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
          )}

          {/* Confidential Stamp Badge */}
          {settings.confidentialBadge && (
            <div className="absolute top-6 right-6 z-20 flex items-center space-x-1 px-3 py-1 bg-rose-600 text-white font-mono font-bold text-[10px] tracking-widest uppercase rounded shadow-lg transform rotate-3">
              <Shield className="w-3 h-3" />
              <span>CONFIDENTIAL</span>
            </div>
          )}

          {/* Top Header Logo & Category Bar */}
          <div
            className={`relative z-10 flex items-center justify-between pb-4 ${getDividerBorderClass(settings.headerDividerStyle, 'header')}`}
            style={{ borderColor: settings.headerDividerStyle === 'accent-bar' ? primaryColor : theme.colors.border }}
          >
            {/* Left side category */}
            <div className="flex items-center space-x-2">
              <span
                className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded shadow-sm"
                style={{
                  backgroundColor: primaryColor,
                  color: paperBgColor
                }}
              >
                {document.category || 'Digital Publishing'}
              </span>
              {document.estimatedReadTime && (
                <span className="text-[11px] font-mono" style={{ color: theme.colors.textSecondary }}>
                  {document.estimatedReadTime}
                </span>
              )}
            </div>

            {/* Logo Render if Logo placement fits */}
            {logoSettings?.showLogo && logoSettings.logoPlacement !== 'none' && (
              <div className="flex items-center">
                {renderLogoElement()}
              </div>
            )}
          </div>

          {/* COVER CONTENT RENDER BASED ON COVER STYLE */}
          <div className="relative z-10 my-auto py-6 space-y-6">
            {/* 1. Style: Editorial Vogue */}
            {settings.coverStyle === 'editorial-vogue' && (
              <div className="space-y-6">
                <div className="border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                  <span className="text-xs uppercase tracking-widest font-mono font-extrabold" style={{ color: primaryColor }}>
                    SPECIAL EDITORIAL PUBLICATION
                  </span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black leading-none tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-xl font-normal leading-relaxed italic max-w-2xl" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 2. Style: Full Color Banner */}
            {settings.coverStyle === 'banner' && (
              <div className="p-8 rounded-2xl shadow-xl text-white space-y-4" style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-widest font-mono font-bold bg-white/20 px-3 py-1 rounded">
                    FEATURED GUIDE
                  </span>
                  <span className="text-xs font-mono opacity-80">• EDITION 2026</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{ fontFamily: headerFont }}>
                  {document.title}
                </h1>
                <p className="text-base font-medium opacity-90">{document.subtitle}</p>
              </div>
            )}

            {/* 3. Style: Geometric / Luxury */}
            {settings.coverStyle === 'geometric' && (
              <div className="p-8 rounded-2xl border-2 space-y-6 relative overflow-hidden" style={{ borderColor: primaryColor, backgroundColor: theme.colors.cardBg }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" style={{ backgroundColor: `${primaryColor}15` }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md" style={{ backgroundColor: primaryColor, color: paperBgColor }}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-lg font-medium" style={{ color: theme.colors.textSecondary }}>{document.subtitle}</p>
              </div>
            )}

            {/* 4. Style: Luxury Frame */}
            {settings.coverStyle === 'framed' && (
              <div className="p-8 sm:p-10 rounded-2xl border-4 border-double space-y-6 text-center relative" style={{ borderColor: primaryColor }}>
                <div className="mx-auto w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: primaryColor, color: primaryColor }}>
                  <Award className="w-6 h-6" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <div className="w-24 h-1 mx-auto rounded" style={{ backgroundColor: primaryColor }} />
                <p className="text-base sm:text-lg italic max-w-xl mx-auto" style={{ color: theme.colors.textSecondary }}>{document.subtitle}</p>
              </div>
            )}

            {/* 5. Style: Split Graphic */}
            {settings.coverStyle === 'split' && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch my-2">
                <div className="sm:col-span-4 p-6 rounded-2xl flex flex-col justify-between text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="my-8">
                    <span className="text-[10px] font-mono uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                      DIGITAL VOL. 01
                    </span>
                    <h3 className="text-xl font-extrabold mt-2 leading-snug">{document.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono opacity-80 uppercase">DocCraft Studio Press</span>
                </div>
                <div className="sm:col-span-8 flex flex-col justify-center space-y-4 p-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                    {document.title}
                  </h1>
                  <p className="text-base font-normal leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                    {document.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* 6. Style: Bold Swiss Display */}
            {settings.coverStyle === 'bold-title' && (
              <div className="space-y-6">
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                <div className="space-y-2">
                  <span className="text-xs font-mono font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                    SWISS INTERNATIONAL EDITION
                  </span>
                  <h1 className="text-5xl sm:text-6xl font-black leading-none tracking-tight uppercase" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                    {document.title}
                  </h1>
                </div>
                <p className="text-lg font-bold border-l-4 pl-4 py-1" style={{ borderColor: accentColor, color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 7. Style: Monogram Crest Badge */}
            {settings.coverStyle === 'monogram-header' && (
              <div className="text-center space-y-6 py-4">
                <div className="mx-auto w-20 h-20 rounded-full border-4 shadow-xl flex flex-col items-center justify-center" style={{ borderColor: primaryColor, backgroundColor: theme.colors.cardBg }}>
                  <Crown className="w-6 h-6 mb-0.5" style={{ color: primaryColor }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                    {(document.title || 'DC').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="w-32 h-0.5 mx-auto opacity-40" style={{ backgroundColor: primaryColor }} />
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-base sm:text-lg max-w-lg mx-auto" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 8. Style: Magazine Full */}
            {settings.coverStyle === 'magazine-full' && (
              <div className="p-6 rounded-2xl border shadow-lg space-y-6" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.colors.border }}>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                    ISSUE 01 • CREATOR MAGAZINE
                  </span>
                  <span className="text-xs font-mono text-slate-500">2026 SPECIAL</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-lg font-medium leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 9. Style: Academic Press */}
            {settings.coverStyle === 'classic-academic' && (
              <div className="text-center space-y-6 border-y-2 py-8 my-2" style={{ borderColor: primaryColor }}>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-[10px] font-mono uppercase font-bold" style={{ borderColor: primaryColor, color: primaryColor }}>
                  <Feather className="w-3.5 h-3.5" />
                  <span>UNIVERSITY & ACADEMIC PRESS</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-normal leading-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: primaryColor }} />
                <p className="text-base font-serif italic max-w-lg mx-auto" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 10. Style: Cyber Tech Dark */}
            {settings.coverStyle === 'tech-dark' && (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 font-mono space-y-4 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-slate-800 pb-2">
                  <span>$ cat document_manifest.md</span>
                  <span className="text-[10px] text-slate-500">v2.4.0</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: headerFont }}>
                  {document.title}
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">{document.subtitle}</p>
              </div>
            )}

            {/* 11. Style: Minimalist Ivory */}
            {settings.coverStyle === 'minimalist' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>
                    ESSENTIAL PUBLICATION
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-lg sm:text-xl font-normal leading-relaxed max-w-2xl" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 12. Style: Pure Minimal Type */}
            {settings.coverStyle === 'minimal-type' && (
              <div className="space-y-8 relative">
                <div className="text-6xl font-black font-mono opacity-15 absolute -top-4 right-0 select-none" style={{ color: primaryColor }}>
                  Nº 01
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-100" style={{ color: primaryColor }}>
                    STARK TYPOGRAPHIC GRID
                  </span>
                  <h1 className="text-5xl sm:text-6xl font-black leading-none tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                    {document.title}
                  </h1>
                </div>
                <p className="text-lg font-normal leading-relaxed max-w-xl" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 13. Penguin Tri-Band Paperback */}
            {settings.coverStyle === 'penguin-tri-band' && (
              <div className="rounded-2xl border overflow-hidden shadow-lg" style={{ borderColor: theme.colors.border }}>
                <div className="p-4 text-center text-white font-mono text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: primaryColor }}>
                  {document.category || 'PENGUIN CLASSICS'}
                </div>
                <div className="p-8 sm:p-10 text-center space-y-4" style={{ backgroundColor: '#FAF9F6' }}>
                  <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-normal text-slate-900" style={{ fontFamily: headerFont }}>
                    {document.title}
                  </h1>
                  <p className="text-base font-serif italic text-slate-600 max-w-lg mx-auto">
                    {document.subtitle}
                  </p>
                </div>
                <div className="p-3 text-center text-white font-mono text-[10px] uppercase tracking-wider flex items-center justify-between px-6" style={{ backgroundColor: primaryColor }}>
                  <span>{document.author || 'CLASSIC PRESS'}</span>
                  <span>SPECIAL PENGUIN EDITION</span>
                </div>
              </div>
            )}

            {/* 14. Diagonal Slash Angle Block */}
            {settings.coverStyle === 'diagonal-slash' && (
              <div className="relative p-8 rounded-2xl border overflow-hidden shadow-xl" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                <div
                  className="absolute -top-12 -right-12 w-64 h-64 transform rotate-12 opacity-90 pointer-events-none rounded-3xl"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded bg-black/10 backdrop-blur-sm text-white">
                    DIAGONAL SLASH EDITION
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight max-w-xl" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                    {document.title}
                  </h1>
                  <p className="text-lg font-medium leading-relaxed max-w-lg" style={{ color: theme.colors.textSecondary }}>
                    {document.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* 15. Poster Giant Drop Capital */}
            {settings.coverStyle === 'oversized-drop-cap' && (
              <div className="relative p-8 rounded-2xl border space-y-6 overflow-hidden" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                <div
                  className="absolute -bottom-8 -right-4 text-[180px] font-black leading-none opacity-10 select-none pointer-events-none font-serif"
                  style={{ color: primaryColor }}
                >
                  {(document.title || 'A').charAt(0)}
                </div>
                <div className="relative z-10 space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest font-extrabold" style={{ color: primaryColor }}>
                    POSTER DROP-CAPITAL EDITION
                  </span>
                  <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                    {document.title}
                  </h1>
                  <p className="text-lg font-normal leading-relaxed max-w-xl" style={{ color: theme.colors.textSecondary }}>
                    {document.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* 16. Floating Elevated Card Frame */}
            {settings.coverStyle === 'floating-card-frame' && (
              <div className="p-8 sm:p-12 rounded-2xl border-2 shadow-2xl space-y-6 text-center transform hover:scale-[1.01] transition-transform" style={{ backgroundColor: theme.colors.cardBg, borderColor: primaryColor }}>
                <div className="inline-flex p-3 rounded-2xl border shadow-inner" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}10` }}>
                  <Award className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: accentColor }} />
                <p className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 17. Volume Edition Number Overlay */}
            {settings.coverStyle === 'volume-edition-num' && (
              <div className="relative p-8 rounded-2xl border space-y-6 overflow-hidden" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: theme.colors.border }}>
                  <span className="text-3xl font-black font-mono tracking-tighter" style={{ color: primaryColor }}>
                    VOL. 01
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30">
                    MASTER EDITION
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-base font-medium leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 18. Executive Table Index Cover */}
            {settings.coverStyle === 'index-table-summary' && (
              <div className="p-6 rounded-2xl border space-y-6 shadow-md" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                <div className="border-b pb-3" style={{ borderColor: theme.colors.border }}>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                      EXECUTIVE INDEX REPORT
                    </span>
                    <span style={{ color: theme.colors.textSecondary }}>CONFIDENTIAL BRIEFING</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-sm font-normal" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
                {document.sections && document.sections.length > 0 && (
                  <div className="bg-slate-900/5 p-4 rounded-xl border space-y-2" style={{ borderColor: theme.colors.border }}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest block text-slate-500">
                      CONTENTS INDEX SUMMARY
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {document.sections.slice(0, 4).map((sec, i) => (
                        <div key={i} className="flex items-center space-x-2 truncate">
                          <span className="font-bold" style={{ color: primaryColor }}>0{i + 1}.</span>
                          <span className="truncate" style={{ color: theme.colors.textPrimary }}>{sec.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 19. Double Ribbon Band Seal */}
            {settings.coverStyle === 'double-ribbon-stripe' && (
              <div className="space-y-6 text-center py-4 relative">
                <div className="w-full h-3 rounded" style={{ backgroundColor: primaryColor }} />
                <div className="mx-auto w-16 h-16 rounded-full border-4 shadow-lg flex items-center justify-center my-4" style={{ borderColor: primaryColor, backgroundColor: theme.colors.cardBg }}>
                  <Crown className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-base sm:text-lg italic max-w-xl mx-auto" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
                <div className="w-full h-3 rounded" style={{ backgroundColor: accentColor }} />
              </div>
            )}

            {/* 20. Centered Oval Crest Seal */}
            {settings.coverStyle === 'centered-oval-seal' && (
              <div className="p-8 rounded-3xl border-2 space-y-6 text-center" style={{ borderColor: primaryColor, backgroundColor: theme.colors.cardBg }}>
                <div className="mx-auto w-36 h-24 rounded-full border-2 flex flex-col items-center justify-center p-2 shadow-sm" style={{ borderColor: primaryColor }}>
                  <Feather className="w-5 h-5 mb-1" style={{ color: primaryColor }} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                    SEAL OF EXCELLENCE
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-base font-serif italic max-w-lg mx-auto" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 21. Obsidian Radial Spotlight */}
            {settings.coverStyle === 'obsidian-spotlight-glow' && (
              <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white space-y-6 relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 70%)` }} />
                <div className="relative z-10 space-y-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20">
                    OBSIDIAN GLOW
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight" style={{ fontFamily: headerFont }}>
                    {document.title}
                  </h1>
                  <p className="text-base font-normal text-slate-300 leading-relaxed max-w-xl">
                    {document.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* 22. Substack Digest Lead */}
            {settings.coverStyle === 'newsletter-substack' && (
              <div className="p-6 rounded-2xl border space-y-6 shadow-md" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.colors.border }}>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded">
                    SUBSCRIBER EDITION
                  </span>
                  <span className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>DIGITAL DIGEST</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-base font-normal leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 23. Blueprint Technical Grid */}
            {settings.coverStyle === 'blueprint-wireframe' && (
              <div className="p-8 rounded-2xl bg-slate-900 text-cyan-300 font-mono space-y-6 border border-cyan-800/50 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative z-10 flex items-center justify-between text-xs border-b border-cyan-800/80 pb-3">
                  <span>[BLUEPRINT SPECIFICATION]</span>
                  <span>CAD-REV 2026</span>
                </div>
                <h1 className="relative z-10 text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: headerFont }}>
                  {document.title}
                </h1>
                <p className="relative z-10 text-sm text-cyan-200/80 leading-relaxed">
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 24. Risograph Indie Zine */}
            {settings.coverStyle === 'risograph-duotone' && (
              <div className="p-8 rounded-2xl border-4 space-y-6 relative overflow-hidden shadow-xl" style={{ borderColor: primaryColor, backgroundColor: theme.colors.cardBg }}>
                <div className="w-full py-2 bg-rose-500 text-white font-mono text-xs font-black uppercase tracking-widest text-center -mx-8 px-8 transform -rotate-1">
                  INDIE RISOGRAPH ZINE
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-base font-bold leading-snug" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 25. Polaroid Gallery Photo Frame */}
            {settings.coverStyle === 'polaroid-gallery-box' && (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6 text-slate-900">
                <div className="w-full h-40 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                  <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">GALLERY COVER</span>
                </div>
                <div className="pt-2 text-center space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold font-serif" style={{ fontFamily: headerFont }}>
                    {document.title}
                  </h1>
                  <p className="text-sm font-serif italic text-slate-600">
                    {document.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* 26. Corner Folded Sash Badge */}
            {settings.coverStyle === 'corner-ribbon-tag' && (
              <div className="relative p-8 rounded-2xl border space-y-6 overflow-hidden shadow-lg" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-mono text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  SPECIAL EDITION
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-base font-medium leading-relaxed max-w-xl" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 27. Newspaper Broadsheet Masthead */}
            {settings.coverStyle === 'newspaper-front-page' && (
              <div className="p-6 rounded-2xl border-2 space-y-4 shadow-md font-serif" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.cardBg }}>
                <div className="border-b-4 border-double pb-3 text-center space-y-1" style={{ borderColor: theme.colors.border }}>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold block text-slate-500">
                    THE DAILY PUBLISHING PRESS • EST. 2026
                  </span>
                  <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: theme.colors.textPrimary }}>
                    THE GAZETTE EDITION
                  </h2>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <p className="text-sm italic leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 28. Inverted High-Contrast Block */}
            {settings.coverStyle === 'inverted-block-hero' && (
              <div className="p-8 rounded-3xl text-white space-y-6 shadow-2xl" style={{ backgroundColor: primaryColor }}>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white/20">
                  INVERTED BLOCK HERO
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: headerFont }}>
                  {document.title}
                </h1>
                <p className="text-base font-normal opacity-90 leading-relaxed">
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* 29. Vertical Sideways Spine Banner */}
            {settings.coverStyle === 'vertical-spine-display' && (
              <div className="flex flex-col sm:flex-row gap-6 items-stretch">
                <div className="w-full sm:w-16 p-4 rounded-2xl flex sm:flex-col items-center justify-between text-white font-mono font-bold text-xs shadow-lg shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="uppercase tracking-widest sm:[writing-mode:vertical-lr] transform sm:rotate-180">
                    STUDIO SPINE
                  </span>
                  <span className="text-[10px] opacity-80">2026</span>
                </div>
                <div className="flex-1 space-y-4 py-2">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                    {document.title}
                  </h1>
                  <p className="text-base font-medium leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                    {document.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* 30. Botanical Archway Crest */}
            {settings.coverStyle === 'botanical-crest-frame' && (
              <div className="p-8 sm:p-10 rounded-3xl border-2 space-y-6 text-center relative overflow-hidden" style={{ borderColor: primaryColor, backgroundColor: theme.colors.cardBg }}>
                <div className="mx-auto w-12 h-12 rounded-full border flex items-center justify-center" style={{ borderColor: primaryColor, color: primaryColor }}>
                  <Feather className="w-6 h-6" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-normal" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  {document.title}
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-12 h-0.5" style={{ backgroundColor: primaryColor }} />
                  <span className="text-xs italic font-serif text-slate-500">✦</span>
                  <div className="w-12 h-0.5" style={{ backgroundColor: primaryColor }} />
                </div>
                <p className="text-base font-serif italic max-w-lg mx-auto" style={{ color: theme.colors.textSecondary }}>
                  {document.subtitle}
                </p>
              </div>
            )}

            {/* Author Badge */}
            <div className="pt-4 flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                style={{
                  backgroundColor: primaryColor,
                  color: paperBgColor
                }}
              >
                {(document.author || 'Author').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.colors.textSecondary }}>
                  Written & Created By
                </p>
                <p className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                  {document.author || 'Studio Creator'}
                </p>
              </div>
            </div>

            {/* Key Takeaways Summary Card */}
            {document.keyTakeaways && document.keyTakeaways.length > 0 && (
              <div
                className="mt-6 p-5 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border
                }}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                  <h3 className="text-xs uppercase tracking-wider font-bold" style={{ color: primaryColor }}>
                    Inside This Digital Product
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {document.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                      <span style={{ color: theme.colors.textPrimary }}>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cover Footer */}
          <div
            className="relative z-10 pt-4 border-t flex items-center justify-between text-[10px]"
            style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
          >
            <span>© {new Date().getFullYear()} {document.author || 'DocCraft Studio'}. All Rights Reserved.</span>
            <span className="font-mono">DIGITAL EDITION</span>
          </div>
        </div>

        {/* ================= PAGE 2: TABLE OF CONTENTS (OPTIONAL) ================= */}
        {settings.showTableOfContents && (
          <div
            className={`pdf-page relative bg-white shadow-2xl overflow-hidden flex flex-col justify-between ${pageDimensionsClass}`}
            style={{
              backgroundColor: paperBgColor,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              borderWidth: '1px',
              pageBreakBefore: 'always'
            }}
          >
            {/* Running Header */}
            {renderCustomHeader('toc')}

            {/* TOC Content */}
            <div className="my-auto py-8 space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>
                  Index & Structure
                </span>
                <h2 className="text-3xl font-extrabold" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                  Table of Contents
                </h2>
              </div>

              {/* TOC Layout: Cards */}
              {settings.tocStyle === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {document.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border flex flex-col justify-between"
                      style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
                    >
                      <span className="text-xs font-mono font-bold" style={{ color: primaryColor }}>
                        CHAPTER 0{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold mt-1 tracking-wide" style={{ color: theme.colors.textPrimary }}>
                        {cleanChapterTitle(section.title)}
                      </h4>
                      <span className="text-[10px] font-mono mt-2" style={{ color: theme.colors.textSecondary }}>
                        Page 0{idx + 2}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* TOC Layout: Classic Dotted / Default */
                <div className="space-y-4">
                  {document.sections.map((section, idx) => (
                    <div key={idx} className="flex items-baseline justify-between border-b border-dashed pb-2 text-sm" style={{ borderColor: theme.colors.border }}>
                      <div className="flex items-baseline space-x-3">
                        <span className="font-mono font-bold text-xs" style={{ color: primaryColor }}>
                          0{idx + 1}
                        </span>
                        <span className="font-semibold tracking-wide" style={{ color: theme.colors.textPrimary }}>
                          {cleanChapterTitle(section.title)}
                        </span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>
                        Page 0{idx + 2}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Running Footer */}
            {renderCustomFooter('toc', 1)}
          </div>
        )}

        {/* ================= CHAPTER / CONTENT PAGES ================= */}
        {document.sections.map((section, secIdx) => {
          // A section with barely any content (at/below the AI schema's own
          // paragraph floor, no callout/cards/table) would otherwise
          // top-align inside this flex-1 region and leave a large blank gap
          // before the footer. When that happens, center it instead so a
          // rare short section still reads as an intentional minimalist
          // page rather than a broken/unfinished one.
          const isSparseSection =
            section.paragraphs.length <= 2 &&
            !section.callout &&
            (!section.bulletCards || section.bulletCards.length === 0) &&
            !section.tableData;

          return (
          <div
            key={section.id || secIdx}
            className={`pdf-page relative bg-white shadow-2xl overflow-hidden flex flex-col justify-between ${pageDimensionsClass}`}
            style={{
              backgroundColor: paperBgColor,
              color: textPrimaryColor,
              borderColor: theme.colors.border,
              borderWidth: '1px',
              pageBreakBefore: 'always'
            }}
          >
            {/* Running Header */}
            {renderCustomHeader('chapter', secIdx)}

            {/* Section Content */}
            <div className={`flex-1 space-y-6${isSparseSection ? ' flex flex-col justify-center' : ''}`}>
              {/* Chapter Header Banner */}
              <div className="space-y-1.5 border-b pb-4" style={{ borderColor: theme.colors.border }}>
                {settings.chapterBadgeStyle !== 'none' && (
                  <span
                    className={`text-xs uppercase tracking-widest font-mono font-bold inline-block ${
                      settings.chapterBadgeStyle === 'pill'
                        ? 'px-3 py-1 rounded-full text-white'
                        : settings.chapterBadgeStyle === 'boxed'
                        ? 'px-2.5 py-1 rounded text-white'
                        : ''
                    }`}
                    style={{
                      backgroundColor: ['pill', 'boxed'].includes(settings.chapterBadgeStyle || '') ? primaryColor : 'transparent',
                      color: ['pill', 'boxed'].includes(settings.chapterBadgeStyle || '') ? paperBgColor : primaryColor
                    }}
                  >
                    {settings.chapterBadgeStyle === 'roman' ? `Chapter ${['I', 'II', 'III', 'IV', 'V'][secIdx] || secIdx + 1}` : `Chapter 0${secIdx + 1}`}
                  </span>
                )}
                {/* Fixed print-width rem sizing (never vw/clamp — this
                    renders at a fixed page width, not a responsive
                    viewport). Tight negative tracking + balanced wrap gives
                    the title real editorial weight instead of relying on
                    font-weight as the only differentiator. */}
                <h2
                  className="font-extrabold [text-wrap:balance]"
                  style={{ fontFamily: headerFont, color: headingColor, fontSize: '2rem', lineHeight: 1.08, letterSpacing: '-0.02em' }}
                >
                  {cleanChapterTitle(section.title)}
                </h2>
                {section.subtitle && (
                  <p className="text-xs sm:text-sm italic" style={{ color: textSecondaryColor }}>
                    {section.subtitle}
                  </p>
                )}
              </div>

              {/* Automatic Visual Separator beneath Chapter Header */}
              <VisualSeparator
                style={settings.sectionDividerStyle}
                theme={theme}
                customPrimaryColor={primaryColor}
                label={`CHAPTER 0${secIdx + 1} BREAKDOWN`}
                className="my-3"
              />

              {/* Paragraphs with Drop Cap & Custom Formatting */}
              <div className={`space-y-3 ${getFontSizeClass()} ${getLineSpacingClass()}`}>
                {section.paragraphs.map((pText, pIdx) => {
                  if (pIdx === 0 && settings.dropCap && pText.length > 0 && !pText.startsWith('•') && !pText.startsWith('-')) {
                    const firstChar = pText.charAt(0);
                    const restText = pText.slice(1);
                    return (
                      <p key={pIdx} style={{ color: textPrimaryColor }} className="leading-relaxed">
                        <span
                          className="float-left text-4xl font-black font-serif mr-2.5 leading-none mt-1 uppercase"
                          style={{ color: primaryColor }}
                        >
                          {firstChar}
                        </span>
                        {restText}
                      </p>
                    );
                  }
                  return renderFormattedParagraph(
                    pText,
                    textPrimaryColor,
                    primaryColor,
                    pIdx,
                    paperBgColor,
                    theme.colors.cardBg,
                    theme.colors.border,
                    getFontSizeClass(),
                    getLineSpacingClass()
                  );
                })}
              </div>

              {/* Styled Callout Box */}
              {section.callout && (
                <>
                  <VisualSeparator
                    style={settings.sectionDividerStyle === 'none' ? 'none' : 'dotted-lead'}
                    theme={theme}
                    customPrimaryColor={primaryColor}
                    label="INSIGHT & DIRECTIVE"
                    className="my-3"
                  />
                  <div
                    className={`my-4 p-5 rounded-xl shadow-sm flex items-start space-x-3 ${
                      settings.calloutBorderStyle === 'dashed'
                        ? 'border-2 border-dashed'
                        : settings.calloutBorderStyle === 'solid'
                        ? 'border-2'
                        : 'border-l-4'
                    }`}
                    style={{
                      backgroundColor: theme.colors.cardBg,
                      borderColor: primaryColor
                    }}
                  >
                    {renderCalloutIcon(section.callout.type)}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                        {section.callout.title}
                      </h4>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: textPrimaryColor }}>
                        {section.callout.content}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Bullet Feature Cards Grid */}
              {section.bulletCards && section.bulletCards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  {section.bulletCards.map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3.5 rounded-xl border flex flex-col justify-between"
                      style={{
                        backgroundColor: theme.colors.cardBg,
                        borderColor: theme.colors.border
                      }}
                    >
                      <div className="space-y-1">
                        {card.badgeText && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono inline-block"
                            style={{ backgroundColor: primaryColor, color: paperBgColor }}
                          >
                            {card.badgeText}
                          </span>
                        )}
                        <h5 className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>
                          {card.title}
                        </h5>
                        <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table */}
              {section.tableData && (
                <div className="my-4 overflow-hidden rounded-xl border" style={{ borderColor: theme.colors.border }}>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: primaryColor, color: paperBgColor }}>
                        {section.tableData.headers.map((hdr, hIdx) => (
                          <th key={hIdx} className="p-2.5 font-bold uppercase tracking-wider">
                            {hdr}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.tableData.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          style={{
                            backgroundColor: rIdx % 2 === 0 ? paperBgColor : theme.colors.cardBg,
                            borderTop: `1px solid ${theme.colors.border}`
                          }}
                        >
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="p-2.5" style={{ color: theme.colors.textPrimary }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Optional Watermark */}
            {settings.watermarkText && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-30deg]"
                style={{ opacity: (settings.watermarkOpacity ?? 10) / 100 }}
              >
                <span className="text-5xl font-extrabold uppercase font-mono tracking-widest" style={{ color: theme.colors.textPrimary }}>
                  {settings.watermarkText}
                </span>
              </div>
            )}

            {/* Running Footer */}
            {renderCustomFooter('chapter', secIdx + (settings.showTableOfContents ? 2 : 1))}
          </div>
          );
        })}

        {/* ================= FINAL PAGE: CALL TO ACTION (BACK COVER) ================= */}
        {settings.showCallToActionPage && document.callToAction && (
          <div
            className={`pdf-page relative bg-white shadow-2xl overflow-hidden flex flex-col justify-between ${pageDimensionsClass}`}
            style={{
              backgroundColor: paperBgColor,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              borderWidth: '1px',
              pageBreakBefore: 'always'
            }}
          >
            {/* Header */}
            {renderCustomHeader('cta')}

            {/* Back Cover CTA Content */}
            <div className="my-auto py-12 text-center space-y-6 max-w-lg mx-auto">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xl"
                style={{ backgroundColor: primaryColor, color: paperBgColor }}
              >
                <Sparkles className="w-8 h-8" />
              </div>

              <h2 className="text-3xl font-extrabold" style={{ fontFamily: headerFont, color: theme.colors.textPrimary }}>
                {document.callToAction.headline}
              </h2>

              <p className="text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                {document.callToAction.subhead}
              </p>

              {/* Action Button */}
              <div className="pt-4">
                <a
                  href={`https://${document.callToAction.websiteOrHandle.split('|')[0].trim()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition-transform hover:scale-105"
                  style={{
                    backgroundColor: primaryColor,
                    color: paperBgColor
                  }}
                >
                  <span>{document.callToAction.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <p className="text-xs font-mono pt-2" style={{ color: theme.colors.textSecondary }}>
                {document.callToAction.websiteOrHandle}
              </p>
            </div>

            {/* Footer */}
            {renderCustomFooter('cta', (settings.showTableOfContents ? 2 : 1) + document.sections.length)}
          </div>
        )}
      </div>
    </div>
  );
};
