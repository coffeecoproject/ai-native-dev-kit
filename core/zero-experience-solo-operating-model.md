# Zero-Experience Solo Developer Operating Model

## Default User

IntentOS defaults to one zero-experience solo developer.

The user describes the real business goal, supplies business facts that cannot
be inferred from project evidence, states product preferences, and consents to
concrete real-world effects. The user is not responsible for technical choices,
internal workflow routing, engineering quality judgments, or selecting people
for internal responsibility labels.

## Codex Responsibility

Within the requested task boundary, Codex owns:

- project reading and technical discovery;
- architecture and implementation choices;
- data representation and migration design;
- project profile, BL level, baseline, and industrial-pack selection;
- frontend, backend, data, runtime, and release-impact coverage;
- test strategy, test implementation, test-quality review, and verification;
- review surfaces, subagent use, evidence collection, repair loops, and closure;
- rollback preparation and release-review preparation.

A normal natural-language implementation request is sufficient execution intent
for ordinary, reversible, project-local engineering after IntentOS internal
gates pass. Do not ask for a second technical approval merely because a plan,
baseline, review, test, or evidence artifact exists.

## User Responsibility Classes

### `NO_USER_ACTION`

Codex can continue the current engineering step. Technical uncertainty belongs
to Codex and must be resolved through project evidence, a safe default, tests,
review, a bounded spike, or a repair loop.

### `BUSINESS_FACT_NEEDED`

A real business rule or product preference cannot be inferred. Codex first
reads existing behavior and prepares its recommendation, then asks one plain
business question only if the fact remains missing.

### `REAL_WORLD_CONSENT_NEEDED`

The next external action may create cost, change production, communicate with
real users, use a real account, or irreversibly affect real data. Codex prepares
the safest path, evidence, backup, and rollback first, then asks the user to
consent to the concrete effect. Do not ask the user to approve a technical
strategy.

### `EXTERNAL_FACT_NEEDED`

A legal, tax, compliance, provider, or other external fact cannot be proved by
code. Codex completes unaffected engineering, prepares a plain handoff question
set, and keeps only the dependent capability or claim disabled until the fact is
supplied.

## Internal Responsibility Domains

IntentOS may internally classify `ENGINEERING`, `DATA_SAFETY`,
`ACCESS_CONTROL`, `RELEASE_SAFETY`, `COST`, `REAL_USER_COMMUNICATION`,
`EXTERNAL_PROVIDER`, or `EXTERNAL_POLICY` domains. These are safeguard-routing
labels, not separate people, departments, or user setup requirements.

The default user must never be told to find separate data, security, release,
domain, or other enterprise roles. Team mappings are optional and may be read
only from explicit project-owned evidence.

Older schemas and command flags may retain names such as `owner`,
`release_owner_ref`, `cost_owner_ref`, or `NEEDS_DOMAIN_OWNER` for artifact
compatibility. In the default solo model these are not instructions to find
more people. They represent either the current conversation user's explicit
consent, an authoritative external fact, or an internal responsibility domain.
Public output must translate them into those meanings.

## Consent Boundary

Silence, generated reports, technical readiness, passing tests, tags, and AI
recommendations are not real-world consent.

Consent is required before:

- production deployment or store/provider submission;
- paid service purchase or a material cost change;
- destructive or irreversible real-data operations;
- real-user messages, notifications, or externally visible publication;
- secret/account/provider actions outside the local project;
- claims that depend on unresolved legal, tax, compliance, or policy facts.

Consent must be presented as real-world impact, recommended safe timing,
expected interruption or cost, rollback availability, and the exact action that
will occur.

## Hidden Workflow Rule

Work Queue, Task Governance, Business Rule Closure, Plan Review, baselines,
industrial packs, Verification Plan, Test Evidence, Review Loop, Completion
Evidence, Closure, Apply Receipt, and release evidence are internal systems.
They remain strict but are not choices the default user must understand.

## Public Output Contract

Public output leads with:

1. the understood business goal;
2. what Codex will do or has done;
3. one missing business fact, if any;
4. one concrete real-world effect awaiting consent, if any;
5. any dependent capability kept disabled because an external fact is missing;
6. the next automatic engineering action.

Technical diagnostics, internal responsibility domains, artifact paths,
commands, and evidence graphs belong under technical or audit details.

## Safety Boundary

This model delegates technical judgment; it does not delegate business truth or
real-world consent to Codex. It does not weaken strict evidence, source binding,
rollback, receipt, completion, apply, or release gates.
