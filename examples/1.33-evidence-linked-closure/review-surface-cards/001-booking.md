# Review Surface Card

## Selected Review Surfaces

| Surface | Why | Required before execution | Required after execution | Human decision needed |
|---|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Booking validation must match the approved first-slice path. | Yes | Yes | No |
| `CODE_REVIEW` | Local component and validation structure must stay scoped. | Yes | Yes | No |
| `UX_REVIEW` | Validation messages are user-facing. | Yes | Yes | No |
| `VERIFICATION_REVIEW` | Local verification must pass. | Yes | Yes | No |
| `DEBT_REVIEW` | Deferred reminder work must be named. | Yes | Yes | No |

## Boundaries

- This card writes target files: No
- This card approves implementation: No
- This card approves release or production: No

## Outcome

`REVIEW_SURFACE_RECORDED`
