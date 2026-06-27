# Environment Baseline Review Checklist

Use this checklist when drafting or reviewing `docs/environment-baseline.md`.

- [ ] Unknown environment facts are marked `PENDING_CONFIRMATION`, not invented.
- [ ] Truly irrelevant items are marked `NOT_APPLICABLE`.
- [ ] Confirmed items cite project evidence or human decision.
- [ ] Variable names may be listed, but secret values are absent.
- [ ] The file includes: `Secret values must never be written into this file.`
- [ ] CI/CD modification is `No` or `Human approval required`.
- [ ] Release, rollback, logs, monitoring, and alerts are factual or pending.
- [ ] Production-sensitive items require human owner and approval.
- [ ] Codex cannot edit `.env`, secrets, CI/CD, deploy, or production config through baseline setup.
- [ ] BL2 claims include evidence and explicit approval.
