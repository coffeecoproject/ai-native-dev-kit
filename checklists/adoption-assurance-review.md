# Adoption Assurance Review

Use this checklist before Codex claims an existing project has adopted IntentOS.

- Does the report state that it is read-only and evidence-bound?
- Is `VERIFIED_ACTIVE` used only when simulation passed?
- Does `VERIFIED_ACTIVE` require every simulation step to be `PASSED`, exit with code `0`, stay read-only, avoid target writes, and include output digest evidence?
- Are upstream source systems recorded, and do `BLOCKED` / `NEEDS_INPUT` sources prevent full adoption claims?
- Are all required adoption surfaces present?
- Are missing, blocked, pending, and N/A surfaces explicit?
- Are placeholder-only assets marked `PRESENT_UNVERIFIED` instead of `VERIFIED`?
- Does every `NOT_APPLICABLE_WITH_REASON` surface include a real reason?
- Do the Markdown summary, surface table, simulation section, and machine-readable JSON match?
- Are existing rules and baselines compared instead of ignored?
- Are release SOPs and production authority preserved as project-owned or external-owned?
- Are CI and hooks protected from unauthorized mutation?
- Are `ai-logs` prevented from becoming routine command logs?
- If writes occurred, are apply plan, approval record, and controlled readiness references present?
- Are evidence refs resolvable in strict mode?
- Are target-installed assets distinguished from source-only examples, fixtures, release records, and calibration evidence?
- Does the report avoid claiming product correctness or production approval?
