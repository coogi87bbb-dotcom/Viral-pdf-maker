import React from 'react';
import { LandingHero } from './LandingHero';
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
 * LogFlow AI landing page — "Editorial Luxury".
 *
 * The page reads as alternating colour ZONES rather than one continuous
 * surface: ink hero -> bone -> ink marquee -> copper -> bone -> ink -> bone ->
 * ink footer. Each section also changes its alignment (left / right / split /
 * centred / full-bleed) and its entrance animation, so no two consecutive
 * sections are composed the same way.
 *
 * Unlike the previous implementation there is no page-wide fixed video
 * backdrop — the frame sequence is scoped to the hero (ScrollFrameStage),
 * which is what allows the solid bone/copper zones below it to exist at all.
 */
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  useLandingScroll();

  // Root uses overflow-x-CLIP, not -hidden. `hidden` computes overflow-y to
  // `auto`, which makes this element a scroll container and silently breaks
  // every `position: sticky` descendant — it took out both the hero's pinned
  // video plate and the capabilities thesis column, which simply scrolled
  // away. `clip` contains horizontal overflow without creating a scrollport.
  return (
    <div className="relative min-h-screen overflow-x-clip bg-lf-ink font-sans text-lf-on-ink selection:bg-lf-copper selection:text-lf-ink">
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
  );
};

export default LandingPage;
