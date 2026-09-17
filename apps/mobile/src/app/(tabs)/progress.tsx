import { Card, Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';

/** TODO(faz-2): measurement timeline and the before/after comparison. */
export default function Progress() {
  const t = useT();
  return (
    <Screen scroll>
      <Text variant="h1">{t('progress.title')}</Text>
      <Text tone="secondary">{t('progress.body')}</Text>

      <Card>
        <Text variant="bodySm" tone="muted">
          {t('result.notComparable')}
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          {t('common.placeholder')}
        </Text>
        <Text variant="bodySm" tone="muted">
          {t('progress.placeholder')}
        </Text>
      </Card>
    </Screen>
  );
}
