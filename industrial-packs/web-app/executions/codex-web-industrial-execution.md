# Codex Web Industrial Execution Protocol

## Default Mode

Start in read-only mode unless the user explicitly asks for implementation.

Before modifying business code, Codex should:

1. Read `AGENTS.md`.
2. Run `node scripts/workflow-next.mjs .` when available.
3. Inspect `docs/project-profile.md` and `docs/baseline-selection.md` when present.
4. Identify selected profiles and industrial packs.
5. Produce a gap report when BL2 evidence is missing.

## Implementation Rules

- Work from an approved task card.
- Keep changes scoped to the linked task.
- Stop for human approval on auth, permission, production config, secrets, destructive operation, value transfer, or release decision changes.
- Record evidence in the project evidence locations named by the task or release flow.

## Completion Rules

Do not claim industrial readiness from template existence.

Completion requires:

- linked request/spec/eval/task evidence
- relevant verification evidence
- exception and residual risk records when something is not fully satisfied
- final report with commands run and skipped checks

