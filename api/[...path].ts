// Vercel serverless entry point for the whole `/api/*` surface.
//
// Vercel's file-system routing maps any request under `/api/` to whichever
// function file matches — `[...path]` is Vercel's catch-all convention, so
// this one file (mapping to `/api/*`, one or more segments) handles every
// route server.ts defines (`/api/health`, `/api/docs/import`,
// `/api/ai/deal-closer-generate`, etc.) without duplicating any of that
// route logic here or needing a vercel.json rewrite.
//
// Before this file existed, Vercel's zero-config Vite detection only ever
// built and served the static `dist/` output — server.ts (and therefore
// every API route) was never executed in production, so every `/api/*`
// call hit Vercel's own platform 404 page no matter what env vars were set.
// Explicit .js extension is required, not stylistic: package.json has
// "type": "module", so Vercel's deployed function runs under Node's native
// ESM loader — unlike bundlers/TypeScript's own resolver, native ESM never
// guesses file extensions on relative specifiers. Without it this crashed
// every invocation with `ERR_MODULE_NOT_FOUND: Cannot find module
// '/var/task/server'` (confirmed via the real Vercel function logs) even
// though server.js sits right there — TS resolves this specifier against
// server.ts at type-check time (moduleResolution: "bundler" allows it) and
// still emits it as "../server.js" in the compiled output either way.
import app from '../server.js';

export default app;
