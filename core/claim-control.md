# Claim Control

## Human Summary

Claim Control keeps README, releases, reports, and handoffs from saying more than the evidence supports.

## Rule

Claims must match evidence. A claim is unsafe when it turns a draft, simulation, recommendation, or report into a promise, approval, or production guarantee.

## Allowed Claims

Use claims like:

- read-only recommendation
- plan-first setup
- simulated dogfood evidence
- generated-project smoke passed
- controlled trial needed
- advisory by default
- selected-only industrial pack setup
- task-scoped review evidence
- known limitations remain

## Forbidden Claims

Do not claim:

- production proven unless production adoption evidence exists
- guaranteed safe
- suitable for every project
- no human approval required
- report approved release
- simulated dogfood proves production readiness
- draft pack is stable
- all industrial packs are enabled by default
- AI can accept risk
- AI can approve launch

## Required Release Sections

Release records for meaningful phases must include:

- `## Allowed Claims`
- `## Forbidden Claims`
- `## Evidence Status`
- `## Known Limitations`
- `## Verification`

## Required Report Boundary

Final reports and customer handoffs must state that the report does not approve:

- release
- risk
- scope expansion
- future work

## Evidence Language

Use precise wording:

| If evidence is | Say | Do not say |
|---|---|---|
| simulated | simulated dogfood passed | production proven |
| generated project | generated-project smoke passed | all projects are covered |
| draft pack | draft / candidate | stable |
| advisory checker | advisory / pending | guaranteed |
| human decision pending | needs human confirmation | approved |

## Escalation

If a claim affects sales, launch, production risk, customer delivery, legal terms, or operational responsibility, route it to a human decision.
