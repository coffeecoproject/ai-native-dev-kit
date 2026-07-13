# Daily Automation Prompt

Use this prompt for a Codex daily automation attached to one initialized IntentOS project.

The automation `cwd` must be the project root that contains:

- `.intentos/version.json`
- `scripts/workflow-daily-summary.mjs`

Do not attach this automation to the shared intentos directory or a broad parent directory unless the user explicitly wants a multi-project monitor.

Before this automation is created or updated, the user must have explicitly requested the persistent automation and the `automation-proposals/` entry must record the prepared recurring effect, exact consent, project root, schedule, prompt, allowed writes, and initial status.

```text
Run the IntentOS daily workflow summary for this project.

1. Verify the current directory contains `.intentos/version.json` and `scripts/workflow-daily-summary.mjs`.
2. Run `node scripts/workflow-daily-summary.mjs . --write-state`.
3. If the decision is `NO_ACTION`, do not edit files.
4. If the decision is `ACTION_REQUIRED`, create or update only the relevant draft workflow files:
   - `workflow-retros/<date>-daily-summary.md`
   - `workflow-improvements/<id>.md`
   - `skill-candidates/<id>.md`
5. Use the templates under `.intentos/templates/`.
6. Use `.intentos/checklists/daily-summary-review.md` and `.intentos/checklists/skill-review.md` where relevant.

Guardrails:
- Do not modify business code.
- Do not change production config.
- Do not create, update, install, or enable active Skills.
- Do not write to `.codex/skills/`.
- Do not change shared intentos files unless the task is explicitly about the intentos.
- Keep output concise: list the project checked, decision, files created or updated, and bounded user input needed.
```
