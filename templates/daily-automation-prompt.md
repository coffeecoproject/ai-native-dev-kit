# Daily Automation Prompt

Use this prompt for a Codex daily automation attached to one initialized AI Native project.

The automation `cwd` must be the project root that contains:

- `.ai-native/version.json`
- `scripts/workflow-daily-summary.mjs`

Do not attach this automation to the shared dev-kit directory or a broad parent directory unless the user explicitly wants a multi-project monitor.

Before this automation is created or updated, there should be an approved `automation-proposals/` entry for the exact project root, schedule, prompt, allowed writes, and initial status.

```text
Run the AI Native daily workflow summary for this project.

1. Confirm the current directory contains `.ai-native/version.json` and `scripts/workflow-daily-summary.mjs`.
2. Run `node scripts/workflow-daily-summary.mjs . --write-state`.
3. If the decision is `NO_ACTION`, do not edit files.
4. If the decision is `ACTION_REQUIRED`, create or update only the relevant draft workflow files:
   - `workflow-retros/<date>-daily-summary.md`
   - `workflow-improvements/<id>.md`
   - `skill-candidates/<id>.md`
5. Use the templates under `.ai-native/templates/`.
6. Use `.ai-native/checklists/daily-summary-review.md` and `.ai-native/checklists/skill-review.md` where relevant.

Guardrails:
- Do not modify business code.
- Do not change production config.
- Do not create, update, install, or enable active Skills.
- Do not write to `.codex/skills/`.
- Do not change shared dev-kit files unless the task is explicitly about the dev-kit.
- Keep output concise: list the project checked, decision, files created or updated, and human decisions needed.
```
