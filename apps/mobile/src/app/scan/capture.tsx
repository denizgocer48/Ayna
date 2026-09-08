import type { Pose } from '@ayna/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { CAPTURE_GUIDANCE } from '@/features/scan/guidance';
import { POSE_COPY, POSE_ORDER, SIDE_POSE_BENEFIT } from '@/features/scan/poses';
import { spacing } from '@/theme';

/**
 * TODO(faz-1): VisionCamera preview + face-oval overlay + live quality gate.
 * The shutter stays disabled until `evaluateCaptureQuality` returns ok — a bad
 * frame must never reach the analyser.
 */
export default function Capture() {
  const [captured, setCaptured] = useState<Pose[]>([]);
  const next = POSE_ORDER.find((pose) => !captured.includes(pose));
  const copy = next ? POSE_COPY[next] : null;

  function submit() {
    router.push('/scan/analyzing');
  }

  return (
    <Screen scroll>
      <Text variant="h1">{copy ? copy.title : 'Ready'}</Text>
      <Text tone="secondary">{copy ? copy.hint : 'Both photos captured.'}</Text>

      {next === 'front' ? (
        <View style={{ gap: spacing.sm }}>
          {CAPTURE_GUIDANCE.rules.map((rule) => (
            <Card key={rule}>
              <Text variant="bodySm" tone="secondary">
                {rule}
              </Text>
            </Card>
          ))}
        </View>
      ) : null}

      {next === 'side' ? (
        <Card>
          <Text variant="label" tone="accent">
            OPTIONAL
          </Text>
          <Text variant="bodySm" tone="secondary">
            {SIDE_POSE_BENEFIT}
          </Text>
        </Card>
      ) : null}

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Camera preview and the live quality gate land in Faz 1. VisionCamera needs
          a development build — Expo Go cannot load it.
        </Text>
      </Card>

      {next ? (
        <Button
          label={`Capture ${copy?.title.toLowerCase()}`}
          onPress={() => setCaptured((poses) => [...poses, next])}
        />
      ) : (
        <Button label="Analyse" onPress={submit} />
      )}

      {next === 'side' ? (
        <Button label="Skip side photo" variant="secondary" onPress={submit} />
      ) : null}

      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
