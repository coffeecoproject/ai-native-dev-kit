# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-114-work-queue-transition-r4`
- Runtime Plan: `artifact:verification-runtime-plans/114-work-queue-state-transition-governance.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a`

## Run Window

- Started: `2026-07-22T05:54:44.308Z`
- Finished: `2026-07-22T06:02:07.222Z`
- State: `COMPLETED`

## Environment Preflight

All required runtime-plan probes are bound to the run-scoped preflight evidence.

## Service Instances

- `service:self-runtime-service`: `VERIFIED`

## Data And Session Isolation

Run-owned resources use isolated namespaces and never target production.

## Resource Ownership Ledger

Every material process or path is bound to this run and has an explicit cleanup disposition.

## Verification Executions

- `self-runtime-negative`: `PASSED`, exit `0`
- `self-runtime-positive`: `PASSED`, exit `0`
- `self-current-candidate-verification`: `PASSED`, exit `0`
- `self-current-obligation-evidence`: `PASSED`, exit `0`
- `self-current-runtime-behavior`: `PASSED`, exit `0`

## Cleanup Proof

- State: `VERIFIED`
- Owned resources remaining: `0`
- Unrelated resources touched: `No`

## Boundaries

No production change, broad cleanup, raw credential storage, completion approval, or release approval is authorized.

## Evidence Authority

The task, source revision, plans, journal, outputs, identity, and cleanup evidence are bound below.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.103.0",
  "artifact_type": "verification_run_manifest",
  "run_manifest_ref": "verification-run-manifests/114-work-queue-state-transition-governance.md",
  "run_manifest_digest": "sha256:3c8c4183cd5a9cf500641ea39970b92490e1ccc75388296f880f5f8e42c3a203",
  "run_id": "vrun-114-work-queue-transition-r4",
  "owner_token_digest": "sha256:f72650fbcf656535d23e2c90d225a3a2d55d64545aacb943cd2466de8c783fd7",
  "runtime_plan_ref": "artifact:verification-runtime-plans/114-work-queue-state-transition-governance.md",
  "runtime_plan_digest": "sha256:72282748ab322b2e537ca4a7f168ce7e2fcc075dd0a43f9d0be19112bb424810",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
  "lifecycle_plan_digest": "sha256:3cba47bfff828f6e7378e26bfa4251c899c736bcbd2b11ada4e854aacdf4911d",
  "lifecycle_journal_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:d7625e8ce7a948299d36210c734c0c602db6da937e5c484aadfbeb67df27dff8",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "verification_plan_ref": "artifact:verification-plans/114-work-queue-state-transition-governance.md",
  "verification_plan_digest": "sha256:862b949eee7fd3c79fa59d26761cf3949307184d3f8562c34662ac0b6c7acede",
  "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
  "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121",
  "task_tier": "HIGH",
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
    "revision": "sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-22T05:54:44.308Z",
    "finished_at": "2026-07-22T06:02:07.222Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "all 6 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "current project identity matches sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "process inventory probe is unavailable on this executor; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "all 4 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "no run-scoped session namespace existed before execution (1 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
      "evidence_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207",
      "reason": "all actions and resources are explicitly non-production and contain no external-effect command marker"
    }
  ],
  "service_instances": [
    {
      "id": "service:self-runtime-service",
      "adapter_kind": "LOCAL_PROCESS",
      "identity_status": "VERIFIED",
      "identity_fields": [
        {
          "name": "pid",
          "value_digest": "sha256:47e11a27ff5f4040c423e3d3e8cc96cec406aee52b6c5def61dc82352962aa16",
          "redacted_display": "pid:<recorded>"
        },
        {
          "name": "argv",
          "value_digest": "sha256:0289833e7c7822153e6c4a35dbc6a130159ed8174544812714d535e8ee87c0af",
          "redacted_display": "argv:<recorded>"
        },
        {
          "name": "cwd",
          "value_digest": "sha256:100e39587c5a6a6d01353f78df0f416b8f26472a1577e35bfc1a5aa1e097efc4",
          "redacted_display": "cwd:<recorded>"
        }
      ],
      "started_at": "2026-07-22T05:54:44.315Z",
      "owned_by_run": "Yes",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-service.log",
      "evidence_digest": "sha256:37c379523c0e0bb8de9c8332b9afa844e9aeb39a30b8c00e307fe0c673678fe8"
    }
  ],
  "data_resources": [
    {
      "id": "cache",
      "resource_type": "CACHE",
      "instance_fingerprint": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "namespace_digest": "sha256:9fd0175e2747209938db1d39dc5e00b2bbe46644979f1e1dbc73bab1409d5d77",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "data",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "namespace_digest": "sha256:e6107d2567135be8e88a2e9716e9c87c94978a6fdff6104d4f6c360bb0d27001",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "files",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "namespace_digest": "sha256:42503577b4e1f69a4d3da3aa777cab7fb233035bb57b654611b0165686cbca17",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    }
  ],
  "session_contexts": [
    {
      "id": "context",
      "role": "isolated-user-context",
      "namespace_digest": "sha256:3b3a775d8637c40321ef380fce6928de027d0cd192c54a3616b430a6738d5609",
      "isolation_status": "ISOLATED",
      "owned_by_run": "Yes",
      "credential_stored": "No"
    }
  ],
  "resource_ledger": [
    {
      "resource_id": "cache",
      "resource_type": "CACHE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/resources.txt",
      "evidence_digest": "sha256:6b9a0b9b413b7f9ee900a9c813f21dd275c7c48e7b875a455b0c901d236e9d09"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/resources.txt",
      "evidence_digest": "sha256:6b9a0b9b413b7f9ee900a9c813f21dd275c7c48e7b875a455b0c901d236e9d09"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/resources.txt",
      "evidence_digest": "sha256:6b9a0b9b413b7f9ee900a9c813f21dd275c7c48e7b875a455b0c901d236e9d09"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/resources.txt",
      "evidence_digest": "sha256:6b9a0b9b413b7f9ee900a9c813f21dd275c7c48e7b875a455b0c901d236e9d09"
    },
    {
      "resource_id": "service:self-runtime-service",
      "resource_type": "PROCESS",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:87cd25f43be2ddafef1f65fcb3de3a2a39f35c903dd1f020250bbb18897dcd62",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/resources.txt",
      "evidence_digest": "sha256:6b9a0b9b413b7f9ee900a9c813f21dd275c7c48e7b875a455b0c901d236e9d09"
    }
  ],
  "verification_executions": [
    {
      "id": "self-runtime-negative",
      "result": "PASSED",
      "command_digest": "sha256:065f3cb043f7f0ac45feb9b3cfc86fb4d745f4e74d0ba3dc60855433fe721a1d",
      "started_at": "2026-07-22T05:54:45.321Z",
      "finished_at": "2026-07-22T05:54:45.380Z",
      "exit_code": 0,
      "covers_obligations": [],
      "service_instance_ids": [
        "service:self-runtime-service"
      ],
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "positive_path": "No",
      "negative_path": "Yes",
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log",
      "output_digest": "sha256:f0c64473ca16c97068e2393d7f02614f1f9f2b296a302b5011292ccaf4de4727"
    },
    {
      "id": "self-runtime-positive",
      "result": "PASSED",
      "command_digest": "sha256:b2f85ec5c19a3d2fe1f8a8159a89899854aed5901bc877980b2be88e3d36bc60",
      "started_at": "2026-07-22T05:54:45.380Z",
      "finished_at": "2026-07-22T05:54:45.414Z",
      "exit_code": 0,
      "covers_obligations": [],
      "service_instance_ids": [
        "service:self-runtime-service"
      ],
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "positive_path": "Yes",
      "negative_path": "No",
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log",
      "output_digest": "sha256:83b643a0c09cea403e50a540703805d32d1e9352fa2e2f6ea4cbbfaf90aec786"
    },
    {
      "id": "self-current-candidate-verification",
      "result": "PASSED",
      "command_digest": "sha256:b27c49ad15d727673a6e6628d6420d1c174b1f54586726229bac26d04f068b6d",
      "started_at": "2026-07-22T05:54:45.414Z",
      "finished_at": "2026-07-22T06:02:05.167Z",
      "exit_code": 0,
      "covers_obligations": [],
      "service_instance_ids": [
        "service:self-runtime-service"
      ],
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "positive_path": "Yes",
      "negative_path": "Yes",
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log",
      "output_digest": "sha256:4b46e35d4e35f9efcc85fd43155b9eb94b1448257e70d07afe7510bda92301a0"
    },
    {
      "id": "self-current-obligation-evidence",
      "result": "PASSED",
      "command_digest": "sha256:5a5284d99310b8d96113242ff114c8926986294ad022e8868ac4d2aed01e3db5",
      "started_at": "2026-07-22T06:02:05.168Z",
      "finished_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "covers_obligations": [
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
      "service_instance_ids": [
        "service:self-runtime-service"
      ],
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "positive_path": "Yes",
      "negative_path": "Yes",
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a"
    },
    {
      "id": "self-current-runtime-behavior",
      "result": "PASSED",
      "command_digest": "sha256:d0980b0c5c04598799030b48a155f8cb144d4759354e17fc5ac4feca0462d30f",
      "started_at": "2026-07-22T06:02:05.893Z",
      "finished_at": "2026-07-22T06:02:05.966Z",
      "exit_code": 0,
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "service_instance_ids": [
        "service:self-runtime-service"
      ],
      "resource_ids": [
        "data",
        "cache",
        "context",
        "files"
      ],
      "positive_path": "Yes",
      "negative_path": "Yes",
      "output_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
      "output_digest": "sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:50be89bd447915171fb45fa852712855a1f6603eecd80a22e6f6b3a69df08d79",
    "after_evidence_ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:5915e0bcda6bf77cc5f1e7964fab0cadf517e51a143ea1b799d5f8a22b73afd5"
  },
  "boundaries": {
    "stores_raw_secrets": "No",
    "authorizes_broad_cleanup": "No",
    "changes_production": "No",
    "approves_implementation_release_or_production": "No",
    "proves_product_or_business_correctness": "No"
  },
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
        "ref": "artifact:verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:49d8ca9b8d7399960cd977576cfef78a713bbb978347dd27a8a1c8d1dc04cdcd"
      },
      {
        "ref": "artifact:verification-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:435ba891240927ffb7c0b85a568fd572979e0557ede54fcb8a7bcbaf3d44f6b0"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/preflight.txt",
        "raw_file_digest": "sha256:dca5ff50126e7e9d29d4baf0ef3f0e8131d8b12caa5f4eae3077c37f1f778207"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/resources.txt",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/resources.txt",
        "raw_file_digest": "sha256:6b9a0b9b413b7f9ee900a9c813f21dd275c7c48e7b875a455b0c901d236e9d09"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/cleanup-before.txt",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:50be89bd447915171fb45fa852712855a1f6603eecd80a22e6f6b3a69df08d79"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/cleanup-after.txt",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:5915e0bcda6bf77cc5f1e7964fab0cadf517e51a143ea1b799d5f8a22b73afd5"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/lifecycle-journal.jsonl",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:d7625e8ce7a948299d36210c734c0c602db6da937e5c484aadfbeb67df27dff8"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-service.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-service.log",
        "raw_file_digest": "sha256:37c379523c0e0bb8de9c8332b9afa844e9aeb39a30b8c00e307fe0c673678fe8"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:f0c64473ca16c97068e2393d7f02614f1f9f2b296a302b5011292ccaf4de4727"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:83b643a0c09cea403e50a540703805d32d1e9352fa2e2f6ea4cbbfaf90aec786"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:4b46e35d4e35f9efcc85fd43155b9eb94b1448257e70d07afe7510bda92301a0"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40"
      }
    ]
  },
  "outcome": "RUNTIME_TRUST_COMPLETE",
  "next_step": "Validate this manifest, then bind it to Test Evidence; it does not by itself approve completion."
}
```

## Outcome

RUNTIME_TRUST_COMPLETE

## Next Step

Validate this manifest, then bind it to Test Evidence; it does not by itself approve completion.
