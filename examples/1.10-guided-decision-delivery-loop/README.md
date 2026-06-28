# 1.10 Guided Decision & Delivery Loop Example

## Human Summary

This example shows how Codex should guide a non-expert user from a broad appointment-app idea to one safe first slice.

## Starting User Message

```text
I want to build an appointment mini app. It may need payment and SMS later.
```

## Recommended First Slice

Codex should recommend:

```text
First demo slice: service list, appointment submission, and appointment records.
```

Out of scope for the first slice:

- payment
- SMS
- production release
- complex permissions
- configurable workflow status

## Why

The user can confirm a product direction without needing to decide enum, lookup table, state machine, BL2, or payment architecture.

## Artifacts

- `active-work-threads/001-appointment-first-slice.md`
- `guided-decision-summaries/001-status-model.md`
- `conversation-turns/001-payment-mention.md`

## Claim Boundary

This example is simulated. It does not prove production readiness or real-project validation.
