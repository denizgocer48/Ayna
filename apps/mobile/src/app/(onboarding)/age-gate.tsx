import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { spacing } from '@/theme';

/**
 * Hard age gate. Processing a minor's facial biometrics carries a materially
 * heavier legal burden (KVKK m.6 / GDPR Art. 8+9), and the documented harm in
 * this category is concentrated in teenagers — so under-18 users are blocked
 * from the analysis flow entirely rather than degraded.
 */
export default function AgeGate() {
  const [blocked, setBlocked] = useState(false);

  if (blocked) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
          <Text variant="h2">{t('ageGate.blockedTitle')}</Text>
          <Text tone="secondary">{t('ageGate.blockedBody')}</Text>
        </View>
        <Button label={t('common.back')} variant="secondary" onPress={() => setBlocked(false)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
        <Text variant="h1">{t('ageGate.question')}</Text>
        <Card>
          <Text variant="bodySm" tone="secondary">
            {t('ageGate.why')}
          </Text>
        </Card>
      </View>

      <Button label={t('ageGate.yes')} onPress={() => router.push('/(onboarding)/profile')} />
      <Button label={t('ageGate.no')} variant="ghost" onPress={() => setBlocked(true)} />
    </Screen>
  );
}
