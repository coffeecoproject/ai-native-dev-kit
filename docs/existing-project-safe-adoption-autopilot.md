# Existing Project Safe Adoption Autopilot

This page explains the public old-project adoption entry.

Use it when a user asks to connect an existing project to IntentOS and expects
Codex to decide the safe route instead of asking the user to run expert
workflow commands.

## What It Does

- Checks the project without changing it.
- Detects whether the project is light, governed, production-sensitive, dirty,
  or missing.
- Reads existing project rules and compares them through existing IntentOS
  systems.
- Returns one adoption result card in plain language.

## What It Does Not Do

- It does not install `.intentos/`.
- It does not create or replace `AGENTS.md`.
- It does not modify code, CI, release, production, secrets, database, API, Web,
  Docker, payment, provider state, or data.
- It does not claim the project is fully adopted.
- It does not claim full adoption.

## Recommended User Wording

Good:

```text
我会先安全接入：只做检查和规划，不改项目文件。
```

Bad:

```text
请确认是否进入 selected native adoption。
```

Internal terms belong in Technical Trace only.
