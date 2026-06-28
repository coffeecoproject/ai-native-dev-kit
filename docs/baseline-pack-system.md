# Baseline Pack System

Baseline packs answer one practical question:

```text
For this kind of project, how strict should Codex be before it writes or changes anything risky?
```

## Plain Meaning

There are three decisions:

1. What kind of project is this?
2. How strict should the project be?
3. Which platform, capability, or risk packs are actually needed?

The system should help Codex explain the answer clearly. It should not make the user understand every script.

## Levels

| Level | Plain meaning |
|---|---|
| `BL0` | Light project, prototype, local tool, low risk |
| `BL1` | Normal project with clear rules |
| `BL2` | Industrial-level work with stronger evidence and review |

BL2 is not automatically better. It is heavier and should be used when the risk justifies it.

## Packs

There are three pack types:

- platform packs: Web, Mini Program, iOS, Android
- capability packs: backend, admin, auth, data, CloudBase
- risk packs: payment/value transfer, high-risk change

For example:

```text
Mini Program with backend admin
  -> Mini Program platform pack
  -> internal admin pack if there is a management console
  -> backend or CloudBase pack depending on the backend
  -> auth/data packs if login, roles, records, or storage matter
  -> payment pack only if money/value movement exists
```

## Default Rule

Do not install or enable all packs.

Use only the smallest pack set that matches the real project.

## Human Role

The human decides:

- project type
- BL level
- whether draft packs are accepted
- whether missing evidence blocks the next task
- whether a risky change may proceed

Codex can recommend and prepare a report. Codex cannot silently approve.

## Commands

Read-only recommendation:

```bash
node scripts/cli.mjs baseline-packs <project>
```

Check recorded pack selection reports:

```bash
node scripts/cli.mjs baseline-pack-selection <project>
```

For BL2 industrial work:

```bash
node scripts/resolve-industrial-baseline.mjs <project>
node scripts/check-industrial-baseline.mjs <project> --bl2-only
```

## Important Boundary

Baseline pack selection does not mean:

- AI can write project files
- production is approved
- release is approved
- security/privacy/legal is approved
- the selected pack is stable
- the project already has evidence

It only records the intended governance path.

