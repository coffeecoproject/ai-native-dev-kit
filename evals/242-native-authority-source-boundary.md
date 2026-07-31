---
schema_version: 1.0
artifact_type: eval
number: 242
slug: native-authority-source-boundary
title: "native authority source boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
spec: specs/242-native-authority-source-boundary.md
---
# Eval: native authority source boundary

## Related Spec

`specs/242-native-authority-source-boundary.md`

## Must Pass

- [ ] lint passes
- [ ] typecheck passes
- [ ] relevant tests pass
- [ ] build passes if applicable
- [ ] no unrelated files changed
- [ ] no unapproved dependency added

## Spec Alignment

- [ ] Implementation matches acceptance criteria
- [ ] Implementation respects non-goals
- [ ] API / interface contract matches spec
- [ ] UI states are covered if applicable
- [ ] observability requirements are covered if applicable

## Permission / Data Checks

- [ ] Permission checks are server-side where applicable
- [ ] Resource ownership is enforced
- [ ] Resource/scope isolation is enforced
- [ ] Error responses do not leak sensitive data

## Manual Review Checklist

- Boundary evidence is deterministic and fail-open to project ownership.
- A modified source-distribution target remains included.
- Workflow record exclusion requires installed-layout evidence.
- Baseline table rows and governance-heading rules appear in classifications.
- Sentinel-only declarations do not increase omitted rule count.
- Real Pawcode source-run assurance has zero omitted blocks and no writes.

## Reject Conditions

Reject if:

- path names alone can exclude customized project files
- target-owned manifest content can expand exclusion beyond source authority
- genuine unresolved project rules stop blocking
- implementation writes Pawcode or changes CI/hooks/release behavior
- tests are missing for drift preservation or real project evidence
- task added dependencies or violates non-goals

## Required Evidence

- Command output summary: focused Node tests, project-entry verification, syntax
  checks, diff check, and real Pawcode read-only assurance with before/after Git
  status digest.
- Screenshots / traces if UI: Not applicable; no UI surface changes.
- Review notes: self-review must cover false exclusions, drift preservation,
  unresolved-rule blocking, Pawcode write boundary, and rollback.
