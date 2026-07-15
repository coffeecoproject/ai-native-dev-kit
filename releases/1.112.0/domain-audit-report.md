# IntentOS 1.112 Nine-Domain Capability Closure Audit

## Status

AUDIT COMPLETE. BEHAVIORAL CLOSURE NOT ACCEPTED.

This report records the evidence-backed result of the nine-domain audit. It is
an audit artifact only. It does not authorize implementation, project writes,
apply, release, production, or a completion claim.

## Frozen Candidate

| Field | Value |
|---|---|
| Product baseline | `1.111.1` |
| Baseline commit | `cc321791f9bb41ee7d4d300970cf0aa07eff2d81` |
| Audit plan commit | `f37436a3102b6b0c96a39aa29d4910bd802a5ffc` |
| Manifest SHA-256 | `8a8e8dea1b84e03a3669525605da735fbe9ac371d200ac6085fe09f2da16f0c5` |
| Review Context SHA-256 | `7126aa2d96b108a6358e71cbbce073ba99bd3a2eecdfdcea510b8546d45dd1bd` |

The untracked file
`docs/plans/controlled-adoption-change-attribution-auto-closeout.md` is not
part of this audit candidate and was not modified or used as evidence.

## Overall Result

IntentOS has broad and mature source capabilities, but the current combined
system is not yet a fail-closed cross-domain trust chain.

The audit found one P0 false-completion path and five P1 root-cause findings.
The principal problem is not missing document families. It is that required
source results are not always selected, interpreted, and enforced by their
public consumers.

No current P0 was found in the exact external release-action authority path.
Targeted release tests prove that deploy, store submission, production
migration, rollback execution, and comparable external effects remain
`HUMAN_REQUIRED`. Normal caught apply failures also have materially stronger
rollback behavior than older reviews described. Those controls must be
preserved while the consumer chain is repaired.

## Domain Results

| Domain | Audit label | Evidence-backed result |
|---|---|---|
| 1. Project Entry | `PARTIAL`, `DISTRIBUTION_DRIFT` | Project Entry Trust validates topology, installed identity, apply/activation receipts, and guidance authority. The effective guidance graph does not include all runtime outputs that shape later Codex behavior, so entry cannot yet prove one current responsibility contract for the complete installed operating path. |
| 2. Task Governance | `FAIL_OPEN`, `DISCONNECTED_CONSUMER` | Work Queue and Task Governance are invoked by the public operating route, but LOW, MEDIUM, and POSSIBLE_HIGH tasks can receive no Business Rule, Change Impact, Verification Plan, Test Evidence, Execution Assurance, or Completion Evidence obligation when optional Business Universe routing returns `No`. |
| 3. Business Closure | `PARTIAL`, `FAIL_OPEN` | When Business Universe is required, scenario and lifecycle bindings reach strict downstream checks. Its preflight can miss a structural relationship later in a source file, and the false negative disables the entire business and verification chain for non-HIGH tasks. |
| 4. Change Control | `FAIL_OPEN`, `DISCONNECTED_CONSUMER` | Change Boundary can compare an exact diff when explicitly requested, but required CI consumers call a mode that passes when no report exists and does not require live diff binding. Actual scope control is therefore advisory on those routes. |
| 5. Engineering Baselines | `FAIL_OPEN`, `DISTRIBUTION_DRIFT` | Platform and baseline systems are substantial, but the public CI and generated guidance call Standard Baseline Selection without requiring a selection report. Missing selection can be reported as success. |
| 6. Execution Governance | `PARTIAL`, `DISCONNECTED_CONSUMER` | Planning Closure performs strict source validation and current controlled apply validates plan, target identity, hashes, backups, unexpected paths, activation, and caught-failure rollback. Plan Review's checker success means artifact validity rather than implementation readiness, while the Operating trace records that result as `PASS`; the consumer outcome contract is not uniform. Process-crash recovery remains unproven, not a reproduced P1. |
| 7. Verification And Evidence | `PARTIAL`, `DISCONNECTED_CONSUMER` | Verification Runtime Trust, Test Evidence, and Evidence Authority have current strict controls. Completion Evidence validates the Execution Assurance schema, identity fields, outcome, digest, and bindings, but does not run the strict Execution Assurance checker or equivalent recomputation of its actual diff, review, and evidence gates. |
| 8. Unified Closure | `FAIL_OPEN`, `DUPLICATE_AUTHORITY` | Completion Evidence and legacy Unified Closure remain parallel authorities. The public finish branch evaluates the success-like closure pair before `sourceFailure`, so a failed mandatory source can coexist with `REPORT_TASK_COMPLETE`. |
| 9. Release And Evolution | `PARTIAL`, `DISCONNECTED_CONSUMER` | Exact external release effects are correctly non-Codex actions in targeted tests. The public `PREPARE_RELEASE` route currently adds only Release Guide; automatic continuity through topology, recipe, evidence, approval, execution, observation, and governed learning is not yet proved as one public consumer chain. |

## P0 Finding

### P0-112-001: public finish can report completion while a mandatory source failed

`scripts/resolve-operating-loop.mjs` computes `sourceFailure` from failed source
and strict gate reads at lines 91-103. For `FINISH_TASK`, however,
`operatingStateFor` evaluates legacy Unified Closure plus Completion Evidence at
lines 526-533 and returns before the source-failure branch at line 535.
`selectOperatingAction` repeats this precedence at lines 918-924.

An extracted branch reproduction using the current source conditions produced:

```json
{
  "sourceFailure": true,
  "operatingState": "READY_TO_REPORT_DONE",
  "selected": {
    "actionCode": "REPORT_TASK_COMPLETE",
    "decisionStatus": "READY_TO_REPORT",
    "reasonCode": "CLOSURE_SUPPORTS_DONE"
  }
}
```

This is a false final-completion path. It blocks any claim that the current
system is industrially fail closed.

## P1 Findings

### P1-112-001: optional Business Universe routing controls mandatory task depth

`scripts/resolve-task-governance.mjs` lines 221-269 sets Business Rule Closure,
Change Impact Coverage, and Verification Plan to the Business Universe result
for LOW, MEDIUM, and POSSIBLE_HIGH tasks. Lines 273-285 similarly makes Test
Evidence, Execution Assurance, and Completion Evidence optional unless the
task is HIGH or one of two optional routers returns `Yes`.

The router scans structural patterns only against `firstSemanticExcerpt` in
`scripts/lib/business-universe.mjs` lines 603-613. That helper returns one line
at lines 799-809. A behavior file whose first semantic line validates an object
and later line filters the same object was classified as:

```text
task impact: POSSIBLE_HIGH
Business Universe: NOT_REQUIRED_WITH_REASON
Business Rule Closure required: No
Change Impact Coverage required: No
Verification Plan required: No
Test Evidence required: No
Execution Assurance required: No
Completion Evidence required: No
```

Business Universe is a conditional depth source. It cannot be the switch that
removes the minimum business, impact, verification, and completion contract
from every non-HIGH behavior task.

### P1-112-002: required Change Boundary consumers pass an absent report

`scripts/check-change-boundary.mjs` lines 31-38 reports success when no
Change Boundary report exists. The required PR, release, and generated CI
routes call `node scripts/check-change-boundary.mjs .` without a require-report
or exact-diff option.

An empty project returned exit code 0 with:

```text
PASS change boundary check skipped: no change-boundary reports
Change boundary check passed.
```

The capability exists, but the named consumers do not prove actual changes
stayed inside the reviewed boundary.

### P1-112-003: required baseline consumers pass an absent selection

`scripts/check-standard-baseline-selection.mjs` preserves a compatibility skip
when no selection report exists. The public baseline verification, PR/release
CI, Starter guidance, and generated Agent guidance invoke the non-requiring
form.

An empty project returned exit code 0 with:

```text
PASS standard baseline selection check skipped: no reports
Standard baseline selection check passed.
```

Selection, installation, satisfaction, and effectiveness remain distinct, but
the first required link is currently optional on public consumers.

### P1-112-004: Completion Evidence does not independently validate Execution Assurance

`scripts/check-completion-evidence.mjs` lines 470-505 validates a referenced
Execution Assurance artifact's schema, task, outcome, digest, intent, authority
binding, and `can_claim_done`. Cross-source checks at lines 555-589 validate
its references. The checker does not invoke
`scripts/check-execution-assurance.mjs` or recompute its actual-diff, review,
plan, test, and evidence gates. The only explicit strict child checker in this
part of Completion Evidence is Business Universe at lines 639-654.

This leaves a self-consistency boundary where a current-format Execution
Assurance artifact can be structurally consistent without Completion Evidence
proving that the execution checker accepts current project reality.

### P1-112-005: active responsibility governance omits effective runtime outputs

The current zero-experience contract assigns architecture, baselines, testing,
review, evidence, closure, and technical remediation to Codex. The derived
effective guidance graph contains 344 paths but only these eight scripts:

```text
baseline-project
resolve-baseline-packs
resolve-guided-baseline-selection
resolve-standard-baseline
start-project
workflow-next
init-project
new-workflow-item
```

It omits runtime outputs such as `resolve-closure-decision`,
`resolve-guided-closure`, `resolve-hook-policy`, and `resolve-debt-handoff`.
Those scripts still ask for generic human decisions over technical high-risk
boundaries, hook policy, and technical debt. The current Review Context checker
passes because the outputs are outside its effective graph.

The fix must govern the real output/generation graph. Editing each sentence
without closing graph discovery would recreate the same regression later.

## P2 And Unproven Items

| ID | Item | Current judgment |
|---|---|---|
| P2-112-001 | Plan Review checker exits successfully for a valid `PLAN_REVISION_REQUIRED` artifact, and Operating Model records checker success as `PASS`. | Introduce a typed distinction between artifact validity and readiness. Planning Closure currently performs its own ready-state check, so this is not independently promoted to a false implementation claim. |
| P2-112-002 | Work Queue can derive a current item from task-card order and remains primarily Markdown-driven. | Recheck takeover, interruption, multiple-current, and resume behavior in the 1.113 matrix before changing its authority model. |
| P2-112-003 | Public release preparation stops at Release Guide. | Prove or close automatic downstream continuity without changing exact real-world consent or external action authority. |
| P2-112-004 | Controlled apply recovers caught failures but process termination between writes and receipt is not transactionally proved. | Add an interruption/recovery probe before claiming crash-safe atomicity. Do not regress the current backup and rollback implementation. |
| P2-112-005 | Source, generated, and installed tests often prove file presence and resolver smoke rather than future-session behavior activation. | Add behavior-effect probes for the repaired consumer chain. |
| P2-112-006 | Repository information density and historical duplication remain high. | Defer to 1.114 after all P0/P1 findings close. No structural move is allowed now. |

## Controls Verified In This Audit

- The frozen `1.111.1` baseline passed the full repository verification before
  audit-only files were introduced.
- Planning Closure validates required current source artifacts with strict
  checkers and separately checks ready states.
- Required Business Universe evidence is strictly revalidated at completion
  and scenario identities are compared across Business Rule Closure,
  Verification Plan, Test Evidence, Execution Assurance, and Completion
  Evidence.
- Current controlled apply validates plan and project identity, target/source
  hashes, approved targets, unexpected paths, post-apply activation, and
  caught-failure rollback.
- Targeted Release Execution tests passed 39/39 and preserve external-effect
  actions as `HUMAN_REQUIRED`.
- No audit result authorizes production writes or weakens exact real-world
  consent.

## Root-Cause Decision

The findings are grouped in
`releases/1.112.0/remediation-graph.md`. The required order is:

1. make every source failure dominate public finish;
2. introduce one typed strict-consumer outcome contract;
3. decouple minimum task obligations from optional Business Universe depth;
4. govern the actual runtime and generation guidance graph;
5. make Completion Evidence independently consume strict Execution Assurance;
6. collapse duplicate completion authority into one fail-closed join;
7. require baseline and change-boundary evidence in applicable public and
   generated consumers;
8. prove release and installed-project public-chain continuity.

## Acceptance Decision

`1.112` may be released only as an audit release with bounded claims. It does
not satisfy the behavioral-closure acceptance criteria in the governing plan.
`1.113` must close every P0/P1 root cause and run the cross-domain matrix before
repository structural governance begins.
