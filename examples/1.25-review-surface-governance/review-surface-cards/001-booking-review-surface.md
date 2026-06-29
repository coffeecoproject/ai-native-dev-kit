# Review Surface Card

## Human Decision Summary

Conclusion: Codex selected review surfaces for a booking app first slice.

Recommended next step: Record the expected booking path, then implement and close every selected review surface.

Can AI continue now: limited

What I need from you: 是否允许我先生成审查面和执行计划，不直接改文件？

What happens if you do nothing: No files are changed. No CI, hook, document, task state, implementation, release, or production behavior is changed.

## Plain Summary

这个任务涉及预约页面和提交流程。执行后需要检查功能是否对、代码是否稳、页面是否可用、验证是否充分，以及相关遗留问题是否被记录。

## Project Reading

| Field | Value |
|---|---|
| User mode | `plain` |
| Project state | `NEW_PROJECT` |
| Existing users assumed | No |
| Can write files now | No |
| Risk level | low |
| Dirty | No |

## Selected Review Surfaces

| Surface | Why | Required before execution | Required after execution | Human decision needed |
|---|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Confirm booking creation matches the approved user path. | Yes | Yes | No |
| `CODE_REVIEW` | Check component structure and local conventions. | Yes | Yes | No |
| `UX_REVIEW` | Appointment selection and submission are user-facing. | Yes | Yes | No |
| `VERIFICATION_REVIEW` | Confirm at least one local check or manual walkthrough. | Yes | Yes | No |
| `DEBT_REVIEW` | Record deferred backend, notification, or payment concerns. | Yes | Yes | No |

## Review Surface Checklist

| Surface | Before execution | After execution | Missing evidence action |
|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Name expected booking path. | Report pass, fail, or not verified. | Record as not verified or deferred. |
| `CODE_REVIEW` | Name likely components and conventions. | Report pass, fail, or not verified. | Record as not verified or deferred. |
| `UX_REVIEW` | Name main screen states. | Report pass, fail, or not verified. | Record as not verified or deferred. |
| `VERIFICATION_REVIEW` | Name expected verification. | Report pass, fail, or not verified. | Record as not verified or deferred. |
| `DEBT_REVIEW` | Name related debt risk. | Report fixed, deferred, or needs decision. | Stop if hidden debt changes scope. |

## Questions For Human

1. 是否允许我先生成审查面和执行计划，不直接改文件？

## Post-Execution Review Contract

- Per-surface result: pass, fail, or not verified for every selected surface.
- Unverified surfaces: name each surface, reason, and owner.
- Debt result: fixed, deferred, or needs human decision.
- Next delivery state: self-test, internal trial, release review, or blocked.

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

`REVIEW_SURFACE_RECORDED`
