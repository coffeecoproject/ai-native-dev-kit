# Low-Risk Controlled Apply Candidate Review

Use this checklist before treating a proposed change as a low-risk candidate.

- [ ] The record is read-only.
- [ ] Exact target paths are listed.
- [ ] Paths do not use wildcard, parent traversal, absolute paths, home paths, backslashes, generated/dependency paths, ignored paths, symlinks, CI workflows, or hook paths.
- [ ] The candidate avoids CI, hooks, release, deployment, production, payment, permission, authentication, secrets, migrations, database schema, legal, security, and privacy surfaces.
- [ ] Verification is specific.
- [ ] Rollback is specific.
- [ ] New records include valid Machine-Readable Evidence, or the checker is intentionally running in compatibility mode.
- [ ] Human decision remains required before any later apply.
- [ ] The outcome is `LOW_RISK_APPLY_CANDIDATE_RECORDED`, `NOT_READY`, or `BLOCKED`.
