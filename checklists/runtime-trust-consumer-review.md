# Runtime Trust Consumer Review

- [ ] The authoritative Verification Run Manifest checker passes with `--require-complete`.
- [ ] The manifest is project-local, non-symlinked, current, and schema `1.103.0`.
- [ ] Project identity and source revision match the current project.
- [ ] Task ref and intent digest match every strict consumer.
- [ ] Verification Plan ref and digest match when present.
- [ ] Runtime Plan and Lifecycle Plan refs and digests are preserved unchanged.
- [ ] Test Evidence uses only passing outputs recorded by the same run for covered obligations.
- [ ] Test Evidence output refs and digests match the manifest.
- [ ] Execution Assurance independently validates the same run.
- [ ] Completion Evidence directly validates the run and checks upstream agreement.
- [ ] Public `finish` treats Runtime Trust as required for `DONE`.
- [ ] Historical schemas remain readable but cannot satisfy strict Runtime Trust.
- [ ] `--allow-empty` cannot bypass `--require-runtime-trust`.
- [ ] Runtime Trust cannot override review, impact, business-rule, external-effect, or release blockers.
- [ ] The user is not asked to choose technical runtime or evidence details.
- [ ] No completion result is described as release or production authorization.
