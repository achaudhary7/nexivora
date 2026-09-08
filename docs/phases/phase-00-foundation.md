# Phase 0 — Foundation & Project Setup

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Nothing |
| **Blocks** | Every other phase |
| **Estimate** | 4 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Stand up the repository, the toolchain and the documentation system so that every later phase has
somewhere obvious to put its work, and so no context is ever lost between sessions. Nothing
user-facing ships beyond a styled placeholder — that is correct and intentional.

## In scope

- Next.js 16 App Router + TypeScript scaffold
- Tailwind CSS v4 with the complete design token system declared
- ESLint, Prettier, TypeScript strict mode, path aliases
- Folder architecture for all twenty phases
- Environment variable handling with runtime validation
- PostgreSQL running locally and reachable (no schema yet)
- Git repository with correct ignores and a first commit
- The complete documentation set and the phase-tracking system

## Out of scope

- Any component beyond a placeholder (Phase 1)
- Any page content (Phase 2)
- The Prisma schema (Phase 3) — no ORM dependency is installed yet

## Deliverables

### Repository & tooling
- [ ] `app/` scaffolded with Next.js 16 (App Router), TypeScript, Tailwind v4, `src/` directory, `@/*` alias
- [ ] `tsconfig.json` on `strict: true` with `noUncheckedIndexedAccess`
- [ ] ESLint configured (`next/core-web-vitals` + TypeScript rules)
- [ ] Prettier with the Tailwind class-sorting plugin
- [ ] `package.json` scripts: `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `check`
- [ ] `.gitignore` covering `node_modules`, `.next`, `.env*`, `.uploads`, build output
- [ ] Git repository initialised at `Nexivora/`, first commit made
- [ ] `.editorconfig` and `.nvmrc` (Node 22)

### Architecture
- [ ] Folder skeleton created with a `.gitkeep` carrying a one-line purpose comment:
      `src/app/{(marketing),(public),(auth),(app),api}`,
      `src/components/{ui,layout,marketing,project,workspace,feed,icons,illustrations}`,
      `src/lib/{seo,auth,authz,db,search,ledger,feed,matching,notifications,realtime,storage,analytics,ai,validators,utils}`,
      `src/{config,content,types,styles}`, `prisma`, `public`, `scripts`, `tests/{unit,e2e}`
- [ ] `src/config/site.ts` — single source of truth for name, tagline, URLs, social, contact
- [ ] `src/config/navigation.ts` — every nav item with a `planned` flag so nav never links to a 404
- [ ] `src/lib/env.ts` — Zod-validated environment access, fails loudly at boot naming the variable
- [ ] `.env.example` committed with every variable the project will need, each documented
- [ ] `src/app/layout.tsx` root layout: fonts, theme class, skip link, base metadata, icons
- [ ] `src/app/page.tsx` placeholder that proves the token system and fonts work
- [ ] `src/lib/seo/metadata.ts` — `buildMetadata()` helper (unused this phase, used by every page after)
- [ ] `src/lib/utils/cn.ts`
- [ ] `next.config.ts` with `output: 'standalone'` and the security headers from `docs/SECURITY.md`
- [ ] `src/styles/globals.css` — the **complete** token system: colour ramps, semantic layer, tier
      colours, typography scale, spacing, radius, shadow, motion, z-index; light, dark and
      `prefers-reduced-motion`

### Database (setup only)
- [ ] PostgreSQL 16 running locally, `nexivora` database created
- [ ] `pg_trgm` and `unaccent` extensions installed and verified with a query
- [ ] `DATABASE_URL` in `.env` and validated by `lib/env.ts`
- [ ] Both setup paths (Docker and Windows installer) verified and written into `docs/DEPLOYMENT.md`

### Documentation
- [ ] `CONTEXT.md` — the read-first orientation file
- [ ] `PLAN.md` — the master phase plan
- [ ] `PROGRESS.md` — the live status board
- [ ] `README.md`
- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/DATA-MODEL.md`
- [ ] `docs/ROLES-PERMISSIONS.md`
- [ ] `docs/DESIGN-SYSTEM.md`
- [ ] `docs/SEO-CHECKLIST.md`
- [ ] `docs/PERFORMANCE.md`
- [ ] `docs/SECURITY.md`
- [ ] `docs/DEPLOYMENT.md`
- [ ] `docs/DECISIONS.md` with ADR-001 … ADR-013 recorded
- [ ] `docs/SITEMAP.md`
- [ ] `docs/BUSINESS-MODEL.md`
- [ ] `docs/PITCH.md`
- [ ] All twenty `docs/phases/phase-NN-*.md` specs

## Acceptance criteria

1. `npm run dev` starts and serves a styled page at `http://localhost:3000` with no console errors.
2. `npm run build` completes with no errors and no type errors.
3. `npm run lint` reports zero problems.
4. Deleting a required variable from `.env` makes the app fail at boot with a message naming that
   variable — not a mystery runtime crash three screens in.
5. `psql $DATABASE_URL -c "SELECT similarity('nexivora','nexivore');"` returns a number, proving
   `pg_trgm` is really installed.
6. Every file listed in `CONTEXT.md` §8 exists.
7. Dark mode inverts correctly on the placeholder page, driven only by tokens.
8. A new reader can open `CONTEXT.md` and know what to do next without asking anyone.

## Key files this phase creates

```
src/config/site.ts          Product identity — imported everywhere, hard-coded nowhere
src/config/navigation.ts    Route registry with planned flags
src/lib/env.ts              Validated environment access
src/lib/seo/metadata.ts     buildMetadata() — no page ever hand-writes SEO tags
src/app/layout.tsx          Root layout, fonts, theme, base metadata
src/styles/globals.css      The complete design token system
next.config.ts              Standalone output, security headers
.env.example                The environment contract
```

## Notes & risks

- **Do not skip `src/config/site.ts`.** Hard-coding the product name in forty files is the single
  most common way a project like this becomes painful to rename or white-label later — and
  white-labelling per college is on the roadmap.
- **Declare the full token system now, not a stub.** Phase 1 builds every component against these
  tokens; half a token system means rewriting each component twice. This is worth the extra hour.
- Tailwind v4 moves configuration into CSS (`@theme`). If the scaffold generates a v3-style
  `tailwind.config.ts`, keeping it for plugin registration is fine, but **tokens live in CSS**.
- Next 16 has breaking changes from 15. Check `node_modules/next/dist/docs/` before writing
  routing or metadata code rather than assuming Next 14/15 conventions.
- Keep the placeholder homepage genuinely minimal. The temptation to start designing here is
  strong; resist it, because Phase 1 replaces it entirely.
- **Deferred installs, each to its own phase:** Radix (1), Prisma (3), Auth.js + bcrypt (4),
  Tiptap (8), Recharts (15), @react-pdf/renderer + qrcode (12), Nodemailer (4), Vitest (4),
  Playwright (16). No dependency arrives before the phase that uses it.

---

## Phase Summary

*Fill this in when the phase is complete. It is mandatory — a future session reads this instead of
re-deriving the work.*

**What was built.**

**Key decisions made.**

**Files and directories created.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
