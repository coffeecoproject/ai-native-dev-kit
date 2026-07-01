# Low-Risk Controlled Apply Candidate

Use this when Codex has a small proposed change and needs to explain whether it is safe enough to ask for later approval.

Plain-language rule:

```text
This does not change files.
It only says whether the proposed change is small, exact, reversible, and testable enough to consider next.
```

## When To Use

Use it after:

- the first version scope is clear
- the product path is understood
- the proposed write is narrow
- the user still needs to approve before files change

Do not use it for:

- production releases
- database migrations
- payment or permission changes
- CI or hook installation
- broad refactors
- unclear target paths

## Expected User Experience

The user should see:

- what would change
- why it is low risk or not ready
- exactly which files are in scope
- how it would be verified
- how it could be rolled back
- whether a human decision is needed
- a machine-readable evidence block for strict checks

The user should not be asked to understand internal workflow names.

Strict mode can require structured evidence:

```bash
node scripts/check-low-risk-apply-candidate.mjs . --require-structured-evidence
```

Default mode remains compatible with older target-project Markdown records.
