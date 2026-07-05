# Migration Matrix: 1.0.0

## Status

Ready for 1.0 minimum release.

## Supported Matrix

| From | To | Command | Apply support | Status |
|---|---|---|---|---|
| `0.33.0` | `1.0.0` | `intentos migrate --target <project> --from 0.33.0 --to 1.0.0 --dry-run` | No | Plan-only |
| `0.33.0` | `1.0.0` | `intentos migrate --target <project> --from 0.33.0 --to 1.0.0 --write-plan <file>` | No | Writes JSON plan only |

## Added Assets

- Goal Mode assets and checks
- Subagent Orchestration assets and checks
- Review Loop and Bounded Next-Step semantics
- Engineering Baseline governance
- Output Quality and glossary checks
- authoritative intentos manifest
- CLI front door
- init/update dry-run, write-plan, apply-plan, and backup support
- artifact frontmatter and schemas
- fixture matrix
- shared checker libraries
- industrial pack maturity lifecycle
- license boundary docs
- docs IA
- migration plan command
- 1.0 release evidence and adoption entry templates

## Removed Assets

None removed by `intentos migrate`.

## Renamed Assets

No automatic renames are applied by `intentos migrate`.

Conceptual moves:

- README details moved into operator, reference, playbook, migration, FAQ, and troubleshooting docs.
- CLI migrate moved from planned placeholder to plan-only command.

## CI Impact

Projects may add or update `.github/workflows/ai-workflow-checks.yml` through reviewed init/update plan flow.

CI must not be overwritten in governed or production projects without review.

## AGENTS Impact

Existing `AGENTS.md` or `agent.md` files are project-owned.

The IntentOS may generate migration reports, but it must not overwrite agent instructions without explicit `--apply-agent-governance`.

## PR Template Impact

Existing `.github/pull_request_template.md` files are project-owned.

The IntentOS may generate migration reports, but it must not overwrite the template without explicit `--apply-pr-template-governance`.

## Human Approval Requirements

- governed or production adoption
- dirty worktree continuation
- agent instruction merge
- PR template merge
- BL2 industrial pack selection
- legacy artifact readiness without frontmatter
- license risk acceptance
- any future migration apply behavior

## Rollback

Plan-only migration rollback means deleting the generated plan file.

Reviewed init/update rollback should use project git history and `--backup-dir` evidence when managed assets were overwritten.
