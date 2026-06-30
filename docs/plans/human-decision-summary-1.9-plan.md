# Human Decision Summary 1.9 Plan

## Human Summary

This plan turns AI Native Dev Kit output from technical status reports into decision-ready guidance for humans. The goal is not to add a new governance layer. The goal is to make every important adoption, baseline, review, launch, and migration result answer: what is the conclusion, what can the human choose, what happens after each choice, what is recommended, and what AI must not do yet.

## Problem

Current workflow decisions are usually technically correct, but the human still has to interpret internal terms such as `READ_ONLY`, `BOOTSTRAPPED_WITH_PENDING_MIGRATION`, `BL1`, `adapter`, `migration report`, `patch classification`, and `CAN_WRITE_WORKFLOW_ASSETS`.

That creates a product problem:

- The human cannot quickly tell whether Codex should continue, stop, or only observe.
- The human cannot easily compare options.
- The human may approve a command without understanding what it changes.
- Correct read-only or adapter recommendations still feel vague.
- Different scripts and templates use different wording for the same decision shape.

The expected state is:

```text
AI reads technical state.
AI translates it into human choices.
Human only makes judgment decisions.
AI handles drafting, checks, reports, and implementation inside the approved boundary.
```

## Upgrade Name

Version theme:

```text
1.9.0 Human Decision Summary
```

Chinese name:

```text
人类决策摘要
```

Positioning:

```text
Output protocol upgrade, not a new governance layer.
```

## Non-Goals

This upgrade must not:

- add automatic real-project scanning
- change real-adoption read-only boundaries
- approve target-project writes
- weaken patch classification defaults
- change Risk Gate or Human Approval semantics
- make every task use heavier artifacts
- bind the dev kit to a specific private project
- replace existing governed project rules
- add external GPT/API automation
- force every project to install all workflow assets

## Core Output Contract

Every decision-heavy output should start with this section:

```md
## Human Decision Summary

Conclusion: <plain-language conclusion>

Recommended choice: <A/B/C/D>

Can AI continue now: yes / limited / no

What I need from you: <one focused confirmation>

Options:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A |  |  | Yes / No / Plan only | low / medium / high |  |
| B |  |  | Yes / No / Plan only | low / medium / high |  |

Recommended reason:

What happens if you do nothing:
```

Then preserve the existing detail sections:

```text
Current Status
What AI Can Do Safely
What AI Must Not Do
Technical Details
Audit Notes
Machine-readable Output
```

## Standard Decision Types

Use a small stable vocabulary so outputs are comparable.

| Decision type | Meaning |
|---|---|
| `CONTINUE_READ_ONLY` | AI may inspect, summarize, and draft read-only reports. |
| `WRITE_REVIEWABLE_PLAN` | AI may write a plan file, not apply it. |
| `APPLY_REVIEWED_PLAN` | AI may apply a plan that was already reviewed and approved. |
| `WRITE_ADAPTER_DOCS` | AI may write approved adapter/mapping docs only. |
| `APPLY_GOVERNANCE_MIGRATION` | AI may apply AGENTS.md or PR template governance only after explicit approval. |
| `START_FIRST_TASK` | AI may create or continue the first request/spec/eval/task chain. |
| `PAUSE_FOR_WORKTREE` | AI must stop until existing changes are reviewed. |
| `PAUSE_FOR_RISK_DECISION` | AI must stop until risk, release, migration, production, dependency, or architecture decision is made. |
| `DO_NOT_PROCEED` | AI should not continue this path. |

## Standard Option Sets

### New Project

| Option | Meaning | Recommended default |
|---|---|---|
| A | Read-only inspect only | No |
| B | Write init plan | Yes |
| C | Apply reviewed init plan | Only after review |
| D | Pause | When project path or platform is unclear |

### Existing Light Project

| Option | Meaning | Recommended default |
|---|---|---|
| A | Read-only assess | Yes when uncertain |
| B | Write adoption plan | Yes after project confirmation |
| C | Apply reviewed plan | Only after reviewing writes |
| D | Pause | When worktree or ownership is unclear |

### Governed / Production-Sensitive Project

| Option | Meaning | Recommended default |
|---|---|---|
| A | Keep read-only assessment only | Safe default |
| B | Write adapter docs only | Recommended when project owner wants durable mapping |
| C | Prepare plan for selected workflow assets | Later only |
| D | Do not adopt now | When risk or ownership is unclear |

### Bootstrapped Project With Pending Migration

| Option | Meaning | Recommended default |
|---|---|---|
| A | Pause and keep reports pending | Safe default |
| B | Review reports and manually merge | Recommended for strongly governed projects |
| C | Apply AGENTS.md migration flag | Only after explicit approval |
| D | Apply PR template migration flag | Only after explicit approval |

### Patch / Repair

| Option | Meaning | Recommended default |
|---|---|---|
| A | Safe local fix | Only when no high-risk surface is touched |
| B | Baseline-aligned hardcut | When existing rules clearly require replacement |
| C | Structural remediation | When root cause crosses layers |
| D | Human decision | When scope, risk, release, architecture, migration, permission, or production is involved |
| E | Do not patch | When patching would hide root cause or weaken gates |

## File Scope

### P0: Core Output Contract

These files define the common behavior:

- `core/output-protocol.md`
- `prompts/reporter-agent.md`
- `templates/human-status-report.md`
- `templates/decision-brief.md`
- `core/glossary.md`

Required change:

- add `Human Decision Summary`
- define option table rules
- require one recommended choice
- require "what happens if you do nothing"
- keep technical details below the decision summary

### P0: CLI Outputs

These scripts produce the most visible real-project feedback:

- `scripts/workflow-next.mjs`
- `scripts/start-project.mjs`
- `scripts/baseline-project.mjs`
- `scripts/init-project.mjs`

Required change:

- add decision-ready human output before technical fields
- keep `--json` stable
- keep `--format technical` available for automation
- make migration report output explain options instead of only showing apply commands

### P0: Adoption And Baseline Templates

These templates shape real project onboarding:

- `templates/adoption-recommendation-report.md`
- `templates/baseline-recommendation-report.md`
- `templates/adoption-assessment.md`
- `templates/existing-governance-map.md`
- `templates/real-adoption-trial-report.md`
- `templates/patch-classification-report.md`

Required change:

- add `Human Decision Summary`
- include options and recommended choice
- state whether AI can continue
- state whether project files are written
- keep current technical sections

### P1: Task, Review, Launch, And Drift Templates

These templates affect post-task feedback:

- `templates/review-loop-report.md`
- `templates/final-report.md`
- `templates/launch-readiness-report.md`
- `templates/conversation-turn-classification.md`
- `templates/scope-change-report.md`
- `templates/follow-up-proposal.md`
- `templates/plain-review-summary.md`
- `templates/customer-handoff.md`

Required change:

- make the next action decision-oriented
- separate current-task continuation from future work
- clearly show when AI can act now and when a human decision is required

### P1: Agent Prompts

These prompts guide Codex behavior:

- `prompts/bootstrap-agent.md`
- `prompts/goal-planner-agent.md`
- `prompts/baseline-setup-agent.md`
- `prompts/real-adoption-agent.md`
- `prompts/patch-classifier-agent.md`
- `prompts/reporter-agent.md`
- `prompts/reviewer-agent.md`
- `prompts/launch-readiness-agent.md`
- `prompts/conversation-router-agent.md`
- `prompts/project-onboarding-agent.md`

Required change:

- require decision-ready output
- require option comparison when there are multiple valid paths
- forbid reporting only raw internal state when asking for a user decision

### P1: Usage Docs

These docs tell users and Codex what to expect:

- `docs/operator-manual.md`
- `docs/first-hour.md`
- `docs/codex-usage.md`
- `docs/quickstart.md`
- `docs/mental-model.md`
- `docs/artifact-decision-tree.md`
- `docs/adoption-playbooks/new-project.md`
- `docs/adoption-playbooks/existing-light-project.md`
- `docs/adoption-playbooks/governed-project-read-only.md`
- `docs/adoption-playbooks/production-project-adapter.md`
- `docs/real-adoption-usage.md`

Required change:

- explain that real-project feedback must be decision-ready
- describe common options by project type
- clarify that humans should not need to interpret technical codes first

### P2: Checks And Fixtures

These files keep the behavior from drifting:

- `scripts/check-dev-kit.mjs`
- `scripts/score-output-quality.mjs`
- `test-fixtures/output-quality/`
- `examples/1.1-guided-adoption/`
- `examples/1.8-real-project-readonly/`

Required change:

- check core files mention `Human Decision Summary`
- add output-quality expectations for options and recommended choice
- add one golden example for each important scenario:
  - new project
  - existing light project
  - governed read-only project
  - bootstrapped pending migration
  - patch classification needs human decision

## Implementation Phases

### Phase 1: Define The Contract

Goal:

```text
Make Human Decision Summary an official output contract.
```

Work:

- update `core/output-protocol.md`
- update `prompts/reporter-agent.md`
- update `templates/human-status-report.md`
- update `templates/decision-brief.md`
- update `core/glossary.md`

Validation:

- `node scripts/check-dev-kit.mjs`
- `git diff --check`

### Phase 2: Upgrade Project Entry Outputs

Goal:

```text
Make start, baseline, workflow-next, and migration reports understandable to a non-technical decision maker.
```

Work:

- update `scripts/workflow-next.mjs` human output
- update `scripts/start-project.mjs` human output
- update `scripts/baseline-project.mjs` human output
- update `scripts/init-project.mjs` AGENTS.md / PR template migration reports
- keep JSON output stable

Validation:

- generated project smoke in `check-dev-kit`
- `node scripts/cli.mjs start <fixture>`
- `node scripts/cli.mjs baseline <fixture>`
- `node scripts/workflow-next.mjs <fixture>`
- migration report fixture checks

### Phase 3: Upgrade Adoption And Repair Artifacts

Goal:

```text
Make real adoption, governance map, and patch classification reports decision-ready.
```

Work:

- update adoption and baseline templates
- update real-adoption templates
- update patch-classification templates
- update examples

Validation:

- `node scripts/check-real-adoption-trial.mjs .`
- `node scripts/check-patch-classification.mjs .`
- `node scripts/check-fixtures.mjs`

### Phase 4: Upgrade Task Completion Outputs

Goal:

```text
Make review, launch, drift, final report, and follow-up outputs clear enough for human decision.
```

Work:

- update review loop, final report, launch readiness, conversation drift, scope change, follow-up, review summary, and handoff templates
- update relevant prompts
- update examples where needed

Validation:

- `node scripts/check-review-loop.mjs .`
- `node scripts/check-next-step-boundary.mjs .`
- `node scripts/check-launch-readiness.mjs .`
- `node scripts/check-conversation-drift.mjs .`
- `node scripts/check-fixtures.mjs`

### Phase 5: Add Guardrails And Evidence

Goal:

```text
Prevent future output drift back into technical-only feedback.
```

Work:

- extend `check-dev-kit.mjs`
- extend `score-output-quality.mjs` if needed
- add golden / bad fixture coverage
- add release evidence under `releases/1.9.0/`

Validation:

- `node scripts/check-dev-kit.mjs`
- `node scripts/check-fixtures.mjs`
- `git diff --check`

## Goal + Subagent Orchestration

Use a single main writer. Helper agents, if used, are read-only.

Recommended run plan:

| Role | Mode | Responsibility | Writes |
|---|---|---|---|
| Main agent | writer | integrate final changes, run checks, commit when approved | Yes |
| Output protocol reviewer | read-only | review `core/output-protocol.md`, reporter prompt, status templates | No |
| CLI output reviewer | read-only | review `workflow-next`, `start`, `baseline`, `init-project` output paths | No |
| Template reviewer | read-only | review templates for consistent decision summary sections | No |
| Fixture reviewer | read-only | check coverage and missing bad fixtures | No |

Closure rule:

```text
All helper agents must be CLOSED or SKIPPED before final response, commit, or push.
```

## Acceptance Criteria

The upgrade is complete only when:

- Every important human-facing output starts with `Human Decision Summary`.
- A non-technical user can decide from the first screen without reading raw fields.
- Each decision-heavy output includes 2-4 options when there is more than one valid route.
- Exactly one option is recommended, unless the safe answer is to pause.
- Each option says whether project files will be written.
- Each option states the risk level.
- Each blocked output says what happens if the human does nothing.
- `--json` outputs remain machine-readable and stable.
- `--format technical` still preserves raw engineering state.
- Checks and fixtures prevent obvious regression.
- No release wording claims production validation or automatic approval.

## Example Output Shape

### Governed Production-Sensitive Project

```md
## Human Decision Summary

Conclusion: This project should stay read-only for now. It already has production-sensitive governance, so AI should not install or overwrite workflow assets.

Recommended choice: B

Can AI continue now: limited

What I need from you: Confirm whether AI may write one adapter document that maps AI Native concepts to the existing project rules.

Options:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Read-only only | Summarize findings in chat | No | low | You only want assessment |
| B | Adapter doc | Draft one mapping document | Yes, docs only | medium | You want durable guidance |
| C | Workflow asset plan | Prepare a reviewed plan for selected assets | Plan only | medium-high | Governance owner wants deeper adoption |
| D | Pause | Stop adoption work | No | low | Ownership or risk is unclear |

Recommended reason: B keeps existing governance authoritative while making future AI collaboration clearer.

What happens if you do nothing: AI should remain read-only and not change the project.
```

### Bootstrapped Project With Pending Migration

```md
## Human Decision Summary

Conclusion: Workflow assets are updated, but AGENTS.md and PR template governance changes still need your decision.

Recommended choice: B

Can AI continue now: limited

What I need from you: Confirm whether to manually merge the proposed governance appendices or let AI apply them with explicit flags.

Options:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Keep pending | Leave migration reports as-is | No | low | You are not ready to decide |
| B | Manual merge | AI explains the reports; human or owner merges selected parts | Maybe, by human | medium | Existing governance is important |
| C | Apply AGENTS migration | AI applies the AGENTS.md appendix | Yes | medium | You approve agent rule changes |
| D | Apply PR template migration | AI applies the PR template appendix | Yes | medium | You approve PR checklist changes |

Recommended reason: B avoids accidental governance overwrite while still moving the migration forward.

What happens if you do nothing: `check-ai-workflow` may continue to report pending governance migration.
```

### Patch Classification

```md
## Human Decision Summary

Conclusion: This is not safe as a small patch because it touches API contract and release evidence.

Recommended choice: C

Can AI continue now: no

What I need from you: Confirm whether structural remediation scope is approved.

Options:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Safe local fix | Make only a narrow local change | Yes | high if misused | Not recommended here |
| B | Baseline hardcut | Follow an existing baseline replacement rule | Yes after task approval | medium | Existing baseline is explicit |
| C | Structural remediation | Prepare a remediation plan before code | Plan first | medium-high | Root cause crosses layers |
| D | Human decision | Stop until owner chooses scope | No | low | Scope or risk unclear |
| E | Do not patch | Reject patch route | No | low | Patch would hide root cause |

Recommended reason: C keeps the repair tied to evidence, rollback, and affected baselines.

What happens if you do nothing: AI should not patch the issue.
```

## Compatibility

This upgrade should be backward-compatible:

- Existing artifacts remain readable.
- Existing generated projects do not need immediate migration unless they want improved templates.
- JSON outputs should not change unless explicitly versioned.
- Technical outputs remain available.
- New output sections are additive.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Output becomes too long | Keep decision summary short; move details below. |
| Options sound like approval | Each option must state whether approval is required. |
| AI recommends risky actions too confidently | High-risk options must default to pause, plan, or human decision. |
| Checker becomes brittle | Check for required markers and examples first; avoid over-parsing prose. |
| Private project details leak into examples | Use sanitized project labels only. |
| Users think docs-only adapter is always safe | Mark docs-only writes as requiring approval in governed projects. |

## Open Decisions

Before implementation, decide:

1. Should `Human Decision Summary` be required in every template, or only decision-heavy templates?
2. Should `workflow-next --format human` include option tables by default, or only when blocked / guarded?
3. Should `start-project` and `baseline-project` share a common renderer to prevent drift?
4. Should `score-output-quality.mjs` enforce option tables, or should `check-dev-kit.mjs` only check markers?
5. Should this release be `1.9.0` or `1.8.2`?

Recommended answers:

1. Require it for decision-heavy templates first.
2. Include option tables when blocked, guarded, pending migration, or multiple paths are valid.
3. Yes, but only if the shared renderer stays small.
4. Start with `check-dev-kit.mjs` markers and add stricter output-quality fixtures later.
5. Use `1.9.0` because it changes the human-facing output contract across multiple entry points.

## Final Recommendation

Proceed with `1.9.0 Human Decision Summary` as a productization upgrade. Do it in phases, starting with the output contract and the four most visible scripts: `workflow-next`, `start-project`, `baseline-project`, and `init-project` migration reports.

Do not add a new governance layer. Make existing governance understandable enough that the human can make a clear choice.
