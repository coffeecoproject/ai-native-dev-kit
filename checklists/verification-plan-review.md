# Verification Plan Review Checklist

- [ ] The plan has task-bound structured evidence.
- [ ] `verification_plan_ref` points to the current report.
- [ ] `verification_plan_digest` is present and valid.
- [ ] Business-rule tasks cite a READY Business Rule Closure.
- [ ] The plan cites Change Impact Coverage.
- [ ] Required affected surfaces have verification obligations.
- [ ] API surfaces include positive and negative checks, unless explicitly not applicable.
- [ ] Backend rules are not verified by UI-only evidence.
- [ ] Frontend UI behavior is not verified by API-only evidence.
- [ ] Broad test commands map to specific obligations.
- [ ] Codex-generated or high-risk tests include correctness controls.
- [ ] Manual verification has owner and decision refs when required.
- [ ] The plan does not approve implementation, release, production, or product correctness.

