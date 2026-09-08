import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';

/** TODO(faz-2): latest measurements, streak, next routine item. */
export default function Home() {
  return (
    <Screen scroll>
      <Text variant="h1">Today</Text>

      <Card>
        <Text variant="label" tone="muted">
          NO SCAN YET
        </Text>
        <Text variant="bodySm" tone="secondary">
          Take your first scan to set a baseline. Everything after this is measured
          against it.
        </Text>
      </Card>

      <Button label="Start a scan" onPress={() => router.push('/scan/capture')} />
    </Screen>
  );
}
