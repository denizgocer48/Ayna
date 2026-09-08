import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { bandColor, FIXED_METRIC_NOTE, gapCopy } from '@/features/score/band';
import { formatScore } from '@/features/score/format';
import { spacing } from '@/theme';

/**
 * TODO(faz-2): replace the placeholder numbers with the real scan, add the Skia
 * gauge and the sub-score radar, and gate the metric breakdown on entitlement.
 *
 * The headline is deliberately two numbers, not one: today's score alone reads
 * as a verdict, while today-versus-reachable reads as a starting point. That
 * framing is also what keeps the app out of the "attractiveness rating"
 * category in review — see docs/compliance.md.
 */
export default function ScanResult() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();

  const overall = 68;
  const reachable = 79;

  return (
    <Screen scroll>
      <Text variant="h1">Your baseline</Text>
      <Text variant="caption" tone="muted">
        scan {scanId}
      </Text>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg }}>
          <View>
            <Text variant="caption" tone="muted">
              TODAY
            </Text>
            <Text variant="display" style={{ color: bandColor(overall) }}>
              {formatScore(overall)}
            </Text>
          </View>
          <View>
            <Text variant="caption" tone="muted">
              REACHABLE
            </Text>
            <Text variant="h1" tone="accent">
              {formatScore(reachable)}
            </Text>
          </View>
        </View>
        <Text variant="bodySm" tone="secondary">
          {gapCopy(overall, reachable)}
        </Text>
      </Card>

      <Card>
        <Text variant="bodySm" tone="muted">
          {FIXED_METRIC_NOTE}
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Sub-score radar and the metric breakdown land in Faz 2. The breakdown is
          the first thing behind the paywall.
        </Text>
      </Card>

      <Button label="Build my routine" onPress={() => router.push('/paywall')} />
      <Button label="Done" variant="secondary" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
