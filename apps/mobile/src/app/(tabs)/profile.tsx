import { Button, Card, Screen, Text } from '@/components/ui';
import { kv } from '@/lib/storage';

/**
 * TODO(faz-1): account, subscription status, consent withdrawal and full data
 * deletion. Consent withdrawal and deletion are legal requirements, not
 * nice-to-haves — they ship with the first release, not later.
 */
export default function ProfileTab() {
  return (
    <Screen scroll>
      <Text variant="h1">Profile</Text>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Account, subscription, consent withdrawal and data deletion land in Faz 1.
        </Text>
      </Card>

      <Button
        label="Reset local state (dev)"
        variant="ghost"
        onPress={() => kv.clearAll()}
      />
    </Screen>
  );
}
