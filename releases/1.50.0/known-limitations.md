# IntentOS 1.50.0 Known Limitations

- Evidence reference resolution proves a reference exists or is in an accepted recorded-reference form; it does not prove the evidence is enough for release or production.
- `command-output:<path>` requires a saved local file. It does not run the command.
- `artifact:<id-or-ref>` and `human-decision:<id-or-ref>` are accepted references, not implementation approval or release approval.
- Git diff support reads changed files only. It does not inspect every code path or infer full runtime behavior.
- `--require-impact-coverage` is opt-in to avoid breaking historical Execution Closure records.
- The Change Impact Coverage schema remains at `1.49.0`; 1.50 hardens checker behavior without changing the schema shape.
