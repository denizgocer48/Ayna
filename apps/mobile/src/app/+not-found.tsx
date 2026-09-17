import { Link } from 'expo-router';

import { Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';

export default function NotFound() {
  const t = useT();
  return (
    <Screen>
      <Text variant="h2">{t('notFound.title')}</Text>
      <Link href="/">
        <Text tone="accent">{t('notFound.home')}</Text>
      </Link>
    </Screen>
  );
}
