#!/usr/bin/env bash
# Extracts the landing-page hero's webp frame sequences from the source video.
#
# Pipeline (in this order, matters for quality):
#   1. delogo  — paints out the burned-in "PERA INC" wordmark (left-centre of the
#      source frame) by blending it into the surrounding gradient background.
#      Chosen over cropping the watermark out because the animation's explosion
#      pose reaches further left than the watermark's right edge in some frames —
#      a crop wide enough to clear the mark would clip the animation. delogo works
#      cleanly here because the background behind the mark is a smooth gradient,
#      not detailed texture.
#   2. crop    — horizontal-only tightening (full height kept) for a closer, less
#      "pulled back" framing. Horizontal-only because the exploded-parts pose
#      reaches close to the very top of the frame in several frames; a vertical
#      crop risks clipping it, but there's comfortable horizontal margin on both
#      sides throughout the whole clip.
#   3. curves  — dims the source's lit studio backdrop so it recedes toward
#      the page's ink background (--color-lf-ink: #0a0b0d) instead of reading
#      as a visible gray box. Measured directly against source pixels: the
#      backdrop is a real lighting gradient, not a flat/keyable color — dark
#      on the right (~RGB 10-20, already close to ink) but a distinct
#      mid-gray on the left (~RGB 70-105, the part that actually read as
#      "gray" against the page). A hard chromakey was ruled out: the subject
#      itself is a dark/near-black metallic figure in a similar luminance
#      range to the backdrop, so a similarity-based key risked eating into it
#      too. Two earlier, progressively gentler versions of this curve were
#      both reported as "too dark" overall (not just the background fixed):
#        v1 (0/0 -> 0.43/0.02 -> 1/1): crushed backdrop 70-97 -> 0-3,
#           subject shadow 25-34 -> 0-1 (erased almost entirely).
#        v2 (0/0 -> 0.3/0.13 -> 0.6/0.45 -> 1/1): backdrop 70-97 -> 28-52,
#           subject shadow 25-34 -> 7-10 (still crushed most of the way).
#      This third, much subtler curve (0/0 -> 0.4/0.28 -> 1/1) only dims
#      the backdrop to roughly 60-65% of its original brightness (verified:
#      ~70-97 -> ~44-66) and leaves subject shadow mostly intact
#      (~25-34 -> ~14-20, closer to half rather than near-zero). Bright
#      content (the cyan UI screens, ~250+) still essentially untouched.
#      Placed after delogo+crop (not before) so delogo's own blend-into-
#      surrounding-gradient logic still operates on the original graded
#      footage it was tuned against.
#   4. fps + scale — unchanged cadence/target size from the original extraction.
#
# Re-run with --preview first after changing any of the constants below to sanity
# check the crop against a few representative frames before regenerating the full
# ~160-frame sequence.
set -euo pipefail

cd "$(dirname "$0")/.."

SRC=".claude/Change_words_to_PERAINC_1080p_202608122058.mp4"
OUT_DESKTOP="src/assets/landing/frames-v2"
OUT_MOBILE="src/assets/landing/frames-v2-sm"

# --- delogo box (source 1920x1080 px) ---------------------------------------
# Measured against frame 0 of the source clip; generous padding on all sides
# since delogo blends into a flat gradient and doesn't need to be pixel-tight.
DELOGO="x=95:y=515:w=680:h=145:show=0"

# --- horizontal-only crop (source 1920x1080 px) ------------------------------
# 1400x1080 centered (260px trimmed off each side) — the tightest crop that
# still leaves comfortable margin on the widest pose in the clip (the
# blurred trailing arm during the explosion beat). Runtime fit is "contain"
# (see ScrollFrameStage.tsx's fitContain), which never crops further — this
# source crop is what actually makes the framing feel close, since contain
# fit alone only avoids cropping, it doesn't zoom in on its own.
CROP="1400:1080:260:0"

# --- background crush (see rationale above) ----------------------------------
BG_CRUSH="curves=all='0/0 0.4/0.28 1/1'"

FFMPEG_BIN="$(node -e "console.log(require('ffmpeg-static'))" 2>/dev/null || true)"
if [ -z "$FFMPEG_BIN" ] || [ ! -x "$FFMPEG_BIN" ]; then
  echo "ffmpeg-static not found — installing (dev-only, not saved to package.json)..."
  npm i ffmpeg-static --no-save
  FFMPEG_BIN="$(node -e "console.log(require('ffmpeg-static'))")"
fi

if [ ! -f "$SRC" ]; then
  echo "Source video not found at $SRC" >&2
  exit 1
fi

FILTER_BASE="delogo=${DELOGO},crop=${CROP},${BG_CRUSH}"

if [ "${1:-}" = "--preview" ]; then
  PREVIEW_DIR="$(mktemp -d)"
  echo "Extracting 3 preview frames (start / mid / end) to $PREVIEW_DIR ..."
  "$FFMPEG_BIN" -y -i "$SRC" \
    -vf "select='eq(n\,0)+eq(n\,120)+eq(n\,150)',${FILTER_BASE}" -vsync 0 \
    "$PREVIEW_DIR/preview_%d.png"
  echo "Preview frames written to $PREVIEW_DIR — inspect before running the full extraction:"
  ls "$PREVIEW_DIR"
  exit 0
fi

echo "Extracting desktop sequence (fps=10, scale=1280) -> $OUT_DESKTOP ..."
rm -f "$OUT_DESKTOP"/frame_*.webp
"$FFMPEG_BIN" -y -i "$SRC" \
  -vf "${FILTER_BASE},fps=10,scale=1280:-1" \
  -c:v libwebp -quality 82 -lossless 0 \
  "$OUT_DESKTOP/frame_%04d.webp"

echo "Extracting mobile sequence (fps=6, scale=540) -> $OUT_MOBILE ..."
rm -f "$OUT_MOBILE"/frame_*.webp
"$FFMPEG_BIN" -y -i "$SRC" \
  -vf "${FILTER_BASE},fps=6,scale=540:-1" \
  -c:v libwebp -quality 82 -lossless 0 \
  "$OUT_MOBILE/frame_%04d.webp"

echo "Done. $(ls "$OUT_DESKTOP" | wc -l) desktop frames, $(ls "$OUT_MOBILE" | wc -l) mobile frames."
