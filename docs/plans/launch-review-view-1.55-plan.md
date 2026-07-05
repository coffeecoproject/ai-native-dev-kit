# Launch Review View 1.55 Plan

## Human Summary

1.55 extends IntentOS from task close-out to launch review preparation.

It does not create a new launch decision system. It creates a Launch Review View on top of:

- Unified Closure Decision
- Safe Launch readiness labels
- existing evidence and project release boundaries

Plainly:

```text
1.53/1.54 answer: is this task/version complete, and why?
1.55 answers: based on that closure result, what still blocks launch review?
```

## Correct Positioning

1.55 must be a view layer, not a new governance truth.

The dependency direction is:

```text
Unified Closure Decision
  -> Safe Launch readiness label
  -> Launch Review View
  -> Human Release Decision outside IntentOS
```

Launch Review View cannot override Unified Closure. If Unified Closure is not `DONE`, Launch Review View cannot say release review is ready.

Launch Review View can only translate existing closure and launch evidence into a user-readable release-review perspective.

## Problem

IntentOS already handles the development loop:

- natural-language project entry
- first-slice scoping
- baseline selection
- write planning
- change impact coverage
- review loop
- execution closure
- unified closure decision
- decision explain trace

The remaining gap is not "another done checker." The gap is the user question:

```text
Can this go live?
What blocks launch review?
```

The answer needs to show launch-specific gaps:

- environment
- runtime configuration
- platform submission boundary
- monitoring
- rollback
- release owner
- post-launch smoke test
- production data and privacy decisions

But it must not become a second final decision system.

## Non-Goals

- Do not add another final closure source.
- Do not add a separate launch state machine.
- Do not replace Safe Launch readiness labels.
- Do not replace Unified Closure, Execution Closure, Change Impact Coverage, Review Loop, Approval Record, or project-owned release SOPs.
- Do not deploy target projects.
- Do not approve release or production.
- Do not modify CI/CD.
- Do not install hooks.
- Do not change DNS, certificates, secrets, environment variables, app-store metadata, payment settings, permissions, migrations, or production data.
- Do not claim compliance, legal, tax, security, privacy, payment, or regulated launch approval.
- Do not make BL2 or industrial overlays default.

## User-Facing Behavior

The user should be able to ask:

```text
这个项目可以上线了吗？
这个 MVP 能不能给真实用户试用了？
小程序能提交审核了吗？
Web 版本能发布了吗？
App 能准备上架了吗？
```

Codex should return one Launch Review View:

```text
Launch review view: NOT_READY

Why:
- Unified Closure is NEEDS_IMPACT_COVERAGE.
- The task/version itself is not closed yet.
- Frontend/API/test impact is still missing.

Launch-specific gaps:
- release owner is not confirmed
- rollback is missing
- monitoring is missing

Safe next step:
- close the task first
- then prepare release-review evidence
```

If Unified Closure is `DONE`, the view may say:

```text
Launch review view: READY_FOR_INTERNAL_HANDOFF

Why:
- Unified Closure is DONE.
- Local verification passed.
- But release owner, rollback, monitoring, and post-launch smoke are still missing.

Safe next step:
- prepare release-review evidence
```

It still must not say release is approved.

## Reused Readiness Labels

Do not create new launch states. Reuse Safe Launch labels:

| Safe Launch Label | Launch Review View Meaning |
|---|---|
| `NOT_READY` | Unified Closure is not done, evidence is missing, or launch gaps block review. |
| `READY_FOR_DEMO` | Demo/local showing may be acceptable, but launch review is not ready. |
| `READY_FOR_INTERNAL_HANDOFF` | Internal trial or owner review may proceed with known launch gaps. |
| `READY_FOR_RELEASE_REVIEW` | Evidence appears sufficient for a human release owner to review. This is not release approval. |
| `BLOCKED` | A human decision, platform blocker, production risk, or missing owner blocks progress. |

## Required Inputs

Launch Review View must include:

- Unified Closure input
- Safe Launch label
- platform profile
- launch surface gaps
- human release decisions
- evidence map
- boundaries

It should read existing evidence where available:

- Closure Decisions
- Execution Closure Reports
- Change Impact Coverage Reports
- Launch Readiness Reports
- Approval Records
- release/rollback docs
- platform baseline docs

## Launch Surfaces

The view should map these launch surfaces, but only as launch-view annotations:

| Surface | Launch View Question |
|---|---|
| Product scope | What version is being considered for release review? |
| Platform | Web, Mini Program, iOS, Android, backend, internal admin, or mixed? |
| Environment | Is runtime/env/secrets ownership identified? |
| Data | Are storage, migration, retention, backup, and privacy concerns visible? |
| Identity/permission | Are login, roles, admin access, and sensitive actions visible? |
| Payment/value transfer | Are payment, refund, wallet, invoice, finance, or tax concerns visible? |
| Verification | Is local/staging/platform smoke evidence available? |
| Monitoring | Can failures be observed and owned? |
| Rollback | Is rollback/fallback/feature-disable path identified? |
| Release ownership | Who approves launch and who rolls back? |
| Post-launch | Is post-launch smoke/observation defined? |
| Communication | Are handoff, support, or release notes needed? |

## Platform View Hints

Platform hints should not become separate platform state machines.

### Web

Check whether deploy target, env ownership, domain/cert ownership, monitoring, rollback, and smoke route are visible.

Do not configure DNS, deploy, or change secrets.

### WeChat Mini Program

Check whether appid/project config ownership, backend/cloud dependency, privacy scope, submission review checklist, version note, and fallback are visible.

Do not submit to review or change appid/cloud production config.

### iOS / Android

Check whether archive/build evidence, signing owner, app-store/play-store metadata boundary, privacy declarations, crash visibility, and hotfix/rollback policy are visible.

Do not upload builds, change signing assets, or approve store release.

### Backend/API

Check whether runtime target, env config, migration plan, API smoke, observability, rollback, and data backup are visible.

Do not run production migrations, restart services, or change production config.

### Internal Admin

Check whether role/permission boundary, audit-sensitive actions, destructive-operation guard, internal handoff, and support owner are visible.

Do not grant permissions or enable destructive operations without approval.

## Proposed Assets

Add:

- `core/launch-review-view.md`
- `docs/launch-review-view.md`
- `templates/launch-review-view-card.md`
- `checklists/launch-review-view-review.md`
- `prompts/launch-review-view-agent.md`
- `launch-review-views/.gitkeep`
- `scripts/resolve-launch-review-view.mjs`
- `scripts/check-launch-review-view.mjs`

Add CLI aliases:

- `node scripts/cli.mjs launch-view <project> --intent "<release-review goal>"`
- `node scripts/cli.mjs launch-view-check <project>`

Do not deprecate existing `launch-readiness`. It remains the Safe Launch checker.

## Card Sections

The Launch Review View card should include:

- Human Summary
- Unified Closure Input
- Safe Launch View
- Platform View
- Launch Surface Gaps
- Human Release Decisions
- Evidence Map
- Recommended Next Step
- Boundaries
- Outcome

## Checker Rules

The checker validates view consistency. It does not validate production correctness.

It must reject:

- missing Unified Closure input
- `READY_FOR_RELEASE_REVIEW` when Unified Closure is not `DONE`
- `READY_FOR_RELEASE_REVIEW` without rollback evidence
- `READY_FOR_RELEASE_REVIEW` without monitoring evidence
- `READY_FOR_RELEASE_REVIEW` without release owner evidence
- release/production approval claims
- deploy/submit/publish claims
- production config, secrets, DNS, CI, hook, app-store, payment, permission, or migration changes
- claims that Launch Review View replaces Safe Launch or project release SOPs

## Execution Plan

### Phase 1: Revise Plan And Model

- Replace the original launch-delivery-readiness idea with Launch Review View.
- State that Unified Closure remains the final close-out truth.
- State that Safe Launch labels are reused.

Acceptance:

- Plan does not introduce an independent launch state machine.
- Plan does not describe a second final decision source.

### Phase 2: Add Assets

Add core, docs, template, checklist, prompt, and `launch-review-views/`.

Acceptance:

- Assets explain the relationship to Unified Closure and Safe Launch.
- Assets explicitly forbid release approval and production actions.

### Phase 3: Add Resolver

Resolver should:

- run or read Unified Closure input
- detect platform hints
- identify launch surface gaps
- choose a Safe Launch label
- print a Launch Review View
- support JSON output

Acceptance:

- Resolver is read-only.
- Resolver does not write target files.
- Resolver never returns `READY_FOR_RELEASE_REVIEW` when closure is not `DONE`.

### Phase 4: Add Checker

Checker should validate recorded Launch Review Views.

Acceptance:

- Good examples pass.
- Bad fixtures fail with specific messages.
- The checker enforces no release/production approval claims.

### Phase 5: Wire References

Update:

- CLI help and aliases
- package verify surface
- manifest and workflow version assets
- README / README.zh-CN
- docs index and references
- release evidence
- check-intentos protocol

Acceptance:

- Generated projects receive launch view assets.
- Ordinary user docs keep the default path simple.
- Maintainer docs expose exact checks.

## Acceptance Plan

The implementation is accepted only if these pass:

```bash
node --check scripts/resolve-launch-review-view.mjs
node --check scripts/check-launch-review-view.mjs
node scripts/cli.mjs launch-view . --intent "prepare release review" --verification "npm run verify passed"
node scripts/check-launch-review-view.mjs .
node scripts/check-launch-review-view.mjs examples/1.55-launch-review-view/web-internal-handoff
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Bad fixtures must fail:

```bash
node scripts/check-launch-review-view.mjs test-fixtures/bad/bad-launch-view-missing-closure
node scripts/check-launch-review-view.mjs test-fixtures/bad/bad-launch-view-release-review-missing-rollback
node scripts/check-launch-review-view.mjs test-fixtures/bad/bad-launch-view-claims-production-approval
```

Expected failure reasons:

- Launch Review View must reference Unified Closure.
- Release review cannot be ready without rollback evidence.
- Launch Review View cannot approve release or production.

## User Acceptance Criteria

1. User can ask "can this go live?" in natural language.
2. Codex returns one readable launch review view.
3. The first section explains whether launch review can proceed.
4. The answer says whether Unified Closure is done.
5. The answer lists launch-specific gaps.
6. The answer lists human release decisions.
7. The answer does not imply release approval.
8. The safe next step is obvious.

## Governance Acceptance Criteria

1. Unified Closure remains the final task close-out truth.
2. Safe Launch labels remain the launch readiness vocabulary.
3. Launch Review View is read-only.
4. Release approval remains human-owned.
5. Existing governed projects are not overwritten.
6. BL2 remains selected-only.
7. Launch Review View references project release SOPs but does not replace them.

## Recommended 1.55 Cut

Keep 1.55 focused:

```text
Launch Review View = closure-dependent, safe-launch-labeled, read-only release-review perspective.
```

Defer controlled release execution to a later phase.
