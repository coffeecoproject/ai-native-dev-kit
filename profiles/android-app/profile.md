# Profile: Android App

## Purpose

Support native Android application development while preserving the core AI Native workflow.

## Applies To

- Kotlin Android applications
- Java Android applications
- Jetpack Compose applications
- XML/View based Android applications
- Android app modules inside larger repositories
- Android apps with backend or web admin companions

## Does Not Apply To

- native iOS applications
- browser-only applications
- backend-only services
- one-project business policy
- Google Play account, signing, or production release operations without explicit human approval

## Default Task Level

L1 for local UI, ViewModel, model, or test changes that do not touch permissions, persistence, signing, release behavior, or external side effects.
L2 when app architecture, persistence, networking contracts, runtime permissions, background work, or cross-module state is touched.
L3 when production signing, Play Console release behavior, platform monetization/value-transfer, destructive migration, regulated data, sensitive permissions, or production config is touched.

## Required Project Docs

- `docs/product-vision.md`
- `docs/engineering-principles.md`
- `docs/risk-policy.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/permission-model.md`
- `docs/test-strategy.md`

Additional docs recommended:

- `docs/android-build-settings.md`
- `docs/android-release-policy.md`
- `docs/privacy-data-inventory.md`

## Focus Areas

- Kotlin / Java module boundaries
- Gradle project ownership
- Compose or XML UI state
- Activity and lifecycle behavior
- ViewModel and state ownership
- Room/DataStore/shared preferences migrations
- networking contracts and offline behavior
- Android runtime permissions
- manifest permissions and exported components
- background work and foreground services
- notification behavior
- signing and keystore boundaries
- emulator/device verification
- Play Store release risk

## Platform / Project-type Risks

- changing signing config or keystore references
- leaking secrets into Gradle, manifest, or resources
- manifest exported component mistakes
- unsafe runtime permission behavior
- unsafe Room/DataStore migrations
- background service misuse
- notification permission regressions
- platform monetization or value-transfer behavior changes
- targetSdk/minSdk compatibility changes
- UI changes not checked on target device classes
- Play policy or Data Safety mismatch

## High-risk Boundaries

Stop and ask before:

- signing, keystore, Play Console, or production release changes
- manifest exported component or permission changes
- platform monetization or value-transfer behavior
- destructive local data migration
- production API endpoint changes
- background service or notification behavior changes
- Data Safety, privacy, or tracking behavior changes
- release bundle/APK upload operations

## Required Verification

Minimum verification categories:

- Gradle build check
- unit tests where present
- Android lint where present
- connected/emulator tests for critical flows where present
- manifest permission review when permissions change
- migration/recovery check when persistence changes

Example commands, replace per project:

```bash
./gradlew test
./gradlew lint
./gradlew assembleDebug
```

## Release / Distribution Checks

- build variant/flavor reviewed
- signing config reviewed by a human
- manifest permissions and exported components reviewed
- Data Safety / privacy impact reviewed
- Play policy risk documented
- rollback or staged rollout plan documented
- crash/log monitoring reviewed

## AI Boundaries

AI may draft Kotlin/Java/Compose/XML code, tests, review diffs, explain Gradle failures, and update non-sensitive docs.

AI must not alter signing credentials, upload builds, change production keystore references, approve Play Console releases, or handle secrets without explicit human approval.

## Starter Expectations

Compatible starters:

- `generic-project`
- `codex-android-app`

Required starter additions:

- Android-oriented `AGENTS.md`
- Gradle build/test placeholders in `scripts/verify.sh`
- Android architecture and release notes in docs
- Android permission and privacy review guidance
