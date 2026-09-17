import { getLocales } from 'expo-localization';

import { en } from './en';
import { tr } from './tr';

export const SUPPORTED_LOCALES = ['en', 'tr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** What the user chose. `system` follows the device and is the default. */
export type LocalePreference = 'system' | SupportedLocale;

const CATALOGUES: Record<SupportedLocale, unknown> = { en, tr };

/**
 * Typed key into the copy catalogue. `t('consent.title')` — a key that does not
 * exist in en.ts is a compile error rather than a "[missing translation]"
 * string in the interface.
 */
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type CopyKey = Leaves<typeof en>;

export function deviceLocale(): SupportedLocale {
  const languageCode = getLocales()[0]?.languageCode;
  return SUPPORTED_LOCALES.includes(languageCode as SupportedLocale)
    ? (languageCode as SupportedLocale)
    : 'en';
}

export function resolveLocale(preference: LocalePreference): SupportedLocale {
  return preference === 'system' ? deviceLocale() : preference;
}

/**
 * Look up one string. Falls back to English for a key the translation is
 * missing — an untranslated string a user can still read beats one they cannot.
 */
export function translate(key: CopyKey, locale: SupportedLocale): string {
  const fromLocale = lookup(CATALOGUES[locale], key);
  return fromLocale ?? lookup(en, key) ?? key;
}

function lookup(catalogue: unknown, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
      catalogue,
    );
  return typeof value === 'string' ? value : undefined;
}
