# New Project Playbook

Use this playbook when the target project has little or no existing governance.

## Goal

Start clean without making the first setup too heavy.

## Steps

1. Read project state:

```bash
node scripts/cli.mjs next ../project
```

2. Initialize workflow assets:

```bash
node scripts/cli.mjs init --starter generic-project --target ../project
```

3. Enter the project and check core workflow:

```bash
node scripts/check-ai-workflow.mjs . --mode core
node scripts/workflow-next.mjs .
```

4. Fill onboarding docs:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`
- `docs/verification-matrix.md`
- `docs/engineering-baseline.md`

5. Select platform profile:

- Web
- iOS
- Android
- WeChat Mini Program
- backend API
- internal admin
- high-risk change

6. Select baseline level:

- `O0 + BL0` for lightweight work
- `O1 + BL1` for normal product work
- `O2 + BL2` only when the project has real risk

7. Run the first vertical slice through:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Verify -> Review -> Final Report
```

## Human Decisions

Humans must confirm:

- project goal
- platform
- first slice
- verification command
- risk level
- any BL2 industrial pack selection

## Stop Conditions

Stop if the project turns out to be production, governed, dirty, or dependent on secrets, release config, payment, or regulated data before onboarding decisions exist.
