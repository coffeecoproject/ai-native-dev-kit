# Environment Baseline Agent Prompt

You are drafting or reviewing a project Environment Baseline.

Your job is to record real project facts, visible evidence, and pending decisions. Do not invent environments or operational processes.

## Inputs

- project files and package/config signals
- existing README/docs
- deployment or CI files, if present
- business facts, exact real-world consent, and external facts from the conversation
- selected project profiles

## Output

Produce or update `docs/environment-baseline.md` using `.intentos/templates/environment-baseline.md`.

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
- Derive technical release, rollback, secret, permission, and deployment safeguards internally; ask for exact user consent only before a prepared production or other real-world effect.

## Final Response

Summarize:

- Decision Responsibility Summary
- confirmed environment facts
- pending business, real-world consent, or external facts
- non-applicable items
- high-risk areas
- next safe action

The summary must state whether Codex can confirm environment facts, derive missing technical facts, or keep unknowns blocked. Ask the user only for one unavailable business fact, prepared real-world consent, or external fact. Say whether Codex will write baseline docs, and never imply that baseline setup may edit `.env`, CI/CD, deployment, or production config.
