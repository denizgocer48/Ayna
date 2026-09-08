import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { spacing } from '@/theme';

export type ScreenProps = ViewProps & {
  scroll?: boolean;
  /** Screens that own the full frame (camera) opt out of horizontal padding. */
  bleed?: boolean;
};

export function Screen({ scroll = false, bleed = false, style, children, ...rest }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: bleed ? 0 : spacing.lg,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[styles.fill, { backgroundColor: colors.background }]}
        // flexGrow rather than flex: `flex: 1` would cap the content at exactly
        // the viewport height, so anything taller becomes unreachable — the
        // content simply would not scroll. flexGrow still lets short content
        // fill the screen, which is what the centred layouts rely on.
        contentContainerStyle={[styles.content, padding, style]}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.fill, styles.gap, { backgroundColor: colors.background }, padding, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gap: { gap: spacing.lg },
  content: { flexGrow: 1, gap: spacing.lg },
});
