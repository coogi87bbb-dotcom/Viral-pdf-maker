import React from 'react';
import { FileText, Sparkles, Download, Palette, Layout, ShoppingBag, CheckCircle, ExternalLink, Columns } from 'lucide-react';

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
    <header id="app-header" className="bg-[#08090e]/80 backdrop-blur-[20px] backdrop-saturate-150 border-b border-slate-800/80 text-slate-100 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Document Name */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-slate-200 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-amber-300 via-slate-100 to-amber-200 bg-clip-text text-transparent tracking-tight">
                DocCraft
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                Studio PDF
              </span>
              <span className="hidden md:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700/60 font-mono">
                <CheckCircle className="w-3 h-3 mr-1 text-amber-400" />
                Drive Synced
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md font-medium">
              {docTitle || 'Untitled Document'}
            </p>
          </div>
        </div>

        {/* Center Tabs: Studio Canvas vs Gumroad / Pinterest Mockup */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1 shadow-inner">
          <button
            id="tab-canvas-btn"
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'canvas'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>PDF Studio</span>
          </button>
          <button
            id="tab-mockup-btn"
            onClick={() => setActiveTab('mockup')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mockup'
                ? 'bg-slate-800 text-amber-300 border border-amber-500/50 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
            title="Pinterest Pins, 3D Cover Mockups, & Gumroad Sales Copy"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Pinterest & 3D Mockup</span>
            <span className="sm:hidden">Pinterest</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-tight">
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isSplitScreen
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-sm shadow-amber-950/40 ring-1 ring-amber-400/30'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title="Toggle Side-by-Side Split Screen View"
          >
            <Columns className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Split View</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isSplitScreen ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isSplitScreen ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Import Google Doc / Text */}
          <button
            id="import-doc-btn"
            onClick={onOpenImporter}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-medium transition-colors"
            title="Import from Google Docs, Google Drive, or plain text"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Import Doc</span>
          </button>

          {/* AI Enhancer Button */}
          <button
            id="ai-enhance-btn"
            onClick={onOpenAiEnhancer}
            disabled={isAiLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-md shadow-amber-500/10 transition-all disabled:opacity-50"
            title="AI Format & Professional Restructure with Gemini"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">AI Enhancer</span>
          </button>

          {/* Quick Mockup view button for mobile */}
          <button
            id="mobile-mockup-btn"
            onClick={onOpenMockupModal}
            className="lg:hidden flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-medium"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>

          {/* Export PDF */}
          <button
            id="export-pdf-main-btn"
            onClick={onExportPdf}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
