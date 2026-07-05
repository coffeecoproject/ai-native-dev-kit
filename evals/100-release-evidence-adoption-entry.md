---
schema_version: 1.0
artifact_type: eval
number: 100
slug: release-evidence-adoption-entry
title: "release evidence adoption entry"
status: ready
created_at: 2026-06-27
intentos_version: 0.42.0
spec: specs/100-release-evidence-adoption-entry.md
---
# Eval: release evidence adoption entry

## Related Spec

`specs/100-release-evidence-adoption-entry.md`

## Must Pass

- [ ] version metadata is `1.0.0`
- [ ] release evidence files exist
- [ ] supporting templates exist
- [ ] release evidence distinguishes 1.0 minimum from 10/10 real-project evidence release
- [ ] self-check validates release evidence
- [ ] generated-project smoke passes
- [ ] update dry-run smoke passes
- [ ] migration dry-run smoke passes
- [ ] workflow checks pass
- [ ] no unrelated files committed

## Spec Alignment

- [ ] Implementation matches acceptance criteria
- [ ] Non-goals are not implemented
- [ ] No migration apply
- [ ] No industrial pack promotion
- [ ] No package publishing
- [ ] No license term change

## Permission / Data Checks

- [ ] generated smoke writes only `/tmp/intentos-1-test`
- [ ] update smoke uses dry-run only
- [ ] migration smoke uses dry-run only
- [ ] no production config is changed
- [ ] no secrets, regulated data, deployment, package publish, or target project outside `/tmp` is touched

## Manual Review Checklist

- 1.0 release does not overclaim real adoption evidence.
- Known limitations are explicit.
- Adoption evidence template can record false positives, false negatives, AI failure modes, and human decisions.
- Productization trial template does not pretend trial evidence is real adoption evidence.

## Reject Conditions

Reject if:

- 1.0 docs claim production validation across real projects
- an industrial pack is promoted without real evidence
- migration apply is implemented
- license docs are changed as legal advice
- package publishing is implied

## Required Evidence

- Command output summary: record manifest, fixtures, self-check, generated smoke, update smoke, migration smoke, workflow, review-loop, next-step, and diff-check results.
- Screenshots / traces if UI: not applicable; no UI changed.
- Review notes: record self-review findings in `review-loop-reports/100-release-evidence-adoption-entry.md`.
