# Release Approval Record

Use this artifact only after the exact release candidate and all required
release evidence are ready.

```text
release candidate
-> Release Evidence Gate
-> Runtime Hygiene
-> Release Channel Policy
-> platform recipe / handoff when required
-> human Release Approval Record
-> Release Execution review
```

The record is invalid when copied to another project, when Git HEAD or the
candidate changes, when any source report changes, when approval expires, or
when it assigns high-risk release actions to Codex.

Check it with:

```bash
node scripts/cli.mjs release-approval-check . --require-structured-evidence --require-approved
```

Passing this check does not execute or guarantee a release. It only proves
that a current human approval is bound to the current release trust inputs.

