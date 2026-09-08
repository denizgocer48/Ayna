import { FREE_SCAN_ALLOWANCE } from '@ayna/shared';
import { router } from 'expo-router';

import { Button, Card, Screen, Text } from '@/components/ui';

/**
 * TODO(faz-4): wire to RevenueCat offerings for the `ENTITLEMENT` product.
 *
 * The paywall sits *after* the first scored result, never before it. The user
 * has already seen their real baseline and the size of their gap, so there is
 * something concrete to buy against — and App Store review does not open an
 * empty app (Guideline 4.2).
 */
export default function Paywall() {
  return (
    <Screen scroll>
      <Text variant="h1">Ayna Plus</Text>
      <Text tone="secondary">
        The routine built from your measurements, and the tracking that shows whether
        it worked.
      </Text>

      <Card>
        <Text variant="label">Free</Text>
        <Text variant="bodySm" tone="secondary">
          {FREE_SCAN_ALLOWANCE} scan. Your baseline measurements, kept.
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          Plus
        </Text>
        <Text variant="bodySm" tone="secondary">
          A routine built from your own measurements, unlimited scans, and the
          progress timeline that shows what actually changed.
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          PLACEHOLDER
        </Text>
        <Text variant="bodySm" tone="muted">
          RevenueCat offerings are not wired yet. Products, pricing and trial length
          are decided in Faz 4.
        </Text>
      </Card>

      <Button label="Close" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
