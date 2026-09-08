import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';

/** TODO(faz-1): multi-select over `goalSchema` from @ayna/shared. */
export default function Goals() {
  return (
    <Screen scroll>
      <Text variant="h1">What do you want to work on?</Text>
      <Text tone="secondary">Pick up to four. This shapes your routine, not your score.</Text>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Goal chips land in Faz 1.
        </Text>
      </Card>

      <Button label="Continue" onPress={() => router.push('/(onboarding)/consent')} />
    </Screen>
  );
}
