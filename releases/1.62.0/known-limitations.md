# 1.62.0 Known Limitations

1.62 is a native migration planning release, not a migration apply release.

## Limitations

- It does not automatically rewrite `AGENTS.md`, PR templates, CI, hooks, release SOPs, production config, or business code.
- It cannot prove that every old project rule is current or authoritative; unclear rules must be classified by a human owner.
- It cannot decide whether business behavior is correct.
- It cannot approve production, release, migration, payment, permission, security, privacy, compliance, legal, tax, finance, HR, or customer-data changes.
- It cannot turn a dirty worktree into a safe apply state.
- It does not install hooks or add gates.
- It does not replace existing project release or incident ownership.

## Intended Use

Use 1.62 to make Codex stop staying in vague adapter-only mode for old projects.

The expected result is a reviewed Native Migration Plan that says:

```text
IntentOS can be the planning workflow.
The project keeps business and production authority.
No target files are written until a reviewed apply chain is approved.
```

## Not Proof

Passing `check-native-migration` means the recorded migration plan respects 1.62 boundaries.

It does not prove the target project is safe, complete, migrated, production-ready, or correctly implemented.
