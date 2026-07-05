# Release Record: 1.9.0

## Human Decision Summary

Conclusion: 1.9.0 adds Human Decision Summary as the first layer for decision-heavy output.

Recommended choice: A - Use 1.9.0 for clearer adoption and governance recommendations.

Can AI continue now: limited

What I need from you: Review the output changes before treating 1.9.0 as the preferred project-adoption version.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Adopt 1.9.0 output style | Use decision summaries before technical fields | Workflow/docs/scripts only | low/medium | Choose when users need clearer choices |
| B | Keep 1.8.1 wording | Keep old status-first output | No | low | Choose when output compatibility matters more than clarity |
| C | Review further | Ask for another review before adoption | No | low | Choose when wording needs product review |

Recommended reason: Real project feedback showed that correct recommendations still need clearer choice, risk, and file-write impact.

What happens if you do nothing: Existing protections remain, but users may still need to interpret technical status fields before deciding.

## Human Summary

1.9.0 makes IntentOS output easier to judge. Adoption, baseline, migration, review, and handoff outputs now start with a clear decision summary before technical details.

## Scope

- Add Human Decision Summary to output protocol and reporter prompt.
- Add decision-summary sections to human-facing templates.
- Upgrade `workflow-next`, `start`, `baseline`, and migration report output.
- Update usage docs, README, and output-quality checks.
- Add release evidence for the 1.9.0 decision-summary upgrade.

## Allowed Claims

- The IntentOS can present decision-heavy output with a recommended option, alternatives, file-write impact, risk, and no-decision outcome.
- `start`, `baseline`, `workflow-next --format human`, and governance migration reports now expose clearer human decision summaries.
- Reports still do not approve risk, release, migration, production change, or target-project writes.

## Forbidden Claims

- This release does not add automatic GPT/API review.
- This release does not approve target-project writes.
- This release does not approve release, production launch, or risk acceptance.
- This release does not weaken governed-project read-only protection.
- This release does not make historical evidence retroactively migrated.

## Evidence Status

Status: SOURCE_EVIDENCE

Evidence basis:

- intentos source checks
- output protocol and template checks
- workflow artifact checks
- product/claim checks

Not included:

- new production adoption evidence
- external reviewer automation
- automatic real-project scanning evidence

## Verification

See `releases/1.9.0/self-check-report.md`.

## Known Limitations

See `releases/1.9.0/known-limitations.md`.
