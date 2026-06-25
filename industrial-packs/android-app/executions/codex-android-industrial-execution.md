# Codex Android Industrial Execution

## Before Implementation

- read `AGENTS.md`
- read project baseline selection and evidence
- resolve selected profiles and industrial packs
- identify SDK, device, permission, persistence, background, release, and system integration risk
- stop for human approval when the task touches signing, production config, privacy-sensitive permissions, or value transfer

## During Implementation

- keep the task scope narrow
- prefer project-local patterns and platform conventions
- update tests, previews, emulator checks, or verification notes that match the risk level
- record exceptions rather than silently weakening the baseline

## Before Final Report

- run available verification
- include emulator, device, or documented non-applicability evidence
- list release, privacy, and residual-risk impacts
