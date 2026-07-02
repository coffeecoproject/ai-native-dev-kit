# Guided Closure Card

## Human Decision Summary

Conclusion: This can move to review summary. The task has passing verification evidence, but commit and release approval remain separate.

Recommended next step: Prepare a review summary with changed scope, verification, remaining debt, and evidence links.

Can AI continue now: limited

What I need from you: Confirm whether Codex should prepare a review summary instead of committing or pushing.

What happens if you do nothing: No files are changed. No task state, commit, push, release, production, CI, hook, or approval behavior is changed.

## Plain Close-Out Status

| Field | Value |
|---|---|
| Closure state | `READY_FOR_REVIEW` |
| Can count as done | Limited |
| Plain reason | The work has enough evidence to prepare a review summary, but this is not approval to submit, publish, or launch. |

## What I Checked

| Area | Status | Finding | Next action |
|---|---|---|---|
| Task intent | `PASS` | A task intent was provided. | Keep closure tied to this task. |
| Changed files | `NEEDS_REVIEW` | 3 changed files detected. | Review changed scope before commit review. |
| Verification | `PASS` | Verification evidence was provided. | Keep the verification evidence with the close-out. |
| Related surfaces | `PASS` | 1 related-surface report found. | Keep closure scope limited to the checked surfaces. |
| Evidence freshness | `NEEDS_REVIEW` | 1 close-out report found. | Make sure the close-out evidence belongs to this task. |

## What Is Still Needed

1. Nothing obvious from this read-only pass; keep review and release approval separate.

## What Codex Can Do Next

1. Prepare a review summary with changed scope, verification, remaining debt, and evidence links.

## What Needs Human Decision

1. Confirm whether Codex should prepare a review summary instead of committing or pushing.

## Technical Details

| Field | Value |
|---|---|
| Intent | `booking form phone validation` |
| Changed files detected | `3` |
| Impact coverage reports found | `1` |
| Execution closure reports found | `1` |
| Verification provided | `Yes` |
| Internal checks selected | project path guidance, close-out readiness, related surface coverage |

## Boundaries

- This card writes target files: No
- This card authorizes apply: No
- This card approves implementation: No
- This card approves commit or push: No
- This card approves release or production: No
- This card modifies CI or hooks: No
- This card changes task state: No
- This card forgives debt: No
- This card replaces Review Loop: No
- This card replaces Safe Launch: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`CLOSURE_GUIDANCE_RECORDED`
