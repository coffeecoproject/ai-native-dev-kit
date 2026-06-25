# iOS App Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for iOS applications delivered through Apple runtime surfaces.

This pack converts the `ios-app` profile into evidence-backed release, runtime, privacy, and device-behavior requirements. It is not a project implementation and does not prove that a real app is ready for distribution.

## Pack Type

`primary-platform`

## Applies To

- iPhone and iPad applications
- SwiftUI or UIKit applications
- apps with local persistence, network calls, notifications, widgets, or system integrations
- apps distributed to testers or users

## Requires Additional Packs When Relevant

- `backend-api-industrial` when the app depends on server behavior
- `auth-permission-industrial` when login, roles, tenants, or protected resources exist
- `data-storage-industrial` when local or remote persistence is in scope
- `payment-value-transfer-industrial` when value movement exists
- `high-risk-change-industrial` when production, destructive, regulated, or irreversible work is in scope

## Evidence Standard

A BL2 iOS project must be able to point to concrete evidence for:

- supported OS and device matrix
- simulator or device behavior for critical flows
- offline, degraded network, and error states
- privacy-sensitive permissions and data handling
- release configuration, signing readiness, rollback or phased-release strategy
- crash, performance, and observability evidence

## AI Boundaries

AI may draft code, tests, release notes, audit notes, and evidence records inside an approved task scope.

AI must not self-approve signing, provisioning, production release, privacy acceptance, irreversible behavior, or residual risk acceptance.
