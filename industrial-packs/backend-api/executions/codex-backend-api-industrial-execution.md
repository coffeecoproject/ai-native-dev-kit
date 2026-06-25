# Codex Backend API Industrial Execution

## Before Implementation

- read `AGENTS.md`
- resolve selected profiles and industrial packs
- identify contract, permission, data, migration, production config, and external side-effect risk
- stop for human approval when the task touches protected resources, data migrations, destructive behavior, or production config

## During Implementation

- keep changes scoped to the approved API surface
- preserve compatibility unless an approved breaking change exists
- update contract, validation, permission, and failure-mode tests
- record exceptions rather than silently weakening the baseline

## Before Final Report

- run available verification
- include contract, permission, data, and observability evidence
- list release and rollback impacts
