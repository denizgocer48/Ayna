import { sampleMeasurements } from '@ayna/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import {
  formatMeasurement,
  groupLabel,
  groupMeasurements,
  metricLabel,
} from '@/features/progress/format';
import { t } from '@/i18n';
import { spacing } from '@/theme';

/**
 * The result of a scan.
 *
 * The first scan has nothing to compare against, so it records a baseline and
 * says so. There is no overall score and no ranking — see docs/norms.md for why
 * a percentile could not be grounded, and docs/product.md for why progress
 * against your own baseline is the claim instead.
 *
 * TODO(faz-2): fetch the real scan; render the progress block when `progress`
 * is non-null, and gate the full breakdown on entitlement.
 */
export default function ScanResult() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();

  // Real output of the real measurement code, run over a synthetic face, so a
  // build without a camera shows what the pipeline actually produces rather
  // than numbers typed into a mockup.
  const isSample = scanId === 'sample';
  const grouped = useMemo(
    () => groupMeasurements(sampleMeasurements({ withProfile: true })),
    [],
  );

  return (
    <Screen scroll>
      <Text variant="h1">{t('result.baselineTitle')}</Text>
      <Text tone="secondary">{t('result.baselineBody')}</Text>

      {isSample ? (
        <Card>
          <Text variant="label" tone="accent">
            {t('common.placeholder')}
          </Text>
          <Text variant="bodySm" tone="muted">
            {t('result.sampleNotice')}
          </Text>
        </Card>
      ) : null}

      {grouped.map(({ group, rows }) => (
        <Card key={group}>
          <Text variant="label" tone="accent">
            {groupLabel(group).toUpperCase()}
          </Text>
          {rows.map((row) => (
            <View key={row.key} style={styles.row}>
              <Text variant="bodySm" tone="secondary" style={styles.rowLabel}>
                {metricLabel(row.key)}
              </Text>
              <Text variant="mono">{formatMeasurement(row.value, row.unit)}</Text>
            </View>
          ))}
        </Card>
      ))}

      <Card>
        <Text variant="bodySm" tone="muted">
          {t('result.notComparable')}
        </Text>
      </Card>

      <Button label={t('result.buildRoutine')} onPress={() => router.push('/paywall')} />
      <Button
        label={t('common.done')}
        variant="secondary"
        onPress={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    gap: spacing.md,
  },
  rowLabel: { flex: 1 },
};
