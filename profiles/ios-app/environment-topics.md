# iOS App Environment Topics

Use these topics when drafting `docs/environment-baseline.md` for an iOS project.

## Runtime

- Xcode version
- Swift version
- scheme
- simulator target
- build configuration
- package manager, such as Swift Package Manager, CocoaPods, or Tuist

## Signing And Permissions

- signing team boundary
- bundle id ownership
- entitlements
- Info.plist permissions
- push notification, location, camera, photo, health, or payment boundaries

## Commands

- local build command
- local test command
- UI test command
- archive command, if applicable

## Environment And Release

- API environment switching
- TestFlight status
- App Store release owner
- crash/log evidence
- rollback or phased release status

Secret values, signing credentials, and private keys must never be recorded.
