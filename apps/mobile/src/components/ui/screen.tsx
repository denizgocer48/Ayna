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

  // The top inset belongs to the frame, not to the scrolling content. As
  // content padding it scrolls away with the first row, and everything after it
  // slides up under the transparent status bar and runs through the clock.
  // Inside a sheet there is no inset at all, and the first row would sit on the
  // sheet's top edge without a floor.
  const frame = [
    styles.fill,
    { backgroundColor: colors.background, paddingTop: Math.max(insets.top, spacing.xl) },
  ];
  const padding = {
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: bleed ? 0 : spacing.lg,
  };

  if (scroll) {
    return (
      <View style={frame}>
        <ScrollView
          style={styles.fill}
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
      </View>
    );
  }

  return (
    <View style={[frame, styles.gap, padding, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gap: { gap: spacing.lg },
  content: { flexGrow: 1, gap: spacing.lg },
});
