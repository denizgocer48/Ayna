import { Card, Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';

/** TODO(faz-2): routine list with daily check-off, backed by `routine_items`. */
export default function Plan() {
  const t = useT();
  return (
    <Screen scroll>
      <Text variant="h1">{t('plan.title')}</Text>
      <Card>
        <Text variant="label" tone="accent">
          {t('common.placeholder')}
        </Text>
        <Text variant="bodySm" tone="muted">
          {t('plan.placeholder')}
        </Text>
      </Card>
    </Screen>
  );
}
