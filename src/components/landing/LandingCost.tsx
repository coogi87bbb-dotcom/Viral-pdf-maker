import React from 'react';
import { Reveal } from './Reveal';

/**
 * 002 — The problem, stated plainly. Bone zone, right-aligned: the first
 * colour and alignment inversion after the ink hero, so the page reads as
 * chapters rather than one continuous scroll.
 */
export const LandingCost: React.FC = () => {
  return (
    <section id="cost" className="relative bg-lf-bone py-24 sm:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex justify-end">
          <div className="w-full max-w-2xl text-left lg:text-right">
            <Reveal kind="fade-up">
              <span className="lf-label text-lf-copper-deep">002 / The cost of doing it by hand</span>
            </Reveal>

            <Reveal kind="fade-up" delay={0.1} className="mt-6 block">
              <h2 className="lf-heading text-lf-on-bone">
                Every multi-channel post
                <br className="hidden sm:block" /> costs you{' '}
                <em className="not-italic text-lf-copper">1.8 hours</em>.
              </h2>
            </Reveal>

            <Reveal kind="fade-up" delay={0.2} className="mt-8 block lg:flex lg:justify-end">
              <p className="lf-body text-lf-on-bone-muted">
                Writing it. Reformatting it for seven networks. Hunting hashtags.
                Making the graphic. Scripting the video. Then doing it again
                tomorrow. Five posts a week across four channels is nine hours —
                more than a working day, every week, on production instead of
                strategy.
              </p>
            </Reveal>

            <Reveal kind="fade-up" delay={0.3} className="mt-10 block">
              <hr className="lf-rule text-lf-on-bone" />
              <p className="mt-6 font-editorial text-2xl font-semibold leading-snug text-lf-on-bone sm:text-3xl">
                And it's spread across four subscriptions you're already paying for.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCost;
