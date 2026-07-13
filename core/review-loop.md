# Review Loop Protocol

Review Loop Protocol defines what happens after a task implementation is complete: review, deterministic repair, re-review, and human-decision routing.

It is not hook automation. It does not require an external model API. Hook-based reviewer automation can be added later as an adapter, but the core protocol stays file-based and project-local.

## Roles

- Implementing agent: changes files inside the approved task scope.
- Reviewer agent: performs read-only review and writes structured findings only.
- Human: decides scope expansion, risk acceptance, architecture changes, production decisions, and final merge or release judgment.

The reviewer must not edit files, approve risk, approve release, expand scope, or change the task goal.

The reviewer must not approve release.

## Artifacts

- Review Packet: stable input for a human reviewer, GPT Pro, a second model, or another review process.
- GPT Review Prompt: copyable read-only reviewer instruction for GPT Pro or another external reviewer.
- Review Loop Report: record of review rounds, findings, automatic fixes, verification, repeated issues, and human-decision queue.
- Follow-up Proposal: optional record for a bounded suggestion that is related to the task but outside current scope.
- Final Report: durable task result summary when chat output is not enough.

Do not merge these artifacts into one file. The Review Packet is input. The Review Loop Report is process history. The GPT Review Prompt is reviewer instruction.

Bounded next-step suggestions use `core/next-step-boundary.md`. They are not Review Loop findings.

Use `scripts/check-review-loop.mjs` to validate Review Loop Reports before task closure:

```bash
node scripts/check-review-loop.mjs . --task tasks/<task>.md
node scripts/check-review-loop.mjs . --mode implementation --task tasks/<task>.md
```

## Task-Level Policy

| Task Level | Review Loop Rule |
| --- | --- |
| L0 | Review Packet is not required. Final report is enough unless evidence or the user explicitly requests extra review. |
| L1 | Codex self-check and verification are required. Review Loop is optional. |
| L2 | Review Packet is required. One read-only reviewer pass is required. AUTO_FIX is limited to 2 rounds. |
| L3 | Review Packet is required. An independent reviewer, isolated subagent, second model, or project-native external reviewer is required. Codex may fix only bounded findings. Technical risk, architecture, permission, and migration treatment stays internal; exact user consent is required only before a prepared real-world effect. |

If the task level is unclear, use the stricter applicable rule until evidence resolves it.

For L2/L3 tasks, `scripts/check-workflow-artifacts.mjs --mode implementation --task <task>` also expects a matching Review Packet and Review Loop Report.

## Finding Categories

Every finding must use one of these categories:

- AUTO_FIX: deterministic, low-risk fix inside approved task scope.
- NEEDS_HUMAN_DECISION: compatibility category used only when a business fact, exact real-world consent, or external fact is unavailable.
- NEEDS_CLARIFICATION: reviewer cannot decide from available evidence.
- NO_ACTION: noted issue does not require a change; reason must be recorded.

NO_ACTION requires a reason.

NEEDS_CLARIFICATION can be attempted once by asking for or adding evidence. If it is still unclear after one attempt, convert it to NEEDS_HUMAN_DECISION.

Use this distinction:

```text
Finding = current task issue that must be handled by review protocol.
Suggestion = possible work or context after the current task.
```

Future work, adjacent improvements, and scope-expanding ideas belong in `Next-Step Suggestions`, not AUTO_FIX.

## Finding Fields

Use these fields for every finding:

- ID
- Severity: P0 / P1 / P2
- Category: AUTO_FIX / NEEDS_HUMAN_DECISION / NEEDS_CLARIFICATION / NO_ACTION
- Finding
- Evidence
- Proposed action
- Owner
- Status

Evidence must point to the Review Packet, changed file, command output, task card, spec, eval, or other concrete artifact. Do not invent missing evidence.

## AUTO_FIX Allowlist

Codex may auto-fix only when all conditions are true:

- The finding is inside the approved task scope.
- The fix is deterministic and low-risk.
- The fix does not require new approval.
- The fix can be verified with existing commands or evidence.

Allowed examples:

- lint, format, typecheck, or test failure
- missing evidence reference
- wrong file path
- missing required template field
- broken documentation link
- obvious small bug inside task scope
- missing agreed test
- low-risk fix inside the accepted task boundary

## Forbidden Auto-Fix

Keep technical findings inside internal review or mark them blocked by evidence. Convert to `NEEDS_HUMAN_DECISION` only when the finding needs:

- an unavailable business rule or product preference
- exact consent to a prepared production, cost, real-user, external-account, payment/value-transfer, or irreversible-data effect
- an unavailable legal, tax, compliance, provider, account, or third-party fact

If an auto-fix would weaken Risk Gate, evidence, or an approval boundary, stop automatic repair and route it to stricter internal review. Do not turn the technical question into a user decision.

## Rounds

AUTO_FIX is limited to 2 rounds.

For each round:

1. Review findings.
2. Split AUTO_FIX from human-decision items.
3. Apply only allowed AUTO_FIX items.
4. Run verification.
5. Re-review resolved and changed areas.
6. Update the Review Loop Report.

## Stop Conditions

Stop and ask the human when any condition appears:

- Same finding appears twice.
- Auto-fix introduces a new P0 or P1 finding.
- Fix requires scope expansion.
- Fix requires a new dependency.
- Fix requires changing risk approval, Human Approval, or Approval scope.
- Verification fails repeatedly for the same reason.
- Reviewer output is unstructured or missing evidence.
- Reviewer asks for whole-repo context beyond the Review Packet without a concrete missing artifact reason.

## GPT / External Reviewer Use

When GPT Pro or another external reviewer is used:

- Provide the Review Packet and GPT Review Prompt.
- Ask for read-only review only.
- Ask for structured findings only.
- Do not ask the external reviewer to approve risk, release, or scope.
- Do not paste secrets or sensitive runtime data into the packet.

The external reviewer output is input to Codex. Codex still applies the Review Loop Protocol before making any fix.

## Completion

A Review Loop can finish as:

- DONE: no remaining findings, or remaining NO_ACTION findings have reasons.
- AUTO_FIXED: all AUTO_FIX findings were fixed and verified.
- NEEDS_HUMAN_DECISION: at least one finding needs a human decision.
- BLOCKED: required evidence, verification, or reviewer output is unavailable.

The final Codex response must summarize what was automatically fixed, what remains open, what needs human decision, what verification was run, and any bounded next-step suggestions.
