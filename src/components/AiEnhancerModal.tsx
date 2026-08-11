import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import {
  Sparkles,
  Wand2,
  BookOpen,
  Layers,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  FileText,
  Globe,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Code,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { DocumentData } from '../types';
import { exportPdfFromRef } from '../utils/pdfExport';
import { parseTextIntoDocument } from '../utils/textCleaner';

interface AiEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText?: string;
  docTitle?: string;
  currentDoc?: DocumentData;
  pdfRef?: React.RefObject<HTMLDivElement | null>;
  onEnhancedResult?: (
    enhancedData: DocumentData,
    options?: {
      topicTitle?: string;
      docType?: string;
      styleVibe?: string;
      authorName?: string;
      customPrompt?: string;
    }
  ) => void;
  onApplyEnhancedDoc?: (
    enhancedData: DocumentData,
    options?: {
      topicTitle?: string;
      docType?: string;
      styleVibe?: string;
      authorName?: string;
      customPrompt?: string;
    }
  ) => void;
}

const TARGET_DIGITAL_PRODUCT_FORMATS = [
  'Ebook / Immersive Digital Guide',
  'Interactive Masterclass Workbook',
  'High-Ticket Executive Whitepaper',
  'Step-by-Step Strategic Blueprint',
  'VIP Cheat Sheet & Action Playbook',
  'Case Study Compendium & Analysis',
  'SaaS Onboarding & User Operating Manual',
  'Lead Magnet High-Conversion Playbook',
  'Daily Habit & Life Transformation Tracker',
  'Course Companion & Student Field Guide',
  'Investor Pitch Deck & Fundraiser Ebook',
  'AI Prompt Engineering Library & Vault',
  'Gourmet Recipe & Culinary Master Book',
  'Fitness & High-Performance Workout Plan',
  'Technical API & Developer Architecture Guide',
  'Curated Travel & Destination City Guide',
  'Annual Business Performance & Impact Report',
  'Architecture & Spatial Design Lookbook',
  'Brand Identity & Visual Style Guidelines',
  'Poetry & Literary Anthology Chapbook',
  'Flashcard Quizbook & Mastery Exam Guide',
  'Notion & Productivity System Companion',
  'Creator Monetization & Gumroad Launchbook',
  'Real Estate Investment & Property Portfolio',
  'Consulting Diagnostic & Strategy Matrix',
  'Podcast Show Notes & Interview Compendium',
  'Mindfulness, Gratitude & Reflection Journal',
  'Financial Freedom & Wealth Budget Planner',
  'Event Program, Agenda & Conference Guide',
  'Productivity Operating System Playbook',
  'Sales Objection Handling & Closing Scripts',
  'Legal Compliance & Corporate Policy Digest'
];

const PUBLISHING_VIBES_AND_STYLES = [
  'Luxury Noir (Obsidian Canvas & Metallic Gold Foil)',
  'Minimalist Editorial (Classic Vogue B&W Typography)',
  'Silicon Valley Executive Tech (Navy & Electric Cyan)',
  'Harvard Academic Press (Scholarly Navy & Crimson)',
  'Creator Gumroad & Etsy Pastel (Vibrant High-Energy)',
  'Botanical Wellness (Sage Green, Sand & Warm Beige)',
  'Cyberpunk Monospace (Electric Lime & Matrix Black)',
  'Vintage Renaissance (Classic Serif & Aged Sepia Vellum)',
  'Warm Humanist (Garfield Ivory, Amber & Charcoal)',
  'Bold Neo-Brutalist (High-Contrast & Thick Grid Lines)',
  'Financial Times Corporate (Salmon Pink & Midnight Navy)',
  'Zen Japanese Wabi-Sabi (Earthy Tones & Spatial Peace)',
  'Swiss International Typographic (Grid Precision & Clean Red)',
  'Retro Typewriter 1970s (Monospaced Ink on Kraft Paper)',
  'Noir Cinematic (Deep Mood Shadow & Crimson Flare)',
  'Organic Terracotta (Warm Clay, Rust & Burnt Orange)',
  'Industrial Monospace (Architectural Blueprint)',
  'Royal Crown Gold (Deep Imperial Purple & Brass Foil)',
  'Ethereal Ambient (Soft Pastel Gradients & Frosted Glass)',
  'Scandinavian Clean (Light Pine, Ice Blue & Minimalist)',
  'Monocle Magazine Lifestyle (Sophisticated Neutral)',
  'High-Status Wealth (Emerald Velvet & Brushed Brass)',
  'Gothic Dark Mystery (Midnight Slate & Silver Trim)',
  'Playful Pop Candy (Vibrant Yellow & Bubblegum Pink)',
  'Substack Newsletter Gazette (Broadsheet Newsprint)',
  'Risograph Printshop (Grainy Duotone Ink)',
  'Cozy Coffee Shop Vellum (Warm Latte & Espresso)',
  'SaaS Modern Soft UI (Clean Slate & Violet Accent)',
  'Art Deco Gatsby (Geometric Lines & Brushed Copper)',
  'Pacific Northwest Pine (Forest Green & Birch White)',
  'Metropolitan Newspaper (Traditional Column Layout)',
  'Minimalist Zen Dot Grid (Clean Ivory & Charcoal)'
];

export const AiEnhancerModal: React.FC<AiEnhancerModalProps> = ({
  isOpen,
  onClose,
  rawText,
  docTitle,
  currentDoc,
  pdfRef,
  onEnhancedResult,
  onApplyEnhancedDoc
}) => {
  const resultCallback = onEnhancedResult || onApplyEnhancedDoc;
  const [docType, setDocType] = useState(TARGET_DIGITAL_PRODUCT_FORMATS[0]);
  const [styleVibe, setStyleVibe] = useState(PUBLISHING_VIBES_AND_STYLES[0]);
  const [topicTitle, setTopicTitle] = useState(docTitle || currentDoc?.title || '');
  const [searchFormat, setSearchFormat] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [gdocLink, setGdocLink] = useState('');
  const [workingText, setWorkingText] = useState(rawText || '');
  const [showRawText, setShowRawText] = useState(false);

  // Execution & Export State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [generatedDocTitle, setGeneratedDocTitle] = useState('');
  const [isDownloadingPdfNow, setIsDownloadingPdfNow] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setWorkingText(rawText || '');
      setTopicTitle(docTitle || currentDoc?.title || '');
      setErrorMsg(null);
      setLoadingStatus('');
      setIsSuccessState(false);
    }
  }, [isOpen, rawText, docTitle, currentDoc]);

  if (!isOpen) return null;

  // Instant AI Generation & PDF Preview Workflow
  const handleRunAiEnhance = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    let textToEnhance = workingText.trim() || rawText.trim();
    let fetchedTitle = topicTitle.trim() || docTitle || 'Digital Publication';

    try {
      // Step 1: If Google Doc or Drive link provided, import content
      if (gdocLink.trim().length > 0) {
        setLoadingStatus('Extracting link content...');
        const importRes = await apiFetch('/api/docs/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docUrlOrId: gdocLink.trim() })
        });

        const importData = await importRes.json();
        if (!importRes.ok || !importData.success || !importData.doc) {
          setShowRawText(true);
          throw new Error(
            importData.error ||
              'Unable to fetch content from the provided link. Ensure link sharing is enabled or paste raw text.'
          );
        }

        textToEnhance = importData.doc.fullText || textToEnhance;
        if (importData.doc.title && !topicTitle.trim()) {
          fetchedTitle = importData.doc.title;
        }
      }

      if (!textToEnhance || textToEnhance.length < 5) {
        throw new Error(
          'Please enter a Google Drive / Google Doc link or paste document content to generate.'
        );
      }

      // Step 2: INSTANT DISPLAY - Immediately generate structured PDF document in 0ms & pop up mockup
      const instantDoc = parseTextIntoDocument(textToEnhance, fetchedTitle);
      if (resultCallback) {
        resultCallback(instantDoc, {
          topicTitle: fetchedTitle,
          docType,
          styleVibe,
          authorName,
          customPrompt
        });
      }

      // Instantly close modal so user sees the PDF mock-up right away!
      onClose();

      // Step 3: Background Gemini AI polish (non-blocking)
      apiFetch('/api/ai/enhance-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: textToEnhance,
          title: fetchedTitle,
          documentType: docType,
          themeStyle: styleVibe,
          author: authorName,
          instructions: customPrompt
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.data && resultCallback) {
            resultCallback(data.data, {
              topicTitle: fetchedTitle,
              docType,
              styleVibe,
              authorName,
              customPrompt
            });
          }
        })
        .catch((err) => console.warn('Background AI polish notice:', err));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'AI Generation encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Re-download PDF directly
  const handleReDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setIsDownloadingPdfNow(true);
    setDownloadProgress(10);
    try {
      await exportPdfFromRef(pdfRef, generatedDocTitle || 'DocCraft-Publication', (progress) => {
        setDownloadProgress(progress);
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to download PDF file.');
    } finally {
      setIsDownloadingPdfNow(false);
      setDownloadProgress(0);
    }
  };

  // Native Print
  const handlePrintToPdf = () => {
    window.print();
  };

  // HTML Export
  const handleDownloadHtml = () => {
    if (!pdfRef.current) return;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${generatedDocTitle || 'DocCraft Publication'}</title>
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
    a.download = `${(generatedDocTitle || 'DocCraft').toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="ai-enhancer-modal" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Publishing Studio Generator</h3>
              <p className="text-xs text-amber-300">Convert Google Drive/Docs & Prompts into Genius PDF Publications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccessState ? (
          /* SUCCESS SCREEN: PDF AUTOMATICALLY CREATED AND DOWNLOADED */
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950">
            <div className="text-center space-y-3 p-6 bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-teal-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-white">
                  PDF Publication Successfully Generated & Downloaded!
                </h4>
                <p className="text-xs text-purple-200">
                  "<span className="font-semibold text-amber-300">{generatedDocTitle}</span>" is saved to your computer.
                </p>
              </div>
            </div>

            {/* Quick Actions inside AI Studio */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-300">AI Publishing Studio Actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleReDownloadPdf}
                  disabled={isDownloadingPdfNow}
                  className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingPdfNow ? `Downloading (${downloadProgress}%)...` : 'Download PDF Again (.pdf)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintToPdf}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-all"
                >
                  <Printer className="w-4 h-4 text-purple-400" />
                  <span>Browser Print Dialog</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-all"
                >
                  <Code className="w-4 h-4 text-teal-400" />
                  <span>Export HTML Template</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-3 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 border border-purple-500/40 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Live Workspace Canvas</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setIsSuccessState(false)}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Another Genius PDF with AI</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM SCREEN: AI GENERATOR CONFIGURATION */
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {errorMsg && (
              <div className="p-3.5 bg-rose-950/70 border border-rose-800/90 rounded-xl text-rose-200 text-xs space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{errorMsg}</p>
                    {errorMsg.includes('restricted') && (
                      <div className="mt-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="font-bold text-amber-300">How to fix Google Drive link access:</p>
                        <p>1. Open document in Google Docs or Drive.</p>
                        <p>2. Click <span className="font-semibold text-white">Share</span> at top right &rarr; under General access select <span className="font-semibold text-white">Anyone with link</span>.</p>
                        <p>3. Or paste document text directly into the raw text box below!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Topic / Publication Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Publication Topic / Subject</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional Title Override</span>
              </label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Masterclass Monetization Strategy for Digital Creators"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            {/* Google Drive / Google Document Link Input (Main Input) */}
            <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                  <LinkIcon className="w-4 h-4 text-amber-400" />
                  <span>Insert Google Drive or Google Document Link</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setGdocLink('https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
                    setTopicTitle('Creator Digital Publishing Masterclass Guide');
                  }}
                  className="text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold transition-all"
                >
                  ⚡ Try Sample Link
                </button>
              </div>

              <div className="relative">
                <input
                  type="url"
                  value={gdocLink}
                  onChange={(e) => setGdocLink(e.target.value)}
                  placeholder="Paste Google Doc or Drive link (e.g. https://docs.google.com/document/d/123...)"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all pr-8"
                />
                {gdocLink && (
                  <button
                    type="button"
                    onClick={() => setGdocLink('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Insert your Google Drive share link or Google Doc URL. The AI Publishing Studio generator will extract, synthesize, and compile it into a PDF publication file instantly!
              </p>

              {/* Collapsible raw text editor option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
                >
                  <span>{showRawText ? 'Hide manual text override' : 'Or view/paste raw text manually'}</span>
                  {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showRawText && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Manual Document Source Text:</span>
                      <span>{workingText.length.toLocaleString()} characters</span>
                    </div>
                    <textarea
                      rows={4}
                      value={workingText}
                      onChange={(e) => setWorkingText(e.target.value)}
                      placeholder="Paste or edit raw text content directly..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono resize-y"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Target Product Format */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Target Digital Product Format ({TARGET_DIGITAL_PRODUCT_FORMATS.length} Formats)
                </label>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Tailored AI Engine Active
                </span>
              </div>

              <input
                type="text"
                value={searchFormat}
                onChange={(e) => setSearchFormat(e.target.value)}
                placeholder="Search formats (e.g. Masterclass, Whitepaper, Prompt Library)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />

              <div className="max-h-40 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800/80 bg-slate-950 p-2">
                {TARGET_DIGITAL_PRODUCT_FORMATS
                  .filter(fmt => fmt.toLowerCase().includes(searchFormat.toLowerCase()))
                  .map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setDocType(fmt)}
                      className={`p-2 rounded-lg border text-[11px] text-left transition-all ${
                        docType === fmt
                          ? 'bg-purple-950/90 border-purple-400 text-purple-200 font-bold ring-1 ring-purple-400/50 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="line-clamp-2">{fmt}</div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Aesthetic Vibe */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Publishing Vibe & Styling ({PUBLISHING_VIBES_AND_STYLES.length} Styles)
              </label>
              <select
                value={styleVibe}
                onChange={(e) => setStyleVibe(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {PUBLISHING_VIBES_AND_STYLES.map((vibe) => (
                  <option key={vibe} value={vibe}>
                    {vibe}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Author / Studio Brand Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Alex Vance | Studio Publishing"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Custom AI Directives / Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Custom AI Directives / Special Instructions</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Focus heavily on actionable 5-minute wins, include a worksheet exercise in Chapter 2..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-y"
              />
            </div>
          </div>
        )}

        {/* Modal Footer (Form Mode) */}
        {!isSuccessState && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRunAiEnhance}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span className="text-white">{loadingStatus || 'Generating Genius PDF File...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Run AI Publishing Studio & Create PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
