import { ViralHook } from '../types';

export interface ExtendedFrameworkInfo {
  id: string;
  name: string;
  badgeColor: string;
  cognitiveBias: string;
  description: string;
  scrollStopMechanism: string;
  example: string;
  idealPlatform: string;
}

export const EXTENDED_HOOK_FRAMEWORKS: ExtendedFrameworkInfo[] = [
  {
    id: 'pattern-interrupt',
    name: 'Pattern Interrupt',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    cognitiveBias: 'Cognitive Dissonance',
    description: 'Shatters scrolling inertia by contradicting a deeply held expectation or industry standard.',
    scrollStopMechanism: 'Forces the brain to re-evaluate familiar information, triggering a dopamine focus burst.',
    example: 'Stop using ChatGPT to write blog posts. You are burning money. Do this instead:',
    idealPlatform: 'TikTok, X, Reels'
  },
  {
    id: 'curiosity-gap',
    name: 'Curiosity Gap',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    cognitiveBias: 'Information Gap Theory',
    description: 'Withholds a critical piece of information while teasing an extraordinary result.',
    scrollStopMechanism: 'Creates psychological pain (uncertainty) that can only be relieved by expanding the post.',
    example: 'I analyzed 2,400 viral TikToks. They all shared this 3-second formatting secret:',
    idealPlatform: 'X, LinkedIn, Threads'
  },
  {
    id: 'high-stakes',
    name: 'High-Stakes Transformation',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    cognitiveBias: 'Aspirational Bias & Contrast Effect',
    description: 'Juxtaposes a near-zero starting point or youth with extreme financial/growth upside.',
    scrollStopMechanism: 'Triggers hope and skepticism simultaneously, forcing viewers to check for proof.',
    example: 'How a 21-year-old built a $100k/mo software business with zero employees using 3 free prompts:',
    idealPlatform: 'LinkedIn, X, YouTube Shorts'
  },
  {
    id: 'polarizing-truth',
    name: 'Polarizing Truth',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    cognitiveBias: 'In-Group vs Out-Group Bias',
    description: 'Takes an uncompromising, contrarian stance against conventional industry advice.',
    scrollStopMechanism: 'Forces readers to take a side immediately and comment to defend or validate their stance.',
    example: 'Hard truth: 90% of content creators fail because they optimize for algorithms instead of psychology.',
    idealPlatform: 'Threads, X, LinkedIn'
  },
  {
    id: 'data-backed',
    name: 'Data-Backed Proof',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    cognitiveBias: 'Authority & Large Number Bias',
    description: 'Leverages large, hyper-specific sample sizes and verified metrics for instant authority.',
    scrollStopMechanism: 'Eliminates skepticism by leading with empirical research rather than opinion.',
    example: 'We analyzed 10,000 cold emails sent in 2026. The ones with 80%+ open rates used this 4-word subject line:',
    idealPlatform: 'LinkedIn, X, Email'
  },
  {
    id: 'anti-guru',
    name: 'Anti-Guru Callout',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    cognitiveBias: 'Reactance & Anti-Establishment',
    description: 'Exposes false advice sold by online experts or influencers to champion the underdog.',
    scrollStopMechanism: 'Validates reader frustration with bad advice and positions you as a trusted whistle-blower.',
    example: 'The dirty secret 7-figure agency gurus never tell you about paid ads (and why it matters):',
    idealPlatform: 'TikTok, Instagram, YouTube'
  },
  {
    id: 'secret-vault',
    name: 'Secret Vault & Cheat Code',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    cognitiveBias: 'Scarcity & Insider Privilege',
    description: 'Frames knowledge or tools as a hidden "cheat code" previously reserved for elites.',
    scrollStopMechanism: 'Triggers FOMO and immediate bookmarking/saving for later reference.',
    example: 'This free AI tool feels illegal to know: How to clone any competitor content strategy in 60 seconds.',
    idealPlatform: 'TikTok, Instagram Carousels, Pinterest'
  },
  {
    id: 'uncomfortable-reality',
    name: 'Uncomfortable Reality',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    cognitiveBias: 'Loss Aversion & Pain Avoidance',
    description: 'Highlights a quiet, ongoing failure or wasted effort that the reader is currently experiencing.',
    scrollStopMechanism: 'Taps into fear of wasted effort and financial leakage.',
    example: 'If your post engagement dropped 80% this month, you are making this silent formatting mistake:',
    idealPlatform: 'X, LinkedIn, Facebook'
  },
  {
    id: 'zero-to-hero',
    name: 'Zero-to-Hero Metric',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    cognitiveBias: 'Mirror Neuron Empathy',
    description: 'Shares an intimate personal breakdown from rock bottom to a specific quantitative win.',
    scrollStopMechanism: 'Creates emotional resonance and relatability before delivering the tactical lesson.',
    example: '6 months ago I had 142 followers and $0 MRR. Today I hit $28,400/mo. Here is my exact 5-step playbook:',
    idealPlatform: 'LinkedIn, X, Threads'
  },
  {
    id: 'negative-hook',
    name: 'Negative Warning Hook',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    cognitiveBias: 'Negativity Bias',
    description: 'Warns viewers NOT to do something or stop scrolling if they fit a specific criteria.',
    scrollStopMechanism: 'Psychologically commands attention because humans process warnings faster than rewards.',
    example: 'DO NOT post another Reel until you fix these 3 fatal audio mistakes:',
    idealPlatform: 'TikTok, YouTube Shorts, Instagram'
  }
];

export const ICONIC_SWIPE_FILE_HOOKS: ViralHook[] = [
  {
    id: 'swipe-1',
    hookText: 'Stop paying $5,000/mo for social media agencies. You are burning money. Do this instead:',
    framework: 'Pattern Interrupt',
    viralityScore: 98,
    emotionalTrigger: 'Financial Self-Preservation & Disbelief',
    whyItWorks: 'Directly attacks a high recurring expense and creates immediate urgency.',
    cognitiveBias: 'Loss Aversion',
    spicinessLevel: 'Spicy',
    platformSuitability: { x: 96, linkedin: 92, tiktok: 98, instagram: 90 },
    seeMoreCutoffIndex: 78,
    spokenDurationSec: 2.3,
    variations: {
      punchy: 'Paying $5k/mo for marketing agencies is a scam. Try this 3-minute AI workflow instead.',
      storyDriven: 'I spent $60,000 on high-ticket marketing agencies last year before I realized this 1 automation replaces them all.',
      question: 'Are you still paying $5,000/mo for marketing agencies in 2026? Here is why smart founders stopped:',
      metricDriven: 'How we cut our agency payroll by $60,000/year using 3 simple autonomous AI scripts:'
    }
  },
  {
    id: 'swipe-2',
    hookText: 'I analyzed 2,400 viral X posts that got over 10M impressions. They all shared this 1 formatting secret:',
    framework: 'Data-Backed Proof',
    viralityScore: 96,
    emotionalTrigger: 'Curiosity & Insider Access',
    whyItWorks: 'Uses large specific sample size to build undeniable authority.',
    cognitiveBias: 'Authority Bias',
    spicinessLevel: 'Mild',
    platformSuitability: { x: 99, linkedin: 95, tiktok: 88, instagram: 91 },
    seeMoreCutoffIndex: 82,
    spokenDurationSec: 2.8,
    variations: {
      punchy: '2,400 viral posts analyzed. 1 hidden formatting secret discovered. Here it is:',
      storyDriven: 'I pulled 2,400 viral posts into Python and ran a pattern analysis. The result shocked me:',
      question: 'Ever wonder why some posts get 10M impressions while yours stall at 200 views? Here is the data:',
      metricDriven: '2,400 posts, 10M+ impressions, 1 formatting rule that increased reach by 480%:'
    }
  },
  {
    id: 'swipe-3',
    hookText: 'Unpopular opinion: 90% of content creators are failing because they focus on algorithms instead of psychology.',
    framework: 'Polarizing Truth',
    viralityScore: 95,
    emotionalTrigger: 'Controversy & Ego Challenge',
    whyItWorks: 'Forces the reader to pick a side and comment with their opinion.',
    cognitiveBias: 'In-Group vs Out-Group Bias',
    spicinessLevel: 'Nuclear Viral',
    platformSuitability: { x: 94, linkedin: 89, tiktok: 92, instagram: 95 },
    seeMoreCutoffIndex: 75,
    spokenDurationSec: 2.5,
    variations: {
      punchy: 'Algorithms do not make posts viral. Human psychology does.',
      storyDriven: 'When I stopped chasing TikTok algorithm trends and started studying human cognitive biases, my views went from 500 to 2.4M.',
      question: 'Why are 90% of creators stuck under 1,000 views despite posting every day?',
      metricDriven: 'Psychology-driven hooks beat algorithm-optimized headlines by 340% in our A/B test of 500 posts:'
    }
  },
  {
    id: 'swipe-4',
    hookText: 'How a 21-year-old built a $100k/mo software business with zero employees using 3 free AI prompts:',
    framework: 'High-Stakes Transformation',
    viralityScore: 97,
    emotionalTrigger: 'Aspiration & Disbelief',
    whyItWorks: 'Contrasts extreme youth/zero resources with huge monetary upside.',
    cognitiveBias: 'Contrast Effect',
    spicinessLevel: 'Spicy',
    platformSuitability: { x: 97, linkedin: 94, tiktok: 96, instagram: 93 },
    seeMoreCutoffIndex: 80,
    spokenDurationSec: 2.6,
    variations: {
      punchy: '$100k/mo. 0 employees. 3 free AI prompts. Steal the workflow below:',
      storyDriven: 'At 21, everyone told him to finish college. Instead, he engineered 3 AI prompts that generate $100k/mo.',
      question: 'Is it really possible to build a $100k/mo solo business with zero employees in 2026?',
      metricDriven: '$100,000 monthly recurring revenue with $0 labor cost: The 3-prompt architecture breakdown:'
    }
  },
  {
    id: 'swipe-5',
    hookText: 'The dirty secret that 7-figure SaaS founders never tell you on X (and why it matters):',
    framework: 'Anti-Guru Callout',
    viralityScore: 94,
    emotionalTrigger: 'Exclusivity & Secret Knowledge',
    whyItWorks: 'Leverages insider secrecy to compel the reader to click expand.',
    cognitiveBias: 'Information Gap Theory',
    spicinessLevel: 'Nuclear Viral',
    platformSuitability: { x: 98, linkedin: 88, tiktok: 94, instagram: 90 },
    seeMoreCutoffIndex: 72,
    spokenDurationSec: 2.4,
    variations: {
      punchy: '7-figure SaaS founders are hiding this 1 acquisition channel from you.',
      storyDriven: 'I spent 3 hours in a closed-door dinner with 7-figure SaaS founders. What they revealed about growth shocked me.',
      question: 'What are 7-figure SaaS founders doing that they never share publicly on X?',
      metricDriven: 'The hidden $1M MRR growth engine behind top SaaS brands (Zero ad spend required):'
    }
  },
  {
    id: 'swipe-6',
    hookText: 'DO NOT record another short-form video until you apply this 0.5-second visual hook rule:',
    framework: 'Negative Warning Hook',
    viralityScore: 99,
    emotionalTrigger: 'Urgency & Fear of Wasted Effort',
    whyItWorks: 'Commands direct compliance by threatening ongoing video failure.',
    cognitiveBias: 'Negativity Bias',
    spicinessLevel: 'Nuclear Viral',
    platformSuitability: { x: 90, linkedin: 85, tiktok: 99, instagram: 98 },
    seeMoreCutoffIndex: 68,
    spokenDurationSec: 2.1,
    variations: {
      punchy: 'Stop making boring short video intros. Use the 0.5s visual glitch rule instead.',
      storyDriven: 'My first 50 Reels failed miserably until a top TikTok producer taught me the 0.5-second visual hook rule.',
      question: 'Are your videos getting swiped past in the first second? Here is the 0.5s fix:',
      metricDriven: 'Adding a 0.5s visual disruption boosted our 3-second video hold rate from 14% to 68%:'
    }
  }
];

export const PRESET_SWIPE_TOPICS = [
  'How to replace a $50k/mo marketing agency with 3 free AI prompts',
  'How to grow a newsletter to 50,000 subscribers with zero paid ads',
  'The exact prompt stack that generated $12,000 in digital product sales in 7 days',
  'Why 90% of SaaS startups fail before $10k MRR (and the 3-step pivot)',
  'How to build a viral short video script that gets 1M+ views consistently',
  'The 5-minute morning routine that eliminated my burnout and doubled output'
];
