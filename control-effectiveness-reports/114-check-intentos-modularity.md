# Control Effectiveness Report

This report does not authorize implementation, writes, CI or hook changes, adoption apply, release, production, or completion. It does not prove product or business correctness.

## Human Summary

The exact eight controls routed by current Task Governance are bound to their current implementations and a passing 72-test focused run.

## Assessment Purpose

`TASK` for `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2`.

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

The complete routed control inventory is recorded in `evidence/114-check-intentos-control-inventory.json`; no routed claim is excluded.

## Semantic And Failure Proof

The focused run covers the modular entry contract and execution/distribution positive and fail-closed cases.

## Evidence Identity And Freshness

Implementation, inventory, and proof files are current-file digest bound.

## Dynamic Assessment Safety

The local Node test process used no network, secrets, release, or production path.

## Dependent Consumers

Current Task Governance is the strict consumer of all eight claims.

## Limitations

Proof is limited to this staged structural candidate and local test environment.

## Boundaries

This assessment is non-authorizing; final completion still requires the remaining evidence chain and unified-entry replay.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.110.0",
  "artifact_type": "control_effectiveness",
  "assessment_id": "assessment:114-check-intentos-modularity",
  "assessment_purpose": "TASK",
  "report_ref": "control-effectiveness-reports/114-check-intentos-modularity.md",
  "report_digest": "sha256:fdf02744c8a89600e03ad4308f3bfa934e1322369ec2806c65fb9268dae3750d",
  "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
  "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
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
      "claim_digest": "sha256:cc4453016412cf679f83e31bf1dc1ccdce63646dd65c13f420070e553cdcaee0",
      "control_id": "package-script:verify:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:candidate remains current and participates in the staged self-check and distribution-trust proof.",
      "category": "RELEASE_ROLLBACK_OR_OPERATIONAL_READINESS",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:e8ae0c97044bf6fa095c35a342f801d4125dc2245e808a861c41d7e8272db7f1",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:candidate remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "package-script:verify:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:candidate",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-consumer-chain-candidate",
      "claim_digest": "sha256:657ab1468ed0d53584d0d172b890cf0b6b31ba1407fff834d9644e733c965004",
      "control_id": "package-script:verify:consumer-chain:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:consumer-chain:candidate remains current and participates in the staged self-check and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:consumer-chain:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:e8ae0c97044bf6fa095c35a342f801d4125dc2245e808a861c41d7e8272db7f1",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:consumer-chain:candidate remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "package-script:verify:consumer-chain:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:consumer-chain:candidate",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-adoption-assurance-mjs",
      "claim_digest": "sha256:e04ac6c603d380a19baa68fa4c349c3d57641a9c15b05d1f61e2449e252a5217",
      "control_id": "file:scripts/check-adoption-assurance.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "Project control implemented by scripts/check-adoption-assurance.mjs remains current and participates in the staged self-check and distribution-trust proof.",
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
        "declared_assertion": "scripts/check-adoption-assurance.mjs remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "scripts/check-adoption-assurance.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-adoption-assurance.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-adoption-assurance.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-ai-workflow-mjs",
      "claim_digest": "sha256:8ecf1eb2e0c451f3704e85434629e40d1a2bf12d867881a5ff0d4af5f87c4baf",
      "control_id": "file:scripts/check-ai-workflow.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "Project control implemented by scripts/check-ai-workflow.mjs remains current and participates in the staged self-check and distribution-trust proof.",
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
        "declared_assertion": "scripts/check-ai-workflow.mjs remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "scripts/check-ai-workflow.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-ai-workflow.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-ai-workflow.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-apply-execution-receipt-mjs",
      "claim_digest": "sha256:af0562bd05e417badc8c2109600502ee0c8d2fba28a7244c7da0a5de982e3117",
      "control_id": "file:scripts/check-apply-execution-receipt.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "Project control implemented by scripts/check-apply-execution-receipt.mjs remains current and participates in the staged self-check and distribution-trust proof.",
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
        "declared_assertion": "scripts/check-apply-execution-receipt.mjs remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "scripts/check-apply-execution-receipt.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-apply-execution-receipt.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-apply-plan-mjs",
      "claim_digest": "sha256:630bd42565599b813432cd807e2191ddd0049e681c708d13af8b2ce6510f6595",
      "control_id": "file:scripts/check-apply-plan.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "Project control implemented by scripts/check-apply-plan.mjs remains current and participates in the staged self-check and distribution-trust proof.",
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
        "declared_assertion": "scripts/check-apply-plan.mjs remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "scripts/check-apply-plan.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-plan.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-apply-plan.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-approval-record-mjs",
      "claim_digest": "sha256:7520d6f048e7f2eef0567efdc6f454123fa3b92a7f6e2c683f4decffb57d2db4",
      "control_id": "file:scripts/check-approval-record.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "Project control implemented by scripts/check-approval-record.mjs remains current and participates in the staged self-check and distribution-trust proof.",
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
        "declared_assertion": "scripts/check-approval-record.mjs remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "scripts/check-approval-record.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-approval-record.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-approval-record.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-baseline-enforcement-mjs",
      "claim_digest": "sha256:2d1f9cf3319e8777ed48dc248c4a2cbdeca299130f2c1e5cc5485cdc43bdb126",
      "control_id": "file:scripts/check-baseline-enforcement.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "Project control implemented by scripts/check-baseline-enforcement.mjs remains current and participates in the staged self-check and distribution-trust proof.",
      "category": "POLICY_OR_SCHEMA_CONFORMANCE",
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
        "declared_assertion": "scripts/check-baseline-enforcement.mjs remains an enforceable project-native control after the self-check structural split.",
        "observed_assertion": "The exact staged implementation identity is bound, the modular suite contract passes, and the 72-test execution/distribution trust suite passes its positive and fail-closed cases.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/114-check-intentos-control-inventory.json",
          "file:evidence/114-check-intentos-focused-tests.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "declared_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "observed_inventory_ref": "file:evidence/114-check-intentos-control-inventory.json",
        "observed_inventory_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671",
        "included_items": [
          "scripts/check-baseline-enforcement.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "current-staged-candidate-4d15088",
        "environment": "isolated-local-process-node-23.11.0",
        "run_id": "run:1.114-check-intentos-focused-72",
        "observed_at": "2026-07-22T00:00:00.000Z",
        "valid_until": "until source, manifest, package script, focused proof, or staged candidate changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/114-check-intentos-focused-tests.log",
        "output_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "node-focused-self-check-and-distribution-trust",
          "executable": "node",
          "arguments": [
            "--test",
            "tests/check-intentos-modularity.test.mjs",
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
            "writes evidence/114-check-intentos-focused-tests.log"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.114-check-intentos-focused-72"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete routed inventory, and current focused positive/failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-baseline-enforcement.mjs",
            "file:evidence/114-check-intentos-control-inventory.json",
            "file:evidence/114-check-intentos-focused-tests.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-baseline-enforcement.mjs",
          "claim_use": "Current Task Governance requires this bounded control claim before completion.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current staged structural-refactor candidate and local non-production test process."
      ]
    }
  ],
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
        "ref": "file:package.json",
        "relative_path": "package.json",
        "raw_file_digest": "sha256:e8ae0c97044bf6fa095c35a342f801d4125dc2245e808a861c41d7e8272db7f1"
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
        "ref": "file:evidence/114-check-intentos-control-inventory.json",
        "relative_path": "evidence/114-check-intentos-control-inventory.json",
        "raw_file_digest": "sha256:ed7228c73a5336740a9fae92c1591f9732fd3093055f48f6bd9907f0394a5671"
      },
      {
        "ref": "file:evidence/114-check-intentos-focused-tests.log",
        "relative_path": "evidence/114-check-intentos-focused-tests.log",
        "raw_file_digest": "sha256:094d71df0ee28d5eb57ba736215c148f7aa952fb17086725b26440f628b0d38e"
      }
    ]
  },
  "limitations": [
    "The assessment proves the routed technical controls for this staged refactor; it does not prove product or production correctness."
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
