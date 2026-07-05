# Adoption Execution Assurance

This layer answers one practical question:

```text
Has this old project really adopted IntentOS, or did we only write a report?
```

The answer must come from evidence, not confidence.

## What It Checks

Adoption assurance checks whether the project has enough verified surfaces for Codex to work in IntentOS mode:

- workflow entry;
- existing AI rules / `AGENTS.md`;
- engineering and environment baselines;
- release / rollback ownership;
- CI and hooks;
- documents and source of truth;
- work queue behavior;
- AI logs / audit boundary;
- protected risk authority;
- apply-plan / approval / readiness chain when writes happened;
- a read-only simulated task.

## Plain Meaning

`VERIFIED_ACTIVE` means IntentOS is the active working mode for this project.

It does not mean IntentOS owns production, release, business rules, secrets, data, compliance, or deployment authority.

`PARTIAL_ADOPTION` means Codex can still work in IntentOS mode, but it must stay plan-first and list what is missing.

`BLOCKED_BY_UPSTREAM_EVIDENCE` means one of the required upstream checks, such as migration, rule reconciliation, convergence, or release plan evidence, returned `BLOCKED` or `NEEDS_INPUT`. Codex may explain the issue, but it must not claim full adoption.

`PRESENT_UNVERIFIED` means something exists but is not enough proof yet. For example, an empty apply-chain directory or `.gitkeep` is not verified apply evidence.

## Evidence Quality

A passed simulation must show more than a route name. Each step needs an exit code, read-only marker, target-file write marker, target diff status, output digest, and outcome summary.

In plain language: Codex must show that it actually walked the route and did not change the target project while doing so.

## Install Scope

Some assurance assets are copied into target projects when workflow assets are intentionally installed or updated. Other assets stay source-only in this repository, such as examples, bad fixtures, release records, and calibration evidence.

Source-only assets are useful for validating IntentOS itself. They are not proof that a target project has adopted IntentOS.

## Commands

```bash
node scripts/cli.mjs adoption-assurance <target>
node scripts/cli.mjs adoption-assurance-check <target>
```

Useful strict checks:

```bash
node scripts/check-adoption-assurance.mjs <target> --require-structured-evidence
node scripts/check-adoption-assurance.mjs <target> --require-structured-evidence --require-simulation
```

## User-Facing Rule

Codex must not say an old project has fully adopted IntentOS unless the assurance state is `VERIFIED_ACTIVE`.

If the state is partial, Codex should say what is safe now and what still needs evidence.

If there are no adoption assurance reports yet, the checker may skip report validation. That skip is not proof of adoption; it only means no report exists to validate.
