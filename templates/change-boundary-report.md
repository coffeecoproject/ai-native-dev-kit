# Change Boundary Report: <number>-<name>

## Human Summary

Plain-language summary of whether the actual changed files stayed inside the approved task boundary.

## Task Ref

`tasks/<file>.md`

## Boundary Level

`CB0_ADVISORY` / `CB1_RECORDED` / `CB2_CHECKED` / `CB3_HUMAN_APPROVED`

## Intended Scope

Allowed paths:

- 

Forbidden paths:

- 

Allowed change types:

- docs-only / test-only / source-only / workflow-assets / config / generated-assets / evidence-only

Forbidden change types:

- dependency / migration / production-config / release / permission / payment / security / privacy / unrelated-refactor

Expected diff scale:

tiny / small / medium / large

## Actual Changed Files

| File | Change type | Inside boundary? | Evidence / note |
|---|---|---|---|
|  |  | Yes / No |  |

## Out-of-Scope Changes

| File | Why out of scope | Required disposition |
|---|---|---|
|  |  | NEEDS_REVIEW / NEEDS_REVERT / NEEDS_HUMAN_DECISION |

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approval ref:

## Boundary Result

Disposition: `PASS` / `NEEDS_REVIEW` / `NEEDS_REVERT` / `NEEDS_HUMAN_DECISION`

Reason:

## Verification

Commands:

```bash
git diff --name-only
node scripts/check-change-boundary.mjs . --report change-boundary-reports/<file>.md
```

## Claim Boundary

This report does not approve implementation, release, production, risk acceptance, or target-project writes.

