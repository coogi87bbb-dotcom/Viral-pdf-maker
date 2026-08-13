import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const PHRASE = ['Hours back', 'Money back', 'Nine tools', 'One login'];

/**
 * 003 — Full-bleed oversized type that tracks horizontally with scroll.
 *
 * Scroll-linked rather than a looping CSS animation: it only moves while the
 * band is on screen, costs nothing when it isn't, and ties the motion to the
 * reader's own input. The track is duplicated so neither end runs out of
 * glyphs at the extremes of travel.
 */
export const LandingMarquee: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        track,
        { xPercent: 4 },
        {
          xPercent: -34,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-lf-ink py-16 sm:py-24"
      aria-label="LogFlow AI in four words"
    >
      <div ref={trackRef} className="lf-marquee flex w-max items-center gap-10 sm:gap-16">
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {PHRASE.map((word, i) => (
              <React.Fragment key={`${copy}-${word}`}>
                <span
                  className={
                    i % 2 === 0
                      ? 'text-lf-on-ink'
                      : 'text-transparent [-webkit-text-stroke:1px_#8a5f45]'
                  }
                  aria-hidden={copy === 1}
                >
                  {word}
                </span>
                <span className="text-lf-copper" aria-hidden="true">
                  ·
                </span>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default LandingMarquee;
