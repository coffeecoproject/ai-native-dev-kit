# Hook Orchestration Governance

Hook Orchestration Governance controls automatic triggers.

A hook is:

```text
when something happens -> run a check or action
```

Examples:

- task completed -> run review checks
- before commit -> run formatting or lint checks
- before push -> run tests
- pull request opened -> run CI
- release requested -> run launch readiness checks
- daily schedule -> summarize AI logs

## Core Rule

Hook orchestration is plan-first.

Codex may recommend, classify, and check hook plans. Codex must not automatically install hooks, modify CI, add blocking gates, call external reviewer APIs, or change release behavior.

## Risk Levels

`H0_AUTO_READ_ONLY`

Codex may run this automatically because it is read-only, local, non-blocking, and does not change project files.

Examples:

- run an existing checker
- inspect workflow state
- print a recommendation

`H1_AUTO_SUGGESTION`

Codex may generate a suggestion or plan automatically. The suggestion itself is not permission to install or execute a persistent hook.

Examples:

- propose a task-complete review check
- propose a local pre-push check
- produce a Hook Orchestration Plan

`H2_REQUIRES_CONFIRMATION`

Non-blocking hook installation or project-file changes require controlled apply,
rollback, and verification. They do not require the user to judge hook mechanics.

Examples:

- install a local Git hook
- add Husky / Lefthook / pre-commit config
- add a non-blocking workflow step

`H3_EXPLICIT_APPROVAL_REQUIRED`

Blocking, external, release-related, CI-changing, API-calling, or writing hooks
require strict internal review and a rollback plan. A prepared external effect
also requires exact user consent.

Examples:

- change `.github/workflows`
- add a blocking CI gate
- call GPT / external APIs automatically
- run auto-fix code after a hook
- block release or production promotion

## What Codex May Do Automatically

Codex may automatically:

- run read-only checks
- inspect existing hook and CI files
- classify hook candidates
- generate a Hook Orchestration Plan
- explain risk and tradeoffs
- list bounded user input only when a real-world or external fact is required

## What Requires Controlled Apply Or Exact Consent

Codex must stop the dependent action until controlled readiness exists for:

- installing Git hooks
- changing `.github/workflows`
- changing CI or release scripts
- adding a blocking gate
- adding a scheduled job
- adding external API calls
- storing tokens or secrets
- enabling auto-fix
- treating hook output as human approval

## Plan-First Requirements

A Hook Orchestration Plan must include:

- current hook / CI inventory
- candidate triggers
- candidate actions
- H0/H1/H2/H3 level
- whether the candidate writes files
- whether the candidate blocks work
- whether it calls external services
- the applicable internal evidence authority and real-world-consent class
- rollback / disable plan
- boundary statement

## Boundary

Every Hook Orchestration Plan must state:

- This plan installs hooks: No
- This plan modifies CI: No
- This plan adds blocking gates: No
- This plan calls external APIs: No
- This plan changes target-project files: No
- This plan enables auto-fix: No
- This plan approves implementation, release, or production: No
- This plan treats hook output as human approval: No
