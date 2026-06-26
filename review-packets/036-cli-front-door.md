# Review Packet: CLI Front Door

## Status

Task: `tasks/036-cli-front-door.md`

Related Spec: `specs/036-cli-front-door.md`

Related Eval: `evals/036-cli-front-door.md`

Task Level: L2

Review requested for: Productization Hardcut phase `0.36.0`

## Human Summary

Review whether the new CLI is a thin facade over existing scripts, whether write commands are visible, whether `migrate` remains planned-only, and whether self-check covers the new product entry point.

## Review Scope

Included:

- `package.json`
- `scripts/cli.mjs`
- `scripts/check-dev-kit.mjs`
- `README.md`
- `README.zh-CN.md`
- version metadata
- phase workflow artifacts for `036-cli-front-door`

Excluded:

- package publishing
- manifest authority
- migration command implementation
- init/update safety plan behavior
- artifact schema enforcement
- target-project bootstrap semantic changes
- license rewrite

## Evidence To Inspect

| Evidence | Ref |
|---|---|
| CLI facade | `scripts/cli.mjs` |
| Package metadata | `package.json` |
| CLI self-check coverage | `scripts/check-dev-kit.mjs` |
| CLI human guidance | `README.md`, `README.zh-CN.md` |
| Decision brief | `decision-briefs/036-cli-front-door.md` |
| Task card | `tasks/036-cli-front-door.md` |
| Final report | `final-reports/036-cli-front-door.md` |

## Reviewer Instructions

- Stay read-only.
- Check that CLI delegates to existing scripts.
- Check that write commands print underlying commands.
- Check that `migrate` is not implemented in this phase.
- Treat package publishing metadata beyond private local usage as out-of-scope drift.
- Treat hidden `workflow-next` output or swallowed failures as blocking.

## Expected Review Questions

- Does CLI help list the intended commands?
- Does CLI version match `VERSION.md`?
- Does CLI init generate a valid core workflow project?
- Does CLI avoid recursive self-check inside `check-dev-kit`?
- Does README explain both CLI and lower-level scripts?

## Known Boundaries

- CLI is a front door, not a new workflow engine.
- Manifest remains read-only.
- Package remains private.
- Migration remains deferred.
