# Runtime Hygiene Review Checklist

- The report uses plain language before technical trace.
- The runtime class matches the observed blocker.
- Gate failures keep the task open.
- CI failures are classified before retry is recommended.
- CI environment failures continue automatically only with retry-policy proof
  and production side-effect proof.
- Runtime source refs and digests are recorded for gate, CI, artifact, bundle,
  or release blockers.
- Strict reports bind to the current Work Queue item and matching Task
  Governance record before downstream delivery consumers rely on them.
- Unknown or present production side effects stop for release-owner handling.
- Artifact deletion is never automatic.
- Evidence artifacts are preserved.
- Bundle slimming excludes non-runtime files without deleting evidence.
- Force push is not authorized.
- Commit, push, release, and production are not approved by the report.
