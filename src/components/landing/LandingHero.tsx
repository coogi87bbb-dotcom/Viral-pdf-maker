import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ScrollFrameStage } from './ScrollFrameStage';
import { Reveal } from './Reveal';

interface LandingHeroProps {
  onGetStarted: () => void;
}

/**
 * Hero: a scroll-scrubbed video plate with the wordmark pinned top-left and
 * the headline anchored to the BOTTOM of the viewport.
 *
 * Bottom anchoring is deliberate, not stylistic drift: the source footage has
 * the PERA INC wordmark burned into its left-centre (~50-60% down the frame),
 * which stays by design. Centre-left headline placement — the obvious default
 * — would collide with it. Sitting the copy in the lower third keeps both
 * marks legible and reads as a title card.
 */
export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <ScrollFrameStage>
      {/* Masthead */}
      <div className="absolute inset-x-0 top-0 z-20 px-5 pt-6 sm:px-8 lg:px-12 lg:pt-9">
        <Reveal kind="fade-up" immediate className="flex items-baseline justify-between gap-4">
          <span className="font-editorial text-xl sm:text-2xl font-semibold tracking-[-0.01em] text-lf-on-ink">
            LogFlow<span className="text-lf-copper"> AI</span>
          </span>
          <span className="lf-label hidden text-lf-on-ink-muted sm:inline">
            Nine tools · One workspace
          </span>
        </Reveal>
      </div>

      {/* Title card */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-10 sm:px-8 sm:pb-12 lg:px-12 lg:pb-14">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal kind="fade-up" delay={0.05} immediate>
            <span className="lf-label text-lf-copper-light">001 / The workspace</span>
          </Reveal>

          {/* Wraps to 2-3 lines on a phone (where the plate sits high and
              there is room), but stays on ONE line from lg up so the block
              is short enough to clear the PERA INC wordmark above it. */}
          <Reveal kind="clip" delay={0.14} immediate className="mt-4 block">
            <h1 className="lf-display max-w-[11ch] text-lf-on-ink lg:max-w-none">
              Get your week back.
            </h1>
          </Reveal>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal kind="fade-up" delay={0.26} immediate>
              <p className="lf-body text-lf-on-ink-muted">
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
                  className="group inline-flex min-h-[52px] items-center gap-3 rounded-full bg-lf-bone px-8 py-3.5 font-sans text-sm font-semibold text-lf-ink transition-[transform,opacity] duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lf-copper focus-visible:ring-offset-2 focus-visible:ring-offset-lf-ink active:scale-[0.98]"
                >
                  Start free
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <a
                  href="#cost"
                  className="lf-label min-h-[44px] items-center inline-flex border-b border-lf-on-ink-muted/40 pb-0.5 text-lf-on-ink-muted transition-colors duration-200 hover:text-lf-on-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lf-copper"
                >
                  See the math
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </ScrollFrameStage>
  );
};

export default LandingHero;
