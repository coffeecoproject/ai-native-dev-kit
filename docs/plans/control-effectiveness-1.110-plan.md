# Control Effectiveness 1.110 Execution And Acceptance Plan

## Status

Proposed execution and acceptance plan.

This document does not authorize implementation, project writes, control
execution, CI or hook changes, release, production access, or version release.

The plan was prepared after a repository-level review of current IntentOS
authority, adoption, evidence, plan-review, verification, the 1.108 Business
Universe Coverage work, and the planned 1.109 project-entry trust hardcut.

## Theme

IntentOS 1.110 adds evidence-bound effectiveness assessment for every
IntentOS-native or project-native control relied on by an adoption, task,
verification, release-readiness, or completion claim.

It answers one question:

```text
When IntentOS relies on one of its own controls or an existing project's gate,
checker, policy, test, workflow, or evidence process, has that control been
proven to enforce the specific claim for the current scope and evidence
identity?
```

It does not replace project-native controls or create a superior status for
IntentOS-native controls. It prevents either control class from using script
existence, documentation, test registration, or a green status as proof that
the claimed behavior is actually enforced.

## Why This Version Exists

IntentOS already has two relevant strengths:

1. it can map and preserve existing-project authority;
2. it can require task-bound, exact, current evidence before completion.

However, a gap remains between them for both control classes.

An IntentOS-native control can also look healthy while a consumer reads only
its process exit code, ignores a structured pending state, runs a non-strict
mode, or tests source assets without proving installed-project behavior.

An existing project can have mature-looking governance and still contain a
control that:

- accepts stale evidence;
- scans only part of the active production surface;
- checks existence or smoke behavior while claiming semantic regression
  coverage;
- has never been shown to fail when its protected condition is violated;
- runs against the wrong revision, environment, service, or data source;
- has become obsolete after the project structure changed;
- returns PASS while its own evidence cannot support the claim.

The current adoption model can classify a project-native surface as mapped,
project-owned, or verified without a shared claim-level effectiveness contract.
The IntentOS self-check and apply chain can similarly accept a native checker
through weaker consumer semantics than the checker itself requires. Either path
can create a false-green governance result.

## Relationship To 1.108 And 1.109

IntentOS 1.108 Business Universe Coverage addresses a different failure class:

```text
A complete-looking task can silently omit an entire business object, event
source, entry point, early-filtered class, or separate processing path.
```

The in-progress 1.108 work already defines conditional routing, structured
business-universe evidence, exact Business Rule Closure binding, downstream
impact and verification binding, completion revalidation, and zero-experience
public behavior.

Therefore 1.110 must not create a second business-universe workflow, schema,
checker, artifact, CLI entry, or completion truth.

IntentOS 1.109 Project Entry And Adoption Trust Hardcut establishes canonical
project identity, effective Guidance enforcement, complete project-authority
inventory, strict adoption source binding, controlled init/apply truth, and
truthful public exit behavior. 1.110 depends on that chain. It does not reopen
or duplicate project-entry and adoption trust.

The two capabilities remain separate but composable:

```text
1.108: Did the task cover the relevant business universe?
1.109: Are project entry, Guidance, authority inventory, adoption evidence, and
       apply outcomes trustworthy?
1.110: Do the IntentOS-native and project-native controls relied on by the task
       really enforce their declared claims?
```

When a task depends on any of these capabilities, each required result remains
an input to the existing final closure chain. None becomes a new final
completion authority.

## Product Contract

The ordinary user continues to use one natural-language entry:

```text
"Help me build, change, review, or release this."
```

The user does not choose:

- which IntentOS-native or project-native controls to assess;
- whether a gate is strong enough;
- which files belong to a scan inventory;
- evidence freshness thresholds;
- test or probe commands;
- reviewer or subagent roles;
- control-state labels;
- fallback governance;
- compatibility mode;
- adoption depth.

Codex and IntentOS own those technical decisions from project evidence.

The user may only be asked for:

- a missing business fact or product preference that cannot be inferred;
- an unavailable authoritative external fact;
- exact consent for a prepared action with a concrete real-world effect.

Technical uncertainty is not a user decision. It remains an IntentOS blocker or
an internal investigation task.

## Goals

1. Prevent file existence, documentation, age, or PASS status from proving
   control effectiveness.
2. Bind every accepted control to a precise claim, implementation, scope,
   evidence identity, and limitation set.
3. Require proof that the control can detect a safe representative violation
   when strict reliance requires failure capability.
4. Hold IntentOS-native controls to the same claim/evidence standard and
   preserve stronger project-native controls when they are actually proven.
5. Reject or limit weaker, stale, partial, or semantically mismatched controls.
6. Feed control-trust blockers into existing adoption, review, verification,
   completion, and closure consumers without adding another final truth.
7. Keep the user-facing result to one plain status, one reason, and one next
   safe action.
8. Keep IntentOS core independent from any platform, industry, product, vendor,
   repository, or organization.

## Non-Goals

1. Do not copy a real project's gates into IntentOS core.
2. Do not define universal project-specific thresholds.
3. Do not guarantee that a proven control makes the product correct.
4. Do not automatically repair project gates in the assessment phase.
5. Do not install hooks, mutate CI, or replace release workflows.
6. Do not execute arbitrary commands read from Markdown or evidence files.
7. Do not run destructive or production-mutating negative probes.
8. Do not audit every control for every low-impact task.
9. Do not turn control assessment into a public user workflow.
10. Do not replace Adoption Assurance, Plan Review, Verification Plan,
    Completion Evidence, or Unified Closure.

## Core Principle

```text
Control existence != control effectiveness.
Control PASS != claim proof.
Project-owned != automatically trusted.
Stricter-looking != proven stronger.
```

Any relied-on control may support a strict IntentOS claim only when its declared
capability is bounded and its effectiveness evidence is current,
scope-complete, semantically matched, and safely reproducible. IntentOS-native
origin does not create an exemption.

## Authority Model

| Authority | Owns | Does not own |
|---|---|---|
| IntentOS-native control | Generic IntentOS enforcement implementation | Automatic effectiveness or project correctness |
| Project-native control | Project-specific policy and enforcement implementation | IntentOS completion authority |
| Control Effectiveness Assessment | Whether the control supports one bounded claim | Product correctness, write permission, release approval |
| Existing Rule Reconciliation | Project and IntentOS rule comparison | Proof that a control implementation is effective |
| Governance Convergence | Preserve, merge, adopt, or block recommendation | Target-project writes |
| Adoption Assurance | Whether IntentOS is actually active for the project | Product or production correctness |
| Task Governance | Whether task-scoped control proof is required | Implementation authorization |
| Plan Review | Whether the plan safely relies on proven controls | Code execution or test completion |
| Verification Plan | Required proof obligations | Test results |
| Completion Evidence | Exact evidence-bound completion input | Final close-out truth |
| Unified Closure | One final task close-out result | External approval or real-world authority |

The Control Effectiveness Assessment is an internal evidence source. It is not
an authority layer and cannot drive writes by itself.

## Operating Model

### Existing-project adoption assessment

```text
project discovery
-> existing-rule reconciliation
-> governance convergence
-> identify relied-on IntentOS-native and project-native controls
-> control effectiveness assessment
-> adoption assurance
-> one recommended adoption or remediation path
```

### Task execution

```text
natural-language goal
-> Task Governance
-> Business Universe Coverage when 1.108 requires it
-> Business Rule Closure
-> Change Impact Coverage
-> Plan Review
-> identify IntentOS-native and project-native controls required by the plan or completion claim
-> reuse valid current assessment or require bounded reassessment
-> Verification Plan
-> Test Evidence / Execution Assurance / Completion Evidence
-> Unified Closure
```

Assessment is not automatically required for every control in the project. It
is required only for a control that supports an adoption claim, a task plan, a
verification obligation, a release-readiness claim, or a completion claim.

## Trigger Model

### Required triggers

Assessment is required when one or more conditions is true:

- Governance Convergence recommends `KEEP_EXISTING_STRICTER` for a control;
- Adoption Assurance wants to mark a control-backed surface `VERIFIED`;
- a plan or completion claim relies on an IntentOS-native or project-native
  control as proof;
- the current adoption, plan, release-readiness, or completion claim relies on
  a control that protects a high-impact surface;
- the control implementation, scope, evidence policy, or protected inventory
  changed;
- evidence is outside the claim-specific freshness contract;
- evidence reveals likely false green, omitted scope, or semantic mismatch;
- an escaped defect shows the control did not enforce its claim.

High-impact surfaces include release, rollback, permissions, security, data
integrity, migrations, production, provider actions, and equivalent project
authority areas. The list does not grant permission over those surfaces.

### Not-required routing

Assessment is not required when:

- the control is not used by the current adoption or task claim;
- current 1.110 effectiveness evidence already proves the exact bounded claim
  and no relevant implementation, scope, identity, or freshness input changed;
- the task does not touch or rely on the protected surface;
- the control is advisory and no strict claim depends on it;
- the control is not applicable for a concrete evidence-backed reason.

The reason is recorded internally. An empty assessment is not created merely
for formality.

## Control Claim Contract

Every assessed control records one or more bounded claims:

- stable control and claim IDs;
- human-readable claim summary and category;
- enforcement level: advisory, warning, blocking, or observational;
- protected surface;
- implementation and configuration refs with digests;
- declared and observed scan scope;
- inventory source and digest;
- evidence-backed exclusions;
- evidence identity and freshness requirements;
- environment and revision binding;
- execution adapter identity when dynamic execution is needed;
- negative failure proof requirement;
- known limitations;
- exact consumers that rely on the claim.

A control with multiple unrelated claims is assessed claim by claim. One strong
claim cannot make every other claim effective.

## Generic Claim Categories

- source or structure coverage;
- evidence freshness and identity;
- policy or schema conformance;
- static correctness;
- runtime behavior;
- visual or interaction regression;
- performance or capacity budget;
- security or permission boundary;
- data integrity or migration safety;
- release, rollback, or operational readiness;
- audit or observability quality;
- custom project-owned claim.

Categories guide proof shape. They do not supply the project's actual threshold,
inventory, environment, or implementation.

## Effectiveness Dimensions

### 1. Implementation identity

Prove the exact script, workflow, configuration, library, service, or provider
that implements the control. Evidence includes project-local refs, current
digests or revision binding, invocation path, and effective configuration.

### 2. Semantic match

Compare the declared claim with what the implementation actually asserts.

Invalid equivalence examples:

- page availability presented as visual-regression comparison;
- file existence presented as policy conformance;
- one metric presented as a rolling-window quality gate;
- one directory scan presented as full production-source governance;
- HTTP success presented as business behavior correctness;
- broad test success presented as category-specific coverage.

### 3. Scope completeness

Prove that observed scan scope covers the active protected inventory. Record how
assets are enumerated, which are included, which are excluded, why exclusions
are valid, and whether inventory and control execution use the same revision.

Hard-coded globs are not automatically wrong. They cannot support a broad claim
unless they match a current evidence-backed inventory.

### 4. Evidence identity and freshness

Freshness is claim-specific, not one arbitrary global number. Depending on the
claim, evidence can require Git SHA, working-tree state, environment, process,
database or schema identity, baseline revision, time window, run ID, artifact
digest, and source/output binding.

Evidence becomes invalid when a relevant identity or freshness condition no
longer holds.

### 5. Failure capability

For blocking or high-impact claims, prove that the control fails for a safe
representative violation.

Preferred proof order:

1. existing deterministic negative fixture;
2. isolated temporary-copy or sandbox probe;
3. project-provided non-destructive self-test with explicit contract;
4. static failure-branch proof, recorded only as partial when runtime proof is
   required.

No failure proof means no full effectiveness when the claim requires it.

### 6. Result integrity

Prove that the result corresponds to the assessed implementation, scope, run,
and evidence. Reject summary/JSON disagreement, old copied outputs, silent
skips, warning-only behavior described as blocking, and unsafe refs.

### 7. Operational safety

Record read-only status, possible effects, network and secret requirements,
cleanup ownership, timeout, resource bounds, production prohibition, and
isolation behavior.

## Compact State Model

Use five primary states:

- `CONTROL_PROVEN_EFFECTIVE`
- `CONTROL_PROVEN_PARTIAL`
- `CONTROL_NOT_PROVEN`
- `CONTROL_INVALID`
- `NOT_APPLICABLE_WITH_REASON`

Diagnostic reason codes:

- `IMPLEMENTATION_UNRESOLVED`
- `REVISION_MISMATCH`
- `ENVIRONMENT_MISMATCH`
- `EVIDENCE_STALE`
- `EVIDENCE_IDENTITY_INCOMPLETE`
- `SCAN_SCOPE_INCOMPLETE`
- `EXCLUSION_UNPROVEN`
- `SEMANTIC_MISMATCH`
- `FAILURE_CAPABILITY_UNPROVEN`
- `RESULT_INTEGRITY_UNPROVEN`
- `UNSAFE_PROBE`
- `CONTROL_EXECUTION_FAILED`
- `PROJECT_AUTHORITY_BLOCK`
- `TECHNICAL_INVESTIGATION_REQUIRED`

`CONTROL_PROVEN_PARTIAL` cannot satisfy a strict claim unless the consumer
requires only the proven subset and records that bounded claim.

The primary state applies to one bounded claim, not automatically to every
claim implemented by the same script or workflow. The report outcome is derived
from the strictest state among claims required by the assessment purpose;
unrelated advisory claims remain visible but do not inflate or block that
outcome.

## Internal Artifact

Add one structured internal artifact:

```text
control-effectiveness-reports/<task-or-adoption-id>.md
```

It records report identity, project and revision identity, assessment purpose,
control claims, effectiveness dimensions, reason codes, limitations, static
findings, bounded dynamic probe result, exact evidence refs and digests,
dependent consumers, outcome, and non-authorizing boundaries.

One report may cover related controls for one purpose. Do not generate one
user-visible report per gate.

## Static And Dynamic Assessment

### Static assessment

Static assessment is read-only. It may inspect files and metadata, resolve refs,
derive inventories, compare scope, inspect result schemas and failure branches,
and prepare a dynamic probe plan.

Static assessment cannot claim full runtime effectiveness when actual execution
is required.

### Dynamic assessment

Dynamic assessment may execute only through a bounded adapter that records:

- executable and argument array;
- fixed working directory;
- environment-variable allowlist;
- timeout and expected exit behavior;
- declared file and resource effects;
- isolated fixture or sandbox identity;
- cleanup owner and verification;
- network and secret requirements;
- production prohibition;
- output digest.

Use direct process invocation, never shell text from Markdown evidence.

The report resolver and checker remain read-only and never execute the dynamic
probe. Probe execution belongs to the existing bounded execution orchestrator;
the resulting evidence is then consumed and checked by this capability.

Dynamic execution is allowed only when the existing IntentOS execution boundary
permits the exact non-destructive action and all effects are bounded. Otherwise
IntentOS prepares the action and asks only for unavoidable real-world consent,
not a technical choice.

## Negative Probe Safety

Negative probes must use synthetic or disposable inputs, run outside
production, avoid real customer or regulated data, avoid shared mutable
resources, prove cleanup, and stop on unexpected writes or identity drift.

They must never disable a real control, modify CI/hooks/release configuration,
or mutate production and external provider state.

If safe failure proof is unavailable, the result remains partial or not proven.
IntentOS must not weaken the standard to force green.

## Existing-System Integration

### Existing Rule Reconciliation

Record claim refs for project rules that depend on executable or
evidence-producing controls. Stricter wording does not prove effectiveness.

### Governance Convergence

`KEEP_EXISTING_STRICTER` requires a bounded stronger claim, a current report,
`CONTROL_PROVEN_EFFECTIVE`, and no contradictory authority evidence.

If wording is stronger but proof is incomplete, recommend review or remediation
instead of preserving false-green equivalence.

### Adoption Assurance

A control-backed surface can be `VERIFIED` only when every strict claim used by
that surface has current effective proof.

`PROJECT_OWNED` classifies authority, not effectiveness. Unrelated unproven
controls do not block all adoption.

### Task Governance

Automatically record whether the current task relies on IntentOS-native or
project-native control effectiveness. Derive this from touched surfaces, plan
and verification dependencies, task impact, changed controls, and existing
proof coverage.

### Plan Review

Identify every relied-on IntentOS-native or project-native control, bind exact claim and assessment
refs, reject equivalence from names or PASS text, reject stale or partial proof
for strict claims, and require remediation when safety depends on unproven
enforcement.

### Verification Plan

Bind effective control evidence where it directly satisfies an obligation. Add
isolated control-probe obligations when current proof is required. Keep
control-self-test separate from business-behavior proof.

### Test Evidence

Record exact claim ID, assessment ref/digest, implementation/configuration
digest, run identity, required negative-probe result, and limitations. A control
test proves the control, not the whole task.

### Execution Assurance And Completion Evidence

Resolve every cited control claim, reject stale or mismatched assessment,
reject partial proof used as full proof, preserve all 1.108 semantic-coverage and
existing runtime/review blockers, and prevent a green control from overriding
incomplete task evidence.

### Unified Closure

Unified Closure remains the only final task close-out truth. It consumes the
stricter source result and gains no parallel control-effectiveness authority.

## Zero-Experience Output

The ordinary user sees no internal control vocabulary by default.

Examples:

```text
The project's current check does not cover all files used in this change. I am
updating the technical plan and verification scope before coding. No decision
is needed from you.
```

```text
The release check uses evidence from an older revision, so this task cannot be
marked ready yet. I will regenerate and revalidate it in a safe environment.
```

The public result contains one state, one reason, what Codex will do next, and
one real decision only when unavoidable.

## Existing-Project Behavior

Codex automatically:

1. reads project identity and adoption state;
2. reads agent rules, baselines, gates, CI, hooks, release rules, tests,
   evidence policies, and audit records;
3. maps relied-on project-native controls to bounded claims and resolves any
   IntentOS-native controls used as project evidence;
4. separates project ownership from proven effectiveness;
5. assesses only controls required by current adoption or task claims;
6. preserves stronger proven controls;
7. proposes remediation for weak or unproven controls;
8. routes safe technical work internally;
9. requests consent only for a concrete real-world effect;
10. records one explainable result without overclaiming.

This does not require IntentOS ownership of project CI, release, runtime, or
production.

## New-Project Behavior

- IntentOS-native controls continue to come from the selected baseline;
- source self-tests prove generic assets;
- generated-project tests prove installed behavior;
- project configuration still requires current identity and scope;
- custom or replaced controls enter this assessment when relied upon;
- the user does not configure the model manually.

## IntentOS-Native Control Rules

IntentOS-native controls receive no implicit trust from being listed in the
Manifest, included in `npm run verify`, copied by a starter, or implemented in
the source repository.

For a native control used by a strict claim, prove:

- source implementation and configuration identity;
- source-package positive and negative behavior;
- installed-project behavior when the control is distributed;
- exact structured outcome semantics;
- strict consumer invocation mode;
- consumer handling for pass, pending, warning, blocked, and failed states;
- source/installed parity;
- current evidence identity and limitations.

A native checker that returns process exit zero for a non-passing informational
state can still be correct. The consuming control is ineffective if it treats
that informational result as verified. Assessment therefore covers both the
producer and every strict consumer used by the claim.

## Remediation Model

When a control is not proven, IntentOS chooses one technical recommendation:

- repair the current control;
- narrow the claim to proven behavior;
- add missing inventory or exclusions;
- regenerate identity-bound evidence;
- add a safe negative fixture;
- use an existing stronger IntentOS control;
- retain the project control as advisory;
- block the dependent claim until evidence exists.

Remediation does not occur during read-only assessment. Writes follow existing
Plan Review, boundary, execution, verification, review, and closure rules.

## Compatibility

- historical artifacts remain readable with their original meaning;
- historical PASS does not become 1.110 proof;
- existing adoption reports remain valid historical assessments;
- current strict claims require current effectiveness binding;
- advisory controls remain advisory without stronger proof;
- stronger project rules remain authoritative even when enforcement proof is
  incomplete; IntentOS records the enforcement gap rather than downgrading the
  rule.

## Implementation Assets

### New assets

- `core/control-effectiveness.md`
- `docs/control-effectiveness.md`
- `schemas/artifacts/control-effectiveness.schema.json`
- `templates/control-effectiveness-report.md`
- `control-effectiveness-reports/.gitkeep`
- `checklists/control-effectiveness-review.md`
- `prompts/control-effectiveness-agent.md`
- shared control-claim normalization library;
- read-only resolver and strict checker;
- safe execution-adapter validation helper;
- exact consumer-binding helper.

### Existing-system changes

- Existing Rule Reconciliation claim refs;
- Governance Convergence effectiveness binding;
- Adoption Assurance ownership/effectiveness distinction;
- Task Governance conditional routing;
- Plan Review exact claim binding;
- Verification Plan control-probe obligations;
- Test Evidence current assessment binding;
- Execution Assurance and Completion Evidence strict consumption;
- Unified Closure blocker propagation;
- Evidence Authority registration;
- Manifest, starters, generated projects, references, README, and self-check
  registration.

Direct scripts may be documented for maintainers. The public entry remains
`work`; ordinary users do not learn a new command.

## Schema Requirements

The report requires:

- schema and artifact identity;
- assessment ID and purpose;
- project identity;
- task or adoption binding;
- control claims;
- evidence refs;
- limitations;
- dependent consumers;
- boundaries;
- outcome.

Each claim requires identity, declared claim, enforcement level, protected
surface, implementation/configuration binding, scope and exclusions, freshness
contract, static assessment, dynamic state, failure proof, effectiveness
dimensions, state, reason codes, limitations, and canonical digest.

Use `additionalProperties: false` at authority-bearing levels.

## Checker Requirements

The strict checker rejects:

- missing or invalid structured evidence;
- unknown states/reasons or duplicate IDs;
- unsafe, unresolved, outside-project, traversal, or symlink-escape refs;
- digest, project, task, revision, or intent mismatch;
- missing implementation evidence;
- declared scope without inventory proof;
- unsupported exclusions;
- full effectiveness with incomplete scope, semantic mismatch, stale evidence,
  or incomplete identity;
- required failure capability without proof;
- dynamic results without bounded adapter identity, exit code, timeout, cleanup,
  or output digest;
- destructive or production probes;
- arbitrary shell text treated as authority;
- summary/Markdown/JSON disagreement;
- partial proof used as full proof;
- non-authorizing boundary drift;
- control proof presented as product correctness or final completion.

The checker validates recorded evidence only. It must never execute a control,
probe, project script, CI job, hook, or evidence-provided command while checking
a report.

## Resolver Requirements

The resolver may derive candidates, but candidates are not authority. It must
read current project evidence, distinguish ownership/declaration/behavior,
identify actual consumers, avoid unrelated controls, derive current inventory,
preserve technical uncertainty as a blocker, prepare but not silently run unsafe
probes, avoid inference from names or PASS, and never delegate the technical
decision to the user.

## Goal And Subagent Orchestration

Implementation may use Goal Mode and subagents when available.

The main thread owns repository orientation, authority, integration, final
writes, test execution, finding triage, remediation, version close-out, and the
completion claim.

Suggested read-only reviewers:

- Contract Reviewer;
- Control Model Reviewer;
- Existing-Project Reviewer;
- Security Reviewer;
- Consumer Reviewer;
- Compatibility Reviewer;
- Adversarial Reviewer.

Subagents remain advisory, do not review their own writes, are closed when idle,
and are all closed before final close-out. If unavailable, the main thread must
cover the same review surfaces without weakening acceptance.

## Execution Phases

### Phase 0: Repository orientation

Read current version, Manifest, active guidance, authority registries, dirty
worktree, concurrent work, and 1.108/1.109 status. Inventory affected consumers
and avoid overlapping uncommitted ownership.

Exit: current scope is proven and no 1.108 capability is duplicated.

### Phase 1: Contract and design

Add core/user guidance, compact states, claim dimensions, internal artifact,
schema, and zero-experience review.

Exit: one evidence source, no new final truth, no project-specific core rule,
and no technical user choice.

### Phase 2: Resolver, checker, and safety helpers

Implement read-only static assessment, strict checking, Evidence Authority
binding, bounded adapter validation, and positive/adversarial fixtures.

Exit: false-green fixtures fail, effective fixtures pass, unsafe probes are
rejected, and resolver assertions do not become proof.

### Phase 3: Existing-project adoption consumers

Add claim refs, convergence hardening, Adoption Assurance distinction, scoped
blocking, and existing-project fixtures.

Exit: project-owned does not imply effective, stronger proven controls remain,
required unproven controls block, and irrelevant controls do not.

### Phase 4: Task and completion consumers

Add Task Governance routing, Plan Review binding, Verification obligations,
Test Evidence binding, Execution/Completion revalidation, Unified Closure
propagation, and 1.108 coexistence tests.

Exit: every relied-on control has one current binding, no partial-to-full bypass
exists, and Unified Closure remains final.

### Phase 5: Product integration

Register assets, update source/generated parity, keep `work` public, and add
plain-language UX tests.

Exit: installed projects have the capability without user command burden.

### Phase 6: Review and release close-out

Run focused/full/generated/compatibility checks, independent review, P0/P1
remediation, P2 classification, then version and release evidence.

Exit: all release signals agree and claims do not exceed proof.

## Acceptance Plan

### Positive

- implementation/config refs resolve and bind current revision;
- observed scope matches inventory and exclusions are proven;
- freshness/identity contract passes;
- safe positive and negative fixtures produce expected outcomes;
- result/evidence digests match;
- strict consumer binds the exact assessment;
- stronger proven project-native control is preserved.

### Stale and identity negative

- old revision, wrong environment, wrong runtime identity, expired window,
  copied digest, changed implementation, and changed inventory fail.

### Scope negative

- omitted active asset, missing alternate path, unsupported exclusion, and
  partial scan used as full coverage fail;
- bounded partial claims remain bounded;
- unrelated controls do not block unrelated tasks.

### Semantic negative

- smoke presented as regression, HTTP success as business correctness,
  existence as policy enforcement, one metric as a window, warning as blocking,
  and broad suite success as exact proof all fail.

### Failure capability and safety

- deterministic and isolated negative fixtures pass with cleanup proof;
- required negative proof absence remains partial/not proven;
- production, secret-bearing, uncontrolled shell, wrong-exit, and failed-cleanup
  probes fail.

### Adoption

- project ownership remains distinct from effectiveness;
- `KEEP_EXISTING_STRICTER` requires exact effective proof;
- stale required proof blocks the verified surface;
- unrelated proof gaps do not block all adoption;
- historical and partial states remain readable without bypass.

### Task consumers

- routing is automatic;
- Plan Review rejects unproven dependencies;
- Verification separates control and business proof;
- Test Evidence binds current claim/run;
- Execution and Completion reject drift or partial proof;
- Unified Closure keeps the strictest blocker;
- valid 1.108 coverage cannot override invalid control proof and vice versa.

### Authority and UX

- no report authorizes implementation, writes, CI/hooks, release, production,
  or project-authority transfer;
- static assessment is read-only;
- dynamic actions use existing bounded authority;
- ordinary output is one plain result;
- no user prompt asks for controls, probes, thresholds, schemas, reviewers,
  commands, or adoption depth.

### Source and installed parity

- all required source assets exist;
- generic and platform starters receive the generic contract;
- installed projects can resolve and check reports;
- source-only fixtures do not become project evidence;
- Manifest and version records agree.

## Required Verification

```text
node --check for every new or changed script
control-effectiveness focused tests
evidence-authority tests
reconciliation and convergence tests
adoption-assurance tests
task-governance and plan-review tests
verification-plan and test-evidence tests
execution-assurance and completion-evidence tests
unified-closure / finish tests
Business Universe 1.108 regression tests
generated-project smoke tests
Manifest and active-guidance checks
npm run verify
git diff --check
```

Release evidence records command identity, exit code, and relevant output or
report path.

## Review Plan

Declare review surfaces before assigning reviewers:

- product contract and authority;
- claim/state model;
- evidence identity/freshness;
- scope and exclusions;
- semantic match;
- dynamic execution and probe safety;
- adoption integration;
- task/completion consumer integration;
- 1.108 and 1.109 coexistence;
- compatibility and installed parity;
- zero-experience UX;
- release claim precision.

P0 stops work. P1 is fixed before release. P2 is fixed or recorded as a bounded
follow-up. Repeated findings trigger systemic analysis, not another local patch.
Reviewer PASS without evidence refs remains advisory.

## IntentOS Principles Review

This plan was reviewed against current IntentOS goals.

### Findings resolved in this revision

1. **Duplicate 1.108 design (P1):** the initial draft repeated semantic-universe
   and consumer work already owned by 1.108. The duplicate was removed; 1.108
   is now a prerequisite and regression dependency.
2. **Control PASS treated as trust (P1):** IntentOS-native registration,
   project ownership, declared strictness, and proven effectiveness are now
   separate.
3. **Unsafe automatic probing (P1):** arbitrary commands and production probes
   are prohibited; dynamic proof requires a bounded adapter and existing
   authority.
4. **Excessive user judgment (P1):** technical routing, selection, proof, and
   remediation remain Codex-owned.
5. **Global audit overload (P1):** assessment is conditional and dependency
   driven; unrelated controls do not block the project.
6. **Parallel completion truth (P1):** the report is only an internal evidence
   source; Unified Closure remains final.
7. **State proliferation (P2):** five primary states plus reason codes replace a
   large parallel state machine.
8. **Overclaiming (P2):** effective control proof is explicitly not product,
   business, release, or production correctness.
9. **Over-broad high-risk routing (P2):** a high-impact control is assessed only
   when the current adoption or task claim relies on it; its mere presence does
   not trigger a project-wide audit.
10. **Checker side effects (P1):** resolver and checker are read-only; dynamic
    proof is executed only by the existing bounded execution orchestrator.

### Verdict

```text
PASS FOR IMPLEMENTATION PLANNING
```

Conditions:

1. finish and verify 1.108 and 1.109 before changing shared consumers for
   1.110;
2. re-read repository state at implementation start;
3. do not overwrite concurrent uncommitted changes;
4. do not weaken existing authority or blockers;
5. do not add an ordinary-user workflow or technical decision burden;
6. complete independent security and consumer-chain review before release.

## Stop Conditions

Stop implementation or release if:

- 1.108 or 1.109 is incomplete or shared-file ownership is unclear;
- another public workflow or final truth is created;
- project-specific rules enter core;
- control trust comes from name, age, docs, or PASS alone;
- evidence-provided arbitrary commands can run;
- a probe can affect production, real accounts, secrets, customer data,
  providers, or shared resources;
- project ownership is confused with effectiveness;
- partial proof can satisfy a full claim;
- technical uncertainty is delegated to the user;
- unrelated controls block every task;
- source and installed behavior diverge;
- P0/P1 findings remain;
- release claims exceed evidence.

## Allowed Claims After Acceptance

- IntentOS can distinguish IntentOS-native registration and project-native
  ownership from proven effectiveness.
- IntentOS can require current, scope-complete, semantically matched evidence
  before relying on an IntentOS-native or project-native control for a strict
  claim.
- IntentOS can reject stale, partial, mismatched, or unsafe control evidence.
- IntentOS can preserve stronger proven project-native controls without
  replacing project authority.
- IntentOS can propagate required control blockers through existing adoption
  and task close-out consumers.
- Ordinary users do not make technical control decisions.

## Forbidden Claims After Acceptance

- IntentOS proves every project control is correct.
- A proven control proves product or business behavior is correct.
- IntentOS continuously monitors every control without configured execution.
- IntentOS can safely run arbitrary project checks.
- Control effectiveness authorizes implementation, writes, release, or
  production.
- Project-native governance is automatically stronger than IntentOS.
- IntentOS discovers every project risk.
- A green control replaces business-universe, business-rule, impact,
  verification, review, runtime, or completion evidence.

## Completion Rule

The 1.110 release is complete only when source and generated-project evidence
prove:

```text
When an adoption or task claim relies on an IntentOS-native or project-native
control, IntentOS can identify the exact claim, verify its current
implementation, scope, semantic
strength, evidence identity, freshness, failure capability, result integrity,
and operational safety to the required level; reject insufficient proof;
preserve stronger effective project authority; propagate the blocker through
existing strict consumers; and give the ordinary user one plain result without
delegating technical decisions or creating another completion authority.
```
