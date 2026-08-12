import React, { useState, useRef } from 'react';
import { apiFetch } from '../lib/apiClient';
import {
  Edit3,
  Plus,
  Trash2,
  X,
  Check,
  FileText,
  Sparkles,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Wand2,
  RefreshCw,
  Search,
  Layout,
  MessageSquare,
  Tag,
  Clock,
  BookOpen,
  Share2,
  Eye,
  Layers,
  Zap,
  HelpCircle,
  Columns,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { DocumentData, DocSection, CalloutBox, BulletCard, CallToAction, MarketingCopy, StudioSettings, DEFAULT_STUDIO_SETTINGS } from '../types';
import { parseTextIntoDocument } from '../utils/textCleaner';
import { PdfCanvas } from './PdfCanvas';
import { ScaledCanvasStage } from './ScaledCanvasStage';
import { ModalShell } from './ui/ModalShell';

interface DocEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData;
  settings?: StudioSettings;
  onSaveDocument?: (doc: DocumentData) => void;
  onUpdateDocument?: (doc: DocumentData) => void;
  isSplitScreen?: boolean;
  onToggleSplitScreen?: () => void;
}

export const DocEditorModal: React.FC<DocEditorModalProps> = ({
  isOpen,
  onClose,
  document,
  settings: rawSettings,
  onSaveDocument,
  onUpdateDocument,
  isSplitScreen = true,
  onToggleSplitScreen
}) => {
  const settings = { ...DEFAULT_STUDIO_SETTINGS, ...(rawSettings || {}) };
  const [doc, setDoc] = useState<DocumentData>(JSON.parse(JSON.stringify(document)));
  const [activeTab, setActiveTab] = useState<'general' | 'sections' | 'matrix' | 'cta' | 'marketing'>('sections');
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sectionViewMode, setSectionViewMode] = useState<'cards' | 'raw'>('cards');
  const [aiLoadingMap, setAiLoadingMap] = useState<Record<string, boolean>>({});
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [previewZoom, setPreviewZoom] = useState<number>(0.7);
  const editorPdfRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Helper to trigger AI quick action on a section
  const handleRunAiQuickAction = async (sectionIdx: number, action: string, customPrompt?: string) => {
    const section = doc.sections[sectionIdx];
    if (!section) return;

    const key = `sec-${sectionIdx}-${action}`;
    setAiLoadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await apiFetch('/api/ai/quick-edit-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, section, customPrompt })
      });

      const data = await res.json();
      if (res.ok && data.success && data.updatedSection) {
        const newSections = [...doc.sections];
        newSections[sectionIdx] = {
          ...newSections[sectionIdx],
          ...data.updatedSection
        };
        setDoc((prev) => ({ ...prev, sections: newSections }));
      }
    } catch (err) {
      console.error('Failed to run AI action:', err);
    } finally {
      setAiLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  // General field handlers
  const handleUpdateGeneral = (field: keyof DocumentData, value: any) => {
    setDoc((prev) => ({ ...prev, [field]: value }));
  };

  // Key Takeaways Handlers
  const handleAddTakeaway = () => {
    setDoc((prev) => ({
      ...prev,
      keyTakeaways: [...(prev.keyTakeaways || []), 'New key takeaway insight...']
    }));
  };

  const handleRemoveTakeaway = (index: number) => {
    setDoc((prev) => ({
      ...prev,
      keyTakeaways: (prev.keyTakeaways || []).filter((_, i) => i !== index)
    }));
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    const updated = [...(doc.keyTakeaways || [])];
    updated[index] = val;
    setDoc((prev) => ({ ...prev, keyTakeaways: updated }));
  };

  // Section Handlers
  const handleUpdateSection = (index: number, updatedSection: DocSection) => {
    const newSections = [...doc.sections];
    newSections[index] = updatedSection;
    setDoc((prev) => ({ ...prev, sections: newSections }));
  };

  const handleAddSection = () => {
    const newNum = doc.sections.length + 1;
    const newSection: DocSection = {
      id: `sec-${Date.now()}`,
      chapterNumber: newNum,
      title: `Chapter ${newNum}: New Strategic Phase`,
      paragraphs: ['Add your compelling chapter content here. AI can polish, expand, or structure this automatically!']
    };
    setDoc((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
    setSelectedSectionIndex(doc.sections.length);
  };

  const handleDuplicateSection = (index: number) => {
    const secToDup = doc.sections[index];
    const duplicated: DocSection = {
      ...JSON.parse(JSON.stringify(secToDup)),
      id: `sec-${Date.now()}`,
      title: `${secToDup.title} (Copy)`
    };
    const newSections = [...doc.sections];
    newSections.splice(index + 1, 0, duplicated);
    setDoc((prev) => ({ ...prev, sections: newSections }));
    setSelectedSectionIndex(index + 1);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= doc.sections.length) return;

    const newSections = [...doc.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Re-index chapter numbers
    newSections.forEach((s, i) => {
      s.chapterNumber = i + 1;
    });

    setDoc((prev) => ({ ...prev, sections: newSections }));
    setSelectedSectionIndex(targetIdx);
  };

  const handleRemoveSection = (index: number) => {
    if (doc.sections.length <= 1) {
      alert('Document must contain at least one chapter.');
      return;
    }
    const newSections = doc.sections.filter((_, i) => i !== index);
    newSections.forEach((s, i) => {
      s.chapterNumber = i + 1;
    });
    setDoc((prev) => ({ ...prev, sections: newSections }));
    setSelectedSectionIndex(Math.max(0, index - 1));
  };

  // Paragraph Handlers within a section
  const handleUpdateParagraph = (secIdx: number, pIdx: number, val: string) => {
    const sec = doc.sections[secIdx];
    const newP = [...sec.paragraphs];
    newP[pIdx] = val;
    handleUpdateSection(secIdx, { ...sec, paragraphs: newP });
  };

  const handleAddParagraph = (secIdx: number, pIdx?: number) => {
    const sec = doc.sections[secIdx];
    const newP = [...sec.paragraphs];
    if (typeof pIdx === 'number') {
      newP.splice(pIdx + 1, 0, 'New paragraph content...');
    } else {
      newP.push('New paragraph content...');
    }
    handleUpdateSection(secIdx, { ...sec, paragraphs: newP });
  };

  const handleMoveParagraph = (secIdx: number, pIdx: number, direction: 'up' | 'down') => {
    const sec = doc.sections[secIdx];
    const targetIdx = direction === 'up' ? pIdx - 1 : pIdx + 1;
    if (targetIdx < 0 || targetIdx >= sec.paragraphs.length) return;

    const newP = [...sec.paragraphs];
    const temp = newP[pIdx];
    newP[pIdx] = newP[targetIdx];
    newP[targetIdx] = temp;

    handleUpdateSection(secIdx, { ...sec, paragraphs: newP });
  };

  const handleRemoveParagraph = (secIdx: number, pIdx: number) => {
    const sec = doc.sections[secIdx];
    if (sec.paragraphs.length <= 1) {
      alert('Each chapter should have at least one paragraph.');
      return;
    }
    const newP = sec.paragraphs.filter((_, i) => i !== pIdx);
    handleUpdateSection(secIdx, { ...sec, paragraphs: newP });
  };

  // Calculate estimated read time automatically
  const handleAutoCalculateReadTime = () => {
    const totalWords = doc.sections.reduce((acc, sec) => {
      return acc + (sec.paragraphs || []).join(' ').split(/\s+/).filter(Boolean).length;
    }, 0);
    const minutes = Math.max(1, Math.ceil(totalWords / 200));
    setDoc((prev) => ({ ...prev, estimatedReadTime: `${minutes} min read (${totalWords.toLocaleString()} words)` }));
  };

  // Save changes
  const handleSave = () => {
    if (onSaveDocument) onSaveDocument(doc);
    if (onUpdateDocument) onUpdateDocument(doc);
    onClose();
  };

  // Filter sections by search query
  const filteredSections = doc.sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sec.paragraphs || []).some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSection = doc.sections[selectedSectionIndex] || doc.sections[0];

  return (
    <ModalShell
      id="doc-editor-modal"
      maxWidthClassName={showLivePreview ? 'max-w-[98vw] xl:max-w-[1700px]' : 'max-w-5xl'}
      scrollable
    >
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-rosegold-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rosegold-500 to-purple-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-rosegold-900/30">
              <Edit3 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">Pro Quick Content Editor</h3>
                <span className="text-[10px] font-bold bg-accent-rosegold-500/20 text-accent-rosegold-300 border border-rosegold-500/30 px-2 py-0.5 rounded-full">
                  Real-Time Split Mode
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Direct control over cover, chapters, AI magic rephrasing, callouts, and marketing copy
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const fullText = doc.sections.map((s) => `${s.title}\n${s.paragraphs.join('\n')}`).join('\n\n');
                const formattedDoc = parseTextIntoDocument(fullText, doc.title);
                setDoc(formattedDoc);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-rosegold-500/20 to-purple-500/20 text-accent-rosegold-300 border border-rosegold-500/40 hover:border-accent-rosegold-400 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
              title="Automatically strip metadata junk, format bullet lists, split steps, and re-structure into clean chapters"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-rosegold-400" />
              <span>✨ Auto-Clean & Format</span>
            </button>

            <button
              type="button"
              onClick={() => setDoc(JSON.parse(JSON.stringify(document)))}
              className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink-secondary hover:bg-surface-2 rounded-lg transition-colors"
              title="Reset to original content"
            >
              Reset Edits
            </button>

            {/* Split Screen Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setShowLivePreview(!showLivePreview);
                if (onToggleSplitScreen) onToggleSplitScreen();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center space-x-1.5 ${
                showLivePreview
                  ? 'bg-accent-rosegold-500/20 text-accent-rosegold-300 border-accent-rosegold-400/60 shadow-md shadow-rosegold-950/40 ring-1 ring-rosegold-400/30'
                  : 'bg-surface-2 border-white/15 text-ink-secondary hover:text-white'
              }`}
              title="Toggle Side-by-Side Split Screen Real-Time Preview"
            >
              <Columns className="w-4 h-4 text-accent-rosegold-400" />
              <span>Split Screen ({showLivePreview ? 'ON' : 'OFF'})</span>
            </button>

            <button
              onClick={onClose}
              className="text-ink-muted hover:text-white p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-surface-0 px-6 space-x-1 sm:space-x-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('sections')}
            className={`py-3 font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap px-2 ${
              activeTab === 'sections'
                ? 'border-accent-rosegold-400 text-accent-rosegold-300'
                : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <BookOpen className="w-4 h-4 text-accent-rosegold-400" />
            <span>Chapters ({doc.sections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap px-2 ${
              activeTab === 'general'
                ? 'border-accent-rosegold-400 text-accent-rosegold-300'
                : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Cover & Meta</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap px-2 ${
              activeTab === 'matrix'
                ? 'border-accent-rosegold-400 text-accent-rosegold-300'
                : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Callouts & Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('cta')}
            className={`py-3 font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap px-2 ${
              activeTab === 'cta'
                ? 'border-accent-rosegold-400 text-accent-rosegold-300'
                : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Back Cover CTA</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`py-3 font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap px-2 ${
              activeTab === 'marketing'
                ? 'border-accent-rosegold-400 text-accent-rosegold-300'
                : 'border-transparent text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Gumroad Marketing</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Main Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TAB: CHAPTERS & CONTENT */}
            {activeTab === 'sections' && (
              <div className="space-y-5">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-0 p-3 rounded-xl border border-white/10">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chapter title or content..."
                      className="w-full bg-surface-1 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="bg-surface-1 border border-white/10 rounded-lg p-1 flex space-x-1 text-[11px]">
                      <button
                        onClick={() => setSectionViewMode('cards')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          sectionViewMode === 'cards' ? 'bg-accent-rosegold-500 text-slate-950 font-bold' : 'text-ink-muted hover:text-white'
                        }`}
                      >
                        Block Editor
                      </button>
                      <button
                        onClick={() => setSectionViewMode('raw')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          sectionViewMode === 'raw' ? 'bg-accent-rosegold-500 text-slate-950 font-bold' : 'text-ink-muted hover:text-white'
                        }`}
                      >
                        Markdown Text
                      </button>
                    </div>

                    <button
                      onClick={handleAddSection}
                      className="px-3 py-1.5 bg-accent-rosegold-500 hover:bg-rosegold-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Chapter</span>
                    </button>
                  </div>
                </div>

                {/* Chapter Selection Pills */}
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {doc.sections.map((sec, idx) => (
                    <button
                      key={sec.id || idx}
                      onClick={() => setSelectedSectionIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 flex items-center space-x-1.5 ${
                        selectedSectionIndex === idx
                          ? 'bg-accent-rosegold-500/20 border-accent-rosegold-400 text-accent-rosegold-300 ring-1 ring-rosegold-400/40'
                          : 'bg-surface-0 border-white/10 text-ink-muted hover:text-white'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-surface-2 text-[10px] flex items-center justify-center font-mono">
                        {sec.chapterNumber || idx + 1}
                      </span>
                      <span className="max-w-[140px] truncate">{sec.title || 'Untitled'}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Active Chapter Card */}
                {activeSection && (
                  <div className="bg-surface-0 border border-rosegold-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                    {/* Chapter Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black bg-accent-rosegold-500 text-slate-950 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          Chapter {activeSection.chapterNumber || selectedSectionIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={activeSection.title}
                          onChange={(e) =>
                            handleUpdateSection(selectedSectionIndex, { ...activeSection, title: e.target.value })
                          }
                          className="bg-surface-1 border border-white/15 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:border-accent-rosegold-400 flex-1"
                          placeholder="Chapter Title..."
                        />
                      </div>

                      {/* Chapter Actions */}
                      <div className="flex items-center space-x-1 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(selectedSectionIndex, 'up')}
                          disabled={selectedSectionIndex === 0}
                          className="p-1.5 bg-surface-1 hover:bg-surface-2 text-ink-secondary rounded-lg border border-white/10 disabled:opacity-30"
                          title="Move Chapter Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(selectedSectionIndex, 'down')}
                          disabled={selectedSectionIndex === doc.sections.length - 1}
                          className="p-1.5 bg-surface-1 hover:bg-surface-2 text-ink-secondary rounded-lg border border-white/10 disabled:opacity-30"
                          title="Move Chapter Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateSection(selectedSectionIndex)}
                          className="p-1.5 bg-surface-1 hover:bg-surface-2 text-ink-secondary rounded-lg border border-white/10"
                          title="Duplicate Chapter"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(selectedSectionIndex)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/80"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* AI Magic Bar for Chapter */}
                    <div className="p-3 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40 rounded-xl border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-300 flex items-center space-x-1.5">
                          <Wand2 className="w-4 h-4 text-accent-rosegold-400" />
                          <span>AI Chapter Magic Writer</span>
                        </span>
                        <span className="text-[10px] text-purple-400">1-Click Instant Transform</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRunAiQuickAction(selectedSectionIndex, 'polish')}
                          disabled={aiLoadingMap[`sec-${selectedSectionIndex}-polish`]}
                          className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
                        >
                          {aiLoadingMap[`sec-${selectedSectionIndex}-polish`] ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-accent-rosegold-400" />
                          )}
                          <span>🪄 Polish Prose</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunAiQuickAction(selectedSectionIndex, 'expand')}
                          disabled={aiLoadingMap[`sec-${selectedSectionIndex}-expand`]}
                          className="px-2.5 py-1 bg-surface-2 hover:bg-slate-700 text-ink-secondary border border-white/15 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
                        >
                          {aiLoadingMap[`sec-${selectedSectionIndex}-expand`] ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3 text-teal-400" />
                          )}
                          <span>⚡ Expand Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunAiQuickAction(selectedSectionIndex, 'add_callout')}
                          disabled={aiLoadingMap[`sec-${selectedSectionIndex}-add_callout`]}
                          className="px-2.5 py-1 bg-surface-2 hover:bg-slate-700 text-ink-secondary border border-white/15 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
                        >
                          {aiLoadingMap[`sec-${selectedSectionIndex}-add_callout`] ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-accent-rosegold-400" />
                          )}
                          <span>💡 Add Callout Box</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunAiQuickAction(selectedSectionIndex, 'add_bullet_cards')}
                          disabled={aiLoadingMap[`sec-${selectedSectionIndex}-add_bullet_cards`]}
                          className="px-2.5 py-1 bg-surface-2 hover:bg-slate-700 text-ink-secondary border border-white/15 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
                        >
                          {aiLoadingMap[`sec-${selectedSectionIndex}-add_bullet_cards`] ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Layers className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>🎴 Add Bullet Cards</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunAiQuickAction(selectedSectionIndex, 'fix_grammar')}
                          disabled={aiLoadingMap[`sec-${selectedSectionIndex}-fix_grammar`]}
                          className="px-2.5 py-1 bg-surface-2 hover:bg-slate-700 text-ink-secondary border border-white/15 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
                        >
                          {aiLoadingMap[`sec-${selectedSectionIndex}-fix_grammar`] ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3 text-indigo-400" />
                          )}
                          <span>🛠️ Fix Grammar</span>
                        </button>
                      </div>
                    </div>

                    {/* Paragraph Content Editing Mode */}
                    {sectionViewMode === 'cards' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-ink-muted font-semibold">
                          <span>Paragraph Blocks ({activeSection.paragraphs?.length || 0})</span>
                          <button
                            type="button"
                            onClick={() => handleAddParagraph(selectedSectionIndex)}
                            className="text-accent-rosegold-400 hover:text-accent-rosegold-300 flex items-center space-x-1 text-[11px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Paragraph</span>
                          </button>
                        </div>

                        {(activeSection.paragraphs || []).map((para, pIdx) => (
                          <div key={pIdx} className="bg-surface-1 border border-white/10 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-ink-muted">
                              <span className="font-mono font-bold text-accent-rosegold-400/80">Paragraph {pIdx + 1}</span>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveParagraph(selectedSectionIndex, pIdx, 'up')}
                                  disabled={pIdx === 0}
                                  className="p-1 hover:bg-surface-2 rounded disabled:opacity-20 text-ink-secondary"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveParagraph(selectedSectionIndex, pIdx, 'down')}
                                  disabled={pIdx === (activeSection.paragraphs?.length || 0) - 1}
                                  className="p-1 hover:bg-surface-2 rounded disabled:opacity-20 text-ink-secondary"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveParagraph(selectedSectionIndex, pIdx)}
                                  className="p-1 hover:bg-rose-950 text-rose-400 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <textarea
                              rows={3}
                              value={para}
                              onChange={(e) => handleUpdateParagraph(selectedSectionIndex, pIdx, e.target.value)}
                              className="w-full bg-surface-0 border border-white/10 rounded-lg p-2.5 text-xs text-ink-secondary focus:outline-none focus:border-accent-rosegold-400 font-sans leading-relaxed resize-y"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Raw Markdown Area View */
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-ink-secondary">
                          Raw Chapter Markdown Text (Double Line Breaks = New Paragraphs)
                        </label>
                        <textarea
                          rows={10}
                          value={(activeSection.paragraphs || []).join('\n\n')}
                          onChange={(e) => {
                            const newParagraphs = e.target.value.split(/\n\n+/).filter(Boolean);
                            handleUpdateSection(selectedSectionIndex, {
                              ...activeSection,
                              paragraphs: newParagraphs.length > 0 ? newParagraphs : ['']
                            });
                          }}
                          className="w-full bg-surface-1 border border-white/10 rounded-xl p-3 text-xs text-ink-secondary font-mono focus:outline-none focus:border-accent-rosegold-400 resize-y leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Chapter Callout Box Controls */}
                    <div className="pt-3 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-accent-rosegold-300 flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 text-accent-rosegold-400" />
                          <span>Chapter Callout Graphic Box</span>
                        </span>

                        {activeSection.callout ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSection(selectedSectionIndex, { ...activeSection, callout: undefined })
                            }
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                          >
                            Remove Callout
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSection(selectedSectionIndex, {
                                ...activeSection,
                                callout: {
                                  type: 'insight',
                                  title: 'Executive Pro Insight',
                                  content: 'Key lesson learned for immediate implementation.'
                                }
                              })
                            }
                            className="text-[11px] text-accent-rosegold-400 hover:text-accent-rosegold-300 font-medium flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Callout Box</span>
                          </button>
                        )}
                      </div>

                      {activeSection.callout && (
                        <div className="p-3 bg-surface-1 border border-rosegold-500/30 rounded-xl space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-ink-muted mb-1">Type & Icon</label>
                              <select
                                value={activeSection.callout.type}
                                onChange={(e) =>
                                  handleUpdateSection(selectedSectionIndex, {
                                    ...activeSection,
                                    callout: { ...activeSection.callout!, type: e.target.value as any }
                                  })
                                }
                                className="w-full bg-surface-0 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                              >
                                <option value="tip">💡 Tip / Hack</option>
                                <option value="warning">⚠️ Warning / Risk</option>
                                <option value="quote">💬 Key Quote</option>
                                <option value="insight">🧠 Pro Insight</option>
                                <option value="worksheet">📋 Action Worksheet</option>
                                <option value="key-takeaway">🎯 Key Takeaway</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-ink-muted mb-1">Box Headline</label>
                              <input
                                type="text"
                                value={activeSection.callout.title}
                                onChange={(e) =>
                                  handleUpdateSection(selectedSectionIndex, {
                                    ...activeSection,
                                    callout: { ...activeSection.callout!, title: e.target.value }
                                  })
                                }
                                className="w-full bg-surface-0 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-accent-rosegold-400"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-ink-muted mb-1">Callout Content</label>
                            <textarea
                              rows={2}
                              value={activeSection.callout.content}
                              onChange={(e) =>
                                handleUpdateSection(selectedSectionIndex, {
                                  ...activeSection,
                                  callout: { ...activeSection.callout!, content: e.target.value }
                                })
                              }
                              className="w-full bg-surface-0 border border-white/10 rounded-lg p-2 text-xs text-ink-secondary focus:outline-none focus:border-accent-rosegold-400 resize-y"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COVER & METADATA */}
            {activeTab === 'general' && (
              <div className="space-y-5 bg-surface-0 p-5 rounded-2xl border border-white/10">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-white/10 pb-3">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Cover Page & Publication Details</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-ink-secondary mb-1">Publication Main Title</label>
                  <input
                    type="text"
                    value={doc.title}
                    onChange={(e) => handleUpdateGeneral('title', e.target.value)}
                    className="w-full bg-surface-1 border border-white/15 rounded-xl p-3 text-base text-white font-extrabold focus:outline-none focus:border-accent-rosegold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-secondary mb-1">Subtitle / Descriptor</label>
                  <input
                    type="text"
                    value={doc.subtitle}
                    onChange={(e) => handleUpdateGeneral('subtitle', e.target.value)}
                    className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-secondary mb-1">Author / Studio Brand</label>
                    <input
                      type="text"
                      value={doc.author}
                      onChange={(e) => handleUpdateGeneral('author', e.target.value)}
                      className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-secondary mb-1">Category Badge</label>
                    <input
                      type="text"
                      value={doc.category || ''}
                      onChange={(e) => handleUpdateGeneral('category', e.target.value)}
                      className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-ink-secondary">Read Time</label>
                      <button
                        type="button"
                        onClick={handleAutoCalculateReadTime}
                        className="text-[10px] text-accent-rosegold-400 hover:underline"
                      >
                        ⚡ Auto-Calculate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={doc.estimatedReadTime || ''}
                      onChange={(e) => handleUpdateGeneral('estimatedReadTime', e.target.value)}
                      className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                    />
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-ink-secondary">Key Takeaways (Front / Table of Contents Bullets)</label>
                    <button
                      type="button"
                      onClick={handleAddTakeaway}
                      className="text-xs text-accent-rosegold-400 hover:text-accent-rosegold-300 flex items-center space-x-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bullet</span>
                    </button>
                  </div>

                  {(doc.keyTakeaways || []).map((kt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-surface-2 text-accent-rosegold-400 text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={kt}
                        onChange={(e) => handleUpdateTakeaway(i, e.target.value)}
                        className="flex-1 bg-surface-1 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTakeaway(i)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CALLOUTS & BULLET CARDS MATRIX */}
            {activeTab === 'matrix' && (
              <div className="space-y-4 bg-surface-0 p-5 rounded-2xl border border-white/10">
                <div className="border-b border-white/10 pb-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>Central Callout & Bullet Card Manager</span>
                  </h4>
                  <p className="text-xs text-ink-muted mt-1">
                    Manage all special visual boxes across chapters in one unified view
                  </p>
                </div>

                <div className="space-y-4">
                  {doc.sections.map((sec, secIdx) => (
                    <div key={sec.id || secIdx} className="bg-surface-1 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-accent-rosegold-400">
                          Chapter {sec.chapterNumber}: {sec.title}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px]">
                          {sec.callout && (
                            <span className="bg-accent-rosegold-500/20 text-accent-rosegold-300 px-2 py-0.5 rounded border border-rosegold-500/30 font-bold">
                              Callout Active ({sec.callout.type})
                            </span>
                          )}
                          {sec.bulletCards && sec.bulletCards.length > 0 && (
                            <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30 font-bold">
                              {sec.bulletCards.length} Cards
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bullet cards editor */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-ink-muted">
                          <span>Bullet Cards Takeaways ({sec.bulletCards?.length || 0})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCards = [...(sec.bulletCards || []), { title: 'New Takeaway', description: 'Description details...', badgeText: 'RULE' }];
                              handleUpdateSection(secIdx, { ...sec, bulletCards: newCards });
                            }}
                            className="text-teal-400 hover:underline flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Card</span>
                          </button>
                        </div>

                        {(sec.bulletCards || []).map((card, cIdx) => (
                          <div key={cIdx} className="p-2.5 bg-surface-0 border border-white/10 rounded-lg space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const cards = [...(sec.bulletCards || [])];
                                  cards[cIdx].title = e.target.value;
                                  handleUpdateSection(secIdx, { ...sec, bulletCards: cards });
                                }}
                                placeholder="Card Title"
                                className="col-span-2 bg-surface-1 border border-white/10 rounded px-2 py-1 text-xs text-white font-bold"
                              />
                              <input
                                type="text"
                                value={card.badgeText || ''}
                                onChange={(e) => {
                                  const cards = [...(sec.bulletCards || [])];
                                  cards[cIdx].badgeText = e.target.value;
                                  handleUpdateSection(secIdx, { ...sec, bulletCards: cards });
                                }}
                                placeholder="Badge e.g. STEP 1"
                                className="bg-surface-1 border border-white/10 rounded px-2 py-1 text-xs text-accent-rosegold-300 font-bold"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={card.description}
                                onChange={(e) => {
                                  const cards = [...(sec.bulletCards || [])];
                                  cards[cIdx].description = e.target.value;
                                  handleUpdateSection(secIdx, { ...sec, bulletCards: cards });
                                }}
                                placeholder="Description details..."
                                className="flex-1 bg-surface-1 border border-white/10 rounded px-2 py-1 text-xs text-ink-secondary"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const cards = (sec.bulletCards || []).filter((_, i) => i !== cIdx);
                                  handleUpdateSection(secIdx, { ...sec, bulletCards: cards });
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BACK COVER CTA */}
            {activeTab === 'cta' && (
              <div className="space-y-5 bg-surface-0 p-5 rounded-2xl border border-white/10">
                <div className="border-b border-white/10 pb-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Back Cover Call To Action</span>
                  </h4>
                  <p className="text-xs text-ink-muted mt-1">
                    Convert readers into customers, subscribers, or community members
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-secondary mb-1">CTA Headline</label>
                  <input
                    type="text"
                    value={doc.callToAction?.headline || ''}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        callToAction: { ...prev.callToAction, headline: e.target.value } as CallToAction
                      }))
                    }
                    className="w-full bg-surface-1 border border-white/15 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-accent-rosegold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-secondary mb-1">Subhead Description</label>
                  <textarea
                    rows={2}
                    value={doc.callToAction?.subhead || ''}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        callToAction: { ...prev.callToAction, subhead: e.target.value } as CallToAction
                      }))
                    }
                    className="w-full bg-surface-1 border border-white/15 rounded-xl p-3 text-xs text-ink-secondary focus:outline-none focus:border-accent-rosegold-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-secondary mb-1">Button Text</label>
                    <input
                      type="text"
                      value={doc.callToAction?.buttonText || ''}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          callToAction: { ...prev.callToAction, buttonText: e.target.value } as CallToAction
                        }))
                      }
                      className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-secondary mb-1">Website or Social Handle</label>
                    <input
                      type="text"
                      value={doc.callToAction?.websiteOrHandle || ''}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          callToAction: { ...prev.callToAction, websiteOrHandle: e.target.value } as CallToAction
                        }))
                      }
                      className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MARKETING COPY */}
            {activeTab === 'marketing' && (
              <div className="space-y-5 bg-surface-0 p-5 rounded-2xl border border-white/10">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                      <Share2 className="w-4 h-4 text-indigo-400" />
                      <span>Gumroad, Etsy & Pinterest Marketing Assets</span>
                    </h4>
                    <p className="text-xs text-ink-muted mt-1">
                      Ready-to-use copy for your digital product store listings
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-secondary mb-1">Gumroad Sales Title</label>
                  <input
                    type="text"
                    value={doc.marketingCopy?.gumroadHeadline || doc.title}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        marketingCopy: {
                          ...prev.marketingCopy,
                          gumroadHeadline: e.target.value,
                          pinterestPinText: prev.marketingCopy?.pinterestPinText || '',
                          salesHighlights: prev.marketingCopy?.salesHighlights || []
                        }
                      }))
                    }
                    className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-accent-rosegold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-secondary mb-1">Pinterest / Instagram Graphic Overlay Text</label>
                  <input
                    type="text"
                    value={doc.marketingCopy?.pinterestPinText || doc.subtitle}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        marketingCopy: {
                          ...prev.marketingCopy,
                          gumroadHeadline: prev.marketingCopy?.gumroadHeadline || '',
                          pinterestPinText: e.target.value,
                          salesHighlights: prev.marketingCopy?.salesHighlights || []
                        }
                      }))
                    }
                    className="w-full bg-surface-1 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent-rosegold-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Side-by-Side Scaled Canvas Preview Panel */}
          {showLivePreview && (
            <div className="w-full md:w-1/2 bg-surface-0 border-t md:border-t-0 md:border-l border-white/10 flex flex-col shrink-0 overflow-hidden h-full min-h-[400px]">
              <ScaledCanvasStage
                document={doc}
                settings={settings}
                pdfRef={editorPdfRef}
                isSplitScreen={showLivePreview}
                onToggleSplitScreen={() => setShowLivePreview(!showLivePreview)}
                autoFitDefault={true}
              />
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-white/10 bg-surface-0 flex items-center justify-between">
          <p className="text-[11px] text-ink-muted hidden sm:block">
            All edits update the high-DPI PDF generator canvas instantly.
          </p>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:bg-surface-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-rosegold-500 to-rosegold-400 hover:opacity-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-rosegold-950/40 flex items-center space-x-2 transition-colors"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>Apply Changes to PDF Canvas</span>
            </button>
          </div>
        </div>
    </ModalShell>
  );
};
