# Task: Guided Adoption Entry

## Task Level

L2

## Related Spec

Spec: `specs/110-guided-adoption-entry.md`

## Related Eval

Eval: `evals/110-guided-adoption-entry.md`

## Goal

Implement `1.1.0` Guided Adoption Entry so users can give Codex a project path and receive a safe, read-only adoption recommendation.

## Scope

Allowed:

- Add `scripts/start-project.mjs`.
- Add `start` to `scripts/cli.mjs`.
- Add `scripts/check-guided-adoption.mjs`.
- Add `templates/adoption-recommendation-report.md`.
- Add `adoption-recommendations/`.
- Add `docs/first-hour.md`.
- Add `examples/1.1-guided-adoption/`.
- Add `releases/1.1.0/`.
- Update manifest, workflow version assets, generated-project CI, README, reference docs, and self-check.
- Update version metadata to `1.1.0`.

Not allowed:

- Do not make `start` write project files.
- Do not auto-run init/update/apply-plan from `start`.
- Do not enable BL2 or industrial packs by default.
- Do not add external GPT/API automation.
- Do not change license terms.
- Do not deepen any platform baseline in this phase.

## Acceptance Criteria

- `start` exists and is read-only by default.
- `start` classifies project adoption type and prints a recommendation.
- The recommendation keeps human work to choices and confirmations.
- `check-guided-adoption` validates saved reports.
- Examples cover new, existing-light, and governed-readonly cases.
- Generated projects include the new entry scripts, directory, template, and CI check.
- Version metadata and release evidence are updated to `1.1.0`.
- Full self-check passes.

## Commands

```bash
node --check scripts/start-project.mjs
node --check scripts/check-guided-adoption.mjs
node scripts/cli.mjs --help
node scripts/cli.mjs start .
node scripts/cli.mjs start . --json
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/new-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/existing-light-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/governed-readonly
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
- [ ] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [ ] production config
- [ ] secrets
- [ ] personal data
- [ ] regulated data
- [ ] external side effect
- [ ] privileged operation
- [ ] app signing / platform release
- [ ] cloud function / access rule
- [ ] form interaction
- [ ] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

No item is checked. The change is workflow tooling and docs only.
