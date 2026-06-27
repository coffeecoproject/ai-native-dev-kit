# 1.7 First Delivery Walkthrough Example

This example simulates a first delivery path for a low-risk booking mini app idea.

The simulated human starts with:

```text
I want to build a booking mini app for customers to reserve services.
```

The walkthrough proves the workflow path, not production readiness.

## Path

```text
Human idea
-> BL0 first baseline recommendation
-> request/spec/eval/task
-> verification evidence
-> review loop note
-> payment scope-change stop
-> launch readiness
-> final report
-> adoption trial report
```

## Checks

```bash
node scripts/check-first-delivery-walkthrough.mjs examples/1.7-first-delivery-walkthrough
node scripts/check-launch-readiness.mjs examples/1.7-first-delivery-walkthrough
node scripts/check-conversation-drift.mjs examples/1.7-first-delivery-walkthrough
```

## Boundary

This is a simulated walkthrough. It does not approve production launch, payment integration, privacy acceptance, security acceptance, or customer release.
