# Public Entry Adoption Integration 1.81.2 Plan

## Goal

Make the public entry behavior unambiguous:

- `start <target>` is read-only orientation only.
- `adopt <target> --intent "<goal>"` is the public entry for existing-project safe adoption.
- A user who only asks Codex to read a project must not accidentally enter write, migration, or workflow-asset application flow.

## Why

1.81.0 introduced Existing Project Safe Adoption Autopilot, but the older
`start` recommendation surface still exposed plan/write/apply next actions.
That made it too easy for users to read `start` as "begin adoption" instead of
"understand the project".

## Scope

Update:

- CLI help and command descriptions.
- `start` recommendation output and JSON boundary fields.
- public docs for first commands and old-project adoption.
- release/version records.
- self-check coverage that prevents regression.

## Non-Goals

- Do not make `start` write target files.
- Do not make `adopt` write target files.
- Do not install `.intentos/`.
- Do not replace project authority, CI, hooks, release SOPs, secrets, database,
  production config, or business code.
- Do not add a new old-project migration layer.

## Expected User Experience

For a new or unknown project:

```bash
node scripts/cli.mjs start <project>
```

Codex reads and classifies only.

For an existing project:

```bash
node scripts/cli.mjs adopt <project> --intent "work under IntentOS safely"
```

Codex runs the safe adoption autopilot and returns one read-only result card.
Any later write still requires Unified Apply Plan, approval, and readiness.

## Acceptance Plan

1. `node scripts/cli.mjs --help` lists `adopt` as a primary entry command.
2. `node scripts/cli.mjs start .` says `start` is read-only orientation only.
3. `node scripts/cli.mjs start .` does not directly recommend applying workflow
   assets or running `init-project --apply-plan`.
4. `node scripts/cli.mjs adopt . --intent "connect existing project"` still
   prints the Existing Project Adoption Autopilot card.
5. `node scripts/check-intentos.mjs` checks the public-entry distinction.
6. Version, release, manifest, templates, README, and Chinese README point to
   `1.81.2`.

## Review Checklist

- [ ] `start` cannot be interpreted as a write or adoption trigger.
- [ ] `adopt` is discoverable from help and docs.
- [ ] old-project adoption remains read-only until apply-plan approval.
- [ ] checks prevent the old wording from returning.
- [ ] no unrelated governance or release behavior is changed.
