# MVP Dashboard Web App

## Original user goal

I want a simple project dashboard so a small team can see work status.

## Human decisions

1. First version uses Web.
2. First version uses local demo data.
3. Login, roles, live integrations, production deployment, and customer data stay out of scope.

## Run

Open `src/index.html` in a browser.

## Verify

```bash
npm test
```

Expected local evidence is recorded in `evidence/smoke-output.txt`.

## What works

- Team member can see three project metrics.
- Team member can review current work items.
- Empty and error state copy exists for local trial discussion.
- Status summary is rendered from local demo data.

## Boundary

This is local demo evidence only. It is not production release approval and does not prove real-user adoption.
