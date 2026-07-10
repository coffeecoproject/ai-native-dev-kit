# IntentOS 1.94.0 Release Record

## Theme

Baseline, Manifest And Public Entry Consolidation.

## Human Summary

IntentOS can now turn a project goal into a concrete technical baseline without
asking a beginner to choose internal profile IDs, BL labels, or pack IDs. The
selected baseline is part of the exact controlled setup plan, and IntentOS can
check afterward that the selected profiles, packs, records, and managed version
were actually installed.

Existing projects keep stricter valid project rules. IntentOS compares first
and prepares only selected gap actions rather than performing a blanket
baseline replacement.

## Delivered

- canonical BL0/BL1/BL2 normalization, including correct `BL1_STANDARD`
  enforcement;
- central exclusion of managed `.intentos` assets from host-project signals;
- shared baseline selection resolution for profiles, standard packs, selected
  BL2 industrial packs, maturity, and generated project records;
- plan-bound project profile, baseline selection, and baseline evidence content;
- exact controlled installation support for explicitly selected industrial
  pack assets;
- baseline installation checker and CLI entry that require an exact valid
  plan/approval/readiness/Apply Receipt chain and current target hashes;
- retirement of direct `baseline-project --apply-plan` writes;
- strict real-schema manifest validation;
- obsolete manifest group removal and target-space duplicate, conflict, and
  redundant directory/child copy-rule normalization;
- negative manifest authority tests and generated-project asset preservation;
- corrected public source-only repository path;
- recommendation-first public wording that keeps technical selection in Codex.

## Allowed Claims

- IntentOS can bind a selected technical baseline to the exact controlled
  init/update action graph and verify installed state after apply.
- `BL1_STANDARD` is enforced as BL1 and BL2 fails closed without concrete
  selected industrial packs.
- The authoritative manifest is validated against its strict schema and no
  longer contains redundant ancestor/child copy expressions.
- Existing-project baselines remain comparison-first and preserve stricter
  valid project rules.

## Forbidden Claims

- Draft baseline or industrial packs are production-certified.
- Baseline installation proves business correctness, security, compliance,
  release readiness, or production safety.
- IntentOS may silently overwrite project authority or enable high-risk work.
- A recommendation or proposal-only baseline plan authorizes target writes.

## Known Limitations

- Current standard and industrial packs retain their recorded maturity; draft
  assets are guidance, not production certification.
- Installation verification proves selected managed assets and project records,
  not product correctness, compliance, security, or release readiness.
- Existing-project high-risk conflicts still stop for the responsible owner
  when project evidence cannot establish the safer valid rule.
- IntentOS does not perform runtime, CI, deployment, production, secret,
  migration, payment, permission, DNS, or external release actions through
  baseline setup.

## Evidence Status

- BL1 canonical classification: PASS
- Managed asset signal isolation: PASS
- BL2 missing-pack fail-closed path: PASS
- Legacy direct baseline apply zero-write path: PASS
- Controlled BL1 plan and installation verification: PASS
- Missing or stale baseline Apply Receipt rejection: PASS
- Strict manifest schema validation: PASS
- Duplicate/conflict/ancestor/target-space overlap negatives: PASS
- Generated-project asset preservation after manifest normalization: PASS
- Public source path and beginner-entry wording: PASS
- Full repository verification: PASS

## Verification

See [self-check-report.md](self-check-report.md) for command-level evidence and
[known-limitations.md](known-limitations.md) for the exact boundary.
