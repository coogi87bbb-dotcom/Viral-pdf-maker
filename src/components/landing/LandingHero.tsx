import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

interface LandingHeroProps {
  onGetStarted: () => void;
}

/**
 * Hero — a normal full-viewport section now, sitting transparent over the
 * page-wide video backdrop (mounted once at LandingPage level, not owned
 * here). The masthead pins to the top, the title card to the bottom.
 *
 * Bottom anchoring is kept as a deliberate editorial composition choice —
 * it originally existed to dodge the source footage's burned-in wordmark,
 * which the extraction pipeline now removes entirely (see
 * ScrollFrameStage.tsx / scripts/extract-hero-frames.sh), but the
 * lower-third title-card layout reads well on its own and wasn't changed
 * just because its original reason went away.
 */
export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <section
      className="relative flex min-h-[100dvh] flex-col justify-between px-5 pb-10 pt-6 sm:px-8 sm:pb-12 lg:px-12 lg:pb-14 lg:pt-9"
      aria-label="LogFlow AI introduction"
    >
      {/* Masthead */}
      <Reveal kind="fade-up" immediate className="flex items-baseline justify-between gap-4">
        <span className="font-editorial text-xl font-semibold tracking-[-0.01em] text-lf-on-ink text-legible sm:text-2xl">
          LogFlow<span className="text-lf-copper"> AI</span>
        </span>
        <span className="lf-label hidden text-lf-on-ink-muted text-legible sm:inline">
          Nine tools · One workspace
        </span>
      </Reveal>

      {/* Title card */}
      <div className="mx-auto w-full max-w-7xl">
        <Reveal kind="fade-up" delay={0.05} immediate>
          <span className="lf-label text-lf-copper-light text-legible">001 / The workspace</span>
        </Reveal>

        {/* Wraps on a phone; stays on ONE line from lg up. */}
        <Reveal kind="clip" delay={0.14} immediate className="mt-4 block">
          <h1 className="lf-display max-w-[14ch] text-lf-on-ink text-legible lg:max-w-none">
            Get your week back.
          </h1>
        </Reveal>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal kind="fade-up" delay={0.26} immediate>
            <p className="lf-body text-lf-on-ink-muted text-legible">
              Nine production tools in one workspace — campaigns, publishing,
              proposals, real estate. The work that eats your evenings takes
              minutes here.
            </p>
          </Reveal>

          <Reveal kind="fade-up" delay={0.36} immediate className="shrink-0">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="group inline-flex min-h-[52px] items-center gap-3 rounded-full bg-lf-bone px-8 py-3.5 font-sans text-sm font-semibold text-lf-ink shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] transition-[transform,opacity] duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lf-copper focus-visible:ring-offset-2 focus-visible:ring-offset-lf-ink active:scale-[0.98]"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <a
                href="#cost"
                className="lf-label inline-flex min-h-[44px] items-center border-b border-lf-on-ink-muted/40 pb-0.5 text-lf-on-ink-muted text-legible transition-colors duration-200 hover:text-lf-on-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lf-copper"
              >
                See the math
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
