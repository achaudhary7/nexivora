# Architecture Decision Record

Every non-obvious choice, with its reasoning and what it costs. Append, never rewrite. If a
decision is reversed, add a new ADR that supersedes it and mark the old one.

Format: **Context → Decision → Consequences.**

---

## ADR-001 — Next.js 16 App Router with TypeScript

**Status:** Accepted · 2026-09-08

**Context.** SEO is a hard requirement and most of the product is dynamic. A client-rendered SPA
would put every public page into Google's rendering queue, which `SEO Basic.txt` describes as a
separate, deferred phase of indexing.

**Decision.** Next.js 16 App Router, TypeScript strict with `noUncheckedIndexedAccess`, Server
Components by default.

**Consequences.** Public pages ship real HTML on the first response. Route-level code splitting,
per-route metadata and image/font optimisation come free. The cost is the mental overhead of the
server/client boundary, which is real but is exactly the boundary we want to think about anyway.
`noUncheckedIndexedAccess` will occasionally be irritating and will catch the class of bug that
breaks a demo.

---

## ADR-002 — Prisma as the ORM, pinned

**Status:** Accepted · 2026-09-08

**Context.** Sixty models, real migration history, and a seed script that must rebuild a demo world
reliably.

**Decision.** Prisma, with the version pinned exactly in `package.json` — not a caret range.

**Consequences.** Type-safe queries and a real migration history. **Pinning is deliberate:**
Prisma's `latest` dist-tag has previously pointed at a release candidate, and a major version has
moved the datasource URL and required a driver adapter. An ORM upgrade should be an intentional
piece of work, never something `npm install` does to you on a Tuesday. Raw SQL is used for the
full-text search path, where Prisma's query builder cannot reach the GIN index.

---

## ADR-003 — PostgreSQL in development *and* production, not SQLite-then-MySQL

**Status:** Accepted · 2026-09-08 · **Supersedes the pattern used in the KaushalSetu project**

**Context.** The reference project used SQLite in development and MySQL in production, abstracted
by Prisma. That works when the database is a plain store. It does not work here, because two of
Nexivora's core features are database features:

1. **Global search** across projects, people, ideas and posts, which needs `tsvector` + GIN.
2. **Duplicate-project detection**, which needs `pg_trgm` trigram similarity.

Neither exists in SQLite. Developing against SQLite would mean the two most important queries in
the product are stubbed locally and first executed in production.

**Decision.** PostgreSQL 16 everywhere. Local via Docker or the Windows installer.

**Consequences.** One more setup step for a new developer, documented in `docs/DEPLOYMENT.md` with
two paths. In exchange: search and similarity are real from Phase 3, dev matches production, and
`ILIKE`, `unaccent`, JSONB, arrays, partial indexes and `LISTEN/NOTIFY` are all available. The
`LISTEN/NOTIFY` point matters later — it is the multi-process upgrade path for realtime without
adding Redis.

**Rejected:** Supabase and Firebase — both are excellent until the pricing cliff arrives exactly
when the product succeeds, and both make the "self-hosted on a cheap VPS" story impossible.

---

## ADR-004 — Auth.js v5 with credentials, not a hosted identity provider

**Status:** Accepted · 2026-09-08

**Context.** Auth0, Clerk and WorkOS all price per monthly active user. A college pilot is
thousands of MAU on day one, which is precisely the audience these products charge for.

**Decision.** Auth.js v5, credentials provider, JWT sessions, bcrypt. Institutional email domain
verification is the trust mechanism. Google OAuth is deferred to Phase 16 as a convenience.

**Consequences.** No per-user cost, ever, and no external dependency in the login path. We own
password storage, reset flows and rate limiting — all specified in `docs/SECURITY.md`. Deferring
OAuth is deliberate: allowing any Gmail account to sign in would undermine the institutional trust
gate, which is the thing that makes the network credible.

---

## ADR-005 — Server-Sent Events for realtime, not WebSockets

**Status:** Accepted · 2026-09-08

**Context.** Notifications, presence and new-message indicators need to reach the client without a
refresh. The obvious answer is Socket.io.

**Decision.** SSE (one long-lived `GET /api/sse` per user) for server→client, ordinary server
actions for client→server, and polling for chat message lists. All behind `lib/realtime/`.

**Consequences.** No second server process, no sticky-session configuration, no extra dependency,
and it survives a plain Nginx reverse proxy — *provided* `proxy_buffering off` is set on that
route, which is the classic way this breaks and is therefore in the runbook. SSE is
unidirectional, which is fine because every client→server action already has a server action.
The upgrade path, if it is ever needed, is one file: swap the in-process emitter for Postgres
`LISTEN/NOTIFY`, then for Socket.io if genuinely required.

---

## ADR-006 — The feed is anchored, not free-form

**Status:** Accepted · 2026-09-08 · **This is a product decision with architectural consequences**

**Context.** The brief asks for an "academic feed" where users post updates, ideas, achievements
and questions. Every student-network product that has shipped this has watched it die: without the
social pressure of a consumer network, nobody posts, the feed is empty, and an empty feed makes the
whole product feel abandoned.

**Decision.** Every post **must** reference an anchor — a project, an idea, a question or a
resource — enforced by a database check constraint, not by convention. And posts are created two
ways: authored by a user, or **generated** from a domain event (milestone closed, prototype
uploaded, project published) through the same `createPost()` path.

**Consequences.** The feed is never empty, because using the product fills it. Content is
inherently about something, so it is inherently useful and inherently linkable. The cost is that
"just saying something" is impossible — and that is the point. If we later want a discussion
surface, it is the Questions type, which is already an anchor.

---

## ADR-007 — The Contribution Ledger is append-only and transactional

**Status:** Accepted · 2026-09-08

**Context.** The ledger's entire value is that it can be trusted. A record that can drift from the
actions that produced it is worse than no record, because it looks authoritative.

**Decision.** `LedgerEvent` is append-only, and every event is written **inside the same database
transaction** as the action that produced it. Closing a task writes the task update and the ledger
event together, or neither happens. Event weights live in `config/ledger.ts`, never at the call
site.

**Consequences.** The ledger cannot be retroactively edited, and it cannot disagree with the
workspace. Corrections are new compensating events, not mutations — the same discipline
accounting uses, for the same reason. Weights being configuration means they can be tuned against
real usage without a migration, which they will need to be.

---

## ADR-008 — Peer reviews are private in one direction

**Status:** Accepted · 2026-09-08

**Context.** Peer review of group members is the mechanism for surfacing free-riding. It only
works if people answer honestly, and people do not answer honestly when the person they are rating
will read it tomorrow.

**Decision.** A member sees **only the aggregate** of reviews about them, and never who said what.
Faculty see the full detail. A member always sees their own submitted reviews.

**Consequences.** Honest reviews become possible. The cost is that a malicious low rating is harder
for the rated member to contest — mitigated because faculty see the detail and the ledger provides
an objective cross-check that does not depend on anyone's opinion.

---

## ADR-009 — Project sections are rows, not a JSON blob

**Status:** Accepted · 2026-09-08

**Context.** A project record has nine sections. The easy schema is one `content` JSON column.

**Decision.** One `ProjectSection` row per section, with an enum for the section kind.

**Consequences.** Faculty can leave feedback on a single section. Each section has its own edit
history, word count and completion state, so "project progress" is computable rather than guessed.
The public page renders real `<h2>` blocks, which is what makes a project page eligible for
featured snippets. And a half-finished project is a partial set of rows rather than an
unparseable object. The cost is more joins, handled with a single `include`.

---

## ADR-010 — Visibility is data; indexability is derived

**Status:** Accepted · 2026-09-08

**Context.** A student project can be private, group-only, class-only, college-only or public, and
can additionally be under an IP embargo. Search-engine indexability must follow from that, and it
must be impossible for the two to disagree.

**Decision.** `noindex` and sitemap inclusion are **computed** from `visibility` and `embargoUntil`
by one function, `resolveVisibility()`. No page sets robots directives independently.

**Consequences.** A private project cannot leak into the sitemap through a forgotten flag, which is
a privacy failure as much as an SEO one. The cost is that every public page must call the resolver
— enforced by `scripts/check-seo.mjs`, which crawls the sitemap and asserts nothing non-public
appears in it.

---

## ADR-011 — All imagery is SVG, including avatars and project covers

**Status:** Accepted · 2026-09-08

**Context.** A network product wants imagery everywhere, and imagery normally means uploads,
storage, resizing, CDN cost and licensing.

**Decision.** Every image is SVG. Icons are inline components. Illustrations are components.
**Avatars default to a deterministic SVG identicon generated from the user id.** **Project covers
are generated SVG** from the project's domain colour, title and SDG icons. OG images are generated
at request time from the same visual language.

**Consequences.** Zero raster assets, zero image-optimisation pipeline, zero licence risk, zero
CLS, perfect scaling, and free theming through `currentColor`. Critically, **every project looks
intentional with no upload effort** — which removes the single biggest reason a student would leave
a project page looking half-finished. The cost is that the illustration style must be geometric
rather than figurative, which is a constraint the design system embraces rather than fights.

---

## ADR-012 — Deterministic first, AI last

**Status:** Accepted · 2026-09-08

**Context.** AI credits are scarce, and an AI feature that fails takes its whole surface down with
it.

**Decision.** Every intelligent-seeming feature ships a deterministic implementation first:
teammate matching is skill-overlap arithmetic with a visible explanation; search is Postgres FTS;
similarity is trigram plus Jaccard; feed ranking is a scoring function; the assistant is a command
palette over a structured route and help index. Phase 18 layers AI **on top**, behind an
`AIProvider` interface with a `NullProvider` fallback, response caching, per-user quotas and a hard
global budget cap.

**Consequences.** `AI_ENABLED=false` is a fully working product, not a degraded one. Every
recommendation is explainable, which matters enormously when a faculty member asks why a student
was suggested for a team. Running out of credits mid-demo changes quality, not function.

---

## ADR-013 — Go to market as a tool, not as a network

**Status:** Accepted · 2026-09-08 · **The most important non-technical decision here**

**Context.** A social network with no users is worthless to its first user. Nexivora's cold-start
problem is severe: profiles, feed and discovery are all worth nothing on day one.

**Decision.** **We do not launch as a network.** We launch as a tool that a single class uses for a
single semester: the group workspace and the faculty dashboard. Those are valuable to a group of
five people with nobody else on the platform. The feed, discovery, archive and network effects
accumulate as a by-product.

**Consequences.** This is why Phase 7 (workspace) is the largest phase and why Phase 10 (feed)
comes after it rather than before. It is also why the first sales conversation is with one faculty
member and not with a Vice-Chancellor. Full reasoning in `docs/BUSINESS-MODEL.md`.

---

## ADR-014 — Next.js 16 breaking changes, verified against the bundled docs

**Status:** Accepted · 2026-09-08 · Discovered during Phase 0

**Context.** `create-next-app@latest` installed **Next.js 16.3.4** with React 19.2.8, not the 15.x
these plans were written against. The scaffold also writes an `AGENTS.md` warning that "this is NOT
the Next.js you know" and pointing at `node_modules/next/dist/docs/`. Those docs were read rather
than assumed, and they contain four changes that directly affect phases not yet built.

**Decision.** Adopt 16.3.4 and correct the plan now, rather than discovering each change mid-phase.

**The changes that matter to us:**

1. **Middleware is now Proxy.** The file is `src/proxy.ts` and the export is `proxy`. Behaviour is
   unchanged. **A `middleware.ts` file is silently ignored** — which would have looked like a broken
   auth guard in Phase 4 rather than a missing file. `docs/phases/phase-04-auth-rbac.md` and
   `docs/ARCHITECTURE.md` are corrected.
2. **Async request APIs are now mandatory.** `params`, `searchParams`, `cookies()`, `headers()` and
   `draftMode()` are Promises; the synchronous compatibility shim from 15 is gone. This affects
   every dynamic route from Phase 2 onward. `next typegen` generates `PageProps<'/route'>`,
   `LayoutProps` and `RouteContext` helpers — use them rather than hand-writing prop types.
3. **`opengraph-image` and `sitemap` generators also receive Promises** for `params` and `id`.
   Phase 2 builds both, so this is a Phase 2 note, not a footnote.
4. **`next lint` and the `eslint` key in `next.config.ts` are removed.** Linting is a separate step;
   `npm run lint` calls `eslint` directly and `npm run check` chains it. Leaving the config key in
   place is a type error, which is how this was found.

**Consequences.** Turbopack is the default bundler, so builds are fast (41s cold). React 19.2 brings
View Transitions and `useEffectEvent`, neither of which we need yet. The real cost is that training
data and most tutorials describe Next 14/15 conventions — so **read
`node_modules/next/dist/docs/` before writing routing, metadata or proxy code**, in every phase, not
just this one.

---

## ADR-015 — Filled controls use explicit `*-fill` tokens, not ramp steps

**Status:** Accepted · 2026-09-08 · Discovered by measurement in Phase 0

**Context.** The token system originally paired white text with `accent-600` and `highlight-600` for
filled buttons. The contrast audit measured those pairs at **3.68:1** and **3.19:1** — both below the
4.5:1 AA requirement for body text. Then, after correcting them, the amber fill itself measured
**2.15:1** against a white surface, failing the 3:1 requirement for UI boundaries (WCAG 1.4.11).

Neither failure is visible to the eye. Both would have shipped.

**Decision.** Three things:

1. Introduce `--color-primary-fill`, `--color-accent-fill` and `--color-highlight-fill`. **A
   component never picks its own ramp step for a filled background** — it uses these, so a fill and
   its foreground cannot drift apart.
2. Accent fills use the 700 step with white (5.36:1). Highlight fills use the 500 step with a very
   dark brown foreground (7.11:1), which is also the better-looking amber.
3. A highlight-filled control **always** carries `--color-highlight-fill-border`, because a bright
   amber cannot define its own edge against white.

**Consequences.** 94 measured pairs now pass in both themes. The audit runs in `npm run check` and
fails the run on any regression, so this cannot silently come back. The wider lesson is the one the
design system already states and this phase confirmed: **measure contrast, do not eyeball it.**

---

## ADR-016 — The theme is external state, read with `useSyncExternalStore`

**Status:** Accepted · 2026-09-08 · Phase 1

**Context.** The first implementation mirrored `localStorage` into `useState` inside a mount effect.
React 19's `react-hooks/set-state-in-effect` rule rejected it, correctly: that pattern causes a
cascading render on every mount, and it does not react to the theme changing anywhere else.

**Decision.** The theme is read with `useSyncExternalStore`, subscribing to both the `storage` event
and the `prefers-color-scheme` media query. The inline `themeInitScript` still stamps `data-theme`
on `<html>` before first paint — that part is not optional, and it is what prevents the flash.

**Consequences.** No cascading render, and **two open tabs now stay in step**, which the effect
version did not do. The server snapshot is `"system"`, which is safe because the markup it produces
is theme-neutral: the actual theme comes from the init script and from CSS media queries, never from
the React tree.

**The wider lesson**, which applies to Phases 7, 10 and 18: when this lint rule fires, it is usually
pointing at genuinely external state. Suppressing it would have hidden a real defect.

---

## ADR-017 — Verify the design visually, and keep the tool

**Status:** Accepted · 2026-09-08 · Phase 1

**Context.** Phase 1 passed typecheck, lint, the contrast audit and the build on the first attempt.
It still contained four real defects, none of which any of those checks can see:

1. `<title>Style guide · Nexivora · Nexivora</title>` — the root layout's title *template* applying
   on top of `buildMetadata`'s own suffix. **This would have hit all ~45 Phase 2 pages.**
2. `favicon.ico` silently containing one size instead of three — Pillow's ICO writer ignores
   `append_images` and derives entries by downscaling whatever image it is given.
3. The stacked lockup's wordmark off-centre by about six units.
4. The horizontal lockup carrying roughly 24% dead trailing space in its viewBox.

**Decision.** A visual pass is part of a phase's verification, not an optional extra. `npm run shot`
(`scripts/screenshot.mjs`) drives Chrome over the DevTools Protocol and captures a route full-page
in light and dark.

CDP rather than Chrome's `--screenshot` flag, for two reasons that are not preferences: only CDP can
emulate `prefers-color-scheme` (the obvious-looking
`--blink-settings=preferredColorScheme=2` renders a blank page), and only CDP can capture beyond the
viewport.

**Consequences.** Dark mode and long pages are now verifiable, and Phases 2 and 16 both need exactly
this. The cost is a development-only script and a `.screenshots/` directory that is gitignored.

**The rule this sets:** *green checks are necessary, not sufficient.* Look at the thing.
