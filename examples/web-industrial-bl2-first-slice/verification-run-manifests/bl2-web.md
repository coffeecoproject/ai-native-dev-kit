# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: `vrun-web-bl2-002`
- Runtime Plan: `artifact:verification-runtime-plans/bl2-web.md`
- Lifecycle Plan: `artifact:verification-runtime-lifecycle-plans/bl2-web.md`

## Source Identity

- Kind: `GIT`
- Revision: `sha256:02e68bd33899cb6b6e642dbdb7d2dc87bc34e19a1f47075f1f696c090c090538`

## Run Window

- Started: `2026-07-19T11:48:25.066Z`
- Finished: `2026-07-19T11:48:25.109Z`
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

- `web-bl2-all`: `PASSED`, exit `0`

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
  "run_manifest_ref": "verification-run-manifests/bl2-web.md",
  "run_manifest_digest": "sha256:b19c3dea20aacb117ea226f2d02e22aab90defed3d85ae2f80e498c247854d78",
  "run_id": "vrun-web-bl2-002",
  "owner_token_digest": "sha256:492fcd168515cc6236918d6063e376b4bd52ccfa44c0745eccec4c31a1ca79c2",
  "runtime_plan_ref": "artifact:verification-runtime-plans/bl2-web.md",
  "runtime_plan_digest": "sha256:51dfaa65b1cad37989582d259928c394ef5f49bfe999fd8f3be2e12a45bd3304",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/bl2-web.md",
  "lifecycle_plan_digest": "sha256:1432c9b130026b1c7381293f16c2dde5acc20f38bcfac9f01e28af1b0f39de28",
  "lifecycle_journal_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/lifecycle-journal.jsonl",
  "lifecycle_journal_digest": "sha256:5cb6b293ba1e692389bfff8448a5e359e714c75d745d1ba4811944b4376d5fbb",
  "adapter_contract_digest": "sha256:4bc65429cb9f5a08fcfd660a2401d89affff417c95f76f256af286b810941eee",
  "verification_plan_ref": "N/A",
  "verification_plan_digest": "N/A",
  "task_ref": "tasks/001-web-runtime-quality.md",
  "intent_digest": "sha256:3c6c227196cad2546ff093b7edd58b01fe333b3a95e3ee8c27daf92f892eba6e",
  "task_tier": "LOW",
  "runtime_trust_level": "SOURCE_OUTPUT_BINDING",
  "source_identity": {
    "kind": "GIT",
    "fingerprint": "sha256:53b78a49b8759367df4e380f7c78b8ea47fe98be9a8b7b80acee29cbdf852af5",
    "revision": "sha256:02e68bd33899cb6b6e642dbdb7d2dc87bc34e19a1f47075f1f696c090c090538",
    "current_project_match": "Yes"
  },
  "build_artifacts": [],
  "run_window": {
    "started_at": "2026-07-19T11:48:25.066Z",
    "finished_at": "2026-07-19T11:48:25.109Z",
    "state": "COMPLETED"
  },
  "preflight_results": [
    {
      "probe": "EXECUTABLE_AVAILABILITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "all 1 declared executables resolved in the bounded executor PATH"
    },
    {
      "probe": "SOURCE_IDENTITY",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "current project identity matches sha256:02e68bd33899cb6b6e642dbdb7d2dc87bc34e19a1f47075f1f696c090c090538"
    },
    {
      "probe": "WORKTREE_STATE",
      "required": "Yes",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "the exact pre-run worktree identity was captured for post-run comparison"
    },
    {
      "probe": "OLD_PROCESS",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "no process with an exact declared SERVICE argv was running before this run"
    },
    {
      "probe": "PORT_CONFLICT",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "no network port is declared or reused by this lifecycle"
    },
    {
      "probe": "SENSITIVE_ENVIRONMENT",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "child environment is rebuilt from the non-sensitive allowlist: PATH, LANG, LC_ALL, CI, TERM"
    },
    {
      "probe": "DATA_IDENTITY",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "all 0 declared resources are new run-scoped, non-production, and non-shared paths"
    },
    {
      "probe": "SESSION_RESIDUE",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "no run-scoped session namespace existed before execution (0 declared)"
    },
    {
      "probe": "PRODUCTION_RESOURCE_GUARD",
      "required": "No",
      "result": "PASS",
      "evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
      "evidence_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9",
      "reason": "all actions and resources are explicitly non-production and contain no external-effect command marker"
    }
  ],
  "service_instances": [],
  "data_resources": [],
  "session_contexts": [],
  "resource_ledger": [],
  "verification_executions": [
    {
      "id": "web-bl2-all",
      "result": "PASSED",
      "command_digest": "sha256:a161dea4cb1e4e1c3308392f613949d3b79572d91b9f71c33d623df655378eea",
      "started_at": "2026-07-19T11:48:25.069Z",
      "finished_at": "2026-07-19T11:48:25.108Z",
      "exit_code": 0,
      "covers_obligations": [
        "bl2:web-app-industrial:accessibility:keyboard-focus-and-accessible-name-evidence",
        "bl2:web-app-industrial:accessibility:status-message-and-contrast-evidence",
        "bl2:web-app-industrial:api-error-handling:api-failure-and-recovery-evidence",
        "bl2:web-app-industrial:api-error-handling:auth-and-validation-error-behavior-evidence",
        "bl2:web-app-industrial:dependency-change:client-bundle-impact-review",
        "bl2:web-app-industrial:form-interaction:form-submission-validation-and-duplicate-submit-evidence",
        "bl2:web-app-industrial:performance:bundle-asset-and-loading-impact-evidence",
        "bl2:web-app-industrial:performance:interaction-responsiveness-evidence",
        "bl2:web-app-industrial:permission-change:forbidden-state-evidence",
        "bl2:web-app-industrial:permission-change:resource-scope-evidence",
        "bl2:web-app-industrial:permission-change:server-side-permission-test-evidence",
        "bl2:web-app-industrial:production-config:deployment-configuration-evidence",
        "bl2:web-app-industrial:production-config:environment-variable-review",
        "bl2:web-app-industrial:production-config:secret-exposure-review",
        "bl2:web-app-industrial:release:monitoring-evidence",
        "bl2:web-app-industrial:release:release-record",
        "bl2:web-app-industrial:release:rollback-plan",
        "bl2:web-app-industrial:ui-change:critical-flow-behavior-evidence",
        "bl2:web-app-industrial:ui-change:loading-empty-error-forbidden-evidence",
        "bl2:web-app-industrial:ui-change:responsive-behavior-evidence",
        "bl2:web-app-industrial:ui-change:success-and-layout-stability-evidence"
      ],
      "service_instance_ids": [],
      "resource_ids": [],
      "positive_path": "Yes",
      "negative_path": "No",
      "output_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/outputs/web-bl2-all.log",
      "output_digest": "sha256:1e6857529eacffea322b3b46fa77559c54893bd0e32c0919c7055b5aba824ab0"
    }
  ],
  "cleanup_summary": {
    "state": "VERIFIED",
    "owned_resources_remaining": 0,
    "unrelated_resources_touched": "No",
    "before_evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/cleanup-before.txt",
    "before_evidence_digest": "sha256:64ca5efae01ba62f33b7c256bbe9c5b2739ce1c1deb8e76406ad17694b6c4ef3",
    "after_evidence_ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/cleanup-after.txt",
    "after_evidence_digest": "sha256:36cbaf65d5e1729a855ce44e7fa623b419fd3b0e91359f92fe324c2a7e1259f7"
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
      "fingerprint": "sha256:53b78a49b8759367df4e380f7c78b8ea47fe98be9a8b7b80acee29cbdf852af5",
      "revision": "sha256:02e68bd33899cb6b6e642dbdb7d2dc87bc34e19a1f47075f1f696c090c090538"
    },
    "task": {
      "task_ref": "tasks/001-web-runtime-quality.md",
      "intent_digest": "sha256:3c6c227196cad2546ff093b7edd58b01fe333b3a95e3ee8c27daf92f892eba6e"
    },
    "sources": [
      {
        "ref": "artifact:verification-runtime-plans/bl2-web.md",
        "relative_path": "verification-runtime-plans/bl2-web.md",
        "raw_file_digest": "sha256:4eec23b794410c5bc2990374255a7b9960352353593801058d78e03d15675626"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/bl2-web.md",
        "relative_path": "verification-runtime-lifecycle-plans/bl2-web.md",
        "raw_file_digest": "sha256:4de7dc1270edcb90dfcced773ece01ca914a824b2f00562260e1fc278d0c6f0e"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
        "relative_path": ".intentos/runtime-runs/vrun-web-bl2-002/evidence/preflight.txt",
        "raw_file_digest": "sha256:9aa31dacbb344689af91d97fb371c99526c2be130cd643268ed474d5fe8d99a9"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/cleanup-before.txt",
        "relative_path": ".intentos/runtime-runs/vrun-web-bl2-002/evidence/cleanup-before.txt",
        "raw_file_digest": "sha256:64ca5efae01ba62f33b7c256bbe9c5b2739ce1c1deb8e76406ad17694b6c4ef3"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/evidence/cleanup-after.txt",
        "relative_path": ".intentos/runtime-runs/vrun-web-bl2-002/evidence/cleanup-after.txt",
        "raw_file_digest": "sha256:36cbaf65d5e1729a855ce44e7fa623b419fd3b0e91359f92fe324c2a7e1259f7"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/lifecycle-journal.jsonl",
        "relative_path": ".intentos/runtime-runs/vrun-web-bl2-002/lifecycle-journal.jsonl",
        "raw_file_digest": "sha256:5cb6b293ba1e692389bfff8448a5e359e714c75d745d1ba4811944b4376d5fbb"
      },
      {
        "ref": "file:.intentos/runtime-runs/vrun-web-bl2-002/outputs/web-bl2-all.log",
        "relative_path": ".intentos/runtime-runs/vrun-web-bl2-002/outputs/web-bl2-all.log",
        "raw_file_digest": "sha256:1e6857529eacffea322b3b46fa77559c54893bd0e32c0919c7055b5aba824ab0"
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
