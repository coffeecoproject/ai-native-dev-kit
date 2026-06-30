# Controlled Apply Execution Roadmap: 1.40-1.42

## Purpose

This roadmap turns the current plan-first apply flow into a stricter, evidence-led execution path.

The goal is not to make Codex automatically write files. The goal is to make every future write decision traceable:

```text
Unified Apply Plan
-> Controlled Apply Readiness
-> Human Approval Record
-> Machine-readable Apply Plan
-> Controlled Apply Runner Candidate
```

Each step must remain independently reviewable.

## Phase 1.40: Approval Record Governance

Add a dedicated human approval evidence layer.

This phase records:

- who approved;
- which plan was approved;
- which exact action IDs were approved;
- what scope is included;
- what scope is excluded;
- expiry and rollback acknowledgement;
- verification acknowledgement;
- non-authorizations.

It must not:

- execute an apply plan;
- treat a readiness report as approval;
- accept AI, Codex, reviewer, or subagent output as approval;
- approve release, production, hooks, CI, migrations, secrets, payments, security, privacy, compliance, legal, or industrial pack changes;
- allow blanket approval such as `all actions`, `entire repo`, or `whatever Codex thinks is needed`.

## Phase 1.41: Machine-readable Apply Plan Schema

Add a structured schema for apply actions so future tooling can validate intent without parsing prose.

This phase should define:

- action IDs;
- action type;
- target paths;
- risk classification;
- required approval record reference;
- preconditions;
- backup and rollback steps;
- verification commands;
- blocked / human-only markers;
- no-write boundary fields.

It must not:

- execute actions;
- convert Markdown plans into authority;
- allow missing approval records to pass as ready;
- weaken the existing Markdown plan and readiness checks.

## Phase 1.42: Controlled Apply Runner Candidate

Design, but do not broadly enable, a candidate controlled apply runner.

This phase should remain plan-first and guarded:

- dry-run by default;
- allowlist exact low-risk action types only;
- require a passing machine-readable plan;
- require a valid human approval record;
- require clean git or explicit dirty-work exception;
- require rollback and verification evidence;
- refuse high-risk actions;
- write only when a human explicitly chooses controlled apply.

This phase must not install hooks, change CI, run production release steps, or bypass existing project governance.

## Operating Rule

Each phase must ship with:

- core governance;
- user docs;
- template;
- checklist;
- reviewer prompt;
- checker;
- good example;
- bad fixtures;
- manifest coverage;
- generated-project coverage where applicable;
- release record;
- known limitations;
- self-check report.

## Human Experience

The intended user interaction is:

```text
User: 这份计划可以执行。
Codex: 我先记录你的明确批准范围，只记录证据，不自动执行。

User: 批准 action A001 和 A002。
Codex: 已生成 Approval Record，并检查它没有越权。下一步才是判断是否可以进入受控执行候选。
```

The user should decide scope and approval. Codex should handle evidence formatting, consistency checks, and next-step routing.
