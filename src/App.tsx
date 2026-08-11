import React, { useRef, useState } from 'react';
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

import { DocumentData, DocSection, StudioSettings, StudioTheme } from './types';
import { parseTextIntoDocument, cleanRawText } from './utils/textCleaner';
import { SAMPLE_DOCUMENTS } from './data/sampleDocs';
import { STUDIO_THEMES } from './data/themes';
import { FileText, Flame, Sparkles, Layers, ArrowRight, Zap, ShieldCheck, LogOut, User, Crown, Package, Bot } from 'lucide-react';
import { OWNER_EMAIL } from './lib/firebase';

type AppMode = 'pdf-studio' | 'viral-os' | 'gig-scale' | 'digital-kit' | 'agent-ops' | 'owner-admin';

function MainWorkspace() {
  const { user, userProfile, logout, loading } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('pdf-studio');
  const [showLanding, setShowLanding] = useState(true);

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 p-0.5 animate-pulse flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.5)]">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Flame className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <p className="text-xs font-mono text-slate-400">Loading Pro Creator Platform Workspace...</p>
        </div>
      </div>
    );
  }

  // Signed-out visitors see the marketing landing page first; clicking
  // "Get Started"/"Sign In" there flips to the existing auth gate below.
  if (!user) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col relative overflow-x-hidden">
      {/* Global 3D Liquid Gold & Metallic Silver Mouse-Tracking Background */}
      <Studio3DBackground intensity="medium" className="fixed inset-0 z-0 opacity-90" />

      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#0c0e14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/15 border border-amber-400/30">
              <div className="h-full w-full bg-[#090b10] rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider text-white uppercase">VIRAL STUDIO OS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                  3D EXECUTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-normal">High-DPI Publishing, 3D Book Mockups & Creator Workspaces</p>
            </div>
          </div>

          {/* MAIN APP MODE SWITCHER TABS - EXECUTIVE STYLING */}
          <div className="flex flex-wrap items-center justify-center bg-[#090b10]/90 border border-slate-800 p-1 rounded-xl gap-1 shadow-inner">
            <button
              onClick={() => setAppMode('pdf-studio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appMode === 'pdf-studio'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <FileText className={`h-3.5 w-3.5 ${appMode === 'pdf-studio' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>PDF & Mockup Studio</span>
            </button>

            <button
              onClick={() => setAppMode('viral-os')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appMode === 'viral-os'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Flame className={`h-3.5 w-3.5 ${appMode === 'viral-os' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Viral OS Engine</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold hidden sm:inline ${
                appMode === 'viral-os' ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-amber-400 border border-slate-800'
              }`}>
                13 AI Tools
              </span>
            </button>

            <button
              onClick={() => setAppMode('gig-scale')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appMode === 'gig-scale'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Zap className={`h-3.5 w-3.5 ${appMode === 'gig-scale' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>GigScale Engine</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold hidden sm:inline ${
                appMode === 'gig-scale' ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                Agency OS
              </span>
            </button>

            <button
              onClick={() => setAppMode('digital-kit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appMode === 'digital-kit'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Package className={`h-3.5 w-3.5 ${appMode === 'digital-kit' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Digital Kit Studio</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold hidden sm:inline ${
                appMode === 'digital-kit' ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                Kit Builder
              </span>
            </button>

            <button
              onClick={() => setAppMode('agent-ops')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appMode === 'agent-ops'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Bot className={`h-3.5 w-3.5 ${appMode === 'agent-ops' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>AI Agent Ops</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold hidden sm:inline ${
                appMode === 'agent-ops' ? 'bg-slate-950 text-amber-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Self-Healing
              </span>
            </button>

            {user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() && (
              <button
                onClick={() => setAppMode('owner-admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  appMode === 'owner-admin'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-amber-300 border border-amber-500/30 hover:bg-slate-800'
                }`}
              >
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Master Admin</span>
              </button>
            )}
          </div>

          {/* User Account Session & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                {userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'VIP Member'}
              </span>
              <span className="text-[10px] text-amber-400/90 font-mono flex items-center justify-end gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected</span>
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out of Creator Platform"
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
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
                <div className={`${isSplitScreen ? 'lg:col-span-4 xl:col-span-4 2xl:col-span-3' : 'hidden'} transition-all`}>
                  <MotionPanel3D delay={0.1} tiltX={8}>
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
                <div className={`${isSplitScreen ? 'lg:col-span-8 xl:col-span-8 2xl:col-span-9' : 'lg:col-span-12'} flex flex-col transition-all`}>
                  <MotionPanel3D delay={0.2} tiltX={10}>
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
              <MotionPanel3D delay={0.1} tiltX={10}>
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
          />

          {/* Viral OS Workspace Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <MotionPanel3D key={viralTab} delay={0.1} tiltX={10}>
              {viralTab === 'admin' && (user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() ? <AdminDashboard /> : <CampaignGenerator initialTopic={viralTrendTopic} />)}
              {viralTab === 'campaign' && <CampaignGenerator initialTopic={viralTrendTopic} />}
              {viralTab === 'gigscale' && <GigScale />}
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
          <MotionPanel3D delay={0.1} tiltX={10}>
            <GigScale />
          </MotionPanel3D>
        </div>
      ) : appMode === 'digital-kit' ? (
        /* APP D: DIGITAL KIT STUDIO (4TH APP) */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10}>
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
          <MotionPanel3D delay={0.1} tiltX={10}>
            <AgentOpsStudio
              document={document}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onUpdateDocument={(doc) => setDocument(doc)}
            />
          </MotionPanel3D>
        </div>
      ) : appMode === 'owner-admin' && user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() ? (
        /* MASTER UNIFIED OWNER ADMIN DASHBOARD (OWNER ONLY) */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10}>
            <AdminDashboard />
          </MotionPanel3D>
        </div>
      ) : (
        /* FALLBACK DEFAULT WORKSPACE FOR CLIENTS */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MotionPanel3D delay={0.1} tiltX={10}>
            <MainWorkspace />
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
      <MainWorkspace />
    </AuthProvider>
  );
}
