# Existing Governed Project Adoption Assessment: <project-name>

Use this file when a project already has governance, CI gates, evidence, release controls, production signals, or a dirty worktree.

This assessment is read-only by default. It does not authorize workflow asset installation, AGENTS.md changes, PR template changes, project doc edits, production changes, or business code changes.

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Adoption Decision And Evidence

Selected adoption mode: READ_ONLY / ADAPTER_DOCS / CONTROLLED_WORKFLOW_SETUP / BLOCKED_BY_EVIDENCE

Can Codex continue now: yes / limited / no

Project and governance evidence:

Scope and exact write boundary:

Risk response and rollback:

Verification and review route:

Technical recovery path:

## Human Summary

One-sentence conclusion:

## Decision Needed

Codex decision status: PENDING_EVIDENCE / SELECTED / BLOCKED

Bounded user input, if any: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

## Next Safe Step

Next action:

## Assessment Status

Mode: READ_ONLY

Prepared by:

Prepared at:

Target project:

IntentOS version:

## Detected Project State

Project state tags:

- EXISTING_PROJECT / PARTIALLY_BOOTSTRAPPED_PROJECT / BOOTSTRAPPED_PROJECT:
- GOVERNED_EXISTING_PROJECT:
- PRODUCTION_GOVERNED_PROJECT:
- DIRTY_WORKTREE_PROJECT:

Reason:

## Existing Governance Signals

| Signal | Path / Evidence | Meaning | Keep / Map / Gap |
|---|---|---|---|
| Agent rules |  |  |  |
| CI workflows |  |  |  |
| Guard scripts |  |  |  |
| Baseline docs |  |  |  |
| Evidence records |  |  |  |
| Session / work records |  |  |  |
| Architecture / ADR docs |  |  |  |
| Risk / exception docs |  |  |  |

## Production Signals

| Signal | Path / Evidence | Risk | Stop Condition |
|---|---|---|---|
| Production lane |  |  |  |
| Staging / test lane |  |  |  |
| Release workflow |  |  |  |
| Rollback policy |  |  |  |
| Deployment config |  |  |  |
| Database migration policy |  |  |  |
| Incident / SRE policy |  |  |  |
| Backup / recovery policy |  |  |  |

## Worktree Risk

Git repository: Yes / No

Current branch:

Dirty worktree: Yes / No

Changed file count:

Changed file sample:

- 

Impact:

## IntentOS Concept Mapping

Link or summarize `existing-governance-map.md` here.

Mapping status: COMPLETE / PARTIAL / NOT_STARTED

Primary conflicts:

- 

Primary gaps:

- 

## Safe Adoption Decision

| Codex-selected mode | Writes allowed | Required evidence | Risk controls | Status |
|---|---|---|---|---|
|  |  |  |  | PENDING_EVIDENCE / SELECTED / REJECTED |

## Recommended Adoption Path

Recommended option:

Rationale:

Files inside the Codex-selected controlled boundary:

- 

Files outside this assessment boundary and requiring a separate evidence-backed task:

- agent rules:
- PR template:
- CI workflows:
- release / deployment config:
- production config:
- secrets / env files:
- database migrations:
- existing business docs:
- business code:

## Required Human Decisions

Compatibility heading: semantically this is the bounded `User Input Queue`; internal adoption mechanics are excluded.

| Input class | Missing business fact, exact prepared effect, or external fact | Why project evidence is insufficient | Plain-language question | Source | Status |
|---|---|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  |  | user / external authority / N/A | PENDING / PROVIDED / CONSENTED / NOT_REQUIRED |

## No-write Recommendation

Do not run `init-project`.

Do not run `--update-workflow-assets`.

Do not create migration reports.

Do not modify project files until Codex records the exact boundary, rollback, and verification evidence. Ask the user only for a classified business fact, exact prepared real-world effect, or unavailable external fact.

Reason:

## Next Safe Step

Next action:

Bounded user-input prompt, only if classified above:

```text
I detected a missing fact or prepared real-world effect that project evidence cannot resolve.
<ask one plain-language question tied to the recorded user-input class>
```
