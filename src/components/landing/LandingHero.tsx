import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Legibility scrim, between the fixed video backdrop and the
          headline. On desktop the "contain"-fit frame naturally
          letterboxes and leaves the left side clear, but on narrow
          viewports the portrait frame fills the full section width (no
          free horizontal space at all), so the headline would otherwise
          sit directly on top of the video — this gradient guarantees text
          contrast at every breakpoint rather than relying on incidental
          frame negative space. Sections further down the page rely on
          their own near-opaque card backgrounds for this instead (see
          LandingFeatureGrid/Proof/CTA), since they don't have a bare
          headline sitting directly on the video. */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,11,17,0.55) 0%, rgba(8,11,17,0.38) 45%, rgba(8,11,17,0.12) 70%, rgba(8,11,17,0) 100%)',
        }}
      />

      {/* Center-left, vertically-centered headline column, overlaid on the
          page-wide scroll-driven video backdrop (mounted once at
          LandingPage level, not owned by this section). */}
      <div className="relative z-10 flex min-h-screen items-center py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl space-y-7 px-6 sm:px-10 lg:px-16"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/10 to-violet-500/10 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/20 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>LogFlowAI &middot; Professional PDF Studio &amp; Viral Content Engine</span>
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
