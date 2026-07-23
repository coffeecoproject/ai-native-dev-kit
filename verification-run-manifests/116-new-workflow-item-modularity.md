# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-116-new-workflow-item-modularity-r13`
- Runtime Plan: `artifact:verification-runtime-plans/116-new-workflow-item-modularity.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/116-new-workflow-item-modularity.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:3097447006da6b73a1d03ff85c92856d4c68b2e0d488bc07d30ad3f208ed9807`

## Run Window

- Started: `2026-07-23T08:47:26.302Z`
- Finished: `2026-07-23T08:55:40.192Z`
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
  "run_manifest_ref": "verification-run-manifests/116-new-workflow-item-modularity.md",
  "run_manifest_digest": "sha256:671ccb76490524bd69b75de287c56b1f016aab1cd73002c4d75de507f6fbf515",
  "run_id": "vrun-116-new-workflow-item-modularity-r13",
  "owner_token_digest": "sha256:f8d7a40cd77770f89c63217cdc6c5a7c076c83efb4e9e215f53d942e6a06828b",
  "runtime_plan_ref": "artifact:verification-runtime-plans/116-new-workflow-item-modularity.md",
  "runtime_plan_digest": "sha256:0cb43b70396d7c1df30def2740763ab763825520c02cd8033b328e9522200150",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/116-new-workflow-item-modularity.md",
  "lifecycle_plan_digest": "sha256:75bd9bb48b1890ca0c54aa7b208cf83271e6000f5a1b1bde99e7c5a20c5301ad",
  "lifecycle_journal_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:c412246883e9047c8fbed089a0763d63b1c712edcb4652eb5bc751e7196e28ae",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "verification_plan_ref": "artifact:verification-plans/116-new-workflow-item-modularity.md",
  "verification_plan_digest": "sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26",
  "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
  "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e",
  "task_tier": "HIGH",
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
    "revision": "sha256:3097447006da6b73a1d03ff85c92856d4c68b2e0d488bc07d30ad3f208ed9807",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-23T08:47:26.302Z",
    "finished_at": "2026-07-23T08:55:40.192Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "all 6 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "current project identity matches sha256:3097447006da6b73a1d03ff85c92856d4c68b2e0d488bc07d30ad3f208ed9807"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "process inventory probe is unavailable on this executor; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "all 4 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
      "reason": "no run-scoped session namespace existed before execution (1 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
      "evidence_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d",
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
          "value_digest": "sha256:c988bdcd16522828ba87c343e991099df8ba2ab31fed922fd29b1c0479a95349",
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
      "started_at": "2026-07-23T08:47:26.311Z",
      "owned_by_run": "Yes",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-service.log",
      "evidence_digest": "sha256:6baa452b3dbd7ab3d0fde573a2ab50594f17d920d83f9b41d7671dabc03d7bf6"
    }
  ],
  "data_resources": [
    {
      "id": "cache",
      "resource_type": "CACHE",
      "instance_fingerprint": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "namespace_digest": "sha256:6e101da523cafd4ae18747b2d23c6ac5b1ec2f624ed57bc0a0ba89df03dfcaf1",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "data",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "namespace_digest": "sha256:27a64a05542b6b5dcf9137ec412c402e48525d1892f22cce17c0dea76e318aab",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "files",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "namespace_digest": "sha256:3933e27f7dd64ffd89a60e6c0cbe1e9ef62af173a8227006de0607c46ef627d8",
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
      "namespace_digest": "sha256:ea4fc3d11ed02cedbfb586f5e14393d4093803b4d1f63af05bb31bea4057b282",
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
      "owner_marker_digest": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/resources.txt",
      "evidence_digest": "sha256:6bcb1fb0e512e7be0c03843a65807cc9ef38c6bdcbf65f36fd0454ee704742d2"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/resources.txt",
      "evidence_digest": "sha256:6bcb1fb0e512e7be0c03843a65807cc9ef38c6bdcbf65f36fd0454ee704742d2"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/resources.txt",
      "evidence_digest": "sha256:6bcb1fb0e512e7be0c03843a65807cc9ef38c6bdcbf65f36fd0454ee704742d2"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/resources.txt",
      "evidence_digest": "sha256:6bcb1fb0e512e7be0c03843a65807cc9ef38c6bdcbf65f36fd0454ee704742d2"
    },
    {
      "resource_id": "service:self-runtime-service",
      "resource_type": "PROCESS",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:d4ebf3fb78135a32a2dab0c11b46fdc052bed8542685b323161a481cee3b5ebe",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/resources.txt",
      "evidence_digest": "sha256:6bcb1fb0e512e7be0c03843a65807cc9ef38c6bdcbf65f36fd0454ee704742d2"
    }
  ],
  "verification_executions": [
    {
      "id": "self-runtime-negative",
      "result": "PASSED",
      "command_digest": "sha256:065f3cb043f7f0ac45feb9b3cfc86fb4d745f4e74d0ba3dc60855433fe721a1d",
      "started_at": "2026-07-23T08:47:27.316Z",
      "finished_at": "2026-07-23T08:47:27.362Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log",
      "output_digest": "sha256:020f3a617eac1f283925ae6282bdd7e0ab115b3bcc834ecc278dbf07968384d8"
    },
    {
      "id": "self-runtime-positive",
      "result": "PASSED",
      "command_digest": "sha256:b2f85ec5c19a3d2fe1f8a8159a89899854aed5901bc877980b2be88e3d36bc60",
      "started_at": "2026-07-23T08:47:27.362Z",
      "finished_at": "2026-07-23T08:47:27.394Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log",
      "output_digest": "sha256:ba8bc7e406cca934c993fb3fc931a0335c32f48245c5d3d917b8d371f5b4ffc8"
    },
    {
      "id": "self-current-candidate-verification",
      "result": "PASSED",
      "command_digest": "sha256:b27c49ad15d727673a6e6628d6420d1c174b1f54586726229bac26d04f068b6d",
      "started_at": "2026-07-23T08:47:27.394Z",
      "finished_at": "2026-07-23T08:55:31.199Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log",
      "output_digest": "sha256:bfd587e14db47c6e6c780da77a7b8b9d989b24fb0eb1446aa0c7192fd959125c"
    },
    {
      "id": "self-current-obligation-evidence",
      "result": "PASSED",
      "command_digest": "sha256:d2f3bb296a2d7b1520c9d8096533eda2f35fb75bf9f962ac2cecee6413a1794b",
      "started_at": "2026-07-23T08:55:31.199Z",
      "finished_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "covers_obligations": [
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
      "output_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c"
    },
    {
      "id": "self-current-runtime-behavior",
      "result": "PASSED",
      "command_digest": "sha256:d0980b0c5c04598799030b48a155f8cb144d4759354e17fc5ac4feca0462d30f",
      "started_at": "2026-07-23T08:55:38.833Z",
      "finished_at": "2026-07-23T08:55:38.912Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
      "output_digest": "sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:1f1fe73b6366babff60aa91d67eb56519f85f4184accd7f28e4cd83ac26187b3",
    "after_evidence_ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:e19213d637241579b3186671b4029dc307468477e87025948a39627faf7e68eb"
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
        "ref": "artifact:verification-runtime-lifecycle-plans/116-new-workflow-item-modularity.md",
        "relative_path": "verification-runtime-lifecycle-plans/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:3661776ef8b4b762c31720b08b69dd2c620d35f5b9a1f9dd029b947e57630291"
      },
      {
        "ref": "artifact:verification-plans/116-new-workflow-item-modularity.md",
        "relative_path": "verification-plans/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:b9730d4c8635a6004b8f1ab6ffbd2214e00188f1400022e40632c5f660cd75e0"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/preflight.txt",
        "raw_file_digest": "sha256:4fe16e548ab30a82ca4b6d74c883c8b88f51512db2148c37667a6e548ddcce0d"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/resources.txt",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/resources.txt",
        "raw_file_digest": "sha256:6bcb1fb0e512e7be0c03843a65807cc9ef38c6bdcbf65f36fd0454ee704742d2"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/cleanup-before.txt",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:1f1fe73b6366babff60aa91d67eb56519f85f4184accd7f28e4cd83ac26187b3"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/cleanup-after.txt",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:e19213d637241579b3186671b4029dc307468477e87025948a39627faf7e68eb"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/lifecycle-journal.jsonl",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:c412246883e9047c8fbed089a0763d63b1c712edcb4652eb5bc751e7196e28ae"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-service.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-service.log",
        "raw_file_digest": "sha256:6baa452b3dbd7ab3d0fde573a2ab50594f17d920d83f9b41d7671dabc03d7bf6"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:020f3a617eac1f283925ae6282bdd7e0ab115b3bcc834ecc278dbf07968384d8"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:ba8bc7e406cca934c993fb3fc931a0335c32f48245c5d3d917b8d371f5b4ffc8"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:bfd587e14db47c6e6c780da77a7b8b9d989b24fb0eb1446aa0c7192fd959125c"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813"
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
