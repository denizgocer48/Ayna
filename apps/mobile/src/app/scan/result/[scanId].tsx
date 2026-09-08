import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { formatMeasurement } from '@/features/progress/format';
import { NOT_COMPARABLE_NOTE } from '@/features/progress/trend';
import { spacing } from '@/theme';

/**
 * TODO(faz-2): fetch the real scan and render its measurements; render the
 * progress block when `progress` is non-null, and gate the full breakdown on
 * entitlement.
 *
 * The first scan has nothing to compare against, so it establishes the baseline
 * and says so. There is no overall score and no ranking — see docs/norms.md for
 * why a percentile could not be grounded, and docs/product.md for why progress
 * against your own baseline is the claim instead.
 */
export default function ScanResult() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();

  const measurements = [
    { key: 'jawline_definition', label: 'Jawline definition', value: 0.62, unit: 'index' },
    { key: 'symmetry_index', label: 'Symmetry', value: 0.94, unit: 'index' },
    { key: 'canthal_tilt', label: 'Canthal tilt', value: 5.4, unit: 'deg' },
  ];

  return (
    <Screen scroll>
      <Text variant="h1">Baseline recorded</Text>
      <Text tone="secondary">
        These are your starting measurements. Every future scan is compared against them,
        not against anyone else.
      </Text>
      <Text variant="caption" tone="muted">
        scan {scanId}
      </Text>

      <Card>
        {measurements.map((measurement) => (
          <View
            key={measurement.key}
            style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}
          >
            <Text variant="bodySm" tone="secondary">
              {measurement.label}
            </Text>
            <Text variant="mono">
              {formatMeasurement(measurement.value, measurement.unit)}
            </Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text variant="bodySm" tone="muted">
          {NOT_COMPARABLE_NOTE}
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Real measurements, the progress comparison and the routine land in Faz 2.
        </Text>
      </Card>

      <Button label="Build my routine" onPress={() => router.push('/paywall')} />
      <Button label="Done" variant="secondary" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
