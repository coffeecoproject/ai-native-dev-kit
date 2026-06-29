# Workflow Adoption Map Review

Use this checklist before treating a Workflow Adoption Map as ready.

## Structure

- Human Decision Summary is present.
- Existing Project Signals are concrete.
- Existing Workflow Inventory names actual assets or explicitly says missing.
- Recommended AI Native Workflow Use covers request/spec/task, baseline
  decision, change boundary, patch classification, review loop, launch
  readiness, drift, context correction, doc lifecycle, work queue, and hook plan
  routing.
- What To Reuse preserves existing authority.
- What To Add is proposal-only.
- What Not To Touch names CI, hooks, release, agent rules, data, secrets, and
  production-sensitive surfaces.
- Human Decisions Needed is explicit.
- Boundary says target writes, CI, hooks, implementation, release, production,
  and high-risk decisions are not approved.

## Safety

- The report does not say workflow assets were installed.
- The report does not run or approve `init-project` / `--update-workflow-assets`.
- The report does not approve changing `AGENTS.md`, PR template, CI, hooks, or
  release workflow.
- The report does not approve business-code changes.
- The report does not claim production readiness or compliance.
- Dirty worktree, production, release, migration, secrets, data, payment,
  security, privacy, tax, HR, and permission signals stop for human approval.

## Human Decision

- The recommended option is understandable to a non-technical user.
- The recommended option says whether project files will be written.
- If writes are proposed later, exact scope and owner are named.
- If ownership is unclear, outcome is `NEEDS_HUMAN_DECISION` or `BLOCKED`.
