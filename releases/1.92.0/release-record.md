# IntentOS 1.92.0 Release Record

## Theme

Apply & Adoption Closure.

## Human Summary

IntentOS can now prove whether its bounded low-risk governance setup was
actually applied to a project. The controlled init/update path executes only
the approved plan actions, verifies every result, records a receipt, and checks
that the installed workflow can be entered afterwards.

## Delivered

- immutable init/update execution plan version `1.1`;
- source, manifest, target, project, action, backup, and receipt binding;
- exact action-graph replay instead of broad post-approval regeneration;
- mandatory matching Approval Record and Controlled Apply Readiness Report;
- high-risk, CI/hook, business, migration, secret, production, and selected
  industrial actions excluded from the controlled graph;
- plan-time duplicate target collapse without changing the manifest source;
- runtime before/after hashes, unexpected-path detection, rollback, and
  installed-workflow activation verification;
- structured project-bound Apply Execution Receipt and strict checker;
- Adoption Assurance now treats plan/approval/readiness as preparation only;
  applied active adoption requires a verified receipt.

## Allowed Claims

- The bounded low-risk IntentOS init/update runner replays the exact approved
  execution graph.
- A valid Apply Receipt proves current target hashes and read-only workflow
  activation for the same project.
- Legacy plan/approval/readiness evidence alone no longer proves applied active
  adoption.

## Forbidden Claims

- IntentOS guarantees product correctness.
- IntentOS approves business implementation, CI/hooks, release, production,
  migrations, secrets, payments, compliance, or industrial decisions.
- IntentOS can execute arbitrary project changes automatically.
- An Apply Receipt transfers project authority to IntentOS.

## Evidence Status

- Exact replay temporary-project runtime: PASS
- Apply Receipt strict validation: PASS
- Missing readiness negative path: PASS
- Copied receipt / wrong-project negative path: PASS
- Source drift after planning negative path: PASS
- Stale post-apply target negative path: PASS
- Source self-check: PASS
- Full `npm run verify`: PASS

## Known Limitations

The controlled runner is intentionally limited to bounded IntentOS governance
assets. Generated AGENTS/PR-template merges, CI and hook changes, selected
industrial packs, business implementation, release, and production remain
outside the executable graph. The source manifest also still contains
overlapping copy rules; the 1.92 planner collapses them by target path while
structural manifest consolidation remains scheduled separately.

See [known-limitations.md](known-limitations.md) for the complete boundary.

## Verification

Release verification covers exact replay in a temporary target project,
project-bound receipt validation, absent-readiness failure, copied-receipt
rejection, source and target drift rejection, generated-project activation,
manifest consistency, syntax, product-baseline, claim-control, and the full
repository verification chain.

See [self-check-report.md](self-check-report.md) for command-level results.
