# Assumption Register: <scope>

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Confirm assumptions | Continue using confirmed assumptions | Register/report only | low | Choose when assumptions are correct |
| B | Continue with low-risk inference | Proceed only where inferred facts are low risk | Approved task files only | low/medium | Choose when missing detail does not affect risk |
| C | Stop for confirmation | Pause until a human confirms the assumption | Register/decision only | medium/high | Choose for high-risk or low-confidence assumptions |
| D | Reject assumption | Update context before continuing | Context/report only | low/medium | Choose when the assumption is wrong |

Recommended reason:

What happens if you do nothing:

## Human Summary

What uncertainty matters for this task or report:

## Assumptions

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
|  |  | high / medium / low | Yes / No | Yes / No | AI / human | CONFIRMED / INFERRED / PENDING_CONFIRMATION / NOT_APPLICABLE |

## Decisions Routed To Human

| Decision | Reason | Options | Recommended | Owner | Status |
|---|---|---|---|---|---|
|  |  |  |  | human | PENDING / APPROVED / REJECTED / NOT_REQUIRED |

## Notes

- `INFERRED` is not a formal baseline rule.
- High-risk assumptions must be confirmed before execution or claim expansion.
