import { Redirect } from 'expo-router';

import { kv, StorageKeys } from '@/lib/storage';

/**
 * Entry gate. Onboarding carries the age check and the biometric-consent
 * screen, so an un-onboarded user must never reach a capture surface.
 */
export default function Index() {
  const onboarded = kv.getBool(StorageKeys.onboardingCompleted);

  return <Redirect href={onboarded ? '/(tabs)' : '/(onboarding)/welcome'} />;
}
