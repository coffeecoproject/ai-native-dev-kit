# Delivery Path Review Checklist

Use this checklist before treating a Delivery Path Report as ready.

## Required Checks

- [ ] The current state is one of the allowed Delivery Path states.
- [ ] The next target state is one of the allowed Delivery Path states or `N/A`.
- [ ] The report explains how far the project is from useful use.
- [ ] The report lists missing evidence.
- [ ] The report lists blockers or says none.
- [ ] The next safe action is concrete.
- [ ] User decisions are limited to product, risk, authorization, or acceptance decisions.
- [ ] The report does not approve implementation.
- [ ] The report does not approve release or production.
- [ ] The report does not replace Safe Launch.
- [ ] The report does not claim real users can use the product.

## Conservative Defaults

- Unknown existing users -> treat as existing users.
- Unknown risk -> block or ask for a small decision.
- Dirty worktree -> stop before new execution.
- Release or production claims -> route to Safe Launch.
- Hook or CI changes -> route to Hook Orchestration.
- Document cleanup -> route to Document Lifecycle.
