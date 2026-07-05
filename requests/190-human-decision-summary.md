---
schema_version: 1.0
artifact_type: request
number: 190
slug: human-decision-summary
title: Human Decision Summary
priority: P1
task_level: L1
status: done
created_at: 2026-06-28
---
# Request: 190-human-decision-summary

## Raw Request

Make IntentOS recommendations easier for non-technical users to judge after real project feedback showed that adoption and migration suggestions were correct but hard to decide on.

## User / Customer

IntentOS users who want Codex to handle project setup, adoption, baseline setup, migration reports, review loops, and delivery reports while humans only make choices and confirmations.

## Problem

Current outputs can be technically correct but still hard to judge. Users may see read-only adoption, adapter setup, migration reports, baseline gaps, or patch classification results without a clear recommended option, alternatives, file-write impact, risk, and no-decision outcome.

## Desired Outcome

Add a first-class Human Decision Summary layer across protocols, templates, prompts, and core scripts:

- one recommended option
- clear alternatives
- whether each option writes project files
- risk of each option
- what Codex may do safely
- what Codex must not do
- what happens if the human does nothing

## Constraints

- Do not make reports into approvals.
- Do not loosen governed-project read-only protection.
- Do not make baseline setup write directly.
- Do not require users to understand internal status codes before deciding.
- Do not bind docs to a private project name.

## Priority

P1

## Suggested Task Level

L1
