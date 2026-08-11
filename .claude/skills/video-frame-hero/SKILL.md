---
name: video-frame-hero
description: Build a scroll-driven, video-frame-sequence hero/section in this app (GSAP ScrollTrigger + Lenis + a canvas frame renderer, frames extracted from a source video via ffmpeg). Use this when asked to add another video-scrubbed or scroll-scrubbed animated section to the Viral PDF Creator frontend, following the same pattern as the landing page hero.
---

# Video-Frame Scroll Hero

This repo's landing hero (`src/components/landing/ScrollFrameStage.tsx`, used by `LandingHero.tsx`) uses a scroll-driven, pinned frame-scrub experience (GSAP `ScrollTrigger` + Lenis smooth scroll + a canvas frame renderer) driven by a real video frame sequence: 72 frames extracted at 12fps from the 6s source clip via `ffmpeg`, with the studio backdrop color-keyed to transparent so the app's own dark gradient/ambient blobs show through instead of a flat white box:

```
ffmpeg -i source.mp4 -vf "fps=12,colorkey=0xE3E3E3:0.15:0.06,format=rgba,scale=720:-1" \
  -c:v libwebp -quality 80 -lossless 0 src/assets/landing/frames/frame_%04d.webp
```

into `src/assets/landing/frames/`, pulled in eagerly via `import.meta.glob('../../assets/landing/frames/*.webp', { eager: true, import: 'default' })` and sorted by filename so array index matches playback order. `ScrollTrigger`'s `onUpdate` progress (0..1) indexes directly into the frame array (`Math.floor(progress * (frames.length - 1))`) and draws that single frame "contain"-fit onto the canvas — no crossfade needed since the source video already animates frame-to-frame.

**Color-keying a plain studio background to transparent**: sample the actual background RGB first (it's rarely pure `0xFFFFFF` — this source measured ~`0xE3E3E3`, a light gray with grain texture) with a quick Python/Pillow pixel sample of a few corner points, then test the `colorkey` value/similarity/blend on 1-2 representative frames (composite the keyed PNG over a solid color matching the app's actual background — `0x080B11` here — and view it) before committing to the full sequence. Watch for two failure modes: similarity too low leaves a visible fringe of the original background color at edges; similarity too high eats into any part of the subject that's colorimetrically close to the backdrop (e.g. light gray/white subject highlights) — there's no universal safe threshold, it depends on how separated the subject's tonal range is from the backdrop in the specific footage. `format=rgba` must come after `colorkey` in the filter chain, and the webp encode needs `-lossless 0` (still allows alpha) — alpha roughly doubles per-frame size vs. an opaque encode, so drop the fps to keep total payload in the same ballpark (this went 24fps/144 frames/~19MB opaque-equivalent down to 12fps/72 frames/~9.6MB with alpha).

`ffmpeg` is a build/asset-prep-time dependency only (not a runtime one); `gsap` and `lenis` are runtime npm dependencies already installed in this project.

Frames are bundled from `src/assets/` (Vite-fingerprinted, ~9.6MB total across 72 files as separate static assets, not inlined into the JS bundle) rather than served from `public/` (no `public/` directory exists in this repo) — for a much longer/larger future sequence where that payload matters more, switching to `public/` plus a plain `<img>`-URL array (skipping the bundler's hashing/import step) is the natural escape hatch.

## Pattern to follow for a new video-scrubbed section

1. Extract frames with `ffmpeg` into `src/assets/<page>/frames/` — pick fps/scale based on source length (short clips: original fps, cap ~300 frames; longer clips: 10-15fps; halve the fps target again if adding alpha/color-keying, since alpha roughly doubles per-frame size).
2. If the source has a plain/studio background that should be removed: sample its actual RGB, test `colorkey` similarity/blend on a couple of representative frames composited over the real target background color, then apply to the full sequence once it looks clean (see above).
3. Glob-import the frame sequence eagerly, sorted by filename.
4. Index the frame array by `ScrollTrigger` progress (0..1) and draw to a `<canvas>`, "contain"-fit and centered.
5. Reuse the same pin/scrub/Lenis wiring as `ScrollFrameStage.tsx` — trigger the pin off a normal-flow ancestor with real intrinsic height (not the canvas layer's own absolutely-positioned wrapper), skip Lenis on touch devices, and respect `prefers-reduced-motion` (see `src/hooks/useReducedMotion.ts`) with a static fallback frame instead of the scroll machinery.

See CLAUDE.md's "Load-Bearing Selectors" and "html2canvas / OKLCH Color-Safety Rule" sections for constraints that also apply to any new frontend work in this repo.
