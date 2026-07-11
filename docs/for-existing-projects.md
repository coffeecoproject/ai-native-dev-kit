# For Existing Projects

IntentOS is useful for old projects, but it should not be copied in as a parallel governance system.

The correct posture is:

```text
Codex works under IntentOS immediately.
Project assets change only after comparison and approval.
```

## What This Means

Codex may use IntentOS to:

- understand the project state;
- route tasks;
- classify risks;
- review changes;
- compare rules;
- prepare migration and apply plans;
- produce evidence and close-out records.

Codex must not automatically replace:

- `AGENTS.md`;
- CI workflows;
- hooks;
- baseline docs;
- release SOPs;
- rollback procedures;
- production config;
- guard scripts;
- business rules;
- secrets.

## First Commands

```bash
node scripts/cli.mjs work <project> "让这个老项目按 IntentOS 工作"
```

The Operating Model selects the adoption sources and returns a read-only
recommendation. It should not write a plan file, apply workflow assets, install
`.intentos/`, or claim that the project is adopted.

Maintainers may use `adopt`, `native-migration`, `reconcile-rules`,
`convergence`, and `adoption-assurance` directly through `--help-advanced` when
they need exact source evidence. The user does not choose those stages.

If the project is governed, dirty, already online, or production-sensitive,
these commands should keep writes blocked and recommend migration or
reconciliation work internally instead of asking the user to choose commands.

For governed or production-sensitive old projects, `doctor` should stop at the adoption diagnosis layer. It should not flood the user with missing `.intentos` asset errors before a migration plan exists.

## Rule Comparison

Existing project rules must be compared before migration.

IntentOS should recommend one of these postures:

- keep the existing rule;
- keep the existing rule because it is stricter or production-proven;
- adopt an IntentOS gap after internal review;
- merge after internal review;
- ask for one missing business fact or consent to one prepared real-world effect;
- block only the dependent action when an external authority or fact cannot be
  proven from the project.

IntentOS/Codex selects the technical posture. The zero-experience user is not
asked to choose migration depth, governance assets, baseline rules, or review
commands.

## Native Migration

Use Native Migration when the project should move from adapter-style reading into IntentOS-native working mode:

```bash
node scripts/cli.mjs native-migration <project>
node scripts/cli.mjs reconcile-rules <project> --auto-native
```

These are still plan and comparison steps. They do not write target files by themselves.

`--auto-native` lets Codex generate a temporary read-only Native Migration input for comparison when no `native-migration-plans/` report has been written yet. This supports continuous read-only diagnosis without asking the user to manage intermediate files.

## Governance Convergence

After Native Migration and Existing Rule Reconciliation, use Governance Convergence to show how an old project can work more like a new IntentOS project:

```bash
node scripts/cli.mjs convergence <project>
node scripts/cli.mjs convergence-check <project>
```

This is still a derived read-only view. It helps Codex summarize:

- which daily workflow behaviors can converge toward IntentOS;
- which baseline, release, CI, hook, document, work queue, and audit rules should be kept, merged, or reviewed;
- where old history becomes historical evidence instead of something to rewrite;
- when `ai-logs` are appropriate and when they would become noise;
- why every target-project write still requires a Unified Apply Plan and approval.

Governance Convergence should make the professional recommendation for the user. The user should not need to decide whether a project CI guard is stricter than an IntentOS reference rule.

## Adoption Execution Assurance

After a project has migration, reconciliation, and convergence evidence, use Adoption Execution Assurance to check whether the project has actually adopted IntentOS:

```bash
node scripts/cli.mjs adoption-assurance <project>
node scripts/cli.mjs adoption-assurance-check <project>
```

This answers the user-facing question:

```text
Can Codex claim this old project has fully adopted IntentOS?
```

The answer is `Yes` only when the state is `VERIFIED_ACTIVE`.

If the state is partial or blocked, Codex can still work in IntentOS mode, but it must stay plan-first and list the missing surfaces. Assurance does not write project files, approve release, mutate CI/hooks, replace release SOPs, or transfer project authority to IntentOS.

## AI Recommendation, Human Confirmation

For old projects, Codex should provide the professional recommendation first:

```text
READ_ONLY_DIAGNOSIS
DOCS_BRIDGE
SELECTED_NATIVE_ADOPTION
BLOCKED_NEEDS_OWNER
BLOCKED_BY_DIRTY_WORKTREE
```

The recommendation should say what to preserve, merge, replace after approval, or block.

The human should confirm the goal, authority, and risk acceptance. The human should not be asked to decide technical details such as whether a CI rule is stricter than an IntentOS baseline.

## When Writes Become Possible

Project asset changes require:

1. Native Migration Plan;
2. Existing Rule Reconciliation;
3. an executable, project-bound apply plan with exact source and target digests;
4. explicit human approval;
5. Controlled Apply Readiness;
6. exact approved-graph replay;
7. an Apply Execution Receipt that still matches the current project, Git identity, target hashes, and read-only activation result.

Until then, IntentOS Operating Mode is active for work guidance only.

Direct `--update-workflow-assets` is no longer a migration shortcut. Init and update writes must use the same plan, approval, readiness, replay, and receipt chain. Existing project CI, release, runtime, business rules, and other protected authority remain project-owned unless an exact approved action says otherwise.
