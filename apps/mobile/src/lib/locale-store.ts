import { create } from 'zustand';

import {
  type LocalePreference,
  resolveLocale,
  type SupportedLocale,
} from '@/i18n/catalogue';
import { kv, StorageKeys } from '@/lib/storage';

type LocaleState = {
  /** What the user picked: a language, or `system` to follow the device. */
  preference: LocalePreference;
  /** The language actually in use, with `system` already resolved. */
  locale: SupportedLocale;
  setPreference: (preference: LocalePreference) => void;
};

function storedPreference(): LocalePreference {
  const stored = kv.getString(StorageKeys.localePreference);
  return stored === 'en' || stored === 'tr' || stored === 'system' ? stored : 'system';
}

/**
 * The chosen language, in a store so a change re-renders the interface.
 *
 * Components subscribe through `useT()`. Plain `t()` reads this store too, so a
 * helper called during a subscribed component's render gets the current
 * language without needing its own subscription.
 */
export const useLocaleStore = create<LocaleState>((set) => {
  const preference = storedPreference();

  return {
    preference,
    locale: resolveLocale(preference),
    setPreference: (next) => {
      kv.setString(StorageKeys.localePreference, next);
      set({ preference: next, locale: resolveLocale(next) });
    },
  };
});
