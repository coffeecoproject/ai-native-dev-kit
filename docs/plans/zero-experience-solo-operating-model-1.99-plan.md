# Zero-Experience Solo Developer Operating Model 1.99

## Purpose

Make the default IntentOS user a zero-experience solo developer who communicates
only real business goals, business facts, preferences, and consent for concrete
real-world effects. IntentOS and Codex own technical interpretation, workflow
routing, architecture, baseline selection, implementation planning, testing,
review, evidence, repair, rollback preparation, and delivery coordination.

This is a user-responsibility-model hardcut. It is not a wording patch, a weaker
approval model, a new parallel workflow, or permission for Codex to invent
business rules or perform irreversible external actions.

## North-Star Contract

The default operating contract is:

```text
User:
  describes the real business goal;
  supplies business facts that cannot be inferred from project evidence;
  states product preferences and constraints;
  consents to concrete cost, production, communication, or irreversible effects.

IntentOS / Codex:
  makes all technical decisions;
  selects and runs all internal workflow stages;
  implements, tests, reviews, repairs, and verifies;
  prepares rollback and delivery evidence;
  translates every unavoidable user decision into plain real-world impact.
```

The user must never be asked to choose a BL level, profile, industrial pack,
architecture, database representation, migration strategy, test type, review
surface, subagent plan, hook class, checker, evidence artifact, or internal
workflow command.

## Default Collaboration Model

`ZERO_EXPERIENCE_SOLO_DEVELOPER` is the default and public operating model.

- No team, department, or organizational role is assumed.
- One current user may provide every business fact and real-world consent.
- Internal risk domains such as data, security, release, payment, or compliance
  are classifications used by Codex to select safeguards; they are not people
  the user must find.
- Team or organization mapping may be derived only from explicit project-owned
  evidence. It must not appear as a setup question for the default user.

## User Responsibility Classes

IntentOS may expose only these user-facing responsibility classes:

| Class | Meaning | User experience |
|---|---|---|
| `NO_USER_ACTION` | Codex can continue within the current reversible task boundary | no approval prompt |
| `BUSINESS_FACT_NEEDED` | A real business rule or preference is unavailable from project evidence | ask one plain business question |
| `REAL_WORLD_CONSENT_NEEDED` | The next action has concrete cost, production, communication, account, or irreversible impact | recommend one safe path and ask consent to that impact |
| `EXTERNAL_FACT_NEEDED` | A legal, tax, compliance, provider, or other external fact cannot be proven by code | complete unaffected work, prepare a handoff question set, and keep only the dependent capability blocked |

Technical uncertainty is never a user responsibility class. Codex must resolve
it through project reading, safe defaults, tests, review, subagents, evidence,
or a bounded technical spike.

## Work Package A: Public Operating Contract

- add one source-controlled solo operating-model contract;
- expose the contract in `work`, beginner entry, generated Agent governance,
  README, and installed workflow assets;
- make natural-language task intent sufficient authorization for ordinary,
  reversible, task-bounded project-local engineering work;
- remove internal role selection and workflow-command knowledge from the public
  interaction contract;
- keep discussion-only intent non-writing.

## Work Package B: Decision Delegation

- replace public `PROJECT_OWNER`, `DATA_OWNER`, `SECURITY_OWNER`,
  `RELEASE_OWNER`, and similar role lists with internal responsibility domains;
- derive one user-facing responsibility class and one plain next question;
- do not ask a user to approve a technical plan merely because it is technical;
- preserve explicit consent for production, cost, real-user communication,
  destructive real data, account/provider, and other irreversible effects;
- allow a reserved current-conversation-user identity in structured consent
  records so the user is not asked to invent an enterprise role or formal name;
- never let Codex fabricate consent from silence, implication, or a generated
  report.

## Work Package C: Hidden Internal Workflow

- keep Work Queue, Task Governance, Business Rule Closure, Plan Review,
  Verification Plan, Test Evidence, Review Loop, Completion Evidence, Closure,
  Apply Receipt, and Release Evidence active as internal systems;
- automatically select technical profiles, BL level, standard packs, industrial
  packs, review surfaces, test strategy, and evidence consumers;
- expose internal technical detail only under diagnostics or audit output;
- preserve fail-closed completion, apply, and release behavior.

## Work Package D: Capability Coverage

- derive capability domains from project evidence and task intent, including
  runtime platform, backend/API, data storage, auth/permission, release,
  observability, payment/value transfer, and high-risk change;
- map those domains to technical profiles and companion baseline packs without
  asking the user to choose them;
- report missing capability evidence as an internal engineering action, not a
  user decision;
- ask the user only when the missing item is a business fact or real-world
  consent.

## Work Package E: New And Existing Projects

For new projects:

- infer platform and delivery shape from the requested product;
- select a complete baseline automatically;
- create the project and continue through implementation and verification;
- ask only for missing business behavior and real-world release effects.

For existing projects:

- read current governance, tasks, code, baselines, release rules, and evidence;
- reconcile and improve technical rules automatically where bounded and
  reversible;
- preserve stricter proven project rules;
- migrate weak or missing task/workflow assets through the controlled apply
  chain without asking the user to choose an adoption mode;
- keep production/external effects behind plain real-world consent.

## Work Package F: Output And Terminology Hardcut

Public output must lead with:

1. what IntentOS understood about the business goal;
2. what Codex will do or has completed;
3. which business fact, if any, is missing;
4. which concrete real-world effect, if any, needs consent;
5. whether the dependent capability remains safely disabled;
6. the next automatic engineering action.

Public output must not require the user to understand owner roles, approval
roles, workflow commands, BL levels, packs, schemas, evidence graph nodes,
checkers, or review-agent types.

Machine-readable compatibility fields may retain historical names where needed,
but public renderers and active guidance must use solo-developer language.
Historical release records and completed plans remain unchanged as audit history.

## Implementation Assets

- `core/zero-experience-solo-operating-model.md`
- `scripts/lib/solo-operating-model.mjs`
- Operating Loop decision and human-summary integration
- Beginner Entry and Agent governance integration
- Approval/consent identity calibration
- active core/template/public documentation terminology updates
- Manifest and installed-target distribution updates
- focused zero-experience solo-developer tests
- self-check and generated-project regression coverage

## Safety Boundaries

- Business facts are not invented by Codex.
- Silence is not consent.
- A natural-language implementation request does not authorize production,
  cost, real-user communication, secret disclosure, destructive real data,
  provider mutation, store submission, legal/tax/compliance claims, or another
  irreversible external effect.
- Simplified public output does not weaken strict evidence, source binding,
  rollback, receipt, completion, or release gates.
- External facts block only the dependent capability when the rest of the work
  can continue safely.
- Team and enterprise support is optional project-derived behavior, not the
  default public model.

## Acceptance Matrix

| Scenario | Required result |
|---|---|
| zero-experience user requests a new appointment app | no technical-choice or workflow-command question |
| zero-experience user requests a feature in an existing project | Codex chooses the technical path and prepares complete cross-surface execution |
| current task is interrupted by another request | Work Queue and task-switch review operate internally; user sees one plain business choice only when both goals cannot proceed together |
| implementation needs architecture, database, tests, review, or baseline decisions | `NO_USER_ACTION`; Codex resolves them |
| a business cancellation/refund rule is missing | `BUSINESS_FACT_NEEDED` with one plain business question |
| production deployment, real data deletion, paid service, or real-user message is next | `REAL_WORLD_CONSENT_NEEDED` with recommended safe path and concrete impact |
| legal, tax, compliance, or provider fact is unresolved | `EXTERNAL_FACT_NEEDED`; dependent capability blocked, unaffected engineering continues |
| multiple internal risk domains apply | no requirement for multiple people or organizational roles |
| task completion is claimed | existing strict task/evidence/closure chain remains mandatory |
| controlled apply or release is requested | existing exact plan/receipt/release trust chain remains mandatory |
| generated new project is checked | installed public entry uses the same solo model |
| governed existing project is checked | stronger project rules remain, but user is not asked to choose an adoption mode |

## Verification

- syntax checks for every added or changed script;
- focused tests for technical delegation, business facts, real-world consent,
  external facts, solo identity, and forbidden owner-role output;
- generated new-project and governed existing-project simulations;
- Operating Loop, Work Queue, Completion, Apply, Adoption, Baseline, and Release
  regression suites;
- Manifest source/target distribution validation;
- `node scripts/check-intentos.mjs`;
- `npm run verify`;
- `git diff --check`;
- final review confirms no public path requires technical judgment or multiple
  internal people from the default user.

## Release Completion Rule

1.99 cannot be called complete if only README or prompt wording changes. The
runtime operating decision, generated project assets, active guidance, tests,
and strict safety consumers must all enforce the same solo-developer contract.
