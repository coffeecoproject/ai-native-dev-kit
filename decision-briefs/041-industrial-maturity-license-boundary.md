# Decision Brief: 041-industrial-maturity-license-boundary

Use this template when a human must decide before AI can continue safely.

## Human Summary

One-sentence explanation of the decision:

0.41.0 may add conservative license explanation docs, but legal approval or owner risk acceptance is still required before 1.0 release materials present the boundary as final.

## Decision Needed

Question: Can the dev kit publish explanatory license boundary docs now while keeping `LICENSE.md` as the source of truth and recording legal review as pending before 1.0?

Owner: human

Decision deadline, if any: Before 1.0 release materials.

## Background

What led to this decision:

The current repository license is CC BY-NC 4.0 with explicit language that commercial use, resale,
paid redistribution, and use as part of commercial consulting or service delivery require prior
written permission. Users need a plain-language FAQ, but the project must not accidentally grant
commercial rights or present Codex output as legal advice.

## Options

| Option | Benefit | Risk | AI impact | Recommended |
|---|---|---|---|---|
| Add conservative explanatory docs now; keep legal review pending before 1.0 | Improves user clarity immediately | Wording still needs legal review before final 1.0 claims | AI may write docs that defer to `LICENSE.md` | Yes |
| Wait for qualified legal review before adding any FAQ | Lowest wording risk | Leaves users without plain-language boundaries | AI stops this part of 0.41.0 | No |
| Broaden license permissions in FAQ | Easier commercial adoption | Conflicts with `LICENSE.md` and user-stated restrictions | Not allowed | No |

## Recommended Choice

Recommendation: Add conservative explanatory docs now and explicitly record legal review or owner risk acceptance as pending before 1.0.

Reason: This improves clarity while avoiding a license change. The FAQ must say it is not legal advice and does not override `LICENSE.md`.

## If Not Confirmed

What happens if the human does not decide:

Codex may keep the docs conservative and mark final legal-risk acceptance as pending. Codex must not
claim license boundary finality for 1.0 or grant commercial use rights.

## What AI Can Do Safely Before Decision

- Add docs that quote or paraphrase only the existing license policy at a high level.
- Add `NOTICE.md` and commercial-contact guidance without changing the license.
- Add checker/docs references that require consistency with `LICENSE.md`.

## What AI Must Not Do Before Decision

- Do not modify `LICENSE.md`.
- Do not grant commercial rights.
- Do not approve customer commercial delivery, consulting usage, resale, or paid redistribution.
- Do not claim legal review has happened.

## Technical Basis

Related files:

- `LICENSE.md`
- `LICENSE-FAQ.md`
- `LICENSE-COMMERCIAL.md`
- `NOTICE.md`
node scripts/check-dev-kit.mjs
node scripts/check-manifest.mjs .
Related checks:
Task: `tasks/041-industrial-maturity-license-boundary.md`
Spec: `specs/041-industrial-maturity-license-boundary.md`
Risk boundary: no license change; explanatory docs only.
```text

```

Related workflow fields:

```text

```

## Audit Notes

Recorded by: Codex

Recorded at: 2026-06-27

Decision status: APPROVED for conservative 0.41.0 explanatory docs; PENDING for qualified legal review or owner risk acceptance before 1.0 final release claims.

Decision result: Proceed with docs/checks that stay subordinate to `LICENSE.md`; stop before any broader license grant.
