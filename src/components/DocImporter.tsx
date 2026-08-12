import React, { useState, useRef } from 'react';
import { apiFetch } from '../lib/apiClient';
import { FileText, Link as LinkIcon, Sparkles, AlertCircle, Check, X, BookOpen, UploadCloud, FileUp, Info, HelpCircle, ArrowRight } from 'lucide-react';
import mammoth from 'mammoth';
import { DocumentData } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';
import { ModalShell } from './ui/ModalShell';

interface DocImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDocument: (doc: DocumentData, rawText?: string) => void;
  onImportRawText: (text: string, title?: string) => void;
  onImportAndEnhance?: (text: string, title?: string) => void;
}

export const DocImporter: React.FC<DocImporterProps> = ({
  isOpen,
  onClose,
  onImportDocument,
  onImportRawText,
  onImportAndEnhance
}) => {
  const [tab, setTab] = useState<'file' | 'url' | 'paste' | 'samples'>('file');
  const [docUrl, setDocUrl] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [docTitleInput, setDocTitleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [autoEnhanceOnUpload, setAutoEnhanceOnUpload] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processImportedText = (text: string, title?: string) => {
    if (autoEnhanceOnUpload && onImportAndEnhance) {
      onImportAndEnhance(text, title);
    } else {
      onImportRawText(text, title);
    }
    onClose();
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const ext = file.name.split('.').pop()?.toLowerCase();

      // 1. Check for Google Doc pointer file (.gdoc) or JSON containing Google Doc link
      if (ext === 'gdoc' || file.name.endsWith('.gdoc')) {
        try {
          const content = await file.text();
          let targetUrl = '';
          try {
            const parsed = JSON.parse(content);
            targetUrl = parsed.url || parsed.doc_id || '';
          } catch {
            const match = content.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
            if (match) targetUrl = match[0];
          }

          if (targetUrl) {
            setDocUrl(targetUrl);
            const res = await apiFetch('/api/docs/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ docUrlOrId: targetUrl })
            });
            const data = await res.json();
            if (res.ok && data.success && data.doc) {
              processImportedText(data.doc.fullText, data.doc.title || fileName);
              return;
            }
          }
        } catch (gErr) {
          console.warn('Gdoc shortcut parse warning:', gErr);
        }
      }

      // 2. If docx, try client-side mammoth first
      if (ext === 'docx') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          if (text && text.trim().length > 10) {
            processImportedText(text, fileName);
            return;
          }
        } catch (mErr) {
          console.warn('Mammoth client extraction notice:', mErr);
        }
      }

      // 2. If structured JSON document
      if (ext === 'json') {
        const text = await file.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed.title && parsed.sections) {
            onImportDocument(parsed as DocumentData, text);
            if (autoEnhanceOnUpload && onImportAndEnhance) {
              onImportAndEnhance(text, parsed.title);
            }
            onClose();
            return;
          }
        } catch {
          // fallback to general parser
        }
      }

      // 3. For plain text & markdown files
      if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
        const text = await file.text();
        if (text && text.trim().length > 0) {
          processImportedText(text, fileName);
          return;
        }
      }

      // 4. For PDF, DOC (legacy Word), RTF, HTML, or any complex file:
      // Convert to Base64 and send to server Gemini parser endpoint
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      const response = await apiFetch('/api/docs/parse-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64Data
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.text) {
        throw new Error(data.error || 'Unable to extract document text from file.');
      }

      processImportedText(data.text, data.title || fileName);
    } catch (err: any) {
      console.error('File import error:', err);
      setErrorMsg(err.message || 'Unable to parse file. Try pasting document text directly in the Paste Text tab.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFetchGoogleDoc = async () => {
    if (!docUrl.trim()) {
      setErrorMsg('Please enter a Google Doc URL or ID.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch('/api/docs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docUrlOrId: docUrl })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch Google Doc.');
      }

      const parsed = data.doc;
      processImportedText(parsed.fullText, parsed.title);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to load Google Doc. Ensure link sharing is enabled or paste the content directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPastedText = () => {
    if (!rawTextInput.trim()) {
      setErrorMsg('Please paste some text content.');
      return;
    }
    processImportedText(rawTextInput, docTitleInput || 'Imported Text Document');
  };

  return (
    <ModalShell id="doc-importer-modal" maxWidthClassName="max-w-2xl" scrollable>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-rosegold-500/20 flex items-center justify-between bg-surface-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-accent-rosegold-500/20 text-accent-rosegold-400 border border-rosegold-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Document into PDF Converter</h3>
              <p className="text-xs text-accent-rosegold-300">Upload Word (.docx), Google Doc link, text file, or pre-loaded samples</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-white p-1 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-white/10 bg-surface-0 px-6 space-x-4 overflow-x-auto">
          <button
            onClick={() => { setTab('file'); setErrorMsg(null); }}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              tab === 'file' ? 'border-accent-rosegold-400 text-accent-rosegold-300' : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File (.docx / .txt / .md)</span>
          </button>
          <button
            onClick={() => { setTab('url'); setErrorMsg(null); }}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              tab === 'url' ? 'border-accent-rosegold-400 text-accent-rosegold-300' : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Google Doc URL</span>
          </button>
          <button
            onClick={() => { setTab('paste'); setErrorMsg(null); }}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              tab === 'paste' ? 'border-accent-rosegold-400 text-accent-rosegold-300' : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Paste Text / Markdown</span>
          </button>
          <button
            onClick={() => { setTab('samples'); setErrorMsg(null); }}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              tab === 'samples' ? 'border-accent-rosegold-400 text-accent-rosegold-300' : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Try Samples</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs space-y-1.5">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Import Issue</p>
                  <p>{errorMsg}</p>
                  {errorMsg.toLowerCase().includes('restricted') && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('paste');
                        setErrorMsg(null);
                      }}
                      className="mt-1.5 px-3 py-1 bg-accent-rosegold-500/20 hover:bg-accent-rosegold-500/30 text-accent-rosegold-300 font-semibold text-[11px] rounded-lg border border-rosegold-500/30 transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Or click here to paste document text directly &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'file' && (
            <div className="space-y-4">
              {/* Unconstrained hidden file input with no accept restriction so all computer files show up */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileUpload(selectedFile);
                  }
                  e.target.value = '';
                }}
              />

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={(e) => {
                  // Trigger file dialog if not clicking a child interactive element
                  fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                  dragOver ? 'border-accent-rosegold-400 bg-accent-rosegold-500/10' : 'border-white/10 hover:border-white/15 bg-surface-0/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-rosegold-500/10 text-accent-rosegold-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  Click or Drag & Drop Any Computer File Here
                </p>
                <p className="text-xs text-ink-muted mb-5 max-w-md">
                  Supports Microsoft Word (.doc, .docx), PDF (.pdf), Text (.txt), Markdown (.md), Google Doc exports, HTML, RTF, and all document types.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-rosegold-500 via-rosegold-400 to-yellow-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors inline-flex items-center space-x-2 shadow-lg shadow-rosegold-950/40"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Browse Computer Files (All Types)</span>
                  </button>
                </div>
              </div>

              {/* Auto AI Enhance Checkbox Option */}
              <div className="flex items-center space-x-2.5 p-3 bg-surface-0 border border-white/10 rounded-xl">
                <input
                  type="checkbox"
                  id="auto-enhance-cb"
                  checked={autoEnhanceOnUpload}
                  onChange={(e) => setAutoEnhanceOnUpload(e.target.checked)}
                  className="w-4 h-4 rounded border-white/15 text-rosegold-500 focus:ring-rosegold-400 focus:ring-offset-slate-900 bg-surface-1 cursor-pointer"
                />
                <label htmlFor="auto-enhance-cb" className="text-xs font-semibold text-ink-secondary cursor-pointer flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-rosegold-400 shrink-0" />
                  <span>Automatically open AI Publishing Studio generator upon loading</span>
                </label>
              </div>

              {/* Google Docs (.gdoc) Explanation Box */}
              <div className="p-4 bg-surface-0 border border-rosegold-500/30 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-accent-rosegold-400 font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Why are Google Docs (.gdoc) greyed out in computer file dialogs?</span>
                  </div>
                  <span className="text-[10px] bg-accent-rosegold-500/20 text-accent-rosegold-300 font-mono px-2 py-0.5 rounded-full font-bold border border-rosegold-500/30">
                    Google Drive Cloud Notice
                  </span>
                </div>
                <p className="text-ink-secondary text-[11px] leading-relaxed">
                  Google Docs (<code className="text-accent-rosegold-300 bg-rosegold-950/80 px-1.5 py-0.5 rounded font-mono">.gdoc</code> files) in Google Drive for Desktop are web cloud shortcuts, not offline document files on your hard drive. Because of this, operating systems (macOS & Windows) grey them out in browser file selectors.
                </p>
                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setTab('url'); setErrorMsg(null); }}
                    className="px-3.5 py-2 bg-gradient-to-r from-rosegold-500 to-yellow-500 hover:opacity-95 text-slate-950 font-extrabold text-xs rounded-xl transition-colors inline-flex items-center justify-center space-x-1.5 shadow-md"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Switch to Google Doc URL Tab (Instant Import)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('paste'); setErrorMsg(null); }}
                    className="px-3.5 py-2 bg-surface-1 hover:bg-surface-2 text-ink-secondary border border-white/10 font-semibold text-xs rounded-xl transition-colors inline-flex items-center justify-center space-x-1.5"
                  >
                    <FileUp className="w-3.5 h-3.5 text-accent-rosegold-400" />
                    <span>Or Copy & Paste Text</span>
                  </button>
                </div>
              </div>

              {loading && (
                <div className="text-center py-4 space-y-2">
                  <div className="inline-block w-6 h-6 border-2 border-accent-rosegold-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-ink-muted font-medium">Reading and parsing document contents...</p>
                </div>
              )}
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-4">
              <div className="bg-surface-0 p-4 rounded-xl border border-white/10">
                <label className="block text-xs font-semibold text-ink-secondary mb-1.5">
                  Google Doc Link or Document ID
                </label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full bg-surface-1 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-rosegold-400"
                />
                <p className="text-[11px] text-ink-muted mt-2">
                  Tip: Make sure "Anyone with the link can view" is enabled in Google Docs Share settings.
                </p>
              </div>

              <div className="flex items-center space-x-2.5 p-3 bg-surface-0 border border-white/10 rounded-xl">
                <input
                  type="checkbox"
                  id="auto-enhance-url-cb"
                  checked={autoEnhanceOnUpload}
                  onChange={(e) => setAutoEnhanceOnUpload(e.target.checked)}
                  className="w-4 h-4 rounded border-white/15 text-rosegold-500 focus:ring-rosegold-400 focus:ring-offset-slate-900 bg-surface-1 cursor-pointer"
                />
                <label htmlFor="auto-enhance-url-cb" className="text-xs font-semibold text-ink-secondary cursor-pointer flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-rosegold-400 shrink-0" />
                  <span>Automatically launch AI Publishing Studio generator upon importing</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-ink-secondary hover:bg-surface-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAutoEnhanceOnUpload(false);
                    handleFetchGoogleDoc();
                  }}
                  disabled={loading}
                  className="px-4 py-2.5 bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-bold rounded-xl border border-white/15 disabled:opacity-50"
                >
                  Load into Studio Canvas
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAutoEnhanceOnUpload(true);
                    handleFetchGoogleDoc();
                  }}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-rosegold-500 to-rosegold-400 hover:from-rosegold-400 hover:to-rosegold-300 text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Fetching Doc...</span>
                  ) : (
                    <>
                      <span>Import & Run AI Enhancer</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  value={docTitleInput}
                  onChange={(e) => setDocTitleInput(e.target.value)}
                  placeholder="e.g. My 10-Step Guide to Organic Traffic"
                  className="w-full bg-surface-0 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-rosegold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Document Content (Copy & Paste Text)
                </label>
                <textarea
                  rows={8}
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  placeholder="Paste your standard Google Doc text, draft chapters, or plain document paragraphs here..."
                  className="w-full bg-surface-0 border border-white/10 rounded-xl p-3.5 text-xs text-ink-secondary placeholder-slate-500 focus:outline-none focus:border-accent-rosegold-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAutoEnhanceOnUpload(false);
                    handleImportPastedText();
                  }}
                  className="px-4 py-2 bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-semibold rounded-xl border border-white/15"
                >
                  Load into Canvas Only
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-ink-secondary hover:bg-surface-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoEnhanceOnUpload(true);
                      handleImportPastedText();
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-rosegold-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4 text-accent-rosegold-300" />
                    <span>Load & Run AI Publishing Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted mb-2">
                Select a high-converting digital product sample to instantly preview DocCraft's PDF publishing engine:
              </p>
              {SAMPLE_DOCUMENTS.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onImportDocument(sample.doc, sample.rawText);
                    onClose();
                  }}
                  className="p-4 bg-surface-0 border border-white/10 hover:border-accent-rosegold-400/60 rounded-xl cursor-pointer transition-colors hover:scale-[1.01] group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white group-hover:text-accent-rosegold-300 transition-colors">
                        {sample.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-semibold">
                        {sample.tag}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted">{sample.description}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-surface-2 group-hover:bg-accent-rosegold-500 group-hover:text-slate-950 rounded-lg text-xs font-semibold text-ink-secondary transition-colors shrink-0 ml-3">
                    Load Sample
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </ModalShell>
  );
};

