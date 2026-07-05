# Existing Project Workflow Adapter

This page explains how to use IntentOS in existing projects without
copying a second workflow system over the project.

## Human Summary

For an existing project, Codex should first map the project's current workflow:
agent rules, docs, gates, release process, evidence, hooks, and task flow. Then
it should recommend which IntentOS workflow pieces to use, which existing
assets stay authoritative, and what must not be touched.

The user should only make decisions such as "keep read-only", "allow a docs-only
adapter", or "pause". The user should not need to understand every script or
file path before Codex can explain the safe path.

From 1.62 onward, this map is not the final answer when the user says "configure
yourself", "use IntentOS here", or "switch this old project into the new
workflow". In that case, Codex should move from adapter mapping into a Native
Migration Plan.

## Commands

Generate a read-only recommendation:

```bash
node scripts/cli.mjs workflow-map ../existing-project
node scripts/resolve-existing-workflow.mjs ../existing-project
node scripts/resolve-existing-workflow.mjs ../existing-project --json
```

Check recorded workflow adoption maps:

```bash
node scripts/cli.mjs workflow-map-check .
node scripts/check-workflow-adoption-map.mjs .
```

`workflow-map` does not write target project files. It only prints a map.

Recorded maps live in `workflow-adoption-maps/` when a project decides to save
the recommendation for review. Saving a map still does not approve code changes
or workflow asset installation.

## Recommended Flow

```text
workflow-map
-> workflow adoption map report
-> if user wants IntentOS adoption, native-migration
-> human chooses native migration / docs-only / pause
-> optional reviewed plan
-> controlled apply only if approved
```

## What The Map Should Tell Codex

| Question | Expected answer |
|---|---|
| What project state is this? | new, light existing, governed, production-sensitive, dirty, or blocked |
| What workflow already exists? | agent rules, docs, gates, release process, evidence, hooks |
| What IntentOS workflows should be used? | request/spec/task, baseline decision, change boundary, patch classification, review loop, launch readiness |
| What should be reused? | existing authority and project-specific process |
| What can be added later? | only approved docs or selected bridge assets |
| What must not be touched? | CI, hooks, release, AGENTS, business code, data, secrets, production |

## User Choices

| Choice | Meaning | Writes |
|---|---|---|
| A. Read-only map | Keep the result as guidance only | No |
| B. Docs-only bridge | Save an approved adapter doc | Docs only |
| C. Thin operational bridge | Add selected reviewed assets that point to existing authority | Approved assets only |
| D. Pause | Stop until ownership or risk is clearer | No |
| E. Native migration plan | Use IntentOS as the planning workflow while preserving project authority | Plan only |

## Boundary

`workflow-map` is not `init-project`.

It does not:

- install `.intentos`
- install target-project workflow assets
- change `AGENTS.md`
- change PR templates
- change `.github/workflows`
- add hooks
- change hooks or CI
- approve code changes
- approve implementation
- approve production or release work
- replace a reviewed Native Migration Plan

If Codex wants to do any of those, it must present a separate reviewed plan and
wait for human approval.
