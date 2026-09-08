# Phase 4 — Authentication, Roles & RBAC

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 3 |
| **Blocks** | Phases 5–15 |
| **Estimate** | 7 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Every user can get in, and nobody can see anything they should not. This phase builds the
authorisation layer that **every subsequent phase depends on**, so it is worth over-building
slightly: a permission bug found in Phase 12 is a rewrite of six phases.

Reference: `docs/ROLES-PERMISSIONS.md`, `docs/SECURITY.md` §1–2.

## In scope

- Registration, login, logout, email verification, password reset
- The seven roles and per-membership role resolution
- `lib/authz/policy.ts` — the permission matrix, implemented once
- Middleware route gating and data-layer enforcement
- Per-role onboarding wizards
- Account, security and session settings

## Out of scope

- Google OAuth (deferred to Phase 16, ADR-004) · 2FA (Phase 16) · Institution management (Phase 5)

## Deliverables

### Authentication
- [ ] Auth.js v5 configured, credentials provider, JWT sessions
- [ ] JWT carries `userId`, `memberships[]` (college, role, state) — enough to authorise without a
      database round-trip on every request
- [ ] bcrypt cost 12; password policy: 10+ characters, checked against a common-password list
- [ ] `/register` role chooser → `/register/[role]` with role-specific fields
- [ ] **Institutional email domain verification** — a registrant on a college's declared domain is
      auto-associated with that college as `INVITED`
- [ ] Email verification required before any content can be created
- [ ] `/login` with the identical-response rule for unknown accounts
- [ ] `/forgot-password` → `/reset-password/[token]`; single-use, 30-minute expiry, hashed at rest
- [ ] Nodemailer with the console transport in dev; templates for verify, reset, invite, digest
- [ ] Rate limiting: 5 login attempts / 15 min per IP+email, lockout at 10 with a notification email
- [ ] Session invalidation on password change
- [ ] `/settings/security` — active sessions with per-device revoke, password change

### Authorisation — the core of this phase
- [ ] `lib/authz/policy.ts` — `can(viewer, action, resource)`, the **only** place a permission is
      decided
- [ ] `Action` as a string-literal union covering every action in `docs/ROLES-PERMISSIONS.md`
- [ ] `Viewer` type built once from the session
- [ ] `resolveVisibility()` — the most-restrictive-wins computation over resource, group, college,
      embargo and privacy settings
- [ ] `lib/auth/guards.ts` — `requireAuth()`, `requireRole()`, `requireMembership()`
- [ ] `middleware.ts` — route gating by role, with a correct post-login redirect back to the
      intended destination
- [ ] **The query-layer convention established and documented:** every scoped query takes `viewer`
      first, a denied read returns `null`, a denied write throws
- [ ] Cross-college isolation implemented as a predicate applied inside the query helpers

### Testing — non-negotiable in this phase
- [ ] Vitest installed
- [ ] **The full permission matrix as a table-driven test**: every role × every action × every
      scope, asserted against `docs/ROLES-PERMISSIONS.md`
- [ ] Cross-college denial test: as a member of college B, attempt every scoped query against
      college A's seeded data and assert empty
- [ ] `resolveVisibility()` tested against every combination of resource visibility, group
      visibility and embargo
- [ ] Password reset token: single-use and expiry both tested

### Onboarding
- [ ] `/onboarding/[step]` — a wizard per role, resumable, with progress persisted
- [ ] Student: college → department → programme → year → interests → skills → avatar
- [ ] Faculty: college → department → subjects → expertise → profile
- [ ] College Admin: college details → domains → verification request
- [ ] Alumni: college → graduation year → current role → mentorship availability
- [ ] Company: company details → verification request → focus areas
- [ ] Researcher: affiliation → field → interests
- [ ] Onboarding completion unlocks the dashboard; an incomplete profile is redirected back

### Dashboards & settings
- [ ] `/dashboard` — routes to the correct role dashboard
- [ ] A placeholder dashboard per role using `AppShell` (real content in later phases)
- [ ] `/settings/account` — email, password, language, timezone, delete account (stub, real in 16)
- [ ] The user menu in `AppShell` wired: profile, settings, theme, sign out

## Acceptance criteria

1. Every one of the seven roles can register, verify, onboard and reach its own dashboard.
2. The permission matrix test passes for every role × action × scope combination.
3. **A member of college B receives `null` from every scoped query against college A's data**, with
   the middleware disabled — proving the data layer is a real boundary, not a decoration.
4. A student attempting `/faculty` is redirected, not shown a broken page.
5. A denied read returns `null`/404; a denied write throws a handled error with a clear message.
6. A password reset token cannot be used twice and expires after 30 minutes.
7. Changing a password signs out every other session.
8. Six failed logins within 15 minutes are rate-limited.
9. An unverified user can browse but cannot create anything.
10. `npm run check` and the unit suite are clean.

## Key files this phase creates

```
src/lib/authz/policy.ts        can() — the single source of authorisation truth
src/lib/auth/config.ts         Auth.js configuration
src/lib/auth/guards.ts         requireAuth / requireRole / requireMembership
src/lib/seo/visibility.ts      resolveVisibility() — extended from Phase 2
src/middleware.ts              Route gating
src/app/(auth)/*               8 auth routes
src/app/(app)/onboarding/*     7 role wizards
tests/unit/policy.test.ts      The permission matrix — the most valuable test in the project
```

## Notes & risks

- **This is the phase to be slow and thorough in.** Every later phase calls `can()`. A permission
  model that is wrong here is wrong in eighteen places later, and permission bugs are the kind that
  ship silently.
- **Test the data layer with middleware disabled.** Middleware passing is not evidence the query is
  safe, and the query is what actually protects the data.
- **Roles are per-membership, not global.** Resist the shortcut of a single `user.role` column — the
  alumni transition and the multi-college case both break under it, and unwinding that later touches
  everything.
- The identical-response rule on login and password reset matters: a different message for an
  unknown email is an account-enumeration oracle.
- Email in development is the console transport. Print the verification link to the terminal so the
  flow is testable without an SMTP server.
- Do not add Google OAuth here. Allowing any Gmail account in undermines the institutional trust
  gate, which is what makes the whole network credible (ADR-004).
- The JWT carries memberships to avoid a database hit per request — which means **a membership
  change must force a token refresh.** Handle it now; discovering it in Phase 5 when an admin
  changes a role and nothing happens is a confusing bug.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.**

**Key decisions made.**

**The permission matrix — what the test actually asserts.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
