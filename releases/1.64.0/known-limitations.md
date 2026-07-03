# 1.64.0 Known Limitations

- Parser calibration is deterministic. It does not prove every old project rule was found.
- Skipped blocks and low-signal blocks are review evidence, not approval.
- Markdown tables are surfaced for human review instead of being automatically converted into migration rules.
- Long paragraphs are surfaced for human review when they are too large for confident extraction.
- Strict structured evidence is opt-in through `--require-structured-evidence`.
- 1.64 does not execute native migration, replace governance files, approve implementation, approve release/production, or change target-project files.
