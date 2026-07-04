# Adoption Assurance Report

This report is a read-only evidence-bound verification view. It does not write target files, authorize writes, approve release, or replace project-owned rules.

## Adoption Summary

| Field | Value |
| --- | --- |
| Target Project Profile | `<profile>` |
| Assurance State | `PARTIAL_ADOPTION` |
| IntentOS Operating Mode | `ACTIVE` |
| Can Claim Full Adoption | `No` |
| Can Codex Write Now | `No` |

## Assurance State

`PARTIAL_ADOPTION`

## Target Project State

Describe the target project state and whether the worktree, governance, release, and production authority surfaces are known.

## Adoption Surface Coverage

| Surface | Status | Evidence | Notes |
| --- | --- | --- | --- |
| workflow_entry | `MAPPED` | `checker:workflow-next` | IntentOS route known. |
| ai_rules_agents | `PENDING_APPLY` | `file:AGENTS.md` | Existing rules are preserved until reviewed. |
| engineering_baseline | `MAPPED` | `checker:reconcile-rules` | Existing vs IntentOS comparison recorded. |
| environment_baseline | `MAPPED` | `checker:reconcile-rules` | Existing vs IntentOS comparison recorded. |
| release_rollback | `PROJECT_OWNED` | `checker:release-plan` | Release owner remains external/project-owned. |
| ci_hooks | `PROJECT_OWNED` | `checker:convergence` | No unauthorized mutation. |
| documents | `MAPPED` | `checker:convergence` | Source-of-truth posture known. |
| work_queue | `MAPPED` | `checker:work-queue` | Current/paused/backlog behavior known. |
| ai_logs_audit | `MAPPED` | `checker:convergence` | No routine log spam. |
| risk_authority | `PROJECT_OWNED` | `checker:convergence` | Protected authority preserved. |
| apply_chain | `NOT_APPLICABLE_WITH_REASON` | `human-decision:none` | No target writes occurred. |
| simulation_task | `MISSING` | `simulation:not-run` | Simulation has not passed yet. |

## Evidence Resolution

List evidence references and whether they resolve.

## Actual Diff / File State Check

No target writes are authorized by this report.

## Existing Rule Coverage

Existing rules must be extracted and compared before full adoption can be claimed.

## Governance Convergence Coverage

Governance convergence must cover workflow, baseline, audit, release, CI/hooks, documents, work queue, AI logs, and risk authority.

## Simulation Task Result

`SIMULATION_NOT_RUN`

## Pending Human Decisions

- Confirm missing surfaces before claiming full adoption.

## Forbidden Claims

- This report writes target files: No
- This report authorizes target-file writes: No
- This report approves implementation: No
- This report approves release or production: No
- This report mutates CI or hooks: No
- This report replaces release SOP: No
- This report transfers project authority to IntentOS: No
- This report proves product correctness: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.71.0",
  "artifact_type": "adoption_assurance_report",
  "target_project_profile": "existing_project",
  "assurance_state": "PARTIAL_ADOPTION",
  "intent_os_operating_mode": "ACTIVE",
  "can_claim_full_adoption": "No",
  "can_codex_write_now": "No",
  "surfaces": [],
  "evidence_refs": [],
  "simulation": {
    "id": "simulation:not-run",
    "state": "SIMULATION_NOT_RUN",
    "task": "Add a required field validation to a non-production example flow.",
    "writes_target_files": "No",
    "route": []
  },
  "pending_decisions": [],
  "forbidden_claims": [],
  "boundary": {
    "writes_target_files": "No",
    "authorizes_target_file_writes": "No",
    "approves_implementation": "No",
    "approves_release_or_production": "No",
    "mutates_ci_or_hooks": "No",
    "replaces_release_sop": "No",
    "transfers_project_authority_to_intentos": "No",
    "proves_product_correctness": "No"
  },
  "outcome": "PARTIAL_ADOPTION"
}
```
