# Industrial Packs Reference

Industrial packs are optional governance packs for higher-risk project areas. They are selected by project need, not installed as a blanket default.

## Baseline Levels

| Level | Meaning |
|---|---|
| `BL0` | Lightweight baseline for small, low-risk work |
| `BL1` | Normal project baseline with selected profiles and checks |
| `BL2` | Industrial baseline for production, customer, permission, data, payment, or release risk |

`BL2` means stricter governance. It does not automatically mean the pack is stable or production-proven.

## Maturity Stages

| Stage | Meaning |
|---|---|
| `draft` | Usable for controlled trial, not a stable standard |
| `candidate` | Has stronger evidence and lower known false-positive risk |
| `stable` | Proven through real project adoption and maintenance evidence |
| `deprecated` | Being phased out |
| `retired` | No longer recommended |

Every concrete industrial pack must document maturity, evidence, dogfood, false-positive log, owner, changelog, promotion criteria, demotion triggers, and known limitations.

## Current Packs

The repository includes draft pack coverage for areas such as:

- Web app
- WeChat Mini Program
- iOS app
- Android app
- backend API
- internal admin
- data storage
- CloudBase
- auth and permission
- payment and value transfer
- high-risk change

Web and WeChat Mini Program have BL2 simulated dogfood examples. These examples prove workflow coverage, not production stability.

## Selection Rule

Use `industrial-packs/selection-guide.md` before enabling a pack.

Use `docs/baseline-pack-system.md` and `node scripts/cli.mjs baseline-packs <project>` when the human needs a plain recommendation before deciding BL level or packs.

Do not enable all packs by default. Select only what the project needs:

- Web UI and API behavior
- Mini Program runtime, cloud functions, privacy, payment, or release
- permission and identity
- data storage and migration
- value transfer
- high-risk rollout

## Evidence Rule

For BL2 work, record baseline selection and evidence:

- `docs/baseline-selection.md`
- `docs/baseline-evidence.md`
- task-level verification evidence
- release or rollback notes when relevant

## Checks

Use:

```bash
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
node scripts/check-industrial-pack.mjs .
```

For target projects, prefer selected-only checks when the full pack registry is not needed.

```bash
node scripts/check-industrial-pack.mjs . --selected-only
```

## Boundary

Industrial packs do not replace:

- business judgment
- legal review
- platform review
- release approval
- production monitoring
- real incident response

They help Codex know what must be checked before it changes risky project areas.
