# Real Adoption Usage

This page explains how to use real-project adoption without turning it into a target-project write.

## Human Summary

For an existing real project, Codex first inspects read-only, decides whether
the project is light, governed, production-sensitive, or blocked, and records
what it found. Codex then prepares and applies only the migration depth that is
supported by project evidence and controlled apply readiness. The user is not
asked to approve internal migration mechanics.

Every real-adoption result should start with `Human Decision Summary`: the recommended path, alternatives, whether each path writes target files, risk, and what happens if the user does nothing.

## What The Commands Do

`real-adoption` checks recorded reports. It does not inspect a target project by itself and does not generate a report automatically.

```bash
node scripts/cli.mjs real-adoption .
node scripts/check-real-adoption-trial.mjs .
```

`patch-classification` checks recorded repair-scale reports. It does not approve or implement a fix.

```bash
node scripts/cli.mjs patch-classification .
node scripts/check-patch-classification.mjs .
```

## Recommended Flow

Use this sequence for an existing project:

```text
read-only inspect
-> real adoption trial report
-> existing governance map when governance already exists
-> patch classification only when a future fix looks non-trivial
-> reviewed plan
-> controlled apply readiness before target writes
```

## Which Artifact To Use

| Situation | Artifact | Why |
|---|---|---|
| Codex has inspected a real project without writing to it | `real-adoption-trials/` | records project state, read-only boundary, and adoption mode |
| The project already has strong rules, docs, CI, release, or evidence | `governance-maps/` | maps IntentOS concepts to existing authority instead of copying templates |
| A future fix may touch API, data, permissions, CI, release, environment, baseline, gate, or architecture | `patch-classifications/` | classifies repair scale before a patch-style change |
| A high-risk keyword appears but review says it is only background context | `patch-classification-false-positives/` | records the calibration decision without weakening default checks |

False-positive records do not change the original patch classification report. If the repair scale should change, Codex creates a new evidence-backed classification instead of asking the user for a technical judgment.

## Bridge Modes

| Mode | Meaning | Target writes |
|---|---|---|
| `NO_WRITE_MAP` | map and report only | No |
| `DOCS_ONLY_BRIDGE` | write bounded adapter docs only | Only after controlled apply readiness |
| `THIN_OPERATIONAL_BRIDGE` | write a small adapter that points to existing authority | Only after controlled apply readiness |
| `NOT_PROPOSED` | no bridge is suggested | No |

## User Input Boundary

Codex owns inspection depth, migration classification, rule reconciliation,
technical scope, validation, rollback preparation, and whether a controlled
write is ready. It defaults evidence to sanitized output and does not ask the
user to operate files or approve internal technical steps.

The user is asked only for a missing business fact, a genuine product
preference, consent to a concrete real-world effect, or an unavailable external
fact. A broad request to adopt IntentOS is task authority for Codex to prepare
and execute the safest evidence-supported migration; it is not authority for
production, paid, irreversible, or external-account actions.

## Automatic Controlled Adoption

The read-only `real-adoption` checker still validates recorded reports rather
than mutating a project. The ordinary adoption entry can now perform the full
technical sequence automatically: inspect the existing project, reconcile its
rules and Work Queue, generate one canonical plan, derive a request-bound local
authority, apply only the exact reversible governance graph, verify the receipt,
and cold-start the next project-local Codex session.

This automatic path cannot touch business implementation, CI, hooks, release,
production, credentials, paid resources, or irreversible data operations.
Those effects remain outside request-bound local authority.
