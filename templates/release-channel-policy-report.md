# Release Channel Policy Report

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | `<plain summary>` |
| Project type | `<new_project/existing_project/unknown>` |
| Effective release channel | `<channel>` |
| Recommendation | `<recommendation>` |
| Blocked | `<Yes/No>` |
| Blocks release review | `<Yes/No>` |
| Release approved | No |
| Production approved | No |

## Source Identity

| Field | Value |
| --- | --- |
| Source ref | `<git/tag/source ref>` |
| Source ref role | `<identity_only/release_trigger/unknown>` |
| Git allowed | Yes |
| Tag allowed as identity | Yes |
| Tag triggers release workflow | `<Yes/No/Unknown>` |
| Tag trigger workflow ref | `<ref/missing/not_applicable>` |

## GitHub Release Policy

| Field | Value |
| --- | --- |
| GitHub Release used | `<Yes/No/Unknown>` |
| GitHub Release assets uploaded | `<Yes/No/Unknown>` |
| GitHub Release assets allowed | `<Yes/No/NeedsOwnerDecision/Unknown>` |
| GitHub Release notes only | `<Yes/No/Unknown>` |
| Release event workflow detected | `<Yes/No/Unknown>` |
| Policy state | `<state>` |

## GitHub Actions Policy

| Field | Value |
| --- | --- |
| Release workflow detected | `<Yes/No/Unknown>` |
| GitHub-hosted runner used | `<Yes/No/Unknown>` |
| Self-hosted runner used | `<Yes/No/Unknown>` |
| Actions artifact used as release package | `<Yes/No/Unknown>` |
| GitHub Packages used as release package | `<Yes/No/Unknown>` |
| Artifact retention policy ref | `<ref/missing/not_applicable>` |
| Policy state | `<state>` |

## Cost And Retention

| Field | Value |
| --- | --- |
| Repository visibility | `<public/private/internal/unknown>` |
| Runner type | `<github_hosted/self_hosted/mixed/unknown>` |
| Actions minutes risk | `<Yes/No/Unknown>` |
| Artifact storage risk | `<Yes/No/Unknown>` |
| Cache storage risk | `<Yes/No/Unknown>` |
| External provider cost risk | `<Yes/No/Unknown>` |
| Registry storage cost risk | `<Yes/No/Unknown>` |
| Platform fee risk | `<Yes/No/Unknown>` |
| Cost owner required | `<Yes/No>` |
| Cost owner ref | `<ref/missing/not_applicable>` |

## Release Package Identity

| Field | Value |
| --- | --- |
| Identity type | `<type>` |
| Identity ref | `<ref>` |
| Digest or ID | `<digest/id>` |
| Package location | `<location>` |
| Evidence preserved outside runtime bundle | Yes |
| Release evidence deleted to reduce bundle | No |

## Owners

| Field | Value |
| --- | --- |
| Release owner required | `<Yes/No>` |
| Release owner ref | `<ref/missing>` |
| Cost owner ref | `<ref/missing/not_applicable>` |
| Platform owner ref | `<ref/missing/not_applicable>` |
| Production owner ref | `<ref/missing/not_applicable>` |

## Source Chain

| Source | Ref | Digest | Scope Match | Release Candidate Match | Project Match |
| --- | --- | --- | --- | --- | --- |
| `<source_kind>` | `<ref>` | `sha256:<64 hex>` | `<scope>` | `<Yes/No/Unknown/N/A>` | `<Yes/No/Unknown>` |

## Boundaries

- This report approves release: No
- This report approves production: No
- This report executes release: No
- This report uploads GitHub Release assets: No
- This report runs GitHub-hosted release workflows: No
- This report deletes artifacts: No
- This report changes CI: No
- This report changes production: No
- This report changes secrets: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.87.0",
  "artifact_type": "release_channel_policy",
  "release_channel_policy_ref": "release-channel-policies/generated.md",
  "release_channel_policy_digest": "sha256:<64 hex>",
  "intent": "decide release channel policy",
  "intent_digest": "sha256:<64 hex>",
  "project_type": "existing_project"
}
```

## Outcome

`<RELEASE_CHANNEL_POLICY_RECORDED/BLOCKED_RELEASE_CHANNEL_POLICY>`

## Next Step

`<plain next step>`

