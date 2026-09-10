import { DISENGAGEMENT_SHARE, HEALTH_SIGNAL_MIN_EVENTS } from "@/config/ledger";

import type { MemberScore } from "./score";

/**
 * GROUP HEALTH SIGNALS.
 *
 * Computed here, consumed by Phase 9's faculty view. Three rules govern every
 * signal in this file, and they are the difference between a useful prompt and
 * an automated accusation:
 *
 *  1. **A signal is a reason to ask, never a conclusion.** The wording says
 *     what the data shows and stops there. A student may be carrying the work
 *     in a way the ledger cannot see — pair programming, field visits, a sick
 *     parent — and the one thing the system must not do is decide it knows.
 *  2. **Nothing fires on thin data.** Below `HEALTH_SIGNAL_MIN_EVENTS` the
 *     group has not done enough for a share to mean anything, and a "10%
 *     contributor" out of nine total events is noise dressed as a finding.
 *  3. **Faculty see these; the group does not.** The group sees the ledger
 *     itself, which is transparent by design. A generated warning about a named
 *     classmate, shown to their team, is surveillance — and it is also how a
 *     signal that was meant to prompt a conversation starts one nobody wanted.
 */

export type HealthSignal = {
  kind: "silent-member" | "low-share" | "slipped-milestone" | "stalled-board";
  severity: "info" | "warning";
  /** The member this concerns, when it concerns one. */
  userId: string | null;
  message: string;
};

export type HealthInput = {
  scores: readonly MemberScore[];
  totalEvents: number;
  /** Open tasks whose due date has passed. */
  overdueTasks: { id: string; title: string; dueDate: Date }[];
  /** Milestones past their due date and not closed. */
  slippedMilestones: { id: string; title: string; dueOn: Date }[];
  /** The most recent ledger event in the group, of any kind. */
  lastActivityAt: Date | null;
};

/** No ledger event in this many days makes a member "silent". */
export const SILENT_DAYS = 14;

const daysBetween = (from: Date, to: Date) => (to.getTime() - from.getTime()) / 86_400_000;

export function groupHealth(input: HealthInput, now = new Date()): HealthSignal[] {
  const signals: HealthSignal[] = [];

  // Rule 2, first and unconditionally: a group that has barely started cannot
  // produce a meaningful distribution, and firing here would train faculty to
  // ignore the panel.
  if (input.totalEvents < HEALTH_SIGNAL_MIN_EVENTS) {
    if (input.lastActivityAt && daysBetween(input.lastActivityAt, now) > SILENT_DAYS) {
      signals.push({
        kind: "stalled-board",
        severity: "info",
        userId: null,
        message: `No recorded activity in this workspace for ${Math.floor(daysBetween(input.lastActivityAt, now))} days.`,
      });
    }
    return signals;
  }

  for (const score of input.scores) {
    const silent =
      score.lastActiveAt === null || daysBetween(score.lastActiveAt, now) > SILENT_DAYS;

    if (silent) {
      signals.push({
        kind: "silent-member",
        severity: "warning",
        userId: score.member.id,
        message:
          score.lastActiveAt === null
            ? `${score.member.name} has no recorded activity in this workspace.`
            : `${score.member.name} has no recorded activity in the last ${SILENT_DAYS} days.`,
      });
      // One signal per member. A silent member is also, mechanically, a
      // low-share member, and two rows saying the same thing about the same
      // person reads as two problems.
      continue;
    }

    if (score.share < DISENGAGEMENT_SHARE) {
      signals.push({
        kind: "low-share",
        severity: "info",
        userId: score.member.id,
        message: `${score.member.name} accounts for ${Math.round(score.share * 100)}% of recorded activity.`,
      });
    }
  }

  for (const milestone of input.slippedMilestones) {
    signals.push({
      kind: "slipped-milestone",
      severity: "warning",
      userId: null,
      message: `"${milestone.title}" was due ${Math.floor(daysBetween(milestone.dueOn, now))} days ago and is not closed.`,
    });
  }

  if (input.overdueTasks.length >= 3) {
    signals.push({
      kind: "stalled-board",
      severity: "info",
      userId: null,
      message: `${input.overdueTasks.length} tasks are past their due date.`,
    });
  }

  return signals;
}

/**
 * Whether the group as a whole looks healthy — used for the single badge on a
 * faculty list, where a row per signal would not fit.
 */
export function healthLevel(signals: readonly HealthSignal[]): "ok" | "watch" | "attention" {
  if (signals.some((signal) => signal.severity === "warning")) return "attention";
  if (signals.length > 0) return "watch";
  return "ok";
}
