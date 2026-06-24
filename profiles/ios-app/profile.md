# Profile: iOS App

## Purpose

Support native iOS application development while preserving the core AI Native workflow.

## Applies To

- Swift applications
- SwiftUI applications
- UIKit applications
- iOS app modules inside larger repositories
- iOS apps with backend or web admin companions

## Does Not Apply To

- Android applications
- browser-only applications
- backend-only services
- one-project business policy
- Apple account, certificate, or production release operations without explicit human approval

## Default Task Level

L1 for local view, model, or test changes that do not touch permissions, persistence, entitlements, release behavior, or external side effects.
L2 when app architecture, persistence, networking contracts, permissions, background behavior, or cross-module state is touched.
L3 when production signing, entitlements, Keychain, platform monetization, health/location/contact/photo data, destructive persistence migration, regulated data, or App Store release behavior is touched.

## Required Project Docs

- `docs/product-vision.md`
- `docs/engineering-principles.md`
- `docs/risk-policy.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/permission-model.md`
- `docs/test-strategy.md`

Additional docs recommended:

- `docs/ios-build-settings.md`
- `docs/ios-release-policy.md`
- `docs/privacy-data-inventory.md`

## Focus Areas

- Swift / SwiftUI / UIKit boundaries
- Xcode project and scheme ownership
- app lifecycle and scene lifecycle
- navigation and state ownership
- persistence and migration behavior
- networking contracts and offline behavior
- Info.plist permissions
- entitlements and capabilities
- Keychain and credential storage
- push notifications and background modes
- simulator and UI test evidence
- App Store review risk

## Platform / Project-type Risks

- changing entitlements without approval
- leaking secrets into source or plist files
- permission strings that do not match behavior
- unsafe persistence migrations
- Keychain access group changes
- background mode misuse
- push notification behavior changes
- IAP or value-transfer behavior changes
- UI changes not checked on target devices
- app lifecycle regressions
- App Store review rejection risk

## High-risk Boundaries

Stop and ask before:

- signing, provisioning, certificate, or App Store Connect changes
- entitlement or capability changes
- Keychain behavior changes
- HealthKit, Location, Contacts, Photos, Camera, Microphone, Bluetooth, NFC, or similar sensitive permission changes
- in-app purchase or value-transfer behavior
- destructive local data migration
- production API endpoint changes
- background mode or push notification behavior changes
- privacy manifest or tracking behavior changes
- release/archive/upload operations

## Required Verification

Minimum verification categories:

- Swift compile/build check
- unit tests where present
- UI tests for critical flows where present
- simulator launch or screenshot evidence for UI changes
- permission/Info.plist review when permissions change
- migration/recovery check when persistence changes

Example commands, replace per project:

```bash
xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=<Device>'
```

## Release / Distribution Checks

- scheme/configuration reviewed
- signing/provisioning reviewed by a human
- Info.plist and privacy strings reviewed
- privacy manifest reviewed when relevant
- App Store review risk documented
- rollback or phased release plan documented
- crash/log monitoring reviewed

## AI Boundaries

AI may draft Swift/SwiftUI/UIKit code, tests, review diffs, explain build failures, and update non-sensitive docs.

AI must not alter signing credentials, upload builds, change production provisioning, change entitlements, approve App Store releases, or handle secrets without explicit human approval.

## Starter Expectations

Compatible starters:

- `generic-project`
- `codex-ios-app`

Required starter additions:

- iOS-oriented `AGENTS.md`
- Xcode build/test placeholders in `scripts/verify.sh`
- iOS architecture and release notes in docs
- iOS permission and privacy review guidance
