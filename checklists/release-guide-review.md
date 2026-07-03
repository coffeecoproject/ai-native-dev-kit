# Release Guide Review Checklist

- Release Guide is the user-facing release entry, not release authority.
- Structured release approval is required before execution/handoff readiness.
- Free-form "approved" text is not treated as release approval.
- Assist levels are explicit: local, preview, staging handoff, production handoff.
- Unknown commands default to `NO_RUN`.
- Provider API calls, uploads, preview publication, remote-state mutation, and CI/CD triggers are not local-safe.
- Production, stores, mini-program release, migrations, DNS, payment, permissions, secrets, and production config remain human/external-system-owned.
- Evidence quality checks require owner/path/scope details.
- Beginner-facing output avoids forcing users to choose internal commands.
