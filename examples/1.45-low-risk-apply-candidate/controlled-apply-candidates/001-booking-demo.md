# Low-Risk Controlled Apply Candidate

## Human Summary

The proposed change is to adjust local booking demo copy inside the example app. It is small, local, reversible, and still needs human approval before any apply plan.

## Candidate Scope

| Field | Value |
|---|---|
| Candidate type | local demo |
| Exact target paths | `examples/mvp-booking-web-app/src/app.js` |
| Why this is low risk | It only affects the local demo example and avoids high-risk surfaces. |
| Human decision needed | Yes |

## Required Evidence

| Evidence | Status | Notes |
|---|---|---|
| First-slice scope | Present | `examples/mvp-booking-web-app/ordinary-first-slices/001-booking-web-app.md` |
| Verification plan | Present | `npm test --prefix examples/mvp-booking-web-app` |
| Rollback path | Present | Revert the exact target path. |

## Allowed Actions

- Ask the human whether to prepare a separate apply plan.
- Prepare a separate apply plan only after the human agrees.

## Forbidden Actions

- Do not write target files from this candidate.
- Do not apply changes automatically.
- Do not change CI or hooks.
- Do not touch payment, secrets, production, migration, data, or permissions.

## Verification And Rollback

Verification:

- Run `npm test --prefix examples/mvp-booking-web-app`.

Rollback:

- Revert only `examples/mvp-booking-web-app/src/app.js`.

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
  "artifact_id": "update-local-booking-demo-copy-examples-mvp-booking-web-app-src",
  "candidate_digest": "sha256:664ed781f4cf44665860f0027443bd376edec443f923889eccdf1eb852721685",
  "intent": "update local booking demo copy",
  "candidate_type": "local demo",
  "target_paths": [
    "examples/mvp-booking-web-app/src/app.js"
  ],
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
    "target_paths": [
      "examples/mvp-booking-web-app/src/app.js"
    ]
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
