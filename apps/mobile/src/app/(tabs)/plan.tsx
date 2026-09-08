import { Card, Screen, Text } from '@/components/ui';

/** TODO(faz-2): routine list with daily check-off, backed by `routine_items`. */
export default function Plan() {
  return (
    <Screen scroll>
      <Text variant="h1">Your plan</Text>
      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          The routine and its daily check-off land in Faz 2.
        </Text>
      </Card>
    </Screen>
  );
}
