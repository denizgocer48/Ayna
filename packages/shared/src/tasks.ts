import { z } from 'zod';

import type { MetricKey } from './metrics';
import { METRIC_META } from './metrics';
import type { Goal } from './profile';

/**
 * The routine library.
 *
 * Two rules govern what may be in here, and both are enforceable rather than
 * aspirational:
 *
 *   1. **Evidence, not folklore.** Every item has to be supported for adults.
 *      Mewing is the obvious counter-example and is blocked by name in
 *      `services/api/app/analysis/recommendations.py` — a 2022 systematic review
 *      found no high-quality evidence it changes adult facial structure, and
 *      adults are the only users we serve.
 *   2. **No medical claims.** An item may support something; it may not treat,
 *      cure or diagnose it. See docs/compliance.md.
 *
 * `affects` names the metrics an item plausibly influences. It is what lets the
 * interface answer "why am I being told to do this" with a measurement rather
 * than a slogan — so it must stay honest. An item that affects nothing we
 * measure is still allowed, but it can never claim measured progress.
 */

export const taskCadenceSchema = z.enum(['daily', 'weekly']);
export type TaskCadence = z.infer<typeof taskCadenceSchema>;

export const taskCategorySchema = z.enum([
  'skincare',
  'grooming',
  'hair',
  'posture',
  'fitness',
  'sleep',
  'habits',
]);
export type TaskCategory = z.infer<typeof taskCategorySchema>;

export type TaskDefinition = {
  id: string;
  category: TaskCategory;
  cadence: TaskCadence;
  /** Metrics this plausibly influences. Empty means it claims no measurement. */
  affects: readonly MetricKey[];
  /** Goals this serves, for users who have not scanned yet. */
  serves: readonly Goal[];
  /** Weeks before a measurable change is realistic. Sets honest expectations. */
  horizonWeeks: number;
};

/**
 * Points are a count of effort, nothing more.
 *
 * Deliberately linear, with no streak multiplier: the only thing this number is
 * good for is being verifiable, and a multiplier makes "182" impossible to
 * interpret. The streak is shown separately, where it means what it says.
 */
export const POINTS: Record<TaskCadence, number> = {
  daily: 10,
  weekly: 30,
};

export const TASK_LIBRARY: readonly TaskDefinition[] = [
  {
    id: 'sleep_consistent',
    category: 'sleep',
    cadence: 'daily',
    affects: ['eye_aspect_ratio', 'dark_circle_index'],
    serves: ['sleep', 'overall_confidence'],
    horizonWeeks: 3,
  },
  {
    id: 'evening_sodium',
    category: 'habits',
    cadence: 'daily',
    affects: ['eye_aspect_ratio', 'jawline_definition'],
    serves: ['jawline', 'skin_clarity'],
    horizonWeeks: 2,
  },
  {
    id: 'sunscreen',
    category: 'skincare',
    cadence: 'daily',
    affects: ['hyperpigmentation_index', 'texture_uniformity'],
    serves: ['skin_clarity'],
    horizonWeeks: 12,
  },
  {
    id: 'cleanse_twice',
    category: 'skincare',
    cadence: 'daily',
    affects: ['acne_density', 'oiliness_index'],
    serves: ['skin_clarity'],
    horizonWeeks: 6,
  },
  {
    id: 'moisturise',
    category: 'skincare',
    cadence: 'daily',
    affects: ['texture_uniformity'],
    serves: ['skin_clarity'],
    horizonWeeks: 4,
  },
  {
    id: 'hydration',
    category: 'habits',
    cadence: 'daily',
    affects: ['eye_aspect_ratio'],
    serves: ['skin_clarity', 'overall_confidence'],
    horizonWeeks: 2,
  },
  {
    id: 'cardio',
    category: 'fitness',
    cadence: 'weekly',
    affects: ['jawline_definition', 'submental_cervical_angle'],
    serves: ['body_composition', 'jawline'],
    horizonWeeks: 10,
  },
  {
    id: 'posture_check',
    category: 'posture',
    cadence: 'daily',
    affects: ['submental_cervical_angle'],
    serves: ['jawline', 'overall_confidence'],
    horizonWeeks: 6,
  },
  {
    id: 'facial_hair_trim',
    category: 'grooming',
    cadence: 'weekly',
    affects: [],
    serves: ['facial_hair'],
    horizonWeeks: 1,
  },
  {
    id: 'scalp_care',
    category: 'hair',
    cadence: 'weekly',
    affects: [],
    serves: ['hair'],
    horizonWeeks: 8,
  },
] as const;

export const TASKS_BY_ID: Record<string, TaskDefinition> = Object.fromEntries(
  TASK_LIBRARY.map((task) => [task.id, task]),
);

/**
 * Which metrics a routine can actually move.
 *
 * A `fixed` metric is bone geometry: no task changes it, so no task may claim
 * it. Filtering here rather than in the interface means an item cannot be
 * attributed to something it could not possibly affect.
 */
export function actionableMetrics(measured: readonly MetricKey[]): MetricKey[] {
  return measured.filter((key) => METRIC_META[key].mutability !== 'fixed');
}

export type DeriveTasksInput = {
  /** Metrics from the latest scan. Empty before the first scan. */
  measured: readonly MetricKey[];
  /** Goals chosen during onboarding. */
  goals: readonly Goal[];
  /** Cap on daily items. A routine nobody can finish is a routine nobody starts. */
  maxDaily?: number;
  maxWeekly?: number;
};

/**
 * Choose the routine.
 *
 * Before the first scan there is nothing to measure against, so goals decide.
 * After it, items that affect a metric we actually measure and that the user
 * can actually move come first — those are the only ones whose effect the app
 * will ever be able to show.
 */
export function deriveTasks(input: DeriveTasksInput): TaskDefinition[] {
  const { measured, goals, maxDaily = 4, maxWeekly = 2 } = input;
  const actionable = new Set(actionableMetrics(measured));
  const wanted = new Set(goals);

  const score = (task: TaskDefinition): number => {
    const movesSomethingMeasured = task.affects.some((key) => actionable.has(key));
    const servesAGoal = task.serves.some((goal) => wanted.has(goal));

    // A task that both serves a stated goal and moves a measured metric is the
    // only kind whose effect the user will be able to see.
    if (movesSomethingMeasured && servesAGoal) return 3;
    if (movesSomethingMeasured) return 2;
    if (servesAGoal) return 1;
    return 0;
  };

  const chosen = (cadence: TaskCadence, limit: number) =>
    TASK_LIBRARY.filter((task) => task.cadence === cadence)
      .map((task, index) => ({ task, rank: score(task), index }))
      .filter(({ rank }) => rank > 0)
      // Stable: equal ranks keep library order, so the routine does not shuffle
      // between renders for no reason.
      .sort((a, b) => b.rank - a.rank || a.index - b.index)
      .slice(0, limit)
      .map(({ task }) => task);

  return [...chosen('daily', maxDaily), ...chosen('weekly', maxWeekly)];
}
