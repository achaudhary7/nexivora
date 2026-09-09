# PROGRESS — Nexivora Live Status Board

**Last updated:** 2026-09-09 · **Current phase:** Phase 2 — Public Site & SEO Core

> This file is the source of truth for *where we are*. Update it at the end of every work session.
> Detail lives in `docs/phases/`; this is the dashboard.

---

## Overall

```
MVP CONTRACT  (Phases 0-12)
Phase  0  ██████████████████████████  ✅ Complete
Phase  1  ██████████████████████████  ✅ Complete
Phase  2  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase  3  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase  4  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase  5  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase  6  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase  7  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started   <- the heart of the product
Phase  8  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase  9  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase 10  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase 11  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase 12  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started

EXPANSION
Phase 13  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase 14  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase 15  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started

PRODUCTION
Phase 16  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase 17  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started

AI + LAUNCH
Phase 18  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
Phase 19  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
```

**Completed:** 2 / 20 phases · **MVP progress:** 2 / 13 phases

---

## Status table

| # | Phase | Status | Started | Completed | Summary written | Spec |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Foundation & Project Setup | ✅ Complete | 2026-09-08 | 2026-09-08 | ✅ | [spec](docs/phases/phase-00-foundation.md) |
| 1 | Design System & Brand | ✅ Complete | 2026-09-08 | 2026-09-08 | ✅ | [spec](docs/phases/phase-01-design-system.md) |
| 2 | Public Site & SEO Core | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-02-public-seo.md) |
| 3 | Data Model, Taxonomy & Seed | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-03-data-model.md) |
| 4 | Auth, Roles & RBAC | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-04-auth-rbac.md) |
| 5 | Institution Backbone | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-05-institution.md) |
| 6 | Profiles & Academic Identity | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-06-profiles.md) |
| 7 | Groups & Project Workspace | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-07-workspace.md) |
| 8 | Project Lifecycle & Pages | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-08-project-lifecycle.md) |
| 9 | Faculty Review & Evaluation | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-09-faculty.md) |
| 10 | Academic Feed & Notifications | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-10-feed.md) |
| 11 | Discovery, Ideas & Matching | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-11-discovery.md) |
| 12 | Showcase, Archive & Portfolio | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-12-showcase-archive.md) |
| 13 | Alumni & Company Network | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-13-alumni-companies.md) |
| 14 | Inter-College, Events & Global | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-14-intercollege-events.md) |
| 15 | Analytics & Accreditation | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-15-analytics.md) |
| 16 | Hardening | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-16-hardening.md) |
| 17 | Deployment & Operations | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-17-deployment.md) |
| 18 | AI Assistant Layer | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-18-ai-assistant.md) |
| 19 | Launch & Pitch Pack | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-19-launch-pack.md) |

---

## Session log

Append one entry per working session. Newest first.

### 2026-09-09 — Session 4

- **Phase 1 correction: the type scale was too large and the rhythm too airy.** Reported from a real
  screen. The screenshot came from a browser at ~133% zoom, so the first job was separating "the
  type is too large" from "the browser is zoomed" — **both were true**, and only one was fixable.
- Built `scripts/audit-layout.mjs` (`npm run audit:layout`) to settle it with numbers: it drives
  Chrome over CDP and reports **computed** font sizes, section padding, hero offset, document height
  and horizontal overflow at 390 / 768 / 1280 / 1536, at a known 100% zoom.
- Measured and fixed (**ADR-018**): hero h1 **60 → 48px**, hero top gap **156 → 107px** (desktop) and
  **108 → 76px** (mobile), lead **18 → 16px** on mobile, `Section` padding **64/96/112 → 48/64/80**.
  Document height at 1280 fell from 1644 to 1362 — 17% less scrolling for the same content.
- `docs/DESIGN-SYSTEM.md` now carries a **usage ceiling** table — what the scale defines versus what
  pages may use — so this cannot drift back across Phase 2's ~45 pages. `6xl`/`7xl` are unused and
  need a stated reason.
- **Two findings from the same pass, both worth more than the fix itself:**
  - **Prettier's Tailwind class sorting had already reordered the class strings**, so two of the
    four edits in the first attempt silently matched nothing. The audit caught it because the
    numbers did not move. *Verify an edit landed by measuring its effect, not by the edit
    reporting success.*
  - With navigation still empty in Phase 1, the **mobile header rendered only a theme toggle** —
    both auth CTAs were `hidden sm:inline-flex`. The primary CTA is now visible at every width.
- Verified: check and build clean, contrast still 94/94, **no horizontal overflow at any width** on
  either route.
- **Next:** Phase 2 — the public site and SEO engine.

### 2026-09-08 — Session 3

- **Completed Phase 1.** The brand and the full component vocabulary: the Logo as one component
  (lockup / stacked / mark, plus mono and reversed), the complete favicon and PWA icon set generated
  from that same geometry, **~35 UI primitives** on Radix, Header / Footer / AppShell /
  CommandPalette, **60 inline SVG icons**, 8 scene illustrations, the generated avatar and
  project-cover systems, and `/style-guide` rendering all of it in both themes.
- **Fixed three React 19 `set-state-in-effect` errors properly rather than suppressing them.** The
  theme now uses `useSyncExternalStore` (**ADR-016**) — which also means two open tabs stay in step,
  something the effect version did not do. The combobox and command palette reset their active
  option in the change handler, where the filter actually changes.
- **Looked at the result, and found four defects every automated check had passed** (**ADR-017**):
  a **doubled page title** (`Style guide · Nexivora · Nexivora`) caused by the root layout's title
  template stacking on `buildMetadata`'s suffix — **this would have hit all ~45 Phase 2 pages**;
  a `favicon.ico` that silently contained one size instead of three, because Pillow's ICO writer
  ignores `append_images`; the stacked lockup's wordmark off-centre by six units; and ~24% dead
  trailing space in the horizontal lockup's viewBox.
- Built `scripts/screenshot.mjs` (`npm run shot`) to make that pass repeatable — it drives Chrome
  over the DevTools Protocol, because the `--screenshot` flag cannot emulate `prefers-color-scheme`
  or capture beyond the viewport. Phases 2 and 16 both need it.
- Built the command palette now and left it deliberately empty: it is the **deterministic fallback
  for the Phase 18 assistant**, and building it separately keeps that boundary honest.
- Verified: typecheck / lint / format / contrast / build all clean; **CSS 12.0 KB gzipped** against
  a 20 KB budget; the mark rendered and **visually checked at 16px**; `favicon.ico` confirmed to
  carry 16/32/48; full-page captures in both themes; tier badges checked desaturated for the
  greyscale-print requirement.
- **Not done and not claimed:** the axe, screen-reader and keyboard audits are Phase 16. Contrast is
  measured; conformance is not asserted, and the style guide says so.
- **Next:** Phase 2 — the full public site and the SEO engine (~45 indexable pages, `buildMetadata`
  everywhere, `jsonld.ts`, `sitemap.ts`, `robots.ts`, OG images, and the `src/content/` fixtures
  that become Phase 3's schema contract).

### 2026-09-08 — Session 2

- **Completed Phase 0.** Scaffolded on **Next.js 16.3.4** (newer than the planned 15 —
  `create-next-app@latest` ships it) with React 19.2.8, Turbopack, Tailwind v4, TypeScript strict
  plus `noUncheckedIndexedAccess`, ESLint, Prettier, and the folder skeleton for all twenty phases.
- **Read the Next 16 docs bundled in `node_modules/next/dist/docs/` rather than assuming Next 15
  conventions**, and found four breaking changes that affect phases not yet built (**ADR-014**).
  The expensive one: **Middleware is now Proxy** (`src/proxy.ts`), and a `middleware.ts` file is
  *silently ignored* — in Phase 4 that would have presented as a broken auth guard rather than a
  missing file. Phase 4's spec and `docs/ARCHITECTURE.md` are corrected. Also: `params`,
  `searchParams`, `cookies()` and `headers()` are now Promises with no sync shim, `opengraph-image`
  and `sitemap` generators receive Promises too, and the `eslint` key in `next.config.ts` is gone.
- **Built the complete design token system in Phase 0 rather than stubbing it**, because Phase 1
  builds every component against it and half a system means rewriting each component twice.
- **Measured contrast instead of assuming it — three token pairings failed.** White on `accent-600`
  (3.68:1), white on `highlight-600` (3.19:1), and the amber fill's own edge against white
  (2.15:1, below the 3:1 UI-boundary rule). None is visible to the eye; all would have shipped.
  Fixed by introducing explicit `*-fill` tokens so a component never picks its own ramp step, and a
  mandatory border on highlight fills (**ADR-015**). Now **94/94 pairs pass in both themes**, and
  the audit is a committed script wired into `npm run check` so it cannot silently regress.
- Deleted the scaffold's Next.js-branded favicon and its `next.svg` / `vercel.svg` assets rather
  than shipping them as our brand. Claimed `/icon.svg` now with a placeholder mark, because per
  `Fevicon.txt` the icon URL must be stable forever — Phase 1 changes the artwork, never the URL.
- Verified: typecheck / lint / format / contrast / build all clean; `GET /` returns 200 with the
  correct title, canonical, robots and OG tags; all six security headers present; page copy present
  in the raw HTML (crawlable with JavaScript disabled); a missing route returns a real 404; invalid
  env fails the boot naming the variable. Committed as `8c630dd`.
- **One deliverable is genuinely incomplete and is not being claimed:** PostgreSQL is not installed
  on this machine, so acceptance criterion 5 (`pg_trgm`) is unmet. Logged as blocker B-1. It blocks
  nothing before Phase 3.
- **Next:** Phase 1 — logo, favicon set, icon and illustration sets, ~35 UI primitives,
  Header/Footer/AppShell, `/style-guide`.

### 2026-09-08 — Session 1

- Read the Nexivora brief, the Google SEO reference set in `../SEO IMPs`, and the KaushalSetu
  documentation system used as the structural template.
- Locked the product identity: **Nexivora**, tagline *Projects. People. Opportunities.*, positioned
  as **project-first** rather than person-first — the deliberate difference from LinkedIn.
- Named the four weaknesses in the original brief and turned each into a shipped differentiator:
  activity-anchored feed, permanent archive with lineage, three-tier contribution proof, and the
  **Contribution Ledger** that addresses the free-rider problem no competitor touches.
- Added the institutional business case that was missing entirely: **NAAC/NBA/NIRF accreditation
  export** from data the platform already holds. This is the revenue line.
- Chose **PostgreSQL for dev and production, not SQLite** (ADR-003): full-text search and
  `pg_trgm` duplicate detection are core features, and testing them only at deploy time is a trap.
- Resolved hosting: Hostinger *shared* cannot run Node, so production targets a Hostinger **VPS
  KVM 2**; localhost plus Cloudflare Tunnel covers everything before that, free.
- Wrote `CONTEXT.md`, `PLAN.md`, this file, `README.md`, twelve reference docs and twenty phase
  specs.
- **Next:** Phase 0 — scaffold the app, tooling, folder architecture, env validation, token stub.

---

## Blockers

| # | Blocker | Since | Blocks | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| B-1 | **PostgreSQL is not installed on this machine** — neither Postgres nor Docker is present, so the `nexivora` database does not exist and `pg_trgm` could not be verified. Phase 0 acceptance criterion 5 is unmet. | 2026-09-08 | **Phase 3** onward. Phases 1 and 2 are unaffected and proceed. | achaudhary7 | Install Docker Desktop (`docker run --name nexivora-db -e POSTGRES_PASSWORD=nexivora -e POSTGRES_DB=nexivora -p 5432:5432 -d postgres:16`) **or** the PostgreSQL 16 Windows installer, then create the `pg_trgm` and `unaccent` extensions. Both paths are in `docs/DEPLOYMENT.md` §1. |
| B-2 | Port 3000 is held by the KaushalSetu dev server, so Nexivora's dev server binds to 3001. | 2026-09-08 | Nothing — cosmetic. | achaudhary7 | Stop the other dev server, or set `NEXT_PUBLIC_SITE_URL=http://localhost:3001` so canonicals match the port actually in use. |

---

## Deferred items

Things consciously postponed. Never delete a row — move it to a Resolved section.

| Item | Deferred from | Deferred to | Why |
| --- | --- | --- | --- |
| All AI features | Everywhere | Phase 18 | Limited AI credits; every AI surface has a deterministic version that ships first and stands alone. |
| Socket.io / WebSocket transport | Phase 10 | When measured need exists | SSE plus polling covers notifications and chat at MVP scale, costs nothing and survives Nginx. Behind `lib/realtime/` so the swap is one file. |
| Video conferencing | Phase 7 | Out of scope | We schedule meetings and store a join link. Hosting video is a different company. |
| Real-time collaborative document editing | Phase 7 | Out of scope | CRDT editing is a multi-month build. Files plus threaded discussion cover the need. |
| Native mobile apps | — | Post-MVP | PWA (Phase 16) covers installability and offline. |
| Payments / subscription billing | Phase 2 | Post-MVP pilot | The pricing page describes tiers; no gateway until a college actually signs. |
| Cloudflare R2 object storage | Phase 7 | When disk pressure appears | `StorageProvider` interface ships in Phase 7 with the local driver; R2 is one more driver. |
| Multi-language / `hreflang` | Phase 2 | When Hindi content exists | Emitting hreflang for a single locale is noise. Pattern documented in the SEO checklist. |
| Plagiarism checking against the open web | Phase 8 | Out of scope | We check against the college archive only. External plagiarism is Turnitin's business and it is expensive. |
| Google OAuth sign-in | Phase 4 | Phase 16 | Credentials plus institutional email verification is the trust path. OAuth is a convenience added later, never the only route. |
