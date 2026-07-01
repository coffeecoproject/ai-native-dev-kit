# Execution Review Closure Checklist

- The report starts with a clear human decision summary.
- Closure state is one of the allowed states.
- Evidence Links are present and point to recorded sources where available.
- Cross-surface READY closures include a Change Impact Coverage Report when `--require-impact-coverage` is enabled.
- Changed files, verification evidence, scope boundary, and debt are all named.
- Changed files are not used as the only evidence for `FUNCTIONAL_REVIEW pass` or `CODE_REVIEW pass`.
- `READY_FOR_COMMIT_REVIEW` is used only when verification, review surface, review-loop/reviewer, change-boundary, and non-blocking debt evidence are present.
- Unverified items are explicitly named.
- Human decisions are limited and concrete.
- The report does not approve implementation, release, production, commit, push, high-risk decisions, or debt forgiveness.
- Boundaries are present and set to `No`.
