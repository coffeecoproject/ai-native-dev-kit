# IntentOS 1.104.1 Active Guidance Semantic Hardcut Plan

## Status

Approved for implementation.

## Theme

Product-contract execution consistency for one zero-experience solo user.

## Problem

IntentOS already assigns architecture, profile, baseline, industrial-pack,
verification, review, and internal workflow decisions to Codex. Some active
guidance, generated Agent assets, prompts, and runtime decision cards still ask
the user to confirm those technical choices.

This creates a P1 contract defect:

```text
current product contract says Codex decides
-> active runtime asks the user to approve the technical decision
-> the user cannot safely judge it
-> adoption or implementation stalls or drifts
```

The existing semantic checker detects direct statements such as "the user
should choose the architecture" but misses questions, menu options, table
labels, generic approval slogans, and indirect confirmation requirements.

## Product Contract

The public user remains one zero-experience solo developer. The user supplies:

- the business goal;
- a business fact or product preference that project evidence cannot establish;
- consent to one prepared concrete real-world effect;
- an external fact that code and project evidence cannot prove.

Codex owns technical discovery, recommendation, selection, internal approval,
implementation, verification, review routing, repair, and close-out inside the
requested boundary.

## Canonical User-Decision Classes

Every current user-facing decision must resolve to exactly one class:

- `NO_USER_ACTION`: Codex continues or repairs the technical work.
- `BUSINESS_FACT_NEEDED`: one unavailable business rule or product preference is required.
- `REAL_WORLD_CONSENT_NEEDED`: one prepared external effect needs exact consent.
- `EXTERNAL_FACT_NEEDED`: a legal, tax, compliance, provider, account, or third-party fact is unavailable.

Profile, architecture, stack, BL level, baseline, industrial pack, test strategy,
reviewer, subagent, hook, checker, workflow state, and technical risk treatment
must never be represented as user-decision classes.

## Scope

### 1. Authority Contract

- version and bind the four canonical decision classes;
- keep compatibility owner and approval fields readable;
- define technical confirmation as an active-guidance conflict;
- preserve bounded real-world consent and external-fact rules.

### 2. Active Guidance

Audit and correct:

- `docs/first-hour.md` and other registered public entry guidance;
- every registered prompt under `prompts/`;
- `platforms/codex/AGENTS.template.md`;
- all four starter `AGENTS.md` files;
- installed review-context assets.

### 3. Runtime Output

Correct public output from:

- `scripts/start-project.mjs`;
- `scripts/workflow-next.mjs`;
- platform and industrial baseline recommendations exposed by those entries.

Runtime output may show the chosen technical recommendation and its evidence.
It must not present profile, BL, pack, technical risk, or workflow routing as a
menu for the user.

### 4. Semantic Enforcement

Expand active-guidance analysis to detect:

- direct technical delegation;
- technical confirmation questions;
- menu/table instructions that ask the user to select technical controls;
- generic slogans such as `AI drafts. Humans decide.` when they make technical
  responsibility ambiguous;
- BL2, profile, baseline, pack, and Risk Gate approval requirements that are
  not tied to a concrete real-world effect;
- installed or generated assets that regress to the old responsibility model.

The checker must not reject explicit prohibitions, historical/compatibility
records, internal technical review, project-evidence reconciliation, or exact
real-world consent.

## Required Implementation

1. Update `core/review-context-authority.json` and its documented contract.
2. Harden `scripts/lib/review-context-authority.mjs` semantic rules.
3. Expand `scripts/check-review-context-authority.mjs` positive and negative cases.
4. Add focused Node tests for prose, questions, menus, tables, and negation.
5. Rewrite current entry guidance, prompts, Agent template, and Starter agents.
6. Rewrite runtime cards so Codex selects and the user sees only business or
   real-world consent questions.
7. Verify installed-project parity after initialization and workflow update.
8. Synchronize version, manifest, templates, documentation, and release evidence.

## Compatibility

- existing schemas may retain `human_approval`, `owner`, and similar fields;
- historical artifacts remain readable;
- current consumers translate compatibility fields through the four decision
  classes;
- this patch does not authorize implementation, apply, commit, push, release,
  production, provider, payment, migration, secret, or irreversible actions;
- stronger project-native technical rules remain enforceable, but Codex must
  evaluate them rather than asking a zero-experience user to approve them.

## Non-Goals

1.104.1 does not:

- weaken evidence, Runtime Trust, apply, completion, or release gates;
- infer missing business, legal, provider, or compliance facts;
- convert silence into consent;
- remove exact consent for production, cost, real-user communication, external
  accounts, or irreversible data effects;
- implement 1.105 release topology;
- introduce a new public command, artifact family, state machine, or user mode.

## Acceptance Matrix

### Source Contract

- every registered active-guidance source passes the hardened semantic checker;
- known indirect technical-delegation phrases fail;
- explicit safety negations and valid real-world consent phrases pass;
- the four decision classes are exact and version-bound.

### Agent And Prompt Distribution

- the Codex Agent template and four Starter agents contain no technical-user
  confirmation requirement;
- onboarding and bootstrap prompts ask only for business facts, product
  preferences, concrete effects, or external facts;
- a generated project and an updated project retain the same responsibility model.

### Runtime Output

- platform and industrial baseline paths render a Codex recommendation and next
  automatic action rather than a technical choice menu;
- no output asks the user to confirm Profile, BL, Pack, test, reviewer, or
  internal approval scope;
- dirty worktree and real external effects retain plain-language stop behavior.

### Regression

- `node scripts/check-review-context-authority.mjs .` passes;
- focused review-context tests pass;
- source self-check and generated-project smoke pass;
- `npm run verify` passes;
- `npm run verify:release` passes;
- `git diff --check` passes.

## Forbidden Claims

- all human consent is unnecessary;
- passing semantic guidance proves business correctness;
- Codex may invent external facts or authorize production;
- a technical recommendation alone authorizes project writes or release;
- compatibility fields have been removed from historical evidence.

## Exit Condition

1.104.1 is complete only when the product contract, active instructions,
generated Agent assets, runtime output, and semantic checker all agree that the
user communicates business reality while IntentOS and Codex own technical
judgment.
