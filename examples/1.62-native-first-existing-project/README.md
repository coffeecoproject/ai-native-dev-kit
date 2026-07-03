# 1.62 Native-First Existing Project Migration Examples

These examples show how IntentOS should enter existing projects without direct writes.

| Example | Expected posture |
| --- | --- |
| `light-web` | `NATIVE_FIRST_MIGRATION` |
| `governed-admin` | `NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW` |
| `production-maintained` | `PRODUCTION_SAFE_NATIVE_OVERLAY` |
| `dirty-worktree` | `NATIVE_FIRST_PENDING_WORKTREE_REVIEW` |

All examples are planning records only. They do not approve implementation, release, production, CI, hook, or high-risk changes.
