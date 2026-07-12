# IntentOS 1.100 Execution Authority And Consumer Hardcut Plan

## 1. Purpose

IntentOS 1.99.3 closed review-context drift and restored source, installed,
generated-project, and remote-CI verification. The subsequent eight-surface
audit found a different class of defect: authoritative systems exist, but some
public entries and final consumers do not always enforce them.

1.100 is a structural hardcut. It adds no public workflow mode, organizational
role, or evidence family. It makes the current release, completion, apply,
adoption, baseline, and distribution consumers enforce the authority they
already claim to consume.

The target user remains one zero-experience solo developer. The user supplies
business goals, unavailable business facts, preferences, and consent to one
prepared concrete real-world effect. Codex owns technical classification,
planning, implementation, verification, review, repair, and evidence handling.

## 2. Non-Negotiable Invariants

- No production deploy, store submission, mini-program release, production
  migration, secret, DNS, payment, permission, production configuration, or
  rollback execution may be assigned to Codex by a general assisted mode.
- A release step is executable by Codex only when its normalized action is in
  `allowed_codex_actions` and absent from `blocked_actions`.
- Public completion cannot claim done without current Work Queue, Task
  Governance, Plan Review when required, Completion Evidence, and Execution
  Assurance consumers passing for the same project, revision, task, and intent.
- Prose cannot substitute for changed-file, command-result, report-digest, or
  source-state evidence when a strict consumer makes a completion claim.
- Controlled apply must reject blocked review/readiness, bind the approved
  graph to current source state, and restore every attempted write on failure.
- Existing-project discovery must not silently omit nested agent authority,
  CI, release, queue, or governance assets because of shallow depth or result
  limits.
- BL2, selected packs, environment baselines, and starter verification are
  semantic claims backed by valid evidence, not file-presence claims.
- Installed projects must receive the same mandatory task, completion,
  evidence, and release consumers as the source repository.
- Ordinary users are never asked to choose technical architecture, baseline
  packs, internal reviewers, checker flags, or migration mechanics.

## 3. Work Packages

### A. Release Action Authority

- define one normalized mapping between execution-step actions and approval
  actions;
- derive each step executor from the approval allow/block sets;
- keep production and provider-side effects human/external-system only;
- reject plans whose rendered ownership conflicts with structured approval;
- require Launch Review, Release Evidence, Runtime Hygiene, Channel Policy,
  candidate identity, platform recipe, and handoff inputs when applicable;
- normalize solo confirmer validation without inventing enterprise roles.

### B. Task And Completion Consumer Closure

- make public `work`/`finish` consume strict Work Queue and Task Governance;
- require current Plan Review for implementation classes that need a plan;
- require current-task Execution Assurance and Completion Evidence before done;
- validate actual changed files and command evidence instead of report prose;
- fail closed on unresolved, stale, wrong-task, wrong-project, or wrong-revision
  source records;
- keep discussion-only and low-risk non-code work lightweight.

### C. Evidence And Project Identity Closure

- correct authority-binding vocabulary across release and completion schemas;
- include material ignored files, submodule/directory entries, and all relevant
  untracked files in project identity or explicitly fail closed when identity
  cannot be complete;
- reject Git read errors instead of reporting clean/high-confidence identity;
- make non-Git revision content-sensitive;
- bind report digests to the actual authoritative file contents.

### D. Atomic Apply And Existing-Project Activation

- reject blocked Plan Review and readiness inside the executor, not only in
  advisory preparation;
- derive the executed action set solely from the approved graph;
- journal every attempted write before mutation and roll back the current and
  previous actions on failure;
- make plan-only new-project identity stable without mutating the target first;
- ensure changed-file verification covers only material writing actions;
- discover nested agent, CI, release, governance, and queue assets without
  silent truncation;
- make Work Queue takeover part of the public existing-project adoption path;
- let Codex classify technical rule reconciliation and ask the user only for
  unavailable business facts or concrete-effect consent.

### E. Baseline, Starter, Entry, And Distribution Parity

- require non-empty, semantically valid BL2 industrial evidence;
- validate environment baseline fields, not headings or arbitrary text;
- enforce starter/profile/platform/pack compatibility before activation;
- install engineering and environment baseline actions together;
- make every starter verification command executable after a valid setup or
  fail with an accurate missing-prerequisite result;
- correct release-approval scaffold/checker directories;
- make installed CI consume mandatory task, plan, completion, evidence, and
  release checks;
- harden natural-language routing for publish, status, review-only, and
  discussion-only requests;
- remove active prompts that delegate technical choices to the solo user.

## 4. Acceptance Matrix

| ID | Scenario | Required result |
|---|---|---|
| R01 | Assisted plan contains `DEPLOY_OR_SUBMIT` | Codex executor is always rejected; allow lists cannot override external-effect ownership |
| R02 | Approval blocks store/production action | rendered plan and checker keep it human/external only |
| R03 | Non-user or ambiguous confirmer string | release trust fails |
| R04 | Web recipe used for app-store target | release trust fails |
| T01 | `finish` with prose-only evidence | not done |
| T02 | queue has invalid/multiple current tasks | public operating loop blocks |
| T03 | missing required Task Governance or Plan Review | completion blocks |
| T04 | source report belongs to another task/revision | completion blocks |
| E01 | release completion uses stale authority field | schema/checker fail consistently |
| E02 | Git identity read fails | state is unknown/blocked, never clean/high |
| E03 | ignored material or submodule changes | project identity changes or explicitly blocks |
| A01 | blocked Plan Review reaches apply executor | no write occurs |
| A02 | second apply action fails | all attempted writes, including current action, are restored |
| A03 | target changes after approval | approved graph is invalidated |
| A04 | plan-only new project | target is not mutated before plan approval |
| X01 | nested agent/CI governance exists | existing-project discovery records it |
| X02 | existing project has weak/no queue | public adoption recommends or performs bounded queue takeover |
| B01 | empty BL2 evidence file | not ready |
| B02 | arbitrary environment baseline text | strict checker fails |
| B03 | incompatible starter/profile/pack | initialization blocks before activation |
| B04 | freshly initialized starter verify | runs when prerequisites exist; otherwise reports exact missing prerequisite and returns non-zero |
| D01 | installed project CI | mandatory task/completion/release consumers are present |
| D02 | `发布当前版本` | release preparation/consent route, not routine implementation |
| D03 | `只看下这个内容` | discussion/review-only route without writes |
| U01 | zero-experience prompt | no technical selection or internal reviewer decision delegated to user |

## 5. Verification Strategy

Verification must include focused adversarial tests for every acceptance row,
plus:

```bash
node --test tests/operating-model.test.mjs
node --test tests/execution-distribution-trust.test.mjs
node --test tests/manifest-authority.test.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Generated-project smoke must run from an isolated snapshot. Existing-project
tests must use disposable fixtures and may not modify real user projects.
Release tests may validate plans and boundaries only; they may not call a real
provider or production system.

## 6. Review And Governance

- The P0 release-action authority fix is reviewed before dependent release
  changes proceed.
- Each work package receives positive and negative executable fixtures.
- A passing self-check is not sufficient; exact installed/generated CI paths
  and remote Linux CI must pass on the final commit.
- The final eight-surface review must distinguish repository verification from
  product, provider, and production proof.
- No finding may be closed only by changing wording when an executable
  consumer can enforce it.

## 7. Delivery Sequence

1. release action authority and release trust;
2. task/completion consumers and evidence truth;
3. project identity and atomic apply;
4. existing-project activation and queue takeover;
5. baseline, starter, entry, and installed distribution parity;
6. full verification, eight-surface review, release evidence, commit, push,
   and remote CI.

## 8. Non-Goals

- no 2.0 redesign;
- no team/enterprise role model;
- no new public command family;
- no automatic production action;
- no replacement of stricter valid project-owned governance;
- no claim that repository evidence proves business correctness or production
  safety.
