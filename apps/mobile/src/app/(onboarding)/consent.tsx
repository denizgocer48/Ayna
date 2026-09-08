import { CONSENT_VERSION } from '@ayna/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { AnalyticsEvents, track } from '@/lib/analytics';
import { kv, StorageKeys } from '@/lib/storage';
import { radius, spacing } from '@/theme';

/**
 * Explicit, separate biometric-data consent.
 *
 * This screen exists as its own step on purpose: under KVKK m.6 and GDPR Art.9
 * consent for special-category data cannot be bundled into general terms
 * acceptance. It must be granular, affirmative and revocable — see
 * docs/compliance.md before changing any copy here.
 */
export default function Consent() {
  const { colors } = useTheme();
  const [accepted, setAccepted] = useState(false);

  function grant() {
    kv.setString(StorageKeys.consentVersion, CONSENT_VERSION);
    kv.setBool(StorageKeys.ageConfirmed, true);
    kv.setBool(StorageKeys.onboardingCompleted, true);
    track(AnalyticsEvents.consentGranted, { version: CONSENT_VERSION });
    router.replace('/(tabs)');
  }

  return (
    <Screen scroll>
      <Text variant="h1">Your photo, your data</Text>

      <Card>
        <Text variant="label">What we do</Text>
        <Text variant="bodySm" tone="secondary">
          We measure geometric distances and angles from your photo to build a
          progress baseline and a routine.
        </Text>
      </Card>

      <Card>
        <Text variant="label">What we keep</Text>
        <Text variant="bodySm" tone="secondary">
          We keep the measurements. The photo itself is deleted from our servers
          right after analysis unless you explicitly save it to your progress
          timeline.
        </Text>
      </Card>

      <Card>
        <Text variant="label">Your control</Text>
        <Text variant="bodySm" tone="secondary">
          You can withdraw this consent and delete every scan at any time from
          Profile. Withdrawal removes the measurements too.
        </Text>
      </Card>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => setAccepted((value) => !value)}
        style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: radius.sm,
            borderWidth: 2,
            borderColor: accepted ? colors.accent : colors.borderStrong,
            backgroundColor: accepted ? colors.accent : 'transparent',
          }}
        />
        <Text variant="bodySm" style={{ flex: 1 }}>
          I explicitly consent to Ayna processing facial measurements derived from my
          photo, as described above.
        </Text>
      </Pressable>

      <Button label="Continue" disabled={!accepted} onPress={grant} />
      <Button
        label="Not now"
        variant="ghost"
        onPress={() => {
          track(AnalyticsEvents.consentDeclined);
          router.back();
        }}
      />
    </Screen>
  );
}
