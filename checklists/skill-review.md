# Skill Review Checklist

Use this checklist before generating, updating, or enabling any active Skill from `skill-candidates/`.

## Evidence

- [ ] Candidate references AI task logs, retros, improvements, intentos proposals, or explicit user request
- [ ] Pattern is repeated or high-impact enough to justify a Skill
- [ ] Candidate explains why existing docs, prompts, templates, checklists, scripts, or profiles are insufficient
- [ ] Candidate is not based only on one temporary workaround

## Layer Fit

- [ ] Candidate type is explicit: Project-specific / Profile-specific / Shared workflow
- [ ] Candidate is placed at the narrowest valid layer
- [ ] Project-only behavior is not promoted to a shared Skill
- [ ] Platform-specific behavior is not promoted to core workflow
- [ ] Business-domain behavior is not promoted to generic workflow

## Skill Shape

- [ ] Name is clear and stable
- [ ] Trigger conditions are explicit
- [ ] Non-trigger conditions are explicit
- [ ] Inputs and outputs are explicit
- [ ] Required references are listed
- [ ] Workflow steps are bounded
- [ ] Stop conditions are explicit
- [ ] Output format is specified
- [ ] Validation method is specified

## Safety

- [ ] No secrets, credentials, tokens, or private keys
- [ ] No production account details
- [ ] No private customer data
- [ ] No hidden dependency on local machine state
- [ ] Does not weaken preflight, spec, eval, verification, review, release, or human approval gates
- [ ] Preserves strict technical evidence, review, rollback, and exact
  real-world-consent boundaries for L3/high-risk work
- [ ] Keeps business truth and real-world consent with the user while Codex owns
  architecture, security treatment, release readiness, and technical risk

## Generation / Enablement

- [ ] Candidate is reviewed before any active Skill file is created or modified
- [ ] Active Skill path is identified
- [ ] Manual enablement is recorded
- [ ] Review cadence or owner is recorded
- [ ] Rollback or disable plan is known

## Decision

Choose one:

- [ ] `APPROVE_DRAFT`
- [ ] `REQUEST_CHANGES`
- [ ] `KEEP_AS_CANDIDATE`
- [ ] `MOVE_TO_TEMPLATE_OR_CHECKLIST`
- [ ] `PROJECT_ONLY`
- [ ] `REJECT`

## Reject If

- candidate contains secrets or private data
- candidate weakens an existing gate
- candidate has no clear trigger or non-trigger conditions
- candidate encodes a one-project preference as a shared rule
- candidate requires high-risk actions without explicit human approval
- candidate would be used automatically before manual enablement
