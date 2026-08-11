import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { OWNER_EMAIL } from '../lib/firebase';
import { MotionPanel3D } from './MotionPanel3D';
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
  LogOut
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

export const GigScale: React.FC = () => {
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
    <div className="space-y-6 text-slate-100">
      {/* TOP BRANDING & SUITE MODE CONTROL BAR */}
      <div className="flex flex-col gap-4 bg-slate-950/90 p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-orange-500/30 flex items-center justify-center">
              <Zap className="h-6 w-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">GigScale</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                  👑 VERIFIED SUITE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                10x Profitability, Viral Gig Copy, & Automated Campaign Execution
              </p>
            </div>
          </div>

          {/* Center/Right Mode Pills */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1">
            <button
              onClick={() => {
                setSuiteMode('full-os');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                suiteMode === 'full-os'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                suiteMode === 'seller'
                  ? 'bg-emerald-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                suiteMode === 'buyer'
                  ? 'bg-indigo-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Buyer Mode</span>
            </button>
          </div>

          {/* User Account Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="text-amber-400 font-bold">{isOwner ? '👑' : '👤'}</span>
            <span className="truncate max-w-[150px]">{user?.email || 'Guest Client'}</span>
            <button onClick={logout} title="Sign Out">
              <LogOut className="h-3.5 w-3.5 text-slate-500 hover:text-slate-300 cursor-pointer ml-1" />
            </button>
          </div>
        </div>

        {/* SUB-NAV BUTTONS ROW */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-amber-500/10 border-2 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <BarChart className="h-4 w-4 text-amber-400" />
            <span>{suiteMode === 'buyer' ? 'Buyer Dashboard' : suiteMode === 'seller' ? 'Seller Launchpad' : 'Full Dashboard'}</span>
          </button>

          {isOwner && suiteMode !== 'buyer' && (
            <button
              onClick={() => setActiveSubTab('roadmap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'roadmap'
                  ? 'bg-amber-500/10 border-2 border-amber-500 text-amber-300 shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span>Owner Admin</span>
            </button>
          )}

          {suiteMode !== 'buyer' && (
            <button
              onClick={() => setShowProfitAuditModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer transition-all"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>10x Profit Audit</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('packages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'packages'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{suiteMode === 'buyer' ? 'Browse Marketplace & Hire' : 'Service Packages'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'pipeline'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>{suiteMode === 'buyer' ? 'My Purchased Orders' : 'Client Order Board'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai-pitch')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'ai-pitch'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>{suiteMode === 'buyer' ? 'Request AI Proposal' : 'AI Pitch Studio'}</span>
          </button>

          {suiteMode !== 'seller' && (
            <button
              onClick={() => setActiveSubTab('audit-deck')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'audit-deck'
                  ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
              <span>{suiteMode === 'buyer' ? 'Request Funnel Audit' : 'Audit Deck Studio'}</span>
            </button>
          )}

          {suiteMode !== 'buyer' && (
            <>
              <button
                onClick={() => setActiveSubTab('outreach')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSubTab === 'outreach'
                    ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Outreach Engine</span>
              </button>

              <button
                onClick={() => setActiveSubTab('calculator')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSubTab === 'calculator'
                    ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
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
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-amber-500/20 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase font-mono">
          <Crown className="h-3.5 w-3.5 text-amber-400" />
          <span>
            {suiteMode === 'buyer'
              ? 'GIGSCALE • CLIENT MARKETPLACE MODE'
              : suiteMode === 'seller'
              ? 'GIGSCALE • FREELANCER SELLER MODE'
              : 'GIGSCALE • UNIFIED OS SUITE'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight max-w-2xl">
          {suiteMode === 'buyer'
            ? 'Client Marketplace & Talent Hire Suite'
            : suiteMode === 'seller'
            ? 'Freelancer & Agency Revenue Command Center'
            : 'Campaign Execution & Freelancer Command Center'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
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
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Compass className="h-4 w-4" />
                <span>Browse Marketplace Gigs</span>
              </button>

              <button
                onClick={() => {
                  setSelectedGigToHire(gigs[0]);
                  setShowHireModal(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Briefcase className="h-4 w-4" />
                <span>Hire Creator / Order Package</span>
              </button>

              <button
                onClick={() => setActiveSubTab('ai-pitch')}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Request Custom AI Proposal</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowProfitAuditModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-slate-900" />
                <span>10x Profit Audit</span>
              </button>

              <button
                onClick={() => setShowLogOrderModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Log Order</span>
              </button>

              <button
                onClick={() => setShowNewGigModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer ml-auto"
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
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Gig Revenue</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400">${totalEarnings.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">+24% MoM</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Client Orders</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-400">{activeOrdersCount}</span>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">In Pipeline</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Avg. Order Value</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-indigo-400">${avgOrderValue}</span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">High Margin</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Client Satisfaction</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-400">4.9 / 5.0</span>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <Star className="h-3 w-3 fill-rose-400" />
                  Top Rated
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                  <span>Top Performing Gig Offerings</span>
                </h3>
                <button 
                  onClick={() => setActiveSubTab('packages')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Manage All</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                {gigs.map(gig => (
                  <div key={gig.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{gig.title}</h4>
                      <p className="text-[10px] font-mono text-slate-500">{gig.category} • {gig.salesCount} Completed</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-emerald-400">${gig.basicPrice} – ${gig.premiumPrice}</span>
                      <div className="text-[10px] text-amber-400 flex items-center justify-end gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-amber-400" />
                        <span>{gig.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Recent Client Orders</span>
                </h3>
                <button 
                  onClick={() => setActiveSubTab('pipeline')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>View Pipeline</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{order.clientName}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                          order.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          order.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{order.gigTitle} ({order.tier})</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-white">${order.amount}</span>
                      <p className="text-[9px] font-mono text-slate-500">Due: {order.dueDate}</p>
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
              <h2 className="text-lg font-bold text-white">Gig Packages & Pricing Tiers</h2>
              <p className="text-xs text-slate-400">Configure multi-tier freelancing packages (Basic, Standard, VIP Premium)</p>
            </div>
            <button
              onClick={() => setShowNewGigModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gigs.map(gig => (
              <div key={gig.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6 relative group hover:border-emerald-500/50 transition-all">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {gig.category}
                    </span>
                    <h3 className="text-base font-extrabold text-white leading-tight">{gig.title}</h3>
                  </div>

                  {/* Tiers Pricing Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[9px] font-mono text-slate-400 block">BASIC</span>
                      <span className="text-xs font-black text-white">${gig.basicPrice}</span>
                      <span className="text-[9px] text-slate-500 block">{gig.basicDeliveryDays}d delivery</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/40 bg-emerald-500/5">
                      <span className="text-[9px] font-mono text-emerald-400 block font-bold">STANDARD</span>
                      <span className="text-xs font-black text-emerald-400">${gig.standardPrice}</span>
                      <span className="text-[9px] text-slate-400 block">{gig.standardDeliveryDays}d delivery</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/40 bg-amber-500/5">
                      <span className="text-[9px] font-mono text-amber-400 block font-bold">VIP PREMIUM</span>
                      <span className="text-xs font-black text-amber-400">${gig.premiumPrice}</span>
                      <span className="text-[9px] text-slate-400 block">{gig.premiumDeliveryDays}d delivery</span>
                    </div>
                  </div>

                  {/* Included Deliverables */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Included Deliverables:</span>
                    <ul className="space-y-1.5">
                      {gig.deliverables.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">{gig.salesCount} Orders Completed</span>
                  <div className="flex items-center gap-1.5">
                    {suiteMode !== 'buyer' && (
                      <button 
                        onClick={() => {
                          setActiveSubTab('ai-pitch');
                          setOfferPrice(gig.standardPrice.toString());
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                        title="Generate pitch proposal for this gig"
                      >
                        <span>Pitch</span>
                        <Sparkles className="h-3 w-3 text-amber-400" />
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        setSelectedGigToHire(gig);
                        setHireTier('Standard');
                        setShowHireModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
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
              <h2 className="text-lg font-bold text-white">Client Order Board</h2>
              <p className="text-xs text-slate-400">Track client deliverables, active projects, and payment status</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      <div>{order.clientName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{order.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                      {order.gigTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                      {order.tier}
                    </td>
                    <td className="py-3.5 px-4 font-black text-white">
                      ${order.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                        }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                      >
                        <option value="Inquiry">Inquiry</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {order.dueDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveContractOrder(order)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition-all cursor-pointer"
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
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>AI Proposal & Client Pitch Engine</span>
              </h2>
              <p className="text-xs text-slate-400">Generate high-converting proposal messages for Upwork, Fiverr, or direct cold emails</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Client Niche / Industry:</label>
                <input
                  type="text"
                  value={clientNiche}
                  onChange={(e) => setClientNiche(e.target.value)}
                  placeholder="e.g. B2B SaaS, Fitness Influencer, Real Estate Agency"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Client Pain Point or Goal:</label>
                <textarea
                  rows={3}
                  value={clientPainPoint}
                  onChange={(e) => setClientPainPoint(e.target.value)}
                  placeholder="e.g. Needs a lead magnet e-book to double email list signups and launch 7-day social campaign"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Proposed Package Price ($):</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleGeneratePitch}
                disabled={isGeneratingPitch}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
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

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>Generated Pitch Script</span>
                </h3>
                {generatedPitch && (
                  <button
                    onClick={copyPitchToClipboard}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedPitch ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Pitch</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[280px] font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {generatedPitch || (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                    <Sparkles className="h-8 w-8 text-slate-600 animate-pulse" />
                    <p>Enter client details on the left and click "Generate High-Converting Pitch" to craft your proposal!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Pro Tip: Pair this proposal with a PDF sample exported directly from Viral PDF Creator to close 3x faster!</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CLIENT AUDIT DECK STUDIO */}
      {activeSubTab === 'audit-deck' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <span>Client Audit & Performance Pitch Deck</span>
                </h2>
                <p className="text-xs text-slate-400">Generate a professional audit presentation to show prospective clients what is broken in their lead funnel and why they need your $500–$2,500 service.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Client / Target Company:</label>
                <input
                  type="text"
                  value={deckClientName}
                  onChange={(e) => setDeckClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Funnel Audit Score (1-100):</label>
                <input
                  type="number"
                  value={deckAuditScore}
                  onChange={(e) => setDeckAuditScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Audit Deck</span>
                </button>
              </div>
            </div>

            {/* Render Deck Preview */}
            {generatedDeck && (
              <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-6 mt-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-xl font-mono">
                      {generatedDeck.score}/100
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{generatedDeck.client} — Lead Conversion Audit</h3>
                      <p className="text-xs text-emerald-400 font-mono">Estimated Potential Lift: {generatedDeck.estimatedRevenueLift}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Audit Deck presentation PDF ready for ${generatedDeck.client}!`)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="h-4 w-4 text-emerald-400" />
                    <span>Export Deck PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider font-bold">Identified Growth Bottlenecks:</h4>
                    <ul className="space-y-2">
                      {generatedDeck.flaws.map((flaw: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                          <span className="text-rose-400 font-bold font-mono">✕</span>
                          <span>{flaw}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">Recommended Turnkey Upgrade:</h4>
                    <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3">
                      <p className="text-xs font-bold text-white">{generatedDeck.recommendedSolution}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Complete redesign of lead magnets in 300+ DPI vector PDF, 3D hardcover mockup rendering, plus 30-day viral content pack for TikTok, Instagram, and X.
                      </p>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400">Fixed Package Fee:</span>
                        <span className="text-sm font-black text-emerald-400">$1,250 USD</span>
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
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>Automated Cold Email & DM Sequence Engine</span>
              </h2>
              <p className="text-xs text-slate-400">Generate 3-part cold email & LinkedIn DM outreach sequences to reach target clients</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Target ICP / Niche:</label>
                <input
                  type="text"
                  value={outreachNiche}
                  onChange={(e) => setOutreachNiche(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Your High-Ticket Service Offering:</label>
                <input
                  type="text"
                  value={outreachOffer}
                  onChange={(e) => setOutreachOffer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isGeneratingSequence ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Generate 3-Step Outreach Campaign</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Outreach Sequence Preview</span>
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {generatedSequence.length > 0 ? (
                generatedSequence.map((email, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">TOUCHPOINT #{idx + 1}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(email);
                          alert(`Touchpoint #${idx + 1} copied!`);
                        }}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {email}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Click "Generate 3-Step Outreach Campaign" to build your custom sequence!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: GIGLAUNCH ROADMAP & PLAYBOOK */}
      {activeSubTab === 'roadmap' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Rocket className="h-4 w-4 text-emerald-400" />
              <span>GigLaunch OS Step-by-Step Execution Roadmap</span>
            </h2>
            <p className="text-xs text-slate-400">Complete these core steps to systematically scale from $0 to $10,000+/month offering freelancing & agency services</p>
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
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isChecked 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg border mt-0.5 shrink-0 ${
                    isChecked ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'border-slate-700 text-transparent'
                  }`}>
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: HOURLY & RATE OPTIMIZER */}
      {activeSubTab === 'calculator' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Gig Hourly & Monthly Scalability Calculator</span>
            </h2>
            <p className="text-xs text-slate-400">Calculate how many Gig packages you need per month to reach $5,000 – $20,000/mo income</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-mono text-slate-400 block">$5,000 / Month Target</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-white">10 Orders / mo</span>
                <p className="text-[11px] text-emerald-400">at $500 Standard Package</p>
              </div>
              <p className="text-[10px] text-slate-500">Requires ~2.5 orders per week. Estimated working time: 10 hrs/wk ($125/hr effective rate).</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <span className="text-xs font-mono text-emerald-400 block font-bold">$10,000 / Month Target</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-emerald-400">8 Orders / mo</span>
                <p className="text-[11px] text-amber-400">at $1,250 Agency Retainer Package</p>
              </div>
              <p className="text-[10px] text-slate-400">Requires ~2 retainer clients per week. Estimated working time: 15 hrs/wk ($166/hr effective rate).</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 bg-amber-500/5 space-y-3">
              <span className="text-xs font-mono text-amber-400 block font-bold">$20,000 / Month Target</span>
              <div className="space-y-1">
                <span className="text-2xl font-black text-amber-400">8 VIP Retainers</span>
                <p className="text-[11px] text-amber-300">at $2,500 Full Suite Package</p>
              </div>
              <p className="text-[10px] text-slate-400">Scale into a full white-label agency. Estimated working time: 20 hrs/wk ($250/hr effective rate).</p>
            </div>
          </div>
        </div>
      )}

      {/* NEW GIG MODAL */}
      {showNewGigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Create New Gig Offering</span>
              </h3>
              <button 
                onClick={() => setShowNewGigModal(false)}
                className="text-slate-500 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGig} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Gig Service Title:</label>
                <input
                  type="text"
                  required
                  value={newGigTitle}
                  onChange={(e) => setNewGigTitle(e.target.value)}
                  placeholder="e.g. 3D E-Book Cover & PDF Layout Design"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Category:</label>
                <select
                  value={newGigCategory}
                  onChange={(e) => setNewGigCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Document Design & Publishing">Document Design & Publishing</option>
                  <option value="Viral Marketing & Social Strategy">Viral Marketing & Social Strategy</option>
                  <option value="Agency Retainers & Automation">Agency Retainers & Automation</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Basic ($):</label>
                  <input
                    type="number"
                    value={newGigBasic}
                    onChange={(e) => setNewGigBasic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-emerald-400">Standard ($):</label>
                  <input
                    type="number"
                    value={newGigStandard}
                    onChange={(e) => setNewGigStandard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-amber-400">Premium ($):</label>
                  <input
                    type="number"
                    value={newGigPremium}
                    onChange={(e) => setNewGigPremium(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewGigModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Client Agreement & Project Brief</h3>
                  <p className="text-xs text-slate-400">Order ID: {activeContractOrder.id} • {activeContractOrder.clientName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveContractOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Content Box */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center text-[11px] text-slate-400">
                <span>INDEPENDENT CONTRACTOR SERVICES AGREEMENT</span>
                <span className="text-emerald-400 font-bold">CONFIDENTIAL</span>
              </div>

              <div className="space-y-2">
                <p><strong className="text-white">CLIENT:</strong> {activeContractOrder.clientName} ({activeContractOrder.clientEmail})</p>
                <p><strong className="text-white">SERVICE GIG:</strong> {activeContractOrder.gigTitle}</p>
                <p><strong className="text-white">TIER LEVEL:</strong> {activeContractOrder.tier} Package</p>
                <p><strong className="text-white">AGREED COMPENSATION:</strong> ${activeContractOrder.amount} USD</p>
                <p><strong className="text-white">TARGET COMPLETION DATE:</strong> {activeContractOrder.dueDate}</p>
              </div>

              <div className="pt-2 space-y-2 text-[11px] border-t border-slate-800/80 text-slate-400">
                <p><strong className="text-slate-200">1. SCOPE & DELIVERABLES:</strong> Provider agrees to deliver high-DPI document layouts, custom graphics, source files, and marketing strategy packs as outlined in the selected {activeContractOrder.tier} package.</p>
                <p><strong className="text-slate-200">2. COMMERCIAL INTELLECTUAL PROPERTY:</strong> Upon full settlement of ${activeContractOrder.amount}, Provider grants Client 100% full, unencumbered commercial license and ownership of all generated documents and media assets.</p>
                <p><strong className="text-slate-200">3. NON-DISCLOSURE & CONFIDENTIALITY:</strong> Both parties agree to hold proprietary data, customer ICP lists, and strategy files in strict confidence.</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                {copiedContract ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">10x Profitability & Rate Audit</h3>
                  <p className="text-xs text-slate-400">Calculate how to 10x your freelancing revenue with AI gig packaging</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfitAuditModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-mono">Target Monthly Revenue ($USD):</label>
                <input
                  type="number"
                  value={auditTargetRevenue}
                  onChange={(e) => setAuditTargetRevenue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-mono">Current Average Hourly / Fixed Gig Rate ($USD):</label>
                <input
                  type="number"
                  value={auditCurrentRate}
                  onChange={(e) => setAuditCurrentRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 font-mono">
                <div className="text-amber-400 font-bold uppercase text-[11px]">AUDIT RECOMMENDATION:</div>
                <div className="text-slate-200 text-xs leading-relaxed space-y-2">
                  <p>• To hit <strong className="text-emerald-400">${Number(auditTargetRevenue).toLocaleString()}/mo</strong> at standard rates, you need <strong>{Math.ceil(Number(auditTargetRevenue) / (Number(auditCurrentRate) || 1))} client deliverables</strong> per month.</p>
                  <p>• By bundling high-DPI PDF creation, 3D hardcover mockups, and a 7-network viral campaign into a single VIP Package ($1,250), you only need <strong className="text-amber-300">{Math.ceil(Number(auditTargetRevenue) / 1250)} retainer clients</strong>!</p>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('10x Profitability Blueprint applied to your rate calculator!');
                  setShowProfitAuditModal(false);
                  setActiveSubTab('calculator');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Apply 10x Packaging Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG ORDER MODAL */}
      {showLogOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Log New Client Order</h3>
                  <p className="text-xs text-slate-400">Add an incoming client deal to your active pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogOrderModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
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
                <label className="text-slate-300 font-mono">Client / Company Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Marketing LLC"
                  value={logClientName}
                  onChange={(e) => setLogClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-mono">Client Email Address:</label>
                <input
                  type="email"
                  placeholder="client@company.com"
                  value={logClientEmail}
                  onChange={(e) => setLogClientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-mono">Deal Value ($USD):</label>
                  <input
                    type="number"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-mono">Delivery Due Date:</label>
                  <input
                    type="date"
                    value={logDueDate}
                    onChange={(e) => setLogDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Log Client Order
              </button>
            </form>
          </div>
        </div>
      )}
      {/* HIRE CREATOR / ORDER GIG MODAL (FOR BUYER MODE & GENERAL PURCHASES) */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Order Package & Hire Talent</h3>
                  <p className="text-xs text-slate-400">Place your order directly with top verified creators</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHireModal(false);
                  setHireSuccessMsg(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {hireSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
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
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer"
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
                  <label className="text-slate-300 font-mono">Select Gig Package:</label>
                  <select
                    value={selectedGigToHire?.id || gigs[0]?.id}
                    onChange={(e) => {
                      const selected = gigs.find(g => g.id === e.target.value);
                      if (selected) setSelectedGigToHire(selected);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {gigs.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                {/* Select Tier */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-mono">Select Service Tier:</label>
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
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[10px] font-mono block uppercase font-bold text-emerald-400">{tier}</span>
                          <span className="text-sm font-black block">${price}</span>
                          <span className="text-[9px] text-slate-500 block">{days}d delivery</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Client Info */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-mono">Your Name / Company Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor / Apex Ventures"
                    value={hireClientName}
                    onChange={(e) => setHireClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-mono">Your Contact Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@apexventures.com"
                    value={hireClientEmail}
                    onChange={(e) => setHireClientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-mono">Project Notes / Deliverable Requirements (Optional):</label>
                  <textarea
                    rows={2}
                    placeholder="Provide topic, brand colors, or preferred lead magnet focus..."
                    value={hireRequirements}
                    onChange={(e) => setHireRequirements(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
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
