import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Page-wide scroll-scrubbed video backdrop for the LogFlow AI landing page.
 *
 * This is a `position: fixed` full-viewport canvas that sits behind the
 * ENTIRE page — every section scrolls over it and is itself transparent.
 * Frame playback is driven by scroll progress through the whole page (0 at
 * the top, 1 at the bottom), so the clip plays once from top to bottom as
 * the visitor reads.
 *
 * Source: .claude/Change_words_to_PERAINC_1080p_202608122058.mp4 — 10s,
 * 1920x1080, 24fps. Extracted with ffmpeg into two opaque webp sequences:
 *   desktop  fps=10, scale=1280  -> 100 frames, ~3.2MB
 *   mobile   fps=6,  scale=540   ->  60 frames, ~560KB
 *
 * The plate renders at reduced opacity under a dark wash: at full strength
 * the footage (and the PERA INC wordmark burned into its left-centre) fights
 * the body copy that now sits over every part of it. Dimmed, the wordmark
 * ghosts through as intended brand texture and text stays legible anywhere
 * on the page.
 *
 * Fit is always "contain", never "cover" — cover would crop the PERA INC
 * wordmark out on portrait viewports, and that mark is deliberate content.
 *
 * Both globs are eager, but eager glob only materialises URL *strings*; no
 * image bytes are fetched until a URL is assigned to `new Image().src`. So
 * shipping both sequences costs a phone nothing beyond the URL list.
 */
const desktopModules = import.meta.glob<string>('../../assets/landing/frames-v2/*.webp', {
  eager: true,
  import: 'default',
});
const mobileModules = import.meta.glob<string>('../../assets/landing/frames-v2-sm/*.webp', {
  eager: true,
  import: 'default',
});

const toSortedUrls = (mods: Record<string, string>) =>
  Object.keys(mods)
    .sort()
    .map((key) => mods[key]);

const DESKTOP_FRAMES = toSortedUrls(desktopModules);
const MOBILE_FRAMES = toSortedUrls(mobileModules);

gsap.registerPlugin(ScrollTrigger);

const MOBILE_QUERY = '(max-width: 767px)';

/**
 * Frame playback runs 15% ahead of raw scroll progress, clamped at the end.
 * The clip therefore finishes slightly before the reader reaches the footer,
 * which keeps the disassembly feeling brisk rather than dragging out over the
 * page's full length. Raise to speed the clip up further; 1.0 is 1:1.
 */
const PLAYBACK_SPEED = 1.15;

interface ScrollFrameStageProps {
  /**
   * The scrollable page root whose full height drives playback (0 at its
   * top, 1 at its bottom). NOT pinned and NOT a GSAP `pin`: the canvas is
   * `position: fixed`, so it stays put on its own. A GSAP pin here would
   * insert a spacer and put a transform on an ancestor, which changes the
   * containing block for fixed descendants and can swallow clicks on the
   * content rendered over it.
   */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Centred, aspect-preserving ("contain") fit geometry. */
function fitContain(imgW: number, imgH: number, cw: number, ch: number) {
  const scale = Math.min(cw / imgW, ch / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  return { dx: (cw - dw) / 2, dy: (ch - dh) / 2, dw, dh };
}

export const ScrollFrameStage: React.FC<ScrollFrameStageProps> = ({ scrollContainerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Speed factor applied here (not at the ScrollTrigger) so resize redraws
    // and the reduced-motion still frame map through the same curve.
    const scaled = Math.min(progress * PLAYBACK_SPEED, 1);
    const index = Math.min(Math.floor(scaled * (frames.length - 1)), frames.length - 1);
    const frame = frames[index];
    if (!frame) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    const geom = fitContain(frame.naturalWidth, frame.naturalHeight, cw, ch);
    ctx.drawImage(frame, geom.dx, geom.dy, geom.dw, geom.dh);

    // Feather the plate's top and bottom edges into the page. The footage's
    // studio backdrop is mid-grey, so a "contain" fit otherwise leaves two
    // hard horizontal seams — most obvious on mobile, where letterboxing is
    // deep. Done on the canvas so the fade tracks the drawn rect at any
    // viewport rather than a fixed percentage of the screen.
    const fade = Math.min(geom.dh * 0.18, 150);
    if (fade > 2) {
      const top = ctx.createLinearGradient(0, geom.dy, 0, geom.dy + fade);
      top.addColorStop(0, '#0a0b0d');
      top.addColorStop(1, 'rgba(10,11,13,0)');
      ctx.fillStyle = top;
      ctx.fillRect(geom.dx, geom.dy, geom.dw, fade);

      const bottomStart = geom.dy + geom.dh - fade;
      const bottom = ctx.createLinearGradient(0, bottomStart, 0, geom.dy + geom.dh);
      bottom.addColorStop(0, 'rgba(10,11,13,0)');
      bottom.addColorStop(1, '#0a0b0d');
      ctx.fillStyle = bottom;
      ctx.fillRect(geom.dx, bottomStart, geom.dw, fade);
    }
  };

  // Load the sequence sized for this viewport. Frame 0 is drawn as soon as it
  // decodes rather than waiting on the whole sequence, so the page shows a
  // real image almost immediately instead of an empty box on slow connections.
  useEffect(() => {
    let cancelled = false;
    const urls = window.matchMedia(MOBILE_QUERY).matches ? MOBILE_FRAMES : DESKTOP_FRAMES;
    if (urls.length === 0) return;

    loadImage(urls[0])
      .then((first) => {
        if (cancelled) return;
        framesRef.current = [first];
        drawFrame(0);
        return Promise.all(urls.map(loadImage));
      })
      .then((frames) => {
        if (cancelled || !frames) return;
        framesRef.current = frames;
        setReady(true);
        drawFrame(progressRef.current);
      })
      .catch(() => {
        // Leave whatever decoded; the ink background still renders behind.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Canvas sizing. Width-only comparison on touch: mobile browsers fire
  // resize constantly as the URL bar collapses during scroll, and
  // reallocating a DPR-scaled backing store on every one of those events was
  // a real source of scroll jank.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frameId = 0;
    let lastW = 0;
    let lastH = 0;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    const apply = () => {
      frameId = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = canvas;
      if (clientWidth === 0 || clientHeight === 0) return;

      const widthUnchanged = clientWidth === lastW;
      const heightDelta = Math.abs(clientHeight - lastH);
      if (widthUnchanged && isCoarse && heightDelta < 120) {
        drawFrame(progressRef.current);
        return;
      }
      lastW = clientWidth;
      lastH = clientHeight;

      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      drawFrame(progressRef.current);
    };

    const schedule = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(apply);
    };

    apply();
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);
    window.addEventListener('resize', schedule);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Scrub across the whole page's scroll range.
  useEffect(() => {
    if (!ready || !scrollContainerRef.current) return;

    if (prefersReducedMotion) {
      drawFrame(0.5);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      // Higher scrub = the frame index eases toward the scroll position
      // instead of snapping to it, which smooths out wheel-notch stepping.
      scrub: 1.2,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        drawFrame(self.progress);
      },
    });

    return () => st.kill();
  }, [ready, prefersReducedMotion, scrollContainerRef]);

  return (
    // z-0 with DOM order, never a negative z-index: this is a fixed sibling
    // rendered before the page's z-10 content wrapper, so DOM order already
    // puts it behind. A negative z-index would drop it behind an ancestor's
    // background instead, hiding it entirely — which is also why the page
    // root must stay transparent and the ink base colour lives HERE.
    <div className="fixed inset-0 z-0 pointer-events-none bg-lf-ink" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-[0.72]" />

      {/* Wash over the plate, kept deliberately light. The footage is already
          dark (it averages ~rgb(48,54,57)), so it supplies most of its own
          contrast against bone type — an aggressive scrim on top of a low
          canvas opacity crushed it to near-black and threw the video away.
          Heavier at the edges than the centre so the frame keeps depth and
          the vignette carries the eye to the middle. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(125% 85% at 50% 45%, rgba(10,11,13,0.05) 0%, rgba(10,11,13,0.34) 58%, rgba(10,11,13,0.66) 100%)',
        }}
      />
    </div>
  );
};

export default ScrollFrameStage;
