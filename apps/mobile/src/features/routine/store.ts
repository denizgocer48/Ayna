import { type Completion, toIsoDate } from '@ayna/shared';
import { create } from 'zustand';

import { kv, StorageKeys } from '@/lib/storage';

type RoutineState = {
  completions: Completion[];
  lastScanDate: string | null;
  isDone: (taskId: string, date: string) => boolean;
  toggle: (taskId: string, date: string) => void;
  recordScan: (date: string) => void;
};

function load<T>(key: string, fallback: T): T {
  const raw = kv.getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // A corrupt local cache is not worth crashing over; it is a convenience
    // store, and the server holds the record once Faz 2 wires it up.
    return fallback;
  }
}

export function today(): string {
  return toIsoDate(new Date());
}

/**
 * Task completions, held locally.
 *
 * TODO(faz-2): mirror into `daily_logs` so the record survives a reinstall and
 * follows the user across devices. Local storage is the convenience layer, not
 * the record.
 */
export const useRoutineStore = create<RoutineState>((set, get) => ({
  completions: load<Completion[]>(StorageKeys.completions, []),
  lastScanDate: kv.getString(StorageKeys.lastScanDate) ?? null,

  isDone: (taskId, date) =>
    get().completions.some(
      (completion) => completion.taskId === taskId && completion.date === date,
    ),

  toggle: (taskId, date) => {
    const { completions } = get();
    const exists = completions.some(
      (completion) => completion.taskId === taskId && completion.date === date,
    );

    const next = exists
      ? completions.filter(
          (completion) => !(completion.taskId === taskId && completion.date === date),
        )
      : [...completions, { taskId, date }];

    kv.setString(StorageKeys.completions, JSON.stringify(next));
    set({ completions: next });
  },

  recordScan: (date) => {
    kv.setString(StorageKeys.lastScanDate, date);
    set({ lastScanDate: date });
  },
}));
