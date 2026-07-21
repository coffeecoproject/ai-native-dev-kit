# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-miniprogram-bl2-001`
- Runtime Plan: `artifact:verification-runtime-plans/bl2-miniprogram.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/bl2-miniprogram.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:7524a0f609232e2acebca0dcc1e7a9f9094284935ccce5205c28c318b48966fa`

## Run Window

- Started: `2026-07-19T11:49:00.217Z`
- Finished: `2026-07-19T11:49:00.258Z`
- State: `COMPLETED`

## Environment Preflight

All required runtime-plan probes are bound to the run-scoped preflight evidence.

## Service Instances

- No service instance required.

## Data And Session Isolation

Run-owned resources use isolated namespaces and never target production.

## Resource Ownership Ledger

Every material process or path is bound to this run and has an explicit cleanup disposition.

## Verification Executions

- `miniprogram-bl2-all`: `PASSED`, exit `0`

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
  "run_manifest_ref": "verification-run-manifests/bl2-miniprogram.md",
  "run_manifest_digest": "sha256:4c1a7fed2c93394092d444a7d1806a370772bbf179360cced9b55d184a8dab87",
  "run_id": "vrun-miniprogram-bl2-001",
  "owner_token_digest": "sha256:58f7d822b4f6d52fe19b5ec76b640b7622c94d6e7ce4c970581bab74bb0cf5ed",
  "runtime_plan_ref": "artifact:verification-runtime-plans/bl2-miniprogram.md",
  "runtime_plan_digest": "sha256:f24fb99d7017f0e546bf6df789828e3c0b5045eb2e52b2cbbbe04920240997d6",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/bl2-miniprogram.md",
  "lifecycle_plan_digest": "sha256:706ad3a45e04390fa816d4bf92f84efa43e6d8244eb29a77e84581bad3cbaf50",
  "lifecycle_journal_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:34d016cb74dc7a0878205ca3d80de19320c48c76b472ad2a4f8ee5f0900378a4",
  "adapter_contract_digest": "sha256:4bc65429cb9f5a08fcfd660a2401d89affff417c95f76f256af286b810941eee",
  "verification_plan_ref": "N/A",
  "verification_plan_digest": "N/A",
  "task_ref": "tasks/001-miniprogram-login-cloud-read.md",
  "intent_digest": "sha256:d9be4c971da783f774b9ca80a6a29996dd9772ed77dddf6891065780c1538a25",
  "task_tier": "LOW",
  "runtime_trust_level": "SOURCE_OUTPUT_BINDING",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:127ba9d083c1cd05a1d736eb1b137596cc7446a974147b5c8a9e1866bb2af29e",
    "revision": "sha256:7524a0f609232e2acebca0dcc1e7a9f9094284935ccce5205c28c318b48966fa",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-19T11:49:00.217Z",
    "finished_at": "2026-07-19T11:49:00.258Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "all 1 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "current project identity matches sha256:7524a0f609232e2acebca0dcc1e7a9f9094284935ccce5205c28c318b48966fa"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "no process with an exact declared SERVICE argv was running before this run"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "all 0 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "no run-scoped session namespace existed before execution (0 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
      "evidence_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a",
      "reason": "all actions and resources are explicitly non-production and contain no external-effect command marker"
    }
  ],
  "service_instances": [],
  "data_resources": [],
  "session_contexts": [],
  "resource_ledger": [],
  "verification_executions": [
    {
      "id": "miniprogram-bl2-all",
      "result": "PASSED",
      "command_digest": "sha256:a161dea4cb1e4e1c3308392f613949d3b79572d91b9f71c33d623df655378eea",
      "started_at": "2026-07-19T11:49:00.220Z",
      "finished_at": "2026-07-19T11:49:00.257Z",
      "exit_code": 0,
      "covers_obligations": [
        "bl2:wechat-miniprogram-industrial:client-storage:client-storage-minimization-evidence",
        "bl2:wechat-miniprogram-industrial:client-storage:sensitive-data-handling-evidence",
        "bl2:wechat-miniprogram-industrial:cloud-function-access-rule:api-failure-and-recovery-evidence",
        "bl2:wechat-miniprogram-industrial:cloud-function-access-rule:cloud-access-rule-evidence",
        "bl2:wechat-miniprogram-industrial:cloud-function-access-rule:cloud-function-boundary-evidence",
        "bl2:wechat-miniprogram-industrial:cloud-function-access-rule:production-configuration-review",
        "bl2:wechat-miniprogram-industrial:platform-permission:denied-permission-evidence",
        "bl2:wechat-miniprogram-industrial:platform-permission:platform-permission-prompt-evidence",
        "bl2:wechat-miniprogram-industrial:platform-permission:privacy-authorization-evidence",
        "bl2:wechat-miniprogram-industrial:release:experience-version-evidence",
        "bl2:wechat-miniprogram-industrial:release:monitoring-evidence",
        "bl2:wechat-miniprogram-industrial:release:platform-review-readiness",
        "bl2:wechat-miniprogram-industrial:release:release-submission-readiness",
        "bl2:wechat-miniprogram-industrial:release:rollback-or-mitigation-plan",
        "bl2:wechat-miniprogram-industrial:ui-state:critical-flow-behavior-evidence",
        "bl2:wechat-miniprogram-industrial:ui-state:mini-program-lifecycle-evidence",
        "bl2:wechat-miniprogram-industrial:ui-state:mini-program-loading-empty-error-forbidden-evidence",
        "bl2:wechat-miniprogram-industrial:ui-state:navigation-and-return-path-evidence",
        "bl2:wechat-miniprogram-industrial:wechat-login:denied-permission-evidence",
        "bl2:wechat-miniprogram-industrial:wechat-login:session-binding-evidence",
        "bl2:wechat-miniprogram-industrial:wechat-login:wechat-login-state-evidence"
      ],
      "service_instance_ids": [],
      "resource_ids": [],
      "positive_path": "Yes",
      "negative_path": "No",
      "output_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/outputs/miniprogram-bl2-all.log",
      "output_digest": "sha256:c130f99786410a8f52070e2cd7114558a919bd5ef5abff92a9423e54166b4109"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:7a42644afce5eee413289287e87dec66d50b87a49c0222b919ed18281feeb8f7",
    "after_evidence_ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:0edfe7af76ce80f9f415b10db5ac5ed64fe7e5e6a38e6eeecff08de26bd68fa9"
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
      "fingerprint": "sha256:127ba9d083c1cd05a1d736eb1b137596cc7446a974147b5c8a9e1866bb2af29e",
      "revision": "sha256:7524a0f609232e2acebca0dcc1e7a9f9094284935ccce5205c28c318b48966fa"
    },
    "task": {
      "task_ref": "tasks/001-miniprogram-login-cloud-read.md",
      "intent_digest": "sha256:d9be4c971da783f774b9ca80a6a29996dd9772ed77dddf6891065780c1538a25"
    },
    "sources": [
      {
        "ref": "artifact:verification-runtime-plans/bl2-miniprogram.md",
        "relative_path": "verification-runtime-plans/bl2-miniprogram.md",
        "raw_file_digest": "sha256:bcca3b225dae21d446904410f39de07c3fd56358d5d1f02cc05f3114c021999f"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/bl2-miniprogram.md",
        "relative_path": "verification-runtime-lifecycle-plans/bl2-miniprogram.md",
        "raw_file_digest": "sha256:4bcfd9bb78cb5ef7694b8963e29c6de522fbef345bef35317a22ffda9cbcb7dc"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
        "relative_path": ".intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/preflight.txt",
        "raw_file_digest": "sha256:c8d375315d55fc3557682e63d20174ecd14b5e575cf7abcc603e86fea8d2af9a"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/cleanup-before.txt",
        "relative_path": ".intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:7a42644afce5eee413289287e87dec66d50b87a49c0222b919ed18281feeb8f7"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/cleanup-after.txt",
        "relative_path": ".intentos/runtime-runs/vrun-miniprogram-bl2-001/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:0edfe7af76ce80f9f415b10db5ac5ed64fe7e5e6a38e6eeecff08de26bd68fa9"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/lifecycle-journal.jsonl",
        "relative_path": ".intentos/runtime-runs/vrun-miniprogram-bl2-001/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:34d016cb74dc7a0878205ca3d80de19320c48c76b472ad2a4f8ee5f0900378a4"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-miniprogram-bl2-001/outputs/miniprogram-bl2-all.log",
        "relative_path": ".intentos/runtime-runs/vrun-miniprogram-bl2-001/outputs/miniprogram-bl2-all.log",
        "raw_file_digest": "sha256:c130f99786410a8f52070e2cd7114558a919bd5ef5abff92a9423e54166b4109"
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
