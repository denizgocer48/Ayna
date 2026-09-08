import PostHog from 'posthog-react-native';

import { env } from './env';

/**
 * Analytics is opt-out and never carries face data: event properties may hold
 * scores and metric keys, never images, landmarks or raw measurements tied to
 * an identifiable person beyond the user id.
 */
type EventProperties = Record<string, string | number | boolean | null>;

let posthog: PostHog | null = null;

export function initAnalytics(): PostHog | null {
  if (!env.posthogKey || posthog) return posthog;
  posthog = new PostHog(env.posthogKey, { host: env.posthogHost });
  return posthog;
}

export const AnalyticsEvents = {
  onboardingStarted: 'onboarding_started',
  consentGranted: 'consent_granted',
  consentDeclined: 'consent_declined',
  captureOpened: 'capture_opened',
  captureRejected: 'capture_rejected',
  scanSubmitted: 'scan_submitted',
  scanCompleted: 'scan_completed',
  scanFailed: 'scan_failed',
  paywallViewed: 'paywall_viewed',
  purchaseCompleted: 'purchase_completed',
  routineItemChecked: 'routine_item_checked',
} as const;

export function track(event: string, properties?: EventProperties) {
  posthog?.capture(event, properties);
}

export function identify(userId: string, properties?: EventProperties) {
  posthog?.identify(userId, properties);
}

export function resetAnalytics() {
  posthog?.reset();
}
