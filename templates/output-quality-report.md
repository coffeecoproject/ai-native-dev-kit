# Output Quality Report: <name>

Use this file when a report, handoff, or review summary needs a quality check before it is shared with a human.

This report does not approve release, risk, scope expansion, or follow-up work.

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Share as-is | Keep the output unchanged | No, unless report is saved | low | Choose when the report is clear enough |
| B | Rewrite for humans | Improve conclusion, options, risk, and next step | Report/output only | low | Choose when the content is technically correct but hard to judge |
| C | Stop for missing evidence | Pause until proof or ownership is added | Report only | medium/high | Choose when the output makes unsupported claims |
| D | Do not share | Mark the output as not ready | Report only | low if respected | Choose when the report could mislead the user |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence conclusion:

## Score

Output quality score:

Minimum expected score:

Result: PASS / FAIL

## Report Checked

Path:

Audience: owner / developer / reviewer / audit

## What Was Clear

-

## What Was Missing

-

## Human Decisions Needed

| Decision | Why | Required before |
|---|---|---|
|  |  |  |

## Next Safe Action

## Technical Details

Command:

```bash
node scripts/score-output-quality.mjs <project-or-example> --min-score 80
```

Checker output:

```text

```

## Audit Notes

Evidence refs:

-

Residual risks:

-
