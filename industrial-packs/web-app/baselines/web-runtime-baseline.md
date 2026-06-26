# Web Runtime Baseline

## Purpose

Define minimum runtime, UI state, and browser behavior evidence for BL2 Web projects.

## Required Evidence

- critical routes or screens are listed
- loading, empty, error, forbidden, and success states are defined for critical flows
- desktop and mobile behavior is checked for critical flows
- API error handling behavior is defined and verified
- form, user action, and duplicate-submit behavior is defined when side effects exist
- keyboard, focus, accessible name, and status-message behavior is reviewed for critical interactions
- bundle, asset, loading, and interaction responsiveness impact is reviewed when performance-sensitive code changes
- no visible layout overlap is accepted in critical flows
- skipped browser or responsive checks have a reason and residual risk owner

## Stop Conditions

Stop before implementation or release when:

- the task changes critical UI behavior without state evidence
- the task changes forms or side-effecting actions without interaction evidence
- the task changes API failure behavior without recovery evidence
- accessibility-critical behavior is changed without keyboard or focus evidence
- performance-sensitive code, assets, or dependencies are changed without impact evidence
- browser-only permission checks protect sensitive behavior
- responsive behavior is unknown for a critical flow
- runtime errors are observed and not explained

## Evidence Locations

Use project-specific files such as:

- `docs/baseline-evidence.md`
- `evals/`
- `tasks/`
- `releases/`
- screenshots or browser behavior notes referenced from evidence records
