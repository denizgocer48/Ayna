import type { TaskDefinition } from '@ayna/shared';

import type { CopyKey } from '@/i18n';

/**
 * Copy for a routine item.
 *
 * `why` is not decoration. Every item is attributed to something — a
 * measurement it can move, or a goal the user chose — and showing that is what
 * separates a routine from a list of folk advice.
 */
export function taskTitleKey(task: TaskDefinition): CopyKey {
  return `tasks.${task.id}.title` as CopyKey;
}

export function taskWhyKey(task: TaskDefinition): CopyKey {
  return `tasks.${task.id}.why` as CopyKey;
}
