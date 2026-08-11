import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowRight, Flame, Sparkles, BarChart3 } from 'lucide-react';
import { MotionPanel3D } from '../MotionPanel3D';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  // Custom mouse-tilt on top of MotionPanel3D's default hover tilt — this is
  // the hero's standout "3D" moment, distinct from the scroll-reveal tilt
  // used everywhere else. Pure CSS-transform (perspective/rotate), no WebGL.
  // Softer spring physics (lower stiffness, higher damping) than a typical
  // snappy UI tilt, so the response feels liquid/organic rather than a
  // sharp mechanical hinge.
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 60, damping: 18, mass: 1.2 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 60, damping: 18, mass: 1.2 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateYRaw.set(px * 14);
    rotateXRaw.set(py * -14);
  };

  const handleMouseLeave = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

  return (
    <section className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 overflow-hidden">
      {/* Organic ambient color blobs — violet + amber, matching the app's own
          default brand palette (midnight-amethyst-gold theme) — soft and
          fluid rather than sharp geometric shapes. */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute top-10 -right-24 h-[26rem] w-[26rem] rounded-full bg-amber-500/15 blur-[110px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.95fr_1.15fr] gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-7"
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
            <button
              onClick={onGetStarted}
              className="group px-6 py-3.5 rounded-xl bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-[0_10px_40px_rgba(245,158,11,0.35)] hover:shadow-[0_14px_50px_rgba(245,158,11,0.5)] transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#features"
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 font-bold text-sm hover:text-white hover:border-slate-700 transition-all"
            >
              See What&apos;s Inside
            </a>
          </div>
        </motion.div>

        {/* Preview card — enlarged as the hero's visual centerpiece, with a
            continuous gentle float layered under the mouse-tilt for a more
            organic, "alive" feel rather than a static card that only moves
            on interaction. */}
        <MotionPanel3D delay={0.15} tiltX={16} className="max-w-lg mx-auto w-full">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ perspective: 1400 }}
              className="p-1.5"
            >
              <motion.div
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                className="rounded-2xl bg-gradient-to-br from-slate-950/70 to-violet-950/30 border border-slate-800 p-7 sm:p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                      <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <Flame className="h-4.5 w-4.5 text-amber-400" />
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-300">Hook Studio</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 font-bold">
                    NUCLEAR VIRAL
                  </span>
                </div>

                <p className="text-base text-slate-200 leading-relaxed font-medium">
                  &quot;Nobody tells you this about going viral&hellip; until it&apos;s
                  too late.&quot;
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Virality Score 94</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">7 platforms tailored</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </MotionPanel3D>
      </div>
    </section>
  );
};

export default LandingHero;
