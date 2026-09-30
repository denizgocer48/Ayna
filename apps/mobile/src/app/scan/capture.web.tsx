import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { spacing } from '@/theme';

/**
 * Browser fallback for a capture flow backed by native camera modules.
 * It keeps the review flow usable without importing VisionCamera on web.
 */
export default function CaptureWeb() {
  const t = useT();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
        <Text variant="h1">{t('capture.simulatorTitle')}</Text>
        <Text tone="secondary">{t('capture.simulatorBody')}</Text>
      </View>
      <Button
        label={t('capture.simulatorContinue')}
        onPress={() => router.push('/scan/analyzing?sample=1')}
      />
      <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
