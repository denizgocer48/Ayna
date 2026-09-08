# Handoff — where the project stands

Last updated: 2026-09-08, at commit `d4ea7de`.

`docs/README.md` indexes everything. Read `docs/product.md` and
`docs/market.md` first, then this file. Parked and rejected ideas live in
`docs/backlog.md` — check it before proposing something, it may already have
been decided. The product doc explains *why* the
system is shaped the way it is; several constraints here look arbitrary until
you have read it.

## One-paragraph status

Faz 0 is complete and verified. The monorepo builds, the iOS development build
installs and launches on a simulator, and every check is green. What exists is a
**skeleton with a real contract**: navigation, theming, the consent flow, the
metric catalogue, the reachable-score projection and the database schema are
done and tested. What does not exist yet is anything that touches a real camera,
a real Supabase project, or a real analysis model — that is Faz 1 and Faz 2.

## Verified working

Run from the repo root. All four were green at `d4ea7de`:

```bash
npm run typecheck                                   # every workspace, clean
npm run lint --workspace @ayna/mobile               # clean
cd services/api && ruff check .                     # clean
cd services/api && pytest -q                        # 11 passed
```

The iOS development build was confirmed end to end before the face detector was
added: `AynaDev.app` (`com.ayna.app.dev`) installed on an iPhone 17 simulator and
the Welcome screen rendered. With the detector linked, a simulator build is
impossible — see the ML Kit note below. Android has **not** been built at all;
treat the first Android build as unproven work.

## Environment setup

The traps below all cost time once already. They are in this order for a reason.

1. **Node 22.** Pinned in `.nvmrc`. Node 25 (odd-numbered, non-LTS) is not
   supported by Expo SDK 57. `nvm use` from the repo root.

2. **No parentheses or spaces in the checkout path.** The project originally
   lived under `~/Desktop/Ayna(Deniz)/` and was moved to `~/Desktop/ayna` before
   any native build. CocoaPods and Xcode build-phase scripts break on
   parenthesised absolute paths.

3. **CocoaPods via Homebrew, not system Ruby.** macOS ships Ruby 2.6; modern
   CocoaPods needs 3.1+. `brew install cocoapods` brings its own Ruby.

4. **npm workspaces — install from the repo root**, never from `apps/mobile`.
   `metro.config.js` sets `disableHierarchicalLookup`, so a package installed in
   the wrong place resolves twice and you get two copies of React.

5. **Environment files.**

   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   cp services/api/.env.example services/api/.env
   ```

   Both are gitignored. `EXPO_PUBLIC_*` values are bundled into the app binary —
   never put a secret there. The app currently boots fine with them blank,
   because nothing reads Supabase yet.

6. **MCP credentials come from the shell, not from `.mcp.json`.** This repo is
   public and `.mcp.json` is committed, so it holds `${SUPABASE_ACCESS_TOKEN}`
   and `${SUPABASE_PROJECT_REF}` rather than values. Export them in your profile.
   A Supabase personal access token grants access to every project on the
   account — if one is ever committed, revoke it rather than rewriting history.

7. **Expo Go does not work.** VisionCamera, the ML Kit face detector, Skia, MMKV
   and RevenueCat are native modules. You need a development build.

8. **ML Kit does not support the arm64 iOS Simulator, and this will cost you an
   afternoon if you do not know it.** Google's pods set
   `EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64`, so on an Apple Silicon Mac a
   project linking them has no valid simulator architecture at all. The symptom
   is misleading: `xcodebuild` fails with

   ```
   error: Unable to find a destination matching the provided destination specifier
   ```

   which reads like a broken simulator or a stale Xcode, and is neither.
   Restarting CoreSimulator, booting a different device and passing a UDID all
   do nothing. Still true of GoogleMLKit 9.0.0 in September 2026.

   There are therefore two build profiles, and switching between them changes
   which pods are linked, so each switch needs a clean prebuild:

   ```bash
   cd apps/mobile
   npm run ios:device    # links the detector — capture works, simulator will not build
   npm run ios:sim       # excludes the detector — app runs on a simulator, capture is stubbed
   npx expo run:android  # unproven, see above
   ```

   `scripts/face-detector.mjs` writes the flag into `package.json`, because
   Expo autolinking reads the exclusion only from there and offers no
   environment variable.

   The simulator has no camera in any case, so **the capture path can only be
   exercised on a physical phone**. On a simulator build the capture screen says
   so and offers to continue through the rest of the flow, so the interface can
   still be reviewed.

## What is real and what is a placeholder

Anything rendering a card with the text `PLACEHOLDER` is intentionally hollow.
Search the codebase for `TODO(faz-N)` — 20 markers, each naming the phase that
fills it in.

### Real, working, tested

| Area | Where | Notes |
| --- | --- | --- |
| Metric catalogue | `packages/shared/src/metrics.ts` | 30 metrics with provenance, mutability and pose. The single source of truth. |
| Progress engine | `services/api/app/analysis/progress.py` | Implemented and unit-tested. Refuses to call bone geometry or sub-noise movement progress. |
| Contract enforcement | `services/api/tests/test_contract.py` | Compares the TS and Python catalogues key by key, metadata by metadata, group by group. |
| Capture quality gate | `apps/mobile/src/features/scan/quality.ts` | Pure function over landmark signals. Camera adapter not yet written. |
| Database schema | `supabase/migrations/` | Three migrations, applied and verified against a local stack. |
| RLS behaviour | `supabase/tests/rls.sql` | Nine assertions covering consent, quota, withdrawal, cross-user isolation and the append-only consent log. Caught a real ordering bug. |
| Facial measurements | `packages/shared/src/measure.ts` | All 23 geometric metrics, on-device, with scale, translation and rotation invariance asserted by test. |
| Detector resolution | `packages/shared/src/resolve-points.ts` | ML Kit contours to named anatomical points. Assigns sides geometrically, refuses to invent a missing landmark. |
| Theming | `apps/mobile/src/theme/` | Dark-first tokens. Never hardcode a colour; the lint does not catch it but review will. |
| Navigation + consent flow | `apps/mobile/src/app/` | Age gate blocks under-18s, consent checkbox gates the Continue button. |

### Placeholder

- **Camera.** `scan/capture.tsx` fakes the capture with a button. VisionCamera is
  installed and its permission strings are in `app.config.ts`, but no preview,
  no overlay, no frame processor.
- **Measurements.** `scan/result/[scanId].tsx` hardcodes three example values to
  exercise the layout. No scan is ever fetched.
- **Auth.** No sign-in anywhere. `src/lib/supabase.ts` is written and correct but
  nothing calls it.
- **API.** Every route returns `501`. `GET /health` is the only live endpoint.
- **Analysis.** `landmarks.py`, `metrics.py`, `skin.py` and `to_percentile()`
  raise `NotImplementedError`.
- **Paywall.** Layout only. No RevenueCat offerings, no products configured.

## Deferred decisions and known gaps

- **Sentry.** The `@sentry/react-native/expo` config plugin was removed at
  `d4ea7de`. It runs `sentry-cli` during the native build to upload source maps
  and hard-fails with `An organization ID or slug is required`, taking
  `xcodebuild` down with exit 65. The SDK is still a dependency and initialises
  at runtime. Re-add the plugin in Faz 5 once a Sentry org and project exist —
  see the `TODO(faz-5)` in `app.config.ts`.
- **No Supabase project exists.** The migrations have never been applied. The
  first person to create the project should run them in order and then fill in
  `SUPABASE_PROJECT_REF`.
- **`metric_norms` is empty, and it is worse than that.** Research found that
  about a third of the metrics have no usable published reference distribution,
  and that no study validates MediaPipe's output against anthropometric ground
  truth. Read `docs/norms.md` before building anything that prints a percentile.
  The measurements are reproducible and tested; the comparison to a population
  is what is unsupported.
- **Android is unproven.** First build may surface native issues the iOS build
  did not.
- **No E2E tests.** Maestro is named in the architecture doc but not set up.

## Open product questions

Skin analysis, pricing, the name and market scope are all now decided — see
`docs/skin-analysis.md`, `docs/pricing.md` and `docs/product.md` sections 6 and 7.
What remains open:

1. **Where the routine content comes from.** The routine is now Faz 2 work and
   every item must be evidence-backed — mewing is blocked by name for exactly
   this reason. Somebody needs to assemble the item library and its citations.
   V1 plans a hosted API rather than an in-house model (`skin.py` is written
   provider-agnostic on purpose). Nobody has picked one or priced it. Cost
   scales per scan, so it interacts with pricing.
2. **Price point.** RevenueCat products are Faz 4 work, but the price shapes the
   paywall design, so it is worth settling earlier than the implementation.

Name and market scope were open questions and are now settled — `Ayna` stays,
and Turkish plus English ship together. See `docs/product.md` sections 6 and 7.

## Next task: Faz 1

Ordered so each step is testable before the next one starts.

1. **Create the Supabase project**, apply both migrations, fill in
   `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_JWT_SECRET`.
2. **Auth.** Apple and Google sign-in. Apple Sign In is mandatory for App Store
   approval when any other social login is offered.
3. **Wire the camera to the measurement pipeline.** `react-native-vision-camera-face-detector`
   is installed and compatible with the versions in use. The frame processor
   feeds `evaluateCaptureQuality`; on capture, `resolveFrontPoints` then
   `measureAll` produce the numbers to upload. Nothing here needs a server.
4. **Finish the translations.** `src/i18n/` covers welcome, the age gate and the
   consent screen — the legally operative copy. Every other screen still has
   hardcoded English strings. Move them into the catalogues as you touch each
   screen; the `CopyKey` type makes a missing key a compile error.
5. **Onboarding data.** Birth year and sex pickers in
   `(onboarding)/profile.tsx`, goals multi-select in `goals.tsx`. These are not
   cosmetic — they select the normalisation band. Write the row to `profiles`.
6. **Consent event.** `(onboarding)/consent.tsx` currently only writes to local
   MMKV. It must also insert into `consent_events`, or `has_active_biometric_consent()`
   returns false and every scan insert is rejected by RLS. Record the locale
   with it — there is a `TODO(faz-1)` on the exact line.
7. **Camera overlay.** VisionCamera preview, face-oval overlay, frame processor feeding
   `evaluateCaptureQuality`. Keep the shutter disabled until it returns `ok`.
   Front pose first; wire the optional side pose after front works end to end.
8. **Upload.** `POST /scans` with the captures and the measurements. No image is
   sent. The RLS policy rejects the insert unless consent and quota both pass —
   `supabase/tests/rls.sql` already asserts that; make sure the client surfaces
   the failure rather than swallowing it.
9. **Profile screen.** Consent withdrawal and full data deletion. These are
   legal requirements, not backlog items: they ship in the first release.
   `DELETE /scans/{id}` has a `TODO(faz-1)` waiting.

## House rules you will trip over otherwise

- **Adding a metric touches three places or it does not ship**:
  `packages/shared/src/metrics.ts` (key + `METRIC_META` + a group),
  `services/api/app/schemas.py` (`_METRIC_ROWS` + the group), and a
  `metric_norms` row. `test_contract.py` fails CI on any drift.
- **Never ask an LLM to rate a face.** The score must be reproducible across two
  photos in the same session. The LLM writes recommendation copy from the metric
  table, and never sees the image.
- **Do not widen the gain caps in `REACHABLE_GAIN`** to make the paywall more
  attractive. An inflated projection is only discovered after the user has
  already put in eight weeks, and that is when they leave.
- **Consent is enforced twice**, in the API and in RLS. Removing either layer is
  a regression, not a simplification.
