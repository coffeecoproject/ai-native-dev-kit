# Real Project Read-only Adoption Trial 1.8 Plan

Status: accepted for implementation

This document defines the `1.8.0` upgrade after `1.7.0 First Delivery Walkthrough`.

The goal is not to add another generic governance layer. The goal is to prove that AI Native Dev Kit can enter a real governed project in read-only mode, understand existing authority, avoid template overwrite, and classify future repair work before Codex proposes or applies a fix.

## 1. Theme

`1.8.0` theme:

```text
Real Project Read-only Adoption Trial
+ Patch Classification Governance
```

Plain-language meaning:

```text
Codex reads a real project first.
Codex does not modify it by default.
Codex identifies what already governs the project.
Codex proposes a no-write or thin bridge path instead of copying a duplicate stack.
Codex classifies future fixes as local, baseline-aligned, structural, human-decision-bound, or do-not-patch.
```

## 2. Why This Exists

`1.7.0` proved the workflow can be shown as a complete simulated first-delivery path:

```text
idea -> routing -> baseline -> request/spec/eval/task -> review -> drift control -> launch boundary -> final report
```

The missing evidence is whether the kit behaves correctly when it reads a real project that already has:

- existing architecture and conventions
- existing governance documents
- existing gates and release evidence
- real production or customer-facing risk
- historical decisions and accumulated constraints

This is also where unsafe patch behavior appears. Codex may read the project correctly, then try to pass a task with a narrow patch that bypasses the project's real baseline.

## 3. Trial Target Boundary

The first real target is a private local candidate project. Public dev-kit evidence must describe it only as:

```text
one governed production-sensitive Web project
```

Default public evidence rules:

- no concrete project name
- no local filesystem path
- no private architecture details
- no release, incident, customer, account, endpoint, or credential details
- no claim that the target project was production validated

The target is useful because it is not a blank project. It has existing governance, existing project-specific agent instructions, baseline documents, gates, release/readiness evidence, and production-sensitive boundaries. That makes it a good read-only adoption trial and a poor candidate for direct initialization.

## 4. Non-goals

`1.8.0` must not:

- modify the real target project during the first read-only trial
- run production, deployment, migration, seed, secret, runtime, DB, SSH, release, rollback, or external-service commands
- read raw `.env*`, secrets, private keys, tokens, credentials, certificates, or credential stores
- run commands that may modify local DB, cache, generated files, lockfiles, or production-like state
- copy private target details into public dev-kit evidence without explicit approval
- overwrite existing project governance with generic AI Native templates
- force every existing project to adopt all AI Native artifacts
- claim production validation
- claim the target project is safer merely because it was read
- treat a read-only adoption report as implementation approval
- treat patch classification as implementation authorization
- treat patch governance as a ban on small safe fixes

## 5. Core Product Promise

The user should be able to say:

```text
Here is a project path. Configure yourself according to AI Native Dev Kit.
```

Codex should then:

1. Read the project in read-only mode.
2. Decide the primary adoption mode and secondary risk tags.
3. Detect platform and baseline signals.
4. Detect existing governance authority.
5. Avoid copying duplicate governance into the project.
6. Propose the smallest safe adoption path.
7. Classify patch policy before suggesting future fixes.
8. Ask the human only for judgment decisions.

The user should not need to memorize a long prompt.

## 6. Adoption Classification

`1.8.0` uses a primary mode plus secondary tags.

| Field | Required Meaning |
|---|---|
| Primary adoption mode | one approved mode |
| Secondary risk tags | additional signals such as production-sensitive, already-launched, strong-agent-rules, existing-baselines |
| Confidence | low / medium / high |
| Evidence | concrete read-only observations supporting the classification |

Allowed primary modes:

| Mode | Meaning | Default AI permission |
|---|---|---|
| `NEW_PROJECT` | Empty or early project with little governance | may propose scaffold after confirmation |
| `EXISTING_LIGHT_PROJECT` | Existing code with weak governance | read-only first, then guided setup |
| `EXISTING_GOVERNED_PROJECT` | Existing project with strong rules, gates, docs, or evidence | map existing governance, do not overwrite |
| `EXISTING_PRODUCTION_PROJECT` | Existing governed project with live, release, production, or customer-facing risk | read-only only until explicit approval |
| `BLOCKED_UNKNOWN_RISK` | signals are unclear, risky, or contradictory | stop for human decision |

## 7. Bridge Layer Modes

For existing governed projects, AI Native Dev Kit must not install a full duplicate governance stack by default.

Bridge layer modes:

| Mode | Meaning | Writes |
|---|---|---|
| `NO_WRITE_MAP` | map findings in chat, local report, or external review only | none |
| `DOCS_ONLY_BRIDGE` | write approved adoption or governance-map docs only | docs only, after approval |
| `THIN_OPERATIONAL_BRIDGE` | write approved agent/manifest adapter that points to existing authority | adapter only, after approval |
| `NOT_PROPOSED` | no bridge proposed yet | none |

Any `AGENTS.md` or `.ai-native/` proposal must reference the target project's existing authority, such as its current agent instruction file, baseline docs, guard scripts, release process, and evidence records. The bridge is not allowed to weaken, replace, or hide target-project rules.

## 8. Patch Classification Governance

This is the second major part of `1.8.0`.

The problem:

```text
Codex often fixes the visible symptom with a small patch.
That may pass a narrow check but create larger drift in API, data, permissions, tests, release evidence, or governance gates.
```

The required behavior:

```text
Before proposing or applying a non-trivial fix, Codex classifies the repair scale.
```

### 8.1 Repair Scale Types

| Type | Meaning | AI behavior |
|---|---|---|
| `SAFE_LOCAL_FIX` | small isolated fix with no cross-boundary impact | may propose or execute only if already authorized |
| `BASELINE_ALIGNED_HARDCUT` | scoped change touches governed surfaces but the baseline and scope are clear | follow target baseline and update tests/docs/evidence in the same batch |
| `STRUCTURAL_REMEDIATION` | root cause is structural drift or cross-layer mismatch | plan structural repair; do not hide it with a symptom patch |
| `NEEDS_HUMAN_DECISION` | risk, scope, architecture, production, data, security, privacy, release, or irreversible choice | stop and ask |
| `DO_NOT_PATCH` | patch would hide, weaken, bypass, or silence governance | reject patch path |

### 8.2 Safe Local Fix Criteria

`SAFE_LOCAL_FIX` is allowed only when all are true:

- change is isolated
- no API, DB, auth, permission, state machine, release, environment, migration, dependency, production, schema, contract, or gate surface is touched
- no gate is weakened
- no schema or contract is loosened
- no fallback or compatibility path is introduced without approval
- validation is simple and directly tied to the fix

### 8.3 Required Output

Every non-trivial task proposal in a governed project must include:

```text
Repair classification:
- Type:
- Why this type:
- Why not SAFE_LOCAL_FIX:
- Why not another type:
- Affected baselines:
- Affected surfaces:
- Patch risk:
- Could this hide a root cause?
- Could this weaken a gate?
- Rollback / recovery impact:
- Required evidence:
- Required human decisions:
- Verification plan:
- Patch classification authorizes implementation: No
```

## 9. Privacy And Public Evidence Boundary

Every real adoption report must declare:

```text
Public Evidence Status: LOCAL_ONLY / SANITIZED_APPROVED / PUBLIC_APPROVED
Concrete target name included: Yes / No
```

Default rule:

```text
Real trial notes stay local unless explicitly approved for commit.
```

Allowed public phrasing:

```text
one governed production-sensitive Web project was read in read-only mode
Codex classified it as governed / production-sensitive
Codex proposed a no-write or thin bridge path instead of template overwrite
Codex produced a patch classification policy for future tasks
```

Forbidden public phrasing:

```text
<private project name> production validated by AI Native Dev Kit
<private project name> release approved
<private project name> security/privacy/compliance approved
```

## 10. Deliverables

Core protocols:

- `core/real-project-adoption-trial.md`
- `core/patch-classification.md`

Templates:

- `templates/real-adoption-trial-report.md`
- `templates/existing-governance-map.md`
- `templates/patch-classification-report.md`

Checklists:

- `checklists/real-adoption-trial-review.md`
- `checklists/patch-classification-review.md`

Prompts:

- `prompts/real-adoption-agent.md`
- `prompts/patch-classifier-agent.md`

Directories:

- `real-adoption-trials/`
- `governance-maps/`
- `patch-classifications/`

Scripts:

- `scripts/check-real-adoption-trial.mjs`
- `scripts/check-patch-classification.mjs`
- `scripts/lib/risk-surfaces.mjs`

CLI commands:

- `real-adoption`
- `patch-classification`

Both commands are read-only by default.

## 11. Checker Requirements

`check-real-adoption-trial.mjs` must validate:

- required report sections
- primary adoption mode and secondary risk tags
- read-only boundary and no target writes
- target git status before/after
- no external-service/runtime/DB/migration/seed command use
- bridge mode is one of `NO_WRITE_MAP`, `DOCS_ONLY_BRIDGE`, `THIN_OPERATIONAL_BRIDGE`, or `NOT_PROPOSED`
- `AGENTS.md` proposals consider existing agent authority
- human decisions are explicit
- production/release/security/privacy claims are bounded
- public evidence status is explicit
- no obvious secret-like values appear
- subagents are closed or skipped

`check-patch-classification.mjs` must validate:

- repair scale is one of the approved values
- `SAFE_LOCAL_FIX` is not used with high-risk keywords or surfaces
- high-risk surfaces require non-local classification
- `DO_NOT_PATCH` is not marked as completed work
- required evidence and verification plan exist
- human decision queue exists when needed
- patch classification is not implementation authorization

Both checkers are heuristic and structure-based. They do not prove code correctness, root-cause correctness, security, privacy, compliance, release readiness, or production safety.

## 12. Goal And Subagent Orchestration

Recommended goal:

```text
Goal: implement and validate 1.8 Real Project Read-only Adoption Trial with Patch Classification Governance.
```

Subagents may be used, but only as read-only helpers unless a specific task later authorizes otherwise.

| Agent | Mode | Purpose | Writes? | Close condition |
|---|---|---|---|---|
| Project Signal Reader | READ_ONLY_RESEARCH | map project type, tech stack, governance docs, and risk signals | No | findings handed to main thread |
| Governance Mapper | READ_ONLY_RESEARCH | map existing source of truth and gates | No | governance map reviewed |
| Patch Policy Reviewer | REVIEW_LOOP | review repair-scale taxonomy and bad fixtures | No | findings routed to review loop |
| Final Reviewer | REVIEW_LOOP | check overclaim, privacy, and no-overwrite boundaries | No | final findings consumed |

Main thread remains the only writer.

All subagents must be `CLOSED` or `SKIPPED` before final response.

## 13. Execution Phases

### Phase 1: Protocols And Templates

Add core docs, templates, checklists, prompts, directories, and high-level docs.

### Phase 2: Checkers And Fixtures

Add machine checks for real adoption trial reports and patch classification reports.

Good fixtures must pass. Bad fixtures must fail for overclaim, target write, public-name boundary, unsafe patch classification, implementation authorization, and completed `DO_NOT_PATCH` work.

### Phase 3: CLI / Manifest / Generated Project Support

Wire commands, manifest copy rules, platform adapters, PR template, README, reference docs, CI, and generated-project smoke checks.

### Phase 4: Sanitized Read-only Trial Evidence

Record sanitized evidence for one governed production-sensitive Web project.

Allowed:

- file listing
- reading docs, package scripts, CI workflow, baseline files, and session index
- git status / branch / remote
- no-write static inspection commands

Forbidden:

- writing target project files
- starting runtime
- running migrations or seeds
- touching `.env*`, secrets, runtime credentials, production config
- SSH, deployment, release, rollback, production smoke, or external services
- running full gate suites that may change caches, generated files, DB state, or lockfiles

### Phase 5: Review And Release Evidence

Add `releases/1.8.0/` evidence.

Release wording must say:

```text
1.8.0 adds read-only real-project adoption trial support and patch classification governance.
It does not claim production validation or approve changes to any real project.
```

## 14. Acceptance Criteria

The upgrade is acceptable when:

- real-project entry is read-only by default
- existing governed projects are mapped instead of overwritten
- production-sensitive projects stop before writes
- patch classification is required before non-trivial fixes
- unsafe patch classifications are rejected by bad fixtures
- the sanitized trial can classify one governed production-sensitive Web project without modifying it
- user decisions are limited to approval, project selection, risk choices, and whether to apply any bridge layer
- release notes state that read-only adoption evidence is not production validation

## 15. Required Checks

Expected final command set after implementation:

```text
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-dev-kit.mjs
git diff --check
```

If a private read-only trial is performed, additionally verify target project `git status --short` before and after. The target project must remain unchanged.

## 16. Human Decisions Needed

Before any real target write:

- approve exact files
- approve whether `AGENTS.md` should be created or whether existing agent authority remains the only entry
- approve whether `.ai-native/` should be added
- approve validation commands
- approve whether public release notes may mention the target project by name

Default answer for public target naming is `No`.

## 17. Final Position

`1.8.0` is a productization and reality-check release.

It should prove that AI Native Dev Kit can:

- enter a real existing project
- avoid replacing existing governance
- keep the first pass read-only
- identify production-sensitive boundaries
- prevent unsafe patch-style fixes
- keep humans in the decision role

The success condition is not that Codex changes the real target project. The success condition is that Codex can read it, understand its authority structure, classify repair risk correctly, and propose the smallest safe next step without creating new risk.
