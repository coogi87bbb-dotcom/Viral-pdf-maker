import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Real video-frame sequence: 144 frames extracted at the source video's
// native 24fps/6s length via ffmpeg (`fps=24,scale=720:-1`, webp q80) into
// src/assets/landing/frames/. import.meta.glob pulls every frame in as a
// Vite-fingerprinted URL, eagerly (this hero needs them all before the
// scroll-scrub can start), sorted by filename so index order matches
// playback order (frame_0001.webp, frame_0002.webp, ...).
const frameModules = import.meta.glob<string>('../../assets/landing/frames/*.webp', {
  eager: true,
  import: 'default',
});
const FRAME_URLS = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key]);

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Scroll "feel" tuning — a single source of truth
//
// The hero's scroll-to-progress mapping is intentionally ~40% slower/heavier
// than a naive 1:1 pin. Both the pinned scroll-track length and Lenis's own
// smoothing derive from this one constant so they can't drift out of sync or
// hide magic numbers in two places.
//   1.0 = baseline (no slowdown)
//   1.4 = 40% slower (baseline * (1 + 0.4))
const SCROLL_SLOWDOWN_FACTOR = 1.4;

// Baseline pin scroll-track distance, in vh, for a "normal-speed" 0->1
// progress traversal. Stretched by SCROLL_SLOWDOWN_FACTOR so the visitor has
// to scroll ~40% further for the same visual progress: 150vh -> 210vh.
const BASE_PIN_DISTANCE_VH = 150;
const PIN_DISTANCE_VH = BASE_PIN_DISTANCE_VH * SCROLL_SLOWDOWN_FACTOR;

// Lenis baseline duration (1.2s) / lerp (0.1) scaled the same way: longer
// duration + lower lerp both read as a heavier, laggier catch-up per frame.
const LENIS_DURATION = 1.2 * SCROLL_SLOWDOWN_FACTOR; // 1.68s
const LENIS_LERP = 0.1 / SCROLL_SLOWDOWN_FACTOR; // ~0.071

interface ScrollFrameStageProps {
  className?: string;
  /**
   * The element GSAP should pin — must be a normal-flow ancestor with a real
   * intrinsic height (e.g. the parent hero `<section className="h-[100vh]">`),
   * NOT this component's own root, which is deliberately `position: absolute`
   * so it can sit as a full-bleed decorative layer behind the headline. An
   * absolutely-positioned element has no intrinsic height for GSAP's
   * pin-spacer to measure (it collapses to 0), and pinning only this inner
   * layer would leave sibling content like the headline unpinned — so the
   * trigger must live one level up, owned by the parent.
   */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** 0..1 scroll progress through the pinned hero, for the parent to drive headline parallax off the same source of truth. */
  onProgress?: (progress: number) => void;
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

/** Centered, aspect-ratio-preserving ("contain") fit geometry for drawImage. */
function fitContain(imgW: number, imgH: number, cw: number, ch: number) {
  const scale = Math.min(cw / imgW, ch / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  return { dx: (cw - dw) / 2, dy: (ch - dh) / 2, dw, dh };
}

export const ScrollFrameStage: React.FC<ScrollFrameStageProps> = ({ className = '', triggerRef, onProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Draws whichever frame corresponds to the current scroll progress,
  // aspect-fit "contain" and centered. No crossfade needed — the video
  // itself already animates between states frame-to-frame.
  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const index = Math.min(Math.floor(progress * (frames.length - 1)), frames.length - 1);
    const frame = frames[index];
    if (!frame) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    const geom = fitContain(frame.naturalWidth, frame.naturalHeight, cw, ch);
    ctx.drawImage(frame, geom.dx, geom.dy, geom.dw, geom.dh);
  };

  // Preload the full frame sequence before wiring any scroll machinery, so
  // nothing ever draws a half-decoded frame. The sequence is short (144
  // frames / ~9MB for the current 6s source clip) so a single Promise.all
  // is simpler than a two-phase "first N, then background-load the rest"
  // loader and the wait is still well under a second on a real connection.
  useEffect(() => {
    let cancelled = false;
    Promise.all(FRAME_URLS.map(loadImage))
      .then((frames) => {
        if (cancelled) return;
        framesRef.current = frames;
        setReady(true);
      })
      .catch(() => {
        // If decoding fails, leave `ready` false — the dark gradient
        // background still renders behind the (blank) canvas.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Canvas sizing, kept DPI-sharp via a ResizeObserver on its own element
  // (Studio3DBackground.tsx's canvas doesn't scale for devicePixelRatio;
  // this one deliberately does, since these are static photographic images
  // where blur from a 1x backing buffer would be obvious).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      drawFrame(progressRef.current);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // GSAP ScrollTrigger (pin + scrub) + Lenis (smooth momentum scroll).
  useEffect(() => {
    if (!ready || !triggerRef.current) return;

    if (prefersReducedMotion) {
      // Static fallback: show the fully assembled frame, no pin, no
      // parallax-driving scroll machinery at all.
      drawFrame(1);
      onProgress?.(1);
      return;
    }

    // Lenis's wheel-momentum smoothing is tuned for mouse/trackpad input; on
    // touch it either fights native momentum scrolling or does nothing
    // useful, and is a well-known source of jank. So: skip Lenis on touch
    // devices, but still pin via ScrollTrigger off native scroll physics —
    // the crossfade still works correctly, just without the "heavy" feel.
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    let lenis: Lenis | undefined;
    let rafId = 0;

    if (!isTouch) {
      lenis = new Lenis({
        duration: LENIS_DURATION,
        lerp: LENIS_LERP,
        smoothWheel: true,
        syncTouch: false,
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);
    }

    // `end: '+=${PIN_DISTANCE_VH}%'` is relative to the *trigger's own*
    // height (this section is 100vh), so this literally reads as "stay
    // pinned for an additional 2.1x viewport-heights of scrolling" — a
    // common ScrollTrigger footgun worth spelling out here.
    const st = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: 'top top',
      end: `+=${PIN_DISTANCE_VH}%`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        drawFrame(self.progress);
        onProgress?.(self.progress);
      },
    });

    return () => {
      st.kill();
      if (lenis) {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      }
    };
  }, [ready, prefersReducedMotion, onProgress, triggerRef]);

  return (
    <div
      className={className}
      style={{ background: 'linear-gradient(160deg, #080b11 0%, #0d1017 55%, #11141c 100%)' }}
    >
      {/* Ambient color blobs, reusing the existing hero's technique — violet
          + amber, the app's brand palette. */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute top-10 -right-24 h-[26rem] w-[26rem] rounded-full bg-amber-500/15 blur-[110px]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

export default ScrollFrameStage;
