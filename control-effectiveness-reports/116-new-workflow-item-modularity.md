# Control Effectiveness Report

This report does not authorize implementation, writes, CI or hook changes, adoption apply, release, production, or completion.

## Human Summary

The exact eight controls routed by current Task Governance are bound to their current implementations and the passing 63-type, 223-alias public-entry characterization.

## Assessment Purpose

`TASK` for `task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf`.

## Control Claims

- `claim:package-script-verify-candidate`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-consumer-chain-candidate`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-adoption-assurance-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-ai-workflow-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-apply-execution-receipt-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-apply-plan-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-approval-record-mjs`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-baseline-enforcement-mjs`: `CONTROL_PROVEN_EFFECTIVE`

## Scope And Exclusions

The complete routed control inventory is recorded in `evidence/116-new-workflow-item-control-inventory.json`; no routed claim is excluded.

## Semantic And Failure Proof

The focused baseline covers every canonical type, the complete alias registry, representative alias execution, generated paths and content, terminal output, exits, invalid inputs, and overwrite rejection.

## Evidence Identity And Freshness

Implementation, inventory, and compact proof files are current-file digest bound. The proof must be replayed after implementation.

## Dynamic Assessment Safety

The local Node test process used temporary fixtures and no network, secrets, release, or production path.

## Dependent Consumers

Current Task Governance and the planning/verification chain strictly consume all eight routed claims.

## Limitations

This is pre-implementation characterization evidence; final post-refactor replay remains required.

## Boundaries

This assessment is non-authorizing and does not approve commit, push, release, or production.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.110.0",
  "artifact_type": "control_effectiveness",
  "assessment_id": "assessment:116-new-workflow-item-modularity",
  "assessment_purpose": "TASK",
  "report_ref": "control-effectiveness-reports/116-new-workflow-item-modularity.md",
  "report_digest": "sha256:abeb79b34425d17ef6ea1fc0e7b4947736dbebc101cb4d39cee8d51af2d8d4ac",
  "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
  "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e",
  "required_claim_ids": [
    "claim:package-script-verify-candidate",
    "claim:package-script-verify-consumer-chain-candidate",
    "claim:file-scripts-check-adoption-assurance-mjs",
    "claim:file-scripts-check-ai-workflow-mjs",
    "claim:file-scripts-check-apply-execution-receipt-mjs",
    "claim:file-scripts-check-apply-plan-mjs",
    "claim:file-scripts-check-approval-record-mjs",
    "claim:file-scripts-check-baseline-enforcement-mjs"
  ],
  "control_claims": [
    {
      "claim_id": "claim:package-script-verify-candidate",
      "claim_digest": "sha256:757566cb9c4167d561ecd6e2704458e98721d00d69c115d102f7d55c6cf056fa",
      "control_id": "package-script:verify:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "package-script:verify:candidate remains current and is bound to the 63-type, 223-alias executable generator baseline.",
      "category": "RELEASE_ROLLBACK_OR_OPERATIONAL_READINESS",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:b0c165e9ec73120ad464ac5d4eece5b923b9bc06b0963bf9c295e6600c3a3b6f",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:candidate remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "package-script:verify:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
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
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-consumer-chain-candidate",
      "claim_digest": "sha256:43487e16c79c560a0192ef22c67ee614463c29ee71b6a030e65a4d9a14dddbff",
      "control_id": "package-script:verify:consumer-chain:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "package-script:verify:consumer-chain:candidate remains current and is bound to the 63-type, 223-alias executable generator baseline.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:consumer-chain:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:b0c165e9ec73120ad464ac5d4eece5b923b9bc06b0963bf9c295e6600c3a3b6f",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:consumer-chain:candidate remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "package-script:verify:consumer-chain:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
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
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-adoption-assurance-mjs",
      "claim_digest": "sha256:a5aabcb79a5f6ce895b7173ee0bec03bbe2af6c946ed1ad42065968c1fc814aa",
      "control_id": "file:scripts/check-adoption-assurance.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "file:scripts/check-adoption-assurance.mjs remains current and is bound to the 63-type, 223-alias executable generator baseline.",
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
        "declared_assertion": "file:scripts/check-adoption-assurance.mjs remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "scripts/check-adoption-assurance.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
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
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-ai-workflow-mjs",
      "claim_digest": "sha256:e41beeefc55cb5c4e4a44a8bdd6a742a6cd6fce76663bc2612e50388a2e6bd12",
      "control_id": "file:scripts/check-ai-workflow.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "file:scripts/check-ai-workflow.mjs remains current and is bound to the 63-type, 223-alias executable generator baseline.",
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
        "declared_assertion": "file:scripts/check-ai-workflow.mjs remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "scripts/check-ai-workflow.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
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
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-apply-execution-receipt-mjs",
      "claim_digest": "sha256:eaebba4a646402276a9f2080ea4e36d3f97a17dcd0358acd0bffa51e2feb48e8",
      "control_id": "file:scripts/check-apply-execution-receipt.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "file:scripts/check-apply-execution-receipt.mjs remains current and is bound to the 63-type, 223-alias executable generator baseline.",
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
        "declared_assertion": "file:scripts/check-apply-execution-receipt.mjs remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "scripts/check-apply-execution-receipt.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
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
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-apply-plan-mjs",
      "claim_digest": "sha256:552669294987be62103a2cf6209f69fc0f1f5e8ec4593d76fae87f0fab07f234",
      "control_id": "file:scripts/check-apply-plan.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "file:scripts/check-apply-plan.mjs remains current and is bound to the 63-type, 223-alias executable generator baseline.",
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
        "declared_assertion": "file:scripts/check-apply-plan.mjs remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "scripts/check-apply-plan.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
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
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-approval-record-mjs",
      "claim_digest": "sha256:7bb5f56af6f5f30c5e0fa29f7afe5f778289f20f1a4a33610c3913b158becf80",
      "control_id": "file:scripts/check-approval-record.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "file:scripts/check-approval-record.mjs remains current and is bound to the 63-type, 223-alias executable generator baseline.",
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
        "declared_assertion": "file:scripts/check-approval-record.mjs remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "scripts/check-approval-record.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
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
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-baseline-enforcement-mjs",
      "claim_digest": "sha256:734534f38c273f6515cb247f4eb48c2fd801c5cc9d888846eef399015b35abb5",
      "control_id": "file:scripts/check-baseline-enforcement.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "file:scripts/check-baseline-enforcement.mjs remains current and is bound to the 63-type, 223-alias executable generator baseline.",
      "category": "STATIC_CORRECTNESS",
      "enforcement_level": "BLOCKING",
      "protected_surface": "scripts/check-baseline-enforcement.mjs",
      "implementation_bindings": [
        {
          "ref": "file:scripts/check-baseline-enforcement.mjs",
          "digest": "sha256:3c3f7a82186b12ea88e462aa6becd0c7a02cf466ca7e67dc25c56338a7cbea34",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "file:scripts/check-baseline-enforcement.mjs remains an enforceable project-native control during the workflow-item generator structural refactor.",
        "observed_assertion": "The exact implementation identity is bound and the current public entry passes canonical type, alias, generated path, content, output, exit, and fail-closed characterization.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/116-new-workflow-item-control-inventory.json",
          "file:evidence/116-new-workflow-item-baseline-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "declared_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "observed_inventory_ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "observed_inventory_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63",
        "included_items": [
          "scripts/check-baseline-enforcement.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "pre-implementation-characterization",
        "environment": "isolated-local-process-v23.11.0",
        "run_id": "run:1.116-new-workflow-item-baseline-4",
        "observed_at": "2026-07-23T00:00:00.000+08:00",
        "valid_until": "until source, manifest, package script, focused proof, or candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "output_digest": "sha256:1ae7e82c8d845c95f4d6e0e8b28e1c412975bb5f20a440eba2a73b88062849e3",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-new-workflow-item-characterization-baseline",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/new-workflow-item-characterization.test.mjs"
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
            "writes compact evidence/116-new-workflow-item-baseline-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.116-new-workflow-item-baseline-4"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current positive/failure proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/116-new-workflow-item-control-inventory.json",
            "file:evidence/116-new-workflow-item-baseline-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-baseline-enforcement.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before implementation review and completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the pre-implementation structural-refactor characterization and local non-production test process; final replay remains required."
      ]
    }
  ],
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
        "ref": "file:package.json",
        "relative_path": "package.json",
        "raw_file_digest": "sha256:b0c165e9ec73120ad464ac5d4eece5b923b9bc06b0963bf9c295e6600c3a3b6f"
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
        "ref": "file:scripts/check-baseline-enforcement.mjs",
        "relative_path": "scripts/check-baseline-enforcement.mjs",
        "raw_file_digest": "sha256:3c3f7a82186b12ea88e462aa6becd0c7a02cf466ca7e67dc25c56338a7cbea34"
      },
      {
        "ref": "file:evidence/116-new-workflow-item-control-inventory.json",
        "relative_path": "evidence/116-new-workflow-item-control-inventory.json",
        "raw_file_digest": "sha256:9cf7411bd95a33908bd0824864ad77f82ebe483b5e872d59e52f4bc4e99cfd63"
      },
      {
        "ref": "file:evidence/116-new-workflow-item-baseline-tests.log",
        "relative_path": "evidence/116-new-workflow-item-baseline-tests.log",
        "raw_file_digest": "sha256:ff33f1877dba64fbde7f2723004bf18b32418a00f5b6d4536bc7caf6b37a127a"
      }
    ]
  },
  "limitations": [
    "This pre-implementation assessment proves the routed technical controls and characterization boundary; final post-refactor replay remains mandatory."
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
