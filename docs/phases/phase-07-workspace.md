# Phase 7 — Groups & the Project Workspace

> **This is the heart of the product.** Everything before it is scaffolding for it; everything
> after it is leverage on it. It is estimated at nearly double any other phase. Do not rush it.

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 5, Phase 6 |
| **Blocks** | Phases 8, 9, 10, 12 |
| **Estimate** | 14 focused hours, split into four checkpoints |
| **Started** | — |
| **Completed** | — |

## Objective

Build the place where student group work actually happens — good enough that a group of five
students chooses it over a WhatsApp group and a Drive folder. And build the **Contribution
Ledger**, the feature that addresses the most universally felt problem in group coursework and that
nobody else builds.

Per ADR-013, this is also the **go-to-market wedge**: the workspace is valuable to five people with
nobody else on the platform, which is what makes the cold start survivable.

## In scope

Groups, membership, tasks, files, discussion, meetings, deadlines, activity, and the ledger with
peer review.

## Out of scope

- The project record itself (Phase 8) — a group can exist before its project page does
- Faculty evaluation (Phase 9) · The feed (Phase 10)
- Real-time collaborative document editing and video conferencing — both out of scope entirely

---

## Checkpoints

Split so partial progress is still shippable. Do not start a checkpoint before the previous one
works end to end.

| # | Checkpoint | Ships |
| --- | --- | --- |
| **7A** | Groups & membership | A group exists, has members, and has a home |
| **7B** | Tasks | A board people would actually use |
| **7C** | Files, discussion & meetings | The rest of the collaboration surface |
| **7D** | **The Contribution Ledger & peer review** | The differentiator |

---

## Deliverables

### 7A — Groups & membership
- [ ] `/groups` — my groups, with status, next deadline and unread indicators
- [ ] `/groups/new` — create within a class: name, description, size limit, visibility, join policy
      (`OPEN · REQUEST · INVITE_ONLY`)
- [ ] Membership: invite by username or email, request to join, faculty assignment, bulk
      faculty-assign for a whole class
- [ ] Roles inside a group: `LEAD · MEMBER`. Lead can invite, remove, rename and submit.
- [ ] Leave a group (a lead must transfer leadership first)
- [ ] `/groups/[id]` — the workspace home: at-a-glance progress, upcoming deadlines, recent
      activity, my open tasks, member strip
- [ ] `/groups/[id]/settings` — details, members, join policy, archive
- [ ] Every group route enforces membership at the query layer, not only in middleware

### 7B — Tasks
- [ ] `/groups/[id]/tasks` — board view with columns `TODO · IN_PROGRESS · BLOCKED · REVIEW · DONE`
- [ ] List view with sort and filter, as an equal alternative to the board
- [ ] Task: title, description, assignee(s), due date, priority, labels, checklist, linked milestone
- [ ] Create inline on a column; edit in a sheet
- [ ] **Drag and drop with optimistic updates** — a card moves at 0ms and the server reconciles
- [ ] **Full keyboard operation via a "move to" menu.** This is an accessibility requirement and it
      is also the fallback that works with no drag library at all.
- [ ] Task comments with `@mentions`
- [ ] `/groups/[id]/tasks/[taskId]` deep link, so a notification can point at a task
- [ ] My-tasks view across all groups
- [ ] Overdue highlighting and a due-soon indicator
- [ ] **Closing a task writes a `LedgerEvent` in the same transaction** (ADR-007)

### 7C — Files, discussion & meetings

**Files**
- [ ] `/groups/[id]/files` — grid and list, folders, search
- [ ] Upload: drag-and-drop, multi-file, progress, resumable for large files
- [ ] **Validation by magic bytes, not extension**; 25 MB per file, 2 GB per group
- [ ] Versioning as `FileVersion` rows: upload a new version, view history, restore, and a visible
      "who contributed which version"
- [ ] Preview: PDF, images, text, code with highlighting. Everything else downloads.
- [ ] **Served only through `GET /api/files/[id]`** with an authorisation check — no static path
- [ ] Uploaded SVG is never inlined (see `docs/SECURITY.md` §3)
- [ ] Delete to trash, restorable for 30 days

**Discussion**
- [ ] `/groups/[id]/discussion` — threads with a title and a body
- [ ] Thread types: `GENERAL · QUESTION · DECISION · BLOCKER`
- [ ] Replies (one nesting level — deeper threading helps nobody), reactions, `@mentions`
- [ ] Rich text via Tiptap, **sanitised on the server** before storage and again at render
- [ ] Attach a file or link a task from inside a thread
- [ ] Pin a thread; resolve a `QUESTION` or `BLOCKER` with the resolving reply marked
- [ ] Unread state per user

**Meetings**
- [ ] `/groups/[id]/meetings` — upcoming and past
- [ ] Schedule: title, datetime, duration, agenda, location or join link, attendees
- [ ] **We do not host video.** We store a link (Meet, Zoom, Teams). This is stated in the UI.
- [ ] RSVP, attendance marking, minutes, action items that **become tasks** with one click
- [ ] Calendar view for the group, plus an `.ics` export

**Deadlines & activity**
- [ ] `/groups/[id]` calendar strip combining tasks, milestones and meetings
- [ ] An activity stream of every workspace event, filterable by member and type

### 7D — The Contribution Ledger *(the differentiator)*
- [ ] `LedgerEvent` written **inside the same transaction** as every contributing action:
      `TASK_CLOSED · FILE_ADDED · FILE_REVISED · THREAD_STARTED · MESSAGE_POSTED ·
      MEETING_ATTENDED · MILESTONE_OWNED · COMMIT_LINKED · REVIEW_GIVEN`
- [ ] **Append-only.** No update or delete path exists. Corrections are compensating events.
- [ ] Weights in `config/ledger.ts`, never at the call site, so they can be tuned without a
      migration
- [ ] `lib/ledger/score.ts` — per-member contribution score, unit-tested
- [ ] `/groups/[id]/ledger` — **visible to every member**, not only to faculty:
      - Contribution share per member, as a chart and a table
      - Breakdown by event type
      - Timeline of contribution over the project's life
      - Every score links to the actual evidence
- [ ] **Transparency is the design.** Hiding the ledger from members turns it into surveillance;
      showing it turns it into an honest, self-correcting signal. This is the whole point.
- [ ] Optional GitHub commit linking: paste a repository URL, map commit authors to members
      (public API, unauthenticated, cached — no token, no cost)
- [ ] **Peer review at milestone close:** each member rates each other on contribution, reliability
      and communication (1–5) with a required comment
- [ ] **A member sees only the aggregate about themselves, never who said what** (ADR-008).
      Faculty see full detail. A member always sees their own submitted reviews.
- [ ] Review is required before a milestone can be marked complete, with a reminder, and it is
      skippable by the lead with a recorded reason
- [ ] Group health signals computed here and consumed by Phase 9: a member with no ledger events in
      14 days, a contribution share below 10%, a slipped milestone

## Acceptance criteria

1. A five-member group runs a realistic two-week sprint entirely inside the workspace: tasks
   created, assigned, moved and closed; files uploaded and revised; a decision thread resolved; a
   meeting held with minutes converted to tasks.
2. **The ledger reflects what each member actually did**, and every number links to the evidence.
3. The task board is fully operable by keyboard, with no drag interaction, start to finish.
4. Dragging a card feels instantaneous; a server failure reverts it visibly with an explanation.
5. A file uploaded by group A returns 404 to a member of group B — verified against the real URL.
6. An upload with a mismatched magic byte is rejected.
7. A peer review submitted by member A is never visible to member B in any view, at any URL.
8. The ledger cannot be edited: attempting an update through the client wrapper is a type error.
9. The workspace home loads in under 800ms with the seed data.
10. Every list has an empty, loading and error state.
11. `npm run check` and the unit suite are clean.

## Key files this phase creates

```
src/app/(app)/groups/*                8 workspace routes
src/app/api/files/[id]/route.ts       Signed, authorised file access
src/components/workspace/*            TaskBoard, TaskCard, FileList, Thread, MeetingCard, LedgerTable
src/lib/db/queries/group.ts
src/lib/ledger/{record,score,health}.ts   The differentiator — unit tested
src/lib/storage/{provider,local}.ts   The interface R2 will implement later
src/config/ledger.ts                  Event weights as configuration
tests/unit/ledger.test.ts
```

## Notes & risks

- **Optimistic UI is not optional here.** A task board that waits 300ms per drag feels broken, and
  a workspace that feels broken loses to WhatsApp on day one. Every mutation in 7B is optimistic.
- **The ledger transaction boundary is the whole feature.** If a ledger event is written after the
  task update rather than with it, a failure between them produces a record that disagrees with
  reality — and a ledger that can be wrong is worse than none, because it looks authoritative.
- **Show the ledger to members.** The instinct is to make it a faculty tool. That instinct is
  wrong: a visible ledger changes behaviour during the project, which is the point, and a hidden one
  is surveillance, which students will correctly resent.
- **Peer review privacy is one-directional and must be enforced at the query.** Aggregate for the
  subject, detail for faculty. A leak here destroys trust in the mechanism permanently.
- **GitHub linking uses the public API without a token.** Rate-limited to 60 requests/hour per IP,
  so cache aggressively and degrade silently. It is a bonus signal, never a dependency.
- Do not build chat. Threaded discussion serves the decision-making need; real-time chat is a
  different product and students already have one. Say so rather than half-building it.
- The `Table` mobile card fallback deferred from Phase 1 lands here — the ledger table is the first
  place it is genuinely needed.
- **If time runs short, ship 7A–7C and defer 7D by a week — but do not defer it further.** The
  ledger is why anyone chooses this over a Drive folder.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.** *(per checkpoint)*

**Key decisions made.**

**Ledger weights chosen, and the reasoning.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
