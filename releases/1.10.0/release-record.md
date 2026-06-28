# Release Record: 1.10.0 Guided Decision & Delivery Loop

## Human Summary

1.10.0 makes the kit better at guiding users through delivery: Codex recommends the smallest safe path, keeps one current mainline, parks side ideas, and translates raw technical choices into user-owned decisions.

## Scope

- Decision Delegation Boundary
- Guided Delivery Loop
- Active Work Thread template
- Guided Decision Summary template
- Delivery Coach prompt
- `new-workflow-item` support for the new optional artifacts
- Documentation, platform adapter, manifest, and version updates

## Allowed Claims

- Codex can recommend the smallest safe next path more clearly.
- Codex can separate current mainline, parking lot, and decision-needed items.
- Codex can translate technical choices into product/risk choices.
- Active Work Thread and Guided Decision Summary are optional routing aids.

## Forbidden Claims

- Codex can decide all technical questions.
- Users no longer need to approve risk.
- The new artifacts approve implementation.
- The new artifacts approve release, production, payment, privacy, security, compliance, migration, or target-project writes.
- Parking Lot items are approved backlog.

## Evidence Status

- Source assets: present
- Manifest: PASS
- Self-check: PASS
- Real-project validation: not claimed

## Verification

```bash
node --check scripts/new-workflow-item.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Known Limitations

See `releases/1.10.0/known-limitations.md`.
