# Project Onboarding

## Purpose

Project onboarding turns a broad project idea into confirmed project context before the first implementation task.

It keeps the user in the business communication role while IntentOS/Codex owns
technical derivation, documentation, consistency, verification, and review.

## Principle

The user communicates business reality. IntentOS/Codex derives the technical
onboarding path and proves readiness.

The user may provide:

- the business goal and unavailable business facts;
- a product preference when more than one valid product outcome exists;
- exact consent for a prepared real-world action;
- an external fact that project evidence cannot prove.

IntentOS/Codex is responsible for:

- asking focused questions
- producing structured drafts
- keeping documents internally consistent
- deriving platforms, stack, baseline, risk treatment, and verification strategy
- classifying missing input through the four current user-input classes
- proposing the first vertical slice
- refusing to implement before onboarding is ready when context is missing

## When It Runs

Run project onboarding after `init-project.mjs` and before the first non-trivial feature.

It may also run again when the project changes category, target platform, architecture, risk level, or core business scope.

## Onboarding Levels

Use the lightest level that still makes the project safe to work on.

| Level | Use When | Required Minimum |
|---|---|---|
| O0 | Small existing repository, low-risk maintenance, or a narrow trial | `project-profile`, `tech-stack-strategy`, open decisions |
| O1 | Normal app or service project | full onboarding docs, first vertical slice, verification strategy |
| O2 | High-risk, multi-platform, regulated, production-sensitive, identity, payment, migration, or security-heavy work | full onboarding docs, risk policy, release policy, explicit approval gates |

Default to O1 for new projects. Codex may select O0 when project evidence proves
the work is narrow and low-risk. Select O2 when production sensitivity,
regulated data, identity, payment, migration, security, or equivalent risk is
present or cannot yet be ruled out.

## Required Outputs

The project should have these project-level documents:

```text
docs/project-onboarding.md
docs/project-profile.md
docs/tech-stack-strategy.md
docs/business-spec-index.md
docs/sample-policy.md
docs/onboarding-decisions.md
```

These documents are project facts, not shared workflow rules. They must not be promoted into `core/` unless they are proven to be generic and pass core purity review.

## Onboarding Flow

```text
Conversation
  -> AI onboarding draft
  -> bounded business or external input when required
  -> document update
  -> onboarding review
  -> first request card
```

## AI Interview Rules

AI should ask only the smallest useful set of questions at each step.

Do not ask the user to select a stack, baseline, platform Profile, risk treatment,
verification strategy, reviewer, or first technical slice. Codex derives these
from the goal and project evidence. Ask focused questions only for unavailable
business facts, product preferences, exact real-world consent, or external
facts.

If a required fact is missing, create a documented assumption with the exact
user-input class. Technical uncertainty routes to evidence gathering, stricter
review, or a blocked dependent action rather than user judgment.

## Completion Gate

Onboarding is ready when:

- project type is clear
- target platform or platforms are clear
- first user/problem area is clear
- selected technology strategy is evidence-backed or intentionally deferred
- high-risk boundaries and treatment are evidence-backed and reviewed
- verification strategy is defined enough for first work
- first vertical slice is identified
- unresolved inputs are classified and limited to the dependent action

If these are not true, the next step is more communication, not implementation.

## Stop Conditions

Stop only the dependent action when:

- an unavailable business fact changes the required behavior;
- a material product preference cannot be inferred from the stated goal;
- a prepared production, payment, external-account, real-user communication, or irreversible-data action needs exact consent;
- a legal, regulatory, provider, or other external fact cannot be proven;
- the technical route lacks sufficient evidence, verification, review, or rollback readiness.

Codex must not treat an assumption as fact, generate business-specific examples
as reusable templates, or implement directly from unresolved broad intent.

## Relationship To Later Workflow

Onboarding does not replace request, preflight, spec, eval, or task cards.

Onboarding creates the project context that later work reads before producing request cards, specs, evals, and tasks.
