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

## Does Not Cover By Itself

- backend API contract correctness
- admin console or operations workflow behavior
- server-side data schema, migration, retention, or recovery correctness
- auth, role, tenant, or protected-resource enforcement outside app-visible states
- payment, refund, balance, credit, subscription, or value-transfer correctness

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

## Scope Boundary

The iOS pack governs app architecture, navigation, state ownership, local runtime behavior, simulator/device verification, permission prompts, privacy-sensitive app behavior, and iOS release readiness. Backend, admin, data, auth, payment, and high-risk responsibilities require companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify app module boundaries, screen ownership, navigation model, state ownership, persistence boundary, network boundary, dependency boundary, and how critical flows behave across launch, background, foreground, offline, and error states.

## Environment Baseline

Evidence should identify Xcode version, Swift/toolchain assumptions, simulator or device matrix, build command, test command, signing/provisioning status, configuration files by name only, and release channel when in scope.

## Data Boundary

This pack can record local cache and app-visible persistence behavior. Server data, migration safety, backup, restore, retention, and repair require `data-storage-industrial`.

## Permission Boundary

This pack can verify iOS permission prompts, denial paths, privacy strings, and app-visible protected states. Role, tenant, protected-resource, and server-side permission correctness require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence should include build proof, simulator or device proof, critical flow proof, offline/degraded network proof, permission-denied proof, crash/performance proof, and release readiness proof where those surfaces are in scope.

## Release And Rollback

Release evidence should reference signing readiness, TestFlight or App Store boundary when applicable, phased release or rollback/mitigation plan, crash monitoring, and unresolved exceptions. This pack does not approve distribution.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to a build log, simulator/device output, test result, release record, review packet, audit note, or project-specific verification file.

## Bad Cases

- Selecting this pack for a Web, Android, or Mini Program project.
- Treating simulator UI proof as backend, data migration, auth enforcement, or payment proof.
- Claiming iOS BL2 approval authorizes signing, release, or implementation.
- Recording bundle ids, secrets, provisioning data, or customer identifiers in pack files.

## Codex Forbidden Actions

Codex must not self-approve signing, provisioning, bundle id changes, production release, privacy acceptance, backend contracts, data migration, payment behavior, or high-risk changes without companion packs and human approval.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real iOS app satisfies BL2 without project-specific evidence.
