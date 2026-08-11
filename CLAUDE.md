# CLAUDE.md — Viral PDF Creator

## Project Overview

React 19 + Vite 6 + Express (`server.ts`, bundled to `dist/server.cjs`) + Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first — **no `tailwind.config.js` exists or should be added**; all tokens live in the `@theme` block in `src/index.css`) + Firebase (auth + Firestore, config committed at `firebase-applet-config.json`).

There is no router. Every "page" is a conditional JSX branch driven by component state in `src/App.tsx` (`appMode`, `viralTab`, `showLanding`, assorted modal booleans) — not separate route files. Keep that pattern; don't introduce a router as part of styling work.

## Design System

Source of truth: the `@theme` block at the top of `src/index.css`. Reference tokens from there (`bg-surface-1`, `font-display`, etc.) instead of hand-writing arbitrary hex values or Tailwind default-palette classes.

- **Identity**: dark "midnight navy + amber gold + violet/fuchsia" glassmorphism. Evolve this intentionally — don't drift back to default Tailwind blue/indigo, and don't introduce a second unrelated palette without updating this file.
- **Depth ladder**: `surface-0` (page) → `surface-1` (base card) → `surface-2` (elevated) → `surface-3` (floating/modal). Every panel should sit at an intentional depth, not all on one flat plane.
- **Typography**: a display/serif face for headings (Newsreader or Playfair Display — both already imported via `index.css`'s Google Fonts `@import`), Plus Jakarta Sans for body/UI chrome. Never use the same font for both. Tight tracking (`-0.03em`+) on large headings, generous line-height (`leading-[1.7]`) on body copy paragraphs.
- **Shadows**: never flat `shadow-md`/`shadow-2xl`. Use layered, color-tinted, low-opacity multi-stop shadows (amber-tinted for primary actions, violet-tinted for AI-context panels, neutral for structural chrome).
- **Shared primitives**: prefer `src/components/ui/Button.tsx`, `src/components/ui/ModalShell.tsx`, and `src/components/MotionPanel3D.tsx` (the app's de-facto shared card/panel wrapper, reused broadly) over hand-rolling a new className string per component.

## Anti-Generic Guardrails

These are hard rules for any frontend work in this repo, not just the initial redesign:

- Never use default Tailwind palette colors (`indigo-500`, `blue-600`, etc.) as a primary/brand color.
- Never flat, untinted shadows.
- Never the same font for headings and body text.
- Animate only `transform` and `opacity`. Never use `transition-all`.
- Every clickable/interactive element needs explicit `hover:`, `focus-visible:` (not bare `focus:`), and `active:` states.
- Use intentional, consistent spacing steps — don't scatter arbitrary one-off values.
- Before starting any new UI surface, commit to one specific, bold aesthetic direction rather than a timid generic middle ground — avoid default "AI slop" patterns (Inter/Roboto-only type, purple-gradient-on-white, predictable card grids with no point of view).

## Load-Bearing Selectors — Do Not Rename or Remove

These are functional dependencies, not styling hooks. Renaming or removing any of them silently breaks a real feature:

- `.pdf-page` class and `#pdf-render-root` id in `src/components/PdfCanvas.tsx` — `src/utils/pdfExport.ts` does `querySelectorAll('.pdf-page')` for PDF export.
- `.teleprompter-segment` class in `src/components/TeleprompterStudio.tsx` — used via `querySelectorAll` for scroll-position tracking.
- `id="app-header"` (`Header.tsx`), `id="studio-controls-bar"` (`StudioControls.tsx`), `id="doc-importer-modal"` (`DocImporter.tsx`), `id="ai-enhancer-modal"` (`AiEnhancerModal.tsx`), `id="export-pdf-modal"` (`ExportModal.tsx`) — all referenced by the `@media print` block in `src/index.css`, which hides them during the browser's native print-to-PDF flow.
- `localStorage` keys read/written inline in JSX handlers: `viralos_saved_hooks` (`HookStudio.tsx`), `viralos_favorite_templates` and `viralos_custom_templates` (`TemplateLibrary.tsx`). The surrounding markup can be restyled freely; the key names and handler bodies must not change.

## html2canvas / OKLCH Color-Safety Rule

`src/utils/pdfExport.ts` contains a hand-written OKLCH→RGB sanitizer (`sanitizeClonedDocForHtml2Canvas`/`oklchToRgb`) that exists because Tailwind v4's default palette emits `oklch()` colors that `html2canvas` cannot parse. It's reused by `MockupGenerator.tsx` and `DigitalKitStudio.tsx`. **New color tokens/utilities must be authored as hex, `rgb()`, or `hsl()` — never `oklch()`, `color-mix()`, or `lab()`/`lch()`** — anywhere in a render tree that gets captured by `html2canvas` (`PdfCanvas.tsx`, `MockupGenerator.tsx`, `DigitalKitStudio.tsx`). New CSS color functions not covered by the existing sanitizer can silently break PDF/mockup export.

## Out-of-Scope Boundary

`src/data/themes.ts` (`STUDIO_THEMES`) and `src/components/VisualSeparators.tsx` define the visual design of **user-generated PDF documents** — a selectable product feature — not the app's own chrome. Don't conflate the two: a request to restyle "the app" does not mean touching the PDF document theme gallery, and vice versa.

## video-to-website Capability

The landing hero (`src/components/landing/ScrollFrameStage.tsx`, used by `LandingHero.tsx`) uses a scroll-driven, pinned crossfade experience (GSAP `ScrollTrigger` + Lenis smooth scroll + a canvas frame renderer), following the shape of the video-to-website skill's pattern but adapted to the assets actually available: there is no source video or extracted frame sequence, so the "frames" are two hand-picked JPEG keyframes (an exploded-parts view and a fully-assembled view) imported from `src/assets/landing/` via Vite's native ES image import and crossfaded on a `<canvas>` based on scroll progress — not `ffmpeg`-extracted frames served from `public/` (no `public/` directory exists in this repo). `gsap` and `lenis` are runtime npm dependencies. If a future page needs a true video-frame-sequence version of this treatment, extract frames with `ffmpeg` into `src/assets/<page>/` (or `public/` if the sequence is large enough to want out-of-bundle static serving) and swap `ScrollFrameStage`'s two-image crossfade for a frame-index draw keyed off the same `ScrollTrigger` progress — the pin/scrub/Lenis wiring stays the same.

## Screenshot-Verify-Iterate Workflow

For any visual/UI change: serve the app (`npm run dev`, or via this environment's `run` skill), screenshot the affected surface, compare against the design system above, fix mismatches, re-screenshot. Minimum 2 comparison rounds per surface before considering a visual change done. This project has no Windows-style Puppeteer/`serve.mjs`/`screenshot.mjs` setup — use whatever screenshot/browser-automation capability is actually available in the working environment.

## Testing & Verification Commands

- `npm run test` — vitest, covers `auth-middleware.test.ts` and `server-utils.test.ts`.
- `npm run lint` — `tsc --noEmit`.

Run both after any change. Styling-only changes should produce zero regressions in either. For changes touching `PdfCanvas.tsx`, `Header.tsx`, `StudioControls.tsx`, or any modal, also manually exercise PDF export end-to-end (see load-bearing selectors above) and the browser's native print-to-PDF path.
