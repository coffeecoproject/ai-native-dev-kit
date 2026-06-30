# 1.40 Approval Record Governance Example

This example shows a valid approval record for low-risk workflow asset updates.

The record is human-owned, action-specific, bounded, expiring, and non-executing.

It proves:

- approval is not inferred from readiness;
- approved action IDs are explicit;
- target paths are bounded;
- plan hash is recorded;
- rollback and verification are acknowledged;
- Codex still cannot apply automatically.

Run:

```bash
node scripts/check-approval-record.mjs examples/1.40-approval-record-governance
```
