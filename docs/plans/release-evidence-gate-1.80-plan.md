# Release Evidence Gate 1.80 Execution And Acceptance Plan

## Goal

Add a read-only Release Evidence Gate that answers one question:

Can this release candidate be handed to a human release owner for formal release
review?

This is not the same as "can this go live now".

## Product Position

`1.80` is a release-review evidence gate. It is not:

- release approval;
- deployment;
- production verification;
- app-store submission;
- mini-program submission;
- migration execution;
- provider / DNS / payment / secrets / CI ownership.

The correct chain is:

```text
Business Rule Closure
-> Change Impact Coverage
-> Verification Plan
-> Test Evidence
-> Execution Assurance
-> Completion Evidence Gate
-> Release Evidence Gate
-> Human Release Owner / External Release System
-> Post-Launch Evidence
```

User Delivery Console may display or summarize Release Evidence Gate results,
but User Delivery Console is not a source authority for `1.80`. It is a derived
view.

## Source Authority

Release Evidence Gate may read, but must not replace:

1. Completion Evidence for included tasks.
2. Test Evidence for release-relevant obligations.
3. Execution Assurance for actual implementation boundaries.
4. Product Completeness where available.
5. Launch Review View.
6. Release Plan.
7. Platform Release Recipe.
8. Release Handoff Pack.
9. Approval records identifying owners and decisions.
10. Project release SOP / rollback SOP / incident SOP where present.
11. Runtime smoke, preview, staging, monitoring, support, rollback, and
    environment-readiness evidence.

## User Experience

The ordinary user asks:

```text
Can this go to release review?
```

Codex should respond with a plain-language card:

- what release candidate is being reviewed;
- target: preview, staging, internal trial, production review, app store review,
  mini-program review, or unknown;
- whether it can be handed to a release owner for review;
- what evidence is present;
- what evidence is missing;
- who must decide;
- what Codex may safely prepare;
- what only the release owner / external system may do;
- explicit statement: release and production are not approved.

## Artifact Surface

Add:

```text
release-evidence-gate-reports/
release-candidates/
templates/release-evidence-gate-report.md
core/release-evidence-gate.md
docs/release-evidence-gate.md
checklists/release-evidence-gate-review.md
prompts/release-evidence-gate-agent.md
scripts/resolve-release-evidence-gate.mjs
scripts/check-release-evidence-gate.mjs
examples/1.80-release-evidence-gate/
test-fixtures/bad/bad-release-evidence-*/
releases/1.80.0/
```

CLI aliases:

```bash
node scripts/cli.mjs release-evidence <project> --intent "<release intent>"
node scripts/cli.mjs release-evidence-check <project>
```

## Release Candidate Identity

Release Evidence Gate must identify what is being reviewed. It must not treat a
single task-completion report as the whole release.

Minimum release scope:

```json
{
  "release_candidate_ref": "artifact:release-candidates/001.md",
  "source_revision": "git:<commit-sha>|unknown",
  "dirty_worktree_status": "clean|dirty|unknown",
  "included_task_refs": [],
  "included_completion_evidence_refs": [],
  "excluded_known_items": [],
  "build_artifact_ref": "artifact:...",
  "build_artifact_digest": "sha256:..."
}
```

If source revision is unknown or the worktree is dirty, production-like targets
must be blocked from `READY_FOR_RELEASE_OWNER_REVIEW`.

## Release Targets And Evidence Matrix

The checker must derive required evidence from `release_target`.

| Release Target | Required Evidence |
| --- | --- |
| `preview` | Completion Evidence, build/preview evidence, basic smoke, release owner or reviewer handoff |
| `internal_trial` | preview/staging smoke, known limitations, feedback owner, rollback/disable strategy |
| `staging` | environment config readiness, runtime smoke, monitoring/log visibility, rollback plan |
| `production_review` | release owner, risk owner, rollback, monitoring, incident/support handoff, data/migration decision, approval state |
| `app_store_review` | platform recipe, store owner, package/version evidence, review assets, privacy/compliance refs, rollback/disable path |
| `mini_program_review` | mini-program recipe, platform account owner, upload package evidence, review checklist, rollback/disable path |
| `unknown` | target clarification and release owner identification |

Machine-readable requirements should include:

```json
[
  {
    "target": "production_review",
    "required_evidence_ids": [
      "completion-evidence",
      "release-owner",
      "rollback",
      "monitoring",
      "runtime-smoke",
      "incident-owner"
    ]
  }
]
```

## Owner And Approval Semantics

Do not collapse owner identification, review acceptance, and release approval.

Use separate fields:

```json
{
  "release_owner_identified": "Yes|No|Unknown",
  "release_owner_review_ref": "artifact:...|human-decision:...|missing",
  "risk_owner_identified": "Yes|No|Unknown",
  "environment_owner_identified": "Yes|No|Unknown",
  "release_approval_ref": "missing|pending|out_of_scope|human-decision:..."
}
```

`READY_FOR_RELEASE_OWNER_REVIEW` may require owner identification and a complete
review package. It must not require or imply release approval.

## Gate States

Use review-readiness states only:

- `NOT_READY_FOR_RELEASE_REVIEW`
- `READY_FOR_INTERNAL_TRIAL_REVIEW`
- `READY_FOR_RELEASE_OWNER_REVIEW`
- `BLOCKED_BY_MISSING_RELEASE_EVIDENCE`
- `BLOCKED_BY_HUMAN_RELEASE_DECISION`
- `OUT_OF_SCOPE_FOR_RELEASE_GATE`

These states are not production approval and not deployment authorization.

## Machine-Readable Evidence

The report must include a `release_evidence_gate` JSON block:

```json
{
  "schema_version": "1.80.0",
  "artifact_type": "release_evidence_gate",
  "intent": "prepare release owner review",
  "intent_digest": "sha256:...",
  "release_evidence_digest": "sha256:...",
  "release_target": "preview|staging|internal_trial|production_review|app_store_review|mini_program_review|unknown",
  "release_scope": {
    "release_candidate_ref": "artifact:release-candidates/001.md",
    "release_candidate_digest": "sha256:...",
    "source_revision": "git:<sha>|unknown",
    "dirty_worktree_status": "clean|dirty|unknown",
    "included_task_refs": [],
    "included_completion_evidence_refs": [],
    "excluded_known_items": [],
    "build_artifact_ref": "artifact:...",
    "build_artifact_digest": "sha256:..."
  },
  "gate_state": "READY_FOR_RELEASE_OWNER_REVIEW",
  "can_handoff_to_release_owner": "Yes",
  "release_or_production_approved": "No",
  "source_chain": [],
  "release_target_requirements": [],
  "required_evidence": [],
  "missing_evidence": [],
  "owner_decisions": [],
  "runtime_readiness": {},
  "rollback_readiness": {},
  "monitoring_readiness": {},
  "environment_readiness": {},
  "data_migration_readiness": {},
  "cost_quota_readiness": {},
  "existing_release_rule_mapping": [],
  "forbidden_actions": [],
  "boundaries": {
    "writes_target_files": "No",
    "approves_release_or_production": "No",
    "executes_deployment": "No",
    "executes_migration": "No",
    "uses_or_records_secrets": "No",
    "submits_to_app_store_or_mini_program": "No",
    "changes_dns_payment_provider_or_ci": "No",
    "proves_real_user_stability": "No"
  }
}
```

## Source Chain

`source_chain[]` must include source refs, digests, outcomes, and current release
matching:

```json
{
  "name": "completion_evidence",
  "status": "RECORDED",
  "ref": "artifact:completion-evidence-reports/001.md",
  "digest": "sha256:...",
  "source_outcome": "COMPLETION_EVIDENCE_READY",
  "current_release_match": "Yes"
}
```

Required source names:

- `completion_evidence`;
- `test_evidence`;
- `execution_assurance`;
- `release_plan`;
- `launch_review_view`;
- `platform_release_recipe`;
- `release_handoff_pack`;
- `existing_release_rule`;
- `human_decision`.

## Runtime And Environment Readiness

The gate must record environment readiness without recording secret values:

```json
{
  "target_environment": "preview|staging|production-like|unknown",
  "config_owner": "human:<owner>|missing|unknown",
  "secrets_required": "Yes|No|Unknown",
  "secrets_values_recorded": "No",
  "dns_or_callback_changes_required": "Yes|No|Unknown",
  "blocked_by_environment_config": "Yes|No"
}
```

Production-like targets must block when config ownership, secrets readiness, DNS
/ callback readiness, or provider action ownership is unknown.

## Post-Release Observability

Structure monitoring and support handoff:

```json
{
  "smoke_check_ref": "artifact:...",
  "monitoring_ref": "artifact:...",
  "incident_owner_ref": "human-decision:...",
  "support_handoff_ref": "artifact:...",
  "rollback_window": "defined|missing|not_applicable"
}
```

For production-like targets, missing monitoring, incident owner, or rollback
window is blocking.

## Data And Migration Readiness

The gate must record migration risk without approving execution:

```json
{
  "migration_required": "Yes|No|Unknown",
  "migration_plan_ref": "artifact:...|missing",
  "backup_or_restore_ref": "artifact:...|missing",
  "data_owner_ref": "human-decision:...|missing",
  "codex_may_execute_migration": "No"
}
```

For production-like targets, `migration_required: "Unknown"` is blocking.

## Cost And Quota Readiness

Cost and quota may be non-blocking for low-risk preview targets, but must be
expressible:

```json
{
  "cost_owner_ref": "human-decision:...|missing|not_applicable",
  "quota_risks": [],
  "blocked_by_unknown_quota": "Yes|No"
}
```

BL2 / high-risk / production-like targets may treat unknown quota ownership as
blocking.

## Existing Project Release Rule Mapping

Existing projects may already have stronger release SOPs. IntentOS must not
downgrade them.

Use:

```json
[
  {
    "project_rule_ref": "artifact:docs/release-sop.md",
    "intentos_requirement": "rollback evidence",
    "mapping_state": "PROJECT_STRONGER_RULE|PROJECT_WEAKER_RULE|MATCHED|MISSING|NEEDS_OWNER"
  }
]
```

If a project has stronger release SOPs, `1.80` should map to them and report
missing evidence; it must not replace or bypass them.

## Required Checks

The checker must reject:

1. READY state without current-task Completion Evidence.
2. Completion Evidence ref exists but strict check fails.
3. Release candidate has dirty worktree or unknown source revision for
   production-like targets.
4. Production-like target missing rollback evidence.
5. Production-like target missing monitoring or incident owner.
6. App store or mini-program target missing platform recipe.
7. Release owner missing.
8. Human release decision marked approved by Codex.
9. Runtime smoke evidence is user note only.
10. Test Evidence missing or stale for release-relevant obligations.
11. Release Plan / Launch Review target conflicts with `release_target`.
12. Secrets / DNS / payment / migration / provider action marked Codex-approved.
13. `READY_FOR_RELEASE_OWNER_REVIEW` with missing required evidence.
14. Markdown says ready while JSON says blocked, or the reverse.
15. Existing project stronger release SOP missing, ignored, or downgraded.

## Examples

Positive examples:

1. web preview handoff ready;
2. mini-program review handoff ready;
3. backend API staging review ready;
4. internal admin production-review blocked because monitoring / rollback /
   release owner evidence is missing.

Bad fixtures:

1. release approved claim;
2. no release owner;
3. no rollback strategy for production-like target;
4. stale Completion Evidence;
5. user note treated as runtime smoke or Test Evidence;
6. missing platform recipe / handoff;
7. missing runtime smoke evidence;
8. app store or mini-program action treated as Codex-approved;
9. dirty worktree treated as production-review ready;
10. existing project release SOP ignored.

## Generated-Project Smoke

Generated-project smoke must prove commands are installed and same-report checks
work:

```bash
node scripts/cli.mjs release-evidence <project> --intent "prepare release review"
node scripts/cli.mjs release-evidence <project> --intent "prepare release review" --out release-evidence-gate-reports/001-generated-blocked.md
node scripts/cli.mjs release-evidence-check <project>
```

The generated report should be blocked:

```text
BLOCKED_BY_MISSING_RELEASE_EVIDENCE
```

Do not fabricate release approval for generated-project smoke.

## Execution Plan

1. Add core/docs/checklist/prompt/template.
2. Add schema for `release_evidence_gate`.
3. Add resolver and checker.
4. Wire CLI aliases.
5. Add positive examples and bad fixtures.
6. Add generated-project same-report smoke coverage.
7. Add manifest sourceRequired and copy rules if needed.
8. Add release record, known limitations, and self-check.
9. Run syntax, targeted checker, `check-intentos`, `npm run verify`, and
   `git diff --check`.

## Acceptance Plan

`1.80` is accepted only when:

- current release candidate identity is recorded;
- target-specific evidence matrix is enforced;
- source-chain refs, digests, outcomes, and current-release matches are checked;
- release owner identification is separate from release approval;
- positive examples are ready for release-owner review, not release approval;
- bad fixtures reject missing owner, rollback, runtime smoke, platform recipe,
  stale Completion Evidence, dirty source revision, and Codex-approved release
  claims;
- generated-project smoke saves and checks the same blocked report;
- existing-project SOPs are mapped and not downgraded;
- User Delivery Console still does not approve release;
- `check-intentos`, `npm run verify`, and `git diff --check` pass.

Example acceptance commands:

```bash
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-release-approved-claim --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-no-release-owner --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-missing-rollback-production --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-user-note-treated-as-smoke --require-structured-evidence
```

## Boundary

Codex may prepare release-review evidence. Codex must not become the release
owner and must not execute provider, secrets, DNS, payment, migration, app store,
mini-program, CI/CD, or production actions without an external human-controlled
release process.
