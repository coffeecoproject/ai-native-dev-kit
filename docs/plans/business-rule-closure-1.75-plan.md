# Business Rule Closure 1.75 Plan

## Human Summary

1.75 should make IntentOS safer before Codex writes code for a business rule.

The goal is not to ask users to fill a long specification. The goal is:

```text
Codex performs the business-completeness scan.
The user only confirms the few decisions that change real business behavior.
```

Typical failure:

```text
User asks: appointment requests must include a service time
Codex changes: backend validation only
Missing: create/edit/reschedule behavior, availability checks, error copy,
frontend validation, API contract, tests, and real-environment validation
```

Business Rule Closure sits before Change Impact Coverage. It confirms what the
business rule actually means before IntentOS maps affected code and delivery
surfaces.

## Problem

IntentOS already has strong execution controls:

- Change Impact Coverage catches missed implementation surfaces.
- Execution Assurance proves what was actually executed.
- Evidence Precision rejects stale or unrelated evidence.
- Release and adoption layers prevent unsafe project actions.

The remaining gap is earlier:

```text
The implementation can be well controlled, but the business rule itself may not
be complete enough to implement.
```

If the business rule is incomplete, later evidence can prove only that Codex
implemented the incomplete interpretation. It cannot prove that the original
business need is closed.

This is most common for:

- form, booking, and intake restrictions;
- approval, finance, invoice, tax, HR, payment, or permission rules;
- status transitions;
- create/edit/import/export flows;
- historical-data behavior;
- multi-role workflows;
- API and mobile/web/mini-program consistency;
- real-environment validation requirements.

## Goals

- Add a Business Rule Closure protocol for task-communication time.
- Keep the user-facing experience simple: summary, key confirmations, safe
  defaults.
- Make Codex infer a complete business rule model before implementation.
- Separate business closure from technical impact coverage.
- Record unresolved business decisions before coding starts.
- Prevent Codex from treating an incomplete business rule as ready to implement.
- Create machine-checkable evidence that the business rule was either closed or
  explicitly blocked.

## Non-Goals

- Do not create a heavyweight business specification process.
- Do not ask ordinary users to answer every internal checklist item.
- Do not authorize implementation, file writes, commit, push, release,
  production, provider actions, secrets, migrations, payment operations, legal
  decisions, tax decisions, HR decisions, or customer-data decisions.
- Do not replace Change Impact Coverage, Execution Assurance, Product
  Completeness, Engineering Baseline, Test Assurance, or Release Governance.
- Do not claim that Business Rule Closure proves the business idea is correct in
  the market.
- Do not require exhaustive scanning of every project file.

## Position In The Flow

Business Rule Closure runs after Intent Understanding and before Change Impact
Coverage:

```text
User request
  -> intent understanding
  -> Business Rule Closure
  -> Change Impact Coverage
  -> execution plan
  -> implementation
  -> test/evidence/review
  -> unified closure
```

It answers:

```text
What does this rule mean for the business?
```

Change Impact Coverage answers:

```text
Which product, code, data, test, docs, and release surfaces must be handled?
```

Execution Assurance answers:

```text
Did Codex execute the agreed plan and prove it with current evidence?
```

## User Experience Contract

Business Rule Closure must not expose internal process burden to ordinary users.

Codex should present three user-facing blocks:

```text
My understanding
Need your confirmation
Safe default if you are unsure
```

Example:

```text
My understanding:
- The appointment rule applies when a user creates or reschedules an appointment.
- Existing appointments are not changed automatically.
- If an old appointment is rescheduled later, the new rule applies.

Need your confirmation:
- Should appointments without service time be blocked from rescheduling?

Safe default:
- Do not batch-change existing appointments. Apply the new rule when an
  appointment is created or rescheduled.
```

Codex may ask at most three user questions in one turn. It should ask only when
the answer changes business behavior, risk, data, money, customer impact, or
release safety.

## Internal Business Closure Dimensions

Codex should scan these dimensions internally. They are not presented as a user
form.

| Dimension | Purpose |
|---|---|
| `ACTOR` | Who performs or is affected by the rule |
| `TRIGGER_SCENARIO` | Create, edit, import, approval, API call, scheduled job, or other trigger |
| `INPUT_CONDITION` | The field, state, amount, status, role, time, or object condition |
| `SUCCESS_PATH` | What should pass and what the user can do next |
| `FAILURE_PATH` | What should be blocked, warned, deferred, or escalated |
| `USER_FEEDBACK` | Error copy, inline hint, toast, empty state, or operator message |
| `SERVER_ENFORCEMENT` | Backend/domain/API enforcement expected by the business rule |
| `DATA_BEHAVIOR` | Enum, lookup, persistence, migration, historical-data, import/export, report effect |
| `EFFECTIVE_TIME` | When the rule starts applying, and whether it affects new, draft, submitted, approved, or archived records |
| `EXCEPTION_POLICY` | Whether admins, legacy records, special customers, regions, or states are exempt |
| `PRECEDENCE` | How this rule behaves when it conflicts with another business rule |
| `ROLE_PERMISSION` | Role, visibility, approval, audit, privacy, or compliance concern |
| `CROSS_SURFACE_CONSISTENCY` | Web, mobile, mini-program, admin, API, worker, integration consistency |
| `AUDIT_LOGGING` | Whether blocked actions, overrides, or status changes need audit records |
| `IDEMPOTENCY_CONCURRENCY` | Duplicate submission, retry, concurrent edit, webhook, import, or callback behavior |
| `DOWNSTREAM_EFFECT` | Reporting, export, notification, dashboard, settlement, or external-sync effect |
| `TENANCY_DATA_BOUNDARY` | Tenant, organization, department, customer, or data-isolation boundary |
| `LOCALIZATION_REGION` | Region, language, timezone, currency, identity, phone, invoice, or format variation |
| `SOURCE_RULE_CONFLICT` | Existing rule, SOP, baseline, API doc, permission doc, or reconciliation conflict |
| `REAL_ENVIRONMENT_VALIDATION` | Local, staging, preview, internal trial, production observation, or manual evidence |
| `OUT_OF_SCOPE` | Explicitly excluded behavior with reason |
| `HUMAN_DECISION` | Business choice that Codex cannot safely decide |

## Business Rule State

The protocol should use simple states:

| State | Meaning |
|---|---|
| `READY_FOR_IMPACT_COVERAGE` | The business rule is closed enough to map implementation surfaces |
| `NEEDS_USER_CONFIRMATION` | One or more business decisions affect behavior or risk |
| `NEEDS_DOMAIN_OWNER` | A domain, finance, tax, legal, HR, compliance, or operations owner must decide |
| `BLOCKED_INCOMPLETE_RULE` | The rule is too incomplete or contradictory to implement safely |
| `OUT_OF_SCOPE_FOR_CURRENT_TASK` | The request belongs to a different task or deferred item |

Business Rule Closure must not use `DONE` as a final product claim. It only
states whether the business rule is ready for impact analysis.

`READY_FOR_IMPACT_COVERAGE` requires all of the following:

- every required dimension for the detected rule type is `CLOSED`,
  `DEFAULTED_WITH_REASON`, or `NOT_APPLICABLE_WITH_REASON`;
- no blocking `decision_items[]` remain;
- no high-risk finance, tax, HR, legal, payment, privacy, compliance,
  production, migration, or customer-data item remains without a domain owner;
- safe defaults that change real behavior have either been accepted by the user
  or remain blocking;
- historical-data behavior is explicit;
- effective time is explicit;
- cross-surface consistency is explicit;
- source-rule conflicts are either absent or resolved by a human/domain owner;
- real-environment validation is recorded only as an expectation, not as a
  verified result.

Dimension statuses:

| Status | Meaning |
|---|---|
| `CLOSED` | The dimension is clear enough to feed impact coverage |
| `DEFAULTED_WITH_REASON` | Codex recommended a safe default and recorded why it is safe |
| `NEEDS_USER_CONFIRMATION` | A user decision changes behavior or customer impact |
| `NEEDS_DOMAIN_OWNER` | A specialist owner must decide before impact coverage |
| `BLOCKED_CONTRADICTORY` | The rule conflicts with itself or existing rules |
| `OUT_OF_SCOPE_WITH_REASON` | The dimension belongs to another task |
| `NOT_APPLICABLE_WITH_REASON` | The dimension does not apply and the reason is concrete |

## Safe Defaults

Codex can recommend safe defaults when the user is unsure.

Allowed safe defaults:

- do not batch-modify historical records unless explicitly approved;
- apply new rules to create/edit/import/API paths when the rule affects data
  entry;
- show clear user-facing error copy instead of silent failure;
- keep high-risk role, finance, tax, legal, payment, and production decisions
  pending until owner approval;
- treat external integrations and scheduled jobs as `NEEDS_REVIEW` when signals
  exist but ownership is unclear;
- make release or production validation a later Release Governance concern.

Forbidden defaults:

- silently change historical data;
- weaken permissions;
- approve finance, tax, HR, legal, payment, privacy, or compliance behavior;
- treat production behavior as verified without real evidence;
- assume one platform is enough when the project has multiple active clients;
- treat missing business decisions as implementation permission.

Safe defaults must separate recommendation, acceptance, and application:

```json
{
  "id": "default:existing-appointments",
  "recommendation": "Do not batch-change existing appointments.",
  "reason": "Avoid silent data mutation.",
  "requires_user_acceptance": "Yes",
  "accepted_by_user": "No",
  "can_codex_apply_now": "No"
}
```

Business Rule Closure may record a recommended default and, when the user
confirms it, an accepted default. It must not treat either as implementation
authorization. `applied_default` belongs only to later execution evidence.

## Artifacts

Add a user-facing template:

```text
templates/business-rule-closure-card.md
```

Required sections:

- Human Summary
- User Request
- Codex Understanding
- Rule Identity
- Business Rule Dimensions
- User Confirmation Card
- Safe Defaults
- Existing Rule Check
- Decisions Needed
- Out Of Scope
- Real-Environment Validation Expectation
- Next Step
- Boundaries
- Machine-Readable Evidence

Add a generated artifact folder:

```text
business-rule-closures/
```

Add schema:

```text
schemas/artifacts/business-rule-closure.schema.json
```

The schema should capture:

- `schema_version`
- `task_ref`
- `user_request`
- `source_request_digest`
- `business_rule_id`
- `business_rule_ref`
- `business_rule_digest`
- `closure_digest`
- `primary_business_rule_type`
- `business_rule_types[]`
- `risk_domains[]`
- `dimensions[]`
- `decision_items[]`
- `safe_defaults[]`
- `out_of_scope[]`
- `source_rule_refs[]`
- `conflicts[]`
- `unknown_authority_items[]`
- `real_environment_validation`
- `state`
- `next_step`
- `boundaries`

`business_rule_digest` is calculated from the normalized business rule model.
`closure_digest` is calculated from the complete structured evidence. Later
Change Impact Coverage, Execution Assurance, and Unified Closure records must be
able to reference the same `business_rule_ref` and digest.

Each `dimensions[]` entry should contain:

```json
{
  "dimension": "EFFECTIVE_TIME",
  "status": "CLOSED",
  "summary": "The rule applies to new appointments and future reschedules.",
  "evidence_refs": ["human-decision:accepted-effective-time"],
  "decision_refs": [],
  "safe_default_refs": ["default:existing-appointments"],
  "notes": "Existing appointments are not changed automatically."
}
```

Each `safe_defaults[]` entry should contain:

```json
{
  "id": "default:existing-appointments",
  "recommendation": "Do not batch-change existing appointments.",
  "reason": "Avoid silent data mutation.",
  "requires_user_acceptance": "Yes",
  "accepted_by_user": "No",
  "can_codex_apply_now": "No"
}
```

## Resolver

Add:

```text
scripts/resolve-business-rule-closure.mjs
```

Behavior:

- read-only;
- accepts project path and optional intent;
- detects likely business-rule tasks from natural language;
- reads project signals conservatively when available;
- generates a Business Rule Closure card;
- produces a plain-language summary first;
- limits user-facing questions to at most three;
- outputs JSON with `--json`;
- writes only when `--out <path>` is explicitly provided;
- never authorizes implementation.

Suggested CLI:

```bash
node scripts/cli.mjs business-rule .
node scripts/cli.mjs business-rule . --intent "appointment requests must include a service time"
node scripts/cli.mjs business-rule . --out business-rule-closures/001-appointment-service-time.md
```

Public naming should remain ordinary-user friendly. `business-rule` can be a
developer command; the beginner UX should describe it as:

```text
I will first check whether the business rule is complete enough to implement.
```

## Checker

Add:

```text
scripts/check-business-rule-closure.mjs
```

Checker behavior:

- allow source-repository asset checks with `--allow-empty`;
- report `SKIPPED_NO_REPORT` for target projects with no reports unless a
  report is required;
- fail when `--require-report`, `--report <path>`, or
  `--require-business-rule-closure` is used and no matching report exists;
- validate report sections and boundaries;
- validate structured evidence when `--require-structured-evidence` is used;
- validate `business_rule_digest` and `closure_digest` when strict evidence is
  required;
- reject implementation or release authorization claims;
- reject `READY_FOR_IMPACT_COVERAGE` when required dimensions are missing for a
  business-rule task;
- reject high-risk business areas without decision owner or safe default;
- reject `READY_FOR_IMPACT_COVERAGE` when a recommended default that changes
  behavior has not been accepted by the user;
- reject `READY_FOR_IMPACT_COVERAGE` when source-rule conflicts are unresolved;
- reject more than three user-facing questions;
- reject contradictory rule states;
- reject historical-data changes without explicit human decision;
- reject finance, tax, HR, legal, payment, privacy, compliance, migration,
  production, or customer-data decisions as Codex-approved;
- reject real-environment closure claims without evidence.

Suggested strict mode:

```bash
node scripts/check-business-rule-closure.mjs . --allow-empty
node scripts/check-business-rule-closure.mjs . --report business-rule-closures/001.md --require-structured-evidence
node scripts/check-business-rule-closure.mjs . --require-report --require-structured-evidence
```

## Required Business Rule Types

Initial classifier should cover:

| Type | Examples |
|---|---|
| `VALIDATION_RULE` | required field, amount limit, date limit, format limit |
| `PERMISSION_RULE` | role visibility, action permission, approval permission |
| `STATUS_TRANSITION` | draft to approved, submitted to rejected, order lifecycle |
| `FINANCE_RULE` | invoice, payment, settlement, tax, price, refund, reimbursement |
| `DATA_LIFECYCLE_RULE` | import, export, migration, historical data, archival |
| `NOTIFICATION_RULE` | reminders, alerts, message delivery, escalation |
| `APPROVAL_RULE` | review flow, multi-step approval, delegation |
| `INTEGRATION_RULE` | webhook, third-party sync, scheduled job, provider callback |

Unknown types should not fail by default. They should produce
`NEEDS_USER_CONFIRMATION` or `NEEDS_DOMAIN_OWNER` when the behavior is unclear.

Real requests may contain multiple rule types. The model should record:

```json
{
  "primary_business_rule_type": "VALIDATION_RULE",
  "business_rule_types": ["VALIDATION_RULE", "STATUS_TRANSITION"],
  "risk_domains": ["appointment-scheduling"]
}
```

Per-type required dimensions:

| Type | Required dimensions |
|---|---|
| `VALIDATION_RULE` | `ACTOR`, `TRIGGER_SCENARIO`, `INPUT_CONDITION`, `SUCCESS_PATH`, `FAILURE_PATH`, `USER_FEEDBACK`, `SERVER_ENFORCEMENT`, `DATA_BEHAVIOR`, `EFFECTIVE_TIME`, `EXCEPTION_POLICY`, `CROSS_SURFACE_CONSISTENCY`, `REAL_ENVIRONMENT_VALIDATION` |
| `PERMISSION_RULE` | `ACTOR`, `TRIGGER_SCENARIO`, `ROLE_PERMISSION`, `FAILURE_PATH`, `USER_FEEDBACK`, `SERVER_ENFORCEMENT`, `AUDIT_LOGGING`, `TENANCY_DATA_BOUNDARY`, `REAL_ENVIRONMENT_VALIDATION` |
| `STATUS_TRANSITION` | `ACTOR`, `TRIGGER_SCENARIO`, `SUCCESS_PATH`, `FAILURE_PATH`, `DATA_BEHAVIOR`, `EFFECTIVE_TIME`, `PRECEDENCE`, `AUDIT_LOGGING`, `DOWNSTREAM_EFFECT`, `REAL_ENVIRONMENT_VALIDATION` |
| `FINANCE_RULE` | `ACTOR`, `INPUT_CONDITION`, `DATA_BEHAVIOR`, `ROLE_PERMISSION`, `HUMAN_DECISION`, `AUDIT_LOGGING`, `REAL_ENVIRONMENT_VALIDATION`, `SOURCE_RULE_CONFLICT` |
| `DATA_LIFECYCLE_RULE` | `ACTOR`, `TRIGGER_SCENARIO`, `DATA_BEHAVIOR`, `EFFECTIVE_TIME`, `EXCEPTION_POLICY`, `DOWNSTREAM_EFFECT`, `SOURCE_RULE_CONFLICT`, `REAL_ENVIRONMENT_VALIDATION` |
| `NOTIFICATION_RULE` | `ACTOR`, `TRIGGER_SCENARIO`, `SUCCESS_PATH`, `FAILURE_PATH`, `USER_FEEDBACK`, `DOWNSTREAM_EFFECT`, `LOCALIZATION_REGION`, `REAL_ENVIRONMENT_VALIDATION` |
| `APPROVAL_RULE` | `ACTOR`, `TRIGGER_SCENARIO`, `SUCCESS_PATH`, `FAILURE_PATH`, `ROLE_PERMISSION`, `PRECEDENCE`, `AUDIT_LOGGING`, `DOWNSTREAM_EFFECT`, `REAL_ENVIRONMENT_VALIDATION` |
| `INTEGRATION_RULE` | `TRIGGER_SCENARIO`, `FAILURE_PATH`, `DATA_BEHAVIOR`, `CROSS_SURFACE_CONSISTENCY`, `IDEMPOTENCY_CONCURRENCY`, `SOURCE_RULE_CONFLICT`, `HUMAN_DECISION`, `REAL_ENVIRONMENT_VALIDATION` |

Required dimensions that do not apply must be recorded as
`NOT_APPLICABLE_WITH_REASON`, not omitted.

## Examples

Examples are only fixtures for governance behavior. They do not define the
business direction of IntentOS.

Add one positive example:

```text
examples/1.75-business-rule-closure/appointment-service-time/
```

Scenario:

```text
User request: Appointment requests must include a service time.
```

Expected closure:

- applies to create and reschedule flows;
- existing appointments are not batch-modified by default;
- rescheduling an old appointment applies the new rule;
- service time availability conflict is identified as an impact-coverage input;
- error copy is defined;
- backend enforcement is required;
- frontend hint is required;
- real-environment validation expects local smoke plus staging/internal trial if
  available;
- next step is Change Impact Coverage.

The contract/tax example should not be the positive happy path. It should remain
only as a negative fixture when a field-validation rule overclaims tax,
compliance, invoice, filing, or legal meaning.

Add bad fixtures:

- rule says ready but has no actor or trigger scenario;
- user-facing card asks more than three questions;
- report silently batch-modifies historical records;
- report approves tax/legal/payment behavior as Codex decision;
- report claims implementation is authorized;
- report claims production behavior is verified without evidence;
- contradictory state: `READY_FOR_IMPACT_COVERAGE` and unresolved blocking
  human decision;
- recommended safe default is treated as user acceptance;
- domain owner is pending but state is `READY_FOR_IMPACT_COVERAGE`;
- existing project rule conflict is unresolved but state is ready;
- business rule digest or closure digest is missing;
- Markdown rule summary does not match structured JSON;
- tax field validation claims tax compliance;
- multi-platform project signal exists but closure assumes one client only;
- effective time is missing;
- exception policy is ambiguous;
- production validation is claimed without evidence.

## Integration Points

Business Rule Closure should feed existing systems:

- Change Boundary: confirms whether the request belongs to the current task.
- Work Queue: captures deferred or interrupted business decisions.
- Change Impact Coverage: consumes the closed business rule and maps affected
  surfaces.
- Engineering Baseline: checks project conventions after the business rule is
  clear.
- Test Assurance: should later decide which tests are required for this rule
  type and risk level.
- Execution Assurance: proves implementation followed the closed rule and plan.
- Unified Closure: cannot mark a business-rule task complete if Business Rule
  Closure is missing or blocked.

It should not replace any of these systems.

Concrete integration contracts:

### Change Impact Coverage

Add optional `--business-rule-ref` support:

```bash
node scripts/cli.mjs impact-coverage . \
  --intent "appointment requests must include a service time" \
  --business-rule-ref business-rule-closures/001-appointment-service-time.md
```

Strict mode behavior:

- business-rule tasks without `business_rule_ref` should warn by default and
  fail in strict mode;
- `business_rule_ref` must resolve to a Business Rule Closure report;
- the report state must be `READY_FOR_IMPACT_COVERAGE`;
- `business_rule_digest` must be copied into impact coverage evidence.

### Execution Assurance

Execution Assurance should treat Business Rule Closure as a source system for
business-rule tasks:

```json
{
  "name": "business_rule_closure",
  "status": "RECORDED",
  "ref": "artifact:business-rule-closures/001-appointment-service-time.md",
  "source_task_ref": "tasks/001-appointment-service-time.md",
  "source_outcome": "READY_FOR_IMPACT_COVERAGE",
  "business_rule_digest": "sha256:..."
}
```

Strict execution assurance should fail when a business-rule task:

- has no Business Rule Closure source system;
- links a blocked or unresolved Business Rule Closure report;
- carries a digest that does not match the linked Business Rule Closure report.

### Unified Closure

Unified Closure should not complete a business-rule task when:

- Business Rule Closure is missing;
- Business Rule Closure is blocked;
- Business Rule Closure has unresolved human/domain-owner decisions;
- Business Rule Closure digest does not match downstream records.

### Beginner Entry

When natural language contains signals such as `must`, `cannot`, `required`,
`limit`, `approval`, `permission`, `amount`, `status`, `booking`, `appointment`,
`invoice`, `payment`, `import`, `export`, or `tax`, beginner UX should say:

```text
I will first check whether this business rule is clear enough to implement.
```

It should not ask the user to select a `business-rule` command.

## Implementation Plan

1. Add `core/business-rule-closure.md`.
2. Add `docs/business-rule-closure.md`.
3. Add `templates/business-rule-closure-card.md`.
4. Add `schemas/artifacts/business-rule-closure.schema.json`.
5. Add `checklists/business-rule-closure-review.md`.
6. Add `prompts/business-rule-closure-agent.md`.
7. Add `business-rule-closures/.gitkeep`.
8. Add resolver and checker scripts.
9. Add CLI entries.
10. Add positive example and bad fixtures.
11. Integrate checker coverage into `scripts/check-intentos.mjs`.
12. Integrate fixture metadata into `test-fixtures/fixture-cases.json` when
    applicable.
13. Update `intentos-manifest.json`.
14. Update `templates/workflow-version.json`.
15. Update package verify surfaces when new scripts need syntax or governance
    coverage.
16. Update generated-project smoke so initialized projects can generate and
    check a Business Rule Closure card.
17. Update reference docs:
   - `docs/reference/scripts.md`
   - `docs/reference/artifacts.md`
   - `docs/reference/checkers.md`
18. Update active docs:
    - `docs/README.md`
    - `docs/index.md`
    - `docs/structured-evidence-schema.md`
19. Update README and Chinese README with a plain-language user explanation.
20. Add release evidence under `releases/1.75.0/`.

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-business-rule-closure.mjs
node --check scripts/check-business-rule-closure.mjs
node scripts/cli.mjs business-rule examples/mvp-booking-web-app --intent "appointment requests must include a service time"
node scripts/check-business-rule-closure.mjs examples/1.75-business-rule-closure/appointment-service-time --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-missing-actor --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-too-many-user-questions --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-historical-data-auto-change --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-codex-approves-tax-decision --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-authorizes-implementation --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-markdown-json-mismatch --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-ready-with-domain-owner-pending --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-safe-default-treated-as-approval --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-existing-rule-conflict-ready --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-missing-digest --require-structured-evidence
node scripts/check-business-rule-closure.mjs test-fixtures/bad/bad-business-rule-tax-field-claims-tax-compliance --require-structured-evidence
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
node scripts/check-manifest.mjs
npm run verify
git diff --check
```

Expected results:

- positive example passes;
- bad fixtures fail for the intended reason;
- generated card asks no more than three user-facing questions;
- `READY_FOR_IMPACT_COVERAGE` is impossible when blocking business decisions
  remain unresolved;
- `READY_FOR_IMPACT_COVERAGE` is impossible when business rule digest is missing
  or mismatched;
- recommended safe defaults are not treated as user acceptance or application;
- existing-rule conflicts block readiness until resolved;
- implementation and release authorization claims are rejected;
- structured evidence is valid and consistent with Markdown;
- generated-project smoke can create and check a Business Rule Closure card;
- source self-check and full verify pass.

Generated-project smoke should include:

```bash
node "$tmp/project/scripts/cli.mjs" business-rule "$tmp/project" \
  --intent "appointment requests must include a service time" \
  --out business-rule-closures/001-appointment-service-time.md
node "$tmp/project/scripts/check-business-rule-closure.mjs" "$tmp/project" \
  --report business-rule-closures/001-appointment-service-time.md \
  --require-structured-evidence
```

## Review Plan

Perform review from four angles:

1. User burden review:
   - Does the output read like a short business confirmation, not a form?
   - Are user questions limited and decision-oriented?
2. Completeness review:
   - Are actor, trigger, input, success, failure, feedback, data, permission,
     cross-surface, and real-environment dimensions represented?
3. Boundary review:
   - Does the report avoid approving implementation, release, production,
     finance, tax, HR, legal, payment, privacy, compliance, migrations, or
     secrets?
4. Integration review:
   - Does Business Rule Closure feed Change Impact Coverage instead of
     duplicating it?
   - Does it avoid becoming a new final closure system?

## Success Criteria

1. Ordinary users can still express requests in natural language.
2. Codex can summarize a complete business rule interpretation before coding.
3. Users only confirm decisions that affect real business behavior.
4. Business-rule tasks cannot enter implementation as `ready` when critical
   business decisions remain unresolved.
5. Change Impact Coverage receives a clearer business rule input.
6. Execution Assurance can later prove implementation against the closed
   business rule rather than an implicit assumption.

## Future Work

Business Rule Closure should be followed by Test Assurance Baseline.

Business Rule Closure answers:

```text
Is the business rule clear enough to implement?
```

Test Assurance should answer:

```text
What tests are required for this rule type, project level, platform, and risk?
```

They should remain separate layers to avoid turning business conversation into a
testing checklist.
