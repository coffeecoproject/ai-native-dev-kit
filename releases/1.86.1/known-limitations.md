# IntentOS 1.86.1 Known Limitations

- Runtime Hygiene remains a classifier and reviewer. It does not approve
  commit, push, release, production, artifact deletion, gate bypass, or force
  push.
- `--strict-task-entry` requires resolvable Work Queue and Task Governance
  source reports. Projects without those records should use compatibility mode
  until task entry evidence exists.
- Runtime source trace records refs and digests, but it does not prove the
  external system itself is correct or available.
- CI environment failures may continue automatically only when retry policy and
  production side-effect checks are both recorded. Missing proof must not be
  treated as permission to retry.
- Existing `1.86.0` reports remain readable, but downstream release or delivery
  consumers can require `1.86.1` strict source/task binding when the task is
  high risk or release-adjacent.
