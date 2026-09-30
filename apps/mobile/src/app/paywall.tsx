import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * TODO(faz-4): wire to RevenueCat offerings for the `ENTITLEMENT` product.
 *
 * The paywall sits *after* the first scored result, never before it. The user
 * has already seen their real baseline and the size of their gap, so there is
 * something concrete to buy against — and App Store review does not open an
 * empty app (Guideline 4.2).
 */
export default function Paywall() {
  const t = useT();
  // The sheet opens below the status bar, but the root provider still reports
  // the full-screen inset, which left a status-bar-sized gap above the title.
  // A provider of its own measures the sheet rather than the window.
  return (
    <SafeAreaProvider>
      <Screen scroll>
        <Text variant="h1">{t('paywall.title')}</Text>
        <Text tone="secondary">{t('paywall.body')}</Text>

        <Card>
          <Text variant="label">{t('paywall.freeLabel')}</Text>
          <Text variant="bodySm" tone="secondary">{t('paywall.freeBody')}</Text>
        </Card>

        <Card>
          <Text variant="label" tone="accent">{t('paywall.plusLabel')}</Text>
          <Text variant="bodySm" tone="secondary">{t('paywall.plusBody')}</Text>
        </Card>

        <Card>
          <Text variant="label" tone="accent">{t('common.placeholder')}</Text>
          <Text variant="bodySm" tone="muted">{t('paywall.placeholder')}</Text>
        </Card>

        <Button label={t('common.close')} variant="secondary" onPress={() => router.back()} />
      </Screen>
    </SafeAreaProvider>
  );
}
