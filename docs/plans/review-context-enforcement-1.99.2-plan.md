# Review Context Enforcement 1.99.2

## Purpose

Close the remaining enforcement gap in Review Context Authority without adding
another workflow system or changing the zero-experience solo product model.

IntentOS 1.99.1 defines which sources may influence current product direction.
This patch makes that contract fail closed for unclassified semantic authority,
detects direct contradictory guidance on active public/reviewer/Agent surfaces,
and binds newly generated review inputs to the current context contract.

## North-Star Contract

```text
one zero-experience solo user
  -> communicates business goals, unavailable business facts, preferences,
     and consent to one prepared concrete real-world effect

IntentOS / Codex
  -> owns technical judgment, implementation, testing, review, repair,
     verification, rollback preparation, and internal workflow
```

This release must not add Solo/Team/Enterprise modes or contexts. Explicit
collaborator information in an existing project remains project evidence, not a
product mode and not a technical choice for the user.

## Problem Statement

1.99.1 leaves three bounded gaps:

1. an unknown path currently falls back to `CURRENT`, which can give a new
   semantic document authority without explicit classification;
2. `CONFLICTING` is part of the documented model, but active guidance is not
   yet scanned for direct contradictory assertions;
3. reviewer prompts receive the current context, but a generated Review Packet
   does not carry a stable contract identity and digest.

## Work Package A: Fail-Closed Classification

- return `UNCLASSIFIED` for paths that do not match an explicit exact or prefix
  rule, and for any runtime asset that is not explicitly registered when it is
  interpreted as product-direction guidance;
- keep known runtime, template, schema, history, and release paths classified
  by the registry;
- require every active semantic guidance surface to be listed explicitly;
- fail the context checker when a required active guidance path is missing,
  unclassified, or not `CURRENT`;
- keep non-semantic unclassified files from becoming product authority.

## Work Package B: Active-Guidance Conflict Detection

- scan only registered public, reviewer, GPT, Agent, and current core guidance;
- reject direct positive assertions that reintroduce user technical choices,
  team/enterprise modes, team requirements inferred from industrial depth, or
  universal current-user release/production authority;
- do not treat examples of forbidden wording or explicit negative rules as
  conflicts;
- classify a current active-guidance source as `CONFLICTING` when a supported
  direct contradiction is found;
- preserve the limitation that deterministic scanning does not replace
  semantic review.

## Work Package C: Targeted Review Context Binding

- define one stable contract ID and one digest derived from the current product
  contract, precedence, compatibility translation, forbidden inferences, and
  authority boundaries;
- add the binding only to Review Packet and GPT Review Prompt inputs;
- make `new-workflow-item` populate the binding automatically;
- validate a present binding and reject stale or mismatched values;
- keep legacy review packets readable and report missing binding as legacy
  compatibility rather than invalidating completed historical reviews.

This work must not add context fields to test evidence, execution assurance,
completion evidence, apply, adoption, or release schemas. Those artifacts
already have task, intent, project, Git, source, and approval identity chains.

## Work Package D: Distribution And Verification

- distribute the updated registry, library, checker, templates, and generator;
- verify source layout and an initialized project layout;
- generate a real Review Packet and GPT Review Prompt in a disposable project
  and verify that both carry the exact installed context binding;
- add negative tests for unknown-path authority, stale binding, and direct
  contradictory active guidance;
- preserve Manifest, version, and public-entry consistency.

## Acceptance Matrix

| Scenario | Required result |
|---|---|
| unknown semantic document is inspected | `UNCLASSIFIED`; it cannot define current direction |
| registered current guidance is inspected | `CURRENT` |
| old release or completed plan is inspected | `HISTORICAL` |
| schema compatibility field is inspected | `COMPATIBILITY` |
| active guidance says the user must choose architecture | `CONFLICTING`; checker fails |
| active guidance says BL2 requires a team | `CONFLICTING`; checker fails |
| guidance prohibits team modes or technical choices | remains valid current guidance |
| new Review Packet is generated | exact contract ID, version, and digest are populated |
| new GPT Review Prompt is generated | same exact binding is populated |
| review binding has a stale digest | validation fails |
| legacy packet has no binding | remains readable; cannot be claimed as newly bound |
| generated project runs the installed checker | PASS on the same contract digest |

## Verification

- `node scripts/check-review-context-authority.mjs`
- `node --test tests/review-context-authority.test.mjs`
- generated-project Review Packet and GPT Review Prompt binding smoke test
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

## Non-Goals

- no 2.0 architecture rewrite;
- no Solo/Team/Enterprise mode or context;
- no global artifact context binding;
- no compatibility-field rename;
- no new user-facing command;
- no change to implementation, apply, release, or production authority;
- no capability projection expansion in this patch.

## Completion Rule

1.99.2 is complete only when unknown semantic authority fails closed, direct
contradictory active guidance is rejected, newly generated review inputs carry
the current contract binding, generated projects enforce the same behavior,
and the full repository verification passes on the final source snapshot.
