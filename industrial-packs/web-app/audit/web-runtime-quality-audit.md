# Web Runtime Quality Audit

## Purpose

Assess runtime quality for an existing or changed Web project without rewriting it.

This audit focuses on behavior evidence: UI states, forms, API failures, responsive behavior, accessibility, and performance impact.

## Audit Rules

- Start read-only.
- Identify critical routes, screens, forms, API-backed flows, and side-effecting actions.
- Map evidence to actual project files, commands, screenshots, traces, or manual records.
- Mark unavailable evidence as `missing`, `not_audited`, or `not_applicable`.
- Do not infer runtime quality from a successful build alone.
- Do not require a specific framework, hosting provider, browser test tool, or monitoring vendor.

## Required Sections

- Scope
- Critical flows reviewed
- UI state evidence
- Form and interaction evidence
- API failure evidence
- Responsive evidence
- Accessibility evidence
- Performance or asset impact evidence
- Findings
- Blockers
- Exceptions
- Residual risks
- Recommended next actions
