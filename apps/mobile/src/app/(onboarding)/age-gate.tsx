import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { spacing } from '@/theme';

/**
 * Hard age gate. Processing a minor's facial biometrics carries a materially
 * heavier legal burden (KVKK m.6 / GDPR Art.8+9), so under-18 users are
 * blocked from the analysis flow entirely rather than degraded.
 */
export default function AgeGate() {
  const [blocked, setBlocked] = useState(false);

  if (blocked) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
          <Text variant="h2">Ayna is 18+</Text>
          <Text tone="secondary">
            Ayna analyses facial measurements, which counts as biometric data. We only
            offer that to adults. Thanks for your honesty.
          </Text>
        </View>
        <Button label="Go back" variant="secondary" onPress={() => setBlocked(false)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
        <Text variant="h1">Are you 18 or older?</Text>
        <Card>
          <Text variant="bodySm" tone="secondary">
            Facial measurements are biometric data. Ayna is available to adults only.
          </Text>
        </Card>
      </View>

      <Button
        label="Yes, I am 18 or older"
        onPress={() => router.push('/(onboarding)/profile')}
      />
      <Button label="No" variant="ghost" onPress={() => setBlocked(true)} />
    </Screen>
  );
}
