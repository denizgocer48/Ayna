import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { radius, spacing } from '@/theme';

/**
 * The scan's own photograph.
 *
 * Framed rather than bled to the edges: this is a record the user is comparing
 * against later, not a hero image, and a contained frame makes two scans easier
 * to hold side by side.
 *
 * The 3:4 frame matches the capture oval's proportions, so what was framed
 * during capture is what appears here.
 */
export function ScanPhoto({ uri, capturedAt }: { uri: string | null; capturedAt?: string }) {
  const { colors } = useTheme();
  const t = useT();

  return (
    <View
      style={{
        aspectRatio: 3 / 4,
        borderRadius: radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSunken,
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ flex: 1 }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={t('result.photoAlt')}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Text variant="bodySm" tone="muted" center>
            {t('result.noPhoto')}
          </Text>
        </View>
      )}

      {uri && capturedAt ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.scrim,
          }}
        >
          <Text variant="caption" tone="secondary">
            {capturedAt}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
