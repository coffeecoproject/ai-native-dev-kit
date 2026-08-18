暂时停止更新，目前这套会导致文档和代码出现双权威，增加治理难度和token消耗


# IntentOS

[简体中文](README.zh-CN.md) | English

An open-source, Codex-first operating layer for evidence-backed software delivery.

Current release: `1.113.0`.

Release record: [releases/1.113.0/release-record.md](releases/1.113.0/release-record.md).

IntentOS lets you describe a real product or engineering goal in ordinary
language while Codex handles the technical delivery loop: understanding the
project, planning, implementation, verification, review, repair, completion
evidence, and release preparation.

> You provide the goal, real business facts, and consent for concrete
> real-world effects. IntentOS keeps the technical workflow coherent and
> inspectable.

IntentOS is fully open source under the [Apache License 2.0](LICENSE.md). You
may use, modify, and redistribute it, including for commercial work, under the
terms of that license.

## What IntentOS Is

IntentOS is a project-local workflow and governance system for AI-assisted
software delivery. It sits around an AI coding agent and the repository:

```text
your goal
  -> Codex reads the project
  -> IntentOS selects the delivery controls
  -> Codex plans and implements
  -> IntentOS verifies evidence and boundaries
  -> Codex repairs findings and prepares a safe handoff
```

It is not another model, an autonomous production operator, a hosted service,
or a replacement for your application framework. Codex is the formally
supported agent surface. Claude and Cursor files are compatibility references,
not behavior-parity claims.

## Current Distribution Status

IntentOS currently ships as source code:

- Node.js `22.x` is required (`>=22 <23`).
- Git and npm are required for the source checkout and repository checks.
- Codex is the formally supported interactive agent.
- There is no public npm package, global installer, dashboard, or hosted
  IntentOS service yet.
- The source CLI can inspect and route work without modifying a target project.
- Installing project-local assets into an existing project uses an exact,
  reviewable plan with rollback and an apply receipt.

Open source describes the rights to use and change the code. It does not imply
that the planned package/plugin distribution work is already complete.

## Get Started With Codex

### 1. Clone IntentOS

```bash
git clone <this-repository-url> intentos
cd intentos
node --version
```

### 2. Open the project you want to work on

Install and sign in to the Codex CLI using the
[official Codex CLI guide](https://learn.chatgpt.com/docs/codex/cli), then run
Codex from your target project:

```bash
cd /path/to/your-project
codex
```

Tell Codex where the IntentOS source checkout is:

```text
Read /path/to/intentos as the IntentOS source and install IntentOS
into this project. Inspect first, preserve existing project rules and business
code, show the exact plan before writing, and verify the project-local entry
after apply.
```

For a new empty project, describe what you want to build instead:

```text
Read /path/to/intentos and use IntentOS to start a booking application
in this directory. Derive the technical approach from the goal and verify the
first usable slice.
```

### 3. Keep using natural language

After adoption, continue using Codex normally:

```text
Continue the current task.
```

```text
Add cancellation rules to the booking flow and verify every affected surface.
```

```text
Is this task actually complete? Show me the remaining risks.
```

The installed project contains its own IntentOS guidance and project-local
scripts, so daily work does not need the original source checkout for every
entry.

## Read-Only Source Entry

To inspect or route a project directly from the source checkout without
installing anything into the target:

```bash
node /path/to/intentos/scripts/cli.mjs \
  work /path/to/your-project \
  "inspect this project and tell me the correct next step"
```

The public `work` entry maps ordinary requests such as start, continue, check,
finish, prepare release, and adopt. It is read-only by itself. Maintainers can
see lower-level commands with:

```bash
node scripts/cli.mjs --help-advanced
```

## What IntentOS Covers

- new and existing project entry;
- current-task and interrupted-work recovery;
- business-rule and cross-surface impact coverage;
- engineering and platform baseline selection;
- implementation planning and plan review;
- test planning, execution evidence, review, and repair;
- completion evidence and unified closure;
- controlled adoption and updates with exact actions and receipts;
- release preparation, topology, runtime hygiene, and rollback evidence.

The internal machinery is strict, but ordinary users should not have to choose
profile IDs, baseline levels, checker commands, schemas, action IDs, or review
roles.

## Existing Project Safety

IntentOS treats an existing repository as project-owned:

- it inspects before writing;
- it preserves stronger project rules backed by current project evidence;
- it does not overwrite business code merely to install workflow assets;
- dirty work blocks only unsafe overlapping writes;
- adoption writes require a project-bound plan, readiness proof, exact action
  replay, rollback handling, and a verified receipt;
- CI, hooks, secrets, provider accounts, release, production, paid resources,
  real-user communication, and irreversible data effects remain outside an
  ordinary local adoption authority.

Read [For Existing Projects](docs/for-existing-projects.md) and
[Source-Only Adoption](docs/source-only-adoption.md) for the detailed boundary.

## Safety Boundaries

IntentOS does not:

- invent business, legal, tax, compliance, or provider facts;
- interpret silence as permission for an external or irreversible effect;
- treat tests as proof when evidence is stale or unrelated to the current task;
- claim completion when required verification or closure evidence is missing;
- treat release readiness as authorization to operate production;
- guarantee that application code is correct merely because IntentOS was
  installed successfully.

## Repository Map

| Path | Purpose |
|---|---|
| `scripts/cli.mjs` | Public source entry |
| `scripts/` | Resolvers, checkers, controlled apply, and verification runtime |
| `core/` | Current workflow and governance contracts |
| `starters/` | New-project starter assets |
| `profiles/` | Platform and project profile baselines |
| `standard-baseline-packs/` | Reusable standard engineering baselines |
| `industrial-packs/` | Deeper domain and platform controls |
| `schemas/` | Machine-readable artifact contracts |
| `tests/` and `test-fixtures/` | Behavioral and failure-path coverage |
| `examples/` | Worked evidence and calibration examples |

## Verification

Repository maintainers can run the complete candidate verification:

```bash
npm run verify
```

The complete suite is intentionally broad and can take time. For contribution
requirements and targeted checks, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [Start Here](docs/start-here.md)
- [Operating Model](docs/operating-model.md)
- [Minimal Adoption](docs/minimal-adoption.md)
- [Source-Only Adoption](docs/source-only-adoption.md)
- [For Existing Projects](docs/for-existing-projects.md)
- [For Maintainers](docs/for-maintainers.md)
- [Documentation Index](docs/index.md)
- [Security Policy](SECURITY.md)

## Release History

Current behavior is defined by the current source, product contracts, and
runtime. Detailed historical records live in [VERSION.md](VERSION.md) and
[releases/](releases/); older records do not redefine the current operating
model or current license.

## Contributing

Issues, documentation improvements, tests, and focused code contributions are
welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Security-sensitive
reports should follow [SECURITY.md](SECURITY.md).

## License

Licensed under the [Apache License 2.0](LICENSE.md). See
[LICENSE-FAQ.md](LICENSE-FAQ.md) and [NOTICE.md](NOTICE.md) for the plain-language
summary and attribution notice.

Previous distributions remain governed by the license file included with that
distribution. This README is a project summary, not legal advice.
