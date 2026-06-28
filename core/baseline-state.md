# Baseline State

Baseline State separates proposed project guidance from confirmed project facts.

It allows Codex to draft useful baselines for no-code and new-project work without pretending those baselines are already verified by code, commands, CI, or human-confirmed source of truth.

## Core Rule

Codex may draft proposed baselines before code exists, but must not mark them as confirmed or verified without evidence or explicit human confirmation.

## State Model

| State | Meaning | May Use For Implementation? |
|---|---|---|
| `PROPOSED` | recommended by Codex before evidence or confirmation | Advisory only |
| `PENDING_CONFIRMATION` | needs human confirmation | Not for high-impact work |
| `EVIDENCE_REQUIRED` | plausible but needs code/docs/command evidence | Not until evidence exists |
| `CONFIRMED` | supported by project evidence or human-confirmed source of truth | Yes, within approved scope |
| `NOT_APPLICABLE` | explicitly does not apply | Yes as exclusion evidence |
| `SUPERSEDED` | replaced by a newer baseline decision | No |

## No-Code And New-Project Rule

When no real project code or execution evidence exists, baseline items must remain:

- `PROPOSED`
- `PENDING_CONFIRMATION`
- `EVIDENCE_REQUIRED`

They must not be called:

- `CONFIRMED`
- `BASELINE_READY`
- production-ready
- industrial-grade
- verified

unless evidence or human-confirmed source of truth exists.

## Existing Project Rule

For existing projects, Codex should read:

- source code;
- package/build scripts;
- CI config;
- docs;
- existing governance assets;
- release/rollback evidence when relevant.

Only evidence-backed or human-confirmed items may become `CONFIRMED`.

## Industrial Baseline Rule

Industrial packs may be selected as proposed candidates, but draft packs do not prove industrial readiness.

Recommended wording:

```text
Selected industrial pack: PROPOSED / PENDING_CONFIRMATION
Industrial readiness: EVIDENCE_REQUIRED
Industrial compliance: not claimed
```

## Relationship To Baseline Enforcement

Baseline Enforcement checks whether a task references baselines when touched areas require them.

Baseline State checks whether the baseline's evidence state is being overstated.

Baseline State does not replace engineering baseline, environment baseline, platform baseline, industrial baseline, or human approval.

