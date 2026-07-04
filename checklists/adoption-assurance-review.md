# Adoption Assurance Review

Use this checklist before Codex claims an existing project has adopted IntentOS.

- Does the report state that it is read-only and evidence-bound?
- Is `VERIFIED_ACTIVE` used only when simulation passed?
- Are all required adoption surfaces present?
- Are missing, blocked, pending, and N/A surfaces explicit?
- Does every `NOT_APPLICABLE_WITH_REASON` surface include a real reason?
- Are existing rules and baselines compared instead of ignored?
- Are release SOPs and production authority preserved as project-owned or external-owned?
- Are CI and hooks protected from unauthorized mutation?
- Are `ai-logs` prevented from becoming routine command logs?
- If writes occurred, are apply plan, approval record, and controlled readiness references present?
- Are evidence refs resolvable in strict mode?
- Does the report avoid claiming product correctness or production approval?
