#!/usr/bin/env node
/**
 * Include or exclude the ML Kit face detector from the native build.
 *
 * Google's ML Kit pods set EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64, so on
 * an Apple Silicon Mac a project that links them has no valid simulator
 * architecture at all — xcodebuild reports no simulator destinations and the
 * build fails before it starts. ML Kit has no arm64-simulator slice, and this
 * is still true of GoogleMLKit 9.0.0.
 *
 * The iOS Simulator has no camera either, so face detection could never run
 * there regardless. Excluding the module lets the rest of the app build and run
 * on a simulator for interface work; the capture screen shows an honest
 * "needs a physical device" state.
 *
 * Autolinking reads this from package.json only — there is no environment
 * variable for it — so the flag has to be written to disk. Switching changes
 * which pods are linked, so it requires a clean prebuild.
 *
 *   node scripts/face-detector.mjs off   # simulator builds
 *   node scripts/face-detector.mjs on    # device builds
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE = 'react-native-vision-camera-face-detector';
const packagePath = resolve(dirname(fileURLToPath(import.meta.url)), '../package.json');

const mode = process.argv[2];
if (mode !== 'on' && mode !== 'off') {
  console.error('usage: face-detector.mjs <on|off>');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
pkg.expo ??= {};
pkg.expo.autolinking ??= {};

const current = new Set(pkg.expo.autolinking.exclude ?? []);
mode === 'off' ? current.add(MODULE) : current.delete(MODULE);

if (current.size > 0) {
  pkg.expo.autolinking.exclude = [...current].sort();
} else {
  delete pkg.expo.autolinking.exclude;
  if (Object.keys(pkg.expo.autolinking).length === 0) delete pkg.expo.autolinking;
  if (Object.keys(pkg.expo).length === 0) delete pkg.expo;
}

writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(
  mode === 'off'
    ? 'Face detector excluded. Simulator builds will work; capture needs a device.'
    : 'Face detector included. Build to a physical device.',
);
