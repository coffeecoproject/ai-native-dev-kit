# Core Purity Review Checklist

Use this checklist for changes to:

- `core/`
- `templates/`
- `prompts/`
- generic starter
- default examples
- scripts that enforce default behavior

## Universal Scope

- [ ] Rule applies across target platforms
- [ ] Rule applies across business domains
- [ ] Rule applies across AI tools
- [ ] Rule does not require a concrete stack

## No Business Binding

- [ ] No specific industry terms
- [ ] No concrete domain model
- [ ] No business workflow assumption
- [ ] No customer-specific or company-specific fact

## No Platform Binding

- [ ] No iOS-only rule in core
- [ ] No Android-only rule in core
- [ ] No Web-only rule in core
- [ ] No Backend-only rule in core

## Gate Integrity

- [ ] Does not weaken preflight gate
- [ ] Does not weaken scope gate
- [ ] Does not weaken risk gate
- [ ] Does not weaken verification gate
- [ ] Does not weaken release gate
- [ ] Preserves human approval for high-risk changes

## Decision

APPROVE / REQUEST_CHANGES / BLOCK

