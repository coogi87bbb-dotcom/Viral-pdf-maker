import React, { useState } from 'react';
import { Download, Printer, Code, Check, X, FileText, Sparkles, Loader2, ShoppingBag } from 'lucide-react';
import { DocumentData } from '../types';
import { exportPdfFromRef } from '../utils/pdfExport';
import { ModalShell } from './ui/ModalShell';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfRef: React.RefObject<HTMLDivElement | null>;
  document: DocumentData;
  onOpenMockupStudio?: () => void;
}

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber-400';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pdfRef,
  document,
  onOpenMockupStudio
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!isOpen) return null;

  // Render high quality multi-page PDF using jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setIsExportingPdf(true);
    setExportProgress(10);

    try {
      await exportPdfFromRef(pdfRef, document.title, (progress) => {
        setExportProgress(progress);
      });
      onClose();
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert(err.message || 'PDF generation encountered an error. You can also use the "Browser Print-to-PDF" option for instant export.');
    } finally {
      setIsExportingPdf(false);
      setExportProgress(0);
    }
  };

  // Browser Native Print-to-PDF
  const handlePrintToPdf = () => {
    window.print();
    onClose();
  };

  // Download standalone HTML
  const handleDownloadHtml = () => {
    if (!pdfRef.current) return;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 flex flex-col items-center p-8">
  ${pdfRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${(document.title || 'DocCraft').toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    onClose();
  };

  return (
    <ModalShell id="export-pdf-modal" maxWidthClassName="max-w-md">
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-accent-amber-500/20 text-accent-amber-400 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Export Professional PDF</h3>
            <p className="text-[11px] text-ink-muted">High-DPI vector PDF ready for Gumroad & Pinterest</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`text-ink-muted hover:text-white p-1 rounded-lg hover:bg-surface-1 transition-colors ${FOCUS_RING}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Export Options */}
      <div className="p-6 space-y-3">
        {/* High DPI Direct Download */}
        <button
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
          className={`w-full p-4 bg-gradient-to-r from-accent-amber-500 to-accent-amber-400 hover:brightness-105 text-slate-950 rounded-xl font-bold text-xs shadow-[var(--shadow-glow-amber)] flex items-center justify-between transition-[transform,opacity,filter] active:scale-[0.98] group disabled:opacity-50 ${FOCUS_RING}`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-950/20 flex items-center justify-center">
              {isExportingPdf ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              ) : (
                <Download className="w-5 h-5 text-slate-950" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-extrabold">Download PDF File (.pdf)</p>
              <p className="text-[11px] text-slate-800 font-normal">
                {isExportingPdf ? `Rendering Pages (${exportProgress}%)...` : 'High resolution 300 DPI multi-page PDF'}
              </p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
        </button>

        {/* Pinterest Pins & 3D Mockup Generator */}
        {onOpenMockupStudio && (
          <button
            onClick={() => {
              onClose();
              onOpenMockupStudio();
            }}
            disabled={isExportingPdf}
            className={`w-full p-4 bg-gradient-to-r from-surface-1 via-surface-0 to-surface-1 border-2 border-accent-amber-500/40 hover:border-accent-amber-400 rounded-2xl text-ink-secondary text-xs font-semibold flex items-center justify-between transition-colors shadow-[var(--shadow-elevated)] active:translate-y-0.5 cursor-pointer ${FOCUS_RING}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-surface-1 border border-accent-amber-500/50 flex items-center justify-center text-accent-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-bold text-white">Pinterest & 3D Cover Mockups</p>
                  <span className="text-[9px] bg-accent-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                    Social
                  </span>
                </div>
                <p className="text-[11px] text-accent-amber-200/80">Generate Pinterest Pin graphics & Gumroad 3D book covers</p>
              </div>
            </div>
          </button>
        )}

        {/* Browser Native Print / Save as PDF */}
        <button
          onClick={handlePrintToPdf}
          disabled={isExportingPdf}
          className={`w-full p-4 bg-surface-0 border border-white/10 hover:border-white/20 rounded-xl text-ink-secondary text-xs font-semibold flex items-center justify-between transition-colors ${FOCUS_RING}`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-ink-secondary">
              <Printer className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Browser Print-to-PDF</p>
              <p className="text-[11px] text-ink-muted">Instant native PDF dialog with vector text selection</p>
            </div>
          </div>
        </button>

        {/* HTML Package */}
        <button
          onClick={handleDownloadHtml}
          disabled={isExportingPdf}
          className={`w-full p-4 bg-surface-0 border border-white/10 hover:border-white/20 rounded-xl text-ink-secondary text-xs font-semibold flex items-center justify-between transition-colors ${FOCUS_RING}`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-ink-secondary">
              <Code className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Export Web HTML Template</p>
              <p className="text-[11px] text-ink-muted">Download formatted HTML file for web publishing</p>
            </div>
          </div>
        </button>
      </div>
    </ModalShell>
  );
};
