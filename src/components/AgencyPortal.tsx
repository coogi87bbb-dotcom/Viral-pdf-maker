import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Building2, 
  Briefcase, 
  DollarSign, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  Award,
  Layers,
  Calendar,
  Zap,
  Calculator,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  CheckCircle2,
  Share2,
  Sliders,
  UserCheck,
  RefreshCw,
  Printer,
  X,
  FileCheck2,
  Lock
} from 'lucide-react';
import { AgencyPitchData } from '../types';

// High-Ticket Agency Pitch Presets
const PROPOSAL_PRESETS = [
  {
    id: 'real-estate',
    label: 'Luxury Real Estate & Wealth Management',
    icon: Building2,
    clientName: 'Apex Wealth & Luxury Real Estate',
    clientIndustry: 'High-Ticket Financial Services & Luxury Real Estate',
    monthlyRetainer: '8500',
    description: 'Targeting ultra-high-net-worth buyers with high-contrast video reels and architectural carousels.'
  },
  {
    id: 'b2b-saas',
    label: 'B2B SaaS & Enterprise Tech Founder',
    icon: Layers,
    clientName: 'CloudScale Intelligence',
    clientIndustry: 'Enterprise B2B SaaS & Developer Infrastructure',
    monthlyRetainer: '12000',
    description: 'Programmatic SEO, developer thought leadership, and automated comment-to-DM demo funnels.'
  },
  {
    id: 'ecommerce-dtc',
    label: 'E-Commerce & DTC Brand Scale',
    icon: DollarSign,
    clientName: 'Aura Organic Skincare',
    clientIndustry: 'DTC Health, Beauty & E-Commerce',
    monthlyRetainer: '6500',
    description: 'High-frequency TikTok/Reels pattern interrupts, influencer UGC repurposing, and Pinterest SEO.'
  },
  {
    id: 'healthcare',
    label: 'Private Healthcare & High-Ticket Dental',
    icon: ShieldCheck,
    clientName: 'Savant Dental & Facial Aesthetics',
    clientIndustry: 'High-Ticket Cosmetic Dentistry & Private Medical',
    monthlyRetainer: '4500',
    description: 'Patient transformation case studies, local trust building, and direct-to-calendar booking funnels.'
  }
];

export const AgencyPortal: React.FC = () => {
  // Agency White-Label Branding State
  const [agencyName, setAgencyName] = useState('Apex Viral Media Studio');
  const [agencyAccentColor, setAgencyAccentColor] = useState<'violet' | 'emerald' | 'amber' | 'cyan'>('violet');

  // Proposal Input Parameters
  const [clientName, setClientName] = useState(PROPOSAL_PRESETS[0].clientName);
  const [clientIndustry, setClientIndustry] = useState(PROPOSAL_PRESETS[0].clientIndustry);
  const [monthlyRetainer, setMonthlyRetainer] = useState(PROPOSAL_PRESETS[0].monthlyRetainer);
  const [selectedPresetId, setSelectedPresetId] = useState(PROPOSAL_PRESETS[0].id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedProposal, setCopiedProposal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // View Mode State
  const [viewMode, setViewMode] = useState<'document' | 'presentation' | 'tiers' | 'roi' | 'roadmap'>('document');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Interactive ROI Calculator State
  const [calcInquiries, setCalcInquiries] = useState(140);
  const [calcDealValue, setCalcDealValue] = useState(1500);
  const [calcCloseRate, setCalcCloseRate] = useState(15); // 15%

  // Simulated E-Signature Approval State
  const [clientSigned, setClientSigned] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('CEO / Managing Director');
  const [showSignModal, setShowSignModal] = useState(false);

  // Proposal State
  const [proposal, setProposal] = useState<AgencyPitchData>({
    clientName: PROPOSAL_PRESETS[0].clientName,
    agencyName: 'Apex Viral Media Studio',
    proposalTitle: '30-Day Omni-Channel Social Domination & Lead Acquisition Blueprint',
    monthlyFee: '$8,500/month Retainer',
    executiveSummary: 'High-impact growth audit detailing how Apex Viral Media Studio will expand Apex Wealth & Luxury Real Estate’s brand footprint in High-Ticket Financial Services & Luxury Real Estate by 350% across X, Instagram, TikTok, LinkedIn, and Pinterest using AI-automated content operations.',
    deliverables: [
      '60 Custom High-Virality Posts per Month across 7 Primary Social Networks',
      '12 Short-Form Video Script Teleprompter Guides & Visual Direction',
      '4 Custom Carousel Decks & Infographic Lead Magnets',
      'Automated Comment-to-DM Direct Lead Capture Funnels',
      'Weekly Virality Algorithm Audits & Content Refinement Cycles',
      'Dedicated White-Label Client Analytics Portal & Executive Monthly Report'
    ],
    competitorGapAnalysis: 'Current competitors in High-Ticket Financial Services & Luxury Real Estate rely on generic static stock graphics without pattern interrupts. Apex Viral Media Studio will deploy cognitive emotional hooks to capture 4.5x higher retention and establish category supremacy.',
    roiProjection: 'Expected to generate 140+ high-intent lead inquiries in the first 60 days, delivering an estimated 5.8x ROI on the $8,500/month investment.',
    packageTiers: [
      {
        name: 'Organic Acceleration Tier',
        monthlyFee: '$5,100/mo',
        description: 'Essential multi-platform content engine for emerging brands seeking consistent audience growth.',
        features: [
          '30 High-Retention Posts/Month (1x/day)',
          '3 Social Platforms (X, Instagram, LinkedIn)',
          'Monthly Performance Analytics Report'
        ],
        isRecommended: false
      },
      {
        name: 'Omni-Channel Scale Tier (Recommended)',
        monthlyFee: '$8,500/mo',
        description: 'Full-stack programmatic distribution engine for brands ready to dominate their industry sector.',
        features: [
          '60 High-Retention Posts/Month (2x/day)',
          '7 Social Networks (X, IG, TikTok, LinkedIn, Pinterest, Threads, FB)',
          '12 Short Video Teleprompter Scripts',
          'Automated Lead Capture DM Workflows',
          'Weekly Optimization & Executive Dashboard'
        ],
        isRecommended: true
      },
      {
        name: 'Category Domination Blitz Tier',
        monthlyFee: '$15,300/mo',
        description: 'Aggressive high-volume content blitz for enterprise market leaders seeking total category share.',
        features: [
          '120 High-Retention Posts/Month (4x/day)',
          'All 7 Networks + Custom Newsletter Digest',
          '24 Short Video Scripts + AI Voiceover Edits',
          'Dedicated Growth Strategist & Daily Lead Routing'
        ],
        isRecommended: false
      }
    ],
    roadmap90Days: [
      {
        month: 'Month 1: Foundation & Hook Testing',
        focus: 'Audience Avatar Audit & Hook Pattern Testing',
        keyMilestones: [
          'Deploy first 60 high-retention content assets across 7 networks',
          'Test 15 emotional hook variations to establish baseline virality score',
          'Integrate automated comment-to-DM lead capture routing'
        ]
      },
      {
        month: 'Month 2: Scaling High-Performers',
        focus: 'Format Expansion & Video Teleprompters',
        keyMilestones: [
          'Double down on top 10% performing hook formats',
          'Launch 12 short-form video reels with custom teleprompter scripts',
          'Scale lead inquiry velocity by 250%'
        ]
      },
      {
        month: 'Month 3: Automated Market Domination',
        focus: 'Evergreen Repurposing & Funnel Optimization',
        keyMilestones: [
          'Build evergreen content loops for 18-month compounding traffic',
          'Achieve $25,000+ monthly revenue contribution to client funnel',
          'Establish automated white-label reporting dashboard'
        ]
      }
    ],
    roiCalculator: {
      estimatedMonthlyInquiries: 140,
      avgDealValue: 1500,
      estimatedMonthlyRevenue: '$31,500',
      projectedROI: '3.7x Net Client ROI'
    },
    slaGuarantee: '100% Satisfaction SLA: If Apex Viral Media Studio does not deliver all 60 scheduled content assets on time according to the agreed calendar, we will credit 50% of the monthly retainer back to your account.'
  });

  const handleSelectPreset = (preset: typeof PROPOSAL_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setClientName(preset.clientName);
    setClientIndustry(preset.clientIndustry);
    setMonthlyRetainer(preset.monthlyRetainer);
  };

  const handleGeneratePitch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clientName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/viral/agency-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientIndustry,
          monthlyRetainer,
          agencyName
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Proposal generation failed');
      }

      const data: AgencyPitchData = await response.json();
      setProposal(data);
      setClientSigned(false); // reset signature on new proposal
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate proposal.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProposal = () => {
    const text = `PROPOSAL: ${proposal.proposalTitle}
Prepared By: ${agencyName}
Prepared For: ${proposal.clientName}
Fee: ${proposal.monthlyFee}

EXECUTIVE SUMMARY:
${proposal.executiveSummary}

DELIVERABLES:
${proposal.deliverables.map(d => `• ${d}`).join('\n')}

COMPETITOR GAP ANALYSIS:
${proposal.competitorGapAnalysis}

ROI PROJECTION:
${proposal.roiProjection}

SLA GUARANTEE:
${proposal.slaGuarantee || 'Standard SLA Guarantee Active'}`;

    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  const handleCopyShareableLink = () => {
    const fakeLink = `${window.location.origin}/proposal/${encodeURIComponent(clientName.toLowerCase().replace(/\s+/g, '-'))}`;
    navigator.clipboard.writeText(fakeLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Sign Proposal Handler
  const handleSignProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) return;
    setClientSigned(true);
    setShowSignModal(false);
  };

  // Calculated ROI values
  const closedDeals = Math.round((calcInquiries * calcCloseRate) / 100);
  const monthlyRevenue = closedDeals * calcDealValue;
  const annualRevenue = monthlyRevenue * 12;
  const retainerValueNum = parseInt(monthlyRetainer) || 5000;
  const netROI = retainerValueNum > 0 ? (monthlyRevenue / retainerValueNum).toFixed(1) : '0';

  // Presentation Slide Deck Data
  const slides = [
    {
      title: 'Executive Growth Audit',
      subtitle: `Prepared for ${proposal.clientName} by ${agencyName}`,
      content: proposal.executiveSummary,
      icon: <Building2 className="h-8 w-8 text-accent-brass-400" />
    },
    {
      title: 'Competitor Gap Analysis',
      subtitle: 'Market Supremacy & Cognitive Hooks Strategy',
      content: proposal.competitorGapAnalysis,
      icon: <Layers className="h-8 w-8 text-accent-brass-400" />
    },
    {
      title: 'Monthly Core Deliverables',
      subtitle: 'Full-Stack Programmatic Content Matrix',
      deliverables: proposal.deliverables,
      icon: <ShieldCheck className="h-8 w-8 text-status-positive" />
    },
    {
      title: '90-Day Implementation Roadmap',
      subtitle: '3-Phase Growth & Conversion Timeline',
      roadmap: proposal.roadmap90Days,
      icon: <Calendar className="h-8 w-8 text-accent-brass-400" />
    },
    {
      title: 'Financial ROI & Growth Projection',
      subtitle: `Target Investment: ${proposal.monthlyFee}`,
      content: proposal.roiProjection,
      icon: <TrendingUp className="h-8 w-8 text-status-positive" />
    },
    {
      title: 'Contractual SLA Guarantee & Terms',
      subtitle: '100% Performance Commitment',
      content: proposal.slaGuarantee,
      icon: <Award className="h-8 w-8 text-accent-brass-400" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-surface-1 p-6 sm:p-8 rounded-3xl border border-hairline shadow-[var(--shadow-panel-brass)] space-y-6">
        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 bg-accent-brass-500/[0.07] rounded-full blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-brass-500/40 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent-brass-500/10 border border-accent-brass-500/25 text-[11px] font-mono font-bold uppercase tracking-wider text-accent-brass-300 mb-3">
            <Briefcase className="h-3.5 w-3.5 text-accent-brass-400" />
            <span>Commercial High-Ticket B2B Engine</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-primary tracking-[-0.02em]">
            White-Label Agency Client Proposal Studio
          </h2>
          <p className="text-sm text-ink-muted mt-2 max-w-3xl leading-[1.7]">
            Generate high-converting, white-label client proposals, pitch decks, 90-day roadmaps, and financial ROI calculators to close $3,000–$15,000/month agency retainers.
          </p>
        </div>

        {/* 1-Click High-Ticket Proposal Presets */}
        <div className="relative">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-accent-brass-400" />
            <span>Select High-Ticket Client Industry Preset</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROPOSAL_PRESETS.map((preset) => {
              const PresetIcon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  aria-pressed={selectedPresetId === preset.id}
                  className={`p-3 rounded-xl border text-left transition-colors space-y-1.5 relative overflow-hidden cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
                    selectedPresetId === preset.id
                      ? 'bg-surface-2 border-accent-brass-500 ring-1 ring-accent-brass-500/40 shadow-[var(--shadow-panel-brass)]'
                      : 'bg-surface-0 border-hairline text-ink-muted hover:bg-surface-2 hover:border-hairline-strong'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink-primary truncate">
                    <PresetIcon className="h-3.5 w-3.5 text-accent-brass-400 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </div>
                  <p className="text-[10px] text-ink-muted line-clamp-2 leading-[1.6]">
                    {preset.description}
                  </p>
                  <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-status-positive-dim text-status-positive border border-status-positive/20">
                    ${parseInt(preset.monthlyRetainer).toLocaleString()}/mo Retainer
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form & Agency White-Label Branding */}
        <form onSubmit={handleGeneratePitch} className="relative space-y-4 bg-surface-0 p-5 rounded-xl border border-hairline">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block mb-1.5">
                Your Agency Brand Name
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-surface-1 border border-hairline rounded-lg px-3.5 py-2.5 text-ink-primary text-xs font-bold transition-colors focus:outline-none focus:border-accent-brass-500 focus-visible:ring-2 focus-visible:ring-accent-brass-400/30"
                placeholder="e.g. Apex Viral Media Studio"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block mb-1.5">
                Prospect Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-surface-1 border border-hairline rounded-lg px-3.5 py-2.5 text-ink-primary text-xs transition-colors focus:outline-none focus:border-accent-brass-500 focus-visible:ring-2 focus-visible:ring-accent-brass-400/30"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block mb-1.5">
                Client Industry / Niche
              </label>
              <input
                type="text"
                value={clientIndustry}
                onChange={(e) => setClientIndustry(e.target.value)}
                className="w-full bg-surface-1 border border-hairline rounded-lg px-3.5 py-2.5 text-ink-primary text-xs transition-colors focus:outline-none focus:border-accent-brass-500 focus-visible:ring-2 focus-visible:ring-accent-brass-400/30"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block mb-1.5">
                Target Monthly Retainer Fee
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-ink-muted text-xs font-bold">$</span>
                <input
                  type="number"
                  value={monthlyRetainer}
                  onChange={(e) => setMonthlyRetainer(e.target.value)}
                  className="w-full bg-surface-1 border border-hairline rounded-lg pl-7 pr-3.5 py-2.5 text-ink-primary text-xs transition-colors focus:outline-none focus:border-accent-brass-500 focus-visible:ring-2 focus-visible:ring-accent-brass-400/30 font-mono font-bold"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !clientName.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 hover:brightness-105 text-slate-950 font-bold text-xs shadow-[var(--shadow-glow-brass)] transition-[filter,transform] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                <span>Generating white-label proposal deck…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-slate-950" />
                <span>Generate Enterprise Client Proposal Deck</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="relative p-3.5 rounded-lg bg-status-danger-dim border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* PROPOSAL STUDIO DISPLAY DASHBOARD */}
      <div className="bg-surface-1 rounded-2xl border border-hairline p-6 sm:p-8 shadow-[var(--shadow-panel)] space-y-6">
        {/* White-Label Header & Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-accent-brass-400" />
              <div>
                <span className="text-[10px] font-bold text-accent-brass-400 uppercase tracking-widest block">
                  White-Label Agency Proposal · {agencyName}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary tracking-[-0.01em]">{proposal.proposalTitle}</h3>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {clientSigned ? (
              <span className="px-3 py-1.5 rounded-lg bg-status-positive-dim border border-status-positive/30 text-status-positive text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Signed & Approved by {signerName || 'Client'}</span>
              </span>
            ) : (
              <button
                onClick={() => setShowSignModal(true)}
                className="px-3.5 py-2 rounded-lg bg-status-positive hover:brightness-105 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[var(--shadow-panel)] transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-positive focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Sign & Approve Proposal</span>
              </button>
            )}

            <button
              onClick={handleCopyShareableLink}
              className="px-3.5 py-2 rounded-lg bg-surface-2 border border-hairline hover:bg-surface-3 hover:border-accent-brass-500/30 text-ink-secondary hover:text-ink-primary text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
            >
              {copiedLink ? <Check className="h-4 w-4 text-status-positive" /> : <Share2 className="h-4 w-4 text-accent-brass-400" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>

            <button
              onClick={handleCopyProposal}
              className="px-3.5 py-2 rounded-lg bg-surface-2 border border-hairline hover:bg-surface-3 hover:border-accent-brass-500/30 text-ink-secondary hover:text-ink-primary text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
            >
              {copiedProposal ? <Check className="h-4 w-4 text-status-positive" /> : <Copy className="h-4 w-4 text-accent-brass-400" />}
              <span>{copiedProposal ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-lg bg-accent-brass-500 hover:brightness-105 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[var(--shadow-panel-brass)] transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-3">
          <button
            onClick={() => setViewMode('document')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
              viewMode === 'document' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'bg-surface-0 border border-hairline text-ink-muted hover:bg-surface-2 hover:text-ink-primary'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Full Executive Document</span>
          </button>

          <button
            onClick={() => setViewMode('presentation')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
              viewMode === 'presentation' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'bg-surface-0 border border-hairline text-ink-muted hover:bg-surface-2 hover:text-ink-primary'
            }`}
          >
            <Maximize2 className="h-4 w-4" />
            <span>Live Pitch Deck Mode (Zoom / Meet)</span>
          </button>

          <button
            onClick={() => setViewMode('tiers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
              viewMode === 'tiers' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'bg-surface-0 border border-hairline text-ink-muted hover:bg-surface-2 hover:text-ink-primary'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>3-Tier Package Pricing</span>
          </button>

          <button
            onClick={() => setViewMode('roadmap')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
              viewMode === 'roadmap' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'bg-surface-0 border border-hairline text-ink-muted hover:bg-surface-2 hover:text-ink-primary'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>90-Day Implementation Roadmap</span>
          </button>

          <button
            onClick={() => setViewMode('roi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${
              viewMode === 'roi' ? 'bg-accent-brass-500 text-slate-950 shadow-[var(--shadow-panel-brass)]' : 'bg-surface-0 border border-hairline text-ink-muted hover:bg-surface-2 hover:text-ink-primary'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>Interactive ROI Calculator</span>
          </button>
        </div>

        {/* VIEW MODE 1: FULL EXECUTIVE DOCUMENT */}
        {viewMode === 'document' && (
          <div className="space-y-6 text-xs leading-[1.6] text-ink-secondary bg-surface-0 p-6 sm:p-8 rounded-xl border border-hairline">
            {/* Document Header Metadata Box */}
            <div className="flex flex-wrap justify-between items-center bg-surface-1 p-4 rounded-xl border border-hairline gap-4">
              <div>
                <span className="text-[10px] text-ink-muted font-bold uppercase block">Prepared For Client</span>
                <span className="text-sm font-bold text-ink-primary">{proposal.clientName}</span>
              </div>

              <div>
                <span className="text-[10px] text-ink-muted font-bold uppercase block">Prepared By Agency</span>
                <span className="text-sm font-bold text-accent-brass-400">{agencyName}</span>
              </div>

              <div>
                <span className="text-[10px] text-ink-muted font-bold uppercase block">Proposed Investment</span>
                <span className="text-sm font-bold text-status-positive font-mono">{proposal.monthlyFee}</span>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent-brass-400 flex items-center gap-2">
                <span>1. Executive Growth Audit & Strategy Overview</span>
              </h4>
              <p className="bg-surface-1 p-4 rounded-lg border border-hairline text-ink-secondary leading-[1.6]">
                {proposal.executiveSummary}
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent-brass-400 flex items-center gap-2">
                <span>2. Monthly Core Deliverables Matrix</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proposal.deliverables.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-surface-1 border border-hairline flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-status-positive shrink-0 mt-0.5" />
                    <span className="text-ink-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 & 4 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent-brass-400">
                  3. Competitor Gap Analysis
                </h4>
                <p className="bg-surface-1 p-4 rounded-lg border border-hairline text-ink-secondary leading-[1.6]">
                  {proposal.competitorGapAnalysis}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent-brass-400">
                  4. Projected Client ROI & Inquiries
                </h4>
                <p className="bg-surface-1 p-4 rounded-lg border border-hairline font-medium text-status-positive leading-[1.6]">
                  {proposal.roiProjection}
                </p>
              </div>
            </div>

            {/* Section 5: SLA Guarantee */}
            {proposal.slaGuarantee && (
              <div className="p-4 rounded-xl bg-accent-brass-500/10 border border-accent-brass-500/25 text-xs text-accent-brass-300 flex items-start gap-3">
                <Award className="h-5 w-5 text-accent-brass-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold uppercase text-accent-brass-200 mb-0.5">5. Service Level Agreement (SLA) & Quality Guarantee</strong>
                  <span>{proposal.slaGuarantee}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 2: LIVE PRESENTATION PITCH DECK */}
        {viewMode === 'presentation' && (
          <div className="bg-surface-0 p-8 sm:p-12 rounded-2xl border border-hairline space-y-8 min-h-[450px] flex flex-col justify-between shadow-[var(--shadow-panel)] relative">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                {slides[currentSlideIndex].icon}
                <div>
                  <span className="text-[10px] font-bold text-accent-brass-400 uppercase tracking-widest block">
                    Slide {currentSlideIndex + 1} of {slides.length} · {agencyName} pitch deck
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-ink-primary tracking-[-0.01em]">{slides[currentSlideIndex].title}</h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-ink-muted bg-surface-1 px-3 py-1 rounded-full border border-hairline">
                Client: {proposal.clientName}
              </span>
            </div>

            {/* Slide Body Content */}
            <div className="py-6 space-y-6">
              <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
                {slides[currentSlideIndex].subtitle}
              </p>

              {slides[currentSlideIndex].content && (
                <div className="bg-surface-1 p-6 rounded-xl border border-hairline text-sm text-ink-secondary leading-[1.6]">
                  {slides[currentSlideIndex].content}
                </div>
              )}

              {slides[currentSlideIndex].deliverables && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slides[currentSlideIndex].deliverables?.map((d, i) => (
                    <div key={i} className="p-4 rounded-lg bg-surface-1 border border-hairline text-xs font-bold text-ink-primary flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-status-positive shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {slides[currentSlideIndex].roadmap && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {slides[currentSlideIndex].roadmap?.map((r, i) => (
                    <div key={i} className="p-4 rounded-lg bg-surface-1 border border-hairline space-y-2 text-xs">
                      <span className="text-xs font-bold text-accent-brass-400">{r.month}</span>
                      <p className="text-ink-secondary font-bold">{r.focus}</p>
                      <ul className="space-y-1 text-ink-muted text-[11px] list-disc list-inside">
                        {r.keyMilestones.map((m, j) => <li key={j}>{m}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slide Controls */}
            <div className="flex items-center justify-between border-t border-hairline pt-4">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-lg bg-surface-2 border border-hairline hover:bg-surface-3 text-ink-secondary hover:text-ink-primary text-xs font-bold flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Slide</span>
              </button>

              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-[width,background-color] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                      currentSlideIndex === idx ? 'w-8 bg-accent-brass-500' : 'w-2.5 bg-surface-2 hover:bg-surface-3'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-lg bg-accent-brass-500 hover:brightness-105 text-slate-950 text-xs font-bold flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none shadow-[var(--shadow-panel-brass)] transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
              >
                <span>Next Slide</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: 3-TIER PACKAGE PRICING */}
        {viewMode === 'tiers' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent-brass-400" />
              <span>Multi-Tier Agency Retainer Investment Options</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(proposal.packageTiers || [
                {
                  name: 'Organic Acceleration Tier',
                  monthlyFee: '$5,100/mo',
                  description: 'Essential content engine.',
                  features: ['30 Posts/Month', '3 Platforms', 'Analytics Report']
                },
                {
                  name: 'Omni-Channel Scale Tier',
                  monthlyFee: '$8,500/mo',
                  description: 'Full programmatic engine.',
                  features: ['60 Posts/Month', '7 Platforms', '12 Video Scripts'],
                  isRecommended: true
                },
                {
                  name: 'Category Domination Tier',
                  monthlyFee: '$15,300/mo',
                  description: 'High volume market blitz.',
                  features: ['120 Posts/Month', 'All Platforms', '24 Video Scripts']
                }
              ]).map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-xl border space-y-4 relative flex flex-col justify-between ${
                    tier.isRecommended
                      ? 'bg-surface-0 border-accent-brass-500 ring-1 ring-accent-brass-500/40 shadow-[var(--shadow-panel-brass)]'
                      : 'bg-surface-0 border-hairline'
                  }`}
                >
                  {tier.isRecommended && (
                    <span className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-accent-brass-500 to-accent-brass-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-[var(--shadow-panel-brass)]">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-2">
                    <h5 className="text-sm font-bold text-ink-primary">{tier.name}</h5>
                    <div className="text-2xl font-semibold text-status-positive font-mono tabular-nums">{tier.monthlyFee}</div>
                    <p className="text-xs text-ink-muted leading-[1.6]">{tier.description}</p>
                  </div>

                  <div className="space-y-2 py-4 border-t border-hairline">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">Features Included:</span>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-ink-secondary">
                        <CheckCircle2 className="h-4 w-4 text-status-positive shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setMonthlyRetainer(tier.monthlyFee.replace(/[^0-9]/g, ''));
                      setViewMode('document');
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                      tier.isRecommended
                        ? 'bg-accent-brass-500 hover:brightness-105 text-slate-950 shadow-[var(--shadow-panel-brass)]'
                        : 'bg-surface-2 border border-hairline hover:bg-surface-3 text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    Select This Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW MODE 4: 90-DAY IMPLEMENTATION ROADMAP */}
        {viewMode === 'roadmap' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent-brass-400" />
              <span>90-Day Execution Roadmap & Growth Milestones</span>
            </h4>

            <div className="space-y-4">
              {(proposal.roadmap90Days || []).map((step, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-surface-0 border border-hairline space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-2">
                    <span className="text-xs font-bold text-accent-brass-400 uppercase tracking-wider">
                      {step.month}
                    </span>
                    <span className="text-xs font-bold text-accent-brass-300 bg-accent-brass-500/10 px-2.5 py-0.5 rounded border border-accent-brass-500/20">
                      Focus: {step.focus}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">Key Milestones & Deliverables</span>
                    {step.keyMilestones.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-2 text-xs text-ink-secondary">
                        <CheckCircle2 className="h-4 w-4 text-status-positive shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW MODE 5: INTERACTIVE ROI CALCULATOR */}
        {viewMode === 'roi' && (
          <div className="bg-surface-0 p-6 rounded-xl border border-hairline space-y-6">
            <div>
              <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2 mb-1">
                <Calculator className="h-4 w-4 text-accent-brass-400" />
                <span>Interactive Client ROI & Pipeline Projections</span>
              </h4>
              <p className="text-xs text-ink-muted">
                Adjust sliders below to demonstrate projected client monthly revenue and net ROI multiplier live during sales calls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-secondary flex justify-between">
                  <span>Monthly Inbound Lead Inquiries</span>
                  <strong className="text-accent-brass-400 font-mono">{calcInquiries} Leads</strong>
                </label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  value={calcInquiries}
                  onChange={(e) => setCalcInquiries(parseInt(e.target.value))}
                  className="w-full accent-brass-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-secondary flex justify-between">
                  <span>Average Customer Deal Value ($)</span>
                  <strong className="text-accent-brass-400 font-mono">${calcDealValue.toLocaleString()}</strong>
                </label>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={calcDealValue}
                  onChange={(e) => setCalcDealValue(parseInt(e.target.value))}
                  className="w-full accent-brass-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-secondary flex justify-between">
                  <span>Client Close Rate (%)</span>
                  <strong className="text-accent-brass-400 font-mono">{calcCloseRate}%</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={calcCloseRate}
                  onChange={(e) => setCalcCloseRate(parseInt(e.target.value))}
                  className="w-full accent-brass-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Projected Output Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-hairline">
              <div className="p-4 rounded-lg bg-surface-1 border border-hairline space-y-1">
                <span className="text-[10px] text-ink-muted font-bold uppercase block">Projected Monthly Closed Deals</span>
                <span className="text-2xl font-semibold text-ink-primary font-mono tabular-nums">{closedDeals} Deals/mo</span>
              </div>

              <div className="p-4 rounded-lg bg-surface-1 border border-hairline space-y-1">
                <span className="text-[10px] text-ink-muted font-bold uppercase block">Est. Monthly Added Revenue</span>
                <span className="text-2xl font-semibold text-status-positive font-mono tabular-nums">${monthlyRevenue.toLocaleString()}</span>
              </div>

              <div className="p-4 rounded-lg bg-surface-1 border border-hairline space-y-1">
                <span className="text-[10px] text-ink-muted font-bold uppercase block">Projected Retainer Net ROI</span>
                <span className="text-2xl font-semibold text-accent-brass-300 font-mono tabular-nums">{netROI}x Net ROI</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SIMULATED CLIENT E-SIGNATURE MODAL */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-hairline rounded-2xl max-w-md w-full p-6 space-y-5 shadow-[var(--shadow-panel-brass)] relative">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-status-positive" />
                <h3 className="font-display text-lg font-semibold text-ink-primary tracking-[-0.01em]">Sign & Approve Client Proposal</h3>
              </div>
              <button onClick={() => setShowSignModal(false)} className="text-ink-muted hover:text-ink-primary p-1 rounded-md bg-surface-2 transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSignProposal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">
                  Client Authorized Signer Name
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Johnathan Vance"
                  className="w-full bg-surface-0 border border-hairline rounded-lg px-3.5 py-2.5 text-ink-primary text-xs font-bold transition-colors focus:outline-none focus:border-status-positive focus-visible:ring-2 focus-visible:ring-status-positive/30"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">
                  Signer Title
                </label>
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-lg px-3.5 py-2.5 text-ink-primary text-xs font-bold transition-colors focus:outline-none focus:border-status-positive focus-visible:ring-2 focus-visible:ring-status-positive/30"
                  required
                />
              </div>

              <div className="p-3.5 rounded-lg bg-surface-0 border border-hairline text-[11px] text-ink-muted font-mono">
                By clicking "Confirm Digital Signature", you approve the monthly retainer investment of <strong className="text-status-positive">{proposal.monthlyFee}</strong> for {proposal.clientName}.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-2 border border-hairline text-ink-secondary text-xs font-bold hover:bg-surface-3 hover:text-ink-primary transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-status-positive hover:brightness-105 text-slate-950 text-xs font-bold shadow-[var(--shadow-panel)] transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-positive"
                >
                  Confirm Digital Signature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
