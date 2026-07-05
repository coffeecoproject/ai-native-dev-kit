---
schema_version: 1.0
artifact_type: eval
number: 190
slug: human-decision-summary
title: Human Decision Summary
spec: specs/190-human-decision-summary.md
status: done
created_at: 2026-06-28
---
# Eval: 1.9.0 Human Decision Summary

## Related Spec

`specs/190-human-decision-summary.md`

## Must Pass

- [x] `node --check scripts/workflow-next.mjs`
- [x] `node --check scripts/start-project.mjs`
- [x] `node --check scripts/baseline-project.mjs`
- [x] `node --check scripts/init-project.mjs`
- [x] `node scripts/check-manifest.mjs`
- [x] `node scripts/check-product-baseline.mjs .`
- [x] `node scripts/check-claim-control.mjs .`
- [x] `node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/190-human-decision-summary.md`
- [x] `node scripts/check-next-step-boundary.mjs . --task tasks/190-human-decision-summary.md`
- [x] `node scripts/check-intentos.mjs`
- [x] `git diff --check`

## Spec Alignment

- [x] Implementation matches acceptance criteria.
- [x] Implementation respects non-goals.
- [x] JSON and technical output remain available.
- [x] Human-facing output starts with decision clarity.

## Permission / Data Checks

- [x] No report is treated as approval.
- [x] No new target-project write authority is added.
- [x] No private project name is introduced into public evidence.
- [x] Baseline setup remains plan-first before apply.

## Manual Review Checklist

- Confirm `Human Decision Summary` includes recommendation, alternatives, file-write impact, risk, and no-decision outcome.
- Confirm generated migration reports still require explicit approval before applying AGENTS/PR template changes.
- Confirm `start` and `baseline` remain read-only by default.
- Confirm docs describe human choice/confirmation rather than technical operation burden.

## Reject Conditions

Reject if:

- decision summaries imply approval
- options hide project file writes
- governed project read-only protection is weakened
- baseline setup can apply without reviewed plan
- technical fields replace the human-facing recommendation

## Required Evidence

Command output summary: `final-reports/190-human-decision-summary.md`

Release evidence: `releases/1.9.0/release-record.md`

Known limitations: `releases/1.9.0/known-limitations.md`

Self-check report: `releases/1.9.0/self-check-report.md`
