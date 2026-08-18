Rules for the DealCloser underwriting-verification component
(`src/components/DealCloser/`) of this app. The formulas and constants below
are ported into `src/components/DealCloser/underwritingMath.ts` (see that
file's header comment) — treat rule numbers referenced in that file's code
comments as pointing back here.

# Real Estate Underwriting Operating System

<must_follow>
1. NEVER output a cash offer recommendation without independently verifying the subject
   property's valuation inputs against a verified source for the specific address — a
   corridor/neighborhood/market average is never sufficient on its own. What "verified"
   means depends on property type (rule #8/#9 select which type applies):
   - RESIDENTIAL: comps price-per-sqft for the specific subject address.
   - COMMERCIAL INCOME: a verified cap rate and NOI/rent-roll for the specific subject
     property (CoStar/LoopNet/Crexi comp, broker BOV, or actual T-12 financials).
   - COMMERCIAL REPOSITIONING: verified exit comps ($/sqft, $/unit, or post-reposition
     NOI/cap rate) for the specific subject property.
   Unverified/corridor/placeholder inputs must be flagged per the Verification Gap
   convention below and can never support an APPROVED status, regardless of type.
2. Residential Underwriting Formula: MAO = (ARV * 0.70) - Repairs - Wholesale_Fee
3. Default Wholesale Fee: $15,000.
4. Repair Cost Standard (residential only): Light = $20/sqft | Medium = $35/sqft | Heavy = $55/sqft.
5. All calculations MUST pass through `scripts/verify-math.js` before writing the deal summary.
6. Fix & Flip Exit Analysis: Total Investment = Asking Price + Repairs + (ARV * 0.08 closing/holding costs). Projected Profit = ARV - Total Investment. ROI = Projected Profit / Total Investment.
7. Recommended Exit Strategy: Fix & Flip if ROI > 15%, else Wholesale if Asking Price <= MAO, else Creative Finance.
8. Commercial Income Approach (rentals, multifamily 5+, retail/office with tenants):
   EGI = Gross Potential Rent Annual × (1 - Vacancy Rate)
   NOI = EGI - Operating Expenses Annual
   Stabilized Value = NOI / Target Cap Rate  (cap rate sourced from verified comps per rule #1)
   MAO = (Stabilized Value × 0.90) - Immediate CapEx Reserve - Acquisition Fee
   Default Target Basis (income): 90% (0.90) unless overridden per-deal.
   Default Acquisition Fee (commercial): $25,000 unless overridden per-deal.
   DSCR (informational, computed when annualDebtService is supplied) = NOI / Annual Debt
   Service. DSCR and Cash-on-Cash are reported in the Deal Assessment section but do NOT
   gate scripts/verify-math.js's PASS/FAIL result (see rule #5) — they inform APPROVED vs
   CONDITIONALLY APPROVED status the same way rule #7's ROI threshold informs residential
   exit-strategy selection without altering math validation.
9. Commercial Repositioning Approach (vacant/distressed commercial):
   Exit Value is computed by ONE of:
     - Income method: postRepositionNOI / Exit Cap Rate
     - $/sqft method: sqft × Exit Comp Price/Sqft
     - $/unit method: units × Exit Comp Price/Unit
   Reposition Costs are NOT a uniform $/sqft light/medium/heavy tier (commercial rehab
   scope varies too much by asset class — unit turns vs. TI buildout vs. roof/mechanical/
   facade/ADA compliance). Reposition Costs MUST be itemized as a cost breakdown and
   summed, analogous to how residential repairs are derived from sqft × rate.
   MAO = (Exit Value × 0.75) - Reposition Costs - Acquisition Fee
   Default Target Basis (repositioning): 75% (0.75) unless overridden per-deal.
   Default Acquisition Fee (commercial): $25,000 unless overridden per-deal.
10. Commercial Exit Strategy Analysis: Total Investment = Asking Price + Reposition Costs
    + (Exit Value × 6% closing/holding). Projected Profit = Exit Value - Total Investment.
    ROI = Projected Profit / Total Investment. Recommended: Reposition & Sell if ROI > 20%;
    else Reposition & Hold-to-Stabilize if post-reposition DSCR/cap spread supports
    refinancing; else Wholesale/Assignment if Asking Price <= MAO; else Creative Finance /
    Pass. For Commercial Income deals, Exit Strategy Analysis instead compares Hold (cap
    rate spread, DSCR, cash-on-cash) vs. Sell-at-Cap-Rate — there is no repositioning cost
    to recover, so the Total Investment/ROI formula above does not apply to income deals.
</must_follow>

**Property type selection:** `run-loop.sh`/`run-loop-batch.sh` take an optional
property-type argument (`residential` default, or `commercial-income` /
`commercial-reposition`) that selects which rule set above applies — rules #2–7 for
residential, rule #8 for commercial-income, rule #9 (+ #10) for commercial-reposition.
The numeric defaults in rules #8–10 (90%/75% target basis, $25,000 acquisition fee, 6%
closing cost, 20% ROI threshold) are business-policy constants, confirmed by the deal
desk — treat them exactly as firmly as the residential 70%/$15k/8%/15% constants, not as
suggestions.

## Lessons Learned (Compounding Knowledge)
`LESSONS.md` is a required-read, required-write discovery log — `run-loop.sh`'s
orchestrator prompt makes reading it step 0 and appending new findings the last step
of every run. It exists so a blocker or working fix discovered on one run (e.g. a data
source that 403s, a query pattern that actually works, a permission gap) is available
to every subsequent run automatically, instead of only being captured if a human
happens to notice and manually update this file. `CLAUDE.md` stays the curated,
authoritative rule set; `LESSONS.md` is the raw append-only journal that feeds it —
mature findings get promoted here over time.

## Verification Workflows
- Execute math verification: `node scripts/verify-math.js <deal_json>` — the
  script reads `deal.propertyType` (default `"residential"` when absent) and, for
  commercial deals, `deal.dealType` (`"income"` | `"reposition"`) to select which
  formula branch to validate against (rules #2/#8/#9).
- Generate deal report: `deals/{address_slug}.md`

**Address input convention:** always pass the FULL address including city and
state (e.g. `"412 Hampton Blvd, Norfolk VA"`, not `"412 Hampton Blvd"`) to
`run-loop.sh`/`run-loop-batch.sh`. The slug is derived purely from the literal
address string with no geocoding — two different-but-equivalent strings for the
same property produce two different, disconnected deal decks (this happened for
real; see `deals/archive/`). `run-loop.sh` prints a non-blocking warning when a
new slug shares an address prefix with an existing deck, but consistent input
formatting is what actually prevents it.

**Property type input convention:** `run-loop.sh "<address>" [type]` takes an
optional second argument — `residential` (default, matches every pre-existing
invocation), `commercial-income`, or `commercial-reposition`. Non-default types
get a suffix appended to the slug (e.g. `-commercial-income`) so the same address
underwritten as two different property types produces two separate, non-colliding
deal decks rather than overwriting each other. `run-loop-batch.sh` takes a single
global `--type=` flag (default `residential`) applied to every address in that
invocation — batches cannot mix property types; run once per type instead.

**Norfolk Real Estate Assessor API (data.norfolk.gov) — working query recipe:**
`data.norfolk.gov`'s Socrata API ("Property Assessment and Sales - FY25", resource
`g7sg-tivf.json`) IS reachable via WebFetch — an earlier session incorrectly concluded
it was permission-blocked; the real issue was querying it wrong. Use this exact pattern:

- Query by exact fields, never Socrata's `$q` full-text search — `$q=412` full-text
  matches the digits "412" anywhere in the row (e.g. inside a property-class code like
  "412 Com Hospital/Nursing Home" on a totally different address), producing a false
  positive that looks like a match but isn't.
- Field values are **stored in mixed/title case**, not uppercase — e.g. `property_city`
  is `"Norfolk"`, `property_street_name` is `"38th"` or `"Hanson"`, not `"NORFOLK"`/
  `"38TH"`. Match case-insensitively with SoQL's `upper()`:
  `$where=property_street_number='1042' AND upper(property_street_name)='38TH'`
- Relevant field names: `property_street_number`, `property_street_direction`,
  `property_street_name`, `property_street_type` (2-letter abbreviation, e.g. `"ST"`,
  `"AV"`, `"DR"`), `property_city`, `property_zip`, `owner`, `current_total_value`,
  `transfer_date`, `consideration` (sale price).
- **Coverage caveat — treat an empty result as evidence, not proof.** This dataset name
  ("Sales - FY25") and its skew toward rows with a `transfer_date` (only ~2,255 of
  74,253 rows lack one) suggest it may lean toward parcels with recorded transfer
  history rather than being a complete citywide parcel roll. Before treating an empty
  result as "this address doesn't exist," validate the query against a known-good
  neighboring address first (confirms the query syntax itself is right), and note the
  coverage caveat explicitly in the Verification Gap section rather than asserting
  non-existence outright.
- This only covers Norfolk city; other jurisdictions have their own open-data portals
  (or none) and this recipe doesn't generalize automatically — check for an
  equivalent dataset before assuming the same field names/patterns apply elsewhere.

## Lead Sourcing (Deal-Flow Discovery)
`scan-leads.sh` is a two-stage pipeline that finds candidate addresses instead of
waiting for one to be supplied manually:

- **Stage 1 (cheap, `scripts/scan-leads.js`):** queries Norfolk's open-data portal
  directly — Delinquent Property Taxes (`7qie-z5gv`) and Neighborhood Quality Code
  Enforcement Cases (`mxtv-99gh`) — joins both to the assessor dataset
  (`g7sg-tivf.json`), classifies each parcel's property type from its
  `property_class_description`, and scores candidates by combining tax-delinquency
  severity (as % of assessed value) and open code-violation signals. Pure structured
  API queries — no live web research, no `claude -p` calls. Writes a ranked shortlist
  to `leads/scan-{date}.json`.
- **Stage 2 (expensive):** promotes only the top-N scored candidates into the real
  underwriting pipeline (`run-loop-batch.sh`), grouped into one batch call per property
  type since `run-loop-batch.sh`'s `--type=` flag is global to a batch, not per-address.

**Join keys** (validated empirically, see `LESSONS.md` for the discovery process):
Delinquent Taxes `biitem` == Assessor `parcel_id` (same zero-padded string format);
Code Enforcement `gpin` == Assessor `gpin` directly.

**Property-type classification is a first-pass heuristic**, not a certainty — it maps
`property_class_description` code prefixes to `residential` (1-4 unit codes: 510-515,
518, 520-522, 530-531, 540), `commercial-income` (5+ unit multifamily codes 401-406 and
552-557, plus true commercial codes like retail/office/industrial), and excludes vacant
land and municipal/NRHA/religious/HOA/school/exempt classes entirely (not investment
targets this pipeline's formulas are built for). Unmatched codes are excluded, never
guessed. This mapping should be refined as real scan output gets reviewed.

**Scoring is unvalidated against outcomes** (same caveat as the residential/commercial
formula constants — see `LESSONS.md` "Formula & Calibration"): it produces a *ranked*
list for a human to review, not an approval. Nothing from `scan-leads.js` bypasses the
existing rule #1 verification bar — a high discovery score only earns a candidate a
real underwriting pass via the normal pipeline, which can still return HOLD/REJECTED.

**Norfolk-specific date-filter gotcha:** Socrata `$where` date comparisons on the code
enforcement dataset need a plain `'YYYY-MM-DD'` literal — a full ISO timestamp (e.g.
`'2024-01-01T00:00:00.000'`) 500s server-side even though the field's own stored values
are full timestamps.

This entire pipeline (both datasets, the join keys, the classification table) is
Norfolk-specific, same caveat as the assessor-API recipe above — a different
jurisdiction needs its own open-data research before `scan-leads.js` would work there.

**Pre-foreclosure is deliberately NOT a signal here.** No free/open pre-foreclosure/
trustee-sale dataset exists for Norfolk (confirmed against the full open-data catalog,
not a single missed search — see `LESSONS.md`). Virginia's non-judicial foreclosure
process means the underlying public record this would be built from mostly doesn't
exist for free; real access requires a paid API (ATTOM/BatchData/PropertyRadar). Don't
re-attempt this without one.

## Automated Seller Outreach Protocol
When a deal passes underwriting:
1. Generate a 3-variant SMS cold outreach sequence tailored to the owner. Every variant MUST include opt-out language (e.g., "Reply STOP to opt out") by default.
2. Draft a formal Purchase & Sale Agreement cover letter referencing the specific calculated offer price. MUST be flagged as a draft requiring attorney/broker review before send — never presented as send-ready.
3. Save outreach assets to `outreach/{address_slug}-outreach.md`.

## PDF Export & Deal Deck Styling
Deal decks compile from `deals/{slug}.md` to `exports/{slug}.pdf` via `run-loop.sh`'s
pandoc + wkhtmltopdf step. This is the ONLY export path — there is no separate
embedded-`<style>`-block HTML export target; never write files directly to
`exports/*.html` or hand-roll a `<style>` block.

Three files, applied together by run-loop.sh's pandoc invocation, drive the visual
design ("Institutional / Banking": navy #0f172a + gold #9c7a2e, serif section
headers):
- `scripts/deal-deck.css` (`--css=`) — typography, tables, status/verdict color classes.
- `scripts/letterhead.html` (`--include-before-body=`) — static letterhead bar
  ("Investor Acquisitions" / "Confidential"), rendered once at the top of page 1.
- `scripts/status-banner.lua` (`--lua-filter=`) — rewrites the `**Status:**`
  paragraph into a full-width color-coded banner and the `**Verdict:**` paragraph
  into a matching colored callout box.

**Do not use emoji characters (✅ 🛑 ⚠️) for status/severity signaling.** The
installed wkhtmltopdf build (0.12.6, unpatched Qt) cannot render them reliably, and
adding a color-emoji font to the CSS stack corrupts digit rendering document-wide.
All status/severity signaling is CSS-driven (`status-banner`/`verdict-callout`
classes), not emoji.

Status/Verdict states — exactly these four, matching run-loop.sh's own branching logic:

| State | CSS class suffix | Color |
|---|---|---|
| APPROVED | approved | green `#16a34a` |
| CONDITIONALLY APPROVED | conditional | amber `#d97706` |
| HOLD | hold | amber `#d97706` |
| REJECTED | rejected | red `#dc2626` |

Markdown authoring rules (the Lua filter depends on this literal structure — the
`**Status:**`/`**Verdict:**` labels must be the first bold run in their paragraph,
and the state keyword must be the start of the next bold run):
- `# Investor Deal Deck: [Address]`
- `**Status:** ...` metadata paragraph, immediately after the title
- `## Property Snapshot`
- `## Underwriting Calculation`
- `## Deal Assessment` (contains the `**Verdict:** ...` paragraph)
- `## Exit Strategy Analysis`
- `## Comp & Repair Assumptions`
  - `### Verification Gap` — nested under Comp & Repair Assumptions, not a top-level `##`
- `## Source Data`

This section skeleton is identical across ALL property types (residential,
commercial-income, commercial-reposition) — `status-banner.lua` and
`deal-deck.css` key off this literal structure and the 4 canonical Status/Verdict
states, not the property type. Only the *content* inside each section changes:
`## Underwriting Calculation` shows the ARV/repair-tier table (residential) or the
EGI→NOI→Value→MAO table (commercial income, rule #8) or the Exit Value→Reposition
Costs→MAO table (commercial reposition, rule #9); `## Comp & Repair Assumptions`
shows $/sqft comps (residential) or cap-rate/NOI comps (income) or itemized
reposition-cost breakdowns (reposition); `## Deal Assessment` gets an added DSCR
row for income deals. Never deviate from the heading skeleton above regardless of
property type.

Keep financial figures as clean text (e.g. `$164,200`), tables in standard Markdown
pipe syntax.
