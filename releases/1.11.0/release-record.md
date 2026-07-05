# Release Record: 1.11.0 Governance Hardening & Drift Guard

## Human Summary

1.11.0 makes the IntentOS harder to drift and harder to misuse. It synchronizes release pointers, protects direct init on non-empty directories, adds manifest reverse drift checking, strengthens release section validation, and adds `npm run verify`.

## Scope

- README current-release sync.
- Direct init non-empty target protection.
- Manifest reverse drift guard.
- Structured release claim section validation.
- Release-level verify script.
- 1.11 workflow evidence and self-check coverage.

## Allowed Claims

- The IntentOS now refuses direct init into non-empty targets unless `--force-new-project` is explicitly passed.
- The manifest checker now reports important source assets that are not covered by manifest source inventory or copy rules.
- Release claim checks now require meaningful section bodies for required release sections.
- `npm run verify` provides a single local release verification command.

## Forbidden Claims

- This release does not prove production project adoption.
- This release does not promote industrial packs out of `draft`.
- This release does not add automatic GPT/API review.
- This release does not add automatic real-project scanning.
- This release does not change license terms.
- This release does not add real CODEOWNERS or fake maintainer owners.
- This release does not approve target-project writes, production launch, release, payment, privacy, security, compliance, migration, or risk acceptance.

## Evidence Status

- Source assets: present
- Manifest: PASS
- Self-check: PASS
- Real-project validation: not claimed

## Verification

```bash
node --check scripts/init-project.mjs
node --check scripts/check-manifest.mjs
node --check scripts/check-claim-control.mjs
node --check scripts/check-product-baseline.mjs
node --check scripts/check-intentos.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Known Limitations

See `releases/1.11.0/known-limitations.md`.
