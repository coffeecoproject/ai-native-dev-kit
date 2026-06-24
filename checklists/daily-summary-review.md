# Daily Summary Review Checklist

Use this checklist for automated or manual daily workflow summary runs.

## Trigger

- [ ] `workflow-daily-summary.mjs` was run
- [ ] Summary decision is `ACTION_REQUIRED`
- [ ] New evidence or pending review exists
- [ ] No summary was created when decision was `NO_ACTION`

## Allowed Outputs

- [ ] `workflow-retros/<date>-daily-summary.md`
- [ ] `workflow-improvements/<id>.md`
- [ ] `skill-candidates/<id>.md`
- [ ] concise no-action report

## Prohibited Outputs

- [ ] No business code was changed
- [ ] No production config was changed
- [ ] No `.codex/skills/` file was created or modified
- [ ] No active Skill was installed or enabled
- [ ] No workflow gate was weakened

## Quality

- [ ] Summary links to source AI task logs or workflow files
- [ ] Repeated problems are evidence-backed
- [ ] Skill candidate suggestion, if any, explains why a checklist/template/script is not enough
- [ ] Pending human decisions are explicit
- [ ] Follow-up owner or next action is clear

