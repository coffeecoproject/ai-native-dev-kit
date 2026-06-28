# Known Limitations: 1.10.0

## Human Summary

1.10.0 improves guidance and decision routing, but it does not prove real-project delivery outcomes by itself.

## Limitations

- No standalone blocking checker is added for Guided Decision & Delivery Loop.
- Active Work Thread and Guided Decision Summary are optional artifacts.
- The upgrade relies on existing checks for drift, review loop, next-step boundary, launch readiness, and manifest completeness.
- No automatic real-project scanner is included.
- No automatic GPT/API review hook is included.
- No production, release, security, privacy, compliance, payment, migration, or risk approval is included.
- More real or simulated broad-user trials are still needed to calibrate wording and artifact weight.

## Recommended Follow-up

- Run one simulated broad-user walkthrough after 1.10.
- Run one read-only real-project trial when the user approves.
- Observe whether Active Work Thread is helpful or too heavy.
- Observe whether Guided Decision Summary reduces user confusion without over-directing product direction.
