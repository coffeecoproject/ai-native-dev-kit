# Release 1.91.1 Known Limitations

- Apply Plan is not yet the sole replayable execution graph; Apply Receipt and
  post-apply target proof remain future work.
- Release approval, release-candidate identity, runtime hygiene, and release
  channel consumer binding remain separate release-trust work.
- Manifest schema alignment, duplicate directory/file copy coverage, baseline
  installation, and public source-only repository links remain outside this
  patch.
- Strict evidence proves required records exist and pass their checker. It does
  not by itself prove product behavior is correct in a real environment.
