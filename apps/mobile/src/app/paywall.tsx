import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';

/**
 * TODO(faz-4): wire to RevenueCat offerings. Kept as a route from day one so
 * every "premium" call site can already `router.push('/paywall')`.
 */
export default function Paywall() {
  return (
    <Screen scroll>
      <Text variant="h1">Ayna Plus</Text>
      <Text tone="secondary">
        Full metric breakdown, weekly progress tracking and a personalised routine.
      </Text>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text tone="muted" variant="bodySm">
          RevenueCat offerings are not wired yet. Products, pricing and the trial
          length are decided in Faz 4.
        </Text>
      </Card>

      <Button label="Close" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
