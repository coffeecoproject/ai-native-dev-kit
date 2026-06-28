# Release 1.15.1 Known Limitations

## Human Summary

1.15.1 is a registry hardening patch. It does not make standard packs stable or production-proven.

## Limits

- All standard packs remain `draft`.
- All industrial packs remain selected-only and draft unless separately promoted by evidence.
- `standard-baseline-packs/schema/index.schema.json` is a schema artifact, but runtime validation is implemented by `scripts/check-standard-baseline-pack.mjs`; no external JSON schema validator is introduced.
- Environment checks catch high-risk overclaims, but they do not inspect real target-project environments.
- `npm run verify` now runs resolver commands locally, but this is still repository self-check evidence, not real project production evidence.
- CODEOWNERS still has no active owner rules because real GitHub handles require a human maintainer decision.
- 1.16 and 1.17 plan docs are roadmap artifacts only; they are not implemented by this release.

## Not Production Evidence

This release does not prove that a real project satisfies any standard pack.

Project evidence must still live in project-specific files such as:

```text
docs/project-profile.md
docs/baseline-selection.md
docs/baseline-evidence.md
standard-baseline-selections/*.md
```

## No Authorization

1.15.1 does not authorize:

- target-project writes
- implementation
- release or production
- security/privacy/compliance approval
- payment, finance, HR, tax, legal, or migration decisions
