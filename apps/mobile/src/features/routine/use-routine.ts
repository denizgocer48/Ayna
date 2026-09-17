import {
  deriveTasks,
  sampleMeasurements,
  scanTiming,
  summariseWeek,
  type TaskDefinition,
} from '@ayna/shared';
import { useMemo } from 'react';

import { today, useRoutineStore } from '@/features/routine/store';

/**
 * The routine as the interface needs it.
 *
 * TODO(faz-2): take the measurements from the user's latest scan and the goals
 * from their profile. Until the server is wired, the sample face stands in so
 * the loop can be built and used — the derivation itself is real.
 */
export function useRoutine() {
  const completions = useRoutineStore((state) => state.completions);
  const lastScanDate = useRoutineStore((state) => state.lastScanDate);

  const date = today();

  const tasks: TaskDefinition[] = useMemo(
    () =>
      deriveTasks({
        measured: sampleMeasurements().map((measurement) => measurement.key),
        goals: ['skin_clarity', 'jawline', 'sleep'],
      }),
    [],
  );

  const summary = useMemo(
    () => summariseWeek(tasks, completions, date),
    [tasks, completions, date],
  );

  const timing = useMemo(() => scanTiming(lastScanDate, date), [lastScanDate, date]);

  return { date, tasks, summary, timing };
}
