# Evidence Authority Core

Evidence Authority Core protects against a subtle failure: a report can look
complete while citing an old file, another task's file, a changed file, or a
file that reaches outside the project through a symbolic link.

For strict evidence checks, IntentOS re-reads each used project-local file and
confirms all of these facts:

1. The path stays inside the project and does not use a symbolic link.
2. The project identity and recorded source revision still match.
3. The task reference and intent digest match the current report.
4. The raw file content still matches the recorded digest.

This runs behind the normal delivery flow. A user does not need to create an
authority binding by hand; supported resolvers create one when they write a
project-local report.

## Boundary

A valid authority binding does **not** mean the change is correct, approved,
released, or safe in production. It only makes the evidence reference
traceable and resistant to accidental reuse or path redirection.
