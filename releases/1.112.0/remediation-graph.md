# IntentOS 1.113 Remediation Graph

## Purpose

This graph converts the 1.112 findings into bounded root-cause hardcuts. It is
an implementation input, not a new runtime authority or public workflow.

## Root Causes

| Root | Shared cause | Findings / domains | Required result |
|---|---|---|---|
| RC1 | Finish precedence permits a success pair to outrank failed mandatory sources. | P0-112-001; Domains 7-8 | Any failed, invalid, missing, stale, or mismatched applicable source dominates completion. |
| RC2 | Checker success has inconsistent meaning: valid artifact, ready state, or applicable control can all be represented as `PASS`. | P1-112-002, P1-112-003, P2-112-001; Domains 4-6 | One typed consumer result distinguishes `VALID`, `READY`, `NOT_APPLICABLE_WITH_EVIDENCE`, `BLOCKED`, `MISSING`, and `INVALID`. Required consumers accept only their named states. |
| RC3 | Minimum task obligations are coupled to optional Business Universe depth. | P1-112-001; Domains 2-3, 7-8 | Every behavior task has proportional but non-empty business, impact, verification, and completion obligations. Business Universe adds depth; it never removes the minimum chain. |
| RC4 | The effective guidance graph covers selected source guidance and generators, not all outputs that govern real Codex behavior. | P1-112-005; Domains 1, 6, 8-9 | Current runtime, generated, Starter, installed, prompt, Agent, and user-output guidance is discoverable and checked through one responsibility contract. |
| RC5 | Completion Evidence trusts Execution Assurance structure and bindings without independently running its strict behavioral checker. | P1-112-004; Domains 6-8 | Completion Evidence consumes a current strict Execution Assurance result or an equivalent signed authority envelope derived from current reality. |
| RC6 | Completion Evidence and legacy Unified Closure remain parallel close-out authorities. | P0-112-001, P1-112-004; Domain 8 | One final close-out authority consumes Completion Evidence. Legacy closure becomes a derived explanation/input and cannot independently support `DONE`. |
| RC7 | Public and generated consumers use compatibility skip modes for required baseline and change-boundary controls. | P1-112-002, P1-112-003; Domains 4-5 | Applicability is decided before invocation; applicable routes require evidence and exact current diff/selection, while non-applicable routes carry a reason. |
| RC8 | Distribution tests do not always prove future-session behavior activation and public downstream continuity. | P2-112-003, P2-112-005; Domains 1, 5, 9 | Source, generated, installed, updated, and next-session probes observe the same repaired consumer behavior. |

## Execution Order

### Slice A: Completion Authority Hardcut

1. Move `sourceFailure` and failed applicable gate precedence ahead of every
   FINISH success branch.
2. Require Completion Evidence as the final technical evidence source for
   `DONE`.
3. Make legacy Unified Closure derived-only and explanatory.
4. Add contradictory-source and failed-gate adversarial tests at the public
   `work/finish` entry.

Acceptance:

- no failed source can coexist with `READY_TO_REPORT_DONE`;
- no absent Completion Evidence can return `REPORT_TASK_COMPLETE`;
- source and installed-project public-entry tests fail before the reporting
  action for copied, stale, missing, and contradictory evidence.

### Slice B: Typed Strict Consumer Contract

1. Define an internal typed outcome envelope without creating a new artifact
   family or user-visible state machine.
2. Adapt gate consumers to distinguish artifact validity from readiness and
   applicability.
3. Require report presence in applicable Change Boundary and Standard Baseline
   Selection consumers.
4. Require exact live diff or approved pre-write manifest where the route
   claims boundary enforcement.

Acceptance:

- `PLAN_REVISION_REQUIRED` remains valid but cannot be represented as ready;
- missing applicable boundary or baseline evidence fails;
- `NOT_APPLICABLE_WITH_EVIDENCE` remains lightweight and explicit;
- no user selects strictness or internal command flags.

### Slice C: Task Obligation Hardcut

1. Derive minimum task obligations from task kind and impact, independently of
   Business Universe.
2. Expand Business Universe evidence inspection beyond one semantic line and
   represent unsupported/truncated discovery as technical inspection needed.
3. Keep Business Universe conditional and proportional.
4. Ensure LOW has bounded scope, actual diff, targeted verification, and a
   lightweight completion contract; MEDIUM/POSSIBLE_HIGH/HIGH add depth.

Acceptance:

- the order-filter reproduction cannot disable Business Rule, Impact,
  Verification, and Completion obligations;
- non-behavioral LOW work remains lightweight;
- POSSIBLE_HIGH never receives a no-evidence completion route;
- missing technical discovery stays Codex-owned.

### Slice D: Execution Assurance Authority Consumption

1. Add a reusable strict Execution Assurance validation function or signed
   checker outcome envelope.
2. Recompute actual diff, plan/review bindings, tests, runtime evidence, and
   authority immediately at Completion Evidence consumption.
3. Invalidate Completion Evidence on source, task, intent, revision, worktree,
   plan, or evidence drift.
4. Add a current-format adversarial fixture that is schema-consistent but fails
   an Execution Assurance behavioral gate.

Acceptance:

- Completion Evidence rejects the adversarial current-format fixture;
- a valid current chain still passes;
- project-local schemas or copied reports cannot weaken the check.

### Slice E: Effective Guidance And Distribution Hardcut

1. Build the effective graph from actual runtime producers, CLI routes,
   generated text, Agent/Prompt references, Starters, and installed assets.
2. Apply the four permitted user-input classes to every current output.
3. Remove generic technical approval and generic owner decisions from active
   closure, hook, debt, baseline, adoption, and release-readiness outputs.
4. Preserve exact real-world consent and unavailable fact requests.

Acceptance:

- the four reproduced omitted scripts are in the graph;
- current graph checks detect their historical conflicting language;
- generated and installed next-session probes preserve the same contract;
- zero-experience users never choose architecture, baseline, test depth,
  reviewer, hook policy, risk treatment, or technical readiness.

### Slice F: Release And Adoption Continuity Proof

1. Keep current exact external-effect action authority unchanged.
2. Prove the public release route reaches all applicable strict source systems
   before presenting exact consent.
3. Prove an applied existing-project adoption affects the next Codex session,
   not only files and receipts.
4. Add interruption probes for controlled apply without weakening current
   caught-failure rollback.

Acceptance:

- no public route stops at a success-like view while a required release source
  is absent;
- deploy/submit/migration/rollback external effects remain `HUMAN_REQUIRED`;
- copied or inactive adoption evidence cannot claim active IntentOS behavior;
- interrupted apply is recoverable and never `APPLY_VERIFIED` unless complete.

## Cross-Slice Invariants

- No new public command, lifecycle, workflow, or user technical-choice menu.
- No audit report becomes runtime authority.
- No compatibility skip reaches an applicable strict consumer.
- No technical blocker becomes a request for user approval.
- No external effect is authorized by technical readiness.
- No broad repository reorganization starts before all P0/P1 findings close.
- Every slice includes source, generated, installed, positive, and adversarial
  evidence where the changed behavior is distributed.

## 1.113 Completion Rule

1. Every P0/P1 finding in the 1.112 report is closed by a current test.
2. All nineteen consumer edges are reclassified with evidence.
3. The nine-domain matrix has no `FAIL_OPEN`, `DUPLICATE_AUTHORITY`, or
   P0/P1 `DISCONNECTED_CONSUMER` result.
4. Full clean-checkout verification passes.
5. Independent read-only review accepts the exact candidate.
6. Only then may 1.114 structural governance begin.
