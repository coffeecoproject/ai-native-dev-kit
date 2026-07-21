# Android Release Policy

## Release Responsibility

`RELEASE_SAFETY` is an internal responsibility domain, not a separate person
the user must find. Codex owns release-readiness preparation and verification.

## Release Path

- local build
- CI build
- internal testing
- closed/open testing
- production

## Required Checks

- build variant/flavor verified internally
- signing/keystore integration verified internally
- manifest permissions and exported components verified internally
- Data Safety impact verified internally when project evidence is sufficient
- release notes prepared and verified
- staged rollout/rollback plan prepared and verified
- crash/log monitoring path verified

## High-risk Release Stop Conditions

Local build, signing validation, and bundle/APK preparation may continue after
the internal gates pass. Stop only before the exact real Play account action,
package upload, testing-track distribution, or production release, and request
consent to that concrete external effect. Technical readiness is not consent.
