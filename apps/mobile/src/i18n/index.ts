import { useLocaleStore } from '@/lib/locale-store';

import { type CopyKey, translate } from './catalogue';

export {
  type CopyKey,
  type LocalePreference,
  resolveLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './catalogue';

/**
 * Translate outside a component, or inside one that already subscribes.
 *
 * Reads the current language but does not subscribe, so a component that
 * renders text must call `useT()` instead — otherwise its strings will not
 * change when the language does.
 */
export function t(key: CopyKey): string {
  return translate(key, useLocaleStore.getState().locale);
}

/**
 * Translate inside a component, subscribing to the chosen language.
 *
 * Returns a function with the same shape as `t`, so call sites read identically
 * and the only difference is that this component re-renders on a change.
 */
export function useT(): (key: CopyKey) => string {
  const locale = useLocaleStore((state) => state.locale);
  return (key: CopyKey) => translate(key, locale);
}
