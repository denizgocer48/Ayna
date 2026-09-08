import { Link } from 'expo-router';

import { Screen, Text } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen>
      <Text variant="h2">Screen not found</Text>
      <Link href="/">
        <Text tone="accent">Go home</Text>
      </Link>
    </Screen>
  );
}
