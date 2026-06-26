# Review Loop Review Checklist

Use this checklist when reviewing a Review Loop Report or reviewer output.

## Boundaries

- [ ] Reviewer stayed read-only.
- [ ] Reviewer did not approve risk, release, merge, or scope.
- [ ] Reviewer did not ask for whole-repository context without a concrete missing artifact reason.
- [ ] Findings cite the Review Packet, task, spec, eval, diff, evidence, or command output.
- [ ] Findings do not invent missing evidence.

## Finding Quality

- [ ] Every finding has ID, severity, category, evidence, proposed action, owner, and status.
- [ ] Severity uses only P0, P1, or P2.
- [ ] Category uses only AUTO_FIX, NEEDS_HUMAN_DECISION, NEEDS_CLARIFICATION, or NO_ACTION.
- [ ] NO_ACTION findings include a reason.
- [ ] NEEDS_CLARIFICATION was attempted at most once before becoming NEEDS_HUMAN_DECISION.

## Auto-Fix Gate

- [ ] AUTO_FIX items are deterministic and inside approved task scope.
- [ ] AUTO_FIX items do not require a new dependency.
- [ ] AUTO_FIX items do not change architecture, permission model, migration, production config, release policy, or rollback policy.
- [ ] AUTO_FIX items do not modify Risk Gate, Human Approval, Approval scope, or risk acceptance.
- [ ] AUTO_FIX ran no more than 2 rounds.
- [ ] Verification was run after each auto-fix round.

## Stop Conditions

- [ ] Same finding did not appear twice.
- [ ] Auto-fix did not introduce a new P0 or P1.
- [ ] Repeated verification failure was not ignored.
- [ ] Unstructured reviewer output was routed to human decision or clarification.
- [ ] Scope expansion, dependency, production, migration, release, or approval changes were routed to human decision.

## Final State

- [ ] Final status is OPEN, AUTO_FIXED, NEEDS_HUMAN_DECISION, BLOCKED, or DONE.
- [ ] Human Decision Queue is explicit when decisions remain.
- [ ] Final summary lists automatically fixed items, open items, human decisions, and verification.
