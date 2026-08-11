import React, { useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  FileCode2, 
  Sparkles, 
  Zap, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  DollarSign,
  ShieldAlert,
  Layers,
  Code2,
  Play,
  Download,
  Share2,
  Wand2,
  Sliders,
  Cpu,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { SystemInstructionBlueprint } from '../types';

// Industrial Master Architecture Presets
const ARCHITECTURE_PRESETS = [
  {
    id: 'b2b-saas-agent',
    label: '🤖 Autonomous B2B Lead Scraping Agent',
    topic: 'Programmatic B2B Intelligence & Lead Scraping SaaS',
    targetAudience: 'B2B Founders & Growth Marketers',
    monetizationGoal: '$20,000/mo ARR via Automated AI Lead Workflows',
    targetModel: 'Gemini 3.6 Flash',
    description: 'Autonomous multi-agent system that ingests, enriches, and qualifies lead data without human intervention.'
  },
  {
    id: 'programmatic-seo',
    label: '🌐 Programmatic SEO & Landing Page Matrix',
    topic: 'AI Programmatic SEO & Dynamic Keyword Page Engine',
    targetAudience: 'E-commerce Brands & SaaS CMOs',
    monetizationGoal: '100,000 Organic Dwell Views & $15,000 MRR',
    targetModel: 'Gemini 3.1 Pro',
    description: 'Generates thousands of long-tail, high-intent landing pages with zero duplicate content penalties.'
  },
  {
    id: 'tiktok-teleprompter',
    label: '🎬 Viral Short-Form Video Script Director',
    topic: 'TikTok / Shorts / Reels Algorithm Pattern Interrupts',
    targetAudience: 'Content Creators & Media Agencies',
    monetizationGoal: '1,000,000 Monthly Impressions & Brand Retainers',
    targetModel: 'Gemini 3.6 Flash',
    description: 'Frame-by-frame teleprompter scripts with audio cues, text overlays, and 3-second hook filters.'
  },
  {
    id: 'agency-pitch-architect',
    label: '💼 $10k/mo White-Label Client Pitch Engine',
    topic: 'Enterprise B2B Agency Retainer Proposals & Audits',
    targetAudience: 'Mid-Market SaaS & Real Estate Executives',
    monetizationGoal: '10 Closed Client Proposals @ $5,000/mo Retainer',
    targetModel: 'Gemini 3.6 Flash',
    description: 'Data-backed gap analysis, ROI projections, and 60-day social domination strategy blueprints.'
  }
];

export const BlueprintBuilder: React.FC = () => {
  const [topic, setTopic] = useState(ARCHITECTURE_PRESETS[0].topic);
  const [targetAudience, setTargetAudience] = useState(ARCHITECTURE_PRESETS[0].targetAudience);
  const [monetizationGoal, setMonetizationGoal] = useState(ARCHITECTURE_PRESETS[0].monetizationGoal);
  const [targetModel, setTargetModel] = useState('Gemini 3.6 Flash');
  const [personaTone, setPersonaTone] = useState('Senior Systems Architect & Growth Hacker');
  
  const [selectedPreset, setSelectedPreset] = useState(ARCHITECTURE_PRESETS[0].id);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'architecture' | 'cot' | 'constraints' | 'simulator'>('prompt');

  // Live Simulator state
  const [testInputPrompt, setTestInputPrompt] = useState('Generate a high-converting 3-step value proposition for our launch.');
  const [simulating, setSimulating] = useState(false);
  const [simulatorResult, setSimulatorResult] = useState<string | null>(null);
  const [simulatorError, setSimulatorError] = useState<string | null>(null);

  const [blueprint, setBlueprint] = useState<SystemInstructionBlueprint>({
    title: 'Enterprise System Instruction Blueprint: Viral Content Autonomous Agent',
    targetModel: 'Gemini 3.6 Flash / Gemini 3.1 Pro',
    systemPrompt: `[SYSTEM INSTRUCTION: VIRAL CONTENT ARCHITECT v10.0]

You are a combination of an elite Cloud Infrastructure Architect, a Senior AI Automation Engineer, and a B2B SaaS Growth Hacker. You specialize in building zero-employee software products using LLM workflows, serverless infrastructure, and self-healing data pipelines.

[CONTEXT & ROLE IDENTITY]:
I have selected my niche: Programmatic B2B Intelligence & Lead Data SaaS. The business model relies on AI agents to continuously scrape, parse, and enrich public business data (job postings, funding, hiring velocity), match it to user ICPs, and programmatically generate thousands of high-intent SEO landing pages to drive organic traffic. I need the technical architecture to run this entire business with absolute zero human management.

[PRIME DIRECTIVE]:
Design a production-ready, fully autonomous technical architecture for this website. Scale system performance to achieve $20,000/mo ARR via Automated AI Content Workflows while maintaining 85%+ software profit margins.

[CHAIN-OF-THOUGHT INSTRUCTION]:
Before detailing the tech stack, think step-by-step:
1. Map out the sequence of data processing: Raw web data -> LLM extraction -> Vector/Relational storage -> Customer delivery. Identify precise failure points.
2. Determine how an AI agent can safely update a live website frontend and database without breaking user experience.
3. Calculate compute-to-revenue ratio: ensure the cost of API calls and proxies to run automation does not eat into 85%+ software margins.

[NEGATIVE CONSTRAINTS]:
- BANNED CONVERSATIONAL FILLER: Never start with "Sure!", "Certainly!", or "In today's fast-paced world".
- STRICT JSON & FORMATTING: Always validate nested objects, avoid unescaped quotes, and strictly enforce schema adherence.
- ZERO RAW SECRETS: Never expose API keys or credentials in client-facing code or responses.

[OUTPUT FORMAT]:
Structure your response cleanly using Markdown:
- ## Part 1: The Autonomous Data Factory (Ingestion & Enrichment)
- ## Part 2: The Infinite Traffic Loop (Programmatic SEO & Indexing)
- ## Part 3: The Self-Healing Core (Error Handling & Automated DevOps)`,
    chainOfThoughtSteps: [
      '1. Deconstruct input into core emotional hook and value proposition',
      '2. Filter through negative constraints (no filler, no generic buzzwords)',
      '3. Format for platform-specific mobile viewport constraints',
      '4. Calculate compute-to-revenue efficiency and append direct response CTA'
    ],
    monetizationLeverage: 'Saves 40+ hours per week in human engineering & copywriting overhead, unlocking 85%+ software profit margins.',
    architectureModules: [
      {
        moduleName: 'Data Ingestion & Enrichment Engine',
        description: 'Scrapes and cleans high-intent topic signals, removing duplicate records and rate-limit triggers.',
        codeSnippet: 'async function ingestTopicData(niche) { return await ai.models.generateContent({ model: "gemini-3.6-flash", contents: niche }); }'
      },
      {
        moduleName: 'Programmatic Hook & Copy Engine',
        description: 'Transforms enriched data into high-retention social posts with pattern interrupts.',
        codeSnippet: 'const hook = generatePatternInterrupt(topicData);'
      },
      {
        moduleName: 'Self-Healing DevOps Guardrail',
        description: 'Monitors API latency, retries failed model calls, and switches to fallback templates on rate limits.',
        codeSnippet: 'if (error) { return executeFallbackPipeline(); }'
      }
    ],
    negativeConstraints: [
      'Banned conversational filler ("Sure!", "In today\'s fast-paced world")',
      'Strictly no unescaped quotes or invalid JSON syntax',
      'Zero unvalidated external links or hallucinated stats'
    ],
    variablePlaceholders: ['{TOPIC}', '{TARGET_AUDIENCE}', '{MONETIZATION_GOAL}', '{API_KEY}'],
    estimatedTokenCount: 1250,
    complianceGrade: 'S-Tier Enterprise Grade'
  });

  const handleSelectPreset = (preset: typeof ARCHITECTURE_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setTopic(preset.topic);
    setTargetAudience(preset.targetAudience);
    setMonetizationGoal(preset.monetizationGoal);
    setTargetModel(preset.targetModel);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const response = await apiFetch('/api/viral/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, targetAudience, monetizationGoal, targetModel, personaTone })
      });

      if (!response.ok) throw new Error('Blueprint generation failed');

      const data = await response.json();
      setBlueprint(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!blueprint) return;
    navigator.clipboard.writeText(blueprint.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!blueprint) return;
    const element = document.createElement('a');
    const file = new Blob([blueprint.systemPrompt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `system-instruction-blueprint-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Run Simulator Test
  const handleRunSimulator = async () => {
    if (!blueprint || !testInputPrompt.trim()) return;
    setSimulating(true);
    setSimulatorError(null);
    setSimulatorResult(null);

    try {
      const response = await apiFetch('/api/viral/test-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: blueprint.systemPrompt,
          testInput: testInputPrompt
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Simulator execution failed');
      }

      const data = await response.json();
      setSimulatorResult(data.output);
    } catch (err: any) {
      console.error(err);
      setSimulatorError(err.message || 'Error executing prompt simulator');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 mb-2">
            <FileCode2 className="h-3.5 w-3.5 text-violet-400" />
            <span>AI Studio Meta-Architect v10.0 Pro</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Master System Instruction Blueprint Builder</span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-bold tracking-normal uppercase">
              10x Architect
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Convert any niche or product idea into an enterprise-grade, copy-and-paste Master System Instruction. Features strict multi-pass chain-of-thought protocols, negative constraint filters, modular code blocks, and a live execution simulator.
          </p>
        </div>

        {/* 1-Click Industrial Architecture Presets */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-violet-400" />
            <span>Select 1-Click System Architecture Blueprint Preset:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ARCHITECTURE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-2xl border text-left transition-all space-y-1.5 relative overflow-hidden ${
                  selectedPreset === preset.id
                    ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/50 shadow-xl'
                    : 'bg-slate-950 border-slate-800/90 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="text-xs font-black text-white truncate">{preset.label}</div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
                <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-violet-300">
                  {preset.targetModel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Architect Parameters Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Target Niche / Topic Domain
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-violet-500 font-sans shadow-inner"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Target Audience / ICP
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-violet-500 font-sans shadow-inner"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Monetization & Profit Goal
              </label>
              <input
                type="text"
                value={monetizationGoal}
                onChange={(e) => setMonetizationGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-violet-500 font-sans shadow-inner"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Target AI Model Architecture
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 font-semibold"
              >
                <option value="Gemini 3.6 Flash">Gemini 3.6 Flash (High-Speed Autonomous Workflows)</option>
                <option value="Gemini 3.1 Pro">Gemini 3.1 Pro (Complex Multi-Step Enterprise Reasoning)</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Systemic Code Architecture)</option>
                <option value="GPT-4o">GPT-4o (Omni-Modal Content Execution)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Agent Identity & Tone Profile
              </label>
              <select
                value={personaTone}
                onChange={(e) => setPersonaTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 font-semibold"
              >
                <option value="Senior Systems Architect & Growth Hacker">Senior Systems Architect & Growth Hacker</option>
                <option value="Ruthless Direct Response Copywriter">Ruthless Direct Response Copywriter</option>
                <option value="Enterprise Security & Compliance Officer">Enterprise Security & Compliance Officer</option>
                <option value="Celebrity Viral Media Director">Celebrity Viral Media Director</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-sm shadow-[0_8px_30px_rgba(212,175,55,0.3)] border-b-4 border-amber-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:translate-y-0.5"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin text-slate-950" />
                <span>Compiling Master System Instruction Blueprint...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 text-slate-950 fill-slate-950" />
                <span>Build Master System Instruction Blueprint</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* BLUEPRINT DASHBOARD DISPLAY */}
      {blueprint && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6">
          {/* Blueprint Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-violet-400" />
                <h3 className="text-xl font-extrabold text-white">{blueprint.title}</h3>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span>Model Target: <strong className="text-violet-300 font-mono">{blueprint.targetModel}</strong></span>
                {blueprint.complianceGrade && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                    {blueprint.complianceGrade}
                  </span>
                )}
                {blueprint.estimatedTokenCount && (
                  <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-mono">
                    ~{blueprint.estimatedTokenCount} Tokens
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-slate-950" /> : <Copy className="h-4 w-4 text-slate-950" />}
                <span>{copied ? 'Copied Master Prompt!' : 'Copy System Instruction'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4 text-amber-400" />
                <span>Export .TXT</span>
              </button>
            </div>
          </div>

          {/* Blueprint Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'prompt' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <FileCode2 className="h-4 w-4" />
              <span>Master System Instruction</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'architecture' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4 text-amber-400" />
              <span>Modular Architecture</span>
            </button>

            <button
              onClick={() => setActiveTab('cot')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'cot' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Chain-of-Thought</span>
            </button>

            <button
              onClick={() => setActiveTab('constraints')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'constraints' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Negative Constraints</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'simulator' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Play className="h-4 w-4 text-slate-950 fill-slate-950" />
              <span>Test Prompt Live (Simulator)</span>
            </button>
          </div>

          {/* TAB 1: RAW SYSTEM PROMPT EDITOR / VIEWER */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ready to paste into Gemini / AI Studio System Instruction Field:
                </label>
                {blueprint.variablePlaceholders && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="text-amber-400">Placeholders:</span>
                    {blueprint.variablePlaceholders.map((ph, idx) => (
                      <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-amber-300">
                        {ph}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[550px] overflow-y-auto shadow-inner border-l-4 border-l-amber-500">
                {blueprint.systemPrompt}
              </div>
            </div>
          )}

          {/* TAB 2: MODULAR ARCHITECTURE MODULES */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                <span>Core System Architecture Modules</span>
              </h4>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.architectureModules && blueprint.architectureModules.length > 0 ? (
                  blueprint.architectureModules.map((mod, idx) => (
                    <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                          Module 0{idx + 1}: {mod.moduleName}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          Production Ready
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{mod.description}</p>
                      {mod.codeSnippet && (
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                          {mod.codeSnippet}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Standard system architecture loaded into system prompt.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHAIN OF THOUGHT STEPS */}
          {activeTab === 'cot' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Deterministic Multi-Pass Reasoning Steps</span>
              </h4>

              <div className="space-y-3">
                {blueprint.chainOfThoughtSteps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="block font-bold">Monetization & ROI Leverage:</strong>
                  <span>{blueprint.monetizationLeverage}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NEGATIVE CONSTRAINTS */}
          {activeTab === 'constraints' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>Negative Constraints & Anti-Hallucination Guardrails</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(blueprint.negativeConstraints || [
                  'No conversational filler words',
                  'No unescaped JSON strings',
                  'No hallucinated API keys'
                ]).map((nc, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-800/30 text-xs text-rose-300 flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{nc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE SYSTEM INSTRUCTION SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-5 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2 mb-1">
                  <Play className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <span>Live Gemini Execution Playground</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Input a test prompt below to test how Gemini 3.6 Flash responds when constrained by this exact Master System Instruction.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Test User Input Prompt:
                </label>
                <textarea
                  value={testInputPrompt}
                  onChange={(e) => setTestInputPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-fuchsia-500 font-sans"
                  placeholder="e.g. Write a 30-second video hook for my SaaS launch"
                />
              </div>

              <button
                onClick={handleRunSimulator}
                disabled={simulating || !testInputPrompt.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-xs shadow-[0_6px_20px_rgba(212,175,55,0.4)] border-b-4 border-amber-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:translate-y-0.5"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Executing Test Run in Gemini Engine...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-slate-950 fill-slate-950" />
                    <span>Run Test Prompt against System Instruction</span>
                  </>
                )}
              </button>

              {simulatorError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{simulatorError}</span>
                </div>
              )}

              {simulatorResult && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Live Model Output (Gemini 3.6 Flash):</span>
                    </span>
                  </div>
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[350px]">
                    {simulatorResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
