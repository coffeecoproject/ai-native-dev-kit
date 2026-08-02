# AI Task Log: 2026-08-02-current-project-identity-reconciliation

## Human Decision Summary

Conclusion: The identity repair and status-scope route correction pass focused
and complete Operating Model validation. Independent Task 251 closes the
lifecycle-test readiness race, the final full source self-check passes, and the
exact Pawcode replay is unchanged.

User input class: NO_USER_ACTION

User input needed now: No

Plain-language question or exact consent request, if needed: None

Why project evidence cannot answer it: Not applicable

What happens if you do nothing: external mature new-origin projects remain
misdescribed by `work`.

## Codex Task Decision And Evidence

Selected disposition: CLOSE_LOG

Can Codex continue now: no further Task 250 implementation is needed; report
the verified candidate

Scope and result evidence: exact 19-path Task 250 scope, independent 9-path Task
251 and aggregate-boundary scope, focused tests, complete Operating Model
45/45, lifecycle module 22/22, final repository-wide self-check, and exact
Pawcode before/after immutable snapshots.

Risk response: no target write, apply, dependency, CI, release, or production
path was entered.

Verification, review route, and technical recovery: the first final source
check exposed a 180-second project-information routing timeout and stopped.
After user-authorized root repair, focused replay and Operating Model 45/45
pass. The next full check stopped at a test-only descendant-readiness race;
Task 251 closes that race without changing production runtime behavior. The
final full source check exits 0 with `IntentOS self-check passed.` Pawcode then
returns the expected read-only `NEEDS_CURRENT_WORK_REVIEW` safe stop and all six
snapshot fields remain identical; its missing canonical current-task binding
is a target-state condition, not another IntentOS repair.

## Human Summary

One-sentence conclusion: IntentOS now separates historical entry origin from
current project identity, keeps project-information status outside task
completion processing, passes its full self-check, and consumes Pawcode
read-only without changing it.

## Decision Needed

Does this task result require bounded user input before follow-up work: No

Decision: local verification is complete; no further Task 250 work is needed.

## Next Safe Step

Next action: Report the verified local candidate and wait for a separate user
request before any commit or push.

## Task

`tasks/250-current-project-identity-reconciliation.md`

## Agent / Tool

Codex

## Runs

- Preflight: 1
- Implementation: 1
- Review: 2
- Repair: 1
- Companion Task 251: 1
- Final repository-wide self-check: 1 successful closeout run
- Exact-candidate Pawcode immutable replay: 1

## Result

Implementation, bounded repair, and final verification complete

## Human Time

No additional technical input required.

## AI Helpfulness

High

## What Worked

- A fresh generated project and Pawcode provided a concrete contrast.
- The existing Project Fact Projection supplied one current-run authority.
- Focused tests completed before the expensive source check.

## Problems

- Historical origin and current kind had shared one field path since the older
  Project Entry model.
- Project-information status was classified correctly but source orchestration
  still unconditionally started User Delivery Console, causing the source
  identity test to hit its 180-second timeout.
- The lifecycle interruption test used a fixed abort delay and read its
  descendant PID file without proving that the child fixture had created it.

## Cost / Usage

- AI runs: one bounded implementation and one read-only review
- Heavy context reads: Project Entry, identity projection, project facts, and
  generated distribution contracts
- Repair runs: 1
- Rework: one Task 250 status-source route correction plus one independently
  governed Task 251 test-readiness repair
- Closeout: one full source self-check passing with exit 0 and one exact
  Pawcode replay preserving all six snapshot fields across 240 status entries

## Issues Caught By Review

- Confirmed that a blanket `BOOTSTRAPPED_PROJECT -> EXISTING_PROJECT` change
  would have broken scaffold-only behavior; the final design uses current
  project-owned content instead.
- Confirmed that increasing the 180-second timeout would hide the route error;
  project-information now skips the task delivery source, while a real current
  task still consumes it.
- Confirmed that changing runtime cleanup would address the wrong layer; Task
  251 waits for fixture readiness and preserves every cleanup assertion.

## Lessons

- Provenance, current observation, and public identity need separate names and
  bindings.
- Status classification and source selection must share the same scope
  contract; otherwise read-only derived views can accidentally traverse an
  unrelated evidence chain.

## IntentOS Updates Needed

- [x] template
- [ ] prompt
- [ ] checklist
- [x] script
- [ ] skill candidate
- [ ] AGENTS.md rule

## Workflow Improvement Trigger

- [x] one-off issue, no workflow change proposed
- [ ] repeated issue, create `workflow-improvements/`
- [ ] high-impact issue, create `workflow-improvements/`
- [ ] repeated execution pattern, evaluate `skill-candidates/`
- [ ] candidate for `intentos-proposals/`

## Related Follow-up

- Workflow improvement: None.
- Skill candidate: None.
- IntentOS proposal: None.
