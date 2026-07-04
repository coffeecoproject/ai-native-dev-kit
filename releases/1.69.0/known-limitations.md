# 1.69.0 Known Limitations

- `reconcile-rules --auto-native` is read-only. It does not write a Native Migration Plan to the target project.
- The AI Native Adoption Recommendation is recommendation-only. It does not authorize apply, commit, release, or production work.
- Dirty worktrees remain blocked. Codex can explain the block but cannot decide ownership of existing changes by itself.
- `doctor` still allows advanced maintainers to run lower-level missing-asset checks explicitly through `check`.
- 1.69.0 does not add an installer, hosted dashboard, npm publication, automatic apply runner, or GitHub Release automation.
