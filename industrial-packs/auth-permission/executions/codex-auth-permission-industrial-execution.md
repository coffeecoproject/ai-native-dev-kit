# Codex Auth And Permission Industrial Execution

## Before Implementation

- read `AGENTS.md`
- resolve selected profiles and industrial packs
- identify auth, permission, role, tenant, credential, protected resource, and privileged-access risk
- stop for human approval when the task changes access boundaries, credentials, secrets, or privileged behavior

## During Implementation

- keep changes scoped to approved access boundaries
- preserve server-side enforcement where relevant
- update allowed, forbidden, scoped-resource, credential, and audit trail evidence
- record exceptions rather than silently weakening the baseline

## Before Final Report

- run available verification
- include permission matrix, forbidden, server-side enforcement, and audit evidence
- list residual risks and approval scope
