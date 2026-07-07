# Release Evidence Gate

Release Evidence Gate is the step after task-completion evidence and before a
human release owner reviews a version.

It answers:

```text
Is the evidence package good enough to hand to the release owner?
```

It does not answer:

```text
Can this go live now?
```

## What It Checks

- Which release candidate is being reviewed.
- Which release target is intended: preview, internal trial, staging,
  production review, app-store review, or mini-program review.
- Whether Completion Evidence exists for the included work.
- Whether runtime smoke, rollback, monitoring, owner, platform recipe, and
  handoff evidence are present for the target.
- Whether existing project release SOPs are mapped rather than downgraded.
- Whether any field incorrectly claims release approval or deployment authority.

## Plain-Language Use

Ask:

```bash
node scripts/cli.mjs release-evidence . --intent "prepare release review"
node scripts/cli.mjs release-evidence-check . --allow-empty
```

When saving evidence:

```bash
node scripts/cli.mjs release-evidence . \
  --intent "prepare release review" \
  --release-target preview \
  --out release-evidence-gate-reports/001-preview.md

node scripts/cli.mjs release-evidence-check . \
  --report release-evidence-gate-reports/001-preview.md \
  --require-structured-evidence
```

## Existing Projects

If a project already has a release SOP, rollback SOP, CI gate, QA checklist, or
incident process, Release Evidence Gate maps those rules and reports gaps. It
does not replace them. Stronger existing rules stay stronger.

## Non-Authority

Release Evidence Gate does not approve release, deploy production, submit to app
stores or mini-program review, run migrations, ask for secrets, change DNS,
change payment providers, mutate CI/CD, or prove real-user stability.
