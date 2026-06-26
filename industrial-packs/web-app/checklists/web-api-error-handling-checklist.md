# Web API Error Handling Checklist

- [ ] Timeout or network failure behavior is defined for critical flows.
- [ ] Unauthorized behavior is defined where auth exists.
- [ ] Forbidden behavior is defined where permissions exist.
- [ ] Validation error behavior is user-visible and recoverable where forms exist.
- [ ] Server error behavior is user-visible and does not expose sensitive details.
- [ ] Retry, refresh, or fallback behavior is defined when appropriate.
- [ ] Stale, optimistic, or cached data behavior is reviewed when it affects user decisions.
- [ ] Skipped checks have rationale and residual risk owner.
