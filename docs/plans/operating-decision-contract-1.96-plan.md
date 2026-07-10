# IntentOS 1.96 Operating Decision Contract Execution And Acceptance Plan

## 1. Purpose

IntentOS 1.95 established one public `work` entry and one derived Operating
State. It can identify the current lifecycle operation, aggregate source-system
results, explain evidence, and recommend authority. Its remaining gap is that
`nextSafeAction` is primarily plain language. Codex and CI cannot reliably
distinguish the selected action, its reason, its blockers, and whether the
action is read-only without interpreting prose.

1.96 adds one structured Operating Decision Contract inside the existing
Operating State:

```text
existing authoritative source systems
-> derived Operating State
-> one derived Operating Decision
-> one matching beginner explanation
```

The contract answers:

- what is the one next action;
- why that action was selected;
- which source outcomes and blockers support it;
- whether a human decision is needed now;
- whether Codex may continue with read-only work;
- which changes invalidate the decision.

## 2. Architectural Position

The Operating Decision is a computed view. It is not a decision authority,
scheduler, workflow engine, approval, task-state transition, or execution
permission.

The source systems remain authoritative:

```text
Workflow Next / Workflow Guidance
Task Governance / User Delivery Console
Unified Closure / Release Guide / Adoption Autopilot
```

The Operating Decision may select one next source-system action. It must not
declare that the selected source system passed, write its artifact, or perform
the material action.

## 3. Scope

1.96 includes:

- a structured `operatingDecision` object in `INTENTOS_OPERATING_STATE`;
- deterministic action selection and precedence;
- stable action, reason, status, and action-class vocabularies;
- source references and blocker propagation;
- read-only and material-action boundary fields;
- human-summary generation from the same selected decision;
- CLI, generated-project, CI, documentation, manifest, and release coverage.

1.96 does not include:

- a new public command;
- a persisted operating-decision artifact;
- a new checker family or approval system;
- automatic implementation, apply, release, migration, commit, or push;
- project identity consolidation;
- removal of lower-level source systems or commands;
- automatic resolution of project authority or owner identity.

## 4. Contract

Every `work --json` response contains exactly one `operatingDecision`:

```json
{
  "contractVersion": "1.96.0",
  "derivedOnly": "Yes",
  "actionCode": "PREPARE_CHANGE_IMPACT_COVERAGE",
  "actionClass": "GOVERNANCE_PREPARATION",
  "decisionStatus": "ACTION_REQUIRED",
  "reasonCode": "TASK_GOVERNANCE_BLOCKED",
  "reason": "Task Governance requires an affected-surface map.",
  "blockedBy": ["missing affected-surface map"],
  "sourceInputs": [
    {
      "sourceSystem": "TASK_GOVERNANCE",
      "ref": "task-governance-reports/generated.md",
      "outcome": "HIGH_REQUIRES_FULL_GOVERNANCE",
      "readStatus": "CURRENT_RUN",
      "semanticDigest": "sha256:..."
    }
  ],
  "requiresHumanDecisionNow": "No",
  "humanDecisionPrompt": "No additional product decision is required now.",
  "canCodexContinueReadOnly": "Yes",
  "materialActionAuthorized": "No",
  "plainAction": "Codex should prepare the affected-surface map before implementation review.",
  "decisionDigest": "sha256:...",
  "invalidationConditions": []
}
```

Required invariants:

- exactly one `actionCode` is selected;
- `sourceInputs` only references sources read by the current Operating State;
- `blockedBy` preserves source-system blocker meaning;
- `plainAction` and Human Summary describe the same action;
- `materialActionAuthorized` is always `No` in 1.96;
- a source-read failure selects a blocking action before every other rule;
- the digest excludes timestamps and localized prose;
- the decision is not persisted as a new artifact.

## 5. Action Vocabulary

Canonical action codes:

| Action code | Meaning |
|---|---|
| `REPAIR_SOURCE_READ` | A required source failed and must be explained or repaired. |
| `REQUEST_GOAL` | No usable user goal was supplied. |
| `REVIEW_CURRENT_WORK` | Existing uncommitted work must be mapped before continuing. |
| `PREPARE_PROJECT_PLAN` | Prepare the new-project plan and baseline recommendation. |
| `RUN_ADOPTION_REVIEW` | Run the read-only existing-project adoption route. |
| `SUMMARIZE_CURRENT_STATUS` | Summarize current delivery evidence and gaps. |
| `INSPECT_TASK_RISK` | Resolve a `POSSIBLE_HIGH` task through read-only inspection. |
| `RESOLVE_ADOPTION_BLOCKER` | Current adoption evidence blocks task governance. |
| `PREPARE_BUSINESS_RULE_CLOSURE` | Clarify the business-rule closure required by Task Governance. |
| `PREPARE_CHANGE_IMPACT_COVERAGE` | Prepare the affected-surface map required by Task Governance. |
| `PREPARE_EXECUTION_PLAN` | Prepare the durable execution plan required by Task Governance. |
| `PREPARE_VERIFICATION_PLAN` | Prepare the verification plan required by Task Governance. |
| `COMPLETE_TASK_GOVERNANCE_PREREQUISITES` | Resolve a task-governance blocker not represented by a narrower code. |
| `PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW` | Prepare bounded review for a LOW task. |
| `PREPARE_IMPLEMENTATION_REVIEW` | Prepare targeted or full implementation review. |
| `COMPLETE_CLOSURE_EVIDENCE` | Closure evidence is insufficient to report completion. |
| `REPORT_TASK_COMPLETE` | Current closure evidence permits a completion report. |
| `PREPARE_RELEASE_REVIEW` | Prepare release-review evidence without executing release. |

No action code means that implementation, apply, release, or production is
authorized.

## 6. Action Classes And Status

Action classes:

- `BLOCKED_RECOVERY`
- `USER_INPUT`
- `READ_ONLY_REVIEW`
- `GOVERNANCE_PREPARATION`
- `IMPLEMENTATION_REVIEW_PREPARATION`
- `REPORTING`
- `RELEASE_REVIEW_PREPARATION`

Decision statuses:

- `BLOCKED`
- `NEEDS_USER_INPUT`
- `READ_ONLY_ACTION_REQUIRED`
- `ACTION_REQUIRED`
- `READY_FOR_REVIEW_PREPARATION`
- `READY_TO_REPORT`

These values describe the next safe route. They are not task states and must
not be written into Work Queue, closure, release, or adoption artifacts.

## 7. Precedence

The first matching rule wins:

1. required source read failed;
2. goal is missing;
3. dirty worktree requires current-work review;
4. explicit project start;
5. existing-project adoption;
6. status request;
7. task-finish request;
8. release-preparation request;
9. task impact requires clarification;
10. Task Governance reports an adoption blocker;
11. Task Governance reports a specific implementation prerequisite;
12. Task Governance is ready for implementation review;
13. fail closed to unresolved task-governance prerequisites.

The resolver must not choose a later, easier rule when an earlier blocker is
present.

## 8. Task-Governance Blocker Mapping

Blocker text is source-owned. The Operating Decision may map known blockers to
stable action codes but must keep the original blocker in `blockedBy`.

| Source blocker meaning | Action |
|---|---|
| adoption review blocks task governance | `RESOLVE_ADOPTION_BLOCKER` |
| business rule missing | `PREPARE_BUSINESS_RULE_CLOSURE` |
| affected-surface map missing | `PREPARE_CHANGE_IMPACT_COVERAGE` |
| durable execution plan missing | `PREPARE_EXECUTION_PLAN` |
| verification checklist missing | `PREPARE_VERIFICATION_PLAN` |
| unrecognized task-governance blocker | `COMPLETE_TASK_GOVERNANCE_PREREQUISITES` |

1.96 does not independently inspect artifact directories to overrule Task
Governance. If Task Governance cannot recognize completed prerequisites, that
is a source-system integration gap and must remain visible rather than being
silently bypassed by the Operating Decision.

## 9. Evidence And Traceability

`sourceInputs` is selected from the current `sourceSystemTrace`. It records:

- source-system name;
- current ref;
- current outcome;
- read status;
- semantic digest of the current source output with volatile generation time
  excluded.

The decision digest binds:

- intent or task reference;
- Project Entry;
- current operation and Operating State;
- action, reason code, and blockers;
- source-system refs, outcomes, read statuses, and semantic digests.

The digest does not prove source validity. Strict source checkers remain the
only authority for their own artifacts.

## 10. Authority Boundary

Authority Recommendation remains a recommendation. Operating Decision may use
it to state that a human decision is needed, but it cannot:

- invent or assign an owner;
- treat a recommended role as the actual owner;
- treat historical approval text as current approval;
- grant implementation, apply, release, or production permission;
- replace a structured Approval Record or project-native approval process.

`requiresHumanDecisionNow` is `Yes` only when the next route genuinely cannot
continue read-only without a user or project-owner decision. Technical routing
and internal action-code selection are Codex responsibilities.

## 11. Beginner Experience

The default human output continues to show:

```text
current status
understood goal
one next safe action
at most one decision
```

The next action is rendered from `operatingDecision.plainAction`. The CLI must
not tell ordinary users to choose `business-rule`, `impact-coverage`,
`plan-review`, or other internal command names.

## 12. Failure And Conflict Handling

- source failure selects `REPAIR_SOURCE_READ` and `BLOCKED`;
- missing goal selects `REQUEST_GOAL` and `NEEDS_USER_INPUT`;
- dirty worktree selects `REVIEW_CURRENT_WORK` before task preparation;
- `POSSIBLE_HIGH` selects read-only risk inspection;
- conflicting source outcomes choose the stricter safe route;
- unknown blocker meaning uses the generic fail-closed governance action;
- invalid or missing source refs remain visible and are not rewritten as PASS.

## 13. Implementation Surfaces

Primary implementation:

- `scripts/resolve-operating-loop.mjs`
- `tests/operating-model.test.mjs`
- `scripts/check-intentos.mjs`

Contract and usage documentation:

- `core/operating-model.md`
- `docs/operating-model.md`
- `README.md`
- `README.zh-CN.md`
- `VERSION.md`

Distribution and release:

- `intentos-manifest.json`
- `package.json`
- `templates/version-record.md`
- `releases/1.96.0/*`
- PR and release workflow smoke assertions

No new target-project artifact directory is allowed.

## 14. Acceptance Matrix

Required positive cases:

1. missing goal -> `REQUEST_GOAL`;
2. dirty worktree -> `REVIEW_CURRENT_WORK`;
3. new project -> `PREPARE_PROJECT_PLAN`;
4. old-project adoption -> `RUN_ADOPTION_REVIEW`;
5. status request -> `SUMMARIZE_CURRENT_STATUS`;
6. LOW task -> `PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW`;
7. MEDIUM ready task -> `PREPARE_IMPLEMENTATION_REVIEW`;
8. `POSSIBLE_HIGH` -> `INSPECT_TASK_RISK`;
9. HIGH missing business rule -> `PREPARE_BUSINESS_RULE_CLOSURE`;
10. finish without valid evidence -> `COMPLETE_CLOSURE_EVIDENCE`;
11. valid completion -> `REPORT_TASK_COMPLETE`;
12. release preparation -> `PREPARE_RELEASE_REVIEW`;
13. source failure -> `REPAIR_SOURCE_READ`.

Required invariant and negative cases:

- exactly one action code per response;
- Human Summary action equals decision action;
- all source inputs were read in the current response;
- digest is stable when semantic inputs are stable;
- timestamp and language do not change the semantic digest;
- unknown blockers fail closed;
- no material action is authorized;
- no operating-decision artifact directory is installed;
- generated projects receive the same contract;
- beginner help still exposes only `work`;
- advanced commands remain available.

## 15. Verification

Required commands:

```bash
node --check scripts/resolve-operating-loop.mjs
node --test tests/operating-model.test.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
npm run verify
git diff --check
```

## 16. Release Claims

Allowed:

- `work` returns one structured, derived next-action decision;
- the decision explains reason, blockers, source inputs, and invalidation;
- Human Summary is generated from the same action selection;
- source systems and project authority remain authoritative.

Forbidden:

- IntentOS now autonomously approves or executes every next step;
- the Operating Decision replaces Task Governance, closure, adoption, release,
  or approval systems;
- an action code proves the referenced evidence is valid;
- a recommended owner is the actual authorized owner;
- the decision guarantees product correctness or production safety.

## 17. Follow-Up Boundary

Project Identity Projection belongs to 1.97. Internal surface consolidation
beyond the existing public/advanced split belongs to 1.98. Neither may be
pulled into 1.96 as an implementation shortcut.
