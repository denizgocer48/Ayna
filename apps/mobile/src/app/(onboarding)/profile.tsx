import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * TODO(faz-1): birth year + sex pickers.
 * These are not cosmetic — they select the reference distribution every metric
 * is normalised against. Without them a percentile is meaningless.
 */
export default function ProfileStep() {
  const t = useT();
  return (
    <Screen scroll>
      <Text variant="h1">{t('onboarding.profileTitle')}</Text>
      <Text tone="secondary">{t('onboarding.profileBody')}</Text>

      <Card>
        <Text variant="label" tone="accent">
          {t('common.placeholder')}
        </Text>
        <Text variant="bodySm" tone="muted">
          {t('onboarding.profilePlaceholder')}
        </Text>
      </Card>

      <Button label={t('common.continue')} onPress={() => router.push('/(onboarding)/goals')} />
    </Screen>
  );
}
