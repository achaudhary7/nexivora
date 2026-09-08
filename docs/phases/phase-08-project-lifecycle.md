# Phase 8 — Project Lifecycle & Project Pages

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 7 |
| **Blocks** | Phases 9, 11, 12, 15 |
| **Estimate** | 10 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Turn a group's work into a **structured, reviewable, publishable record**. This is the object the
whole product is organised around: the thing faculty evaluate, the thing that gets archived, the
thing that ranks in search, and the thing a student shows an employer.

## In scope

- The nine-section project record with an editor
- The lifecycle state machine and its role-gated transitions
- Milestones and computed progress
- Faculty proposal approval
- The duplicate-similarity check
- Visibility and IP embargo controls
- Final submission with an immutable snapshot

## Out of scope

- Evaluation and rubrics (Phase 9) · The public showcase and archive (Phase 12)

## Deliverables

### The project record
- [ ] `/projects/[id]/edit` — section navigator showing completion state per section
- [ ] `/projects/[id]/edit/[section]` — one editor per section, autosaving
- [ ] The nine sections, each a `ProjectSection` row (ADR-009):
      `PROBLEM · RESEARCH · SOLUTION · METHODOLOGY · PROTOTYPE · TESTING · RESULTS · CONCLUSION ·
      FUTURE_WORK`
- [ ] Each section: rich text (Tiptap, server-sanitised), attachments from the group file library,
      external links, word count, last editor, completion toggle
- [ ] **Per-section guidance** — a short prompt explaining what belongs in this section and an
      example. Most students have never written a methodology section and the blank page is the
      real obstacle.
- [ ] Metadata: title, one-line summary, abstract, domain and sub-domain, tags, tech stack, SDG
      alignment (multi-select from the 17), team members with declared roles, repository link, demo
      link, video link, start and end dates
- [ ] Edit history per section: who changed what, when; restore a previous version
- [ ] Concurrent-edit protection: a soft lock with a visible "X is editing this section" indicator
      (not CRDT merge — that is out of scope and saying so is better than half-doing it)

### Lifecycle
- [ ] States: `DRAFT → PROPOSED → APPROVED → IN_PROGRESS → UNDER_REVIEW → COMPLETED → ARCHIVED`,
      plus `REJECTED` and `ABANDONED`
- [ ] `lib/project/lifecycle.ts` — the transition table, with the role permitted for each
      transition and the preconditions for it. **One place, unit-tested.**
- [ ] Every transition writes a `ProjectStatusEvent` with actor, timestamp and reason
- [ ] A transition with unmet preconditions is refused with a message naming exactly what is missing
- [ ] `StatusPill` from Phase 1 used everywhere a status appears

### Proposal & approval
- [ ] `/projects/[id]/submit-proposal` — problem statement, proposed solution, domain, SDGs, team
- [ ] **The similarity check runs at proposal time**, against the college archive and public
      projects
- [ ] Results shown to the student *before* submitting: top matches with scores and the reason for
      each ("87% similar problem statement; shares 4 of 5 tech stack items")
- [ ] Result stored as a `SimilarityCheck` row so the decision is auditable, not just the score
- [ ] Faculty review queue: approve, reject with a reason, or request changes
- [ ] Faculty can override a similarity flag with a recorded justification — because a legitimate
      continuation of previous work *should* look similar, and the system must not block it
- [ ] Approval moves the project to `APPROVED` and unlocks full editing

### Milestones & progress
- [ ] `/projects/[id]/milestones` — create, order, assign an owner, set a due date
- [ ] A milestone links to the tasks that constitute it
- [ ] Milestone states: upcoming, in progress, at risk (past due, incomplete), complete
- [ ] Closing a milestone triggers the Phase 7D peer review
- [ ] **Progress is computed, never typed by hand**: section completion, milestone completion and
      task completion, weighted, with the weights in config
- [ ] Progress and at-risk state surface to the Phase 9 faculty dashboard
- [ ] Timeline / Gantt-lite view built from the existing `Timeline` primitive — no chart library

### Visibility & IP
- [ ] Visibility selector: `PRIVATE · GROUP · CLASS · COLLEGE · PUBLIC`
- [ ] **Public requires faculty approval.** The group requests it; a faculty member grants it.
- [ ] `embargoUntil` — an embargoed project shows title, team and abstract only; sections, files
      and results are hidden until the date. It can be *cited* without being *disclosed*.
- [ ] A plain-language explanation of what each visibility level means, shown at the point of choice
- [ ] A link to `/legal/ip-policy` from the embargo control
- [ ] `resolveVisibility()` extended to cover projects fully; indexability derives from it (ADR-010)

### Submission
- [ ] `/projects/[id]/submit` — a pre-submission checklist: required sections complete, all
      milestones closed, all members have submitted peer reviews, required attachments present
- [ ] Submission creates an **immutable snapshot** — the full record serialised at that moment
- [ ] Post-submission editing is locked unless faculty request changes
- [ ] Submission receipt with a timestamp, downloadable
- [ ] Resubmission after requested changes creates a new snapshot; the old one is retained

## Acceptance criteria

1. A project goes end to end: draft → proposal → approved → in progress with milestones →
   submitted, with every transition correctly gated by role.
2. **The similarity check fires on the deliberately-similar seeded pair** and does not fire on an
   unrelated one.
3. A faculty override of a similarity flag is recorded with its justification and is visible later.
4. Progress is computed from real section, milestone and task state — nowhere is it typed.
5. An embargoed project shows the abstract and hides everything else, to every role except its own
   group and the assigned faculty.
6. A `PRIVATE` project is absent from the sitemap and carries `noindex`.
7. A submitted project cannot be edited until faculty request changes.
8. The submission snapshot is byte-stable and reproduces the record as it was.
9. Section autosave loses no work across a navigation or a refresh.
10. Two members editing the same section see the soft-lock indicator.

## Key files this phase creates

```
src/app/(app)/projects/[id]/edit/*          Section editor
src/app/(app)/projects/[id]/milestones/*
src/app/(app)/projects/[id]/submit/*
src/lib/project/lifecycle.ts                The transition table — unit tested
src/lib/project/progress.ts                 Computed, never stored as truth
src/lib/project/snapshot.ts                 Immutable submission records
src/lib/search/similarity.ts                Extended from Phase 3, wired to the proposal flow
src/components/project/*                    SectionEditor, MilestoneTimeline, VisibilityControl
```

## Notes & risks

- **Per-section guidance is worth more than it looks.** The blank-page problem is the real reason
  project documentation is bad. A one-sentence prompt and an example per section will do more for
  content quality than any feature in this phase.
- **The similarity check must not be a gate that blocks legitimate work.** A project that formally
  builds on a previous one *should* be similar. It informs the faculty decision; it never makes it.
  Say this in the UI so students are not alarmed by a high score.
- **Progress must be computed.** A self-reported percentage is meaningless and every faculty member
  knows it. Computed progress is the reason the dashboard in Phase 9 is worth opening.
- **Do not attempt CRDT collaborative editing.** A soft lock with a clear indicator is honest, is a
  day's work instead of a month's, and is what the use case actually needs.
- Snapshots grow. Store them compressed and prune non-final ones after the term closes.
- The embargo is a real academic need — a patentable project cannot be public before filing. It is
  also a strong trust signal for a faculty audience. Do not treat it as an edge case.
- This phase must not duplicate Phase 12's public page. Here we build the **editor and the
  lifecycle**; the public rendering is already a Phase 2 template and gets wired to real data in
  Phase 12.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.**

**Key decisions made.**

**Similarity thresholds chosen, and how they were tuned.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
