# PROGRESS — Nexivora Live Status Board

**Last updated:** 2026-09-08 · **Current phase:** Phase 1 — Design System & Brand Identity

> This file is the source of truth for *where we are*. Update it at the end of every work session.
> Detail lives in `docs/phases/`; this is the dashboard.

---

## Overall

```
MVP CONTRACT  (Phases 0-12)
Phase  0  ██████████████████████████  ✅ Complete
Phase  1  ░░░░░░░░░░░░░░░░░░░░░░░░░░  ⬜ Not Started
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

**Completed:** 1 / 20 phases · **MVP progress:** 1 / 13 phases

---

## Status table

| # | Phase | Status | Started | Completed | Summary written | Spec |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Foundation & Project Setup | ✅ Complete | 2026-09-08 | 2026-09-08 | ✅ | [spec](docs/phases/phase-00-foundation.md) |
| 1 | Design System & Brand | ⬜ Not Started | — | — | ⬜ | [spec](docs/phases/phase-01-design-system.md) |
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
