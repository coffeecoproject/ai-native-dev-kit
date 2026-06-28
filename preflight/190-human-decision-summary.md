---
schema_version: 1.0
artifact_type: preflight
number: 190
slug: human-decision-summary
title: Human Decision Summary
request: requests/190-human-decision-summary.md
task_level: L1
status: done
created_at: 2026-06-28
---
# Preflight: 190-human-decision-summary

## Source Request

`requests/190-human-decision-summary.md`

## Clarity

READY

## Problem Summary

Real project use showed that technically correct AI Native suggestions can still feel hard to act on when the user must infer which path is recommended and what each path changes.

## Missing Information

- No private project details should be embedded.
- No new automatic real-project scanner is approved.
- No new target project write authority is approved.

## Assumptions

- The right fix is an output and decision-routing upgrade, not a new governance layer.
- Existing protections remain correct.
- Historical reports may stay as historical evidence; new templates and scripts should use the improved format.

## Direction Risks

- Turning decision summaries into hidden approvals.
- Making every report overly long.
- Forcing users to choose from too many options.
- Migrating all historical evidence as a noisy mechanical change.

## Over-design Risks

- Adding UI, API, automation, or GPT hook behavior before the output layer is stable.
- Making Human Decision Summary mandatory for every low-level technical file, even when no human decision exists.

## MVP Recommendation

Upgrade the shared output protocol, reporter prompt, decision/status templates, high-frequency decision templates, adoption/baseline scripts, migration reports, usage docs, and checkers. Keep JSON and technical output stable.

## Non-goals

- No automatic GPT review integration.
- No new target project scanner.
- No production release approval.
- No direct baseline apply without reviewed plan.
- No global rewrite of historical release evidence.

## Domain Model Draft

- `Human Decision Summary`: first section for decision-heavy output.
- `Recommended choice`: exactly one recommended path unless the safest answer is pause.
- `Writes project files?`: explicit file-write impact for each option.
- `No-decision outcome`: what Codex must do when the human does not decide.

## Permission / Security Risks

- File-write impact must not hide CI, release, production config, business code, migration, or agent-rule changes.
- Outputs must keep secrets and private target details out of external review summaries.

## First Vertical Slice

```text
real project feedback
-> output protocol update
-> templates and prompts update
-> start/baseline/workflow-next/init report output
-> docs and checks
-> release evidence
```

## Suggested Specs

- `specs/190-human-decision-summary.md`

## Suggested Task Level

L1

## Decision

READY_FOR_SPEC

## Rationale

The scope is bounded to dev-kit workflow assets and scripts. It improves user decision clarity without changing approval authority.
