# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-113-cross-domain-trust-r46`
- Runtime Plan: `artifact:verification-runtime-plans/113-cross-domain-trust-closure.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a`

## Run Window

- Started: `2026-07-21T04:45:51.662Z`
- Finished: `2026-07-21T05:10:44.863Z`
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
  "run_manifest_ref": "verification-run-manifests/113-cross-domain-trust-closure.md",
  "run_manifest_digest": "sha256:fa1c7969e781349a55da46041c1d52db22e981efcd2b6f835fe31a3829514b1e",
  "run_id": "vrun-113-cross-domain-trust-r46",
  "owner_token_digest": "sha256:49b204090b2121d3bffb4b0d3bc8dcf75c286ffdffe8866f2c07bac1a09a1d29",
  "runtime_plan_ref": "artifact:verification-runtime-plans/113-cross-domain-trust-closure.md",
  "runtime_plan_digest": "sha256:f538ed1c0a8c46257b3dbb579a0835a2cdc1ab690b494920b31a87cfeba13ad6",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
  "lifecycle_plan_digest": "sha256:2594b8cfa01c3e4083a0c044b1e05f6c865522342fd5574afe030b27188b0e52",
  "lifecycle_journal_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:a0635b0de88e1beafdb7f70ec8f4fe3ca18beae0dc605a297385c34602dcce1e",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "verification_plan_ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
  "verification_plan_digest": "sha256:f31bb1fef6875d0dc81614d4cc9a407bd3ebc902f6449b48ef8d3c0aec8c748c",
  "task_ref": "task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98",
  "intent_digest": "sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d",
  "task_tier": "HIGH",
  "runtime_trust_level": "ISOLATED_RUNTIME",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
    "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-21T04:45:51.662Z",
    "finished_at": "2026-07-21T05:10:44.863Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "all 6 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "current project identity matches sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "process inventory probe is unavailable on this executor; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "all 4 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
      "reason": "no run-scoped session namespace existed before execution (1 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
      "evidence_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520",
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
          "value_digest": "sha256:550ce5813e204881075f96ac04b7ee8b4a85327723067d48c6742d0283c185b8",
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
      "started_at": "2026-07-21T04:45:51.675Z",
      "owned_by_run": "Yes",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-service.log",
      "evidence_digest": "sha256:935e4db22ed43a7fa7fb253fedb181a932845dd88df47ac3ffc62ef9aa2d1394"
    }
  ],
  "data_resources": [
    {
      "id": "cache",
      "resource_type": "CACHE",
      "instance_fingerprint": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "namespace_digest": "sha256:2e85fa8b5ecfe6e939b6c6d5229ba35792f255aeb0253957e5ee344a914e3985",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "data",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "namespace_digest": "sha256:8e610def0953f8efb2572012f03d50d5b16c31b3520046ee5b350af1bd0a1787",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "files",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "namespace_digest": "sha256:bb43c7298cef0b2fd6179eee39978b6fd746cf2ed653d6c61d4307fa590cc6a4",
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
      "namespace_digest": "sha256:7f79d86eb738889203b510dc5a3eddfb2ff28405d38d309b4188b44b91d8cbe4",
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
      "owner_marker_digest": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/resources.txt",
      "evidence_digest": "sha256:04607a9c53b8c0bdf210e0fa3bb67b535eb741575981366cfd9cd0e9584f7483"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/resources.txt",
      "evidence_digest": "sha256:04607a9c53b8c0bdf210e0fa3bb67b535eb741575981366cfd9cd0e9584f7483"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/resources.txt",
      "evidence_digest": "sha256:04607a9c53b8c0bdf210e0fa3bb67b535eb741575981366cfd9cd0e9584f7483"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/resources.txt",
      "evidence_digest": "sha256:04607a9c53b8c0bdf210e0fa3bb67b535eb741575981366cfd9cd0e9584f7483"
    },
    {
      "resource_id": "service:self-runtime-service",
      "resource_type": "PROCESS",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:52334b1b26674785319adaa754fc5322e816064ca049395241e9247050ef3067",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/resources.txt",
      "evidence_digest": "sha256:04607a9c53b8c0bdf210e0fa3bb67b535eb741575981366cfd9cd0e9584f7483"
    }
  ],
  "verification_executions": [
    {
      "id": "self-runtime-negative",
      "result": "PASSED",
      "command_digest": "sha256:065f3cb043f7f0ac45feb9b3cfc86fb4d745f4e74d0ba3dc60855433fe721a1d",
      "started_at": "2026-07-21T04:45:52.680Z",
      "finished_at": "2026-07-21T04:45:52.718Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-negative.log",
      "output_digest": "sha256:db00ba10b86b4fd4d8818661ded684e4577dd51ecc46b76f371a17805b8efca1"
    },
    {
      "id": "self-runtime-positive",
      "result": "PASSED",
      "command_digest": "sha256:b2f85ec5c19a3d2fe1f8a8159a89899854aed5901bc877980b2be88e3d36bc60",
      "started_at": "2026-07-21T04:45:52.718Z",
      "finished_at": "2026-07-21T04:45:52.756Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-positive.log",
      "output_digest": "sha256:8337923abcf7495a8304d1642a158a91a0b79ec8804eb278d7c993525e2baf33"
    },
    {
      "id": "self-current-candidate-verification",
      "result": "PASSED",
      "command_digest": "sha256:b27c49ad15d727673a6e6628d6420d1c174b1f54586726229bac26d04f068b6d",
      "started_at": "2026-07-21T04:45:52.756Z",
      "finished_at": "2026-07-21T05:03:41.393Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-candidate-verification.log",
      "output_digest": "sha256:5095a04d9e0843b29f37d03187f8d9e957b49dfeaef89d414c17d2144e462f3a"
    },
    {
      "id": "self-current-obligation-evidence",
      "result": "PASSED",
      "command_digest": "sha256:ca42b88080c83ac13acdd505e56749caa8b6b6c17da021dbabedccabaec36fd6",
      "started_at": "2026-07-21T05:03:41.401Z",
      "finished_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:data-model-data-model-check-data-model-historical-records-migrat",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:external-integration-integration-contract-check-external-integra",
        "verify:permission-risk-permission-boundary-test-role-tenant-visibility-",
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-00218482-expected",
        "verify:universe-00218482-negative",
        "verify:universe-010135e0-expected",
        "verify:universe-010135e0-negative",
        "verify:universe-01b5deae-expected",
        "verify:universe-01b5deae-negative",
        "verify:universe-06b86b13-expected",
        "verify:universe-06b86b13-negative",
        "verify:universe-0a935c21-expected",
        "verify:universe-0a935c21-negative",
        "verify:universe-0ad03c62-expected",
        "verify:universe-0ad03c62-negative",
        "verify:universe-0adf81f2-expected",
        "verify:universe-0adf81f2-negative",
        "verify:universe-133bfd71-expected",
        "verify:universe-133bfd71-negative",
        "verify:universe-1a4fabb1-expected",
        "verify:universe-1a4fabb1-negative",
        "verify:universe-211b9347-expected",
        "verify:universe-211b9347-negative",
        "verify:universe-230f46e1-expected",
        "verify:universe-230f46e1-negative",
        "verify:universe-370c5a1e-expected",
        "verify:universe-370c5a1e-negative",
        "verify:universe-3ad67323-expected",
        "verify:universe-3ad67323-negative",
        "verify:universe-3b1e8f43-expected",
        "verify:universe-3b1e8f43-negative",
        "verify:universe-3e9d296e-expected",
        "verify:universe-3e9d296e-negative",
        "verify:universe-4087f54e-expected",
        "verify:universe-4087f54e-negative",
        "verify:universe-41c23483-expected",
        "verify:universe-41c23483-negative",
        "verify:universe-48f98d4e-expected",
        "verify:universe-48f98d4e-negative",
        "verify:universe-4cd77b0a-expected",
        "verify:universe-4cd77b0a-negative",
        "verify:universe-4ea05a71-expected",
        "verify:universe-4ea05a71-negative",
        "verify:universe-610c7460-expected",
        "verify:universe-610c7460-negative",
        "verify:universe-66ba9a71-expected",
        "verify:universe-66ba9a71-negative",
        "verify:universe-68b60ab3-expected",
        "verify:universe-68b60ab3-negative",
        "verify:universe-6a0a12c4-expected",
        "verify:universe-6a0a12c4-negative",
        "verify:universe-6a3c13eb-expected",
        "verify:universe-6a3c13eb-negative",
        "verify:universe-6f5a5aa3-expected",
        "verify:universe-6f5a5aa3-negative",
        "verify:universe-72c3bacf-expected",
        "verify:universe-72c3bacf-negative",
        "verify:universe-7bea42b3-expected",
        "verify:universe-7bea42b3-negative",
        "verify:universe-7e9a2282-expected",
        "verify:universe-7e9a2282-negative",
        "verify:universe-8331c5ae-expected",
        "verify:universe-8331c5ae-negative",
        "verify:universe-868d4b91-expected",
        "verify:universe-868d4b91-negative",
        "verify:universe-88185f96-expected",
        "verify:universe-88185f96-negative",
        "verify:universe-8dca8d52-expected",
        "verify:universe-8dca8d52-negative",
        "verify:universe-909edc85-expected",
        "verify:universe-909edc85-negative",
        "verify:universe-94a115a4-expected",
        "verify:universe-94a115a4-negative",
        "verify:universe-95d747e1-expected",
        "verify:universe-95d747e1-negative",
        "verify:universe-9a1bf08b-expected",
        "verify:universe-9a1bf08b-negative",
        "verify:universe-9a3804d1-expected",
        "verify:universe-9a3804d1-negative",
        "verify:universe-9f9fa3e5-expected",
        "verify:universe-9f9fa3e5-negative",
        "verify:universe-a0707b63-expected",
        "verify:universe-a0707b63-negative",
        "verify:universe-a238de93-expected",
        "verify:universe-a238de93-negative",
        "verify:universe-a4833a0b-expected",
        "verify:universe-a4833a0b-negative",
        "verify:universe-aa4f5177-expected",
        "verify:universe-aa4f5177-negative",
        "verify:universe-ab243239-expected",
        "verify:universe-ab243239-negative",
        "verify:universe-bb4f1e0b-expected",
        "verify:universe-bb4f1e0b-negative",
        "verify:universe-ca9f9831-expected",
        "verify:universe-ca9f9831-negative",
        "verify:universe-ce319ca9-expected",
        "verify:universe-ce319ca9-negative",
        "verify:universe-d36e2a76-expected",
        "verify:universe-d36e2a76-negative",
        "verify:universe-d5cda5ec-expected",
        "verify:universe-d5cda5ec-negative",
        "verify:universe-d6fb92e1-expected",
        "verify:universe-d6fb92e1-negative",
        "verify:universe-dfbddc4b-expected",
        "verify:universe-dfbddc4b-negative",
        "verify:universe-e710bac0-expected",
        "verify:universe-e710bac0-negative",
        "verify:universe-eafe80a3-expected",
        "verify:universe-eafe80a3-negative",
        "verify:universe-f7ab67ee-expected",
        "verify:universe-f7ab67ee-negative",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2"
    },
    {
      "id": "self-current-runtime-behavior",
      "result": "PASSED",
      "command_digest": "sha256:d0980b0c5c04598799030b48a155f8cb144d4759354e17fc5ac4feca0462d30f",
      "started_at": "2026-07-21T05:10:40.453Z",
      "finished_at": "2026-07-21T05:10:40.727Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
      "output_digest": "sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:8d2e0e7614bbcf427c383254e20602fa76a8e79df3dff3099bcd452572f8d715",
    "after_evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:748b245e8d3fe853cd345c659e6904d61e804dafe603a6c63779a1d0a27ec591"
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
      "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a"
    },
    "task": {
      "task_ref": "task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98",
      "intent_digest": "sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d"
    },
    "sources": [
      {
        "ref": "artifact:verification-runtime-plans/113-cross-domain-trust-closure.md",
        "relative_path": "verification-runtime-plans/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:c733f0115dab00d196d47da90c9d7e836e5e47c263d2cdf8ada813955e0d05a8"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
        "relative_path": "verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:8f5cd21ad8f8ef48435a85540aa02f6b87aa440217d5585509efac51758e7ba1"
      },
      {
        "ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
        "relative_path": "verification-plans/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:5a45bba416cdb856d442e112095c694b48f4c5da0433ead74a07a256c8b0555a"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/preflight.txt",
        "raw_file_digest": "sha256:246e2350aeb55855ecc3830fabca53687f48b0f8a9cf00a3ef7a6074896a6520"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/resources.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/resources.txt",
        "raw_file_digest": "sha256:04607a9c53b8c0bdf210e0fa3bb67b535eb741575981366cfd9cd0e9584f7483"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/cleanup-before.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:8d2e0e7614bbcf427c383254e20602fa76a8e79df3dff3099bcd452572f8d715"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/cleanup-after.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:748b245e8d3fe853cd345c659e6904d61e804dafe603a6c63779a1d0a27ec591"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/lifecycle-journal.jsonl",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:a0635b0de88e1beafdb7f70ec8f4fe3ca18beae0dc605a297385c34602dcce1e"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-service.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-service.log",
        "raw_file_digest": "sha256:935e4db22ed43a7fa7fb253fedb181a932845dd88df47ac3ffc62ef9aa2d1394"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:db00ba10b86b4fd4d8818661ded684e4577dd51ecc46b76f371a17805b8efca1"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:8337923abcf7495a8304d1642a158a91a0b79ec8804eb278d7c993525e2baf33"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:5095a04d9e0843b29f37d03187f8d9e957b49dfeaef89d414c17d2144e462f3a"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064"
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
