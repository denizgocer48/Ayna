import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { spacing } from '@/theme';

export default function Welcome() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
        <Text variant="display">{t('welcome.title')}</Text>
        <Text variant="h3" tone="secondary">
          {t('welcome.tagline')}
        </Text>
        <Text variant="bodySm" tone="muted">
          {t('welcome.body')}
        </Text>
      </View>

      <Button label={t('welcome.cta')} onPress={() => router.push('/(onboarding)/age-gate')} />
    </Screen>
  );
}
