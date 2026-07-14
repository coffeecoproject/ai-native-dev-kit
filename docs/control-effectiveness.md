# Control Effectiveness

IntentOS 1.110 checks whether a project check really enforces the specific
claim that currently depends on it.

For example, a page-health check can prove that a page responds. It cannot be
used as visual-regression proof. A script that scans one directory cannot be
used as proof for every production source file unless the current inventory
shows that the directory is complete.

IntentOS records one internal report under
`control-effectiveness-reports/`. Each required claim binds:

- the exact implementation and consumer;
- the protected scope and evidence-backed exclusions;
- current project, task, revision, environment, and run identity;
- the assertion the control actually makes;
- safe failure proof when strict blocking relies on it;
- limitations and downstream consumers.

The ordinary user does not choose controls, probes, thresholds, schemas, or
reviewers. A missing technical proof causes Codex to continue investigation,
narrow the claim, repair the technical plan, or keep the task blocked.

Control Effectiveness is not a new completion state. It feeds existing
adoption, Plan Review, Verification, Execution Assurance, Completion Evidence,
and Unified Closure decisions.
