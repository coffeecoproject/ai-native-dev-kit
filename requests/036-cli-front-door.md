# Request: CLI Front Door

## Raw Request

Execute Productization Hardcut phase `0.36.0`: add a stable `intentos` CLI front door after the read-only manifest phase is reviewed.

## User / Customer

Maintainers and real-project users of `intentos` who need one simple entry point instead of memorizing many lower-level scripts.

## Problem

The IntentOS already has strong scripts, but the product surface is still script-first. This makes usage harder for humans and makes future automation harder to explain.

## Desired Outcome

Add a thin CLI facade that routes to existing scripts, prints write commands, supports smoke checks, and keeps lower-level scripts available for CI and detailed evidence.

## Constraints

- CLI must not reimplement checker, init, update, or workflow-next rules.
- CLI must not make manifest authoritative.
- CLI must not publish an npm package or change license terms.
- CLI write commands must show the underlying command before execution.
- `migrate` must not pretend to be implemented before its approved phase.
- Keep `check-intentos` green and make it cover CLI behavior.

## Priority

P1

## Suggested Task Level

L2
