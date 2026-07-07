# IntentOS 1.80.0 Known Limitations

- Release Evidence Gate can prove local release-review evidence consistency; it
  cannot prove production stability or external platform acceptance.
- The checker resolves local artifact refs. External CI, cloud, app-store,
  mini-program, DNS, payment, and monitoring consoles remain human/external
  authority.
- `READY_FOR_RELEASE_OWNER_REVIEW` is not release approval.
- Existing project release SOP mapping reports stronger rules and gaps, but it
  does not replace project release ownership.
- Runtime smoke evidence must be recorded as an artifact or command/manual
  report. A user note alone is not runtime smoke.
