import * as Device from 'expo-device';
import type { ComponentProps } from 'react';

import type { DetectedFace } from '@/features/scan/face-signals';

/**
 * Whether this build can run face detection.
 *
 * False on a simulator, for two independent reasons. The simulator has no
 * camera, so detection has nothing to work on. And ML Kit ships no
 * arm64-simulator slice, so its pods are excluded from simulator builds
 * entirely — see scripts/face-detector.mjs.
 *
 * Both point the same way: capture is a physical-device path.
 */
export const faceDetectionSupported = Device.isDevice;

type FaceCameraProps = {
  style?: ComponentProps<'view'>['style'];
  device: unknown;
  isActive: boolean;
  onFacesDetected: (faces: DetectedFace[]) => void;
  onError: (error: Error) => void;
};

/**
 * The detector-backed camera, loaded lazily.
 *
 * A simulator build does not link the native module at all, so it must never be
 * imported there — a static import would reach the module's native bindings on
 * load. Callers guard on `faceDetectionSupported` before rendering this.
 */
export function FaceCamera(props: FaceCameraProps) {
  if (!faceDetectionSupported) {
    throw new Error('FaceCamera rendered on a build without face detection');
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Camera } = require('react-native-vision-camera-face-detector');

  return (
    <Camera
      {...props}
      cameraFacing="front"
      performanceMode="accurate"
      runContours
      runLandmarks
      runClassifications
    />
  );
}
