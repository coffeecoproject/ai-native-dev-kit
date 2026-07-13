# Release Execution Topology

IntentOS reads the current project and describes six independent parts of its
release path: source, orchestration, execution, package transport, evidence,
and the final target. It then checks whether the path has the capabilities the
project actually needs.

The user does not choose technical release plumbing. Codex prepares one
technical recommendation and explains missing facts in plain language. A
recommendation does not approve a release and does not change project files.

Legacy Release Channel Policy reports remain readable, but they are labelled
as compatibility input and cannot by themselves prove the current topology.

Advanced maintainers may inspect the derived view with:

```bash
node scripts/cli.mjs release-topology . --intent "prepare a safe release path"
node scripts/cli.mjs release-topology-check . --allow-empty
```

These commands are read-only unless the resolver is given a safe report path
under `release-execution-topologies/`.
