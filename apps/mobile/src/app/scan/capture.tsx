import type { Pose } from '@ayna/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { Button, Card, Screen, Text } from '@/components/ui';
import { CaptureOverlay } from '@/features/scan/capture-overlay';
import { FaceCamera, faceDetectionSupported } from '@/features/scan/face-camera';
import { POSE_COPY, POSE_ORDER } from '@/features/scan/poses';
import { useFaceCapture } from '@/features/scan/use-face-capture';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/i18n';
import { AnalyticsEvents, track } from '@/lib/analytics';
import { radius, spacing } from '@/theme';

/**
 * Capture.
 *
 * Everything here runs on the device: the frame never leaves it, and neither do
 * the landmarks. Only the measurements computed at the shutter are uploaded.
 *
 * The shutter stays disabled until the quality gate passes. That is the point
 * of the screen — a frame that fails the gate produces a measurement nobody can
 * trust, and an untrustworthy number is the failure the product exists to
 * avoid.
 */
export default function Capture() {
  const { colors } = useTheme();
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const { quality, onFacesDetected, measure } = useFaceCapture();

  const [captured, setCaptured] = useState<Pose[]>([]);
  const [retry, setRetry] = useState(false);

  const next = POSE_ORDER.find((pose) => !captured.includes(pose));
  const copy = next ? POSE_COPY[next] : null;

  function onShutter() {
    const measurements = measure();
    if (!measurements) {
      // The face moved between the last detection and the tap.
      setRetry(true);
      track(AnalyticsEvents.captureRejected, { reason: 'stale_frame' });
      return;
    }

    setRetry(false);
    // TODO(faz-1): keep the measurements for this pose, then submit both.
    if (next === 'front' && POSE_ORDER.length > 1) {
      setCaptured((poses) => [...poses, 'front']);
      return;
    }
    submit();
  }

  function submit() {
    track(AnalyticsEvents.scanSubmitted, { poses: captured.length + 1 });
    router.push('/scan/analyzing');
  }

  // A simulator build links no detector and has no camera. Rather than a dead
  // screen, offer the rest of the flow so the interface can still be reviewed.
  if (!faceDetectionSupported) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
          <Text variant="h1">{t('capture.simulatorTitle')}</Text>
          <Text tone="secondary">{t('capture.simulatorBody')}</Text>
        </View>
        <Button label={t('capture.simulatorContinue')} onPress={submit} />
        <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!hasPermission) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
          <Text variant="h1">{t('capture.permissionTitle')}</Text>
          <Text tone="secondary">
            {canRequestPermission
              ? t('capture.permissionBody')
              : t('capture.permissionBlockedBody')}
          </Text>
        </View>
        {canRequestPermission ? (
          <Button label={t('capture.permissionGrant')} onPress={() => void requestPermission()} />
        ) : null}
        <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!device) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text variant="h3" center tone="secondary">
            {t('capture.unavailable')}
          </Text>
        </View>
        <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen bleed>
      <View style={styles.frame}>
        <FaceCamera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          onFacesDetected={onFacesDetected}
          onError={() => track(AnalyticsEvents.captureRejected, { reason: 'camera_error' })}
        />
        <CaptureOverlay quality={quality} />

        {quality === null ? (
          <View style={styles.waiting}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : null}
      </View>

      <View style={styles.controls}>
        <Text variant="h2">{copy ? t(copy.titleKey) : ''}</Text>
        <Text variant="bodySm" tone="secondary">
          {copy ? t(copy.hintKey) : ''}
        </Text>

        {retry ? (
          <Card>
            <Text variant="bodySm" tone="danger">
              {t('capture.hints.blurry')}
            </Text>
          </Card>
        ) : null}

        <Button
          label={t('capture.shutter')}
          disabled={quality?.ok !== true}
          onPress={onShutter}
        />
        {next === 'side' ? (
          <Button label={t('capture.skipSide')} variant="secondary" onPress={submit} />
        ) : null}
        <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const absoluteFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  frame: { flex: 1, overflow: 'hidden', borderRadius: radius.xl },
  waiting: { ...absoluteFill, alignItems: 'center', justifyContent: 'center' },
  controls: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
});
