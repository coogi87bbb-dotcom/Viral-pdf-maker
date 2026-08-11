import React, { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { LandingHero } from './LandingHero';
import { ScrollFrameStage } from './ScrollFrameStage';
import { LandingFeatureGrid } from './LandingFeatureGrid';
import { LandingProof } from './LandingProof';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  // The whole scrollable page (header + hero + features + proof + cta +
  // footer) — ScrollFrameStage measures 0..1 progress across this entire
  // element's height, not just the hero, so the video plays continuously
  // as you scroll all the way down the page. The video canvas itself is
  // `position: fixed` (set inside ScrollFrameStage), so it doesn't need to
  // live inside any particular section to stay full-viewport.
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={pageRef} className="min-h-screen bg-surface-0 text-ink-primary font-sans selection:bg-accent-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      <ScrollFrameStage scrollContainerRef={pageRef} />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 bg-surface-1/80 backdrop-blur-[20px] backdrop-saturate-150 border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-700 p-0.5 flex items-center justify-center">
                <div className="h-full w-full bg-surface-0 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-accent-amber-400" />
                </div>
              </div>
              <span className="text-base font-black bg-gradient-to-r from-amber-300 via-slate-100 to-amber-200 bg-clip-text text-transparent">
                Viral PDF Creator
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl bg-accent-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber-400"
            >
              Sign In
            </button>
          </div>
        </header>

        <main>
          <LandingHero onGetStarted={onGetStarted} />
          <LandingFeatureGrid />
          <LandingProof />
          <LandingCTA onGetStarted={onGetStarted} />
        </main>

        <LandingFooter />
      </div>
    </div>
  );
};

export default LandingPage;
