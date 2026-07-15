# IntentOS 1.111.1 Active Guidance Responsibility Consistency Close-Out

## Status

Completed against the committed IntentOS `1.111.0` baseline. Acceptance
evidence is recorded in `releases/1.111.1/self-check-report.md`.

This is a patch-level governance close-out. It does not add a public workflow,
lifecycle stage, state machine, command, required artifact family, or execution
authority.

## Purpose

Make every current instruction that Codex can read, reference, generate, or
install enforce the same zero-experience solo-user responsibility contract.

The ordinary user states the real goal, unavailable business facts, product
preferences, and consent for a concrete prepared real-world effect. Codex owns
technical discovery, architecture, stack, baseline, implementation planning,
risk treatment, testing, review, evidence, repair, rollback preparation, and
the technical readiness recommendation.

## Problem

IntentOS already defines the correct contract in
`core/zero-experience-solo-operating-model.md`, but some effective guidance
still carries historical wording such as:

- humans decide while AI drafts or executes;
- structural engineering choices wait for generic human approval;
- architecture, dependencies, migration, testing, review, or release readiness
  are routed to the user as technical decisions;
- a generic risk label is treated as sufficient reason to stop for approval.

The existing Review Context Authority checker catches direct technical-choice
questions but misses several indirect, cross-line, table, and generic approval
forms. Because some affected files are installed into generated projects, this
is a distribution consistency defect rather than a documentation-only issue.

## Authority

This release follows these existing sources without replacing them:

- `core/zero-experience-solo-operating-model.md` for user and Codex roles;
- `core/product-baseline.md` for the solo-user product boundary;
- `core/review-context-authority.md` and
  `core/review-context-authority.json` for effective guidance;
- `core/decision-delegation-boundary.md` for allowed user-input classes;
- `core/claim-control.md` for bounded claims;
- `core/operating-model.md` for the single natural-language public entry;
- existing source systems for task, review, verification, apply, release, and
  completion authority.

## Responsibility Contract

### Codex-Owned Technical Work

Codex must determine and verify:

- project type, platform, profile, BL level, baseline, and industrial packs;
- architecture, stack, dependencies, schemas, migration design, and technical
  scope;
- task impact, review depth, subagent use, test strategy, tools, and evidence;
- technical risk treatment, implementation readiness, release readiness, and
  rollback preparation;
- reconciliation with stronger existing-project rules.

Missing technical evidence means more Codex work or a technical blocker. It is
not converted into a user choice.

### Permitted User Input

User-facing requests are limited to:

```text
NO_USER_ACTION
BUSINESS_FACT_NEEDED
REAL_WORLD_CONSENT_NEEDED
EXTERNAL_FACT_NEEDED
```

Product preferences between valid outcomes are represented as bounded business
input. Real-world consent is requested only after Codex has prepared one exact
effect, evidence, rollback information, and the plain consequence. External
legal, regulatory, provider, or third-party authority is never inferred from a
conversation claim.

### Compatibility Vocabulary

Historical fields such as `Human Approval`, `human_decision`, `owner`, or
`NEEDS_HUMAN_DECISION` may remain where removing them would break a schema or
installed-project compatibility contract. Current consumers and guidance must
interpret them through the four permitted user-input classes. A compatibility
label cannot delegate a technical decision or create approval authority.

## Implementation Scope

### 1. Current Mental Model

Rewrite `core/workflow.md` and `docs/mental-model.md` around the current single
`work` entry and existing source systems. Historical linear stages remain
historical context, not current instructions.

### 2. Effective Guidance Close-Out

Correct current Core, checklists, templates, Starter assets, Prompt references,
and generated text reached by the effective guidance graph when they delegate:

- architecture, stack, baseline, Profile, BL, or pack selection;
- test, reviewer, subagent, hook, checker, or workflow selection;
- reversible project-local technical work;
- technical risk treatment or release-readiness judgment.

Preserve exact consent for production effects, paid resources, real customer
notifications, provider actions, irreversible real-data effects, and other
prepared external consequences.

### 3. Semantic Enforcement

Extend Review Context Authority so it fails closed on:

- `Humans decide; AI drafts/executes` responsibility models;
- generic approval before code or technical changes;
- technical lists under human-decision headings;
- unknown technical risk routed to user confirmation;
- architecture, dependency, migration, verification, review, or release
  readiness routed to generic human judgment;
- generated or installed guidance that reintroduces these forms.

The checker must continue accepting bounded business facts, product
preferences, exact prepared real-world consent, and unavailable external facts.

### 4. Distribution And Version Consistency

Update current Review Context version, generated-project bindings, Manifest,
version sources, README summaries, release evidence, and documentation indexes.

## Non-Goals

- no six-stage lifecycle implementation;
- no new user-visible workflow or command;
- no removal of existing source systems;
- no schema-breaking rename of compatibility fields;
- no automatic project writes, apply, release, or production action;
- no claim that semantic consistency proves implementation or business
  correctness.

## Acceptance Plan

### Source Guidance

1. Every current effective guidance node passes the responsibility scan.
2. `core/workflow.md` and `docs/mental-model.md` describe the current Operating
   Model rather than a mandatory historical stage sequence.
3. Technical uncertainty remains Codex-owned.
4. Release readiness is a Codex conclusion; only a prepared external effect is
   presented for consent.

### Semantic Negative Cases

The checker must reject representative forms that split technical drafting from
generic human authority, gate ordinary code changes on blanket approval, route
architecture/dependency choices to the user, ask the user to resolve unknown
technical risk, or make the user judge technical release readiness.

### Semantic Positive Cases

The checker must accept:

```text
Codex selects the architecture and verifies it against project evidence.
The user states the refund policy when it is absent from authoritative sources.
Codex prepares the exact production action; the user consents to that effect.
An unavailable regulator or provider fact is recorded as external input needed.
```

### Generated Project

1. A newly initialized generic project passes Review Context Authority.
2. Installed workflow and mental-model assets preserve the current contract.
3. Runtime output does not ask the user to choose technical workflow details.
4. Compatibility labels do not become public technical decisions.

### Repository Verification

- focused Review Context and distribution tests pass;
- Manifest strict validation passes;
- source and generated-project guidance checks pass;
- IntentOS self-check passes;
- full `npm run verify` passes;
- `git diff --check` passes.

## Stop Conditions

Stop the release if:

- any current effective guidance delegates a technical decision to the user;
- generated assets differ from the source responsibility contract;
- a new public lifecycle, command, or source of truth is introduced;
- compatibility labels are interpreted as broad user authority;
- exact real-world consent is weakened or silently converted into technical
  approval;
- verification relies only on source text without generated-project evidence.

## Completion Claim

The release may claim only that current effective Codex guidance and generated
Codex assets are consistent with the zero-experience solo-user responsibility
contract for the checked forms. It may not claim absolute semantic,
implementation, business, release, or production correctness.
