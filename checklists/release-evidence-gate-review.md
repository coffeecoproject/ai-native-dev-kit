# Release Evidence Gate Review

Use this checklist before saying a release candidate can be handed to a human
release owner.

- The report identifies the release candidate, source revision, dirty worktree
  state, included task refs, and included Completion Evidence refs.
- User Delivery Console is treated as display only, not source authority.
- The release target has a target-specific evidence matrix.
- Completion Evidence is current-release matched.
- Runtime smoke is not a user note only.
- Required runtime smoke, rollback, monitoring, build, platform recipe, and
  handoff evidence refs resolve and their digests match the resolved artifacts.
- Markdown tables match the machine-readable evidence block for the release
  scope, source chain, runtime/rollback/monitoring, environment, migration,
  cost, and missing evidence.
- Production-like targets have rollback, monitoring, incident owner,
  environment/config owner, clean source, and migration decision.
- App-store and mini-program review targets have a platform recipe and handoff
  evidence.
- Release owner identification is separate from release approval.
- Existing project release SOPs are mapped and never downgraded.
- The report states release / production approval is `No`.
- Codex does not deploy, submit, migrate, mutate provider state, store secrets,
  change DNS/payment/CI, or become the release owner.
