# Eval 001: Web Runtime Quality Slice

## Related Spec

`specs/001-web-runtime-quality.md`

## Must Pass

- [ ] verification command or equivalent evidence is recorded
- [ ] Web runtime evidence is linked
- [ ] release record is linked
- [ ] no production config, secret, dependency, destructive action, or framework decision is introduced

## Spec Alignment

- [ ] protected browser flow remains narrow
- [ ] loading, empty, success, error, forbidden, and recovery states are covered
- [ ] form validation and duplicate-submit behavior are covered
- [ ] API failure behavior is covered
- [ ] accessibility and performance review are covered

## Permission / Data Checks

- [ ] server-side permission test evidence is present
- [ ] forbidden state evidence is present
- [ ] resource scope evidence is present
- [ ] no real user data or secret appears in evidence

## Manual Review Checklist

- Is the evidence project-specific in a real project?
- Does the task avoid framework and hosting decisions?
- Are skipped checks marked with reasons and owners?

## Reject Conditions

Reject if:

- evidence refs are incomplete or missing
- Risk Gate omits permission, form interaction, api failure, accessibility, or performance while the spec still touches them
- task expands into production release, dependency addition, or destructive behavior
- release record lacks rollback or monitoring notes

## Required Evidence

- Web runtime evidence: include loading-empty-error-forbidden evidence, success and layout stability evidence, responsive behavior evidence, critical flow behavior evidence.
- Form evidence: include form submission validation and duplicate-submit evidence; destructive action and recovery evidence is not applicable because no destructive action is in scope.
- API evidence: include API failure and recovery evidence, auth and validation error behavior evidence.
- Accessibility evidence: include keyboard focus and accessible name evidence, status message and contrast evidence.
- Performance evidence: include bundle asset and loading impact evidence, interaction responsiveness evidence.
- Permission evidence: include server-side permission test evidence, forbidden state evidence, and resource scope evidence.
- Release evidence: include release record, rollback plan, monitoring evidence, environment variable review, secret exposure review, and deployment configuration evidence.
