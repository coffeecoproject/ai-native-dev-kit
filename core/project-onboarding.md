# Project Onboarding

## Purpose

Project onboarding turns a broad project idea into confirmed project context before the first implementation task.

It exists to keep humans in the communication and decision role, while AI handles drafting, comparison, structuring, and consistency checks.

## Principle

Humans decide. AI drafts.

AI should not ask the human to manually fill a large set of files. AI should interview the human, propose options, draft project documents, identify open decisions, and ask for confirmation.

The human is responsible for:

- confirming product direction
- choosing between options
- approving risk boundaries
- approving technology choices
- accepting or rejecting assumptions
- approving when onboarding is ready for first request/spec/task work

AI is responsible for:

- asking focused questions
- producing structured drafts
- keeping documents internally consistent
- flagging missing decisions
- proposing the first vertical slice
- refusing to implement before onboarding is ready when context is missing

## When It Runs

Run project onboarding after `init-project.mjs` and before the first non-trivial feature.

It may also run again when the project changes category, target platform, architecture, risk level, or core business scope.

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
  -> human decisions
  -> document update
  -> onboarding review
  -> first request card
```

## AI Interview Rules

AI should ask only the smallest useful set of questions at each step.

Prefer decision prompts over blank-document requests:

- "Choose one of these two stack strategies" instead of "fill the stack document"
- "Confirm whether this is the first vertical slice" instead of "write a roadmap"
- "Approve these risk boundaries" instead of "write a risk policy"

If information is missing, AI should create a documented assumption and mark it as pending confirmation.

## Completion Gate

Onboarding is ready when:

- project type is clear
- target platform or platforms are clear
- first user/problem area is clear
- selected technology strategy is approved or intentionally deferred
- high-risk boundaries are approved
- verification strategy is defined enough for first work
- first vertical slice is identified
- unresolved decisions are listed with owners

If these are not true, the next step is more communication, not implementation.

## Stop Conditions

Stop and ask for human decision before:

- choosing a production technology stack
- committing to an auth, permission, data, payment, release, or regulated-data strategy
- treating an assumption as approved
- generating business-specific examples as reusable templates
- starting implementation from broad project intent

## Relationship To Later Workflow

Onboarding does not replace request, preflight, spec, eval, or task cards.

Onboarding creates the project context that later work reads before producing request cards, specs, evals, and tasks.

