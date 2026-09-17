import { z } from 'zod';

import { POINTS, type TaskDefinition } from './tasks';

/**
 * Effort: what the user did, counted.
 *
 * This is the honest half of the two numbers the product shows. It makes no
 * claim about a face — "you completed 18 of 21 items this week" is a verifiable
 * fact, and it is allowed to go up simply because someone did the work.
 *
 * The measurement half is in `progress`, where a number may only move when a
 * measurement moves. Keeping them apart is the whole point: the daily reward
 * comes from here, so nothing is ever tempted to inflate the measurements to
 * manufacture one.
 */

/** One task done on one day. Dates are ISO calendar days in the user's zone. */
export const completionSchema = z.object({
  taskId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type Completion = z.infer<typeof completionSchema>;

export const effortSummarySchema = z.object({
  pointsEarned: z.number().int().nonnegative(),
  pointsAvailable: z.number().int().nonnegative(),
  tasksCompleted: z.number().int().nonnegative(),
  tasksTotal: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
});
export type EffortSummary = z.infer<typeof effortSummarySchema>;

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

/** The seven days ending today, oldest first. */
export function weekEnding(today: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
}

/**
 * Consecutive days, counting back from today, on which anything was completed.
 *
 * Today not being done yet does not break a streak — the day is still running.
 * Breaking it at the first idle hour would punish the user for checking in
 * early, which is exactly when we want them to check in.
 */
export function streakDays(completions: readonly Completion[], today: string): number {
  const days = new Set(completions.map((completion) => completion.date));

  let streak = 0;
  let cursor = days.has(today) ? today : addDays(today, -1);

  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Summarise the last seven days.
 *
 * A daily task is available on each of the seven days; a weekly task once. The
 * denominator therefore describes what was actually askable, so "18 of 21" is a
 * real ratio rather than a flattering one.
 */
export function summariseWeek(
  tasks: readonly TaskDefinition[],
  completions: readonly Completion[],
  today: string,
): EffortSummary {
  const week = new Set(weekEnding(today));
  const inWeek = completions.filter((completion) => week.has(completion.date));

  const byId = new Map(tasks.map((task) => [task.id, task]));
  const counted = inWeek.filter((completion) => byId.has(completion.taskId));

  const pointsEarned = counted.reduce(
    (total, completion) => total + POINTS[byId.get(completion.taskId)!.cadence],
    0,
  );

  const tasksTotal = tasks.reduce(
    (total, task) => total + (task.cadence === 'daily' ? 7 : 1),
    0,
  );
  const pointsAvailable = tasks.reduce(
    (total, task) => total + POINTS[task.cadence] * (task.cadence === 'daily' ? 7 : 1),
    0,
  );

  return {
    pointsEarned,
    pointsAvailable,
    tasksCompleted: counted.length,
    tasksTotal,
    streakDays: streakDays(completions, today),
  };
}
