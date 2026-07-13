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

4. Codex derives and fills onboarding docs:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`
- `docs/verification-matrix.md`
- `docs/engineering-baseline.md`

5. Codex selects the platform Profile:

- Web
- iOS
- Android
- WeChat Mini Program
- backend API
- internal admin
- high-risk change

6. Codex selects the baseline level:

- `O0 + BL0` for lightweight work
- `O1 + BL1` for normal product work
- `O2 + BL2` only when the project has real risk

7. Run the first vertical slice through:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Verify -> Review -> Final Report
```

## User Input Boundary

The user supplies only:

- the project goal and unavailable business facts;
- a material product preference;
- exact consent for a prepared real-world effect;
- an external fact that project evidence cannot prove.

Codex derives platform, first slice, verification, risk level, BL level, and
industrial packs.

## Stop Conditions

Stop the dependent action if the project turns out to be production, governed,
dirty, or dependent on secrets, release config, payment, or regulated data
before the required evidence and controlled route exist.
