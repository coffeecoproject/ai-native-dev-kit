# Real Project Read-only Adoption Trial

Real Project Read-only Adoption Trial defines how Codex should enter a real existing project before any write is authorized.

It is a reality-check layer after First Delivery Walkthrough. It does not approve implementation, release, migration, production access, or project-file writes.

## Purpose

Use this protocol when a target project already has code, governance, release evidence, production signals, or a strong local agent instruction file.

The goal is to answer:

```text
What is this project?
What already governs it?
Can AI write now?
What is the smallest safe adoption path?
What future fixes must not be handled as patches?
```

## Default Rule

Real project adoption is read-only by default.

Codex may inspect files, project layout, package scripts, docs, CI config, and Git state. Codex must not modify target project files until the human approves an exact write scope.

## Adoption Classification

Use a primary mode plus secondary tags. Do not collapse all signals into one label.

| Field | Meaning |
|---|---|
| Primary adoption mode | one of the approved adoption modes |
| Secondary risk tags | additional signals such as production-sensitive, already-launched, strong-agent-rules, existing-baselines |
| Confidence | low / medium / high |
| Evidence | file paths, command output, and observations that support the classification |

Allowed primary modes:

| Mode | Meaning | Default AI permission |
|---|---|---|
| `NEW_PROJECT` | Empty or early project with little governance | may propose scaffold after confirmation |
| `EXISTING_LIGHT_PROJECT` | Existing code with weak governance | read-only first, then guided setup |
| `EXISTING_GOVERNED_PROJECT` | Existing project with strong rules, gates, docs, or evidence | map existing governance, do not overwrite |
| `EXISTING_PRODUCTION_PROJECT` | Existing governed project with live, release, production, or customer-facing risk | read-only only until explicit approval |
| `BLOCKED_UNKNOWN_RISK` | signals are unclear, risky, or contradictory | stop for human decision |

## Bridge Layer Modes

Existing governed projects must not receive a duplicate generic workflow by default.

| Bridge layer mode | Meaning | Writes |
|---|---|---|
| `NO_WRITE_MAP` | map findings in chat, local report, or external review only | none |
| `DOCS_ONLY_BRIDGE` | write approved adoption or governance-map docs only | docs only, after approval |
| `THIN_OPERATIONAL_BRIDGE` | write approved agent/manifest adapter that points to existing authority | adapter only, after approval |
| `NOT_PROPOSED` | no bridge proposed yet | none |

If a bridge proposes `AGENTS.md`, it must mention the existing agent authority such as `agent.md`, or explicitly say no existing agent file was found.

## Existing Authority Mapping

Map AI Native concepts to the target project's own source of truth.

Examples:

| AI Native Concept | Existing Project Authority |
|---|---|
| Agent rules | `agent.md`, `AGENTS.md`, platform instruction file |
| Engineering baseline | existing engineering baseline docs and guard scripts |
| Environment baseline | existing environment docs, templates, and gate scripts |
| Review loop | existing session, PR, review, or evidence process |
| Launch readiness | existing release/readiness/rollback process |
| Claim control | existing release records, claim rules, or evidence policy |
| Patch classification | existing no-patch, hardcut, remediation, or baseline rules |

The adapter may add clarity. It must not replace or weaken existing authority.

## Public Evidence Boundary

Real trial notes are local-only by default.

Every real adoption report must declare:

```text
Public Evidence Status: LOCAL_ONLY / SANITIZED_APPROVED / PUBLIC_APPROVED
Concrete target name included: Yes / No
```

Rules:

- `LOCAL_ONLY` must not include a real target project name in a public repository artifact.
- Public release evidence should use sanitized phrasing such as "one governed production-sensitive Web project."
- Do not include secrets, credentials, raw production data, private endpoints, customer records, incident details, or confidential business records.
- Do not claim production validation from a read-only trial.

## Allowed Read-only Actions

- file listing
- reading docs, package scripts, CI workflows, baseline files, and session index
- `git status`, `git branch`, `git remote`
- static inspection that does not write cache, build output, generated files, DB state, lockfiles, or runtime state

## Forbidden During Read-only Trial

- writing target project files
- running `init-project`, `--update-workflow-assets`, or apply-plan against the target
- starting runtime services
- running migrations, seeds, release, rollback, deployment, production smoke, SSH, or remote service commands
- reading raw `.env*`, secret stores, private keys, tokens, credentials, or certificates
- running commands that connect to external services
- running commands that may modify local DB, cache, generated files, lockfiles, or production-like state

## Human Decision Boundary

Human approval is required before:

- writing adapter docs
- writing `AGENTS.md`, `.ai-native/`, PR template, CI, release workflow, or governance scripts
- applying any bridge layer
- using a real project name in public evidence
- touching production, release, rollback, DB, secrets, permissions, security, privacy, payments, or regulated data

## Claims

Allowed:

- The project was inspected in read-only mode.
- Existing governance was mapped.
- The recommended bridge mode is documented.
- Patch classification was proposed for future fixes.

Forbidden:

- The project is production validated.
- The project is release approved.
- The project is security, privacy, compliance, or legal approved.
- The bridge layer authorizes implementation.
- Patch classification authorizes code changes.
