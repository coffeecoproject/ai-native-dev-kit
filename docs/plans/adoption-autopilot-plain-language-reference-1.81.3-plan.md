# Adoption Autopilot Plain-Language Reference 1.81.3 Plan

## Goal

Make the existing-project `adopt` result easier for a non-technical user to
judge without weakening the audit trail.

1.81.3 is a patch release for Existing Project Safe Adoption Autopilot. It
keeps the workflow read-only and does not add a new adoption stage.

## Problem

1.81.2 correctly separates `start` and `adopt`, but the `adopt` Human Summary
can still show raw internal states such as `READY_FOR_RULE_ENTRY_REVIEW` and
`AVAILABLE_FOR_SAFE_USE`.

That is correct for machine evidence, but it is the wrong first screen for a
user who only needs to know whether IntentOS can safely be used on an old
project.

## Scope

- Change `adopt` Human Summary to show plain-language current state.
- Change `adopt` Human Summary to show plain-language working mode.
- Keep raw internal enums in `Machine-Readable Evidence`, `Outcome`, and
  technical trace.
- Update the report template and examples.
- Update `docs/reference/scripts.md` with `adopt` and `adopt-check`.
- Expose Existing Project Safe Adoption Autopilot in README capability tables.
- Add self-check coverage that rejects raw internal enums in Human Summary.

## Non-Goals

- Do not write target-project files.
- Do not install `.intentos/`.
- Do not create or replace `AGENTS.md`.
- Do not modify CI, hooks, release, production, DB, API, Web, Docker, secrets,
  migrations, payment, permissions, or provider state.
- Do not implement S1 docs-only writes.
- Do not implement Adoption Continuation.
- Do not implement the 1.82 controlled native adoption review.

## Execution Plan

1. Update the adoption autopilot resolver.
2. Update the adoption autopilot checker.
3. Update report template and examples.
4. Update public README, Chinese README, script reference, version files, and
   manifest.
5. Add 1.81.3 release evidence.
6. Run focused checks and full self-check.

## Acceptance

1. `node scripts/cli.mjs adopt . --intent "connect existing project"` prints a
   Human Summary that does not contain raw adoption or working-mode enums.
2. The same output still contains machine-readable adoption fields in JSON.
3. Existing 1.81 examples pass strict adoption-autopilot checks.
4. `docs/reference/scripts.md` lists `adopt` and `adopt-check`.
5. README and README.zh-CN list Existing Project Safe Adoption Autopilot.
6. `scripts/check-intentos.mjs` checks this regression.
7. `node scripts/check-manifest.mjs`, `node scripts/check-intentos.mjs`, and
   `git diff --check` pass.

## Boundary

This patch improves user-facing interpretation only. It is not approval to
migrate an existing project, change project authority, apply workflow assets,
or claim full adoption.
