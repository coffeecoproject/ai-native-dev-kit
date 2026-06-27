# High-risk Change Environment Topics

Use these topics when a task touches production, secrets, migrations, permissions, payments, irreversible operations, or regulated data.

## Required Confirmation

- human approval scope
- production or staging ownership
- rollback owner
- release owner
- incident owner
- verification evidence

## Stop Conditions

Codex must stop when:

- secret values are needed
- production credentials are needed
- rollback path is unknown
- migration rollback is unknown
- permission ownership is unclear
- payment or value-transfer behavior changes without approval
- deployment or CI changes are required but not approved

## Evidence

- environment baseline ref
- risk gate ref
- decision brief ref
- review packet ref
- review loop report ref
- release or rollback evidence ref
