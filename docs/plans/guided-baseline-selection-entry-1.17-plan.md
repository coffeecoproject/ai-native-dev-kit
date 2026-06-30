# Guided Baseline Selection Entry 1.17 Plan

## Human Summary

1.17.0 should turn the baseline pack system into a guided entry that a non-specialist user can understand and approve.

This should happen after 1.16 deepens BL2 industrial packs.

Plain meaning:

```text
1.16 = make the industrial baseline content strong enough.
1.17 = make Codex explain the right baseline path in plain language.
```

The desired user experience:

```text
User gives Codex a project path, Git URL, or natural language idea.
Codex reads the project.
Codex classifies the project state and platform.
Codex recommends BL0 / BL1 / BL2 and the smallest pack set.
Codex explains the decision in plain language.
User confirms only business and risk decisions.
Codex proceeds only within the approved boundary.
```

## Dependency On 1.16

1.17 should not be implemented before 1.16 content is accepted.

Reason:

```text
A simple guided entry is useful only if the underlying pack rules are deep and concrete.
```

If 1.17 ships first, Codex may produce readable but under-supported recommendations. 1.17 should consume the strengthened industrial pack depth from 1.16.

## Problem

The current system can resolve standard and industrial baseline packs, but the result can still be too technical for normal users.

Users should not need to understand:

- `standard-baseline-packs`
- `industrial-packs`
- `BL0_LIGHTWEIGHT`
- `BL1_STANDARD`
- `BL2_INDUSTRIAL`
- selected profile ids
- selected-only checkers
- resolver mismatch details
- adoption modes
- migration reports

They only need to decide:

- What kind of project is this?
- Is there a backend?
- Is it production-sensitive?
- Is money, permission, customer data, or high-risk change involved?
- Should this be lightweight, standard, or industrial?
- May Codex write workflow/baseline files now?

## Goal

1.17.0 should add a guided baseline selection entry that produces a readable Baseline Decision Card.

The card should answer:

```text
I think this project is...
I recommend this baseline level...
I recommend these standard packs...
These industrial packs are only candidates...
These packs are deliberately not selected...
I need you to confirm...
I can safely do next...
I must not do...
```

The goal is not to hide governance. The goal is to translate governance into decisions a human can make.

## Non-Goals

1.17.0 must not:

- add new baseline pack content before 1.16 is complete
- promote industrial packs to stable
- make BL2 default
- select all packs by default
- approve target-project writes
- approve implementation
- approve release or production
- approve security, privacy, compliance, legal, payment, tax, finance, HR, or migration decisions
- replace project-specific governance
- overwrite existing governed project assets
- force backend for frontend-only or Mini Program projects
- turn guided recommendation into automatic execution permission
- require users to learn internal command names

## Core Principle

The guided entry must preserve this boundary:

```text
Codex recommends.
Human decides.
Workflow controls whether Codex may write.
Evidence controls whether BL2 can pass.
```

## User-Facing Output

The primary artifact should be:

```text
baseline-decision-cards/<id>.md
```

The card should be short enough for a user to read, but structured enough for scripts to check.

Recommended sections:

```text
## Human Summary
## Project State
## Platform And Scope
## Recommended Baseline Level
## Recommended Standard Packs
## Candidate Industrial Packs
## Not Selected
## Human Decisions Needed
## Safe Next Actions
## Boundary
## Evidence
```

## Plain Language Decision Model

The card should classify projects in terms users understand.

### Project State

| User-facing label | Internal meaning | Default behavior |
|---|---|---|
| New empty project | new project | Can propose initialization after human confirms. |
| Existing light project | existing project with low governance | Gap review before controlled apply. |
| Existing governed project | project already has rules | Read-only mapping first. |
| Production-sensitive project | deployed or high-risk project | Adapter-only unless controlled apply is approved. |
| Dirty worktree | uncommitted changes exist | Stop and ask how to handle current changes. |

### Baseline Level

| User-facing label | Internal level | Meaning |
|---|---|---|
| Lightweight | `BL0_LIGHTWEIGHT` | Basic structure and workflow; suitable for demos or small low-risk tools. |
| Standard | `BL1_STANDARD` | Normal project baseline; suitable for most serious projects. |
| Industrial | `BL2_INDUSTRIAL` | Stronger governance for production, customer data, permission, payment, or high-risk work. |

### Pack Categories

| User-facing label | Internal category |
|---|---|
| Platform baseline | primary platform standard pack |
| Backend/API baseline | backend standard or industrial pack |
| Environment baseline | environment standard pack |
| Management system baseline | internal admin standard or industrial pack |
| Data baseline | data-storage industrial pack when BL2 |
| Permission baseline | auth-permission industrial pack when BL2 |
| Payment/risk baseline | payment or high-risk industrial overlay |

## Expected CLI And Script Shape

1.17 may add a top-level guided command:

```bash
node scripts/cli.mjs baseline-decision <project>
```

Potential lower-level scripts:

```text
scripts/resolve-guided-baseline-selection.mjs
scripts/check-guided-baseline-selection.mjs
```

Potential assets:

```text
core/guided-baseline-selection.md
docs/guided-baseline-selection-entry.md
templates/baseline-decision-card.md
checklists/baseline-decision-review.md
prompts/baseline-decision-agent.md
baseline-decision-cards/.gitkeep
```

Names may be adjusted during implementation, but the concept should stay:

```text
one guided entry
one decision card
one checker
one prompt
one checklist
```

Do not create multiple overlapping entry layers.

## Inputs

The guided entry should read existing project signals before asking the user.

Inputs:

- `docs/project-profile.md`
- `docs/baseline-selection.md`
- `docs/baseline-evidence.md`
- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `.ai-native/version.json`
- `standard-baseline-packs/index.json`
- `industrial-packs/index.json`
- `profiles/`
- `package.json`, `pnpm-lock.yaml`, `vite.config.*`, `next.config.*`, `app.json`, `project.config.json`, `Package.swift`, `*.xcodeproj`, `build.gradle`, `settings.gradle`
- git state
- existing governance files such as `AGENTS.md`, `.github/workflows/*`, release SOPs, or local baseline docs

The guided entry should prefer evidence over assumptions.

## Outputs

The Baseline Decision Card should include:

### Human Summary

Example:

```text
I think this is an existing Web internal admin project.
I recommend BL1_STANDARD for now.
Do not enable BL2 until permission, payment, production, or data-risk scope is confirmed.
```

### Project State

Example:

```text
Project state: existing governed project
Why: AGENTS.md, CI workflow, release docs, and existing baseline files were detected.
Default adoption mode: read-only mapping first
```

### Platform And Scope

Example:

```text
Detected platform: Web + internal admin
Backend scope: unknown
Payment scope: not detected
Production sensitivity: possible, needs confirmation
```

### Recommended Baseline Level

Example:

```text
Recommended level: BL1_STANDARD
Why: This is a serious app surface, but BL2 needs confirmed high-risk scope and evidence.
```

### Recommended Standard Packs

Example:

```text
- web-runtime-standard
- internal-admin-standard
- environment-standard
```

### Candidate Industrial Packs

Example:

```text
Candidate only, not selected:
- web-app-industrial
- internal-admin-industrial
- auth-permission-industrial
- data-storage-industrial
```

### Not Selected

Example:

```text
- backend-api-standard: not selected until backend/API scope is confirmed.
- payment-value-transfer-industrial: not selected because payment/value transfer was not confirmed.
- high-risk-change-industrial: not selected because no high-risk change is currently requested.
```

### Human Decisions Needed

Keep this short.

Recommended limit:

```text
3 to 5 questions
```

Example:

```text
1. Is this project already serving real users?
2. Does this task include backend/API/database changes?
3. Does this task include permission, payment, finance, HR, tax, or irreversible data changes?
4. Do you want BL1 standard or BL2 industrial for this project phase?
5. May Codex write baseline files, or should it only produce a read-only report?
```

### Safe Next Actions

Example:

```text
- If you confirm BL1, Codex can prepare standard baseline files.
- If you confirm BL2, Codex must create a BL2 evidence gap report first.
- If this is production-sensitive, Codex must stay read-only until controlled apply is approved.
```

### Boundary

Must always state:

```text
This card does not approve target-project writes.
This card does not approve implementation.
This card does not approve release or production.
This card does not prove project evidence exists.
This card does not approve security/privacy/compliance/payment/migration decisions.
```

## Project Flow By Scenario

### New Project

Expected behavior:

```text
detect empty or new repo
-> ask platform and rigor questions
-> recommend standard packs
-> ask whether backend exists
-> ask whether BL2 is needed
-> create baseline plan after confirmation
```

Codex may propose initialization, but only after the user confirms.

### Existing Light Project

Expected behavior:

```text
read existing structure
-> produce baseline gap review
-> recommend smallest BL0/BL1 upgrade
-> avoid full overwrite
-> ask whether Codex may write baseline files
```

### Existing Governed Project

Expected behavior:

```text
read existing governance
-> produce governance map
-> recommend adapter/gap approach
-> no init/update by default
-> no workflow overwrite
```

### Production-Sensitive Project

Expected behavior:

```text
read only
-> classify as production-sensitive
-> recommend adapter-only
-> require human approval for controlled apply
-> never add blocking gates automatically
```

### Dirty Worktree

Expected behavior:

```text
stop
-> explain changed files
-> ask whether to continue read-only, create a plan, or wait
```

## Checker Rules

`check-guided-baseline-selection.mjs` should reject:

- missing Human Summary
- missing Project State
- missing Recommended Baseline Level
- missing Human Decisions Needed
- missing Boundary
- more than 5 human decision questions unless justified
- all standard packs selected by default
- all industrial packs selected by default
- BL2 treated as default
- backend forced for frontend-only or Mini Program projects
- industrial packs selected without BL2
- industrial packs selected without evidence gap
- write approval claimed by the decision card
- implementation approval claimed by the decision card
- release or production approval claimed by the decision card
- security/privacy/compliance/payment/migration approval claimed by the decision card
- existing governed project recommends overwrite
- production-sensitive project recommends direct init/update
- vague output with no concrete next action

## Examples

Add examples:

| Example | Purpose |
|---|---|
| `examples/1.17-guided-baseline-selection/new-miniprogram` | User has a new Mini Program idea; Codex asks backend and BL level questions. |
| `examples/1.17-guided-baseline-selection/new-web-admin` | New internal admin project; Codex recommends Web + admin + environment. |
| `examples/1.17-guided-baseline-selection/existing-light-web` | Existing project gets gap review, not full overwrite. |
| `examples/1.17-guided-baseline-selection/existing-governed-readonly` | Strongly governed project gets adapter recommendation. |
| `examples/1.17-guided-baseline-selection/production-sensitive` | Production project stays read-only. |
| `examples/1.17-guided-baseline-selection/dirty-worktree` | Dirty project stops before write actions. |
| `examples/1.17-guided-baseline-selection/bl2-candidate` | BL2 candidate asks evidence questions without activating BL2. |

## Bad Fixtures

Add bad fixtures:

- decision card selects all packs
- decision card defaults to BL2
- decision card forces backend for Mini Program
- decision card approves writes
- decision card approves implementation
- decision card approves release
- decision card claims production-ready
- decision card asks too many technical questions
- existing governed project recommends overwrite
- production-sensitive project recommends direct init/update
- BL2 candidate has no evidence gap
- dirty worktree continues without decision

## Goal And Subagent Orchestration

Use Goal Mode for implementation:

```text
Goal: Complete 1.17 Guided Baseline Selection Entry so users only make confirmation and risk decisions.
```

Suggested subagents:

| Subagent | Mode | Responsibility | Output |
|---|---|---|---|
| Project Signal Reader | read-only | Identify project state, platform, and risk signals. | Signal summary. |
| Pack Recommendation Reviewer | read-only | Compare standard and industrial candidate packs. | Pack recommendation review. |
| Human UX Reviewer | read-only | Check that output is understandable and not too technical. | Readability review. |
| Boundary Reviewer | read-only | Check write/release/security/payment boundaries. | Boundary risk report. |
| Fixture Reviewer | read-only | Propose good/bad fixture coverage. | Fixture matrix plan. |

Rules:

- Main thread remains the only writer.
- Subagents must not approve writes, implementation, release, production, or BL2.
- Subagents must close their run plans after use.
- Subagents may recommend findings, but the main thread owns final edits.

## Implementation Phases

### Phase 0: Confirm 1.16 Inputs

- Confirm 1.16 industrial pack depth docs exist.
- Confirm 1.16 checker rules pass.
- Confirm no industrial pack was accidentally promoted to stable.

### Phase 1: Decision Card Contract

- Add template.
- Add checklist.
- Add prompt.
- Add docs.
- Add baseline-decision-cards directory.

### Phase 2: Resolver

- Add guided resolver.
- Read project state, profiles, standard packs, industrial candidates, and adoption risk.
- Produce machine-readable JSON and human-readable text.

### Phase 3: Checker

- Add semantic checker for decision cards.
- Reject over-selection, over-approval, excessive technical questions, and unsafe project-state handling.

### Phase 4: CLI Entry

- Add `baseline-decision` or equivalent CLI command.
- Keep it read-only by default.
- The command may recommend write actions but cannot perform them.

### Phase 5: Examples And Fixtures

- Add good examples for new, existing, governed, production, dirty, and BL2 candidate scenarios.
- Add bad fixtures for unsafe decisions.

### Phase 6: Docs And Release

- Update README, quickstart, operator manual, reference docs, manifest, version assets, and release evidence.
- Run full verification.

## Acceptance Criteria

1.17 is complete only if:

- a user can understand the recommended baseline path without reading pack internals
- the decision card asks no more than 3 to 5 key human questions in normal cases
- Codex can distinguish new, existing, governed, production-sensitive, and dirty projects
- Codex can recommend BL0/BL1/BL2 without treating the recommendation as approval
- standard packs are recommended by platform and scope
- industrial packs remain candidate-only unless BL2 is explicitly confirmed and evidence exists
- backend remains optional until backend scope is confirmed
- existing governed projects default to read-only mapping
- production-sensitive projects do not get direct init/update recommendations
- checkers reject unsafe decision cards
- examples show the intended user experience
- bad fixtures prove unsafe shortcuts fail
- `node scripts/check-fixtures.mjs` passes
- `node scripts/check-dev-kit.mjs` passes
- `npm run verify` passes

## Output Quality Rules

The guided output should be:

- short
- concrete
- decision-oriented
- non-technical by default
- clear about what Codex can and cannot do
- clear about what the user must decide

Avoid:

- long internal rule dumps
- unexplained pack lists
- asking the user to choose scripts
- implying recommendations are approvals
- saying "everything is ready" when evidence is missing
- making BL2 sound like a quality badge

## Relationship To Current Commands

1.17 should not replace lower-level tools.

It should sit above:

```text
start
baseline
standard-baseline
baseline-packs
real-adoption
patch-classification
next
```

The guided entry should decide which lower-level path is appropriate, then explain the next safe action.

## Final Boundary

The 1.17 guided entry must keep the user's role simple:

```text
User decides what the project is, how much rigor is needed, and whether Codex may proceed.
Codex reads, recommends, explains, records, checks, and only acts inside the approved boundary.
```

This is the product direction:

```text
The system becomes more industrial.
The user experience becomes simpler.
```
