# Subagent Orchestration Review Checklist

Use this checklist when reviewing a Subagent Run Plan or any multi-agent execution record.

## Run Plan

- [ ] A Subagent Run Plan exists for non-trivial helper-agent usage.
- [ ] The orchestration mode is one of `READ_ONLY_RESEARCH`, `PLAN_THEN_BUILD`, `REVIEW_LOOP`, `AUTO_FIX_REPAIR`, or `REPORTING`.
- [ ] The run plan explains why subagents are useful.
- [ ] The run plan does not replace Goal Mode, task cards, Review Loop, or Human Approval.

## Role Authority

- [ ] Planner, baseline, reviewer, and reporter roles are read-only unless explicitly limited to workflow artifact drafts.
- [ ] Builder is the default writer for one approved task.
- [ ] Repair is limited to `AUTO_FIX` findings and maximum 2 rounds.
- [ ] No reviewer edits files.
- [ ] No reporter approves continuation.

## Writer Control

- [ ] Many readers, one writer is recorded.
- [ ] At most one active writer exists.
- [ ] Writer scope is explicit.
- [ ] Any disjoint write ownership is human-approved, path-scoped, and time-limited.
- [ ] Subagents do not write business code unless their role and scope allow it.

## Lifecycle Closure

- [ ] Every launched subagent is `CLOSED` or `SKIPPED` before the final task response.
- [ ] No subagent remains `RUNNING` after handoff.
- [ ] No subagent is left open as standby for future work.
- [ ] Closure evidence is recorded.
- [ ] The final response says which subagents ran and that they were closed or skipped.

## Handoff

- [ ] Subagent outputs are routed to Review Loop, Decision Brief, Follow-up Proposal, Final Report, Human Decisions Needed, or no action.
- [ ] Main thread reads and filters subagent output before applying it.
- [ ] Subagent output is not treated as approval.
- [ ] Human decisions remain human-owned.

## Forbidden Automation

- [ ] The run plan does not create active Skills.
- [ ] The run plan does not create automations or schedules.
- [ ] The run plan does not create persistent monitors.
- [ ] The run plan does not call external GPT/API reviewer automation.
