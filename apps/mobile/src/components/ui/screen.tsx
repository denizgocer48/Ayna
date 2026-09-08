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

  const container = [
    styles.root,
    {
      backgroundColor: colors.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingHorizontal: bleed ? 0 : spacing.lg,
    },
    style,
  ];

  if (scroll) {
    return (
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={container}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={container} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.lg },
});
