# IntentOS Capability Closure And Structural Governance 1.112-1.114 Plan

## Status

Approved for execution against frozen baseline `cc32179`.

This plan is based on the clean, reproducible IntentOS `1.111.1` baseline
frozen at commit `cc32179`.

The version slicing in this document is provisional and evidence-driven:

- `1.112`: capability authority mapping and closure audit;
- `1.113`: cross-domain consumer and behavioral closure hardening;
- `1.114`: post-closure repository and distribution structure governance.

An audit finding may require a narrower patch or a safety hardcut before the
next planned slice. Version numbering must not be used to hide unresolved
severity.

## Theme

Prove that IntentOS capabilities form one behaviorally complete engineering
trust chain before reorganizing the repository that contains them.

The nine capability domains are:

1. Project Entry;
2. Task Governance;
3. Business Closure;
4. Change Control;
5. Engineering Baselines;
6. Execution Governance;
7. Verification And Evidence;
8. Unified Closure;
9. Release And Evolution.

These domains are audit lenses. They are not a new public workflow, mandatory
linear lifecycle, user-visible mode set, state machine, artifact family, or
completion authority.

## Product Contract

The ordinary user continues to use one natural-language entry:

```text
work <real goal>
```

The zero-experience solo user provides only:

- the real business goal;
- unavailable business facts;
- bounded preferences between valid product outcomes;
- unavailable authoritative external facts;
- consent to one exact, prepared real-world effect.

Codex owns technical discovery, routing, architecture, baselines, task depth,
planning, change control, implementation, review, verification, repair,
evidence, rollback preparation, and the technical readiness recommendation.

The audit and later structure work must not expose the nine domains as choices
the user needs to understand.

## Why This Program Exists

IntentOS already contains mature systems for project entry, Work Queue, Task
Governance, Business Rule Closure, Change Impact Coverage, baselines, Plan
Review, Verification Plan, Runtime Trust, Execution Assurance, Unified
Closure, adoption, apply, and release.

The remaining system-level question is not whether those files exist. It is:

```text
Does every required source produce current authoritative evidence,
does every dependent consumer validate and use it,
and does every bypass or contradiction fail closed before completion?
```

A second problem is structural density. Core rules, current usage docs,
historical plans, templates, checklists, resolvers, checkers, generated assets,
compatibility paths, and release evidence can describe related concepts. A
repository reorganization performed before behavioral closure would create
large mechanical diffs, obscure trust defects, and risk breaking installed
projects.

Therefore this program uses the order:

```text
freeze
-> map without moving
-> audit behavior
-> repair by root cause
-> prove end-to-end closure
-> govern structure
```

## Core Decision

Do not perform broad directory, naming, command, schema, or artifact-path
reorganization before the nine-domain behavioral audit is complete.

Before the audit, perform only the minimum structural work required to make the
audit trustworthy:

- classify current, historical, compatibility, and generated guidance;
- identify one authority for each question;
- identify actual runtime and generation references;
- repair broken references or conflicting active authorities that make the
  audit indeterminate;
- preserve every existing project and artifact path unless a demonstrated
  safety defect requires a bounded compatibility change.

## Existing Authorities

This program consumes current source systems. It does not replace them.

| Capability domain | Principal current authorities |
|---|---|
| Project Entry | Operating Model, Project Entry And Adoption Trust, Project Fact Projection, Review Context Authority, existing-project adoption systems |
| Task Governance | Work Queue, verified project-native task source, Current Work Continuity, Task Governance, Conversation Drift Control |
| Business Closure | Business Universe Coverage and Business Rule Closure |
| Change Control | Change Boundary, Change Impact Coverage, Patch Classification, Plan Review, Planning Closure, Git Boundary |
| Engineering Baselines | Engineering Baseline, Environment Baseline, baseline selection, Standard Baseline Packs, Industrial Packs, Existing Rule Reconciliation |
| Execution Governance | Planning Closure handoff, Unified Apply Plan, Controlled Apply Readiness, Review Loop, Subagent Orchestration, Execution Assurance, Control Effectiveness |
| Verification And Evidence | Verification Plan, Verification Runtime Trust, Verification Runtime Lifecycle, Test Evidence, Evidence Authority |
| Unified Closure | Completion Evidence and Unified Closure; lower-level closure artifacts remain inputs only |
| Release And Evolution | Launch Review, Release Plan, Release Approval, Release Execution, Release Evidence, Runtime Hygiene, rollback and observation, retrospectives and learning candidates |

Review Context Authority governs current product-direction interpretation.
Evidence Authority governs project, task, revision, source, and evidence
identity. Unified Closure remains the only final task close-out authority.
Exact real-world consent remains separate from technical readiness.

## Non-Goals

This program does not:

- add a nine-step public workflow;
- add a six-stage public lifecycle;
- add a new completion, release, apply, or project-write authority;
- require the user to choose an audit domain, task tier, baseline, test tool,
  reviewer, Subagent, release recipe, or structure migration;
- treat the capability map as a runtime source of truth;
- move root workflow artifact directories during the audit;
- rewrite installed projects merely to make the source repository look clean;
- delete historical plans or release evidence;
- weaken stronger compatible project-native governance;
- claim that passing governance proves absolute business or production
  correctness.

## Program Invariants

### Invariant 1: one public entry

The ordinary user uses natural language. Internal domains and commands remain
hidden implementation details.

### Invariant 2: one authority per question

Two systems may contribute evidence, but they must not both claim final
authority for the same question.

### Invariant 3: derived views cannot authorize

Operating Decision, Planning Closure, dashboards, maps, traces, summaries, and
audit reports are derived views. They cannot write, approve, release, or
override their source systems.

### Invariant 4: current identity is mandatory

Strict evidence binds the current project, current task, current intent,
current revision or non-Git content identity, exact source refs, and applicable
runtime identity.

### Invariant 5: missing evidence fails closed

Absence, ambiguity, stale data, unresolved refs, parser failure, scan limits,
or contradictory source results cannot become a successful readiness or
completion result.

### Invariant 6: consumer use is proved

An upstream capability is not closed merely because its resolver and checker
exist. Every required downstream consumer must validate and use its result.

### Invariant 7: risk is proportional, never absent

LOW remains lightweight but complete. MEDIUM and HIGH add durable planning,
review, runtime, evidence, and rollback depth. POSSIBLE_HIGH cannot silently
downgrade itself.

### Invariant 8: stronger project authority is preserved

Existing projects use IntentOS as the daily operating model while compatible,
stronger project rules remain authoritative. Conflict resolution is
evidence-based, not a reason to remain permanently adapter-only and not a
license for broad replacement.

### Invariant 9: actual execution is compared with intent

Planned files, actual Git changes, generated changes, runtime effects, tests,
and evidence must agree. Unexpected or missing work invalidates the dependent
claim.

### Invariant 10: repair does not become patch accumulation

Findings are grouped by shared cause and consumer contract. Structural defects
receive a bounded hardcut rather than a sequence of local wording or checker
exceptions.

### Invariant 11: real-world consent is exact

Technical readiness never substitutes for consent. Consent is requested only
for one prepared external effect with consequence, evidence, and rollback
information.

### Invariant 12: structure follows proven behavior

Repository organization may summarize and expose the proven dependency model.
It must not invent the model or change behavior silently.

## Audit-Only Capability Map

### Purpose

Before domain review, derive one audit-only map of the current implementation.
For each capability, record:

```text
question owned
authoritative Core source
runtime resolver or producer
schema and human-readable template
strict checker
direct consumers
public entry route
Manifest and init distribution
Starter or installed-project copy
positive tests
adversarial tests
invalidation conditions
compatibility aliases
```

### Boundary

The map:

- is generated from current repository evidence where practical;
- is review evidence, not a new authority registry;
- cannot decide readiness or completion;
- cannot replace Manifest, Review Context Authority, Evidence Authority, or
  source-system contracts;
- is not copied into governed projects unless a later accepted design proves a
  project-local need;
- must expose unknown and conflicting relationships rather than infer success.

### Audit Labels

The audit may use the following report-only labels:

- `VERIFIED_CLOSED`;
- `PARTIAL`;
- `DISCONNECTED_CONSUMER`;
- `DUPLICATE_AUTHORITY`;
- `FAIL_OPEN`;
- `DISTRIBUTION_DRIFT`;
- `UNPROVEN`;
- `NOT_APPLICABLE_WITH_EVIDENCE`.

These labels are not runtime states and must not enter user-facing output.

## Review Method For Every Domain

Every capability domain must be reviewed through the same dimensions.

### 1. Authority

- What exact question does the capability own?
- Is there one current source of truth?
- Do historical or compatibility files still influence current behavior?
- Can a derived view override a source result?

### 2. Entry And Trigger

- How does the natural-language Operating Model select this capability?
- Does Task Governance determine whether and how deeply it applies?
- Can a normal route, update route, resume route, or installed project bypass
  the trigger?

### 3. Evidence Production

- Is evidence derived from current project facts rather than self-declaration?
- Are project, task, intent, revision, source, runtime, and time identities
  bound where applicable?
- Are scan limits, parser failures, symlinks, traversal, and unavailable data
  represented truthfully?

### 4. Strict Checking

- Does strict mode require a report when the capability is applicable?
- Are schemas strict and source-controlled?
- Do malformed, stale, copied, incomplete, contradictory, and placeholder
  records fail?

### 5. Consumer Binding

- Which downstream systems must consume the result?
- Do consumers rerun the strict checker or validate an equivalent authority
  envelope?
- Can a handwritten field, weak text, generic approval, or optional flag bypass
  the source?

### 6. Execution Effect

- Does the capability constrain actual work rather than only documentation?
- Are plans invalidated when scope, project, task, revision, or project rules
  change?
- Can a partial write, hidden generated file, or external effect survive a
  failed action?

### 7. Distribution

- Do source repository, Manifest, init/update, Starters, and installed projects
  use the same contract?
- Do new and existing projects receive behaviorally equivalent enforcement?
- Are compatibility assets clearly subordinate to current IntentOS/Codex
  authority?

### 8. Zero-Experience Contract

- Does Codex own every technical decision and remediation step?
- Is the user asked only for a permitted business fact, bounded product
  preference, unavailable external fact, or exact real-world consent?
- Are internal labels translated into plain language?

### 9. Positive And Adversarial Proof

- Is there a successful representative path?
- Is there at least one meaningful failure probe proving the control can fail?
- Do copied, stale, mismatched, missing, partial, and contradictory inputs fail
  before the dependent claim?

## Domain Audit Plans

### Domain 1: Project Entry

Prove that IntentOS correctly identifies and enters:

- a new empty project;
- an existing light project;
- an existing governed project;
- a production-sensitive project;
- a dirty or interrupted project;
- a non-Git project;
- a project containing legacy IntentOS or AI workflow assets.

Required checks:

1. target topology and path safety are resolved before writes;
2. Project Identity and Project Fact Projection agree across entry consumers;
3. effective Guidance Authority is current and complete;
4. existing authority discovery has no silent depth or count limits;
5. new-project initialization is atomic, recoverable, and cold-start verified;
6. existing-project adoption preserves stronger rules and reaches verified
   daily-work activation rather than file-presence adoption;
7. current work survives adoption and interruption;
8. update and migration routes cannot bypass production/adoption protection;
9. the next Codex session receives the same active IntentOS contract.

Adversarial cases include symlink targets, nested authority, conflicting
profiles, dirty worktrees, stale adoption evidence, copied project evidence,
partial initialization, and failed rollback.

### Domain 2: Task Governance

Prove that Work Queue and Task Governance act as the task continuity and policy
control spine.

Required checks:

1. exactly one current task exists, or one project-native task is selected;
2. original intent, task identity, pause state, resume state, and supersession
   are durable and current;
3. topic changes do not silently abandon or authorize work;
4. LOW, MEDIUM, POSSIBLE_HIGH, and HIGH classifications are evidence-derived;
5. unknown destructive, security, data, migration, release, and external-effect
   work cannot default to LOW;
6. each tier forces its required planning, review, verification, and completion
   consumers;
7. an existing project's weak or chaotic task source can be taken over without
   losing current work;
8. forged resume approval, multiple-current records, and stale task cards fail;
9. Goal Mode and other compatibility concepts cannot downgrade Task
   Governance.

### Domain 3: Business Closure

Prove that a business-affecting task cannot be completed after only a local or
happy-path implementation.

Required checks:

1. Business Universe Coverage triggers only from evidence-backed omission risk;
2. relevant categories, participants, origins, processing paths, lifecycle
   branches, selection points, and consistency relationships are considered;
3. real generation paths are distinguished from mocks, seeds, samples, and
   manual statements;
4. creation, validation, transition, propagation, modification, failure,
   reversal, compensation, reconciliation, and audit stages are closed or
   excluded with evidence when applicable;
5. Business Rule Closure records actors, triggers, conditions, results,
   exceptions, permissions, and verification obligations;
6. stable scenario identities survive Change Impact, Verification Plan, Test
   Evidence, and Completion Evidence;
7. missing technical discovery remains Codex-owned;
8. unavailable business or external facts block only dependent claims;
9. a local test pass cannot close an incomplete business universe.

### Domain 4: Change Control

This is the first deep audit after the regression review of Domains 1-3.

Prove the complete chain:

```text
current task and business rules
-> affected surfaces
-> required, allowed, conditional, and prohibited changes
-> patch or structural treatment
-> reviewed plan
-> Planning Closure
-> actual diff and generated changes
-> verification obligations
-> completion decision
```

Required checks:

1. Change Boundary is derived from current task and project evidence;
2. Change Impact covers frontend, backend, API, data, permissions, background
   work, external integration, tests, docs, runtime, release, and rollback when
   applicable;
3. exclusions and `NOT_APPLICABLE` claims require evidence;
4. Patch Classification distinguishes safe local correction from structural
   repair, hardcut, migration, governance change, or prohibited patching;
5. Plan Review validates exact scope, business linkage, baseline, verification,
   rollback, and review obligations;
6. Planning Closure cannot turn readiness into write permission;
7. actual Git and generated changes are compared with the exact approved plan;
8. plan drift, source drift, task drift, or newly discovered impact invalidates
   the dependent plan and returns to bounded planning;
9. unexpected files, omitted files, unrelated refactors, hidden generated
   output, and partial writes fail closure;
10. LOW changes remain lightweight but still receive actual-diff and targeted
    verification review;
11. structural work cannot be decomposed into accumulating local patches to
    bypass review depth;
12. failed apply is atomic or produces an explicit recoverable partial state
    that can never be reported as verified.

Adversarial cases must include backend-only implementation of a cross-surface
rule, plan-external refactor, stale plan replay, dirty-work attribution error,
untracked generated output, partial apply failure, patch accumulation, and a
passing but unrelated test suite.

### Domain 5: Engineering Baselines

Prove that baseline selection means the project actually has and follows the
applicable engineering constraints.

Required checks:

1. platform and project facts are not polluted by IntentOS assets;
2. BL0, BL1, and BL2 semantics are consistent across every consumer;
3. Standard Baseline Packs match platform and project type;
4. Industrial Packs are selected only when their capability and evidence
   requirements apply;
5. selection, installation, implementation, and effectiveness remain distinct;
6. engineering and environment baselines are created for new projects and
   reconciled for existing projects;
7. stronger compatible project rules are preserved;
8. conflicting or missing structural rules cause Codex discovery, a bounded
   technical decision, or a technical blocker rather than a user choice;
9. source, Starter, generated project, and installed project behavior match;
10. baseline controls are consumed by Plan Review, execution review, and
    verification rather than remaining advisory text.

Platform coverage includes generic, Web, iOS, Android, and Mini Program
governance. Platform tests prove selection and distribution semantics; they do
not falsely claim that every platform application was built or released.

### Domain 6: Execution Governance

Prove that reviewed intent becomes bounded implementation without authority or
scope drift.

Required checks:

1. only a current Planning Closure handoff can enter the applicable execution
   route;
2. ordinary reversible project-local implementation does not wait for a second
   technical user approval;
3. Unified Apply Plan is the exact action graph for controlled asset writes;
4. Controlled Apply Readiness validates authority, target identity, rollback,
   verification, and invalidation immediately before apply;
5. apply uses path-safe, symlink-safe, atomic or recoverable operations;
6. Review Loop repairs only `AUTO_FIX` findings inside the current boundary and
   cannot expand scope;
7. Subagent roles are selected by task risk, use bounded inputs, report closure,
   and are closed after use;
8. Execution Assurance derives actual change and evidence rather than trusting
   a report's self-description;
9. Control Effectiveness proves relied-on controls can detect representative
   failures;
10. partial execution, interrupted execution, retry, rollback, and resume retain
    task and action identity;
11. execution never authorizes release, production, paid resources, real-user
    communication, or irreversible real-data effects.

### Domain 7: Verification And Evidence

Prove that evidence is correct, current, relevant, and produced by the intended
code and runtime.

Required checks:

1. Verification Plan derives obligations from business scenarios and affected
   surfaces;
2. test correctness controls challenge Codex-authored tests;
3. tests cover positive, negative, permission, failure, reversal, compensation,
   cross-surface, and real-generation paths when applicable;
4. Runtime Plan selects an appropriate local, project-native, container, or
   external verification adapter without asking the user for technical setup;
5. high-risk runs use isolated services, data, sessions, and ownership-bound
   cleanup where required;
6. Verification Run Manifest binds current code, build, service instance,
   resources, command, output, time, and cleanup;
7. Test Evidence binds exact obligations to exact current results;
8. Evidence Authority rejects stale, copied, symlinked, traversal, mismatched,
   placeholder, or project-external evidence;
9. broad test commands cannot substitute for task-mapped evidence;
10. skipped, flaky, not-run, or self-asserted results cannot pass;
11. independent review or Challenger evidence is required for applicable high
    risk;
12. source and installed-project schemas cannot be weakened locally.

### Domain 8: Unified Closure

Prove that one task has one final evidence-derived close-out truth.

Required checks:

1. Completion Evidence validates every required source for the current task;
2. Unified Closure reruns or equivalently validates strict source checkers;
3. missing Work Queue, Task Governance, business, impact, planning, actual-diff,
   verification, runtime, review, debt, or evidence sources block when
   applicable;
4. contradictory lower-level results select the stricter result and remain
   explainable;
5. copied, stale, weak, text-only, or unrelated evidence cannot produce
   `DONE`;
6. LOW cannot bypass the minimum current-task, diff, verification, and evidence
   contract;
7. `DONE` means complete for the exact task scope only;
8. closure cannot authorize apply, commit, push, release, production, or future
   work;
9. plain-language output exposes the business result and true blocker without
   exposing internal workflow complexity.

### Domain 9: Release And Evolution

Prove that a completed task can be prepared, consented, released, observed,
rolled back, and learned from without confusing readiness with authority.

Required checks:

1. Launch Review derives a product/release view from current closure and project
   release authority;
2. platform recipe and target channel match the actual project and candidate;
3. release candidate identity binds commit, package/build, artifact, platform,
   environment, and evidence;
4. Runtime Hygiene, channel policy, release evidence, topology, migration, and
   rollback requirements are mandatory consumers when applicable;
5. Release Approval is structured, project-bound, candidate-bound, action-bound,
   and cannot be inferred from generic conversation text;
6. Codex recommends technical readiness and prepares the exact action; the user
   consents only to the real-world effect;
7. execution performs only approved actions and records authoritative receipts;
8. production observation, smoke evidence, monitoring, rollback readiness, and
   incident information remain distinct from pre-release evidence;
9. failed or partial release cannot be reported as released;
10. retrospectives, escaped defects, debt handoff, workflow improvements, and
    skill candidates remain proposals until their own governance accepts them;
11. learning cannot silently rewrite active IntentOS or project rules.

## Cross-Domain End-To-End Matrix

Domain-level PASS is insufficient. The program must execute end-to-end
scenarios across these dimensions.

### Project Types

- new generic project;
- new Web project;
- generated iOS project governance path;
- generated Android project governance path;
- generated Mini Program governance path;
- existing light project;
- existing chaotic project with weak task records;
- existing governed project with stronger rules;
- production-sensitive project;
- non-Git project where supported.

### Task Types

- LOW documentation or local presentation correction;
- LOW bounded code correction;
- MEDIUM cross-surface behavior change;
- HIGH permission, data, migration, or release-sensitive change;
- POSSIBLE_HIGH ambiguous task requiring read-only discovery;
- business-universe-triggering task;
- non-behavioral task where Business Universe is not required;
- interrupted and resumed long-running task;
- task whose goal changes during execution;
- structural hardcut that must reject patch accumulation.

### Result Paths

- successful implementation and closure;
- missing business fact;
- missing external authority fact;
- exact real-world consent pending;
- stale or copied evidence;
- incorrect test;
- runtime identity mismatch;
- plan drift and unexpected diff;
- partial apply failure and rollback;
- failed release and post-release rollback;
- escaped defect entering a governed learning proposal.

### Required Cross-Chain Assertions

For every applicable scenario:

1. project identity remains stable and current;
2. one current task and original goal remain bound;
3. task tier controls required depth;
4. business scenario identities survive planning, implementation, verification,
   and closure;
5. actual changes match the bounded plan;
6. tests and runtime evidence match current code and task;
7. no missing or contradictory source can yield success;
8. public output asks no technical question of the zero-experience user;
9. release and external effects remain separately consented;
10. generated and installed behavior matches source behavior.

## Remediation Policy

### Finding Severity

- `P0`: unauthorized real-world action, false final completion/release, unsafe
  write, evidence escape, or authority bypass with immediate material risk;
- `P1`: required source or consumer can be bypassed, fail-open, stale, copied,
  or absent while a strict claim still passes;
- `P2`: distribution, terminology, diagnostics, or structure drift that does
  not currently permit a strict false claim but weakens maintainability or
  future safety;
- `P3`: editorial or discoverability issue with no active behavior impact.

### Repair Order

1. P0 authority and safety defects;
2. P1 source, checker, and consumer-chain defects;
3. cross-domain identity and invalidation defects;
4. generated and installed parity defects;
5. zero-experience responsibility regressions;
6. P2/P3 structure and documentation findings.

### Root-Cause Hardcut Rule

Before editing, group findings by shared cause:

- missing authoritative source;
- duplicated authority;
- weak evidence production;
- checker fail-open;
- consumer not enforcing source;
- distribution drift;
- compatibility semantics overriding current rules;
- execution non-atomicity;
- structural discoverability only.

One shared cause receives one bounded design and acceptance set. Do not add
isolated regexes, optional flags, path exceptions, or report wording patches
when the defect belongs to a shared authority or consumer contract.

## Post-Closure Structural Governance

Full structural governance begins only after:

- all P0 and P1 findings are closed;
- the nine domain reports are accepted;
- the end-to-end matrix passes;
- source and installed-project parity passes;
- the current behavior graph is stable enough to organize.

### Structural Goals

1. expose one clear public product entry;
2. expose one maintained capability index for developers and reviewers;
3. distinguish current authority, usage guidance, reference, compatibility,
   historical plans, roadmaps, examples, fixtures, and release evidence;
4. reduce duplicate current explanations;
5. identify unused or unconsumed scripts, templates, schemas, and checklists;
6. align file ownership, Manifest groups, init/update copies, Starters, tests,
   and documentation indexes;
7. reduce documented command surface without removing compatibility commands
   prematurely;
8. preserve generated-project artifact paths or provide an explicit migration;
9. make the structure mechanically checkable.

### Structural Classification

Every governed asset must have one primary class:

- `CURRENT_AUTHORITY`;
- `CURRENT_USAGE`;
- `RUNTIME_IMPLEMENTATION`;
- `GENERATED_ASSET`;
- `REFERENCE`;
- `COMPATIBILITY`;
- `HISTORICAL_PLAN`;
- `ROADMAP`;
- `EXAMPLE_OR_FIXTURE`;
- `RELEASE_EVIDENCE`;
- `DEPRECATED_PENDING_MIGRATION`.

Classification must be derived from actual consumers and distribution, not
only directory names.

### Permitted Structural Changes

After acceptance, a structural release may:

- consolidate duplicate current usage pages;
- move current reference material under stable reference namespaces;
- add generated indexes or dependency views;
- archive or mark superseded current-looking documents;
- remove dead internal assets after proving no source, runtime, generated, or
  installed consumer remains;
- simplify Manifest operations after proving source and target parity;
- add compatibility redirects or migration records for moved paths.

### Protected Structural Boundaries

Do not move or rename without a dedicated compatibility and installed-project
migration proof:

- root workflow artifact directories;
- project-local evidence paths consumed by strict checkers;
- `.intentos` installed layout;
- `AGENTS.md` and generated agent entry contracts;
- schema IDs and evidence field names used by installed projects;
- CLI commands used by current generated assets or project automation;
- release and apply evidence locations.

### Structure Acceptance

Structural work passes only when:

1. behavior before and after is equivalent for every accepted end-to-end case;
2. all moved paths have updated Manifest, imports, links, templates, Starters,
   fixtures, tests, and installed-project migration behavior;
3. no historical or compatibility source becomes active authority;
4. no current source becomes unreachable;
5. source and generated-project full verification passes;
6. repository navigation is simpler without increasing user workflow surface.

## Provisional Release Slicing

### 1.112: Capability Authority Mapping And Closure Audit

Scope:

- freeze the `1.111.1` baseline;
- derive the audit-only capability map;
- run all nine domain reviews;
- reproduce findings safely;
- close only prerequisite authority conflicts that make the audit unreliable;
- publish evidence-backed findings and a remediation graph.

`1.112` must not claim behavioral closure merely because the audit completed.

### 1.113: Cross-Domain Closure Hardening

Scope:

- close P0/P1 findings by shared root cause;
- harden source production, strict checking, consumer binding, invalidation,
  atomicity, and generated parity;
- execute the full cross-domain matrix;
- prove new and existing project behavior;
- obtain independent read-only review of final evidence.

If the audit reveals multiple independently releasable safety hardcuts, use
bounded patch/minor slices instead of forcing all changes into one release.

### 1.114: Repository And Distribution Structural Governance

Scope:

- classify the repository from the accepted behavior graph;
- consolidate active docs and internal discoverability;
- archive or deprecate superseded current-looking material;
- remove proven dead duplication;
- align Manifest, generation, installation, references, and command docs;
- run compatibility and installed-project migration verification.

`1.114` is not allowed to change task, evidence, completion, apply, or release
semantics silently.

## Goal And Subagent Orchestration

Execution may use Goal Mode and Subagents because the review surfaces are
independent enough for bounded parallel analysis.

### Main Thread Responsibilities

- freeze and identify the exact baseline;
- own the capability map and cross-domain dependency model;
- assign non-overlapping review scopes;
- reproduce every P0/P1 finding before remediation;
- decide shared root causes and implementation boundaries;
- integrate changes and run cross-domain acceptance;
- ensure every Subagent is closed after its result is consumed;
- own final claims, commits, and release evidence.

### Suggested Read-Only Review Assignments

1. Project Entry and Task Governance;
2. Business Closure and Change Control;
3. Engineering Baselines and distribution;
4. Execution Governance and apply safety;
5. Verification, Runtime Trust, and Evidence Authority;
6. Completion and Unified Closure;
7. Release and evolution;
8. zero-experience UX, repository integrity, and installed-project parity.

### Subagent Rules

- reviewers remain read-only unless assigned a later disjoint implementation
  scope;
- prompts bind the exact commit, domain questions, authority sources, and
  forbidden claims;
- reviewers report file/line evidence and safe reproduction steps;
- reviewers do not invent a new authority or user workflow;
- main thread resolves cross-domain conflicts;
- completed or idle agents are closed before new dispatch.

## Execution Phases

### Phase 0: Baseline Freeze

1. complete and review the `1.111.1` candidate;
2. commit it separately from this program;
3. require a clean worktree;
4. record commit SHA, version, Manifest digest, Review Context digest, and full
   verification result;
5. prohibit unrelated edits during audit reproduction.

### Phase 1: Read-Only Capability Mapping

1. inventory current authorities, runtime producers, schemas, templates,
   checkers, consumers, entry routes, Manifest copies, Starters, and tests;
2. trace actual imports, subprocess calls, path conventions, and generated
   copies;
3. classify historical and compatibility assets;
4. record unknown, duplicate, broken, and unconsumed relationships;
5. fix only authority conflicts or broken references that prevent trustworthy
   audit results.

### Phase 2: Domains 1-3 Regression Review

Revalidate Project Entry, Task Governance, and Business Closure against the
current `1.111.1` consumer chain. Do not assume previous release evidence proves
the current combined system.

### Phase 3: Domain 4 Change Control Deep Audit

Execute the complete change-control positive and adversarial matrix. Trace
scope from business intent through actual diff and final completion. Treat any
plan/diff/verification disconnect as at least P1 until shown otherwise.

### Phase 4: Domains 5-7 Trust Review

Audit baselines, execution, runtime verification, test correctness, Evidence
Authority, apply safety, review, and Subagent behavior as one connected trust
surface while preserving each source authority.

### Phase 5: Domains 8-9 Closure And Delivery Review

Audit final completion, release preparation, real-world consent, release
execution, observation, rollback, and governed learning.

### Phase 6: Remediation Design

1. group findings by root cause;
2. define bounded change sets and exact consumers;
3. specify positive and adversarial acceptance before implementation;
4. reject patch accumulation and optional strictness for required safety;
5. preserve compatibility only where a real installed consumer exists.

### Phase 7: Remediation Execution

Implement highest severity first. After every root-cause slice:

- run focused tests;
- rerun affected domain checks;
- rerun direct downstream consumers;
- verify generated and installed parity;
- update the finding and evidence record;
- stop if scope expands beyond the accepted root cause.

### Phase 8: End-To-End Acceptance

Run the full project, task, and result matrix. Require strict negative cases,
not only source text and positive samples. Run independent read-only review on
the final candidate.

### Phase 9: Structural Governance

Only after behavioral acceptance, prepare and execute the structural change
graph with exact path migrations, consumer updates, compatibility behavior,
rollback, and before/after equivalence evidence.

### Phase 10: Release Close-Out

For each release slice:

1. synchronize version sources;
2. update current docs and indexes;
3. record allowed and forbidden claims;
4. record known limitations and deferred P2/P3 items;
5. run focused and full verification;
6. run `git diff --check`;
7. obtain independent review;
8. commit and push only after the release evidence matches the exact candidate.

## Required Verification

The exact commands may be refined by the accepted capability map, but the
minimum final suite includes:

```bash
node scripts/check-review-context-authority.mjs .
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs .
node scripts/check-consumer-chain.mjs . --base <accepted-base>
npm run verify:project-entry
npm run verify:planning-closure
npm run verify:business-universe
npm run verify:control-effectiveness
npm run verify:runtime-trust
npm run verify:baseline
npm run verify:governance
npm run verify:release
npm run verify
git diff --check
```

Additional required verification:

- generated generic project cold start;
- generated Web, iOS, and Android governance parity;
- Mini Program profile and pack selection parity;
- existing light project adoption simulation;
- existing governed production-sensitive project read-only and controlled
  adoption simulation;
- Work Queue takeover, interruption, and resume tests;
- LOW, MEDIUM, POSSIBLE_HIGH, and HIGH task chains;
- change-control actual-diff adversarial tests;
- stale/copied/mismatched evidence tests;
- runtime identity and cleanup tests;
- failed/partial apply recovery tests;
- release consent, candidate identity, failure, observation, and rollback tests;
- structural before/after equivalence tests in `1.114`.

## Acceptance Criteria

The behavioral closure program is accepted only when:

1. all nine domains have evidence-backed audit conclusions;
2. no unresolved P0 or P1 remains;
3. every applicable capability has one current authority;
4. every required source has a strict, current, fail-closed consumer chain;
5. project, task, intent, revision, source, runtime, and release identities are
   bound where applicable;
6. actual execution is compared with reviewed intent and change boundaries;
7. LOW remains lightweight but cannot bypass verification or completion;
8. new, existing, governed, dirty, interrupted, and generated projects follow
   their applicable safe paths;
9. technical uncertainty never becomes a zero-experience user decision;
10. exact real-world effects remain separately consented;
11. generated and installed projects enforce the same active contract;
12. Unified Closure cannot return `DONE` from missing, stale, copied,
    contradictory, or weak evidence;
13. release cannot proceed from readiness text or generic approval;
14. full source and generated-project verification passes;
15. independent review finds no unresolved authority or consumer-chain blocker.

Structural governance is accepted only when the above remains true after the
reorganization and every moved or deprecated path has proven compatibility.

## Stop Conditions

Stop the current release slice if:

- a new user-visible workflow, lifecycle, mode, or technical-choice menu is
  introduced;
- an audit report becomes a source authority;
- a current source question gains two final authorities;
- a required checker becomes optional to preserve a positive fixture;
- a strict consumer accepts missing, stale, copied, placeholder, or mismatched
  evidence;
- a technical blocker is converted into a user choice;
- a derived readiness state authorizes a write or external effect;
- root artifact or installed-project paths move before migration proof exists;
- a local patch hides a shared source or consumer defect;
- generated projects diverge from source behavior;
- full verification fails or release evidence describes a different candidate;
- P0/P1 findings are deferred merely to keep the planned version sequence.

## Allowed Claims

After `1.112` acceptance, IntentOS may claim only that the nine-domain audit was
performed against the named baseline and that recorded findings are supported
by the checked evidence.

After `1.113` acceptance, IntentOS may claim that the checked source and
generated-project scenarios have a fail-closed cross-domain capability chain
for the accepted matrix.

After `1.114` acceptance, IntentOS may additionally claim that repository and
distribution structure were aligned with the accepted behavior graph while
preserving the checked compatibility paths.

## Forbidden Claims

The program may not claim:

- every possible project, platform, business rule, runtime, or release is
  proven;
- IntentOS eliminates all software defects;
- passing static checks proves production behavior;
- a map, audit, plan, report, or readiness state authorizes implementation,
  apply, release, or production;
- the zero-experience user has approved a technical decision;
- all historical and installed compatibility paths are removable;
- structural cleanliness proves behavioral closure;
- simulated or generated-project evidence is production adoption evidence.

## Completion Rule

This plan is complete only when:

1. `1.111.1` is frozen independently;
2. the capability map is derived and reviewed;
3. all nine domains are audited against current source and installed behavior;
4. P0/P1 root causes are repaired and verified;
5. the end-to-end matrix passes;
6. independent review accepts the behavioral closure evidence;
7. structural governance is executed only from the accepted behavior graph;
8. post-structure equivalence and compatibility verification passes;
9. release records state bounded claims and remaining limitations accurately.

Until those conditions hold, IntentOS must describe the work as an active
capability-closure and structure-governance program, not as universal or
production-complete proof.
