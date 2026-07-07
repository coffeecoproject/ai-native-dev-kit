# IntentOS 1.79.3 Known Limitations

## Scope

This patch separates user verification notes from formal Test Evidence in User
Delivery Console.

## Current Limitations

- `--verification` text is not parsed as command output.
- A user note can summarize what someone says was checked, but it is not Test
  Evidence Binding.
- Formal test/check evidence still requires `test-evidence-reports/` artifacts.
- Task completion still requires strict Completion Evidence that matches the
  current request intent.
- Launch review readiness is not release approval.
- Real-user stability still requires project-specific runtime, monitoring, and
  release evidence outside this card.
