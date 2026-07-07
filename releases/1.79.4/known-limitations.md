# IntentOS 1.79.4 Known Limitations

## Scope

This patch makes User Delivery Console intermediate source signals current-task
aware.

## Current Limitations

- Matching is based on current `--intent` digest and source refs/digests, not
  broad semantic similarity.
- If the same task is restated with materially different wording, Codex may need
  to reuse the canonical task intent.
- Source records without Machine-Readable Evidence remain visible as project
  records but cannot be counted as current-task evidence.
- This does not make User Delivery Console an authoritative source-system gate.
- Launch review readiness is still not release approval.
- Real-user stability still requires project-specific runtime, monitoring, and
  release evidence outside this card.
