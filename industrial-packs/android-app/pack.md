# Android App Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for Android applications delivered through Android runtime surfaces.

This pack converts the `android-app` profile into evidence-backed release, runtime, privacy, device, and distribution requirements. It is not a project implementation and does not prove that a real app is ready for distribution.

## Pack Type

`primary-platform`

## Applies To

- Android phone and tablet applications
- Kotlin, Java, Compose, or view-based applications
- apps with local persistence, network calls, notifications, background work, or system integrations
- apps distributed to testers or users

## Requires Additional Packs When Relevant

- `backend-api-industrial` when the app depends on server behavior
- `auth-permission-industrial` when login, roles, tenants, or protected resources exist
- `data-storage-industrial` when local or remote persistence is in scope
- `payment-value-transfer-industrial` when value movement exists
- `high-risk-change-industrial` when production, destructive, regulated, or irreversible work is in scope

## Evidence Standard

A BL2 Android project must be able to point to concrete evidence for:

- supported SDK and device matrix
- emulator or device behavior for critical flows
- offline, degraded network, background, and permission-denied states
- privacy-sensitive permissions and local data handling
- release configuration, signing readiness, rollback or staged-release strategy
- crash, performance, and observability evidence

## AI Boundaries

AI may draft code, tests, release notes, audit notes, and evidence records inside an approved task scope.

AI must not self-approve signing, production release, privacy acceptance, irreversible behavior, or residual risk acceptance.
