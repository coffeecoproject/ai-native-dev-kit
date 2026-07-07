# IntentOS 1.81.3 Release Record

## Theme

Adoption Autopilot Plain-Language And Reference Polish.

## Summary

1.81.3 keeps the old-project `adopt` flow read-only, but makes the first result
card easier for users to judge. The Human Summary now shows plain-language
current state and working mode instead of raw internal enums.

Raw internal states remain available in JSON, Outcome, and Technical Trace so
reviewers can still audit the exact machine-readable result.

## Changed

- `scripts/resolve-existing-project-adoption-autopilot.mjs` prints
  plain-language Human Summary state and working mode.
- `scripts/check-existing-project-adoption-autopilot.mjs` rejects raw internal
  adoption and working-mode enums in Human Summary.
- Adoption Autopilot template and examples now use plain-language Human
  Summary values.
- `docs/reference/scripts.md` lists `adopt` and `adopt-check`.
- README and README.zh-CN capability tables list Existing Project Safe Adoption
  Autopilot.
- self-check coverage validates the 1.81.3 regression.

## Allowed Claims

- `adopt` shows a user-facing old-project adoption result card in plain
  language.
- Raw adoption enums remain available for technical audit in machine-readable
  evidence and Outcome.
- `adopt` / `adopt-check` are documented in the script reference.
- Existing Project Safe Adoption Autopilot is visible in the capability table.

## Forbidden Claims

- This release does not make `adopt` write project files.
- This release does not install `.intentos/`.
- This release does not create or replace `AGENTS.md`.
- This release does not change CI, hooks, release SOPs, secrets, migrations,
  production config, business code, DB, API, Web, Docker, payment, permissions,
  provider state, or project authority.
- This release does not approve implementation, commit, push, release,
  production, app-store review, or mini-program review.
- This release does not implement S1 docs-only adoption, Adoption Continuation,
  or 1.82 controlled native adoption review.

## Evidence Status

- Resolver output now separates user-facing plain language from technical
  evidence enums.
- Checker behavior rejects raw internal enums in Human Summary while preserving
  structured evidence checks.
- Examples pass strict Existing Project Safe Adoption Autopilot checks.
- Manifest, version, README, and release evidence are updated to 1.81.3.

## Known Limitations

- `adopt` remains read-only.
- Existing projects still need rule comparison, convergence evidence, adoption
  assurance, Unified Apply Plan, explicit approval, and readiness before
  target-project workflow assets can change.
- Human Summary is simplified for users, but technical review still depends on
  the machine-readable evidence and source-chain trace.

## Verification

Required verification:

```bash
node --check scripts/resolve-existing-project-adoption-autopilot.mjs
node --check scripts/check-existing-project-adoption-autopilot.mjs
node --check scripts/check-intentos.mjs
node scripts/cli.mjs adopt . --intent "connect existing project"
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/governed-readonly --require-structured-evidence
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/light-existing --require-structured-evidence
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/dirty-blocked --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```
