import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { spacing } from '@/theme';

export default function Welcome() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
        <Text variant="display">Ayna</Text>
        <Text variant="h3" tone="secondary">
          Track your grooming and skincare progress with measurements, not guesswork.
        </Text>
        <Text variant="bodySm" tone="muted">
          Ayna measures facial proportions from a photo you take, turns them into a
          progress baseline, and builds a routine around what you can actually change.
        </Text>
      </View>

      <Button label="Get started" onPress={() => router.push('/(onboarding)/age-gate')} />
    </Screen>
  );
}
