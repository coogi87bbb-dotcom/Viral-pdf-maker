import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Bookmark, 
  Plus, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Share2, 
  Zap, 
  Layers, 
  Tag, 
  Filter, 
  ArrowRight, 
  Star,
  Twitter,
  Instagram,
  Video,
  Facebook,
  AtSign,
  Pin,
  Linkedin,
  X,
  FileText,
  Wand2,
  Sliders,
  TrendingUp,
  RefreshCw,
  Eye,
  CheckCircle2,
  Flame,
  BookOpen,
  BarChart2,
  Lightbulb,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { CampaignTemplate, SocialPlatform } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { MASTER_CAMPAIGN_BLUEPRINTS, STUDY_12_CASE_BREAKDOWNS, StudyCaseBreakdown } from '../data/masterBlueprints';

interface TemplateLibraryProps {
  onSelectTemplate?: (template: CampaignTemplate) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const { user } = useAuth();
  
  // Navigation View State: 'blueprints' (40 Master Blueprints) vs 'case-studies' (Study 12)
  const [viewTab, setViewTab] = useState<'blueprints' | 'case-studies'>('blueprints');

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customTemplates, setCustomTemplates] = useState<CampaignTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<StudyCaseBreakdown | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [minVirality, setMinVirality] = useState<number>(80);
  const [sortBy, setSortBy] = useState<'virality' | 'usage' | 'newest'>('virality');
  
  // Interactive Variable Filler State
  const [variableMap, setVariableMap] = useState<Record<string, string>>({});

  // AI Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiPromptTopic, setAiPromptTopic] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Manual Template Creation Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplate | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CampaignTemplate['category']>('Custom Saved');
  const [formDescription, setFormDescription] = useState('');
  const [formPlatforms, setFormPlatforms] = useState<SocialPlatform[]>(['x', 'instagram', 'tiktok']);
  const [formHook, setFormHook] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formHashtags, setFormHashtags] = useState('');
  const [formCta, setFormCta] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  // Load saved custom templates and favorites
  useEffect(() => {
    loadTemplatesAndFavorites();
  }, [user]);

  // Extract variables whenever selectedTemplate changes
  useEffect(() => {
    if (selectedTemplate) {
      const text = `${selectedTemplate.coreHookStructure} ${selectedTemplate.bodyFormatTemplate} ${selectedTemplate.callToAction}`;
      const matches = text.match(/\[([A-Z0-9_]+)\]/g) || [];
      const uniqueVars = Array.from(new Set(matches.map(m => m.replace(/\[|\]/g, ''))));
      
      const initialMap: Record<string, string> = {};
      uniqueVars.forEach(v => {
        initialMap[v] = variableMap[v] || '';
      });
      setVariableMap(initialMap);
    }
  }, [selectedTemplate]);

  const loadTemplatesAndFavorites = async () => {
    try {
      const savedFavs = localStorage.getItem('viralos_favorite_templates');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    try {
      if (user) {
        const q = query(collection(db, 'templates'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const docsData: CampaignTemplate[] = [];
        snap.forEach((d) => {
          docsData.push({ id: d.id, ...d.data() } as CampaignTemplate);
        });
        setCustomTemplates(docsData);
      } else {
        const savedCustom = localStorage.getItem('viralos_custom_templates');
        if (savedCustom) {
          setCustomTemplates(JSON.parse(savedCustom));
        }
      }
    } catch (err) {
      console.warn('Firestore templates fallback:', err);
      const savedCustom = localStorage.getItem('viralos_custom_templates');
      if (savedCustom) {
        setCustomTemplates(JSON.parse(savedCustom));
      }
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('viralos_favorite_templates', JSON.stringify(updated));
  };

  const handleCopySection = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAiTemplate = async () => {
    if (!aiPromptTopic.trim()) {
      alert('Please enter a topic or niche concept for the AI generator.');
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await apiFetch('/api/viral/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiPromptTopic })
      });
      const data = await res.json();

      if (data && data.title) {
        const newTemplate: CampaignTemplate = {
          id: `ai-template-${Date.now()}`,
          title: data.title,
          category: data.category || 'Custom Saved',
          description: data.description || 'AI Generated viral template structure.',
          targetPlatforms: data.targetPlatforms || ['x', 'instagram', 'tiktok', 'linkedin'],
          coreHookStructure: data.coreHookStructure,
          bodyFormatTemplate: data.bodyFormatTemplate,
          hashtags: data.hashtags || ['#ViralOS', '#AIGrowth'],
          callToAction: data.callToAction || 'Comment below to download!',
          estimatedViralityScore: data.estimatedViralityScore || 98,
          isCustom: true,
          createdAt: new Date().toLocaleDateString(),
          tags: ['AI Generated', data.category],
          usageCount: 1
        };

        setCustomTemplates((prev) => [newTemplate, ...prev]);
        const updatedLocal = [newTemplate, ...customTemplates];
        localStorage.setItem('viralos_custom_templates', JSON.stringify(updatedLocal));

        setSelectedTemplate(newTemplate);
        setIsAiModalOpen(false);
        setAiPromptTopic('');
      }
    } catch (err) {
      console.error('AI Template generation error:', err);
      alert('Could not generate AI template right now. Please try again.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Substitute variables in string
  const substituteVariables = (text: string) => {
    let result = text;
    Object.keys(variableMap).forEach((v) => {
      const val = variableMap[v]?.trim();
      if (val) {
        const regex = new RegExp(`\\[${v}\\]`, 'g');
        result = result.replace(regex, val);
      }
    });
    return result;
  };

  const openCreateModal = (presetToDuplicate?: CampaignTemplate) => {
    if (presetToDuplicate) {
      setFormTitle(`${presetToDuplicate.title} (Custom Copy)`);
      setFormCategory(presetToDuplicate.category);
      setFormDescription(presetToDuplicate.description);
      setFormPlatforms([...presetToDuplicate.targetPlatforms]);
      setFormHook(presetToDuplicate.coreHookStructure);
      setFormBody(presetToDuplicate.bodyFormatTemplate);
      setFormHashtags(presetToDuplicate.hashtags.join(', '));
      setFormCta(presetToDuplicate.callToAction);
      setEditingTemplate(null);
    } else {
      setFormTitle('');
      setFormCategory('Custom Saved');
      setFormDescription('');
      setFormPlatforms(['x', 'instagram', 'tiktok']);
      setFormHook('');
      setFormBody('');
      setFormHashtags('');
      setFormCta('');
      setEditingTemplate(null);
    }
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formHook.trim() || !formBody.trim()) {
      alert('Please fill out the Template Title, Core Hook, and Body Format.');
      return;
    }

    setLoadingSave(true);
    const hashtagsArray = formHashtags
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0)
      .map((h) => (h.startsWith('#') ? h : `#${h}`));

    const newTemplate: CampaignTemplate = {
      id: editingTemplate ? editingTemplate.id : `template-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      description: formDescription.trim() || 'Custom saved campaign architecture template.',
      targetPlatforms: formPlatforms.length > 0 ? formPlatforms : ['x', 'instagram'],
      coreHookStructure: formHook.trim(),
      bodyFormatTemplate: formBody.trim(),
      hashtags: hashtagsArray.length > 0 ? hashtagsArray : ['#ViralOS', '#ContentStrategy'],
      callToAction: formCta.trim() || 'Comment below for access!',
      estimatedViralityScore: 96,
      isCustom: true,
      createdAt: new Date().toLocaleDateString(),
      tags: ['Custom', formCategory],
      usageCount: 1
    };

    try {
      if (user) {
        if (editingTemplate) {
          setCustomTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? newTemplate : t)));
        } else {
          const docRef = await addDoc(collection(db, 'templates'), {
            ...newTemplate,
            userId: user.uid,
            createdAt: new Date().toISOString()
          });
          newTemplate.id = docRef.id;
          setCustomTemplates((prev) => [newTemplate, ...prev]);
        }
      } else {
        if (editingTemplate) {
          const updated = customTemplates.map((t) => (t.id === editingTemplate.id ? newTemplate : t));
          setCustomTemplates(updated);
          localStorage.setItem('viralos_custom_templates', JSON.stringify(updated));
        } else {
          const updated = [newTemplate, ...customTemplates];
          setCustomTemplates(updated);
          localStorage.setItem('viralos_custom_templates', JSON.stringify(updated));
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.warn('Error saving template to cloud, saving locally:', err);
      const updated = [newTemplate, ...customTemplates.filter((t) => t.id !== newTemplate.id)];
      setCustomTemplates(updated);
      localStorage.setItem('viralos_custom_templates', JSON.stringify(updated));
      setIsModalOpen(false);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved template?')) return;

    try {
      if (user) {
        await deleteDoc(doc(db, 'templates', templateId));
      }
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }

    const updated = customTemplates.filter((t) => t.id !== templateId);
    setCustomTemplates(updated);
    localStorage.setItem('viralos_custom_templates', JSON.stringify(updated));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  const allTemplates = [...MASTER_CAMPAIGN_BLUEPRINTS, ...customTemplates];

  const categories = ['All', 'Favorites', 'Viral Threads', 'Short Video Scripts', 'B2B Thought Leadership', 'Product Launch Blitz', 'Carousel Guides', 'Direct Response Funnel', 'Custom Saved'];

  const filteredTemplates = allTemplates
    .filter((t) => {
      const matchesCategory =
        activeCategory === 'All'
          ? true
          : activeCategory === 'Favorites'
          ? favorites.includes(t.id)
          : activeCategory === 'Custom Saved'
          ? t.isCustom
          : t.category === activeCategory;

      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.coreHookStructure.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.hashtags.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVirality = t.estimatedViralityScore >= minVirality;

      return matchesCategory && matchesSearch && matchesVirality;
    })
    .sort((a, b) => {
      if (sortBy === 'virality') return b.estimatedViralityScore - a.estimatedViralityScore;
      if (sortBy === 'usage') return (b.usageCount || 0) - (a.usageCount || 0);
      return 0;
    });

  const filteredStudies = STUDY_12_CASE_BREAKDOWNS.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.niche.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.winningAngle.toLowerCase().includes(q)
    );
  });

  const platformIcons: Record<SocialPlatform, React.ReactNode> = {
    x: <Twitter className="h-3 w-3 text-sky-400" />,
    instagram: <Instagram className="h-3 w-3 text-pink-400" />,
    tiktok: <Video className="h-3 w-3 text-cyan-400" />,
    facebook: <Facebook className="h-3 w-3 text-blue-500" />,
    threads: <AtSign className="h-3 w-3 text-violet-400" />,
    pinterest: <Pin className="h-3 w-3 text-red-500" />,
    linkedin: <Linkedin className="h-3 w-3 text-blue-400" />
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Tab Toggle */}
      <div className="bg-surface-1/90 rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-xs font-semibold text-fuchsia-300">
              <Layers className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>VIRALOS TEMPLATE VAULT & TEARDOWN ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              40 Master Blueprints & Study 12 Case Vault
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Explore 40 battle-tested master campaign blueprints with live variable substitution alongside 12 deep-dive viral campaign teardowns and algorithm breakdowns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/20 transition-colors cursor-pointer border border-fuchsia-400/30"
            >
              <Wand2 className="h-4 w-4 text-accent-brass-300" />
              <span>AI Generate Template</span>
            </button>

            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-secondary font-bold text-xs transition-colors cursor-pointer border border-white/15"
            >
              <Plus className="h-4 w-4 text-violet-400" />
              <span>Create Custom</span>
            </button>
          </div>
        </div>

        {/* Tab Selector: 40 Master Blueprints vs Study 12 Case Studies */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-surface-0 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setViewTab('blueprints');
                setSelectedStudy(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewTab === 'blueprints'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20'
                  : 'text-ink-muted hover:text-white hover:bg-surface-1'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>40 Master Blueprints ({allTemplates.length})</span>
            </button>

            <button
              onClick={() => {
                setViewTab('case-studies');
                setSelectedTemplate(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewTab === 'case-studies'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20'
                  : 'text-ink-muted hover:text-white hover:bg-surface-1'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-accent-brass-400" />
              <span>Study 12 Viral Case Studies (12)</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder={viewTab === 'blueprints' ? "Search 40 blueprints..." : "Search 12 case studies..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-0 border border-white/10 text-ink-secondary placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
            />
          </div>
        </div>

        {/* Blueprint Filters (Category Chips, Virality, Sort) - Only when Blueprints Tab active */}
        {viewTab === 'blueprints' && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                          : 'bg-surface-0 text-ink-muted hover:text-white border border-white/10'
                      }`}
                    >
                      {cat === 'Favorites' && <Star className="inline h-3 w-3 mr-1 text-accent-brass-400 fill-brass-400" />}
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {/* Virality Threshold */}
                <div className="flex items-center gap-1.5 bg-surface-0 border border-white/10 px-2.5 py-1 rounded-lg">
                  <Flame className="h-3.5 w-3.5 text-accent-brass-400" />
                  <span className="text-ink-muted text-[11px]">Virality:</span>
                  <select
                    value={minVirality}
                    onChange={(e) => setMinVirality(Number(e.target.value))}
                    className="bg-transparent text-accent-brass-300 font-mono font-bold focus:outline-none text-xs cursor-pointer"
                  >
                    <option value={70} className="bg-surface-1 text-ink-secondary">70%+</option>
                    <option value={80} className="bg-surface-1 text-ink-secondary">80%+</option>
                    <option value={90} className="bg-surface-1 text-ink-secondary">90%+</option>
                    <option value={95} className="bg-surface-1 text-ink-secondary">95%+ Only</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1.5 bg-surface-0 border border-white/10 px-2.5 py-1 rounded-lg">
                  <Sliders className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-ink-muted text-[11px]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-ink-secondary font-semibold focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="virality" className="bg-surface-1 text-ink-secondary">Highest Virality</option>
                    <option value="usage" className="bg-surface-1 text-ink-secondary">Most Used</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW TAB 1: 40 MASTER BLUEPRINTS GRID & INSPECTOR */}
      {viewTab === 'blueprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Templates Cards Grid */}
          <div className={`space-y-4 ${selectedTemplate ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            <div className="flex items-center justify-between text-xs text-ink-muted px-1">
              <span>Displaying <strong className="text-white">{filteredTemplates.length}</strong> of 40 master blueprints</span>
              {customTemplates.length > 0 && (
                <span className="text-emerald-400 font-medium">✨ {customTemplates.length} Custom Templates</span>
              )}
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="bg-surface-1/50 rounded-2xl p-12 border border-white/10 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto text-slate-500">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Master Templates Found</h3>
                <p className="text-xs text-ink-muted max-w-sm mx-auto">
                  No templates matched your filter query. Try lowering the virality threshold or resetting search.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                    setMinVirality(70);
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-slate-700 text-xs text-ink-secondary font-semibold transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${selectedTemplate ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {filteredTemplates.map((template) => {
                  const isFav = favorites.includes(template.id);
                  const isSelected = selectedTemplate?.id === template.id;

                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`group bg-surface-1/90 rounded-2xl p-5 border transition-colors cursor-pointer flex flex-col justify-between space-y-4 relative ${
                        isSelected
                          ? 'border-fuchsia-500 shadow-xl shadow-fuchsia-500/10 ring-1 ring-fuchsia-500/50'
                          : 'border-white/10 hover:border-white/15 hover:bg-surface-1'
                      }`}
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[10px] font-bold tracking-wide">
                            {template.category}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => toggleFavorite(template.id, e)}
                              className="p-1.5 rounded-lg bg-surface-0/60 hover:bg-surface-2 text-ink-muted hover:text-accent-brass-400 transition-colors cursor-pointer"
                              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <Star className={`h-3.5 w-3.5 ${isFav ? 'text-accent-brass-400 fill-brass-400' : ''}`} />
                            </button>

                            {template.isCustom && (
                              <button
                                onClick={(e) => handleDeleteTemplate(template.id, e)}
                                className="p-1.5 rounded-lg bg-surface-0/60 hover:bg-red-500/20 text-ink-muted hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete custom template"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors line-clamp-1">
                          {template.title}
                        </h3>
                        <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>

                        {/* Core Hook Preview */}
                        <div className="mt-3 p-2.5 rounded-xl bg-surface-0 border border-white/10 text-[11px] font-mono text-ink-secondary line-clamp-2">
                          "{template.coreHookStructure}"
                        </div>
                      </div>

                      {/* Footer Actions & Platform Icons */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {template.targetPlatforms.map((p) => (
                            <span key={p} className="p-1 rounded bg-surface-0 border border-white/10" title={p}>
                              {platformIcons[p]}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {template.estimatedViralityScore}/100 Virality
                          </span>
                          
                          <button
                            onClick={(e) => handleCopySection(template.coreHookStructure, `hook-${template.id}`, e)}
                            className="p-1.5 rounded-lg bg-surface-2 hover:bg-fuchsia-600 text-ink-secondary hover:text-white transition-colors cursor-pointer"
                            title="Copy Hook"
                          >
                            {copiedId === `hook-${template.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Template Detail Inspector Pane */}
          {selectedTemplate && (
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 bg-surface-1 rounded-2xl p-6 border border-fuchsia-500/30 shadow-2xl space-y-6">
                
                {/* Detail Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-bold">
                        {selectedTemplate.category}
                      </span>
                      {selectedTemplate.isCustom && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30">
                          CUSTOM / AI SAVED
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{selectedTemplate.title}</h3>
                  </div>

                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-1.5 rounded-lg bg-surface-0 hover:bg-surface-2 text-ink-muted hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-ink-secondary leading-relaxed">
                  {selectedTemplate.description}
                </p>

                {/* Interactive Live Variable Substitution Box */}
                {Object.keys(variableMap).length > 0 && (
                  <div className="p-4 bg-surface-0 rounded-xl border border-violet-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-accent-brass-300" />
                        <span>Live Interactive Variable Substitution</span>
                      </span>
                      <span className="text-[10px] text-ink-muted font-mono">Fill & Preview Below</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.keys(variableMap).map((vKey) => (
                        <div key={vKey}>
                          <label className="text-[10px] font-bold font-mono text-ink-muted uppercase block mb-1">
                            [{vKey}]
                          </label>
                          <input
                            type="text"
                            value={variableMap[vKey]}
                            onChange={(e) => setVariableMap({ ...variableMap, [vKey]: e.target.value })}
                            placeholder={`Enter ${vKey.toLowerCase()}...`}
                            className="w-full bg-surface-1 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-sans"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hook Structure */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Core Hook Architecture</span>
                    </label>

                    <button
                      onClick={() => handleCopySection(substituteVariables(selectedTemplate.coreHookStructure), 'hook-detail')}
                      className="text-[11px] text-fuchsia-300 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      {copiedId === 'hook-detail' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Hook</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-0 border border-white/10 text-xs font-mono text-ink-secondary leading-relaxed">
                    {substituteVariables(selectedTemplate.coreHookStructure)}
                  </div>
                </div>

                {/* Body Template */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-violet-400" />
                      <span>Body Format & Script Outline</span>
                    </label>

                    <button
                      onClick={() => handleCopySection(substituteVariables(selectedTemplate.bodyFormatTemplate), 'body-detail')}
                      className="text-[11px] text-violet-300 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      {copiedId === 'body-detail' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Body Script</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-0 border border-white/10 text-xs font-mono text-ink-secondary whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {substituteVariables(selectedTemplate.bodyFormatTemplate)}
                  </div>
                </div>

                {/* Call to Action & Hashtags */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-0 border border-white/10">
                    <div className="text-[10px] font-bold uppercase text-ink-muted mb-1">Target Call To Action</div>
                    <div className="text-ink-secondary font-medium">{substituteVariables(selectedTemplate.callToAction)}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-0 border border-white/10">
                    <div className="text-[10px] font-bold uppercase text-ink-muted mb-1">Recommended Hashtags</div>
                    <div className="text-fuchsia-300 font-mono text-[11px] flex flex-wrap gap-1">
                      {selectedTemplate.hashtags.map((h) => (
                        <span key={h}>{h}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => {
                      const finalHook = substituteVariables(selectedTemplate.coreHookStructure);
                      if (onSelectTemplate) {
                        onSelectTemplate({
                          ...selectedTemplate,
                          coreHookStructure: finalHook,
                          bodyFormatTemplate: substituteVariables(selectedTemplate.bodyFormatTemplate),
                          callToAction: substituteVariables(selectedTemplate.callToAction)
                        });
                      } else {
                        navigator.clipboard.writeText(finalHook);
                        alert('Customized template hook copied to clipboard! Ready to deploy in Campaign Generator.');
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/25 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Deploy Blueprint in Generator</span>
                  </button>

                  <button
                    onClick={() => openCreateModal(selectedTemplate)}
                    className="w-full py-2.5 rounded-xl bg-surface-0 hover:bg-surface-2 text-ink-secondary hover:text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-violet-400" />
                    <span>Duplicate & Customize as New Blueprint</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: STUDY 12 VIRAL CASE STUDIES VAULT */}
      {viewTab === 'case-studies' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 12 Study Case Cards Grid */}
          <div className={`space-y-4 ${selectedStudy ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            <div className="flex items-center justify-between text-xs text-ink-muted px-1">
              <span>Showing <strong className="text-accent-brass-400 font-bold">{filteredStudies.length}</strong> real-world viral campaign teardowns</span>
              <span className="text-violet-400 font-medium">⚡ "Study 12" Verified Datasets</span>
            </div>

            <div className={`grid gap-4 ${selectedStudy ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredStudies.map((study) => {
                const isSelected = selectedStudy?.id === study.id;
                return (
                  <div
                    key={study.id}
                    onClick={() => setSelectedStudy(study)}
                    className={`group bg-surface-1/90 rounded-2xl p-5 border transition-colors cursor-pointer flex flex-col justify-between space-y-4 relative ${
                      isSelected
                        ? 'border-accent-brass-400 shadow-xl shadow-brass-500/10 ring-1 ring-brass-400/50'
                        : 'border-white/10 hover:border-white/15 hover:bg-surface-1'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-accent-brass-500/10 text-accent-brass-300 border border-brass-500/20 text-[10px] font-bold">
                          {study.niche}
                        </span>
                        <span className="text-[10px] font-mono text-ink-muted bg-surface-0 px-2 py-0.5 rounded border border-white/10">
                          {study.platform}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-accent-brass-300 transition-colors line-clamp-2">
                        {study.title}
                      </h3>

                      <p className="text-xs text-ink-muted mt-2 line-clamp-2 leading-relaxed">
                        {study.summary}
                      </p>

                      {/* Key Metrics Banner */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] bg-surface-0 p-2.5 rounded-xl border border-white/10">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Reach</span>
                          <span className="text-emerald-400 font-mono font-bold">{study.impressions}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Conversion Rate</span>
                          <span className="text-fuchsia-400 font-mono font-bold">{study.conversionRate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-accent-brass-300 font-mono text-[10px] font-semibold flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        <span>{study.keyMetric}</span>
                      </span>

                      <span className="text-ink-muted group-hover:text-white font-bold flex items-center gap-1 text-[11px]">
                        <span>Inspect Case</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Case Breakdown Detail Drawer */}
          {selectedStudy && (
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 bg-surface-1 rounded-2xl p-6 border border-brass-500/30 shadow-2xl space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-accent-brass-500/20 text-accent-brass-300 border border-brass-500/30 text-[10px] font-bold">
                        {selectedStudy.niche}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono text-[9px] border border-violet-500/30">
                        {selectedStudy.platform}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{selectedStudy.title}</h3>
                  </div>

                  <button
                    onClick={() => setSelectedStudy(null)}
                    className="p-1.5 rounded-lg bg-surface-0 hover:bg-surface-2 text-ink-muted hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-ink-secondary leading-relaxed">
                  {selectedStudy.summary}
                </p>

                {/* Metrics Highlight Banner */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-surface-0 rounded-xl border border-white/10 text-center">
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Impressions</div>
                    <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{selectedStudy.impressions}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Conv Rate</div>
                    <div className="text-xs font-mono font-bold text-fuchsia-400 mt-0.5">{selectedStudy.conversionRate}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Primary Result</div>
                    <div className="text-[10px] font-mono font-bold text-accent-brass-300 mt-0.5 truncate">{selectedStudy.keyMetric}</div>
                  </div>
                </div>

                {/* Original Winning Hook */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-accent-brass-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-accent-brass-300" />
                      <span>Original Winning Hook</span>
                    </label>
                    <button
                      onClick={() => handleCopySection(selectedStudy.originalHook, 'study-hook')}
                      className="text-[10px] text-accent-brass-300 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      {copiedId === 'study-hook' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Hook</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-0 border border-white/10 text-xs font-mono text-ink-secondary leading-relaxed">
                    "{selectedStudy.originalHook}"
                  </div>
                </div>

                {/* Winning Angle Analysis */}
                <div className="p-3.5 bg-surface-0 rounded-xl border border-violet-500/20 space-y-1">
                  <div className="text-[11px] font-bold text-violet-400 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-accent-brass-300" />
                    <span>Winning Core Angle</span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {selectedStudy.winningAngle}
                  </p>
                </div>

                {/* Algorithm Triggers */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-ink-muted block">Algorithm Viral Triggers</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudy.algorithmTriggers.map((trig, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-surface-0 border border-white/10 text-[11px] text-emerald-300 font-mono">
                        ⚡ {trig}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-ink-muted block">Key Tactical Takeaways</label>
                  <ul className="space-y-2">
                    {selectedStudy.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-ink-secondary">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Template Structure */}
                <div className="space-y-1.5 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-ink-muted block">Copyable Actionable Template</label>
                    <button
                      onClick={() => handleCopySection(selectedStudy.actionableTemplate, 'study-template')}
                      className="text-[10px] text-violet-300 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      {copiedId === 'study-template' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Template</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-0 border border-white/10 text-xs font-mono text-fuchsia-300">
                    {selectedStudy.actionableTemplate}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* Modal for AI Template Generation */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-surface-0/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Viral Template Architect</h3>
                  <p className="text-xs text-ink-muted">Generate a custom viral blueprint using Gemini AI</p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-lg bg-surface-0 text-ink-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-ink-secondary font-bold">
                Enter Niche, Product, or Campaign Topic
              </label>
              <input
                type="text"
                value={aiPromptTopic}
                onChange={(e) => setAiPromptTopic(e.target.value)}
                placeholder="e.g. Cold email lead magnet, Crypto AI trading bot, Fitness transformation..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
              />

              <div className="p-3 bg-surface-0 rounded-xl border border-white/10 text-[11px] text-ink-muted space-y-1">
                <span className="font-bold text-violet-400">⚡ AI Blueprint Output:</span>
                <p>Gemini will craft a multi-platform core hook structure, body format, bracket variables, hashtags, and CTA.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-0 text-ink-muted hover:text-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerateAiTemplate}
                disabled={isAiGenerating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/25 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAiGenerating ? <RefreshCw className="h-4 w-4 animate-spin text-accent-brass-300" /> : <Sparkles className="h-4 w-4 text-accent-brass-300" />}
                <span>{isAiGenerating ? 'Architecting Template...' : 'Generate AI Template'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-surface-0/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-1 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Save Custom Template</h3>
                  <p className="text-xs text-ink-muted">Store your favorite viral campaign framework for instant reuse</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-surface-0 text-ink-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-secondary font-bold mb-1.5">Template Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My High-Ticket B2B Lead Funnel"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <label className="block text-ink-secondary font-bold mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-0 border border-white/10 text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="Viral Threads">Viral Threads</option>
                    <option value="Short Video Scripts">Short Video Scripts</option>
                    <option value="B2B Thought Leadership">B2B Thought Leadership</option>
                    <option value="Product Launch Blitz">Product Launch Blitz</option>
                    <option value="Carousel Guides">Carousel Guides</option>
                    <option value="Direct Response Funnel">Direct Response Funnel</option>
                    <option value="Custom Saved">Custom Saved</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-ink-secondary font-bold mb-1.5">Description / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Best for converting cold newsletter readers into booked calls"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              {/* Target Platforms Checkboxes */}
              <div>
                <label className="block text-ink-secondary font-bold mb-2">Target Networks</label>
                <div className="flex flex-wrap gap-2">
                  {(['x', 'instagram', 'tiktok', 'facebook', 'threads', 'pinterest', 'linkedin'] as SocialPlatform[]).map((p) => {
                    const isChecked = formPlatforms.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => {
                          if (isChecked) {
                            setFormPlatforms(formPlatforms.filter((plat) => plat !== p));
                          } else {
                            setFormPlatforms([...formPlatforms, p]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500'
                            : 'bg-surface-0 text-ink-muted border-white/10 hover:border-white/15'
                        }`}
                      >
                        {platformIcons[p]}
                        <span className="capitalize">{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Hook */}
              <div>
                <label className="block text-ink-secondary font-bold mb-1.5">Core Hook Structure *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. If you are still doing [TOPIC] manually, here is the 3-step automation..."
                  value={formHook}
                  onChange={(e) => setFormHook(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              {/* Body Format Outline */}
              <div>
                <label className="block text-ink-secondary font-bold mb-1.5">Body Format & Content Steps *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Step 1: Pattern Interrupt&#10;Step 2: Proof & Metrics&#10;Step 3: Free Resource Download CTA"
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              {/* Call to Action & Hashtags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-secondary font-bold mb-1.5">Target Call To Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Comment 'SCALE' below for free template"
                    value={formCta}
                    onChange={(e) => setFormCta(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <label className="block text-ink-secondary font-bold mb-1.5">Recommended Hashtags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="ViralOS, Growth, Automation"
                    value={formHashtags}
                    onChange={(e) => setFormHashtags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-0 text-ink-muted hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loadingSave}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-fuchsia-500/25 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{loadingSave ? 'Saving...' : 'Save Template to Vault'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
