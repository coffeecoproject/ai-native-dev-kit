# Review Packet: 042-docs-ia-migration-command

Use this file when a completed or in-progress change needs a stable review input for a human reviewer, GPT Pro, a second model, or another review process.

This packet does not approve the change. It packages context, evidence, known risks, and open questions so a reviewer can inspect the work without reconstructing the whole conversation.

## Packet Status

Status: READY

Prepared by: Codex

Prepared at: 2026-06-27

Reviewer: main-thread self-review

Review target: `tasks/042-docs-ia-migration-command.md`

## Review Purpose

What should the reviewer focus on?

- README is now a short entry while complete references remain reachable.
- Migration command is plan-only and cannot mutate target project files.
- Manifest, version, CLI, docs, release evidence, and workflow artifacts are synchronized.

What should the reviewer ignore?

- Future migration apply behavior.
- External GPT/API or hook automation.
- License strictness beyond preserving existing license wording.
- Industrial pack maturity promotion.

## Project State

Project root: `/Users/liushan/Developer/CodingFlow/intentos`

Branch: `main`

Project state tags: intentos productization phase

Adoption mode: not a target-project adoption

Workflow next action: implement Productization Hardcut phase `0.42.0`

Dirty worktree: Yes, current task changes only

Changed file count: pending final git diff

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/042-docs-ia-migration-command.md` | READY | productization phase request |
| Preflight | `preflight/042-docs-ia-migration-command.md` | READY | plan-only migration boundary accepted |
| Spec | `specs/042-docs-ia-migration-command.md` | READY | CLI/docs contract |
| Eval | `evals/042-docs-ia-migration-command.md` | READY | verification criteria |
| Task | `tasks/042-docs-ia-migration-command.md` | READY | implementation scope |
| AI task log | `ai-logs/2026-06-27-docs-ia-migration-command.md` | READY | execution notes |
| Release evidence | `releases/0.42.0/phase-report.md` | READY | phase report |

## Request Summary

- Execute Productization Hardcut `0.42.0`.
- Make the README easier to enter.
- Move full detail into operator, reference, playbook, migration, FAQ, and troubleshooting docs.
- Replace planned-only `migrate` placeholder with a non-mutating migration plan command.

## Spec / Scope Summary

Allowed scope:

- docs IA files
- README and README.zh-CN entry pages
- `scripts/migrate-project.mjs`
- CLI migrate route
- self-check coverage
- manifest and version metadata
- 0.42 workflow and release evidence

Forbidden scope:

- migration apply
- target-project writes from `migrate`
- new dependencies
- new workflow concepts
- license term changes
- industrial pack promotion

Non-goals:

- source-code migration
- language-specific project migration
- external reviewer automation

## Acceptance Criteria

- README answers what this is, when to use it, which path to choose, smallest path, and what not to do.
- Roadmap target docs exist.
- Migration docs list added assets, removed assets, renamed assets, CI impact, AGENTS impact, PR template impact, human approval requirements, and rollback.
- `migrate --dry-run` prints a plan without writing.
- `migrate --write-plan <file>` writes only the requested JSON plan.
- direct `migrate` without a safe output flag fails.
- self-check and workflow checks pass.

## Risk Gate

Checked risk items:

- migration

Risk Gate Exclusions:

| Mentioned term | Why excluded | Human accepted |
|---|---|---|
| production | Docs mention production playbooks only; no production config changed | Yes |
| release | Phase report only; no deployment or release behavior changed | Yes |

## Human Approval

Required: Yes

Status: Approved

Approval scope: Implement plan-only migration command and docs IA; migration apply and target-project mutation remain forbidden.

Approved by: user

Approved at: 2026-06-27

## Baseline State

Onboarding state: not applicable for intentos source task

Engineering baseline checked: Yes

Engineering baseline ref: `core/engineering-baseline.md`

Engineering baseline gaps: none for current bounded docs/CLI change

Platform baseline state: not applicable

Selected profiles: none

Industrial baseline state: not changed

Baseline level: L3 intentos productization task

Selected industrial packs: none

## Evidence

Commands run:

```text
node --check scripts/cli.mjs
node --check scripts/migrate-project.mjs
node scripts/check-manifest.mjs .
node scripts/cli.mjs migrate --target . --from 0.33.0 --to 1.0.0 --dry-run
node scripts/cli.mjs migrate --target . --from 0.33.0 --to 1.0.0 --write-plan /tmp/intentos-042-migration-plan.json
node scripts/cli.mjs migrate --target . --from 0.33.0 --to 1.0.0
```

Verification results:

- syntax checks passed
- manifest check passed
- migrate dry-run printed plan and reported no target writes
- migrate write-plan wrote `/tmp/intentos-042-migration-plan.json`
- migrate without safe output flag failed with status 2 as expected

Evidence refs:

- `releases/0.42.0/phase-report.md`
- `review-loop-reports/042-docs-ia-migration-command.md`
- `final-reports/042-docs-ia-migration-command.md`

Skipped evidence and reason:

- UI screenshots: not applicable
- migration apply proof: intentionally out of scope

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `README.md` | update | short entry | low |
| `README.zh-CN.md` | update | short Chinese entry | low |
| `docs/` | add | operator, reference, playbook, migration, FAQ, troubleshooting | low |
| `scripts/cli.mjs` | update | route migrate command | medium |
| `scripts/migrate-project.mjs` | add | plan-only migration command | medium |
| `scripts/check-intentos.mjs` | update | self-check migrate and docs IA | medium |
| `intentos-manifest.json` | update | source asset inventory | medium |
| `VERSION.md`, `package.json`, `templates/*` | update | version metadata | low |
| `releases/0.42.0/phase-report.md` | add | release evidence | low |
| workflow artifacts | add/update | task evidence | low |

## Diff Summary

- Converted README into entry pages.
- Added complete docs IA under `docs/`.
- Implemented safe migration plan CLI.
- Updated productization metadata and checks.

## Known Risks

- Migration plan recommendations are broad and conservative.
- Exact apply behavior remains a future phase.
- Full 1.0 real adoption evidence is still pending.

## Open Questions

- What target project should be used for 1.0 real adoption evidence?
- Whether future migration apply should exist remains a human decision.

## Reviewer Checklist

- [x] The implementation matches the request and spec.
- [x] The change stays inside approved scope.
- [x] Non-goals were not implemented accidentally.
- [x] Risk Gate items match the actual touched areas.
- [x] Human Approval is present when required.
- [x] Verification evidence is enough for the stated risk.
- [x] Engineering baseline is checked when structure, contracts, schema, permissions, migrations, dependencies, or cross-module state changed.
- [x] Baseline or industrial evidence gaps are called out.
- [x] Dirty worktree or pre-existing changes are separated from this task.
- [x] No secrets, production config, migrations, or release paths changed without approval.
- [x] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

Findings:

- No current-task defect found in self-review before full final gate.

Required follow-up:

- Future migration apply requires a separate request, spec, risk approval, and review.
