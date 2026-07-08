# QA Checklist: Permission Approval Workflow

## Scope

This checklist covers reviewer permission changes for approval workflow tasks.

## Required Checks

- Reviewer with permission can approve a task.
- User without reviewer permission cannot approve a task.
- Audit record includes reviewer identity and timestamp.
- Existing settlement behavior is unchanged unless approval succeeds.

## Test Correctness Controls

- Must include positive permission test.
- Must include negative permission test.
- Must include audit evidence.
- Must not treat a screenshot alone as proof.

