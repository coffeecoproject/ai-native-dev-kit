# Known Limitations: 1.9.0

## Human Decision Summary

Conclusion: 1.9.0 improves decision clarity, but it does not automate human decisions.

Recommended choice: A - Treat this as an output clarity release.

Can AI continue now: limited

What I need from you: Decide whether the new output format is clear enough after review.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Accept as output clarity release | Use summaries for decisions, keep approvals human-owned | No target writes | low | Choose when the format is understandable |
| B | Request wording refinement | Revise report language without changing rules | Docs/templates only | low | Choose when options are still unclear |
| C | Pause adoption | Keep using previous wording | No | low | Choose when teams need compatibility first |

Recommended reason: The upgrade clarifies choices but does not change authority.

What happens if you do nothing: The kit remains safe, but some recommendations may still require manual explanation.

## Human Summary

1.9.0 is an output and decision-clarity release. It does not add new automation or new project write permission.

## Limitations

- It does not automatically choose for the human.
- It does not call GPT/API reviewers.
- It does not auto-scan or auto-write real target projects.
- It does not approve AGENTS.md or PR template migrations.
- It does not make baseline setup apply without a reviewed plan.
- It does not rewrite all historical reports to the new format.
- It does not prove production adoption across all platform types.

## Required Human Decisions

- Decide whether to adopt 1.9.0 as the preferred user-facing output format.
- Decide later whether historical reports should be migrated, if needed.
- Decide later whether an automated review integration is worth the privacy, cost, and control tradeoff.
