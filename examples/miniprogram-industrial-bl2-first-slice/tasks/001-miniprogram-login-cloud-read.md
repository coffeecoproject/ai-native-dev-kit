# Task 001: Mini Program Login Cloud Read

## Task Level

L3

## Related Spec

`specs/001-miniprogram-login-cloud-read.md`

## Related Eval

`evals/001-miniprogram-login-cloud-read.md`

## Goal

Prepare one evidence-backed Mini Program login and protected cloud read slice.

## Scope

Allowed:

- define or implement one Mini Program protected read page
- define or implement WeChat login state handling for the page
- define or implement one read-only cloud function or API boundary
- define or document loading, empty, success, error, forbidden, denied-permission, and recovery states
- collect runtime, cloud boundary, permission, privacy, and review-readiness evidence

Not allowed:

- production release submission
- production config change
- secrets
- payment, refund, balance, or value transfer
- admin backend or operations console behavior
- destructive action
- framework or cloud provider decision

## Acceptance Criteria

- The linked eval evidence terms are satisfied.
- The runtime evidence record is complete for this slice.
- The release record includes experience version, platform review readiness, rollback/mitigation, monitoring, and residual risk notes.
- No out-of-scope production, payment, admin backend, destructive, framework, or provider change is introduced.

## Commands

Run:

```bash
scripts/verify.sh
```

Replace with project-specific lint, typecheck, test, build, Mini Program developer tool, cloud function, access-rule, or release-readiness commands in a real project.

## AI Budget

Max agent runs: 1
Max repair runs: 1
Use high reasoning model: No
Stop if: login boundary, cloud access rule, evidence ownership, or release scope is unclear.

## Risk Gate

This task touches:

- [x] auth
- [x] permission
- [ ] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [x] production config
- [ ] secrets
- [x] personal data
- [ ] regulated data
- [x] external side effect
- [ ] privileged operation
- [x] app signing / platform release
- [x] cloud function / access rule
- [ ] form interaction
- [x] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

If any item is checked, implementation requires explicit human approval before code changes.

## Human Approval

Required: Yes
Status: Approved
Approval scope: Example-only Mini Program BL2 slice covering auth, permission, personal data handling, cloud function/access rule, API failure, production configuration review, and platform release readiness evidence. No production release, production config change, secrets, payment, admin backend, destructive behavior, framework decision, or provider decision approved.
Approved by: human-review
Approved at: 2026-06-26T00:00:00.000Z
Approval notes: Evidence-only dogfood example accepted.

## Stop Conditions

Stop and report if:

- login or cloud access boundary requires production credentials
- evidence refs cannot be made concrete
- task requires payment, admin backend, production config, or production release
- task expands beyond the first Mini Program runtime quality slice

## Final Report Required

- What changed
- What did not change
- Tests or evidence recorded
- Risks remaining
- Suggested next step
