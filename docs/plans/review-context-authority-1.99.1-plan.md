# Review Context Authority 1.99.1

## Purpose

Prevent current IntentOS reviews, generated projects, and future recommendations
from drifting back to historical multi-role language or asking a zero-experience
solo user to make technical decisions.

This release governs interpretation priority. It is not a wording-only patch,
does not add Solo/Team/Enterprise product modes, does not weaken technical
gates, and does not erase historical audit records or compatibility fields.

## North-Star Contract

The current product contract remains:

```text
one zero-experience solo user
  -> states the real business goal and unavailable business facts
  -> states product preferences
  -> consents only to a prepared, concrete real-world effect

IntentOS / Codex
  -> owns all technical judgment and internal workflow
  -> implements, tests, reviews, repairs, verifies, and prepares rollback
  -> asks no technical setup, role-selection, checker, or process question
```

Industrial depth describes the strength of engineering safeguards. It does not
imply an enterprise audience, a team topology, or extra people.

## Problem Statement

IntentOS 1.99.0 establishes the correct operating model, but the repository
still contains four kinds of information in the same review surface:

1. current product contracts and runtime rules;
2. active machine schemas with historical compatibility field names;
3. completed plans, examples, and release records retained for audit;
4. external review recommendations generated without a current-context header.

Without explicit precedence, a reviewer can incorrectly infer that historical
`owner`, `human approval`, or enterprise-style wording is still the current
user model. That can produce proposals for team modes, technical user choices,
or professional-owner delegation that conflict with IntentOS.

## Context Classes

Every interpreted asset or semantic source belongs to one class:

| Class | Meaning | May define current product direction? |
|---|---|---|
| `CURRENT` | current product contract, active runtime, active public/review entry, or current release | Yes |
| `COMPATIBILITY` | active machine shape retained so older artifacts remain readable | No; translate through current contract |
| `HISTORICAL` | completed plan, prior release record, old example, or audit log | No |
| `CONFLICTING` | content that contradicts the current contract without an explicit compatibility/history boundary | No; fail review-context validation |

Interpretation precedence is fixed:

```text
CURRENT_PRODUCT_CONTRACT
  > CURRENT_RUNTIME_AND_GATES
  > COMPATIBILITY_SCHEMA
  > HISTORICAL_RECORD
```

History can explain how IntentOS evolved. Compatibility can preserve artifact
readability. Neither may propose the current user model or override current
runtime safety behavior.

## Work Package A: Context Authority Registry

- add one machine-readable registry for current, compatibility, and historical
  path classes;
- record the current audience, responsibility contract, interpretation
  precedence, compatibility translations, and forbidden review inferences;
- classify exact current-release and current-plan exceptions before broad
  historical path rules;
- treat unclassified active runtime assets as current, but never silently treat
  a known historical path as current;
- report contradictory active guidance as `CONFLICTING`.

## Work Package B: Review Context Contract

- add one human-readable core contract matching the registry;
- require reviewer, GPT-review, and subagent-review entry prompts to state the
  current IntentOS version and zero-experience solo north star first;
- require reviewers to distinguish current findings from historical or
  compatibility observations;
- require every recommendation to pass a north-star alignment check;
- preserve technical review depth while translating internal responsibility
  domains into internal safeguards rather than people.

Review output must reject recommendations that:

- introduce Solo/Team/Enterprise setup modes;
- infer a multi-person product model from industrial capabilities;
- ask the user to choose architecture, stack, database shape, baseline, pack,
  test strategy, reviewer, subagent, hook, checker, or workflow command;
- ask the user to find internal release, security, data, or technical owners;
- treat compatibility field names as current public instructions;
- use historical release notes as authority for future product direction;
- broaden capability scope merely because an industrial safeguard exists.

## Work Package C: Public Information Architecture

- keep README focused on current use, current operating model, current safety
  boundary, and current documentation;
- move detailed historical release narration out of the public first-use path;
- link to `VERSION.md` and `releases/` for audit history;
- keep English and Chinese public contracts semantically aligned;
- do not expose internal context classes as choices the user must understand.

## Work Package D: Compatibility Translation

Machine fields such as `owner`, `release_owner_ref`, `cost_owner_ref`,
`reviewer`, or `human_decision` may remain where changing them would break
artifact compatibility. They must be interpreted as one of:

- the current conversation user's consent to one exact prepared effect;
- an authoritative external fact or provider/account capability;
- an internal responsibility domain used to select safeguards;
- a historical field with no current public instruction.

They must not be interpreted as a request to assemble a team.

## Work Package E: Consent And Authority Boundary

`CURRENT_CONVERSATION_USER` is a bounded confirmation identity, not universal
authority.

It may express consent only when the exact effect, evidence, expected impact,
and rollback or irreversibility are already stated. It does not prove:

- legal identity or legal/tax/compliance correctness;
- ownership of an external provider account;
- permission granted by a platform, employer, regulator, or third party;
- that passing technical gates authorizes production or release;
- that a statement such as “I am the boss, deploy now” bypasses the release
  evidence and rollback chain.

## Work Package F: Capability Scope Control

- distinguish safeguards required by the requested capability from unrelated
  industrial capabilities that merely exist in the repository;
- forbid reviewers from expanding product scope to activate every available
  pack, platform, provider, or risk surface;
- keep unavailable external facts scoped to the dependent capability;
- defer a richer required/recommended/deferred/not-applicable capability model
  unless implementation proves it is needed for this release.

## Work Package G: Generated And Existing Project Parity

- distribute the current review-context contract, registry, library, checker,
  and reviewer prompts to initialized and updated projects;
- ensure generated Agent governance points to the same solo operating model;
- ensure existing-project review consumes current project rules without using
  old owner wording to reintroduce technical user decisions;
- verify a generated project and a governed existing-project simulation with
  the same review-context checks.

## Implementation Assets

- `core/review-context-authority.md`
- `core/review-context-authority.json`
- `scripts/lib/review-context-authority.mjs`
- `scripts/check-review-context-authority.mjs`
- `tests/review-context-authority.test.mjs`
- `prompts/reviewer-agent.md`
- `templates/gpt-review-prompt.md`
- README and Chinese README current-entry consolidation
- Manifest source/target distribution entries
- self-check, package verification, and release evidence

## Acceptance Matrix

| Scenario | Required result |
|---|---|
| GPT proposes Solo/Team/Enterprise modes | rejected as north-star drift |
| reviewer infers teams from BL2 or industrial packs | rejected |
| reviewer asks user to choose architecture, baseline, tests, reviewer, or hook | rejected |
| active schema contains `release_owner_ref` | classified as compatibility semantics; public meaning is translated |
| prior release record describes human owners | classified as historical and cannot drive current recommendations |
| active prompt contradicts the solo contract without an explicit boundary | classified as conflicting and fails validation |
| user says “I am the boss, deploy now” | release preparation remains gated; no production authority is inferred |
| current user confirms one exact prepared external effect | consent can be recorded for that effect only |
| legal/provider authority is unresolved | current-user identity cannot satisfy it; only the dependent action stays blocked |
| industrial pack exists but task does not need its capability | no automatic scope expansion |
| generated new project is checked | same current context and reviewer rules are present |
| governed existing project is reviewed | stronger project rules remain, but technical decisions are not delegated to the user |
| English and Chinese public entry are inspected | same user responsibility and history boundary |

## Verification

- registry structure, classification precedence, and overlap checks;
- focused review-output regression tests for team-mode, owner-delegation,
  technical-choice, history-authority, and capability-inflation drift;
- consent-overreach tests for current-conversation-user identity;
- reviewer prompt and GPT prompt contract checks;
- README current-entry and history-boundary checks;
- generated-project distribution and installed checker execution;
- existing operating-loop, approval, apply, adoption, completion, baseline, and
  release suites;
- `node scripts/check-review-context-authority.mjs`;
- `node scripts/check-intentos.mjs`;
- `npm run verify`;
- `git diff --check`.

## Non-Goals

- no multi-user product modes;
- no organization or permission-management product;
- no removal of historical release evidence;
- no breaking rename of compatibility fields in this patch release;
- no weakening of apply, evidence, release, production, provider, or external
  authority checks;
- no new user-facing workflow command.

## Release Completion Rule

1.99.1 is not complete if it only changes README wording or one reviewer
prompt. The context registry, interpretation library, review checks, generated
project distribution, public entry, negative regressions, and self-check must
all enforce the same current product contract.
