# Next-Step Boundary Review Checklist

Use this checklist when reviewing a final report, Review Loop Report, follow-up proposal, or Codex task response.

Goal: keep next-step suggestions useful without letting them expand scope, imply approval, or become hidden execution.

## Required Structure

- [ ] Next-step suggestions are listed in a structured section or table.
- [ ] Every suggestion has a type.
- [ ] Every type is one of:
  - IN_SCOPE_NEXT_STEP
  - DIRECT_FOLLOW_UP
  - RISK_DECISION
  - OUT_OF_SCOPE_OBSERVATION
  - DO_NOT_PROCEED
- [ ] Every suggestion explains relation to the current task.
- [ ] Every suggestion states whether AI can do it now.
- [ ] Every suggestion names the required entry point.
- [ ] Risk or approval requirements are explicit.

## Boundary Rules

- [ ] IN_SCOPE_NEXT_STEP stays inside current task scope.
- [ ] IN_SCOPE_NEXT_STEP does not add a feature, dependency, architecture change, permission change, migration, production config, release behavior, or rollback behavior.
- [ ] DIRECT_FOLLOW_UP is not implemented in the current task.
- [ ] DIRECT_FOLLOW_UP points to a new request or follow-up proposal.
- [ ] RISK_DECISION appears in Human Decisions Needed.
- [ ] OUT_OF_SCOPE_OBSERVATION is not presented as immediate next work.
- [ ] DO_NOT_PROCEED is not marked done, implemented, safe, or available for AI to run now.

## Review Loop Separation

- [ ] Current task issues are findings, not suggestions.
- [ ] Future improvements are suggestions, not AUTO_FIX findings.
- [ ] Reviewer output does not require scope expansion as a fix.
- [ ] Recommendations that touch scope, dependency, architecture, permission, data, migration, production config, release, rollback, payment, or value transfer are classified as RISK_DECISION or DO_NOT_PROCEED.

## Human Experience

- [ ] The next safe action is small and concrete.
- [ ] The report does not overwhelm the human with a roadmap unless asked.
- [ ] The report explains which items AI can handle now and which require a new entry point.
- [ ] The report does not hide risk to sound simple.

