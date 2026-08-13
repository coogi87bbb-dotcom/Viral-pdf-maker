# CLAUDE.md — Viral PDF Creator

## Project Overview

React 19 + Vite 6 + Express (`server.ts`, bundled to `dist/server.cjs`) + Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first — **no `tailwind.config.js` exists or should be added**; all tokens live in the `@theme` block in `src/index.css`) + Firebase (auth + Firestore, config committed at `firebase-applet-config.json`).

There is no router. Every "page" is a conditional JSX branch driven by component state in `src/App.tsx` (`appMode`, `viralTab`, `showLanding`, assorted modal booleans) — not separate route files. Keep that pattern; don't introduce a router as part of styling work.

## Design System

Source of truth: the `@theme` block at the top of `src/index.css`. Reference tokens from there (`bg-surface-1`, `font-display`, etc.) instead of hand-writing arbitrary hex values or Tailwind default-palette classes.

- **Identity**: dark "midnight navy + rose gold + violet/fuchsia" glassmorphism for the **Studio OS app chrome** (`accent-rosegold-*` tokens, mirrored by a bare `rosegold-*` ramp for spots still written as raw Tailwind shade classes — see the `@theme` comment in `src/index.css` before touching either; both must stay in sync or unprefixed `rosegold-500`-style classes silently resolve to nothing). It's a custom warm blush-copper metallic, deliberately not Tailwind's stock `rose-*`/`pink-*` swatches, chosen for a boutique-luxury feel over a flat gold accent. The **landing page** (`src/components/landing/**`) runs its own separate **"Editorial Luxury"** system — the two are allowed to diverge; don't force landing colors onto the app shell or vice versa. Evolve either intentionally — don't drift back to default Tailwind blue/indigo, and don't introduce a third unrelated palette without updating this file. See "Landing Page" below before touching anything under `src/components/landing/`.
- **Amber is still a live token** (`accent-amber-*`) — it's semantic now, not primary-brand: warning/caution states, and user-selectable content-theme options (teleprompter reading themes, mockup/visual-studio badge colors, résumé template accents) where "amber" is literally one of the choices a user picks. Don't reflexively convert amber you find in those contexts to rose gold — check whether it's a status color or a user-facing option value first.
- **Depth ladder**: `surface-0` (page) → `surface-1` (base card) → `surface-2` (elevated) → `surface-3` (floating/modal). Every panel should sit at an intentional depth, not all on one flat plane.
- **Typography**: a display/serif face for headings (Newsreader or Playfair Display — both already imported via `index.css`'s Google Fonts `@import`), Plus Jakarta Sans for body/UI chrome. Never use the same font for both. Tight tracking (`-0.03em`+) on large headings, generous line-height (`leading-[1.7]`) on body copy paragraphs.
- **Shadows**: never flat `shadow-md`/`shadow-2xl`. Use layered, color-tinted, low-opacity multi-stop shadows (rose-gold-tinted for primary Studio OS actions via `--shadow-glow-rosegold`, amber-tinted landing-page CTAs keep `--shadow-glow-amber`, violet-tinted for AI-context panels, neutral for structural chrome).
- **No pointer-reactive ambient backgrounds in Studio OS.** `Studio3DBackground.tsx` (the app shell's ambient canvas, mounted in `App.tsx` and `ScaledCanvasStage.tsx`) used to re-center its spotlight/grid/particles on the live mouse position; that made the whole background visibly shift on every mouse move, which read as janky rather than premium. It now drifts on a slow autonomous time-based path only — never wire pointer/mouse position back into it.
- **Shared primitives**: prefer `src/components/ui/Button.tsx`, `src/components/ui/ModalShell.tsx`, and `src/components/MotionPanel3D.tsx` (the app's de-facto shared card/panel wrapper, reused broadly) over hand-rolling a new className string per component.
- **`MotionPanel3D`'s `hoverTilt` prop matters — don't drop it when wrapping a full tool body.** It defaults to `true` (a `whileHover` 3D tilt/scale), which is correct for a small genuinely-hoverable card. Every place in `App.tsx` where it wraps an entire tool's full workspace (each `appMode` branch, each Viral OS tab, `PlatformCard.tsx`) passes `hoverTilt={false}` — without it, moving the mouse anywhere while using the tool continuously tilts the whole panel (reads as "the background is moving") and, because it's a live transform on the ancestor of every button inside, can make clicks land off their visual target. This was the real root cause behind repeated "GigScale / DigitalKitStudio buttons don't work" reports. New full-body tool wrappers must set `hoverTilt={false}` too.

## Landing Page (`src/components/landing/**`) — "Editorial Luxury"

The public marketing page is a separate design system from the Studio OS app chrome. It is **LogFlow AI** branded (a PERA INC product); the signed-in app still carries its own ViralOS/DocCraft naming, which is intentional and out of scope for landing work.

- **Colour zones, not one surface.** The page alternates full-bleed background zones — ink → bone → ink → copper → bone → ink → bone → ink footer — using the `--color-lf-*` tokens in `src/index.css`. Foreground colour flips per zone via the `lf-on-bone*` / `lf-on-ink*` pairs. Copper (`#c0754a`) is deliberately adjacent to the app's `accent-rosegold-500` so both read as one brand family.
- **Typography**: `--font-editorial` (Cormorant Garamond) for display, Plus Jakarta Sans for body, JetBrains Mono for the uppercase `001 /` index labels. Sizes come from the fluid `.lf-display` / `.lf-heading` / `.lf-figure` / `.lf-body` clamp() classes — they scale *down* on phones, not just up.
- **No cards, no glassmorphism.** Hierarchy is carried by type scale, weight and hairline rules (`.lf-rule`). `MotionPanel3D` is deliberately not used here. A 3-across card grid is the exact default-AI-slop pattern this page exists to avoid.
- **Every section differs from its neighbours** in zone colour, alignment (left / right / split / centred / full-bleed) and entrance animation. Entrances go through `<Reveal kind=...>`; anything inside the first viewport must pass `immediate` or its scroll trigger never fires and the content stays invisible.
- **`position: sticky` is load-bearing** — the hero's pinned video plate and the capabilities thesis column both depend on it. Never put `overflow-x: hidden` on an ancestor (it computes `overflow-y: auto`, creating a scrollport that silently breaks every sticky descendant). Use `overflow-x: clip`, which is what `LandingPage.tsx` and `index.html`'s `<body>` now do.
- **Hero video**: `ScrollFrameStage.tsx` scrubs a webp frame sequence with `ScrollTrigger`, pinned by CSS sticky rather than GSAP `pin` (pinning inserts a spacer + ancestor transform, which previously swallowed clicks). Two sequences ship — `frames-v2/` (100 frames, 1280px, ~3.2MB) and `frames-v2-sm/` (60 frames, 540px, ~560KB) — selected at runtime by `matchMedia('(max-width: 767px)')`. Frames were extracted with `ffmpeg` (not installed by default; `npm i ffmpeg-static --no-save`) from `.claude/Change_words_to_PERAINC_1080p_202608122058.mp4`. **The PERA INC wordmark burned into the footage's left-centre is intentional brand content** — the hero headline is bottom-anchored specifically to clear it, and the legibility scrim is capped at 42% height so it never washes over it. Don't "fix" either by re-centring the copy.
- **Savings figures are derived, not invented.** The 9 hrs/wk, $418/mo, 30 sec and 9 tools figures in `LandingStats.tsx` / `LandingMath.tsx` come from `src/components/RoiCalculator.tsx`'s own constants (`postsPerWeek * 1.8 * channels/4`, and the `SOFTWARE_STACK_TOOLS` list prices). If that model changes, update these to match — they carry a visible footnote claiming they come from it.

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

`src/data/themes.ts` (`STUDIO_THEMES`), `src/components/VisualSeparators.tsx`, and `src/utils/textCleaner.tsx` (`renderFormattedParagraph`, `convertDocDataToTypesetHtml`) define the visual design of **user-generated PDF documents** — a selectable product feature — not the app's own chrome. `textCleaner.tsx` is easy to miss since it's a `utils/` file, not `data/` or a component named for it, but `renderFormattedParagraph` renders straight into `PdfCanvas.tsx`'s page output (chapter paragraphs, "PROMPT XX" banners, numbered-step labels, tables), so it's part of the exported document, not app chrome. It already derives its badge/label colors from the document's own selected theme (`primaryColor`/`paperBgColor`, passed in from `PdfCanvas.tsx`) rather than a hardcoded color — keep it that way; a hardcoded app-brand color there would look mismatched against non-matching PDF themes. Don't conflate any of these with "the app": a request to restyle "the app" does not mean touching the PDF document theme/formatting system, and vice versa.

## AI Document Enhancement (`/api/ai/enhance-doc` in `server.ts`)

Takes the raw imported text (from `DocImporter.tsx`) and restructures it into the final `DocumentData` that gets rendered/exported as the PDF. The raw text sent to the model is capped (`rawText.slice(0, 200000)`) — this used to be capped at 15,000 characters, which silently dropped everything past roughly the first few pages of any longer import with no error or warning to the user. If this ever needs raising further, raise the cap, don't remove it (it's still a real backstop against a pathological paste), and keep the prompt's explicit "every fact/figure/detail from the source must appear in the output — this is a reformat, not a summary" instruction, which guards against the model condensing-away content even within the cap.

## Screenshot-Verify-Iterate Workflow

For any visual/UI change: serve the app (`npm run dev`, or via this environment's `run` skill), screenshot the affected surface, compare against the design system above, fix mismatches, re-screenshot. Minimum 2 comparison rounds per surface before considering a visual change done. This project has no Windows-style Puppeteer/`serve.mjs`/`screenshot.mjs` setup — use whatever screenshot/browser-automation capability is actually available in the working environment.

## Testing & Verification Commands

- `npm run test` — vitest, covers `auth-middleware.test.ts` and `server-utils.test.ts`.
- `npm run lint` — `tsc --noEmit`.

Run both after any change. Styling-only changes should produce zero regressions in either. For changes touching `PdfCanvas.tsx`, `Header.tsx`, `StudioControls.tsx`, or any modal, also manually exercise PDF export end-to-end (see load-bearing selectors above) and the browser's native print-to-PDF path.
