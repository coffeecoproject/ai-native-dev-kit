# Troubleshooting

Use this guide when a command blocks or the next workflow step is unclear.

## `workflow-next` says `READ_ONLY`

Do not initialize or update workflow assets.

Create a read-only adoption assessment and governance map first:

- `templates/adoption-assessment.md`
- `templates/existing-governance-map.md`

Then ask for a human decision.

## `workflow-next` says `REVIEW_DIRTY_WORKTREE`

Stop before creating new artifacts or changing files.

Confirm:

- who owns the current changes
- whether they should be committed, split, stashed, ignored, or reviewed
- whether the requested task can safely continue

## `migrate` fails without `--dry-run` or `--write-plan`

This is expected.

0.42.0 migration is plan-only. It cannot apply changes.

Use:

```bash
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --dry-run
```

or:

```bash
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --write-plan migration-plan.json
```

## `check-workflow-artifacts` reports legacy frontmatter warnings

Old artifacts may not have frontmatter.

For new work, regenerate or update the artifact. For old work, record a migration report before treating it as ready in strict contexts.

## `check-review-loop` fails

Common causes:

- L2/L3 task has no Review Packet
- Review Loop Report has too many AUTO_FIX rounds
- verification after fix is missing
- a risk finding is not routed to human decision

Fix only deterministic findings inside the current task scope. Escalate risk decisions.

## `check-next-step-boundary` fails

Common causes:

- final report suggests work outside the current task without a follow-up proposal
- a risk decision is marked as something AI can do now
- `DO_NOT_PROCEED` is mixed with execution advice

Move future work into `follow-up-proposals/` or ask for a new request.

## `check-subagent-orchestration` fails

Common causes:

- helper agent left `RUNNING`
- more than one writer exists
- reviewer agent has write authority
- closure evidence is missing

Close or mark skipped helpers before final response, commit, or handoff.

## Industrial pack checks feel too heavy

Use selected-only checks for target projects.

Do not enable every pack. Select the pack that matches the real risk.

## README feels too short

That is intentional. README is now the entry page. Use the operator manual and reference docs for complete detail.
