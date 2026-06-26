# Industrial Baseline Packs

Industrial Baseline Packs define evidence-backed engineering standards for projects that need production-grade delivery governance.

They do not replace the AI Native core workflow. They sit above platform profiles:

```text
Core Workflow
  -> Platform Profile
  -> Industrial Baseline Pack
  -> Project Baseline Selection
  -> Task / Evidence Gate
```

## Baseline Levels

Use baseline levels to describe project governance strength.

| Level | Name | Meaning |
|---|---|---|
| BL0 | lightweight | AI Native workflow only. Suitable for experiments, demos, and low-risk tools. |
| BL1 | standard | AI Native workflow plus platform profiles and baseline checks. Suitable for normal projects. |
| BL2 | industrial | AI Native workflow plus platform profiles and selected industrial packs. Suitable for real users, production risk, customer delivery, long-lived systems, or regulated/high-risk work. |

Do not use BL0/BL1/BL2 for task risk. Task risk remains `L0` / `L1` / `L2` / `L3`.

## Pack Types

| Type | Purpose |
|---|---|
| `primary-platform` | Main runtime surface such as Web, iOS, Android, or WeChat Mini Program. |
| `capability` | Cross-platform capability such as Backend API, Internal Admin, Data Storage, CloudBase, or Auth/Permission. |
| `risk-overlay` | Additional evidence and approval requirements for payments, value transfer, regulated data, or high-risk changes. |

Projects may select multiple packs. The effective baseline is the conservative union of selected pack requirements.

Use [selection-guide.md](selection-guide.md) to choose the smallest relevant pack set. The guide is copied into target projects by default because pack selection is a governance decision, not an implementation detail.

For Mini Program products with an admin backend, keep the Mini Program runtime pack separate from operations/backend packs. Select `internal-admin-industrial`, `backend-api-industrial`, `cloudbase-industrial`, `auth-permission-industrial`, `data-storage-industrial`, or `payment-value-transfer-industrial` only when those surfaces are in scope.

## Included Draft Packs

```text
web-app
ios-app
android-app
wechat-miniprogram
backend-api
internal-admin
data-storage
cloudbase
auth-permission
payment-value-transfer
high-risk-change
```

## Required Files

Each non-planned pack must include:

```text
pack.md
pack.json
baselines/
executions/
audit/
bootstrap-kit/
checklists/
templates/
```

`pack.md` is for humans and AI agents. `pack.json` is for scripts.

## Pack Status

Use pack status to prevent premature use:

| Status | Meaning |
|---|---|
| `planned` | Registered roadmap item only. It may appear in `industrial-packs/index.json`, but must not be selected as executable project baseline. |
| `draft` | Concrete pack exists and can be dogfooded with explicit human confirmation. |
| `stable` | Pack has repeated project evidence and can be used as a normal BL2 baseline input. |

`check-industrial-pack.mjs` validates concrete draft/stable pack structure. `check-industrial-baseline.mjs` rejects selected `planned` packs in real projects.

## Project Use

Project-specific BL2 selection belongs in project docs:

```text
docs/baseline-selection.md
docs/baseline-evidence.md
```

Use:

```bash
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --strict
```

Default mode may report `PENDING` for human decisions or evidence. Strict mode is for confirmed BL2 adoption, release gates, and project handoff.

## Pack Policy

Industrial packs are standards, not project evidence.

Allowed:

- platform and capability standards
- required baseline docs
- required audit docs
- evidence categories
- checker expectations
- task-level escalation rules
- human approval requirements
- bootstrap templates

Not allowed:

- concrete app names
- bundle IDs or package names
- production API URLs
- production account names
- certificate or provisioning identifiers
- real credentials, tokens, keys, or secrets
- team member names
- customer-specific business decisions
- real customer data or real data samples

Project-specific choices belong in `docs/baseline-selection.md`.
Project-specific proof belongs in `docs/baseline-evidence.md`.

## Candidate Flow

Legacy industrial baselines should first enter `industrial-pack-candidates/`.

Promotion flow:

```text
legacy baseline
  -> inventory
  -> split primary / capability / risk-overlay
  -> normalize naming
  -> create pack candidate
  -> add pack.json
  -> run check-industrial-pack
  -> dogfood with a project
  -> run check-industrial-baseline in that project
  -> promote to industrial-packs/
```

Do not copy large legacy packs directly into `industrial-packs/` without schema, purity, and structure review.
