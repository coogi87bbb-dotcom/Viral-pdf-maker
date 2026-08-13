import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

interface LandingCTAProps {
  onGetStarted: () => void;
}

/** 007 — Close. Bone zone, centred: the only centred composition on the page. */
export const LandingCTA: React.FC<LandingCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="relative bg-lf-bone py-28 sm:py-36 lg:py-44">
      <div className="mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <Reveal kind="scale-up">
          <span className="lf-label text-lf-copper-deep">007 / Start</span>
        </Reveal>

        <Reveal kind="scale-up" delay={0.1} className="mt-6 block">
          <h2 className="lf-heading mx-auto max-w-[18ch] text-lf-on-bone">
            Find out what nine hours a week is worth to you.
          </h2>
        </Reveal>

        <Reveal kind="scale-up" delay={0.2} className="mt-7 block">
          <p className="lf-body mx-auto text-center text-lf-on-bone-muted">
            Free to start. No card, no sales call — open the workspace and run
            your own numbers.
          </p>
        </Reveal>

        <Reveal kind="scale-up" delay={0.3} className="mt-11 block">
          <button
            type="button"
            onClick={onGetStarted}
            className="group inline-flex min-h-[56px] items-center gap-3 rounded-full bg-lf-ink px-10 py-4 font-sans text-sm font-semibold text-lf-bone transition-[transform,opacity] duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lf-copper-deep focus-visible:ring-offset-2 focus-visible:ring-offset-lf-bone active:scale-[0.98]"
          >
            Start free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};

export default LandingCTA;
