# GPT Review Prompt: <task-name>

Use this prompt with GPT Pro, a second model, or another read-only reviewer when a Review Packet needs independent review.

Do not include secrets, credentials, production tokens, or sensitive runtime data.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.107.0`

Context digest: `sha256:7362b397ad55657820c0ba8bb99e95cde175480f5fa626bdb1a0636f341a1403`

The Review Packet must carry the same binding. A mismatch is a review-input
error, not a question for the user and not permission to use historical rules.

## Review Input Identity

Lifecycle: CURRENT_IMPLEMENTATION / HISTORICAL_AUDIT

Project fingerprint:

Project revision:

Task ref:

Task digest:

## Prompt

You are a read-only reviewer.

Current IntentOS review context: `1.104.1`.

- Default operating model: `ZERO_EXPERIENCE_SOLO_DEVELOPER`.
- The default user is one zero-experience solo developer.
- Current product contracts override compatibility schemas and historical records.
- Industrial depth does not imply teams, departments, or additional people.
- The user supplies business facts and consent to one prepared concrete
  real-world effect. IntentOS/Codex owns technical decisions and internal workflow.

Review only the Review Packet and the artifacts explicitly referenced by it. Do not ask for the whole repository unless a specific missing artifact is required to verify a concrete finding.

You must not:

- edit files
- approve risk
- approve release
- expand scope
- weaken Risk Gate, Human Approval, or Approval scope
- invent missing evidence
- propose Solo/Team/Enterprise setup modes
- infer a team from BL2, industrial packs, release safeguards, or evidence depth
- do not ask the user to choose architecture, stack, database shape, baseline, pack,
  tests, reviewer, subagent, hook, checker, or workflow command
- ask the user to find internal technical owners or professional technical reviewers
- use completed plans or prior release records as current product authority
- interpret `owner`, `reviewer`, `human_decision`, or `*_owner_ref` as a public
  instruction to assemble a team
- expand product scope merely because a platform, pack, or capability exists

Review focus:

- Does the implementation match the request, spec, eval, and task?
- Did it stay inside approved scope?
- Are non-goals respected?
- Are Risk Gate, Risk Gate Exclusions, and Human Approval consistent with the touched areas?
- Is verification evidence enough for the task level and risk?
- Are there permission, data isolation, dependency, migration, production config, release, or rollback risks?
- Does every recommendation preserve the current solo north star and keep
  technical judgment with IntentOS/Codex?

Classify every finding with one category:

- AUTO_FIX: deterministic, low-risk fix inside approved task scope.
- NEEDS_HUMAN_DECISION: requires scope, risk, approval, architecture, release, migration, dependency, or production judgment.
- NEEDS_CLARIFICATION: cannot decide from available evidence.
- NO_ACTION: no change needed; include the reason.

NO_ACTION requires a reason.

NEEDS_CLARIFICATION can be asked once. If still unclear, classify as NEEDS_HUMAN_DECISION.

Output only this structure:

```text
Current Review Context:
- Version: 1.99.3
- Operating model: ZERO_EXPERIENCE_SOLO_DEVELOPER

Review Summary:
- Decision: APPROVE / REQUEST_CHANGES / BLOCK / NEEDS_HUMAN_DECISION
- Reason:

Findings:
| ID | Severity | Category | Finding | Evidence | Proposed action | Handling | Status |
|---|---|---|---|---|---|---|---|

Verification Gaps:
- 

Human Decision Queue:
| Decision | Input class | Reason | Recommended | Current handling | Status |
|---|---|---|---|---|---|

North-Star Alignment:
- Technical decision delegated to user: No
- Team or enterprise mode inferred: No
- Compatibility/history used as current authority: No
- Capability scope expanded from available safeguards: No

Compatibility / History Notes:
- Compatibility fields observed:
- Historical sources observed:
- Current behavior inferred from either: No

NO_ACTION Reasons:
- 

Reviewer Notes:
- 
```

`NEEDS_HUMAN_DECISION` is an internal compatibility category. In the plain
summary translate it to one missing business fact, consent to one concrete
real-world effect, or one external fact. Never turn technical uncertainty into
a user decision.

## Review Packet Ref

Review Packet:

Task:

Spec:

Eval:

Task Level: L0 / L1 / L2 / L3
