# Control Effectiveness Report

This report does not authorize implementation, writes, CI or hook changes, adoption apply, release, production, or completion.

## Human Summary

The exact eight controls routed by current Task Governance are bound to their current implementations and a passing 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.

## Assessment Purpose

`TASK` for `task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e`.

## Control Claims

- `claim:package-script-verify-candidate`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-consumer-chain-candidate`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-planning-closure`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-adoption-assurance-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-ai-workflow-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-apply-execution-receipt-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-apply-plan-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-approval-record-mjs`: `CONTROL_PROVEN_EFFECTIVE`

## Scope And Exclusions

The complete routed control inventory is recorded in `evidence/115-init-project-control-inventory.json`; no routed claim is excluded.

## Semantic And Failure Proof

The focused baseline covers CLI and plan parity, controlled apply, atomic bootstrap, rollback, hard interruption, recovery, symlink races, and installed/source distribution trust.

## Evidence Identity And Freshness

Implementation, inventory, and compact proof files are current-file digest bound. The proof must be replayed after implementation before completion.

## Dynamic Assessment Safety

The local Node test process used temporary fixtures and no network, secrets, release, or production path.

## Dependent Consumers

Current Task Governance and the planning/verification chain strictly consume all eight routed claims.

## Limitations

This is current staged-candidate evidence. Commit, push, release, and production remain outside its authority.

## Boundaries

This assessment is non-authorizing; final completion still requires current post-implementation evidence and unified workflow replay.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.110.0",
  "artifact_type": "control_effectiveness",
  "assessment_id": "assessment:115-init-project-modularity",
  "assessment_purpose": "TASK",
  "report_ref": "control-effectiveness-reports/115-init-project-modularity.md",
  "report_digest": "sha256:0bc352601aee287a2ca7bda78436af8fad6b1aab1422dfab2f7e3630671f9081",
  "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
  "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435",
  "required_claim_ids": [
    "claim:package-script-verify-candidate",
    "claim:package-script-verify-consumer-chain-candidate",
    "claim:package-script-verify-planning-closure",
    "claim:file-scripts-check-adoption-assurance-mjs",
    "claim:file-scripts-check-ai-workflow-mjs",
    "claim:file-scripts-check-apply-execution-receipt-mjs",
    "claim:file-scripts-check-apply-plan-mjs",
    "claim:file-scripts-check-approval-record-mjs"
  ],
  "control_claims": [
    {
      "claim_id": "claim:package-script-verify-candidate",
      "claim_digest": "sha256:6804b0908a46c424b838763dbdd0fc9069c230782ccd0955c5babd14a33605a9",
      "control_id": "package-script:verify:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "package-script:verify:candidate remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "RELEASE_ROLLBACK_OR_OPERATIONAL_READINESS",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:67de6974467601f4ed8b65b306e0423f0a0049661d40559a856d8ca4a6b888db",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:candidate remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "package-script:verify:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:candidate",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-consumer-chain-candidate",
      "claim_digest": "sha256:364e4112208d6026a0d3fb337814b1be1e4d8067c2091f438a4b38edc1f58586",
      "control_id": "package-script:verify:consumer-chain:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "package-script:verify:consumer-chain:candidate remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:consumer-chain:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:67de6974467601f4ed8b65b306e0423f0a0049661d40559a856d8ca4a6b888db",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:consumer-chain:candidate remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "package-script:verify:consumer-chain:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:consumer-chain:candidate",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-planning-closure",
      "claim_digest": "sha256:cbd52d80440f4ae5257fc50bc04b90c63e1d2ddb1116f5864621123b1fcf48d0",
      "control_id": "package-script:verify:planning-closure",
      "origin": "PROJECT_NATIVE",
      "summary": "package-script:verify:planning-closure remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:planning-closure",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:67de6974467601f4ed8b65b306e0423f0a0049661d40559a856d8ca4a6b888db",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:planning-closure remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "package-script:verify:planning-closure"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:planning-closure",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-adoption-assurance-mjs",
      "claim_digest": "sha256:b44004552c2ea67d0f7bdb7b1ad1991d73c94dd0629d8c9429ed8bdaaa3daccb",
      "control_id": "file:scripts/check-adoption-assurance.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "scripts/check-adoption-assurance.mjs remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "scripts/check-adoption-assurance.mjs",
      "implementation_bindings": [
        {
          "ref": "file:scripts/check-adoption-assurance.mjs",
          "digest": "sha256:9b359db02a562d59b8595c7cc14ea446ba250ae738a2fe7f1f08999bc71a5d8b",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "scripts/check-adoption-assurance.mjs remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "scripts/check-adoption-assurance.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-adoption-assurance.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-ai-workflow-mjs",
      "claim_digest": "sha256:a6e33dd42e5eba52e80bbf4ea735359430e3d583442cc5858157e2751478ac08",
      "control_id": "file:scripts/check-ai-workflow.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "scripts/check-ai-workflow.mjs remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "scripts/check-ai-workflow.mjs",
      "implementation_bindings": [
        {
          "ref": "file:scripts/check-ai-workflow.mjs",
          "digest": "sha256:b576d956fc898ade267d035ef89267353d8b77b276792e080bcc06efd306f821",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "scripts/check-ai-workflow.mjs remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "scripts/check-ai-workflow.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-ai-workflow.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-apply-execution-receipt-mjs",
      "claim_digest": "sha256:c3f890d40edc30f1e987f207ea0617b52a9cc44096f63606c7a9e986bdb73f7c",
      "control_id": "file:scripts/check-apply-execution-receipt.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "scripts/check-apply-execution-receipt.mjs remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "scripts/check-apply-execution-receipt.mjs",
      "implementation_bindings": [
        {
          "ref": "file:scripts/check-apply-execution-receipt.mjs",
          "digest": "sha256:9fd243da8952288d3b1cb2e0673fc2220d8c49ff7d41ab042707864fecbe86cd",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "scripts/check-apply-execution-receipt.mjs remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "scripts/check-apply-execution-receipt.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-apply-execution-receipt.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-apply-plan-mjs",
      "claim_digest": "sha256:f054f4af00ae23e3cfc5bcc58215e07b226ab06c839fc014d6ae219e7a35f58e",
      "control_id": "file:scripts/check-apply-plan.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "scripts/check-apply-plan.mjs remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "scripts/check-apply-plan.mjs",
      "implementation_bindings": [
        {
          "ref": "file:scripts/check-apply-plan.mjs",
          "digest": "sha256:5c10bb5bdcc0483ea3d2c75aab7fe923fe2967b96ec29ced146bfbc2b3197f5e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "scripts/check-apply-plan.mjs remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "scripts/check-apply-plan.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-apply-plan.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-approval-record-mjs",
      "claim_digest": "sha256:ebe0887e5a5d2005cda9bed20c978750388361b2723cacff09b64956ed48ebad",
      "control_id": "file:scripts/check-approval-record.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "scripts/check-approval-record.mjs remains current and is exercised by the 124-test final-candidate init-project transaction, modularity, and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "scripts/check-approval-record.mjs",
      "implementation_bindings": [
        {
          "ref": "file:scripts/check-approval-record.mjs",
          "digest": "sha256:920709448fd62498807b8c3d2c767f1bfbd891fb4207443cb9f231757fd46b1e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "scripts/check-approval-record.mjs remains an enforceable project-native control during the init-project structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the 124-test final candidate passes structural, positive, fail-closed, rollback, interruption, recovery, and distribution paths.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/115-init-project-control-inventory.json",
          "file:evidence/115-init-project-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "declared_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "observed_inventory_ref": "file:evidence/115-init-project-control-inventory.json",
        "observed_inventory_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932",
        "included_items": [
          "scripts/check-approval-record.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "staged-final-candidate-before-commit",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.115-init-project-final-124",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/115-init-project-baseline-tests.log",
        "output_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-init-project-transaction-and-distribution-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "--test-concurrency=1",
            "tests/init-project-modularity.test.mjs",
            "tests/project-entry-new-project-transaction.test.mjs",
            "tests/project-entry-generated-parity.test.mjs",
            "tests/controlled-apply-transaction.test.mjs",
            "tests/execution-distribution-trust.test.mjs"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH",
            "NO_COLOR"
          ],
          "timeout_ms": 600000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only",
            "writes compact evidence/115-init-project-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.115-init-project-final-124"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure/recovery proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/115-init-project-control-inventory.json",
            "file:evidence/115-init-project-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-approval-record.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the staged final structural-refactor candidate and local non-production test process."
      ]
    }
  ],
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
        "ref": "file:package.json",
        "relative_path": "package.json",
        "raw_file_digest": "sha256:67de6974467601f4ed8b65b306e0423f0a0049661d40559a856d8ca4a6b888db"
      },
      {
        "ref": "file:scripts/check-adoption-assurance.mjs",
        "relative_path": "scripts/check-adoption-assurance.mjs",
        "raw_file_digest": "sha256:9b359db02a562d59b8595c7cc14ea446ba250ae738a2fe7f1f08999bc71a5d8b"
      },
      {
        "ref": "file:scripts/check-ai-workflow.mjs",
        "relative_path": "scripts/check-ai-workflow.mjs",
        "raw_file_digest": "sha256:b576d956fc898ade267d035ef89267353d8b77b276792e080bcc06efd306f821"
      },
      {
        "ref": "file:scripts/check-apply-execution-receipt.mjs",
        "relative_path": "scripts/check-apply-execution-receipt.mjs",
        "raw_file_digest": "sha256:9fd243da8952288d3b1cb2e0673fc2220d8c49ff7d41ab042707864fecbe86cd"
      },
      {
        "ref": "file:scripts/check-apply-plan.mjs",
        "relative_path": "scripts/check-apply-plan.mjs",
        "raw_file_digest": "sha256:5c10bb5bdcc0483ea3d2c75aab7fe923fe2967b96ec29ced146bfbc2b3197f5e"
      },
      {
        "ref": "file:scripts/check-approval-record.mjs",
        "relative_path": "scripts/check-approval-record.mjs",
        "raw_file_digest": "sha256:920709448fd62498807b8c3d2c767f1bfbd891fb4207443cb9f231757fd46b1e"
      },
      {
        "ref": "file:evidence/115-init-project-control-inventory.json",
        "relative_path": "evidence/115-init-project-control-inventory.json",
        "raw_file_digest": "sha256:ae28cf2c6203fe1411887c94784b9dc4d4607d696051ad0fd565ac068f541932"
      },
      {
        "ref": "file:evidence/115-init-project-baseline-tests.log",
        "relative_path": "evidence/115-init-project-baseline-tests.log",
        "raw_file_digest": "sha256:1f04b4b8b4bb299a3e7fc6a8529b3c0d75d07c29247ae143c5401636dc6a6918"
      }
    ]
  },
  "limitations": [
    "The assessment proves the routed technical controls for this staged structural-refactor candidate; it does not authorize production or external effects."
  ],
  "boundaries": {
    "assessment_is_read_only": "Yes",
    "authorizes_implementation": "No",
    "authorizes_writes": "No",
    "authorizes_release": "No",
    "authorizes_production": "No",
    "proves_product_correctness": "No"
  },
  "outcome": "CONTROL_PROVEN_EFFECTIVE"
}
```

## Outcome

`CONTROL_PROVEN_EFFECTIVE`
