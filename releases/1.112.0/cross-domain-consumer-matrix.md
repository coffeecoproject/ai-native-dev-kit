# IntentOS 1.112 Cross-Domain Consumer Matrix

## Status

Initial audit model. Every edge remains `UNPROVEN` until source production,
strict checking, current identity, required consumer use, execution effect,
distribution parity, and a meaningful negative case are all proved.

This matrix is derived review evidence. It is not a runtime dependency
registry, implementation plan, completion authority, apply permission, or
release approval.

## Audit Binding

- Audit commit: `f37436a3102b6b0c96a39aa29d4910bd802a5ffc`
- Frozen behavior baseline: `cc321791f9bb41ee7d4d300970cf0aa07eff2d81`
- IntentOS version: `1.111.1`
- Capability map: `releases/1.112.0/capability-authority-map.md`
- Excluded concurrent worktree item:
  `docs/plans/controlled-adoption-change-attribution-auto-closeout.md`

## Edge Acceptance Rule

An edge is closed only when all of the following are true:

1. the upstream question has one current authority;
2. the producer emits current project, task, intent, and revision identity as
   applicable;
3. a strict checker rejects missing, malformed, stale, copied, conflicting,
   placeholder, or unsafe evidence;
4. the named downstream consumer requires the checked result for the
   applicable route;
5. the result changes execution or final status rather than only appearing in
   an explanation;
6. source, installed, updated, and generated projects preserve the edge;
7. positive and adversarial tests prove both pass and fail behavior;
8. failure does not become a technical choice for the zero-experience user.

## Consumer Edges

| ID | Required edge | Current producer / checker | Required consumer / effect | Proof still required | Initial label |
|---|---|---|---|---|---|
| E01 | Project Entry Trust -> public operation | `project-entry-trust` library and entry/calibration checkers | `resolve-operating-loop` must block operations that the exact entry transaction does not permit | New, existing, governed, dirty, production-sensitive, installed, and generated negative routes | `UNPROVEN` |
| E02 | Project Entry -> Work Queue and Task Governance | `resolve-operating-loop` invokes queue and task sources for continuing/status/finish/resume routes | No implementation or completion route may proceed without one current task identity | Unknown intent, false new-project classification, missing queue, multiple current items, interruption, and resume | `UNPROVEN` |
| E03 | Existing-project rule reconciliation -> selected adoption | Native migration, rule reconciliation, convergence, and adoption assurance checkers | Unified Apply Plan and future entry must use only reconciled selected actions and post-apply activation | Copied plan, mismatched project/revision, omitted rule, partial apply, and future-session activation | `UNPROVEN` |
| E04 | Task Governance -> proportional mandatory chain | `resolve-task-governance` and strict checker | Business, impact, plan, runtime, review, and completion consumers must follow the current tier without making LOW unverified | LOW, MEDIUM, POSSIBLE_HIGH, HIGH, unknown destructive intent, installed parity | `UNPROVEN` |
| E05 | Work Queue / conversation state -> current-task continuity | Work Queue, takeover, conversation-drift, and Goal Mode sources | Planning, Subagents, implementation, evidence, and finish must remain bound to the one current task across interruption/resume | Multiple CURRENT, forged resume, new discussion, temporary diversion, long-running task | `UNPROVEN` |
| E06 | Business Universe -> Business Rule Closure | Business Universe resolver/checker and Task Governance routing | Required categories, lifecycle stages, real paths, reverse paths, and obligations must enter Business Rule Closure | Missing category, missing reversal, seed/mock-only path, unsupported exclusion, NOT_REQUIRED misuse | `UNPROVEN` |
| E07 | Business Rule -> Change Impact -> Verification obligations | Business Rule, Change Impact, and Verification Plan strict artifacts | Every applicable rule/scenario/surface must produce a verification obligation and later evidence | Backend-only partial implementation, missing UI/API/data/permission surface, scenario ID loss | `UNPROVEN` |
| E08 | Change Boundary / reviewed plan -> actual diff | Change Boundary and Plan Review sources | Execution Assurance must compare the real diff and generated writes with reviewed scope and exclusions | Extra file, deletion, symlink target, generated file, post-review change, patch accumulation | `UNPROVEN` |
| E09 | Project baselines / reconciled stronger rules -> execution | Baseline selectors/installers and existing-rule reconciliation | Planning, implementation, verification, apply, and release must consume selected and actually satisfied constraints | Wrong platform pack, empty BL2 evidence, missing environment baseline, stronger project rule conflict | `UNPROVEN` |
| E10 | Planning Closure / Plan Review -> implementation entry | Planning Closure and Plan Review checkers plus Execution Entry Contract | Writing implementation files must remain blocked until the applicable planning result is current and reviewed | Missing plan, stale digest, substituted plan, LOW exemption, installed public entry | `UNPROVEN` |
| E11 | Verification Plan -> Runtime Trust -> Test Evidence | Verification/runtime plan, lifecycle, run-manifest, and Test Evidence checkers | Test Evidence must bind the exact obligations to current code, service, resources, run, outputs, and cleanup | Old service, copied run, wrong DB/session, unsafe cleanup, command self-report, partial obligations | `UNPROVEN` |
| E12 | Plan + diff + review + tests -> Execution Assurance | Execution Assurance resolver/checker | Completion Evidence must reject unreviewed, out-of-scope, weakly tested, or self-declared execution | Missing source, report field deletion, Git mismatch, review placeholder, actual-diff omission | `UNPROVEN` |
| E13 | All applicable sources -> Completion Evidence | Completion Evidence resolver/checker | Completion Evidence must be the strict evidence gate and must fail when any required domain source fails | Missing/invalid business, impact, baseline, plan, runtime, test, control, or execution source | `UNPROVEN` |
| E14 | Completion Evidence -> Unified Closure -> public finish | Completion Evidence and closure decision checkers | `intentos finish` and Operating Model must never return `DONE` from weaker or conflicting views | Missing completion report, stale/copy, conflicting closure, unrelated historical report, installed parity | `UNPROVEN` |
| E15 | Unified Closure + launch sources -> exact release consent | Unified Closure, Launch Review, release route/topology/evidence/approval checkers | Only a prepared concrete external effect may be presented for consent; readiness cannot authorize it | Generic approval, mismatched candidate/platform/channel, absent launch review, old package identity | `UNPROVEN` |
| E16 | Release approval -> bounded execution -> observation/rollback | Structured approval and Release Execution source chain | Codex may run only local-safe approved actions; external effect remains user/external-system owned and exact | Forbidden action in assisted mode, partial evidence, failed execution, rollback, post-release observation | `UNPROVEN` |
| E17 | Approved action graph -> atomic apply -> receipt | Apply Plan, Approval, Readiness, path-safety, executor, and Receipt | Writes must replay only the approved graph and either complete atomically or produce reliable rollback evidence | Plan mutation, target mutation, write failure, symlink, partial install, BLOCKED readiness | `UNPROVEN` |
| E18 | Apply Receipt -> activation -> future Project Entry | Adoption activation and assurance consumers | A later Codex session must observe the actually applied IntentOS behavior without trusting a claim-only report | Copied receipt, wrong project/Git, incomplete assets, inactive agent entry, future-session simulation | `UNPROVEN` |
| E19 | Escaped defect / repeated finding -> governed evolution | Review Loop, debt, document, Skill, automation, and daily-summary tools | Output remains a reviewable candidate and cannot silently mutate active guidance, hooks, CI, Skills, or release | Candidate auto-activation, stale finding, duplicate doc authority, unsafe archive/delete | `UNPROVEN` |

## Shared Identity Dimensions

Each applicable edge must bind the identity dimensions below. `N/A` requires
evidence; it is not an empty-field escape.

| Dimension | Required when |
|---|---|
| Project identity | always for project-local evidence and installation |
| Task reference | any task-scoped planning, execution, verification, or closure |
| Intent digest | task meaning can differ while a title or path remains stable |
| Source revision | code, config, generated assets, tests, apply, or release can change |
| Worktree / source digest | uncommitted or non-Git content affects the result |
| Plan digest | execution or apply is authorized by a reviewed plan |
| Evidence digest | a downstream consumer relies on a particular artifact |
| Runtime run ID | evidence depends on a service, process, container, or isolated resource |
| Candidate / package identity | launch or release is being prepared or executed |
| Exact external effect | current-user consent is required |

## Current Audit Questions

- Does the public Operating Model aggregate strict checker outcomes, or can a
  success-like derived source outweigh a failed gate?
- Does Completion Evidence consume every routed requirement from Task
  Governance, or only requirements explicitly provided on the command line?
- Can compatibility `allow-empty` modes reach a required public consumer?
- Do installed projects use trusted IntentOS schemas and libraries rather than
  project-replaceable authorities?
- Can any generated or copied report satisfy identity without current
  source/runtime recomputation?
- Do selected baselines and industrial packs prove installed capability, not
  only selection intent?
- Does Release Execution authorize only exact local-safe action IDs from the
  structured approval source chain?
- Does failed apply restore all prior bytes and leave an accurate receipt?

## Promotion Rule

No edge may move from `UNPROVEN` because an import, subprocess call, Manifest
entry, documentation statement, release record, or positive fixture exists.
Promotion requires current strict behavior and at least one adversarial case
that fails at the named downstream consumer.

## Audit Classification

| Edge | Audit label | Evidence summary |
|---|---|---|
| E01 | `PARTIAL` | Project Entry Trust is strict, but full active-output and next-session parity is not proved. |
| E02 | `PARTIAL` | Public route invokes queue and task sources; continuity and fallback behavior need adversarial closure. |
| E03 | `PARTIAL` | Apply/activation receipt validation exists; future-session behavior proof remains incomplete. |
| E04 | `FAIL_OPEN` | Non-HIGH minimum obligations can disappear when optional Business Universe routing is `No`. |
| E05 | `PARTIAL` | Current-task checks exist; Markdown fallback, takeover, and resume need full matrix proof. |
| E06 | `FAIL_OPEN` | Single-line structural discovery can falsely classify Business Universe as not required. |
| E07 | `FAIL_OPEN` | A false not-required Universe result removes Business Rule, Impact, and Verification obligations. |
| E08 | `FAIL_OPEN` | Required CI routes accept no boundary report and do not require exact current diff binding. |
| E09 | `FAIL_OPEN` | Required consumers accept no baseline selection report. |
| E10 | `PARTIAL` | Planning Closure validates current source states; generic gate result semantics remain ambiguous. |
| E11 | `PARTIAL` | Runtime and test evidence controls exist; full installed cross-chain matrix remains pending. |
| E12 | `DISCONNECTED_CONSUMER` | Completion Evidence does not independently execute strict Execution Assurance validation. |
| E13 | `DISCONNECTED_CONSUMER` | Completion Evidence validates selected sources but is not yet proved to recompute every routed domain source. |
| E14 | `FAIL_OPEN`, `DUPLICATE_AUTHORITY` | Public finish can return completion while a mandatory source is failed. |
| E15 | `PARTIAL` | Exact consent boundary exists; public route continuity through all launch/release inputs is unproved. |
| E16 | `VERIFIED_CLOSED` for action assignment | Targeted tests keep external effects human/external-system owned; observation/rollback end-to-end remains partial. |
| E17 | `PARTIAL` | Current caught-failure rollback and graph validation are substantial; interruption recovery remains unproved. |
| E18 | `PARTIAL` | Receipts and activation checks exist; future-session behavior effect needs an adversarial probe. |
| E19 | `PARTIAL` | Candidate-only rules exist; incomplete active-output governance can still reintroduce old responsibility semantics. |
