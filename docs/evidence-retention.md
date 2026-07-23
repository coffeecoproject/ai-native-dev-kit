# Evidence Retention And Deduplication

IntentOS keeps evidence for trust, not as an unlimited transcript archive.

The authoritative policy is `.intentos/evidence-retention-policy.json`. It applies to task number 118 and later. Evidence from earlier released tasks remains immutable historical evidence even when it exceeds current budgets.

## What Is Retained

- structured governance and closure reports;
- one final durable Runtime Trust archive per task;
- the final run manifest, lifecycle journal, cleanup proof, command identity, exit code, output digest, and required observed output;
- concise task-specific raw evidence that is not already retained by the final runtime.

## What Is Not Retained At Completion

- failed or superseded runtime archives;
- stale-run, debug, review-index, temporary patch, or diagnostic logs;
- standalone `*-full-verification.log` files that duplicate the final runtime verification action;
- two raw evidence files with the same content digest for one task.

## Budgets

Budgets are checked before completion. They never authorize truncation.

- standalone raw evidence: 256 KiB per file;
- durable runtime output: 512 KiB per file;
- all raw evidence for one task: 1 MiB;
- structured authority report: 256 KiB per file.

If observed output exceeds a budget, change the command to produce a trustworthy concise result, split independently meaningful evidence, or review the policy. Do not cut a log after execution and claim it is the original output.

## Cleanup Order

1. Identify the final complete run manifest.
2. Verify its task, intent, source, lifecycle, output digests, and cleanup proof.
3. Verify downstream Test Evidence and completion consumers bind that run.
4. List exact superseded run and temporary paths.
5. Remove only those reviewed paths.
6. Run `node scripts/check-evidence-retention.mjs . --strict` and the final Consumer Chain.

The checker is read-only. It reports violations and exits non-zero; it never deletes, archives, uploads, or rewrites evidence.
