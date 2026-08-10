export interface CalloutBox {
  type: 'tip' | 'warning' | 'quote' | 'insight' | 'worksheet' | 'key-takeaway';
  title: string;
  content: string;
}

export interface BulletCard {
  title: string;
  description: string;
  badgeText?: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface DocSection {
  id: string;
  chapterNumber?: number;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  callout?: CalloutBox;
  bulletCards?: BulletCard[];
  tableData?: TableData;
}

export interface CallToAction {
  headline: string;
  subhead: string;
  buttonText: string;
  websiteOrHandle: string;
}

export interface MarketingCopy {
  gumroadHeadline: string;
  pinterestPinText: string;
  salesHighlights: string[];
}

export interface DocumentData {
  title: string;
  subtitle: string;
  author: string;
  category: string;
  estimatedReadTime?: string;
  keyTakeaways: string[];
  sections: DocSection[];
  callToAction: CallToAction;
  marketingCopy?: MarketingCopy;
  coverArtSvg?: string;
  suggestedThemeId?: string;
  suggestedCoverStyle?: CoverStyle;
}

export type CoverStyle = 
  | 'minimalist'
  | 'banner' 
  | 'split' 
  | 'framed' 
  | 'geometric' 
  | 'bold-title'
  | 'monogram-header'
  | 'editorial-vogue'
  | 'magazine-full'
  | 'classic-academic'
  | 'tech-dark'
  | 'minimal-type'
  | 'penguin-tri-band'
  | 'diagonal-slash'
  | 'oversized-drop-cap'
  | 'floating-card-frame'
  | 'volume-edition-num'
  | 'index-table-summary'
  | 'double-ribbon-stripe'
  | 'centered-oval-seal'
  | 'obsidian-spotlight-glow'
  | 'newsletter-substack'
  | 'blueprint-wireframe'
  | 'risograph-duotone'
  | 'polaroid-gallery-box'
  | 'corner-ribbon-tag'
  | 'newspaper-front-page'
  | 'inverted-block-hero'
  | 'vertical-spine-display'
  | 'executive-bar'
  | 'botanical-crest-frame';

export type FontPairingId = string;

export type PageSize = 
  | 'letter' 
  | 'a4' 
  | 'a5' 
  | 'a6'
  | 'square' 
  | 'square-large'
  | 'executive' 
  | 'legal'
  | 'trade-6x9'
  | 'digest-5.5x8.5'
  | 'royal-6.14x9.21'
  | 'crown-quarto'
  | 'b5'
  | 'tablet-4x3'
  | 'widescreen-16x9'
  | 'mobile-9x16'
  | 'pocket-4x6'
  | 'workbook-8.5x11'
  | 'manga-5x7.5'
  | 'architect-arch-a'
  | 'broadsheet-mini';

export type PageMargin = 
  | 'compact' 
  | 'standard' 
  | 'wide' 
  | 'ultra'
  | 'magazine-bleed'
  | 'academic-mirror'
  | 'side-column-notes'
  | 'bottom-heavy'
  | 'pocket-dense';

export type PaperBgStyle = 
  | 'default' 
  | 'warm-ivory' 
  | 'pure-white' 
  | 'cream-parchment' 
  | 'soft-sand' 
  | 'recycled-kraft'
  | 'linen-cotton'
  | 'rose-quartz'
  | 'sage-botanical'
  | 'blueprint-cyan' 
  | 'dot-grid-journal'
  | 'cool-grey' 
  | 'aged-sepia'
  | 'slate-obsidian' 
  | 'midnight-espresso'
  | 'frost-matte'
  | 'vintage-newsprint'
  | 'marble-flourish'
  | 'blue-lined-notepad';

export type LogoPlacement = 'cover-only' | 'header-all' | 'header-cover-top' | 'none';
export type LogoAlignment = 'left' | 'center' | 'right';
export type LogoType =
  | 'text'
  | 'image'
  | 'badge'
  | 'gold-monogram'
  | 'circle-seal'
  | 'archway-shield'
  | 'vintage-stamp'
  | 'diamond-emblem'
  | 'ribbon-sash'
  | 'cyber-hex'
  | 'university-seal'
  | 'luxury-crest'
  | 'metallic-foil'
  | 'minimalist-box'
  | 'neon-glow'
  | 'modern-monoline'
  | 'gothic-monogram'
  | 'executive-bar'
  | 'botanical-leaf'
  | 'double-ring'
  | 'floating-shadow'
  | 'broadsheet-masthead'
  | 'minimal-dot'
  | 'retro-badge'
  | 'crown-royal';

export interface LogoSettings {
  showLogo: boolean;
  logoType: LogoType;
  logoText: string;
  logoSubtext?: string;
  logoImageUrl?: string;
  logoPlacement: LogoPlacement;
  logoAlignment: LogoAlignment;
  logoHeight: number; // in pixels, e.g. 16 to 64
}

export interface StudioTheme {
  id: string;
  name: string;
  description: string;
  tag: string;
  category?: string;
  fontFamily: 'serif' | 'sans' | 'mono' | 'display';
  headerFont: string;
  bodyFont: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    paperBg: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    cardBg: string;
  };
  coverStyle: CoverStyle;
}

export interface StudioSettings {
  themeId: string;
  fontFamily: 'serif' | 'sans' | 'mono' | 'display';
  fontPairingId?: FontPairingId;
  customHeaderFont?: string;
  customBodyFont?: string;
  pageSize: PageSize;
  pageMargin?: PageMargin;
  paperBgStyle?: PaperBgStyle;
  fontSizeScale?: 'compact' | 'regular' | 'large' | 'extra-large';
  lineSpacing?: 'compact' | 'comfortable' | 'spacious' | 'double';
  
  // Header Logo & Branding
  logoSettings?: LogoSettings;

  // Header & Footer Layouts & Advanced Customization
  showHeadersFooters: boolean;
  headerStyle?: 'classic-minimal' | 'centered-serif' | 'pill-badge' | 'three-part' | 'editorial-masthead' | 'accent-top-bar' | 'logo-inline';
  runningHeaderText?: string;
  runningHeaderSubtext?: string;
  headerAlignment?: 'left' | 'center' | 'right' | 'between';
  headerDividerStyle?: 'solid' | 'double' | 'dotted' | 'accent-bar' | 'none';
  headerTextTransform?: 'uppercase' | 'capitalize' | 'normal';
  headerFontSize?: 'xs' | 'sm' | 'base';
  headerColorOption?: 'muted' | 'primary' | 'accent' | 'dark-badge';
  showHeaderLogo?: boolean;

  // Footers & Page Numbering
  footerStyle?: 'classic-split' | 'centered-flanked' | 'pill-badge' | 'three-part' | 'bracket-modern' | 'accent-bottom-bar' | 'minimal';
  footerDividerStyle?: 'solid' | 'double' | 'dotted' | 'accent-bar' | 'none';
  runningFooterText?: string;
  runningFooterSubtext?: string;
  footerShowDate?: boolean;
  footerCustomDate?: string;
  footerShowDocId?: boolean;
  footerDocIdText?: string;
  showPageNumbers: boolean;
  pageNumberStyle: 'number' | 'page-of' | 'minimal' | 'roman' | 'bracket' | 'circle-badge' | 'custom-prefix';
  pageNumberPosition?: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-left' | 'top-center';
  pageNumberPrefix?: string;
  pageNumberSuffix?: string;

  // Page Suppression Rules
  suppressHeaderOnCover?: boolean;
  suppressFooterOnCover?: boolean;
  suppressHeaderOnToc?: boolean;
  suppressFooterOnToc?: boolean;

  // Table of Contents & Structure
  showTableOfContents: boolean;
  tocStyle?: 'classic-list' | 'boxed-grid' | 'cards' | 'minimal';
  chapterBadgeStyle?: 'roman' | 'number' | 'boxed' | 'pill' | 'minimal-line' | 'none';
  dropCap?: boolean;
  headingTransform?: 'uppercase' | 'capitalize' | 'normal';

  // Cover Style
  coverStyle: CoverStyle;
  confidentialBadge?: boolean;

  // Callouts & Cards
  calloutBorderStyle?: 'solid' | 'left-accent' | 'dashed' | 'soft-bg' | 'pill';
  showCallToActionPage: boolean;
  ctaStyle?: 'banner' | 'card' | 'full-page' | 'minimal-link';

  // Custom Colors & Typography Text Colors & Watermark
  customPrimaryColor?: string;
  customAccentColor?: string;
  customPaperBgColor?: string;
  customTextColorPrimary?: string;
  customTextColorSecondary?: string;
  customHeadingColor?: string;
  watermarkText?: string;
  watermarkOpacity?: number; // 0 - 100
  sectionDividerStyle?: 'gradient-bar' | 'diamond-crest' | 'dotted-lead' | 'boxed-accent' | 'double-rule' | 'architect-grid' | 'minimal-bar' | 'none';
}

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  themeId: 'minimalist-editorial',
  fontFamily: 'serif',
  pageSize: 'letter',
  showTableOfContents: true,
  showHeadersFooters: true,
  showPageNumbers: true,
  pageNumberStyle: 'number',
  coverStyle: 'minimalist',
  showCallToActionPage: true,
  watermarkText: '',
  sectionDividerStyle: 'gradient-bar'
};

export type SocialPlatform = 
  | 'x' 
  | 'instagram' 
  | 'tiktok' 
  | 'facebook' 
  | 'threads' 
  | 'pinterest' 
  | 'linkedin';

export interface PlatformBadgeInfo {
  id: SocialPlatform;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export interface ViralHook {
  id: string;
  hookText: string;
  framework: string;
  viralityScore: number;
  emotionalTrigger: string;
  whyItWorks: string;
  cognitiveBias?: string;
  spicinessLevel?: 'Mild' | 'Spicy' | 'Nuclear Viral';
  platformSuitability?: {
    x?: number;
    linkedin?: number;
    tiktok?: number;
    instagram?: number;
    youtube?: number;
  };
  seeMoreCutoffIndex?: number;
  spokenDurationSec?: number;
  variations?: {
    punchy?: string;
    storyDriven?: string;
    question?: string;
    metricDriven?: string;
  };
}

export interface PlatformContent {
  platform: SocialPlatform;
  title: string;
  mainBody: string;
  secondaryBody?: string;
  hashtags: string[];
  callToAction: string;
  visualDirection?: string;
  estimatedReachMultiplier: string;
  bestPostingTime: string;
  audioOrSoundSuggestion?: string;
  carouselSlides?: { slideNumber: number; headline: string; body: string; visualConcept: string }[];
  scriptTiming?: { timestamp: string; visualCue: string; audioVoiceover: string; onScreenText: string }[];
  threadBreakdown?: { postNumber: number; text: string; mediaNote?: string }[];
  pinterestTitles?: string[];
  pinterestBoards?: string[];
  discussionQuestions?: string[];
  executiveTakeaways?: string[];
  fullNarrativeStory?: string;
}

export interface CampaignData {
  id: string;
  createdAt: string;
  topic: string;
  targetAudience: string;
  goal: 'Brand Awareness' | 'Lead Generation' | 'Direct Sales' | 'Viral Traffic' | 'Community Growth';
  niche: string;
  viralityScore: number;
  coreHook: string;
  platforms: Record<SocialPlatform, PlatformContent>;
  monetizationAngle: string;
}

export interface ViralityAnalysisResult {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    hookStrength: number;
    emotionalResonance: number;
    clarityAndPacing: number;
    callToActionPower: number;
    algorithmicShareability: number;
  };
  volatilityRisk?: 'Low Volatility (Safe)' | 'Moderate Volatility' | 'High Volatility (Risk)';
  readingGrade?: string;
  estimatedReadingTimeSec?: number;
  benchmarkPercentile?: number;
  retentionCurve?: { time: string; retention: number; note?: string }[];
  sentenceAnalysis?: {
    text: string;
    type: 'hook' | 'value' | 'friction' | 'cta';
    score: number;
    feedback: string;
  }[];
  algorithmCompliance?: {
    rule: string;
    status: 'pass' | 'warning' | 'fail';
    impact: string;
  }[];
  keyStrengths: string[];
  vulnerabilities: string[];
  optimizedVersions: {
    label: string;
    versionText: string;
    expectedBoost: string;
    frameworkUsed?: string;
  }[];
}

export interface SystemInstructionBlueprint {
  title: string;
  targetModel: string;
  systemPrompt: string;
  chainOfThoughtSteps: string[];
  monetizationLeverage: string;
  architectureModules?: {
    moduleName: string;
    description: string;
    codeSnippet?: string;
  }[];
  negativeConstraints?: string[];
  variablePlaceholders?: string[];
  estimatedTokenCount?: number;
  complianceGrade?: string;
}

export interface VisualAsset {
  id: string;
  prompt: string;
  platform: SocialPlatform | 'thumbnail' | 'carousel' | 'pinterest' | 'linkedin' | 'tiktok';
  imageUrl: string;
  createdAt: string;
  aspectRatio: string;
  headlineOverlay?: string;
  badgeOverlay?: string;
  styleTheme?: string;
  slides?: {
    slideNumber: number;
    title: string;
    description: string;
    imageUrl: string;
  }[];
}

export interface TeleprompterScriptSegment {
  timeMarker: string;
  spokenText: string;
  visualCue: string;
  onScreenGraphicText: string;
  pacing: string;
}

export interface TeleprompterScript {
  title: string;
  targetDurationSeconds: number;
  wordCount: number;
  estimatedPacingWordsPerMin: number;
  suggestedBGM: string;
  segments: TeleprompterScriptSegment[];
}

export interface AgencyPitchData {
  clientName: string;
  proposalTitle: string;
  monthlyFee: string;
  executiveSummary: string;
  deliverables: string[];
  competitorGapAnalysis: string;
  roiProjection: string;
  agencyName?: string;
  agencyLogoUrl?: string;
  packageTiers?: {
    name: string;
    monthlyFee: string;
    description: string;
    features: string[];
    isRecommended?: boolean;
  }[];
  roadmap90Days?: {
    month: string;
    focus: string;
    keyMilestones: string[];
  }[];
  roiCalculator?: {
    estimatedMonthlyInquiries: number;
    avgDealValue: number;
    estimatedMonthlyRevenue: string;
    projectedROI: string;
  };
  slaGuarantee?: string;
}

export interface CompetitorComparison {
  feature: string;
  viralOS: string;
  jasperCopyAI: string;
  taplioHypefury: string;
  bufferHootsuite: string;
  winner: 'ViralOS';
  category?: 'ai' | 'features' | 'pricing' | 'video' | 'agency';
  description?: string;
}

export interface CustomCompetitorAnalysis {
  targetCompetitorName: string;
  competitorCategory: string;
  estimatedMonthlyCost: string;
  viralOSAdvantageSummary: string;
  overallParityScore: number;
  featureRows: {
    category: 'ai' | 'features' | 'pricing' | 'video' | 'agency';
    featureName: string;
    viralOSCapability: string;
    competitorCapability: string;
    verdict: 'ViralOS Dominates' | 'Partial Parity' | 'Competitor Lacks Feature';
    impactMultiplier: string;
  }[];
  costBreakdown: {
    toolName: string;
    estimatedCostPerUser: string;
    viralOSReplacement: string;
  }[];
  rebuttalBattlecards: {
    objection: string;
    winningRebuttal: string;
  }[];
}

export interface TrendingTopic {
  id: string;
  topic: string;
  platformFocus: string;
  searchVolumeGrowth: string;
  viralityScore: number;
  summary: string;
  suggestedAngle: string;
  recommendedHashtags: string[];
  sourceKeywords: string[];
}

export interface CampaignTemplate {
  id: string;
  title: string;
  category: 'Viral Threads' | 'Short Video Scripts' | 'B2B Thought Leadership' | 'Product Launch Blitz' | 'Carousel Guides' | 'Direct Response Funnel' | 'Custom Saved';
  description: string;
  targetPlatforms: SocialPlatform[];
  coreHookStructure: string;
  bodyFormatTemplate: string;
  hashtags: string[];
  callToAction: string;
  estimatedViralityScore: number;
  isCustom?: boolean;
  createdAt?: string;
  tags?: string[];
  usageCount?: number;
}

export interface TrendingPulseData {
  lastUpdated: string;
  category: string;
  trends: TrendingTopic[];
}


