# Release Record: 1.36.0

## Summary

`1.36.0` adds Repository Information Architecture Governance.

This release makes IntentOS easier to understand from the repository itself. README becomes the product entry page, `docs/` gets clear entry points, historical implementation plans move to `docs/plans/`, and roadmap documents move to `docs/roadmaps/`.

## Added

- `docs/README.md`
- `docs/index.md`
- `docs/repository-structure.md`
- `docs/document-ownership.md`
- `docs/plans/README.md`
- `docs/plans/repository-information-architecture-1.36-plan.md`
- `docs/roadmaps/README.md`

## Changed

- `README.md` and `README.zh-CN.md` now present IntentOS as the product name and keep the homepage focused on positioning, starting paths, common commands, safety boundaries, and documentation entry points.
- Historical `docs/*-1.*-plan.md` files now live under `docs/plans/`.
- Roadmap documents now live under `docs/roadmaps/`.
- `intentos-manifest.json`, version metadata, and self-check paths are aligned with the new documentation structure.

## Boundary

This release does not:

- move root workflow artifact directories;
- change generated-project artifact paths;
- change CLI behavior;
- change adoption, baseline, review, hook, archive, or apply semantics;
- delete historical plans;
- archive release evidence;
- change license terms.

## Allowed Claims

- IntentOS now has a clearer repository documentation structure.
- README is the product entry page.
- `docs/README.md` and `docs/index.md` are the documentation entry points.
- Historical plans and roadmaps are separated from active usage docs.

## Forbidden Claims

- Do not claim 1.36 changes runtime workflow behavior.
- Do not claim root workflow artifact directories were reorganized.
- Do not claim historical docs were deleted.
- Do not claim generated-project paths changed.

## Known Limitations

- Root workflow artifact directories remain flat for compatibility.
- This release improves documentation structure, but it does not split the repository into separate product, docs, and asset packages.
- Historical plans are moved into `docs/plans/`, not rewritten as current rules.
- Roadmaps are moved into `docs/roadmaps/`, but release records remain the source of release evidence.

## Evidence Status

Release evidence passed. See `releases/1.36.0/self-check-report.md`.

## Verification

See `releases/1.36.0/self-check-report.md`.
