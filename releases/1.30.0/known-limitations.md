# Known Limitations: 1.30.0

- Deep Guide Orchestration is read-only and does not write target files.
- `guide --deep` selectively calls existing local resolvers; it does not prove real production readiness.
- Resolver output is compressed into one guidance card, so detailed downstream reports should still be run directly when exact evidence is needed.
- Failed downstream resolver reads are reported as guidance failures; they are not auto-fixed.
- Deep guide does not apply archive plans, change task state, install hooks, modify CI, approve implementation, approve release, or approve production.
