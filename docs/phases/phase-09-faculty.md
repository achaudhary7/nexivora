# Phase 9 — Faculty Dashboard, Review & Evaluation

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 7, Phase 8 |
| **Blocks** | Phases 12, 15 |
| **Estimate** | 9 focused hours |
| **Started** | — |
| **Completed** | — |

## What Phase 3 already provides

*Added 2026-09-09, when Phase 3 completed. Check these before building — the most common way to
waste a phase is to rebuild something the previous one shipped.*

- **`Rubric`, `RubricCriterion`, `Evaluation`, `CriterionScore`, `Feedback`,
  `Attestation` and `PeerReview` are modelled and seeded** — one rubric, 12 evaluations, 28 peer
  reviews, 8 attestations including one revoked.
- **`CriterionScore.memberId` is null for the group score and set for a per-member score**, with a
  `reason` required when a member deviates. The ledger exists precisely so those can differ.
- **Peer review is one-directional** (ADR-008): a member sees only the aggregate about themselves,
  never who said what. Faculty see the detail.
- **Rubrics are versioned, never edited.** An edited rubric that retroactively changes past
  evaluations is a serious academic integrity problem.
- **The disengagement signal's thresholds are in `src/config/ledger.ts`.** It is shown to faculty
  only, and never as an accusation — its job is to prompt someone to ask.

## What Phase 6 already provides

*Added 2026-09-09, when Phase 6 completed.*

- **Only this phase may write `UserSkill.source = "ATTESTED"`.** `recomputeSkills` never
  overwrites an attestation, and the profile forms cannot edit one — a named human signed it, so
  only they can withdraw it.
- **`mergeSkills()` already ranks attested above evidenced above claimed.** Issuing an attestation
  is all this phase needs to do; the display follows.

## What Phase 7 already provides

*Added 2026-09-10, when Phase 7 completed.*

- **`groupHealth()` in `lib/ledger/health.ts` is built and unit-tested** — silent members, low
  contribution share, slipped milestones, a stalled board. It is written to be shown to **faculty
  and never to the group**, it refuses to fire below `HEALTH_SIGNAL_MIN_EVENTS`, and every message
  states what the data shows without concluding anything. `healthLevel()` collapses the signals to
  one badge for a list.
- **Peer review detail is already faculty-scoped.** `getReviews(workspace, { teachesSubject: true })`
  returns every review with its author; the member view returns an aggregate with authorship
  stripped. That asymmetry is ADR-008 and it is enforced **at the query** — do not re-filter in a
  component, and never repeat an attributed comment back to a group.
- **Faculty already read the workspace** (`workspace:read` via `teachesSubject`) and may write
  tasks — but **cannot edit sections and cannot delete files**, deliberately. A supervisor who can
  silently alter a group's work destroys the evidentiary value of the ledger.
- **`scoreMembers()` and `contributionTimeline()` are pure functions** over ledger rows. Reuse
  them; the faculty view is a different presentation of the same numbers, not a different
  calculation.

## Objective

Build the surface that determines whether this product is adopted at all. **Faculty are the
adoption channel** (ADR-013, `docs/BUSINESS-MODEL.md` §5): if a faculty member does not open this
dashboard weekly without being reminded, the product has failed, and we need to learn that in month
two rather than year two.

The promise being kept here: *"you will be able to see what every group is actually doing, and who
in each group is actually doing it, without having to ask."*

## In scope

- The faculty dashboard, classes and groups views
- Group health signals
- The submission queue
- Rubric-based evaluation with per-member marks
- Sectioned feedback
- **Attestation** — the mechanism that converts evidence into a credential
- Announcements and deadline broadcast

## Out of scope

- Class analytics and charts (Phase 15) · Grade export to a college SIS (out of scope)

## Deliverables

### The dashboard — `/faculty`
Designed so the most useful information is visible without a click.
- [ ] Current term, subjects taught, classes, group and student counts
- [ ] **Needs attention** — the primary panel, ranked: submissions awaiting review, proposals
      awaiting approval, at-risk groups, unanswered questions, deadlines this week
- [ ] Recent activity across all supervised groups
- [ ] Quick actions: announce, schedule, review the next submission

### Classes & groups
- [ ] `/faculty/classes` — every class this term with enrolment, group count, average progress
- [ ] `/faculty/classes/[id]` — roster, groups with live status, class deadlines, announcements
- [ ] `/faculty/groups` — every group across every class, filterable by status, progress and health
- [ ] Group detail (faculty view): members with contribution share, progress, milestones, recent
      activity, the full ledger, and read-only access to the workspace
- [ ] **Faculty workspace access is read-only** except tasks, feedback and meetings (see
      `docs/ROLES-PERMISSIONS.md`) — a faculty member who can silently edit a group's files destroys
      the evidentiary value of the ledger

### Group health signals — *the feature that makes the dashboard worth opening*
- [ ] `lib/ledger/health.ts` computes, per group:
      - **Silent member** — no ledger event in 14 days
      - **Contribution imbalance** — any member below 10% share
      - **Slipped milestone** — past due and incomplete
      - **Stalled** — no activity of any kind in 10 days
      - **Unresolved blocker** — a `BLOCKER` thread open more than 7 days
- [ ] Health surfaces as a ranked list, worst first — **not** as a decorative badge
- [ ] Each signal states the evidence and offers an action (message the group, schedule a meeting,
      flag for review)
- [ ] Thresholds in `config/health.ts`, tunable per college
- [ ] **Signals are advisory and are shown to the group too.** A hidden warning about a student that
      the student cannot see is surveillance; a visible one is feedback.

### Rubrics — `/faculty/rubrics`
- [ ] Create a rubric: named criteria, weights summing to 100, level descriptors per criterion
- [ ] Templates for common project types, and duplicate-from-existing
- [ ] Attach a rubric to a subject or to a specific class
- [ ] Rubrics are versioned; editing one after an evaluation exists creates a new version so past
      evaluations stay meaningful

### Evaluation — `/faculty/submissions`, `/projects/[id]/review`
- [ ] Submission queue: filterable, sortable by deadline, showing time waiting
- [ ] The review screen, side by side: the project record on the left, the rubric on the right
- [ ] Score each criterion with the descriptor visible; total computed and shown live
- [ ] **Per-member scores as well as a group score** — with the contribution ledger displayed
      alongside, because that is the evidence for differentiating them. This is the entire reason
      the ledger exists.
- [ ] Per-member adjustment requires a reason when it deviates from the group score
- [ ] Overall comments plus **inline feedback on any individual section**
- [ ] Outcomes: approve · request changes (with required specifics) · reject
- [ ] Feedback is visible to the group immediately on release; drafts are private until then
- [ ] Evaluation history: multiple rounds retained, not overwritten

### Attestation — *the credential mechanism*
- [ ] `/faculty/attestations` — issue, view and revoke
- [ ] Attest a **project outcome** ("this group built and demonstrated a working prototype") or an
      **individual contribution** ("Ananya designed and implemented the classification model")
- [ ] Pre-filled from the ledger, then edited by the faculty member — never auto-issued
- [ ] An attestation names the attesting faculty member, their designation and the date, and is
      permanent unless revoked
- [ ] Revocation preserves the record with a reason, rather than deleting it
- [ ] Attested items render with the Phase 1 `TierBadge` at the attested tier, everywhere they appear
- [ ] Attestations flow into the profile skill graph as `ATTESTED` source

### Communication
- [ ] `/faculty/announcements` — post to a class, a subject or specific groups; scheduled or
      immediate; pinned in the target workspaces and delivered as notifications
- [ ] Deadline broadcast — set a date for a class; it appears in every group's calendar and
      generates reminders
- [ ] Schedule a meeting with one group or many
- [ ] Answer questions raised in supervised workspaces, from one queue

## Acceptance criteria

1. A faculty member opens `/faculty` and, without clicking, knows what needs attention today.
2. The health signal correctly identifies the seeded group with a silent member, and names the
   evidence.
3. A full evaluation — rubric scored, per-member marks differentiated with reasons, three sectioned
   comments, outcome released — takes **under ten minutes**.
4. The per-member score screen shows the ledger alongside, so differentiation is evidence-based.
5. An attestation is issued, appears on the student's profile and public project page with the
   attesting faculty named, and survives a revocation as a revoked record.
6. An announcement reaches every targeted group's workspace and notification list.
7. Faculty cannot edit a group's files or discussion — verified against the real routes.
8. A faculty member sees only their own subjects' groups, not the whole college.
9. Draft feedback is invisible to students until released.
10. `npm run check` and the unit suite are clean.

## Key files this phase creates

```
src/app/(app)/faculty/*              8 faculty routes
src/app/(app)/projects/[id]/review/  The evaluation screen
src/lib/db/queries/faculty.ts
src/lib/ledger/health.ts             Group health signals
src/lib/evaluation/{rubric,score}.ts
src/lib/attestation.ts               Issue, verify, revoke
src/config/health.ts                 Thresholds as configuration
```

## Notes & risks

- **This dashboard is the product's adoption test.** Design it for a faculty member with fifteen
  minutes on a Tuesday, not for a demo. If the first screen requires interpretation, it has failed.
- **Show health signals to students too.** A private warning is surveillance and students will
  resent it. A visible one is feedback and it changes behaviour during the project, which is the
  only outcome that actually helps anyone.
- **Never auto-issue an attestation.** Its entire value is that a named human vouched for it. Making
  it automatic makes it worthless, and it would be the fastest way to destroy the credential.
- **Per-member marks are the payoff for everything in Phase 7.** Put the ledger physically next to
  the score input, so differentiating a mark is a two-second, evidence-backed decision rather than
  a guess a faculty member has to defend.
- Rubric versioning matters: an edited rubric that retroactively changes past evaluations is a
  serious academic integrity problem. Version, do not mutate.
- The review screen is dense. Build it against the seeded data at a laptop width first, then make
  it work on a tablet. It is not a phone screen and pretending otherwise produces a worse desktop
  experience.
- Requesting changes must require specifics. "Needs improvement" as an outcome helps nobody and
  will be the most common failure mode if the form permits it.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.**

**Key decisions made.**

**Health thresholds chosen, and the reasoning.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
