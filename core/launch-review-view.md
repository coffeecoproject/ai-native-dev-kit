# Launch Review View

Launch Review View answers one user question:

```text
Can this work enter launch review?
```

It is not a new launch decision system. It is a read-only view built on top of:

- Unified Closure Decision
- Safe Launch readiness labels
- project-owned release, rollback, and operating rules

## Dependency Rule

The dependency direction is:

```text
Unified Closure Decision
  -> Safe Launch readiness label
  -> Launch Review View
  -> Current-user consent to the concrete external effect
  -> Controlled execution under the project release protocol
```

Launch Review View must not override Unified Closure.

If Unified Closure is not `DONE`, Launch Review View cannot report `READY_FOR_RELEASE_REVIEW`.

## What It Does

Launch Review View translates close-out evidence into a release-review perspective:

- what version or task is being considered
- whether Unified Closure is done
- which Safe Launch label applies
- which launch surfaces are still missing
- which concrete real-world effect, if any, needs current-user consent
- what evidence is available
- what the next safe step is

## Reused Readiness Labels

Launch Review View reuses Safe Launch labels:

| Label | Meaning In Launch Review View |
|---|---|
| `NOT_READY` | Closure is not done, evidence is missing, or launch gaps block review. |
| `READY_FOR_DEMO` | A controlled demo may be acceptable, but launch review is not ready. |
| `READY_FOR_INTERNAL_HANDOFF` | Internal evidence preparation may proceed with known launch gaps. |
| `READY_FOR_RELEASE_REVIEW` | Evidence appears sufficient to present one concrete release effect for current-user consent. This is not consent. |
| `BLOCKED` | A missing business/external fact, platform blocker, production risk, or evidence gap blocks progress. |

Do not add separate launch states for this view.

## Launch Surfaces

The view should annotate these surfaces when relevant:

| Surface | Question |
|---|---|
| Product scope | What version is being considered? |
| Platform | Web, Mini Program, iOS, Android, backend, internal admin, or mixed? |
| Environment | Is runtime and environment evidence visible? |
| Data | Are migration, backup, retention, and privacy concerns visible? |
| Identity/permission | Are roles, login, admin access, and sensitive actions visible? |
| Payment/value transfer | Are payment, refund, wallet, invoice, finance, or tax concerns visible? |
| Verification | Is local, staging, platform, or smoke evidence available? |
| Monitoring | Can failures be observed and acted on? |
| Rollback | Is rollback, fallback, or feature-disable path identified? |
| Release consent | Is the concrete external effect ready for current-user consent, with an executable rollback path? |
| Post-launch | Is post-launch smoke or observation defined? |
| Communication | Are release notes, support, or handoff notes needed? |

## Platform Hints

Platform hints are annotations. They are not platform release approvals.

- Web: check deploy target, env ownership, domain/cert owner, monitoring, rollback, smoke route.
- WeChat Mini Program: check appid ownership, backend/cloud dependency, privacy scope, submission checklist, fallback.
- iOS / Android: check build/archive evidence, signing owner, store metadata boundary, privacy declarations, crash visibility, hotfix/rollback policy.
- Backend/API: check runtime target, env config, migration plan, API smoke, observability, rollback, backup.
- Internal Admin: check role boundary, audit-sensitive actions, destructive-operation guard, handoff owner.

## Boundary

Launch Review View does not:

- write target files
- deploy, publish, submit, or release
- approve release or production
- modify CI/CD or hooks
- change DNS, certificates, secrets, environment variables, app-store metadata, payment settings, permissions, migrations, or production data
- replace Unified Closure
- replace Safe Launch
- replace project-owned release SOPs
- approve security, privacy, compliance, legal, tax, finance, payment, or regulated launch decisions
