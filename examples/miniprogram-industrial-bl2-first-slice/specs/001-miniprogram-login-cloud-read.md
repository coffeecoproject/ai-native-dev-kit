# Spec 001: Mini Program Login Cloud Read

## Status

Ready

## Source

- Request: `requests/001-miniprogram-login-cloud-read.md`
- Preflight: `preflight/001-miniprogram-login-cloud-read.md`

## Problem

A Mini Program project needs a first BL2 runtime slice that proves login state, protected cloud read behavior, denied state, cloud/API failure recovery, and review-readiness evidence before broader AI-led implementation.

## User Story

As a Mini Program user,
I want one protected read-only page to load my scoped status safely,
so that the project can validate login, permission, and failure behavior before expanding the product.

## Scope

Included:

- one Mini Program page or flow
- WeChat login state check
- read-only protected cloud function or API boundary
- loading, empty, success, error, forbidden, denied-permission, and recovery states
- cloud access rule evidence
- client storage minimization note
- example release-readiness record

## Non-goals

- No admin backend or operations console.
- No payment, refund, balance, or value-transfer flow.
- No production release submission.
- No production config, secrets, or real user data.
- No data migration.
- No framework or cloud provider decision.

## Data Model Impact

New or changed entities:

- No required schema change for this example.
- Use a scoped read-only record with id, displayName, status, updatedAt, and ownerOpenId or equivalent project identity field.

## API / Interface Contract

### Read Current User Status

Input:

```json
{
  "session": "current-wechat-session"
}
```

Output:

```json
{
  "item": {
    "id": "sample_status_001",
    "displayName": "Sample status",
    "status": "ready",
    "updatedAt": "2026-06-26T00:00:00.000Z"
  }
}
```

Errors:

- unauthorized when login state is missing or expired
- forbidden when the cloud access rule rejects the user
- unavailable when the cloud function or API fails

## UI States

- Loading: show stable loading state.
- Empty: show no scoped record state.
- Success: show read-only scoped status.
- Error: show retry-safe error state without exposing internal details.
- Forbidden: show access-denied state without record count.
- Denied permission: show platform permission recovery path if a platform permission is touched.

## Permission Rules

- The protected read boundary must be enforced by cloud function, API, or access rule.
- Client-only filtering is not an authorization boundary.
- The page must not store sensitive personal data in client storage.
- The page must not expose openid, unionid, token, or internal identifiers in UI evidence.

## Observability

- Logs: safe cloud/API failure reason without secrets or identifiers.
- Metrics: optional success/failure counter if the project already has metrics.
- Incident observation: release record names the monitoring or manual observation path.

## Acceptance Criteria

- Login, success, empty, error, forbidden, and recovery states have evidence or documented non-applicability.
- Cloud function or API boundary evidence exists.
- Cloud access rule evidence exists.
- Client storage minimization is documented.
- Release-readiness record documents experience version, review readiness, rollback/mitigation, monitoring, and residual risks.
- No production, payment, admin backend, destructive, framework, or cloud provider change is introduced.

## Test Plan

- Unit: scoped read mapping and error mapping where project test harness exists.
- Integration: page state coverage through fixtures or developer tool evidence.
- Manual: inspect Mini Program developer tool or test device behavior for login, denied, and failure states.
- Review: baseline evidence and release-readiness record are concrete.

## Rollback Notes

Disable or remove the protected read page and cloud boundary for this slice. No data migration rollback is expected.

## Open Questions

- Which real project route and cloud/API boundary should replace the example refs during adoption?
