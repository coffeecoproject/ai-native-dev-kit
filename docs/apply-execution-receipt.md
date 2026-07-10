# Apply Execution Receipt

Apply Execution Receipt answers a plain question:

> Did IntentOS apply exactly the files that were approved, and can the project
> enter the installed workflow afterwards?

The receipt is generated automatically. Users do not compare action IDs,
digests, or file lists manually.

## Result

- `APPLY_VERIFIED`: exact bounded apply and workflow activation were verified.
- `APPLY_FAILED_NO_WRITE`: validation stopped before a target write.
- `APPLY_FAILED_ROLLED_BACK`: apply failed and written targets were restored.
- `APPLY_PARTIAL_ROLLBACK_REQUIRED`: rollback could not be fully proven; stop
  for a project owner.
- `ACTIVATION_NOT_VERIFIED`: files were applied but workflow activation was not
  proven; active adoption cannot be claimed.

The receipt never approves release, production, business behavior, CI, hooks,
data migration, secrets, or high-risk work.

## Maintainer Check

```bash
node scripts/cli.mjs apply-receipt-check . --require-structured-evidence
```

