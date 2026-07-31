---
schema_version: 1.0
artifact_type: eval
number: 241
slug: source-only-markdown-evidence-fence-hardening
title: "source only markdown evidence fence hardening"
status: ready
created_at: 2026-07-31
intentos_version: 1.113.0
spec: specs/241-source-only-markdown-evidence-fence-hardening.md
---
# Eval: source only markdown evidence fence hardening

## Related Spec

`specs/241-source-only-markdown-evidence-fence-hardening.md`

## Must Pass

- [ ] changed JavaScript syntax checks pass
- [ ] Markdown-safe JSON round-trip test passes
- [ ] relevant tests pass
- [ ] build marked not applicable with reason
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

- [ ] Parsed evidence is deeply equal before and after safe serialization.
- [ ] Sentinel-only governance declarations are recorded in coverage as low-signal rather than emitted as pseudo-rules.
- [ ] Boundary validation is section-scoped and cannot be shadowed by project source excerpts.
- [ ] Forbidden-claim scanning excludes project-native excerpts while still scanning every IntentOS-authored conclusion section.
- [ ] No checker bypass or relaxed schema validation was introduced.
- [ ] All four same-run adoption producers use the shared helper.
- [ ] Pawcode remains byte-for-byte untouched by source verification.
- [ ] Real dirty/authority/release blockers remain visible after the false parse blocker is removed.

## Reject Conditions

Reject if:

- data can leak across users or authorized resource scopes
- permission checks only exist in frontend
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task added unapproved dependencies
- task violates non-goals
- evidence digest or parsed field values change
- literal triple backticks can still close the Machine-Readable Evidence fence
- Pawcode target files change during verification

## Required Evidence

- Command output summary: targeted node tests, project-entry verification, workflow artifact checker, Pawcode read-only adoption chain.
- Screenshots / traces if UI:
- Review notes: UI not applicable; include strict checker and target Git before/after evidence.
