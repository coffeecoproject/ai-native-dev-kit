# Codex Quickstart

This adapter is for one zero-experience user working with Codex. The user states
the product goal and real business facts; Codex owns technical discovery,
architecture, profiles, baselines, implementation, tests, review, repair, and
rollback preparation.

## Start In Natural Language

Give Codex the IntentOS source path or repository URL and the target project,
then say what outcome you want:

```text
Read this IntentOS and configure the current project yourself. I want a small
booking app that runs locally first.
```

For an existing project:

```text
Read this existing project under IntentOS, preserve its proven rules, and
continue the current work safely.
```

Codex enters through the shared `work` route. It must not ask the user to pick
a starter, command, profile, BL level, pack, database, test strategy, reviewer,
signing strategy, CI provider, or migration mechanism.

## Public Command Evidence

When a command transcript is useful, use only `work`:

```bash
node intentos/scripts/cli.mjs work ../my-project "开始这个项目并完成第一个可用功能"
node intentos/scripts/cli.mjs work ../my-project "继续完成预约时间规则"
node intentos/scripts/cli.mjs work ../my-project "检查当前任务做到哪里了"
node intentos/scripts/cli.mjs work ../my-project "这个任务做完了吗"
node intentos/scripts/cli.mjs work ../old-project "让这个老项目按 IntentOS 工作"
```

The route is read-only and selects lower-level source systems internally. A
normal natural-language implementation request is sufficient intent for
ordinary reversible project-local engineering after internal gates pass; no
second technical approval is required.

## Source And Installed Authority

Before an old project has IntentOS installed, a source-run uses the source
checkout's authoritative profiles for read-only diagnosis. It does not trust a
target-local lookalike profile.

After installation, Codex uses the target's `.intentos` manifest, profiles, and
guidance. Missing installed authority fails closed instead of falling back to
the source checkout. Every starter guidance file copied into `AGENTS.md`,
`README.md`, or `docs/*.md` is part of the effective installed guidance graph.

## Signing And Release Boundary

Signing configuration, entitlement/manifest design, provisioning or keystore
integration, local builds, archives, bundles, and readiness verification are
technical preparation owned by Codex. They do not require the user to approve
a technical strategy.

Codex asks only for an unavailable external account fact or exact consent
immediately before a prepared real store/provider action, hosted execution,
production change, real-user distribution, external cost, or irreversible
real-data effect. Local readiness never implies that an upload or release was
authorized or performed.

## Hosted Automation

Generated projects receive local checker scripts as core assets. They do not
receive a GitHub-hosted Actions workflow by default.

`platforms/github/ci-ai-workflow.yml` is an optional adapter template. Codex may
prepare it only after repository/provider facts prove the fit and the exact
trigger, runner, permissions, usage/cost, artifact/cache, and release-side-
effect boundaries are known. Enabling or running it requires consent to the
concrete external effect when applicable. Local checker enforcement remains
available when the adapter is absent.

## Maintainer Debugging

The commands below expose internal stages for diagnostics, CI development, and
controlled installation. They are not an ordinary-user workflow or a menu of
technical choices.

```bash
node intentos/scripts/cli.mjs --help-advanced
node intentos/scripts/start-project.mjs ../my-project
node intentos/scripts/cli.mjs baseline ../my-project
node intentos/scripts/workflow-next.mjs ../my-project
```

Controlled empty-project initialization:

```bash
node intentos/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-project
```

Project-local diagnostic checks:

```bash
node scripts/check-engineering-baseline.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
node scripts/check-workflow-artifacts.mjs . --mode ready
```

Artifact generators and summary commands remain available under
`node scripts/cli.mjs --help-advanced`. Codex invokes them when evidence requires
them; the user does not assemble or approve the internal workflow package.
