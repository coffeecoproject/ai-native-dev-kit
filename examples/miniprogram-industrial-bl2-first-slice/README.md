# Example: Mini Program Industrial BL2 First Slice

This example shows how a WeChat Mini Program BL2 slice connects project baseline selection, baseline evidence, task gating, runtime evidence, release readiness, and AI task logging.

It is not a product template and does not bind the project to a mini program framework, cloud provider, or admin backend.

This example intentionally exercises many Mini Program evidence categories. A real task should require only the evidence subset triggered by its Risk Gate, selected packs, and release scope.

Flow:

```text
baseline selection
  -> baseline evidence
  -> request
  -> preflight
  -> spec
  -> eval
  -> task
  -> runtime evidence
  -> release record
  -> AI task log
```

Files:

- `docs/baseline-selection.md`
- `docs/baseline-evidence.md`
- `requests/001-miniprogram-login-cloud-read.md`
- `preflight/001-miniprogram-login-cloud-read.md`
- `specs/001-miniprogram-login-cloud-read.md`
- `evals/001-miniprogram-login-cloud-read.md`
- `tasks/001-miniprogram-login-cloud-read.md`
- `evidence/miniprogram-runtime-evidence.md`
- `releases/001-miniprogram-login-cloud-read-release.md`
- `ai-logs/2026-06-26-miniprogram-login-cloud-read.md`

If the real project also has an admin backend, select `internal-admin-industrial` and either `backend-api-industrial` or `cloudbase-industrial` separately. Do not treat the mini program pack as covering the backend by itself.
