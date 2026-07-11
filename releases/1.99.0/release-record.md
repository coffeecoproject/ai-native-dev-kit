# IntentOS 1.99.0 Release Record

## Theme

Zero-Experience Solo Developer Operating Model.

## Human Summary

IntentOS now assumes one zero-experience solo developer by default. The user
describes the real business and supplies only missing business facts,
preferences, and consent to concrete real-world effects. Codex owns technical
architecture, workflow routing, baselines, implementation, testing, review,
evidence, repair, rollback preparation, and delivery coordination.

## Delivered

- one source-controlled solo operating contract;
- one shared responsibility projection used by `work` and Beginner Entry;
- four public responsibility classes: no user action, missing business fact,
  real-world consent, and missing external fact;
- internal responsibility domains that are explicitly not separate people;
- natural-language task intent as sufficient execution intent for ordinary,
  reversible, task-bounded local engineering after internal gates;
- capability coverage for platform, backend, data, auth, release,
  observability, payment, and high-risk work without user profile/pack choice;
- a current-conversation-user identity for structured consent without requiring
  an enterprise role or formal organization;
- generated Agent governance, CLI help, README, Start Here, and Operating Model
  aligned with the same contract;
- a dedicated self-check that rejects technical-choice and enterprise-role
  leakage from the public entry.

## Preserved Safety

- business facts are not invented;
- silence is not consent;
- external policy facts keep only dependent capabilities or claims blocked;
- production, cost, real-user communication, provider/account, and irreversible
  real-data effects require explicit consent to the concrete effect;
- strict task identity, Evidence Authority, testing, review, Apply Receipt,
  rollback, completion, and release trust remain mandatory;
- the public entry remains read-only and does not itself execute an external
  effect.

## Evidence Status

Repository evidence covers the shared solo responsibility projection, public
Operating Loop and Beginner Entry output, generated starter governance,
current-conversation consent validation, business-rule question reduction,
existing-project adoption routing, release consent translation, capability
coverage, Manifest distribution, strict bad fixtures, and disposable generated
projects. Final release status requires both `check-intentos.mjs` and
`npm run verify` to pass on the same source snapshot.

## Known Limitations

IntentOS cannot infer a business rule absent from project evidence, prove an
external legal/tax/compliance/provider fact, authenticate the legal identity
behind `CURRENT_CONVERSATION_USER`, or prove a provider/production effect that
has not been observed. Historical schemas retain some `owner` field names for
compatibility, but active public renderers translate them into current-user
consent, external facts, or internal responsibility domains. See
[known-limitations.md](known-limitations.md).

## Allowed Claims

- A zero-experience solo developer does not need to choose technical workflows,
  architecture, baselines, packs, tests, review systems, or internal roles.
- Ordinary reversible project-local engineering may continue after internal
  IntentOS gates without a second technical approval.
- Capability and responsibility classification are internal technical routing,
  not requirements for a team.

## Forbidden Claims

- IntentOS does not invent business truth, legal/tax/compliance facts, or user
  consent.
- IntentOS does not treat passing tests, technical readiness, generated reports,
  or silence as production or external-action consent.
- This release does not weaken the 1.98 execution and distribution trust chain.

## Verification

- `node scripts/check-solo-operating-model.mjs`
- `node --test tests/operating-model.test.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

See [self-check-report.md](self-check-report.md) and
[known-limitations.md](known-limitations.md).
