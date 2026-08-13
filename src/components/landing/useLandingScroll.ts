import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Page-level smooth scroll for the landing page.
 *
 * Lenis used to be owned by ScrollFrameStage, which conflated "render the
 * video" with "how the whole page scrolls". It lives here instead so exactly
 * one owner drives it and every ScrollTrigger on the page (the frame scrub
 * AND every <Reveal>) reads from the same synchronised scroll position.
 *
 * Skipped entirely on touch devices — momentum scrolling is already native
 * there and hijacking it fights the OS — and under prefers-reduced-motion.
 */
export function useLandingScroll(): void {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typeof window === 'undefined') return;

    const pointerQuery = window.matchMedia('(pointer: coarse)');
    let lenis: import('lenis').default | undefined;
    let rafId = 0;
    let cancelled = false;

    // Dynamic import keeps Lenis out of the bundle path for touch visitors,
    // who never instantiate it.
    if (!pointerQuery.matches) {
      import('lenis').then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({ duration: 1.2, lerp: 0.1, smoothWheel: true, syncTouch: false });
        const raf = (time: number) => {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
        lenis.on('scroll', ScrollTrigger.update);
      });
    }

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [prefersReducedMotion]);
}

export default useLandingScroll;
