import type { CaptureQuality } from '@ayna/shared';
import { primaryIssue } from '@ayna/shared';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { hintFor } from '@/features/scan/hints';
import { useTheme } from '@/hooks/use-theme';
import { motion, radius, spacing, trendColors } from '@/theme';
import { t } from '@/i18n';

/**
 * The face oval and the one thing to fix.
 *
 * This exists because the shutter is disabled and the user is owed a reason.
 * What it deliberately is not: a dense landmark mesh or a fake scanning
 * animation. Both are common in this category and both imply a precision the
 * measurement does not have — see docs/architecture.md.
 *
 * The oval is sized as a fraction of the frame that matches the capture gate's
 * own face-ratio window, so filling it is the same thing as passing the check.
 */
export function CaptureOverlay({ quality }: { quality: CaptureQuality | null }) {
  const { colors } = useTheme();
  const issue = quality ? primaryIssue(quality) : null;
  const ready = quality?.ok === true;

  const ovalStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(ready ? trendColors.improved : colors.borderStrong, {
      duration: motion.fast,
    }),
  }));

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.ovalRow}>
        <Animated.View style={[styles.oval, ovalStyle]} />
      </View>

      <View style={[styles.hint, { backgroundColor: colors.scrim }]}>
        <Text variant="h3" center tone={ready ? 'success' : 'default'}>
          {issue ? hintFor(issue) : t('capture.ready')}
        </Text>
      </View>
    </View>
  );
}

/** RN 0.86 no longer types `StyleSheet.absoluteFillObject`; spelled out here. */
const absoluteFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  root: { ...absoluteFill, justifyContent: 'center' },
  ovalRow: { alignItems: 'center' },
  oval: {
    // Matches the gate's face-ratio window: fill the oval and the check passes.
    width: '62%',
    aspectRatio: 0.72,
    borderWidth: 3,
    // A large radius on a non-square box gives an ellipse.
    borderRadius: 9999,
  },
  hint: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing['3xl'],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
});
