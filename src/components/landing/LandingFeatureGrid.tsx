import React from 'react';
import {
  Flame,
  BarChart3,
  Share2,
  Bookmark,
  Image as ImageIcon,
  Video,
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
    icon: Flame,
    title: 'Psychological Hook Studio',
    description:
      'AI-generated hooks scored for virality, tunable across Mild, Spicy, and Nuclear Viral spice levels.',
    accent: 'amber'
  },
  {
    icon: BarChart3,
    title: 'Virality Score Auditor',
    description:
      'Real-Time Algorithm Simulator & Virality Diagnostics — retention curve simulation, algorithm compliance checks, and 10x rewrites.',
    accent: 'cyan'
  },
  {
    icon: Share2,
    title: 'Multi-Platform Campaign Generator',
    description:
      'One topic, seven platforms. Algorithm-native content tailored to the character limits and tone of every major network, simultaneously.',
    accent: 'violet'
  },
  {
    icon: Bookmark,
    title: '40 Master Blueprints + Teardown Vault',
    description:
      '40 master blueprints and 12 real case-study teardowns, ready to remix for your niche.',
    accent: 'emerald'
  },
  {
    icon: ImageIcon,
    title: 'AI Visual & Thumbnail Studio',
    description: 'On-brand thumbnails and visuals generated to stop the scroll, in seconds.',
    accent: 'rose'
  },
  {
    icon: Video,
    title: 'Teleprompter Studio Pro',
    description:
      'In-browser teleprompter and recording, tuned for maximum FYP distribution and completion rate.',
    accent: 'amber'
  }
];

const ACCENT_CLASSES: Record<string, { badge: string; icon: string }> = {
  amber: { badge: 'from-amber-300 via-amber-400 to-amber-500', icon: 'text-amber-400' },
  cyan: { badge: 'from-cyan-300 via-cyan-400 to-blue-500', icon: 'text-cyan-400' },
  violet: { badge: 'from-violet-300 via-violet-400 to-fuchsia-500', icon: 'text-violet-400' },
  emerald: { badge: 'from-emerald-300 via-emerald-400 to-teal-500', icon: 'text-emerald-400' },
  rose: { badge: 'from-rose-300 via-rose-400 to-pink-500', icon: 'text-rose-400' }
};

export const LandingFeatureGrid: React.FC = () => {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Everything You Need to Go Viral
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            A full production studio for high-DPI documents and omni-channel campaigns —
            not a single-purpose tool.
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
                  whileHover={{ scale: 1.03, rotateY: 3, y: -4, transition: { duration: 0.5, ease: 'easeOut' } }}
                >
                  <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4 h-full">
                    <div
                      className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${accent.badge} p-0.5 flex items-center justify-center`}
                    >
                      <div className="h-full w-full rounded-[10px] flex items-center justify-center bg-slate-950">
                        <Icon className={`h-5 w-5 ${accent.icon}`} strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white">{feature.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
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
