# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-113-cross-domain-trust-r45`
- Runtime Plan: `artifact:verification-runtime-plans/113-cross-domain-trust-closure.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a`

## Run Window

- Started: `2026-07-21T01:29:13.992Z`
- Finished: `2026-07-21T01:41:34.046Z`
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
  "run_manifest_digest": "sha256:85bef60cf3445edc21524788ccd1342ca0a9ec3a6b88f182efc852adabe213c0",
  "run_id": "vrun-113-cross-domain-trust-r45",
  "owner_token_digest": "sha256:407bf088264fd049291f7d989db1c2ccec2ec1ba53537935e3672d4d48b46a4f",
  "runtime_plan_ref": "artifact:verification-runtime-plans/113-cross-domain-trust-closure.md",
  "runtime_plan_digest": "sha256:003a712b6718685438ea9588b6adaf85920180a6d332851861be9cb24b0c22a9",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
  "lifecycle_plan_digest": "sha256:3e353ef582539fe44ae1efd7809d9ecaebcab3ed676037ce065c0d89d5155adb",
  "lifecycle_journal_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:1c28c7334bf1a10b4057defcf4f6f706fe37a87607c294e428ed14ab2bfc0903",
  "adapter_contract_digest": "sha256:3616126bc156655e5e602cca74247796e4a711f7fd0a30702a1d6313029037f7",
  "verification_plan_ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
  "verification_plan_digest": "sha256:92f1c62c8ed6b3853df2ec2e594ca1c7d4a40d93668dc793c7fa98666994bbdc",
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
    "started_at": "2026-07-21T01:29:13.992Z",
    "finished_at": "2026-07-21T01:41:34.046Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "all 6 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "current project identity matches sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "process inventory probe is unavailable on this executor; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "all 4 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
      "reason": "no run-scoped session namespace existed before execution (1 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
      "evidence_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268",
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
          "value_digest": "sha256:9f0b37c566e5773f4091ef0e75a5bd9369ada622c27fc0d528ade09d5ab9ccbf",
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
      "started_at": "2026-07-21T01:29:14.005Z",
      "owned_by_run": "Yes",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-service.log",
      "evidence_digest": "sha256:feaf554e1aa6400e00770e781448d078ef82f3a10106d6e4eee1b25536922ac1"
    }
  ],
  "data_resources": [
    {
      "id": "cache",
      "resource_type": "CACHE",
      "instance_fingerprint": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "namespace_digest": "sha256:825ca6c51dbfdf511bf12045ab2b463831cebbd01f157843075bdb3341d5355c",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "data",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "namespace_digest": "sha256:1334198043ccd928ccbbb49030a54448fc413eabacbae8bcb7e33ed9e048f583",
      "migration_revision": "not-applicable",
      "isolation_status": "ISOLATED",
      "production_instance": "No",
      "owned_by_run": "Yes"
    },
    {
      "id": "files",
      "resource_type": "OTHER",
      "instance_fingerprint": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "namespace_digest": "sha256:cd193cc317d3b665d3bc20efcbca13647230017007d02bdfd114c7d219276d99",
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
      "namespace_digest": "sha256:2ccf081282fa656d531aac30749b7e53fd7ec30020121ead11cda368fb2e7018",
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
      "owner_marker_digest": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/resources.txt",
      "evidence_digest": "sha256:a114644e3c2a0436b260ebcb6a1b74c148463702dc53ab4552b848142d66d307"
    },
    {
      "resource_id": "context",
      "resource_type": "SESSION",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/resources.txt",
      "evidence_digest": "sha256:a114644e3c2a0436b260ebcb6a1b74c148463702dc53ab4552b848142d66d307"
    },
    {
      "resource_id": "data",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/resources.txt",
      "evidence_digest": "sha256:a114644e3c2a0436b260ebcb6a1b74c148463702dc53ab4552b848142d66d307"
    },
    {
      "resource_id": "files",
      "resource_type": "FILE",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/resources.txt",
      "evidence_digest": "sha256:a114644e3c2a0436b260ebcb6a1b74c148463702dc53ab4552b848142d66d307"
    },
    {
      "resource_id": "service:self-runtime-service",
      "resource_type": "PROCESS",
      "created_by_run": "Yes",
      "owner_marker_digest": "sha256:235491f5b86df50d43ca01489b5f69687c43ee2eb6adf9fb04216b0752267583",
      "cleanup_state": "CLEANED",
      "evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/resources.txt",
      "evidence_digest": "sha256:a114644e3c2a0436b260ebcb6a1b74c148463702dc53ab4552b848142d66d307"
    }
  ],
  "verification_executions": [
    {
      "id": "self-runtime-negative",
      "result": "PASSED",
      "command_digest": "sha256:065f3cb043f7f0ac45feb9b3cfc86fb4d745f4e74d0ba3dc60855433fe721a1d",
      "started_at": "2026-07-21T01:29:15.008Z",
      "finished_at": "2026-07-21T01:29:15.059Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-negative.log",
      "output_digest": "sha256:2720c59e5878303132946002df6cd08e812b58ff1cdf8453aab90f2ffc9522b5"
    },
    {
      "id": "self-runtime-positive",
      "result": "PASSED",
      "command_digest": "sha256:b2f85ec5c19a3d2fe1f8a8159a89899854aed5901bc877980b2be88e3d36bc60",
      "started_at": "2026-07-21T01:29:15.059Z",
      "finished_at": "2026-07-21T01:29:15.091Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-positive.log",
      "output_digest": "sha256:48c84829e1b1558d08bc9bb6179088f09b46f00fe63383e752f448f194bc64ee"
    },
    {
      "id": "self-current-candidate-verification",
      "result": "PASSED",
      "command_digest": "sha256:b27c49ad15d727673a6e6628d6420d1c174b1f54586726229bac26d04f068b6d",
      "started_at": "2026-07-21T01:29:15.091Z",
      "finished_at": "2026-07-21T01:37:17.223Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-candidate-verification.log",
      "output_digest": "sha256:a197838c685be11bb481cbcdf9fb6b2315db8b5fd680321241b251bd269a6c24"
    },
    {
      "id": "self-current-obligation-evidence",
      "result": "PASSED",
      "command_digest": "sha256:ca42b88080c83ac13acdd505e56749caa8b6b6c17da021dbabedccabaec36fd6",
      "started_at": "2026-07-21T01:37:17.232Z",
      "finished_at": "2026-07-21T01:41:32.257Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e"
    },
    {
      "id": "self-current-runtime-behavior",
      "result": "PASSED",
      "command_digest": "sha256:d0980b0c5c04598799030b48a155f8cb144d4759354e17fc5ac4feca0462d30f",
      "started_at": "2026-07-21T01:41:32.261Z",
      "finished_at": "2026-07-21T01:41:32.353Z",
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
      "output_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
      "output_digest": "sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:08228b9a7f9496bf5b547427094d00fc7900a0df632d7879c1a7fc235e0844e0",
    "after_evidence_ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:f266a75e70d4d107e11dad5f8de710b744c29202203585d15d326b939ca6586d"
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
        "raw_file_digest": "sha256:c0dabe27d295ef11f3945d324be948c0c35887c4914e631e5070462279add598"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
        "relative_path": "verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:77d7ad6ef3dad7147f6d8ff201c1bf6f4049ebb701e1781a9d902c724d16c490"
      },
      {
        "ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
        "relative_path": "verification-plans/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:d11076bd1482b227c3efc710181f37f672b4c17786153430815938367691a3a8"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/preflight.txt",
        "raw_file_digest": "sha256:4ca30d335b3e2a31018ac3b7c76fef42dd5186e5db0c5c9c1bb7d59b75249268"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/resources.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/resources.txt",
        "raw_file_digest": "sha256:a114644e3c2a0436b260ebcb6a1b74c148463702dc53ab4552b848142d66d307"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/cleanup-before.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:08228b9a7f9496bf5b547427094d00fc7900a0df632d7879c1a7fc235e0844e0"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/cleanup-after.txt",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:f266a75e70d4d107e11dad5f8de710b744c29202203585d15d326b939ca6586d"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/lifecycle-journal.jsonl",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:1c28c7334bf1a10b4057defcf4f6f706fe37a87607c294e428ed14ab2bfc0903"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-service.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-service.log",
        "raw_file_digest": "sha256:feaf554e1aa6400e00770e781448d078ef82f3a10106d6e4eee1b25536922ac1"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:2720c59e5878303132946002df6cd08e812b58ff1cdf8453aab90f2ffc9522b5"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:48c84829e1b1558d08bc9bb6179088f09b46f00fe63383e752f448f194bc64ee"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:a197838c685be11bb481cbcdf9fb6b2315db8b5fd680321241b251bd269a6c24"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e"
      },
      {
        "ref": "file:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76"
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
