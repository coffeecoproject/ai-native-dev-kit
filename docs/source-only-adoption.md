# Source-Only Adoption

IntentOS is currently adopted from the source repository. There is no public
npm package, hosted service, dashboard, or global installer contract.

## Before You Start

The source checkout requires Node.js `>=22`, npm, and git.

```bash
node --version
npm --version
git --version
```

## Ordinary User Entry

Most users should give Codex the project path and describe the goal in ordinary
language:

```text
Read this IntentOS source checkout and make ../my-project work under it.
```

When command evidence is useful, there is one public command:

```bash
git clone https://github.com/coffeecoproject/ai-native-dev-kit.git
cd ai-native-dev-kit
node scripts/cli.mjs work ../my-project "检查项目并继续完成我的目标"
```

Use the same `work` entry to start, continue, inspect, finish, prepare a
release, or adopt an older project. IntentOS chooses lower-level commands,
profiles, baselines, tests, review depth, and evidence internally.

The public source-run is read-only. It does not install IntentOS, change the
target, enable CI, access provider accounts, or authorize release/production.

## Older Projects And Profile Authority

When the target has no installed `.intentos` authority, source-run diagnostics
use `profiles/*/baseline.json` from this source checkout. The target project's
own similarly named files cannot replace that source authority. This lets Codex
classify an old project without first writing governance files into it.

After IntentOS is installed, diagnostics use only the target's
`.intentos/profiles/*/baseline.json` copy. A missing or damaged installed copy
fails closed; source-run does not silently borrow a newer source profile.

Profile inference and baseline diagnosis remain technical work. Codex records
the selection and asks the user only for an unavailable business/external fact
or consent to one exact prepared real-world effect.

## New And Existing Projects

For an empty project, Codex may derive a starter and prepare controlled
initialization from the stated product goal.

For an existing, governed, dirty, or production-sensitive project, Codex first
runs the read-only `work` route, preserves stronger proven project rules, and
prepares one bounded update plan if installation is needed. The user does not
choose migration mechanics, profile IDs, baseline levels, action IDs, or
technical approvers.

## Hosted Automation

Local checker scripts are the core enforcement assets and remain usable without
GitHub Actions. The GitHub-hosted workflow is an optional platform adapter, not
an unconditional installation asset.

Codex may prepare that adapter only after project evidence proves the GitHub
repository/provider path, trigger, permissions, runner, usage/cost class,
artifact/cache behavior, and separation from release side effects. Enabling or
running a hosted adapter also requires consent to the exact external execution
or provider-side effect when one is not already authorized. Missing hosted CI
does not mean the local IntentOS checker contract is missing.

## Maintainer Diagnostics

These lower-level commands are for maintainers, debugging, and controlled-plan
evidence. Ordinary users should not be asked to select them.

```bash
node scripts/cli.mjs --help-advanced
node scripts/cli.mjs start ../existing-project
node scripts/cli.mjs next ../existing-project
node scripts/cli.mjs doctor ../existing-project
```

To inspect a possible workflow-asset update without applying it:

```bash
node scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --write-plan ./intentos-workflow-update-plan.json
```

The plan is non-authorizing. Any later target write must use the controlled
apply, rollback, receipt, and activation chain. Hosted CI or provider changes
need their own project/provider facts and exact external-effect consent.

## Current Boundary

Source-only adoption does not:

- publish or install an npm package;
- create a global CLI by itself;
- approve implementation, merge, release, or production;
- replace existing project governance;
- change CI, hooks, secrets, deployment, signing accounts, stores, or rollback
  rules merely because a diagnostic passed.
