import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { CAPTURE_GUIDANCE } from '@/features/scan/guidance';
import { spacing } from '@/theme';

/**
 * TODO(faz-1): VisionCamera preview + face-oval overlay + live quality gate.
 * The shutter stays disabled until `evaluateCaptureQuality` returns ok — a bad
 * frame must never reach the analyser.
 */
export default function Capture() {
  return (
    <Screen scroll>
      <Text variant="h1">Capture</Text>
      <Text tone="secondary">{CAPTURE_GUIDANCE.headline}</Text>

      <View style={{ gap: spacing.sm }}>
        {CAPTURE_GUIDANCE.rules.map((rule) => (
          <Card key={rule}>
            <Text variant="bodySm" tone="secondary">
              {rule}
            </Text>
          </Card>
        ))}
      </View>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Camera preview and the live quality gate land in Faz 1. VisionCamera needs
          a development build — Expo Go cannot load it.
        </Text>
      </Card>

      <Button label="Simulate capture" onPress={() => router.push('/scan/analyzing')} />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
