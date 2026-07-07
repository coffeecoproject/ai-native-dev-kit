# Release Evidence Gate 1.80 Execution And Acceptance Plan

## Goal

Add a release-readiness evidence gate that answers one question:

Can this product or change be handed to a human release owner for formal release
review?

## Position

`1.80` is not a deploy tool and not a production approval system.

It must sit after:

- Business Rule Closure;
- Change Impact Coverage;
- Verification Plan;
- Test Evidence;
- Execution Assurance;
- Completion Evidence;
- User Delivery Console.

It may consume Release Plan / Launch Review / platform release recipe evidence,
but it must not replace external release systems, CI/CD providers, app store
review, cloud consoles, DNS, payments, secrets, migrations, or production owner
approval.

## User Experience

The ordinary user asks:

```text
Can this go to release review?
```

Codex should respond with a plain-language Release Evidence Gate card:

- release target;
- current readiness;
- what is already proven;
- what is missing;
- which actions Codex may prepare;
- which actions require a human release owner;
- explicit statement that release/production is not approved.

## Artifact

Add:

```text
release-evidence-gate-reports/
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

## Required Evidence Inputs

`1.80` should read, but not replace:

1. Completion Evidence for the current task.
2. Test Evidence for release-relevant obligations.
3. Execution Assurance for the actual diff / implementation boundary.
4. Release Plan or Launch Review View.
5. Platform release recipe or release handoff pack where applicable.
6. Human approval records for release owner, risk owner, and environment owner.
7. Rollback / restore strategy evidence.
8. Runtime smoke / preview / staging evidence where applicable.
9. Monitoring / incident / support handoff evidence where applicable.

## Gate States

Use plain states:

- `NOT_READY_FOR_RELEASE_REVIEW`
- `READY_FOR_INTERNAL_TRIAL_REVIEW`
- `READY_FOR_RELEASE_OWNER_REVIEW`
- `BLOCKED_BY_MISSING_RELEASE_EVIDENCE`
- `BLOCKED_BY_HUMAN_RELEASE_DECISION`
- `OUT_OF_SCOPE_FOR_RELEASE_GATE`

These states are review-readiness states only. They are not production approval.

## Machine-Readable Evidence

The report should include a `release_evidence_gate` JSON block with:

```json
{
  "schema_version": "1.80.0",
  "artifact_type": "release_evidence_gate",
  "intent": "...",
  "intent_digest": "sha256:...",
  "release_target": "preview|staging|internal_trial|production_review|app_store_review|mini_program_review|unknown",
  "gate_state": "READY_FOR_RELEASE_OWNER_REVIEW",
  "completion_evidence_ref": "artifact:...",
  "release_plan_ref": "artifact:...",
  "required_evidence": [],
  "missing_evidence": [],
  "human_decisions": [],
  "forbidden_actions": [],
  "boundaries": {}
}
```

## Required Checks

The checker must reject:

- missing current-task Completion Evidence;
- missing or stale Test Evidence;
- missing Execution Assurance for changed implementation work;
- release readiness based only on user notes;
- claims that release, production, deploy, migration, payment, DNS, app store,
  mini program review, secrets, or CI/CD execution are approved;
- missing rollback/restore evidence for production-like targets;
- missing owner for human release decision;
- broad `npm run verify passed` style text without bound evidence;
- report state that conflicts with missing evidence.

## Examples

Positive examples:

1. web preview handoff ready;
2. mini program review handoff ready;
3. backend API staging review ready;
4. internal admin production-review not ready because monitoring/rollback missing.

Bad fixtures:

1. release approved claim;
2. no release owner;
3. no rollback strategy for production-like target;
4. stale Completion Evidence;
5. user note treated as Test Evidence;
6. missing platform recipe / handoff;
7. missing runtime smoke evidence;
8. app store or mini program action treated as Codex-approved.

## Execution Plan

1. Add core/docs/checklist/prompt/template.
2. Add resolver and checker.
3. Wire CLI aliases.
4. Add examples and bad fixtures.
5. Add generated-project smoke coverage.
6. Add manifest sourceRequired and copy rules if needed.
7. Add release record, known limitations, and self-check.
8. Run syntax, targeted checker, `check-intentos`, `npm run verify`, and
   `git diff --check`.

## Acceptance Plan

`1.80` is accepted only when:

- a current-task release evidence report can be generated;
- checker passes positive examples;
- checker rejects all bad fixtures;
- User Delivery Console still does not approve release;
- Release Evidence Gate can say ready for release-owner review without saying
  release is approved;
- generated-project smoke proves commands are installed;
- existing-project behavior remains read-only unless an explicit reviewed apply
  plan is used;
- `check-intentos`, `npm run verify`, and `git diff --check` pass.

## Boundary

Codex may prepare release review evidence. Codex must not become the release
owner and must not execute provider, secrets, DNS, payment, migration, app store,
mini program, or production actions without an external human-controlled release
process.
