# IntentOS 1.56.0 Known Limitations

- Release Execution Protocol does not execute release commands by itself.
- It does not approve production release or rollback risk.
- It does not inspect live production, store, cloud, DNS, payment, secret, or monitoring systems.
- It depends on recorded Launch Review View and Human Release Approval evidence.
- `ASSISTED_EXECUTION` still requires project policy and human approval for any real command execution.
