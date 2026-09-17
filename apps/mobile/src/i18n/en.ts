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

  settings: {
    title: 'Profile',
    languageLabel: 'LANGUAGE',
    languageSystem: 'Match my device',
    languageBody: 'Consent text is legally operative, so it is recorded in the language you read it in.',
    dangerLabel: 'DEVELOPMENT',
    resetLocal: 'Reset local state',
    accountPlaceholder:
      'Account, subscription, consent withdrawal and data deletion land in Faz 1.',
  },

  plan: {
    title: 'Your plan',
    placeholder: 'The routine and its daily check-off land in Faz 2.',
  },

  progress: {
    title: 'Progress',
    body: 'Every scan is compared to your first one. No score, no ranking against other people.',
    placeholder: 'Timeline and before/after comparison land in Faz 2.',
  },

  paywall: {
    title: 'Ayna Plus',
    body: 'The routine built from your measurements, and the tracking that shows whether it worked.',
    freeLabel: 'Free',
    freeBody: 'One scan. Your baseline measurements, kept.',
    plusLabel: 'Plus',
    plusBody:
      'A routine built from your own measurements, unlimited scans, and the progress timeline that shows what actually changed.',
    placeholder:
      'RevenueCat offerings are not wired yet. Products, pricing and trial length are decided in Faz 4.',
  },

  onboarding: {
    profileTitle: 'About you',
    profileBody: 'Your age and sex decide which reference range your measurements are compared to.',
    profilePlaceholder: 'Birth year and sex pickers land in Faz 1.',
    goalsTitle: 'What do you want to work on?',
    goalsBody: 'Pick up to four. This shapes your routine, not your measurements.',
    goalsPlaceholder: 'Goal chips land in Faz 1.',
  },

  notFound: {
    title: 'Screen not found',
    home: 'Go home',
  },

  tasks: {
    sleep_consistent: {
      title: 'Sleep at a consistent time',
      why: 'Irregular sleep shows first around the eyes.',
    },
    evening_sodium: {
      title: 'Go light on salt in the evening',
      why: 'Evening sodium is the usual cause of morning puffiness.',
    },
    sunscreen: {
      title: 'Sunscreen every morning',
      why: 'The single best-supported thing you can do for your skin over years.',
    },
    cleanse_twice: {
      title: 'Cleanse morning and night',
      why: 'Keeps oil and the day off your skin before it settles in.',
    },
    moisturise: {
      title: 'Moisturise after cleansing',
      why: 'A cleansed face loses water fast; this is what keeps texture even.',
    },
    hydration: {
      title: 'Drink water through the day',
      why: 'Steady intake beats catching up in the evening.',
    },
    cardio: {
      title: 'Three cardio sessions this week',
      why: 'Body composition is what actually moves a jawline. Months, not weeks.',
    },
    posture_check: {
      title: 'Check your neck posture',
      why: 'A forward head changes how the area under the chin reads.',
    },
    facial_hair_trim: {
      title: 'Tidy your facial hair',
      why: 'A defined edge does more for the jaw than most things you can buy.',
    },
    scalp_care: {
      title: 'Look after your scalp',
      why: 'Hair care starts below the hair.',
    },
  },

  routine: {
    todayLabel: 'TODAY',
    weeklyLabel: 'THIS WEEK',
    effortLabel: 'EFFORT',
    points: 'points',
    completedOf: '{{done}} of {{total}} done',
    streak: '{{days}} day streak',
    empty: 'Take your first scan, or pick a goal, and your routine appears here.',
    whyLabel: 'Why',
  },

  scanTiming: {
    first: 'Take your first scan to set a baseline.',
    tooEarly: 'Scanned {{days}} days ago. Too soon to measure a change.',
    early: 'Scanned {{days}} days ago. You can scan now, but a change may not be measurable yet.',
    due: 'Ready for your next scan.',
    nextIn: 'Next scan in {{days}} days',
  },

  tabs: {
    home: 'Home',
    plan: 'Plan',
    progress: 'Progress',
    profile: 'Profile',
  },

  home: {
    title: 'Today',
    scanLabel: 'MEASUREMENT',
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
    consistencyLabel: 'FOR COMPARABLE SCANS',
    consistency1: 'Face a window or an even light. No overhead spotlight.',
    consistency2: 'Hold the phone at eye level, arm fully extended.',
    consistency3: 'Pull hair off the forehead, remove glasses.',
    consistency4: 'Use the same light and time of day every time.',
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
    photoAlt: 'The photo this scan measured',
    noPhoto: 'No photo kept for this scan.',
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
