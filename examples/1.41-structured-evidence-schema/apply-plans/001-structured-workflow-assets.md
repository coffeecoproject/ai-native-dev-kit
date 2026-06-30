# Unified Apply Plan: structured workflow assets

## Human Decision Summary

One-sentence conclusion: Add schema-backed evidence for the write-control artifact chain.

Recommended choice: Approve only the exact listed workflow governance files after review.

Can Codex write now: No

Need from human: Confirm whether the listed files may be changed in a later controlled apply step.

If nothing is approved: Keep this as plan evidence only.

## Apply Readiness

| Field | Value |
|---|---|
| State | `PLAN_ONLY` |
| Can apply now? | No |
| Can AI write now? | No |
| Why | This is only a plan and evidence record. |
| Recommended next step | Review readiness and approval scope. |

## Source Evidence

| Evidence | Ref | Status |
|---|---|---|
| Workflow Guidance Card | `workflow-guidance-cards/001-structured-evidence.md` | not applicable |
| Workflow Adoption Map | `workflow-adoption-maps/001-structured-evidence.md` | not applicable |
| Baseline Decision Card | `baseline-decision-cards/001-structured-evidence.md` | not applicable |
| Document Archive Apply Plan | `archive-apply-plans/001-structured-evidence.md` | not applicable |
| Hook Policy / Hook Plan | `hook-policies/001-structured-evidence.md` | not applicable |
| Execution Closure Report | `execution-closures/001-structured-evidence.md` | not applicable |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.41.0",
  "artifact_type": "unified_apply_plan",
  "artifact_id": "001-structured-workflow-assets",
  "plan_digest": "sha256:ce2c9eb1f1e2731c7098680fa1f96dcf804dd39cc7e2c55ed9edca460cf3e965",
  "intent": "Add schema-backed evidence for write-control artifacts.",
  "state": "PLAN_ONLY",
  "can_apply_now": false,
  "can_codex_write_now": false,
  "actions": [
    {
      "id": "A-001",
      "action_type": "WORKFLOW_ASSET_UPDATE",
      "target_paths": [
        "docs/structured-evidence-schema.md",
        "schemas/artifacts/unified-apply-plan.schema.json",
        "schemas/artifacts/controlled-apply-readiness.schema.json",
        "schemas/artifacts/approval-record.schema.json",
        "scripts/lib/artifact-schema.mjs"
      ],
      "risk_level": "STANDARD",
      "status": "PLAN_ONLY",
      "will_write_now": false,
      "approval_required": true,
      "rollback_required": true
    }
  ],
  "preconditions": [
    "Existing apply/readiness/approval rules reviewed",
    "Target paths are exact relative paths",
    "No CI, hook, production, secret, or business-code change is included"
  ],
  "rollback": {
    "required": true,
    "path": "git diff -- docs/structured-evidence-schema.md schemas/artifacts scripts/lib/artifact-schema.mjs",
    "step": "Revert only the listed workflow governance files if validation fails.",
    "verification": "node scripts/check-dev-kit.mjs"
  },
  "verification": [
    {
      "command_or_method": "node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema",
      "required_before_apply": true,
      "required_after_apply": true,
      "evidence_path": "releases/1.41.0/self-check-report.md",
      "owner": "Codex"
    }
  ],
  "boundary": {
    "writes_files_now": false,
    "authorizes_apply": false,
    "approves_implementation": false,
    "approves_release_or_production": false,
    "modifies_ci_or_hooks_now": false,
    "changes_source_of_truth_now": false
  },
  "outcome": "NEEDS_HUMAN_DECISION"
}
```

## Planned Actions

| ID | Action type | Target paths | Reason | Status | Will write now | Approval required | Rollback required |
|---|---|---|---|---|---|---|---|
| A-001 | WORKFLOW_ASSET_UPDATE | `docs/structured-evidence-schema.md`, `schemas/artifacts/unified-apply-plan.schema.json`, `schemas/artifacts/controlled-apply-readiness.schema.json`, `schemas/artifacts/approval-record.schema.json`, `scripts/lib/artifact-schema.mjs` | Make write-control evidence machine-checkable | PLAN_ONLY | No | Yes | Yes |

## Human-Only / Blocked Actions

| ID | Action type | Reason | Required owner | Status |
|---|---|---|---|---|
| H-001 | CONTROLLED_APPLY_RUNNER | Runner behavior is out of 1.41 scope | human | HUMAN_APPROVAL_REQUIRED |

## Preconditions

- Target project exists: Yes
- Existing project rules reviewed: Yes
- Dirty work reviewed: Yes
- Required evidence linked: Yes
- High-risk actions separated: Yes

## Backup / Rollback Plan

| Action | Backup required | Backup path | Rollback step | Rollback verification |
|---|---|---|---|---|
| A-001 | Yes | `git diff -- docs/structured-evidence-schema.md schemas/artifacts scripts/lib/artifact-schema.mjs` | Revert only listed workflow governance files if validation fails | `node scripts/check-dev-kit.mjs` |

## Verification Plan

| Step | Command or method | Required before apply | Required after apply | Evidence path | Owner |
|---|---|---|---|---|---|
| Pre-apply check | `node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema` | Yes | No | `releases/1.41.0/self-check-report.md` | Codex |
| Post-apply check | `node scripts/check-dev-kit.mjs` | No | Yes | `releases/1.41.0/self-check-report.md` | Codex |

## Human Decisions Needed

| Decision | Why it matters | Options | Recommended option | Owner | Status |
|---|---|---|---|---|---|
| Approve exact workflow governance scope | Writes require explicit approval | approve / narrow / reject | approve after review | human | PENDING |

## Boundary

- This plan writes files now: No
- This plan authorizes apply: No
- This plan approves implementation: No
- This plan approves release or production: No
- This plan modifies CI or hooks now: No
- This plan deletes or archives files now: No
- This plan changes source of truth now: No
- This plan grants Codex permission to continue beyond scope: No

## Outcome

`NEEDS_HUMAN_DECISION`
