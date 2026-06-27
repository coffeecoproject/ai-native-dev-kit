# Existing Light Project Playbook

Use this playbook when a project already exists but does not have strong governance, release gates, or production controls.

## Goal

Add AI Native governance without rewriting the project.

## Rule

Do not start by refactoring old code.

Use this order:

```text
read project -> create context -> govern new work -> improve old debt only when touched
```

## Steps

1. Read project state:

```bash
node scripts/cli.mjs next ../project
```

2. Preview update plan:

```bash
node scripts/cli.mjs update --target ../project --dry-run
```

3. If safe, write a reviewable plan:

```bash
node scripts/init-project.mjs --target ../project --update-workflow-assets --write-plan migration-plan.json
```

4. Review the plan before applying.

5. Fill missing context docs:

- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/permission-model.md` if relevant
- `docs/risk-policy.md` if relevant
- `docs/test-strategy.md` if relevant
- `docs/engineering-baseline.md`

6. Start with new requirements only.

7. For old code debt, fix only the area touched by the current approved task.

## Human Decisions

Humans confirm:

- which existing rules are source of truth
- what must not be touched
- which checks are real
- which old debt is intentionally deferred
- whether generated workflow files may be applied

## Stop Conditions

Stop and switch to the governed read-only playbook if the project has:

- production release controls
- strict CI or guard scripts
- existing agent instructions
- dirty worktree
- security-sensitive code
- payment, permission, or regulated data logic
