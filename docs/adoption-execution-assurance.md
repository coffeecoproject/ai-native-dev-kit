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
