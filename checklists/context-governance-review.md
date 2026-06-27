# Context Governance Review Checklist

Use this checklist when a task adds, changes, or relies on durable project context.

## Source-of-Truth Boundary

- [ ] Current user instruction is respected.
- [ ] Current task artifacts override older logs or summaries.
- [ ] Git-backed source of truth overrides model memory.
- [ ] Inferred context is marked `INFERRED` or `PENDING_CONFIRMATION`.
- [ ] Only human-confirmed context is marked `CONFIRMED`.

## Learning Candidate

- [ ] Observation is specific.
- [ ] Evidence source is cited.
- [ ] Confidence is High, Medium, or Low.
- [ ] Recommended destination is narrow and correct.
- [ ] Human Decision is Pending, Approved, Rejected, or Needs Revision.
- [ ] Candidate is not cited as a baseline rule before approval.

## Context Correction

- [ ] Old context is named.
- [ ] New evidence is provided.
- [ ] Impact is bounded.
- [ ] Proposed correction is narrow.
- [ ] Source-of-truth destination is listed.
- [ ] Applied changes are recorded after approval.

## Stop Conditions

- [ ] Secret, credential, or private customer data would be stored.
- [ ] Candidate would change permissions, release, rollback, payment, migration, or production configuration without human decision.
- [ ] Model memory conflicts with Git-backed docs.
- [ ] Current request conflicts with historical AI logs.

