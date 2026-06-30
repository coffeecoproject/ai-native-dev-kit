# Known Limitations: 1.40.1

- Approval Records are still Markdown-first evidence.
- Plan hash presence is checked, but the checker does not yet recompute the digest from a machine-readable apply plan.
- Human identity is still evidence-based; there is no cryptographic or account-backed approval verification.
- Symlink handling is policy-level and text-level in this release. A later apply runner must still verify filesystem reality before writing.
- There is still no controlled apply runner.
- There is still no automatic apply.
- The CLI command surface remains broad for maintainers; this release only clarifies user entry versus maintainer evidence.
