# Ordinary User Product Loop Roadmap 1.42-1.45

## North Star

An ordinary user can describe a product goal in natural language, make only a few decisions, and receive a runnable first version with clear verification and next-step guidance.

## Why This Exists

IntentOS already has strong governance for project safety. The missing product loop is shorter:

```text
natural-language goal
-> first-slice recommendation
-> small human confirmation
-> bounded implementation path
-> local verification
-> product completeness judgment
-> next iteration backlog
```

This roadmap does not replace BL1/BL2, Review Loop, Apply Plan, Approval Record, or Safe Launch. It gives O0 / BL0 work a first-class path so simple, low-risk products can close the shortest useful loop before heavier governance is added.

## Version Plan

### 1.42 Ordinary User First-Slice Path

Goal: make O0 / BL0 the default ordinary-user path.

Adds:

- `first-slice` CLI entry.
- Ordinary User First-Slice Card.
- Owner-mode output by default.
- Checkers for decision count, jargon leakage, scope, backlog, verification, and no-write boundaries.

Boundary:

- Does not write target files.
- Does not approve implementation or release.
- Does not enable BL2 or industrial packs.

### 1.43 Product Completeness Gate

Goal: answer whether the current product is usable as a first version.

Adds:

- `product-completeness` CLI entry.
- Product Completeness Report.
- A checklist for target user, core flow, screens/API/data, permissions, error/empty states, local run, verification, trial instructions, feedback/logging, and next version.

Boundary:

- Does not certify production readiness.
- Does not replace Safe Launch or release review.
- Does not approve deployment.

### 1.44 Real MVP Example Evidence

Goal: prove the path with a small runnable product example, not only workflow artifacts.

Adds:

- `examples/mvp-booking-web-app`.
- Real static web app files.
- Smoke test command.
- Product brief, first-slice card, product completeness report, and final report.
- `mvp-example-check`.

Boundary:

- Example evidence is local demo evidence only.
- It does not claim production validation.

### 1.45 Low-Risk Controlled Apply Candidate

Goal: define what a future low-risk runner may accept without implementing unsafe automatic writes.

Adds:

- `apply-candidate` CLI entry.
- Low-Risk Controlled Apply Candidate report.
- Exact-path, O0/BL0, rollback, verification, approval, and forbidden-surface checks.

Boundary:

- No runner is added.
- No target files are written.
- Candidate status is not apply authorization.

## Governance

- Default user-facing output must be owner-first.
- Technical details may exist but must not be required for ordinary users.
- At most three ordinary-user questions by default.
- First-slice work must separate now-scope from backlog.
- Product completeness must not overclaim production, release, or real-user readiness.
- Any high-risk surface escalates out of O0 / BL0.

## Verification Plan

- Syntax-check new scripts.
- Check positive examples.
- Check bad fixtures.
- Run fixture matrix.
- Run manifest check.
- Run product baseline and claim control.
- Run full intentos self-check.
- Run `npm run verify:governance`, `npm run verify:syntax`, and `git diff --check`.
