# Ordinary User First-Slice Card: dashboard web app

## Human Summary

I understand you want: a simple project dashboard for a small team.

I suggest the first version: make a local Web dashboard with demo data, status metrics, a work item list, and empty/error state copy.

Can Codex write files now: No

What I need from you: confirm the first users / confirm Web is fine / confirm real integrations and login stay out of scope.

## First Version Scope

| Item | Included now? | Notes |
|---|---|---|
| Target user | Yes | small internal team |
| Core flow | Yes | review status metrics and work items |
| Platform | Yes | Web |
| Data | Local only | local demo data first |

## Questions For Human

1. Is the first version for internal team review only?
2. Should the first version stay Web?
3. Can login, live integrations, production deployment, and customer data stay out of scope?

## What Codex Can Do Next

1. Create the smallest local dashboard task.
2. Implement the static local demo.
3. Run smoke verification.

## Backlog / Later

| Item | Why later |
|---|---|
| Login and roles | Not needed for the first local version |
| Live integrations | Not needed for the first local version |
| Production deployment | Not needed for the first local version |
| Notifications | Not needed for the first local version |

## Verification Plan

| Check | Method | Evidence |
|---|---|---|
| Core flow | open local page and inspect metrics/list | final report or smoke output |
| Out-of-scope risk | confirm backlog excludes high-risk items | first-slice card |

## Boundaries

- This card writes target files: No
- This card approves implementation: No
- This card approves release or production: No
- This card changes CI or hooks: No
- This card touches payment, secrets, production, migration, or permissions: No
- This card enables BL2 or industrial packs: No

## Outcome

`FIRST_SLICE_RECORDED`
