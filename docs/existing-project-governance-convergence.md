# Existing Project Governance Convergence

This document explains how an existing project can move from "IntentOS can read
and advise" to "Codex works in the IntentOS daily workflow" without replacing
the project's existing authority.

## Plain Meaning

For old projects, IntentOS should not simply copy a new workflow over the top.
It should compare the current project rules with IntentOS rules, then recommend
the safest way to make daily work feel like a new IntentOS project.

The intended result:

```text
Old project history stays intact.
Old project production authority stays with the project owner.
Daily AI collaboration uses IntentOS routing, review, evidence, and finish.
```

## What Codex Can Do

Codex may:

- work in IntentOS Operating Mode for planning, routing, review, and close-out;
- compare existing workflow, baseline, release, CI, hook, document, and task
  rules with IntentOS expectations;
- recommend keep, merge, adopt after review, replace after approval, or block;
- prepare a reviewable convergence report;
- prepare a later Unified Apply Plan only after the user asks for it.

Codex must not:

- write target-project files from a convergence report;
- replace `AGENTS.md`, CI, hooks, release SOPs, baselines, docs, or guard
  scripts directly;
- rewrite old history;
- import all old project logs into `ai-logs`;
- approve release, production, provider, security, privacy, compliance,
  payment, permission, migration, tax, finance, HR, legal, data, or business
  behavior.

## User-Facing Result

The report should answer:

```text
Can this old project work under IntentOS now?
What daily workflow can converge?
What existing rules are stricter and should stay?
What can merge after review?
What is blocked by project authority?
What is the safest next step?
```

## Convergence Dimensions

| Dimension | IntentOS Goal |
| --- | --- |
| Workflow | Daily task routing, review, impact coverage, and finish can use IntentOS. |
| Baseline | Engineering/environment/platform rules are compared before changes. |
| Audit | Old evidence stays historical; new evidence follows IntentOS after adoption. |
| Release | Release, rollback, monitoring, and SOP ownership stay project-owned. |
| CI / Hooks | Existing guards are compared; no automatic mutation. |
| Documents | Source-of-truth, stale, duplicate, and archive candidates are mapped. |
| Work Queue | Interrupted work and long-running tasks map into Work Queue rules. |
| AI Logs | Logs are reserved for meaningful governance events, not routine noise. |
| Risk Authority | Protected decisions remain human/project/external-system owned. |

## Required Apply Chain

Any target-project asset change must still go through:

```text
Native Migration
-> Existing Rule Reconciliation
-> Governance Convergence Report
-> Unified Apply Plan
-> Approval Record
-> Controlled Apply Readiness
```

Until that chain exists, the correct state is:

```text
Can Codex write now: No
```

## Evidence Consistency

The report must be internally consistent:

- Human Summary state must match the machine-readable `convergence_state`.
- Markdown `Outcome` must match the machine-readable `outcome`.
- Each Markdown convergence dimension must match the machine-readable dimension
  with the same key.
- Source-system evidence must include status, ref, and contribution for
  `workflow_next`, `native_migration`, `existing_rule_reconciliation`, and
  `release_plan`.
- If any source system is `BLOCKED` or `NEEDS_INPUT`, the report must record an
  upstream blocked reason and must not claim ready convergence.

## Report Command

Default resolver output is printed to the terminal. To make the generated report
auditable, save it explicitly and check the same file:

```bash
node scripts/cli.mjs convergence <target> --out governance-convergence-reports/001-current.md
node scripts/check-governance-convergence.mjs <target> --report governance-convergence-reports/001-current.md --require-structured-evidence
```

`--out` writes only the requested report file inside the target project. It does
not authorize target-project writes, governance replacement, CI/hook changes,
release, or production.

## Relationship To New Projects

New projects can start with IntentOS assets and baseline choices from the
beginning.

Existing projects converge gradually:

- old evidence is preserved;
- stricter existing rules win;
- gaps can be adopted after review;
- obsolete workflow wording can be replaced only after approval;
- new work can follow IntentOS daily workflow once convergence planning is
  accepted.
