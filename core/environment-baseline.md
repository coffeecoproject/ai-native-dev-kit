# Environment Baseline

Environment Baseline defines how a project runs, tests, releases, observes, and rolls back.

It is a project-fact document, not an invention surface. Codex may draft the file from evidence and conversation, but humans own the decisions.

## Purpose

Use Environment Baseline when work touches:

- local runtime or package manager
- install, build, test, or dev commands
- environment variables
- secret boundaries
- external services
- CI/CD
- preview, staging, production, or release process
- rollback, logs, monitoring, alerts, or incident evidence

## State Model

Every environment item should use one of:

| State | Meaning |
|---|---|
| `CONFIRMED` | Evidence exists and the human or project source accepts it. |
| `PENDING_CONFIRMATION` | Evidence is missing, unclear, or needs a human decision. |
| `NOT_APPLICABLE` | The item truly does not apply to this project or baseline level. |

Do not leave important fields blank. Use `PENDING_CONFIRMATION` when unsure.

## Secret Boundary

Environment Baseline records variable names and ownership only.

Allowed:

- variable names
- environment where a variable is used
- whether a variable is secret
- owner
- required or optional status
- source document path

Forbidden:

- token values
- passwords
- private keys
- service account JSON
- production credentials
- connection strings with embedded credentials

Required wording:

```text
Secret values must never be written into this file.
```

## Codex Behavior

Codex may:

- inspect project files and existing docs
- draft baseline recommendations
- mark unknown items as `PENDING_CONFIRMATION`
- mark irrelevant items as `NOT_APPLICABLE`
- prepare a baseline write plan for human review

Codex must not:

- create or edit `.env` files
- record secret values
- invent staging, production, rollback, monitoring, or release ownership
- modify CI/CD, deployment files, production config, AGENTS.md, PR templates, or industrial packs through baseline setup
- treat missing environment decisions as permission to proceed

## BL Behavior

| Level | Environment Baseline expectation |
|---|---|
| BL0 | Optional and advisory unless the task touches environment, CI, deploy, release, rollback, production config, or secrets. |
| BL1 | Required before environment-sensitive or release-sensitive implementation; `PENDING_CONFIRMATION` and `NOT_APPLICABLE` are allowed. |
| BL2 | Required with confirmed decisions, explicit exceptions, evidence, and review loop enforcement. |

## Review Rule

If a task changes build, test, CI, deploy, environment variables, secret handling, production config, release, rollback, logs, monitoring, or alerts, it must reference `docs/environment-baseline.md` or route the missing decision to humans.
