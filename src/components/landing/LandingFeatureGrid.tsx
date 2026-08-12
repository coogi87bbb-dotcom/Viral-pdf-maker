import React from 'react';
import {
  Flame,
  BarChart3,
  Share2,
  Image as ImageIcon,
  FileText,
  Layers,
  Briefcase,
  Handshake,
  Bot,
  type LucideIcon
} from 'lucide-react';
import { MotionPanel3D } from '../MotionPanel3D';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string; // tailwind color stem, e.g. 'amber'
}

const FEATURES: Feature[] = [
  {
    icon: Share2,
    title: 'Omni-Campaign Factory',
    description:
      'One topic, seven platforms — algorithm-native posts for every network at once, backed by 40 remixable campaign blueprints. What takes 3+ hours by hand takes about 30 seconds here.',
    accent: 'violet'
  },
  {
    icon: Flame,
    title: 'Psychological Hook Studio',
    description:
      'AI hooks scored for virality across Mild, Spicy, and Nuclear spice levels — skip the hour of rewrites most creators burn on their first three seconds.',
    accent: 'amber'
  },
  {
    icon: BarChart3,
    title: 'Virality Score Auditor',
    description:
      'Every draft audited against real algorithm behavior before you post, with instant rewrites — catch a dead post before it costs you the afternoon.',
    accent: 'cyan'
  },
  {
    icon: ImageIcon,
    title: 'AI Visual & Video Studio',
    description:
      'On-brand thumbnails, carousels, Pinterest pins, plus an in-browser teleprompter and recorder — skip the evening you’d lose to a design tool and a separate camera app.',
    accent: 'rose'
  },
  {
    icon: FileText,
    title: 'PDF Publishing Studio',
    description:
      'Drop in a raw doc or Google Doc link and walk away with a designed, high-DPI PDF and 3D mockup in minutes, not a weekend.',
    accent: 'sky'
  },
  {
    icon: Layers,
    title: 'Digital Kit Studio',
    description:
      '50+ ready-to-sell template bundles across 6 categories — most creators spend 10+ hours a week building these from scratch.',
    accent: 'emerald'
  },
  {
    icon: Briefcase,
    title: 'GigScale Freelance Engine',
    description:
      'Pricing tiers, pitch proposals, and cold-email sequences generated instantly — the admin work that normally eats a freelancer’s week.',
    accent: 'orange'
  },
  {
    icon: Handshake,
    title: 'Deal Closer',
    description:
      '7 real-estate tools — commission math, negotiation scripts, MLS listings, contract timelines — turn hours of paperwork into minutes.',
    accent: 'teal'
  },
  {
    icon: Bot,
    title: 'Agent Ops Self-Healing Hub',
    description:
      '10 specialist AI agents on tap, plus a self-healing runtime that catches and fixes errors automatically — so nothing eats your night debugging.',
    accent: 'fuchsia'
  }
];

const ACCENT_CLASSES: Record<string, { badge: string; icon: string }> = {
  amber: { badge: 'from-amber-300 via-amber-400 to-amber-500', icon: 'text-amber-400' },
  cyan: { badge: 'from-cyan-300 via-cyan-400 to-blue-500', icon: 'text-cyan-400' },
  violet: { badge: 'from-violet-300 via-violet-400 to-fuchsia-500', icon: 'text-violet-400' },
  emerald: { badge: 'from-emerald-300 via-emerald-400 to-teal-500', icon: 'text-emerald-400' },
  rose: { badge: 'from-rose-300 via-rose-400 to-pink-500', icon: 'text-rose-400' },
  sky: { badge: 'from-sky-300 via-sky-400 to-blue-500', icon: 'text-sky-400' },
  orange: { badge: 'from-orange-300 via-orange-400 to-amber-600', icon: 'text-orange-400' },
  teal: { badge: 'from-teal-300 via-teal-400 to-emerald-600', icon: 'text-teal-400' },
  fuchsia: { badge: 'from-fuchsia-300 via-fuchsia-400 to-violet-600', icon: 'text-fuchsia-400' }
};

export const LandingFeatureGrid: React.FC = () => {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Everything You Need — Built to Save You Hours
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Content, publishing, freelance ops, real estate, and reliability — nine
            production-grade tools, each one replacing hours of manual work with minutes.
          </p>
        </div>

        {/* Middle column offset downward on large screens for an organic
            wave rhythm rather than a rigid, perfectly uniform grid. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const accent = ACCENT_CLASSES[feature.accent];
            const isMiddleColumn = i % 3 === 1;
            return (
              <div key={feature.title} className={isMiddleColumn ? 'lg:translate-y-7' : ''}>
                <MotionPanel3D
                  tiltX={10}
                  delay={i * 0.1}
                  frosted={false}
                  whileHover={{ scale: 1.03, rotateY: 3, y: -4, transition: { duration: 0.5, ease: 'easeOut' } }}
                >
                  {/* Fully transparent layer (MotionPanel3D's own frosted
                      background is disabled above): zero fill, zero blur —
                      the page-wide video shows straight through the card
                      with nothing softening it. Only a hairline border
                      marks the box outline. Text stays legible via
                      .text-legible's drop shadow instead of an opaque
                      backing. */}
                  <div className="bg-transparent rounded-2xl border border-white/15 p-5 sm:p-6 shadow-xl space-y-4 h-full">
                    <div
                      className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${accent.badge} p-0.5 flex items-center justify-center`}
                    >
                      <div className="h-full w-full rounded-[10px] flex items-center justify-center bg-slate-950">
                        <Icon className={`h-5 w-5 ${accent.icon}`} strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white text-legible">{feature.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed text-legible">{feature.description}</p>
                  </div>
                </MotionPanel3D>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatureGrid;
