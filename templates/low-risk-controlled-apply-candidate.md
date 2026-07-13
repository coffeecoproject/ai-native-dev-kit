# Low-Risk Controlled Apply Candidate

## Human Summary

Describe the proposed change in one or two plain-language sentences.

## Candidate Scope

| Field | Value |
|---|---|
| Candidate type | documentation / local demo / test-only / config-free code |
| Exact target paths | `docs/example.md` |
| Why this is low risk | Small, local, reversible, and does not touch production-sensitive surfaces. |
| Human decision needed | Yes |

## Required Evidence

| Evidence | Status | Notes |
|---|---|---|
| First-slice scope | Present | Link or describe. |
| Verification plan | Present | Link or describe. |
| Rollback path | Present | Link or describe. |

## Allowed Actions

- Let Codex decide whether this candidate may become a reviewed apply plan from project authority and evidence.
- Prepare a separate apply plan when the internal eligibility checks pass.

## Forbidden Actions

- Do not write target files from this candidate.
- Do not apply changes automatically.
- Do not change CI or hooks.
- Do not touch payment, secrets, production, migration, data, or permissions.

## Verification And Rollback

Verification:

- Run the smallest relevant local check.

Rollback:

- Revert only the exact target paths listed above.

## Boundaries

- This candidate writes files now: No
- This candidate authorizes apply: No
- This candidate approves implementation: No
- This candidate approves release or production: No
- This candidate changes CI or hooks: No
- This candidate touches payment, secrets, production, migration, data, or permissions: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.46.0",
  "artifact_type": "low_risk_apply_candidate",
  "artifact_id": "<candidate-id>",
  "candidate_digest": "sha256:<computed-from-canonical-json-with-candidate_digest-omitted>",
  "intent": "<plain-language intent>",
  "candidate_type": "documentation",
  "target_paths": ["docs/example.md"],
  "risk_level": "LOW",
  "risk_surfaces": [],
  "risk_reasons": [],
  "path_safety": {
    "safe": true,
    "findings": []
  },
  "verification": [
    {
      "method": "Run the smallest relevant local check after a separately approved apply.",
      "evidence_path": "final report or command output after approved apply",
      "owner": "Codex after human approval"
    }
  ],
  "rollback": {
    "required": true,
    "method": "Revert only the exact target paths listed in this candidate.",
    "target_paths": ["docs/example.md"]
  },
  "authority": {
    "writes_now": false,
    "authorizes_apply": false,
    "approves_implementation": false,
    "approves_release_or_production": false,
    "modifies_ci_or_hooks_now": false,
    "touches_payment_secrets_production_migration_data_or_permissions": false
  },
  "outcome": "LOW_RISK_APPLY_CANDIDATE_RECORDED"
}
```

## Outcome

`LOW_RISK_APPLY_CANDIDATE_RECORDED`
