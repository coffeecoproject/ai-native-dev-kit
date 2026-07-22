# Verification Runtime Lifecycle Plan

## Human Summary

IntentOS derived a bounded `LOCAL_CONTROLLED` lifecycle. Codex selected the technical commands and isolation details; this plan does not authorize production or external effects.

## Task And Runtime Binding

- Task ref: `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2`
- Runtime Plan: `artifact:verification-runtime-plans/114-check-intentos-modularity.md`
- Runtime Plan digest: `sha256:70e35d4f3a43c1c4e8e903f004ef81bddd67d1a3e3e7c81c98a8a1a36caaacb6`
- Run ID: `vrun-114-check-intentos-modularity-r5`
- Declaration: `RECORDED`

## Execution Actions

| Action | Phase | Kind | Exact argv |
|---|---|---|---|
| `self-runtime-service` | `START_SERVICE` | `SERVICE` | `node scripts/verification-runtime-self-service.mjs service` |
| `self-runtime-negative` | `VERIFY` | `PROBE` | `node scripts/verification-runtime-self-service.mjs negative` |
| `self-runtime-positive` | `VERIFY` | `PROBE` | `node scripts/verification-runtime-self-service.mjs positive` |
| `self-current-candidate-verification` | `VERIFY` | `COMMAND` | `npm run verify:pre-runtime` |
| `self-current-obligation-evidence` | `VERIFY` | `COMMAND` | `node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs` |
| `self-current-modularity-evidence` | `VERIFY` | `COMMAND` | `node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs` |
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
- Run workspace: `.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5`
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
  "lifecycle_plan_ref": "verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
  "lifecycle_plan_digest": "sha256:e052ba735dc42dcd5542568dc7540f6abbaa64f477d5ab982f3abe65f04e0b02",
  "run_id": "vrun-114-check-intentos-modularity-r5",
  "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
  "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
  "task_tier": "MEDIUM",
  "runtime_trust_level": "TARGETED_SERVICE_IDENTITY",
  "runtime_plan_ref": "artifact:verification-runtime-plans/114-check-intentos-modularity.md",
  "runtime_plan_digest": "sha256:70e35d4f3a43c1c4e8e903f004ef81bddd67d1a3e3e7c81c98a8a1a36caaacb6",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "adapter_kind": "LOCAL_PROCESS",
  "declaration_source": {
    "status": "RECORDED",
    "ref": "file:.intentos/verification-runtime-lifecycle.json",
    "digest": "sha256:b946bd4656e82eb69697f7c4608aba91f6d9646a6ac49be651c187355e82344a",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-service.log",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log",
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
        "--test-concurrency=1",
        "tests/114-work-queue-transition-obligation-evidence.test.mjs"
      ],
      "cwd": ".",
      "timeout_ms": 1800000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "obligation_ids": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
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
      "id": "self-current-modularity-evidence",
      "phase": "VERIFY",
      "kind": "COMMAND",
      "argv": [
        "node",
        "--test",
        "--test-concurrency=1",
        "evidence/114-check-intentos-obligation-evidence.test.mjs"
      ],
      "cwd": ".",
      "timeout_ms": 1800000,
      "environment": [],
      "output_ref": "file:.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "obligation_ids": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:universe-06f53a6d-expected",
        "verify:universe-06f53a6d-negative",
        "verify:universe-267360df-expected",
        "verify:universe-267360df-negative",
        "verify:universe-33f79b03-expected",
        "verify:universe-33f79b03-negative",
        "verify:universe-4c6a26a6-expected",
        "verify:universe-4c6a26a6-negative",
        "verify:universe-6bce3aca-expected",
        "verify:universe-6bce3aca-negative",
        "verify:universe-7e157cbe-expected",
        "verify:universe-7e157cbe-negative",
        "verify:universe-a8dfc71b-expected",
        "verify:universe-a8dfc71b-negative",
        "verify:universe-ad616f84-expected",
        "verify:universe-ad616f84-negative",
        "verify:universe-f256ee46-expected",
        "verify:universe-f256ee46-negative"
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
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
        "self-current-modularity-evidence"
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
  "run_workspace": ".intentos/runtime-runs/vrun-114-check-intentos-modularity-r5",
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
        "ref": "artifact:verification-runtime-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-runtime-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:6bb9f0859e746176d4713eae33ae8b7724609d21b1f207b1a5755820ff07eb46"
      },
      {
        "ref": "file:.intentos/verification-runtime-lifecycle.json",
        "relative_path": ".intentos/verification-runtime-lifecycle.json",
        "raw_file_digest": "sha256:b946bd4656e82eb69697f7c4608aba91f6d9646a6ac49be651c187355e82344a"
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
