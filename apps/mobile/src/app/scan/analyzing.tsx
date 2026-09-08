import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';
import { spacing } from '@/theme';

/**
 * The pause between capture and result.
 *
 * Measurement already happened on the device — this screen is waiting on the
 * network round trip that stores the scan and returns progress, not on
 * analysis. There is nothing to poll.
 *
 * Deliberately no fake progress bar and no scanning animation. If the wait is
 * short the animation is a lie about the work; if it is long the honest thing
 * is to say the network is slow.
 *
 * TODO(faz-1): submit the measurements with `POST /scans`, then replace to the
 * returned scan id.
 */
export default function Analyzing() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text variant="h3" center>
          {t('capture.analysing')}
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
