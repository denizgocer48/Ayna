import { colors, radius, spacing, typography } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Ayna is dark-first: an unspecified system scheme resolves to dark so the
 * capture and score surfaces keep their intended contrast.
 */
export function useTheme() {
  const scheme = useColorScheme();
  const resolved = scheme === 'light' ? 'light' : 'dark';

  return {
    scheme: resolved,
    colors: colors[resolved],
    spacing,
    radius,
    typography,
  } as const;
}
