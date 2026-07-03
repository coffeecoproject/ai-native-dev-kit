# Native Migration Review Checklist

- Does the plan start with the Native-First Migration Planning mode statement?
- Does it state the recommended posture?
- Does it separate IntentOS workflow authority from target-file write authority?
- Does it preserve business and production constraints?
- Does every extracted rule include source file, excerpt, class, handling, target action, and reason?
- Does any `AGENTS.md` replacement include extracted-rule classification, replacement shape, and restore plan?
- Are exact target paths listed?
- Are broad paths such as `docs/**`, repository root, or all workflow files absent?
- Are CI, hooks, release, production, secrets, migrations, payment, permissions, data, provider, security, privacy, compliance, legal, tax, finance, HR, and customer surfaces protected?
- Does the plan route all writes through Unified Apply Plan, Controlled Apply Readiness, and Approval Record?
- Does it require human approval before governance replacement?
- Does it avoid approving implementation, release, production, or high-risk decisions?
