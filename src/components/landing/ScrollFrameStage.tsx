import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Scroll-scrubbed video-frame stage for the LogFlow AI hero.
 *
 * Source: .claude/Change_words_to_PERAINC_1080p_202608122058.mp4 — 10s,
 * 1920x1080, 24fps. Extracted with ffmpeg into two opaque webp sequences:
 *   desktop  fps=10, scale=1280  -> 100 frames, ~3.2MB
 *   mobile   fps=6,  scale=540   ->  60 frames, ~560KB
 * No colour-key this time: unlike the previous clip's light studio backdrop,
 * this footage is already dark, and the PERA INC wordmark burned into the
 * left of the frame is intentional brand content that must stay visible — so
 * the plate is composited whole, "contain"-fit, never cropped.
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

interface ScrollFrameStageProps {
  /** Hero content overlaid on the pinned plate. */
  children?: React.ReactNode;
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

/**
 * "Contain" fit geometry. `yBias` places the plate vertically: 0.5 centres it
 * (desktop, where 16:9 nearly fills the viewport), lower values push it up so
 * a tall phone viewport keeps the lower half free for the headline instead of
 * stranding a letterboxed strip in the middle of the screen.
 */
function fitContain(imgW: number, imgH: number, cw: number, ch: number, yBias: number) {
  const scale = Math.min(cw / imgW, ch / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  return { dx: (cw - dw) / 2, dy: (ch - dh) * yBias, dw, dh };
}

export const ScrollFrameStage: React.FC<ScrollFrameStageProps> = ({ children }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
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

    const index = Math.min(Math.floor(progress * (frames.length - 1)), frames.length - 1);
    const frame = frames[index];
    if (!frame) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const geom = fitContain(frame.naturalWidth, frame.naturalHeight, cw, ch, isMobile ? 0.24 : 0.34);
    ctx.drawImage(frame, geom.dx, geom.dy, geom.dw, geom.dh);

    // Feather the plate's own top and bottom edges into the ink page. The
    // footage's studio backdrop is mid-grey, so a "contain" fit otherwise
    // leaves two hard horizontal seams where the plate meets the page —
    // most obvious on mobile, where the letterboxing is deep. Done on the
    // canvas rather than with a DOM overlay so the fade tracks the plate's
    // actual drawn rect at any viewport or vertical bias.
    const fade = Math.min(geom.dh * 0.16, 130);
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
  // decodes rather than waiting on the whole sequence, so the hero shows a
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

  // Scrub frames across this section only.
  //
  // Uses CSS `sticky` for the pin rather than ScrollTrigger's own `pin`:
  // pinning inserts a spacer and puts a transform on an ancestor, which
  // changes the containing block for descendants and previously swallowed
  // clicks on content below the hero. Sticky has neither side effect.
  useEffect(() => {
    if (!ready || !sectionRef.current) return;

    if (prefersReducedMotion) {
      drawFrame(0.55);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        drawFrame(self.progress);
      },
    });

    return () => st.kill();
  }, [ready, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-lf-ink h-[210vh] md:h-[300vh]"
      aria-label="LogFlow AI introduction"
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        {/* Bottom-up scrim for headline legibility. Kept deliberately short
            (bottom ~42%) so it never washes over the PERA INC wordmark burned
            into the footage at roughly 45-58% of frame height — that mark is
            intentional brand content and has to stay legible. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              'linear-gradient(to top, #0a0b0d 18%, rgba(10,11,13,0.9) 52%, rgba(10,11,13,0) 100%)',
          }}
        />

        {children}
      </div>
    </section>
  );
};

export default ScrollFrameStage;
