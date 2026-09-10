import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISENGAGEMENT_SHARE, HEALTH_SIGNAL_MIN_EVENTS, LEDGER_WEIGHTS } from "@/config/ledger";

import { SILENT_DAYS, groupHealth, healthLevel } from "./health";
import {
  balanceSummary,
  contributionTimeline,
  scoreMembers,
  type LedgerRow,
  type Member,
} from "./score";

/**
 * The ledger is the feature this whole phase exists for, and the number it
 * produces is one a student may dispute in front of a faculty member. These
 * tests are written against the ways it could be quietly wrong rather than
 * against the happy path — a scorer that adds up correctly and silently drops
 * an inactive member is arithmetically fine and tells exactly the lie that
 * matters.
 */

const member = (id: string, name: string): Member => ({
  id,
  name,
  username: id,
  avatarUrl: null,
});

const ananya = member("u1", "Ananya Sharma");
const rahul = member("u2", "Rahul Verma");
const meera = member("u3", "Meera Iyer");
const TEAM = [ananya, rahul, meera];

const day = (n: number) => new Date(Date.UTC(2026, 0, n, 12, 0, 0));

const event = (
  userId: string,
  kind: LedgerRow["kind"],
  dayNumber: number,
  weight: number = LEDGER_WEIGHTS[kind],
): LedgerRow => ({ userId, kind, weight, createdAt: day(dayNumber) });

/* ---------------------------------------------------------- scoreMembers */

describe("scoreMembers", () => {
  it("sums the weights carried on the events, not the weights in config today", () => {
    // The historic weight is denormalised onto the row precisely so that tuning
    // config/ledger.ts does not rewrite the past. If the scorer looked the
    // weight up instead of reading it, that guarantee would be decorative.
    const scores = scoreMembers([ananya], [event("u1", "TASK_CLOSED", 1, 99)]);

    assert.equal(scores[0]!.points, 99);
  });

  it("keeps a member with no events as a zero row rather than dropping them", () => {
    const scores = scoreMembers(TEAM, [event("u1", "TASK_CLOSED", 1)]);

    assert.equal(scores.length, 3);
    const silent = scores.find((score) => score.member.id === "u3");
    assert.ok(silent, "a member with no events must still appear");
    assert.equal(silent.points, 0);
    assert.equal(silent.share, 0);
    assert.equal(silent.lastActiveAt, null);
  });

  it("produces shares that sum to 1", () => {
    const scores = scoreMembers(TEAM, [
      event("u1", "TASK_CLOSED", 1),
      event("u1", "FILE_ADDED", 2),
      event("u2", "MESSAGE_POSTED", 2),
      event("u3", "THREAD_STARTED", 3),
    ]);

    const total = scores.reduce((sum, score) => sum + score.share, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `shares summed to ${total}`);
  });

  it("returns zero shares, not NaN, when nothing has happened", () => {
    const scores = scoreMembers(TEAM, []);

    assert.deepEqual(
      scores.map((score) => score.share),
      [0, 0, 0],
    );
  });

  it("subtracts a compensating event and never inverts a member's total", () => {
    const scores = scoreMembers(TEAM, [
      event("u1", "TASK_CLOSED", 1),
      { ...event("u1", "TASK_CLOSED", 2), weight: -LEDGER_WEIGHTS.TASK_CLOSED },
      // Compensated twice over — reopening a task that was closed once should
      // floor at zero, not hand the member a negative share of the group.
      { ...event("u1", "TASK_CLOSED", 3), weight: -LEDGER_WEIGHTS.TASK_CLOSED },
      event("u2", "TASK_CLOSED", 1),
    ]);

    const compensated = scores.find((score) => score.member.id === "u1")!;
    assert.equal(compensated.points, 0);
    assert.ok(compensated.share >= 0);
    // And the event count still records that three things happened.
    assert.equal(compensated.eventCount, 3);
  });

  it("ignores events from somebody who is no longer in the group", () => {
    const scores = scoreMembers(
      [ananya],
      [event("u1", "TASK_CLOSED", 1), event("gone", "TASK_CLOSED", 1)],
    );

    assert.equal(scores.length, 1);
    assert.equal(scores[0]!.share, 1);
  });

  it("breaks contribution down by kind", () => {
    const scores = scoreMembers(
      [ananya],
      [event("u1", "TASK_CLOSED", 1), event("u1", "TASK_CLOSED", 2), event("u1", "FILE_ADDED", 3)],
    );

    const { byKind } = scores[0]!;
    assert.equal(byKind.TASK_CLOSED.count, 2);
    assert.equal(byKind.TASK_CLOSED.points, LEDGER_WEIGHTS.TASK_CLOSED * 2);
    assert.equal(byKind.FILE_ADDED.count, 1);
    assert.equal(byKind.MEETING_ATTENDED.count, 0);
  });

  it("records the most recent activity per member", () => {
    const scores = scoreMembers(
      [ananya],
      [event("u1", "TASK_CLOSED", 9), event("u1", "FILE_ADDED", 2)],
    );

    assert.equal(scores[0]!.lastActiveAt?.getTime(), day(9).getTime());
  });

  it("orders by points, then by name so the order is stable", () => {
    const scores = scoreMembers(TEAM, [event("u2", "TASK_CLOSED", 1)]);

    assert.deepEqual(
      scores.map((score) => score.member.id),
      ["u2", "u1", "u3"],
    );
  });
});

/* ------------------------------------------------------------- timeline */

describe("contributionTimeline", () => {
  it("is empty when nothing has happened", () => {
    assert.deepEqual(contributionTimeline(TEAM, []), []);
  });

  it("accumulates rather than resetting each day", () => {
    const points = contributionTimeline(TEAM, [
      event("u1", "TASK_CLOSED", 1),
      event("u1", "TASK_CLOSED", 2),
      event("u2", "FILE_ADDED", 2),
    ]);

    assert.equal(points.length, 2);
    assert.equal(points[0]!.byMember.u1, LEDGER_WEIGHTS.TASK_CLOSED);
    assert.equal(points[1]!.byMember.u1, LEDGER_WEIGHTS.TASK_CLOSED * 2);
    assert.equal(points[1]!.byMember.u2, LEDGER_WEIGHTS.FILE_ADDED);
  });

  it("emits one point per day that has events, in order", () => {
    const points = contributionTimeline(TEAM, [
      event("u1", "TASK_CLOSED", 5),
      event("u2", "TASK_CLOSED", 1),
      event("u3", "TASK_CLOSED", 3),
    ]);

    assert.deepEqual(
      points.map((point) => point.date),
      ["2026-01-01", "2026-01-03", "2026-01-05"],
    );
  });
});

/* -------------------------------------------------------- balanceSummary */

describe("balanceSummary", () => {
  it("says nothing about a group of one", () => {
    assert.equal(balanceSummary(scoreMembers([ananya], [event("u1", "TASK_CLOSED", 1)])), null);
  });

  it("calls an even split even", () => {
    const scores = scoreMembers(
      [ananya, rahul],
      [event("u1", "TASK_CLOSED", 1), event("u2", "TASK_CLOSED", 1)],
    );

    assert.match(balanceSummary(scores) ?? "", /broadly even/);
  });

  it("reports a ratio without accusing anybody of anything", () => {
    const scores = scoreMembers(
      [ananya, rahul],
      [
        event("u1", "TASK_CLOSED", 1),
        event("u1", "TASK_CLOSED", 2),
        event("u1", "TASK_CLOSED", 3),
        event("u2", "MESSAGE_POSTED", 1),
      ],
    );

    const summary = balanceSummary(scores) ?? "";
    assert.match(summary, /Ananya Sharma accounts for/);
    assert.match(summary, /× the recorded activity of Rahul Verma/);
    // Wording check, not a style preference: the moment this sentence editorialises
    // it becomes an allegation the system is not entitled to make.
    assert.doesNotMatch(summary, /lazy|freerid|free-rid|not contributing|failed/i);
  });

  it("names a member with nothing recorded rather than dividing by zero", () => {
    const scores = scoreMembers(TEAM, [
      event("u1", "TASK_CLOSED", 1),
      event("u2", "TASK_CLOSED", 1),
    ]);

    assert.match(balanceSummary(scores) ?? "", /Meera Iyer has no recorded activity yet/);
  });
});

/* ----------------------------------------------------------- groupHealth */

describe("groupHealth", () => {
  const now = day(40);

  /** Enough events for the signal to be allowed to fire at all. */
  const bulk = (userId: string, count: number, dayNumber: number): LedgerRow[] =>
    Array.from({ length: count }, () => event(userId, "TASK_CLOSED", dayNumber));

  const input = (scores: ReturnType<typeof scoreMembers>, totalEvents: number) => ({
    scores,
    totalEvents,
    overdueTasks: [],
    slippedMilestones: [],
    lastActivityAt: day(39),
  });

  it("fires nothing on thin data, however lopsided", () => {
    const rows = bulk("u1", HEALTH_SIGNAL_MIN_EVENTS - 1, 39);
    const signals = groupHealth(input(scoreMembers(TEAM, rows), rows.length), now);

    assert.deepEqual(signals, []);
  });

  it("flags a member with no activity at all once the group has done enough", () => {
    const rows = [...bulk("u1", 20, 39), ...bulk("u2", 10, 39)];
    const signals = groupHealth(input(scoreMembers(TEAM, rows), rows.length), now);

    const silent = signals.find((signal) => signal.userId === "u3");
    assert.ok(silent);
    assert.equal(silent.kind, "silent-member");
    assert.equal(silent.severity, "warning");
  });

  it("flags a member who has gone quiet, dating it", () => {
    const rows = [...bulk("u1", 25, 39), ...bulk("u2", 25, 39), ...bulk("u3", 5, 1)];
    const signals = groupHealth(input(scoreMembers(TEAM, rows), rows.length), now);

    const quiet = signals.find((signal) => signal.userId === "u3");
    assert.ok(quiet);
    assert.match(quiet.message, new RegExp(`last ${SILENT_DAYS} days`));
  });

  it("does not double-report a silent member as also low-share", () => {
    const rows = [...bulk("u1", 30, 39), ...bulk("u2", 30, 39)];
    const signals = groupHealth(input(scoreMembers(TEAM, rows), rows.length), now);

    assert.equal(signals.filter((signal) => signal.userId === "u3").length, 1);
  });

  it("reports a low share only for somebody who is still active", () => {
    // u3 is active yesterday but tiny: one message against sixty closed tasks.
    const rows = [...bulk("u1", 30, 39), ...bulk("u2", 30, 39), event("u3", "MESSAGE_POSTED", 39)];
    const scores = scoreMembers(TEAM, rows);
    const signals = groupHealth(input(scores, rows.length), now);

    const low = signals.find((signal) => signal.userId === "u3");
    assert.ok(low);
    assert.equal(low.kind, "low-share");
    assert.equal(low.severity, "info");
    assert.ok(scores.find((score) => score.member.id === "u3")!.share < DISENGAGEMENT_SHARE);
  });

  it("notices a workspace that has stopped moving, even before the data is thick", () => {
    const rows = bulk("u1", 3, 1);
    const signals = groupHealth(
      { ...input(scoreMembers(TEAM, rows), rows.length), lastActivityAt: day(1) },
      now,
    );

    assert.equal(signals.length, 1);
    assert.equal(signals[0]!.kind, "stalled-board");
  });

  it("reports a slipped milestone", () => {
    const rows = bulk("u1", 30, 39);
    const signals = groupHealth(
      {
        ...input(scoreMembers([ananya], rows), rows.length),
        slippedMilestones: [{ id: "m1", title: "Prototype demo", dueOn: day(30) }],
      },
      now,
    );

    assert.ok(signals.some((signal) => signal.kind === "slipped-milestone"));
  });
});

describe("healthLevel", () => {
  it("is ok with no signals, watch on info, attention on a warning", () => {
    assert.equal(healthLevel([]), "ok");
    assert.equal(
      healthLevel([{ kind: "low-share", severity: "info", userId: "u1", message: "" }]),
      "watch",
    );
    assert.equal(
      healthLevel([
        { kind: "low-share", severity: "info", userId: "u1", message: "" },
        { kind: "silent-member", severity: "warning", userId: "u2", message: "" },
      ]),
      "attention",
    );
  });
});
