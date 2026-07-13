# Business Universe Coverage

Business Universe Coverage is a conditional internal evidence source. It
prevents a task from appearing complete when one task-relevant class, origin,
lifecycle branch, processing path, selection rule, or derived relationship was
never considered.

It runs after Work Queue and Task Governance, and before Business Rule Closure.
It never replaces Business Rule Closure, verification, or Unified Closure.
For a zero-experience solo user, Codex performs routing and evidence inspection
internally. The user is asked only for a missing business fact, an unavailable
external fact, or consent to a concrete real-world effect.

## Conditional Routing

Task Governance may require coverage only when bounded project evidence proves
one or more structural omission risks:

- `MULTI_CLASS_OR_ORIGIN`
- `DERIVED_OUTPUT_DEPENDENCY`
- `SELECTIVE_INCLUSION_OR_FANOUT`
- `LIFECYCLE_BRANCH_OR_RECOVERY`
- `PATH_PROVENANCE_AMBIGUITY`
- `DOMAIN_COMPLETENESS_CLAIM`
- `EXISTING_PROJECT_CLOSURE_AUDIT`
- `HIGH_RISK_OMISSION_AMPLIFIER`

High impact alone strengthens an already evidenced omission risk; it does not
create a Business Universe requirement by itself. A bounded non-behavioral task
is recorded as `NOT_REQUIRED_WITH_REASON`. An incomplete or unsupported scan is
`TECHNICAL_INSPECTION_REQUIRED`, never silently not required.

## Evidence Model

A ready report records:

- exact Work Queue and Task Governance identity;
- bounded discovery scope, limits, ignored sources, and resumable segments;
- task-relevant categories, participants, origins, and processing paths;
- lifecycle applicability, including non-forward and recovery branches;
- selection points and derived-result consistency groups;
- path provenance that distinguishes project runtime behavior from automation,
  external systems, fixtures, seeds, mocks, stubs, and manual-only paths;
- stable `coverage_scenario_id` values with expected and negative or reverse
  behavior;
- proof strength required for every scenario;
- project-local evidence locators and Evidence Authority binding;
- fact dependencies, unresolved technical inspection, and Challenger results.

Generic statements such as "all paths are covered" are not evidence. Fixture,
seed, mock, or manual evidence cannot prove project-runtime behavior. Missing
technical knowledge remains Codex work; only an unavailable business fact or
external authoritative fact may be surfaced to the user in plain language.

## Downstream Contract

Every required scenario ID must remain traceable through:

```text
Business Universe Coverage
-> Business Rule Closure mapping
-> Change Impact surface mapping
-> Plan Review scenario review
-> Verification Plan positive and reverse obligations
-> Test Evidence
-> Execution Assurance
-> Completion Evidence
-> Unified Closure / finish
```

Each consumer keeps its own local IDs and records
`source_coverage_scenario_ids[]`. A missing, duplicated, stale, weakly proven,
or mismatched scenario fails closed. No consumer may recreate or rename the
source scenario.

## Outcomes

| Outcome | Meaning |
| --- | --- |
| `COVERAGE_READY` | The exact task-relevant scenario set is evidence-bound and ready for downstream mapping |
| `BLOCKED_INCOMPLETE_UNIVERSE` | Codex must continue technical inspection |
| `BUSINESS_FACT_NEEDED` | One real business fact cannot be inferred from available evidence |
| `EXTERNAL_FACT_NEEDED` | One authoritative external fact remains unavailable |

## Authority Boundary

This capability is read-only. It does not write target files, authorize
implementation, approve completion, approve release or production, or claim
absolute real-world completeness. Unified Closure remains the only final
completion authority.
