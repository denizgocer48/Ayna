import { createMMKV } from 'react-native-mmkv';

/**
 * Device-local key/value store. Holds UI state and cached results only.
 * Face images and raw landmarks never land here — see docs/compliance.md.
 */
export const storage = createMMKV({ id: 'ayna' });

export const StorageKeys = {
  onboardingCompleted: 'onboarding.completed',
  ageConfirmed: 'consent.age',
  consentVersion: 'consent.version',
  lastScanId: 'scan.last',
  colorScheme: 'ui.colorScheme',
} as const;

export const kv = {
  getBool: (key: string) => storage.getBoolean(key) ?? false,
  setBool: (key: string, value: boolean) => storage.set(key, value),
  getString: (key: string) => storage.getString(key),
  setString: (key: string, value: string) => storage.set(key, value),
  remove: (key: string) => storage.remove(key),
  clearAll: () => storage.clearAll(),
};
