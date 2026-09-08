import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Ayna — face analysis & grooming coach.
 *
 * Positioning note (App Store review): this app is a personal grooming and
 * skincare coach that tracks progress over time. It is deliberately NOT
 * marketed as an "attractiveness rating" app — see docs/compliance.md.
 */
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const bundleId = IS_DEV
  ? 'com.ayna.app.dev'
  : IS_PREVIEW
    ? 'com.ayna.app.preview'
    : 'com.ayna.app';

const appName = IS_DEV ? 'Ayna (Dev)' : IS_PREVIEW ? 'Ayna (Preview)' : 'Ayna';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: 'ayna',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'ayna',
  userInterfaceStyle: 'dark',
  icon: './assets/images/icon.png',

  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: false,
    icon: './assets/expo.icon',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        'Ayna uses the camera to capture the photo you choose to analyse for your grooming and skincare plan.',
      NSPhotoLibraryUsageDescription:
        'Ayna lets you pick an existing photo to analyse instead of taking a new one.',
    },
  },

  android: {
    package: bundleId,
    adaptiveIcon: {
      backgroundColor: '#08090B',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.CAMERA'],
  },

  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#08090B',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],

  // TODO(faz-5): re-add '@sentry/react-native/expo' once a Sentry org and
  // project exist. The plugin runs sentry-cli during the native build to
  // upload source maps, and it hard-fails without --org.

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    variant: process.env.APP_VARIANT ?? 'production',
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
});
