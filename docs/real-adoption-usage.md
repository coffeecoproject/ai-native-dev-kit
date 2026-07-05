# Real Adoption Usage

This page explains how to use real-project adoption without turning it into a target-project write.

## Human Summary

For an existing real project, Codex should first inspect read-only, decide whether the project is light, governed, production-sensitive, or blocked, then record what it found. The user should only decide whether a later bridge write is allowed.

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
-> human decision before target writes
```

## Which Artifact To Use

| Situation | Artifact | Why |
|---|---|---|
| Codex has inspected a real project without writing to it | `real-adoption-trials/` | records project state, read-only boundary, and adoption mode |
| The project already has strong rules, docs, CI, release, or evidence | `governance-maps/` | maps IntentOS concepts to existing authority instead of copying templates |
| A future fix may touch API, data, permissions, CI, release, environment, baseline, gate, or architecture | `patch-classifications/` | classifies repair scale before a patch-style change |
| A high-risk keyword appears but review says it is only background context | `patch-classification-false-positives/` | records the calibration decision without weakening default checks |

False-positive records do not change the original patch classification report. If the repair scale should change, create a new patch classification report or record an explicit human decision.

## Bridge Modes

| Mode | Meaning | Target writes |
|---|---|---|
| `NO_WRITE_MAP` | map and report only | No |
| `DOCS_ONLY_BRIDGE` | write approved adapter docs only | Only after human approval |
| `THIN_OPERATIONAL_BRIDGE` | write a small adapter that points to existing authority | Only after human approval |
| `NOT_PROPOSED` | no bridge is suggested | No |

## User Decisions

The user should decide:

- Is this project allowed to be inspected read-only?
- Can public evidence name the target, or must it stay sanitized?
- Should any docs-only bridge be written into the target project?
- If a fix is structural, is the remediation scope approved?

Codex should not ask the user to manually operate every file. Codex drafts the reports and checks; the user confirms boundaries and decisions.

## Current Limit

There is no automatic `real-adoption-project.mjs` runner yet. That is intentional. Automatically scanning real projects needs stricter privacy, command-safety, and output-sanitization controls.
