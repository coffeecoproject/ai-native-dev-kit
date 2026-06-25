# Web Runtime Baseline

## Purpose

Define minimum runtime, UI state, and browser behavior evidence for BL2 Web projects.

## Required Evidence

- critical routes or screens are listed
- loading, empty, error, forbidden, and success states are defined for critical flows
- desktop and mobile behavior is checked for critical flows
- API error handling behavior is defined and verified
- no visible layout overlap is accepted in critical flows
- skipped browser or responsive checks have a reason and residual risk owner

## Stop Conditions

Stop before implementation or release when:

- the task changes critical UI behavior without state evidence
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

