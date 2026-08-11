import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { ScrollFrameStage } from './ScrollFrameStage';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface LandingHeroProps {
  onGetStarted: () => void;
}

// Subtle parallax range for the headline as the hero scrolls — deliberately
// small (a few rem of total drift across the whole 0->1 pin range) so it
// reads as "drift", not a second scroll-jack effect competing with the
// canvas crossfade underneath it.
const HEADLINE_PARALLAX_PX = 48;

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const prefersReducedMotion = useReducedMotion();

  // Single source of truth for scroll progress (0..1), fed by
  // ScrollFrameStage's ScrollTrigger onUpdate — the headline parallax reads
  // off the same value instead of running its own independent ScrollTrigger.
  const scrollProgress = useMotionValue(0);
  const handleProgress = useCallback((p: number) => scrollProgress.set(p), [scrollProgress]);
  const headlineY = useTransform(scrollProgress, [0, 1], [0, -HEADLINE_PARALLAX_PX]);

  // GSAP pins this section itself (via ScrollFrameStage's triggerRef prop) —
  // it's the normal-flow ancestor with a real intrinsic height that both the
  // canvas layer and the headline live inside, so they stay pinned together.
  const heroSectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={heroSectionRef} className="relative h-[100vh] min-h-[640px] overflow-hidden">
      <ScrollFrameStage className="absolute inset-0 -z-10" triggerRef={heroSectionRef} onProgress={handleProgress} />

      {/* Legibility scrim, between the canvas and the headline. On desktop
          the "contain"-fit image naturally letterboxes and leaves the left
          side clear, but on narrow viewports the portrait image fills the
          full section width (no free horizontal space at all), so the
          headline would otherwise sit directly on top of a stark-white
          product photo — this gradient guarantees text contrast at every
          breakpoint rather than relying on incidental image negative space. */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,11,17,0.96) 0%, rgba(8,11,17,0.88) 45%, rgba(8,11,17,0.4) 70%, rgba(8,11,17,0) 100%)',
        }}
      />

      {/* Center-left, vertically-centered headline column, overlaid on the
          scroll-driven canvas stage. */}
      <div className="relative z-10 flex h-full items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={prefersReducedMotion ? undefined : { y: headlineY }}
          className="max-w-xl space-y-7 px-6 sm:px-10 lg:px-16"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/10 to-violet-500/10 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/20 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Professional PDF Studio &amp; Viral Content Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] bg-gradient-to-r from-amber-300 via-slate-100 to-violet-300 bg-clip-text text-transparent">
            Publish High-DPI PDFs.
            <br />
            Engineer Content That
            <br />
            Actually Goes Viral.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            One workspace to create, publish, and monetize documents, books, and
            omni-channel campaigns — powered by a Cognitive Psychology &amp;
            Attention Mechanics Engine and a Real-Time Algorithm Simulator.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="primary" size="lg" onClick={onGetStarted} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Get Started Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See What&apos;s Inside
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
