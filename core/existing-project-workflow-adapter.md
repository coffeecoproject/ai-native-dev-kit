# Existing Project Workflow Adapter

Existing Project Workflow Adapter defines how Codex should connect AI Native
workflow concepts to an existing project that already has its own rules,
documents, gates, release flow, or production sensitivity.

It is not a bootstrap protocol. It does not install AI Native workflow assets,
change CI, modify hooks, overwrite agent rules, or approve code changes.

From 1.62 onward, this adapter is a diagnostic safety layer, not the preferred
end state when the user asks Codex to configure an existing project for
IntentOS. If the user asks to "adopt IntentOS", "configure yourself", "switch
into this workflow", or similar, Codex should use this adapter map as input to a
Native Migration Plan.

Machine-checkable boundary:

- The adapter does not install target-project workflow assets.
- The adapter does not change hooks or CI.
- The adapter does not approve implementation.

## Purpose

Use this protocol when a target project is already in progress, already
governed, production-sensitive, dirty, or has existing workflow assets that
should not be replaced.

The goal is to answer:

```text
What workflow already exists?
Which AI Native workflow pieces should be used?
Which existing project assets remain authoritative?
What can be added only after human approval?
What must not be touched?
```

## Default Rule

For existing projects, Codex must recommend a workflow adapter path before recommending file writes.

If the user wants IntentOS adoption, the next planning chain is:

```text
Workflow Adoption Map
Native Migration Plan
Unified Apply Plan
Controlled Apply Readiness
Approval Record
approved governance-file edits only
```

The Workflow Adoption Map is read-only by default. It maps existing workflow to
recommended AI Native usage. It does not authorize:

- target-project writes
- direct `init-project` or `--update-workflow-assets`
- CI, hook, release, rollback, PR template, or agent-rule changes
- implementation, repair, migration, production, permission, payment, security,
  privacy, compliance, finance, tax, or HR decisions

## Adapter Modes

| Mode | Meaning | Writes |
|---|---|---|
| `READ_ONLY_MAP` | Inspect and map existing workflow only | none |
| `DOCS_ONLY_BRIDGE` | Add an approved adapter document without changing gates or code | docs only, after approval |
| `THIN_OPERATIONAL_BRIDGE` | Add selected workflow references or scripts that point to existing authority | approved assets only |
| `BLOCKED_NEEDS_OWNER` | Ownership, risk, dirty worktree, or conflicting governance blocks adoption | none |
| `NOT_APPLICABLE` | The target is new, not a project, or is the dev-kit source repo | none |

## Existing Workflow Inventory

Codex should inventory existing assets before making recommendations:

| Area | Examples |
|---|---|
| Agent rules | `AGENTS.md`, `agent.md`, `.cursor`, `.claude`, `.codex` |
| Governance docs | `docs/governance`, baselines, risk policy, architecture, ADRs |
| Work intake | issues, PR template, task docs, request/spec/task folders |
| Review and evidence | session logs, review records, evidence docs, release notes |
| CI / gates | `.github/workflows`, guard scripts, test gates, quality gates |
| Release / rollback | release SOP, rollback docs, deployment workflow, runbooks |
| Hooks | husky, pre-commit, pre-push, scheduled or agent hooks |

Inventory is evidence. It does not mean Codex may modify those assets.

## Recommended AI Native Workflow Use

The adapter should map common situations to AI Native workflow pieces:

| Situation | Recommended AI Native workflow |
|---|---|
| New request or feature | Request / Spec / Task Card |
| Baseline or risk choice | Baseline Decision Card |
| Existing governance mapping | Workflow Adoption Map |
| Actual file-change boundary | Change Boundary Report |
| Complex repair or patch pressure | Patch Classification |
| Task completion review | Review Loop |
| Delivery or handoff | Safe Launch / Launch Readiness |
| Conversation scope drift | Conversation Turn Classification / Scope Change Report |
| Context correction | Context Governance / Context Correction Report |
| Long-running or interrupted work | Work queue / pause report when available |
| Stale or conflicting docs | Doc lifecycle report when available |
| Hook or CI changes | Hook orchestration plan when available |

If a later workflow is not yet installed or not yet available, the adapter must
say "recommended later" instead of pretending it exists in the target project.

## What To Reuse

Existing project authority remains primary unless a human explicitly approves an
adapter change. The adapter should reuse:

- existing agent rules
- existing engineering and environment baselines
- existing release, rollback, and incident process
- existing CI and gate scripts
- existing evidence and session records
- existing project-specific terminology and directory layout

## What To Add

Codex may recommend additions only as proposals:

- a `workflow-adoption-map` report
- a `native-migration-plan` report when the user asks to switch into IntentOS
- a docs-only adapter page
- selected report templates
- selected checker commands
- a reviewed plan for future bridge assets

The recommendation must name the exact files, owner, and approval needed before
anything is written.

## What Not To Touch

Codex must not overwrite, weaken, or bypass:

- `AGENTS.md`, `agent.md`, or platform agent rules
- existing PR templates, CI workflows, hooks, release gates, or guard scripts
- production, deployment, rollback, migration, seed, or database files
- secrets, environment files, credentials, certificates, tokens, or private keys
- customer data, raw production data, incident detail, regulated records, or
  private endpoints
- release evidence, audit evidence, historical session records, or signed-off
  reports

## Human Decision Boundary

Human approval is required before:

- writing adapter docs into the target project
- applying any workflow assets
- changing hooks, CI, gates, PR templates, or release process
- converting a recommendation into an implementation task
- using real project names in public evidence
- resolving conflicts between existing governance and AI Native governance

## Claims

Allowed:

- Existing workflow was inspected read-only.
- Existing assets were inventoried.
- A recommended AI Native workflow usage map was produced.
- Writes remain blocked until human approval.

Forbidden:

- The project is now AI Native configured.
- The adapter installed workflow assets.
- The adapter approved implementation, release, hooks, CI, or production.
- The adapter replaced the project's existing governance.
- The adapter is the final IntentOS-native migration state.
- The adapter proves production readiness or compliance.
