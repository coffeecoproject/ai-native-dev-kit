# Release Evidence Gate

Release Evidence Gate answers one question:

```text
Can this release candidate be handed to a human release owner for formal release review?
```

It is a read-only evidence gate. It is not release approval, deployment,
production verification, store submission, mini-program submission, migration
execution, or provider / DNS / payment / secrets / CI ownership.

## Source Authority

Release Evidence Gate reads lower-level source systems:

- Completion Evidence;
- Test Evidence;
- Execution Assurance;
- Product Completeness;
- Launch Review View;
- Release Plan;
- Platform Release Recipe;
- Release Handoff Pack;
- human owner / approval / rollback / monitoring evidence;
- existing project release SOPs.

User Delivery Console is not a source authority. It may display Release Evidence
Gate output, but it must not create, replace, or approve release evidence.

## Required Identity

Every report must identify the release candidate:

- release candidate ref;
- source revision;
- dirty worktree status;
- included task refs;
- included Completion Evidence refs;
- excluded known items;
- build artifact ref and digest when available.

Without release-candidate identity, IntentOS can only reason about an individual
task, not a release review package.

## Completion Evidence Set

Release scope may include more than one Completion Evidence report. A
release-ready report must not validate only the first item. It must record a
Completion Evidence set where every included Completion Evidence ref resolves,
records a digest, exposes task and intent identity, belongs to the current
release scope, and passes strict Completion Evidence checks before the release
candidate can be handed off.

## Evidence Precision

When runtime smoke, rollback, monitoring, build, platform recipe, or handoff
evidence is required, the report must resolve the referenced artifact and record
a digest that can be recomputed from that artifact. Human-readable Markdown
tables must match the machine-readable evidence block for the release scope,
source chain, Completion Evidence set, owner readiness, runtime, rollback,
monitoring, environment, migration, cost, and missing evidence.

## Target Matrix

Required evidence depends on the target:

- preview;
- internal trial;
- staging;
- production review;
- app-store review;
- mini-program review.

Production-like targets require stricter evidence: clean source revision,
rollback, monitoring, incident owner, release owner, risk owner,
environment/config owner, data/migration decision, and release-owner handoff.

## Owner Readiness

Owner identification, owner review, and release approval are separate. Release
Evidence Gate records `owner_readiness` so release owner, risk owner,
environment owner, and release approval refs can be checked structurally. A
human decision record may be referenced, but this gate still keeps release and
production approval as `No`.

## Boundary

`READY_FOR_RELEASE_OWNER_REVIEW` means the evidence package may be handed to the
human release owner. It does not mean the release is approved or that Codex may
deploy, submit, migrate, or mutate external systems.
