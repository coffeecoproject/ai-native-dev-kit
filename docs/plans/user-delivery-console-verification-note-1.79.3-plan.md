# User Delivery Console Verification Note 1.79.3 Plan

## Goal

Prevent User Delivery Console from treating free-text `--verification` notes as
formal Test Evidence.

## Problem

In `1.79.2`, `status --verification "npm run verify passed"` could make the
user-facing card show test/check evidence as recorded even when no
`test-evidence-reports/` artifact existed.

That is too ambiguous for ordinary users. A user note can be useful context, but
it is not the same as a recorded Test Evidence report.

## Scope

This patch does:

1. make `testCheckEvidenceRecorded` depend only on `test-evidence-reports/`;
2. add a separate `userVerificationNoteProvided` field;
3. show the user note as a separate row in the User Delivery Console card;
4. add checker coverage proving `--verification` does not count as Test Evidence;
5. record `git diff --check` in release self-check evidence.

This patch does not:

- add a new completion gate;
- replace Test Evidence;
- replace Completion Evidence;
- run tests on behalf of the project;
- approve implementation, commit, push, release, or production;
- prove real-user stability.

## Acceptance

The implementation is acceptable when:

- `status --verification "npm run verify passed" --json` reports
  `userVerificationNoteProvided: "Yes"`;
- the same output reports `testCheckEvidenceRecorded: "No"` unless a real
  `test-evidence-reports/` artifact exists;
- saved User Delivery Console cards include the user verification note row;
- `status-check` rejects cards that omit the split field;
- `check-intentos` and `npm run verify` pass;
- `git diff --check` passes and is recorded in release evidence.

## Boundary

This is a semantic polish patch for the ordinary-user status view. It does not
change the authority of Test Evidence, Completion Evidence, Release Plan, Launch
Review, or any production release process.
