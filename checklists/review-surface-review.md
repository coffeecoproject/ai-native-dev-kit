# Review Surface Review Checklist

Use this checklist when reviewing a Review Surface Card.

## Required Structure

- [ ] Human Decision Summary is present.
- [ ] Plain Summary is understandable without workflow jargon.
- [ ] Project Reading records project state, write permission, risk level, and dirty state.
- [ ] Selected Review Surfaces are listed.
- [ ] Review Surface Checklist maps before/after expectations.
- [ ] Questions For Human stay within the question limit.
- [ ] Post-Execution Review Contract is present.
- [ ] Boundaries are all `No`.
- [ ] Outcome is one of the allowed values.

## Required Surfaces

- [ ] `FUNCTIONAL_REVIEW` is present.
- [ ] `CODE_REVIEW` is present.
- [ ] `VERIFICATION_REVIEW` is present.
- [ ] `DEBT_REVIEW` is present.

## Risk Surfaces

- [ ] Data, migration, storage, or API data changes add `DATA_REVIEW`.
- [ ] Login, role, tenant, admin, or permission changes add `PERMISSION_REVIEW`.
- [ ] User-facing screens or interaction changes add `UX_REVIEW`.
- [ ] Docs or project rules changes add `DOCUMENTATION_REVIEW`.
- [ ] CI, deployment, rollback, or production impact adds `RELEASE_IMPACT_REVIEW`.
- [ ] Existing strong governance adds `EXISTING_GOVERNANCE_REVIEW`.
- [ ] Secrets, privacy, compliance, payment, or finance impact adds `SECURITY_PRIVACY_REVIEW`.

## Boundary Review

- [ ] The card does not approve implementation.
- [ ] The card does not approve release or production.
- [ ] The card does not approve high-risk domain decisions.
- [ ] The card does not change files, CI, hooks, documents, or task state.

## Close-Out Review

- [ ] After execution, every selected surface has pass, fail, or not verified.
- [ ] Unverified surfaces are explicit.
- [ ] Debt is fixed, deferred, or stopped for decision.
- [ ] Next delivery state is stated.
