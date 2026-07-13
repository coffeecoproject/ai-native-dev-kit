# Release Topology Consumer Binding

This capability makes release checks refer to the same current six-plane
topology instead of accepting unrelated or copied reports.

For ordinary use, say what should be released. Codex discovers and checks the
technical path. Maintainers can use strict flags when reviewing evidence:

```bash
node scripts/check-release-evidence-gate.mjs . --require-release-topology
node scripts/check-release-approval-record.mjs . --require-release-topology
node scripts/check-release-execution.mjs . --require-release-topology
node scripts/check-runtime-hygiene.mjs . --require-release-topology
```

These checks do not approve or perform a release. A topology report remains a
read-only technical input; real-world consent stays separate and exact.
