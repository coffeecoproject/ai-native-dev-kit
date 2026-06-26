# Profile: WeChat Mini Program

## Purpose

Support WeChat Mini Program development while preserving the core AI Native workflow.

## Applies To

- WeChat Mini Program user interfaces
- mini programs with login, platform permissions, cloud functions, managed storage, or payment flows
- mini program modules inside larger repositories
- mini programs with web, backend, or internal admin companions

## Does Not Apply To

- browser-only applications
- native iOS applications
- native Android applications
- backend-only services without mini program runtime
- one-project business policy

## Default Task Level

L1 for local page, component, style, or low-risk copy changes.
L2 when login state, platform permissions, page lifecycle, cloud functions, managed storage, API contracts, or cross-module state is touched.
L3 when production environment config, release submission, payment or value transfer, regulated data, destructive storage changes, secrets, or irreversible behavior is touched.

## Required Project Docs

- `docs/product-vision.md`
- `docs/engineering-principles.md`
- `docs/risk-policy.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/permission-model.md`
- `docs/test-strategy.md`

Additional docs recommended:

- `docs/miniprogram-release-policy.md`
- `docs/cloud-function-boundaries.md`
- `docs/privacy-data-inventory.md`

## Focus Areas

- page lifecycle and routing
- login state and identity boundary
- open identifier or union identifier usage
- platform permissions and privacy prompts
- cloud functions and managed storage
- API contracts and error handling
- base library compatibility
- review, release, rollback, and monitoring evidence

## Platform / Project-type Risks

- permission prompts that do not match behavior
- login state or identifier misuse
- cloud function access rules that are too broad
- client-side sensitive data exposure
- unsafe managed storage writes
- payment or value-transfer behavior changes
- release review rejection risk
- missing denied, offline, or degraded network states

## High-risk Boundaries

Stop and ask before:

- release submission or production environment changes
- platform permission or privacy behavior changes
- login identity boundary changes
- cloud function access rule changes
- managed database or storage rule changes
- payment or value-transfer behavior
- destructive data migration or deletion
- secrets, production config, or regulated data handling

## Required Verification

Minimum verification categories:

- page and component behavior check
- login and denied state review where relevant
- platform permission review when permissions change
- cloud function and access rule verification when touched
- API error handling and degraded network review
- release and rollback evidence when release behavior changes

Example commands, replace per project:

```bash
scripts/verify.sh
```

## Release / Distribution Checks

- base library assumptions reviewed
- privacy and permission behavior reviewed
- cloud functions, access rules, and environment config reviewed
- release submission risk documented
- rollback or mitigation plan documented
- monitoring or failure observation reviewed

## AI Boundaries

AI may draft mini program pages, components, cloud function code, tests, review notes, and documentation inside approved task scope.

AI must not approve release submission, change production environment config, handle secrets, expand access rules, or approve payment/value-transfer behavior without explicit human approval.

## Starter Expectations

Compatible starters:

- `generic-project`

Required starter additions:

- mini program verification placeholders in `scripts/verify.sh`
- release and privacy review guidance in docs
- cloud function and access rule review guidance when relevant
