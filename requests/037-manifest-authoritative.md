# Request: Manifest Authoritative Asset Source

## Raw Request

Execute Productization Hardcut phase `0.37.0`: make the dev-kit manifest the authoritative source for required assets and safe static copy rules.

## User / Customer

Maintainers of `ai-native-dev-kit` and real-project adopters who need asset lists to be changed in one place without synchronizing multiple scripts by hand.

## Problem

The manifest exists, but phase `0.36.0` still leaves required paths and copy rules repeated across scripts. This creates drift risk when new workflow assets are added.

## Desired Outcome

Make `dev-kit-manifest.json` authoritative for source required files, target required paths, workflow readiness paths, workflow version assets, and safe static copy rules while preserving existing governance protections.

## Constraints

- Do not weaken existing governed, production, or dirty worktree protections.
- Do not change PR template or AGENTS migration approval behavior.
- Do not change industrial pack selection semantics.
- Do not implement init/update plan, backup, or migration behavior from later phases.
- Do not add dependencies.
- Keep generated-project smoke and dev-kit self-check green.

## Priority

P1

## Suggested Task Level

L2
