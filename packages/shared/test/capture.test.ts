/**
 * The capture gate decides whether a frame is allowed to become a measurement.
 * A gate that passes a bad frame produces a number nobody can trust, so the
 * refusals below are the tests that matter.
 */
import { describe, expect, it } from 'vitest';

import {
  CAPTURE_LIMITS,
  evaluateCaptureQuality,
  primaryIssue,
  type QualitySignals,
} from '../src/capture';

function goodFrame(overrides: Partial<QualitySignals> = {}): QualitySignals {
  return {
    faceCount: 1,
    yaw: 0,
    pitch: 0,
    roll: 0,
    faceRatio: 0.55,
    offCentre: 0.02,
    eyesOpen: 0.95,
    brightness: null,
    sharpness: null,
    ...overrides,
  };
}

describe('evaluateCaptureQuality', () => {
  it('passes a well-framed face', () => {
    const quality = evaluateCaptureQuality(goodFrame());
    expect(quality.ok).toBe(true);
    expect(quality.issues).toEqual([]);
  });

  it('blocks when there is no face', () => {
    const quality = evaluateCaptureQuality(goodFrame({ faceCount: 0 }));
    expect(quality.ok).toBe(false);
    expect(quality.issues).toContain('no_face');
  });

  it('blocks when more than one face is in frame', () => {
    expect(evaluateCaptureQuality(goodFrame({ faceCount: 2 })).issues).toContain('multiple_faces');
  });

  it('does not report framing problems when there is no face to frame', () => {
    // Reporting "move closer" with nobody in shot is noise, not guidance.
    const quality = evaluateCaptureQuality(goodFrame({ faceCount: 0, faceRatio: 0 }));
    expect(quality.issues).toEqual(['no_face']);
  });

  it.each([
    ['face_too_small', { faceRatio: CAPTURE_LIMITS.minFaceRatio - 0.01 }],
    ['face_too_close', { faceRatio: CAPTURE_LIMITS.maxFaceRatio + 0.01 }],
    ['off_center', { offCentre: CAPTURE_LIMITS.maxOffCentre + 0.01 }],
    ['head_turned', { yaw: CAPTURE_LIMITS.maxYaw + 1 }],
    ['head_tilted', { roll: CAPTURE_LIMITS.maxRoll + 1 }],
    ['head_tilted', { pitch: CAPTURE_LIMITS.maxPitch + 1 }],
    ['eyes_closed', { eyesOpen: CAPTURE_LIMITS.minEyeOpen - 0.01 }],
  ])('reports %s', (issue, overrides) => {
    const quality = evaluateCaptureQuality(goodFrame(overrides as Partial<QualitySignals>));
    expect(quality.ok).toBe(false);
    expect(quality.issues).toContain(issue);
  });

  it('catches a turned head in either direction', () => {
    expect(evaluateCaptureQuality(goodFrame({ yaw: 20 })).issues).toContain('head_turned');
    expect(evaluateCaptureQuality(goodFrame({ yaw: -20 })).issues).toContain('head_turned');
  });

  it('skips checks whose signal is not measured rather than passing them', () => {
    // brightness and sharpness are null here: the face detector does not report
    // them. An unmeasured condition must not become a silent pass, and it must
    // not become a permanent block either.
    const quality = evaluateCaptureQuality(goodFrame({ brightness: null, sharpness: null }));
    expect(quality.ok).toBe(true);
    expect(quality.issues).not.toContain('too_dark');
    expect(quality.issues).not.toContain('blurry');
  });

  it('applies the light and sharpness checks once a signal exists', () => {
    expect(evaluateCaptureQuality(goodFrame({ brightness: 0.1 })).issues).toContain('too_dark');
    expect(evaluateCaptureQuality(goodFrame({ brightness: 0.99 })).issues).toContain('too_bright');
    expect(evaluateCaptureQuality(goodFrame({ sharpness: 0.1 })).issues).toContain('blurry');
  });

  it('carries the raw signals through for the stored quality report', () => {
    const quality = evaluateCaptureQuality(goodFrame({ yaw: 3, faceRatio: 0.5 }));
    expect(quality.yaw).toBe(3);
    expect(quality.faceRatio).toBe(0.5);
  });
});

describe('primaryIssue', () => {
  it('names the thing to fix first, not everything at once', () => {
    const quality = evaluateCaptureQuality(
      goodFrame({ faceCount: 0, yaw: 30, faceRatio: 0.1 }),
    );
    expect(primaryIssue(quality)).toBe('no_face');
  });

  it('is null when the frame is good', () => {
    expect(primaryIssue(evaluateCaptureQuality(goodFrame()))).toBeNull();
  });

  it('prefers framing over fine detail', () => {
    const quality = evaluateCaptureQuality(goodFrame({ faceRatio: 0.2, eyesOpen: 0.1 }));
    expect(primaryIssue(quality)).toBe('face_too_small');
  });
});
