import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';

/** TODO(faz-2): latest measurements, streak, next routine item. */
export default function Home() {
  return (
    <Screen scroll>
      <Text variant="h1">{t('home.title')}</Text>

      <Card>
        <Text variant="label" tone="muted">
          {t('home.noScanLabel')}
        </Text>
        <Text variant="bodySm" tone="secondary">
          {t('home.noScanBody')}
        </Text>
      </Card>

      <Button label={t('home.startScan')} onPress={() => router.push('/scan/capture')} />
    </Screen>
  );
}
