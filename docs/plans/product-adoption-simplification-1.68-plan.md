# Product Adoption Simplification / Public Entry Consolidation 1.68 Plan

## Purpose

1.68 makes IntentOS easier to understand from the outside without weakening the governance system.

This is a product-adoption release, not a new workflow layer. It should reduce the first-page burden for ordinary users while keeping the existing advanced commands, release boundaries, old-project migration protections, and self-check evidence intact.

## Problem

IntentOS has strong governance coverage, but the public entry surface is too dense:

- README exposes version history and many internal concepts before the simplest user path.
- CLI help lists every command in one flat surface.
- Documentation has useful guides, but no short front door that says what to do first.
- Existing users can confuse the product entry with maintainer-only evidence commands.

## Scope

1.68 may change:

- README / README.zh-CN top-level structure.
- Documentation front door pages.
- CLI help presentation.
- Release records, version metadata, and manifest references.

1.68 must not change:

- target-project write authorization;
- Release Plan authority;
- old-project Native Migration / Existing Rule Reconciliation requirements;
- baseline, hook, release, approval, or apply semantics;
- command behavior for existing scripts.

## Public Entry Model

Public-facing users should see three primary commands first:

```bash
node scripts/cli.mjs start <project>
node scripts/cli.mjs next <project>
node scripts/cli.mjs doctor <project>
```

Natural-language use remains the preferred Codex behavior:

```text
Tell Codex the goal. Codex reads the project, recommends the path, and asks only for judgment decisions.
```

Internal commands remain available for maintainers, CI, release evidence, and exact debugging.

## Documentation Deliverables

- `docs/start-here.md`
  - The shortest user-facing front door.
  - Explains what IntentOS is, who decides what, and the three command entry.
- `docs/minimal-adoption.md`
  - A 10-minute adoption path for new, existing, and governed projects.
  - Keeps write actions behind plan-first approval.
- `docs/for-existing-projects.md`
  - Explains old-project use in plain language.
  - Codex may work in IntentOS Operating Mode immediately.
  - Existing baselines, release rules, CI, hooks, and governance files must be compared before changes.
- `docs/for-maintainers.md`
  - Moves advanced command categories and evidence workflow out of the public front door.

## CLI Help Deliverables

CLI help should be grouped:

- Primary entry commands: `start`, `next`, `doctor`
- Natural-language and common decisions: `ask`, `guide`, `finish`, `release-guide`, `release-plan`, `apply-plan`
- Advanced command reference: all remaining commands stay available

The CLI must not remove or rename commands in 1.68.

## Acceptance Checks

- README and README.zh-CN current release point to 1.68.0.
- README first screen explains IntentOS in product language before long version history.
- `docs/README.md` and `docs/index.md` link the new front-door docs first.
- `node scripts/cli.mjs --help` includes:
  - `Primary entry`
  - `start`
  - `next`
  - `doctor`
  - `Advanced commands remain available`
- Existing `node scripts/cli.mjs <command> --help` behavior still works.
- `node scripts/check-manifest.mjs` passes.
- `npm --silent run verify:governance` passes.
- `node scripts/check-dev-kit.mjs` passes.
- `git diff --check` passes.

## Non-Goals

- No npm publishing.
- No new installer.
- No TUI or web dashboard.
- No runtime sandbox changes.
- No license model change.
- No command schema rewrite.

Those are separate future productization tracks.
