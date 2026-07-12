# IntentOS

An AI-native system for guided software delivery.

Current release: `1.99.3`.

Release record: [releases/1.99.3/release-record.md](releases/1.99.3/release-record.md).

IntentOS lets one zero-experience solo developer describe real business goals
while the AI handles technical planning, implementation, testing, review,
evidence, repair, migration, and delivery coordination.

It is not a prompt collection, code template, framework starter, or deploy tool. It is a workflow and governance layer for Codex and other AI coding agents.

> You describe the goal and the real business. AI makes the technical decisions and completes
> the internal workflow. You supply only missing business facts and consent to
> concrete real-world effects.

## Start In 30 Seconds

Prerequisite: Node.js `>=22`.

Most users should start with natural language:

```text
I want to build a booking app. Start this project for me.
```

When command evidence is useful, use one public operating loop:

```bash
node scripts/cli.mjs work <project> "<what you want>"
```

`work` identifies the project entry and routes six ordinary meanings: start,
continue, check status, finish, prepare release, or adopt an existing project.
The entry itself is read-only. Ordinary reversible engineering may proceed
after internal gates without another technical approval. Production, cost,
real-user communication, real account/provider, and irreversible real-data
effects still require explicit consent to the concrete effect.

Maintainers can use `node scripts/cli.mjs --help-advanced` for the lower-level
source-system commands. Ordinary users do not need to select them.

Start here:

- [Start Here](docs/start-here.md)
- [Operating Model](docs/operating-model.md)
- [Minimal Adoption](docs/minimal-adoption.md)
- [Source-Only Adoption](docs/source-only-adoption.md)
- [For Existing Projects](docs/for-existing-projects.md)
- [For Maintainers](docs/for-maintainers.md)

Naming note: **IntentOS** is the product, workflow-system, CLI, manifest, and generated-asset identity. The public command is `intentos`.

1.99.3 closes the current review and execution trust chain: review inputs are
bound to the current task and project, Plan Review sources must resolve with
current digests, downstream completion/apply/release checks retain strict
requirements, installed projects use installed authority, and starter
verification fails when no real verification path can run.

1.99.2 makes that authority fail closed for unknown semantic sources, rejects
directly conflicting active guidance, and binds newly generated Review Packets
and GPT review prompts to one current context digest. It does not add user
modes or duplicate the execution evidence chain.

1.99.1 gives the current solo operating contract explicit authority over old
release language and machine-compatibility fields. GPT, reviewer, and subagent
review now reject team-mode proposals, technical choices delegated to the
user, owner-field literalism, and capability scope inflation. Historical audit
records remain available without defining current product direction.

1.99.0 hardcuts the default user model to one zero-experience solo developer.
Public entry no longer asks the user to choose technical architecture,
baselines, packs, tests, review systems, workflow commands, or enterprise owner
roles. IntentOS derives internal responsibility domains and capability coverage,
continues ordinary reversible engineering after internal gates, and asks only
for missing business facts or consent to concrete real-world effects. Strict
evidence, apply, rollback, completion, and release trust remain unchanged.

## Release History

Current behavior is defined by the current product contracts and active runtime,
not by earlier release wording. Detailed audit history remains available in
[VERSION.md](VERSION.md) and the [release records](releases/).

Earlier records may retain machine-compatibility terms such as `owner` or
`human approval`. Under the current solo model, those terms do not require the
user to assemble a team or make technical decisions. See
[Review Context Authority](core/review-context-authority.md).

## How It Works

IntentOS keeps one public interaction loop:

```text
business goal
  -> read the project and current task
  -> choose the technical path internally
  -> implement across every affected surface
  -> test and review the work
  -> repair findings
  -> prove completion
  -> prepare release and rollback
```

The ordinary user does not choose workflow stages, commands, agents, baselines,
or evidence types. Internal systems remain strict and are selected
automatically.

## What IntentOS Covers

- natural-language entry for new and existing projects;
- Work Queue and interrupted-task recovery;
- business-rule closure and cross-surface impact coverage;
- platform and engineering baseline selection;
- implementation planning and plan review;
- verification planning, test evidence, independent review, and repair loops;
- completion evidence and one final close-out decision;
- controlled project migration with exact plans, receipts, and rollback;
- release preparation, evidence, runtime checks, and platform-specific paths.

IntentOS is a governance and delivery system. It does not replace provider
accounts, app stores, cloud platforms, legal or tax sources, or real production
authority.

## New, Existing, And Production Projects

**New projects:** IntentOS derives the platform and engineering depth from the
business goal, establishes the complete baseline, creates the first bounded
slice, and continues through verification.

**Existing projects:** IntentOS reads current code, task records, governance,
baselines, and release rules. It preserves stronger proven rules, repairs weak
or missing governance through controlled apply, and makes the same operating
model active without asking the user to select an adoption mode.

**Production-sensitive projects:** IntentOS first maps current authority and
evidence. Reversible project-local work may continue after internal gates.
Production, paid services, real-user communication, external accounts, and
irreversible real-data effects require consent to the exact prepared effect.

## Safety Boundaries

IntentOS does not:

- invent business, legal, tax, compliance, or provider facts;
- treat silence or a generated report as consent;
- use historical records or compatibility fields to redefine current behavior;
- ask the user to make technical decisions;
- write outside an exact approved project plan;
- treat tests as proof unless their evidence is task-bound and valid;
- claim completion without strict closure evidence;
- treat release readiness as permission to operate production.

## Verification

Repository maintainers can run:

```bash
npm run verify
```

Advanced command, artifact, and checker references are intentionally outside the
ordinary user path:

- [Script Reference](docs/reference/scripts.md)
- [Artifact Reference](docs/reference/artifacts.md)
- [Checker Reference](docs/reference/checkers.md)

## Documentation

- [Start Here](docs/start-here.md)
- [Operating Model](docs/operating-model.md)
- [Minimal Adoption](docs/minimal-adoption.md)
- [Source-Only Adoption](docs/source-only-adoption.md)
- [For Existing Projects](docs/for-existing-projects.md)
- [For Maintainers](docs/for-maintainers.md)
- [Review Context Authority](core/review-context-authority.md)
- [Documentation Index](docs/index.md)
- [Chinese README](README.zh-CN.md)

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See [LICENSE.md](LICENSE.md), [LICENSE-FAQ.md](LICENSE-FAQ.md), and [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md).
