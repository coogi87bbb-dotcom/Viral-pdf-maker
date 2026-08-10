import React, { useState } from 'react';
import { Download, Printer, Code, Check, X, FileText, Sparkles, Loader2, ShoppingBag } from 'lucide-react';
import { DocumentData } from '../types';
import { exportPdfFromRef } from '../utils/pdfExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfRef: React.RefObject<HTMLDivElement | null>;
  document: DocumentData;
  onOpenMockupStudio?: () => void;
}

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="export-pdf-modal" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Export Professional PDF</h3>
              <p className="text-[11px] text-slate-400">High-DPI vector PDF ready for Gumroad & Pinterest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
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
            className="w-full p-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl font-bold text-xs shadow-lg flex items-center justify-between transition-all group disabled:opacity-50"
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
              className="w-full p-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl text-slate-200 text-xs font-semibold flex items-center justify-between transition-all shadow-[0_6px_20px_rgba(0,0,0,0.5)] active:translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-bold text-white">Pinterest & 3D Cover Mockups</p>
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                      Social
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">Generate Pinterest Pin graphics & Gumroad 3D book covers</p>
                </div>
              </div>
            </button>
          )}

          {/* Browser Native Print / Save as PDF */}
          <button
            onClick={handlePrintToPdf}
            disabled={isExportingPdf}
            className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <Printer className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Browser Print-to-PDF</p>
                <p className="text-[11px] text-slate-400">Instant native PDF dialog with vector text selection</p>
              </div>
            </div>
          </button>

          {/* HTML Package */}
          <button
            onClick={handleDownloadHtml}
            disabled={isExportingPdf}
            className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <Code className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Export Web HTML Template</p>
                <p className="text-[11px] text-slate-400">Download formatted HTML file for web publishing</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
