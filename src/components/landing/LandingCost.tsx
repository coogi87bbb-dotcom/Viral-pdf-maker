import React from 'react';
import { Reveal } from './Reveal';

/**
 * 002 — The problem, stated plainly. Right-aligned, transparent over the
 * page-wide video. A light scrim behind the copy column only (not the full
 * bleed) keeps the type readable without flattening the footage.
 *
 * This is the page's one deliberate "grid-break" moment: a diagonal copper
 * hairline sweeps across the whole viewport behind the copy, breaking the
 * plain-horizontal-rule rhythm every other section uses. The "1.8 hours"
 * figure carries the page's one shock accent (--color-lf-patina) instead of
 * the copper used everywhere else, a single cool note on an otherwise
 * entirely warm page, never repeated elsewhere.
 *
 * No eyebrow label here on purpose - the headline states the topic directly,
 * and the page caps section eyebrows at 3 total (Hero, Capabilities, CTA)
 * rather than stamping "00X / Topic" on every section, which reads as an
 * enumerated index rather than a designed page.
 */
export const LandingCost: React.FC = () => {
  return (
    <section id="cost" className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      {/* Grid-break device: a single diagonal rule cutting the section,
          rotate is a transform so this stays within the animate-only-
          transform/opacity guardrail even though it isn't itself animated. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-1/2 z-0 h-px w-[120%] origin-center -rotate-[7deg] bg-lf-copper/25"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex justify-end">
          <div className="w-full max-w-2xl text-left lg:text-right">
            <Reveal kind="skew-in" delay={0.1} className="block">
              <h2 className="lf-heading text-lf-on-ink text-legible">
                Every multi-channel post
                <br className="hidden sm:block" /> costs you{' '}
                <em className="not-italic text-lf-patina">1.8 hours</em>.
              </h2>
            </Reveal>

            <Reveal kind="fade-up" delay={0.2} className="lf-scrim mt-8 block lg:flex lg:justify-end">
              <p className="lf-body text-lf-on-ink-muted text-legible">
                Writing it. Reformatting it for seven networks. Hunting hashtags.
                Making the graphic. Scripting the video. Then doing it again
                tomorrow. Five posts a week across four channels is nine hours,
                more than a working day every week, on production instead of
                strategy.
              </p>
            </Reveal>

            <Reveal kind="fade-up" delay={0.3} className="mt-10 block">
              <hr className="lf-rule text-lf-on-ink" />
              <p className="mt-6 font-editorial text-2xl font-semibold leading-snug text-lf-on-ink text-legible sm:text-3xl">
                And it's spread across five subscriptions you're already paying for.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCost;
