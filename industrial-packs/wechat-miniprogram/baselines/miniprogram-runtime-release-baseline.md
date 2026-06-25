# Mini Program Runtime And Release Baseline

## Required Coverage

- runtime assumptions and platform capability usage are documented
- critical flows are verified in available development and review-like environments
- permission prompts, denied states, and privacy-sensitive data paths are covered
- cloud functions, APIs, and storage boundaries are documented when present
- release submission, rollback, and monitoring evidence exists

## Release Expectations

- production configuration is reviewed by a human
- release scope, rollback plan, and monitoring path are documented
- exceptions and residual risks are accepted before release

## AI Boundary

AI may prepare evidence and checks, but must not approve release submission, platform permission acceptance, or residual risk.
