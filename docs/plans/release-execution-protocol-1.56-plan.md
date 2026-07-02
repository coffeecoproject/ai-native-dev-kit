# Release Execution Protocol 1.56 Plan

## Purpose

1.56 adds Release Execution Protocol.

It answers the user question:

```text
The work is ready for launch review and a human approved release. What happens next?
```

1.56 does not turn user approval into unlimited Codex authority. It turns release approval into a bounded execution plan, step ownership, stop conditions, and evidence capture.

## Product Position

The release path is:

```text
Unified Closure Decision
  -> Launch Review View
  -> Human Release Approval
  -> Release Execution Plan
  -> Controlled Execution / Human Handoff
  -> Release Evidence
  -> Post-launch Close-out
```

1.56 starts after 1.55.

If Launch Review View is not `READY_FOR_RELEASE_REVIEW`, Release Execution must be blocked.

If human release approval is missing, Release Execution may still produce a plan, but it must not mark real release execution as allowed.

## Non-Goals

1.56 must not:

- deploy, publish, submit, migrate, or release anything by itself
- approve release, production, app-store review, mini-program review, customer rollout, or rollback risk
- change CI/CD, hooks, production config, secrets, DNS, payment, permissions, app-store setup, mini-program setup, or database migrations
- replace project release SOPs, release owners, incident owners, or rollback owners
- create a second launch decision system after Launch Review View
- make Codex the release owner

## Execution Modes

| Mode | Meaning |
|---|---|
| `PLAN_ONLY` | Generate a release execution plan only. No real release action is allowed. |
| `HUMAN_EXECUTION_HANDOFF` | Human or existing release system executes release; Codex supplies steps and evidence checklist. |
| `ASSISTED_EXECUTION` | Codex may help with explicitly allowed low-risk commands after approval, but high-risk production actions still stop for humans. |
| `BLOCKED` | Required launch review, approval, owner, rollback, monitoring, SOP, or smoke evidence is missing. |

## Required Inputs

For real release execution readiness:

- Launch Review View with `READY_FOR_RELEASE_REVIEW`
- Human Release Approval with explicit approval status, owner, scope, and reference
- release owner
- release SOP or project release procedure reference
- rollback path
- monitoring or observation path
- post-launch smoke path
- platform-specific release constraints

## Step Classification

| Step Type | Default Executor |
|---|---|
| verification / build / static checks | `CODEX_MAY_RUN_AFTER_APPROVAL` only when project policy allows |
| release handoff / production deploy / app submission / mini-program publish | `HUMAN_REQUIRED` or `EXTERNAL_RELEASE_SYSTEM` |
| database migration / secrets / DNS / payment / permissions / production config | `STOP_FOR_HUMAN` |
| post-launch smoke observation | `CODEX_MAY_RUN_AFTER_APPROVAL` only when read-only or project policy allows |
| rollback execution | `HUMAN_REQUIRED` unless project SOP explicitly allows automation |

## Required Assets

- `core/release-execution-protocol.md`
- `docs/release-execution-protocol.md`
- `templates/release-execution-plan.md`
- `checklists/release-execution-review.md`
- `prompts/release-execution-agent.md`
- `release-execution-plans/.gitkeep`
- `scripts/resolve-release-execution.mjs`
- `scripts/check-release-execution.mjs`
- example Release Execution Plan
- bad fixtures for missing launch review, missing approval, and unsafe auto production execution

## CLI

```bash
node scripts/cli.mjs release-execution . \
  --launch-view-ref launch-review-views/001-launch.md \
  --approval-ref approval-records/001-release.md \
  --mode HUMAN_EXECUTION_HANDOFF

node scripts/cli.mjs release-execution-check .
```

## Acceptance Plan

1. Syntax checks pass:

```bash
node --check scripts/resolve-release-execution.mjs
node --check scripts/check-release-execution.mjs
```

2. Resolver outputs a safe plan:

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution"
```

Expected:

- prints `# Release Execution Plan`
- prints `This plan approves release: No`
- prints `This plan executes release by itself: No`

3. Checker passes source repo and good example:

```bash
node scripts/check-release-execution.mjs .
node scripts/check-release-execution.mjs examples/1.56-release-execution/web-assisted-handoff
```

4. Checker rejects unsafe fixtures:

- missing Launch Review View
- `ASSISTED_EXECUTION` without human approval
- production deploy marked as Codex auto execution

5. Full verification passes:

```bash
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Boundary Test

1.56 is successful only if a user can understand the next release step without learning internal checkers, while Codex still cannot treat release approval as permission to perform every production action.
