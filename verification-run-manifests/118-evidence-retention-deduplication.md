# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-118-evidence-retention-deduplication-r3`
- Runtime Plan: `artifact:verification-runtime-plans/118-evidence-retention-deduplication.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/118-evidence-retention-deduplication.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:6f2712d848daec60f6eb2b18e428e8c747e9d31bb2446a3b53115c74d70ad1fd`

## Run Window

- Started: `2026-07-23T14:09:12.029Z`
- Finished: `2026-07-23T14:18:08.750Z`
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
  "run_manifest_ref": "verification-run-manifests/118-evidence-retention-deduplication.md",
  "run_manifest_digest": "sha256:975b22a586d9f6512452c8b1a4bbb54afb0baaf7392cf3ac8e77427ec79863aa",
  "run_id": "vrun-118-evidence-retention-deduplication-r3",
  "owner_token_digest": "sha256:8dd57797fb36ee4be6fd131abd968f8080c11529548bb376ea691fca4685a251",
  "runtime_plan_ref": "artifact:verification-runtime-plans/118-evidence-retention-deduplication.md",
  "runtime_plan_digest": "sha256:837fd0c0cb2419f3c88758ab581cacd8cc6fb0b0003660258814614d3804ec2d",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/118-evidence-retention-deduplication.md",
  "lifecycle_plan_digest": "sha256:8271acb2c8adec9bf543746f1210c5c490ec3c62efbf57b4067dcb5b8aee221f",
  "lifecycle_journal_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:f0ba602d83b3418f3465f98da461684aa04dc8d2d42a8ef08f64d638bcf6600d",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "verification_plan_ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
  "verification_plan_digest": "sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727",
  "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
  "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652",
  "task_tier": "HIGH",
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
    "revision": "sha256:6f2712d848daec60f6eb2b18e428e8c747e9d31bb2446a3b53115c74d70ad1fd",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-23T14:09:12.029Z",
    "finished_at": "2026-07-23T14:18:08.750Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "all 6 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "current project identity matches sha256:6f2712d848daec60f6eb2b18e428e8c747e9d31bb2446a3b53115c74d70ad1fd"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "process inventory probe is unavailable on this executor; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "all 4 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
      "reason": "no run-scoped session namespace existed before execution (1 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
      "evidence_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7",
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
          "value_digest": "sha256:20aca5e91310c4b4a76096248e13d4176f880905bc32106b09c0cae631b8cb65",
          "redacted_display": "pid:<recorded>"
        },
        {
          "name": "argv",
          "value_digest": "sha256:0289833e7c7822153e6c4a35dbc6a130159ed8174544812714d535e8ee87c0af",
          "redacted_display": "argv:<recorded>"
        },
        {
          "name": "cwd",
          "value_digest": "sha256:0e773f09985857a9d569a3d20322c5d727ce78743da5211788100e275b72dba7",
          "redacted_display": "cwd:<recorded>"
        }
      ],
      "started_at": "2026-07-23T14:09:12.041Z",
      "owned_by_run": "Yes",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-service.log",
      "evidence_digest": "sha256:f531c072a6838d0cdcd2c17b274a7adb583e362b06cb237f3a75f413c5dd109d"
    }
  ],
  "data_resources": [
    {
      "id": "cache",
      "resource_type": "CACHE",
      "instance_fingerprint": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "namespace_digest": "sha256:cda45e1e32607a937ff4c24a2f39d7a0789468ee57e422553e8d5acacbdd868c",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "data",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "namespace_digest": "sha256:590e5e7fd441f23e18b4d346d311e2d734d7f7c0217eebaaa339696d79f4e926",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "files",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "namespace_digest": "sha256:80d4bbe3955851fb3f3be79a9f0b271c739e1576703606f6980457b07e9d96b8",
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
      "namespace_digest": "sha256:bbf636f9ea496e06e4b8935e8b1baceb2dcad43a00809423843cc4b182eb92b8",
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
      "owner_marker_digest": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/resources.txt",
      "evidence_digest": "sha256:86a3461bb8521b408c15896146c7938a6d451ee9bfdd0ea389ce0c8426666ad0"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/resources.txt",
      "evidence_digest": "sha256:86a3461bb8521b408c15896146c7938a6d451ee9bfdd0ea389ce0c8426666ad0"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/resources.txt",
      "evidence_digest": "sha256:86a3461bb8521b408c15896146c7938a6d451ee9bfdd0ea389ce0c8426666ad0"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/resources.txt",
      "evidence_digest": "sha256:86a3461bb8521b408c15896146c7938a6d451ee9bfdd0ea389ce0c8426666ad0"
    },
    {
      "resource_id": "service:self-runtime-service",
      "resource_type": "PROCESS",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c6c08dc1bb7b5d30b887e42194217f78696689f8259ceea8a71818cc3adeec1a",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/resources.txt",
      "evidence_digest": "sha256:86a3461bb8521b408c15896146c7938a6d451ee9bfdd0ea389ce0c8426666ad0"
    }
  ],
  "verification_executions": [
    {
      "id": "self-runtime-negative",
      "result": "PASSED",
      "command_digest": "sha256:065f3cb043f7f0ac45feb9b3cfc86fb4d745f4e74d0ba3dc60855433fe721a1d",
      "started_at": "2026-07-23T14:09:13.043Z",
      "finished_at": "2026-07-23T14:09:13.112Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-negative.log",
      "output_digest": "sha256:fcdbbb4e1b81de2d9f4a695dfe3521aa4cc0bbe09df3f8876b75117480df5c7d"
    },
    {
      "id": "self-runtime-positive",
      "result": "PASSED",
      "command_digest": "sha256:b2f85ec5c19a3d2fe1f8a8159a89899854aed5901bc877980b2be88e3d36bc60",
      "started_at": "2026-07-23T14:09:13.113Z",
      "finished_at": "2026-07-23T14:09:13.177Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-positive.log",
      "output_digest": "sha256:b94c2fcfd61975f79536a5c335665c2de44c0318422760913a8a006939e35164"
    },
    {
      "id": "self-current-candidate-verification",
      "result": "PASSED",
      "command_digest": "sha256:b27c49ad15d727673a6e6628d6420d1c174b1f54586726229bac26d04f068b6d",
      "started_at": "2026-07-23T14:09:13.178Z",
      "finished_at": "2026-07-23T14:17:56.315Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-candidate-verification.log",
      "output_digest": "sha256:051e8340f8435ec56fc2bdffdf2c1aad7dcba02bf087126a2be1e4cab32e0493"
    },
    {
      "id": "self-current-obligation-evidence",
      "result": "PASSED",
      "command_digest": "sha256:7419035cb2d6c002a5db70455b3cf0e6cb472ce236e85964d372ecc2c3e17d7d",
      "started_at": "2026-07-23T14:17:56.317Z",
      "finished_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-2020517d-expected",
        "verify:universe-2020517d-negative",
        "verify:universe-2118bb89-expected",
        "verify:universe-2118bb89-negative",
        "verify:universe-4193ff31-expected",
        "verify:universe-4193ff31-negative",
        "verify:universe-8140bff0-expected",
        "verify:universe-8140bff0-negative",
        "verify:universe-93e4686c-expected",
        "verify:universe-93e4686c-negative",
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
      "output_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134"
    },
    {
      "id": "self-current-runtime-behavior",
      "result": "PASSED",
      "command_digest": "sha256:d0980b0c5c04598799030b48a155f8cb144d4759354e17fc5ac4feca0462d30f",
      "started_at": "2026-07-23T14:18:07.415Z",
      "finished_at": "2026-07-23T14:18:07.496Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
      "output_digest": "sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:7eef7ae583aebfa3153286767699b4754e646efa1dcc94f1f6a218e99fb63569",
    "after_evidence_ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:a37c5e08b9ccc5207f4abd8ff7710c1e3e785e06d40d021d0cde437ddbf0bb13"
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
      "revision": "sha256:6f2712d848daec60f6eb2b18e428e8c747e9d31bb2446a3b53115c74d70ad1fd"
    },
    "task": {
      "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
      "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652"
    },
    "sources": [
      {
        "ref": "artifact:verification-runtime-plans/118-evidence-retention-deduplication.md",
        "relative_path": "verification-runtime-plans/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:9088a0430beb8d3a4ed27cb3f9a38f471972ae5365a3be100b452c143e6381d9"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/118-evidence-retention-deduplication.md",
        "relative_path": "verification-runtime-lifecycle-plans/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:aa8c1e5e256be11015b2254ab608909bc2386ad02c608bd11c65a2b81553b117"
      },
      {
        "ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
        "relative_path": "verification-plans/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:d29e767295f6fa2f455b1b3cc7bdce7404c59f0ba2be7687580aba342cb59ba7"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/preflight.txt",
        "raw_file_digest": "sha256:75eb68bc84352dd48feeb9bbca50524240cfd1563b4cf27beb32ca35f58684e7"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/resources.txt",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/resources.txt",
        "raw_file_digest": "sha256:86a3461bb8521b408c15896146c7938a6d451ee9bfdd0ea389ce0c8426666ad0"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/cleanup-before.txt",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:7eef7ae583aebfa3153286767699b4754e646efa1dcc94f1f6a218e99fb63569"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/cleanup-after.txt",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:a37c5e08b9ccc5207f4abd8ff7710c1e3e785e06d40d021d0cde437ddbf0bb13"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/lifecycle-journal.jsonl",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:f0ba602d83b3418f3465f98da461684aa04dc8d2d42a8ef08f64d638bcf6600d"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-service.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-service.log",
        "raw_file_digest": "sha256:f531c072a6838d0cdcd2c17b274a7adb583e362b06cb237f3a75f413c5dd109d"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:fcdbbb4e1b81de2d9f4a695dfe3521aa4cc0bbe09df3f8876b75117480df5c7d"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:b94c2fcfd61975f79536a5c335665c2de44c0318422760913a8a006939e35164"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:051e8340f8435ec56fc2bdffdf2c1aad7dcba02bf087126a2be1e4cab32e0493"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e"
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
