import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { spacing } from '@/theme';

/**
 * TODO(faz-2): poll `GET /scans/{id}` until status leaves `processing`.
 * Analysis is queued server-side, so this screen owns the wait — never block
 * the upload request on inference.
 */
export default function Analyzing() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text variant="h3" center>
          Measuring
        </Text>
        <Text variant="bodySm" tone="muted" center>
          Landmark detection, then 17 geometric measurements.
        </Text>
        <Text
          variant="caption"
          tone="accent"
          onPress={() => router.replace('/scan/result/demo')}
        >
          Skip to result (dev)
        </Text>
      </View>
    </Screen>
  );
}
