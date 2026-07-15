# IntentOS 1.112 Reproduction Log

## Boundary

All reproductions were read-only against the repository or used isolated
directories under `/private/tmp`. No target project, external system, release,
or production resource was changed.

## R-001 Finish Precedence

Source locations:

- `scripts/resolve-operating-loop.mjs:91-103`
- `scripts/resolve-operating-loop.mjs:526-535`
- `scripts/resolve-operating-loop.mjs:918-924`

The reproduction invokes the current FINISH branches with
`sourceFailure=true`, a success-like Unified Closure result, and a successful
Completion Evidence gate result.

Observed:

```json
{
  "sourceFailure": true,
  "operatingState": "READY_TO_REPORT_DONE",
  "selected": {
    "actionCode": "REPORT_TASK_COMPLETE",
    "actionClass": "REPORTING",
    "decisionStatus": "READY_TO_REPORT",
    "reasonCode": "CLOSURE_SUPPORTS_DONE",
    "canContinueReadOnly": true
  }
}
```

Result: reproduced P0.

## R-002 Business Universe False Negative And Obligation Removal

Isolated project:

```text
/private/tmp/intentos-universe-repro
  package.json
  src/orders.ts
```

The source validates an order on its first semantic line and contains an order
filtering/selection path later in the same file.

Command:

```bash
node scripts/resolve-task-governance.mjs \
  /private/tmp/intentos-universe-repro \
  --intent 'change order processing behavior' \
  --task-kind code_behavior \
  --json
```

Observed material fields:

```json
{
  "task_impact": "POSSIBLE_HIGH",
  "business_universe_routing": {
    "required": "No",
    "routing_result": "NOT_REQUIRED_WITH_REASON",
    "reason_codes": []
  },
  "required_before_implementation_review": {
    "business_rule_closure_required": "No",
    "change_impact_coverage_required": "No",
    "verification_plan_required": "No"
  },
  "required_before_completion_claim": {
    "test_evidence_required": "No",
    "execution_assurance_required": "No",
    "completion_evidence_required": "No"
  }
}
```

Result: reproduced P1.

## R-003 Empty Change Boundary

Command:

```bash
node scripts/check-change-boundary.mjs \
  /private/tmp/intentos-change-boundary-empty.Ur2whk
```

Observed exit: 0.

```text
PASS change boundary check skipped: no change-boundary reports
Change boundary check passed.
```

Applicable consumers found without a report/diff requirement:

- `.github/workflows/intentos-pr-checks.yml`
- `.github/workflows/intentos-release-checks.yml`
- `platforms/github/ci-ai-workflow.yml`

Result: reproduced P1.

## R-004 Empty Standard Baseline Selection

Command:

```bash
node scripts/check-standard-baseline-selection.mjs \
  /private/tmp/intentos-change-boundary-empty.Ur2whk
```

Observed exit: 0.

```text
PASS standard baseline selection check skipped: no reports
Standard baseline selection check passed.
```

Result: reproduced P1.

## R-005 Blocking Plan Review Is A Valid Artifact

Command:

```bash
node scripts/check-plan-review.mjs \
  examples/1.88-plan-review-gate/high-permission-delete-plan-revision \
  --require-structured-evidence
```

Observed exit: 0 and `Plan review check passed.`

The same report contains:

```text
plan_review_state: PLAN_REVISION_REQUIRED
ready_for_implementation_review: No
outcome: PLAN_REVISION_REQUIRED
```

Result: the checker proves artifact validity, not readiness. Planning Closure
currently interprets the state correctly; Operating Model's generic gate trace
does not preserve that distinction.

## R-006 Effective Guidance Graph Coverage

Command:

```bash
node --input-type=module -e \
  "import {loadReviewContextAuthority,effectiveGuidanceGraph} from './scripts/lib/review-context-authority.mjs'; const a=loadReviewContextAuthority('.'); const g=effectiveGuidanceGraph(a,false,'.'); console.log(g.activePaths.filter(p=>p.startsWith('scripts/')));"
```

Observed: 344 active paths and eight scripts. The graph excludes current
runtime outputs that still contain generic technical human-decision language,
including closure, guided closure, hook policy, and debt handoff.

Result: reproduced P1 coverage gap.

## R-007 Completion Evidence Execution Assurance Call Graph

Static call-graph inspection of `scripts/check-completion-evidence.mjs` found:

- source schema, task, intent, digest, outcome, and authority validation for
  Execution Assurance;
- source-chain binding to Test Evidence and optional Plan Review;
- a strict subprocess call for Business Universe;
- no subprocess call to `check-execution-assurance.mjs` and no equivalent
  recomputation of its actual diff, review, plan, and evidence gates.

Result: deterministic P1 consumer gap. A current-format adversarial fixture is
required in 1.113 to lock the repair; legacy fixtures are not accepted as proof
because current Runtime Trust and Control bindings correctly reject them for
other reasons.

## R-008 Release External-Effect Authority

Command:

```bash
node --test \
  tests/execution-distribution-trust.test.mjs \
  tests/release-topology-consumer.test.mjs \
  tests/release-execution-topology.test.mjs
```

Observed: 39 passed, 0 failed.

The current action authority keeps deploy, store submission, production
migration, rollback execution, and equivalent external effects
`HUMAN_REQUIRED`.

Result: targeted control verified. Do not reintroduce the historical P0.

## Verification Caveat

The current working directory contains an unrelated untracked plan. It causes
Manifest reverse-drift checks in `verify:release` because the verifier treats
all source plans as candidate assets. This is not a failure of the frozen audit
candidate. Final release verification must run from a clean checkout of the
exact tracked candidate and must not modify or silently include that unrelated
file.
