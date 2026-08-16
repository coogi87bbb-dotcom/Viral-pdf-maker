import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  Building2, 
  Users, 
  Briefcase, 
  Layers, 
  Printer, 
  Copy, 
  Check, 
  BarChart3, 
  Share2, 
  FileText, 
  Sliders, 
  Award, 
  ShieldCheck,
  ChevronRight,
  PieChart,
  X,
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';

// Preset Scenarios
const CALC_PRESETS = [
  {
    id: 'solo-creator',
    name: '🎨 Solo Creator / Influencer',
    postsPerWeek: 14,
    agencyCost: 2500,
    hourlyValue: 60,
    toolStackCost: 220,
    teamSize: 1,
    desc: 'Posting 2x daily across X, Instagram, TikTok & Threads.'
  },
  {
    id: 'boutique-agency',
    name: '🚀 Boutique Agency / Service Business',
    postsPerWeek: 35,
    agencyCost: 5500,
    hourlyValue: 100,
    toolStackCost: 450,
    teamSize: 2,
    desc: 'Managing 3 client accounts with 5 posts per day.'
  },
  {
    id: 'ecommerce-dtc',
    name: '🛍️ E-Commerce & DTC Brand',
    postsPerWeek: 50,
    agencyCost: 8500,
    hourlyValue: 125,
    toolStackCost: 650,
    teamSize: 3,
    desc: 'High-frequency TikTok reels, Pinterest pins & carousel decks.'
  },
  {
    id: 'enterprise-b2b',
    name: '🏢 Enterprise B2B & Tech Brand',
    postsPerWeek: 84,
    agencyCost: 15000,
    hourlyValue: 175,
    toolStackCost: 1200,
    teamSize: 5,
    desc: 'Omni-channel domination across all 7 major social networks.'
  }
];

// Stack tools list for consolidation breakdown
const SOFTWARE_STACK_TOOLS = [
  { id: 'copywriter', name: 'AI Copywriter (Jasper / Copy.ai)', monthly: 99, category: 'Copywriting' },
  { id: 'scheduler', name: 'Social Scheduler (Hootsuite / Sprout)', monthly: 249, category: 'Distribution' },
  { id: 'design', name: 'Design & Thumbnail Engine (Canva / Midjourney)', monthly: 45, category: 'Visuals' },
  { id: 'teleprompter', name: 'Video Teleprompter App', monthly: 25, category: 'Video' },
  { id: 'agency-proposals', name: 'Client Proposal & Pitch Software', monthly: 120, category: 'Agency' },
  { id: 'trend-listening', name: 'Social Trend & Virality Analytics', monthly: 85, category: 'Analytics' }
];

export const RoiCalculator: React.FC = () => {
  // Calculator Mode Switcher
  const [calcMode, setCalcMode] = useState<'agency-vs-viralos' | 'in-house-payroll' | 'lead-revenue' | 'tool-stack'>('agency-vs-viralos');
  const [selectedPresetId, setSelectedPresetId] = useState('solo-creator');

  // Core Slider State
  const [postsPerWeek, setPostsPerWeek] = useState(14);
  const [agencyMonthlyCost, setAgencyMonthlyCost] = useState(4500);
  const [hourlyValue, setHourlyValue] = useState(75);
  const [channelsCount, setChannelsCount] = useState(5); // 1-7 networks

  // In-House Payroll Mode State
  const [teamMembersCount, setTeamMembersCount] = useState(2); // SMM + Designer/Video Editor
  const [avgEmployeeSalary, setAvgEmployeeSalary] = useState(65000); // $65k/year

  // Lead & Customer Revenue ROI State
  const [monthlyInboundLeads, setMonthlyInboundLeads] = useState(120);
  const [avgDealValue, setAvgDealValue] = useState(1200);
  const [leadCloseRate, setLeadCloseRate] = useState(12); // 12%

  // Tool Stack Consolidation State
  const [selectedSoftwareTools, setSelectedSoftwareTools] = useState<string[]>(['copywriter', 'scheduler', 'design', 'teleprompter']);

  // Copy / Print UI State
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Apply Preset
  const handleSelectPreset = (preset: typeof CALC_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setPostsPerWeek(preset.postsPerWeek);
    setAgencyMonthlyCost(preset.agencyCost);
    setHourlyValue(preset.hourlyValue);
  };

  // Toggle software tool selection
  const toggleSoftwareTool = (id: string) => {
    if (selectedSoftwareTools.includes(id)) {
      setSelectedSoftwareTools(selectedSoftwareTools.filter(item => item !== id));
    } else {
      setSelectedSoftwareTools([...selectedSoftwareTools, id]);
    }
  };

  // MATH CALCULATIONS
  // 1. Time & Productivity Math
  // ~2 hours needed per multi-channel post (copy, formatting, hashtags, graphic design, video script)
  const hoursSavedPerWeek = Math.round(postsPerWeek * 1.8 * (channelsCount / 4));
  const hoursSavedPerMonth = hoursSavedPerWeek * 4;
  const timeDollarSavingsMonthly = hoursSavedPerMonth * hourlyValue;

  // 2. Direct Retainer Savings
  const totalMonthlySavingsAgencyMode = agencyMonthlyCost + timeDollarSavingsMonthly;
  const yearlyTotalSavingsAgencyMode = totalMonthlySavingsAgencyMode * 12;

  // 3. In-House Payroll Math
  const totalAnnualPayroll = teamMembersCount * avgEmployeeSalary;
  const monthlyPayrollSpend = Math.round(totalAnnualPayroll / 12);
  const monthlyPayrollSavings = monthlyPayrollSpend - 99; // assuming ViralOS is ~$99/mo or equivalent
  const yearlyPayrollSavings = monthlyPayrollSavings * 12;

  // 4. Inbound Lead Revenue Math
  const closedDealsMonthly = Math.round((monthlyInboundLeads * leadCloseRate) / 100);
  const grossMonthlyNewRevenue = closedDealsMonthly * avgDealValue;
  const grossAnnualNewRevenue = grossMonthlyNewRevenue * 12;
  const roiMultiplier = agencyMonthlyCost > 0 ? (grossMonthlyNewRevenue / agencyMonthlyCost).toFixed(1) : '10.0';

  // 5. Software Stack Tool Consolidation Math
  const monthlySoftwareSpend = SOFTWARE_STACK_TOOLS
    .filter(t => selectedSoftwareTools.includes(t.id))
    .reduce((sum, t) => sum + t.monthly, 0);
  const annualSoftwareSpend = monthlySoftwareSpend * 12;

  // Payback Period Math
  const paybackDays = agencyMonthlyCost > 0 ? Math.max(0.5, (99 / (agencyMonthlyCost / 30))).toFixed(1) : '1.0';

  // Copy Executive ROI Summary
  const handleCopySummary = () => {
    const summary = `VIRALOS ROI & COST SAVINGS AUDIT REPORT
--------------------------------------------------
Calculation Mode: ${calcMode.toUpperCase()}
Posts Published Per Week: ${postsPerWeek} across ${channelsCount} Social Networks
Your Hourly Time Value: $${hourlyValue}/hr

FINANCIAL SAVINGS METRICS:
• Monthly Agency Retainer Replacement: $${agencyMonthlyCost.toLocaleString()}/mo
• Creator Time Value Recovered: $${timeDollarSavingsMonthly.toLocaleString()}/mo (${hoursSavedPerMonth} hrs/mo)
• Net Monthly Combined Savings: $${totalMonthlySavingsAgencyMode.toLocaleString()}/mo
• TOTAL 12-MONTH CAPITAL RETAINED: $${yearlyTotalSavingsAgencyMode.toLocaleString()}/year

INBOUND REVENUE PROJECTION:
• Estimated Monthly Closed Deals: ${closedDealsMonthly} Deals
• Projected Added Monthly Revenue: $${grossMonthlyNewRevenue.toLocaleString()}/mo
• Projected ROI Multiplier: ${roiMultiplier}x Net ROI

SOFTWARE CONSOLIDATION:
• Replaces $${monthlySoftwareSpend}/mo in fragmented SaaS tools ($${annualSoftwareSpend.toLocaleString()}/yr saved).`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyShareableLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-brass-500/10 border border-accent-brass-500/20 text-xs font-semibold text-accent-brass-300 mb-2">
              <Calculator className="h-3.5 w-3.5 text-accent-brass-400" />
              <span>Commercial ROI & Financial Capital Auditor v10.0</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Agency Cost & ROI Savings Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-black font-black uppercase">
                10x Precision
              </span>
            </h2>
            <p className="text-sm text-ink-muted mt-2 max-w-3xl leading-relaxed">
              Calculate exact time, agency retainers, team payroll, software stack consolidation, and inbound customer revenue projections enabled by ViralOS.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="px-4 py-3 rounded-2xl bg-status-positive-dim border border-status-positive/30 text-status-positive text-xs font-bold flex items-center gap-3 shrink-0 shadow-[var(--shadow-panel)]">
            <TrendingUp className="h-6 w-6 text-status-positive" />
            <div>
              <div className="text-sm font-black text-white">${yearlyTotalSavingsAgencyMode.toLocaleString()} / year</div>
              <div className="text-[10px] text-status-positive/80">Est. Total Annual Capital Retained</div>
            </div>
          </div>
        </div>

        {/* 1-Click Scenario Presets */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-accent-brass-400 fill-brass-400" />
            <span>Select 1-Click Business Scale Preset:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CALC_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-colors space-y-1.5 relative ${
                  selectedPresetId === preset.id
                    ? 'bg-surface-1 border-accent-brass-500 ring-2 ring-accent-brass-500/50 shadow-xl'
                    : 'bg-surface-0 border-white/10 text-ink-muted hover:bg-surface-1'
                }`}
              >
                <div className="text-xs font-black text-white truncate">{preset.name}</div>
                <p className="text-[10px] text-ink-muted line-clamp-2 leading-relaxed">
                  {preset.desc}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1">
                  <span className="text-accent-brass-400">{preset.postsPerWeek} posts/wk</span>
                  <span className="text-accent-brass-300">${preset.agencyCost.toLocaleString()}/mo</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setCalcMode('agency-vs-viralos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              calcMode === 'agency-vs-viralos'
                ? 'bg-accent-brass-500 text-black shadow-[var(--shadow-panel-brass)]'
                : 'bg-surface-0 text-ink-muted hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Agency Retainer vs. ViralOS</span>
          </button>

          <button
            onClick={() => setCalcMode('in-house-payroll')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              calcMode === 'in-house-payroll'
                ? 'bg-accent-brass-500 text-black shadow-[var(--shadow-panel-brass)]'
                : 'bg-surface-0 text-ink-muted hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 text-violet-300" />
            <span>In-House Team Payroll Savings</span>
          </button>

          <button
            onClick={() => setCalcMode('lead-revenue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              calcMode === 'lead-revenue'
                ? 'bg-accent-brass-500 text-black shadow-[var(--shadow-panel-brass)]'
                : 'bg-surface-0 text-ink-muted hover:text-white'
            }`}
          >
            <DollarSign className="h-4 w-4 text-accent-brass-300" />
            <span>Inbound Lead & Deal ROI Multiplier</span>
          </button>

          <button
            onClick={() => setCalcMode('tool-stack')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              calcMode === 'tool-stack'
                ? 'bg-accent-brass-500 text-black shadow-[var(--shadow-panel-brass)]'
                : 'bg-surface-0 text-ink-muted hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4 text-cyan-300" />
            <span>Software Tool Stack Consolidation</span>
          </button>
        </div>
      </div>

      {/* MODE 1: AGENCY RETAINER VS VIRALOS */}
      {calcMode === 'agency-vs-viralos' && (
        <div className="space-y-6">
          {/* Slider Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-1/90 p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink-secondary">
                <span>Posts Published / Week:</span>
                <span className="text-accent-brass-400 font-mono text-sm">{postsPerWeek} posts</span>
              </div>
              <input
                type="range"
                min="3"
                max="100"
                value={postsPerWeek}
                onChange={(e) => setPostsPerWeek(parseInt(e.target.value))}
                className="w-full accent-brass-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Across X, IG, TikTok, FB, Threads, Pinterest & LinkedIn</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink-secondary">
                <span>Active Social Channels:</span>
                <span className="text-cyan-400 font-mono text-sm">{channelsCount} Networks</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={channelsCount}
                onChange={(e) => setChannelsCount(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Multi-platform simultaneous distribution</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink-secondary">
                <span>Traditional Agency Fee:</span>
                <span className="text-accent-brass-400 font-mono text-sm">${agencyMonthlyCost.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={agencyMonthlyCost}
                onChange={(e) => setAgencyMonthlyCost(parseInt(e.target.value))}
                className="w-full accent-brass-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Typical boutique social media agency retainer</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink-secondary">
                <span>Your Hourly Time Value:</span>
                <span className="text-violet-400 font-mono text-sm">${hourlyValue}/hr</span>
              </div>
              <input
                type="range"
                min="25"
                max="300"
                step="25"
                value={hourlyValue}
                onChange={(e) => setHourlyValue(parseInt(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Value of your executive focus on high-leverage growth</p>
            </div>
          </div>

          {/* Core Results Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-surface-1/90 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-brass-400 uppercase tracking-wider">
                <DollarSign className="h-4 w-4" />
                <span>Monthly Direct Savings</span>
              </div>
              <div className="text-3xl font-black text-white font-mono">${totalMonthlySavingsAgencyMode.toLocaleString()}</div>
              <p className="text-xs text-ink-muted">Combines saved agency retainer + recovered creator time value.</p>
            </div>

            <div className="p-6 bg-surface-1/90 rounded-2xl border border-status-positive/40 bg-status-positive-dim space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-status-positive uppercase tracking-wider">
                <TrendingUp className="h-4 w-4" />
                <span>12-Month Total Retained</span>
              </div>
              <div className="text-3xl font-black text-status-positive font-mono">${yearlyTotalSavingsAgencyMode.toLocaleString()}</div>
              <p className="text-xs text-ink-muted">Total capital preserved in your business bank account.</p>
            </div>

            <div className="p-6 bg-surface-1/90 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Clock className="h-4 w-4" />
                <span>Creator Hours Saved / Mo</span>
              </div>
              <div className="text-3xl font-black text-white font-mono">{hoursSavedPerMonth} Hours</div>
              <p className="text-xs text-ink-muted">Equivalent to hiring 1 full-time social media strategist.</p>
            </div>

            <div className="p-6 bg-surface-1/90 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider">
                <Zap className="h-4 w-4" />
                <span>System Payback Period</span>
              </div>
              <div className="text-3xl font-black text-violet-300 font-mono">{paybackDays} Days</div>
              <p className="text-xs text-ink-muted">ViralOS pays for its subscription in under 2 days of usage.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: IN-HOUSE TEAM PAYROLL SAVINGS */}
      {calcMode === 'in-house-payroll' && (
        <div className="bg-surface-1/90 p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                <span>In-House Social Media Team Payroll vs. ViralOS Automation</span>
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                Calculate the financial impact of automating social media creation vs. hiring full-time managers, copywriters, and video editors.
              </p>
            </div>

            <div className="px-4 py-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono text-xs font-bold rounded-xl shrink-0">
              Est. Payroll Overhead: ${monthlyPayrollSpend.toLocaleString()}/month
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-surface-0 p-5 rounded-2xl border border-white/10">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-ink-secondary">
                  <span>In-House Team Headcount:</span>
                  <span className="text-violet-400 font-mono">{teamMembersCount} Full-Time Employees</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={teamMembersCount}
                  onChange={(e) => setTeamMembersCount(parseInt(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-ink-secondary">
                  <span>Average Salary per Employee:</span>
                  <span className="text-accent-brass-400 font-mono">${avgEmployeeSalary.toLocaleString()}/year</span>
                </div>
                <input
                  type="range"
                  min="35000"
                  max="120000"
                  step="5000"
                  value={avgEmployeeSalary}
                  onChange={(e) => setAvgEmployeeSalary(parseInt(e.target.value))}
                  className="w-full accent-brass-500"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/30 via-slate-950 to-slate-950 border border-violet-500/30 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase text-violet-400 tracking-wider block mb-1">
                  ANNUAL PAYROLL CAPITAL SAVINGS:
                </span>
                <div className="text-3xl font-black text-status-positive font-mono">
                  ${yearlyPayrollSavings.toLocaleString()} / year
                </div>
                <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                  ViralOS acts as a 24/7 AI Content Operations Team, handling copy generation, 7-channel formatting, video teleprompter scripting, and graphic generation at a fraction of 1 employee salary.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-ink-secondary bg-surface-1 p-3 rounded-xl border border-white/10 flex justify-between">
                <span>Total Annual Salaries: ${totalAnnualPayroll.toLocaleString()}</span>
                <span className="text-status-positive">Net Margin Boost: +94%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: INBOUND LEAD REVENUE & DEAL ROI */}
      {calcMode === 'lead-revenue' && (
        <div className="bg-surface-1/90 p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent-brass-400" />
              <span>Inbound Lead & Customer Revenue ROI Projection</span>
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Estimate new client revenue generated from consistent multi-channel posting and automated comment-to-DM lead funnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 bg-surface-0 p-4 rounded-2xl border border-white/10">
              <label className="text-xs font-bold text-ink-secondary flex justify-between">
                <span>Est. Monthly Inbound Leads:</span>
                <strong className="text-accent-brass-400 font-mono">{monthlyInboundLeads} Leads</strong>
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={monthlyInboundLeads}
                onChange={(e) => setMonthlyInboundLeads(parseInt(e.target.value))}
                className="w-full accent-brass-500"
              />
            </div>

            <div className="space-y-2 bg-surface-0 p-4 rounded-2xl border border-white/10">
              <label className="text-xs font-bold text-ink-secondary flex justify-between">
                <span>Average Deal Value ($):</span>
                <strong className="text-accent-brass-400 font-mono">${avgDealValue.toLocaleString()}</strong>
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(parseInt(e.target.value))}
                className="w-full accent-brass-500"
              />
            </div>

            <div className="space-y-2 bg-surface-0 p-4 rounded-2xl border border-white/10">
              <label className="text-xs font-bold text-ink-secondary flex justify-between">
                <span>Client Close Rate (%):</span>
                <strong className="text-cyan-400 font-mono">{leadCloseRate}%</strong>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={leadCloseRate}
                onChange={(e) => setLeadCloseRate(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* Revenue Output Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-[10px] text-ink-muted font-bold uppercase block">Monthly Closed Deals</span>
              <span className="text-2xl font-black text-white font-mono">{closedDealsMonthly} Deals / mo</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-0 border border-status-positive/40 space-y-1">
              <span className="text-[10px] text-status-positive font-bold uppercase block">Gross Added Monthly Revenue</span>
              <span className="text-2xl font-black text-status-positive font-mono">${grossMonthlyNewRevenue.toLocaleString()} / mo</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-0 border border-brass-500/40 space-y-1">
              <span className="text-[10px] text-accent-brass-400 font-bold uppercase block">Projected ROI Multiplier</span>
              <span className="text-2xl font-black text-accent-brass-300 font-mono">{roiMultiplier}x Net ROI</span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: SOFTWARE TOOL STACK CONSOLIDATION */}
      {calcMode === 'tool-stack' && (
        <div className="bg-surface-1/90 p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                <span>Software Tool Stack Consolidation & Subscription Audit</span>
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                Select tools in your existing tech stack to calculate how much software overhead ViralOS eliminates.
              </p>
            </div>

            <div className="px-4 py-2 bg-accent-brass-500/10 border border-accent-brass-500/30 text-accent-brass-300 font-mono text-sm font-bold rounded-xl shrink-0">
              Current Software Spend: ${monthlySoftwareSpend}/mo (${annualSoftwareSpend.toLocaleString()}/yr)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SOFTWARE_STACK_TOOLS.map((tool) => {
              const isSelected = selectedSoftwareTools.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => toggleSoftwareTool(tool.id)}
                  className={`p-4 rounded-2xl border text-left transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-surface-0 border-accent-brass-500/80 ring-1 ring-accent-brass-500/50 shadow-[var(--shadow-panel-brass)]'
                      : 'bg-surface-0/60 border-white/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-white">{tool.name}</div>
                    <div className="text-[10px] text-ink-muted">{tool.category}</div>
                  </div>

                  <span className="text-xs font-mono font-bold text-status-danger bg-status-danger-dim px-2 py-1 rounded border border-status-danger/40 shrink-0">
                    ${tool.monthly}/mo
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DYNAMIC VISUAL COST COMPARISON BAR & SIDE-BY-SIDE AUDIT TABLE */}
      <div className="bg-surface-1/90 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent-brass-400" />
              <span>Side-by-Side Cost & Productivity Comparison</span>
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Traditional marketing agency vs. Freelance contractors vs. In-house employee team vs. ViralOS Autonomous OS.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-secondary text-xs font-bold flex items-center gap-1.5"
            >
              {copiedSummary ? <Check className="h-4 w-4 text-accent-brass-400" /> : <Copy className="h-4 w-4 text-accent-brass-400" />}
              <span>{copiedSummary ? 'Copied Report' : 'Copy Executive Summary'}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 rounded-xl bg-accent-brass-500 hover:bg-accent-brass-400 text-black text-xs font-black flex items-center gap-1.5 shadow-[var(--shadow-panel-brass)]"
            >
              <Printer className="h-4 w-4" />
              <span>Print / PDF Audit</span>
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-ink-secondary">Annual Software & Content Budget Impact:</span>
            <span className="text-status-positive font-mono font-black">98.5% Cost Reduction</span>
          </div>

          <div className="h-4 w-full bg-surface-0 rounded-full overflow-hidden border border-white/10 flex">
            <div className="h-full bg-status-danger text-[10px] text-white font-bold flex items-center justify-center pl-2" style={{ width: '85%' }}>
              Traditional Retainer / Stack ($54,000/yr)
            </div>
            <div className="h-full bg-status-positive text-[10px] text-slate-950 font-black flex items-center justify-center px-1" style={{ width: '15%' }}>
              ViralOS
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-surface-0 border border-white/10 space-y-3">
            <div className="font-extrabold text-status-danger text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Traditional Agency / Contractors</span>
              <span className="font-mono text-xs">${agencyMonthlyCost.toLocaleString()}/mo</span>
            </div>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li className="flex items-start gap-2">
                <span className="text-status-danger font-bold">❌</span>
                <span>High monthly retainers ($3,000 – $15,000+ per month).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-status-danger font-bold">❌</span>
                <span>Slow 3-5 day turnaround times per post & manual edits.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-status-danger font-bold">❌</span>
                <span>Extra fees for additional social platforms or visual graphics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-status-danger font-bold">❌</span>
                <span>Fragmented tools, manual copy-pasting, and missing video scripts.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-surface-0 border border-status-positive/40 shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-status-positive/10 rounded-full blur-2xl pointer-events-none" />

            <div className="font-extrabold text-status-positive text-xs uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent-brass-300 fill-brass-300" />
                <span>ViralOS Autonomous Operating System</span>
              </span>
              <span className="font-mono text-xs text-black bg-status-positive px-2 py-0.5 rounded">All-in-One</span>
            </div>

            <ul className="space-y-2 text-xs text-ink-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-positive shrink-0 mt-0.5" />
                <span>Instant 10-second multi-channel campaigns across 7 networks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-positive shrink-0 mt-0.5" />
                <span>Built-in Gemini 3.6 Flash image studio, thumbnail & banner generator.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-positive shrink-0 mt-0.5" />
                <span>Integrated TikTok/Reels video script teleprompter studio.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-positive shrink-0 mt-0.5" />
                <span>White-label agency proposal deck generator to close $5k/mo clients.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
