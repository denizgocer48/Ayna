import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';

/**
 * TODO(faz-1): birth year + sex pickers.
 * These are not cosmetic — they select the reference distribution every metric
 * is normalised against. Without them a percentile is meaningless.
 */
export default function ProfileStep() {
  return (
    <Screen scroll>
      <Text variant="h1">About you</Text>
      <Text tone="secondary">
        Your age and sex decide which reference range your measurements are compared to.
      </Text>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Birth year and sex pickers land in Faz 1.
        </Text>
      </Card>

      <Button label="Continue" onPress={() => router.push('/(onboarding)/goals')} />
    </Screen>
  );
}
