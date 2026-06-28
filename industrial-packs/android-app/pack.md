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

## Scope Boundary

The Android pack governs module structure, navigation, lifecycle, state ownership, local runtime behavior, emulator/device verification, permission prompts, privacy-sensitive app behavior, and Android release readiness. Backend, admin, data, auth, payment, and high-risk responsibilities require companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify module and package boundaries, screen ownership, navigation model, lifecycle behavior, state ownership, persistence boundary, network boundary, dependency boundary, and how critical flows behave across launch, background, foreground, offline, and error states.

## Environment Baseline

Evidence should identify Gradle version, Android Gradle Plugin assumptions, SDK target, emulator or device matrix, build command, test command, signing status, configuration files by name only, and release channel when in scope.

## Data Boundary

This pack can record local cache and app-visible persistence behavior. Server data, migration safety, backup, restore, retention, and repair require `data-storage-industrial`.

## Permission Boundary

This pack can verify Android permission prompts, denial paths, manifest-sensitive permissions, and app-visible protected states. Role, tenant, protected-resource, and server-side permission correctness require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence should include build proof, emulator or device proof, critical flow proof, offline/background behavior proof, permission-denied proof, crash/performance proof, and release readiness proof where those surfaces are in scope.

## Release And Rollback

Release evidence should reference signing readiness, internal testing or Play release boundary when applicable, staged rollout or rollback/mitigation plan, crash monitoring, and unresolved exceptions. This pack does not approve distribution.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to a build log, emulator/device output, test result, release record, review packet, audit note, or project-specific verification file.

## Bad Cases

- Selecting this pack for a Web, iOS, or Mini Program project.
- Treating emulator UI proof as backend, data migration, auth enforcement, or payment proof.
- Claiming Android BL2 approval authorizes signing, release, or implementation.
- Recording package ids, secrets, signing data, or customer identifiers in pack files.

## Codex Forbidden Actions

Codex must not self-approve signing, package id changes, production release, privacy acceptance, backend contracts, data migration, payment behavior, or high-risk changes without companion packs and human approval.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real Android app satisfies BL2 without project-specific evidence.
