# Controlled Native Adoption Review

## Human Summary

Controlled Native Adoption Review helps Codex decide how deeply an existing
project should adopt IntentOS after the safe read-only `adopt` entry.

It is review-only. It does not write target-project files, install `.intentos/`,
replace project authority, or approve implementation, release, production,
secrets, data, CI, hooks, or migrations.

## Purpose

Use this layer when an existing project already has a safe adoption posture and
the user asks whether IntentOS should be adopted more deeply.

The review answers:

- whether the project should stay partial;
- whether governance repair should happen first;
- whether only a deeper adoption plan should be prepared;
- whether the project is blocked by owner, production, data, or unsafe state.

## Source Authority

The Existing Project Safe Adoption Autopilot card is a derived user-facing
summary. It cannot be the only source for deeper adoption recommendations.

Controlled Native Adoption Review must use source evidence such as Native
Migration, Existing Rule Reconciliation, Governance Convergence, Adoption
Assurance, git state, baseline, release, CI, environment, test, and owner
signals.

## Boundary

Recommendation is not approval.

The review may recommend a future Unified Apply Plan, Approval Record, and
Controlled Apply Readiness path. It must not execute that path.
