# First Delivery Walkthrough

First Delivery Walkthrough is a simulated or recorded end-to-end delivery path from one human idea to a bounded delivery recommendation.

It is not a new approval gate. It is a productization layer that proves the existing workflow can be followed by a human who only provides judgment, choices, and confirmations.

## Purpose

Use this layer when the team needs to see how the kit behaves across a complete first slice:

```text
Human idea
-> project/adoption routing
-> baseline recommendation
-> request/spec/eval/task
-> implementation boundary
-> verification evidence
-> review loop when needed
-> conversation drift handling
-> launch readiness
-> final report
```

The output is an evidence path, not a production validation claim.

## Core Rule

Codex may simulate, record, and recommend a delivery path.

Humans still decide:

- project goal and first slice
- baseline level
- platform choice
- scope changes
- risk acceptance
- payment, privacy, security, compliance, migration, release, or production decisions

## Lightweight Path

For a low-risk new idea, use the smallest path first:

```text
start
-> baseline recommendation
-> request
-> spec
-> eval
-> task
-> verify
-> final report
-> launch readiness
```

Goal Cards, Subagent Run Plans, Review Packets, Review Loop Reports, Conversation Turn Classifications, and Scope Change Reports are optional unless risk, ambiguity, helper agents, independent review, or scope drift appears.

## When To Escalate

Escalate from the lightweight path when the walkthrough touches:

- authentication or permissions
- payment, tax, privacy, or security
- data migration or destructive operations
- production configuration, deployment, rollback, or monitoring
- platform-wide engineering decisions
- new dependencies
- BL2 or selected industrial packs
- scope change during active work
- release or customer promise

## Adoption Trial Report

An Adoption Trial Report records whether the flow worked in a simulated or real project trial.

It must distinguish:

- simulated walkthrough evidence
- generated-project smoke evidence
- real project read-only adoption evidence
- real implementation evidence
- production validation

Do not describe simulated walkthrough evidence as production validation.

## Subagent Use

Subagents may help as read-only planners or reviewers.

Rules:

- many readers, one writer
- the main thread owns writes, verification, and final reporting
- subagent output is input, not approval
- every helper agent must be closed or marked `CLOSED` / `SKIPPED` after handoff
- subagents cannot approve scope, release, risk, or production use

## Completion Boundary

A walkthrough is complete when it has:

- one clear human starting idea
- one recommended baseline path
- one first-slice request/spec/eval/task chain
- verification evidence or explicit not-applicable reasoning
- final report
- launch readiness classification
- recorded human decision points
- recorded drift handling if scope or risk changed during the conversation
- an Adoption Trial Report that states what was proven and what was not proven

## Forbidden Claims

Do not claim:

- production-ready
- release approved
- fully safe
- guaranteed compliant
- real-project validated
- security approved
- payment approved
- customer accepted

unless those approvals are separately recorded by the responsible human owner and supported by project evidence.
