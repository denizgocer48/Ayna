import { View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { useRoutineStore } from '@/features/routine/store';
import { TaskRow } from '@/features/routine/task-row';
import { useRoutine } from '@/features/routine/use-routine';
import { useT } from '@/i18n';
import { spacing } from '@/theme';

export default function Plan() {
  const t = useT();
  const { date, tasks, summary } = useRoutine();
  const isDone = useRoutineStore((state) => state.isDone);
  const toggle = useRoutineStore((state) => state.toggle);

  const daily = tasks.filter((task) => task.cadence === 'daily');
  const weekly = tasks.filter((task) => task.cadence === 'weekly');

  return (
    <Screen scroll>
      <Text variant="h1">{t('plan.title')}</Text>

      <Card>
        <Text variant="label" tone="accent">
          {t('routine.effortLabel')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
          <Text variant="display">{summary.pointsEarned}</Text>
          <Text variant="bodySm" tone="muted">
            / {summary.pointsAvailable} {t('routine.points')}
          </Text>
        </View>
        <Text variant="bodySm" tone="secondary">
          {t('routine.completedOf', {
            done: summary.tasksCompleted,
            total: summary.tasksTotal,
          })}
        </Text>
        {summary.streakDays > 0 ? (
          <Text variant="bodySm" tone="success">
            {t('routine.streak', { days: summary.streakDays })}
          </Text>
        ) : null}
      </Card>

      {tasks.length === 0 ? (
        <Card>
          <Text variant="bodySm" tone="muted">
            {t('routine.empty')}
          </Text>
        </Card>
      ) : null}

      {daily.length > 0 ? (
        <Card>
          <Text variant="label" tone="accent">
            {t('routine.todayLabel')}
          </Text>
          {daily.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              done={isDone(task.id, date)}
              onToggle={() => toggle(task.id, date)}
            />
          ))}
        </Card>
      ) : null}

      {weekly.length > 0 ? (
        <Card>
          <Text variant="label" tone="accent">
            {t('routine.weeklyLabel')}
          </Text>
          {weekly.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              done={isDone(task.id, date)}
              onToggle={() => toggle(task.id, date)}
            />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
