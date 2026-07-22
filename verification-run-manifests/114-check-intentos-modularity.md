# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-114-check-intentos-modularity-r5`
- Runtime Plan: `artifact:verification-runtime-plans/114-check-intentos-modularity.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/114-check-intentos-modularity.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175`

## Run Window

- Started: `2026-07-22T16:41:52.969Z`
- Finished: `2026-07-22T16:50:15.967Z`
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
- `self-current-modularity-evidence`: `PASSED`, exit `0`
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
  "run_manifest_ref": "verification-run-manifests/114-check-intentos-modularity.md",
  "run_manifest_digest": "sha256:fe3db04ab5b3c06961e3283edf83baa6339ff07b718a473f7640f3ed23a28209",
  "run_id": "vrun-114-check-intentos-modularity-r5",
  "owner_token_digest": "sha256:2665d79e427a967407c39372e61d4f5d91210f52a5a704bddda73dc5a09efe56",
  "runtime_plan_ref": "artifact:verification-runtime-plans/114-check-intentos-modularity.md",
  "runtime_plan_digest": "sha256:70e35d4f3a43c1c4e8e903f004ef81bddd67d1a3e3e7c81c98a8a1a36caaacb6",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
  "lifecycle_plan_digest": "sha256:e052ba735dc42dcd5542568dc7540f6abbaa64f477d5ab982f3abe65f04e0b02",
  "lifecycle_journal_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:68695ca3b148dec6ad14f7beadb99961c0db2bd88342497b2a00cbd0a652672a",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "verification_plan_ref": "artifact:verification-plans/114-check-intentos-modularity.md",
  "verification_plan_digest": "sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f",
  "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
  "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
  "task_tier": "MEDIUM",
  "runtime_trust_level": "TARGETED_SERVICE_IDENTITY",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
    "revision": "sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-22T16:41:52.969Z",
    "finished_at": "2026-07-22T16:50:15.967Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "all 7 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "current project identity matches sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "process inventory probe is unavailable on this executor; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "all 4 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
      "reason": "no run-scoped session namespace existed before execution (1 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
      "evidence_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84",
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
          "value_digest": "sha256:deb2383b67bf5a546f8c02db22972e48f643088cde8ed41c77713e278bd63970",
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
      "started_at": "2026-07-22T16:41:52.987Z",
      "owned_by_run": "Yes",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-service.log",
      "evidence_digest": "sha256:fb01d3ae233106f5484c588727985c25551ce13cd100945f558501a3f891f535"
    }
  ],
  "data_resources": [
    {
      "id": "cache",
      "resource_type": "CACHE",
      "instance_fingerprint": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "namespace_digest": "sha256:2b1a6e7b109d184e26a80609b60b5f9e5bd0f81e408608dd0fc54ee15e5f8bef",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "data",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "namespace_digest": "sha256:4af6dbb85ffb87d5856745925a10d3f11fd97f2e13f6b4492ebe6692710c1132",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "files",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "namespace_digest": "sha256:c14a6c20578aa0b6669c4a776c739afd7e5a49bb31b20fde82e616ef6d92deb9",
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
      "namespace_digest": "sha256:132f80cb306cdee5abde9cddb7d214b73c15ac8e3d808da975d102e0fc19537d",
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
      "owner_marker_digest": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/resources.txt",
      "evidence_digest": "sha256:40c04bf4b97a81c122fb83e841e2428d1b8509506ed59c621d187a8bdafcd745"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/resources.txt",
      "evidence_digest": "sha256:40c04bf4b97a81c122fb83e841e2428d1b8509506ed59c621d187a8bdafcd745"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/resources.txt",
      "evidence_digest": "sha256:40c04bf4b97a81c122fb83e841e2428d1b8509506ed59c621d187a8bdafcd745"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/resources.txt",
      "evidence_digest": "sha256:40c04bf4b97a81c122fb83e841e2428d1b8509506ed59c621d187a8bdafcd745"
    },
    {
      "resource_id": "service:self-runtime-service",
      "resource_type": "PROCESS",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:c0bf865b47a26be6f9e15e8b1c481d57030f91e1c4d2a81df4b05233bf51a005",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/resources.txt",
      "evidence_digest": "sha256:40c04bf4b97a81c122fb83e841e2428d1b8509506ed59c621d187a8bdafcd745"
    }
  ],
  "verification_executions": [
    {
      "id": "self-runtime-negative",
      "result": "PASSED",
      "command_digest": "sha256:065f3cb043f7f0ac45feb9b3cfc86fb4d745f4e74d0ba3dc60855433fe721a1d",
      "started_at": "2026-07-22T16:41:53.990Z",
      "finished_at": "2026-07-22T16:41:54.036Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log",
      "output_digest": "sha256:2decd2154843f9cc073ff588ebdea8463e8e670de46ac8f7cc19773d6b4b3fa6"
    },
    {
      "id": "self-runtime-positive",
      "result": "PASSED",
      "command_digest": "sha256:b2f85ec5c19a3d2fe1f8a8159a89899854aed5901bc877980b2be88e3d36bc60",
      "started_at": "2026-07-22T16:41:54.037Z",
      "finished_at": "2026-07-22T16:41:54.077Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log",
      "output_digest": "sha256:6ddfa1ce953e3428b2ea291499155f284c3f40cbe3b46f3ca42b2c2b60a0afd8"
    },
    {
      "id": "self-current-candidate-verification",
      "result": "PASSED",
      "command_digest": "sha256:b27c49ad15d727673a6e6628d6420d1c174b1f54586726229bac26d04f068b6d",
      "started_at": "2026-07-22T16:41:54.077Z",
      "finished_at": "2026-07-22T16:50:13.473Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log",
      "output_digest": "sha256:c426f825486299b686c1d6c08c21b08e5b0e2df6c3ea0d9a65485a513f264041"
    },
    {
      "id": "self-current-obligation-evidence",
      "result": "PASSED",
      "command_digest": "sha256:5a5284d99310b8d96113242ff114c8926986294ad022e8868ac4d2aed01e3db5",
      "started_at": "2026-07-22T16:50:13.473Z",
      "finished_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
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
      "output_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973"
    },
    {
      "id": "self-current-modularity-evidence",
      "result": "PASSED",
      "command_digest": "sha256:9369cbbbf61161fac07da47cd6be510139c98e511fb5bd141bb7684ce5c46f2e",
      "started_at": "2026-07-22T16:50:14.298Z",
      "finished_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "covers_obligations": [
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
      "output_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8"
    },
    {
      "id": "self-current-runtime-behavior",
      "result": "PASSED",
      "command_digest": "sha256:d0980b0c5c04598799030b48a155f8cb144d4759354e17fc5ac4feca0462d30f",
      "started_at": "2026-07-22T16:50:14.460Z",
      "finished_at": "2026-07-22T16:50:14.542Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
      "output_digest": "sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:25aaa61259d7739642ca4d71893adf516e8dba87ff8e716027ab5fe645dcc8de",
    "after_evidence_ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:64cf6389f69fbafd6a573f5f55ce98f289bbd4bb9c6f55a0e4011225cd4dc875"
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
        "ref": "artifact:verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:3d87e90f9de56cb519ac3432bb35bcce0031c131a6ff1aecdaec3cf307ce2fb4"
      },
      {
        "ref": "artifact:verification-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:d3079dbcf49977b17d733bacac12a2bb40dc9bd004b7ac2e54f49e0a2b34cd8b"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/preflight.txt",
        "raw_file_digest": "sha256:28a2a7b5ad30d433e40ca3bead14739adee5fc4929491d00b66b0e9f9b2b8b84"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/resources.txt",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/resources.txt",
        "raw_file_digest": "sha256:40c04bf4b97a81c122fb83e841e2428d1b8509506ed59c621d187a8bdafcd745"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/cleanup-before.txt",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:25aaa61259d7739642ca4d71893adf516e8dba87ff8e716027ab5fe645dcc8de"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/cleanup-after.txt",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:64cf6389f69fbafd6a573f5f55ce98f289bbd4bb9c6f55a0e4011225cd4dc875"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/lifecycle-journal.jsonl",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:68695ca3b148dec6ad14f7beadb99961c0db2bd88342497b2a00cbd0a652672a"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-service.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-service.log",
        "raw_file_digest": "sha256:fb01d3ae233106f5484c588727985c25551ce13cd100945f558501a3f891f535"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:2decd2154843f9cc073ff588ebdea8463e8e670de46ac8f7cc19773d6b4b3fa6"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:6ddfa1ce953e3428b2ea291499155f284c3f40cbe3b46f3ca42b2c2b60a0afd8"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:c426f825486299b686c1d6c08c21b08e5b0e2df6c3ea0d9a65485a513f264041"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
        "raw_file_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e"
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
