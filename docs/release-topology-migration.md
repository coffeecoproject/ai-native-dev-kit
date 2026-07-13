# Release Topology Migration

This layer answers one practical question: if the current release path should
change, what must be proved before any real switch can happen?

IntentOS first reads the current project and produces a Release Execution
Topology report. It then records one migration view covering dependencies,
project-file apply evidence, non-production rehearsal, cutover readiness,
post-cutover observation, and eventual old-path retirement.

The report does not deploy, submit, edit provider state, move secrets, approve
production, or retire an old path. Those are separate effects with separate
authority and evidence.

Maintainer commands:

```bash
node scripts/cli.mjs release-topology-migration <project> \
  --topology-ref release-execution-topologies/current.md \
  --out release-topology-migrations/current.md

node scripts/cli.mjs release-topology-migration-check <project> \
  --report release-topology-migrations/current.md \
  --require-structured-evidence \
  --require-current-project
```

Ordinary users do not need these commands or the internal stage names. They can
ask IntentOS to prepare a safe release-path change; Codex derives the technical
work and asks only for missing real-world facts or exact external-effect
consent.
