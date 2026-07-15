# Baseline Enforcement Review Checklist

Use this checklist when checking whether a task actually used project baselines.

- [ ] Task card declares Engineering Baseline touched: Yes / No.
- [ ] Task card declares Environment Baseline touched: Yes / No.
- [ ] Baseline refs cite `docs/engineering-baseline.md` or `docs/environment-baseline.md` when touched.
- [ ] Baseline decisions introduced are derived by Codex, recorded in a
  Decision Brief when needed, and not exposed as raw user choices.
- [ ] Review Packet includes environment baseline fields.
- [ ] Review Loop includes engineering and environment baseline follow-checks.
- [ ] BL0 gaps are advisory unless the task touches high-risk areas.
- [ ] BL1 implementation gaps fail for obvious baseline-sensitive areas.
- [ ] BL2 gaps fail unless an explicit exception and evidence are recorded.
- [ ] No source-code deep scanning is claimed by artifact-level enforcement.
