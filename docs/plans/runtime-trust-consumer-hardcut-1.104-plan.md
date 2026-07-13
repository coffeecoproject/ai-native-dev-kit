# IntentOS 1.104 Runtime Trust Consumer Hardcut Plan

## Status

Approved for implementation.

## Theme

Make current-run runtime evidence mandatory for every strict completion claim
without adding a new public workflow or asking the solo user for technical
judgment.

## Position In The Version Line

```text
1.101 Verification Runtime Trust Core
  -> 1.102 Verification Runtime Adapters
  -> 1.103 Verification Runtime Lifecycle
  -> 1.104 Runtime Trust Consumer Hardcut
```

`1.101` defines runtime trust. `1.102` selects the project adapter. `1.103`
executes a bounded local lifecycle and emits an observed Verification Run
Manifest. `1.104` makes that exact manifest a mandatory input to Test Evidence,
Execution Assurance, Completion Evidence, and the public `finish` decision.

## Problem

Before this hardcut, a current task can have a valid `1.103` Run Manifest while
downstream consumers still reach a completion-ready state from older command
output, manually written metadata, or a textual PASS claim. Different
consumers can also resolve different runtime records, producing multiple
incompatible truths for one task.

The gap is:

```text
runtime evidence exists
  != runtime evidence was validated by every completion consumer
  != every consumer used the same current-task run
```

## Product Contract

The public user remains one zero-experience solo developer. The user describes
the business behavior and supplies only unavailable business facts or consent
for a concrete external effect.

Codex must automatically:

- classify the task;
- prepare the Verification Plan, Runtime Plan, and local lifecycle declaration;
- execute the bounded lifecycle when allowed;
- select the exact current Run Manifest;
- bind it into every downstream consumer;
- repair missing technical evidence when safely possible;
- explain only the final plain-language blocker.

The user is not asked to choose a manifest, checker, adapter, port, service,
database, command, isolation mode, or evidence flag.

## Core Rule

```text
No verified current-task Run Manifest, no complete Test Evidence.
No matching Runtime Trust binding, no VERIFIED_DONE Execution Assurance.
No one-run agreement across consumers, no Completion Evidence READY.
No verified Runtime Trust input, no DONE from finish.
```

## Scope

`1.104` adds:

1. one shared Runtime Trust Consumer Authority library;
2. one strict structured Runtime Trust binding shape;
3. automatic discovery of the exact current Verification Run Manifest;
4. direct invocation of the authoritative Run Manifest checker;
5. independent task, intent, Verification Plan, project, source, and digest
   matching in every consumer;
6. Test Evidence runtime binding;
7. Execution Assurance runtime binding;
8. Completion Evidence runtime binding and cross-consumer agreement;
9. public `finish` Runtime Trust input and strict DONE blocker;
10. installed CI and generated-project strict consumer enforcement;
11. compatibility for reading historical artifacts without allowing them to
    satisfy the current strict completion chain;
12. positive, missing, stale, copied, mismatched, downgraded, and weak-evidence
    regressions.

## Shared Runtime Trust Binding

Every `1.104` structured consumer records:

```json
{
  "requirement": "REQUIRED",
  "status": "VERIFIED",
  "run_manifest_ref": "artifact:verification-run-manifests/<run>.md",
  "run_manifest_digest": "sha256:<digest>",
  "run_id": "vrun-...",
  "task_ref": "...",
  "intent_digest": "sha256:<digest>",
  "runtime_trust_level": "...",
  "runtime_plan_ref": "artifact:verification-runtime-plans/<plan>.md",
  "runtime_plan_digest": "sha256:<digest>",
  "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/<plan>.md",
  "lifecycle_plan_digest": "sha256:<digest>",
  "verification_plan_ref": "artifact:verification-plans/<plan>.md",
  "verification_plan_digest": "sha256:<digest>",
  "current_project_match": "Yes",
  "current_task_match": "Yes",
  "current_intent_match": "Yes",
  "current_verification_plan_match": "Yes",
  "checker": "scripts/check-verification-run-manifest.mjs --require-complete",
  "reason": "The exact current run passed the authoritative checker."
}
```

When evidence is unavailable or invalid, the same object records `BLOCKED`
with `N/A` identifiers and a bounded technical reason. A blocked binding can be
written for diagnosis, but it cannot support a completion-ready state.

## Runtime Consumer Authority

The shared authority must:

1. accept an explicit safe project-local manifest ref or discover the latest
   current candidate;
2. reject absolute paths, traversal, symlinks, project-external files, and
   untrusted schema sources;
3. run the installed/source authoritative
   `check-verification-run-manifest.mjs` with `--require-complete`;
4. parse the manifest using the trusted schema;
5. require schema `1.103.0` for a current strict completion chain;
6. verify the current project identity and source revision;
7. match task ref and intent digest;
8. match the exact Verification Plan when that consumer has one;
9. preserve the exact Runtime Plan and Lifecycle Plan refs and digests;
10. return one structured binding without authorizing implementation,
    completion, release, or production.

Consumers may not independently reinterpret a failed checker result as a
warning. `BLOCKED` is fail-closed.

## Consumer Rules

### Test Evidence

- Resolver automatically consumes `--runtime-manifest-ref` or the latest
  current candidate.
- Passing evidence items count only when they map to executions in the same Run
  Manifest and their output refs/digests agree.
- `TEST_EVIDENCE_COMPLETE` requires `runtime_trust_binding.status=VERIFIED`.
- Manually authored PASS metadata cannot replace the runtime receipt.

### Execution Assurance

- `VERIFIED_DONE` requires a verified Runtime Trust binding.
- Runtime binding is added to Evidence Binding and source authority.
- Actual diff, review, task governance, plan review, and runtime trust remain
  independent requirements; runtime evidence does not erase another blocker.
- Execution Assurance must not accept a different run from Test Evidence when
  Test Evidence is present.

### Completion Evidence

- `COMPLETION_EVIDENCE_READY` requires direct validation of the exact Run
  Manifest.
- Test Evidence and Execution Assurance must both bind that same manifest ref,
  digest, run ID, task ref, and intent digest.
- A missing, old-schema, copied, stale, task-mismatched, or consumer-mismatched
  run produces `BLOCKED_BY_RUNTIME_TRUST`.

### Public Finish

- Runtime Trust becomes a required decision input for `DONE`.
- `finish` discovers the current run automatically; an explicit advanced ref
  remains available for reproducible checks.
- The decision trace explains the Runtime Trust result without exposing
  internal choices to the ordinary user.
- Runtime Trust PASS does not override stricter impact, execution, review,
  human-decision, or release blockers.

## Compatibility And Hardcut

- Historical Test Evidence `1.77.1`, Execution Assurance `1.74.0`, and
  Completion Evidence `1.78.0` remain readable in compatibility mode.
- New resolvers emit schema `1.104.0` and always include Runtime Trust binding.
- Strict `--require-runtime-trust` rejects historical consumer evidence.
- Public `finish`, installed CI strict checks, and current completion claims use
  strict Runtime Trust mode by default.
- `--allow-empty` remains valid only for explicit asset-only checks and cannot
  override `--require-runtime-trust`.
- No compatibility path may turn a historical artifact into current strict
  runtime evidence.

## Zero-Experience Behavior

The ordinary interaction remains:

```text
User: 把这个功能完整做好并确认可以使用。
Codex: 自动完成任务分级、运行环境准备、验证、清理和证据收口。
```

Only unresolved business facts or a concrete real-world external effect may be
shown to the user. Missing Runtime Trust evidence is a Codex work item, not a
technical question for the user.

## Boundaries

`1.104` does not:

- add a new beginner-facing command;
- execute production, release, provider, remote, payment, DNS, permission, or
  irreversible actions;
- make Docker, Kubernetes, serverless, or app-store lifecycle executable;
- prove that a test assertion is semantically correct merely because it ran;
- let runtime evidence approve implementation, commit, push, release, or
  production;
- let a textual PASS, human confirmation, or old report replace current
  machine-bound runtime evidence;
- delete historical evidence.

## Implementation Assets

- `docs/plans/runtime-trust-consumer-hardcut-1.104-plan.md`
- `core/runtime-trust-consumer-hardcut.md`
- `docs/runtime-trust-consumer-hardcut.md`
- `checklists/runtime-trust-consumer-review.md`
- `scripts/lib/verification-runtime-consumer.mjs`
- focused consumer regressions;
- Test Evidence, Execution Assurance, Completion Evidence, and closure
  resolver/checker updates;
- schema, CLI, installed CI, Manifest, references, release metadata, and
  generated-project smoke updates.

## Acceptance

### Positive

- one valid `1.103` Run Manifest is accepted by all four consumers;
- every consumer records the same run ref, digest, run ID, task, and intent;
- Test Evidence maps passing items to exact Run Manifest execution outputs;
- Execution Assurance can reach `VERIFIED_DONE` only when all its existing
  requirements and Runtime Trust pass;
- Completion Evidence reaches READY only when upstream consumers and direct
  runtime validation agree;
- `finish` reaches DONE only when Runtime Trust and every stricter existing
  input pass;
- generated projects install and execute the strict consumer chain.

### Negative

- no Run Manifest fails strict consumers;
- `--allow-empty --require-runtime-trust` fails;
- old `1.101`/`1.102` hand-authored manifests cannot satisfy strict consumers;
- copied or symlinked manifests fail;
- stale project revision fails;
- wrong task or intent fails;
- wrong Verification Plan fails;
- Test Evidence and Execution Assurance using different runs fail Completion
  Evidence;
- manually written PASS output that is absent from the Run Manifest fails;
- incomplete cleanup or unrelated-resource mutation fails;
- Runtime Trust PASS cannot override review, impact, business, or external
  decision blockers.

### Repository

- focused Runtime Trust consumer tests pass;
- inherited 1.101-1.103 tests pass;
- strict schemas reject unknown fields and malformed bindings;
- source and generated-project checkers consume trusted schemas;
- installed CI invokes strict consumer flags;
- Manifest and workflow-version assets remain synchronized;
- full `npm run verify` and `git diff --check` pass.

## Completion Rule

`1.104` is complete only when IntentOS can prove:

```text
The same exact current-task run was independently validated by every
completion consumer, and no consumer can replace it with a textual,
historical, copied, stale, or mismatched claim.
```

This remains runtime-evidence authority, not proof of product correctness or
authorization for release or production.
