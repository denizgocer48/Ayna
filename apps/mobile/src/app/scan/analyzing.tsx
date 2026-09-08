import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';
import { spacing } from '@/theme';

/**
 * The pause between capture and result.
 *
 * Measurement already happened on the device — this screen waits on the network
 * round trip that stores the scan and returns progress, not on analysis. There
 * is nothing to poll.
 *
 * Deliberately no progress bar and no scanning animation. If the wait is short
 * an animation is a lie about the work; if it is long, the honest thing is to
 * say the network is slow.
 *
 * TODO(faz-2): submit the measurements with `POST /scans`, then replace to the
 * returned scan id. The sample path below is what a build without a camera
 * uses, and stands in for that request.
 */
export default function Analyzing() {
  const { colors } = useTheme();
  const { sample } = useLocalSearchParams<{ sample?: string }>();

  useEffect(() => {
    if (sample !== '1') return;

    // Roughly what the real round trip costs, so the transition is not a
    // flash — but nothing here is pretending to compute.
    const timer = setTimeout(() => router.replace('/scan/result/sample'), 1200);
    return () => clearTimeout(timer);
  }, [sample]);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text variant="h3" center>
          {t('capture.analysing')}
        </Text>
      </View>
    </Screen>
  );
}
