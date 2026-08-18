import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { OWNER_EMAIL } from '../lib/firebase';
import {
  Briefcase, 
  Plus, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  Zap, 
  Layers, 
  Copy, 
  Check, 
  Send, 
  User, 
  Star, 
  ShieldCheck, 
  BarChart, 
  ChevronRight,
  Download,
  Flame,
  Rocket,
  Mail,
  Compass,
  FileSpreadsheet,
  Target,
  Award,
  Crown,
  LogOut,
  FileOutput
} from 'lucide-react';

interface GigPackage {
  id: string;
  title: string;
  category: string;
  basicPrice: number;
  standardPrice: number;
  premiumPrice: number;
  basicDeliveryDays: number;
  standardDeliveryDays: number;
  premiumDeliveryDays: number;
  deliverables: string[];
  salesCount: number;
  rating: number;
}

interface GigOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  gigTitle: string;
  tier: 'Basic' | 'Standard' | 'Premium';
  amount: number;
  status: 'Inquiry' | 'Proposal Sent' | 'In Progress' | 'Review' | 'Completed' | 'Paid';
  dueDate: string;
  createdAt: string;
}

const INITIAL_GIGS: GigPackage[] = [
  {
    id: 'gig-1',
    title: 'High-DPI Viral PDF Lead Magnet & E-Book Studio',
    category: 'Document Design & Publishing',
    basicPrice: 150,
    standardPrice: 350,
    premiumPrice: 750,
    basicDeliveryDays: 2,
    standardDeliveryDays: 4,
    premiumDeliveryDays: 7,
    deliverables: [
      'Custom Cover & Typographic Layout',
      'Interactive Table of Contents & CTAs',
      'High-DPI PDF Export + Source File',
      '3D Hardcover Book Mockup Graphics',
      'Full Commercial Monetization License'
    ],
    salesCount: 28,
    rating: 4.9
  },
  {
    id: 'gig-2',
    title: '7-Network Omni-Channel Viral Campaign Engine',
    category: 'Viral Marketing & Social Strategy',
    basicPrice: 250,
    standardPrice: 500,
    premiumPrice: 1200,
    basicDeliveryDays: 3,
    standardDeliveryDays: 5,
    premiumDeliveryDays: 10,
    deliverables: [
      '7 Network Content Packs (X, IG, TikTok, FB, etc.)',
      'Psychological Hooks & High-Retention Teleprompter Scripts',
      'Custom Visual Infographics & Ad Banners',
      'Competitor Parity Breakdown',
      '30-Day Content Publishing Calendar'
    ],
    salesCount: 42,
    rating: 5.0
  },
  {
    id: 'gig-3',
    title: 'White-Label Agency Client Portal & Funnel Setup',
    category: 'Agency Retainers & Automation',
    basicPrice: 500,
    standardPrice: 1200,
    premiumPrice: 2500,
    basicDeliveryDays: 5,
    standardDeliveryDays: 7,
    premiumDeliveryDays: 14,
    deliverables: [
      'Done-For-You Client Proposal & Audit Deck',
      'High-Converting Retainer Sales Pitch',
      'ROI & Cost-Savings Calculator Customization',
      'Automated Lead Generation Script Templates',
      'Monthly Retainer Management Workflow'
    ],
    salesCount: 19,
    rating: 4.9
  }
];

const INITIAL_ORDERS: GigOrder[] = [
  {
    id: 'ord-101',
    clientName: 'Apex Growth Agency',
    clientEmail: 'sarah@apexgrowth.io',
    gigTitle: 'White-Label Agency Client Portal & Funnel Setup',
    tier: 'Premium',
    amount: 2500,
    status: 'In Progress',
    dueDate: '2026-08-10',
    createdAt: '2026-08-01'
  },
  {
    id: 'ord-102',
    clientName: 'SaaS Launchpad Pro',
    clientEmail: 'devin@saaslaunch.com',
    gigTitle: 'High-DPI Viral PDF Lead Magnet & E-Book Studio',
    tier: 'Standard',
    amount: 350,
    status: 'Proposal Sent',
    dueDate: '2026-08-07',
    createdAt: '2026-08-03'
  },
  {
    id: 'ord-103',
    clientName: 'Omni Media Ventures',
    clientEmail: 'alex@omnimedia.co',
    gigTitle: '7-Network Omni-Channel Viral Campaign Engine',
    tier: 'Basic',
    amount: 250,
    status: 'Paid',
    dueDate: '2026-08-02',
    createdAt: '2026-07-28'
  }
];

interface GigScaleProps {
  onSendToPdf: (text: string, title: string) => void;
}

export const GigScale: React.FC<GigScaleProps> = ({ onSendToPdf }) => {
  const { user, logout } = useAuth();
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const [gigs, setGigs] = useState<GigPackage[]>(INITIAL_GIGS);
  const [orders, setOrders] = useState<GigOrder[]>(INITIAL_ORDERS);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'packages' | 'pipeline' | 'ai-pitch' | 'audit-deck' | 'outreach' | 'roadmap' | 'calculator'>('overview');
  const [suiteMode, setSuiteMode] = useState<'full-os' | 'seller' | 'buyer'>('full-os');

  // Hire / Order Gig Modal State (for Buyers)
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedGigToHire, setSelectedGigToHire] = useState<GigPackage | null>(null);
  const [hireTier, setHireTier] = useState<'Basic' | 'Standard' | 'Premium'>('Standard');
  const [hireClientName, setHireClientName] = useState('');
  const [hireClientEmail, setHireClientEmail] = useState('');
  const [hireRequirements, setHireRequirements] = useState('');
  const [hireSuccessMsg, setHireSuccessMsg] = useState<string | null>(null);

  // Profit Audit Modal State
  const [showProfitAuditModal, setShowProfitAuditModal] = useState(false);
  const [auditTargetRevenue, setAuditTargetRevenue] = useState('10000');
  const [auditCurrentRate, setAuditCurrentRate] = useState('50');

  // Log Order Modal State
  const [showLogOrderModal, setShowLogOrderModal] = useState(false);
  const [logClientName, setLogClientName] = useState('');
  const [logClientEmail, setLogClientEmail] = useState('');
  const [logGigTitle, setLogGigTitle] = useState('High-DPI Viral PDF Lead Magnet & E-Book Studio');
  const [logAmount, setLogAmount] = useState('350');
  const [logDueDate, setLogDueDate] = useState('2026-08-15');
  
  // AI Pitch Generator state
  const [clientNiche, setClientNiche] = useState('');
  const [clientPainPoint, setClientPainPoint] = useState('');
  const [offerPrice, setOfferPrice] = useState('500');
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Outreach Sequence State
  const [outreachNiche, setOutreachNiche] = useState('B2B Founders & Marketing Directors');
  const [outreachOffer, setOutreachOffer] = useState('Viral PDF Lead Magnets & 7-Network Content Packs');
  const [generatedSequence, setGeneratedSequence] = useState<string[]>([]);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);

  // Audit Deck Generator State
  const [deckClientName, setDeckClientName] = useState('TechGrowth Inc');
  const [deckAuditScore, setDeckAuditScore] = useState('62');
  const [generatedDeck, setGeneratedDeck] = useState<any | null>(null);

  // Roadmap State (Checklist)
  const [completedRoadmapSteps, setCompletedRoadmapSteps] = useState<string[]>([
    'step-1', 'step-2'
  ]);

  // New Gig Modal/Form State
  const [showNewGigModal, setShowNewGigModal] = useState(false);
  const [newGigTitle, setNewGigTitle] = useState('');
  const [newGigCategory, setNewGigCategory] = useState('Document Design & Publishing');
  const [newGigBasic, setNewGigBasic] = useState('100');
  const [newGigStandard, setNewGigStandard] = useState('250');
  const [newGigPremium, setNewGigPremium] = useState('600');

  // Contract & Brief Modal State
  const [activeContractOrder, setActiveContractOrder] = useState<GigOrder | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);

  // Stats calculation
  const totalEarnings = orders
    .filter(o => o.status === 'Paid' || o.status === 'Completed')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const activeOrdersCount = orders.filter(o => o.status === 'In Progress' || o.status === 'Proposal Sent').length;
  const avgOrderValue = Math.round(
    orders.reduce((acc, curr) => acc + curr.amount, 0) / (orders.length || 1)
  );

  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGigTitle) return;

    const newGig: GigPackage = {
      id: 'gig-' + Date.now(),
      title: newGigTitle,
      category: newGigCategory,
      basicPrice: Number(newGigBasic) || 100,
      standardPrice: Number(newGigStandard) || 250,
      premiumPrice: Number(newGigPremium) || 600,
      basicDeliveryDays: 2,
      standardDeliveryDays: 4,
      premiumDeliveryDays: 7,
      deliverables: [
        'Custom High-Impact Deliverable',
        'Source Files & Export Packages',
        'Full Commercial Rights'
      ],
      salesCount: 0,
      rating: 5.0
    };

    setGigs([newGig, ...gigs]);
    setShowNewGigModal(false);
    setNewGigTitle('');
  };

  const handleGeneratePitch = async () => {
    setIsGeneratingPitch(true);
    setGeneratedPitch('');

    try {
      const res = await apiFetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an elite high-converting freelancer and agency proposal writer. Write a irresistible, ultra-persuasive Gig Pitch proposal for a client in the "${clientNiche || 'B2B SaaS / Digital Content'}" niche. Their pain point is "${clientPainPoint || 'Low audience conversion and uninspired lead magnets'}". Offer price: $${offerPrice}. Include a hook, solution overview, deliverable timeline, direct CTA, and satisfaction guarantee.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPitch(data.text || data.result || 'Failed to parse AI pitch response.');
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      // High-converting fallback pitch generator
      setGeneratedPitch(`SUBJECT: Unlocking $10k+ in Revenue with Custom High-DPI PDFs & Viral Content Engines

Hi ${clientNiche ? clientNiche + ' Team' : 'there'},

I noticed you're aiming to solve "${clientPainPoint || 'audience conversion and lead generation velocity'}". Most creators lose 80% of potential buyers due to uninspired lead magnets and fragmented social content.

Here is my direct solution for your business ($${offerPrice}):

1. High-DPI Viral PDF Lead Magnet: Custom typography, high-impact covers, and interactive CTAs.
2. 3D Book & Digital Product Mockups: High-res visual assets for instant social proof.
3. 7-Network Viral Campaign Pack: Ready-to-publish hooks, scripts, and promotional graphics tailored to your niche.

Guaranteed Delivery: 3-5 Business Days
Commercial License: Included

Let's hop on a quick 5-minute chat or I can begin draft outline today!

Best regards,
GigScale VIP Creator`);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const copyPitchToClipboard = () => {
    navigator.clipboard.writeText(generatedPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="space-y-6 text-ink-secondary">
      {/* TOP BRANDING & SUITE MODE CONTROL BAR */}
      <div className="flex flex-col gap-4 bg-surface-0/90 p-4 sm:p-5 rounded-3xl border border-hairline shadow-[var(--shadow-panel)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-brass-500 to-accent-brass-600 text-slate-950 shadow-[var(--shadow-glow-brass)] flex items-center justify-center">
              <Zap className="h-6 w-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-semibold text-ink-primary tracking-[-0.01em]">GigScale</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-accent-brass-500/10 border border-accent-brass-500/40 text-accent-brass-400 font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  VERIFIED SUITE
                </span>
              </div>
              <p className="text-xs text-ink-muted font-medium mt-0.5">
                10x Profitability, Viral Gig Copy, & Automated Campaign Execution
              </p>
            </div>
          </div>

          {/* Center/Right Mode Pills */}
          <div className="flex items-center bg-surface-1 border border-hairline p-1 rounded-xl gap-1">
            <button
              onClick={() => {
                setSuiteMode('full-os');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                suiteMode === 'full-os'
                  ? 'bg-accent-brass-400 text-slate-950 shadow-[var(--shadow-panel-brass)] font-black'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Full OS Suite</span>
            </button>

            <button
              onClick={() => {
                setSuiteMode('seller');
                if (activeSubTab === 'audit-deck') setActiveSubTab('packages');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                suiteMode === 'seller'
                  ? 'bg-status-positive text-slate-950 shadow-md font-black'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Seller Mode</span>
            </button>

            <button
              onClick={() => {
                setSuiteMode('buyer');
                if (activeSubTab === 'outreach' || activeSubTab === 'calculator' || activeSubTab === 'roadmap') {
                  setActiveSubTab('packages');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                suiteMode === 'buyer'
                  ? 'bg-accent-brass-400 text-slate-950 shadow-[var(--shadow-panel-brass)] font-black'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Buyer Mode</span>
            </button>
          </div>

          {/* User Account Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-1 border border-hairline text-xs text-ink-secondary font-mono">
            {isOwner ? <Crown className="h-3.5 w-3.5 text-accent-brass-400" /> : <User className="h-3.5 w-3.5 text-accent-brass-400" />}
            <span className="truncate max-w-[150px]">{user?.email || 'Guest Client'}</span>
            <button onClick={() => logout()} title="Sign Out">
              <LogOut className="h-3.5 w-3.5 text-ink-muted hover:text-ink-secondary cursor-pointer ml-1" />
            </button>
          </div>
        </div>

        {/* SUB-NAV BUTTONS ROW */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-hairline">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-accent-brass-500/10 border-2 border-accent-brass-500 text-accent-brass-300 shadow-md shadow-brass-500/10'
                : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
            }`}
          >
            <BarChart className="h-4 w-4 text-accent-brass-400" />
            <span>{suiteMode === 'buyer' ? 'Buyer Dashboard' : suiteMode === 'seller' ? 'Seller Launchpad' : 'Full Dashboard'}</span>
          </button>

          {isOwner && suiteMode !== 'buyer' && (
            <button
              onClick={() => setActiveSubTab('roadmap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                activeSubTab === 'roadmap'
                  ? 'bg-accent-brass-500/10 border-2 border-accent-brass-500 text-accent-brass-300 shadow-md'
                  : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
              }`}
            >
              <Crown className="h-4 w-4 text-accent-brass-400" />
              <span>Launch Roadmap</span>
            </button>
          )}

          {suiteMode !== 'buyer' && (
            <button
              onClick={() => setShowProfitAuditModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-surface-1 border border-hairline text-ink-secondary hover:text-ink-primary hover:border-hairline-strong cursor-pointer transition-colors"
            >
              <Sparkles className="h-4 w-4 text-status-positive" />
              <span>10x Profit Audit</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('packages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === 'packages'
                ? 'bg-status-positive-dim border border-status-positive text-status-positive'
                : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{suiteMode === 'buyer' ? 'Browse Marketplace & Hire' : 'Service Packages'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === 'pipeline'
                ? 'bg-status-positive-dim border border-status-positive text-status-positive'
                : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>{suiteMode === 'buyer' ? 'My Purchased Orders' : 'Client Order Board'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai-pitch')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === 'ai-pitch'
                ? 'bg-status-positive-dim border border-status-positive text-status-positive'
                : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
            }`}
          >
            <Sparkles className="h-4 w-4 text-accent-brass-400" />
            <span>{suiteMode === 'buyer' ? 'Request AI Proposal' : 'AI Pitch Studio'}</span>
          </button>

          {suiteMode !== 'seller' && (
            <button
              onClick={() => setActiveSubTab('audit-deck')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                activeSubTab === 'audit-deck'
                  ? 'bg-accent-brass-500/10 border border-accent-brass-500 text-accent-brass-300'
                  : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 text-accent-brass-400" />
              <span>{suiteMode === 'buyer' ? 'Request Funnel Audit' : 'Audit Deck Studio'}</span>
            </button>
          )}

          {suiteMode !== 'buyer' && (
            <>
              <button
                onClick={() => setActiveSubTab('outreach')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeSubTab === 'outreach'
                    ? 'bg-status-positive-dim border border-status-positive text-status-positive'
                    : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Outreach Engine</span>
              </button>

              <button
                onClick={() => setActiveSubTab('calculator')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeSubTab === 'calculator'
                    ? 'bg-status-positive-dim border border-status-positive text-status-positive'
                    : 'bg-surface-1 text-ink-muted border border-hairline hover:text-ink-primary'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Rate Optimizer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAIN COMMAND CENTER HERO CARD (RESPONDS TO BUYER VS SELLER VS FULL OS) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-0 border border-accent-brass-500/20 shadow-[var(--shadow-panel-brass)] relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-brass-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-brass-500/10 border border-accent-brass-500/30 text-accent-brass-400 text-xs font-extrabold uppercase font-mono">
          <Crown className="h-3.5 w-3.5 text-accent-brass-400" />
          <span>
            {suiteMode === 'buyer'
              ? 'GIGSCALE • CLIENT MARKETPLACE MODE'
              : suiteMode === 'seller'
              ? 'GIGSCALE • FREELANCER SELLER MODE'
              : 'GIGSCALE • UNIFIED OS SUITE'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight leading-tight max-w-2xl">
          {suiteMode === 'buyer'
            ? 'Client Marketplace & Talent Hire Suite'
            : suiteMode === 'seller'
            ? 'Freelancer & Agency Revenue Command Center'
            : 'Campaign Execution & Freelancer Command Center'}
        </h2>

        <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
          {suiteMode === 'buyer'
            ? 'Browse high-impact creator packages, hire top talent for custom High-DPI lead magnets & 7-network viral campaigns, track order progress, and download official contracts.'
            : suiteMode === 'seller'
            ? 'Package your service offerings into high-ticket tiers ($150–$1,250), write high-converting AI pitch proposals, send automated cold email sequences, and manage incoming client orders.'
            : 'Bridge the gap between hiring freelance talent and launching high-converting marketing campaigns instantly with genius AI copy, viral thumbnails, and automated ad staging.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {suiteMode === 'buyer' ? (
            <>
              <button
                onClick={() => setActiveSubTab('packages')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-[var(--shadow-glow-brass)] hover:shadow-[0_14px_50px_rgba(171,133,68,0.45)] hover:brightness-105 transition-[transform,opacity,box-shadow,filter] cursor-pointer"
              >
                <Compass className="h-4 w-4" />
                <span>Browse Marketplace Gigs</span>
              </button>

              <button
                onClick={() => {
                  setSelectedGigToHire(gigs[0]);
                  setShowHireModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-status-positive hover:brightness-105 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-[var(--shadow-panel)] transition-colors cursor-pointer"
              >
                <Briefcase className="h-4 w-4" />
                <span>Hire Creator / Order Package</span>
              </button>

              <button
                onClick={() => setActiveSubTab('ai-pitch')}
                className="px-5 py-2.5 rounded-xl bg-surface-1 border border-hairline-strong hover:bg-surface-2 text-ink-primary font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-accent-brass-400" />
                <span>Request Custom AI Proposal</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowProfitAuditModal(true)}
                className="px-5 py-2.5 rounded-xl bg-marble-base hover:brightness-105 text-marble-shadow font-bold text-xs flex items-center gap-2 shadow-[var(--shadow-panel)] transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
              >
                <Sparkles className="h-4 w-4 text-marble-shadow" />
                <span>Profit Audit</span>
              </button>

              <button
                onClick={() => setShowLogOrderModal(true)}
                className="px-5 py-2.5 rounded-xl bg-surface-1 border border-hairline-strong hover:bg-surface-2 text-ink-primary font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Log Order</span>
              </button>

              <button
                onClick={() => setShowNewGigModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-status-positive via-status-positive to-status-positive hover:brightness-105 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-[var(--shadow-panel)] transition-colors cursor-pointer ml-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Package</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW & METRICS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface-1/90 border border-hairline space-y-1">
              <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">Total Gig Revenue</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-status-positive">${totalEarnings.toLocaleString()}</span>
                <span className="text-xs font-bold text-status-positive bg-status-positive-dim px-2 py-0.5 rounded">+24% MoM</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-1/90 border border-hairline space-y-1">
              <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">Active Client Orders</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-accent-brass-400">{activeOrdersCount}</span>
                <span className="text-xs font-bold text-accent-brass-500 bg-accent-brass-500/10 px-2 py-0.5 rounded">In Pipeline</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-1/90 border border-hairline space-y-1">
              <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">Avg. Order Value</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-accent-brass-400">${avgOrderValue}</span>
                <span className="text-xs font-bold text-accent-brass-400 bg-accent-brass-500/10 px-2 py-0.5 rounded">High Margin</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-1/90 border border-hairline space-y-1">
              <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">Client Satisfaction</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-accent-amber-400">4.9 / 5.0</span>
                <span className="text-xs font-bold text-accent-amber-400 bg-accent-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent-amber-400" />
                  Top Rated
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface-1 border border-hairline space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-status-positive" />
                  <span>Top Performing Gig Offerings</span>
                </h3>
                <button 
                  onClick={() => setActiveSubTab('packages')}
                  className="text-xs text-status-positive hover:underline flex items-center gap-1"
                >
                  <span>Manage All</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                {gigs.map(gig => (
                  <div key={gig.id} className="p-3.5 rounded-xl bg-surface-0 border border-hairline flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-ink-secondary line-clamp-1">{gig.title}</h4>
                      <p className="text-[10px] font-mono text-ink-muted">{gig.category} • {gig.salesCount} Completed</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-status-positive">${gig.basicPrice} – ${gig.premiumPrice}</span>
                      <div className="text-[10px] text-accent-brass-400 flex items-center justify-end gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-brass-400" />
                        <span>{gig.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-1 border border-hairline space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent-brass-400" />
                  <span>Recent Client Orders</span>
                </h3>
                <button 
                  onClick={() => setActiveSubTab('pipeline')}
                  className="text-xs text-accent-brass-400 hover:underline flex items-center gap-1"
                >
                  <span>View Pipeline</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="p-3.5 rounded-xl bg-surface-0 border border-hairline flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-secondary">{order.clientName}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                          order.status === 'Paid' ? 'bg-status-positive-dim text-status-positive border-status-positive/30' :
                          order.status === 'In Progress' ? 'bg-accent-brass-500/10 text-accent-brass-400 border-accent-brass-500/30' :
                          'bg-accent-brass-500/10 text-accent-brass-400 border-accent-brass-500/30'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-muted line-clamp-1">{order.gigTitle} ({order.tier})</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-ink-primary">${order.amount}</span>
                      <p className="text-[9px] font-mono text-ink-muted">Due: {order.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SERVICE PACKAGES & TIERS */}
      {activeSubTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-primary">Gig Packages & Pricing Tiers</h2>
              <p className="text-xs text-ink-muted">Configure multi-tier freelancing packages (Basic, Standard, VIP Premium)</p>
            </div>
            <button
              onClick={() => setShowNewGigModal(true)}
              className="px-3 py-1.5 rounded-xl bg-status-positive hover:brightness-105 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[var(--shadow-panel)] transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gigs.map(gig => (
              <div key={gig.id} className="p-6 rounded-2xl bg-surface-1 border border-hairline flex flex-col justify-between space-y-6 relative group hover:border-status-positive/50 transition-colors">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-status-positive uppercase tracking-widest bg-status-positive-dim px-2 py-0.5 rounded border border-status-positive/20">
                      {gig.category}
                    </span>
                    <h3 className="text-base font-extrabold text-ink-primary leading-tight">{gig.title}</h3>
                  </div>

                  {/* Tiers Pricing Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-hairline text-center">
                    <div className="p-2 rounded-lg bg-surface-0 border border-hairline">
                      <span className="text-[9px] font-mono text-ink-muted block">BASIC</span>
                      <span className="text-xs font-black text-ink-primary">${gig.basicPrice}</span>
                      <span className="text-[9px] text-ink-muted block">{gig.basicDeliveryDays}d delivery</span>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-0 border border-status-positive/40 bg-status-positive-dim/60">
                      <span className="text-[9px] font-mono text-status-positive block font-bold">STANDARD</span>
                      <span className="text-xs font-black text-status-positive">${gig.standardPrice}</span>
                      <span className="text-[9px] text-ink-muted block">{gig.standardDeliveryDays}d delivery</span>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-0 border border-accent-brass-500/40 bg-accent-brass-500/5">
                      <span className="text-[9px] font-mono text-accent-brass-400 block font-bold">VIP PREMIUM</span>
                      <span className="text-xs font-black text-accent-brass-400">${gig.premiumPrice}</span>
                      <span className="text-[9px] text-ink-muted block">{gig.premiumDeliveryDays}d delivery</span>
                    </div>
                  </div>

                  {/* Included Deliverables */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono text-ink-muted uppercase">Included Deliverables:</span>
                    <ul className="space-y-1.5">
                      {gig.deliverables.map((item, idx) => (
                        <li key={idx} className="text-xs text-ink-secondary flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-status-positive shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-hairline flex items-center justify-between text-xs gap-2">
                  <span className="text-ink-muted font-mono text-[11px]">{gig.salesCount} Orders Completed</span>
                  <div className="flex items-center gap-1.5">
                    {suiteMode !== 'buyer' && (
                      <button 
                        onClick={() => {
                          setActiveSubTab('ai-pitch');
                          setOfferPrice(gig.standardPrice.toString());
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-secondary font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Generate pitch proposal for this gig"
                      >
                        <span>Pitch</span>
                        <Sparkles className="h-3 w-3 text-accent-brass-400" />
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        setSelectedGigToHire(gig);
                        setHireTier('Standard');
                        setShowHireModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-status-positive via-status-positive to-status-positive hover:brightness-105 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md shadow-[var(--shadow-panel)] transition-colors cursor-pointer"
                    >
                      <span>Order Gig</span>
                      <Briefcase className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CLIENT ORDER PIPELINE */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-primary">Client Order Board</h2>
              <p className="text-xs text-ink-muted">Track client deliverables, active projects, and payment status</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-0 text-ink-muted font-mono text-[11px] uppercase border-b border-hairline">
                <tr>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Service Gig</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-ink-secondary">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      <div>{order.clientName}</div>
                      <div className="text-[10px] font-mono text-ink-muted">{order.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-ink-secondary">
                      {order.gigTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-status-positive">
                      {order.tier}
                    </td>
                    <td className="py-3.5 px-4 font-black text-ink-primary">
                      ${order.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                        }}
                        className="bg-surface-0 border border-hairline-strong rounded-lg px-2 py-1 text-[11px] text-ink-primary focus:outline-none"
                      >
                        <option value="Inquiry">Inquiry</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted text-[11px]">
                      {order.dueDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveContractOrder(order)}
                        className="px-2.5 py-1 rounded-lg bg-status-positive-dim border border-status-positive/30 text-status-positive hover:bg-status-positive-dim text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Generate Contract & Brief
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AI GIG PITCH GENERATOR */}
      {activeSubTab === 'ai-pitch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-surface-1 border border-hairline space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-brass-400" />
                <span>AI Proposal & Client Pitch Engine</span>
              </h2>
              <p className="text-xs text-ink-muted">Generate high-converting proposal messages for Upwork, Fiverr, or direct cold emails</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Client Niche / Industry:</label>
                <input
                  type="text"
                  value={clientNiche}
                  onChange={(e) => setClientNiche(e.target.value)}
                  placeholder="e.g. B2B SaaS, Fitness Influencer, Real Estate Agency"
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Client Pain Point or Goal:</label>
                <textarea
                  rows={3}
                  value={clientPainPoint}
                  onChange={(e) => setClientPainPoint(e.target.value)}
                  placeholder="e.g. Needs a lead magnet e-book to double email list signups and launch 7-day social campaign"
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Proposed Package Price ($):</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="500"
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <button
                onClick={handleGeneratePitch}
                disabled={isGeneratingPitch}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-status-positive via-status-positive to-status-positive hover:brightness-105 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[var(--shadow-panel)] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPitch ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Writing Winning Pitch...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Generate High-Converting Pitch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-1 border border-hairline flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                  <FileText className="h-4 w-4 text-status-positive" />
                  <span>Generated Pitch Script</span>
                </h3>
                {generatedPitch && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyPitchToClipboard}
                      className="px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-secondary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-status-positive" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Pitch</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onSendToPdf(generatedPitch, clientNiche ? `${clientNiche} — Client Pitch` : 'Client Pitch')}
                      className="px-3 py-1 rounded-lg bg-surface-2 border border-accent-brass-400/40 hover:border-accent-brass-400 hover:bg-accent-brass-500/10 text-accent-brass-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
                    >
                      <FileOutput className="h-3.5 w-3.5" />
                      <span>Send to PDF Studio</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-surface-0 border border-hairline min-h-[280px] font-sans text-xs text-ink-secondary whitespace-pre-wrap leading-relaxed">
                {generatedPitch || (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-ink-muted space-y-2">
                    <Sparkles className="h-8 w-8 text-ink-muted animate-pulse" />
                    <p>Enter client details on the left and click "Generate High-Converting Pitch" to craft your proposal!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-status-positive-dim border border-status-positive/20 text-[11px] text-status-positive flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-status-positive shrink-0" />
              <span>Pro Tip: Pair this proposal with a PDF sample exported directly from Viral PDF Creator to close 3x faster!</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CLIENT AUDIT DECK STUDIO */}
      {activeSubTab === 'audit-deck' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-1 border border-hairline space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-status-positive" />
                  <span>Client Audit & Performance Pitch Deck</span>
                </h2>
                <p className="text-xs text-ink-muted">Generate a professional audit presentation to show prospective clients what is broken in their lead funnel and why they need your $500–$2,500 service.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Client / Target Company:</label>
                <input
                  type="text"
                  value={deckClientName}
                  onChange={(e) => setDeckClientName(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Funnel Audit Score (1-100):</label>
                <input
                  type="number"
                  value={deckAuditScore}
                  onChange={(e) => setDeckAuditScore(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setGeneratedDeck({
                      client: deckClientName,
                      score: Number(deckAuditScore) || 62,
                      flaws: [
                        'PDF Lead Magnet lacks high-DPI typography & interactive calls to action.',
                        'Zero omni-channel video content or teleprompter script automation.',
                        'No high-converting 3D mockup graphics to build social proof on landing pages.',
                        'Missing automated follow-up sequence & email nurture strategy.'
                      ],
                      recommendedSolution: 'High-DPI Viral PDF Creator Studio + 7-Network Viral Campaign Pack',
                      estimatedRevenueLift: '+$14,500 / month'
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-status-positive hover:brightness-105 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-[var(--shadow-panel)]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Audit Deck</span>
                </button>
              </div>
            </div>

            {/* Render Deck Preview */}
            {generatedDeck && (
              <div className="p-6 rounded-2xl bg-surface-0 border border-status-positive/30 space-y-6 mt-4">
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-status-danger-dim border border-status-danger/30 text-status-danger font-extrabold text-xl font-mono">
                      {generatedDeck.score}/100
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-ink-primary">{generatedDeck.client} — Lead Conversion Audit</h3>
                      <p className="text-xs text-status-positive font-mono">Estimated Potential Lift: {generatedDeck.estimatedRevenueLift}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Audit Deck presentation PDF ready for ${generatedDeck.client}!`)}
                    className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-primary font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="h-4 w-4 text-status-positive" />
                    <span>Export Deck PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-status-danger uppercase tracking-wider font-bold">Identified Growth Bottlenecks:</h4>
                    <ul className="space-y-2">
                      {generatedDeck.flaws.map((flaw: string, i: number) => (
                        <li key={i} className="text-xs text-ink-secondary bg-surface-1 p-3 rounded-xl border border-hairline flex items-start gap-2">
                          <span className="text-status-danger font-bold font-mono">✕</span>
                          <span>{flaw}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-status-positive uppercase tracking-wider font-bold">Recommended Turnkey Upgrade:</h4>
                    <div className="p-4 rounded-xl bg-surface-1 border border-status-positive/40 space-y-3">
                      <p className="text-xs font-bold text-ink-primary">{generatedDeck.recommendedSolution}</p>
                      <p className="text-[11px] text-ink-muted leading-relaxed">
                        Complete redesign of lead magnets in 300+ DPI vector PDF, 3D hardcover mockup rendering, plus 30-day viral content pack for TikTok, Instagram, and X.
                      </p>
                      <div className="pt-2 border-t border-hairline flex items-center justify-between">
                        <span className="text-xs font-mono text-ink-muted">Fixed Package Fee:</span>
                        <span className="text-sm font-black text-status-positive">$1,250 USD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: COLD EMAIL & DM OUTREACH */}
      {activeSubTab === 'outreach' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-surface-1 border border-hairline space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                <Mail className="h-4 w-4 text-status-positive" />
                <span>Automated Cold Email & DM Sequence Engine</span>
              </h2>
              <p className="text-xs text-ink-muted">Generate 3-part cold email & LinkedIn DM outreach sequences to reach target clients</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Target ICP / Niche:</label>
                <input
                  type="text"
                  value={outreachNiche}
                  onChange={(e) => setOutreachNiche(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Your High-Ticket Service Offering:</label>
                <input
                  type="text"
                  value={outreachOffer}
                  onChange={(e) => setOutreachOffer(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <button
                onClick={() => {
                  setIsGeneratingSequence(true);
                  setTimeout(() => {
                    setGeneratedSequence([
                      `EMAIL 1 (The Value Hook):\nSubject: Quick question re: ${outreachNiche.split(' ')[0]} lead magnet conversion\n\nHey [First Name],\n\nI created a quick 60-second teardown of your current lead capture asset. Most ${outreachNiche} are losing ~40% of potential buyers due to unoptimized PDF layouts.\n\nI built a custom High-DPI sample for your team using our Viral PDF Engine. Mind if I send the 3D mockup over?`,
                      `EMAIL 2 (The Social Proof Follow-Up):\nSubject: 3D Mockup sample for [Company Name]\n\nHey [First Name],\n\nFollowing up on my last note! Here is a sample of what a high-DPI document studio upgrade looks like for your offer: [INSERT LINK].\n\nClients using this framework see a 2.4x spike in email opt-ins within 14 days. Worth a 5-minute chat?`,
                      `EMAIL 3 (The Final Call - Breakup Email):\nSubject: Closing out your funnel file\n\nHey [First Name],\n\nI assume you're currently focused on other priorities right now. I'll archive your custom design draft for now.\n\nIf you ever want to revamp your lead magnets or run a 7-network viral campaign, feel free to grab a time here: [CALENDLY LINK].`
                    ]);
                    setIsGeneratingSequence(false);
                  }, 600);
                }}
                disabled={isGeneratingSequence}
                className="w-full py-3 rounded-xl bg-status-positive hover:brightness-105 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-[var(--shadow-panel)]"
              >
                {isGeneratingSequence ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Generate 3-Step Outreach Campaign</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-1 border border-hairline space-y-4">
            <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-status-positive" />
              <span>Outreach Sequence Preview</span>
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {generatedSequence.length > 0 ? (
                generatedSequence.map((email, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface-0 border border-hairline space-y-2">
                    <div className="flex items-center justify-between border-b border-hairline pb-2">
                      <span className="text-[10px] font-mono text-status-positive font-bold">TOUCHPOINT #{idx + 1}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(email);
                          alert(`Touchpoint #${idx + 1} copied!`);
                        }}
                        className="text-[10px] text-ink-muted hover:text-ink-primary flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="font-sans text-xs text-ink-secondary whitespace-pre-wrap leading-relaxed">
                      {email}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-ink-muted text-xs">
                  Click "Generate 3-Step Outreach Campaign" to build your custom sequence!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: GIGLAUNCH ROADMAP & PLAYBOOK */}
      {activeSubTab === 'roadmap' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-hairline space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
              <Rocket className="h-4 w-4 text-status-positive" />
              <span>GigLaunch OS Step-by-Step Execution Roadmap</span>
            </h2>
            <p className="text-xs text-ink-muted">Complete these core steps to systematically scale from $0 to $10,000+/month offering freelancing & agency services</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              {
                id: 'step-1',
                title: 'Phase 1: Build Your High-DPI Portfolio Assets',
                desc: 'Use Viral PDF Creator to publish 3 sample e-books or lead magnets with 3D hardcover mockup graphics to show potential buyers.'
              },
              {
                id: 'step-2',
                title: 'Phase 2: Configure Service Packages & Pricing Tiers',
                desc: 'Setup your Basic ($150), Standard ($350-$500), and VIP Agency Retainer ($1,200-$2,500) packages in the Packages tab.'
              },
              {
                id: 'step-3',
                title: 'Phase 3: Launch Outreach & Proposal Engine',
                desc: 'Deploy cold emails and pitch proposals using the AI Pitch & Cold Outreach Studio to generate 10 active client inquiries per week.'
              },
              {
                id: 'step-4',
                title: 'Phase 4: Issue Contracts & Manage Client CRM',
                desc: 'Use the Client Order Board to issue NDA/Contract agreements, track delivery deadlines, and collect $1,000+ payments.'
              }
            ].map(step => {
              const isChecked = completedRoadmapSteps.includes(step.id);
              return (
                <div 
                  key={step.id} 
                  onClick={() => {
                    if (isChecked) {
                      setCompletedRoadmapSteps(completedRoadmapSteps.filter(s => s !== step.id));
                    } else {
                      setCompletedRoadmapSteps([...completedRoadmapSteps, step.id]);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-colors cursor-pointer flex items-start gap-4 ${
                    isChecked 
                      ? 'bg-status-positive-dim border-status-positive/40 text-ink-primary'
                      : 'bg-surface-0 border-hairline text-ink-secondary hover:border-hairline-strong'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg border mt-0.5 shrink-0 ${
                    isChecked ? 'bg-status-positive text-slate-950 border-status-positive' : 'border-hairline-strong text-transparent'
                  }`}>
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold">{step.title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: HOURLY & RATE OPTIMIZER */}
      {activeSubTab === 'calculator' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-hairline space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-status-positive" />
              <span>Gig Hourly & Monthly Scalability Calculator</span>
            </h2>
            <p className="text-xs text-ink-muted">Calculate how many Gig packages you need per month to reach $5,000 – $20,000/mo income</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-surface-0 border border-hairline space-y-3">
              <span className="text-xs font-mono text-ink-muted block">$5,000 / Month Target</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-ink-primary">10 Orders / mo</span>
                <p className="text-[11px] text-status-positive">at $500 Standard Package</p>
              </div>
              <p className="text-[10px] text-ink-muted">Requires ~2.5 orders per week. Estimated working time: 10 hrs/wk ($125/hr effective rate).</p>
            </div>

            <div className="p-5 rounded-xl bg-surface-0 border border-status-positive/30 bg-status-positive-dim/60 space-y-3">
              <span className="text-xs font-mono text-status-positive block font-bold">$10,000 / Month Target</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-status-positive">8 Orders / mo</span>
                <p className="text-[11px] text-accent-brass-400">at $1,250 Agency Retainer Package</p>
              </div>
              <p className="text-[10px] text-ink-muted">Requires ~2 retainer clients per week. Estimated working time: 15 hrs/wk ($166/hr effective rate).</p>
            </div>

            <div className="p-5 rounded-xl bg-surface-0 border border-accent-brass-500/30 bg-accent-brass-500/5 space-y-3">
              <span className="text-xs font-mono text-accent-brass-400 block font-bold">$20,000 / Month Target</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-accent-brass-400">8 VIP Retainers</span>
                <p className="text-[11px] text-accent-brass-300">at $2,500 Full Suite Package</p>
              </div>
              <p className="text-[10px] text-ink-muted">Scale into a full white-label agency. Estimated working time: 20 hrs/wk ($250/hr effective rate).</p>
            </div>
          </div>
        </div>
      )}

      {/* NEW GIG MODAL */}
      {showNewGigModal && (
        <div className="fixed inset-0 z-50 bg-surface-0/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-hairline rounded-2xl max-w-md w-full p-6 space-y-4 shadow-[var(--shadow-panel-brass)]">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                <Plus className="h-4 w-4 text-status-positive" />
                <span>Create New Gig Offering</span>
              </h3>
              <button 
                onClick={() => setShowNewGigModal(false)}
                className="text-ink-muted hover:text-ink-primary text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGig} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Gig Service Title:</label>
                <input
                  type="text"
                  required
                  value={newGigTitle}
                  onChange={(e) => setNewGigTitle(e.target.value)}
                  placeholder="e.g. 3D E-Book Cover & PDF Layout Design"
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-ink-secondary">Category:</label>
                <select
                  value={newGigCategory}
                  onChange={(e) => setNewGigCategory(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                >
                  <option value="Document Design & Publishing">Document Design & Publishing</option>
                  <option value="Viral Marketing & Social Strategy">Viral Marketing & Social Strategy</option>
                  <option value="Agency Retainers & Automation">Agency Retainers & Automation</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-ink-muted">Basic ($):</label>
                  <input
                    type="number"
                    value={newGigBasic}
                    onChange={(e) => setNewGigBasic(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-status-positive">Standard ($):</label>
                  <input
                    type="number"
                    value={newGigStandard}
                    onChange={(e) => setNewGigStandard(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-accent-brass-400">Premium ($):</label>
                  <input
                    type="number"
                    value={newGigPremium}
                    onChange={(e) => setNewGigPremium(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewGigModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface-2 text-ink-secondary text-xs font-semibold hover:bg-surface-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-status-positive hover:brightness-105 text-slate-950 font-bold text-xs shadow-md shadow-[var(--shadow-panel)]"
                >
                  Create Gig
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT CONTRACT & LEGAL BRIEF MODAL */}
      {activeContractOrder && (
        <div className="fixed inset-0 z-50 bg-surface-0/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-hairline rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-[var(--shadow-panel-brass)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-status-positive-dim border border-status-positive/30 text-status-positive">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-primary">Client Agreement & Project Brief</h3>
                  <p className="text-xs text-ink-muted">Order ID: {activeContractOrder.id} • {activeContractOrder.clientName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveContractOrder(null)}
                className="p-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Content Box */}
            <div className="p-5 rounded-2xl bg-surface-0 border border-hairline space-y-4 font-mono text-xs text-ink-secondary leading-relaxed">
              <div className="border-b border-hairline pb-3 flex justify-between items-center text-[11px] text-ink-muted">
                <span>INDEPENDENT CONTRACTOR SERVICES AGREEMENT</span>
                <span className="text-status-positive font-bold">CONFIDENTIAL</span>
              </div>

              <div className="space-y-2">
                <p><strong className="text-ink-primary">CLIENT:</strong> {activeContractOrder.clientName} ({activeContractOrder.clientEmail})</p>
                <p><strong className="text-ink-primary">SERVICE GIG:</strong> {activeContractOrder.gigTitle}</p>
                <p><strong className="text-ink-primary">TIER LEVEL:</strong> {activeContractOrder.tier} Package</p>
                <p><strong className="text-ink-primary">AGREED COMPENSATION:</strong> ${activeContractOrder.amount} USD</p>
                <p><strong className="text-ink-primary">TARGET COMPLETION DATE:</strong> {activeContractOrder.dueDate}</p>
              </div>

              <div className="pt-2 space-y-2 text-[11px] border-t border-hairline text-ink-muted">
                <p><strong className="text-ink-secondary">1. SCOPE & DELIVERABLES:</strong> Provider agrees to deliver high-DPI document layouts, custom graphics, source files, and marketing strategy packs as outlined in the selected {activeContractOrder.tier} package.</p>
                <p><strong className="text-ink-secondary">2. COMMERCIAL INTELLECTUAL PROPERTY:</strong> Upon full settlement of ${activeContractOrder.amount}, Provider grants Client 100% full, unencumbered commercial license and ownership of all generated documents and media assets.</p>
                <p><strong className="text-ink-secondary">3. NON-DISCLOSURE & CONFIDENTIALITY:</strong> Both parties agree to hold proprietary data, customer ICP lists, and strategy files in strict confidence.</p>
              </div>

              <div className="pt-3 border-t border-hairline flex justify-between items-center text-[10px] text-ink-muted">
                <span>Signed electronically via GigScale Engine</span>
                <span>Date: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const contractText = `INDEPENDENT CONTRACTOR AGREEMENT\nClient: ${activeContractOrder.clientName} (${activeContractOrder.clientEmail})\nService: ${activeContractOrder.gigTitle} (${activeContractOrder.tier})\nAmount: $${activeContractOrder.amount}\nDue Date: ${activeContractOrder.dueDate}\nStatus: ${activeContractOrder.status}\n\n1. SCOPE: High-DPI publication & viral marketing pack.\n2. INTELLECTUAL PROPERTY: 100% full commercial monetization rights upon final payment.\n3. CONFIDENTIALITY: Strict mutual NDA enforced.`;
                  navigator.clipboard.writeText(contractText);
                  setCopiedContract(true);
                  setTimeout(() => setCopiedContract(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-secondary text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copiedContract ? (
                  <>
                    <Check className="h-4 w-4 text-status-positive" />
                    <span>Agreement Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Contract Terms</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  alert(`Contract & Invoice PDF downloaded for ${activeContractOrder.clientName}!`);
                  setActiveContractOrder(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-status-positive via-status-positive to-status-positive hover:brightness-105 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-[var(--shadow-panel)] transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Official Agreement PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10X PROFIT AUDIT MODAL */}
      {showProfitAuditModal && (
        <div className="fixed inset-0 z-50 bg-surface-0/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-hairline rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-[var(--shadow-panel-brass)]">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-brass-500/10 border border-accent-brass-500/30 text-accent-brass-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-primary">10x Profitability & Rate Audit</h3>
                  <p className="text-xs text-ink-muted">Calculate how to 10x your freelancing revenue with AI gig packaging</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfitAuditModal(false)}
                className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-ink-secondary font-mono">Target Monthly Revenue ($USD):</label>
                <input
                  type="number"
                  value={auditTargetRevenue}
                  onChange={(e) => setAuditTargetRevenue(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary font-mono focus:outline-none focus:border-accent-brass-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-ink-secondary font-mono">Current Average Hourly / Fixed Gig Rate ($USD):</label>
                <input
                  type="number"
                  value={auditCurrentRate}
                  onChange={(e) => setAuditCurrentRate(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary font-mono focus:outline-none focus:border-accent-brass-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-surface-0 border border-accent-brass-500/30 space-y-3 font-mono">
                <div className="text-accent-brass-400 font-bold uppercase text-[11px]">AUDIT RECOMMENDATION:</div>
                <div className="text-ink-secondary text-xs leading-relaxed space-y-2">
                  <p>• To hit <strong className="text-status-positive">${Number(auditTargetRevenue).toLocaleString()}/mo</strong> at standard rates, you need <strong>{Math.ceil(Number(auditTargetRevenue) / (Number(auditCurrentRate) || 1))} client deliverables</strong> per month.</p>
                  <p>• By bundling high-DPI PDF creation, 3D hardcover mockups, and a 7-network viral campaign into a single VIP Package ($1,250), you only need <strong className="text-accent-brass-300">{Math.ceil(Number(auditTargetRevenue) / 1250)} retainer clients</strong>!</p>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('10x Profitability Blueprint applied to your rate calculator!');
                  setShowProfitAuditModal(false);
                  setActiveSubTab('calculator');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-brass-500 to-accent-brass-300 hover:from-accent-brass-400 hover:to-accent-brass-200 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-lg shadow-brass-500/20"
              >
                Apply 10x Packaging Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG ORDER MODAL */}
      {showLogOrderModal && (
        <div className="fixed inset-0 z-50 bg-surface-0/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-hairline rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-[var(--shadow-panel-brass)]">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-status-positive-dim border border-status-positive/30 text-status-positive">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-primary">Log New Client Order</h3>
                  <p className="text-xs text-ink-muted">Add an incoming client deal to your active pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogOrderModal(false)}
                className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!logClientName) return;
                const newOrder: GigOrder = {
                  id: `ord-${Date.now().toString().slice(-4)}`,
                  clientName: logClientName,
                  clientEmail: logClientEmail || 'client@company.com',
                  gigTitle: logGigTitle,
                  tier: 'Standard',
                  amount: Number(logAmount) || 350,
                  status: 'In Progress',
                  dueDate: logDueDate || '2026-08-20',
                  createdAt: new Date().toISOString().split('T')[0]
                };
                setOrders([newOrder, ...orders]);
                setShowLogOrderModal(false);
                setLogClientName('');
                setLogClientEmail('');
                setActiveSubTab('pipeline');
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-ink-secondary font-mono">Client / Company Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Marketing LLC"
                  value={logClientName}
                  onChange={(e) => setLogClientName(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="space-y-1">
                <label className="text-ink-secondary font-mono">Client Email Address:</label>
                <input
                  type="email"
                  placeholder="client@company.com"
                  value={logClientEmail}
                  onChange={(e) => setLogClientEmail(e.target.value)}
                  className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-status-positive"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-ink-secondary font-mono">Deal Value ($USD):</label>
                  <input
                    type="number"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-ink-secondary font-mono">Delivery Due Date:</label>
                  <input
                    type="date"
                    value={logDueDate}
                    onChange={(e) => setLogDueDate(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-status-positive via-status-positive to-status-positive hover:brightness-105 text-slate-950 font-bold text-xs shadow-lg shadow-[var(--shadow-panel)] transition-colors cursor-pointer"
              >
                Log Client Order
              </button>
            </form>
          </div>
        </div>
      )}
      {/* HIRE CREATOR / ORDER GIG MODAL (FOR BUYER MODE & GENERAL PURCHASES) */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 bg-surface-0/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-hairline rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-[var(--shadow-panel-brass)]">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-status-positive-dim border border-status-positive/30 text-status-positive">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-primary">Order Package & Hire Talent</h3>
                  <p className="text-xs text-ink-muted">Place your order directly with top verified creators</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHireModal(false);
                  setHireSuccessMsg(null);
                }}
                className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            {hireSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-status-positive-dim border border-status-positive/30 text-status-positive space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2 text-status-positive font-extrabold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Order Placed & Creator Assigned!</span>
                </div>
                <p>{hireSuccessMsg}</p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowHireModal(false);
                      setHireSuccessMsg(null);
                      setActiveSubTab('pipeline');
                    }}
                    className="w-full py-2.5 rounded-xl bg-status-positive hover:brightness-105 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    View My Purchased Orders
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetGig = selectedGigToHire || gigs[0];
                  const price =
                    hireTier === 'Basic'
                      ? targetGig.basicPrice
                      : hireTier === 'Premium'
                      ? targetGig.premiumPrice
                      : targetGig.standardPrice;

                  const days =
                    hireTier === 'Basic'
                      ? targetGig.basicDeliveryDays
                      : hireTier === 'Premium'
                      ? targetGig.premiumDeliveryDays
                      : targetGig.standardDeliveryDays;

                  const dueDateObj = new Date();
                  dueDateObj.setDate(dueDateObj.getDate() + days);
                  const formattedDueDate = dueDateObj.toISOString().split('T')[0];

                  const clientName = hireClientName.trim() || user?.email?.split('@')[0] || 'VIP Buyer';
                  const clientEmail = hireClientEmail.trim() || user?.email || 'buyer@company.com';

                  const newOrder: GigOrder = {
                    id: `ord-${Date.now().toString().slice(-4)}`,
                    clientName,
                    clientEmail,
                    gigTitle: targetGig.title,
                    tier: hireTier,
                    amount: price,
                    status: 'In Progress',
                    dueDate: formattedDueDate,
                    createdAt: new Date().toISOString().split('T')[0]
                  };

                  setOrders([newOrder, ...orders]);
                  setHireSuccessMsg(
                    `Your order for "${targetGig.title}" (${hireTier} Tier - $${price}) has been created successfully! Target delivery is ${formattedDueDate}.`
                  );
                }}
                className="space-y-4 text-xs"
              >
                {/* Select Package */}
                <div className="space-y-1">
                  <label className="text-ink-secondary font-mono">Select Gig Package:</label>
                  <select
                    value={selectedGigToHire?.id || gigs[0]?.id}
                    onChange={(e) => {
                      const selected = gigs.find(g => g.id === e.target.value);
                      if (selected) setSelectedGigToHire(selected);
                    }}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-status-positive"
                  >
                    {gigs.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                {/* Select Tier */}
                <div className="space-y-1">
                  <label className="text-ink-secondary font-mono">Select Service Tier:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Basic', 'Standard', 'Premium'] as const).map((tier) => {
                      const gig = selectedGigToHire || gigs[0];
                      const price = tier === 'Basic' ? gig.basicPrice : tier === 'Premium' ? gig.premiumPrice : gig.standardPrice;
                      const days = tier === 'Basic' ? gig.basicDeliveryDays : tier === 'Premium' ? gig.premiumDeliveryDays : gig.standardDeliveryDays;
                      const isSelected = hireTier === tier;
                      return (
                        <button
                          type="button"
                          key={tier}
                          onClick={() => setHireTier(tier)}
                          className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-status-positive-dim border-status-positive text-ink-primary'
                              : 'bg-surface-0 border-hairline text-ink-muted hover:border-hairline-strong'
                          }`}
                        >
                          <span className="text-[10px] font-mono block uppercase font-bold text-status-positive">{tier}</span>
                          <span className="text-sm font-black block">${price}</span>
                          <span className="text-[9px] text-ink-muted block">{days}d delivery</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Client Info */}
                <div className="space-y-1">
                  <label className="text-ink-secondary font-mono">Your Name / Company Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor / Apex Ventures"
                    value={hireClientName}
                    onChange={(e) => setHireClientName(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-ink-secondary font-mono">Your Contact Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@apexventures.com"
                    value={hireClientEmail}
                    onChange={(e) => setHireClientEmail(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-ink-secondary font-mono">Project Notes / Deliverable Requirements (Optional):</label>
                  <textarea
                    rows={2}
                    placeholder="Provide topic, brand colors, or preferred lead magnet focus..."
                    value={hireRequirements}
                    onChange={(e) => setHireRequirements(e.target.value)}
                    className="w-full bg-surface-0 border border-hairline rounded-xl px-3.5 py-2 text-ink-primary focus:outline-none focus:border-status-positive"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-status-positive via-status-positive to-status-positive hover:brightness-105 text-slate-950 font-black text-xs shadow-lg shadow-[var(--shadow-panel)] transition-colors cursor-pointer"
                >
                  Confirm Order & Hire Creator
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
