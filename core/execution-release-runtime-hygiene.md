# Execution And Release Runtime Hygiene

Runtime Hygiene handles the engineering conditions that appear after a task has
been classified, queued, implemented, committed, pushed, checked by CI, or
prepared for release.

It does not prove that the task is complete. It does not approve commit, push,
release, artifact deletion, force push, gate bypass, or production action.

## Purpose

Runtime Hygiene lets Codex classify delivery blockers without asking the user
to understand low-level engineering mechanics.

It sits after:

```text
Work Queue -> Task Governance -> Execution / Completion Consumers
```

and before:

```text
Delivery status, release handoff, or current-user consent to a concrete external effect
```

## Runtime Classes

| Class | Meaning |
| --- | --- |
| `GIT_LINEAGE_DIRTY` | Branch history is stale, mixed, or not based on current main |
| `COMMIT_SCOPE_MIXED` | Current commit contains unrelated task changes |
| `PRE_PUSH_GATE_FAILED` | Local pre-push or project gate failed |
| `STRUCTURE_BUDGET_EXCEEDED` | Project structure budget blocks push |
| `CI_CODE_FAILURE` | CI failed because code or tests failed |
| `CI_ENVIRONMENT_FAILURE` | CI failed because provider, runner, permission, cache, or network state failed |
| `RELEASE_PREFLIGHT_FAILED` | Release failed before test or production side effects |
| `ARTIFACT_QUOTA_BLOCKED` | Artifact storage quota blocks bundle or evidence upload |
| `RELEASE_BUNDLE_OVERSIZED` | Runtime bundle includes too much non-runtime content |
| `PRODUCTION_SIDE_EFFECT_UNKNOWN` | It is unclear whether production was touched |
| `PRODUCTION_SIDE_EFFECT_PRESENT` | Production action started or completed |

## Decision States

| State | Meaning |
| --- | --- |
| `CAN_CONTINUE_AUTOMATICALLY` | Codex can continue read-only or reversible work inside the current task |
| `CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR` | Codex should repair the current task until project gates pass |
| `NEEDS_PLAIN_USER_APPROVAL` | Legacy state: a real business fact or concrete real-world consent is required |
| `NEEDS_RELEASE_OWNER_APPROVAL` | Legacy state: current-user consent to the exact release or irreversible cleanup effect is required; no separate role is implied |
| `BLOCKED_BY_IRREVERSIBLE_ACTION` | The proposed action cannot continue without explicit approval |
| `BLOCKED_BY_PRODUCTION_SIDE_EFFECT` | Production may have been touched; use the project incident process and request current-user consent before any new external action |
| `BLOCKED_BY_UNCLEAR_TASK_SCOPE` | Runtime state suggests mixed commits, stale branch state, or unrelated work |

## Git Lineage Rules

Codex should inspect branch state before commit or push:

- current branch;
- upstream branch;
- dirty worktree state;
- local commits not in upstream or `origin/main`;
- commits missing from the branch;
- whether previous task commits are mixed into the current task;
- whether current files match the active Work Queue item and Task Governance
  record when those records exist.

Codex must not force push by default. If history rewrite is required, stop for
explicit approval or produce a cleanup plan.

## Push Gate Rules

Local gate failures keep the task open. Codex may repair lint, typecheck, test,
generated-docs drift, or structure-budget failures only when the repair is
inside the current task and does not bypass the gate.

Structure-budget failures require structural repair, not exemption by default.

## CI Runtime Rules

CI failures must be classified before Codex claims status:

- code or test failure returns to task repair;
- environment, permission, cache, runner, or quota failure can be retried only
  when retry is safe and no production side effect exists;
- unknown failures remain blocked.

For `CI_ENVIRONMENT_FAILURE`, `CAN_CONTINUE_AUTOMATICALLY` is allowed only when
the report records both project retry-policy permission and a production
side-effect check. Without those two facts, the safe result is user or owner
  consent to the concrete real-world effect, not a technical strategy choice.

Runtime Hygiene reports should preserve source trace for the observed blocker:
gate output, CI log, artifact error, bundle summary, or release event. Strict
checks may require those source refs and digests before accepting the report.

When a downstream delivery consumer runs in strict mode, the report must also
bind to the current Work Queue item and matching Task Governance record. Runtime
Hygiene does not replace task governance; it proves the delivery blocker belongs
to the current task before Codex continues.

## Release Lane Rules

Runtime Hygiene distinguishes release lanes:

| Lane | Default action |
| --- | --- |
| `PREFLIGHT_ONLY` | Diagnose and retry only if reversible |
| `BUNDLE_CREATED` | Rebuild if evidence is preserved |
| `TEST_LANE_STARTED` | Preserve test evidence before retry |
| `PROD_FREEZE_ENTERED` | Exact production effect needs current-user consent |
| `PROD_DEPLOY_STARTED` | Stop for the project incident/release protocol; do not invent additional roles |
| `PROD_DEPLOY_DONE` | Use post-release or rollback rules |
| `UNKNOWN` | Stop |

Runtime Hygiene never approves release.

## Artifact And Bundle Rules

Artifact cleanup is irreversible. Codex must not delete artifacts without
explicit approval.

Evidence must be preserved even when bundle size is blocked. Runtime bundles
should exclude screenshots, videos, PDFs, generated reports, local caches, and
large evidence archives unless a platform explicitly requires them.

Do not delete evidence to slim a bundle. Separate evidence storage from runtime
bundle content.

## User Output

The first message must be plain language. Technical trace belongs below it.

Users should not have to understand `ahead/behind`, merge bases, CI provider
internals, artifact quota details, release lanes, or evidence digest mechanics.

## Boundary

Runtime Hygiene:

- writes target files: No;
- approves commit or push: No;
- approves release or production: No;
- bypasses gates: No;
- deletes artifacts: No;
- changes production: No;
- force pushes: No.
