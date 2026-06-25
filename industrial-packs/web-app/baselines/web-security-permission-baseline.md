# Web Security And Permission Baseline

## Purpose

Define minimum security and permission evidence for BL2 Web projects.

## Required Evidence

- protected resources have server-side permission enforcement
- forbidden and rejection paths are tested or manually verified
- tenant, workspace, account, project, or resource scope boundaries are documented when they exist
- client-side code does not hold production secrets
- production config, cookies, sessions, CORS, CSRF, XSS-relevant behavior, and security headers are reviewed when touched
- auth, permission, secrets, and production config changes have human approval

## Stop Conditions

Stop before implementation or release when:

- permission logic is only enforced in UI
- protected resource scope is unclear
- production secrets or credentials are needed
- auth/session/cookie policy changes lack approval
- security headers, CORS, or CSRF-sensitive behavior are changed without verification

## Evidence Locations

Use project-specific files such as:

- `docs/permission-model.md`
- `docs/risk-policy.md`
- `docs/baseline-evidence.md`
- `evals/`
- permission tests or rejection path notes

