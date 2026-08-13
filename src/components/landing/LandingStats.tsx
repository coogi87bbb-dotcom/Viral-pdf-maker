import React, { useCallback } from 'react';
import { Reveal, CountUp } from './Reveal';

/**
 * 004 — The savings, as figures. Copper zone: the page's one saturated
 * surface, spent on the single section that has to land.
 *
 * Every number is derived from the app's own ROI model
 * (src/components/RoiCalculator.tsx) so the marketing page and the product
 * cannot drift apart:
 *   - 9 hrs/wk  = 5 posts x 1.8 hrs x (4 channels / 4), the calculator's
 *                 `hoursSavedPerWeek` formula at a deliberately modest volume
 *   - $418/mo   = the calculator's SOFTWARE_STACK_TOOLS list prices for the
 *                 four tools LogFlow AI replaces outright
 *                 (99 + 249 + 45 + 25)
 *   - 30s       = the 7-channel campaign generation claim already made in
 *                 CompetitorDominationMatrix.tsx
 *   - 9 tools   = the shipped surface count
 * The calculator's own default preset produces far larger figures; the
 * conservative end is used here on purpose.
 */
interface Stat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  format?: (v: number) => string;
}

const STATS: Stat[] = [
  { value: 9, suffix: 'hrs / wk', label: 'Reclaimed at five posts a week' },
  { value: 418, prefix: '$', suffix: '/ mo', label: 'Subscriptions replaced outright' },
  { value: 30, suffix: 'sec', label: 'For a full seven-channel campaign' },
  { value: 9, suffix: 'tools', label: 'One workspace, one login' },
];

export const LandingStats: React.FC = () => {
  const withCommas = useCallback((v: number) => Math.round(v).toLocaleString('en-US'), []);

  return (
    // The one section that keeps a tint: a translucent copper wash rather
    // than the solid copper block it used to be, so the video still reads
    // through while the figures get the page's only saturated surface.
    <section className="relative py-24 sm:py-28 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(192,117,74,0) 0%, rgba(192,117,74,0.20) 22%, rgba(192,117,74,0.20) 78%, rgba(192,117,74,0) 100%)',
        }}
      />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal kind="scale-up">
          <span className="lf-label text-lf-copper-light text-legible">004 / What that's worth</span>
        </Reveal>

        {/* Two columns even on the narrowest phone: the figures are short
            enough to fit ~170px, and a single column made this band scroll
            for over a screen and a half of mostly empty copper. */}
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-4 lg:gap-y-0">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} kind="scale-up" delay={0.08 * (i + 1)}>
              <div className="border-t border-lf-on-ink/25 pt-6">
                <dd className="lf-figure flex items-baseline gap-1.5 text-lf-on-ink text-legible">
                  {stat.prefix}
                  <CountUp to={stat.value} format={stat.value > 100 ? withCommas : undefined} />
                  <span className="font-sans text-sm font-semibold tracking-tight sm:text-base">
                    {stat.suffix}
                  </span>
                </dd>
                <dt className="mt-4 font-sans text-sm leading-relaxed text-lf-on-ink-muted text-legible">
                  {stat.label}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal kind="fade-up" delay={0.4} className="lf-scrim mt-14 block">
          <p className="max-w-3xl font-sans text-xs leading-relaxed text-lf-on-ink-muted text-legible">
            Estimates from LogFlow AI's built-in ROI model — 1.8 hours of manual
            work per multi-channel post; subscription figures are published list
            prices for the tools LogFlow AI replaces. Run your own numbers in the
            ROI calculator inside the app.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default LandingStats;
