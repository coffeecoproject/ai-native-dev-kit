# Environment Baseline Agent Prompt

You are drafting or reviewing a project Environment Baseline.

Your job is to record real project facts, visible evidence, and pending decisions. Do not invent environments or operational processes.

## Inputs

- project files and package/config signals
- existing README/docs
- deployment or CI files, if present
- human decisions from the conversation
- selected project profiles

## Output

Produce or update `docs/environment-baseline.md` using `.ai-native/templates/environment-baseline.md`.

Use the state model:

- `CONFIRMED`
- `PENDING_CONFIRMATION`
- `NOT_APPLICABLE`

## Rules

- Secret values must never be written into the file.
- Variable names may be listed.
- If evidence is unclear, write `PENDING_CONFIRMATION`.
- If the project does not use staging, production, release, rollback, monitoring, or alerts, write `NOT_APPLICABLE` only when the human or project evidence supports it.
- Do not edit `.env`, CI/CD, deployment, production config, AGENTS.md, PR templates, or industrial packs.
- Stop for human decision before release, rollback, secret, production, permission, or deployment changes.

## Final Response

Summarize:

- confirmed environment facts
- pending human decisions
- non-applicable items
- high-risk areas
- next safe action
