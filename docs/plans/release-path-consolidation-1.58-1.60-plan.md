# 1.58-1.60 Release Path Consolidation and Handoff Plan

## Goal

Make IntentOS capable of guiding a beginner user from "I want to launch this project" to a controlled release path without requiring the user to understand internal release commands.

1.57 added Guided Release Adapter. It discovers a project's likely release shape and explains the missing release inputs.

1.58-1.60 should turn that into a complete release path:

```text
Natural language release intent
  -> unified release guide
  -> platform release recipe
  -> bounded release handoff pack
  -> human approval / external release system
  -> evidence and close-out
```

## User Outcome

A beginner user should be able to say:

```text
Help me launch this project.
```

Codex should:

- inspect the project release shape
- choose the correct release guidance path
- explain the first safe target in plain language
- ask only decision-level questions
- select a platform recipe when enough signals exist
- prepare a bounded handoff pack when enough release inputs exist
- run only explicitly allowed local-safe commands
- stop before production, stores, secrets, DNS, payment, migrations, and irreversible changes
- record evidence and unresolved decisions

The user should not need to know whether the internal flow is `release-adapter`, `launch-view`, `release-execution`, or a provider-specific pack.

## Non-Goals

This roadmap must not turn IntentOS into:

- a deployment platform
- a CI/CD installer
- a secret manager
- a production release owner
- an app-store submission owner
- a database migration runner
- a DNS/payment/permission/config mutation tool
- a replacement for project release SOPs
- a provider API executor
- a remote-state mutation tool

IntentOS can prepare, explain, verify, route, and run explicitly allowed local-safe steps. High-risk release decisions and remote release actions remain human-owned or external-release-system-owned.

## Architecture

```text
release-guide
  -> Release Adapter
  -> Platform Release Recipe
  -> Unified Closure / Launch Review View
  -> Structured Release Approval
  -> Release Handoff Pack
  -> Evidence / Close-out
```

The important rule is:

```text
release-guide is the user entry.
recipes are platform maps.
handoff packs are bounded runbooks and evidence packages.
human approval remains the release authority.
```

## Authority Model

The release path has two different orders:

User experience order:

```text
Natural language release intent
  -> Release Guide
  -> Release Adapter / Platform Recipe
  -> Unified Closure check
  -> Launch Review View
  -> Structured Release Approval
  -> Release Handoff Pack
  -> Human / External Release System
```

Authority order:

```text
Unified Closure + Launch Review View
  -> Structured Release Approval
  -> Recipe / Handoff Pack
  -> Human or External Release System
```

`release-guide` is an orchestration entry. It is not release authority.

## 1.58.0 Release Path Consolidation

### Purpose

1.58 should reduce command and concept sprawl by introducing a single release entry point.

Instead of asking users or Codex to choose between:

- `release-adapter`
- `launch-view`
- `release-execution`
- related checkers

1.58 introduces:

```bash
node scripts/cli.mjs release-guide <project> --intent "help me launch"
node scripts/cli.mjs release-guide-check <project>
```

### Scope

In scope:

- unified release guide command
- routing rules across adapter / launch-view / execution
- structured release approval requirement as a P0 gate
- assisted execution level split
- release evidence quality checks
- beginner-readable release guide card
- source examples and bad fixtures

Out of scope:

- provider-specific release recipes
- release handoff packs
- provider command execution
- production deployment automation
- CI/CD mutation
- secrets, DNS, stores, payment, database migration execution

### Release Guide Routing

`release-guide` should route by project state:

| Project state | Route |
| --- | --- |
| No release profile | Run or request Release Adapter |
| Release profile exists but closure is unknown | Request Unified Closure / Launch Review |
| Launch Review is not ready | Show missing launch items |
| Launch Review ready but no approval | Request structured release approval |
| Approval exists but no execution plan | Prepare Release Execution Protocol output |
| Execution plan exists | Show next safe action and stop conditions |

### Assisted Execution Levels

1.58 should replace broad `ASSISTED_EXECUTION` interpretation with explicit levels:

| Level | Meaning | Default owner |
| --- | --- | --- |
| `LOCAL_ASSIST` | local checks, local build, static validation | Codex may run after user approval |
| `PREVIEW_ASSIST` | preview or test deploy path | Codex may prepare, execution requires project SOP approval |
| `STAGING_HANDOFF` | staging release path | human or external system owns release action |
| `PRODUCTION_HANDOFF` | production deployment, customer rollout, store submission | human or external system only |

Production smoke must not be treated as a default Codex action. It can only be included when a project SOP explicitly says what is safe, read-only, and approved.

### Command Risk Classes

1.58 should avoid the broad phrase "low-risk command" as the source of authority. Release-related commands should be classified before they can appear in an execution or handoff record.

| Class | Meaning | Default |
| --- | --- | --- |
| `NO_RUN` | Codex must not run this command. | Default for unknown commands |
| `LOCAL_READ_ONLY` | Reads local files or local metadata only. | Codex may run after ordinary task approval |
| `LOCAL_BUILD` | Local build without publishing or uploading artifacts. | Codex may run after user approval |
| `LOCAL_TEST` | Local tests without remote writes or production access. | Codex may run after user approval |
| `PREVIEW_PREPARE` | Prepare preview artifacts or instructions without remote mutation. | Codex may prepare |
| `PREVIEW_EXECUTE_BY_HUMAN` | Preview deploy or upload that mutates remote state. | Human or external release system |
| `PRODUCTION_HANDOFF_ONLY` | Production deploy, store submit, migration, DNS, payment, config, permissions. | Human or external release system only |

Codex must not run commands that may contact provider APIs, upload artifacts, publish previews, mutate remote state, or trigger CI/CD unless the command is explicitly classified and approved by project policy.

### Structured Release Approval

1.58 should stop relying on broad text matches such as "approved" for release approval.

Approval records should require structured fields:

```text
Approval Type: RELEASE_APPROVAL
Approval Status: APPROVED | REJECTED | PENDING
Release Target: preview | staging | production | app-store | mini-program-review | custom
Approved Scope:
Approved By:
Approval Time:
Allowed Codex Actions:
Blocked Actions:
Evidence Path:
Expiry / Reconfirm By:
```

Free-form notes can exist, but they must not be the source of truth.

The checker should require:

- approval target matches the release-guide target
- approval scope matches allowed Codex actions
- approval has an expiry or reconfirmation point
- production, app-store, mini-program, migration, DNS, payment, permission, and production-config approvals are short-lived and human-owned

### Evidence Quality

1.58 should distinguish evidence visibility from evidence quality:

| Evidence type | Minimum quality |
| --- | --- |
| Release owner | named owner or explicit external release system |
| Rollback | path, owner, and restoration condition |
| Monitoring | dashboard/log/check path and owner |
| Environment | environment target and non-secret setup reference |
| Post-launch smoke | target level: local / preview / staging / production |
| Approval | structured approval record |

### Deliverables

- `docs/plans/release-path-consolidation-1.58-plan.md`
- `core/release-guide.md`
- `docs/release-guide.md`
- `templates/release-guide-card.md`
- `templates/release-approval-record.md`
- `checklists/release-guide-review.md`
- `prompts/release-guide-agent.md`
- `release-guides/`
- `scripts/resolve-release-guide.mjs`
- `scripts/check-release-guide.mjs`
- CLI entries: `release-guide`, `release-guide-check`
- source examples
- bad fixtures for unsafe approval, production Codex execution, weak evidence, and command sprawl regression

### Acceptance

- README / VERSION / package / manifest report `1.58.0`
- `release-guide` is the preferred release user entry
- release-guide can route to adapter / launch-view / execution without requiring user command knowledge
- broad `ASSISTED_EXECUTION` is replaced or wrapped by explicit assist levels
- release approval requires structured fields in strict mode
- release approval target, scope, and expiry are checked
- command risk classes are available and unknown commands default to `NO_RUN`
- production handoff cannot be assigned to Codex by default
- production smoke cannot be assigned to Codex without explicit project SOP authorization
- remote-state commands cannot run without explicit classification and approval
- release evidence quality is checked beyond file existence
- bad fixtures fail for:
  - unstructured approval
  - production deploy assigned to Codex
  - production smoke assigned to Codex without SOP
  - release evidence with only a placeholder file
  - remote mutation command presented as local-safe
- `npm run verify` passes
- `git diff --check` passes

## 1.59.0 Platform Release Recipes

### Purpose

1.59 should add platform release maps without executing provider commands.

Recipes answer:

```text
For this platform, what does a safe release path usually need?
```

They should not answer:

```text
Go deploy this project now.
```

### Scope

In scope:

- platform recipe registry
- platform detection to recipe matching
- recipe templates
- recipe checker
- platform-specific release prerequisites
- beginner explanation for each platform
- examples and bad fixtures

Out of scope:

- provider API calls
- app-store / mini-program upload automation
- production deploy commands
- secret validation
- live cloud console inspection

### Strict First Recipes

1.59 should avoid a broad but shallow platform catalog. The first strict set should be small enough to be complete.

| Strict recipe | Why |
| --- | --- |
| `web-hosted-preview` | Most common beginner web launch path; preview-first and lower risk. |
| `backend-api-handoff` | Forces migration, rollback, monitoring, and owner boundaries. |
| `mini-program-review-handoff` | Covers platform review and human-owned submission boundaries. |

Draft recipes can exist for:

- iOS TestFlight / App Store
- Android internal testing / Play Console
- internal admin rollout
- web server / container release

Draft recipes must not pass strict release recipe checks until their evidence, owner, rollback, monitoring, and platform constraints are complete.

### Recipe Family Targets

The long-term recipe registry may cover:

| Family | Examples | Initial status |
| --- | --- | --- |
| Web preview / hosted | Vercel, Netlify, Cloudflare Pages, Firebase Hosting | strict |
| Web server / container | Docker, VPS, reverse proxy, server process | draft |
| Mini Program | WeChat mini program preview, upload, review, release | strict for review handoff |
| iOS | local archive, TestFlight, App Store review | draft |
| Android | local bundle, internal testing, Play Console release | draft |
| Backend/API | migration review, deploy, rollback, health checks | strict for handoff |
| Internal admin | protected preview, role/access validation, audit-sensitive rollout | draft |

Each recipe should define:

- platform signals
- safe first target
- release targets
- required human decisions
- required project records
- build / test expectations
- environment references
- rollback requirements
- monitoring requirements
- release owner expectations
- post-release smoke expectations
- forbidden Codex actions
- evidence requirements
- bridge into Release Execution

### Recipe Format

Each recipe should be structured and human-readable:

```text
Recipe ID:
Platform Family:
Matched Signals:
Safe First Target:
Supported Targets:
Required Inputs:
Preflight Checks:
Human Decisions:
Codex Allowed Actions:
Codex Blocked Actions:
Required Evidence:
Rollback Requirements:
Monitoring Requirements:
Release Execution Bridge:
Known Limits:
```

### Recipe Selection

`release-guide` should choose recipes by confidence:

| Confidence | Behavior |
| --- | --- |
| High | select recipe and show why |
| Medium | suggest recipe and ask user to confirm |
| Low | show top candidates and ask one decision question |
| Conflict | stop and ask user to choose |

### Deliverables

- `core/platform-release-recipes.md`
- `docs/platform-release-recipes.md`
- `templates/platform-release-recipe.md`
- `checklists/platform-release-recipe-review.md`
- `prompts/platform-release-recipe-agent.md`
- `release-recipes/`
- `scripts/resolve-platform-release-recipe.mjs`
- `scripts/check-platform-release-recipe.mjs`
- CLI entries:
  - `release-recipe`
  - `release-recipe-check`
- strict recipe fixtures for `web-hosted-preview`, `backend-api-handoff`, and `mini-program-review-handoff`
- draft recipe fixtures for the remaining platform families
- examples for at least:
  - Web hosted preview
  - Mini Program review path
  - Backend/API production handoff

### Acceptance

- README / VERSION / package / manifest report `1.59.0`
- the three strict recipes are complete
- draft recipes are clearly marked draft and cannot pass strict checks
- recipe selection is confidence-based and explainable
- release-guide can consume a selected recipe
- recipes are read-only maps, not execution tools
- provider secrets are never requested or stored
- app-store, mini-program, DNS, payment, permissions, production config, and database migrations remain human-owned or external-system-owned
- bad fixtures fail for:
  - recipe that assigns production deploy to Codex
  - recipe that asks for secrets
  - recipe without rollback
  - recipe without monitoring
  - recipe without release owner
  - recipe that presents provider assumptions as certainty
  - draft recipe accepted as strict
- `npm run verify` passes
- `git diff --check` passes

## 1.60.0 Release Handoff Packs

### Purpose

1.60 should add bounded handoff packs that turn a selected recipe and structured approval into a controlled runbook and evidence package.

Handoff packs answer:

```text
Given this platform recipe and this approval, what exact steps can Codex help with, what must a human do, and what evidence must be recorded?
```

They must not become a release executor.

### Scope

In scope:

- handoff pack schema
- pack resolver
- pack checker
- pack examples
- strict owner assignment
- command risk classification references
- evidence capture requirements
- post-release close-out bridge

Out of scope:

- automatic production deployment
- automatic app-store / mini-program submission
- automatic database migration execution
- automatic DNS/payment/permission/production config mutation
- provider API integration
- secret handling

### Handoff Pack Types

Initial packs should be conservative:

| Pack | Mode |
| --- | --- |
| `web-hosted-preview` | `PREVIEW_ASSIST` |
| `web-hosted-production-handoff` | `PRODUCTION_HANDOFF` |
| `web-container-staging-handoff` | `STAGING_HANDOFF` |
| `mini-program-preview-handoff` | `PREVIEW_ASSIST` / `HUMAN_UPLOAD` |
| `mini-program-review-handoff` | `PRODUCTION_HANDOFF` |
| `ios-testflight-handoff` | `PRODUCTION_HANDOFF` |
| `android-internal-testing-handoff` | `PRODUCTION_HANDOFF` |
| `backend-api-release-handoff` | `PRODUCTION_HANDOFF` |

The first implementation does not need to support every provider command. It should prove the pack schema, owner boundaries, evidence capture, and handoff model.

### Pack Format

```text
Pack ID:
Recipe ID:
Release Target:
Execution Level:
Required Approval:
Required Inputs:
Preflight Steps:
Codex May Run:
Human Must Run:
External System Must Run:
Stop Conditions:
Evidence To Capture:
Rollback Evidence:
Monitoring Evidence:
Post-release Smoke:
Post-release Close-out:
Known Limits:
```

Default:

```text
Codex May Run: None unless explicitly allowed by structured approval, recipe policy, and command risk classification.
```

### Command Execution Rule

Codex may only run commands when all are true:

- command is explicitly listed in `Codex May Run`
- command is classified as `LOCAL_READ_ONLY`, `LOCAL_BUILD`, or `LOCAL_TEST`
- structured approval allows that action
- recipe policy allows that action
- no secret is required
- no production mutation is implied
- no provider API call, upload, preview publication, remote-state mutation, or CI/CD trigger is implied
- evidence output path exists or can be safely created
- stop conditions are clear

### Human-Owned Actions

These remain human-owned or external-system-owned by default:

- production deploy
- public customer rollout
- app-store submission
- mini-program review / release
- production database migration
- DNS changes
- payment changes
- permission changes
- production config changes
- secret setup
- rollback risk acceptance
- incident acceptance

### Deliverables

- `core/release-handoff-packs.md`
- `docs/release-handoff-packs.md`
- `templates/release-handoff-pack.md`
- `checklists/release-handoff-pack-review.md`
- `prompts/release-handoff-pack-agent.md`
- `release-handoff-packs/`
- `scripts/resolve-release-handoff-pack.mjs`
- `scripts/check-release-handoff-pack.mjs`
- CLI entries:
  - `release-handoff`
  - `release-handoff-check`
- examples for the initial pack types
- bad fixtures for unsafe execution

### Acceptance

- README / VERSION / package / manifest report `1.60.0`
- release-guide can bridge from adapter to recipe to handoff pack
- packs require selected recipe and structured approval
- packs distinguish Codex / human / external-system ownership
- production and store release packs default to handoff, not Codex execution
- `Codex May Run` defaults to none
- Codex may run only explicitly allowed local-safe steps
- evidence capture and post-release close-out are required
- bad fixtures fail for:
  - production deploy in `Codex May Run`
  - missing structured approval
  - missing release owner
  - missing rollback evidence
  - missing monitoring evidence
  - secret request
  - remote-state command in `Codex May Run`
  - app-store / mini-program release assigned to Codex
  - production migration assigned to Codex
- source examples pass
- `npm run verify` passes
- `git diff --check` passes

## Cross-Version Governance

### No Duplicate Authority

The release path must preserve a single decision chain:

```text
Unified Closure
  -> Launch Review View
  -> Structured Release Approval
  -> Release Guide
  -> Recipe
  -> Handoff Pack
```

Recipes and packs cannot become independent release authorities.

### Beginner UX Rule

The user-facing path should prefer:

```text
What I found
What is safe first
What is missing
What I can do
What you must decide
What happens next
```

over internal command explanations.

### Evidence Rule

Every release stage should record:

- source artifact
- selected target
- owner
- approval record
- required evidence
- missing evidence
- stop conditions
- known limits

### Drift Rule

If the user switches topics during release preparation, Codex should:

- preserve the current release-guide state
- create or update a work queue item
- explain the paused release state
- resume from the last recorded release guide / recipe / handoff pack

### Subagent Rule

Subagents may review release records, recipes, and handoff packs, but they must not own release approval or run release actions. Idle subagents must be closed before new execution delegation.

## Validation Plan

Each version should run:

```bash
node --check <new scripts>
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Each version should also include:

- at least one good source example
- at least three bad fixtures
- release record
- known limitations
- self-check report
- README / VERSION / package / manifest update
- docs index update
- scripts reference update
- checker reference update

## Review Plan

Before each release:

1. Read the plan and current docs.
2. Confirm no new release authority is introduced.
3. Confirm beginner-facing entry stays simple.
4. Confirm high-risk release actions remain human/external-system-owned.
5. Confirm examples prove intended flow.
6. Confirm bad fixtures prove safety boundaries.
7. Run verification.
8. Record release evidence.

## Success Definition

1.60 is successful when a beginner user can say:

```text
Help me launch this project.
```

and IntentOS can respond with:

- the likely release path
- the safe first target
- the selected platform recipe
- a bounded handoff pack
- what Codex can run
- what the human must approve
- what an external system must execute
- what evidence is required
- where the process stops

without letting Codex become the release owner or execute high-risk production actions by default.
