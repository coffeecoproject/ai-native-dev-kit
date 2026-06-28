# Review Summary: <task-name>

Use this template to explain Review Loop results to a project owner before technical review details.

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Accept and close | Keep the reviewed result | Report only | low | Choose when no blocking issue remains |
| B | Let AI fix allowed issues | Fix only AUTO_FIX findings inside approved scope | Yes, approved task files only | low/medium | Choose when findings are deterministic and bounded |
| C | Human decision first | Stop before risky or unclear changes | Decision/report only | medium/high | Choose when findings affect scope, risk, release, or architecture |
| D | Pause review | Stop and wait | No | low | Choose when review evidence is incomplete |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence conclusion:

## Current Status

Status: Can continue / Needs confirmation / Must stop

Reason:

Risk level: low / medium / high

Can AI continue: yes / limited / no

## Review Result

- Findings found:
- Automatically fixed:
- Still open:
- Needs human decision:
- Release / merge recommendation:

## AI Already Fixed

-

## Remaining Issues

-

## What I Need From You

Decisions needed:

1.

## Recommended Next Step

Next safe action:

## What AI Can Do Safely

-

## What AI Must Not Do

-

## Technical Review Details

Review Packet:

Review Loop Report:

Reviewer:

Commands run:

```text

```

Findings table:

| ID | Severity | Category | Status | Evidence |
|---|---|---|---|---|
|  | P0 / P1 / P2 | AUTO_FIX / NEEDS_HUMAN_DECISION / NEEDS_CLARIFICATION / NO_ACTION |  |  |

## Audit Notes

Evidence refs:

-

Approvals / exceptions:

-

Residual risks:

-
