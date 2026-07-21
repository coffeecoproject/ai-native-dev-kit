# Control Effectiveness Report

This read-only report proves the bounded controls relied on by the current task. It grants no write, release, or production authority.

## Human Summary

All 9 currently relied-on controls are tied to their exact implementation, complete inventory, staged candidate, and current pre-runtime positive and failure-path proof.

## Assessment Purpose

`TASK` assessment for `task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98`; it proves only the bounded controls required by this current task.

## Control Claims

- `claim:package-script-verify-candidate`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-runtime-trust-core`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-runtime-trust`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-consumer-chain-candidate`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-baseline`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-example-observed-evidence`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-release-topology-consumers`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:package-script-verify-planning-closure`: `CONTROL_PROVEN_EFFECTIVE`
- `claim:file-scripts-check-apply-execution-receipt-mjs`: `CONTROL_PROVEN_EFFECTIVE`

## Scope And Exclusions

The complete declared and observed inventory is `file:evidence/113-control-inventory.json`. No control outside that task-bound inventory is claimed.

## Semantic And Failure Proof

Every claim is bound to its exact implementation and to the current positive and failure-path proof in `file:evidence/113-control-proof.log`.

## Evidence Identity And Freshness

Evidence is current only for project revision `sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a` and becomes stale when implementation, inventory, proof, or consumer composition changes.

## Dynamic Assessment Safety

The bounded npm adapter used no network, secrets, production resource, shell composition, or broad cleanup.

## Dependent Consumers

- `package-script:verify:candidate` strictly relies on `claim:package-script-verify-candidate`.
- `package-script:verify:runtime-trust:core` strictly relies on `claim:package-script-verify-runtime-trust-core`.
- `package-script:verify:runtime-trust` strictly relies on `claim:package-script-verify-runtime-trust`.
- `package-script:verify:consumer-chain:candidate` strictly relies on `claim:package-script-verify-consumer-chain-candidate`.
- `package-script:verify:baseline` strictly relies on `claim:package-script-verify-baseline`.
- `package-script:verify:example-observed-evidence` strictly relies on `claim:package-script-verify-example-observed-evidence`.
- `package-script:verify:release-topology-consumers` strictly relies on `claim:package-script-verify-release-topology-consumers`.
- `package-script:verify:planning-closure` strictly relies on `claim:package-script-verify-planning-closure`.
- `scripts/check-apply-execution-receipt.mjs` strictly relies on `claim:file-scripts-check-apply-execution-receipt-mjs`.

## Limitations

This report proves current control behavior, not product correctness, business correctness, release approval, or production safety.

## Boundaries

The report authorizes no implementation, writes, release, production, or external effect.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.110.0",
  "artifact_type": "control_effectiveness",
  "assessment_id": "assessment:1.113-cross-domain-trust-closure",
  "assessment_purpose": "TASK",
  "report_ref": "control-effectiveness-reports/113-cross-domain-trust-closure.md",
  "report_digest": "sha256:72c8b436fa6fff5ab18875cd7eb640d50b5377e5d00fd1ef2fa111e8b6f35057",
  "task_ref": "task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98",
  "intent_digest": "sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d",
  "required_claim_ids": [
    "claim:package-script-verify-candidate",
    "claim:package-script-verify-runtime-trust-core",
    "claim:package-script-verify-runtime-trust",
    "claim:package-script-verify-consumer-chain-candidate",
    "claim:package-script-verify-baseline",
    "claim:package-script-verify-example-observed-evidence",
    "claim:package-script-verify-release-topology-consumers",
    "claim:package-script-verify-planning-closure",
    "claim:file-scripts-check-apply-execution-receipt-mjs"
  ],
  "control_claims": [
    {
      "claim_id": "claim:package-script-verify-candidate",
      "claim_digest": "sha256:368e256f518e47e6c2adc05c9373b0bf3b5eaf2bc779a4935eb66eaad8662d18",
      "control_id": "package-script:verify:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:candidate rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:candidate enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:candidate",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-runtime-trust-core",
      "claim_digest": "sha256:7e2e368a04d248eba733c07fc06e63d0292d3378ac9f5ee46deea679658032ae",
      "control_id": "package-script:verify:runtime-trust:core",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:runtime-trust:core rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:runtime-trust:core",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:runtime-trust:core enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:runtime-trust:core"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:runtime-trust:core",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-runtime-trust",
      "claim_digest": "sha256:ba5217383ad04076ac3259d94f0e1761868958c151d5554be97f02a5d9846257",
      "control_id": "package-script:verify:runtime-trust",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:runtime-trust rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:runtime-trust",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:runtime-trust enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:runtime-trust"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:runtime-trust",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-consumer-chain-candidate",
      "claim_digest": "sha256:368c0f605fca5cd009d8683a97905a78742ca4a146b1dc6270a336f48fe13bc3",
      "control_id": "package-script:verify:consumer-chain:candidate",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:consumer-chain:candidate rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:consumer-chain:candidate",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:consumer-chain:candidate enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:consumer-chain:candidate"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:consumer-chain:candidate",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-baseline",
      "claim_digest": "sha256:ff28391087eee873944b9bf90c93620cf6651c7a8f509b1687c60975ac620142",
      "control_id": "package-script:verify:baseline",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:baseline rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:baseline",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:baseline enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:baseline"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:baseline",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-example-observed-evidence",
      "claim_digest": "sha256:5d9729484d1d310919cbc80bb958c31231baef4969c4191b608de4b933ed076d",
      "control_id": "package-script:verify:example-observed-evidence",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:example-observed-evidence rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:example-observed-evidence",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:example-observed-evidence enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:example-observed-evidence"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:example-observed-evidence",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-release-topology-consumers",
      "claim_digest": "sha256:d9970765b98b5f76ea5ee7dc8fee808e10b4aa37c9d46b63a71027a43056e747",
      "control_id": "package-script:verify:release-topology-consumers",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:release-topology-consumers rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:release-topology-consumers",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:release-topology-consumers enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:release-topology-consumers"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:release-topology-consumers",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:package-script-verify-planning-closure",
      "claim_digest": "sha256:5544986b1557b153093e7c8f9bf47915cc405f88041980ba5b62b5c31be86575",
      "control_id": "package-script:verify:planning-closure",
      "origin": "PROJECT_NATIVE",
      "summary": "Project package script verify:planning-closure rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
      "enforcement_level": "BLOCKING",
      "protected_surface": "package-script:verify:planning-closure",
      "implementation_bindings": [
        {
          "ref": "file:package.json",
          "digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
          "role": "IMPLEMENTATION"
        }
      ],
      "semantic_assessment": {
        "declared_assertion": "package-script:verify:planning-closure enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "package-script:verify:planning-closure"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:package.json",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "package-script:verify:planning-closure",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    },
    {
      "claim_id": "claim:file-scripts-check-apply-execution-receipt-mjs",
      "claim_digest": "sha256:1c26f7ff10eec8b809896f349d4b2dd8da37ba0de5de825da8295c092ddcc19d",
      "control_id": "file:scripts/check-apply-execution-receipt.mjs",
      "origin": "PROJECT_NATIVE",
      "summary": "Project control implemented by scripts/check-apply-execution-receipt.mjs rejects invalid current-task candidates and remains bound to its strict consumer composition.",
      "category": "SECURITY_OR_PERMISSION_BOUNDARY",
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
        "declared_assertion": "scripts/check-apply-execution-receipt.mjs enforces its current-task trust boundary.",
        "observed_assertion": "The current pre-runtime positive and failure-path suite passed for the exact staged candidate and generated-project consumers.",
        "match": "MATCH",
        "evidence_refs": [
          "file:evidence/113-control-proof.log"
        ]
      },
      "scope_assessment": {
        "declared_inventory_ref": "file:evidence/113-control-inventory.json",
        "declared_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "observed_inventory_ref": "file:evidence/113-control-inventory.json",
        "observed_inventory_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7",
        "included_items": [
          "scripts/check-apply-execution-receipt.mjs"
        ],
        "exclusions": [],
        "completeness": "COMPLETE"
      },
      "freshness_assessment": {
        "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a",
        "environment": "isolated-local-process",
        "run_id": "run:1.113-control:pre-runtime-208",
        "observed_at": "2026-07-20T17:22:57.629Z",
        "valid_until": "until source, candidate, inventory, proof, or consumer composition changes",
        "status": "CURRENT"
      },
      "failure_proof": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "safe": "Yes",
        "cleanup_proven": "Yes"
      },
      "dynamic_assessment": {
        "required": "Yes",
        "state": "PROVEN",
        "evidence_ref": "file:evidence/113-control-proof.log",
        "output_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514",
        "exit_code": 0,
        "adapter": {
          "adapter_id": "npm-verify-pre-runtime",
          "executable": "npm",
          "arguments": [
            "run",
            "verify:pre-runtime"
          ],
          "working_directory": ".",
          "environment_allowlist": [
            "PATH"
          ],
          "timeout_ms": 1800000,
          "expected_exit_codes": [
            0
          ],
          "declared_effects": [
            "temporary test fixtures only"
          ],
          "network_required": "No",
          "secrets_required": "No",
          "production_prohibited": "Yes",
          "cleanup_required": "No",
          "cleanup_owner": "run:1.113-control:pre-runtime-final"
        }
      },
      "effectiveness_dimensions": [
        {
          "dimension": "IMPLEMENTATION_IDENTITY",
          "state": "PROVEN",
          "reason": "IMPLEMENTATION_IDENTITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SEMANTIC_MATCH",
          "state": "PROVEN",
          "reason": "SEMANTIC_MATCH is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "SCOPE_COMPLETENESS",
          "state": "PROVEN",
          "reason": "SCOPE_COMPLETENESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "EVIDENCE_IDENTITY_AND_FRESHNESS",
          "state": "PROVEN",
          "reason": "EVIDENCE_IDENTITY_AND_FRESHNESS is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "FAILURE_CAPABILITY",
          "state": "PROVEN",
          "reason": "FAILURE_CAPABILITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "RESULT_INTEGRITY",
          "state": "PROVEN",
          "reason": "RESULT_INTEGRITY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        },
        {
          "dimension": "OPERATIONAL_SAFETY",
          "state": "PROVEN",
          "reason": "OPERATIONAL_SAFETY is bound to the exact implementation, complete inventory, staged candidate, and current positive and failure-path proof.",
          "evidence_refs": [
            "file:scripts/check-apply-execution-receipt.mjs",
            "file:evidence/113-control-inventory.json",
            "file:evidence/113-control-proof.log"
          ]
        }
      ],
      "consumers": [
        {
          "consumer_id": "scripts/check-apply-execution-receipt.mjs",
          "claim_use": "Blocks the current task when its bounded trust condition is invalid.",
          "strict_reliance": "Yes"
        }
      ],
      "state": "CONTROL_PROVEN_EFFECTIVE",
      "reason_codes": [],
      "limitations": [
        "Proof is bounded to the current 1.113 staged candidate and current pre-runtime suite."
      ]
    }
  ],
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
        "ref": "file:package.json",
        "relative_path": "package.json",
        "raw_file_digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e"
      },
      {
        "ref": "file:scripts/check-apply-execution-receipt.mjs",
        "relative_path": "scripts/check-apply-execution-receipt.mjs",
        "raw_file_digest": "sha256:9fd243da8952288d3b1cb2e0673fc2220d8c49ff7d41ab042707864fecbe86cd"
      },
      {
        "ref": "file:evidence/113-control-inventory.json",
        "relative_path": "evidence/113-control-inventory.json",
        "raw_file_digest": "sha256:477d57996ed1158be8c0b8bf3ca02aec9975ddb01fdae80e71a44994828e56e7"
      },
      {
        "ref": "file:evidence/113-control-proof.log",
        "relative_path": "evidence/113-control-proof.log",
        "raw_file_digest": "sha256:89f65e279dba2a8a87971b78b3ce7f78afce323cabba2ee239d987f883de3514"
      }
    ]
  },
  "limitations": [
    "Proof is bounded to this staged candidate and does not claim product correctness."
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
