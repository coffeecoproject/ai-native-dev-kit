# Hook Orchestration Review Checklist

Use this checklist when reviewing a Hook Orchestration Plan.

## Required

- Existing hooks and CI are inventoried.
- Each candidate has a trigger, action, level, installation status, blocking behavior, external API status, and human approval status.
- H0/H1 candidates are read-only or suggestion-only.
- H2 candidates require human confirmation before installation or file changes.
- H3 candidates require explicit approval before blocking, CI, API, release, auto-fix, or production-related behavior.
- The plan includes rollback / disable notes.
- The plan states that no hooks are installed by the plan itself.
- The plan states that CI is not modified by the plan itself.
- The plan states that no blocking gate is added by the plan itself.

## Stop Conditions

Stop if the plan:

- says hooks were installed
- modifies CI
- adds a blocking gate
- enables auto-fix
- calls an external API
- stores tokens or secrets
- treats hook output as human approval
- approves implementation, release, production, or high-risk decisions
- lacks a rollback / disable path for H2/H3 candidates

