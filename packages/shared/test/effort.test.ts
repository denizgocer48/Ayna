/**
 * Effort is the number allowed to go up simply because someone did the work,
 * so the tests that matter are about it counting honestly: a real denominator,
 * no credit for things outside the routine, and a streak that neither flatters
 * nor punishes.
 */
import { describe, expect, it } from 'vitest';

import { type Completion, streakDays, summariseWeek, weekEnding } from '../src/effort';
import { POINTS, TASKS_BY_ID, type TaskDefinition } from '../src/tasks';

const TODAY = '2026-09-17';

const daily = (id: string): TaskDefinition => TASKS_BY_ID[id]!;

function done(taskId: string, date: string): Completion {
  return { taskId, date };
}

describe('weekEnding', () => {
  it('is seven days ending today, oldest first', () => {
    const week = weekEnding(TODAY);
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-09-11');
    expect(week[6]).toBe(TODAY);
  });
});

describe('streakDays', () => {
  it('counts consecutive days back from today', () => {
    const completions = ['2026-09-15', '2026-09-16', TODAY].map((date) => done('hydration', date));
    expect(streakDays(completions, TODAY)).toBe(3);
  });

  it('does not break a streak just because today is not done yet', () => {
    // The day is still running. Breaking it at the first idle hour would punish
    // checking in early, which is when we want people to check in.
    const completions = ['2026-09-15', '2026-09-16'].map((date) => done('hydration', date));
    expect(streakDays(completions, TODAY)).toBe(2);
  });

  it('stops at the first missed day', () => {
    const completions = ['2026-09-13', '2026-09-15', '2026-09-16'].map((date) =>
      done('hydration', date),
    );
    expect(streakDays(completions, TODAY)).toBe(2);
  });

  it('is zero with nothing recorded', () => {
    expect(streakDays([], TODAY)).toBe(0);
  });
});

describe('summariseWeek', () => {
  const tasks = [daily('hydration'), daily('sunscreen'), daily('cardio')];

  it('builds a denominator from what was actually askable', () => {
    // Two daily tasks over seven days, plus one weekly task asked once.
    const summary = summariseWeek(tasks, [], TODAY);
    expect(summary.tasksTotal).toBe(15);
    expect(summary.pointsAvailable).toBe(POINTS.daily * 14 + POINTS.weekly);
  });

  it('counts completions inside the week only', () => {
    const completions = [
      done('hydration', TODAY),
      done('hydration', '2026-09-11'),
      done('hydration', '2026-09-10'), // eight days ago
    ];
    const summary = summariseWeek(tasks, completions, TODAY);
    expect(summary.tasksCompleted).toBe(2);
  });

  it('ignores completions for tasks outside the routine', () => {
    // A task dropped from the routine must not keep paying out.
    const summary = summariseWeek(tasks, [done('posture_check', TODAY)], TODAY);
    expect(summary.tasksCompleted).toBe(0);
    expect(summary.pointsEarned).toBe(0);
  });

  it('pays weekly tasks more than daily ones', () => {
    const weekly = summariseWeek(tasks, [done('cardio', TODAY)], TODAY);
    const day = summariseWeek(tasks, [done('hydration', TODAY)], TODAY);
    expect(weekly.pointsEarned).toBeGreaterThan(day.pointsEarned);
  });

  it('cannot earn more than was available', () => {
    const everything: Completion[] = tasks.flatMap((task) =>
      (task.cadence === 'daily' ? weekEnding(TODAY) : [TODAY]).map((date) => done(task.id, date)),
    );
    const summary = summariseWeek(tasks, everything, TODAY);
    expect(summary.pointsEarned).toBe(summary.pointsAvailable);
    expect(summary.tasksCompleted).toBe(summary.tasksTotal);
  });
});
