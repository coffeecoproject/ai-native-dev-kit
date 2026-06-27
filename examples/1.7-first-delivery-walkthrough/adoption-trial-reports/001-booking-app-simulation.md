# Adoption Trial Report

## Human Summary

This simulated trial shows that a non-technical user can start with one booking app idea while Codex routes the first slice, keeps payment out of scope, and ends with demo readiness only.

## Scenario

- Project type: booking mini app
- New or existing project: new project idea
- User skill level: basic
- User starting sentence: I want to build a booking mini app for customers to reserve services.
- Platform: mini program candidate
- Baseline target: `BL0_LIGHTWEIGHT`

## User Starting Point

The user only provides the product idea. Codex proposes the first demo slice and asks for confirmation on platform, baseline, and payment deferral.

## Codex Routing

| Step | Codex action | Human role | Result |
|---|---|---|---|
| Start | classify as new project idea | confirm | `NEW_PROJECT` |
| Baseline | recommend BL0 first | choose | `BL0_LIGHTWEIGHT` |
| First slice | propose service/slot/contact/confirmation | confirm | approved demo slice |
| Risk / drift | stop payment request as scope change | decide later | payment deferred |
| Delivery | classify result as demo-ready | confirm boundary | `READY_FOR_DEMO` |

## Baseline Path

- Adoption mode: `NEW_PROJECT`
- Task level: `L1`
- Baseline level: `BL0_LIGHTWEIGHT`
- Selected platform profiles: mini program candidate
- Industrial packs: none
- Why this is the smallest safe path: the slice is a local demo with no payment, production data, release, or deployment.

## Artifact Path

| Artifact | Path | Required? | Reason |
|---|---|---|---|
| Request | `requests/001-booking-app.md` | Yes | first idea capture |
| Spec | `specs/001-booking-app.md` | Yes | demo behavior |
| Eval | `evals/001-booking-app.md` | Yes | acceptance |
| Task | `tasks/001-booking-app.md` | Yes | execution boundary |
| Verification | `evals/001-booking-app.md` | Yes | simulated smoke |
| Review Loop | `review-loop-reports/001-booking-app.md` | Optional | simulated review note |
| Conversation Drift | `conversation-turns/001-add-payment.md` | Yes | payment scope change |
| Launch Readiness | `launch-readiness/001-booking-app-demo.md` | Yes | demo readiness |
| Final Report | `final-reports/001-booking-app.md` | Yes | handoff |

## Human Decisions

| Decision | Status | Owner | Notes |
|---|---|---|---|
| First slice | `Approved` | human | demo booking flow |
| Baseline level | `Approved` | human | BL0 first |
| Scope change | `Deferred` | human | payment future task |
| Release / production | `Not Approved` | human | no customer release |

## Subagent Orchestration

- Subagents used: Yes
- Plan path: `subagent-run-plans/001-booking-app.md`
- Status: `CLOSED`
- Main-thread ownership notes: helper agents review routing and delivery wording only; main thread owns writes and verification.

## Drift Events

| User turn | Classification | Action | Report |
|---|---|---|---|
| Can we also add payment now? | `SCOPE_CHANGE` | stop and defer | `scope-change-reports/001-add-payment.md` |

## Verification Evidence

- Simulated service -> slot -> contact -> confirmation smoke passed.
- Simulated validation smoke passed for missing name and phone.
- `node scripts/check-launch-readiness.mjs examples/1.7-first-delivery-walkthrough` expected to pass.
- `node scripts/check-conversation-drift.mjs examples/1.7-first-delivery-walkthrough` expected to pass.

## Launch Readiness

- Report: `launch-readiness/001-booking-app-demo.md`
- Final readiness: `READY_FOR_DEMO`
- Boundary: demo only; no production, payment, privacy, security, legal, compliance, or release approval.

## Final Report

- Report: `final-reports/001-booking-app.md`
- Completed: first slice definition and simulated evidence.
- Not completed: payment, backend storage, admin console, production release.
- Next safe action: build or demo the local booking flow only.

## Observations

| Observation | Type | Impact | Follow-up |
|---|---|---|---|
| User can start from one plain sentence | positive | lowers workflow burden | keep guided entry |
| Payment appears naturally mid-conversation | risk | scope can expand silently | keep conversation drift report |
| BL0 keeps first slice light | positive | avoids overloading small projects | document minimal path |

## Outcome

`SIMULATED_READY_FOR_DEMO`
