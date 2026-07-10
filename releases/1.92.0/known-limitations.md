# IntentOS 1.92.0 Known Limitations

- The controlled runner is limited to IntentOS init/update governance assets.
  It is not a generic project-code executor.
- Existing AGENTS or PR-template governance append operations that require
  generated merge content remain human-only in the 1.92.0 graph. A later
  selected migration plan may add exact content-bound support.
- CI/hook writes and selected industrial-pack installation are deliberately
  excluded from controlled replay even when the broad source manifest contains
  them.
- The manifest still contains overlapping source copy rules. The execution
  planner collapses duplicate target paths to one final action, while manifest
  structural consolidation remains planned for 1.94.
- Apply Receipt proves IntentOS governance replay and workflow activation, not
  business correctness, full project quality, release readiness, or production
  safety.

