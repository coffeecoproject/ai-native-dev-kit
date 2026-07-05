# 1.71.1 Known Limitations

- Adoption assurance remains read-only. It can prove that required evidence is present and internally consistent, but it cannot prove product or business correctness.
- The read-only simulation validates IntentOS routing behavior, not real target feature implementation.
- `VERIFIED_ACTIVE` still does not authorize production deployment, CI mutation, hook installation, secret changes, data migration, or release ownership transfer.
- Source-system outputs are recorded as evidence inputs; humans or project owners remain responsible for protected project authority decisions.
- Placeholder-only apply-chain directories are now marked as `PRESENT_UNVERIFIED`, but project-specific apply evidence still needs a controlled apply plan, approval record, and readiness record before any write action.
