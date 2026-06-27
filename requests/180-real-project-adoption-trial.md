---
schema_version: 1.0
artifact_type: request
number: 180
slug: real-project-adoption-trial
title: Real Project Read-only Adoption Trial
priority: P1
task_level: L2
status: done
created_at: 2026-06-27
---
# Request: 180-real-project-adoption-trial

## Raw Request

Run the next dev-kit upgrade after a governed production-sensitive Web project was inspected in read-only mode. Convert the finding into a reusable 1.8 capability without naming or modifying the target project.

## User / Customer

AI Native Dev Kit users who want Codex to inspect an existing project, decide whether it can be initialized, and route safely without requiring the user to understand every workflow file.

## Problem

The dev kit can already guide new projects and simulated first deliveries. Real governed projects expose a different need: Codex must recognize existing governance, avoid template overwrite, map concepts to local assets, and classify whether a requested fix is safe-local work, structural remediation, or a human decision.

## Current Workflow

Codex can run `start`, `baseline`, and `next`, but users still need to interpret why a production-sensitive governed project should remain read-only and how to avoid patch-style fixes that make risk worse.

## Desired Outcome

Add a 1.8 Real Project Read-only Adoption Trial and Patch Classification Governance layer:

- record read-only adoption trials without target writes
- map existing governance assets instead of replacing them
- classify patch-like changes before implementation
- require evidence before claims
- keep public examples sanitized

## Constraints

- Do not modify the inspected real project.
- Do not publish private project names, paths, secrets, or internal business data.
- Do not claim production validation, release approval, compliance approval, or security approval.
- Do not make the dev kit a parallel governance system for already governed projects.
- Do not treat patch classification as authorization to implement.

## Priority

P1

## Suggested Task Level

L2

## Deadline

No external deadline. Complete the 1.8 capability, evidence, and self-checks in this task.

## Notes

This request is based on a read-only trial against a governed production-sensitive Web project. Public repository artifacts must describe it only as a sanitized trial category.
