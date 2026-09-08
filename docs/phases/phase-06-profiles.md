# Phase 6 — Profiles & Academic Identity

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 5 |
| **Blocks** | Phases 10, 11, 12, 13 |
| **Estimate** | 7 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Give every user an academic identity that is worth having: rich enough to be useful, private by
default, and — critically — **backed by evidence rather than self-declaration.**

## In scope

- Student, faculty, alumni, company and researcher profiles
- The public `/p/[username]` page, now database-backed
- Granular privacy controls, all defaulting to private
- The project-inferred skill graph (the inference, not yet the projects)
- The follow model
- Profile completeness and the generated avatar

## Out of scope

- Portfolio export (Phase 12) · Attestations (Phase 9) · Mentorship (Phase 13)

## Deliverables

### Profile editing — `/settings/profile`
- [ ] Shared fields: display name, username, headline, bio, avatar, cover, links, location, pronouns
- [ ] **Username rules:** 3–30 characters, lowercase, unique, immutable after 30 days, checked
      against a reserved blocklist (`admin`, `api`, `settings`, `p`, `explore`, …) so a username can
      never shadow a route
- [ ] Student: department, programme, year, roll number (private by default), interests, skills,
      education, achievements, availability for teams
- [ ] Faculty: designation, department, subjects taught, expertise areas, qualifications,
      publications, research interests, mentorship availability, office hours
- [ ] Alumni: graduation year, programme, current organisation and role, industry, mentorship
      availability
- [ ] Company: name, logo, industry, size, website, description, focus areas, locations
- [ ] Researcher: affiliation, field, ORCID, publications, collaboration interests
- [ ] Autosave with a clear saved indicator; no lost work on navigation
- [ ] Profile completeness meter with the specific next action, not just a percentage

### Privacy — `/settings/privacy`
- [ ] Per-field visibility: `PUBLIC · COLLEGE · CONNECTIONS · PRIVATE`
- [ ] **Everything defaults to the most private useful setting.** Public profile is opt-in.
- [ ] Master toggles: discoverable in search · contactable by companies · appear in college
      directory · show in project credits · email digest
- [ ] Plain-language explanation beside each control of exactly what it exposes and to whom
- [ ] A live preview: "this is what a logged-out visitor sees" and "this is what a classmate sees"

### The public profile — `/p/[username]`
- [ ] Database-backed, replacing the Phase 2 fixtures
- [ ] Sections: header, about, skills with evidence, projects, achievements, activity, college
- [ ] `Person` + `ProfilePage` JSON-LD, matching the visible content
- [ ] Robots directives derived from privacy settings via `resolveVisibility()` — a private profile
      is `noindex` **and** absent from the sitemap
- [ ] `data-nosnippet` on any contact detail
- [ ] A private profile renders a dignified "this profile is private" page, not a 404 — and does not
      confirm whether the username exists
- [ ] Generated OG image per profile

### The skill graph
- [ ] `UserSkill` carries `source`: `SELF · PROJECT_INFERRED · ATTESTED`
- [ ] `lib/skills/infer.ts` — derives skills from a user's projects: tech stack, domain, declared
      role in the project, and tasks completed
- [ ] Inferred skills link to the evidence: "React — from 3 projects" with the projects named
- [ ] Self-declared skills are visually distinct from inferred and attested ones
- [ ] Recomputed on project completion, not on every page load
- [ ] Skill detail: proficiency signal, source breakdown, and the projects that produced it

### Following
- [ ] Polymorphic `Follow` over `USER · PROJECT · TOPIC · COLLEGE · GROUP`
- [ ] Follow/unfollow with optimistic UI
- [ ] Followers and following lists, respecting privacy
- [ ] Follow counts denormalised on the profile row
- [ ] Suggested follows: classmates, faculty who teach you, projects in your interests — all
      deterministic and explainable

### Avatars
- [ ] `generateAvatar(userId)` from Phase 1 wired as the default for every user
- [ ] Upload replaces it: SVG or raster, cropped square, size-capped, served through the signed
      file route
- [ ] Faculty and verified accounts carry a verification mark in `Avatar`

## Acceptance criteria

1. A student completes a profile from empty to 100% without documentation.
2. Every privacy toggle is honoured on the public page — verified by fetching `/p/[username]`
   logged out and asserting the hidden fields are absent from the **HTML**, not merely hidden by CSS.
3. A private profile is `noindex` and absent from the sitemap.
4. A public profile renders fully with JavaScript disabled and passes the Rich Results Test.
5. Skills inferred from seeded projects appear with correct evidence links.
6. A username cannot be taken that would shadow an existing route.
7. Follow state updates optimistically and survives a reload.
8. The generated avatar is stable for a given user across reloads and processes.
9. `npm run check` clean.

## Key files this phase creates

```
src/app/(public)/p/[username]/page.tsx    The public profile — indexable, structured
src/app/(app)/settings/profile/page.tsx
src/app/(app)/settings/privacy/page.tsx
src/lib/db/queries/profile.ts
src/lib/skills/infer.ts                   Skills from evidence, not from claims
src/lib/follow.ts
src/config/reserved-usernames.ts
```

## Notes & risks

- **Hidden must mean absent from the HTML.** Rendering a private field and hiding it with CSS is a
  data leak that a crawler and a "view source" both defeat. Filter at the query, not at the view.
- **Do not confirm existence of a private profile.** The private-profile page must be identical for
  "exists but private" and "does not exist", or it becomes a username enumeration oracle.
- The skill graph is the feature that makes profiles credible. A self-declared skill list is a CV;
  a skill that says "from 3 projects" with the projects linked is evidence. Do not let the
  self-declared path dominate the UI.
- Recompute inferred skills on a project state change, not on render. It is a join-heavy query and
  it will show up on the profile page's LCP if it runs inline.
- Privacy defaults matter more than privacy features. A student who discovers their roll number was
  public will not forgive it, and the DPDP position is that consent must be specific and opt-in.
- Username immutability after 30 days protects the public URL, which is a real SEO and sharing
  asset. Say so on the form rather than just enforcing it.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.**

**Key decisions made.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
