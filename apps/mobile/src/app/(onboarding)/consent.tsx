import { CONSENT_VERSION } from '@ayna/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { currentLocale, t } from '@/i18n';
import { AnalyticsEvents, track } from '@/lib/analytics';
import { kv, StorageKeys } from '@/lib/storage';
import { radius, spacing } from '@/theme';

/**
 * Explicit, separate biometric-data consent.
 *
 * This screen exists as its own step on purpose: under KVKK m.6 and GDPR Art. 9
 * consent for special-category data cannot be bundled into general terms
 * acceptance. It must be granular, affirmative and revocable — see
 * docs/compliance.md before changing any copy here.
 *
 * The locale is recorded alongside the version because consent is only valid if
 * the user could read what they agreed to. Knowing the version is not enough;
 * we need to know which translation they saw.
 */
export default function Consent() {
  const { colors } = useTheme();
  const [accepted, setAccepted] = useState(false);

  function grant() {
    const locale = currentLocale();
    // TODO(faz-1): also insert into `consent_events`. Local storage alone does
    // not satisfy has_active_biometric_consent(), so every scan insert will be
    // rejected by RLS until this writes to the database.
    kv.setString(StorageKeys.consentVersion, `${CONSENT_VERSION}:${locale}`);
    kv.setBool(StorageKeys.ageConfirmed, true);
    kv.setBool(StorageKeys.onboardingCompleted, true);
    track(AnalyticsEvents.consentGranted, { version: CONSENT_VERSION, locale });
    router.replace('/(tabs)');
  }

  return (
    <Screen scroll>
      <Text variant="h1">{t('consent.title')}</Text>

      <Card>
        <Text variant="label">{t('consent.whatWeDoLabel')}</Text>
        <Text variant="bodySm" tone="secondary">
          {t('consent.whatWeDoBody')}
        </Text>
      </Card>

      <Card>
        <Text variant="label">{t('consent.whatWeKeepLabel')}</Text>
        <Text variant="bodySm" tone="secondary">
          {t('consent.whatWeKeepBody')}
        </Text>
      </Card>

      <Card>
        <Text variant="label">{t('consent.yourControlLabel')}</Text>
        <Text variant="bodySm" tone="secondary">
          {t('consent.yourControlBody')}
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
          {t('consent.checkbox')}
        </Text>
      </Pressable>

      <Button label={t('common.continue')} disabled={!accepted} onPress={grant} />
      <Button
        label={t('common.notNow')}
        variant="ghost"
        onPress={() => {
          track(AnalyticsEvents.consentDeclined);
          router.back();
        }}
      />
    </Screen>
  );
}
