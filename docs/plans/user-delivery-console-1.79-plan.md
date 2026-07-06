# IntentOS 1.79 User Delivery Console Plan

## Purpose

1.79 adds a beginner-facing delivery status layer.

The problem is not that IntentOS lacks evidence gates. The task-completion chain
is already strong:

Business Rule Closure -> Change Impact Coverage -> Verification Plan -> Test
Evidence -> Execution Assurance -> Completion Evidence.

The problem is that ordinary users should not need to understand those internal
terms to ask:

- What am I building?
- Where are we now?
- Is this task done?
- Can this move toward launch review?
- What is missing?
- What decision do you need from me?
- What can Codex safely do next?

1.79 introduces a User Delivery Console that translates existing IntentOS
signals into one plain status card.

## Non-Goals

1.79 must not:

- add a new completion gate;
- replace Completion Evidence;
- replace Execution Assurance;
- replace Release Plan, Release Guide, Release Execution, or Launch Review;
- approve implementation, commit, push, release, production, CI, hooks,
  migrations, payment, permissions, security, privacy, compliance, or legal
  decisions;
- claim a product is complete, production-ready, or stable for real users;
- ask ordinary users to provide internal artifact refs.

## Product Shape

Add the following public entry:

```bash
node scripts/cli.mjs status <project> --intent "<what I want>"
node scripts/cli.mjs status-check <project>
```

The output artifact is:

```text
delivery-status-cards/
```

The card should be readable without knowing internal command names. Technical
trace can appear in a later section, but the user-facing sections must use plain
language.

## Required Assets

Core assets:

- `core/user-delivery-console.md`
- `docs/user-delivery-console.md`
- `templates/user-delivery-console-card.md`
- `checklists/user-delivery-console-review.md`
- `prompts/user-delivery-console-agent.md`
- `delivery-status-cards/.gitkeep`

Scripts:

- `scripts/resolve-user-delivery-console.mjs`
- `scripts/check-user-delivery-console.mjs`

Examples:

- `examples/1.79-user-delivery-console/README.md`
- `examples/1.79-user-delivery-console/appointment-app/delivery-status-cards/001-status.md`

Bad fixtures:

- `test-fixtures/bad/bad-user-delivery-console-internal-jargon/delivery-status-cards/001-bad.md`
- `test-fixtures/bad/bad-user-delivery-console-overclaim/delivery-status-cards/001-bad.md`
- `test-fixtures/bad/bad-user-delivery-console-too-many-decisions/delivery-status-cards/001-bad.md`

Release records:

- `releases/1.79.0/release-record.md`
- `releases/1.79.0/known-limitations.md`
- `releases/1.79.0/self-check-report.md`

## Console Model

The card has seven user-facing answers:

1. First version: what the user is trying to make.
2. Current state: where the work is now.
3. Task completion: whether the current task can be treated as complete.
4. Product readiness: whether the first product slice is usable or still
   incomplete.
5. Launch review: whether it can move toward launch review.
6. Missing items: what is blocking progress.
7. Safe next action: what Codex can do next without exceeding authority.

## Internal Inputs

The resolver may read existing files and may call lower-level read-only
resolvers. These systems remain authoritative for their own domain:

- First Slice / Beginner Entry
- Delivery Path
- Product Completeness
- Guided Closure / Unified Closure
- Completion Evidence
- Launch Review View
- Release Plan

The User Delivery Console is a derived view only. It must not drive execution or
override lower-level results.

## State Vocabulary

Use plain states:

- `NO_PROJECT`
- `IDEA_ONLY`
- `FIRST_VERSION_DEFINED`
- `IN_PROGRESS`
- `NEEDS_BUSINESS_RULE_CLARITY`
- `NEEDS_VERIFICATION`
- `NEEDS_COMPLETION_EVIDENCE`
- `TASK_DONE_WITH_EVIDENCE`
- `READY_FOR_LAUNCH_REVIEW`
- `BLOCKED_BY_HUMAN_DECISION`
- `BLOCKED_BY_RISK`

The state is a summary, not a new source of truth.

## User-Facing Language Rules

The first sections must not expose these terms:

- Business Rule Closure
- Change Impact Coverage
- Verification Plan
- Test Evidence
- Execution Assurance
- Completion Evidence
- Release Plan
- artifact refs
- schema
- digest
- strict flags

Allowed plain translations:

- Need is clear / not clear.
- Affected areas checked / not checked.
- Verification list ready / missing.
- Test/check evidence recorded / missing.
- Execution proof recorded / missing.
- Task can / cannot be treated as done.
- Can / cannot enter launch review.

Technical trace may list internal systems after the user-facing summary.

## Checker Rules

`check-user-delivery-console.mjs` must:

- require core assets in source repo and bootstrapped projects;
- require required report sections;
- reject internal jargon in user-facing sections;
- reject more than three human decisions unless state is high-risk, where five
  is the maximum;
- reject claims that the card writes files, approves implementation, approves
  commit/push, approves release/production, changes CI/hooks, replaces source
  systems, or proves real-user stability;
- require missing items and safe next action;
- require technical trace to explain source systems without making them user
  burden.

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-user-delivery-console.mjs
node --check scripts/check-user-delivery-console.mjs
node scripts/cli.mjs status . --intent "维护 IntentOS 普通用户交付状态"
node scripts/cli.mjs status-check .
node scripts/check-user-delivery-console.mjs examples/1.79-user-delivery-console/appointment-app
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

The release is accepted only if:

- generated status output is plain-language first;
- example status card passes;
- all bad fixtures fail for the intended reason;
- generated-project smoke includes the new target assets;
- manifest and workflow version assets include the new files;
- full verify passes.
