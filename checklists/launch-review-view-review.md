# Launch Review View Review Checklist

Use this checklist when reviewing a Launch Review View.

## Required Structure

- [ ] It includes Human Summary.
- [ ] It includes Unified Closure Input.
- [ ] It includes Safe Launch View.
- [ ] It includes Platform View.
- [ ] It includes Launch Surface Gaps.
- [ ] It includes Human Release Decisions.
- [ ] It includes Evidence Map.
- [ ] It includes Recommended Next Step.
- [ ] It includes Boundaries.
- [ ] It includes Outcome.

## Consistency

- [ ] It reuses one of the Safe Launch labels.
- [ ] It does not invent a new launch state.
- [ ] It does not report `READY_FOR_RELEASE_REVIEW` unless Unified Closure is `DONE`.
- [ ] It treats Unified Closure as the close-out source.
- [ ] It treats Safe Launch as the readiness label source.
- [ ] It treats human release approval as outside IntentOS.

## Release Review Evidence

For `READY_FOR_RELEASE_REVIEW`, confirm:

- [ ] Rollback evidence is present.
- [ ] Monitoring evidence is present.
- [ ] Release owner evidence is present.
- [ ] Post-launch smoke evidence is present.
- [ ] Human release decision is still outside IntentOS.

## Forbidden Claims

- [ ] It does not claim release is approved.
- [ ] It does not claim production is approved.
- [ ] It does not claim deployment, publishing, or app-store submission happened.
- [ ] It does not change or approve CI/CD, hooks, secrets, DNS, environment config, payment, permissions, migrations, or production data.
- [ ] It does not replace Unified Closure, Safe Launch, or the project release SOP.
