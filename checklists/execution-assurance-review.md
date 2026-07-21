# Execution Assurance Review Checklist

- [ ] Report is read-only and derived.
- [ ] Source systems remain authoritative.
- [ ] Intent Lock is task-bound and does not authorize writes.
- [ ] Completion Contract defines specific criteria.
- [ ] Planned Impact Map includes expected affected surfaces.
- [ ] Actual Diff Binding lists changed and unexpected files.
- [ ] Pre-Write Revalidation replays the exact Planning Closure source revision, candidate base, and path-set digests.
- [ ] Evidence Binding maps every done criterion to evidence.
- [ ] Independent Review Binding exists for verified completion.
- [ ] Patch Assessment does not hide a deeper issue.
- [ ] `VERIFIED_DONE` is not used when pre-write revalidation, evidence, review, diff, or patch checks are incomplete.
- [ ] Forbidden claims are absent.
