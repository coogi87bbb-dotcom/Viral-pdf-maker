import React from 'react';
import { FileText, Sparkles, Download, Layout, ShoppingBag, CheckCircle, Columns } from 'lucide-react';

interface HeaderProps {
  onOpenImporter: () => void;
  onOpenAiEnhancer: () => void;
  onOpenMockupModal: () => void;
  onExportPdf: () => void;
  activeTab: 'canvas' | 'mockup';
  setActiveTab: (tab: 'canvas' | 'mockup') => void;
  isAiLoading: boolean;
  docTitle: string;
  isSplitScreen: boolean;
  onToggleSplitScreen: () => void;
}

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0';

export const Header: React.FC<HeaderProps> = ({
  onOpenImporter,
  onOpenAiEnhancer,
  onOpenMockupModal,
  onExportPdf,
  activeTab,
  setActiveTab,
  isAiLoading,
  docTitle,
  isSplitScreen,
  onToggleSplitScreen
}) => {
  return (
    <header id="app-header" className="bg-surface-1/80 backdrop-blur-[20px] backdrop-saturate-150 border-b border-white/10 text-ink-primary sticky top-0 z-30 shadow-[var(--shadow-elevated)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Document Name */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-rosegold-500 via-accent-rosegold-400 to-slate-200 p-0.5 flex items-center justify-center shadow-[var(--shadow-glow-rosegold)]">
            <div className="w-full h-full bg-surface-0 rounded-[10px] flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-rosegold-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-accent-rosegold-300 via-slate-100 to-accent-rosegold-200 bg-clip-text text-transparent tracking-tight">
                DocCraft
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-0 text-accent-rosegold-300 border border-accent-rosegold-500/30 font-semibold font-mono">
                Studio PDF
              </span>
              <span className="hidden md:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-surface-0 text-ink-secondary border border-white/10 font-mono">
                <CheckCircle className="w-3 h-3 mr-1 text-accent-rosegold-400" />
                Drive Synced
              </span>
            </div>
            <p className="text-xs text-ink-muted truncate max-w-[200px] sm:max-w-xs md:max-w-md font-medium">
              {docTitle || 'Untitled Document'}
            </p>
          </div>
        </div>

        {/* Center Tabs: Studio Canvas vs Gumroad / Pinterest Mockup */}
        <div className="flex items-center bg-surface-0 p-1 rounded-xl border border-white/10 space-x-1 shadow-inner">
          <button
            id="tab-canvas-btn"
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-[0.98] ${FOCUS_RING} ${
              activeTab === 'canvas'
                ? 'bg-accent-rosegold-500 text-slate-950 shadow-[var(--shadow-glow-rosegold)]'
                : 'text-ink-muted hover:text-ink-primary hover:bg-surface-2'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>PDF Studio</span>
          </button>
          <button
            id="tab-mockup-btn"
            onClick={() => setActiveTab('mockup')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-[0.98] ${FOCUS_RING} ${
              activeTab === 'mockup'
                ? 'bg-surface-2 text-accent-rosegold-300 border border-accent-rosegold-500/50 shadow-[var(--shadow-elevated)]'
                : 'text-ink-secondary hover:text-white hover:bg-surface-2'
            }`}
            title="Pinterest Pins, 3D Cover Mockups, & Gumroad Sales Copy"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-accent-rosegold-400" />
            <span className="hidden sm:inline">Pinterest & 3D Mockup</span>
            <span className="sm:hidden">Pinterest</span>
            <span className="text-[9px] bg-accent-rosegold-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-tight">
              NEW
            </span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Split Screen View Toggle Button */}
          <button
            id="toggle-split-screen-header-btn"
            onClick={onToggleSplitScreen}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors active:scale-[0.98] ${FOCUS_RING} ${
              isSplitScreen
                ? 'bg-accent-rosegold-500/20 text-accent-rosegold-300 border-accent-rosegold-400/60 shadow-[var(--shadow-elevated)] ring-1 ring-accent-rosegold-400/30'
                : 'bg-surface-1 hover:bg-surface-2 border-white/10 text-ink-secondary'
            }`}
            title="Toggle Side-by-Side Split Screen View"
          >
            <Columns className="w-3.5 h-3.5 text-accent-rosegold-400" />
            <span className="hidden sm:inline">Split View</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isSplitScreen ? 'bg-accent-rosegold-500 text-slate-950' : 'bg-surface-2 text-ink-muted'
              }`}
            >
              {isSplitScreen ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Import Google Doc / Text */}
          <button
            id="import-doc-btn"
            onClick={onOpenImporter}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-1 hover:bg-surface-2 border border-white/10 text-xs text-ink-secondary font-medium transition-colors active:scale-[0.98] ${FOCUS_RING}`}
            title="Import from Google Docs, Google Drive, or plain text"
          >
            <FileText className="w-3.5 h-3.5 text-accent-rosegold-400" />
            <span className="hidden sm:inline">Import Doc</span>
          </button>

          {/* AI Enhancer Button */}
          <button
            id="ai-enhance-btn"
            onClick={onOpenAiEnhancer}
            disabled={isAiLoading}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-1 hover:bg-surface-2 text-accent-rosegold-300 border border-accent-rosegold-500/40 text-xs font-semibold shadow-[var(--shadow-elevated)] transition-colors active:scale-[0.98] disabled:opacity-50 ${FOCUS_RING}`}
            title="AI Format & Professional Restructure with Gemini"
          >
            <Sparkles className={`w-3.5 h-3.5 text-accent-rosegold-400 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">AI Enhancer</span>
          </button>

          {/* Quick Mockup view button for mobile */}
          <button
            id="mobile-mockup-btn"
            onClick={onOpenMockupModal}
            className={`lg:hidden flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface-1 border border-accent-rosegold-500/40 text-accent-rosegold-300 text-xs font-medium active:scale-[0.98] ${FOCUS_RING}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>

          {/* Export PDF */}
          <button
            id="export-pdf-main-btn"
            onClick={onExportPdf}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-accent-rosegold-500 to-accent-rosegold-400 hover:brightness-105 text-slate-950 font-bold text-xs transition-[transform,opacity,filter] active:scale-[0.98] shadow-[var(--shadow-glow-rosegold)] ${FOCUS_RING}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
