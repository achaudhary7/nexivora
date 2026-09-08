# Phase 5 — Institution Backbone

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 4 |
| **Blocks** | Phases 7, 9, 15 |
| **Estimate** | 8 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Make a real college representable and manageable. Without this, groups have nothing to belong to,
faculty have nothing to teach, and the accreditation export has nothing to report on. It is
unglamorous and it is load-bearing.

## In scope

- The college admin console: departments, programmes, subjects, terms, classes
- Faculty assignment and the student roster
- Bulk CSV import with a dry-run preview
- Invitations, join codes and role assignment
- College profile, branding and the verification request
- The audit log
- The platform admin verification queue

## Out of scope

- Analytics and accreditation exports (Phase 15) · Inter-college anything (Phase 14)

## Deliverables

### Hierarchy management — `/admin/*`
- [ ] `/admin` — overview: counts, pending invitations, verification state, recent audit entries
- [ ] `/admin/departments` — CRUD, head assignment, code and description
- [ ] `/admin/programmes` — CRUD, linked to a department, with duration and degree type
- [ ] `/admin/subjects` — CRUD, code, credits, programme and semester
- [ ] `/admin/terms` — academic sessions with start and end dates, and **exactly one active term**
- [ ] `/admin/classes` — create a class from (subject × term × section), assign faculty, enrol
      students
- [ ] `/admin/classes/[id]` — roster, assigned faculty, groups formed, project count
- [ ] Cascade rules stated and enforced: a department with programmes cannot be deleted; archive
      instead of delete anywhere history matters

### People management
- [ ] `/admin/people` — searchable, filterable roster (role, department, programme, year, state)
- [ ] Per-person detail: memberships, enrolments, groups, projects, activity
- [ ] Role assignment and change, with a forced token refresh (see the Phase 4 note)
- [ ] Suspend and reinstate, with a required reason recorded in the audit log
- [ ] Alumni transition — bulk, by graduating batch. **Workspace access ends; project authorship
      and portfolio persist forever.**

### Bulk import
- [ ] `/admin/people/import` — CSV upload with a downloadable template
- [ ] Column mapping UI (real CSVs never match the template)
- [ ] **Dry-run preview showing exactly what will be created, updated and skipped, with per-row
      errors, before anything is written.** No import commits without this step.
- [ ] Duplicate detection by email and roll number
- [ ] Import runs in a transaction; a partial failure rolls back
- [ ] Import history with a downloadable error report
- [ ] The same pattern reused for the class-enrolment import

### Invitations & joining
- [ ] `/admin/invitations` — issue by email (single or bulk), with role and scope
- [ ] Invitation states: pending, accepted, expired, revoked; 14-day expiry; resend
- [ ] Join codes per class and per college, rotatable, with an optional usage cap
- [ ] `/join/[inviteCode]` — public landing that resolves the code, shows what is being joined, and
      routes to register or login
- [ ] Rate limit: 200 invitations per day per admin

### College profile & verification
- [ ] `/admin/college` — name, code, logo (SVG upload), accent colour, address, website,
      description, email domains, timezone
- [ ] Public college page (Phase 2's `/colleges/[slug]`) now reads from the database
- [ ] Verification request flow: submit institutional evidence → pending → verified or rejected
- [ ] **Until verified: nothing from the college is publicly indexable and it does not appear in
      inter-college surfaces.** This is the anti-abuse gate and it must actually work.
- [ ] `/platform` — the platform admin verification queue: review, approve, reject with a reason

### Audit log
- [ ] `lib/audit.ts` — `logAudit(actor, action, subject, before, after)`
- [ ] Called from **every** administrative mutation in this phase
- [ ] `/admin/audit-log` — filterable by actor, action, subject and date; CSV export
- [ ] Append-only: no update or delete path exists in the client wrapper

## Acceptance criteria

1. An admin builds a department, a programme, a subject, a term and a class, and enrols 50 students
   from a CSV, in one sitting without documentation.
2. The CSV dry-run correctly reports errors for a file with three deliberately malformed rows, and
   writes nothing.
3. A committed import of 500 rows completes in under 10 seconds.
4. An invitation email arrives (console transport), the link resolves, and the invitee lands in the
   right college with the right role.
5. An unverified college's projects carry `noindex` and are absent from the sitemap.
6. Every mutation in this phase appears in the audit log with the correct actor and diff.
7. A college admin cannot see or modify another college's data — verified by the Phase 4 test suite
   extended to these routes.
8. Suspending a member makes them read-only immediately, without a re-login.
9. The alumni transition preserves every project and portfolio entry.

## Key files this phase creates

```
src/app/(app)/admin/*            11 admin routes
src/app/(app)/platform/*         Verification queue
src/app/join/[code]/page.tsx     Public invite landing
src/lib/db/queries/institution.ts
src/lib/import/csv.ts            Parse, map, validate, dry-run, commit
src/lib/audit.ts                 logAudit() — called by every admin mutation
src/lib/invitations.ts
```

## Notes & risks

- **The dry-run preview is the single most important feature in this phase.** A bulk import that
  silently creates 500 wrong records is the fastest way to lose a college's trust permanently, and
  it is unrecoverable without a restore.
- **Real CSVs are messy.** Excel exports with a BOM, non-breaking spaces, `Roll No.` vs `RollNo`,
  smart quotes, blank trailing rows. Handle them, and test with a genuinely ugly file rather than
  one you generated.
- **Term is a model, not a string.** Every analytic and every accreditation report rolls up to a
  term; a text field here makes Phase 15 impossible.
- Archive, do not delete. A deleted subject orphans projects, evaluations and history. Archiving
  hides it from pickers while keeping every reference intact.
- The verification gate must be enforced in `resolveVisibility()`, not only in the UI — otherwise
  an unverified college's project leaks into the sitemap.
- A role change must invalidate the JWT. If it does not, an admin will change a role, nothing will
  happen, and the bug will look like a caching problem for an hour.
- This phase has a lot of similar forms. **Build one `ResourceForm` pattern and reuse it** rather
  than writing eleven near-identical pages.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.**

**Key decisions made.**

**Import edge cases found and handled.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
