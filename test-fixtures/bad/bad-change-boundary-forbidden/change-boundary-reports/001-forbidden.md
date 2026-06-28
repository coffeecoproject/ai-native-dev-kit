# Change Boundary Report: forbidden

## Human Summary

Forbidden file was changed but report claims pass.

## Task Ref

`tasks/001-task.md`

## Boundary Level

```text
CB2_CHECKED
```

## Intended Scope

Allowed paths:

- docs/

Forbidden paths:

- .github/workflows/

Allowed change types:

- docs-only

Forbidden change types:

- release

Expected diff scale:

small

## Actual Changed Files

| File | Change type | Inside boundary? | Evidence / note |
|---|---|---|---|
| .github/workflows/deploy.yml | release | No | forbidden |

## Boundary Result

Disposition: `PASS`

Reason: Incorrectly marked pass.

## Claim Boundary

This report does not approve implementation, release, production, risk acceptance, or target-project writes.

