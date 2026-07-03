# Guided Release Adapter

Use this when a user wants to take a project toward launch but does not know the release process.

## What It Does

Guided Release Adapter reads the project and produces a plain release setup card:

- what kind of project this looks like
- how it probably builds
- how it might deploy
- what is missing
- what Codex can safely prepare
- what a human must still approve
- how to move into Release Execution

## Command

```bash
node scripts/cli.mjs release-adapter ../my-project --intent "prepare launch"
node scripts/cli.mjs release-adapter-check ../my-project
```

## Good Use

```text
I want this new project to go online. Configure the release path.
```

Codex should inspect the project, recommend a safe target, and ask a few beginner-friendly questions.

## Not Allowed

The adapter must not:

- approve release
- deploy production by itself
- request or store secrets
- mutate CI/CD or hooks
- change DNS, payment, permissions, app-store, mini-program, or production config
- treat "yes, continue" as production release approval

## Output

The main artifact is:

```text
release-adapters/<id>.md
```

It can then be referenced by Release Execution:

```bash
node scripts/cli.mjs release-execution ../my-project \
  --intent "prepare release execution" \
  --release-sop release-adapters/001-release-adapter.md
```
