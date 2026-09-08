/**
 * Ayna design tokens.
 * Dark-first: the product is a camera/analysis surface, dark reduces glare on
 * face imagery and keeps score visualisations high-contrast.
 */
import { Platform } from 'react-native';

const palette = {
  ink900: '#08090B',
  ink800: '#0F1114',
  ink700: '#16191E',
  ink600: '#1F242B',
  ink500: '#2B323B',
  ink400: '#3D4650',
  slate400: '#7C8794',
  slate300: '#A6B0BC',
  slate200: '#D3D9E0',
  white: '#FFFFFF',

  gold500: '#C8A24A',
  gold400: '#DCBB6B',
  gold300: '#EFD79C',

  green500: '#3FBF7F',
  amber500: '#E8A33D',
  red500: '#E5484D',
  blue500: '#3E7BFA',
} as const;

export const colors = {
  dark: {
    background: palette.ink900,
    surface: palette.ink800,
    surfaceRaised: palette.ink700,
    surfaceSunken: '#050608',
    border: palette.ink600,
    borderStrong: palette.ink500,

    text: palette.white,
    textSecondary: palette.slate300,
    textMuted: palette.slate400,
    textInverse: palette.ink900,

    accent: palette.gold400,
    accentStrong: palette.gold500,
    accentSoft: 'rgba(220, 187, 107, 0.14)',
    onAccent: palette.ink900,

    success: palette.green500,
    warning: palette.amber500,
    danger: palette.red500,
    info: palette.blue500,

    overlay: 'rgba(0, 0, 0, 0.6)',
    scrim: 'rgba(8, 9, 11, 0.85)',
  },
  light: {
    background: '#FBFBFC',
    surface: palette.white,
    surfaceRaised: palette.white,
    surfaceSunken: '#F1F2F5',
    border: '#E4E7EC',
    borderStrong: '#CFD4DC',

    text: palette.ink900,
    textSecondary: '#4A525E',
    textMuted: '#79828F',
    textInverse: palette.white,

    accent: palette.gold500,
    accentStrong: '#A6842F',
    accentSoft: 'rgba(200, 162, 74, 0.12)',
    onAccent: palette.white,

    success: '#2E9E68',
    warning: '#C4832B',
    danger: '#D13E43',
    info: '#2E63D8',

    overlay: 'rgba(0, 0, 0, 0.4)',
    scrim: 'rgba(255, 255, 255, 0.88)',
  },
} as const;

/**
 * Trend colours for progress against the user's own baseline.
 *
 * There is no score band, because there is no score — see docs/norms.md. What
 * the UI colours is direction of change, and `notComparable` is deliberately
 * muted: a fixed measurement is information, not a verdict, and must not read
 * as a failure.
 */
export const trendColors = {
  improved: palette.green500,
  held: palette.slate400,
  declined: palette.amber500,
  notComparable: palette.ink400,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 40, lineHeight: 44, fontWeight: '700' },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '600' },
  h3: { fontSize: 19, lineHeight: 25, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 17, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  mono: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
} as const;

export const fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'system-ui, sans-serif', rounded: 'system-ui, sans-serif', mono: 'ui-monospace, monospace' },
})!;

/** Reanimated durations. Keep motion short — this is a utility app, not a toy. */
export const motion = {
  fast: 150,
  base: 240,
  slow: 420,
  gauge: 1100,
} as const;

export type ColorScheme = keyof typeof colors;
export type ThemeColors = (typeof colors)['dark'];
