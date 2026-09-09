# CONTEXT.md — Read This First

> **Purpose of this file:** this is the single entry point that restores full project context for
> any developer (or AI session) that picks up this repository. If you read nothing else, read this
> file, then `PROGRESS.md`, then the phase file you are working on.

---

## 1. What this project is

**Nexivora** — *The Global Academic Collaboration Network.*

A modern academic social and collaboration platform that connects **students, faculty, colleges,
alumni, companies and researchers** in one ecosystem. Its purpose is to make academic work
**organised, collaborative, discoverable and opportunity-driven**.

**This is an individual startup project.** It is not a DTIL project, not a Group 14 project, and
not a hackathon submission. It is built by an Integrated M.Tech AI/ML student as a real product
with a real business model behind it.

**The core identity of the platform, in three words:**

```
Projects  →  People  →  Opportunities
```

Everything on Nexivora hangs off a **project**. That is the deliberate difference from every
adjacent product: LinkedIn is person-first, Instagram is post-first, GitHub is code-first.
Nexivora is **project-first**, with the academic hierarchy as its structural spine and the
institution as its trust anchor.

```
College → Departments → Subjects → Faculty → Classes → Groups → Students → Projects
```

## 2. The name and brand

| Field | Value |
| --- | --- |
| Product name | **Nexivora** |
| Reading | *Nexi* (nexus — a connection, a junction of many things) + *vora* (a forward, generative ending) |
| Primary tagline | **Projects. People. Opportunities.** |
| Descriptor line | The global academic collaboration network. |
| Positioning line | Where student work becomes a permanent academic record. |
| Preferred domain | `nexivora.com` (fallbacks: `nexivora.in`, `nexivora.org`) |
| Handle | `@nexivora` everywhere |

Why the name works: it is invented, so it is trademarkable and the domain is very likely free; it
is pronounceable in one pass; it carries "nexus" without being literal; it does not contain
"edu", "campus", "student" or "connect", so it does not age into a single market segment.

## 3. The problem, in one paragraph

Academic project work in colleges is scattered across WhatsApp groups, personal Drive folders,
email threads and printed reports. Faculty see progress only at submission. Group members cannot
prove what they individually contributed. Finished projects vanish the day they are graded, so the
next batch rebuilds the same thing from zero and the college loses its own institutional memory.
Students end four years with no verifiable portfolio of what they actually built. Alumni and
companies have no window into student work, so mentorship and opportunity flow depend entirely on
personal contacts. **None of this is a technology problem — it is a missing system of record.**
Nexivora is that system of record, and the network that grows on top of it.

## 4. Our differentiators — why this is not "LinkedIn for students"

The brief as originally written has four quiet weaknesses. Each one is a feature we ship, and each
one is what makes the product defensible.

| Weakness | Our answer | Phase |
| --- | --- | --- |
| **An "academic feed" of free-form posts is an engagement trap.** It gets abandoned in three weeks because there is nothing to post about. | **The feed is generated from real project activity.** Every post is anchored to a project, an idea, a question or a resource. There is no standalone status update. The feed is therefore never empty and never noise. | 10 |
| **Nothing survives the semester.** Completed projects die at grading. | **Academic Archive + Project Lineage.** Every completed project gets a permanent citable ID and a stable public URL, and a new group can formally **Build On** a previous project — lineage is recorded and rendered as a visible tree. This turns four years of student work into a compounding institutional asset. | 12 |
| **Every claim is self-declared.** "I built the ML model" is unverifiable. | **Three-tier contribution proof:** self-claimed → workspace-evidenced (derived from real tasks, files and commits in the group workspace) → faculty-attested (a named faculty member signed it). Recruiters and alumni can filter to attested only. | 7, 9, 12 |
| **The free-rider problem in group projects is the number-one real pain of student teamwork, and the brief does not address it at all.** | **The Contribution Ledger.** Every workspace maintains a transparent, automatic per-member contribution view — tasks closed, files contributed, commits linked, milestones owned — plus a structured peer review at each milestone close. Visible to the group and to faculty. This single feature is the strongest adoption driver we have. | 7, 9 |

Additional differentiators, all shipped:

- **Duplicate / similarity detection** — a new project's problem statement is checked against the
  college archive before approval. Deterministic (trigram + token similarity), no AI needed.
- **Accreditation export (NAAC / NBA / NIRF / AICTE)** — Indian institutions spend enormous manual
  effort compiling project, research and student-activity data for accreditation. Nexivora already
  holds it, structured. One-click export. **This is the institutional business model.**
- **SDG alignment as a first-class dimension** — filterable, reportable, and a public showcase.
- **Academic IP and embargo controls** — a group can keep a patentable project private, or
  time-embargoed, while still proving it exists. A faculty panel will ask about this.
- **Skill graph inferred from projects**, not self-declared — your skills are what your verified
  project work demonstrates.
- **Public project pages that are genuinely useful to the open web** — see section 5.

## 5. The SEO thesis (read this before Phase 2)

Most of this product sits behind a login, which normally means zero organic traffic. We solve that
by making a deliberate, high-value **public surface**.

Queries like *"final year project ideas for CSE"*, *"IoT project report"*, *"SDG student projects"*
and *"machine learning mini project"* have enormous Indian search volume and genuinely terrible
existing content — thin listicles and scraped PDFs. **A public archive of real, fully documented
student projects with problem statement, methodology, results and named team is better content than
anything currently ranking.** And that archive is a by-product of the product simply working.

Public, indexable surfaces in priority order: `/explore` and `/projects/[slug]` → `/topics/[slug]`
→ `/ideas` → `/colleges/[slug]` → `/p/[username]` → `/knowledge/[slug]` → `/opportunities/[slug]`.
Full contract in `docs/SEO-CHECKLIST.md`, full route table in `docs/SITEMAP.md`.

## 6. Hard constraints

| Constraint | Consequence |
| --- | --- |
| **Very limited AI credits** | All AI is deferred to **Phase 18**, the last build phase. Every AI feature has a deterministic fallback that ships first and works alone: command-palette navigation, structured faceted search, rule-based teammate matching (skill overlap + availability + department), template-based summaries. **AI on and AI off must both produce a working product** — the difference is quality, not function. |
| **No Vercel** | Local-first development. Share via Cloudflare Tunnel (free). Production on a **Hostinger VPS** (Node + PostgreSQL + Nginx + PM2). Hostinger *shared* hosting cannot run Node — see `docs/DEPLOYMENT.md`; this is the single easiest thing to get wrong. |
| **SEO is a first-class requirement** | Server-rendered by default, per-page metadata, canonicals, sitemap, robots, JSON-LD. Source: the Google Search Central docs in `../SEO IMPs`. Contract in `docs/SEO-CHECKLIST.md`. |
| **Reusable components everywhere** | One `Header`, one `Footer`, one `Button`, one `Card`. If you are writing a second one, stop. See `docs/DESIGN-SYSTEM.md`. |
| **All imagery is SVG** | Logo, favicon set, icons, illustrations, empty states, OG images, diagrams. No raster assets, no stock photography, no paid licences. |
| **Performance is graded** | Lighthouse 95+ on public pages. LCP under 2.0s, INP under 200ms, CLS under 0.05. Budgets in `docs/PERFORMANCE.md`. |
| **Solo developer** | Phases are ordered so something demonstrable exists from day two, and so that stopping early still leaves a coherent product. Phases 0–12 are the MVP contract. |

## 7. Scope discipline — what the MVP is

The brief explicitly warns against building everything at once. It is right.

| Band | Phases | What it is |
| --- | --- | --- |
| **MVP — one college, end to end** | **0 – 12** | Brand, public site, data model, auth, institution backbone, profiles, group workspace, project lifecycle, faculty review, feed, discovery, showcase and archive. **This is the contract.** |
| Network expansion | 13 – 15 | Alumni, companies, inter-college, events, analytics and accreditation. |
| Production readiness | 16 – 17 | Hardening and deployment. |
| AI layer | 18 | Last, by design. Strictly additive. |
| Launch | 19 | Pitch, demo, seed story, go-to-market. |

If time runs out, **stop after Phase 12 and present 13–19 as roadmap.** A complete small system
beats a broken large one.

## 8. Where everything lives

```
Nexivora/
├── CONTEXT.md              <- you are here; read first
├── PLAN.md                 <- master phase plan, phases 0-19
├── PROGRESS.md             <- live status board; update after every work session
├── README.md
├── docs/
│   ├── ARCHITECTURE.md         stack, folder layout, request lifecycle, realtime
│   ├── DATA-MODEL.md           entities, relationships, the hierarchy
│   ├── ROLES-PERMISSIONS.md    every role x every resource; the authorisation matrix
│   ├── DESIGN-SYSTEM.md        tokens, components, brand, logo
│   ├── SEO-CHECKLIST.md        per-page SEO contract, from the Google docs
│   ├── PERFORMANCE.md          budgets and techniques
│   ├── SECURITY.md             authz model, privacy, moderation, threats
│   ├── DEPLOYMENT.md           localhost -> tunnel -> Hostinger VPS
│   ├── DECISIONS.md            ADR log; every non-obvious choice and why
│   ├── SITEMAP.md              every route, its gate, its indexability, its phase
│   ├── BUSINESS-MODEL.md       pricing, unit economics, go-to-market
│   ├── PITCH.md                problem, solution, market, ask — the deck content
│   └── phases/
│       └── phase-00-foundation.md ... phase-19-launch-pack.md
└── app/                    <- the Next.js application
```

## 8a. What earlier phases already built — read before starting any phase

Phases 0–2 are complete. These are the things a future session most often re-invents or contradicts.

### Commands that already exist

| Command | Does |
| --- | --- |
| `npm run db:up` | **Real PostgreSQL 16.8, nothing to install** (ADR-021). Port 5433, `pg_trgm`/`unaccent`/`citext` verified working. |
| `npm run db:status` / `db:down` / `db:destroy` | Inspect, stop, reset the local cluster |
| `npm run check` | typecheck + lint + format + contrast audit. **The gate.** Works with nothing running. |
| `npm run check:seo` | Crawls the sitemap and asserts the whole per-page SEO contract. **Needs a running server.** Found 191 real defects on its first run. |
| `npm run audit:layout [route]` | Computed font sizes, spacing and overflow at 390/768/1280/1536 |
| `npm run shot [route]` | Full-page screenshots, light and dark, via CDP |
| `npm run gen:icons` | Regenerates the favicon and PWA set from the one mark geometry |

### Conventions that are already settled — extend, never duplicate

- **`src/content/types.ts` is the contract.** Phase 3's schema must represent every field in it.
  Its enums (`SectionKind`, `ProjectStatus`, `ProofTier`, `LineageKind`, `Visibility`, `IdeaStatus`)
  are the ones the schema should declare.
- **`src/content/index.ts` holds the visibility predicate, once.** Pages call `publicProject()`,
  `publicPerson()` and friends — never the raw fixture arrays. Phase 3/4 replace the *bodies* of
  those functions with queries; the pages do not change.
- **`resolveVisibility()` decides indexability** (ADR-010). Extend it; adding a second visibility
  check is exactly how a private project leaks into a sitemap.
- **`buildMetadata()` owns title, canonical, robots and OG.** No page hand-writes them. It drops the
  brand suffix rather than truncating a title (ADR-020), and the OG image comes from `/api/og`
  (ADR-019).
- **`src/config/taxonomy.ts` and `config/navigation.ts` already exist.** One definition, several
  consumers. Navigation flags are still `planned: true`, so Header and Footer render no links yet.
- **The design tokens are complete and contrast-verified.** Never a raw hex. Filled buttons use
  `bg-primary-fill` / `bg-accent-fill` / `bg-highlight-fill` with the matching `text-fg-on-*`, never
  a ramp step (ADR-015). Type has a **usage ceiling** in `docs/DESIGN-SYSTEM.md` (ADR-018).
- **~35 UI primitives, 85 icons, 8 illustrations exist.** If you are about to write a second Button,
  stop. `/style-guide` is the reference.

### Framework facts that fail silently if forgotten

- **Next 16 renamed Middleware to Proxy.** The file is `src/proxy.ts`. A `middleware.ts` is
  *silently ignored* (ADR-014).
- **`params` and `searchParams` are Promises.** So are the params in `sitemap` and image generators.
  Use `next typegen` and the `PageProps<'/route'>` helpers.
- **`next lint` and the `eslint` key in `next.config.ts` are gone.**

### Process lessons that cost real time

1. **Green checks are necessary, not sufficient — look at the thing** (ADR-017). Phase 1 passed
   typecheck, lint, contrast and a clean build while shipping a doubled `<title>`, a one-size
   favicon and two logo geometry defects.
2. **Verify an edit landed by measuring its effect, not by the edit succeeding.** Prettier's
   Tailwind class sorting silently no-ops string replacements against source you have not re-read.
3. **Write the audit before the content, and run it often.** 191 violations found at once is
   recoverable; 191 found at launch is not.

---

## 9. The working rhythm (non-negotiable)

1. Open `PROGRESS.md`. Find the first phase not marked ✅ Complete.
2. Open `docs/phases/phase-NN-*.md`. Work the deliverable checklist top to bottom.
3. Tick each deliverable in the phase file as you finish it (`- [ ]` becomes `- [x]`).
4. When every deliverable is ticked and the acceptance criteria pass, **fill in the Phase Summary
   block at the bottom of the phase file.** This block is what a future session reads instead of
   re-deriving the work. It is mandatory.
5. Update the status row and the session log in `PROGRESS.md`, and log any non-obvious choice in
   `docs/DECISIONS.md`.
6. Commit with `phase(NN): <what changed>`.

**Never start phase N+1 while phase N's summary block is empty.** That is exactly how context is
lost, and this whole documentation system exists to prevent it.

## 10. Status legend used everywhere

| Symbol | Meaning |
| --- | --- |
| ⬜ Not Started | No work begun |
| 🟨 In Progress | Actively being built |
| 🟦 Blocked | Waiting on a decision or dependency (state which) |
| 🟧 Review | Built, awaiting verification against acceptance criteria |
| ✅ Complete | All deliverables ticked, acceptance criteria pass, summary written |
| ⏸️ Deferred | Consciously postponed (state to which phase) |

## 11. Vocabulary — use these words consistently

| Term | Means |
| --- | --- |
| **Workspace** | A group's private collaboration space: tasks, files, discussion, meetings, ledger. |
| **Project Page** | The structured record of a project: problem → research → solution → prototype → testing → result. Private, college-only or public. |
| **Milestone** | A dated checkpoint inside a project, owned by a member, closed with a peer review. |
| **Attestation** | A named faculty member vouching for a specific contribution or project outcome. |
| **Lineage** | The recorded parent/child relationship when a group builds on a previous project. |
| **Idea** | A pre-project proposal in the Idea Hub, status Idea → Looking for Team → In Development → Testing → Completed. |
| **Archive** | The permanent, citable, read-only record of a completed project. |
| **Ledger** | The per-member contribution record inside a workspace. |
