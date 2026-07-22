# Verification Runtime Lifecycle Plan

## Human Summary

IntentOS derived a bounded `LOCAL_CONTROLLED` lifecycle. Codex selected the technical commands and isolation details; this plan does not authorize production or external effects.

## Task And Runtime Binding

- Task ref: `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739`
- Runtime Plan: `artifact:verification-runtime-plans/114-work-queue-state-transition-governance.md`
- Runtime Plan digest: `sha256:72282748ab322b2e537ca4a7f168ce7e2fcc075dd0a43f9d0be19112bb424810`
- Run ID: `vrun-114-work-queue-transition-r4`
- Declaration: `RECORDED`

## Execution Actions

| Action | Phase | Kind | Exact argv |
|---|---|---|---|
| `self-runtime-service` | `START_SERVICE` | `SERVICE` | `node scripts/verification-runtime-self-service.mjs service` |
| `self-runtime-negative` | `VERIFY` | `PROBE` | `node scripts/verification-runtime-self-service.mjs negative` |
| `self-runtime-positive` | `VERIFY` | `PROBE` | `node scripts/verification-runtime-self-service.mjs positive` |
| `self-current-candidate-verification` | `VERIFY` | `COMMAND` | `npm run verify:pre-runtime` |
| `self-current-obligation-evidence` | `VERIFY` | `COMMAND` | `node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs` |
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
- Run workspace: `.intentos/runtime-runs/vrun-114-work-queue-transition-r4`
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
  "lifecycle_plan_ref": "verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
  "lifecycle_plan_digest": "sha256:3cba47bfff828f6e7378e26bfa4251c899c736bcbd2b11ada4e854aacdf4911d",
  "run_id": "vrun-114-work-queue-transition-r4",
  "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
  "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121",
  "task_tier": "HIGH",
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "runtime_plan_ref": "artifact:verification-runtime-plans/114-work-queue-state-transition-governance.md",
  "runtime_plan_digest": "sha256:72282748ab322b2e537ca4a7f168ce7e2fcc075dd0a43f9d0be19112bb424810",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "adapter_kind": "LOCAL_PROCESS",
  "declaration_source": {
    "status": "RECORDED",
    "ref": "file:.intentos/verification-runtime-lifecycle.json",
    "digest": "sha256:5cb355bd292a3fef256b7219232241da46c2fd3db7f9b314538ffb2b4035cc10",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-service.log",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "obligation_ids": [
        "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:data-model-data-model-check-data-model-historical-records-migrat",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-081a836f-expected",
        "verify:universe-081a836f-negative",
        "verify:universe-08850f5d-expected",
        "verify:universe-08850f5d-negative",
        "verify:universe-1abf3bf4-expected",
        "verify:universe-1abf3bf4-negative",
        "verify:universe-77a8f448-expected",
        "verify:universe-77a8f448-negative",
        "verify:universe-d0e72ece-expected",
        "verify:universe-d0e72ece-negative",
        "verify:universe-d630cfd9-expected",
        "verify:universe-d630cfd9-negative",
        "verify:universe-d896a585-expected",
        "verify:universe-d896a585-negative",
        "verify:universe-e4141c50-expected",
        "verify:universe-e4141c50-negative",
        "verify:universe-f9542c4e-expected",
        "verify:universe-f9542c4e-negative",
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
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
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
  "run_workspace": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4",
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a"
    },
    "task": {
      "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121"
    },
    "sources": [
      {
        "ref": "artifact:verification-runtime-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-runtime-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:a76d3a0400f9b27374b0af25d9b78b7d812edc13d66469432a147bb0c19f9bf7"
      },
      {
        "ref": "file:.intentos/verification-runtime-lifecycle.json",
        "relative_path": ".intentos/verification-runtime-lifecycle.json",
        "raw_file_digest": "sha256:5cb355bd292a3fef256b7219232241da46c2fd3db7f9b314538ffb2b4035cc10"
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
