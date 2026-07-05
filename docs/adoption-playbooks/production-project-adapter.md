# Production Project Adapter Playbook

Use this playbook for live, customer-facing, regulated, or release-sensitive projects.

## Goal

Use IntentOS as an adapter layer around the existing production process, not as a replacement.

## Rule

Production projects do not get default workflow writes.

They need:

```text
read-only mapping -> adapter decision -> reviewed plan -> controlled apply -> evidence
```

## Required Inputs

Before any write, identify:

- release owner
- rollback owner
- incident owner
- production config owner
- permission model owner
- data migration owner
- CI owner
- existing test and release commands

## Steps

1. Run project state detection:

```bash
node scripts/cli.mjs next ../project
```

2. If production or governed signals exist, do not initialize.

3. Produce adoption assessment and existing governance map.

4. Decide adapter approach:

| Approach | Meaning |
|---|---|
| read-only only | AI uses existing docs and creates no workflow files |
| docs-only adapter | IntentOS docs describe how to use existing process |
| selected assets | Only approved templates/checkers are added |
| full adoption later | Separate project with explicit approval |

5. For any selected asset update, use plan-first flow:

```bash
node scripts/init-project.mjs --target ../project --update-workflow-assets --write-plan migration-plan.json
```

6. Apply only after review and approval.

## Review Requirements

Production adapter work must record:

- Review Packet
- Review Loop Report
- Final Report
- release and rollback impact
- human decisions

## Forbidden Without Explicit Approval

- changing production config
- changing secrets
- changing permissions
- changing payment or value-transfer behavior
- changing migrations
- changing release workflow
- overwriting `AGENTS.md`
- overwriting PR template
- adding CI gates that block production

## Rollback

Rollback must be a project-owned decision. The IntentOS can record rollback notes, but it does not replace the production rollback process.
