# Codex Internal Admin Industrial Execution

## Before Implementation

- read `AGENTS.md`
- resolve selected profiles and industrial packs
- identify admin role, privileged operation, production data, destructive, and manual override risk
- stop for human approval when the task expands permission, touches production data, or changes irreversible behavior

## During Implementation

- keep changes scoped to the approved admin operation
- keep permission checks server-enforced where relevant
- update forbidden, scoped-resource, audit trail, and confirmation evidence
- record exceptions rather than silently weakening the baseline

## Before Final Report

- run available verification
- include role, forbidden, audit trail, and mitigation evidence
- list residual risks and approval scope
