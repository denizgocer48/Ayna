import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useRoutine } from '@/features/routine/use-routine';
import { useT } from '@/i18n';
import { spacing } from '@/theme';

/**
 * Today.
 *
 * Two numbers, kept apart on purpose. Effort is allowed to rise simply because
 * the user did the work — that is the daily reward, and it is always honest.
 * Measurement sits below it on its own cadence, and only moves when something
 * measurably moved. See docs/product.md.
 */
export default function Home() {
  const t = useT();
  const { summary, timing } = useRoutine();

  const timingCopy =
    timing.readiness === 'first'
      ? t('scanTiming.first')
      : timing.readiness === 'due'
        ? t('scanTiming.due')
        : t(timing.readiness === 'too_early' ? 'scanTiming.tooEarly' : 'scanTiming.early', {
            days: timing.daysSinceLast ?? 0,
          });

  return (
    <Screen scroll>
      <Text variant="h1">{t('home.title')}</Text>

      <Card>
        <Text variant="label" tone="accent">
          {t('routine.effortLabel')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
          <Text variant="display">{summary.pointsEarned}</Text>
          <Text variant="bodySm" tone="muted">
            {t('routine.points')}
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

      <Card>
        <Text variant="label" tone="muted">
          {timing.readiness === 'first' ? t('home.noScanLabel') : t('home.scanLabel')}
        </Text>
        <Text variant="bodySm" tone="secondary">
          {timingCopy}
        </Text>
        {timing.readiness !== 'first' && timing.daysUntilDue > 0 ? (
          <Text variant="caption" tone="muted">
            {t('scanTiming.nextIn', { days: timing.daysUntilDue })}
          </Text>
        ) : null}
      </Card>

      <Button label={t('home.startScan')} onPress={() => router.push('/scan/capture')} />
    </Screen>
  );
}
