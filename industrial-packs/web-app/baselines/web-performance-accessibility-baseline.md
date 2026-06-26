# Web Performance And Accessibility Baseline

## Purpose

Define minimum performance and accessibility evidence for BL2 Web projects without binding the project to a specific framework, test tool, host, or monitoring vendor.

## Required Evidence

- critical flows have a defined desktop and mobile experience target
- UI changes do not introduce visible layout overlap, unstable layout, or blocked primary actions
- keyboard navigation, focus order, visible focus, and accessible names are reviewed for interactive controls
- color contrast, status messaging, and non-mouse interaction are reviewed for critical user flows
- bundle, asset, image, font, or script impact is reviewed when changes affect page weight or loading behavior
- loading behavior, long task risk, and interaction responsiveness are reviewed when critical screens or heavy components change
- skipped performance or accessibility checks have a reason and residual risk owner

## Stop Conditions

Stop before implementation or release when:

- critical controls cannot be reached or understood without a mouse
- focus state, accessible name, or error announcement behavior is missing for a critical interaction
- mobile or desktop layout blocks a primary action
- a heavy dependency, asset, or client-side script is added without impact review
- performance-sensitive changes have no measurement, comparison, or explicit rationale

## Evidence Locations

Use project-specific files such as:

- `docs/baseline-evidence.md`
- `evals/`
- `tasks/`
- `releases/`
- screenshots, accessibility notes, browser traces, bundle output, performance reports, or manual verification records referenced from evidence records
