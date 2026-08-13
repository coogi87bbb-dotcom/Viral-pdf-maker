import React, { useRef } from 'react';
import { LandingHero } from './LandingHero';
import { ScrollFrameStage } from './ScrollFrameStage';
import { LandingCost } from './LandingCost';
import { LandingMarquee } from './LandingMarquee';
import { LandingStats } from './LandingStats';
import { LandingCapabilities } from './LandingCapabilities';
import { LandingMath } from './LandingMath';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';
import { useLandingScroll } from './useLandingScroll';

interface LandingPageProps {
  onGetStarted: () => void;
}

/**
 * LogFlow AI landing page — "Editorial Luxury" over a page-wide video.
 *
 * The video plays once across the entire page scroll (ScrollFrameStage,
 * `position: fixed`), and EVERY section is transparent over it. There are no
 * solid section backgrounds: rhythm comes from alignment, entrance
 * animation, type scale and per-section scrim density instead of colour
 * blocks.
 *
 * Two layout constraints that are load-bearing, not cosmetic:
 * - This root must stay TRANSPARENT (no bg-*). The ink base colour lives on
 *   ScrollFrameStage's own fixed wrapper. An opaque background here would
 *   paint over the fixed canvas rendered behind it.
 * - overflow-x must be CLIP, not HIDDEN. `hidden` computes overflow-y to
 *   `auto`, making this a scroll container, which silently breaks every
 *   `position: sticky` descendant (it previously took out the capabilities
 *   thesis column).
 */
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const pageRef = useRef<HTMLDivElement>(null);
  useLandingScroll();

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-x-clip font-sans text-lf-on-ink selection:bg-lf-copper selection:text-lf-ink"
    >
      <ScrollFrameStage scrollContainerRef={pageRef} />

      <div className="relative z-10">
        <main>
          <LandingHero onGetStarted={onGetStarted} />
          <LandingCost />
          <LandingMarquee />
          <LandingStats />
          <LandingCapabilities />
          <LandingMath />
          <LandingCTA onGetStarted={onGetStarted} />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
};

export default LandingPage;
