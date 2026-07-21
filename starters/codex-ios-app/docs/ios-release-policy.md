# iOS Release Policy

## Release Responsibility

`RELEASE_SAFETY` is an internal responsibility domain, not a separate person
the user must find. Codex owns release-readiness preparation and verification.

## Release Path

- local build
- CI build
- archive
- TestFlight
- App Store

## Required Checks

- scheme/configuration verified internally
- signing/provisioning verified internally
- Info.plist permission strings verified internally
- privacy manifest verified internally when relevant
- release notes prepared and verified
- rollback/phased release plan prepared and verified
- crash/log monitoring path verified

## High-risk Release Stop Conditions

Local build, signing validation, and archive preparation may continue after the
internal gates pass. Stop only before the exact real App Store Connect account
action, upload, TestFlight distribution, or App Store release, and request
consent to that concrete external effect. Technical readiness is not consent.
