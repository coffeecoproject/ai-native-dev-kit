# Review Surface Card

## Human Decision Summary

Conclusion: I selected 11 review surfaces for the IntentOS repository.

Recommended next step: 先记录审查面，再执行任务；任务完成后按这些审查面逐项复查。

Can AI continue now: limited

What I need from you: 这次是否涉及登录、支付、数据、发布或迁移？ / 是否允许我先生成审查面和执行计划，不直接改文件？ / 是否以项目现有规则为准，只把 IntentOS 作为辅助审查层？

What happens if you do nothing: No files are changed. No CI, hook, document, task state, implementation, release, or production behavior is changed.

## Plain Summary

这一步先确定任务完成后要检查哪些方面：功能是否对、代码是否稳、验证是否充分、遗留问题是否记录、数据是否安全、权限是否正确、体验是否可用、文档是否同步、上线影响是否清楚、现有规则是否保留、安全和隐私是否可控。用户不用自己选技术项，Codex 根据项目判断。

## Project Reading

| Field | Value |
|---|---|
| User mode | `maintainer` |
| Project state | `INTENTOS_REPOSITORY` |
| Existing users assumed | No |
| Can write files now | No |
| Risk level | medium |
| Dirty | Yes |

## Selected Review Surfaces

| Surface | Why | Required before execution | Required after execution | Human decision needed |
|---|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Confirm the change matches the user goal and does not silently change scope. | Yes | Yes | No |
| `CODE_REVIEW` | Check the implementation shape, maintainability, and local conventions. | Yes | Yes | No |
| `VERIFICATION_REVIEW` | Confirm tests, build, lint, or manual evidence are enough for this task. | Yes | Yes | No |
| `DEBT_REVIEW` | Record related debt as fixed, deferred, or needing a decision instead of hiding it. | Yes | Yes | No |
| `DATA_REVIEW` | Data shape, migrations, storage, and API behavior may be affected. | Yes | Yes | Yes |
| `PERMISSION_REVIEW` | Auth, roles, tenant boundaries, or admin access may be affected. | Yes | Yes | Yes |
| `UX_REVIEW` | User-facing screens, routes, or interaction behavior may be affected. | Yes | Yes | No |
| `DOCUMENTATION_REVIEW` | Docs or project instructions may need to stay aligned with the change. | Yes | Yes | No |
| `RELEASE_IMPACT_REVIEW` | CI, deployment, rollback, or production behavior may be affected. | Yes | Yes | Yes |
| `EXISTING_GOVERNANCE_REVIEW` | Existing rules must be mapped and preserved before adding new workflow assets. | Yes | Yes | Yes |
| `SECURITY_PRIVACY_REVIEW` | Secrets, privacy, compliance, finance, or payment risk may be affected. | Yes | Yes | Yes |

## Review Surface Checklist

| Surface | Before execution | After execution | Missing evidence action |
|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Record as not verified or deferred. |
| `CODE_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Record as not verified or deferred. |
| `VERIFICATION_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Record as not verified or deferred. |
| `DEBT_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Record as not verified or deferred. |
| `DATA_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Stop for human decision. |
| `PERMISSION_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Stop for human decision. |
| `UX_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Record as not verified or deferred. |
| `DOCUMENTATION_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Record as not verified or deferred. |
| `RELEASE_IMPACT_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Stop for human decision. |
| `EXISTING_GOVERNANCE_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Stop for human decision. |
| `SECURITY_PRIVACY_REVIEW` | Name the expected evidence before writing. | Report pass, fail, or not verified after writing. | Stop for human decision. |

## Questions For Human

1. 这次是否涉及登录、支付、数据、发布或迁移？
2. 是否允许我先生成审查面和执行计划，不直接改文件？
3. 是否以项目现有规则为准，只把 IntentOS 作为辅助审查层？

## Post-Execution Review Contract

- Per-surface result: after execution, Codex must say pass, fail, or not verified for every selected review surface.
- Unverified surfaces: anything not checked must be named with the reason and owner.
- Debt result: related debt must be recorded as fixed, deferred, or needs human decision.
- Next delivery state: Codex must state whether the task is ready for self-test, internal trial, release review, or blocked.

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
