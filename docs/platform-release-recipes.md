# Platform Release Recipes

Platform Release Recipes are read-only maps for common release paths.

When a user says "help me launch", IntentOS first uses Release Guide. If there are enough project signals, Release Guide can use a platform recipe to explain what that kind of release usually needs.

## What It Does

- detects likely platform family
- selects or suggests a matching recipe
- explains the safe first release target
- lists missing release inputs
- separates Codex, human, and external-system responsibility
- bridges into Release Execution planning

## What It Does Not Do

- deploy production
- publish previews by itself
- upload to app stores or mini-program platforms
- run provider API commands
- ask for secrets
- mutate DNS, payment, permissions, migrations, production config, CI/CD, or hooks
- approve release

A recipe does not approve release and does not execute release commands. It only explains the platform release path and missing release inputs.

## Strict Recipes In 1.59

| Recipe | Meaning |
|---|---|
| `web-hosted-preview` | preview-first hosted web release path |
| `backend-api-handoff` | backend/API release handoff with migration and rollback boundaries |
| `mini-program-review-handoff` | mini-program review handoff where upload/review/release stay human-owned |

Draft recipes may exist for iOS, Android, internal admin, and container/server release paths. Draft recipes are visible, but they must not pass strict release checks.

## User Flow

```bash
node scripts/cli.mjs release-guide ../my-project --intent "help me launch"
```

For direct recipe inspection:

```bash
node scripts/cli.mjs release-recipe ../my-project --intent "help me launch"
node scripts/cli.mjs release-recipe-check ../my-project
```

## Safety Rule

Unknown or remote-side-effect release actions are not local-safe. Provider APIs, uploads, preview publication, remote mutation, and CI/CD triggers require explicit project policy and human or external-system ownership.
