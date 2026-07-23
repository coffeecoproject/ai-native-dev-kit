# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-115-init-project-modularity-r2`
- Runtime Plan: `artifact:verification-runtime-plans/115-init-project-modularity.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/115-init-project-modularity.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:74f2ade5f66be7d8cd52084fbe3c9af0aa64f217e97267ae998c21908b54c235`

## Run Window

- Started: `2026-07-22T18:17:24.284Z`
- Finished: `2026-07-22T18:29:22.092Z`
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
  "run_manifest_ref": "verification-run-manifests/115-init-project-modularity.md",
  "run_manifest_digest": "sha256:d9cfb812a4f464c6c72f2fc5f6f2a91c7d0cc11998cf0dbbb119281f19be6a98",
  "run_id": "vrun-115-init-project-modularity-r2",
  "owner_token_digest": "sha256:c6b656c4315e7478d36ab8a7991923d50f50db7642c0acc4e005868f3748dbeb",
  "runtime_plan_ref": "artifact:verification-runtime-plans/115-init-project-modularity.md",
  "runtime_plan_digest": "sha256:0eb5bc5ef1fe19626c9d6f946ff7b72ac2ff63bb794799f0555531cf03af5f39",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/115-init-project-modularity.md",
  "lifecycle_plan_digest": "sha256:29b08d7588934b84dd84a10d622096f959e6c25d178dc75dcd3fd8c7f7a9046d",
  "lifecycle_journal_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:b7de601484961979ca1f01bc2e10807f626da13b7b80487a57e96a17a0ae2bf3",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "verification_plan_ref": "artifact:verification-plans/115-init-project-modularity.md",
  "verification_plan_digest": "sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d",
  "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
  "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435",
  "task_tier": "HIGH",
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
    "revision": "sha256:74f2ade5f66be7d8cd52084fbe3c9af0aa64f217e97267ae998c21908b54c235",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-22T18:17:24.284Z",
    "finished_at": "2026-07-22T18:29:22.092Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "all 6 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "current project identity matches sha256:74f2ade5f66be7d8cd52084fbe3c9af0aa64f217e97267ae998c21908b54c235"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "process inventory probe is unavailable on this executor; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "all 4 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
      "reason": "no run-scoped session namespace existed before execution (1 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
      "evidence_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880",
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
          "value_digest": "sha256:5041faf489a59f56eeee15ef817b5977a212553284934e258d9f64c1e253e732",
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
      "started_at": "2026-07-22T18:17:24.294Z",
      "owned_by_run": "Yes",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-service.log",
      "evidence_digest": "sha256:c94332db9dbba02aac1745096549766a815d8bbc03aaa316088b9ab093622364"
    }
  ],
  "data_resources": [
    {
      "id": "cache",
      "resource_type": "CACHE",
      "instance_fingerprint": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "namespace_digest": "sha256:02ea22cb7a7e047aa8f85243bf67252d3f3166ab02f4e96916146387ae2bb46b",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "data",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "namespace_digest": "sha256:15a993272d49a261381216ef9cf290df1e858f6fc8df3608fd1d9bfdf3af9753",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "files",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "namespace_digest": "sha256:4ed2f171c10a0cf09d8335e3536558cf778ef4c9d8b226ddc5d1935976296e27",
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
      "namespace_digest": "sha256:89d7a77c95919077ba6b0a9de3d2d07c82e1cd4f5f6c1b5570e84273e1236218",
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
      "owner_marker_digest": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt",
      "evidence_digest": "sha256:babd7a7b6bed85106ba0f0b1b632b260190a1d23fd5607aa1587551f5cb77882"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt",
      "evidence_digest": "sha256:babd7a7b6bed85106ba0f0b1b632b260190a1d23fd5607aa1587551f5cb77882"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt",
      "evidence_digest": "sha256:babd7a7b6bed85106ba0f0b1b632b260190a1d23fd5607aa1587551f5cb77882"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt",
      "evidence_digest": "sha256:babd7a7b6bed85106ba0f0b1b632b260190a1d23fd5607aa1587551f5cb77882"
    },
    {
      "resource_id": "service:self-runtime-service",
      "resource_type": "PROCESS",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:97c487b631f7332bcd162dd6f419b9ece1b26ba76b1c7babdf592692eaed8ae9",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt",
      "evidence_digest": "sha256:babd7a7b6bed85106ba0f0b1b632b260190a1d23fd5607aa1587551f5cb77882"
    }
  ],
  "verification_executions": [
    {
      "id": "self-runtime-negative",
      "result": "PASSED",
      "command_digest": "sha256:065f3cb043f7f0ac45feb9b3cfc86fb4d745f4e74d0ba3dc60855433fe721a1d",
      "started_at": "2026-07-22T18:17:25.298Z",
      "finished_at": "2026-07-22T18:17:25.347Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log",
      "output_digest": "sha256:a099966029e36f4108484546547520c281388cfc568dc4d14952164c03f8d82e"
    },
    {
      "id": "self-runtime-positive",
      "result": "PASSED",
      "command_digest": "sha256:b2f85ec5c19a3d2fe1f8a8159a89899854aed5901bc877980b2be88e3d36bc60",
      "started_at": "2026-07-22T18:17:25.348Z",
      "finished_at": "2026-07-22T18:17:25.379Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log",
      "output_digest": "sha256:410a14bdbc01735839ed40cc6361e8511df136fea1cbd21dfd5b7be1e951217a"
    },
    {
      "id": "self-current-candidate-verification",
      "result": "PASSED",
      "command_digest": "sha256:b27c49ad15d727673a6e6628d6420d1c174b1f54586726229bac26d04f068b6d",
      "started_at": "2026-07-22T18:17:25.379Z",
      "finished_at": "2026-07-22T18:24:21.499Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log",
      "output_digest": "sha256:3ee2fba6a083bd4d81892d544c6e4003bc7d00de9deff5a97a95131ae55a665b"
    },
    {
      "id": "self-current-obligation-evidence",
      "result": "PASSED",
      "command_digest": "sha256:1cd282f5cd1587f02c191a37e40b75790b9beb96759c56c44761f599037a1864",
      "started_at": "2026-07-22T18:24:21.499Z",
      "finished_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-33f16b20-expected",
        "verify:universe-33f16b20-negative",
        "verify:universe-61e14285-expected",
        "verify:universe-61e14285-negative",
        "verify:universe-7b2145c0-expected",
        "verify:universe-7b2145c0-negative",
        "verify:universe-a11c3ecc-expected",
        "verify:universe-a11c3ecc-negative",
        "verify:universe-a6e545d4-expected",
        "verify:universe-a6e545d4-negative",
        "verify:universe-d653660b-expected",
        "verify:universe-d653660b-negative",
        "verify:universe-e1e69a79-expected",
        "verify:universe-e1e69a79-negative",
        "verify:universe-f3a2b88d-expected",
        "verify:universe-f3a2b88d-negative",
        "verify:universe-fb5f6fb1-expected",
        "verify:universe-fb5f6fb1-negative",
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
      "output_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d"
    },
    {
      "id": "self-current-runtime-behavior",
      "result": "PASSED",
      "command_digest": "sha256:d0980b0c5c04598799030b48a155f8cb144d4759354e17fc5ac4feca0462d30f",
      "started_at": "2026-07-22T18:29:20.384Z",
      "finished_at": "2026-07-22T18:29:20.455Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
      "output_digest": "sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:3b2b388152fbd18c3b2a5170fafc241f715a2f5cfe8e5bc4426be0cdca606eec",
    "after_evidence_ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:b22366b82f61c9e40a5a17bbf533fe616a9f1b4b5c0468b715c8dd0eb2927cdd"
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
      "revision": "sha256:74f2ade5f66be7d8cd52084fbe3c9af0aa64f217e97267ae998c21908b54c235"
    },
    "task": {
      "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
      "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435"
    },
    "sources": [
      {
        "ref": "artifact:verification-runtime-plans/115-init-project-modularity.md",
        "relative_path": "verification-runtime-plans/115-init-project-modularity.md",
        "raw_file_digest": "sha256:08283126ac336c13670dae956e8f7fd7fea3b0a86d5a8437dccc08d7d326c6ad"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/115-init-project-modularity.md",
        "relative_path": "verification-runtime-lifecycle-plans/115-init-project-modularity.md",
        "raw_file_digest": "sha256:d8f13a55b66f0709d9d58b8310342121e39ee341a2ec6301c6afdf2c3e5946ad"
      },
      {
        "ref": "artifact:verification-plans/115-init-project-modularity.md",
        "relative_path": "verification-plans/115-init-project-modularity.md",
        "raw_file_digest": "sha256:ab4fb28bd79062632900a03ca79967249dbe566eb88ff8660990307fd2058fc0"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt",
        "raw_file_digest": "sha256:b32973cd035b99c6939636cdc09ad8945c947bbb64e81db380bfac642dd70880"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt",
        "raw_file_digest": "sha256:babd7a7b6bed85106ba0f0b1b632b260190a1d23fd5607aa1587551f5cb77882"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-before.txt",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:3b2b388152fbd18c3b2a5170fafc241f715a2f5cfe8e5bc4426be0cdca606eec"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-after.txt",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:b22366b82f61c9e40a5a17bbf533fe616a9f1b4b5c0468b715c8dd0eb2927cdd"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/lifecycle-journal.jsonl",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:b7de601484961979ca1f01bc2e10807f626da13b7b80487a57e96a17a0ae2bf3"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-service.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-service.log",
        "raw_file_digest": "sha256:c94332db9dbba02aac1745096549766a815d8bbc03aaa316088b9ab093622364"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:a099966029e36f4108484546547520c281388cfc568dc4d14952164c03f8d82e"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:410a14bdbc01735839ed40cc6361e8511df136fea1cbd21dfd5b7be1e951217a"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:3ee2fba6a083bd4d81892d544c6e4003bc7d00de9deff5a97a95131ae55a665b"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50"
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
