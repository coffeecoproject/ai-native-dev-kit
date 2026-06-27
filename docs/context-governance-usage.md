# Context Governance Usage

Use this guide when Codex finds something useful while working on a project.

The rule is simple:

```text
Finding something is not the same as making it a project rule.
```

## What Codex Can Do

Codex may:

- read the repo and summarize confirmed facts
- point out possible project memory
- propose a learning candidate
- propose a correction when old context conflicts with the repo
- explain what should or should not enter Git

Codex must not:

- convert a guess into a rule
- treat previous chat memory as stronger than Git
- commit tokens, local secrets, screenshots, logs, or private notes
- overwrite project rules without human approval
- hide uncertainty in final reports

## When To Create Each Artifact

| Situation | Artifact |
|---|---|
| Codex found a repeatable project fact, preference, failure mode, or engineering decision | `learning-candidates/<id>.md` |
| Existing context is wrong, obsolete, or contradicted by current repo evidence | `context-corrections/<id>.md` |
| It is unclear whether generated work, logs, evidence, or local files should be committed | `git-boundary-reports/<id>.md` |

## Learning Candidate

Use a Learning Candidate for a possible future rule.

It remains a candidate until a human approves it. Approved candidates still need a clear destination, such as:

- `docs/project-memory.md`
- `docs/engineering-baseline.md`
- `AGENTS.md`
- a platform profile
- a project-specific runbook

Good examples:

- "This project uses lookup tables for business status values, not hard-coded strings."
- "Production deployment is manual and must not be triggered by Codex."
- "The user prefers short Chinese final reports for non-technical summaries."

Bad examples:

- "Codex thinks this is probably a React app."
- "Use this token for GitHub."
- "Always deploy after tests pass."

## Context Correction Report

Use a Context Correction Report when something already recorded is no longer true.

The correction must include:

- old context
- new evidence
- impact
- proposed correction
- human decision
- applied changes, if approved

If there is no evidence, the correction stays pending.

## Git Boundary Report

Use a Git Boundary Report when Codex needs to decide what can be committed.

Default rule:

```text
Workflow rules, templates, checks, and approved docs can enter Git.
Local scratch, secrets, raw private conversation, machine noise, and unapproved candidates stay out.
```

For every commit, Codex should ask:

- Is this part of the approved task?
- Is this a durable project rule or evidence?
- Is this safe to share in the repository?
- Was this created by the current task or unrelated local state?

## Minimum Flow

For a normal task:

1. Use confirmed repo files first.
2. If Codex finds reusable knowledge, draft a Learning Candidate.
3. If old context is wrong, draft a Context Correction Report.
4. If commit scope is unclear, draft a Git Boundary Report.
5. Ask for human approval before promoting candidates or risky corrections.

## Checker

Run:

```bash
node scripts/check-context-governance.mjs .
```

The checker verifies:

- required context governance assets exist
- candidate, correction, and boundary reports include required sections
- approved candidates include evidence and destination
- approved corrections include evidence and applied changes
- secret-like content is rejected

Empty target projects pass when the directories exist and no reports have been created yet.
