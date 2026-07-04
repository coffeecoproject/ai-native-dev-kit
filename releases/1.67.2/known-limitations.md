# 1.67.2 Known Limitations

- Release Plan remains a pure view model. It does not approve release, execute provider commands, mutate CI/hooks, or write target-project files.
- Chinese forbidden-claim detection catches known unsafe phrasing, but cannot prove all possible Chinese or mixed-language overclaims are covered.
- `additionalProperties: false` rejects unsupported structured evidence fields. Project-specific details should live in project-owned evidence, not inside the Release Plan evidence schema.
- Artifact payloads still use `schema_version: "1.67.0"` for 1.67 Release Plan evidence compatibility.
- Private governed-project smoke checks remain optional local calibration, not public required verification.
