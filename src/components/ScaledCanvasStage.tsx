import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Columns, Maximize2, Sparkles, BookOpen, Smartphone, Monitor, Tablet, Wifi, Battery, Signal, Eye } from 'lucide-react';
import { DocumentData, StudioSettings, PageSize, DEFAULT_STUDIO_SETTINGS } from '../types';
import { PdfCanvas } from './PdfCanvas';
import { Studio3DBackground } from './Studio3DBackground';

interface ScaledCanvasStageProps {
  document: DocumentData;
  settings?: StudioSettings;
  pdfRef: React.RefObject<HTMLDivElement | null>;
  isSplitScreen?: boolean;
  onToggleSplitScreen?: () => void;
  className?: string;
  autoFitDefault?: boolean;
  initialDeviceMode?: 'desktop' | 'mobile' | 'tablet';
}

export const getPageDimensionsPx = (pageSize?: PageSize): { width: number; height: number } => {
  switch (pageSize) {
    case 'a4': return { width: 794, height: 1122 };
    case 'a5': return { width: 559, height: 794 };
    case 'a6': return { width: 397, height: 559 };
    case 'square': return { width: 768, height: 768 };
    case 'square-large': return { width: 960, height: 960 };
    case 'executive': return { width: 696, height: 1008 };
    case 'legal': return { width: 816, height: 1344 };
    case 'trade-6x9': return { width: 576, height: 864 };
    case 'digest-5.5x8.5': return { width: 528, height: 816 };
    case 'royal-6.14x9.21': return { width: 589, height: 884 };
    case 'b5': return { width: 665, height: 945 };
    case 'mobile-9x16': return { width: 480, height: 853 };
    case 'pocket-4x6': return { width: 384, height: 576 };
    case 'letter':
    default: return { width: 816, height: 1056 };
  }
};

export const ScaledCanvasStage: React.FC<ScaledCanvasStageProps> = ({
  document,
  settings: rawSettings,
  pdfRef,
  isSplitScreen = true,
  onToggleSplitScreen,
  className = '',
  autoFitDefault = true,
  initialDeviceMode = 'desktop'
}) => {
  const settings = { ...DEFAULT_STUDIO_SETTINGS, ...(rawSettings || {}) };
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile' | 'tablet'>(initialDeviceMode);
  const [zoomMode, setZoomMode] = useState<'fit-page' | 'fit-width' | 'custom'>(
    autoFitDefault ? 'fit-page' : 'fit-page'
  );
  const [customZoom, setCustomZoom] = useState<number>(0.75);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 700
  });

  const { width: pageWidth, height: pageHeight } = getPageDimensionsPx(settings.pageSize);

  // Monitor container size dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 700
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });

    observer.observe(containerRef.current);
    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Compute effective scale factor based on view device mode
  const computeScale = (): number => {
    const paddingX = deviceMode === 'mobile' ? 24 : deviceMode === 'tablet' ? 32 : 40;
    const paddingY = deviceMode === 'mobile' ? 30 : deviceMode === 'tablet' ? 40 : 50;
    const availW = Math.max(200, containerSize.width - paddingX);
    const availH = Math.max(200, containerSize.height - paddingY);

    if (deviceMode === 'mobile') {
      // Scale document to fit inside the ~355px wide mobile phone display screen
      const mobileScreenWidth = 355;
      return Math.max(0.28, Math.min(0.65, mobileScreenWidth / pageWidth));
    }

    if (deviceMode === 'tablet') {
      // Scale document to fit inside the ~540px wide tablet display screen
      const tabletScreenWidth = 540;
      return Math.max(0.35, Math.min(0.85, tabletScreenWidth / pageWidth));
    }

    if (zoomMode === 'fit-page') {
      const scaleX = availW / pageWidth;
      const scaleY = availH / pageHeight;
      const fitScale = Math.min(scaleX, scaleY);
      return Math.max(0.35, Math.min(1.2, fitScale));
    }

    if (zoomMode === 'fit-width') {
      const fitWScale = availW / pageWidth;
      return Math.max(0.35, Math.min(1.4, fitWScale));
    }

    return Math.max(0.35, Math.min(1.5, customZoom));
  };

  const effectiveScale = computeScale();

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-210px)] min-h-[660px] max-h-[880px] w-full overflow-hidden bg-surface-0 border border-white/10/80 rounded-3xl shadow-2xl ${className}`}>
      {/* Control Toolbar Header */}
      <div className="px-3 py-2 bg-surface-1/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10 backdrop-blur-md">
        {/* Device Viewport Mode Selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-surface-0 border border-white/10 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                deviceMode === 'desktop'
                  ? 'bg-accent-amber-500 text-slate-950 shadow-sm'
                  : 'text-ink-muted hover:text-slate-200 hover:bg-surface-2'
              }`}
              title="Desktop Print/PDF Document View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                deviceMode === 'mobile'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-950/40 ring-1 ring-amber-300'
                  : 'text-ink-muted hover:text-slate-200 hover:bg-surface-2'
              }`}
              title="Mobile Smartphone Live Preview (iPhone / Android)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode('tablet')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                deviceMode === 'tablet'
                  ? 'bg-accent-amber-500 text-slate-950 shadow-sm'
                  : 'text-ink-muted hover:text-slate-200 hover:bg-surface-2'
              }`}
              title="Tablet E-Reader View"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-[10px] bg-accent-amber-500/10 text-accent-amber-300 border border-amber-500/30 px-2 py-1 rounded-full font-bold">
            <span>{deviceMode === 'mobile' ? 'Mobile Phone Preview' : deviceMode === 'tablet' ? 'Tablet Reader' : 'Full Page View'}</span>
            <span className="opacity-60">•</span>
            <span>{Math.round(effectiveScale * 100)}%</span>
          </div>
        </div>

        {/* Zoom & View Options */}
        <div className="flex items-center space-x-2">
          {deviceMode === 'desktop' && (
            <div className="flex items-center space-x-1 bg-surface-0 border border-white/10 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => {
                  setZoomMode('custom');
                  setCustomZoom((z) => Math.max(0.35, z - 0.1));
                }}
                className="p-1 hover:bg-surface-2 rounded-lg text-ink-secondary hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoomMode('fit-page')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                  zoomMode === 'fit-page'
                    ? 'bg-accent-amber-500 text-slate-950 shadow-sm'
                    : 'text-ink-muted hover:text-slate-200 hover:bg-surface-2'
                }`}
                title="Scale entire page to fit inside view"
              >
                Fit Page
              </button>

              <button
                type="button"
                onClick={() => setZoomMode('fit-width')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                  zoomMode === 'fit-width'
                    ? 'bg-accent-amber-500 text-slate-950 shadow-sm'
                    : 'text-ink-muted hover:text-slate-200 hover:bg-surface-2'
                }`}
                title="Scale width to fill view width"
              >
                Fit Width
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoomMode('custom');
                  setCustomZoom(1.0);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                  zoomMode === 'custom' && customZoom === 1.0
                    ? 'bg-accent-amber-500 text-slate-950 shadow-sm'
                    : 'text-ink-muted hover:text-slate-200 hover:bg-surface-2'
                }`}
                title="100% Actual Size"
              >
                100%
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoomMode('custom');
                  setCustomZoom((z) => Math.min(1.5, z + 0.1));
                }}
                className="p-1 hover:bg-surface-2 rounded-lg text-ink-secondary hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {onToggleSplitScreen && (
            <button
              type="button"
              onClick={onToggleSplitScreen}
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
                isSplitScreen
                  ? 'bg-accent-amber-500/20 text-accent-amber-300 border-amber-400/50'
                  : 'bg-surface-2 text-ink-muted border-white/15 hover:text-slate-200'
              }`}
              title="Toggle Side-by-Side Split View"
            >
              <Columns className="w-3.5 h-3.5 text-accent-amber-400" />
              <span className="hidden sm:inline">Split Screen</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scaled Canvas Stage Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-y-auto overflow-x-auto p-2 sm:p-4 flex justify-center items-start bg-surface-0 relative z-0"
      >
        {/* Dynamic 3D Studio Background Effect */}
        <Studio3DBackground />

        {deviceMode === 'mobile' ? (
          /* Real-time Smartphone Live Preview Mockup Frame */
          <div className="flex flex-col items-center my-2 space-y-3">
            <div className="text-center flex items-center space-x-2 bg-surface-1/80 px-3 py-1 rounded-full border border-white/10 text-xs text-ink-secondary">
              <Eye className="w-3.5 h-3.5 text-accent-amber-400 animate-pulse" />
              <span className="font-semibold text-[11px]">Smartphone Live Reader View</span>
              <span className="text-[10px] text-ink-muted">(Scroll inside screen)</span>
            </div>

            {/* Smartphone Device Shell */}
            <div className="w-[375px] h-[720px] bg-surface-1 border-[8px] border-white/10 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative flex flex-col overflow-hidden ring-1 ring-slate-700/50">
              {/* Top Speaker / Dynamic Island Notch */}
              <div className="bg-surface-1 pt-2 pb-1 px-6 flex items-center justify-between z-30 shrink-0 text-white select-none">
                <span className="text-[11px] font-extrabold tracking-tight pl-2">9:41</span>
                <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-surface-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-900/60" />
                </div>
                <div className="flex items-center space-x-1 pr-2 text-ink-secondary">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                </div>
              </div>

              {/* Scrollable Mobile Phone Screen Body */}
              <div className="flex-1 bg-surface-0 overflow-y-auto overflow-x-hidden relative p-2 flex justify-center items-start scrollbar-thin scrollbar-thumb-amber-500/40">
                <div
                  style={{
                    width: `${Math.round(pageWidth * effectiveScale)}px`,
                    transition: 'width 0.15s ease-out'
                  }}
                  className="relative shadow-xl rounded-lg mx-auto"
                >
                  <div
                    style={{
                      width: `${pageWidth}px`,
                      transform: `scale(${effectiveScale})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <PdfCanvas document={document} settings={settings} pdfRef={pdfRef} />
                  </div>
                </div>
              </div>

              {/* Bottom Mobile Home Bar Indicator */}
              <div className="bg-surface-1 py-1.5 flex justify-center shrink-0 z-30">
                <div className="w-28 h-1 bg-slate-500/80 rounded-full" />
              </div>
            </div>
          </div>
        ) : deviceMode === 'tablet' ? (
          /* Tablet E-Reader Viewport */
          <div className="flex flex-col items-center my-2 space-y-3">
            <div className="text-center flex items-center space-x-2 bg-surface-1/80 px-3 py-1 rounded-full border border-white/10 text-xs text-ink-secondary">
              <Tablet className="w-3.5 h-3.5 text-accent-amber-400" />
              <span className="font-semibold text-[11px]">Tablet & E-Reader Live View</span>
            </div>

            <div className="w-[560px] min-h-[750px] bg-surface-1 border-[10px] border-white/10 rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-slate-700/50 p-3">
              <div className="w-2 h-2 bg-slate-700 rounded-full mx-auto mb-2 shrink-0" />
              <div className="flex-1 bg-surface-0 rounded-2xl overflow-y-auto overflow-x-hidden p-2 flex justify-center items-start">
                <div
                  style={{
                    width: `${Math.round(pageWidth * effectiveScale)}px`,
                    transition: 'width 0.15s ease-out'
                  }}
                  className="relative shadow-xl rounded-lg mx-auto"
                >
                  <div
                    style={{
                      width: `${pageWidth}px`,
                      transform: `scale(${effectiveScale})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <PdfCanvas document={document} settings={settings} pdfRef={pdfRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Document Page Stage */
          <div
            style={{
              width: `${Math.round(pageWidth * effectiveScale)}px`,
              transition: 'width 0.15s ease-out'
            }}
            className="relative shadow-2xl rounded-xl mx-auto my-1"
          >
            <div
              style={{
                width: `${pageWidth}px`,
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left'
              }}
            >
              <PdfCanvas document={document} settings={settings} pdfRef={pdfRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
