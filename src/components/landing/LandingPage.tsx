import React from 'react';
import { Sparkles } from 'lucide-react';
import { Studio3DBackground } from '../Studio3DBackground';
import { LandingHero } from './LandingHero';
import { LandingFeatureGrid } from './LandingFeatureGrid';
import { LandingProof } from './LandingProof';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Single ambient 3D background layer for the whole page, subtler than
          the in-app version so it reads as calm/premium rather than busy. */}
      <Studio3DBackground className="opacity-70" intensity="subtle" />

      {/* Fade the atmosphere out below the hero so scrolled content sits on
          a clean, readable solid background, matching how the rest of the
          app layers this canvas under glass-panel content. */}
      <div className="pointer-events-none absolute inset-x-0 top-[60vh] bottom-0 bg-gradient-to-b from-transparent to-[#08090d] z-[1]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 bg-[#08090e]/80 backdrop-blur-[20px] backdrop-saturate-150 border-b border-slate-800/80 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-700 p-0.5 flex items-center justify-center">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </div>
              </div>
              <span className="text-base font-black bg-gradient-to-r from-amber-300 via-slate-100 to-amber-200 bg-clip-text text-transparent">
                Viral PDF Creator
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-300 transition-colors cursor-pointer"
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
