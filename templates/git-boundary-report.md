# Git Boundary Report: <name>

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Stage recommended files | Include only files listed as safe for Git | Git index only after approval | low/medium | Choose when the boundary is clear |
| B | Revise boundary | Update which files should enter Git | Report only | low | Choose when generated/local/private files need review |
| C | Stop for owner decision | Pause before staging or committing | No | medium/high | Choose when secrets, raw conversations, or local artifacts may be present |
| D | Do not commit | Leave all files unstaged | No | low | Choose when the change is not ready |

Recommended reason:

What happens if you do nothing:

## Human Summary

This report explains which AI Native and project context artifacts should enter Git for a specific change.

## Change Scope

Describe the task, PR, commit, or project adoption change.

## Should Enter Git

- 

## Conditional / Needs Human Decision

- 

## Should Stay Local

- 

## Never Commit Check

| Item | Status | Notes |
|---|---|---|
| Secrets | PASS / FAIL / NOT_APPLICABLE |  |
| Tokens | PASS / FAIL / NOT_APPLICABLE |  |
| Private keys | PASS / FAIL / NOT_APPLICABLE |  |
| Raw conversations | PASS / FAIL / NOT_APPLICABLE |  |
| Local caches | PASS / FAIL / NOT_APPLICABLE |  |

## Human Decision

Pending / Approved / Rejected / Needs Revision

## Audit Notes

Related task:

Related decision brief:
