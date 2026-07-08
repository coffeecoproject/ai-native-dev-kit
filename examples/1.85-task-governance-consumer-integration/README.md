# Task Governance Consumer Integration Examples

These examples show how 1.85 makes downstream consumers read the current Work Queue item and Task Governance record before claiming execution or completion.

- `high-workflow-rule`: a high-impact task can only claim done when the current queue item and Task Governance binding are present and the high-impact evidence chain is marked complete.
- `possible-high-blocked`: a possible-high task is shown as blocked in completion, closure, and user-facing status until impact is resolved.

The reports are non-authorizing. They do not write target-project files, approve implementation, approve commit/push, or approve release/production.
