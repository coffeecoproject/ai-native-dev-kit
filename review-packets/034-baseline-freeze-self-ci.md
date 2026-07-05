# Review Packet: Baseline Freeze And Self CI

## Status

Task: `tasks/034-baseline-freeze-self-ci.md`

Related Spec: `specs/034-baseline-freeze-self-ci.md`

Related Eval: `evals/034-baseline-freeze-self-ci.md`

Task Level: L2

Review requested for: Productization Hardcut phase `0.34.0`

## Human Summary

Review whether phase `0.34.0` correctly freezes the `0.33.0` baseline, adds intentos-owned CI, records release evidence, and avoids drifting into later CLI, manifest, schema, or init/update safety work.

## Review Scope

Included:

- `.github/workflows/intentos-pr-checks.yml`
- `.github/workflows/intentos-release-checks.yml`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `releases/0.33.0/baseline-freeze.md`
- `releases/0.33.0/self-check-report.md`
- `releases/0.34.0/phase-report.md`
- `VERSION.md`
- `templates/version-record.md`
- `templates/workflow-version.json`
- `scripts/check-intentos.mjs`
- task-scoped workflow artifacts for `034-baseline-freeze-self-ci`

Excluded:

- CLI implementation
- manifest implementation or authority
- artifact frontmatter or schema enforcement
- init/update dry-run, plan, backup, or apply-plan behavior
- target-project bootstrap semantic changes
- industrial pack maturity changes
- license rewrite

## Evidence To Inspect

| Evidence | Ref |
|---|---|
| Productization plan | `docs/plans/productization-hardcut-1.0-plan.md` |
| Task card | `tasks/034-baseline-freeze-self-ci.md` |
| Baseline freeze | `releases/0.33.0/baseline-freeze.md` |
| Self-check report | `releases/0.33.0/self-check-report.md` |
| Phase report | `releases/0.34.0/phase-report.md` |
| PR CI | `.github/workflows/intentos-pr-checks.yml` |
| Release CI | `.github/workflows/intentos-release-checks.yml` |
| Final report | `final-reports/034-baseline-freeze-self-ci.md` |

## Reviewer Instructions

- Stay read-only.
- Check phase alignment before style comments.
- Treat any CLI, manifest, schema, or init/update behavior as out-of-scope drift.
- Treat missing baseline evidence, missing generated-project smoke, or CI requiring secrets as blocking.
- Categorize findings as `AUTO_FIX`, `NEEDS_HUMAN_DECISION`, `NEEDS_CLARIFICATION`, or `NO_ACTION`.
- Do not approve release or license changes.

## Expected Review Questions

- Does CI cover intentos self-check, fixtures, recursive script syntax, output quality, glossary usage, and generated-project smoke?
- Does release evidence clearly state that local smoke is not real project adoption proof?
- Does `check-intentos` validate the new CI and repository governance assets?
- Does the final report include verification evidence and bounded next-step suggestions?
- Does the change avoid implementing 0.35 or later phases?

## Known Boundaries

- CODEOWNERS uses draft maintainer guidance until real GitHub handles are chosen.
- SECURITY provides reporting guidance without promising a response SLA.
- License terms remain CC BY-NC 4.0 and are not rewritten in this phase.
- Generated-project smoke proves bootstrap mechanics only; it does not prove production adoption.
