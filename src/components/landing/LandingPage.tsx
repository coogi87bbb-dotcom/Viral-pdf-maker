import React, { useRef } from 'react';
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
    // No bg-* here deliberately: ScrollFrameStage's fixed wrapper paints its
    // own full gradient background beneath the video frames, and this root
    // is NOT a stacking-context-establishing element (position: relative
    // with no z-index of its own) - if it had an opaque background AND the
    // video used a negative z-index, the video would paint behind this
    // element's own background layer instead of just behind its sibling
    // content, hiding it entirely regardless of DOM order. Keeping this
    // root transparent sidesteps that failure mode rather than fighting it
    // with more z-index layering.
    <div ref={pageRef} className="min-h-screen text-ink-primary font-sans selection:bg-accent-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      <ScrollFrameStage scrollContainerRef={pageRef} />

      <div className="relative z-10">
        {/* No top nav bar by design — the hero and CTA sections carry their
            own "Get Started Free" buttons (both call onGetStarted), so
            removing the sticky header/logo/"Sign In" bar doesn't remove any
            way to reach the auth flow. */}
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
