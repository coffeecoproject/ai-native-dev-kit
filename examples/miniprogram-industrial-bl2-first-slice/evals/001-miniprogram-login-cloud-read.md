# Eval 001: Mini Program Login Cloud Read

## Related Spec

`specs/001-miniprogram-login-cloud-read.md`

## Must Pass

- Scope stays limited to Mini Program runtime and protected read behavior.
- Admin backend, payment, production release, production config, secrets, and real user data remain out of scope.
- Evidence refs are concrete project files.

## Spec Alignment

- Login state and protected read behavior are covered.
- Runtime states are covered.
- Cloud/API failure and denied states are covered.
- Release-readiness evidence is covered without approving production release.

## Permission / Data Checks

- Protected read boundary is server-side or cloud-rule enforced.
- Client-only filtering is rejected.
- Client storage does not retain sensitive personal data.
- Evidence does not include secrets, real tokens, or production identifiers.

## Manual Review Checklist

- Runtime evidence is complete for the example slice.
- Release record names rollback/mitigation and monitoring.
- Human approval scope excludes production release and admin backend.

## Reject Conditions

- The task introduces payment or admin backend behavior.
- The task requires production credentials or production config.
- The task uses real user data in evidence.
- The task treats example evidence as production approval.

## Required Evidence

Summary: Mini Program runtime, login, permission, cloud boundary, privacy, and release-readiness evidence must be linked before implementation.

Runtime:

- mini program loading-empty-error-forbidden evidence
- mini program lifecycle evidence
- navigation and return-path evidence
- critical flow behavior evidence

Login and permission:

- WeChat login state evidence
- session binding evidence
- denied permission evidence
- platform permission prompt evidence
- privacy authorization evidence

Cloud and storage:

- cloud function boundary evidence
- cloud access rule evidence
- storage access evidence
- API failure and recovery evidence
- client storage minimization evidence
- sensitive data handling evidence

Not-applicable evidence:

- subscription message authorization evidence
- share entry behavior evidence

Release:

- production configuration review
- experience version evidence
- release submission readiness
- platform review readiness
- rollback or mitigation plan
- monitoring evidence
