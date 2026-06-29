# Review Surface Card

## Human Decision Summary

Conclusion: <which review surfaces Codex selected and why>

Recommended next step: <one next step before execution>

Can AI continue now: <yes / limited / no>

What I need from you: <up to three decisions, or up to five for high risk>

What happens if you do nothing: <safe default>

## Plain Summary

<Explain in non-specialist language which areas must be checked and why.>

## Project Reading

| Field | Value |
|---|---|
| User mode | `plain` |
| Project state | `<NEW_PROJECT / EXISTING_LIGHT_PROJECT / EXISTING_GOVERNED_PROJECT / PRODUCTION_SENSITIVE_PROJECT / DIRTY_WORKTREE_PROJECT / DEV_KIT_REPOSITORY / UNKNOWN_PROJECT>` |
| Existing users assumed | `<Yes / No / Unknown treated as Yes>` |
| Can write files now | `No` |
| Risk level | `<low / medium / high / unknown>` |
| Dirty | `<Yes / No / Unknown>` |

## Selected Review Surfaces

| Surface | Why | Required before execution | Required after execution | Human decision needed |
|---|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Confirm the change matches the user goal and approved scope. | Yes | Yes | No |
| `CODE_REVIEW` | Check implementation shape and local conventions. | Yes | Yes | No |
| `VERIFICATION_REVIEW` | Confirm test, build, lint, or manual evidence. | Yes | Yes | No |
| `DEBT_REVIEW` | Record related debt as fixed, deferred, or needing decision. | Yes | Yes | No |

## Review Surface Checklist

| Surface | Before execution | After execution | Missing evidence action |
|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Name expected behavior. | Report pass, fail, or not verified. | Record as not verified or deferred. |
| `CODE_REVIEW` | Name likely files and conventions. | Report pass, fail, or not verified. | Record as not verified or deferred. |
| `VERIFICATION_REVIEW` | Name expected verification. | Report pass, fail, or not verified. | Record as not verified or deferred. |
| `DEBT_REVIEW` | Name related debt risk. | Report fixed, deferred, or needs decision. | Stop if hidden debt changes scope. |

## Questions For Human

1. <question one>
2. <question two>
3. <question three>

## Post-Execution Review Contract

- Per-surface result: <pass / fail / not verified for every selected surface>
- Unverified surfaces: <surface, reason, owner>
- Debt result: <fixed / deferred / needs human decision>
- Next delivery state: <self-test / internal trial / release review / blocked>

## Boundaries

- This card writes target files: No
- This card modifies CI: No
- This card installs hooks: No
- This card deletes or archives documents: No
- This card changes task state: No
- This card approves implementation: No
- This card approves release or production: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`<REVIEW_SURFACE_RECORDED / NEEDS_HUMAN_DECISION / BLOCKED>`
