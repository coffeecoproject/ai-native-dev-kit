# Verification Runtime Lifecycle Plan

## Human Summary

IntentOS derived a bounded `LOCAL_CONTROLLED` lifecycle. Codex selected the technical commands and isolation details; this plan does not authorize production or external effects.

## Task And Runtime Binding

- Task ref: `task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf`
- Runtime Plan: `artifact:verification-runtime-plans/116-new-workflow-item-modularity.md`
- Runtime Plan digest: `sha256:0cb43b70396d7c1df30def2740763ab763825520c02cd8033b328e9522200150`
- Run ID: `vrun-116-new-workflow-item-modularity-r13`
- Declaration: `RECORDED`

## Execution Actions

| Action | Phase | Kind | Exact argv |
|---|---|---|---|
| `self-runtime-service` | `START_SERVICE` | `SERVICE` | `node scripts/verification-runtime-self-service.mjs service` |
| `self-runtime-negative` | `VERIFY` | `PROBE` | `node scripts/verification-runtime-self-service.mjs negative` |
| `self-runtime-positive` | `VERIFY` | `PROBE` | `node scripts/verification-runtime-self-service.mjs positive` |
| `self-current-candidate-verification` | `VERIFY` | `COMMAND` | `npm run verify:pre-runtime` |
| `self-current-obligation-evidence` | `VERIFY` | `COMMAND` | `node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs` |
| `self-current-runtime-behavior` | `VERIFY` | `COMMAND` | `node --test tests/113-runtime-behavior-evidence.test.mjs` |

## Owned Resources

| Resource | Type | Run-relative path | Cleanup |
|---|---|---|---|
| `cache` | `CACHE_NAMESPACE` | `resources/cache` | `REMOVE_OWNED_PATH` |
| `context` | `SESSION_NAMESPACE` | `resources/context` | `REMOVE_OWNED_PATH` |
| `data` | `FILE_NAMESPACE` | `resources/data` | `REMOVE_OWNED_PATH` |
| `files` | `FILE_NAMESPACE` | `resources/files` | `REMOVE_OWNED_PATH` |

## Environment And Cleanup Policy

- Environment inheritance: `MINIMAL_ALLOWLIST`
- Owner token: `CHILD_MEMORY_ONLY`
- Run workspace: `.intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13`
- Broad cleanup: `No`

## Boundaries

This plan uses no shell, permits no external or production effect, stores no raw owner token, and does not approve completion or release.

## Evidence Authority

Project, task, Runtime Plan, lifecycle declaration, and current source revision are bound in the structured evidence below.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.103.0",
  "artifact_type": "verification_runtime_lifecycle_plan",
  "lifecycle_plan_ref": "verification-runtime-lifecycle-plans/116-new-workflow-item-modularity.md",
  "lifecycle_plan_digest": "sha256:75bd9bb48b1890ca0c54aa7b208cf83271e6000f5a1b1bde99e7c5a20c5301ad",
  "run_id": "vrun-116-new-workflow-item-modularity-r13",
  "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
  "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e",
  "task_tier": "HIGH",
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "runtime_plan_ref": "artifact:verification-runtime-plans/116-new-workflow-item-modularity.md",
  "runtime_plan_digest": "sha256:0cb43b70396d7c1df30def2740763ab763825520c02cd8033b328e9522200150",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "adapter_kind": "LOCAL_PROCESS",
  "declaration_source": {
    "status": "RECORDED",
    "ref": "file:.intentos/verification-runtime-lifecycle.json",
    "digest": "sha256:a79ce56374ba9b0998508feaa96df12d7d100f580837d759ab746e2e2b967051",
    "current_project_match": "Yes"
  },
  "execution_mode": "LOCAL_CONTROLLED",
  "actions": [
    {
      "id": "self-runtime-service",
      "phase": "START_SERVICE",
      "kind": "SERVICE",
      "argv": [
        "node",
        "scripts/verification-runtime-self-service.mjs",
        "service"
      ],
      "cwd": ".",
      "timeout_ms": 15000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-service.log",
      "obligation_ids": [],
      "positive_path": "No",
      "negative_path": "No",
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "external_effect": "No",
      "depends_on": []
    },
    {
      "id": "self-runtime-negative",
      "phase": "VERIFY",
      "kind": "PROBE",
      "argv": [
        "node",
        "scripts/verification-runtime-self-service.mjs",
        "negative"
      ],
      "cwd": ".",
      "timeout_ms": 15000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log",
      "obligation_ids": [],
      "positive_path": "No",
      "negative_path": "Yes",
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "external_effect": "No",
      "depends_on": [
        "self-runtime-service"
      ]
    },
    {
      "id": "self-runtime-positive",
      "phase": "VERIFY",
      "kind": "PROBE",
      "argv": [
        "node",
        "scripts/verification-runtime-self-service.mjs",
        "positive"
      ],
      "cwd": ".",
      "timeout_ms": 15000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log",
      "obligation_ids": [],
      "positive_path": "Yes",
      "negative_path": "No",
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "external_effect": "No",
      "depends_on": [
        "self-runtime-service"
      ]
    },
    {
      "id": "self-current-candidate-verification",
      "phase": "VERIFY",
      "kind": "COMMAND",
      "argv": [
        "npm",
        "run",
        "verify:pre-runtime"
      ],
      "cwd": ".",
      "timeout_ms": 1800000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log",
      "obligation_ids": [],
      "positive_path": "Yes",
      "negative_path": "Yes",
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "external_effect": "No",
      "depends_on": [
        "self-runtime-positive",
        "self-runtime-negative"
      ]
    },
    {
      "id": "self-current-obligation-evidence",
      "phase": "VERIFY",
      "kind": "COMMAND",
      "argv": [
        "node",
        "--test",
        "tests/new-workflow-item-characterization.test.mjs",
        "tests/116-new-workflow-item-governance-obligations.test.mjs"
      ],
      "cwd": ".",
      "timeout_ms": 1800000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "obligation_ids": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-3dba46f4-expected",
        "verify:universe-3dba46f4-negative",
        "verify:universe-540374ea-expected",
        "verify:universe-540374ea-negative",
        "verify:universe-56d2048a-expected",
        "verify:universe-56d2048a-negative",
        "verify:universe-6819b2ed-expected",
        "verify:universe-6819b2ed-negative",
        "verify:universe-73185d04-expected",
        "verify:universe-73185d04-negative",
        "verify:universe-b8dd1d9c-expected",
        "verify:universe-b8dd1d9c-negative",
        "verify:universe-f7a09c69-expected",
        "verify:universe-f7a09c69-negative",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "positive_path": "Yes",
      "negative_path": "Yes",
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "external_effect": "No",
      "depends_on": [
        "self-current-candidate-verification"
      ]
    },
    {
      "id": "self-current-runtime-behavior",
      "phase": "VERIFY",
      "kind": "COMMAND",
      "argv": [
        "node",
        "--test",
        "tests/113-runtime-behavior-evidence.test.mjs"
      ],
      "cwd": ".",
      "timeout_ms": 60000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
      "obligation_ids": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "positive_path": "Yes",
      "negative_path": "Yes",
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "external_effect": "No",
      "depends_on": [
        "self-current-obligation-evidence"
      ]
    }
  ],
  "resources": [
    {
      "resource_id": "cache",
      "resource_type": "CACHE_NAMESPACE",
      "relative_path": "resources/cache",
      "environment_name": "TEST_CACHE_PATH",
      "created_by_action": "executor:preflight",
      "cleanup_strategy": "REMOVE_OWNED_PATH",
      "production_instance": "No",
      "shared_resource": "No",
      "owner_marker_required": "Yes",
      "role": "isolated-cache",
      "migration_revision": "not-applicable"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION_NAMESPACE",
      "relative_path": "resources/context",
      "environment_name": "TEST_CONTEXT_PATH",
      "created_by_action": "executor:preflight",
      "cleanup_strategy": "REMOVE_OWNED_PATH",
      "production_instance": "No",
      "shared_resource": "No",
      "owner_marker_required": "Yes",
      "role": "isolated-user-context",
      "migration_revision": "not-applicable"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE_NAMESPACE",
      "relative_path": "resources/data",
      "environment_name": "TEST_DATA_PATH",
      "created_by_action": "executor:preflight",
      "cleanup_strategy": "REMOVE_OWNED_PATH",
      "production_instance": "No",
      "shared_resource": "No",
      "owner_marker_required": "Yes",
      "role": "run-owned-test-data",
      "migration_revision": "not-applicable"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE_NAMESPACE",
      "relative_path": "resources/files",
      "environment_name": "TEST_FILES_PATH",
      "created_by_action": "executor:preflight",
      "cleanup_strategy": "REMOVE_OWNED_PATH",
      "production_instance": "No",
      "shared_resource": "No",
      "owner_marker_required": "Yes",
      "role": "run-evidence",
      "migration_revision": "not-applicable"
    }
  ],
  "environment_policy": {
    "inherit_mode": "MINIMAL_ALLOWLIST",
    "allowed_inherited_names": [
      "PATH",
      "LANG",
      "LC_ALL",
      "CI",
      "TERM"
    ],
    "blocked_name_patterns": [
      "SECRET",
      "TOKEN",
      "PASSWORD",
      "CREDENTIAL",
      "AUTH",
      "COOKIE",
      "DATABASE_URL",
      "REDIS_URL",
      "PRODUCTION"
    ],
    "inject_run_id": "Yes",
    "inject_owner_token": "CHILD_MEMORY_ONLY",
    "stores_raw_secrets": "No"
  },
  "run_workspace": ".intentos/runtime-runs/vrun-116-new-workflow-item-modularity-r13",
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:3097447006da6b73a1d03ff85c92856d4c68b2e0d488bc07d30ad3f208ed9807"
    },
    "task": {
      "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
      "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e"
    },
    "sources": [
      {
        "ref": "artifact:verification-runtime-plans/116-new-workflow-item-modularity.md",
        "relative_path": "verification-runtime-plans/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:4818169967b381c231c378501e2125191e16324366dbcd7236e80208b7c0401e"
      },
      {
        "ref": "file:.intentos/verification-runtime-lifecycle.json",
        "relative_path": ".intentos/verification-runtime-lifecycle.json",
        "raw_file_digest": "sha256:a79ce56374ba9b0998508feaa96df12d7d100f580837d759ab746e2e2b967051"
      }
    ]
  },
  "boundaries": {
    "uses_shell": "No",
    "permits_external_effect": "No",
    "permits_production": "No",
    "permits_broad_cleanup": "No",
    "stores_raw_owner_token": "No",
    "asks_user_for_technical_choice": "No",
    "approves_completion_or_release": "No"
  },
  "outcome": "LIFECYCLE_PLAN_READY",
  "next_step": "Run the bounded local lifecycle executor; it must preserve the journal and cleanup proof."
}
```

## Outcome

LIFECYCLE_PLAN_READY

## Next Step

Run the bounded local lifecycle executor; it must preserve the journal and cleanup proof.
