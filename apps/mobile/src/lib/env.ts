import Constants from 'expo-constants';

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  apiUrl?: string;
  revenueCatIosKey?: string;
  revenueCatAndroidKey?: string;
  posthogKey?: string;
  posthogHost?: string;
  variant?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing config value "${name}". Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required(extra.supabaseUrl, 'EXPO_PUBLIC_SUPABASE_URL');
  },
  get supabaseAnonKey() {
    return required(extra.supabaseAnonKey, 'EXPO_PUBLIC_SUPABASE_ANON_KEY');
  },
  get apiUrl() {
    return required(extra.apiUrl, 'EXPO_PUBLIC_API_URL');
  },
  revenueCatIosKey: extra.revenueCatIosKey,
  revenueCatAndroidKey: extra.revenueCatAndroidKey,
  posthogKey: extra.posthogKey,
  posthogHost: extra.posthogHost ?? 'https://eu.i.posthog.com',
  variant: extra.variant ?? 'production',
  isDev: extra.variant === 'development',
};
