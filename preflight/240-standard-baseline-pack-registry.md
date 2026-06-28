# Preflight: 240-standard-baseline-pack-registry

## Source Request

`requests/240-standard-baseline-pack-registry.md`

## Clarity

READY

## Suggested Task Level

L2

## Risk

- Manifest, generated-project assets, CLI, CI, and self-check all need sync.
- `baseline-packs` must stay backward compatible while becoming an umbrella read-only entry.
- Standard pack selection must not imply implementation or release approval.

## Decision

Proceed with additive implementation only.
