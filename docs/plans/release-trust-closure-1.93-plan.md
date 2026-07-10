# Release Trust Closure 1.93 Execution And Acceptance Plan

## 1. Purpose

IntentOS 1.80 can prove that release-review evidence exists, 1.86 can classify
runtime and Git hygiene, and 1.87 can describe the actual release channel.
Release Execution still accepts approval and readiness claims from ordinary
Markdown or command-line arguments and does not require those three authority
sources to refer to the same project, revision, candidate, package, and target.

1.93 closes that gap:

```text
current project and Git identity
-> exact release candidate and package identity
-> strict Release Evidence Gate
-> strict Runtime Hygiene
-> strict Release Channel Policy
-> strict platform recipe / handoff when required
-> project-bound human Release Approval Record
-> derived Release Execution Plan
-> human or external release system
```

The user confirms the release intent and the final professional recommendation.
Codex resolves and checks technical evidence. The user is not asked to compare
digests, choose checkers, or decide whether a release channel is trustworthy.

## 2. Architectural Position

1.93 does not add another release subsystem. It hardens the existing release
chain by adding one human-owned authority artifact and making Release Execution
a strict consumer of existing source systems.

- Release Evidence Gate remains the task/build/runtime/rollback readiness source.
- Runtime Hygiene remains the current Git/CI/runtime safety source.
- Release Channel Policy remains the channel/package/cost/owner source.
- Platform Recipe and Handoff Pack remain platform-specific inputs.
- Release Approval Record is the only release authorization source.
- Release Execution Plan is a derived plan and never an authority source.

## 3. Non-Goals

1.93 does not:

- deploy production, publish a store build, release a mini program, change DNS,
  rotate secrets, execute migrations, modify payment/permissions, or become the
  release owner;
- infer approval from words such as `approved`, `同意`, or `可以上线`;
- accept command-line `--approval-status APPROVED` as release authority;
- treat a tag, branch, GitHub Release, Actions artifact, package name, recipe,
  Launch Review View, or Release Plan as approval;
- allow a draft platform recipe to unlock a production-like handoff;
- let a copied, expired, stale, wrong-project, wrong-revision, wrong-candidate,
  or wrong-target approval unlock Release Execution;
- guarantee product correctness, real-user stability, legal/compliance safety,
  or successful production operation.

## 4. Release Trust Identity

Every trusted release decision binds:

- project kind, project fingerprint, and current Git revision;
- exact release target;
- release candidate project-relative ref and SHA-256 digest;
- candidate source revision;
- package identity type, ref, and digest/ID when applicable;
- included task and Completion Evidence set identity;
- Release Evidence Gate ref and digest;
- Runtime Hygiene ref and digest;
- Release Channel Policy ref and digest;
- strict platform recipe ref/digest for app-store, mini-program, provider,
  registry, or other platform-specific release targets;
- Release Handoff Pack ref/digest when a handoff is required.

Any current mismatch invalidates release execution readiness.

## 5. Release Approval Record

Add a structured `release_approval_record` artifact:

- `core/release-approval-record.md`
- `docs/release-approval-record.md`
- `templates/release-approval-record.md`
- `schemas/artifacts/release-approval-record.schema.json`
- `scripts/check-release-approval-record.mjs`
- `release-approval-records/`

The record is valid only when:

- `approval_status` is explicit and human-owned;
- approver, release owner, approval time, and expiry are concrete;
- current project/Git identity matches;
- candidate, target, source revision, package identity, and upstream evidence
  all match current project-local artifacts;
- every upstream authority checker passes in strict mode;
- allowed Codex actions are bounded to low-risk verification, build, packaging,
  evidence capture, or handoff preparation;
- production deploy, store/mini-program submission, migrations, secrets, DNS,
  payment, permissions, production config, and rollback execution remain human
  or external-system owned.

Approval states:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `EXPIRED`
- `INVALIDATED`

Only current `APPROVED` evidence can unlock a release execution review.

## 6. Release Execution Consumer Hardcut

`resolve-release-execution.mjs` and `check-release-execution.mjs` must:

1. stop parsing ordinary text for approval;
2. ignore self-declared `APPROVED` command arguments as authority;
3. resolve one exact structured Release Approval Record;
4. consume the exact Release Evidence Gate, Runtime Hygiene, Release Channel
   Policy, recipe, handoff, and candidate bound by that approval;
5. rerun their authoritative checkers rather than trust copied status strings;
6. compare project, revision, target, candidate, package, task, and digest fields;
7. fail closed when a required report is absent;
8. expose one derived execution result with an explanation trace.

Execution states remain bounded:

- `PLAN_ONLY`
- `BLOCKED`
- `HUMAN_EXECUTION_HANDOFF`
- `ASSISTED_EXECUTION`

`ASSISTED_EXECUTION` permits only approval-listed low-risk steps. High-risk
release actions remain `HUMAN_REQUIRED` or external-system owned.

## 7. Platform And Channel Rules

- Production-like web/server releases require strict channel, rollback,
  monitoring, incident owner, and package/candidate identity.
- iOS/Android store handoff and mini-program review require `STRICT` platform
  recipes and a matching handoff pack.
- Draft recipes are planning inputs only.
- Git tags and GitHub Releases are source/channel identities, never approval.
- GitHub Actions artifacts require a matching retention/cost owner policy and
  exact package identity.
- Existing project release SOPs remain authoritative when stricter.

## 8. User Experience

The public interaction stays:

```text
User: prepare/release this version
Codex: verifies candidate and release chain
Codex: recommends release, blocks it, or asks for one meaningful approval
User: confirms or rejects the bounded recommendation
Codex: records structured approval and prepares only allowed execution/handoff
```

Technical failures are translated into one plain result: what is ready, what is
missing, whether Codex can assist, who owns the next action, and what happens if
the user does nothing.

## 9. Implementation Work Packages

### WP1 - Release Authority Core

- add release approval protocol, schema, template, checker, CLI entry, and
  artifact directory;
- add shared release-trust validation helpers;
- bind project/Git/candidate/package/upstream identities.

### WP2 - Strict Upstream Consumption

- require and rerun Release Evidence Gate strict ready checks;
- require Runtime Hygiene structured current-release checks;
- require Release Channel Policy strict source binding;
- require strict recipe and handoff evidence for platform-specific targets.

### WP3 - Execution Plan Hardcut

- remove text-search approval fallback;
- prevent `--approval-status` from authorizing execution;
- derive execution readiness only from the valid approval trust bundle;
- add machine-readable execution evidence and explanation trace;
- keep all high-risk release steps human/external owned.

### WP4 - Product Integration

- update CLI, manifest, generated project assets, references, README files,
  version files, release evidence, starter governance, and self-checks;
- preserve old plan-only Markdown compatibility without allowing it to unlock
  real execution.

## 10. Acceptance Matrix

| ID | Scenario | Expected result |
|---|---|---|
| R01 | Exact current trust bundle + human approval | eligible for bounded execution review |
| R02 | Plain Markdown contains `approved` | blocked |
| R03 | `--approval-status APPROVED` without record | blocked |
| R04 | Approval copied from another project | blocked |
| R05 | Project HEAD changes after approval | blocked |
| R06 | Candidate file changes after approval | blocked |
| R07 | Candidate source revision differs from HEAD | blocked |
| R08 | Release target differs across records | blocked |
| R09 | Package identity differs across records | blocked |
| R10 | Release Evidence Gate missing | blocked |
| R11 | Release Evidence Gate not strict-ready | blocked |
| R12 | Runtime Hygiene missing or unsafe | blocked |
| R13 | Release Channel Policy missing or stale | blocked |
| R14 | Required platform recipe is DRAFT | blocked |
| R15 | Required handoff pack missing | blocked |
| R16 | Approval expired, rejected, or non-human | blocked |
| R17 | Approval allows high-risk Codex action | blocked |
| R18 | Release plan self-declares gate PASS | still blocked |
| R19 | Tag or GitHub Release treated as approval | blocked |
| R20 | Valid assisted mode | only listed low-risk steps eligible |
| R21 | Valid production handoff | production action remains human/external |
| R22 | Existing stricter release SOP | preserved and required |
| R23 | Symlink or outside-project evidence ref | blocked |
| R24 | No release claim and no records | explicit skip remains non-authorizing |
| R25 | Full repository verification | passes |

## 11. Verification Commands

```bash
node scripts/check-release-approval-record.mjs <project> --require-structured-evidence
node scripts/check-release-evidence-gate.mjs <project> --require-report --require-structured-evidence --require-ready
node scripts/check-runtime-hygiene.mjs <project> --require-report --require-structured-evidence
node scripts/check-release-channel-policy.mjs <project> --require-report --require-structured-evidence --strict-source-binding
node scripts/check-release-execution.mjs <project> --require-release-trust
node scripts/check-intentos.mjs --mode full
npm run verify
npm run verify:syntax
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs
node scripts/check-claim-control.mjs
git diff --check
```

## 12. Release Evidence

Create `releases/1.93.0/release-record.md`, `known-limitations.md`, and
`self-check-report.md`.

Allowed claim: IntentOS can verify that one human release approval is bound to
the current project, revision, candidate, target, package identity, and strict
release authority inputs before Release Execution becomes eligible.

Forbidden claim: IntentOS approves or guarantees a production release, or
automatically executes high-risk release actions.

## 13. Completion Criteria

1. Ordinary text and CLI status flags cannot authorize release execution.
2. Release Approval Record is project-, revision-, candidate-, and target-bound.
3. Release Execution reruns all required source authority checks.
4. Missing, stale, copied, mismatched, draft, expired, or unsafe evidence fails
   closed.
5. High-risk actions remain human/external-system owned.
6. Users receive one plain recommendation rather than internal checker choices.
7. Positive, negative, generated-project, manifest, product, claim, syntax, and
   full repository verification pass.
