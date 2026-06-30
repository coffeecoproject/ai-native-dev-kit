# Known Limitations: 1.41.1

- `--require-structured-evidence` is opt-in; default mode remains compatible with historical Markdown artifacts.
- The schema validator is a lightweight IntentOS evidence validator, not a full JSON Schema engine.
- Schema files alone are not the complete safety boundary; run the corresponding IntentOS checker.
- Strict readiness and approval checks require local apply-plan references. External evidence bundles are not modeled yet.
- Real human identity is not cryptographically validated.
- Controlled apply execution remains out of scope.
