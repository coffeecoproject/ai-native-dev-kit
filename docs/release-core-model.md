# Release Core Model

Release Core Model gives users one clear release-facing answer without hiding the systems behind it.

In plain language:

```text
many release checks -> one Release Plan view -> one safe next step
```

The Release Plan is not a new release approval. It is a read-only summary that says:

- what IntentOS found
- what is missing
- which project rules are stricter
- whether Codex can keep working in IntentOS mode
- what a human or external release system must decide
- what should happen next

## Existing Project Meaning

For an existing project, Codex should not wait for the user to understand every IntentOS command.

Codex may directly work in IntentOS Operating Mode:

- read the project
- classify risk
- compare existing rules
- prepare native migration and reconciliation reports
- prepare apply plans
- run allowed local checks
- stop for human decisions

But Codex may not treat that operating mode as permission to rewrite the project.

Project files, baselines, release rules, CI, hooks, and templates are changed only after:

```text
existing rule comparison -> migration depth recommendation -> unified apply plan -> approval -> controlled apply readiness
```

## Rule Comparison

When old projects already have baselines or release SOPs, IntentOS compares rather than overwrites.

The recommendation can be:

- keep the old rule because it is stricter or proven
- adopt an IntentOS gap because the project is missing a standard rule
- merge after review
- ask a human because authority is unclear
- block because the project authority or risk is too high

## Release Plan Is View-Only

Release Plan does not:

- approve release
- execute release
- replace release recipes, handoff packs, launch review, or release execution
- replace project release owner
- change CI or hooks
- write target files

It only summarizes and explains.

