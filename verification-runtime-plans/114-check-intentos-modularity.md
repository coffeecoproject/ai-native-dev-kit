# Verification Runtime Plan

## Human Summary

IntentOS classified this task as `MEDIUM` and selected `LOCAL_PROCESS` without asking the user to make technical choices. The required runtime trust level is `TARGETED_SERVICE_IDENTITY`.

## Task And Source Binding

- Task ref: `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2`
- Intent digest: `sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9`
- Task tier: `MEDIUM`
- Task Governance ref: `artifact:task-governance-reports/114-check-intentos-modularity.md`
- Verification Plan ref: `artifact:verification-plans/114-check-intentos-modularity.md`
- Verification Plan digest: `sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f`

## Runtime Trust Requirement

- Required level: `TARGETED_SERVICE_IDENTITY`
- Selected adapter: `LOCAL_PROCESS`
- Selection reason: Project-owned adapter declaration selects LOCAL_PROCESS.
- Adapter contract: `sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7`
- Adapter lifecycle: `OBSERVE_AND_PLAN_ONLY`
- Required identity fields: `pid`, `argv`, `cwd`
- Ready for runtime execution: Yes

### Adapter Discovery Evidence

| Signal | Source | Digest |
|---|---|---|
| `PACKAGE_JSON_DECLARATION` | `file:package.json` | `sha256:e8ae0c97044bf6fa095c35a342f801d4125dc2245e808a861c41d7e8272db7f1` |

## Required Controls

| Control | Requirement | Reason |
|---|---|---|
| `SOURCE_IDENTITY` | `REQUIRED` | SOURCE_IDENTITY is required for MEDIUM runtime trust. |
| `OUTPUT_BINDING` | `REQUIRED` | OUTPUT_BINDING is required for MEDIUM runtime trust. |
| `SERVICE_IDENTITY` | `REQUIRED` | SERVICE_IDENTITY is required for MEDIUM runtime trust. |
| `DATA_ISOLATION` | `CONDITIONAL` | DATA_ISOLATION is required when the targeted behavior consumes that resource. |
| `SESSION_ISOLATION` | `CONDITIONAL` | SESSION_ISOLATION is required when the targeted behavior consumes that resource. |
| `RESOURCE_OWNERSHIP` | `REQUIRED` | RESOURCE_OWNERSHIP is required for MEDIUM runtime trust. |
| `CLEANUP_PROOF` | `REQUIRED` | CLEANUP_PROOF is required for MEDIUM runtime trust. |
| `POSITIVE_NEGATIVE_PATHS` | `REQUIRED` | POSITIVE_NEGATIVE_PATHS is required for MEDIUM runtime trust. |

## Environment Preflight

| Probe | Required | Expected Result | Reason |
|---|---|---|---|
| `SOURCE_IDENTITY` | `Yes` | `PASS` | SOURCE_IDENTITY must be observed before this task tier can count runtime evidence. |
| `WORKTREE_STATE` | `Yes` | `PASS` | WORKTREE_STATE must be observed before this task tier can count runtime evidence. |
| `OLD_PROCESS` | `Yes` | `PASS` | OLD_PROCESS must be observed before this task tier can count runtime evidence. |
| `PORT_CONFLICT` | `Yes` | `PASS` | PORT_CONFLICT must be observed before this task tier can count runtime evidence. |
| `SENSITIVE_ENVIRONMENT` | `Yes` | `PASS` | SENSITIVE_ENVIRONMENT must be observed before this task tier can count runtime evidence. |
| `DATA_IDENTITY` | `No` | `PASS` | DATA_IDENTITY is not mandatory for MEDIUM unless project facts make it relevant. |
| `SESSION_RESIDUE` | `No` | `PASS` | SESSION_RESIDUE is not mandatory for MEDIUM unless project facts make it relevant. |
| `PRODUCTION_RESOURCE_GUARD` | `No` | `PASS` | PRODUCTION_RESOURCE_GUARD is not mandatory for MEDIUM unless project facts make it relevant. |

## Resource Isolation Plan

| Resource | Isolation Strategy | Production Allowed | Ownership Required | Reason |
|---|---|---|---|---|
| `SERVICE` | `RUN_SCOPED_INSTANCE` | `No` | `Yes` | The intended service or build instance must be attributable to this run. |
| `DATABASE` | `PROJECT_NATIVE_ISOLATION` | `No` | `No` | DATABASE isolation is required when the targeted behavior consumes it. |
| `CACHE` | `PROJECT_NATIVE_ISOLATION` | `No` | `No` | CACHE isolation is required when the targeted behavior consumes it. |
| `SESSION` | `PROJECT_NATIVE_ISOLATION` | `No` | `No` | SESSION isolation is required when the targeted behavior consumes it. |

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
  "runtime_plan_ref": "verification-runtime-plans/114-check-intentos-modularity.md",
  "runtime_plan_digest": "sha256:70e35d4f3a43c1c4e8e903f004ef81bddd67d1a3e3e7c81c98a8a1a36caaacb6",
  "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
  "intent": "make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status",
  "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
  "task_tier": "MEDIUM",
  "task_governance_source": {
    "status": "RECORDED",
    "ref": "artifact:task-governance-reports/114-check-intentos-modularity.md",
    "digest": "sha256:8543bca25101ba98c2a2404136f378f7f294b5921217c2caf882679e7c0c2f51",
    "tier": "MEDIUM",
    "current_task_match": "Yes"
  },
  "verification_plan_source": {
    "status": "RECORDED",
    "ref": "artifact:verification-plans/114-check-intentos-modularity.md",
    "digest": "sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f",
    "state": "VERIFICATION_PLAN_READY",
    "current_task_match": "Yes"
  },
  "runtime_trust_level": "TARGETED_SERVICE_IDENTITY",
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
        "digest": "sha256:e8ae0c97044bf6fa095c35a342f801d4125dc2245e808a861c41d7e8272db7f1"
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
      "reason": "SOURCE_IDENTITY is required for MEDIUM runtime trust."
    },
    {
      "control": "OUTPUT_BINDING",
      "requirement": "REQUIRED",
      "reason": "OUTPUT_BINDING is required for MEDIUM runtime trust."
    },
    {
      "control": "SERVICE_IDENTITY",
      "requirement": "REQUIRED",
      "reason": "SERVICE_IDENTITY is required for MEDIUM runtime trust."
    },
    {
      "control": "DATA_ISOLATION",
      "requirement": "CONDITIONAL",
      "reason": "DATA_ISOLATION is required when the targeted behavior consumes that resource."
    },
    {
      "control": "SESSION_ISOLATION",
      "requirement": "CONDITIONAL",
      "reason": "SESSION_ISOLATION is required when the targeted behavior consumes that resource."
    },
    {
      "control": "RESOURCE_OWNERSHIP",
      "requirement": "REQUIRED",
      "reason": "RESOURCE_OWNERSHIP is required for MEDIUM runtime trust."
    },
    {
      "control": "CLEANUP_PROOF",
      "requirement": "REQUIRED",
      "reason": "CLEANUP_PROOF is required for MEDIUM runtime trust."
    },
    {
      "control": "POSITIVE_NEGATIVE_PATHS",
      "requirement": "REQUIRED",
      "reason": "POSITIVE_NEGATIVE_PATHS is required for MEDIUM runtime trust."
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
      "required": "No",
      "expected_result": "PASS",
      "reason": "DATA_IDENTITY is not mandatory for MEDIUM unless project facts make it relevant."
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "No",
      "expected_result": "PASS",
      "reason": "SESSION_RESIDUE is not mandatory for MEDIUM unless project facts make it relevant."
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "No",
      "expected_result": "PASS",
      "reason": "PRODUCTION_RESOURCE_GUARD is not mandatory for MEDIUM unless project facts make it relevant."
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
      "requirement": "CONDITIONAL",
      "isolation_strategy": "PROJECT_NATIVE_ISOLATION",
      "production_allowed": "No",
      "ownership_required": "No",
      "reason": "DATABASE isolation is required when the targeted behavior consumes it."
    },
    {
      "resource_type": "CACHE",
      "requirement": "CONDITIONAL",
      "isolation_strategy": "PROJECT_NATIVE_ISOLATION",
      "production_allowed": "No",
      "ownership_required": "No",
      "reason": "CACHE isolation is required when the targeted behavior consumes it."
    },
    {
      "resource_type": "SESSION",
      "requirement": "CONDITIONAL",
      "isolation_strategy": "PROJECT_NATIVE_ISOLATION",
      "production_allowed": "No",
      "ownership_required": "No",
      "reason": "SESSION isolation is required when the targeted behavior consumes it."
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
      "revision": "sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175"
    },
    "task": {
      "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9"
    },
    "sources": [
      {
        "ref": "artifact:task-governance-reports/114-check-intentos-modularity.md",
        "relative_path": "task-governance-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:a198a3c23f4b442cacbd2b9935359d51a3df319bfa4173ad7f99abe9b965b7bb"
      },
      {
        "ref": "artifact:verification-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:d3079dbcf49977b17d733bacac12a2bb40dc9bd004b7ac2e54f49e0a2b34cd8b"
      },
      {
        "ref": "file:package.json",
        "relative_path": "package.json",
        "raw_file_digest": "sha256:e8ae0c97044bf6fa095c35a342f801d4125dc2245e808a861c41d7e8272db7f1"
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
