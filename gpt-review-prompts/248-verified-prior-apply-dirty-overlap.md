# GPT Review Prompt: 248-verified-prior-apply-dirty-overlap

Use this prompt with GPT Pro, a second model, or another read-only reviewer when a Review Packet needs independent review.

Do not include secrets, credentials, production tokens, or sensitive runtime data.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.113.0`

Context digest: `sha256:bdc16d1aa0bdc231d5b5d1cd339a65f94560a3d38f89c64af4adee4c74a67d81`

The Review Packet must carry the same binding. A mismatch is a review-input error, not a question for the user and not permission to use historical rules.

## Review Input Identity

Lifecycle: CURRENT_IMPLEMENTATION

Project fingerprint: `sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58`

Project revision: `sha256:c08c14953cd0ecd92519195879248389d3b0d7854f78117bb64c5fad8b37d4ba`

Task ref: `tasks/248-verified-prior-apply-dirty-overlap.md`

Task digest: `sha256:48c1d67c0d298015218eb819648f9775278db15f855e8caeeafd89d620e026e5`

## Prompt

You are a read-only reviewer.

Current IntentOS review context: `1.113.0`.

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
- weaken Risk Gate or an exact authority scope
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
- NEEDS_HUMAN_DECISION: compatibility category used only for
  `BUSINESS_FACT_NEEDED`, `REAL_WORLD_CONSENT_NEEDED`, or
  `EXTERNAL_FACT_NEEDED`; never use it for a technical choice.
- NEEDS_CLARIFICATION: referenced evidence is insufficient. Return the gap to
  Codex for technical investigation; do not ask the user unless one permitted
  input class is proven necessary.
- NO_ACTION: no change needed; include the reason.

NO_ACTION requires a reason.

NEEDS_CLARIFICATION remains a Codex-owned evidence gap. It may become
NEEDS_HUMAN_DECISION only when it maps to one of the permitted user-input
classes.

Output only this structure:

```text
Current Review Context:
- Version: 1.113.0
- Operating model: ZERO_EXPERIENCE_SOLO_DEVELOPER

Review Summary:
- Decision: APPROVE / REQUEST_CHANGES / BLOCK / NEEDS_HUMAN_DECISION
- Reason:

Findings:
| ID | Severity | Category | Finding | Evidence | Proposed action | Handling | Status |
|---|---|---|---|---|---|---|---|

Verification Gaps:
- None / list concrete gaps

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
- None / list reasons

Reviewer Notes:
- None / list notes
```

`NEEDS_HUMAN_DECISION` is an internal compatibility category. In the plain
summary translate it to one missing business fact, consent to one concrete
real-world effect, or one external fact. Never turn technical uncertainty into
a user decision.

## Review Packet Ref

Review Packet: `review-packets/248-verified-prior-apply-dirty-overlap.md`

Task: `tasks/248-verified-prior-apply-dirty-overlap.md`

Spec: `specs/248-verified-prior-apply-dirty-overlap.md`

Eval: `evals/248-verified-prior-apply-dirty-overlap.md`

Task Level: L2
