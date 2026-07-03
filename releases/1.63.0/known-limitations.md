# 1.63.0 Known Limitations

1.63 is a native migration precision release, not a migration apply release.

## Limitations

- It does not automatically rewrite `AGENTS.md`, PR templates, CI, hooks, release SOPs, production config, or business code.
- It cannot prove every old project rule is current, correct, or authoritative.
- It cannot decide whether business behavior is correct.
- It cannot approve production, release, migration, payment, permission, security, privacy, compliance, legal, tax, finance, HR, or customer-data changes.
- It cannot turn parser warnings into approval; unclassified blocks still need human review.
- It does not install hooks or add gates.
- It does not replace existing project release or incident ownership.

## Intended Use

Use 1.63 when an existing project may move from old project-specific workflow rules toward IntentOS-native planning.

The expected result is a migration plan that says:

```text
These exact old rules were found.
These lines are business or production constraints.
These lines are engineering baseline rules.
These lines are old workflow rules that may be replaced later.
These warnings still need human review.
No target files are written until a reviewed apply chain is approved.
```

## Not Proof

Passing `check-native-migration --require-structured-evidence` means the recorded migration plan has structured evidence and respects 1.63 boundaries.

It does not prove the target project is safe, complete, migrated, production-ready, or correctly implemented.
