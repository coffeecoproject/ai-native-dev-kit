# Evidence Authority Core

Evidence Authority Core is the shared integrity layer for file-backed workflow
evidence. It answers a narrow question: can this local evidence file be used
for this project and this task at this point in source history?

It verifies a project identity, source revision, task reference, intent digest,
and raw digest of every consumed local source file. It rejects traversal,
absolute paths, and symlink paths before a strict consumer can use the file.

It is not an approval, execution, release, or product-correctness system.
Passing authority validation means only that the recorded evidence identity is
internally consistent and project-local.

## Strict Consumers

`--require-evidence-authority` is supported by:

- Verification Plan;
- Test Evidence;
- Execution Assurance;
- Completion Evidence.

Historical records remain readable. New strict ready/done claims need a valid
`authority_binding` and must revalidate every file-backed recorded source.
