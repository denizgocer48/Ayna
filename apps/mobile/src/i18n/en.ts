/**
 * English copy.
 *
 * Rules that apply to every string in this file and its translations:
 *   - No subculture vocabulary. See docs/compliance.md.
 *   - No medical claims. "Supports" and "helps" are fine, "treats" and "cures"
 *     are not.
 *   - Consent copy is legally operative text. Do not reword it without reading
 *     docs/compliance.md, and keep the two languages semantically identical.
 */
export const en = {
  common: {
    continue: 'Continue',
    back: 'Go back',
    cancel: 'Cancel',
    notNow: 'Not now',
    done: 'Done',
    close: 'Close',
    placeholder: 'PLACEHOLDER',
    optional: 'OPTIONAL',
  },

  welcome: {
    title: 'Ayna',
    tagline: 'Track your grooming and skincare progress with measurements, not guesswork.',
    body: 'Ayna measures facial proportions from a photo you take, turns them into a progress baseline, and builds a routine around what you can actually change.',
    cta: 'Get started',
  },

  ageGate: {
    question: 'Are you 18 or older?',
    why: 'Facial measurements are biometric data. Ayna is available to adults only.',
    yes: 'Yes, I am 18 or older',
    no: 'No',
    blockedTitle: 'Ayna is 18+',
    blockedBody:
      'Ayna analyses facial measurements, which counts as biometric data. We only offer that to adults. Thanks for your honesty.',
  },

  tabs: {
    home: 'Home',
    plan: 'Plan',
    progress: 'Progress',
    profile: 'Profile',
  },

  home: {
    title: 'Today',
    noScanLabel: 'NO SCAN YET',
    noScanBody:
      'Take your first scan to set a baseline. Everything after this is measured against it.',
    startScan: 'Start a scan',
  },

  capture: {
    frontTitle: 'Front',
    frontHint: 'Look straight into the lens. Neutral expression, mouth closed.',
    sideTitle: 'Side',
    sideHint: 'Turn a full 90 degrees. Chin level, shoulders square.',
    sideOptional: 'Optional, but it measures your jaw angle directly instead of estimating it.',
    ready: 'Hold still',
    shutter: 'Capture',
    skipSide: 'Skip the side photo',
    analysing: 'Measuring',
    permissionTitle: 'Camera access',
    permissionBody:
      'Ayna needs the camera to measure your face. The photo is processed on this device and never uploaded.',
    permissionGrant: 'Allow camera',
    permissionBlockedBody:
      'Camera access is turned off. Enable it in Settings to take a scan.',
    unavailable: 'No camera available on this device.',
    simulatorTitle: 'Capture needs a real device',
    simulatorBody:
      'The simulator has no camera, and the face detector is not built into simulator builds. Run on a physical phone to take a scan. You can still walk through the rest of the app from here.',
    simulatorContinue: 'Continue with sample data',
    hints: {
      noFace: 'Center your face in the oval',
      multipleFaces: 'Only you in the frame, please',
      faceTooSmall: 'Move closer',
      faceTooClose: 'Move back a little',
      offCentre: 'Center your face in the oval',
      headTurned: 'Face the camera straight on',
      headTilted: 'Level your head',
      eyesClosed: 'Open your eyes',
      tooDark: 'Find brighter, more even light',
      tooBright: 'Too much glare — move away from direct light',
      blurry: 'Hold still',
    },
  },

  groups: {
    eyes: 'Eyes',
    proportions: 'Proportions',
    jawline: 'Jawline',
    midface: 'Midface',
    skin: 'Skin',
    harmony: 'Harmony',
  },

  metrics: {
    canthal_tilt: 'Eye tilt',
    interpupillary_ratio: 'Pupil spacing',
    eye_aspect_ratio: 'Eye openness',
    eye_spacing_ratio: 'Eye spacing',
    facial_thirds_balance: 'Facial thirds',
    facial_fifths_balance: 'Facial fifths',
    fwhr: 'Width to height',
    face_length_width_ratio: 'Length to width',
    gonial_angle: 'Jaw angle, from the front',
    jawline_definition: 'Jawline definition',
    chin_projection_ratio: 'Lower third',
    mandible_width_ratio: 'Jaw width',
    nasofrontal_angle: 'Brow to nose angle',
    nose_width_ratio: 'Nose width',
    philtrum_length_ratio: 'Philtrum length',
    lip_fullness_ratio: 'Lip fullness',
    symmetry_index: 'Symmetry',
    gonial_angle_true: 'Jaw angle',
    ramus_body_ratio: 'Jaw proportions',
    chin_projection_true: 'Chin projection',
    nasofrontal_angle_true: 'Brow to nose angle',
    nasal_dorsum_index: 'Nose bridge straightness',
    submental_cervical_angle: 'Under-chin angle',
    acne_density: 'Blemishes',
    redness_index: 'Redness',
    dark_circle_index: 'Under-eye shadows',
    pore_visibility: 'Pore visibility',
    texture_uniformity: 'Texture evenness',
    oiliness_index: 'Oiliness',
    hyperpigmentation_index: 'Uneven tone',
  },

  result: {
    baselineTitle: 'Baseline recorded',
    baselineBody:
      'These are your starting measurements. Every future scan is compared against them, not against anyone else.',
    sampleNotice:
      'Sample data. These are real measurements of a synthetic face, computed by the same code that will measure yours.',
    notComparable:
      'Measured, but not tracked as progress — bone structure does not change, and we will not pretend otherwise.',
    buildRoutine: 'Build my routine',
  },

  consent: {
    title: 'Your photo, your data',
    whatWeDoLabel: 'What we do',
    whatWeDoBody:
      'We measure geometric distances and angles from your photo to build a progress baseline and a routine.',
    whatWeKeepLabel: 'What we keep',
    whatWeKeepBody:
      'We keep the measurements. The photo itself is deleted from our servers right after analysis unless you explicitly save it to your progress timeline.',
    yourControlLabel: 'Your control',
    yourControlBody:
      'You can withdraw this consent and delete every scan at any time from Profile. Withdrawal removes the measurements too.',
    checkbox:
      'I explicitly consent to Ayna processing facial measurements derived from my photo, as described above.',
  },
} as const;

/**
 * Widen the literal types produced by `as const` so a translation can hold any
 * string, while the *shape* stays locked to the English catalogue — a missing or
 * misspelled key in a translation is still a compile error.
 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Copy = Widen<typeof en>;
