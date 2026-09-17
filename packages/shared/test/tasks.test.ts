/**
 * The routine is where a wellness app most easily starts lying: recommending
 * something unevidenced, or attributing an item to a measurement it cannot
 * possibly move. These tests pin both.
 */
import { describe, expect, it } from 'vitest';

import { METRIC_META } from '../src/metrics';
import { actionableMetrics, deriveTasks, TASK_LIBRARY } from '../src/tasks';

describe('the library itself', () => {
  it('names only metrics that exist', () => {
    for (const task of TASK_LIBRARY) {
      for (const key of task.affects) {
        expect(METRIC_META[key], `${task.id} -> ${key}`).toBeDefined();
      }
    }
  });

  it('never attributes an item to bone geometry', () => {
    // No routine moves a fixed metric, so no routine item may claim one.
    for (const task of TASK_LIBRARY) {
      for (const key of task.affects) {
        expect(METRIC_META[key].mutability, `${task.id} -> ${key}`).not.toBe('fixed');
      }
    }
  });

  it('has unique ids', () => {
    const ids = TASK_LIBRARY.map((task) => task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sets an honest horizon on every item', () => {
    for (const task of TASK_LIBRARY) {
      expect(task.horizonWeeks, task.id).toBeGreaterThan(0);
    }
  });

  it('contains no subculture practice', () => {
    // Mewing is the one every competitor ships and the one with no adult
    // evidence. It must not reappear under any id.
    const ids = TASK_LIBRARY.map((task) => task.id).join(' ');
    for (const banned of ['mew', 'chew', 'looksmax', 'mog']) {
      expect(ids).not.toContain(banned);
    }
  });
});

describe('actionableMetrics', () => {
  it('drops fixed metrics', () => {
    const actionable = actionableMetrics(['fwhr', 'jawline_definition', 'gonial_angle']);
    expect(actionable).toEqual(['jawline_definition']);
  });
});

describe('deriveTasks', () => {
  it('falls back to goals before the first scan', () => {
    const tasks = deriveTasks({ measured: [], goals: ['skin_clarity'] });
    expect(tasks.length).toBeGreaterThan(0);
    for (const task of tasks) {
      expect(task.serves).toContain('skin_clarity');
    }
  });

  it('returns nothing when it has neither a goal nor a measurement to act on', () => {
    // Better an empty routine than one invented to fill the screen.
    expect(deriveTasks({ measured: [], goals: [] })).toEqual([]);
  });

  it('prefers items that move something we actually measure', () => {
    const tasks = deriveTasks({
      measured: ['jawline_definition', 'submental_cervical_angle'],
      goals: ['hair'],
      maxDaily: 2,
      maxWeekly: 1,
    });
    const ids = tasks.map((task) => task.id);
    expect(ids).toContain('cardio');
  });

  it('respects the caps, because a routine nobody can finish is not started', () => {
    const tasks = deriveTasks({
      measured: ['jawline_definition', 'eye_aspect_ratio'],
      goals: ['skin_clarity', 'jawline', 'hair', 'sleep'],
      maxDaily: 3,
      maxWeekly: 1,
    });
    expect(tasks.filter((task) => task.cadence === 'daily')).toHaveLength(3);
    expect(tasks.filter((task) => task.cadence === 'weekly')).toHaveLength(1);
  });

  it('is stable across calls', () => {
    const input = { measured: ['jawline_definition'] as const, goals: ['jawline'] as const };
    expect(deriveTasks({ ...input })).toEqual(deriveTasks({ ...input }));
  });
});
