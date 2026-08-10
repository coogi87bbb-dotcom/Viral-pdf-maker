import React from 'react';
import { UploadCloud, Palette, Download, Sparkles, ShoppingBag, Edit3, Columns } from 'lucide-react';

interface GuidedStepperProps {
  onOpenImporter: () => void;
  onOpenAiEnhancer: () => void;
  onOpenEditor: () => void;
  onOpenExportModal: () => void;
  activeTab: 'canvas' | 'mockup';
  setActiveTab: (tab: 'canvas' | 'mockup') => void;
  currentThemeName: string;
  isSplitScreen?: boolean;
  onToggleSplitScreen?: () => void;
}

export const GuidedStepper: React.FC<GuidedStepperProps> = ({
  onOpenImporter,
  onOpenAiEnhancer,
  onOpenEditor,
  onOpenExportModal,
  activeTab,
  setActiveTab,
  currentThemeName,
  isSplitScreen = true,
  onToggleSplitScreen
}) => {
  return (
    <div id="guided-stepper-bar" className="bg-[#08090e]/75 backdrop-blur-[20px] backdrop-saturate-150 border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Step Indicator Badges */}
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          
          {/* Step 1 */}
          <button
            onClick={onOpenImporter}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all shrink-0 group"
          >
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center border border-amber-500/30">
              1
            </span>
            <div className="text-left">
              <span className="font-bold text-white group-hover:text-amber-300 block leading-none text-[11px]">
                Import Document
              </span>
              <span className="text-[10px] text-slate-400">Google Doc / .docx</span>
            </div>
          </button>

          <span className="text-slate-600 text-xs shrink-0">➔</span>

          {/* Step 2 */}
          <button
            onClick={onOpenAiEnhancer}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all shrink-0 group"
          >
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center border border-amber-500/30">
              2
            </span>
            <div className="text-left">
              <span className="font-bold text-white group-hover:text-amber-300 block leading-none text-[11px]">
                Style & AI Polish
              </span>
              <span className="text-[10px] text-amber-300 font-medium">{currentThemeName}</span>
            </div>
          </button>

          <span className="text-slate-600 text-xs shrink-0">➔</span>

          {/* Step 3 */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all shrink-0 group"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center border border-emerald-500/30">
              3
            </span>
            <div className="text-left">
              <span className="font-bold text-white group-hover:text-emerald-300 block leading-none text-[11px]">
                Export & Sell
              </span>
              <span className="text-[10px] text-slate-400">PDF / 3D Mockup</span>
            </div>
          </button>
        </div>

        {/* Right Side Quick Action Utilities */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {onToggleSplitScreen && (
            <button
              type="button"
              onClick={onToggleSplitScreen}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isSplitScreen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Toggle Side-by-Side Split Screen Editor & Preview"
            >
              <Columns className="w-3.5 h-3.5 text-amber-400" />
              <span>Split View ({isSplitScreen ? 'ON' : 'OFF'})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('mockup')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mockup'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300'
            }`}
            title="Generate Pinterest Pins, Gumroad Product Graphics & Copy"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Pinterest Studio</span>
          </button>

          <button
            onClick={onOpenEditor}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
            title="Edit document text, chapters, and titles directly"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Quick Edit Content</span>
          </button>

          <button
            onClick={onOpenAiEnhancer}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
            title="AI Polish with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Magic Format</span>
          </button>
        </div>

      </div>
    </div>
  );
};
