# Phase 3 — Data Model, Taxonomy & Seed

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 2 (the `src/content/` fixtures are the contract) |
| **Blocks** | Phases 4–15 |
| **Estimate** | 7 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Build the complete schema and a **seeded demo college that tells a story**. The seed is not filler
— it is the demo, the test fixture and the thing that makes every later phase possible to build
against. A phase that has to invent its own test data is a phase that will drift.

Reference: `docs/DATA-MODEL.md`.

## In scope

- The full Prisma schema (~60 models, ~25 enums)
- Postgres extensions, full-text search columns, GIN indexes, triggers
- The domain taxonomy, skill taxonomy and the 17 SDGs
- The complete demo college seed
- The integrity verification suite

## Out of scope

- Any UI (Phases 4+) · Auth logic (Phase 4) — the models exist, the flows do not

## Deliverables

### Database
- [x] **PostgreSQL is already running** — `npm run db:up` (ADR-021, resolved blocker B-1).
      PostgreSQL 16.8 on port **5433**, with `pg_trgm`, `unaccent` and `citext` installed and
      verified. Nothing to install. `npm run db:status` confirms it.

### Schema
- [ ] Prisma installed, **version pinned exactly** (ADR-002), Postgres provider
- [ ] `prisma/schema.prisma` covering all ten model groups from `docs/DATA-MODEL.md`
- [ ] Every closed set is an enum; no status stored as a free string
- [ ] `collegeId` present and indexed on every institution-scoped model
- [ ] `createdAt` / `updatedAt` on every model; `deletedAt` on user-authored content
- [ ] `cuid2` ids throughout
- [ ] Composite indexes for the real access patterns: `(collegeId, termId, status)` on Project,
      `(groupId, status, dueDate)` on Task, `(userId, readAt)` on Notification,
      `(visibility, publishedAt)` on Project
- [ ] An index on every foreign key (Prisma does not always create one)
- [ ] **Check constraint enforcing that every `Post` has exactly one anchor** (ADR-006) — this is a
      database constraint, not an application convention
- [ ] `LedgerEvent` modelled append-only: no update path in the client wrapper
- [ ] Migration created and applied

### Search infrastructure
- [x] `pg_trgm` and `unaccent` enabled — done by `npm run db:up`, not by a migration. A migration
      that runs `CREATE EXTENSION` needs superuser, which the application user deliberately does not
      have (docs/SECURITY.md §9).
- [ ] `searchVector tsvector` columns on Project, Idea, Post, User, Resource
- [ ] Weighted: title A, tags B, sections C, body D
- [ ] Triggers maintaining the vectors on insert and update
- [ ] GIN indexes on every vector, and a trigram index on the normalised problem statement
- [ ] `lib/search/fts.ts` — parameterised raw query helpers
- [ ] `lib/search/similarity.ts` — the duplicate scorer: trigram similarity on the normalised
      problem statement combined with Jaccard overlap of tag and tech-stack sets, weights in config
- [ ] Unit tests for the scorer against fixture pairs with known expected outcomes

### Taxonomy — **already built in Phase 2**; this phase seeds from it
`src/config/taxonomy.ts` exists and is the single definition consumed by the topic hubs, the explore
facets, project domain colours and (later) the matcher. **Do not redefine it** — the seed imports it.
Verify rather than rewrite:
- [ ] Two-level domain taxonomy: AI/ML, Software, Hardware & IoT, Healthcare, Education,
      Sustainability, Social Impact, Research & Science — each with sub-domains, a slug, a
      description and a contrast-checked colour
- [ ] Skill taxonomy mapped to domains
- [ ] All 17 SDGs with official numbers, titles and our SVG marks
- [ ] **One definition, four consumers** — the same file drives `/topics`, the explore facets, the
      project domain colour and the teammate matcher

### Seed — `prisma/seed/`
Split by concern, importing from `src/content/` rather than duplicating it.
- [ ] `hierarchy.ts` — Nexivora Institute of Technology: 4 departments, 6 programmes, ~18 subjects,
      2 terms, 8 classes, plus 2 additional colleges for inter-college work later
- [ ] `people.ts` — ~60 students, 12 faculty, 2 college admins, 6 alumni, 3 companies,
      1 platform admin; enrolments and subject assignments
- [ ] `groups.ts` — ~14 groups in varied states, including **one with a visibly silent member** so
      the Phase 9 health signal has something real to show
- [ ] `projects.ts` — ~20 projects across every domain and every lifecycle state, with all sections
      populated, imported from the Phase 2 fixtures
- [ ] **A real three-level lineage chain**, so the lineage tree is not a single node
- [ ] **One project deliberately similar to an archived one**, so the duplicate check demonstrably
      fires rather than being taken on trust
- [ ] `workspace.ts` — tasks, files, threads, meetings and a **ledger consistent with them**
- [ ] `activity.ts` — a feed generated from the above events, not hand-written
- [ ] `evaluation.ts` — one rubric, one completed evaluation, two attestations, one revoked
- [ ] `ideas.ts` — ideas at every status, including one that became a project
- [ ] `assertCatalogueComplete()` — fails loudly at seed time if content references a taxonomy node
      that does not exist, so the Phase 2 contract is enforced here rather than discovered as a
      foreign-key error later

### Tooling
- [ ] `npm run db:reset` — migrate + seed from scratch
- [ ] `npm run db:seed`
- [ ] `npm run db:verify` — `scripts/verify-db.mjs`
- [ ] `lib/db/client.ts` — the Prisma singleton (dev hot-reload safe)
- [ ] `lib/db/queries/` skeleton by domain, with the `viewer`-first signature established

### Integrity assertions — `scripts/verify-db.mjs`
- [ ] No `Post` without exactly one anchor
- [ ] No public project whose proposal was never approved
- [ ] No `LedgerEvent` without the action that produced it
- [ ] No project outside its own college's hierarchy
- [ ] No group member from a different college
- [ ] Every enum value used is a declared value
- [ ] The lineage graph is acyclic
- [ ] Every `searchVector` is populated
- [ ] The similarity check fires on the deliberately-similar pair, and does not fire on an
      unrelated pair

## Acceptance criteria

1. `npm run db:reset` rebuilds the complete demo world in **under 20 seconds**.
2. `npm run db:verify` passes every assertion.
3. A full-text search for a term appearing only in a project's methodology section returns that
   project, ranked below one where it appears in the title.
4. The similarity scorer scores the deliberate near-duplicate above the configured threshold and an
   unrelated project below it.
5. The seeded feed is populated entirely by generated activity — no hand-written posts.
6. Every `src/content/` fixture type has a corresponding model that can hold it.
7. Prisma Studio shows a college that reads like a real institution, not like test data.

## Key files this phase creates

```
prisma/schema.prisma           ~60 models — the single source of truth
prisma/migrations/             Including the extensions and FTS trigger migration
prisma/seed/*                  The demo world, split by concern
src/config/taxonomy.ts         One taxonomy, four consumers
src/lib/db/client.ts           Prisma singleton
src/lib/search/fts.ts          Parameterised full-text helpers
src/lib/search/similarity.ts   The duplicate scorer — unit tested
scripts/verify-db.mjs          The integrity suite
```

## Notes & risks

- **The seed is the demo. Give it a narrative.** Named students with believable strengths and gaps,
  a group that is visibly struggling, a project that is genuinely good, a lineage chain that tells a
  story of one batch building on another. Random data produces a demo nobody believes.
- **Model `ProjectSection` as rows, not JSON** (ADR-009). It is tempting to use one JSON column;
  resist it. Per-section feedback, progress computation and the public page's `<h2>` structure all
  depend on rows.
- **The `Post` anchor constraint belongs in the database.** If it is only enforced in application
  code, some future route handler will bypass it and the feed will slowly fill with status updates
  — which is the exact failure ADR-006 exists to prevent.
- Prisma's `latest` dist-tag has previously pointed at a release candidate. Check what actually
  installed, and pin it.
- FTS triggers are raw SQL in a migration; Prisma cannot express them. Write them by hand and test
  that an update to a project title actually updates its vector.
- Do not seed models no phase uses yet. Unused rows help nobody and rot.
- `prisma migrate reset` is destructive. Run it deliberately, and never on a database that has
  real data.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.** *(exact model and enum counts, seed timing)*

**Key decisions made.**

**The demo narrative — who is in the seed and what story it tells.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
