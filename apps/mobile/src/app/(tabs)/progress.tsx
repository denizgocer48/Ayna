import { Card, Screen, Text } from '@/components/ui';

/** TODO(faz-3): score timeline + before/after comparison slider. */
export default function Progress() {
  return (
    <Screen scroll>
      <Text variant="h1">Progress</Text>
      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Timeline and before/after comparison land in Faz 3.
        </Text>
      </Card>
    </Screen>
  );
}
