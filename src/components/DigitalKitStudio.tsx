import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  Globe,
  Layers,
  Sliders,
  Plus,
  Trash2,
  Lock,
  Crown,
  User,
  LogOut,
  Package,
  Wand2,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Palette,
  Eye,
  Bookmark,
  FolderDown,
  RefreshCw,
  Send,
  X,
  HelpCircle,
  Briefcase,
  Calendar,
  CheckSquare,
  Edit3,
  ExternalLink,
  Code
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DocumentData } from '../types';
import { MotionPanel3D } from './MotionPanel3D';
import { sanitizeClonedDocForHtml2Canvas } from '../utils/pdfExport';

interface DigitalKitStudioProps {
  document?: DocumentData;
  onSwitchToPdfStudio?: () => void;
  onOpenEditor?: (customDoc?: DocumentData) => void;
}

// MAIN BUNDLE CATEGORIES
export type MainBundleId =
  | 'canva-social'
  | 'brand-media'
  | 'resume-cv'
  | 'email-copy'
  | 'digital-planners'
  | 'master-prompts';

export interface SlideData {
  id: string;
  tagline: string;
  title: string;
  body: string;
  cta: string;
  bgGradient?: string;
}

export interface TemplateItem {
  id: string;
  bundleId: MainBundleId;
  title: string;
  description: string;
  dimensions: string;
  badge: string;
  canvaPrompt: string;
  slides: SlideData[];
  categoryName: string;
}

export interface SavedVaultItem {
  id: string;
  savedAt: string;
  templateTitle: string;
  bundleTitle: string;
  slides: SlideData[];
}

export const DigitalKitStudio: React.FC<DigitalKitStudioProps> = ({
  document: activeDoc,
  onSwitchToPdfStudio,
  onOpenEditor
}) => {
  // BUNDLE TAB STATE
  const [activeBundle, setActiveBundle] = useState<MainBundleId>('canva-social');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // STUDIO CONTROLS & THEME
  const [scale, setScale] = useState<number>(100);
  const [themeMode, setThemeMode] = useState<'solid-gold' | 'artistic-flair'>('solid-gold');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ENGLISH');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // VAULT STATE
  const [personalVault, setPersonalVault] = useState<SavedVaultItem[]>([]);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);

  // MODALS & AI STATE
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiPromptTopic, setAiPromptTopic] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isOwnerPortalOpen, setIsOwnerPortalOpen] = useState<boolean>(false);

  // ==========================================
  // BUNDLE 3: RESUME & CV BUNDLES STATE
  // ==========================================
  const [resumeSubTab, setResumeSubTab] = useState<'pm-exec' | 'brand-designer'>('pm-exec');
  const [resumeViewMode, setResumeViewMode] = useState<'resume' | 'cover-letter'>('resume');
  
  const [resumeData, setResumeData] = useState({
    fullName: 'ALEX MORGAN',
    jobTitle: 'PRINCIPAL PRODUCT MANAGER',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 382-9102',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan-pm',
    summary: 'Data-driven Senior Product Leader with 8+ years of experience building scalable AI SaaS platforms from 0 to 1. Track record of scaling ARR from $5M to $18M while managing cross-functional engineering teams.',
    jobs: [
      {
        id: 'j1',
        title: 'Lead Product Manager',
        company: 'Velociti AI',
        date: '2023 - Present',
        bullets: [
          'Spearheaded the deployment of generative AI features resulting in a 45% increase in user retention.',
          'Managed a $4.5M annual engineering budget across 3 global teams.',
          'Reduced customer onboarding friction by 60% through streamlined UX redesign.'
        ]
      },
      {
        id: 'j2',
        title: 'Senior Product Manager',
        company: 'CloudMetrics Inc.',
        date: '2020 - 2023',
        bullets: [
          'Scaled active users (MAUs) from 120k to 850k through targeted growth loops.',
          'Launched enterprise analytics dashboard for Fortune 500 tech clients.'
        ]
      }
    ],
    skills: 'AI Product Strategy, Roadmap Execution, Data Analytics, Cross-Functional Leadership, Prompt Engineering, Agile Development',
    education: 'B.S. in Computer Science — Stanford University',
    coverLetterSubject: 'APPLICATION FOR CHIEF PRODUCT OFFICER',
    coverLetterBody: 'Dear Hiring Committee,\n\nI am writing to express my enthusiastic interest in the Principal Product Manager position. With over 8 years of experience scaling AI platforms and leading high-performing engineering organizations, I bring a strategic mindset and operational excellence to your team.\n\nIn my previous role at Velociti AI, I drove product strategy that increased annual ARR by 320% while deploying cutting-edge LLM workflows. I look forward to contributing similar high-impact results to your organization.\n\nSincerely,\nAlex Morgan'
  });

  // Switch Resume Sub-Tab
  const handleSwitchResumeSubTab = (tab: 'pm-exec' | 'brand-designer') => {
    setResumeSubTab(tab);
    if (tab === 'brand-designer') {
      setResumeData(prev => ({
        ...prev,
        fullName: 'SOPHIA CHEN',
        jobTitle: 'SENIOR BRAND IDENTITY DESIGNER',
        email: 'sophia@chen-studio.design',
        phone: '+1 (555) 720-4119',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/sophiachendesign',
        summary: 'Award-winning Brand & Visual Designer specializing in identity systems, digital typography, and interactive UI for high-growth DTC & Fintech brands.',
        jobs: [
          {
            id: 'j1',
            title: 'Creative Director',
            company: 'Studio Luminary',
            date: '2022 - Present',
            bullets: [
              'Directed complete brand re-designs for 12+ Series A & B technology startups.',
              'Won 2025 Red Dot Design Award for minimalist fintech mobile application interface.'
            ]
          }
        ]
      }));
    } else {
      setResumeData(prev => ({
        ...prev,
        fullName: 'ALEX MORGAN',
        jobTitle: 'PRINCIPAL PRODUCT MANAGER',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 382-9102',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexmorgan-pm'
      }));
    }
  };

  // Add job row
  const handleAddResumeJob = () => {
    setResumeData(prev => ({
      ...prev,
      jobs: [
        ...prev.jobs,
        {
          id: `job-${Date.now()}`,
          title: 'New Position',
          company: 'Company Name',
          date: '2024 - Present',
          bullets: ['Key achievement statement highlighting quantifiable metric and result.']
        }
      ]
    }));
  };

  // Update specific job
  const handleUpdateJobField = (id: string, field: 'title' | 'company' | 'date' | 'bullets', value: any) => {
    setResumeData(prev => ({
      ...prev,
      jobs: prev.jobs.map(j => (j.id === id ? { ...j, [field]: value } : j))
    }));
  };

  // ==========================================
  // BUNDLE 4: EMAIL & COPY SWIPES STATE
  // ==========================================
  const [emailSubTab, setEmailSubTab] = useState<'pas-onboarding' | 'asia-lead-magnet'>('pas-onboarding');
  const [emailStepIndex, setEmailStepIndex] = useState<number>(0);

  const [emailSteps, setEmailSteps] = useState([
    {
      stepName: 'EMAIL 1: IMMEDIATE GRATIFICATION & ACCESS',
      subject: 'ACCESS GRANTED: HERE IS YOUR DIGITAL CREATOR KIT',
      preheader: 'Your download link is inside. Plus, 1 crucial tip to get started.',
      body: 'Hey {{first_name}},\n\nWelcome to Creator Studio! We are thrilled to have you here.\n\nAs promised, here is your direct download link to access your complete Digital Creator Assets:\n\n👉 https://example.com/vault-download\n\nBefore you dive in, here is the #1 mistake most creators make when setting up their brand templates...\n\nThey skip setting up their global brand color palette first! Take 2 minutes to define your primary 3 hex codes before editing your templates.\n\nTalk soon,\nElena',
      ctaText: 'DOWNLOAD YOUR KIT NOW ➔',
      ctaUrl: 'https://example.com/download'
    },
    {
      stepName: 'EMAIL 2: ATTENTION & INTEREST',
      subject: 'SUBJECT: CASE STUDY: HOW WE HELPED AN AGENCY SCALE 3X WITHOUT HIRING',
      preheader: 'The exact client onboarding workflow unveiled.',
      body: 'Hey {{first_name}},\n\nWhen most agencies hit $20k/month, they hit a wall. Onboarding new clients becomes chaotic, communications slip through the cracks, and margins drop.\n\nWe spent 6 months building the ultimate Client Onboarding & Media Kit Bundle to solve this exact bottleneck.\n\nInside, you will find editable pitch decks, client welcome guides, and scope-of-work templates.',
      ctaText: 'VIEW THE AGENCY SWIPE PACK ➔',
      ctaUrl: 'https://example.com/agency-pack'
    },
    {
      stepName: 'EMAIL 3: DESIRE & SOCIAL PROOF',
      subject: 'How 500+ creators launched 3 products in 48 hours',
      preheader: 'See the exact templates behind $10k launches.',
      body: 'Hey {{first_name}},\n\nBy leveraging pre-built Canva Social Kits and AI Prompt Blueprints, founders are creating full-funnel digital stacks without hiring a developer.',
      ctaText: 'UNLOCK THE CREATOR STACK ➔',
      ctaUrl: 'https://example.com/creator-stack'
    }
  ]);

  const currentEmailStep = emailSteps[emailStepIndex] || emailSteps[0];

  const handleUpdateEmailField = (field: string, val: string) => {
    setEmailSteps(prev => prev.map((step, idx) => (idx === emailStepIndex ? { ...step, [field]: val } : step)));
  };

  // Insert token into active email body
  const handleInsertToken = (token: string) => {
    handleUpdateEmailField('body', currentEmailStep.body + ` ${token} `);
  };

  // ==========================================
  // BUNDLE 5: DIGITAL PLANNERS STATE
  // ==========================================
  const [plannerSubTab, setPlannerSubTab] = useState<'daily-high-performance' | '30-day-habit'>('daily-high-performance');
  const [plannerTitle, setPlannerTitle] = useState('DAILY HIGH PERFORMANCE & TIME-BLOCK PLANNER');
  const [plannerAffirmation, setPlannerAffirmation] = useState('Remember: Focus on outcomes, not busywork. Protect your morning focus blocks at all costs!');
  
  const [objectives, setObjectives] = useState([
    { id: 'o1', text: 'Finalize Q3 Client Onboarding Deck', done: true },
    { id: 'o2', text: 'Record 3 Instagram Educational Carousels', done: false },
    { id: 'o3', text: 'Review Weekly Financial Cashflow', done: false }
  ]);

  const [timeBlocks, setTimeBlocks] = useState([
    { time: '08:00 AM - 09:30 AM', task: 'Hydrate, Journal 10-mins, Goal Review' },
    { time: '09:30 AM - 11:30 AM', task: 'Deep Work: Client Onboarding Pack Design' },
    { time: '11:30 AM - 12:30 PM', task: 'Deep Work: Record & Batch Social Media Videos' },
    { time: '12:30 PM - 01:30 PM', task: 'Email Triage & Asynchronous Messages' }
  ]);

  const [habits, setHabits] = useState([
    { id: 'h1', name: 'Morning Sun & Walk', category: 'Health', checks: [true, true, true, true, true, false, false] },
    { id: 'h2', name: 'Read 20 Pages', category: 'Mindset', checks: [true, true, true, true, true, true, false] },
    { id: 'h3', name: 'Zero Sugar Lunch', category: 'Nutrition', checks: [true, true, true, true, false, false, false] }
  ]);

  // Toggle habit checkbox
  const handleToggleHabitDay = (habitId: string, dayIndex: number) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        const newChecks = [...h.checks];
        newChecks[dayIndex] = !newChecks[dayIndex];
        return { ...h, checks: newChecks };
      })
    );
  };

  // Add new objective
  const handleAddObjective = () => {
    setObjectives(prev => [...prev, { id: `o-${Date.now()}`, text: 'New High Priority Target', done: false }]);
  };

  // Add new habit
  const handleAddHabit = () => {
    setHabits(prev => [
      ...prev,
      { id: `h-${Date.now()}`, name: 'New Daily Habit', category: 'Growth', checks: [false, false, false, false, false, false, false] }
    ]);
  };

  // ==========================================
  // BUNDLE 6: MASTER PROMPT BLUEPRINTS STATE
  // ==========================================
  const [promptSubTab, setPromptSubTab] = useState<'canva-batch' | 'resume-ai' | 'sales-copy'>('canva-batch');
  const [promptVariables, setPromptVariables] = useState({
    niche: 'Digital Marketing & AI SaaS',
    targetAudience: 'Solopreneurs & Agency Owners',
    primaryTopic: '9 Ways AI Replaces Manual Design Workflows',
    jobTitle: 'Senior Executive',
    productName: 'The Creator Asset Vault',
    painPoint: 'Spending 10+ hours a week making templates from scratch'
  });

  // Switch Master Prompt Sub-Tab
  const handleSwitchPromptTab = (tab: 'canva-batch' | 'resume-ai' | 'sales-copy') => {
    setPromptSubTab(tab);
  };

  // Dynamic Prompt Output text
  const getPromptOutputText = () => {
    if (promptSubTab === 'canva-batch') {
      return `YOU ARE AN ELITE SOCIAL MEDIA COPYWRITER & CANVA DESIGN ARCHITECT. YOUR TASK IS TO GENERATE HIGH-CONVERTING, VIRAL SLIDE-BY-SLIDE SOCIAL MEDIA CAROUSELS.

[INPUT VARIABLES]:
- NICHE: "${promptVariables.niche}"
- TARGET AUDIENCE: "${promptVariables.targetAudience}"
- CORE MESSAGE / TOPIC: "${promptVariables.primaryTopic}"
- VISUAL TONE: Editorial Luxury, Bold Tech, Solid Gold

[SYSTEM CONSTRAINTS]:
1. SLIDE 1 MUST CONTAIN A HIGH-CURIOSITY HOOK UNDER 8 WORDS.
2. SLIDES 2-4 MUST DELIVER ACTIONABLE STEP-BY-STEP INSIGHT WITH ZERO FLUFF.
3. SLIDE 5 MUST FEATURE A CLEAR CALL-TO-ACTION (SAVE, COMMENT, LINK).
4. OUTPUT MUST STRICTLY MATCH SPECIFIED JSON SCHEMA FOR VISUAL LAYOUT RENDERING.`;
    } else if (promptSubTab === 'resume-ai') {
      return `YOU ARE A TOP 1% EXECUTIVE RESUME RECRUITER AND ATS OPTIMIZATION SPECIALIST. YOUR TASK IS TO TRANSFORM RAW CAREER NOTES INTO HIGH-IMPACT, QUANTIFIABLE RESUME BULLET POINTS USING THE GOOGLE XYZ FORMULA: "ACCOMPLISHED [X] AS MEASURED BY [Y], BY DOING [Z]".

[INPUT VARIABLES]:
- TARGET JOB TITLE: "${promptVariables.jobTitle}"
- INDUSTRY: "${promptVariables.niche}"
- TARGET AUDIENCE: Hiring Managers & Executive Recruiters

[RULES]:
- Eliminate weak passive verbs (e.g. "Responsible for", "worked on").
- Use power verbs (e.g., "Spearheaded", "Engineered", "Orchestrated").
- Include metrics (ARR %, $ savings, efficiency gains, retention rates).`;
    } else {
      return `YOU ARE A DIRECT RESPONSE COPYWRITER TRAINED IN THE GARY HALBERT AND BEN SETTLE PRINCIPLES OF EMAIL COPY.

[TASK]:
WRITE A 5-PART EMAIL NURTURE SEQUENCE INTRODUCING A DIGITAL PRODUCT OR HIGH-TICKET SERVICE USING THE PROBLEM-AGITATE-SOLVE (PAS) FRAMEWORK.

[VARIABLES]:
- PRODUCT NAME: "${promptVariables.productName}"
- PRIMARY PAIN POINT: "${promptVariables.painPoint}"
- TARGET AUDIENCE: "${promptVariables.targetAudience}"

[RULES]:
- Email 1: Instant Gratification & Curiosity Hook.
- Email 2: Agitate the core frustration with social proof.
- Email 3: Overcome top 3 objections.
- Email 4 & 5: Urgency & Scarcity for final call to action.`;
    }
  };

  // Canvas Ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Copy helper
  const triggerCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save active template to Personal Vault
  const handleSaveToVault = () => {
    const newItem: SavedVaultItem = {
      id: `vault-${Date.now()}`,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      templateTitle: `${activeBundle.toUpperCase()} ASSET`,
      bundleTitle: `Bundle · ${activeBundle}`,
      slides: [
        {
          id: `vs-${Date.now()}`,
          tagline: 'ARCHIVED VAULT ITEM',
          title: promptSubTab || activeBundle,
          body: getPromptOutputText() || JSON.stringify(resumeData),
          cta: 'ACCESS'
        }
      ]
    };
    setPersonalVault(prev => [newItem, ...prev]);
    triggerCopy('', 'vault-saved');
    setIsVaultOpen(true);
  };

  // Export current canvas as PNG
  const handleExportPng = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc, clonedElement) => {
          sanitizeClonedDocForHtml2Canvas(clonedDoc, clonedElement);
        }
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `digital-kit-${activeBundle}-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
  };

  // Export as Vector PDF
  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: [800, 1000] });
    doc.setFillColor(254, 252, 232); // Gold cream
    doc.rect(0, 0, 800, 1000, 'F');
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(12);
    doc.rect(20, 20, 760, 960, 'S');

    doc.setTextColor(202, 138, 4);
    doc.setFontSize(22);
    doc.text(`DIGITAL KIT ARCHIVE — ${activeBundle.toUpperCase()}`, 50, 70);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(28);

    if (activeBundle === 'resume-cv') {
      doc.text(resumeData.fullName, 50, 120);
      doc.setFontSize(16);
      doc.text(resumeData.jobTitle, 50, 145);
      doc.setFontSize(12);
      doc.text(`${resumeData.email} | ${resumeData.phone} | ${resumeData.linkedin}`, 50, 165);

      doc.setFontSize(14);
      doc.text('EXECUTIVE SUMMARY', 50, 200);
      const sumLines = doc.splitTextToSize(resumeData.summary, 700);
      doc.setFontSize(11);
      doc.text(sumLines, 50, 220);
    } else {
      doc.text(plannerTitle || 'DIGITAL KIT ASSET', 50, 120);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(getPromptOutputText() || currentEmailStep.body, 700);
      doc.text(lines, 50, 160);
    }

    doc.save(`digital-kit-${activeBundle}.pdf`);
  };

  // Convert current Digital Kit into Editable PDF Document & Open Editor
  const handleEditInPdfStudio = () => {
    let sections = [];

    if (activeBundle === 'resume-cv') {
      sections = [
        {
          id: 'sec-summary',
          title: 'PROFESSIONAL SUMMARY',
          content: resumeData.summary,
          bullets: resumeData.skills.split(',').map(s => s.trim())
        },
        ...resumeData.jobs.map(j => ({
          id: j.id,
          title: `${j.title.toUpperCase()} — ${j.company.toUpperCase()} (${j.date})`,
          content: `Position at ${j.company}`,
          bullets: j.bullets
        })),
        {
          id: 'sec-edu',
          title: 'EDUCATION & CREDENTIALS',
          content: resumeData.education,
          bullets: []
        }
      ];
    } else if (activeBundle === 'email-copy') {
      sections = emailSteps.map((step, sIdx) => ({
        id: `email-step-${sIdx}`,
        title: step.stepName,
        subtitle: `SUBJECT: ${step.subject}`,
        content: step.body,
        bullets: [`Preview: ${step.preheader}`, `CTA URL: ${step.ctaUrl}`]
      }));
    } else if (activeBundle === 'digital-planners') {
      sections = [
        {
          id: 'sec-objectives',
          title: 'TOP OBJECTIVE TARGETS',
          content: plannerAffirmation,
          bullets: objectives.map(o => o.text)
        },
        {
          id: 'sec-timeblocks',
          title: 'DAILY TIME-BLOCKING SCHEDULE',
          content: 'Hourly Deep Work & Energy Management',
          bullets: timeBlocks.map(tb => `${tb.time}: ${tb.task}`)
        },
        {
          id: 'sec-habits',
          title: '7-DAY HABIT STREAK TRACKER',
          content: 'Consistency & Metric Audit Grid',
          bullets: habits.map(h => `${h.name} (${h.category})`)
        }
      ];
    } else {
      sections = [
        {
          id: 'sec-prompt',
          title: 'SYSTEM INSTRUCTION BLUEPRINT',
          content: getPromptOutputText(),
          bullets: [
            `Niche: ${promptVariables.niche}`,
            `Target Audience: ${promptVariables.targetAudience}`,
            `Primary Topic: ${promptVariables.primaryTopic}`
          ]
        }
      ];
    }

    const formattedSections = sections.map((sec, idx) => ({
      id: sec.id,
      chapterNumber: idx + 1,
      title: sec.title,
      subtitle: sec.subtitle || '',
      paragraphs: [sec.content],
      bulletCards: (sec.bullets || []).map(b => ({
        title: typeof b === 'string' ? b : 'Item',
        description: ''
      }))
    }));

    const docToEdit: DocumentData = {
      title: activeDoc?.title || `${activeBundle.replace('-', ' ').toUpperCase()} KIT`,
      subtitle: 'EDITABLE DIGITAL KIT BUNDLE',
      author: resumeData.fullName || 'Creator Studio',
      category: activeBundle.toUpperCase(),
      estimatedReadTime: '10 MIN READ',
      keyTakeaways: ['High converting digital product kit', 'Fully editable in PDF Studio'],
      sections: formattedSections,
      callToAction: {
        headline: 'GET YOUR DIGITAL ASSET BUNDLE TODAY',
        subhead: 'Instant Download & Unlimited Commercial Usage Rights',
        buttonText: 'DOWNLOAD COMPLETE BUNDLE',
        websiteOrHandle: 'https://example.com/vault-download'
      },
      marketingCopy: {
        gumroadHeadline: 'The Ultimate Digital Creator Asset Bundle',
        pinterestPinText: '50+ High Converting Templates & Prompts',
        salesHighlights: ['100% Editable', 'Commercial Rights Included', 'Instant Access']
      }
    };

    if (onOpenEditor) {
      onOpenEditor(docToEdit);
    } else if (onSwitchToPdfStudio) {
      onSwitchToPdfStudio();
    }
  };

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 font-sans p-2 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* 1. TOP HEADER & BRAND BANNER (MATCHES VIDEO RECORDING EXACTLY) */}
      <div className="bg-[#13171d]/90 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LOGO BADGE */}
        <div className="flex items-center gap-3">
          <div className="bg-[#EAB308] border-2 border-black px-3 py-1.5 rounded-lg text-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
            <Crown className="h-4 w-4 fill-black" />
            <span>GOLD</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-[#CA8A04]/20 text-[#FACC15] px-2 py-0.5 rounded border border-[#EAB308]/40 font-mono">
                VIRAL CREATOR ASSETS
              </span>
              <span className="text-[10px] font-mono text-ink-muted font-bold uppercase hidden sm:inline">
                GOLD TRIM EDITION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-serif">
              TEMPLATE ARCHIVE
            </h1>
          </div>
        </div>

        {/* TOP CONTROLS NAVBAR */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsOwnerPortalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-surface-1 border-2 border-black text-ink-secondary hover:text-white font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5 text-[#EAB308]" />
            <span>OWNER PORTAL</span>
          </button>

          <button
            onClick={() => setIsVaultOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#EAB308] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="h-3.5 w-3.5 fill-black" />
            <span>PERSONAL VAULT ({personalVault.length})</span>
          </button>

          <button
            onClick={() => setThemeMode(themeMode === 'solid-gold' ? 'artistic-flair' : 'solid-gold')}
            className="px-3 py-1.5 rounded-lg bg-surface-1 border-2 border-black text-xs font-bold text-ink-secondary hover:text-white uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            <Palette className="h-3.5 w-3.5 text-[#EAB308]" />
            <span>{themeMode === 'solid-gold' ? 'ARTISTIC FLAIR & SOLID GOLD' : 'HIGH CONTRAST MODE'}</span>
          </button>

          <button
            onClick={handleSaveToVault}
            className="px-3 py-1.5 rounded-lg bg-surface-1 border-2 border-black text-xs font-bold text-ink-secondary hover:text-white uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            <FolderDown className="h-3.5 w-3.5 text-emerald-400" />
            <span>EXPORT ASSETS</span>
          </button>

          {onSwitchToPdfStudio && (
            <button
              onClick={onSwitchToPdfStudio}
              className="px-3 py-1.5 rounded-lg bg-red-950/80 border-2 border-black text-red-300 hover:text-red-100 text-xs font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>EXIT</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN BUNDLE CATEGORY NAVIGATION TABS (6 BUNDLES) */}
      <div className="bg-[#13171d]/90 border-2 border-black rounded-xl p-2 shadow-[4px_4px_0px_0px_#000000] overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setActiveBundle('canva-social')}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-black transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
              activeBundle === 'canva-social'
                ? 'bg-[#EAB308] text-black'
                : 'bg-surface-1 text-ink-secondary hover:bg-surface-2'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>CANVA SOCIAL KITS</span>
          </button>

          <button
            onClick={() => setActiveBundle('brand-media')}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-black transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
              activeBundle === 'brand-media'
                ? 'bg-[#EAB308] text-black'
                : 'bg-surface-1 text-ink-secondary hover:bg-surface-2'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>BRAND & MEDIA KITS</span>
          </button>

          <button
            onClick={() => setActiveBundle('resume-cv')}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-black transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
              activeBundle === 'resume-cv'
                ? 'bg-[#EAB308] text-black'
                : 'bg-surface-1 text-ink-secondary hover:bg-surface-2'
            }`}
          >
            <User className="h-4 w-4" />
            <span>RESUME & CV BUNDLES</span>
          </button>

          <button
            onClick={() => setActiveBundle('email-copy')}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-black transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
              activeBundle === 'email-copy'
                ? 'bg-[#EAB308] text-black'
                : 'bg-surface-1 text-ink-secondary hover:bg-surface-2'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>EMAIL & COPY SWIPES</span>
          </button>

          <button
            onClick={() => setActiveBundle('digital-planners')}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-black transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
              activeBundle === 'digital-planners'
                ? 'bg-[#EAB308] text-black'
                : 'bg-surface-1 text-ink-secondary hover:bg-surface-2'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>DIGITAL PLANNERS</span>
          </button>

          <button
            onClick={() => setActiveBundle('master-prompts')}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-black transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
              activeBundle === 'master-prompts'
                ? 'bg-[#EAB308] text-black'
                : 'bg-surface-1 text-ink-secondary hover:bg-surface-2'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            <span>MASTER PROMPT BLUEPRINTS</span>
            <span className="text-[9px] bg-red-600 text-white font-mono px-1.5 py-0.2 rounded font-extrabold">
              AI META
            </span>
          </button>
        </div>
      </div>

      {/* 3. SUB-HEADER & TOOLBAR CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LOCALIZATION BOX */}
        <div className="lg:col-span-4 bg-[#13171d]/90 border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#EAB308]" />
            <div className="text-left">
              <div className="text-[9px] font-mono font-bold text-[#FACC15] uppercase">
                1-CLICK AI LOCALIZATION
              </div>
              <div className="text-xs font-black text-white uppercase">
                MULTI-LANGUAGE AI TRANSLATOR
              </div>
            </div>
          </div>

          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="bg-black border-2 border-black text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <option value="ENGLISH">🇺🇸 ENGLISH</option>
            <option value="SPANISH">🇪🇸 SPANISH</option>
            <option value="FRENCH">🇫🇷 FRENCH</option>
            <option value="GERMAN">🇩🇪 GERMAN</option>
            <option value="JAPANESE">🇯🇵 JAPANESE</option>
          </select>
        </div>

        {/* CANVAS STUDIO CONTROLS BOX */}
        <div className="lg:col-span-8 bg-[#13171d]/90 border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-ink-secondary uppercase">
              CANVAS STUDIO CONTROLS
            </span>
            <div className="flex items-center gap-2 bg-black px-2 py-1 rounded-lg border border-white/10">
              <button onClick={() => setScale(Math.max(50, scale - 10))} className="p-1 hover:text-[#EAB308] cursor-pointer">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-[#FACC15]">{scale}%</span>
              <button onClick={() => setScale(Math.min(150, scale + 10))} className="p-1 hover:text-[#EAB308] cursor-pointer">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToVault}
              className="px-3 py-1.5 rounded-lg bg-[#EAB308] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1 cursor-pointer"
            >
              <Bookmark className="h-3.5 w-3.5 fill-black" />
              <span>SAVE VAULT</span>
            </button>

            <button
              onClick={handleExportPng}
              className="px-3 py-1.5 rounded-lg bg-surface-1 border-2 border-black text-ink-secondary hover:text-white font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#EAB308]" />
              <span>PNG</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="px-3 py-1.5 rounded-lg bg-surface-1 border-2 border-black text-ink-secondary hover:text-white font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#EAB308]" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleEditInPdfStudio}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>EDIT IN PDF STUDIO</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE CONTENT AREA (TAB SPECIFIC HIGH-FIDELITY VIEWS) */}

      {/* ============================================================== */}
      {/* CASE A: RESUME & CV BUNDLES VIEW (MATCHES VIDEO AT 00:01 - 00:05) */}
      {/* ============================================================== */}
      {activeBundle === 'resume-cv' && (
        <div className="space-y-4">
          {/* SUB-TABS SELECTOR */}
          <div className="bg-[#13171d]/90 border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSwitchResumeSubTab('pm-exec')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
                  resumeSubTab === 'pm-exec' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                SENIOR PRODUCT MANAGER - TECH EXECUTIVE
              </button>
              <button
                onClick={() => handleSwitchResumeSubTab('brand-designer')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
                  resumeSubTab === 'brand-designer' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                CREATIVE BRAND DIRECTOR & DESIGNER
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setResumeViewMode('resume')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase border-2 border-black cursor-pointer ${
                  resumeViewMode === 'resume' ? 'bg-amber-400 text-black' : 'bg-black text-ink-secondary'
                }`}
              >
                RESUME LAYOUT
              </button>
              <button
                onClick={() => setResumeViewMode('cover-letter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase border-2 border-black cursor-pointer ${
                  resumeViewMode === 'cover-letter' ? 'bg-amber-400 text-black' : 'bg-black text-ink-secondary'
                }`}
              >
                COVER LETTER
              </button>
            </div>
          </div>

          {/* MAIN 2-COLUMN DISPLAY & FORM EDITOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: LIVE RESUME / COVER LETTER DOCUMENT PREVIEW */}
            <div className="lg:col-span-7 bg-[#FEFCE8] text-slate-900 border-4 border-black rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6 font-sans relative">
              <div className="absolute top-4 right-4 bg-[#EAB308] text-black font-black text-[10px] px-2 py-0.5 rounded border border-black uppercase">
                LIVE RESUME PREVIEW
              </div>

              {resumeViewMode === 'resume' ? (
                <>
                  {/* RESUME HEADER */}
                  <div className="border-b-2 border-slate-900 pb-4 space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase font-serif tracking-tight text-slate-950">
                      {resumeData.fullName}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-[#CA8A04] uppercase font-mono tracking-wider">
                      {resumeData.jobTitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 pt-1">
                      <span>{resumeData.email}</span>
                      <span>•</span>
                      <span>{resumeData.phone}</span>
                      <span>•</span>
                      <span>{resumeData.location}</span>
                      <span>•</span>
                      <span className="text-amber-800 underline font-mono">{resumeData.linkedin}</span>
                    </div>
                  </div>

                  {/* PROFESSIONAL SUMMARY */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono border-b border-slate-300 pb-1">
                      PROFESSIONAL SUMMARY
                    </h3>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                      {resumeData.summary}
                    </p>
                  </div>

                  {/* WORK EXPERIENCE */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono border-b border-slate-300 pb-1">
                      WORK EXPERIENCE
                    </h3>
                    {resumeData.jobs.map(job => (
                      <div key={job.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-950">
                          <span>{job.title} <span className="font-normal text-slate-600">at {job.company}</span></span>
                          <span className="font-mono text-slate-500 text-[11px]">{job.date}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 font-medium pl-1">
                          {job.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* SKILLS & EDUCATION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-300 pt-4">
                    <div>
                      <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono mb-1">SKILLS & COMPETENCIES</h3>
                      <p className="text-xs font-medium text-slate-700">{resumeData.skills}</p>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono mb-1">EDUCATION</h3>
                      <p className="text-xs font-medium text-slate-700">{resumeData.education}</p>
                    </div>
                  </div>
                </>
              ) : (
                /* COVER LETTER VIEW */
                <div className="space-y-4">
                  <div className="border-b-2 border-slate-900 pb-3">
                    <h2 className="text-2xl font-black uppercase font-serif text-slate-950">{resumeData.fullName}</h2>
                    <p className="text-xs font-bold text-[#CA8A04] uppercase font-mono">{resumeData.coverLetterSubject}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                    {resumeData.coverLetterBody}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: EDIT RESUME DETAILS FORM */}
            <div className="lg:col-span-5 bg-[#13171d]/90 border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-[#EAB308]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">EDIT RESUME DETAILS</h3>
                </div>
              </div>

              <div className="space-y-3 text-left">
                {/* PERSONAL INFO */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">PERSONAL INFO</span>
                  <input
                    type="text"
                    value={resumeData.fullName}
                    onChange={e => setResumeData({ ...resumeData, fullName: e.target.value })}
                    className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl focus:border-[#EAB308] outline-none"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    value={resumeData.jobTitle}
                    onChange={e => setResumeData({ ...resumeData, jobTitle: e.target.value })}
                    className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl focus:border-[#EAB308] outline-none"
                    placeholder="Job Title"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={resumeData.email}
                      onChange={e => setResumeData({ ...resumeData, email: e.target.value })}
                      className="bg-black border border-white/10 text-white text-xs p-2 rounded-xl"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={resumeData.phone}
                      onChange={e => setResumeData({ ...resumeData, phone: e.target.value })}
                      className="bg-black border border-white/10 text-white text-xs p-2 rounded-xl"
                      placeholder="Phone"
                    />
                  </div>
                </div>

                {/* EXECUTIVE SUMMARY */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">EXECUTIVE SUMMARY</span>
                  <textarea
                    rows={3}
                    value={resumeData.summary}
                    onChange={e => setResumeData({ ...resumeData, summary: e.target.value })}
                    className="w-full bg-black border border-white/10 text-white text-xs font-medium p-2.5 rounded-xl focus:border-[#EAB308] outline-none"
                  />
                </div>

                {/* WORK EXPERIENCE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">WORK EXPERIENCE</span>
                    <button
                      onClick={handleAddResumeJob}
                      className="px-2 py-1 bg-[#EAB308] text-black font-black text-[10px] rounded uppercase border border-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> ADD JOB
                    </button>
                  </div>

                  {resumeData.jobs.map((job, jIdx) => (
                    <div key={job.id} className="p-3 bg-black border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-ink-muted">POSITION #{jIdx + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={job.title}
                        onChange={e => handleUpdateJobField(job.id, 'title', e.target.value)}
                        className="w-full bg-surface-1 border border-white/15 text-white text-xs font-bold p-1.5 rounded"
                      />
                      <input
                        type="text"
                        value={job.company}
                        onChange={e => handleUpdateJobField(job.id, 'company', e.target.value)}
                        className="w-full bg-surface-1 border border-white/15 text-white text-xs p-1.5 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASE B: EMAIL & COPY SWIPES VIEW (MATCHES VIDEO AT 00:05 - 00:11) */}
      {/* ============================================================== */}
      {activeBundle === 'email-copy' && (
        <div className="space-y-4">
          {/* SUB-TABS SELECTOR */}
          <div className="bg-[#13171d]/90 border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEmailSubTab('pas-onboarding')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
                  emailSubTab === 'pas-onboarding' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                PAS - 5-PART ONBOARDING & WELCOME EMAIL SEQUENCE
              </button>
              <button
                onClick={() => setEmailSubTab('asia-lead-magnet')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
                  emailSubTab === 'asia-lead-magnet' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                ASIA - HIGH-TICKET LEAD MAGNET & SALES EMAIL FRAMEWORK
              </button>
            </div>

            {/* STEP BUTTONS */}
            <div className="flex items-center gap-1.5">
              {emailSteps.map((step, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setEmailStepIndex(sIdx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black cursor-pointer ${
                    emailStepIndex === sIdx ? 'bg-[#EAB308] text-black' : 'bg-black text-ink-secondary'
                  }`}
                >
                  STEP {sIdx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: EMAIL INBOX PREVIEW CARD */}
            <div className="lg:col-span-7 bg-[#FEFCE8] text-slate-900 border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000000] space-y-4 font-sans relative">
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
                <div className="text-xs font-mono font-bold text-slate-600">
                  From: <span className="font-extrabold text-slate-900">Elena &lt;newsletter@creatorstudio.com&gt;</span>
                </div>
                <div className="text-[10px] font-mono bg-[#EAB308] text-black px-2 py-0.5 rounded font-black">
                  JUST NOW
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-950 uppercase font-serif">
                  {currentEmailStep.subject}
                </h3>
                <p className="text-xs font-semibold text-slate-500 font-mono">{currentEmailStep.preheader}</p>
              </div>

              <div className="bg-white border-2 border-slate-300 rounded-xl p-4 text-xs font-medium text-slate-800 whitespace-pre-line leading-relaxed shadow-inner">
                {currentEmailStep.body}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={currentEmailStep.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#EAB308] border-2 border-black text-black font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_0px_#000000] inline-block hover:bg-[#FACC15]"
                >
                  {currentEmailStep.ctaText}
                </a>
                <span className="text-[10px] font-mono text-ink-muted font-bold uppercase">AUTOMATED EMAIL SWIPE</span>
              </div>
            </div>

            {/* RIGHT: EDIT EMAIL STEP FORM */}
            <div className="lg:col-span-5 bg-[#13171d]/90 border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  EDIT EMAIL STEP {emailStepIndex + 1}
                </h3>
                <span className="text-[10px] font-mono text-[#FACC15]">TOKENS SUPPORTED</span>
              </div>

              {/* DYNAMIC TOKENS */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">INSERT DYNAMIC TOKEN</span>
                <div className="flex flex-wrap gap-1.5">
                  {['{{first_name}}', '{{brand_name}}', '{{download_link}}', '{{sender_name}}'].map(token => (
                    <button
                      key={token}
                      onClick={() => handleInsertToken(token)}
                      className="px-2 py-1 bg-black border border-white/15 text-[10px] font-mono text-[#FACC15] hover:border-[#EAB308] rounded cursor-pointer"
                    >
                      + {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP NAME */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">STEP NAME / LABEL</span>
                <input
                  type="text"
                  value={currentEmailStep.stepName}
                  onChange={e => handleUpdateEmailField('stepName', e.target.value)}
                  className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl"
                />
              </div>

              {/* SUBJECT LINE */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">SUBJECT LINE</span>
                <input
                  type="text"
                  value={currentEmailStep.subject}
                  onChange={e => handleUpdateEmailField('subject', e.target.value)}
                  className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl"
                />
              </div>

              {/* BODY TEXT */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">EMAIL BODY TEXT</span>
                <textarea
                  rows={6}
                  value={currentEmailStep.body}
                  onChange={e => handleUpdateEmailField('body', e.target.value)}
                  className="w-full bg-black border border-white/10 text-white text-xs font-medium p-2.5 rounded-xl leading-relaxed"
                />
              </div>

              {/* CTA TEXT & URL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">CTA BUTTON TEXT</span>
                  <input
                    type="text"
                    value={currentEmailStep.ctaText}
                    onChange={e => handleUpdateEmailField('ctaText', e.target.value)}
                    className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">CTA URL</span>
                  <input
                    type="text"
                    value={currentEmailStep.ctaUrl}
                    onChange={e => handleUpdateEmailField('ctaUrl', e.target.value)}
                    className="w-full bg-black border border-white/10 text-white text-xs p-2 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASE C: DIGITAL PLANNERS VIEW (MATCHES VIDEO AT 00:12 - 00:18) */}
      {/* ============================================================== */}
      {activeBundle === 'digital-planners' && (
        <div className="space-y-4">
          <div className="bg-[#13171d]/90 border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlannerSubTab('daily-high-performance')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer ${
                  plannerSubTab === 'daily-high-performance' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                DAILY HIGH PERFORMANCE & TIME-BLOCK PLANNER
              </button>
              <button
                onClick={() => setPlannerSubTab('30-day-habit')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer ${
                  plannerSubTab === '30-day-habit' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                30-DAY CREATOR HABIT & GOAL TRACKER WORKBOOK
              </button>
            </div>

            <div className="bg-black px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-[#FACC15] flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Sun, Aug 9</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: LIVE PLANNER CARD PREVIEW */}
            <div className="lg:col-span-7 bg-[#FEFCE8] text-slate-900 border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000000] space-y-6 font-sans">
              <div className="border-b-2 border-slate-900 pb-3">
                <h2 className="text-xl sm:text-2xl font-black uppercase font-serif text-slate-950">{plannerTitle}</h2>
                <p className="text-xs font-bold text-[#CA8A04] uppercase font-mono">Interactive Daily Focus & Habit Matrix</p>
              </div>

              {/* OBJECTIVES & TIME BLOCKS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TOP OBJECTIVE TARGETS */}
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                    <span className="text-xs font-black uppercase font-mono">1. TOP OBJECTIVE TARGETS</span>
                    <button onClick={handleAddObjective} className="text-[10px] bg-[#EAB308] text-black font-bold px-1.5 py-0.5 rounded border border-black cursor-pointer">
                      + ADD
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {objectives.map(o => (
                      <div key={o.id} className="flex items-center gap-2 text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={o.done}
                          onChange={() => setObjectives(prev => prev.map(item => (item.id === o.id ? { ...item, done: !item.done } : item)))}
                          className="w-4 h-4 accent-[#EAB308] rounded cursor-pointer"
                        />
                        <span className={o.done ? 'line-through text-ink-muted' : 'text-slate-900'}>{o.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIME-BLOCKING SCHEDULE */}
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000000] space-y-2">
                  <div className="border-b border-slate-300 pb-1">
                    <span className="text-xs font-black uppercase font-mono">2. TIME-BLOCKING SCHEDULE</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    {timeBlocks.map((tb, idx) => (
                      <div key={idx} className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <span className="font-bold text-[#CA8A04]">{tb.time}:</span> <span className="text-slate-800 font-sans">{tb.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7-DAY HABIT STREAK TRACKER */}
              <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <span className="text-xs font-black uppercase font-mono">7-DAY HABIT STREAK TRACKER</span>
                  <button onClick={handleAddHabit} className="text-[10px] bg-[#EAB308] text-black font-bold px-2 py-0.5 rounded border border-black cursor-pointer">
                    + ADD HABIT
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-300 font-mono text-[10px] text-slate-500 uppercase">
                        <th className="pb-1">HABIT NAME</th>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                          <th key={day} className="pb-1 text-center">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {habits.map(h => (
                        <tr key={h.id}>
                          <td className="py-2 font-bold text-slate-900">
                            {h.name}
                            <span className="block text-[9px] font-mono text-ink-muted">{h.category}</span>
                          </td>
                          {h.checks.map((chk, dIdx) => (
                            <td key={dIdx} className="text-center py-2">
                              <button
                                onClick={() => handleToggleHabitDay(h.id, dIdx)}
                                className={`w-5 h-5 rounded border border-black transition-colors cursor-pointer ${
                                  chk ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                                }`}
                              >
                                {chk ? '✓' : ''}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MINDSET ANCHOR */}
              <div className="bg-[#FEF3C7] border-2 border-[#EAB308] rounded-xl p-3 text-xs font-medium text-amber-950">
                <span className="font-mono font-bold uppercase text-[#CA8A04] block mb-0.5">MINDSET ANCHOR</span>
                "{plannerAffirmation}"
              </div>
            </div>

            {/* RIGHT: PLANNER CONFIGURATION FORM */}
            <div className="lg:col-span-5 bg-[#13171d]/90 border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-b-2 border-white/10 pb-3">
                PLANNER CONFIGURATION
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">PLANNER TITLE</span>
                  <input
                    type="text"
                    value={plannerTitle}
                    onChange={e => setPlannerTitle(e.target.value)}
                    className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">MINDSET NOTE / AFFIRMATION</span>
                  <textarea
                    rows={3}
                    value={plannerAffirmation}
                    onChange={e => setPlannerAffirmation(e.target.value)}
                    className="w-full bg-black border border-white/10 text-white text-xs font-medium p-2.5 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASE D: MASTER PROMPT BLUEPRINTS VIEW (MATCHES VIDEO AT 00:19 - 00:38) */}
      {/* ============================================================== */}
      {activeBundle === 'master-prompts' && (
        <div className="space-y-4">
          <div className="bg-[#13171d]/90 border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => handleSwitchPromptTab('canva-batch')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] shrink-0 ${
                  promptSubTab === 'canva-batch' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                CANVA SOCIAL MEDIA BATCH GENERATOR AGENT
              </button>

              <button
                onClick={() => handleSwitchPromptTab('resume-ai')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] shrink-0 ${
                  promptSubTab === 'resume-ai' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                EXECUTIVE RESUME & COVER LETTER AI ARCHITECT
              </button>

              <button
                onClick={() => handleSwitchPromptTab('sales-copy')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] shrink-0 ${
                  promptSubTab === 'sales-copy' ? 'bg-[#EAB308] text-black' : 'bg-surface-1 text-ink-secondary'
                }`}
              >
                HIGH-CONVERTING SALES EMAIL & COPY SWIPE ENGINE
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerCopy(getPromptOutputText(), 'master-prompt')}
                className="px-3.5 py-2 rounded-lg bg-[#EAB308] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'master-prompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedKey === 'master-prompt' ? 'COPIED!' : 'COPY MASTER PROMPT'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: MASTER SYSTEM INSTRUCTION PROMPT CARD */}
            <div className="lg:col-span-7 bg-[#FEFCE8] text-slate-950 border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000000] space-y-4 font-sans relative">
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
                <span className="text-xs font-mono font-black text-[#CA8A04] bg-[#FEF3C7] px-2.5 py-1 rounded border border-[#EAB308] uppercase">
                  TARGET: GEMINI 3.6 FLASH
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-500">META-ARCHITECT v10.0</span>
              </div>

              <div className="bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl border-2 border-black leading-relaxed whitespace-pre-wrap shadow-inner overflow-x-auto max-h-[480px]">
                {getPromptOutputText()}
              </div>
            </div>

            {/* RIGHT: COMMERCIAL LEVERAGE & DYNAMIC VARIABLE ANCHORS */}
            <div className="lg:col-span-5 bg-[#13171d]/90 border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="border-b-2 border-white/10 pb-3 space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase">COMMERCIAL LEVERAGE</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">SAAS MONETIZATION STRATEGY</h3>
                <p className="text-xs text-ink-muted">
                  Sell as a custom AI Content SaaS, embedding system prompts directly into Canva or Notion client workflows.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-[#FACC15] uppercase block border-b border-white/10 pb-1">
                  DYNAMIC VARIABLE ANCHORS
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-ink-muted uppercase">[INSERT NICHE]</label>
                  <input
                    type="text"
                    value={promptVariables.niche}
                    onChange={e => setPromptVariables({ ...promptVariables, niche: e.target.value })}
                    className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-ink-muted uppercase">[TARGET AUDIENCE]</label>
                  <input
                    type="text"
                    value={promptVariables.targetAudience}
                    onChange={e => setPromptVariables({ ...promptVariables, targetAudience: e.target.value })}
                    className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-ink-muted uppercase">[PRIMARY TOPIC]</label>
                  <input
                    type="text"
                    value={promptVariables.primaryTopic}
                    onChange={e => setPromptVariables({ ...promptVariables, primaryTopic: e.target.value })}
                    className="w-full bg-black border border-white/10 text-white text-xs font-bold p-2.5 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASE E: CANVA SOCIAL KITS & BRAND & MEDIA KITS SLIDE CAROUSEL */}
      {/* ============================================================== */}
      {(activeBundle === 'canva-social' || activeBundle === 'brand-media') && (
        <div className="bg-[#13171d]/90 border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex justify-center items-center py-4">
            <div
              ref={canvasRef}
              style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-2xl aspect-square sm:aspect-[4/3] bg-[#FEFCE8] text-slate-950 border-8 border-black rounded-2xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between relative"
            >
              <div className="absolute inset-3 border-2 border-[#EAB308] pointer-events-none rounded-xl" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#CA8A04] uppercase tracking-wider bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#EAB308]">
                  {activeBundle === 'canva-social' ? 'SWIPE TO LEARN ➔' : 'CONFIDENTIAL PITCH DECK'}
                </span>
                <span className="text-xs font-mono font-black text-ink-muted">1/5</span>
              </div>

              <div className="my-auto space-y-4 text-left z-10">
                <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase font-serif leading-tight">
                  {promptVariables.primaryTopic}
                </h3>
                <div className="w-20 h-1 bg-[#EAB308]" />
                <p className="text-sm sm:text-base font-medium text-slate-700 whitespace-pre-line leading-relaxed max-w-xl">
                  {promptVariables.niche} editorial framework designed for {promptVariables.targetAudience}.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between gap-4 z-10">
                <div className="bg-[#EAB308] border-2 border-black text-black px-4 py-2 rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]">
                  DOWNLOAD COMPLETE BUNDLE ➔
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                  @CREATORSTUDIO · TEMPLATE ARCHIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER METADATA */}
      <div className="text-center text-[10px] font-mono text-slate-500 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
        <span>© 2026 ARCHIVE DESIGN CO. · DIGITALKIT STUDIO</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-ink-secondary">CANVA SOCIAL KITS</a>
          <a href="#" className="hover:text-ink-secondary">BRAND IDENTITY</a>
          <a href="#" className="hover:text-ink-secondary">RESUME & CV</a>
          <a href="#" className="hover:text-ink-secondary">TERMS OF LICENSE APPLY</a>
        </div>
      </div>

      {/* MODAL 1: PERSONAL VAULT MODAL */}
      {isVaultOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#13171d] border-4 border-black rounded-2xl max-w-2xl w-full p-6 shadow-[10px_10px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-[#EAB308] fill-[#EAB308]" />
                <h3 className="text-lg font-black text-white uppercase font-serif">
                  PERSONAL VAULT ({personalVault.length})
                </h3>
              </div>
              <button onClick={() => setIsVaultOpen(false)} className="p-1 text-ink-muted hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {personalVault.length === 0 ? (
              <div className="p-8 text-center bg-black/40 border-2 border-dashed border-white/10 rounded-xl space-y-2">
                <Bookmark className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-ink-muted font-mono">Your Personal Vault is currently empty.</p>
                <p className="text-[10px] text-slate-500">Click "SAVE VAULT" on any canvas template to archive it here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {personalVault.map(item => (
                  <div key={item.id} className="p-3 bg-black border-2 border-black rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000000]">
                    <div>
                      <div className="text-[10px] font-mono text-[#FACC15] uppercase font-bold">{item.bundleTitle} · {item.savedAt}</div>
                      <h4 className="text-sm font-black text-white uppercase">{item.templateTitle}</h4>
                      <p className="text-[11px] text-ink-muted font-mono">{item.slides.length} slides archived</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const exportedJson = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
                          const anchor = document.createElement('a');
                          anchor.href = exportedJson;
                          anchor.download = `${item.id}.json`;
                          anchor.click();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-1 border border-white/15 text-xs font-mono font-bold text-ink-secondary hover:text-white cursor-pointer"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => setPersonalVault(prev => prev.filter(v => v.id !== item.id))}
                        className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:text-red-200 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsVaultOpen(false)}
                className="px-4 py-2 bg-[#EAB308] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] rounded-xl cursor-pointer"
              >
                CLOSE VAULT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OWNER PORTAL MODAL */}
      {isOwnerPortalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#13171d] border-4 border-black rounded-2xl max-w-md w-full p-6 shadow-[10px_10px_0px_0px_#000000] space-y-4 text-center">
            <div className="w-12 h-12 bg-[#EAB308] border-2 border-black rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000000]">
              <Crown className="h-6 w-6 text-black" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase font-serif">MASTER OWNER PORTAL</h3>
              <p className="text-xs font-mono text-[#FACC15] mt-1">GOLD TRIM ARCHIVE ADMIN RIGHTS ACTIVE</p>
            </div>

            <div className="p-4 bg-black border-2 border-black rounded-xl space-y-2 text-left font-mono text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>LICENSE TYPE:</span>
                <span className="text-emerald-400 font-bold">UNLIMITED COMMERCIAL (MRR)</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>TOTAL ASSETS:</span>
                <span className="text-white font-bold">6 BUNDLES / 50+ TEMPLATES</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>STORAGE OS:</span>
                <span className="text-cyan-400 font-bold">DIGITALKIT ARCHIVE V10</span>
              </div>
            </div>

            <button
              onClick={() => setIsOwnerPortalOpen(false)}
              className="w-full py-2.5 bg-[#EAB308] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] rounded-xl cursor-pointer"
            >
              RETURN TO STUDIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
