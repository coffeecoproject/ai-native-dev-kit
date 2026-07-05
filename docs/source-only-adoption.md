# Source-Only Adoption

IntentOS is currently adopted from the source repository.

This means users should not assume there is a published npm package, hosted service, installer, dashboard, or one-command production setup.

The repository exposes CLI aliases in `package.json` for local source checkout usage, but the package remains private and is not an npm distribution contract.

## Before You Start

Source-only adoption expects local command-line tools:

```bash
node --version
npm --version
git --version
```

Required baseline:

- Node.js `>=22`
- npm available with the local Node install
- git available for clone, status, tag, and repository checks

If Node is older than `22`, upgrade Node before running IntentOS scripts.

## Basic Path

Clone the repository, then run the public entry commands against the project you want Codex to work on:

```bash
git clone https://github.com/coffeecoproject/ai-native-dev-kit.git
cd ai-native-dev-kit

node scripts/cli.mjs start ../my-project
node scripts/cli.mjs next ../my-project
node scripts/cli.mjs doctor ../my-project
```

These commands are read-only. They help Codex understand the project, recommend the next safe path, and report workflow health.

## Existing Projects

For existing, governed, dirty, or production-sensitive projects, do not start with direct workflow updates.

Use the public entry first:

```bash
node scripts/cli.mjs start ../existing-project
node scripts/cli.mjs next ../existing-project
node scripts/cli.mjs doctor ../existing-project
```

If workflow assets may need to change, IntentOS should recommend a plan-first path:

```bash
node scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --write-plan ./intentos-workflow-update-plan.json
```

The plan must be reviewed before any apply step.

## New Projects

For a new empty project, Codex may recommend starter initialization after confirming the goal and platform.

This is still not production approval. Release, CI, hooks, secrets, migrations, payments, permissions, and production configuration remain separate human decisions.

## Current Boundary

Source-only adoption does not:

- publish or install an npm package;
- create a global CLI by itself;
- approve implementation;
- approve release or production;
- replace existing project governance;
- change CI, hooks, secrets, deployment, or rollback rules without a reviewed plan and explicit approval.
