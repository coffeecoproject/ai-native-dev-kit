# Known Limitations: 1.31.0

- Intent-aware guide is read-only and does not write target files.
- Intent classification is heuristic and must not be treated as legal, security, payment, tax, privacy, release, or production approval.
- `--intent` improves routing, but detailed downstream evidence is still required before implementation or release claims.
- Only downstream resolvers that support intent receive the raw intent.
- Intent-aware guide does not execute plans, change task state, archive documents, install hooks, modify CI, approve implementation, approve release, or approve production.
