# Existing Project Workflow Adapter

This page explains how to use IntentOS in existing projects without
copying a second workflow system over the project.

## Human Summary

For an existing project, Codex should first map the project's current workflow:
agent rules, docs, gates, release process, evidence, hooks, and task flow. Then
it should recommend which IntentOS workflow pieces to use, which existing
assets stay authoritative, and what must not be touched.

Codex derives whether the safe next step is read-only mapping, a docs-only
bridge, a thin operational bridge, or a native migration plan. The user does
not choose scripts, migration depth, workflow assets, or technical risk routes.

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
-> when the stated goal requires IntentOS adoption, native-migration
-> Codex derives native migration / docs-only / pause from project evidence
-> bounded reviewed plan
-> controlled apply only after authority, rollback, and verification readiness
```

## What The Map Should Tell Codex

| Question | Expected answer |
|---|---|
| What project state is this? | new, light existing, governed, production-sensitive, dirty, or blocked |
| What workflow already exists? | agent rules, docs, gates, release process, evidence, hooks |
| What IntentOS workflows should be used? | request/spec/task, baseline decision, change boundary, patch classification, review loop, launch readiness |
| What should be reused? | existing authority and project-specific process |
| What can be added later? | only bounded docs or selected bridge assets whose authority, rollback, and verification are ready |
| What must not be touched? | CI, hooks, release, AGENTS, business code, data, secrets, production |

## Codex Routing Outcomes

| Outcome | Meaning | Writes |
|---|---|---|
| A. Read-only map | Keep the result as guidance only | No |
| B. Docs-only bridge | Save an authority-compatible adapter doc through controlled apply | Docs only |
| C. Thin operational bridge | Add selected reviewed assets that point to existing authority | Bounded assets only |
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

If the stated goal requires any of those, Codex must prepare a separate bounded
plan, reconcile project authority, prove rollback and verification readiness,
and proceed only within the resulting controlled-apply boundary. User input is
limited to a missing business fact, a product preference that cannot be
inferred, exact consent for a prepared real-world effect, or an unavailable
external fact.
