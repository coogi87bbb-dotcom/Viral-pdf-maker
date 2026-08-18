# Skill Provenance

Manifest of every skill under `.claude/skills/` that was vendored from an external source or authored in this repo, so future updates/re-syncs have a clear origin. Skills not listed here predate this manifest.

## Authored in this repo

| Skill | Origin | License |
|---|---|---|
| `skill-builder` | Authored from the user's own Google Doc ("skill builder.skills/claudecode") describing their skill-building methodology | N/A (original) |

## Vendored from obra/superpowers

Source: https://github.com/obra/superpowers — MIT License, Copyright (c) 2025 Jesse Vincent.

`brainstorming`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `writing-plans`, `writing-skills`

## Vendored from nextlevelbuilder/ui-ux-pro-max-skill

Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — MIT License.

`ui-ux-pro-max` (only this skill was taken; the source repo also ships `design-system`, `design`, `slides`, `banner-design`, `ui-styling`, and `brand`, none of which were requested)

## Vendored from anthropics/skills

Source: https://github.com/anthropics/skills — official Anthropic repository. Each skill carries its own `LICENSE.txt`, and **licensing is not uniform across the repo** — most skills are MIT, but a subset carries Anthropic's proprietary Services terms instead. Check each skill's own `LICENSE.txt` before vendoring any more from this repo.

`algorithmic-art`, `brand-guidelines`, `canvas-design`, `claude-academy-guide`, `claude-api`, `discernment-nudge`, `doc-coauthoring`, `internal-comms`, `mcp-builder`, `slack-gif-creator`, `theme-factory`, `web-artifacts-builder`, `webapp-testing`

Not vendored:
- `frontend-design` — already present in this repo from a prior session (same origin, confirmed by identical content); only its missing `LICENSE.txt` was backfilled from here.
- `skill-creator` — overlaps with the hand-authored `skill-builder` above.
- **`docx`, `pdf`, `pptx`, `xlsx`** — initially copied, then **removed**: their `LICENSE.txt` is Anthropic's proprietary Services terms (© 2025 Anthropic, PBC), not MIT, and explicitly prohibits extracting, copying, retaining, or redistributing these materials outside Anthropic's own Services. Keeping them in this repo would violate that license. If document (Word/PDF/PowerPoint/Excel) handling is needed later, it has to come from a differently-licensed source, not this repo's `docx`/`pdf`/`pptx`/`xlsx` folders.

## Vendored from JCarterJohnson/vibecoded-design-tells

Source: https://github.com/JCarterJohnson/vibecoded-design-tells — MIT License, Copyright (c) 2026 Carter Johnson. Reddit-mined "AI tells" to avoid, across three domains.

- `unslop-ui` ← repo's `skill/`
- `unslop-text` ← repo's `unslop-ai-text/skill/`
- `unslop-code` ← repo's `unslop-ai-code/skill/`

Only each skill's own folder was taken — the repo's data-harvesting pipeline (`collect.py`, `harvest.py`, and similar, used to regenerate the underlying Reddit-mined dataset) was not vendored, as it's not needed at skill-use time.

## Vendored from Leonxlnx/taste-skill

Source: https://github.com/Leonxlnx/taste-skill — MIT License, Copyright (c) 2026 Leonxlnx.

`taste-skill`, `taste-skill-v1`, `gpt-tasteskill`, `image-to-code-skill`, `redesign-skill`, `soft-skill`, `minimalist-skill`, `brutalist-skill`, `output-skill`, `stitch-skill`, `brandkit`, `imagegen-frontend-web`, `imagegen-frontend-mobile`

All 13 sub-skills were taken; several overlap in purpose with `ui-ux-pro-max` and `frontend-design` above (per-user request, not an oversight).

## Vendored from vercel-labs/skills

Source: https://github.com/vercel-labs/skills — the "Skills CLI" installer tool itself (not primarily a skill bundle); only its one internal skill was taken.

`find-skills`
