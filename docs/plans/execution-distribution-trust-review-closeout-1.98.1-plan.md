# Execution And Distribution Trust Review Close-Out 1.98.1

## Purpose

Close the independently reproduced trust gaps found after the 1.98.0 hardcut.
This is a review close-out release, not a new workflow layer and not a feature
expansion.

## Required Outcomes

1. A completion decision can only consume evidence for the same project, task,
   intent, and current source state.
2. Git and non-Git project identity cannot ignore business-code changes or let
   a target-controlled manifest redefine the identity boundary.
3. Controlled migration and apply cannot write outside approved project-local
   paths, restore an untrusted backup, execute a drifted checker, or leave a
   successful target mutation without a receipt or rollback attempt.
4. Release execution can only consume a validated Launch Review, strict current
   release authority chain, unblocked channel policy, and current candidate and
   worktree identity.
5. Existing-project authority, new-project origin, Work Queue, baseline
   selection, generated CLI, and distributed command surfaces remain coherent.

## Work Package A: Task And Evidence Identity

- bind Git Evidence Authority to current scoped worktree content as well as HEAD;
- use a fixed trusted workflow-output exclusion set for non-Git identity;
- require the public finish path to match Completion Evidence with the selected
  closure task and intent, and require Work Queue, Completion Evidence, and
  Closure to use one canonical task reference and intent digest;
- fail closed when a continuing task has no single matching CURRENT Work Queue
  item;
- route a clearly different user request through explicit task-switch review
  instead of silently replacing or contaminating the current task;
- prevent copied `NEW_PROJECT` metadata from suppressing observed old-project
  governance;
- remove generic validation downgrades and correct Chinese rule detection;
- add source-type and intent checks to recursive Execution Assurance binding.

## Work Package B: Apply And Migration Transaction

- constrain migration plans to project-local approved plan directories;
- require detected installed version to match `--from` for controlled 1.x update;
- preserve `agent.md` as the existing authority instead of creating a parallel
  `AGENTS.md`, and preserve `.agent.md` under the same rule;
- require an explicitly approved Agent governance update to include every
  section consumed by the installed activation checker, including Product
  Baseline and Claim Control;
- rollback only actions that actually changed target state and verify backup
  bytes before restoration;
- write receipts atomically inside the transaction and roll back if receipt
  persistence fails;
- never execute installed scripts after any receipt/action hash mismatch;
- add bounded process timeouts and prune ignored directories before source-state
  hashing.

## Work Package C: Release Authority

- validate Launch Review through its checker, validate the exact referenced
  Closure through the Closure checker, and bind exact surface evidence and file
  digests;
- run the strict Release Approval checker before assisted execution can be ready;
- reject blocked channel policies as release authority inputs;
- recheck current Git/worktree and project-local evidence paths;
- bind the exact release candidate digest and normalize macOS `/var` and
  `/private/var` aliases before project-local path comparison;
- make strict approval checks fail when reports are absent even with
  `--allow-empty`.

## Work Package D: Adoption, Baseline, And Distribution

- validate the actual existing agent entry content before an active-adoption
  claim;
- require platform-complete standard-pack coverage for BL1/BL2;
- keep BL2 installation separate from later human evidence approval;
- make strict pack-selection checks fail on missing reports;
- prevent managed baseline files and `vitest` from polluting project/platform
  classification;
- make generated CLI version/manifest detection installation-aware;
- either distribute a public command with all dependencies or hide it as
  source-only;
- include release-channel assets in target completeness groups and correct all
  generated update commands.

## Acceptance

- every reproduced P0/P1 path has a negative regression test;
- generated new project, generated BL1 project, generated BL2 plan, legacy
  project update, controlled apply, receipt recheck, public finish, and release
  execution paths are exercised;
- `node scripts/check-manifest.mjs` passes;
- `node scripts/check-intentos.mjs` passes;
- `npm run verify` passes;
- `git diff --check` passes;
- all P0/P1 findings from the independent read-only review are governed and the
  repaired snapshot passes main-thread full-chain re-verification.

## Review Record

- the initial independent multi-surface review reproduced task, apply,
  adoption, baseline, release, and distribution trust gaps;
- those findings were converted into negative regressions before close-out;
- a post-repair subagent rerun was attempted but unavailable because the agent
  usage limit was exhausted;
- the main thread therefore re-ran the focused regressions, generated-project
  and legacy-project journeys, Manifest check, repository self-check, and full
  verification on the repaired snapshot;
- no unresolved P0/P1 remains in the defined 1.98.1 trust scope after that
  verification.

## Non-Goals

- no real deployment, provider action, production migration, secret handling,
  CI installation, hook installation, or project-authority replacement;
- no cryptographic human identity provider in this release; approval remains a
  project-local structured record and this limitation must remain explicit;
- no broad rewrite of historical artifact schemas solely to reject every
  unknown field; schema closure is handled only where a current authority
  consumer depends on it.
