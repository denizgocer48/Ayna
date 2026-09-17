import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';

/** TODO(faz-1): multi-select over `goalSchema` from @ayna/shared. */
export default function Goals() {
  const t = useT();
  return (
    <Screen scroll>
      <Text variant="h1">{t('onboarding.goalsTitle')}</Text>
      <Text tone="secondary">{t('onboarding.goalsBody')}</Text>

      <Card>
        <Text variant="label" tone="accent">
          {t('common.placeholder')}
        </Text>
        <Text variant="bodySm" tone="muted">
          {t('onboarding.goalsPlaceholder')}
        </Text>
      </Card>

      <Button label={t('common.continue')} onPress={() => router.push('/(onboarding)/consent')} />
    </Screen>
  );
}
