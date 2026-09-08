import { useLocalSearchParams } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';
import { router } from 'expo-router';

/**
 * TODO(faz-2): score gauge (Skia), sub-score radar, metric breakdown behind the
 * paywall, recommendation list.
 */
export default function ScanResult() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();

  return (
    <Screen scroll>
      <Text variant="h1">Your baseline</Text>
      <Text variant="caption" tone="muted">
        scan {scanId}
      </Text>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Score gauge, sub-scores and the metric breakdown land in Faz 2.
        </Text>
      </Card>

      <Button label="Done" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
