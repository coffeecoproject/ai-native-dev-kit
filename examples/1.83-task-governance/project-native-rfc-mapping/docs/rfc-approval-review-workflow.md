# RFC: Approval Review Workflow

## Business Rule

When a submitted task enters approval review, the reviewer state must be
recorded before settlement can be considered.

## User-Visible Behavior

- The submitter sees the task as waiting for review.
- The reviewer sees the task in the approval queue.
- Settlement cannot start until review has an explicit accepted state.

## Edge Cases

- Rejected review returns the task to the submitter.
- Duplicate submissions must not create duplicate settlement records.
- Audit history must preserve the previous state.

## Verification Expectations

- State transition test covers submitted -> review -> accepted.
- Rejection path test covers submitted -> review -> rejected.
- Settlement path test proves no settlement before accepted review.

