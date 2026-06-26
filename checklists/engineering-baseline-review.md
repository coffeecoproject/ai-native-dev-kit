# Engineering Baseline Review Checklist

Use this checklist when creating, reviewing, or updating `docs/engineering-baseline.md`.

The goal is not to force one code structure. The goal is to prevent Codex from silently creating project-wide engineering rules.

## Scope

- [ ] The baseline says what it applies to.
- [ ] The baseline says what it does not apply to.
- [ ] It does not contain business requirements.
- [ ] It does not replace platform profiles or industrial packs.

## Decision Ownership

- [ ] Each structural topic has a source of truth.
- [ ] Project-wide conventions have an owner.
- [ ] Pending decisions are visible.
- [ ] Human-only decisions are clearly marked.

## Structure And Types

- [ ] Code structure boundaries are documented or explicitly pending.
- [ ] Type sources of truth are documented or explicitly pending.
- [ ] DTO, schema, domain model, and view model boundaries are documented or explicitly pending.
- [ ] Generated types include source and update command when applicable.
- [ ] Codex is not allowed to create new project-wide conventions silently.

## API, Data, And State

- [ ] API contract source is documented or explicitly pending.
- [ ] Enum / string / lookup / state-machine choice follows a decision matrix.
- [ ] Schema and migration rules are documented or explicitly pending.
- [ ] Permission, error-code, status-code, and state ownership are documented or explicitly pending when relevant.

## Frontend Boundary

- [ ] Page / route responsibility is documented or explicitly pending.
- [ ] Component responsibility is documented or explicitly pending.
- [ ] Hook categories are documented or explicitly pending.
- [ ] API client location and generated type source are documented or explicitly pending.
- [ ] Server state, form state, UI state, and global state ownership are documented or explicitly pending.

## Codex Behavior

- [ ] Low-risk local changes may follow nearby existing patterns.
- [ ] Structural, contract, schema, permission, state, dependency, or migration changes stop when the baseline is missing.
- [ ] Baseline gaps are recorded in final reports, AI task logs, Review Packets, or Decision Briefs.
- [ ] One-off implementation choices are not upgraded into project standards.

## Overreach Check

- [ ] The baseline does not mandate a universal React, Vue, SwiftUI, Android, or Mini Program directory structure.
- [ ] The baseline does not mandate a universal enum / string / lookup strategy.
- [ ] The baseline does not introduce source-code scanning gates unless the project explicitly opted into BL2 / strict mode.
- [ ] The baseline only governs decisions touched by the task or confirmed by the project.
