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

---

## ADR-018 — Type scale has a measured usage ceiling, enforced by an audit script

**Status:** Accepted · 2026-09-09 · Phase 1 correction

**Context.** The Phase 1 home page shipped an h1 at **60px** on desktop (`lg:text-6xl`), a 156px gap
between the header and the first content, and `Section` padding of 112px. Reviewed on a real screen
it read as oversized and brochure-like — the consumer-marketing register, not the "credible academic
infrastructure" the design intent calls for.

The report that surfaced it was a screenshot from a browser running at ~133% zoom, which is exactly
why this needed measuring rather than arguing: a screenshot cannot separate *"the type is too
large"* from *"the browser is zoomed"*. Both were true, and only one was fixable.

**Decision.**

1. `scripts/audit-layout.mjs` (`npm run audit:layout`) drives Chrome over CDP and reports **computed**
   font sizes, section padding, hero offset, document height and horizontal overflow at 390 / 768 /
   1280 / 1536, at a known 100% zoom and dpr 1.
2. `docs/DESIGN-SYSTEM.md` gains a **usage ceiling** table: what the scale defines versus what pages
   may actually use. Hero h1 tops out at 48px; every other h1 at 36px; `6xl` and `7xl` are unused
   and need a stated reason.
3. `Section` padding drops from 64/96/112 to **48/64/80**.

**Measured effect** on the home page:

| | Before | After |
| --- | --- | --- |
| h1 @ 1280 | 60px | **48px** |
| Hero top gap @ 1280 | 156px | **107px** |
| Hero top gap @ 390 | 108px | **76px** |
| Lead @ 390 | 18px | **16px** |
| Document height @ 1280 | 1644px | **1362px** (17% less scrolling) |

**Consequences.** The audit runs on demand rather than in `npm run check`, because it needs a running
dev server. Phase 2 should run it on the home page and one content template before calling itself
done — a type scale that drifts across 45 pages is far more expensive to fix than across two.

**Two process lessons, both worth more than the fix:**

- **Prettier's Tailwind class sorting had already reordered the class strings**, so two of the four
  edits in the first pass silently matched nothing and no-opped. The audit caught it because the
  numbers did not move. *Verify an edit landed by measuring the effect, not by the edit reporting
  success.*
- The same pass exposed an unrelated defect the numbers could not show: with navigation still empty
  in Phase 1, the mobile header rendered **only a theme toggle**, because both auth CTAs were
  `hidden sm:inline-flex`. The primary CTA is now visible at every width.

---

## ADR-019 — OG images come from a route handler, not the file convention

**Status:** Accepted · 2026-09-09 · Phase 2

**Context.** Next's file-based `opengraph-image.tsx` convention is the obvious choice and it failed
here twice, in two different ways:

1. Setting `image: "/projects/{slug}/opengraph-image"` by hand 404s, because **Next content-hashes
   generated image filenames** (`opengraph-image-umay0l`). The URL cannot be constructed.
2. Removing that override and relying on the convention produced **no `og:image` at all on any of
   127 pages** — because `buildMetadata` sets `openGraph`, and setting `openGraph` in a page's
   exported metadata suppresses the file-convention image.

Neither failure is visible in a browser. Both were found by `scripts/check-seo.mjs`.

**Decision.** A route handler at `/api/og` generates the card from query parameters, and
`buildMetadata` constructs that URL for every page. Inputs are length-capped and the accent colour
is restricted to the contrast-checked domain set, because the endpoint renders whatever it is given.

**Consequences.** Every page gets a tailored card with no per-route file, a URL that can be
constructed and asserted, and no hash surprises. The cost is one extra route and losing Next's
automatic image dimensions — so `buildMetadata` states 1200×630 explicitly, which it knows because
the template is fixed.

**The wider rule:** when a framework convention and an explicit API overlap, check which one
actually wins in the rendered output. Both of these looked correct in source.

---

## ADR-020 — Titles drop the brand before they drop the content

**Status:** Accepted · 2026-09-09 · Phase 2

**Context.** The SEO contract caps titles at ~60 characters. Real content titles do not respect
that: *"Scheduling canal water across multiple farms under a shared budget"* is 66 characters before
any suffix, and adding `· Nexivora` costs another 11.

**Decision.** Three rules, in order:

1. **Constructed suffixes are removed.** `{title} — {domain} project`, `{title} — project idea` and
   `{title} — {organisation}` all went. They added no information a reader needed and cost 15–30
   characters each.
2. **`buildMetadata` drops the site-name suffix when it would exceed the limit.** The content title
   is the signal and the brand is not; truncating the signal to keep the brand is the wrong trade,
   and publishers make the same call.
3. **Content titles longer than 60 characters get shortened at the source.** A handful of fixture
   titles were rewritten. This is a content decision, not a technical one, and it belongs in the
   content.

**Consequences.** All 127 titles are unique and within the limit, and the audit enforces it. The
rule that "under ~60 characters" is a display heuristic rather than a penalty is still true — but
having a hard limit and honouring it is more useful than having one and quietly exceeding it.

---

## ADR-021 — Zero-install PostgreSQL for development

**Status:** Accepted · 2026-09-09 · Resolves blocker B-1

**Context.** ADR-003 requires real PostgreSQL in development, because full-text search and `pg_trgm`
duplicate detection are core product features and stubbing them locally means the two most important
queries in the product are first executed in production.

That requirement blocked Phase 3 for three sessions, because every standard way of getting Postgres
onto a Windows machine has friction the owner should not have to absorb:

| Option | Why it was rejected |
| --- | --- |
| EDB installer via `winget` | Needs UAC elevation, cannot run non-interactively, and installs a system service and a Start Menu entry the project did not ask for |
| Docker Desktop | Large install, needs virtualisation enabled in BIOS on some machines, and is a second thing to keep running |
| `embedded-postgres` on npm | A reasonable wrapper around the same binaries, but **every one of its releases is tagged `-beta`**, and a permanently-beta dependency in the dev bootstrap is a risk with no upside |
| SQLite locally | Rejected in ADR-003 and still rejected. It has neither `tsvector` nor `pg_trgm`. |

**Decision.** `scripts/db.mjs` downloads the **official PostgreSQL 16 binaries-only ZIP** — the same
build EDB ships, without the installer — into a gitignored `app/.postgres/`, initialises a cluster,
and runs it as an ordinary user process.

```
npm run db:up        download if needed, init if needed, start, create db + extensions
npm run db:status    is it running, and does pg_trgm actually work
npm run db:down      stop
npm run db:destroy   delete the data directory, keep the binaries
```

Three details that matter:

- **Port 5433, not 5432**, so it can never collide with an existing PostgreSQL install.
- **`listen_addresses = 'localhost'`.** This is a development database on a developer's machine; it
  has no business accepting connections from the network.
- **`db:up` verifies rather than assumes.** It runs `similarity('nexivora','nexivore')` and fails if
  the extension is not genuinely working — a `CREATE EXTENSION` that succeeded is not proof.

**Consequences.** A new developer runs `npm install && npm run db:up && npm run dev` and has real
PostgreSQL 16.8 with real contrib extensions. No installer, no admin rights, no Docker, no beta
dependency. Dev is production, which is the entire point of ADR-003.

The costs, stated plainly: a one-time ~300 MB download, and the script is **Windows-only**. On macOS
and Linux the package manager or the Docker one-liner in `docs/DEPLOYMENT.md` is a better path and
the script says so and exits rather than pretending. Production is unaffected — Phase 17 installs
PostgreSQL normally on the VPS.

**Verified:** PostgreSQL 16.8 running on 5433, database created, `pg_trgm`, `unaccent` and `citext`
installed, and `similarity('nexivora','nexivore') = 0.6363636`.
