# Known Limitations: 1.8.0

## Human Summary

1.8.0 is a read-only adoption and patch-classification upgrade. It improves routing for existing governed projects, but it is not a production certification.

## Limitations

- Only one sanitized governed Web project trial is represented in public source evidence.
- The release does not include public evidence for Mini Program, iOS, Android, or lightly governed legacy projects.
- Checkers validate recorded artifacts and cannot inspect private conversation or unrecorded target-project state.
- Existing-governance mapping is advisory until a human approves target-project writes.
- Patch classification does not implement a fix and does not approve risk.
- Equivalent baseline detection can find likely baseline documents, but cannot fully understand private project conventions without human review.
- External GPT/API review automation remains out of scope.

## Required Human Decisions

- Choose additional real projects for future private read-only trials.
- Approve or reject any target-project docs-only bridge.
- Approve or reject any production, release, security, privacy, compliance, migration, payment, or customer-impacting change.
