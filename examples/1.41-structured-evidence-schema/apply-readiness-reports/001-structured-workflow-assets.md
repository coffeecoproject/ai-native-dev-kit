# Controlled Apply Readiness Report: structured workflow assets

## Human Decision Summary

Conclusion: `READY_FOR_HUMAN_APPROVED_APPLY`

Recommended choice: Approve only the exact listed workflow governance action if the digest matches.

Can Codex apply now: No

What I need from you: Explicit approval or rejection of A-001.

## Apply Plan Reference

| Field | Value |
|---|---|
| Unified Apply Plan | `apply-plans/001-structured-workflow-assets.md` |
| Plan readable | Yes |
| Plan authorizes apply | No |
| Plan writes files now | No |
| Plan says Codex can write now | No |

## Readiness State

| Field | Value |
|---|---|
| State | `READY_FOR_HUMAN_APPROVED_APPLY` |
| Candidate for human-approved apply | Yes |
| Requires explicit human approval | Yes |
| Can proceed without new approval | No |

## Action Classification

| Action type | Target paths | Classification | Reason |
|---|---|---|---|
| WORKFLOW_ASSET_UPDATE | `docs/structured-evidence-schema.md`, `schemas/artifacts/unified-apply-plan.schema.json`, `schemas/artifacts/controlled-apply-readiness.schema.json`, `schemas/artifacts/approval-record.schema.json`, `scripts/lib/artifact-schema.mjs` | LOW_RISK_CANDIDATE | Workflow governance evidence only; no CI, hook, production, secret, or business-code change |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.41.0",
  "artifact_type": "controlled_apply_readiness",
  "artifact_id": "001-structured-workflow-assets",
  "readiness_state": "READY_FOR_HUMAN_APPROVED_APPLY",
  "can_codex_apply_now": false,
  "requires_explicit_human_approval": true,
  "can_proceed_without_new_approval": false,
  "apply_plan": {
    "path": "apply-plans/001-structured-workflow-assets.md",
    "plan_digest": "sha256:ce2c9eb1f1e2731c7098680fa1f96dcf804dd39cc7e2c55ed9edca460cf3e965"
  },
  "actions": [
    {
      "id": "A-001",
      "classification": "LOW_RISK_CANDIDATE",
      "target_paths": [
        "docs/structured-evidence-schema.md",
        "schemas/artifacts/unified-apply-plan.schema.json",
        "schemas/artifacts/controlled-apply-readiness.schema.json",
        "schemas/artifacts/approval-record.schema.json",
        "scripts/lib/artifact-schema.mjs"
      ]
    }
  ],
  "preconditions": [
    { "name": "Apply plan exists", "status": "pass" },
    { "name": "Git state safe", "status": "pass" },
    { "name": "Target paths bounded", "status": "pass" },
    { "name": "Backup plan exists", "status": "pass" },
    { "name": "Rollback plan exists", "status": "pass" },
    { "name": "Verification plan exists", "status": "pass" },
    { "name": "Human approval recorded", "status": "fail" }
  ],
  "rollback": {
    "required": true,
    "path": "git diff -- docs/structured-evidence-schema.md schemas/artifacts scripts/lib/artifact-schema.mjs",
    "step": "Revert only listed workflow governance files if validation fails.",
    "verification": "node scripts/check-dev-kit.mjs"
  },
  "verification": {
    "pre_apply": "node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema",
    "post_apply": "node scripts/check-dev-kit.mjs",
    "evidence_path": "releases/1.41.0/self-check-report.md"
  },
  "boundary": {
    "writes_files_now": false,
    "authorizes_apply": false,
    "approves_implementation": false,
    "approves_release_or_production": false,
    "installs_hooks_or_changes_ci": false,
    "enables_high_risk_actions": false
  },
  "outcome": "READINESS_RECORDED"
}
```

## Preconditions

| Precondition | Status | Evidence |
|---|---|---|
| Apply plan exists | pass | `apply-plans/001-structured-workflow-assets.md` |
| Git state safe | pass | source repo worktree reviewed |
| Target paths bounded | pass | exact relative paths only |
| Backup plan exists | pass | apply plan rollback section |
| Rollback plan exists | pass | apply plan rollback section |
| Verification plan exists | pass | apply plan verification section |
| Human approval recorded | fail | approval still requires explicit human confirmation |

## Human-Only / Blocked Items

| Item | Reason | Owner |
|---|---|---|
| CONTROLLED_APPLY_RUNNER | Runner behavior is out of 1.41 scope | Human |

## Backup / Rollback Readiness

| Field | Value |
|---|---|
| Backup required | Yes |
| Backup path | `git diff -- docs/structured-evidence-schema.md schemas/artifacts scripts/lib/artifact-schema.mjs` |
| Rollback step | Revert only listed workflow governance files if validation fails |
| Rollback verification | `node scripts/check-dev-kit.mjs` |

## Verification Readiness

| Field | Value |
|---|---|
| Pre-apply verification | `node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema` |
| Post-apply verification | `node scripts/check-dev-kit.mjs` |
| Evidence path | `releases/1.41.0/self-check-report.md` |
| Missing verification | No |

## Boundary

- This readiness report writes files now: No
- This readiness report authorizes apply: No
- This readiness report approves implementation: No
- This readiness report approves release or production: No
- This readiness report installs hooks or changes CI: No
- This readiness report changes source of truth: No
- This readiness report enables high-risk actions: No

## Outcome

`READINESS_RECORDED`
