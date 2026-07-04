# 1.65.0 Known Limitations

- Classification remains deterministic and conservative. Ambiguous rules still
  require human review.
- Simple Markdown table extraction is intentionally narrow. Complex, high-risk,
  or multi-owner tables remain skipped or human-review bound.
- Chinese keyword calibration improves common project governance text, but it
  does not infer final business meaning or legal/compliance correctness.
- Proposed-action consistency checks verify recorded evidence alignment. They do
  not approve the actions.
- Real-project calibration evidence must remain sanitized and read-only.
