# Architecture

## Shape

```
apps/mobile          Expo (SDK 57) + expo-router + TypeScript
packages/shared      zod contract, geometry, measurements, point resolution
services/api         FastAPI: storage, progress, recommendations
supabase/            Postgres schema, RLS policies
```

## The photograph never leaves the device

This is the decision everything else follows from.

Measurement runs on the phone. The camera captures a frame, ML Kit returns face
contours, `resolveFrontPoints` turns those into named anatomical points, and
`measureAll` computes 23 numbers. **Only those 23 numbers are uploaded.** The
image and the landmark set both stay on the device.

That distinction matters legally, not just aesthetically. A face image is
special-category biometric data under GDPR Art. 9 and KVKK m.6, and a landmark
set is effectively a facial template — uploading either would carry the full
weight of those regimes plus, since September 2024, Turkey's requirement for
signed safeguards on any repeated cross-border transfer. Twenty-three ratios
identify nobody.

What this removed, rather than what it added: the storage bucket, the signed-URL
flow, the delete-after-analysis logic, the Celery queue, the Redis instance, the
`202`-and-poll client flow, and the entire cross-border transfer problem. The
server no longer runs OpenCV, MediaPipe or numpy.

## Request path for a scan

1. The device runs the capture-quality gate on every frame
   (`features/scan/quality.ts`). A frame that fails never becomes a scan.
2. On capture, contours resolve to named points and the measurements are
   computed. This takes milliseconds and works offline.
3. The app sends `POST /scans` with the pose, the quality report and the
   measurements.
4. The API verifies the Supabase JWT, re-checks consent and quota, stores the
   scan, and returns `201` with progress against the baseline.

There is no queue and nothing to poll. The analysis was finished before the
request was made.

## Why the detector is behind a resolution layer

`measureAll` works from named anatomical points — `leftGonion`, `subnasale`,
`labialeSuperius` — not from detector indices. `resolve-points.ts` is the only
file that knows what produced them.

That separation has already paid for itself: the detector changed from MediaPipe
to ML Kit contours without a line of the measurement code moving. It also makes
the arithmetic testable against synthetic faces with analytically known answers,
which is how the invariance guarantees below are verified.

The resolver assigns left and right **geometrically, by x against the pupil
midline**, rather than trusting the detector's own `LEFT_`/`RIGHT_` naming.
Detectors disagree about whether "left" means the subject's or the viewer's, and
a silent disagreement would mirror every asymmetric measurement. A test asserts
that flipping the detector's labels changes nothing.

## What the measurements guarantee

Verified by test, not by intention:

- **Scale invariance.** A face photographed twice as close gives identical
  numbers.
- **Translation invariance.** Position in the frame does not matter.
- **Rotation invariance.** All 23 metrics are unchanged by in-plane rotation.
  This was not designed in; it falls out of using only distance ratios, angles
  between rays, and a tilt averaged across an eye and its mirror.

The capture gate still caps head roll. Rotation invariance covers rotating a flat
picture; a real head turning relative to the camera changes perspective, occludes
features, and degrades the detector — none of which the arithmetic can fix.

## What the server is for

Storage of measurements, progress computation, recommendations, entitlements.

Progress compares a scan to `baseline_scan_id(user)`, the user's earliest
completed scan. Two refusals are enforced in `analysis/progress.py` rather than
left to the interface: a `fixed` metric can never show progress, because
movement in bone geometry is measurement noise; and movement inside the noise
floor is `held`, not a win.

Recommendations receive the measurement table and what moved — never an image,
which the server does not have in any case.

## Native modules

VisionCamera, the ML Kit face detector, Skia, MMKV and RevenueCat are native
modules, so **Expo Go cannot run this app**. Development needs a build:

```bash
npx expo run:ios --device "iPhone 17"
```

## On drawing a mesh over the face

Competitors animate a landmark mesh during "analysis". Most of it is theatre —
there is no technical need to render 468 points, and doing so implies a precision
the measurement does not have.

We draw an overlay because the capture gate disables the shutter and the user is
owed a reason: the face oval, and the live quality issue blocking capture. What
we do not draw is a fake progress animation or a dense mesh that performs
sophistication. Guideline 1.1.6 covers features that pretend, and a UI that
implies precision it lacks is on the wrong side of it.
