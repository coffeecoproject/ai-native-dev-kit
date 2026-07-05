# 1.18.1 Guided Baseline Selection Check Hardening Plan

## Purpose

1.18.1 closes the main review gaps from 1.18.0 without expanding baseline
packs.

The purpose is to make the existing Guided Baseline Selection output more
checkable:

- `Platform States` must be a required section in Baseline Decision Cards.
- Platform state values must use the approved vocabulary.
- Required platform profile rows must be present.
- Existing example cards must show the same structure the checker expects.
- `npm run verify` must be easier to read and maintain.
- Calibration evidence must start using a precision scoreboard instead of
scattered narrative-only notes.

## Scope

1.18.1 updates:

- `scripts/check-guided-baseline-selection.mjs`
- guided baseline example cards
- guided baseline bad fixtures
- `scripts/check-intentos.mjs`
- `package.json` verify scripts
- `baseline-calibration-reports/scoreboard.md`
- version and release evidence files

## Required Behavior

### Platform States Required Section

Every Baseline Decision Card checked by `check-guided-baseline-selection.mjs`
must include:

```text
## Platform States
```

The checker must fail when the section is missing or empty.

This is the Platform States required section rule.

### Required Platform Rows

The Platform States table must include these profile ids:

```text
web-app
wechat-miniprogram
ios-app
android-app
backend-api
internal-admin
```

This keeps multi-platform and monorepo output comparable across projects.

### Allowed State Values

Each row must use one of:

```text
selected-confirmed
selected-inferred
present-needs-confirmation
present-inactive-or-deferred
not-detected
```

Free-form values such as `selected`, `active`, `maybe`, or `unknown` must fail.

### Detected / Selected Profile Consistency

If a profile appears in `Detected platform` or is implied by selected standard
packs, its Platform States row must be either:

```text
selected-confirmed
selected-inferred
```

This prevents a card from recommending a platform pack while marking the same
platform as inactive or not detected.

### Verify Script Grouping

`npm run verify` remains the full release check, but delegates to:

```text
verify:syntax
verify:baseline
verify:industrial
verify:examples
verify:release
```

This is a maintainability change only. It must not remove coverage.

### Precision Scoreboard

`baseline-calibration-reports/scoreboard.md` records calibration cases with:

- expected state
- actual state
- expected platform states
- actual platform states
- expected safe action
- actual safe action
- expected BL2 candidate
- actual BL2 candidate
- false positive / false negative
- fix status

The scoreboard is evidence for calibration, not production validation.

## Non-Goals

- Do not add new standard packs.
- Do not add new industrial packs.
- Do not promote draft packs.
- Do not make BL2 default.
- Do not enable industrial packs automatically.
- Do not approve target-project writes.
- Do not approve implementation, release, production, security, privacy,
  compliance, payment, finance, tax, HR, migration, or irreversible data
  decisions.
- Do not claim real-project production validation.

## Verification

Required checks:

```bash
npm run verify:syntax
npm run verify:baseline
npm run verify:industrial
npm run verify:examples
npm run verify:release
npm run verify
node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict
node scripts/check-guided-baseline-selection.mjs test-fixtures/bad/bad-guided-baseline-missing-platform-states
node scripts/check-guided-baseline-selection.mjs test-fixtures/bad/bad-guided-baseline-invalid-platform-state
```

The two bad-fixture checks must fail with Platform States errors.

## Release Boundary

1.18.1 is a patch release. It hardens checks and evidence for existing 1.18
behavior. It does not change target-project write authority or baseline-pack
selection authority.
