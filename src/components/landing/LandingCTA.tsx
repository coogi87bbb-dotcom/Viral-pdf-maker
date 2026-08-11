import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MotionPanel3D } from '../MotionPanel3D';

interface LandingCTAProps {
  onGetStarted: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionPanel3D tiltX={8} frosted={false}>
          <div className="glass-panel rounded-2xl px-6 py-14 sm:px-16 sm:py-16 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white max-w-xl mx-auto">
              Ready to Publish Something That Actually Spreads?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
              Create your account and start turning documents into omni-channel campaigns today.
            </p>
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-[0_10px_40px_rgba(245,158,11,0.35)] hover:shadow-[0_14px_50px_rgba(245,158,11,0.5)] transition-[transform,opacity,box-shadow] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber-400"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </MotionPanel3D>
      </div>
    </section>
  );
};

export default LandingCTA;
