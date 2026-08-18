---
name: skill-builder
description: Use when someone asks to create a new Claude Code skill, audit/optimize an existing one, or check whether a skill already covers a task.
---

Authored from the user's own "skill builder" methodology doc — this skill teaches how to build and audit Claude Code skills, so it models the conventions it describes.

## Key Concepts

A skill is a reusable set of instructions that tells Claude Code how to handle a specific task — a standard operating procedure, stored at `.claude/skills/[skill-name]/SKILL.md`, invokable via slash command or natural-language description.

**How skills load:** the project's `CLAUDE.md` loads every conversation; skill *descriptions* are always available so Claude knows what's possible; full skill *content* only loads once a skill is actually invoked. Keep that distinction in mind when writing a description — it's the only part loaded by default, so it has to be enough on its own for Claude to know when to reach for the skill.

## Building a New Skill: the Discovery Interview

Before implementing, work through six rounds with the requester, in order. Don't re-ask what they've already told you.

1. **Goal & Name** — What problem does this solve? Pick a memorable command name: lowercase, hyphens, max 64 characters.
2. **Trigger** — What natural-language phrases should invoke it? Is it user-only or auto-invocable? Does it take arguments?
3. **Step-by-Step Process** — The exact workflow from trigger to output. Note any steps that delegate to a subagent.
4. **Inputs, Outputs & Dependencies** — What data does it need? Where do results go? Any external tools/APIs required?
5. **Guardrails & Edge Cases** — Failure modes, cost concerns, ordering constraints.
6. **Confirmation** — Summarize your understanding and confirm alignment before building.

## Build Phase

**Step 1 — Choose skill type.** Task skill (step-by-step instructions for a specific action) or reference skill (knowledge Claude applies without performing an action).

**Step 2 — Configure frontmatter.** Required: `name`, `description`. Add these only when actually needed — don't add frontmatter just because you can:

| Field | When to add it |
|---|---|
| `disable-model-invocation: true` | The skill has side effects and should only run when explicitly asked for |
| `argument-hint` | The skill takes an argument (shown to the user as a hint) |
| `context: fork` | The skill is self-contained and should run in its own context |
| `model` | The skill needs a specific model's capabilities |
| `allowed-tools` | The skill should be restricted to a specific tool set |

**Step 3 — Write skill content.** Task skills follow this structure:
- **Context** — files, APIs, reference material the skill needs
- **Step-by-step workflow** — numbered, specific instructions
- **Output format** — templates, file paths, structured formats
- **Notes** — edge cases, constraints, delegations

Keep it under 500 lines; move detailed material into supporting files alongside `SKILL.md`.

**Step 4 — Supporting files.** Split out anything that would bloat the main file (reference docs, scripts, templates) into the skill's own folder.

**Step 5 — Document in CLAUDE.md.** Add an entry for the new skill to the project's `CLAUDE.md` so it's discoverable outside the skill-description index too.

**Step 6 — Test.** Exercise both natural-language and direct invocation, including edge cases.

## Complete Example

A minimal working task skill — summarizes meeting notes into attendees, decisions, action items, and open questions:

```markdown
---
name: meeting-notes
description: Use when someone asks to summarize meeting notes, recap a meeting, or format meeting minutes.
argument-hint: [topic or date]
---

## What This Skill Does

Takes raw meeting notes and produces a structured summary with action items.

## Steps

1. Ask the user to paste their raw meeting notes (or provide a file path).
2. Extract the following from the notes:
   - **Attendees** -- Who was in the meeting
   - **Key decisions** -- What was decided
   - **Action items** -- Who owes what, with deadlines if mentioned
   - **Open questions** -- Anything unresolved
3. Format the output using the template below.
4. If $ARGUMENTS is provided, use it as the meeting title. Otherwise, infer a title from the content.

## Output Template

# Meeting: [title]
**Date:** [date if mentioned, otherwise "Not specified"]
**Attendees:** [comma-separated list]

## Key Decisions
- [decision]

## Action Items
- [ ] [person]: [task] (due: [date or "TBD"])

## Open Questions
- [question]

## Notes

- Keep summaries concise. Don't add commentary or embellish.
- If notes are too vague to extract action items, flag that to the user instead of making them up.
```

## Auditing an Existing Skill

Check all four areas before calling a skill done or optimized:

- **Frontmatter** — are all necessary fields set, and nothing unnecessary added?
- **Content** — clear step-by-step workflow, clear output format, specific (not vague) instructions?
- **Integration** — documented in `CLAUDE.md`, supporting-file references correct, credentials handled securely?
- **Quality** — clear, actionable, delegates to subagents where that's appropriate?

## Recommended Conventions

- Store skills at `.claude/skills/[skill-name]/SKILL.md`.
- Route outputs to predictable locations (e.g. `output/[skill-name]/`).
- Never hardcode API keys — use environment variables.
- Document every skill in `CLAUDE.md`.
- Standardize the description phrasing: *"Use when someone asks to [action], [action], or [action]."*

## Critical Guidance

- Always read existing skills before optimizing one.
- Check whether a similar skill already exists before building a new one.
- Consult the reference documentation for advanced patterns (subagent execution, hooks, permissions) before reaching for them.
