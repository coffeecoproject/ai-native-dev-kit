# Review And Execution Trust Close-Out 1.99.3

## Purpose

Close the trust gaps found by the full 1.99.2 audit without adding a new
workflow system, user mode, evidence family, or organizational role model.

IntentOS remains designed for one zero-experience solo developer. The user
provides business goals, unavailable business facts, preferences, and consent
to one prepared concrete real-world effect. IntentOS and Codex own technical
judgment, implementation, testing, review, repair, verification, rollback
preparation, and internal workflow.

## Release Rule

1.99.3 is a hardening release. Existing runtime concepts must be repaired at
their current authority boundaries. A local PASS is not sufficient when the
same source snapshot fails generated-project, installed-project, release, or
remote CI verification.

## Work Package A: Release And Version Truth

- update PR and release CI to consume the current Operating Decision schema;
- require CI assertions to derive their expected schema from current source or
  from one shared constant instead of hard-coded historical values;
- remove contradictory version fields from workflow-version templates;
- make installed version checks compare `.intentos/version.json` with the
  installed authoritative manifest;
- remove unbound relative updater commands from installed project guidance;
- keep the public entry at `intentos work <project> "<business goal>"` and move
  lower-level commands to maintainer diagnostics.

## Work Package B: Complete Review Context Authority

- define a required active-guidance registry that covers public entry,
  documentation front doors, starter guidance, collaboration instructions,
  reviewer prompts, task/review/apply/adoption/release prompts, and the current
  core operating contracts;
- validate source and installed aliases directly;
- canonicalize relative paths, reject root escapes, and reject symlinked
  installed authority inputs;
- include classification, active-guidance, and binding policy in a canonical
  context digest;
- detect supported active and passive contradictions while excluding explicit
  negative safety rules;
- apply review-drift validation to actual review output, not only self-tests.

## Work Package C: Review Input Identity

- parse exactly one `Current Review Context Binding` section;
- reject duplicate, partial, out-of-section, stale, or mismatched bindings;
- validate both Review Packet and GPT Review Prompt references;
- generate review inputs from canonical task identity, not request identity;
- bind each packet to the current task and project identity;
- require current binding for current implementation review;
- allow missing binding only for explicitly historical audit evidence;
- keep historical reports immutable and outside current-task strict validation.

## Work Package D: Evidence Source Resolution And Consumers

- resolve every Plan Review `source_ref` inside the project, reject unsafe or
  missing paths, and recompute every declared digest;
- require Plan Review consumers to validate the same semantic result as the
  Plan Review checker;
- make Execution Closure consume validated review evidence instead of searching
  arbitrary prose for `PASS`;
- make controlled apply reject required Plan Review states other than
  `PLAN_REVIEW_PASSED`;
- make Release Evidence Gate preserve strict Task Governance and Plan Review
  requirements when validating Completion Evidence;
- retain one evidence chain instead of introducing parallel records.

## Work Package E: Installed Project Isolation

- prefer `.intentos/intentos-manifest.json` in installed projects;
- accept a root manifest only for a positively identified IntentOS source
  checkout;
- never borrow profiles, baseline registries, context authority, or version
  truth from `process.cwd()` or the source repository while strictly checking a
  target project;
- support `AGENTS.md`, `agent.md`, and `.agent.md` consistently;
- fail closed when an installed source of truth is missing or invalid;
- keep explicit source catalogs available for planning, but not as target
  evidence.

## Work Package F: Solo Contract Runtime Alignment

- update starter README, engineering baseline, AGENTS guidance, and entry
  prompts so ordinary reversible engineering continues after internal gates;
- remove technical choices, baseline-pack selection, internal reviewer choice,
  and routine write approval from the user decision surface;
- preserve explicit consent only for prepared real-world effects and protected
  project authority;
- normalize `CURRENT_CONVERSATION_USER` consistently for bounded release
  consent without granting external authority;
- correct contradictory user-facing summaries and retire stale operator-facing
  public guidance.

## Work Package G: Verification Fail-Closed

- generated `verify.sh` scripts must return non-zero when no real verification
  path can run;
- source self-check must execute representative generated verification paths,
  not only shell syntax checks;
- add negative tests for missing tools/configuration, stale installed versions,
  manifest shadowing, source-registry borrowing, missing/duplicate bindings,
  wrong-task packets, stale GPT prompts, nonexistent Plan Review sources, and
  failing Plan Review consumers;
- run focused tests, generated-project checks, full `npm run verify`, and the
  exact PR workflow smoke commands on the final snapshot.

## Acceptance Matrix

| Scenario | Required result |
|---|---|
| current remote CI snapshot | all required checks pass |
| Plan Review source does not exist | fail |
| Plan Review source digest is stale | fail |
| downstream consumer receives failed Plan Review | fail |
| Review Packet belongs to another task/project | fail |
| GPT Review Prompt is missing or stale | fail for current review |
| old packet has no binding and is used only for audit | readable, not current evidence |
| old packet has no binding and is used for implementation | fail |
| installed root has stale root manifest | managed manifest remains authoritative |
| installed version differs from installed manifest | fail |
| strict target lacks baseline/profile registry | fail; do not borrow source assets |
| starter has no runnable verification path | non-zero exit |
| current guidance asks user to choose architecture/baseline | fail context check |
| aligned negative safety wording | pass conflict check |
| bounded prepared current-user consent | accepted only for that exact effect |

## Verification

- focused review-context, plan-review, execution, apply, release, manifest,
  baseline, starter, and operating-model tests;
- generated new-project and existing-project installation/update checks;
- `node scripts/check-intentos.mjs`;
- `npm run verify`;
- exact `.github/workflows/intentos-pr-checks.yml` source-smoke commands;
- `git diff --check`;
- remote GitHub Actions after commit and push.

## Non-Goals

- no 2.0 rewrite;
- no Solo/Team/Enterprise modes;
- no new public workflow commands;
- no global rebinding of every historical artifact;
- no weakening of task, apply, release, production, provider, or external
  authority boundaries;
- no automatic production action.

## Completion Rule

1.99.3 is complete only when the same final source snapshot passes local full
verification, generated and installed project regressions, exact CI smoke
commands, and remote CI, while current review evidence cannot be replaced by
missing, historical, wrong-task, wrong-project, or unvalidated sources.
