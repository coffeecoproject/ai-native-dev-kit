# Adoption Assurance Report

This report is a read-only evidence-bound verification view. It does not write target files, authorize writes, approve release, or replace project-owned rules.

## Adoption Summary

| Field | Value |
| --- | --- |
| Target Project Profile | `existing_governed_project` |
| Assurance State | `VERIFIED_ACTIVE` |
| IntentOS Operating Mode | `ACTIVE` |
| Can Claim Full Adoption | `Yes` |
| Can Codex Write Now | `No` |

## Assurance State

`VERIFIED_ACTIVE`

## Target Project State

| Field | Value |
| --- | --- |
| dirtyWorktree | `No` |
| governed | `Yes` |
| productionSensitive | `No` |

## Adoption Surface Coverage

| Surface | Status | Evidence | Notes |
| --- | --- | --- | --- |
| workflow_entry | `VERIFIED` | `checker:workflow-next` | IntentOS route is active without write authority. |
| ai_rules_agents | `MAPPED` | `checker:native-migration` | Existing AI rules are mapped and preserved. |
| engineering_baseline | `MAPPED` | `checker:reconcile-rules` | Engineering baseline comparison is recorded. |
| environment_baseline | `MAPPED` | `checker:reconcile-rules` | Environment baseline comparison is recorded. |
| release_rollback | `PROJECT_OWNED` | `checker:release-plan` | Release and rollback remain project-owned. |
| ci_hooks | `PROJECT_OWNED` | `checker:convergence` | CI and hooks are not mutated. |
| documents | `MAPPED` | `checker:convergence` | Source-of-truth posture is known. |
| work_queue | `MAPPED` | `checker:work-queue` | Current and paused task behavior is known. |
| ai_logs_audit | `MAPPED` | `checker:convergence` | AI logs are not routine command logs. |
| risk_authority | `PROJECT_OWNED` | `checker:native-migration` | Protected authority remains project-owned. |
| apply_chain | `NOT_APPLICABLE_WITH_REASON` | `human-decision:no-target-writes` | No target writes occurred in this assurance report. |
| simulation_task | `VERIFIED` | `simulation:sim-001` | Read-only simulation passed. |

## Evidence Resolution

- `checker:workflow-next`
- `checker:native-migration`
- `checker:reconcile-rules`
- `checker:convergence`
- `checker:release-plan`
- `checker:work-queue`
- `human-decision:no-target-writes`
- `simulation:sim-001`

## Actual Diff / File State Check

No target writes are authorized by this report.

## Existing Rule Coverage

Existing rules were extracted and compared against IntentOS expectations.

## Governance Convergence Coverage

Governance convergence covers workflow, baseline, audit, release, CI/hooks, documents, work queue, AI logs, and risk authority.

## Simulation Task Result

`SIMULATION_PASSED`

## Pending Human Decisions

- None blocking full adoption.

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
  "target_project_profile": "existing_governed_project",
  "assurance_state": "VERIFIED_ACTIVE",
  "intent_os_operating_mode": "ACTIVE",
  "can_claim_full_adoption": "Yes",
  "can_codex_write_now": "No",
  "surfaces": [
    {"surface":"workflow_entry","status":"VERIFIED","evidence":"checker:workflow-next","notes":"IntentOS route is active without write authority."},
    {"surface":"ai_rules_agents","status":"MAPPED","evidence":"checker:native-migration","notes":"Existing AI rules are mapped and preserved."},
    {"surface":"engineering_baseline","status":"MAPPED","evidence":"checker:reconcile-rules","notes":"Engineering baseline comparison is recorded."},
    {"surface":"environment_baseline","status":"MAPPED","evidence":"checker:reconcile-rules","notes":"Environment baseline comparison is recorded."},
    {"surface":"release_rollback","status":"PROJECT_OWNED","evidence":"checker:release-plan","notes":"Release and rollback remain project-owned."},
    {"surface":"ci_hooks","status":"PROJECT_OWNED","evidence":"checker:convergence","notes":"CI and hooks are not mutated."},
    {"surface":"documents","status":"MAPPED","evidence":"checker:convergence","notes":"Source-of-truth posture is known."},
    {"surface":"work_queue","status":"MAPPED","evidence":"checker:work-queue","notes":"Current and paused task behavior is known."},
    {"surface":"ai_logs_audit","status":"MAPPED","evidence":"checker:convergence","notes":"AI logs are not routine command logs."},
    {"surface":"risk_authority","status":"PROJECT_OWNED","evidence":"checker:native-migration","notes":"Protected authority remains project-owned."},
    {"surface":"apply_chain","status":"NOT_APPLICABLE_WITH_REASON","evidence":"human-decision:no-target-writes","notes":"No target writes occurred in this assurance report."},
    {"surface":"simulation_task","status":"VERIFIED","evidence":"simulation:sim-001","notes":"Read-only simulation passed."}
  ],
  "evidence_refs": ["checker:workflow-next","checker:native-migration","checker:reconcile-rules","checker:convergence","checker:release-plan","checker:work-queue","human-decision:no-target-writes","simulation:sim-001"],
  "simulation": {"id":"simulation:sim-001","state":"SIMULATION_PASSED","task":"Add a required field validation to a non-production example flow.","writes_target_files":"No","route":["ask / guide","workflow-next","work queue / current task check","change impact coverage","review surface","apply-plan if write would be needed","closure / finish decision"]},
  "pending_decisions": [],
  "forbidden_claims": ["does not write target files","does not approve release or production","does not replace release SOP"],
  "boundary": {"writes_target_files":"No","authorizes_target_file_writes":"No","approves_implementation":"No","approves_release_or_production":"No","mutates_ci_or_hooks":"No","replaces_release_sop":"No","transfers_project_authority_to_intentos":"No","proves_product_correctness":"No"},
  "outcome": "VERIFIED_ACTIVE"
}
```
