# Native Migration Review Checklist

- Does the plan start with the Native-First Migration Planning mode statement?
- Does it state the recommended posture?
- Does it separate IntentOS workflow authority from target-file write authority?
- Does it preserve business and production constraints?
- Does every extracted rule include source file, line range, context heading, excerpt, class, handling, target action, reason, and confidence?
- Does the plan include Rule Extraction Coverage with lines scanned, rules extracted, unclassified blocks, and parser warnings?
- If unclassified blocks exist, are parser warnings visible to the human reviewer?
- If the plan may drive real governance replacement, does it pass `check-native-migration --require-structured-evidence`?
- Does the Machine-Readable Evidence JSON match the Human Summary?
- Does the coverage extracted-rule count match the structured rule classifications?
- Does any `AGENTS.md` replacement include extracted-rule classification, replacement shape, and restore plan?
- Are exact target paths listed?
- Are broad paths such as `docs/**`, repository root, or all workflow files absent?
- Are CI, hooks, release, production, secrets, migrations, payment, permissions, data, provider, security, privacy, compliance, legal, tax, finance, HR, and customer surfaces protected?
- Does the plan route all writes through Unified Apply Plan, Controlled Apply Readiness, and Approval Record?
- Does it require human approval before governance replacement?
- Does it avoid approving implementation, release, production, or high-risk decisions?
