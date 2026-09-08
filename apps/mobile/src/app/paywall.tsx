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
        Your full metric breakdown, the routine that closes the gap, and unlimited
        scans to track it.
      </Text>

      <Card>
        <Text variant="label">Free</Text>
        <Text variant="bodySm" tone="secondary">
          {FREE_SCAN_ALLOWANCE} scan. Overall score, reachable projection and
          sub-scores.
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          Plus
        </Text>
        <Text variant="bodySm" tone="secondary">
          Every metric with its percentile, a routine built from your own numbers,
          unlimited scans and the progress timeline.
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
