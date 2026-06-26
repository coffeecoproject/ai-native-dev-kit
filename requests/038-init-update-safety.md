# Request: Init/Update Safety

## Raw Request

Execute Productization Hardcut phase `0.38.0`: make init and update safer through dry-run, write-plan, apply-plan, backup, and plan-first protection for governed or risky existing projects.

## User / Customer

Maintainers of `ai-native-dev-kit` and real-project adopters who need Codex to configure workflow assets without silently writing into production, governed, or dirty projects.

## Problem

`init-project.mjs` can initialize and update projects, but phase `0.37.0` still allows direct update paths that are too implicit for old, governed, production, or dirty projects.

## Desired Outcome

Provide a predictable plan-first flow:

```text
dry-run -> write-plan -> review -> apply-plan -> backup evidence
```

Direct update remains available only for already bootstrapped low-risk targets.

## Constraints

- Do not implement `migrate`.
- Do not add dependencies.
- Do not call external GPT/API reviewers.
- Do not weaken PR template or AGENTS governance approval behavior.
- Do not change industrial pack selection semantics.
- Do not start artifact schema/frontmatter work from phase `0.39.0`.

## Priority

P1

## Suggested Task Level

L2
