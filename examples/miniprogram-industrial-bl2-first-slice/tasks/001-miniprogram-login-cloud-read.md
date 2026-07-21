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
- [ ] production config
- [ ] secrets
- [x] personal data
- [ ] regulated data
- [ ] external side effect
- [ ] privileged operation
- [ ] app signing / platform release
- [x] cloud function / access rule
- [ ] form interaction
- [x] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

Checked project-local technical risks require Codex to apply the corresponding verification controls. Human consent is required only if the task later introduces a concrete real-world effect.

## Human Approval

Required: No
Status: Not Required
Reason: This example performs only reversible project-local verification and has no production submission, paid, destructive, legal, privacy-impacting, or other real-world effect.

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
