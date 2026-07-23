# Verification Runtime Plan

## Human Summary

IntentOS classified this task as `HIGH` and selected `LOCAL_PROCESS` without asking the user to make technical choices. The required runtime trust level is `ISOLATED_RUNTIME`.

## Task And Source Binding

- Task ref: `task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f`
- Intent digest: `sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652`
- Task tier: `HIGH`
- Task Governance ref: `artifact:task-governance-reports/118-evidence-retention-deduplication.md`
- Verification Plan ref: `artifact:verification-plans/118-evidence-retention-deduplication.md`
- Verification Plan digest: `sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727`

## Runtime Trust Requirement

- Required level: `ISOLATED_RUNTIME`
- Selected adapter: `LOCAL_PROCESS`
- Selection reason: Project-owned adapter declaration selects LOCAL_PROCESS.
- Adapter contract: `sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7`
- Adapter lifecycle: `OBSERVE_AND_PLAN_ONLY`
- Required identity fields: `pid`, `argv`, `cwd`
- Ready for runtime execution: Yes

### Adapter Discovery Evidence

| Signal | Source | Digest |
|---|---|---|
| `PACKAGE_JSON_DECLARATION` | `file:package.json` | `sha256:c9cd92ea570e8827bbd73015740f250efc4720887a3c1c37dba227e5a737f3cd` |

## Required Controls

| Control | Requirement | Reason |
|---|---|---|
| `SOURCE_IDENTITY` | `REQUIRED` | SOURCE_IDENTITY is required for HIGH runtime trust. |
| `OUTPUT_BINDING` | `REQUIRED` | OUTPUT_BINDING is required for HIGH runtime trust. |
| `SERVICE_IDENTITY` | `REQUIRED` | SERVICE_IDENTITY is required for HIGH runtime trust. |
| `DATA_ISOLATION` | `REQUIRED` | DATA_ISOLATION is required for HIGH runtime trust. |
| `SESSION_ISOLATION` | `REQUIRED` | SESSION_ISOLATION is required for HIGH runtime trust. |
| `RESOURCE_OWNERSHIP` | `REQUIRED` | RESOURCE_OWNERSHIP is required for HIGH runtime trust. |
| `CLEANUP_PROOF` | `REQUIRED` | CLEANUP_PROOF is required for HIGH runtime trust. |
| `POSITIVE_NEGATIVE_PATHS` | `REQUIRED` | POSITIVE_NEGATIVE_PATHS is required for HIGH runtime trust. |

## Environment Preflight

| Probe | Required | Expected Result | Reason |
|---|---|---|---|
| `SOURCE_IDENTITY` | `Yes` | `PASS` | SOURCE_IDENTITY must be observed before this task tier can count runtime evidence. |
| `WORKTREE_STATE` | `Yes` | `PASS` | WORKTREE_STATE must be observed before this task tier can count runtime evidence. |
| `OLD_PROCESS` | `Yes` | `PASS` | OLD_PROCESS must be observed before this task tier can count runtime evidence. |
| `PORT_CONFLICT` | `Yes` | `PASS` | PORT_CONFLICT must be observed before this task tier can count runtime evidence. |
| `SENSITIVE_ENVIRONMENT` | `Yes` | `PASS` | SENSITIVE_ENVIRONMENT must be observed before this task tier can count runtime evidence. |
| `DATA_IDENTITY` | `Yes` | `PASS` | DATA_IDENTITY must be observed before this task tier can count runtime evidence. |
| `SESSION_RESIDUE` | `Yes` | `PASS` | SESSION_RESIDUE must be observed before this task tier can count runtime evidence. |
| `PRODUCTION_RESOURCE_GUARD` | `Yes` | `PASS` | PRODUCTION_RESOURCE_GUARD must be observed before this task tier can count runtime evidence. |

## Resource Isolation Plan

| Resource | Isolation Strategy | Production Allowed | Ownership Required | Reason |
|---|---|---|---|---|
| `SERVICE` | `RUN_SCOPED_INSTANCE` | `No` | `Yes` | The intended service or build instance must be attributable to this run. |
| `DATABASE` | `RUN_SCOPED_NAMESPACE` | `No` | `Yes` | DATABASE must use run-scoped non-production isolation. |
| `CACHE` | `RUN_SCOPED_NAMESPACE` | `No` | `Yes` | CACHE must use run-scoped non-production isolation. |
| `SESSION` | `RUN_SCOPED_NAMESPACE` | `No` | `Yes` | SESSION must use run-scoped non-production isolation. |

## Boundaries

- This plan starts services: No
- This plan executes tests: No
- This plan creates or deletes resources: No
- This plan changes production: No
- This plan asks the user for technical choices: No
- This plan approves implementation, release, or production: No
- This plan proves real-environment behavior: No

## Evidence Authority

Project, task, intent, and file-backed sources are bound in the structured record.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.102.0",
  "artifact_type": "verification_runtime_plan",
  "runtime_plan_ref": "verification-runtime-plans/118-evidence-retention-deduplication.md",
  "runtime_plan_digest": "sha256:837fd0c0cb2419f3c88758ab581cacd8cc6fb0b0003660258814614d3804ec2d",
  "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
  "intent": "establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence",
  "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652",
  "task_tier": "HIGH",
  "task_governance_source": {
    "status": "RECORDED",
    "ref": "artifact:task-governance-reports/118-evidence-retention-deduplication.md",
    "digest": "sha256:3d759ef3304acccf870f88cc04ab50b0e0b1f6a1251504623197029de117ee6a",
    "tier": "HIGH",
    "current_task_match": "Yes"
  },
  "verification_plan_source": {
    "status": "RECORDED",
    "ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
    "digest": "sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727",
    "state": "VERIFICATION_PLAN_READY",
    "current_task_match": "Yes"
  },
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "adapter_selection": {
    "status": "SELECTED",
    "adapter_kind": "LOCAL_PROCESS",
    "selected_by": "CODEX",
    "reason": "Project-owned adapter declaration selects LOCAL_PROCESS.",
    "user_selection_required": "No",
    "contract_version": "1.102.0",
    "contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
    "discovery_confidence": "DECLARED",
    "discovery_sources": [
      {
        "signal": "PACKAGE_JSON_DECLARATION",
        "ref": "file:package.json",
        "digest": "sha256:c9cd92ea570e8827bbd73015740f250efc4720887a3c1c37dba227e5a737f3cd"
      }
    ],
    "alternative_adapters": [],
    "supported_trust_levels": [
      "TARGETED_SERVICE_IDENTITY",
      "ISOLATED_RUNTIME"
    ],
    "required_identity_fields": [
      "pid",
      "argv",
      "cwd"
    ],
    "adapter_preflight_probes": [
      "PROCESS_IDENTITY",
      "PORT_OWNERSHIP",
      "WORKING_DIRECTORY"
    ],
    "managed_resource_types": [
      "PROCESS",
      "PORT"
    ],
    "lifecycle_mode": "OBSERVE_AND_PLAN_ONLY",
    "starts_or_stops_runtime": "No",
    "creates_or_deletes_resources": "No"
  },
  "required_controls": [
    {
      "control": "SOURCE_IDENTITY",
      "requirement": "REQUIRED",
      "reason": "SOURCE_IDENTITY is required for HIGH runtime trust."
    },
    {
      "control": "OUTPUT_BINDING",
      "requirement": "REQUIRED",
      "reason": "OUTPUT_BINDING is required for HIGH runtime trust."
    },
    {
      "control": "SERVICE_IDENTITY",
      "requirement": "REQUIRED",
      "reason": "SERVICE_IDENTITY is required for HIGH runtime trust."
    },
    {
      "control": "DATA_ISOLATION",
      "requirement": "REQUIRED",
      "reason": "DATA_ISOLATION is required for HIGH runtime trust."
    },
    {
      "control": "SESSION_ISOLATION",
      "requirement": "REQUIRED",
      "reason": "SESSION_ISOLATION is required for HIGH runtime trust."
    },
    {
      "control": "RESOURCE_OWNERSHIP",
      "requirement": "REQUIRED",
      "reason": "RESOURCE_OWNERSHIP is required for HIGH runtime trust."
    },
    {
      "control": "CLEANUP_PROOF",
      "requirement": "REQUIRED",
      "reason": "CLEANUP_PROOF is required for HIGH runtime trust."
    },
    {
      "control": "POSITIVE_NEGATIVE_PATHS",
      "requirement": "REQUIRED",
      "reason": "POSITIVE_NEGATIVE_PATHS is required for HIGH runtime trust."
    }
  ],
  "preflight_requirements": [
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "SOURCE_IDENTITY must be observed before this task tier can count runtime evidence."
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "WORKTREE_STATE must be observed before this task tier can count runtime evidence."
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "OLD_PROCESS must be observed before this task tier can count runtime evidence."
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "PORT_CONFLICT must be observed before this task tier can count runtime evidence."
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "SENSITIVE_ENVIRONMENT must be observed before this task tier can count runtime evidence."
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "DATA_IDENTITY must be observed before this task tier can count runtime evidence."
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "SESSION_RESIDUE must be observed before this task tier can count runtime evidence."
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "Yes",
      "expected_result": "PASS",
      "reason": "PRODUCTION_RESOURCE_GUARD must be observed before this task tier can count runtime evidence."
    }
  ],
  "resource_isolation_plan": [
    {
      "resource_type": "SERVICE",
      "requirement": "REQUIRED",
      "isolation_strategy": "RUN_SCOPED_INSTANCE",
      "production_allowed": "No",
      "ownership_required": "Yes",
      "reason": "The intended service or build instance must be attributable to this run."
    },
    {
      "resource_type": "DATABASE",
      "requirement": "REQUIRED",
      "isolation_strategy": "RUN_SCOPED_NAMESPACE",
      "production_allowed": "No",
      "ownership_required": "Yes",
      "reason": "DATABASE must use run-scoped non-production isolation."
    },
    {
      "resource_type": "CACHE",
      "requirement": "REQUIRED",
      "isolation_strategy": "RUN_SCOPED_NAMESPACE",
      "production_allowed": "No",
      "ownership_required": "Yes",
      "reason": "CACHE must use run-scoped non-production isolation."
    },
    {
      "resource_type": "SESSION",
      "requirement": "REQUIRED",
      "isolation_strategy": "RUN_SCOPED_NAMESPACE",
      "production_allowed": "No",
      "ownership_required": "Yes",
      "reason": "SESSION must use run-scoped non-production isolation."
    }
  ],
  "boundaries": {
    "starts_services": "No",
    "executes_tests": "No",
    "creates_or_deletes_resources": "No",
    "changes_production": "No",
    "asks_user_for_technical_choices": "No",
    "approves_implementation_release_or_production": "No",
    "proves_real_environment_behavior": "No"
  },
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:6f2712d848daec60f6eb2b18e428e8c747e9d31bb2446a3b53115c74d70ad1fd"
    },
    "task": {
      "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
      "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652"
    },
    "sources": [
      {
        "ref": "artifact:task-governance-reports/118-evidence-retention-deduplication.md",
        "relative_path": "task-governance-reports/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:789464dcc61bc3865a32ce19d0cf451128a68ae68e03b8fcbeb3bf63e5dfe9e4"
      },
      {
        "ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
        "relative_path": "verification-plans/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:d29e767295f6fa2f455b1b3cc7bdce7404c59f0ba2be7687580aba342cb59ba7"
      },
      {
        "ref": "file:package.json",
        "relative_path": "package.json",
        "raw_file_digest": "sha256:c9cd92ea570e8827bbd73015740f250efc4720887a3c1c37dba227e5a737f3cd"
      }
    ]
  },
  "outcome": "RUNTIME_PLAN_READY",
  "next_step": "Use a supported adapter to perform preflight and create a Verification Run Manifest."
}
```

## Outcome

`RUNTIME_PLAN_READY`

## Next Step

Use a supported adapter to perform preflight and create a Verification Run Manifest.
