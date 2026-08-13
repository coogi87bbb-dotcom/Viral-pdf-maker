import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { StudioControls } from './components/StudioControls';
import { PdfCanvas } from './components/PdfCanvas';
import { ScaledCanvasStage } from './components/ScaledCanvasStage';
import { DocImporter } from './components/DocImporter';
import { AiEnhancerModal } from './components/AiEnhancerModal';
import { MockupGenerator } from './components/MockupGenerator';
import { ExportModal } from './components/ExportModal';
import { GuidedStepper } from './components/GuidedStepper';
import { DocEditorModal } from './components/DocEditorModal';
import { Studio3DBackground } from './components/Studio3DBackground';
import { MotionPanel3D } from './components/MotionPanel3D';
import { ModeTab } from './components/ModeTab';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/landing/LandingPage';

// Viral OS Components
import { ViralHeader, ActiveTab as ViralTab } from './components/ViralHeader';
import { CampaignGenerator } from './components/CampaignGenerator';
import { HookStudio } from './components/HookStudio';
import { ViralityAnalyzer } from './components/ViralityAnalyzer';
import { BlueprintBuilder } from './components/BlueprintBuilder';
import { VisualStudio } from './components/VisualStudio';
import { ContentCalendar } from './components/ContentCalendar';
import { RoiCalculator } from './components/RoiCalculator';
import { TeleprompterStudio } from './components/TeleprompterStudio';
import { AgencyPortal } from './components/AgencyPortal';
import { CompetitorDominationMatrix } from './components/CompetitorDominationMatrix';
import { TrendingPulse } from './components/TrendingPulse';
import { TemplateLibrary } from './components/TemplateLibrary';
import { AdminDashboard } from './components/AdminDashboard';
import { GigScale } from './components/GigScale';
import { DigitalKitStudio } from './components/DigitalKitStudio';
import { AgentOpsStudio } from './components/AgentOpsStudio';
import { DealCloserStudio } from './components/DealCloser/DealCloserStudio';

import { DocumentData, DocSection, StudioSettings, StudioTheme } from './types';
import { parseTextIntoDocument, cleanRawText } from './utils/textCleaner';
import { SAMPLE_DOCUMENTS } from './data/sampleDocs';
import { STUDIO_THEMES } from './data/themes';
import { FileText, Flame, Sparkles, Layers, ArrowRight, Zap, ShieldCheck, LogOut, User, Crown, Package, Bot, Handshake } from 'lucide-react';
import { OWNER_EMAIL } from './lib/firebase';

type AppMode = 'pdf-studio' | 'viral-os' | 'gig-scale' | 'digital-kit' | 'agent-ops' | 'deal-closer' | 'owner-admin';

function MainWorkspace() {
  const { user, userProfile, logout, loading, authError } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('pdf-studio');
  const [showLanding, setShowLanding] = useState(true);

  // Self-heal stale 'owner-admin' state if the auth session drops/changes out
  // from under it (e.g. a Firebase token refresh momentarily nulling `user`
  // while the owner is sitting on the Master Admin screen). Without this, the
  // final fallback branch below would otherwise be the only thing standing
  // between that state and a broken render.
  useEffect(() => {
    if (appMode === 'owner-admin' && user?.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      setAppMode('pdf-studio');
    }
  }, [appMode, user]);

  // Signing out returns to the marketing landing page rather than dumping the
  // visitor on the bare auth modal. `showLanding` is only ever flipped false
  // by the landing CTA, so without this it stayed false for the rest of the
  // session and every sign-out landed on AuthModal.
  //
  // Deliberately a separate effect keyed on [user, loading], and `showLanding`
  // is NOT in the dependency array — adding it would fight the landing CTA and
  // loop. Gated on `!loading` so a transient null during a token refresh or a
  // signInWithRedirect round-trip doesn't re-arm the landing mid-flight.
  useEffect(() => {
    if (!user && !loading) {
      setShowLanding(true);
    }
  }, [user, loading]);

  // Document State - defaults to the Creator Monetization Playbook sample
  const [document, setDocument] = useState<DocumentData>(SAMPLE_DOCUMENTS[0].doc);
  const [rawText, setRawText] = useState<string>(SAMPLE_DOCUMENTS[0].rawText);

  // Settings State for PDF Studio
  const [settings, setSettings] = useState<StudioSettings>({
    themeId: 'minimalist-editorial',
    fontFamily: 'serif',
    pageSize: 'letter',
    showTableOfContents: true,
    showHeadersFooters: true,
    pageNumberStyle: 'number',
    coverStyle: 'minimalist',
    showCallToActionPage: true,
    watermarkText: ''
  });

  // UI Tabs & Modals for PDF Studio
  const [activeTab, setActiveTab] = useState<'canvas' | 'mockup'>('canvas');
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isAiEnhancerOpen, setIsAiEnhancerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState<boolean>(true);

  // Viral OS State
  const [viralTab, setViralTab] = useState<ViralTab>('campaign');
  const [viralTrendTopic, setViralTrendTopic] = useState<string>('');

  const pdfRef = useRef<HTMLDivElement>(null);
  const currentTheme = STUDIO_THEMES.find((t) => t.id === settings.themeId) || STUDIO_THEMES[0];

  const handleToggleSplitScreen = () => {
    setIsSplitScreen((prev) => !prev);
  };

  // Handlers for PDF Studio
  const handleUpdateSettings = (newSettings: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSelectTheme = (theme: StudioTheme) => {
    setSettings((prev) => ({
      ...prev,
      themeId: theme.id,
      fontFamily: theme.fontFamily,
      coverStyle: theme.coverStyle
    }));
  };

  const applyDocumentThemeAndSettings = (doc: DocumentData) => {
    if (doc.suggestedThemeId) {
      const matchedTheme = STUDIO_THEMES.find((t) => t.id === doc.suggestedThemeId) || STUDIO_THEMES[0];
      handleSelectTheme(matchedTheme);
    }
    if (doc.suggestedCoverStyle) {
      setSettings((prev) => ({
        ...prev,
        coverStyle: doc.suggestedCoverStyle!,
        showTableOfContents: doc.sections.length > 1,
        showCallToActionPage: true
      }));
    }
  };

  const handleImportDocument = (doc: DocumentData, text?: string) => {
    setDocument(doc);
    if (text) setRawText(text);
    applyDocumentThemeAndSettings(doc);
  };

  const handleImportRawText = (text: string, title?: string) => {
    setRawText(text);
    const parsedDoc = parseTextIntoDocument(text, title);
    setDocument(parsedDoc);
    applyDocumentThemeAndSettings(parsedDoc);
  };

  const handleImportAndEnhance = (text: string, title?: string) => {
    handleImportRawText(text, title);
    setIsAiEnhancerOpen(true);
  };

  const handleEnhancedResult = (
    enhancedData: DocumentData,
    options?: {
      topicTitle?: string;
      docType?: string;
      styleVibe?: string;
    }
  ) => {
    setDocument(enhancedData);
    if (options?.styleVibe) {
      const matchedTheme = STUDIO_THEMES.find(
        (t) =>
          t.id.includes(options.styleVibe!) ||
          t.name.toLowerCase().includes(options.styleVibe!.toLowerCase())
      );
      if (matchedTheme) {
        handleSelectTheme(matchedTheme);
      }
    }
  };

  // Switch to Viral OS & load current document topic
  const handleSendToViralOS = () => {
    setViralTrendTopic(document.title);
    setAppMode('viral-os');
    setViralTab('campaign');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for Viral OS
  const handleViralQuickStart = () => {
    setViralTab('campaign');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTrendForCampaign = (topic: string) => {
    setViralTrendTopic(topic);
    setViralTab('campaign');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTemplateForCampaign = (template: any) => {
    setViralTrendTopic(template.coreHookStructure || template.title);
    setViralTab('campaign');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-4 text-ink-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-accent-rosegold-300 via-accent-rosegold-400 to-accent-rosegold-500 p-0.5 animate-pulse flex items-center justify-center shadow-[var(--shadow-glow-rosegold)]">
            <div className="h-full w-full bg-surface-0 rounded-[14px] flex items-center justify-center">
              <Flame className="h-6 w-6 text-accent-rosegold-400" />
            </div>
          </div>
          <p className="text-xs font-mono text-ink-muted">Loading Pro Creator Platform Workspace...</p>
        </div>
      </div>
    );
  }

  // Signed-out visitors see the marketing landing page first; clicking
  // "Get Started"/"Sign In" there flips to the existing auth gate below.
  // authError bypasses that (even though showLanding defaults back to true
  // on every fresh page load, which is exactly what happens after a full
  // signInWithRedirect() round-trip) — otherwise a failed redirect sign-in
  // would land back on the landing page with the error set but nothing on
  // screen to show it, since only AuthModal renders authError.
  if (!user) {
    if (showLanding && !authError) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthModal onBack={() => setShowLanding(true)} />;
  }

  return (
    <div className="min-h-screen bg-surface-0 text-ink-primary font-sans selection:bg-accent-rosegold-400 selection:text-slate-950 flex flex-col relative overflow-x-hidden">
      {/* Global 3D Liquid Gold & Metallic Silver Mouse-Tracking Background */}
      <Studio3DBackground intensity="medium" className="fixed inset-0 z-0 opacity-90" />

      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-surface-1/90 backdrop-blur-xl border-b border-hairline px-4 py-2.5 shadow-[var(--shadow-elevated)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-rosegold-400 via-accent-rosegold-500 to-accent-rosegold-600 p-0.5 shadow-[var(--shadow-glow-rosegold)] border border-accent-rosegold-400/30">
              <div className="h-full w-full bg-surface-0 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-accent-rosegold-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-base tracking-[-0.01em] text-white">LogFlow<span className="text-accent-rosegold-400"> AI</span></span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent-rosegold-500/10 text-accent-rosegold-300 font-bold border border-accent-rosegold-500/20">
                  STUDIO
                </span>
              </div>
              <p className="text-[10px] text-ink-muted font-normal">High-DPI Publishing, 3D Book Mockups & Creator Workspaces</p>
            </div>
          </div>

          {/* MAIN APP MODE SWITCHER TABS */}
          <div className="flex flex-wrap items-center justify-center bg-surface-0/90 border border-hairline p-1 rounded-xl gap-1 shadow-inner">
            <ModeTab
              icon={FileText}
              label="PDF & Mockup Studio"
              active={appMode === 'pdf-studio'}
              onClick={() => setAppMode('pdf-studio')}
            />
            <ModeTab
              icon={Flame}
              label="Viral OS Engine"
              badge="12 AI Tools"
              active={appMode === 'viral-os'}
              onClick={() => setAppMode('viral-os')}
            />
            <ModeTab
              icon={Zap}
              label="GigScale Engine"
              badge="Agency OS"
              active={appMode === 'gig-scale'}
              onClick={() => setAppMode('gig-scale')}
            />
            <ModeTab
              icon={Package}
              label="Digital Kit Studio"
              badge="Kit Builder"
              active={appMode === 'digital-kit'}
              onClick={() => setAppMode('digital-kit')}
            />
            <ModeTab
              icon={Bot}
              label="AI Agent Ops"
              badge="Self-Healing"
              badgeVariant="positive"
              active={appMode === 'agent-ops'}
              onClick={() => setAppMode('agent-ops')}
            />
            <ModeTab
              icon={Handshake}
              label="Deal Closer"
              badge="7 RE Tools"
              active={appMode === 'deal-closer'}
              onClick={() => setAppMode('deal-closer')}
            />
            {user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() && (
              <ModeTab
                icon={Crown}
                label="Master Admin"
                emphasized
                active={appMode === 'owner-admin'}
                onClick={() => setAppMode('owner-admin')}
              />
            )}
          </div>

          {/* User Account Session & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-ink-secondary truncate max-w-[130px]">
                {userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'VIP Member'}
              </span>
              <span className="text-[10px] text-accent-rosegold-400/90 font-mono flex items-center justify-end gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-status-positive animate-pulse" />
                <span>Connected</span>
              </span>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out of Creator Platform"
              className="px-3 py-1.5 rounded-lg bg-surface-1/80 hover:bg-surface-2 border border-hairline text-ink-secondary hover:text-white transition-colors active:scale-[0.98] flex items-center gap-1.5 text-xs font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400"
            >
              <LogOut className="h-3.5 w-3.5 text-ink-muted" />
              <span className="hidden md:inline font-sans text-xs">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* APP MODE CONTENT PANELS */}
      {appMode === 'pdf-studio' ? (
        <div className="flex-1 flex flex-col">
          {/* Header Controls for PDF Studio */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenAiEnhancer={() => setIsAiEnhancerOpen(true)}
            onOpenMockupModal={() => setActiveTab('mockup')}
            onExportPdf={() => setIsExportModalOpen(true)}
            isAiLoading={isAiLoading}
            docTitle={document.title}
            isSplitScreen={isSplitScreen}
            onToggleSplitScreen={handleToggleSplitScreen}
          />

          {/* Guided Stepper Navigation */}
          <GuidedStepper
            document={document}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenAiEnhancer={() => setIsAiEnhancerOpen(true)}
            onOpenEditor={() => setIsEditorOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
          />

          {/* PDF Studio Workspace */}
          <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
            {activeTab === 'canvas' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 w-full">
                {/* Left Controls Panel */}
                <div className={`${isSplitScreen ? 'lg:col-span-4 xl:col-span-4 2xl:col-span-3' : 'hidden'}`}>
                  <MotionPanel3D delay={0.1} tiltX={8} hoverTilt={false}>
                    <StudioControls
                      document={document}
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                      onSelectTheme={handleSelectTheme}
                      onSelectSampleDoc={handleImportDocument}
                      onOpenImporter={() => setIsImporterOpen(true)}
                      onOpenAiEnhancer={() => setIsAiEnhancerOpen(true)}
                      onOpenEditor={() => setIsEditorOpen(true)}
                      onOpenMockupModal={() => setActiveTab('mockup')}
                      onOpenDigitalKitStudio={() => setAppMode('digital-kit')}
                      isSplitScreen={isSplitScreen}
                      onToggleSplitScreen={handleToggleSplitScreen}
                    />
                  </MotionPanel3D>
                </div>

                {/* Right Interactive Canvas Preview Panel */}
                <div className={`${isSplitScreen ? 'lg:col-span-8 xl:col-span-8 2xl:col-span-9' : 'lg:col-span-12'} flex flex-col`}>
                  <MotionPanel3D delay={0.2} tiltX={10} hoverTilt={false}>
                    <ScaledCanvasStage
                      document={document}
                      settings={settings}
                      theme={currentTheme}
                      pdfRef={pdfRef}
                      isSplitScreen={isSplitScreen}
                      onToggleSplitScreen={handleToggleSplitScreen}
                    />
                  </MotionPanel3D>
                </div>
              </div>
            ) : (
              <MotionPanel3D delay={0.1} tiltX={10} hoverTilt={false}>
                <MockupGenerator document={document} themeId={settings.themeId} />
              </MotionPanel3D>
            )}
          </main>
        </div>
      ) : appMode === 'viral-os' ? (
        /* APP B: VIRAL OS SUITE */
        <div className="flex-1 flex flex-col">
          {/* Viral OS Sub-Header */}
          <ViralHeader
            activeTab={viralTab}
            setActiveTab={setViralTab}
            onQuickStart={handleViralQuickStart}
            onOpenMasterAdmin={() => setAppMode('owner-admin')}
          />

          {/* Viral OS Workspace Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <MotionPanel3D key={viralTab} delay={0.1} tiltX={10} hoverTilt={false}>
              {viralTab === 'campaign' && <CampaignGenerator initialTopic={viralTrendTopic} />}
              {viralTab === 'pulse' && <TrendingPulse onSelectTrendForCampaign={handleSelectTrendForCampaign} />}
              {viralTab === 'templates' && <TemplateLibrary onSelectTemplate={handleSelectTemplateForCampaign} />}
              {viralTab === 'hooks' && (
                <HookStudio
                  onSelectHookForCampaign={handleSelectTrendForCampaign}
                  onNavigateTab={(tab) => setViralTab(tab as ViralTab)}
                />
              )}
              {viralTab === 'analyzer' && <ViralityAnalyzer />}
              {viralTab === 'teleprompter' && <TeleprompterStudio />}
              {viralTab === 'visuals' && <VisualStudio />}
              {viralTab === 'blueprint' && <BlueprintBuilder />}
              {viralTab === 'calendar' && <ContentCalendar />}
              {viralTab === 'agency' && <AgencyPortal />}
              {viralTab === 'matrix' && <CompetitorDominationMatrix />}
              {viralTab === 'roi' && <RoiCalculator />}
            </MotionPanel3D>
          </main>
        </div>
      ) : appMode === 'gig-scale' ? (
        /* APP C: GIGSCALE FREELANCE & SERVICE ENGINE */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10} hoverTilt={false}>
            <GigScale />
          </MotionPanel3D>
        </div>
      ) : appMode === 'digital-kit' ? (
        /* APP D: DIGITAL KIT STUDIO (4TH APP) */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10} hoverTilt={false}>
            <DigitalKitStudio
              document={document}
              onSwitchToPdfStudio={() => setAppMode('pdf-studio')}
              onOpenEditor={(customDoc) => {
                if (customDoc) {
                  setDocument(customDoc);
                }
                setIsEditorOpen(true);
              }}
            />
          </MotionPanel3D>
        </div>
      ) : appMode === 'agent-ops' ? (
        /* APP E: AI AGENT OPS & SELF-HEALING HUB */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10} hoverTilt={false}>
            <AgentOpsStudio
              document={document}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onUpdateDocument={(doc) => setDocument(doc)}
            />
          </MotionPanel3D>
        </div>
      ) : appMode === 'deal-closer' ? (
        /* APP F: DEAL CLOSER — REAL ESTATE TOOLKIT (7 AI TOOLS) */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10} hoverTilt={false}>
            <DealCloserStudio />
          </MotionPanel3D>
        </div>
      ) : appMode === 'owner-admin' && user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() ? (
        /* MASTER UNIFIED OWNER ADMIN DASHBOARD (OWNER ONLY) */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10} hoverTilt={false}>
            <ErrorBoundary label="Master Admin">
              <AdminDashboard />
            </ErrorBoundary>
          </MotionPanel3D>
        </div>
      ) : (
        /* DEFENSIVE FALLBACK — unreachable in steady state once the appMode
           guard above resets stale 'owner-admin' state; must never reference
           MainWorkspace itself (that previously caused an infinite recursive
           self-mount / crash). */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10} hoverTilt={false}>
            <div className="text-center text-ink-secondary text-sm py-16">Redirecting…</div>
          </MotionPanel3D>
        </div>
      )}

      {/* Global Modals for PDF Studio */}
      <DocImporter
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportDoc={handleImportDocument}
        onImportRawText={handleImportRawText}
        onImportAndEnhance={handleImportAndEnhance}
      />

      <AiEnhancerModal
        isOpen={isAiEnhancerOpen}
        onClose={() => setIsAiEnhancerOpen(false)}
        rawText={rawText}
        currentDoc={document}
        onApplyEnhancedDoc={handleEnhancedResult}
      />

      <DocEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        document={document}
        settings={settings}
        onSaveDocument={(doc) => setDocument(doc)}
        onUpdateDocument={(doc) => setDocument(doc)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        document={document}
        settings={settings}
        theme={currentTheme}
        pdfRef={pdfRef}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <MainWorkspace />
      </ErrorBoundary>
    </AuthProvider>
  );
}
