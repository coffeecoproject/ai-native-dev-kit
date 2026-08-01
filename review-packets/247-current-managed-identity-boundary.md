# Review Packet: 247-current-managed-identity-boundary

Use this file when a completed or in-progress change needs a stable review input for a human reviewer, GPT Pro, a second model, or another review process.

This packet does not approve the change. It packages context, evidence, known risks, and open questions so a reviewer can inspect the work without reconstructing the whole conversation.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.113.0`

Context digest: `sha256:bdc16d1aa0bdc231d5b5d1cd339a65f94560a3d38f89c64af4adee4c74a67d81`

This binding identifies the product-direction contract used to prepare this review input. It is not implementation, apply, release, or production approval.

## Decision Responsibility

Technical decision owner: Codex

Codex selects architecture, baseline, scope mechanics, risk treatment, verification strategy, review routing, release readiness, and technical recovery from project evidence.

Default user input class: NO_USER_ACTION

Bounded exceptions: BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

## Review Input Identity

Lifecycle: CURRENT_IMPLEMENTATION

Project fingerprint: `sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58`

Project revision: `sha256:5afd357fce45a0ca8440b42017ea6688e9e298b470968be567c72b96fc7a02b6`

Task ref: `tasks/247-current-managed-identity-boundary.md`

Task digest: `sha256:fd10bbcf3931134dba3206c67d721f81286e89a56ccc12d5681c7bae4741079a`

## Packet Status

Status: READY

Prepared by: Codex

Prepared at: 2026-08-01

Reviewer: Codex

Review target: `tasks/247-current-managed-identity-boundary.md`

## Review Purpose

What should the reviewer focus on?

- Verify that current identity follows current `workflowAssets` while current assets retain exact evidence and hash checks.

What should the reviewer ignore?

- Pawcode execution, apply/receipt mechanics, workflow states, and broader trust redesign.

## Project State

Project root: `/private/tmp/intentos-source-only-adoption-hardening`

Branch: `codex/source-only-external-adoption-hardening`

Project state tags: IntentOS source repository; Task 247 candidate only

Adoption mode: source maintenance

Workflow next action: create the bounded local Task 247 commit

Dirty worktree: Yes

Changed file count: two source/test files plus Task 247 evidence

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/247-current-managed-identity-boundary.md` | READY | real cold-start blocker |
| Preflight | `preflight/247-current-managed-identity-boundary.md` | READY | no missing input |
| Spec | `specs/247-current-managed-identity-boundary.md` | READY | current asset-set contract |
| Eval | `evals/247-current-managed-identity-boundary.md` | READY | preservation and fail-closed checks |
| Task | `tasks/247-current-managed-identity-boundary.md` | READY | CB2 boundary |
| AI task log | `ai-logs/2026-08-01-current-managed-identity-boundary.md` | CURRENT | task evidence |
| Release evidence | Not applicable | N/A | no release effect |

## Request Summary

- Stop retired historical assets from invalidating current Project Entry identity.

## Spec / Scope Summary

Allowed scope:

- current identity helper, generated-project integration test, Task 247 evidence

Forbidden scope:

- Pawcode writes, state/schema/authority redesign, dependencies, CI/hooks, release, production, business code

Non-goals:

- no general drift tolerance and no removal of current asset evidence checks

## Acceptance Criteria

- Current `workflowAssets` plus required identity files are exact; retired verify script is preserved; current tamper remains blocked.

## Risk Gate

Checked risk items:

- None checked; internal identity trust is handled as L2 technical review.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Codex evidence supports exclusion |
|---|---|---|
| identity / trust | project-local evidence validation only | Yes |
| apply / receipt | execution mechanics unchanged | Yes |

## Human Approval

Compatibility heading: this section records exact consent to a prepared real-world effect only.

Required: No

Status: Not Required

User input class: NO_USER_ACTION

Approval scope: Not required

Prepared effect and safeguards: None; source-only local code and evidence

Approved by:

Approved at:

## Baseline State

Onboarding state: source repository established

Engineering baseline checked: Yes

Engineering baseline ref: source repository Project Entry and full self-check contract

Engineering baseline gaps: None

Environment baseline checked: Not applicable

Environment baseline ref: Not applicable

Environment baseline gaps: None

Platform baseline state: source self-check boundary

Selected profiles: Not applicable

Industrial baseline state: Not applicable

Baseline level: source repository baseline

Selected industrial packs: None

## Change Boundary Review

Change-boundary report: `change-boundary-reports/126-current-managed-identity-boundary.md`

Actual changed files checked against approved boundary: Yes

Forbidden paths changed: No

Out-of-scope changes require: None

## Baseline State Review

Baseline-state report: Not required

Proposed or evidence-required baselines treated as confirmed: No

## Evidence

Commands run:

```text
node --test --test-name-pattern='generated project remains trusted' tests/project-entry-generated-parity.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
read-only Pawcode current identity with repaired source
```

Verification results:

- Focused generated-project integration: PASS 1/1.
- Pawcode current identity via repaired source: INSTALLED_CURRENT / READY_FOR_INTENTOS_OPERATION / VERIFIED_ACTIVE.
- Manifest and diff checks: PASS.
- Project-entry suite: PASS 113/113.
- Full source self-check: PASS, exit 0 with `IntentOS self-check passed.`

Evidence refs:

- Pawcode v3 plan, bootstrap/apply receipts, version workflowAssets, and cold-start diagnosis.

Skipped evidence and reason:

- None.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `scripts/lib/project-entry-trust.mjs` | implementation | current asset roots only | medium |
| `tests/project-entry-generated-parity.test.mjs` | tests | retired asset preservation regression | low |
| Task 247 evidence files | governance | bounded workflow evidence | low |

## Diff Summary

- Removes hardcoded historical `.intentos` and `scripts` roots from current identity derivation.
- Keeps current `workflowAssets`, `AGENTS.md`, and `.intentos/version.json` exact.

## Known Risks

- A manifest that omits an active imported asset would be unsafe, but manifest import-closure checks remain mandatory and pass.

## Open Questions

- None.

## Assumption Register

Use this section when review conclusions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
| `scripts/verify.sh` is retired from current Pawcode workflow identity | current `.intentos/version.json` excludes it and v3 has no action for it | high | Yes | NO_USER_ACTION | Codex | CONFIRMED |

## Reviewer Checklist

- [x] The implementation matches the request and spec.
- [x] The change stays inside approved scope.
- [x] Non-goals were not implemented accidentally.
- [x] Risk Gate items match the actual touched areas.
- [x] Exact real-world consent is present when the prepared external effect requires it.
- [x] Verification evidence is enough for the stated risk.
- [x] Engineering baseline is checked when structure, contracts, schema, permissions, migrations, dependencies, or cross-module state changed.
- [x] Environment baseline is checked when build, CI, environment variables, deployment, production config, release, rollback, secrets, logs, monitoring, or alerts changed.
- [x] Baseline or industrial evidence gaps are called out.
- [x] Inferred facts are recorded in Assumption Register and are not treated as approved baseline rules.
- [x] Dirty worktree or pre-existing changes are separated from this task.
- [x] Codex selected and verified secret, production-config, migration, and release mechanics; exact consent exists for any prepared real-world effect.
- [x] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

`NEEDS_HUMAN_DECISION` is a compatibility outcome and may represent only BUSINESS_FACT_NEEDED, REAL_WORLD_CONSENT_NEEDED, or EXTERNAL_FACT_NEEDED.

User input class: NO_USER_ACTION

Findings:

- No blocking finding in the current-vs-retired managed identity boundary.

Required follow-up:

- Create the bounded local Task 247 commit; do not push.
