# Release Guide

Release Guide is the plain-language launch entry.

Use it when a user says:

```text
Help me launch this project.
```

Run:

```bash
node scripts/cli.mjs release-guide . --intent "help me launch"
```

It reads the project and summarizes:

- what release path was found
- what safe target should come first
- what is missing
- whether launch review is ready
- whether release approval is structured
- what Codex can safely prepare
- what the human or external release system must own

## What It Does

Release Guide routes across the existing release flow:

```text
Release Adapter
  -> Launch Review View
  -> Structured Release Approval
  -> Release Execution Protocol
```

It hides that internal routing from beginner users.

## What It Does Not Do

Release Guide does not approve release, deploy, publish, submit review, run migrations, collect secrets, change production config, or make Codex the release owner.

## Structured Approval

Release approval must be a structured record. A sentence like "approved" is not enough.

Use:

```bash
node scripts/cli.mjs new --type release-approval --name 001-release-approval
```

Then fill the fields and keep secrets out of the record.

## Safe Defaults

- unknown commands are `NO_RUN`
- preview deploys are human or external-system owned unless a project SOP explicitly allows otherwise
- production release is always handoff by default
- production smoke is not a default Codex action
- evidence must include owner/path/scope details, not only a placeholder file
