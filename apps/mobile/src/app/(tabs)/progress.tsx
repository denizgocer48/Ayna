import { Card, Screen, Text } from '@/components/ui';
import { NOT_COMPARABLE_NOTE } from '@/features/progress/trend';

/** TODO(faz-2): measurement timeline and the before/after comparison. */
export default function Progress() {
  return (
    <Screen scroll>
      <Text variant="h1">Progress</Text>
      <Text tone="secondary">
        Every scan is compared to your first one. No score, no ranking against other people.
      </Text>

      <Card>
        <Text variant="bodySm" tone="muted">
          {NOT_COMPARABLE_NOTE}
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          Timeline and before/after comparison land in Faz 2.
        </Text>
      </Card>
    </Screen>
  );
}
