# Release 1.69.2 Known Limitations

- Existing Rule Reconciliation remains recommendation-only. It does not write
  target-project files or authorize governance replacement.
- `evidence_profile: existing-rule-reconciliation-1.69.2` is required in strict
  reconciliation evidence. Older Markdown-style reports remain readable by
  default, but should be regenerated before strict adoption review.
- Source reference coverage proves that each reconciliation item has a recorded
  source reference. It does not prove the business correctness of the source
  rule itself.
- `doctor --dry-run` may run a read-only workflow routing preview for old
  projects. It still does not write target-project files.
- GitHub Release publication is outside repository self-check and must be
  handled through the external GitHub release process.
