# Business Universe Coverage 1.108 Scenario, Lifecycle, And Path Provenance Hardcut

## Status

This document replaces the earlier uncommitted 1.108 plan.

IntentOS 1.108 has not been released or committed. The implementation must be
corrected in place. There is no 1.108 compatibility layer and no 1.108.1 patch
stack. Historical compatibility starts at 1.107.1 and earlier only.

The current worktree may contain provisional 1.108 version markers and release
text from the discarded implementation draft. Those markers are candidate
metadata only. Public `Current release` claims, final release evidence, and
version-source promotion must be deferred until every stop condition in this
plan is cleared for the exact candidate revision.

## Theme

IntentOS 1.108 adds conditional Business Universe Coverage as one internal,
task-bound scenario-requirement source before Business Rule Closure.

The hardcut makes that capability domain-neutral, structure-driven,
lifecycle-aware, and path-provenance-aware. It must detect omissions in the
business categories, participants, origins, lifecycle branches, project-native
behavior paths, selection points, processing paths, and consistency
relationships required by the current task. It must not derive completeness
from a fixed industry list or isolated words such as report, sync, settlement,
cancel, mock, seed, or all.

It answers one narrow question:

~~~text
Did Codex identify and evidence every task-relevant business scenario, including
its category, participant, origin, applicable lifecycle behavior, project path
provenance, selection and consistency relationships, and required proof
strength, whose omission could make this task look complete while remaining
behaviorally incomplete?
~~~

It defines bounded coverage scenarios and proof requirements. It does not decide
whether the business policy is correct, create Verification Plan obligation
identity, execute tests, prove runtime identity, own Test Evidence, authorize
implementation, release, production, or completion. Unified Closure remains the
only final completion authority.

## Product Contract

The public user continues to use the natural-language work entry. The user does
not select:

- Business Universe Coverage;
- task tiers;
- industry vocabularies;
- categories or source types;
- platform surfaces;
- checkers, schemas, agents, or test tools;
- review depth or Challenger topology.

Codex owns:

- resolving the one current Work Queue item and any required resume review before
  task-level evidence is generated;
- performing a bounded lightweight omission-risk preflight for every behavioral
  or behavior-ambiguous task without creating a public workflow or empty
  Business Universe report;
- determining whether omission risk exists;
- reading the project and its authoritative specifications;
- identifying domain terms from project evidence instead of an embedded
  industry whitelist;
- enumerating candidate categories, origins, selection points, and processing
  paths;
- identifying task-relevant participants and lifecycle branches;
- distinguishing project-native behavior paths from fixtures, seeds, mocks,
  stubs, and manual-only paths;
- deriving bounded coverage scenarios and their required proof strength;
- resolving technical uncertainty;
- choosing platform-appropriate verification surfaces;
- generating and checking exact evidence;
- continuing read-only inspection when evidence is insufficient.

The user may only be asked for:

- one missing business fact or product preference that cannot be inferred;
- one unavailable external authoritative fact;
- exact consent for a prepared real-world effect under the existing
  zero-experience solo operating contract.

Technical ambiguity never becomes a technical question for the user.

## Why The Existing Draft Must Be Reworked

The first 1.108 implementation has the correct workflow position but an
incorrect trigger and evidence model:

1. isolated words can trigger coverage without structural omission risk;
2. a fixed contract/order/invoice/payment-style vocabulary favors a few
   business domains and misses others;
3. broad action words such as create, update, task, route, and message can be
   mistaken for distinct business origins;
4. a matching filename can become EVIDENCE_BOUND without semantic proof;
5. one file can be reused as both source and processing evidence without an
   exact locator or relationship;
6. an upstream-filter trigger does not require a recorded selection point;
7. aggregate vocabulary can force consistency and Challenger review without a
   real multi-input dependency;
8. category verification is always emitted as backend/API work;
9. an initially LOW task may reveal evidence-backed behavioral omission risk
   and must then converge monotonically to MEDIUM, while MEDIUM remains on its
   targeted rather than HIGH review policy;
10. focused tests overrepresent contracts, manual entry, and imports;
11. lifecycle branches such as correction, failure, recovery, termination, or
    compensation are not represented as first-class applicability evidence;
12. fixture, seed, mock, unit, integration, manual, and project-runtime proof are
    not separated by provenance, evidence kind, and claim scope;
13. a category can survive downstream while one required lifecycle scenario or
    project-native path silently disappears.
14. the report is not jointly bound to the current Work Queue item and Task
    Governance decision, so stale, paused, or resumed task evidence can be
    confused with the current task;
15. full coverage runs only after omission risk is already known, but no
    lightweight preflight exists to discover a hidden structural signal;
16. current acceptance commands can pass in allow-empty mode without proving one
    exact strict consumer chain.

The correction must not solve item 9 by forcing a confirmed non-behavioral LOW
task or a MEDIUM task through the HIGH review policy. It must reclassify a LOW
task only when project evidence proves behavioral omission risk, then preserve
coverage through the resulting risk-proportionate consumer policy.

These are release-blocking design defects for 1.108. They are not documented
limitations.

## Non-Goals

1. Do not create a new public workflow or user command.
2. Do not introduce an industry ontology.
3. Do not infer legal, tax, regulatory, clinical, financial, or provider rules.
4. Do not treat source-code existence as business correctness.
5. Do not require every task to create a durable Business Universe report or run
   full semantic discovery. A bounded internal omission-risk preflight may run
   for behavioral and behavior-ambiguous tasks.
6. Do not force backend, API, database, or integration testing on client-only
   behavior.
7. Do not create another final state machine or completion authority.
8. Do not execute production behavior or external effects.
9. Do not retain compatibility for the unreleased first 1.108 schema.
10. Do not replace Verification Plan, Verification Runtime Trust, Test Evidence,
    Execution Assurance, or Unified Closure.
11. Do not require production execution to prove a project-native behavior path;
    isolated current-code runtime evidence is sufficient when the task requires
    runtime proof.
12. Do not generate the Cartesian product of every category and every lifecycle
    stage when project evidence does not make that combination relevant.
13. Do not create separate Lifecycle Coverage, Path Provenance, or Scenario
    Trace public commands, artifact families, reports, or user decisions. They
    are sections of the single conditional Business Universe capability.

## Position In The Workflow

~~~text
Natural-language goal
-> Work Queue current-task resolution
-> Task Governance task-kind and preliminary-risk read
-> lightweight omission-risk preflight for behavioral or ambiguous work
-> Task Governance structural omission-risk routing
-> conditional Business Universe Coverage
-> Business Rule Closure
-> Change Impact Coverage
-> Plan Review
-> Verification Plan
-> conditional Verification Runtime Plan / Run Manifest
-> Test Evidence
-> Execution Assurance / Completion Evidence
-> Unified Closure / finish
~~~

Business Universe Coverage is an internal evidence dependency. It is not a
separate user journey and never appears as a technical choice.

## Task Entry And Lightweight Preflight

### Current Task Binding

Business Universe Coverage extends the existing Task Entry Binding. It does not
create another task identity system.

The exact current task must be jointly bound through:

~~~text
work_queue_item_ref
work_queue_item_digest
work_queue_item_state
work_queue_item_current_task_match
approved_resume_review
resume_review_ref
resume_review_digest
task_governance_ref
task_governance_digest
task_governance_task_match
~~~

`COVERAGE_READY` requires the referenced Work Queue item to be the one current
task. `PAUSED`, `BLOCKED`, `BACKLOG`, `DONE`, or `CANCELLED` items cannot supply
current coverage. A resumed task requires the existing valid resume-review
binding. A task switch, queue-item digest change, stale resume review, changed
intent, or superseding Task Governance decision invalidates the report and all
downstream projections.

The checker must reuse `scripts/lib/task-entry-binding.mjs`. It must not fork,
shadow, or weaken Work Queue or Task Governance identity semantics.

### Lightweight Omission-Risk Preflight

Every task receives evidence-backed task-kind classification. Every task that is
behavioral or whose behavior impact is ambiguous then receives one bounded,
read-only omission-risk preflight before Task Governance makes the final
Business Universe routing decision.

The preflight:

- inspects the current intent and the nearest authoritative project evidence;
- looks only for structural signals such as shared rules, multiple origins,
  selection, derived results, lifecycle branches, or path-provenance ambiguity;
- records candidate evidence refs and one discovery-boundary digest inside Task
  Governance;
- cannot produce `COVERAGE_READY`;
- cannot create a Business Universe report, user question, command, artifact
  family, or completion state;
- routes an incomplete or unsupported technical read to
  `TECHNICAL_INSPECTION_REQUIRED` rather than silently returning not required.

A task may become `NOT_REQUIRED_WITH_REASON` only after task-kind evidence and
the preflight jointly show that no supported structural omission signal affects
the requested behavior. This keeps full coverage conditional while removing the
"not scanned because risk was not already known" blind spot.

## Target Conceptual Model

### Category

A category is a task-relevant class of object, event, case, state, or behavioral
variant that may require different handling.

Categories are discovered from the current task and project. They are not
selected from a global domain list.

### Participant

A participant is a task-relevant human, system, device, provider, scheduled
actor, or project-native agent that creates, changes, receives, observes, or is
otherwise materially involved in a scenario. Participants are structural
business dimensions, not team roles or additional people the user must appoint.

### Origin

An origin is a distinct way a category or event enters the behavior under
review. Examples may include a user action, imported data, a local device
event, an API call, a scheduled process, an external event, or a project-native
mechanism. These are examples, not the complete supported list.

### Processing Path

A processing path is the project-local behavior that transforms, validates,
routes, persists, presents, transmits, or otherwise handles a category.

### Lifecycle Stage

A lifecycle stage is a generic behavioral phase that may create a distinct
coverage obligation for one category or scenario:

~~~text
ORIGIN_OR_ENTRY
ELIGIBILITY_OR_VALIDATION
PROCESSING_OR_TRANSITION
PROPAGATION_OR_SIDE_EFFECT
DERIVED_RESULT
MUTATION_OR_CORRECTION
FAILURE_RETRY_OR_RECOVERY
TERMINATION_REVERSAL_OR_COMPENSATION
OBSERVATION_OR_AUDIT
~~~

Settlement, reconciliation, cancellation, refund, moderation, archiving, sync,
and similar domain terms are examples that can map into these structural stages.
They are not universal lifecycle stages and cannot trigger coverage by word
match alone.

Each task-relevant category records one lifecycle applicability disposition for
every stage considered by the bounded discovery:

~~~text
REQUIRED
NOT_APPLICABLE_WITH_EVIDENCE
TECHNICAL_INSPECTION_REQUIRED
~~~

The matrix is evidence-driven and sparse. Identical category/stage behavior may
share one scenario only when the preserved category IDs and evidence prove that
the rule, path, expected behavior, and proof strength are identical.

### Path Provenance

Path provenance describes how the behavior under review is produced. It is
separate from test type and evidence format:

~~~text
PROJECT_RUNTIME_PATH
PROJECT_NATIVE_AUTOMATION
EXTERNAL_SYSTEM_PATH
FIXTURE_OR_SEED_PATH
MOCK_OR_STUB_PATH
MANUAL_ONLY_PATH
UNKNOWN_PATH
~~~

`PROJECT_RUNTIME_PATH` means the project's real implementation path running in
a bounded environment. It does not mean production. Runtime identity and
isolation are proved later by Verification Runtime Trust when required.

Fixture, seed, mock, stub, and manual-only paths may prove only the claims their
evidence scope supports. They cannot by themselves prove that current project
behavior automatically creates, propagates, updates, reverses, or recovers the
required result.

### Required Proof Strength

Business Universe Coverage records what strength of downstream proof a scenario
needs, without selecting a test framework or inventing evidence:

~~~text
STRUCTURAL_SOURCE_PROOF
PROJECT_NATIVE_BEHAVIOR_PROOF
RUNTIME_TRUSTED_BEHAVIOR_PROOF
EXTERNAL_FACT_PROOF
~~~

Verification Plan translates that requirement into obligations. Verification
Runtime Trust proves current runtime provenance when required. Test Evidence
binds actual evidence to those obligations.

### Selection Point

A selection point includes filtering, routing, branching, eligibility,
exclusion, deduplication, prioritization, or fan-out behavior that can silently
drop or divert a category.

### Consistency Group

A consistency group records categories or origins that must contribute to or
agree with one derived result. Summary, reconciliation, synchronization,
reporting, and settlement are possible examples. None of those words alone
creates a consistency group.

### Coverage Scenario

A coverage scenario is the stable root requirement that connects one bounded
business behavior through the existing IntentOS chain. It records:

~~~text
coverage_scenario_id
category_ids[]
participant_ids[]
origin_ids[]
lifecycle_stage
processing_path_ids[]
selection_point_ids[]
consistency_group_ids[]
path_provenance
required_proof_strength
expected_behavior
negative_or_reverse_behavior
source_locator_refs[]
scenario_digest
~~~

`coverage_scenario_id` remains stable through downstream references. Business
Rule, Impact, Verification Plan, and Test Evidence keep their own artifact-local
IDs and point back through `source_coverage_scenario_ids[]`. They must not reuse
the scenario ID as the identity of a different semantic object.

Scenario IDs are derived from a canonical task-local scenario key. A material
change to category, lifecycle stage, path, behavior, or proof strength changes
the scenario digest and invalidates stale downstream evidence. Renumbering or
report ordering alone must not change identity.

## Structural Trigger Model

### Reason Codes

The unreleased first 1.108 reason codes are replaced with:

~~~text
MULTI_CLASS_OR_ORIGIN
DERIVED_OUTPUT_DEPENDENCY
SELECTIVE_INCLUSION_OR_FANOUT
LIFECYCLE_BRANCH_OR_RECOVERY
PATH_PROVENANCE_AMBIGUITY
DOMAIN_COMPLETENESS_CLAIM
EXISTING_PROJECT_CLOSURE_AUDIT
HIGH_RISK_OMISSION_AMPLIFIER
~~~

HIGH_RISK_OMISSION_AMPLIFIER can only strengthen an existing omission signal.
HIGH impact alone must not trigger coverage.

### Routing Outcomes

Task Governance records one internal outcome:

~~~text
REQUIRED_WITH_EVIDENCE
TECHNICAL_INSPECTION_REQUIRED
NOT_REQUIRED_WITH_REASON
~~~

TECHNICAL_INSPECTION_REQUIRED is not a user decision. Codex continues
read-only inspection until it can derive one of the other two outcomes or finds
a real missing business/external fact.

These values are routing evidence inside Task Governance. They are not a new
durable task state machine, public mode, or user-selectable workflow. An
inspection result must be regenerated when its task, intent, project identity,
or source revision changes.

### Qualifying Rule

No isolated keyword may produce REQUIRED_WITH_EVIDENCE.

Coverage requires at least one structural relationship supported by current
task or project evidence. Mere plurality is insufficient:

1. two or more explicit task-relevant categories or origins connected to the
   same requested rule, result, selection point, consistency relationship, or
   processing behavior;
2. one derived output that consumes two or more categories/origins;
3. one selection point or fan-out relationship affecting task-relevant
   categories;
4. a domain-bearing completeness claim whose subject can be identified;
5. an explicit existing-project business-closure audit with a bounded subject;
6. one task-relevant category with multiple evidenced lifecycle branches, a
   non-forward path, or required failure/recovery/termination behavior;
7. one claimed behavior for which project-runtime and fixture/mock/manual paths
   coexist or cannot yet be distinguished.

Lexical matches are candidate hints only. A candidate hint without structural
evidence routes to technical inspection, not required coverage and not ready
coverage.

### Domain-Bearing Subject

Words such as all, every, complete, summary, report, sync, queue, or batch are
insufficient without a task-relevant subject and relationship.

Examples that must not trigger after project evidence proves they are
non-behavioral:

~~~text
sync dependency versions and update the lockfile
change log formatting for a scheduled worker without changing audit, alert,
metric, control-flow, or business-observation behavior
change the report screen color
run all unit tests
rename an imported type in API route handlers without changing routing,
validation, authorization, response, or side-effect behavior
~~~

Examples that should trigger after project inspection confirms the structure:

~~~text
one triage rule covers outpatient, emergency, and remote consultations
shipping prices combine road, sea, and air categories
articles, videos, and live streams follow distinct moderation paths
retail, wholesale, and marketplace sales feed one derived result
local creation, import, and external events apply the same eligibility rule
one accepted record can later be corrected, rejected, retried, or reversed
the fixture creates a result but the current project path must create it too
~~~

Lifecycle and provenance examples must trigger only after the task or project
proves the relationship. Words such as cancel, retry, rollback, seed, mock, or
manual are candidate hints, not sufficient routing evidence.

### Non-Behavioral Routing

Task-kind classification is authoritative only when current task and project
evidence proves the change is non-behavioral. Documentation, copy, visual-only,
formatting, dependency metadata, logging-only, and test-infrastructure-only
labels are candidate classifications, not automatic exemptions. Logging can be
business observation or audit behavior; dependencies can change runtime
behavior; test infrastructure can change verification authority; and API route
edits can change business, access, or side-effect behavior.

A narrow prefix regex or the user's wording must not be the only protection
against false triggers.

If a non-behavioral task contains a domain word incidentally, it remains
NOT_REQUIRED_WITH_REASON only after the lightweight preflight confirms the
word does not identify changed business behavior. Ambiguous API, logging,
dependency, test-infrastructure, background-task, or data-path work remains
`TECHNICAL_INSPECTION_REQUIRED` until Codex resolves it.

## Project Evidence Discovery

### No Industry Whitelist

Remove embedded aliases for contracts, appointments, orders, invoices,
payments, employees, inventory, or any other selected industry.

Domain vocabulary is derived from current project evidence, including:

- project profile and business specifications;
- domain models, schemas, and typed entities;
- route and command definitions;
- event and message contracts;
- import/export definitions;
- state machines and workflow definitions;
- create/update/delete/transition/retry/recovery/compensation behavior;
- event propagation, derived-output, persistence, audit, and observation paths;
- runtime entry points, factories, fixtures, seeds, mocks, and stubs as distinct
  provenance candidates;
- project-native tests and fixtures;
- authoritative project governance records.

The implementation may use language-aware parsers and project-native indexes.
Filename matching is only candidate discovery.

Discovery must classify fixtures, seeds, mocks, stubs, and test helpers as
candidate provenance. Their existence cannot establish a project-runtime path
or runtime-trusted proof. Likewise, a production-looking route name does not
prove that the route is reachable, current, or exercised by the task.

### Evidence Locator

File existence alone is not semantic evidence. Every evidence-bound observation
must carry:

~~~text
source_ref
authority_binding_ref
locator_kind
locator
evidence_kind
relation
semantic_digest
~~~

Possible locators include a symbol, line range, JSON pointer, YAML path, schema
entity, route identifier, test name, or project-native stable identifier.

Evidence Locator is an extension of Evidence Authority Core, not a second
evidence-identity system:

- the Business Universe report must carry the standard project/task/intent/
  source-revision `authority_binding`;
- every `source_ref` must be project-relative and must be revalidated through
  the shared Evidence Authority path, symlink, traversal, and raw-file-digest
  rules;
- `authority_binding_ref` points to that authoritative recorded source;
- `semantic_digest` binds the located semantic fragment or project-native
  stable entity; it does not replace the raw file digest;
- Business Universe code must reuse the shared Evidence Authority library and
  must not implement independent project identity, path safety, or raw digest
  semantics.

Symbol, schema entity, route ID, test ID, JSON Pointer, YAML path, and other
stable identifiers are preferred. A line range is a fallback only and requires
both the authoritative raw-file digest and a semantic digest so an edit
invalidates the observation.

The same file may support more than one role only when each role has an exact
locator and an explicit relationship. Reusing one bare file path as both source
and processing evidence is insufficient.

### Candidate State

Automatic path or name discovery always produces CANDIDATE.

Only semantic inspection with valid evidence locators can produce
EVIDENCE_BOUND. A note claiming that Codex should confirm later cannot coexist
with COVERAGE_READY.

### Scan Boundaries

Project discovery must:

- use project-native ignore rules without allowing IntentOS assets to pollute
  business discovery;
- avoid a fixed shallow depth as completeness proof;
- identify incomplete, truncated, failed, or unsupported scans;
- fail closed as Codex-owned technical inspection;
- never claim an undocumented real-world category does not exist.

Every discovery run must also record one bounded discovery projection:

~~~text
adapter_kind
support_status: SUPPORTED | PARTIAL | UNSUPPORTED
inspected_roots[]
ignore_sources[]
candidate_sources[]
unsupported_constructs[]
truncated
budget_exhausted
scan_segments[]
completed_segment_ids[]
remaining_segment_ids[]
resume_state_digest
discovery_boundary_digest
~~~

The deterministic resolver may identify candidates and describe this boundary;
it cannot claim semantic completeness. Codex performs semantic inspection, and
the checker validates recorded locators, relationships, authority bindings, and
declared boundary consistency. `PARTIAL`, `UNSUPPORTED`, failed, or truncated
discovery remains `TECHNICAL_INSPECTION_REQUIRED` unless project-native evidence
closes the exact gap.

Discovery must also be deterministic and resumable for deep repositories and
monorepos. Nested project roots, project-native ignore files, generated/vendor
trees, and unsupported language or build-system segments must be represented
explicitly. A candidate-count, time, memory, or tool budget may pause discovery,
but it cannot convert an incomplete scan into `SUPPORTED` or
`COVERAGE_READY`. Resuming from the same project, task, source revision,
segment set, and boundary digest must produce the same canonical result as one
uninterrupted scan.

`COVERAGE_READY` therefore means ready within the explicit, current,
task-relevant evidence boundary. It never means every possible real-world
category has been discovered.

## Evidence Model

When coverage is required, one task-bound report records:

- the shared Task Entry Binding for the exact current Work Queue item, resume
  review when applicable, Task Governance decision, task, intent, and digests;
- the lightweight preflight boundary, candidate refs, and routing evidence that
  caused full coverage to run;
- structural trigger reason and its evidence locators;
- category rows;
- participant rows and scenario relationships;
- origin rows and category relationships;
- processing paths;
- lifecycle applicability rows;
- path-provenance rows and provenance evidence;
- selection points and affected categories;
- consistency groups where derived consistency is required;
- included, excluded-with-evidence, and separate-path dispositions;
- unresolved technical, business, or external facts;
- stable coverage scenarios for every task-relevant category/lifecycle/path
  combination;
- fact dependencies identifying the exact categories, paths, requirements, or
  claims blocked by each missing business or external fact;
- the bounded discovery projection and standard Evidence Authority binding;
- Challenger evidence when required;
- a canonical coverage digest;
- non-authorizing boundaries.

Business Universe Coverage owns `coverage_scenario_id`. It does not create or
reserve Verification Plan `verification_obligation_id`, Test Evidence item, or
Runtime Run identity. Verification Plan remains the sole owner of verification
obligations and maps each generated obligation back through
`source_coverage_scenario_ids[]`.

### Outcomes

~~~text
COVERAGE_READY
BLOCKED_INCOMPLETE_UNIVERSE
BUSINESS_FACT_NEEDED
EXTERNAL_FACT_NEEDED
~~~

Not-required and inspection-required routing remain Task Governance outcomes;
they do not create empty Business Universe reports.

### Ready Conditions

COVERAGE_READY requires all of the following:

1. the shared Task Entry Binding resolves to the exact one `CURRENT` Work Queue
   item and its matching Task Governance report;
2. a resumed task has a current valid resume-review binding;
3. Task Governance routing is REQUIRED_WITH_EVIDENCE;
4. the lightweight preflight and trigger evidence contain at least one validated
   structural relationship;
5. every category has one disposition;
6. every task-relevant participant is recorded or excluded with evidence;
7. every included/separate category has semantic source and processing-path
   evidence;
8. every excluded category has exact exclusion evidence;
9. every origin is linked to at least one category and processing path;
10. every considered lifecycle stage is REQUIRED,
   NOT_APPLICABLE_WITH_EVIDENCE, or TECHNICAL_INSPECTION_REQUIRED;
11. no required lifecycle stage lacks one current coverage scenario;
12. every scenario records path provenance and required proof strength;
13. fixture, seed, mock, stub, and manual-only paths are not used to claim a
    stronger project-native or runtime-trusted behavior than they prove;
14. every required selection point is recorded with affected categories and
    handling;
15. every required consistency group contains all contributing categories and
    evidence;
16. every coverage scenario ID is unique, stable, and preserved;
17. no candidate or technical scan remains unresolved;
18. every missing business or external fact identifies its exact dependent
    scope, and no fact required for the requested completion claim is missing;
19. required Challenger evidence is current and task-bound;
20. project, task, intent, source revision, queue item, resume review, and
    digests match;
21. the shared Evidence Authority binding and every source ref are current;
22. all semantic locators are supported, safe, and resolvable;
23. discovery is bounded, non-truncated, non-budget-exhausted, complete for all
    declared segments, and supported for the claimed scope;
24. Markdown and structured evidence agree.

A missing fact does not stop unrelated engineering. The report must expose
`blocked_scope_ids[]` and `unaffected_scope_ids[]`. Codex continues safe work on
the unaffected scope and disables only the dependent capability or claim. The
whole task remains unable to claim `DONE` only when the blocked scope is part of
the requested outcome.

## Selection And Consistency Rules

SELECTIVE_INCLUSION_OR_FANOUT requires at least one selection-point row. An
empty selection-point array cannot become ready under that reason.

DERIVED_OUTPUT_DEPENDENCY requires at least one consistency group with two or
more contributing category/origin relationships. An isolated report or sync
word cannot create this requirement.

Consistency groups replace the unreleased first 1.108 reconciliation-only
model. Reconciliation becomes one supported consistency behavior rather than
the universal abstraction.

## Lifecycle Coverage Rules

Lifecycle coverage is scenario-based, not a universal checklist applied to
every object.

1. Codex derives considered stages from the task, project behavior, state
   transitions, error paths, external effects, and existing specifications.
2. Every considered category/stage pair receives one applicability disposition.
3. `NOT_APPLICABLE_WITH_EVIDENCE` requires an exact project source or bounded
   business-rule reason; an empty value or generic sentence is invalid.
4. `TECHNICAL_INSPECTION_REQUIRED` remains Codex-owned work and blocks only the
   dependent scenario claim.
5. Forward success does not imply correction, failure, recovery, termination,
   reversal, compensation, or observation coverage.
6. A shared implementation path may satisfy multiple scenarios only when every
   source scenario ID remains traceable and the expected behavior is identical.
7. The resolver must not generate a full category-by-stage Cartesian product.
   Unsupported combinations are not silently marked not applicable; they stay
   outside the bounded considered-stage set with the discovery boundary recorded.

## Path Provenance And Claim-Scope Rules

Path provenance answers how behavior is produced. Evidence kind answers how a
claim was checked. Claim scope answers what that evidence is allowed to prove.
These dimensions must remain separate.

1. `PROJECT_RUNTIME_PATH` or `PROJECT_NATIVE_AUTOMATION` may require
   `PROJECT_NATIVE_BEHAVIOR_PROOF` or `RUNTIME_TRUSTED_BEHAVIOR_PROOF`.
2. A unit test can prove isolated rule behavior but cannot by label alone prove
   integration, persistence, propagation, cleanup, or project-runtime identity.
3. An integration test can prove a real project path only when its current-code
   service, data/session resources, execution window, and cleanup identity are
   validated by the applicable Runtime Trust contract.
4. A fixture or seed can establish input shape or sample availability. It cannot
   prove that current project behavior automatically creates or updates the
   result.
5. A mock or stub can establish an isolated interaction expectation. It cannot
   prove the real dependency, external provider, persistence, or propagation
   path.
6. Manual evidence can prove the exact observed claim recorded by Test Evidence;
   it cannot silently stand in for automated lifecycle or runtime coverage.
7. Evidence labels are not authority. Downstream strict consumers validate the
   actual Verification Plan mapping, Runtime Run Manifest when required, Test
   Evidence scope, task identity, source revision, and evidence digest.

## Challenger Policy

Challenger review is required when:

- the task is HIGH and coverage is required;
- a validated domain completeness claim spans multiple categories/origins;
- a derived output depends on multiple inputs and omission can remain silent;
- a high-risk category is excluded;
- a required reverse, failure, recovery, termination, or compensation path can
  be silently omitted;
- fixture/mock/manual evidence is the only apparent proof for a claimed
  project-native behavior path;
- scan conflicts or project evidence disagree.

Challenger review is not required merely because the intent contains report,
summary, sync, all, or similar vocabulary.

The Challenger attempts to find:

- an unrecorded category or origin;
- an unrecorded participant whose behavior changes the scenario;
- a hidden selection point;
- an unsupported exclusion;
- an unhandled separate path;
- a forward-only lifecycle that omits a required negative, recovery, correction,
  termination, reversal, or compensation scenario;
- a fixture, seed, mock, stub, or manual observation presented as stronger proof
  than its claim scope supports;
- a consistency group missing a contributor;
- a platform surface omitted from verification;
- a scenario whose final result cannot be traced back to its origin and project
  path;
- a coverage scenario or required verification mapping dropped downstream.

Business Universe Challenger owns scenario-inventory challenges. It does not
replace downstream review:

- Change Impact and Plan Review challenge partial writes and cross-module state
  disagreement;
- Verification Plan and Test Evidence challenge missing tests, prose-only proof,
  and evidence-scope misuse;
- Verification Runtime Trust challenges stale code, wrong service/data/session
  identity, and unsafe cleanup;
- Completion and Unified Closure revalidate the full trace before `DONE`.

## Task Governance And Risk Tiers

Task impact controls both review depth and artifact topology. A required
Business Universe must never disappear after routing; a confirmed
non-behavioral LOW task records that coverage is not required, and a behavioral
relationship discovered from LOW converges to MEDIUM without forcing the HIGH
review policy.

The governing rule is:

~~~text
coverage preservation is mandatory
artifact topology remains risk-proportionate
~~~

`LOW`:

- retain LOW only when bounded evidence confirms non-behavioral work and records
  `NOT_REQUIRED_WITH_REASON`;
- do not create an empty Business Universe report or synthetic scenario IDs;
- if evidence-backed behavioral omission risk appears, invalidate the LOW
  decision and converge to MEDIUM before implementation review;
- keep the unchanged non-behavioral task on LIGHTWEIGHT review and minimal
  verification.

`MEDIUM`:

- record the required Business Universe evidence;
- preserve coverage scenario IDs through the existing TARGETED review and
  targeted verification path;
- create only the artifacts already required by the MEDIUM task policy;
- require targeted evidence for every affected coverage scenario.

`POSSIBLE_HIGH`:

- remain read-only until risk inspection resolves the impact;
- retain the coverage candidates and discovery boundary as inspection input;
- do not authorize implementation or completion.

`HIGH`:

- require the full existing high-impact evidence chain;
- require every applicable downstream consumer to bind and preserve the exact
  Business Universe coverage scenarios.

Every tier's applicable review policy and completion consumer must name Business
Universe Coverage when required. Artifact absence is accepted only when the
current tier policy does not require that artifact and an authoritative compact
projection preserves the same task, intent, coverage ref, digest, and requirement
IDs. A compact projection is not a new artifact family or completion authority.

The compact projection lives inside the existing tier-appropriate review,
verification, or completion record and contains only:

~~~text
business_universe_ref
business_universe_digest
coverage_scenario_ids[]
coverage_mapping_status
~~~

It cannot self-assert readiness. The consuming checker must resolve and validate
the exact Business Universe report. `POSSIBLE_HIGH` must not be used to ask the
user for a technical classification.

### Discovery-Driven Risk Reclassification

Business Universe discovery can reveal broader impact than the initial Task
Governance read. When it discovers database or migration effects, API/domain
boundary changes, permissions, sensitive data, background execution, external
effects, release/production impact, or any other existing escalation signal:

1. stop expanding implementation;
2. invalidate the current routing decision and any dependent Business Universe
   result;
3. rerun Task Governance with the newly bound evidence;
4. regenerate Business Universe Coverage against the superseding Task
   Governance ref and digest;
5. continue under the stronger policy without asking the user to classify the
   technical risk.

Reclassification is a monotonic, finite convergence process:

~~~text
LOW -> MEDIUM -> HIGH
POSSIBLE_HIGH -> read-only inspection -> one resolved tier
~~~

- newly discovered evidence may preserve or increase the required tier; it must
  not automatically decrease it inside the same task run;
- Task Governance reruns only when new evidence can change the tier, routing
  outcome, or resolve `POSSIBLE_HIGH`. Same-tier scenario expansion regenerates
  the Business Universe report and downstream evidence without creating a
  redundant Task Governance loop;
- Task Governance and Business Universe repeat until the tuple of task tier,
  routing outcome, structural evidence digest, and discovery-boundary digest is
  stable;
- for one fixed task, intent, project, and source revision, every accepted tier
  transition is either one strict increase in `LOW -> MEDIUM -> HIGH` or one
  explicit resolution of `POSSIBLE_HIGH`; no transition pair may repeat, and at
  most three accepted tier transitions are allowed;
- unchanged evidence at the same tier terminates the loop;
- a new material evidence digest after apparent stability starts another
  monotonic evaluation from the strongest tier already established;
- a downgrade, oscillation, repeated non-stable tuple, unsupported transition,
  or exhausted convergence bound fails closed for Codex-owned technical review;
- `POSSIBLE_HIGH` never becomes implementation-ready merely because the
  convergence bound was reached.

Every superseded Task Governance and Business Universe record is stale and
cannot be consumed. The user is never asked to choose the tier or resolve a
technical convergence failure.

## Downstream Consumer Contract

Every tier-applicable consumer must first revalidate the shared Task Entry
Binding. A valid Business Universe report for a different, paused, stale, or
resumed-without-review Work Queue item cannot satisfy any current consumer.

### Business Rule Closure

- consume exact coverage ref, digest, task, intent, and project identity;
- refuse generic ACTOR/TRIGGER closure when scenario coverage is required;
- map every applicable coverage scenario into the business rule through
  `source_coverage_scenario_ids[]`;
- preserve category, participant, lifecycle applicability, expected behavior,
  negative/reverse behavior, and fact dependencies;
- remain blocked for inspection, candidate, stale, or non-ready coverage when
  Business Rule Closure is required by the current task policy.

### Change Impact Coverage

- preserve every included, excluded, and separate category and every required
  coverage scenario;
- map each scenario to affected surfaces, including state, persistence,
  propagation, derived results, error/recovery, observation, and user-visible
  behavior when applicable;
- retain exclusion evidence;
- fail when a category, lifecycle stage, project path, scenario, or relationship
  disappears;
- identify partial-write and cross-module consistency risks without making
  Business Universe Coverage the impact authority.

### Plan Review

- review the structural trigger, reverse scan, selection points, exclusions,
  lifecycle applicability, path provenance, proof-strength requirement,
  consistency groups, platform mapping, and Challenger evidence;
- challenge forward-only implementation, partial writes, missing compensation,
  cross-module disagreement, and prose-only verification plans;
- bind exact source identity;
- never infer review completion from the existence of a plan file;
- run only when the current Task Governance review policy requires Plan Review.

### Verification Plan

- remain the sole owner of `verification_obligation_id` values;
- map every required `coverage_scenario_id` into one or more verification
  obligations through `source_coverage_scenario_ids[]`;
- derive verification surface and type from the affected surface and processing
  path;
- translate `required_proof_strength` into concrete positive, negative, reverse,
  recovery, propagation, consistency, or observation obligations where
  applicable;
- support Web UI, API/backend, worker/data pipeline, iOS local behavior,
  Android local behavior, storage, permissions, external integration, and
  project-native surfaces;
- never default all categories to BACKEND_RULE or API tests;
- create consistency obligations only for validated consistency groups;
- bind category IDs to every relevant required obligation;
- use the existing lightweight or targeted verification projection when a full
  Verification Plan is not required by the current tier.

### Verification Runtime Trust

Runtime Trust is conditional and remains its existing authority:

- `STRUCTURAL_SOURCE_PROOF` does not force a runtime plan;
- `PROJECT_NATIVE_BEHAVIOR_PROOF` uses project-native execution evidence and the
  applicable verification adapter;
- `RUNTIME_TRUSTED_BEHAVIOR_PROOF` requires a current Verification Runtime Plan,
  adapter contract, Run Manifest, run-owned resource identity, observed outputs,
  and cleanup evidence appropriate to the task tier;
- `EXTERNAL_FACT_PROOF` remains an external-fact dependency and cannot be
  fabricated by a local runtime;
- Business Universe records only the proof requirement and remains immutable;
  downstream Verification, Test Evidence, and Completion records reference the
  scenario and validated runtime evidence. Business Universe does not start
  services, allocate resources, or declare runtime trust.

### Test Evidence

- cover every required scenario-bound obligation;
- preserve the mapping from each Verification Plan obligation back to its source
  coverage scenario IDs;
- bind current task, plan, source revision, runtime run, and evidence identity;
- record evidence kind and claim scope using the existing Test Evidence and
  Runtime Trust contracts rather than a Business Universe-local enum;
- reject fixture/seed/mock/stub/manual evidence when it is used to satisfy a
  stronger project-native or runtime-trusted claim than it proves;
- require every runtime-trusted obligation to bind the exact current Run
  Manifest;
- reject broad commands as the sole category-specific proof;
- preserve project-native stronger verification where available;
- require a separate Test Evidence artifact only when the current task policy
  requires it.

### Completion Evidence And Finish

- independently revalidate the exact current Work Queue item, Task Governance
  decision, Universe report, and tier-applicable downstream chain;
- require every required scenario and mapped obligation, not merely one
  obligation per category;
- verify the trace from category, lifecycle stage, and project path through
  Business Rule, Impact, Verification Plan, Runtime Trust when required, and
  Test Evidence;
- reject missing participants, lifecycle stages, negative/reverse behavior,
  project-native paths, selection points, consistency contributors, exclusions,
  tests, runtime manifests, stale digests, or unresolved facts;
- reject old evidence for current code, sample-only proof for runtime claims,
  partial-write gaps, and final results that cannot be traced to an origin;
- keep Unified Closure as the sole final DONE authority.

## Platform-Neutral Verification

Business Universe Coverage does not decide that business logic is server-side.

The verification mapping must be derived from project evidence:

| Project behavior | Example verification surface |
| --- | --- |
| Web client-only state | UI/component/browser behavior |
| API or service rule | API/domain/service behavior |
| Worker or data pipeline | job/integration/data-path behavior |
| WeChat Mini Program behavior | page/component/platform-API/cloud-function/project-native behavior |
| Internal admin behavior | privileged UI/workflow/API/audit behavior |
| iOS local behavior | Swift/domain/UI/runtime behavior |
| Android local behavior | Kotlin/domain/UI/runtime behavior |
| Local storage or offline sync | storage/state/recovery behavior |
| External provider path | contract/sandbox/project-native behavior |
| Unknown surface | Codex technical inspection blocker |

This table is an acceptance matrix, not a new core platform enum. Core evidence
stores the existing affected-surface identity plus a project-native verification
adapter reference. Web, API, worker, Mini Program, internal admin, iOS, Android,
and offline examples must not become hard-coded assumptions inside Business
Universe routing or its schema.

The user is never asked to choose this mapping.

## Existing Projects

IntentOS first maps project-native specifications, models, routes, events,
jobs, imports, selection logic, state machines, lifecycle transitions,
failure/recovery paths, factories, fixtures, seeds, mocks, tests, runtime
adapters, and governance records.

A project-native universe mechanism can satisfy IntentOS only when it proves the
same task-bound semantics, identity, category and participant preservation,
lifecycle applicability, path provenance, scenario traceability, downstream
mapping, and current source revision.

Existing TODOs, tests, reports, route counts, or filenames do not prove
Universe completeness by themselves.

Weak or disorganized projects receive an IntentOS-native evidence record after
Codex inspection. Stronger project-native governance is mapped rather than
discarded.

Deep repositories and monorepos must be segmented by evidenced project roots and
resumed deterministically. Nested governance, generated/vendor trees, multiple
application surfaces, and interrupted scans must not be hidden by a shallow
depth or candidate cap. Budget exhaustion remains partial technical work; it is
not a business question and cannot become ready.

## Generated Project Parity

Generic, Web, iOS, and Android starters, plus generated profile fixtures for
WeChat Mini Program, backend API, and internal admin, must receive the same:

- schema and evidence semantics;
- resolver and strict checker;
- conditional routing;
- downstream binding;
- zero-experience behavior;
- lifecycle applicability and path-provenance semantics;
- stable scenario identity and downstream mapping;
- platform-neutral verification mapping;
- focused positive and negative fixtures.

Generated-project checks must execute the capability. File-presence checks are
insufficient.

## Implementation Workstreams

### Workstream A: Domain-Neutral Routing Core

1. bind routing to the exact current Work Queue item and Task Governance report;
2. add the bounded lightweight omission-risk preflight for behavioral and
   behavior-ambiguous work;
3. replace old reason codes and isolated-word routing;
4. separate lexical candidate hints from qualifying structural evidence;
5. add technical-inspection routing;
6. remove the industry alias whitelist;
7. require evidence-backed task kind for non-behavioral work;
8. add multilingual, cross-domain structural extraction tests.

### Workstream B: Semantic Evidence Core

1. reuse Evidence Authority for project, task, revision, path, and raw digest
   validation;
2. add typed semantic locators and semantic digests as an authority extension;
3. keep auto-discovered paths as candidates;
4. require semantic relationships before EVIDENCE_BOUND;
5. replace upstream-filter rows with general selection points;
6. replace reconciliation-only groups with consistency groups;
7. add the discovery-adapter support and bounded-scan projection;
8. add deterministic segmented scan, resume identity, and budget-exhaustion
   reporting for deep repositories and monorepos;
9. strengthen scan completeness and truncation reporting.

### Workstream C: Scenario, Lifecycle, And Path Provenance Core

1. add participant, lifecycle-applicability, path-provenance, proof-strength, and
   coverage-scenario schema blocks;
2. generate sparse task-relevant lifecycle scenarios rather than a Cartesian
   product;
3. derive stable scenario identity and digest from canonical scenario keys;
4. distinguish project runtime, native automation, external, fixture/seed,
   mock/stub, manual-only, and unknown paths;
5. keep evidence kind and runtime identity in their existing downstream systems;
6. bind every missing fact to exact affected scenario IDs.

### Workstream D: Checker Fail-Closed Hardening

1. reuse the shared Task Entry Binding and reject stale, paused, switched, or
   resumed-without-review tasks;
2. validate preflight-to-routing and trigger-to-evidence invariants;
3. reject filename-only readiness;
4. reject empty required selection/consistency evidence;
5. validate category/participant/origin/lifecycle/path/scenario relationships;
6. reject required lifecycle stages without scenarios and not-applicable stages
   without evidence;
7. reject sample-only paths used for stronger project-native/runtime claims;
8. validate every coverage scenario ID and downstream mapping;
9. reject partial, failed, truncated, budget-exhausted, or incomplete segmented
   discovery;
10. require shared Evidence Authority rather than local replacement logic;
11. preserve symlink, traversal, project-boundary, digest, and schema safety.

### Workstream E: Consumer And Runtime-Trust Alignment

1. bind Task Governance routing and Business Universe reports to the exact
   current Work Queue item;
2. preserve existing LOW/LIGHTWEIGHT, MEDIUM/TARGETED, POSSIBLE_HIGH/read-only,
   and HIGH/FULL policies;
3. strengthen Business Rule scenario and lifecycle binding;
4. preserve scenarios, lifecycle paths, and relations in Impact Coverage;
5. review scenario completeness, partial writes, provenance, and reverse paths in
   Plan Review;
6. let Verification Plan derive platform-neutral obligations from scenario IDs
   and proof strength;
7. require Runtime Plan and Run Manifest only for scenarios needing runtime trust;
8. enforce evidence-kind and claim-scope limits in Test Evidence;
9. enforce tier-applicable scenario mappings in Completion Evidence and finish;
10. add monotonic discovery-driven Task Governance convergence and invalidation;
11. keep public finish fail-closed.

### Workstream F: Product Guidance And Distribution

1. revise core, docs, prompt, template, checklist, and glossary language;
2. keep the feature invisible to zero-experience users;
3. update Manifest and starter distribution;
4. update README and version records without exposing maintainer commands as
    normal user steps;
5. defer final current-release claims until all stop conditions pass;
6. update release claims and known limitations accurately.

### Workstream G: Verification Matrix

1. add structural trigger tests;
2. add false-positive and false-negative routing tests;
3. add semantic evidence tests;
4. add lifecycle applicability, reverse-path, and recovery tests;
5. add path-provenance and claim-scope tests;
6. add scenario identity and downstream trace tests;
7. add conditional Runtime Trust consumer tests;
8. add platform/profile matrix tests, including WeChat Mini Program and internal
   admin companion surfaces;
9. add proportional consumer-path tests for every task tier;
10. add Work Queue/task-entry and pause/resume invalidation tests;
11. add deep-repository, monorepo, segmented-scan, interruption/resume, and
    budget-exhaustion tests;
12. add strict no-empty end-to-end consumer-chain tests;
13. add installed/generated-project parity tests;
14. run full repository verification.

## Execution Order

The implementation must follow this order so provisional schemas and consumers
cannot become a second compatibility surface:

1. finalize this plan, scenario identity, lifecycle, provenance, proof-strength,
   authority, and proportional-governance contracts;
2. hardcut the unreleased 1.108 schema, templates, examples, and fixtures in one
   change; do not retain the discarded category-only or
   coverage-requirement-ID schema;
3. rebuild the Business Universe routing library, resolver, checker, internal
   CLI route, and focused positive/negative tests;
4. rebuild Task Governance, Business Rule, Change Impact, Plan Review,
   Verification Plan, Runtime Trust consumer, Test Evidence, Execution
   Assurance, Completion, operating-loop, and finish mappings against stable
   scenario IDs;
5. add lifecycle omission, reverse-path omission, seed-only, mock-only,
   manual-only, partial-write, cross-module disagreement, prose-only acceptance,
   stale-runtime, old-evidence, and source-trace failure fixtures;
6. execute new-project, existing-project, generated-project, LOW, MEDIUM,
   POSSIBLE_HIGH, HIGH, and platform-neutral acceptance matrices;
7. run independent multi-angle review and full exact-candidate verification,
   then and only then promote public version and release claims to 1.108.0.

No partial step is a releasable 1.108 state. A failed later stage returns the
candidate to the owning earlier stage rather than adding compatibility code or a
1.108.1 patch.

The implementation itself remains one current Work Queue task. If interrupted,
it is paused with its exact candidate boundary and must pass the existing resume
review before continuing. Read-only reviewer or Challenger subagents follow the
existing Subagent Orchestration protocol; every launched helper is closed or
skipped after handoff, and no reviewer becomes a second writer or authority.

## Expected File Scope

The implementation is expected to revise at least:

~~~text
core/business-universe-coverage.md
docs/business-universe-coverage.md
docs/plans/business-universe-coverage-1.108-plan.md
prompts/business-universe-coverage-agent.md
checklists/business-universe-coverage-review.md
templates/business-universe-coverage-report.md
schemas/artifacts/business-universe-coverage.schema.json
schemas/artifacts/task-governance.schema.json
schemas/artifacts/business-rule-closure.schema.json
schemas/artifacts/change-impact-coverage.schema.json
schemas/artifacts/plan-review.schema.json
schemas/artifacts/verification-plan.schema.json
schemas/artifacts/test-evidence.schema.json
schemas/artifacts/execution-assurance.schema.json
schemas/artifacts/completion-evidence.schema.json
scripts/lib/business-universe.mjs
scripts/lib/verification-runtime-consumer.mjs
scripts/resolve-business-universe-coverage.mjs
scripts/check-business-universe-coverage.mjs
scripts/resolve-task-governance.mjs
scripts/check-task-governance.mjs
scripts/resolve-business-rule-closure.mjs
scripts/check-business-rule-closure.mjs
scripts/resolve-change-impact-coverage.mjs
scripts/check-change-impact-coverage.mjs
scripts/resolve-plan-review.mjs
scripts/check-plan-review.mjs
scripts/resolve-verification-plan.mjs
scripts/check-verification-plan.mjs
scripts/resolve-test-evidence.mjs
scripts/check-test-evidence.mjs
scripts/resolve-execution-assurance.mjs
scripts/check-execution-assurance.mjs
scripts/resolve-completion-evidence.mjs
scripts/check-completion-evidence.mjs
scripts/resolve-operating-loop.mjs
tests/business-universe-coverage.test.mjs
tests/business-universe-consumer-chain.test.mjs
tests/business-universe-existing-project-scan.test.mjs
tests/verification-runtime-consumer.test.mjs
package.json
intentos-manifest.json
releases/1.108.0/*
~~~

Additional files may change only when required by exact schema digests,
generated-project distribution, Review Context, self-check, or version
consistency. Unrelated 1.109 work is outside this plan.

Shared Evidence Authority files should not change unless a demonstrated generic
defect prevents reuse. Business Universe implementation must consume that core;
it must not fork or shadow it.

The shared Task Entry Binding library should likewise be consumed unchanged
unless a reproduced generic defect requires a separately reviewed core fix.

## Acceptance Plan

### A. Task Entry And Lightweight Preflight

1. one exact `CURRENT` Work Queue item jointly bound to the matching Task
   Governance report can supply current coverage;
2. `PAUSED`, `BLOCKED`, `BACKLOG`, `DONE`, and `CANCELLED` items fail;
3. a copied queue item, stale queue digest, task mismatch, intent mismatch, or
   superseded Task Governance report fails;
4. a resumed task without the exact current resume-review binding fails;
5. switching the current task invalidates the old Universe report and every
   compact downstream projection;
6. a behavioral task with a hidden shared rule, origin, selection point,
   lifecycle branch, or path-provenance conflict is discovered by the lightweight
   preflight before full coverage routing;
7. a proven non-behavioral task completes preflight without creating an empty
   Universe report;
8. an ambiguous, unsupported, failed, or incomplete preflight remains
   Codex-owned technical inspection and never becomes a user classification.

### B. Structural Positive Routing

The following structures must route to coverage after exact evidence is found:

1. multiple explicit categories share one rule;
2. multiple origins feed one behavior;
3. multiple contributors produce one derived result;
4. a selection point can include, exclude, or fan out categories;
5. a domain-bearing completeness claim spans multiple categories;
6. an existing-project closure audit names a bounded business subject;
7. one category has evidenced correction, failure, retry, recovery, termination,
   reversal, compensation, or observation branches;
8. project-runtime and fixture/mock/manual paths coexist or cannot yet be
   distinguished for the claimed behavior.

The suite must include:

- healthcare-style categories;
- logistics-style categories;
- content/media categories;
- retail/channel categories;
- a generic project-defined domain unknown to IntentOS source code.

No test may rely on adding those industry terms to a global whitelist.

### C. False-Positive Routing

Each case must produce NOT_REQUIRED_WITH_REASON and no report only after exact
project evidence confirms the stated non-behavioral boundary:

~~~text
sync dependency versions and update the lockfile with no runtime contract change
change log formatting for a scheduled worker with no audit, alert, metric,
control-flow, or business-observation change
change the report screen color
run all unit tests
rename an imported type in API route handlers without changing routing,
validation, authorization, response, or side effects
rename a summary component
format every Markdown file
update a message type import without changing the serialized contract
rename the cancel button label
update seed-script documentation
replace the mock library
fix retry logs in the test runner
~~~

Equivalent Chinese and English cases are required.

The same API, logging, dependency, test-infrastructure, background-task, or data
path wording without proof of a non-behavioral boundary must route to technical
inspection rather than automatic not-required status.

### D. Inspection Routing

Ambiguous statements such as make sure all records are handled must not become
ready from prose alone.

They must either:

- resolve through project inspection to structural evidence;
- become NOT_REQUIRED_WITH_REASON; or
- remain TECHNICAL_INSPECTION_REQUIRED as Codex-owned work.

They must not ask the user for a technical classification.

### E. Semantic Evidence

1. a matching filename alone cannot become EVIDENCE_BOUND;
2. a bare file ref cannot serve as source and processing proof;
3. Evidence Authority binding plus exact locators and semantic digests pass;
4. stale locators or changed content fail;
5. unsupported locator kinds fail;
6. truncated or failed scans block readiness;
7. same-file multi-role evidence passes only with distinct valid locators and
   relations;
8. generic prose cannot replace project evidence;
9. `PARTIAL` or `UNSUPPORTED` discovery cannot become ready without exact
   project-native evidence closing the declared gap;
10. line-range-only evidence invalidates after source movement or digest change;
11. project-local Business Universe logic cannot replace or weaken Evidence
    Authority path, identity, or digest checks.

### F. Selection And Consistency

1. selective-inclusion routing with an empty selection-point array fails;
2. every selection point maps valid affected categories and handling;
3. derived-output routing with no consistency group fails;
4. a consistency group with fewer than two contributors fails;
5. every contributor has project-local evidence;
6. missing, duplicate, or unexplained contributors fail;
7. an isolated report, sync, or summary word does not create a group.

### G. Lifecycle Coverage

1. a required create/entry scenario without validation or processing mapping
   fails when those stages are evidenced as relevant;
2. forward-success-only coverage fails when project evidence contains correction,
   failure, retry, recovery, termination, reversal, or compensation behavior;
3. every considered lifecycle stage has one valid applicability disposition;
4. `NOT_APPLICABLE_WITH_EVIDENCE` without exact evidence fails;
5. `TECHNICAL_INSPECTION_REQUIRED` cannot become COVERAGE_READY;
6. no automatic category-by-stage Cartesian product is generated;
7. shared scenario compression preserves every source category and behavior;
8. observation/audit coverage is required only when project evidence or the task
   makes it relevant.

### H. Path Provenance And Claim Scope

1. a project-runtime path is distinguished from fixture, seed, mock, stub, and
   manual-only paths;
2. seed-only evidence cannot satisfy automatic creation or propagation claims;
3. mock-only evidence cannot satisfy real dependency or persistence claims;
4. a unit test can satisfy isolated logic only, not unrecorded integration or
   runtime claims;
5. an integration-test label without current runtime identity cannot satisfy
   `RUNTIME_TRUSTED_BEHAVIOR_PROOF`;
6. manual evidence is accepted only for its exact recorded observation scope;
7. a current project-native path plus valid Runtime Trust can satisfy the
   corresponding runtime-trusted scenario;
8. production execution is never required merely to prove a project-runtime
   path.

### I. Scenario Identity And End-To-End Trace

1. every task-relevant scenario receives a stable `coverage_scenario_id`;
2. order-only or report-format changes do not change scenario identity;
3. material scenario changes alter the scenario digest and invalidate stale
   downstream evidence;
4. the Business Universe report is immutable after publication; downstream
   evidence points back to it rather than writing runtime/test results upstream;
5. Business Rule maps every required scenario ID;
6. Change Impact maps every scenario to all affected surfaces;
7. Verification Plan owns obligation IDs and records
   `source_coverage_scenario_ids[]`;
8. Runtime Plan/Run Manifest is required only for obligations whose proof
   strength requires runtime trust;
9. Test Evidence preserves the obligation-to-scenario mapping and claim scope;
10. Completion and finish reject one missing scenario, mapping, runtime manifest,
   or required evidence item;
11. a final result that cannot be traced to its origin and project path fails.

### J. Platform Matrix

1. Web client-only behavior generates no forced backend/API obligation;
2. API/service behavior receives API/domain verification;
3. worker/data-pipeline behavior receives job/data-path verification;
4. WeChat Mini Program behavior receives page/component/platform API,
   cloud-function, and project-native lifecycle verification without treating its
   UI as backend proof;
5. internal-admin behavior receives privileged workflow, authorization-visible,
   API, audit, and operator-safety verification only where those surfaces are
   evidenced;
6. iOS local behavior receives project-native iOS verification;
7. Android local behavior receives project-native Android verification;
8. offline/local-storage behavior receives state/storage/recovery verification;
9. companion backend, auth, data, payment, or cloud surfaces remain separate
   affected surfaces and proof obligations;
10. unknown placement blocks for technical inspection instead of asking the
   user.

### K. Task Tier And Consumer Chain

For LOW, MEDIUM, POSSIBLE_HIGH, and HIGH:

1. not-required coverage preserves the existing proportional path;
2. required coverage preserves category and scenario identity without
   forcing the HIGH review policy;
3. LOW uses LIGHTWEIGHT review only for exact `NOT_REQUIRED_WITH_REASON`; a
   discovered behavioral relationship converges to MEDIUM before coverage is
   generated;
4. MEDIUM uses TARGETED review and targeted verification with exact coverage
   binding;
5. POSSIBLE_HIGH remains read-only and cannot claim completion;
6. HIGH consumes the full high-impact evidence chain;
7. every tier-applicable review and completion consumer names coverage when
   required;
8. Verification Plan creates obligation IDs and maps every required coverage
   scenario ID;
9. Test Evidence covers every required tier-applicable obligation and preserves
   the reverse mapping;
10. Completion rejects one missing category, scenario, or required
    obligation;
11. discovery of wider risk invalidates the old Task Governance and coverage
    reports and repeats monotonic classification until the exact tier/routing/
    evidence/boundary tuple is stable;
12. automatic downgrade, oscillation, repeated non-stable state, or exhausted
    convergence bounds fail closed;
13. finish cannot return DONE with any failed dependency.

### L. Adversarial Evidence

The checker must reject:

- absolute, traversal, symlink-escape, and outside-project refs;
- stale, paused, switched, copied, or resumed-without-review Work Queue task
  bindings;
- stale task, intent, project, source revision, or digest bindings;
- copied reports from another project or task;
- duplicate IDs;
- unknown categories or relationship references;
- unknown participants, lifecycle stages, path provenance, scenario IDs, or
  proof-strength references;
- unsupported exclusions;
- empty evidence arrays hidden by generic Markdown;
- Markdown/JSON disagreement;
- category, participant, origin, lifecycle stage, project path, selection point,
  consistency contributor, scenario, or obligation dropped downstream;
- positive-path-only coverage despite an evidenced reverse/recovery path;
- seed/mock/manual-only proof presented as project-runtime proof;
- partial-write or cross-module consistency evidence omitted from downstream
  review;
- prose-only acceptance without a mapped Verification Plan obligation and Test
  Evidence item;
- old Runtime Run Manifest or Test Evidence reused for changed code;
- final derived result with no traceable origin;
- project-local schema substitution that weakens IntentOS authority.

### M. Zero-Experience Contract

1. the public user still uses only natural language;
2. no platform, baseline, checker, category, review, or test choice is surfaced;
3. technical inspection remains Codex-owned;
4. one real missing business/external fact is presented in plain language;
5. no team role or additional person is required;
6. production consent remains exact and separate from technical readiness;
7. a missing fact blocks only its recorded dependent scope while Codex continues
   unaffected engineering;
8. risk reclassification and technical discovery never become user choices.

### N. Existing And Generated Projects

1. a strong project-native equivalent maps only with exact behavioral and
   identity evidence;
2. a weak or missing project mechanism receives IntentOS-native coverage;
3. filenames, TODOs, and existing tests alone cannot satisfy adoption;
4. existing lifecycle/state-machine/test-fixture systems map only when their
   scenario, provenance, and evidence semantics are equal or stronger;
5. deep repositories and monorepos preserve all evidenced project roots, nested
   governance, and application surfaces without shallow-depth omission;
6. generated/vendor ignores cannot hide project-owned behavior, while IntentOS
   assets and true generated/vendor trees do not pollute discovery;
7. interrupted segmented discovery resumes to the same canonical result as an
   uninterrupted scan;
8. candidate, time, memory, or tool-budget exhaustion remains partial and cannot
   reach ready status;
9. generic, Web, iOS, and Android starters install the same schema and checker;
10. WeChat Mini Program, backend API, and internal-admin generated profile
    fixtures execute the same semantic and consumer contracts;
11. generated-project smoke executes positive and negative routing/evidence
   cases;
12. installed assets pass Manifest and Review Context checks.

### O. Compatibility

1. records from 1.107.1 and earlier remain readable under historical rules;
2. they cannot satisfy a current task that requires 1.108 structural coverage;
3. no compatibility code is added for the unreleased first 1.108 schema,
   reason codes, upstream-filter model, or reconciliation-only model;
4. no compatibility code is added for provisional coverage-requirement IDs that
   are replaced by final coverage-scenario IDs;
5. current generated assets use only the final 1.108 contract.

## Required Verification Commands

At minimum, run:

~~~text
node --check for every changed JavaScript module
npm run verify:business-universe
npm run verify:business-universe:strict-chain
node --test tests/business-universe-coverage.test.mjs
node --test tests/business-universe-consumer-chain.test.mjs
node --test tests/business-universe-existing-project-scan.test.mjs
node --test tests/verification-runtime-consumer.test.mjs
node --test tests/operating-model.test.mjs
node --test tests/review-context-authority.test.mjs
node scripts/check-work-queue.mjs . --allow-empty
node scripts/check-business-universe-coverage.mjs . --allow-empty
node scripts/check-task-governance.mjs . --allow-empty
node scripts/check-business-rule-closure.mjs . --allow-empty
node scripts/check-change-impact-coverage.mjs . --allow-empty
node scripts/check-plan-review.mjs . --allow-empty
node scripts/check-verification-plan.mjs . --allow-empty
node scripts/check-verification-run-manifest.mjs . --allow-empty
node scripts/check-test-evidence.mjs . --allow-empty
node scripts/check-execution-assurance.mjs . --allow-empty
node scripts/check-completion-evidence.mjs . --allow-empty
node scripts/check-review-context-authority.mjs .
node scripts/check-solo-operating-model.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
node scripts/cli.mjs fixtures
npm run verify
git diff --check
~~~

The `--allow-empty` commands above are repository smoke checks only. They prove
that an unrelated empty project is not forced to create feature evidence. They
do not count as 1.108 acceptance.

`verify:business-universe:strict-chain` must validate one exact LOW
`NOT_REQUIRED_WITH_REASON` path, build exact current-task structured consumer
chains for MEDIUM and HIGH, and include one `POSSIBLE_HIGH` fixture proving
implementation and completion remain blocked. It must invoke every
tier-applicable checker with the exact report refs and strict requirements. The
same suite must remove or alter, one at a time:

- the Work Queue binding or resume review;
- Task Governance routing or digest;
- the Business Universe report or one scenario;
- one Business Rule, Impact, Plan Review, or Verification mapping when that
  artifact is required by the tier;
- one Runtime Trust binding when the scenario requires it;
- one Test Evidence item or claim-scope binding;
- one Execution Assurance or Completion mapping.

Every mutation must fail at its owning checker and keep `finish` from returning
`DONE`. A missing report, empty directory, copied report, stale source revision,
or `--allow-empty` result cannot satisfy this strict-chain acceptance.

The source worktree and any isolated verification snapshot must correspond to
the same 1.108 candidate. Concurrent unrelated files must be identified and
excluded explicitly rather than silently absorbed.

## Review And Governance Plan

### Review Pass 1: Trigger Semantics

- challenge stale, paused, switched, and resumed-without-review Work Queue
  bindings;
- prove every behavioral or ambiguous task receives the lightweight preflight;
- challenge the preflight blind spot where the hidden structural signal is not
  present in the user's wording;
- replay the cross-domain positive matrix;
- replay the technical false-positive matrix;
- prove multiple unrelated categories do not trigger without one shared
  structural relationship;
- prove ambiguous API, logging, dependency, verification, background-task, and
  data-path changes route to inspection rather than automatic exemption;
- replay single-category lifecycle and path-provenance triggers;
- inspect Chinese and English parity;
- verify no industry whitelist remains.

### Review Pass 2: Evidence Authority And Path Provenance

- challenge filename-only evidence;
- challenge same-file multi-role evidence;
- challenge stale locators, digests, task identity, and project identity;
- challenge truncated, budget-exhausted, interrupted, deep-repository,
  monorepo, and copied-report discovery;
- prove every file-backed source is revalidated by the shared Evidence Authority
  implementation;
- prove semantic locator digests cannot replace raw source digests;
- replay `SUPPORTED`, `PARTIAL`, `UNSUPPORTED`, failed, truncated,
  budget-exhausted, segmented, and resumed discovery boundaries;
- prove interrupted and uninterrupted scans produce the same canonical result;
- prove fixture, seed, mock, stub, manual, and project-runtime paths remain
  distinct;
- prove evidence labels alone cannot upgrade claim scope.

### Review Pass 3: Lifecycle And Scenario Integrity

- remove one category, participant, lifecycle stage, reverse path, selection
  point, consistency contributor, scenario, and scenario mapping at each
  downstream stage;
- prove every removal fails closed;
- challenge not-applicable lifecycle claims without evidence;
- challenge deterministic scenario identity and stale scenario digests;
- verify confirmed non-behavioral LOW remains LIGHTWEIGHT, a LOW discovery of
  behavioral omission risk converges to MEDIUM, MEDIUM remains TARGETED,
  POSSIBLE_HIGH remains read-only, and HIGH consumes the full chain;
- verify Verification Plan, not Business Universe Coverage, owns obligation IDs;
- verify wider discovered impact invalidates old evidence and converges
  monotonically through Task Governance;
- challenge downgrade, oscillation, repeated non-stable state, and exhausted
  convergence bounds.

### Review Pass 4: Runtime Trust And Evidence Scope

- prove runtime-trusted scenarios require the exact current Runtime Plan and Run
  Manifest;
- prove isolated project-runtime verification does not imply production;
- replay seed-only, mock-only, unit-only, manual-only, stale-run, wrong-service,
  wrong-data/session, and old-code evidence attacks;
- challenge partial writes, cross-module disagreement, prose-only acceptance,
  and final results with no source trace;
- prove Runtime Trust, Test Evidence, and Completion remain their existing
  authorities.

### Review Pass 5: Platform Neutrality

- inspect generated obligations for Web, API, worker, WeChat Mini Program,
  internal admin, iOS, Android, and offline paths;
- verify companion backend, auth, data, payment, and cloud surfaces remain
  separate proof obligations;
- prove no universal backend/API assumption remains.

### Review Pass 6: Product Contract

- run Review Context and solo operating checks;
- inspect public output for technical burden;
- verify normal tasks remain lightweight;
- verify missing facts block only their dependent scope;
- verify public release/version claims are promoted only after exact-candidate
  close-out.

### Review Pass 7: Distribution And Repository Integrity

- initialize every starter;
- initialize generated WeChat Mini Program, backend API, and internal-admin
  profile fixtures;
- execute installed-project smoke;
- execute the no-empty strict consumer chain and every one-step evidence-removal
  mutation;
- verify Manifest, schemas, version sources, release evidence, README, and
  generated assets;
- run the complete repository suite.

## Stop Conditions

1. A Universe report is not jointly bound to the exact current Work Queue item
   and Task Governance decision.
2. A paused, switched, stale, copied, or resumed-without-review task supplies
   current coverage.
3. A behavioral or ambiguous task can bypass the lightweight preflight.
4. A hidden structural signal is missed solely because it was absent from the
   user's wording.
5. Any proven false-positive case creates a Universe report.
6. Ambiguous API, logging, dependency, verification, background-task, or
   data-path work is exempted without project evidence.
7. Any cross-domain structural case is missed because its nouns are unknown.
8. A filename-only candidate reaches COVERAGE_READY.
9. Required lifecycle, selection, consistency, or path-provenance evidence can
   remain empty.
10. Any category, participant, lifecycle stage, scenario, or obligation
   disappears downstream without failure.
11. A required reverse, failure, recovery, correction, termination, or
   compensation scenario can be omitted without failure.
12. Fixture, seed, mock, stub, or manual-only evidence satisfies a stronger
   project-native or runtime-trusted claim than it proves.
13. A runtime-trusted scenario can pass without the exact current Run Manifest.
14. A client-only path is forced into backend/API verification.
15. LOW or MEDIUM is forced into the HIGH artifact topology solely because
   coverage is required.
16. A tier-applicable consumer drops a coverage scenario or mapping.
17. Business Universe Coverage creates Verification Plan obligation, Runtime Run,
    or Test Evidence item IDs.
18. Evidence locators bypass or duplicate Evidence Authority.
19. Partial, unsupported, failed, truncated, budget-exhausted, or incomplete
    segmented discovery reaches ready status.
20. Interrupted and uninterrupted scans of the same boundary produce different
    canonical results.
21. Newly discovered high-impact evidence does not invalidate Task Governance.
22. Risk reclassification downgrades automatically, oscillates, exceeds its
    bound, or stops before the tier/routing/evidence/boundary tuple is stable.
23. A missing fact blocks unrelated engineering.
24. Partial-write, cross-module, prose-only, stale-evidence, or source-trace gaps
    can still reach DONE.
25. The strict end-to-end chain can pass with an empty, missing, copied, or
    allow-empty report.
26. A supported first-class profile, including WeChat Mini Program or internal
    admin, lacks acceptance coverage.
27. The user is asked for a technical classification or test choice.
28. Generated projects differ from source behavior.
29. A final release claim exists before exact-candidate acceptance passes.
30. Full verification, Manifest, Review Context, or diff checks fail.

No release claim, commit, or push should occur while a stop condition remains.

## Completion Criteria

1. Business Universe evidence is jointly bound to the exact current Work Queue
   item and Task Governance decision.
2. Every behavioral or ambiguous task receives lightweight omission-risk
   preflight without creating an empty report or public step.
3. The structural trigger model replaces isolated keyword routing and requires a
   shared omission-risk relationship rather than mere plurality.
4. Evidence-backed non-behavioral routing cannot exempt ambiguous API, logging,
   dependency, verification, background-task, or data-path changes.
5. No fixed industry whitelist remains.
6. Candidate discovery cannot produce semantic readiness by filename alone.
7. Participants, lifecycle applicability, path provenance, selection points, and
   consistency groups are evidence-driven.
8. Semantic locators extend the shared Evidence Authority and do not replace
   its identity, path, or raw-digest rules.
9. Business Universe owns stable coverage scenario IDs; Verification Plan owns
   and maps platform-neutral verification obligation IDs.
10. LOW records an exact not-required result, while every final tier that
    requires coverage preserves it through its proportional consumer path.
11. Every required lifecycle and project-path scenario survives Business Rule,
   Impact, Verification, Runtime Trust when required, Test Evidence, and
   Completion consumers.
12. Fixture, seed, mock, stub, unit, integration, manual, and runtime evidence are
   accepted only for their validated claim scope.
13. Discovery-driven wider impact converges monotonically without user technical
    classification or an under-classified terminal state.
14. Missing facts block only their exact dependent scope.
15. Deep repositories, monorepos, segmented scans, and interruption/resume are
    deterministic and fail closed when incomplete.
16. Cross-domain, false-positive, lifecycle, provenance, runtime,
    semantic-evidence, platform/profile, consumer, strict-chain, existing-
    project, and generated-project tests pass.
17. Zero-experience behavior remains unchanged.
18. Version, Manifest, Review Context, release evidence, and documentation are
   consistent.
19. Full repository verification passes for the exact candidate worktree.

## Allowed Claims

- IntentOS can identify supported structural business-scenario omission risks
  without an embedded industry whitelist.
- Required Business Universe evidence can be bound to the exact current Work
  Queue item and invalidated after task switch or stale resume.
- Required category, participant, origin, lifecycle, path-provenance, selection,
  consistency, and proof-strength requirements can be bound through the current
  task chain.
- Coverage scenarios can be preserved through risk-proportionate consumers and
  mapped into Verification Plan obligations and conditional Runtime Trust where
  required.
- Sample-only evidence can be prevented from satisfying stronger project-native
  or runtime-trusted claims.
- Technical uncertainty remains Codex-owned and fails closed.
- Tasks without structural omission risk remain on the proportional existing
  path after bounded preflight.

## Forbidden Claims

- Business Universe Coverage discovers every possible real-world category.
- Structural coverage proves the business policy is correct.
- A file, route, test, report, or keyword proves semantic completeness.
- A lightweight preflight proves full business-universe completeness.
- A unit, integration, mock, seed, fixture, manual, or runtime label proves more
  than its validated claim scope.
- A project-runtime path means production behavior was executed or approved.
- Business Universe Coverage itself proves runtime identity or test execution.
- Coverage authorizes implementation, release, production, or external effects.
- Evidence completeness eliminates all product or production risk.
- An allow-empty smoke check proves the strict consumer chain is complete.
- IntentOS can invent unavailable legal, tax, regulatory, provider, or
  industry facts.

## Final Definition

IntentOS 1.108 is complete only when Business Universe Coverage is:

~~~text
conditional
domain-neutral
structure-driven
work-queue-bound
preflight-routed
semantically evidenced
evidence-authority-bound
explicitly bounded
discovery-resumable
lifecycle-aware
path-provenance-aware
scenario-traceable
runtime-trust-integrated
platform-neutral
task-bound
consumer-enforced
strict-chain-verified
convergence-stable
risk-proportionate
zero-experience
non-authorizing
~~~

It must prevent a task from looking complete after a relevant category,
participant, lifecycle branch, project path, consistency relationship, or
required proof scenario was omitted, without turning business examples into
hard-coded product rules or duplicating the existing verification and evidence
authorities.
