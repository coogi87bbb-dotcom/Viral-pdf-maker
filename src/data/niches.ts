import { PlatformBadgeInfo } from '../types';

export const PLATFORM_CONFIGS: Record<string, PlatformBadgeInfo> = {
  x: {
    id: 'x',
    name: 'X',
    iconName: 'Twitter',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10 dark:bg-sky-500/20',
    borderColor: 'border-sky-500/30',
    description: 'High-velocity threads, bold takes, viral text hooks & reposts'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    iconName: 'Instagram',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    description: 'Reels scripts, 10-slide saveable carousels & aesthetic aesthetics'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    iconName: 'Video',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    description: '0-3s retention hooks, high-energy talking head scripts & trending sounds'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    iconName: 'Facebook',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10 dark:bg-blue-600/20',
    borderColor: 'border-blue-600/30',
    description: 'Long-form storytelling, high-engagement group posts & video captions'
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    iconName: 'AtSign',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    description: 'Unfiltered hot-takes, relatable daily thoughts & rapid quote-threads'
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    iconName: 'Pin',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 dark:bg-red-500/20',
    borderColor: 'border-red-500/30',
    description: 'SEO-driven image pins, visual overlay copy & persistent search traffic'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    iconName: 'Linkedin',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    description: 'B2B thought leadership, PDF carousels & high-converting framework breakdowns'
  }
};

export const PRESET_NICHES = [
  {
    id: 'saas-growth',
    name: '🚀 B2B SaaS & Tech Growth',
    description: 'Scaling MRR, AI tools, developer productivity & growth hacking',
    defaultTopic: 'How to replace a $50k/mo marketing team with 3 autonomous AI workflows'
  },
  {
    id: 'ecom-dtc',
    name: '📦 E-commerce & Direct-to-Consumer',
    description: 'Viral product showcases, unboxing, conversion rate optimization & ad hooks',
    defaultTopic: 'Why 92% of Shopify stores fail in month 1 (and the 3-step flywheel that fixed ours)'
  },
  {
    id: 'personal-brand',
    name: '🌟 Personal Branding & Creator Economy',
    description: 'Monetizing audience, info-products, audience retention & authority building',
    defaultTopic: 'The exact framework I used to grow from 0 to 100k followers in 90 days without showing my face'
  },
  {
    id: 'finance-wealth',
    name: '💰 Finance, Wealth & Investing',
    description: 'High-income skills, passive income, business blueprints & wealth creation',
    defaultTopic: '7 leverage points that make $10,000/month easier than making $3,000/month in a 9-to-5'
  },
  {
    id: 'health-fitness',
    name: '⚡ Fitness, Biohacking & Mindset',
    description: 'High performance habits, fat loss, energy optimization & mental toughness',
    defaultTopic: 'The 15-minute morning routine that doubles deep sleep and kills brain fog permanently'
  },
  {
    id: 'real-estate',
    name: '🏡 Real Estate & High-Ticket Coaching',
    description: 'Property investing, client acquisition, high-ticket sales & deal breakdown',
    defaultTopic: 'How to acquire your first cash-flowing rental property with under $10k initial capital'
  },
  {
    id: 'ai-automation',
    name: '🤖 AI Tools, Prompting & Automation',
    description: 'Custom AI agents, LLM workflows, prompt engineering & productivity stacks',
    defaultTopic: 'The exact 5-step AI agent prompt stack that automates 80% of client outreach'
  },
  {
    id: 'info-products',
    name: '🎓 Online Courses & Info-Products',
    description: 'Digital downloads, cohort courses, newsletter monetization & community launch',
    defaultTopic: 'How to turn your domain knowledge into a $10k/mo digital product in 14 days'
  },
  {
    id: 'creative-agency',
    name: '🎨 Design, Video Editing & Agency',
    description: 'Short-form video editing, visual branding, client retainer sales & portfolios',
    defaultTopic: 'How we scaled a video editing agency from $0 to $35k/mo using viral TikTok hooks'
  },
  {
    id: 'crypto-web3',
    name: '💎 Crypto, Web3 & FinTech',
    description: 'DeFi protocols, market analysis, Web3 marketing & tokenomics breakdowns',
    defaultTopic: 'Why institutional capital is flowing into decentralized AI agents in 2026'
  },
  {
    id: 'travel-lifestyle',
    name: '✈️ Travel, Hospitality & Luxury',
    description: 'Digital nomad lifestyle, hotel reviews, luxury travel hacks & destination guides',
    defaultTopic: '10 secret luxury travel hacks to fly first class for 80% less using points'
  },
  {
    id: 'mental-performance',
    name: '🧠 Mental Health & Mindfulness',
    description: 'Focus techniques, burnout recovery, stress management & cognitive health',
    defaultTopic: 'The 3-minute neuroscience habit that stops anxiety and restores razor-sharp focus'
  }
];

export const HOOK_FRAMEWORKS = [
  {
    id: 'pattern-interrupt',
    name: 'Pattern Interrupt',
    description: 'Shatters expectations instantly and forces the viewer to pause scrolling',
    example: 'Stop using ChatGPT for writing blog posts. You are burning money. Do this instead:'
  },
  {
    id: 'curiosity-gap',
    name: 'Curiosity Gap',
    description: 'Leaves a vital piece of information hidden to create an irresistible urge to read/watch',
    example: 'I studied 50 viral TikToks that got over 10M views. They all shared this 3-second secret:'
  },
  {
    id: 'high-stakes',
    name: 'High-Stakes Transformation',
    description: 'Contrasts extreme before/after conditions with a massive tangible payoff',
    example: 'How a 19-year-old built a $100k/mo business with zero employees using this 1 secret system:'
  },
  {
    id: 'polarizing-truth',
    name: 'Polarizing Truth',
    description: 'Takes an uncompromising stance against conventional wisdom to spark debates',
    example: 'Hard truth: College degrees are the worst ROI investment of the 21st century. Here is why:'
  },
  {
    id: 'data-backed',
    name: 'Data-Backed Proof',
    description: 'Leverages large numbers, case studies, and hard metrics for instant credibility',
    example: 'We analyzed 2.4 million posts sent in 2026. Here are the 5 formatting rules that get 10x reposts:'
  }
];

export const TARGET_AUDIENCE_OPTIONS = [
  'Founders, CEOs & SaaS Executives',
  'Solopreneurs, Freelancers & Agency Owners',
  'Content Creators, Influencers & Streamers',
  'Marketers, CMOs & Growth Lead Strategists',
  'E-commerce Store Owners & Dropshippers',
  'Software Engineers & Tech Professionals',
  'Real Estate Agents & Property Investors',
  'Fitness Enthusiasts, Athletes & Biohackers',
  'B2B Sales Teams & Account Executives',
  'Coaches, Consultants & Course Creators',
  'Gen Z & Young Professional Career Starters',
  'Crypto & Web3 Traders / Investors',
  'Custom Target Audience...'
];

export const TONE_OPTIONS = [
  '🔥 High Energy, Direct, Authoritative, Irresistible',
  '⚡ Urgent, High-Stakes, Provocative & Bold',
  '🎓 Educational, Deep-Dive, Academic & Analytical',
  '💬 Witty, Sarcastic, Relatable & Conversational',
  '🌟 Inspirational, Empathetic, Motivating & Story-Driven',
  '💎 Sophisticated, Luxury, Minimalist & Elite',
  '🎥 Casual, Behind-The-Scenes, Authentic & Raw',
  '📊 Aggressive Growth-Hacker, Data-Driven & Tactical',
  '💥 Contrarian, Unfiltered, Hot-Take & Disruptive',
  '🤝 Friendly, Step-by-Step, Beginner-Accessible',
  '💼 Professional, Corporate, B2B Executive',
  '🚀 Ambitious, Visionary, Futuristic & Fearless',
  'Custom Tone / Energy...'
];

