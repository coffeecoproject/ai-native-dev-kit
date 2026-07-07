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

## Target Matrix

Required evidence depends on the target:

- preview;
- internal trial;
- staging;
- production review;
- app-store review;
- mini-program review.

Production-like targets require stricter evidence: clean source revision,
rollback, monitoring, incident owner, environment/config owner, data/migration
decision, and release-owner handoff.

## Boundary

`READY_FOR_RELEASE_OWNER_REVIEW` means the evidence package may be handed to the
human release owner. It does not mean the release is approved or that Codex may
deploy, submit, migrate, or mutate external systems.
