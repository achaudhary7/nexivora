# Phase 2 — Public Marketing Site & SEO Core

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 1 |
| **Blocks** | Phase 3 (the content fixtures are the schema's contract) |
| **Estimate** | 10 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Ship the **entire public surface** and the SEO machinery every later phase reuses — before the
database exists. Two reasons: the public archive is the product's acquisition engine and deserves
to be designed rather than bolted on, and it means there is a complete, shareable, impressive
product from week one.

References: `docs/SEO-CHECKLIST.md`, `docs/SITEMAP.md`.

## In scope

- Every logged-out page (~45 routes including dynamic fixtures)
- The SEO engine: metadata, canonicals, sitemaps, robots, JSON-LD, OG images
- Typed content fixtures in `src/content/` — **the contract Phase 3's schema must satisfy**
- The legal and trust set
- Error pages and the PWA manifest

## Out of scope

- Anything behind a login (Phase 4+) · Real data (Phase 3) · Working search (Phase 11)

## Deliverables

### The SEO engine
- [ ] `lib/seo/metadata.ts` — `buildMetadata()` used by **every** page: title, description,
      canonical, OG, Twitter, robots directives, `max-image-preview:large` on public content
- [ ] `lib/seo/jsonld.ts` — typed builders: `Organization`, `WebSite`+`SearchAction`,
      `BreadcrumbList`, `CreativeWork`, `ItemList`, `Person`+`ProfilePage`, `CollegeOrUniversity`,
      `Article`, `FAQPage`, `HowTo`, `DefinedTermSet`
- [ ] `lib/seo/visibility.ts` — `resolveVisibility()` deriving robots directives and sitemap
      inclusion from a resource's visibility (ADR-010). **No page sets robots directives itself.**
- [ ] `app/sitemap.ts` — a sitemap **index** plus segmented sitemaps (static, projects, profiles,
      colleges, knowledge, ideas)
- [ ] `app/robots.ts` — allow public, disallow `/api/`, `/settings/`, `/workspace/`, `/faculty/`,
      `/admin/`, `/auth/`, `/feed`, and the high-cardinality filter parameters
- [ ] `app/opengraph-image.tsx` + per-route variants — generated from SVG via `ImageResponse`,
      1200×630, one template covering project, profile, college, topic and article
- [ ] `scripts/check-seo.mjs` — crawls every sitemap URL and asserts: 200, one `h1`, unique title
      under 60 chars, unique description 140–160, canonical present and absolute, OG complete,
      valid JSON-LD, **and that no non-public resource appears in any sitemap**
- [ ] Wired into `npm run check`

### Content fixtures — `src/content/`
Typed, exported, and treated as the contract Phase 3 satisfies.
- [ ] `projects.ts` — 12 fully written demo projects across every domain, each with all nine
      sections, team, tech stack, SDGs, and **one three-level lineage chain**
- [ ] `topics.ts` — the two-level taxonomy with slugs, descriptions, colours
- [ ] `sdgs.ts` — all 17 goals with SVG marks
- [ ] `ideas.ts` — 10 ideas across every status
- [ ] `colleges.ts` — 3 colleges
- [ ] `people.ts` — 12 public profiles
- [ ] `knowledge.ts` — 6 articles
- [ ] `opportunities.ts` — 6 listings with complete `JobPosting` fields
- [ ] `faqs.ts`, `legal.ts`, `help.ts`, `changelog.ts`

### Marketing pages
- [ ] `/` — hero, the problem, the four layers, the ledger and archive differentiators, featured
      projects, audience split, FAQ, CTA. `Organization` + `WebSite`+`SearchAction` + `FAQPage`.
- [ ] `/for-students`, `/for-faculty`, `/for-colleges`, `/for-companies`, `/for-alumni` — each
      written to that audience's actual pain, each with its own genuine FAQ
- [ ] `/how-it-works` — `HowTo` structured data
- [ ] `/features` + `/features/workspace`, `/features/contribution-ledger`, `/features/archive`
- [ ] `/pricing` — the tiers from `docs/BUSINESS-MODEL.md`, and the free pilot as the primary CTA
- [ ] `/about`, `/contact` (`ContactPoint`), `/faq` (`FAQPage`)
- [ ] `/help` + `/help/[slug]` — 8 real articles
- [ ] `/changelog`, `/roadmap`

### Public data surfaces (rendering fixtures)
- [ ] `/explore` — the project grid with server-side faceted filtering (domain, SDG, status, year,
      college), real crawlable `?page=` pagination, `ItemList`
- [ ] Single-facet URLs canonicalise to their hub; multi-facet permutations return
      `noindex, follow` (see `docs/SEO-CHECKLIST.md` §5)
- [ ] `/projects/[slug]` — the full project page: all nine sections as real `<h2>` blocks, team,
      stack, SDGs, lineage, citation block. `CreativeWork` + `BreadcrumbList` + `Person`.
      **This is the highest-value template in the product — give it the most design attention.**
- [ ] `/topics` + `/topics/[slug]` — editorially written hub pages, not generated shells
- [ ] `/sdg` + `/sdg/[n]-[slug]`
- [ ] `/ideas` + `/ideas/[slug]`
- [ ] `/colleges` + `/colleges/[slug]` — `CollegeOrUniversity`
- [ ] `/p/[username]` — `Person` + `ProfilePage`
- [ ] `/knowledge` + `/knowledge/[slug]` + `/knowledge/collections/[slug]` — `Article`
- [ ] `/opportunities` + `/opportunities/[slug]` — full `JobPosting`

### Legal & trust
- [ ] `/legal/privacy` — DPDP-aligned, and **accurate to what the product actually does**
- [ ] `/legal/terms`, `/legal/community-guidelines`, `/legal/academic-integrity`,
      `/legal/ip-policy` (who owns student work — answer it explicitly),
      `/legal/accessibility`, `/legal/cookies`
- [ ] `/legal/grievance` — named officer with contact details (IT Rules requirement)

### System pages
- [ ] `not-found.tsx` returning a real 404 status with the 404 illustration and useful links
- [ ] `error.tsx`, `global-error.tsx`
- [ ] `manifest.webmanifest` wired

## Acceptance criteria

1. Every route in `docs/SITEMAP.md` marked Phase 2 returns 200.
2. `scripts/check-seo.mjs` reports **zero violations**: no duplicate titles, no duplicate
   descriptions, no missing canonical, no length breach.
3. Lighthouse on `/`, `/explore` and `/projects/[slug]`: Performance 95+, Accessibility 95+,
   Best Practices 100, SEO 100 (mobile).
4. **Every public page renders its full content with JavaScript disabled.** Verified by fetching
   the raw HTML and finding the body copy in it.
5. Rich Results Test passes for every structured-data type used.
6. `sitemap.xml` validates, contains only 200-status indexable URLs, and contains no private
   fixture.
7. `/explore?domain=ai-ml&sdg=6&year=2026` carries `noindex`.
8. A 404 returns HTTP 404, not 200.
9. Pagination links are real anchors and page 2 is reachable without JavaScript.
10. No page hand-writes a `<title>`, a canonical or a robots tag.

## Key files this phase creates

```
src/lib/seo/metadata.ts        buildMetadata() — used by every page in the product
src/lib/seo/jsonld.ts          11 typed structured-data builders
src/lib/seo/visibility.ts      resolveVisibility() — indexability derived from data
src/app/sitemap.ts             Segmented sitemap index
src/app/robots.ts
src/app/opengraph-image.tsx    One SVG-generated template, every page type
src/content/*                  Typed fixtures — THE CONTRACT PHASE 3 SATISFIES
scripts/check-seo.mjs          The audit that stops SEO silently regressing
```

## Notes & risks

- **Write the SEO audit script early and run it often.** In the reference project a crawl found 27
  self-inflicted violations — titles and descriptions breaching the project's own limits. Finding
  those at the end of the phase is much more expensive than finding them at page five.
- **The content fixtures are real work, not lorem ipsum.** Twelve fully written projects with
  genuine problem statements and methodology is several hours on its own — and it is the single
  thing that makes the demo credible, the SEO thesis testable, and Phase 3's schema correctly
  shaped. Do not shortcut it.
- **`/projects/[slug]` is the most important template you will build.** It is what ranks, what gets
  shared, and what a company sees. Give it disproportionate attention.
- Topic hub pages must have genuine editorial content. Generating thin shells for each taxonomy
  node is exactly the doorway-page pattern `technical and Spam.txt` prohibits.
- Descriptions must be written per page, not templated. A templated description is a duplicate
  description with extra steps.
- Lighthouse needs Chrome automation. If it is unavailable in this environment, **claim no score**
  — record it honestly as deferred to Phase 16 rather than asserting a number nobody measured.
- The privacy policy must describe what the code actually does. Write it against
  `docs/SECURITY.md` §7, and re-check it in Phase 16 against the real schema.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.** *(include the exact indexable page count)*

**Key decisions made.**

**SEO violations found in our own output, and how they were fixed.**

**The `src/content/` contract — what Phase 3's schema must satisfy.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
