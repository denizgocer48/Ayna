import { createMMKV } from 'react-native-mmkv';

/**
 * Device-local key/value store. Holds UI state and cached results only.
 * Face images and raw landmarks never land here — see docs/compliance.md.
 */
export const storage = createMMKV({ id: 'ayna' });

// Expo Router renders routes on the server for web, where MMKV cannot access
// device storage. The client evaluates this module again during hydration, so
// server reads can safely use empty defaults and server writes can be ignored.
const isServer = typeof window === 'undefined';

export const StorageKeys = {
  onboardingCompleted: 'onboarding.completed',
  ageConfirmed: 'consent.age',
  consentVersion: 'consent.version',
  lastScanId: 'scan.last',
  lastScanDate: 'scan.lastDate',
  completions: 'routine.completions',
  colorScheme: 'ui.colorScheme',
  localePreference: 'ui.locale',
  onboardingProfile: 'onboarding.profile',
} as const;

export const kv = {
  getBool: (key: string) => (isServer ? false : storage.getBoolean(key) ?? false),
  setBool: (key: string, value: boolean) => {
    if (!isServer) storage.set(key, value);
  },
  getString: (key: string) => (isServer ? undefined : storage.getString(key)),
  setString: (key: string, value: string) => {
    if (!isServer) storage.set(key, value);
  },
  remove: (key: string) => {
    if (!isServer) storage.remove(key);
  },
  clearAll: () => {
    if (!isServer) storage.clearAll();
  },
};
