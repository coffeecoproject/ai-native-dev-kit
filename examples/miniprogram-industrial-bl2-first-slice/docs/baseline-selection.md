# Baseline Selection

## Status

Draft status: CONFIRMED

Human decision status: CONFIRMED

## Baseline Level

BL2_INDUSTRIAL:

Rationale: This example demonstrates evidence-backed Mini Program industrial governance for a login, cloud read, permission, failure-state, and review-readiness slice.

## Selected Profiles

- wechat-miniprogram

## Selected Industrial Packs

- wechat-miniprogram-industrial

## Baseline Rationale

| Selection | Why it applies | Human confirmed |
|---|---|---|
| wechat-miniprogram | The slice changes Mini Program runtime behavior. | Yes |
| wechat-miniprogram-industrial | The slice demonstrates BL2 Mini Program evidence and task gates. | Yes |

## Human Approval

Status: APPROVED

Approval scope: BL2 Mini Program example only; no production release, production config, secrets, payment, admin backend, destructive behavior, or real user data approved.

## Baseline Exceptions

| Requirement | Exception | Reason | Owner | Review date | Human accepted |
|---|---|---|---|---|---|
| admin backend | not selected | this first slice covers only the Mini Program runtime; admin backend packs must be selected separately when in scope | example-owner | 2026-06-26 | Yes |

## Residual Risk Register

| Risk | Impact | Mitigation | Owner | Review date | Accepted by human |
|---|---|---|---|---|---|
| example evidence only | does not prove a real project is production-ready | replace refs with project evidence during adoption | example-owner | 2026-06-26 | Yes |

## Review Cadence

- Review when the Mini Program industrial pack changes.
