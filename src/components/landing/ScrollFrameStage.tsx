import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Real video-frame sequence: 72 frames extracted at 12fps from the 6s
// source video via ffmpeg, with the studio backdrop color-keyed to
// transparent so the app's own dark gradient/blobs show through instead of
// a flat white box (`fps=12,colorkey=0xE3E3E3:0.15:0.06,format=rgba,
// scale=720:-1`, webp q80 — alpha roughly doubles per-frame cost vs an
// opaque encode, so fps is halved from a first 24fps pass to keep total
// payload in the same ~9-10MB ballpark) into src/assets/landing/frames/.
// import.meta.glob pulls every frame in as a Vite-fingerprinted URL,
// eagerly (this hero needs them all before the scroll-scrub can start),
// sorted by filename so index order matches playback order
// (frame_0001.webp, frame_0002.webp, ...).
const frameModules = import.meta.glob<string>('../../assets/landing/frames/*.webp', {
  eager: true,
  import: 'default',
});
const FRAME_URLS = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key]);

gsap.registerPlugin(ScrollTrigger);

// Lenis smoothing tuning — same "heavier than default" feel as before, now
// applied to the whole page's scroll rather than just a pinned hero range.
const LENIS_DURATION = 1.2;
const LENIS_LERP = 0.1;

interface ScrollFrameStageProps {
  className?: string;
  /**
   * The scrollable page container whose full height drives frame playback
   * (0 progress at its top, 1 at its bottom) — NOT pinned. The canvas
   * itself is `position: fixed`, so it stays put as a full-viewport
   * backdrop for the entire page scroll; content scrolls normally on top
   * of it. Deliberately not a GSAP pin: pinning inserts a spacer and can
   * put a transform on an ancestor, which changes fixed-position's
   * containing block and can swallow clicks on content rendered after it
   * in the DOM — a real bug the previous hero-only pin implementation hit.
   */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** 0..1 scroll progress through the whole page, for callers that want to sync other effects off the same source of truth. */
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

export const ScrollFrameStage: React.FC<ScrollFrameStageProps> = ({ className = '', scrollContainerRef, onProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Draws whichever frame corresponds to the current scroll progress,
  // aspect-fit "contain" and centered.
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
  // nothing ever draws a half-decoded frame.
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

  // Canvas sizing, kept DPI-sharp via a ResizeObserver on its own element.
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
    window.addEventListener('resize', resize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // GSAP ScrollTrigger (scrub, no pin) spanning the whole page + Lenis
  // (smooth momentum scroll for the whole page, not just a hero range).
  useEffect(() => {
    if (!ready || !scrollContainerRef.current) return;

    if (prefersReducedMotion) {
      // Static fallback: show the final frame, no scroll machinery at all.
      drawFrame(1);
      onProgress?.(1);
      return;
    }

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

    const st = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
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
  }, [ready, prefersReducedMotion, onProgress, scrollContainerRef]);

  return (
    <div
      className={`fixed inset-0 -z-10 pointer-events-none ${className}`}
      style={{ background: 'linear-gradient(160deg, #080b11 0%, #0d1017 55%, #11141c 100%)' }}
    >
      {/* Ambient color blobs, reusing the existing hero's technique — violet
          + amber, the app's brand palette. */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute top-10 -right-24 h-[26rem] w-[26rem] rounded-full bg-amber-500/15 blur-[110px]" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
};

export default ScrollFrameStage;
