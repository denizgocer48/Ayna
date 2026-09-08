import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import { en } from './en';
import { tr } from './tr';

export const SUPPORTED_LOCALES = ['en', 'tr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const i18n = new I18n({ en, tr });

// English is the fallback rather than Turkish: an untranslated string surfacing
// in English is recoverable, one surfacing in a language the user cannot read
// is not.
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

function resolveDeviceLocale(): SupportedLocale {
  const languageCode = getLocales()[0]?.languageCode;
  return SUPPORTED_LOCALES.includes(languageCode as SupportedLocale)
    ? (languageCode as SupportedLocale)
    : 'en';
}

i18n.locale = resolveDeviceLocale();

export function setLocale(locale: SupportedLocale) {
  i18n.locale = locale;
}

export function currentLocale(): SupportedLocale {
  return i18n.locale as SupportedLocale;
}

/**
 * Typed lookup. `t('consent.title')` — a key that does not exist in en.ts is a
 * compile error rather than a "[missing translation]" string in the UI.
 */
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type CopyKey = Leaves<typeof en>;

export function t(key: CopyKey): string {
  return i18n.t(key);
}
