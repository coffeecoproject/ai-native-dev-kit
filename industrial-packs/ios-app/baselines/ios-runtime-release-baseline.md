# iOS Runtime And Release Baseline

## Required Coverage

- supported OS versions and device classes are identified
- critical flows are verified on simulator or device
- loading, empty, error, denied, offline, and degraded network states are covered
- local persistence and cache behavior are documented when present
- privacy-sensitive permissions have prompt and fallback behavior
- release configuration is reviewed before distribution

## Release Expectations

- signing and build configuration are reviewed by a human
- release notes, rollback or phased-release plan, and monitoring evidence exist
- crash reporting or equivalent failure observation is available
- known exceptions and residual risks are listed in project evidence

## AI Boundary

AI may prepare evidence and checks, but must not approve distribution, signing, privacy acceptance, or residual risk.
