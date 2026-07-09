# Release Channel Decoupling 1.87 Execution And Acceptance Plan

## Purpose

`1.87` should separate source control from release-channel decisions.

Plain-language target:

```text
Git can remain the source history.
GitHub can remain the source and evidence repository.
But release packages, release execution, long-lived artifacts, and platform
submission should not be silently treated as "GitHub release by default".
```

This is especially important for existing projects. Many existing projects
already use Git, Git tags, GitHub Actions, provider deploys, app-store uploads,
mini-program submissions, server scripts, or internal handoff processes. `1.87`
must help Codex read that reality and choose the safest release-channel policy
without making a zero-experience user understand release infrastructure.

## Product Position

`1.87` is a release-channel policy and evidence layer.

It is not:

- a deployment system;
- a Git replacement;
- a GitHub replacement;
- a CI rewrite;
- a tag publishing command;
- a GitHub Release creator;
- an artifact deletion tool;
- a provider deploy tool;
- a production approval;
- a cost approval.

The intended chain is:

```text
Work Queue
-> Task Governance
-> Execution / Completion Consumers
-> Runtime Hygiene
-> Release Channel Policy
-> Release Evidence Gate
-> Human Release Owner / External Release System
```

`1.87` must not bypass `1.80` Release Evidence Gate or `1.86` Runtime Hygiene.
It adds release-channel policy clarity between runtime/release blocker
classification and formal release-owner review.

To avoid a circular dependency:

- `1.87` may consume Release Evidence Gate sources when a release candidate
  already exists.
- Release Evidence Gate should later consume Release Channel Policy as release
  channel evidence when deciding release-owner review readiness.
- Release Channel Policy is not a second release gate and does not approve
  release.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `docs/plans/release-evidence-gate-1.80-plan.md`
- `docs/plans/release-owner-completion-set-binding-1.80.3-plan.md`
- `docs/plans/release-path-consolidation-1.58-1.60-plan.md`
- `docs/plans/release-core-model-consolidation-1.67-plan.md`
- `docs/plans/execution-release-runtime-hygiene-1.86-plan.md`
- `core/release-evidence-gate.md`
- `docs/release-evidence-gate.md`
- `core/release-core-model.md`
- `docs/release-core-model.md`
- `core/execution-release-runtime-hygiene.md`
- `docs/execution-release-runtime-hygiene.md`
- `scripts/check-intentos.mjs`
- `package.json` verification scripts

Real-project observations such as WorkControl may be used only as calibration
evidence. They must not be hard-coded as public behavior.

## External Facts To Preserve

`1.87` should encode these facts without making users reason through them:

1. Git tags and GitHub Releases are related but not identical. A tag can remain
   a source identity marker without making GitHub Releases the release channel.
2. GitHub Releases can package software and release assets. GitHub's current
   release documentation describes release assets, per-file limits, and release
   asset counts.
3. GitHub Actions usage on private repositories can involve minutes, artifact
   storage, cache storage, and billing after included quotas.
4. Deleting Actions artifacts stops future storage accrual, but does not erase
   usage that already accrued in the current billing cycle.

Official references:

- GitHub Releases: `https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases`
- GitHub Actions billing: `https://docs.github.com/en/billing/concepts/product-billing/github-actions`

Do not turn these facts into a universal ban on GitHub. Use them to make the
release-channel decision explicit.

Separate two risk types:

- GitHub Releases risk is primarily release-channel governance risk: owner,
  asset authority, retention policy, user distribution, and whether a release
  event triggers automation.
- GitHub Actions risk is primarily execution/cost/retention risk: hosted runner
  minutes, artifact storage, cache storage, reruns, package storage, and release
  workflow side effects.

Do not imply that GitHub Release assets and GitHub Actions artifacts have the
same billing model.

## Problem Statement

### Problem 1: Git Source Identity Gets Confused With Release Channel

Projects often use Git commits or tags to identify what is being released.
That is valid.

The problem starts when Codex treats this as equivalent to:

```text
GitHub Release is the release channel.
GitHub Actions artifact is the release package.
GitHub Actions release workflow should run by default.
```

These are different decisions and must be separated.

### Problem 2: Existing Projects May Already Have A Release Path

An existing project may release through:

- Git tags only;
- GitHub Releases;
- GitHub Actions artifacts;
- provider deployment;
- internal server scripts;
- app-store submission;
- mini-program review;
- Docker registry;
- package registry;
- manual release-owner handoff;
- a custom release SOP.

`1.87` must read the existing release path and recommend a policy. It must not
blindly force GitHub source-only mode if the existing project has a safe,
approved, owner-controlled release process.

### Problem 3: Existing Projects May Have Unsafe Or Unclear Release Paths

Some existing projects use ad hoc release behavior:

- release package stored in the repository;
- GitHub Actions artifact used as the long-lived release package;
- tag push automatically triggers production release;
- release owner is unknown;
- cost owner is unknown;
- rollback owner is unknown;
- release evidence is deleted to reduce bundle size;
- CI release workflow touches production without an explicit release policy;
- GitHub Release assets are uploaded without evidence of owner approval.

`1.87` must surface these risks and recommend a safer path.

### Problem 4: Zero-Experience Users Cannot Confirm Technical Release Choices

The expected user should not have to choose between:

```text
GitHub Release
Actions artifact
source tag only
provider deploy
external artifact store
release handoff
```

Codex should make the professional recommendation and present one plain-language
decision:

```text
I recommend GitHub stores code and evidence only. The release package should be
handled by your release owner or platform. Do you want me to prepare that
policy?
```

When a project is already safe, Codex can say:

```text
Your project already has a release owner and release process. I will keep it and
only map IntentOS evidence to it.
```

### Problem 5: Release Cost Risk Must Be Explicit

`1.87` should not claim to calculate exact cost. It should identify cost-risk
surfaces:

- GitHub-hosted Actions minutes;
- Actions artifact storage;
- Actions cache storage;
- GitHub Packages usage;
- long-lived release bundles;
- repeated release workflow re-runs;
- release assets or artifacts used as package storage.

If the cost owner is unknown, release-channel policy must remain blocked or
limited to source/evidence-only review.

## Definitions

### Source Identity

The immutable source reference for a release candidate.

Examples:

- `git:<commit-sha>`
- `tag:<tag-name>`
- `branch:<branch-name>@<commit-sha>`

Source identity does not approve release and does not define the release channel.

### Release Channel

The place or process that actually carries release execution or release package
handoff.

Examples:

- external provider deployment;
- app-store submission;
- mini-program upload;
- server release SOP;
- package registry;
- Docker registry;
- local package handoff;
- GitHub Releases;
- GitHub Actions release workflow;
- GitHub Actions artifact package handoff.

### Release Package

The artifact that is handed to users, a platform, a release owner, or a runtime
environment.

Examples:

- ZIP package;
- installer;
- app package;
- mini-program upload package;
- Docker image;
- backend deployment build;
- static web build;
- source archive only.

### Evidence Repository

The repository or artifact location where IntentOS stores release evidence:

- release records;
- self-check reports;
- known limitations;
- release evidence gate reports;
- runtime hygiene reports;
- release channel policy reports.

GitHub may be used as evidence repository even when it is not the release
channel.

## Multi-Dimensional Policy Model

Release Channel Policy must not collapse everything into one `policy_state`.
The following dimensions can be true at the same time:

- Git is allowed as source identity.
- GitHub is source/evidence-only.
- GitHub Releases are disabled for package assets.
- GitHub Actions release workflows are blocked.
- Local package handoff is the recommended channel.
- Cost owner is missing.

Therefore `1.87` should model release policy as multiple dimensions:

### Source Identity Policy

- `git_allowed`
- `tag_allowed_as_identity`
- `tag_used`
- `tag_triggers_release_workflow`
- `tag_trigger_workflow_ref`

### GitHub Release Policy

- `github_release_used`
- `github_release_assets_uploaded`
- `github_release_assets_allowed`
- `github_release_notes_only`
- `release_event_workflow_detected`
- `policy_state`: `DISABLED|NOT_USED|NOTES_ONLY|ASSET_CHANNEL_REVIEW_REQUIRED|ALLOWED_WITH_OWNER_POLICY|UNKNOWN`

### GitHub Actions Release Policy

- `release_workflow_detected`
- `github_hosted_runner_used`
- `self_hosted_runner_used`
- `actions_artifact_used_as_release_package`
- `artifact_retention_policy_ref`
- `policy_state`: `DISABLED|SHORT_LIVED_HANDOFF_ONLY|BLOCKED_LONG_LIVED_PACKAGE|ALLOWED_WITH_RETENTION_POLICY|UNKNOWN`

### Effective Release Channel

- `source_only`
- `local_handoff`
- `provider_direct_deploy`
- `app_store_or_mini_program`
- `docker_registry`
- `package_registry`
- `github_release`
- `github_actions_artifact`
- `server_release_sop`
- `manual_release_owner_process`
- `unknown`

### Blocking State

- `blocked`
- `blocked_by`

The policy model is advisory and gate-facing. It does not execute release.

## Recommendation Classes

Add recommendation classes:

### `KEEP_EXISTING_APPROVED_CHANNEL`

Use when an existing project already has:

- clear release owner;
- clear cost owner or no relevant hosted release cost;
- release SOP;
- rollback / disable path;
- evidence location;
- no unapproved production side-effect automation.

### `KEEP_GIT_SOURCE_ONLY_AND_EXTERNAL_RELEASE`

Use when Git / GitHub should remain for source and evidence, while release
package or production execution belongs to a release owner or provider.

This should be the default for new projects unless the project explicitly has a
safer channel.

### `RECOMMEND_DECOUPLING_FROM_GITHUB_RELEASE_ASSETS`

Use when GitHub Releases or release assets are being used as the release-package
channel without clear owner, cost, retention, or rollback policy.

### `RECOMMEND_DECOUPLING_FROM_ACTIONS_ARTIFACT_PACKAGE`

Use when GitHub Actions artifacts are used as long-lived release packages or as
the default handoff surface without an explicit retention and cost policy.

### `REQUIRE_RELEASE_OWNER_DECISION`

Use when the release channel touches production, app-store submission,
mini-program upload, DNS, secrets, payment, migrations, package publishing, or
provider deployment.

### `BLOCK_RELEASE_CHANNEL_POLICY`

Use when source identity, owner, release target, cost owner, or production
side-effect boundary is unknown.

## New Project Behavior

For new projects, `1.87` should default to:

```text
GitHub = source + evidence repository
Release package / platform upload / production release = external release
channel chosen by release owner
IntentOS = evidence and boundary layer
```

The generated policy should:

- allow Git commits and optional tags as source identity;
- not create GitHub Releases by default;
- not upload release bundles as GitHub Release assets by default;
- not use GitHub Actions artifacts as the long-lived release package by default;
- not run GitHub-hosted release workflows by default;
- require release package identity if an external package exists;
- require release owner and cost owner before release review;
- require rollback / disable path for production-like targets;
- preserve release evidence separately from runtime bundles.

Plain-language output for a zero-experience user:

```text
I will keep GitHub for code and records. I will not use GitHub as the place that
stores or publishes your release package unless a release owner explicitly
chooses it later.
```

## Existing Project Behavior

For existing projects, `1.87` must not blindly switch away from Git or existing
release processes.

It should first classify the current release path:

| Existing Signal | Default Recommendation |
| --- | --- |
| Git tags only, no release automation | Keep tags as source identity; add source-only release-channel policy |
| GitHub Releases used only for notes, no assets, and no `on: release` workflow side effect | Keep if owner and policy exist; otherwise mark review-needed |
| GitHub Releases used for notes but `on: release` workflow exists | Require release owner decision and production side-effect review |
| GitHub Release assets used as release package | Recommend decoupling unless owner/cost/retention policy is explicit |
| Actions artifact used as release package | Recommend decoupling unless it is short-lived handoff with owner/cost/retention |
| Tag push triggers release workflow | Block until release owner approves trigger and production side-effect boundary |
| Provider deployment with release SOP | Keep existing channel and map IntentOS evidence to it |
| App Store / mini-program provider flow | Keep provider flow and require platform owner evidence |
| Docker / package registry publish | Keep only with package owner, registry owner, rollback/deprecation policy |
| Server script deploy | Keep only with release owner, operator, rollback, and production side-effect evidence |
| Unknown release path | Block release-channel policy and ask Codex to prepare a plain-language decision brief |

Plain-language output:

```text
I found your project already has a release path. I will not replace it. I will
only decide whether GitHub should remain code/evidence-only or whether your
current release channel is safe to keep.
```

## User-Burden Rule

The user should not be asked to choose technical release-channel primitives.

Codex may ask only plain-language confirmation questions such as:

```text
Should I treat GitHub as code and records only, and keep release package handling
outside GitHub unless a release owner later approves otherwise?
```

or:

```text
I found an existing release process that looks safer than replacing it. Should I
keep it and map IntentOS evidence to it?
```

Do not ask:

- "Do you want SOURCE_ONLY_NO_RELEASE_CHANNEL or LOCAL_PACKAGE_HANDOFF?"
- "Should Actions artifact be release package storage?"
- "Should tag push trigger release workflow?"
- "Should GitHub Release assets be canonical?"

Codex must translate those choices into professional recommendations.

## Artifact Surface

Add:

```text
release-channel-policies/
templates/release-channel-policy-report.md
core/release-channel-decoupling.md
docs/release-channel-decoupling.md
checklists/release-channel-policy-review.md
prompts/release-channel-policy-agent.md
schemas/artifacts/release-channel-policy.schema.json
scripts/resolve-release-channel-policy.mjs
scripts/check-release-channel-policy.mjs
examples/1.87-release-channel-decoupling/
test-fixtures/bad/bad-release-channel-*/
releases/1.87.0/
```

CLI aliases:

```bash
node scripts/cli.mjs release-channel <project> --intent "<release intent>"
node scripts/cli.mjs release-channel-check <project>
```

`release-channel` must be read-only by default.

Report writes must be tightly bounded:

- default report path: `release-channel-policies/*.md`;
- `--out` must be a relative path inside the target project;
- `--out` must stay inside `release-channel-policies/` unless a separate
  Approval Record and Unified Apply Plan explicitly allow a different artifact
  directory;
- absolute paths are rejected;
- `..` path traversal is rejected;
- symlink escape is rejected;
- runtime, CI, release, source code, package, workflow, provider, production,
  secret, Docker, API, DB, and web files are never valid `--out` targets.

## Machine-Readable Evidence

The report must include a `release_channel_policy` JSON block.

Minimum shape:

```json
{
  "schema_version": "1.87.0",
  "artifact_type": "release_channel_policy",
  "intent": "decide release channel policy",
  "intent_digest": "sha256:...",
  "project_type": "new_project|existing_project|unknown",
  "source_identity": {
    "source_ref": "git:<commit>|tag:<tag>|branch:<branch>@<commit>|unknown",
    "source_ref_role": "identity_only|release_trigger|unknown",
    "tag_used": "Yes|No|Unknown",
    "tag_triggers_release_workflow": "Yes|No|Unknown",
    "tag_trigger_workflow_ref": "artifact:...|file:...|missing|not_applicable"
  },
  "effective_release_channel": {
    "channel": "source_only|local_handoff|provider_direct_deploy|app_store_or_mini_program|docker_registry|package_registry|github_release|github_actions_artifact|server_release_sop|manual_release_owner_process|unknown",
    "recommendation_class": "KEEP_GIT_SOURCE_ONLY_AND_EXTERNAL_RELEASE",
    "blocked": "Yes|No",
    "blocked_by": [],
    "current_channel_detected": "Yes|No|Unknown",
    "current_channel_summary": "plain text",
    "recommended_channel_summary": "plain text"
  },
  "github_release_policy": {
    "github_release_used": "Yes|No|Unknown",
    "github_release_assets_uploaded": "Yes|No|Unknown",
    "github_release_assets_allowed": "Yes|No|NeedsOwnerDecision|Unknown",
    "github_release_notes_only": "Yes|No|Unknown",
    "release_event_workflow_detected": "Yes|No|Unknown",
    "policy_state": "DISABLED|NOT_USED|NOTES_ONLY|ASSET_CHANNEL_REVIEW_REQUIRED|ALLOWED_WITH_OWNER_POLICY|UNKNOWN"
  },
  "github_actions_policy": {
    "release_workflow_detected": "Yes|No|Unknown",
    "github_hosted_runner_used": "Yes|No|Unknown",
    "self_hosted_runner_used": "Yes|No|Unknown",
    "github_actions_artifact_used_as_release_package": "Yes|No|Unknown",
    "github_packages_used_as_release_package": "Yes|No|Unknown",
    "artifact_retention_policy_ref": "artifact:...|missing|not_applicable",
    "policy_state": "DISABLED|SHORT_LIVED_HANDOFF_ONLY|BLOCKED_LONG_LIVED_PACKAGE|ALLOWED_WITH_RETENTION_POLICY|UNKNOWN"
  },
  "github_actions_billing_profile": {
    "repository_visibility": "public|private|internal|unknown",
    "runner_type": "github_hosted|self_hosted|mixed|unknown",
    "uses_larger_runner": "Yes|No|Unknown",
    "actions_minutes_cost_risk": "Yes|No|Unknown",
    "artifact_storage_cost_risk": "Yes|No|Unknown",
    "cache_storage_cost_risk": "Yes|No|Unknown",
    "cost_owner_ref": "artifact:...|human-decision:...|missing|not_applicable"
  },
  "cost_risk": {
    "github_actions_minutes_risk": "Yes|No|Unknown",
    "github_actions_artifact_storage_risk": "Yes|No|Unknown",
    "github_actions_cache_storage_risk": "Yes|No|Unknown",
    "github_packages_risk": "Yes|No|Unknown",
    "external_provider_cost_risk": "Yes|No|Unknown",
    "registry_storage_cost_risk": "Yes|No|Unknown",
    "app_store_or_platform_fee_risk": "Yes|No|Unknown",
    "cost_owner_required": "Yes|No",
    "cost_owner_ref": "human-decision:...|artifact:...|missing|not_applicable"
  },
  "owners": {
    "release_owner_required": "Yes|No",
    "release_owner_ref": "human-decision:...|artifact:...|missing",
    "platform_owner_ref": "human-decision:...|artifact:...|missing|not_applicable",
    "production_owner_ref": "human-decision:...|artifact:...|missing|not_applicable"
  },
  "release_package_identity": {
    "identity_type": "file_digest|docker_digest|registry_version|provider_build_id|app_store_build|mini_program_upload_id|source_archive|none|unknown",
    "identity_ref": "artifact:...|external:...|missing|not_applicable",
    "digest_or_id": "sha256:...|text|missing|not_applicable",
    "not_applicable_reason": "plain text"
  },
  "artifact_policy": {
    "release_package_location": "external_provider|local_handoff|registry|github_release_asset|github_actions_artifact|unknown|none",
    "evidence_preserved_outside_runtime_bundle": "Yes|No|Unknown",
    "release_evidence_deleted_to_reduce_bundle": "Yes|No|Unknown"
  },
  "source_chain": [
    {
      "source_kind": "release_evidence_gate|runtime_hygiene|release_plan|project_sop|ci_workflow|package_config|docker_config|provider_config|manual_observation",
      "source_ref": "artifact:...|file:...|git:...|missing",
      "source_digest": "sha256:...|missing",
      "source_scope_match": "current_task|release_candidate|project|unknown|not_applicable",
      "current_release_candidate_match": "Yes|No|Unknown|N/A",
      "project_match": "Yes|No|Unknown"
    }
  ],
  "decision": {
    "can_prepare_release_channel_policy": "Yes|No",
    "can_use_github_as_release_channel": "Yes|No|NeedsOwnerDecision|Unknown",
    "can_use_github_as_source_and_evidence_only": "Yes|No|Unknown",
    "needs_release_owner_decision": "Yes|No",
    "needs_cost_owner_decision": "Yes|No",
    "blocks_release_review": "Yes|No",
    "plain_user_summary": "plain text"
  },
  "boundaries": {
    "approves_release": "No",
    "executes_release": "No",
    "uploads_github_release_asset": "No",
    "runs_github_hosted_release_workflow": "No",
    "deletes_artifacts": "No",
    "changes_ci": "No",
    "changes_production": "No",
    "changes_secrets": "No"
  }
}
```

## Checker Rules

The checker must reject reports that:

1. claim release or production approval;
2. claim Codex executed release;
3. claim Codex uploaded a GitHub Release asset;
4. claim Codex ran a GitHub-hosted release workflow;
5. claim Codex deleted artifacts to reduce cost;
6. treat Git tag as release approval;
7. treat GitHub Release as safe without owner and policy evidence;
8. treat Actions artifact as long-lived release package without retention and
   cost owner evidence;
9. treat GitHub Packages as release package channel without owner and cost
   evidence;
10. allow tag push release trigger without explicit release owner decision;
11. store release bundle inside the repository;
12. delete release evidence to shrink runtime bundle;
13. mark production-like channel ready without release owner;
14. mark cost-risk channel ready without cost owner;
15. use technical user prompts as the only decision path;
16. hide the recommended channel from the plain-language summary;
17. conflict with `Release Evidence Gate` source evidence;
18. conflict with `Runtime Hygiene` production side-effect evidence;
19. allow GitHub Release notes-only while an `on: release` workflow exists and
    has not been reviewed;
20. claim `tag_triggers_release_workflow = No` while source evidence shows a
    tag-triggered workflow;
21. use a GitHub-hosted release workflow without a cost owner when cost risk is
    present or unknown;
22. use `actions/upload-artifact` as release package handoff without retention
    evidence;
23. recommend provider direct deploy without provider owner or release owner;
24. recommend external artifact store without artifact storage owner;
25. recommend Docker/package registry release without registry owner;
26. mark release package ready while release package identity is unknown;
27. claim GitHub source/evidence-only while source evidence shows release asset
    upload;
28. mark release channel ready while Runtime Hygiene says production side effect
    is unknown or present.

Strict mode must additionally require:

- structured JSON evidence;
- current source refs;
- release evidence gate source if a release candidate is named;
- runtime hygiene source if runtime blockers or artifact cost risks are named;
- CI workflow source if GitHub Actions release workflow is detected;
- package config source if npm, pnpm, package registry, or package publish is
  detected;
- Dockerfile / compose source if Docker registry release is detected;
- project SOP source if `KEEP_EXISTING_APPROVED_CHANNEL` is claimed;
- owner refs for production-like or cost-risk channels;
- release package identity refs for external release packages.

## Resolver Behavior

The resolver should inspect local project signals without writing target files:

- `.github/workflows/*`
- `package.json`
- `release-*` scripts where present;
- `Dockerfile` / compose files where present;
- provider config files where present;
- app-store or mini-program recipe evidence where present;
- release docs and SOPs where present;
- existing release evidence gate reports;
- existing runtime hygiene reports;
- known release directories;
- Git tag / branch / source ref if safely discoverable.

For `.github/workflows/*`, it should detect:

- `on.push.tags`;
- `on.release`;
- `workflow_dispatch` release workflows;
- `deployment` workflows;
- `gh release create`;
- `gh release upload`;
- `softprops/action-gh-release`;
- `ncipollo/release-action`;
- `actions/create-release`;
- `actions/upload-release-asset`;
- `actions/upload-artifact` used after build or as package handoff;
- `docker push`;
- `npm publish`, `pnpm publish`, or package publishing;
- `twine upload`;
- `gcloud run deploy`;
- `vercel deploy --prod`;
- `firebase deploy`;
- `wrangler deploy`;
- `kubectl apply`;
- `scp` / `rsync` to server targets.

It must not:

- run release workflows;
- create tags;
- create GitHub Releases;
- upload artifacts;
- delete artifacts;
- edit CI files;
- edit production config;
- request secrets;
- infer owner approval from silence.

## Implementation Plan

### Step 0: Calibrate The Release Channel Model

Before implementing artifacts, update the design model to use the
multi-dimensional policy shape:

- source identity policy;
- GitHub Release policy;
- GitHub Actions release policy;
- GitHub Actions billing profile;
- cross-provider cost risk;
- effective release channel;
- release package identity;
- source-chain scope matching;
- blocking state.

Acceptance:

- no single enum is used as the only release-channel truth;
- GitHub Release governance risk and GitHub Actions billing/retention risk are
  separate;
- external provider, registry, app-store, mini-program, Docker, and server
  channels can carry their own owner/cost risks;
- release package identity supports provider build IDs, registry versions,
  Docker digests, app-store builds, mini-program upload IDs, and file digests;
- source-chain matching uses release/project/task scope rather than assuming
  every source is a current-task source.

### Step 1: Define Release Channel Decoupling Protocol

Create:

- `core/release-channel-decoupling.md`
- `docs/release-channel-decoupling.md`

The protocol must cover:

- source identity vs release channel;
- Git and tag preservation;
- GitHub source/evidence-only mode;
- GitHub Release governance risk classification;
- GitHub Actions workflow, artifact, cache, package, and billing risk
  classification;
- external provider, registry, app-store, mini-program, Docker, server script,
  and package publishing channel classification;
- existing-project channel preservation;
- unsafe existing-channel repair recommendations;
- release owner and cost owner requirements;
- non-authorizing boundaries.

Acceptance:

- docs explain that Git is not removed;
- docs explain that GitHub can remain source/evidence repository;
- docs explain that GitHub Release / Actions artifacts are not default release
  channels;
- docs include new-project and existing-project behavior;
- docs use plain-language user-facing summaries.

### Step 2: Add Template, Checklist, Prompt, And Schema

Create:

- `templates/release-channel-policy-report.md`
- `checklists/release-channel-policy-review.md`
- `prompts/release-channel-policy-agent.md`
- `schemas/artifacts/release-channel-policy.schema.json`
- `release-channel-policies/.gitkeep`

Acceptance:

- template contains human summary and structured JSON;
- checklist blocks release approval and production execution claims;
- prompt instructs reviewer to avoid technical burden on zero-experience users;
- schema requires boundaries and owner/cost fields;
- schema supports source identity separate from release channel.
- schema uses multi-dimensional release policy instead of one `policy_state`.
- schema supports release package identity beyond file digests.
- schema separates source scope match from current task match.

### Step 3: Implement Resolver And Checker

Create:

- `scripts/resolve-release-channel-policy.mjs`
- `scripts/check-release-channel-policy.mjs`

Add CLI aliases:

- `release-channel`
- `release-channel-check`

Acceptance:

- resolver is read-only by default;
- checker passes source repo with `--allow-empty`;
- resolver can emit a policy report with `--out` only under
  `release-channel-policies/*.md`;
- checker validates the generated report;
- checker rejects unsafe GitHub Release and Actions artifact claims.
- checker rejects absolute `--out`, `..` traversal, symlink escape, and writes
  outside `release-channel-policies/` unless a later controlled apply protocol
  explicitly introduces a different artifact path.
- resolver detects tag push, release event, GitHub release actions, upload
  artifact usage, provider deploy commands, Docker publish, package publish,
  and server-copy deployment signals where present.

### Step 4: Add Examples

Create examples:

```text
examples/1.87-release-channel-decoupling/new-project-source-only/
examples/1.87-release-channel-decoupling/existing-provider-release-sop/
examples/1.87-release-channel-decoupling/github-release-assets-review-needed/
examples/1.87-release-channel-decoupling/actions-artifact-package-blocked/
examples/1.87-release-channel-decoupling/tag-source-identity-only/
```

Acceptance:

- new-project example defaults to GitHub source/evidence-only;
- existing-provider example preserves safer existing release SOP;
- GitHub Release asset example requires owner/cost/retention review;
- Actions artifact example blocks long-lived artifact package use;
- tag example preserves tag as source identity without release-channel approval.

### Step 5: Add Bad Fixtures

Create bad fixtures:

```text
test-fixtures/bad/bad-release-channel-github-release-auto-approved/
test-fixtures/bad/bad-release-channel-actions-artifact-long-lived/
test-fixtures/bad/bad-release-channel-tag-push-production/
test-fixtures/bad/bad-release-channel-missing-cost-owner/
test-fixtures/bad/bad-release-channel-deletes-evidence/
test-fixtures/bad/bad-release-channel-technical-user-burden/
test-fixtures/bad/bad-release-channel-source-release-confusion/
test-fixtures/bad/bad-release-channel-notes-only-release-workflow/
test-fixtures/bad/bad-release-channel-github-source-only-conflict/
test-fixtures/bad/bad-release-channel-provider-owner-missing/
test-fixtures/bad/bad-release-channel-package-identity-unknown/
```

Acceptance:

- each bad fixture fails for the intended reason;
- at least one fixture catches tag-as-release-approval confusion;
- at least one fixture catches Actions artifact package misuse;
- at least one fixture catches GitHub Release asset auto-approval;
- at least one fixture catches technical burden pushed to the user.
- at least one fixture catches notes-only GitHub Release with an unreviewed
  `on: release` workflow.
- at least one fixture catches GitHub source/evidence-only claims that conflict
  with detected release asset upload.
- at least one fixture catches provider/registry/package release without owner
  or package identity.

### Step 6: Integrate Verification Surface

Update:

- `scripts/check-intentos.mjs`
- `package.json`
- `intentos-manifest.json`
- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `templates/workflow-version.json`
- `templates/version-record.md`

Acceptance:

- `verify:syntax` includes resolver and checker syntax checks;
- `verify:examples` includes positive examples;
- `verify:release` covers assets, docs, package scripts, CLI help, examples,
  and bad fixtures;
- README lists Release Channel Decoupling as a capability;
- version sources agree on `1.87.0`.

### Step 7: Add Release Evidence

Create:

- `releases/1.87.0/release-record.md`
- `releases/1.87.0/known-limitations.md`
- `releases/1.87.0/self-check-report.md`

Acceptance:

- release record states that `1.87.0` is non-authorizing;
- known limitations explain that exact GitHub billing cannot be calculated by
  IntentOS;
- self-check records targeted checks and full verify outcome;
- release record distinguishes Git tag, GitHub Release, Actions artifact, and
  external release channel.

## Acceptance Plan

### Static Acceptance

Required commands:

```bash
node --check scripts/resolve-release-channel-policy.mjs
node --check scripts/check-release-channel-policy.mjs
node scripts/check-manifest.mjs
```

Expected result:

- all pass.

### Positive Example Acceptance

Required commands:

```bash
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/new-project-source-only --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/existing-provider-release-sop --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/github-release-assets-review-needed --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/actions-artifact-package-blocked --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/tag-source-identity-only --require-structured-evidence
```

Expected result:

- all pass;
- none approve release;
- none execute release;
- none delete artifacts;
- none change CI or production.

### Negative Fixture Acceptance

Required commands:

```bash
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-github-release-auto-approved --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-actions-artifact-long-lived --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-tag-push-production --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-missing-cost-owner --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-deletes-evidence --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-technical-user-burden --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-source-release-confusion --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-notes-only-release-workflow --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-github-source-only-conflict --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-provider-owner-missing --require-structured-evidence
node scripts/check-release-channel-policy.mjs test-fixtures/bad/bad-release-channel-package-identity-unknown --require-structured-evidence
```

Expected result:

- each command fails for the intended policy violation.

### CLI Acceptance

Required commands:

```bash
node scripts/cli.mjs release-channel . --intent "decide release channel policy"
node scripts/cli.mjs release-channel-check . --allow-empty
```

Expected result:

- release-channel prints a plain-language, non-authorizing result;
- release-channel-check can pass source repo with explicit empty allowance;
- CLI help lists `release-channel` and `release-channel-check`.

### New Project Acceptance

For a generated project:

- default policy is GitHub source/evidence-only unless a release owner chooses
  another channel;
- Git and tags remain allowed as source identity;
- GitHub Release assets are not default release package storage;
- GitHub Actions artifacts are not default long-lived release package storage;
- release owner and cost owner are required before production-like release
  review;
- output avoids technical decision burden.

### Existing Project Acceptance

For an existing project:

- Codex reads existing release signals before recommending policy;
- safe existing release SOPs are preserved and mapped;
- unsafe or unclear GitHub Release / Actions artifact usage is flagged;
- Git is not removed or replaced;
- no CI, release, production, API, DB, Docker, provider, secret, or workflow file
  is changed by the policy resolver;
- selected migration, if needed later, requires a separate controlled apply
  plan.

### User-Burden Acceptance

The user-facing card must:

- state the recommendation in plain language;
- avoid asking the user to choose technical release-channel enum values;
- avoid claiming release approval;
- identify what Codex can prepare;
- identify what release owner must decide;
- summarize GitHub cost-risk surfaces without requiring billing expertise.
- distinguish GitHub Release governance risk from GitHub Actions billing and
  retention risk.
- mention external provider or registry cost/owner risk when that is the
  recommended channel.

### Boundary Acceptance

The checker must reject any report that says:

- release is approved;
- production is approved;
- Codex uploaded release assets;
- Codex ran release workflow;
- Codex deleted artifacts;
- Codex changed CI;
- Codex changed production;
- tag equals release approval;
- GitHub Actions artifact is a long-lived release package without owner/cost
  evidence.
- GitHub Release notes-only is treated as safe while `on: release` automation is
  present and unreviewed.
- GitHub source/evidence-only is claimed while release asset upload is detected.
- provider, Docker, package registry, app-store, mini-program, or server release
  is recommended without the required owner and package identity evidence.

### Full Verify Acceptance

Before release:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
git diff --check
```

Expected result:

- all pass;
- 1.87 release self-check records the full verification outcome.

## Completion Criteria

`1.87.0` is complete when:

- Release Channel Decoupling is documented in core/docs;
- release-channel policy reports have structured evidence;
- resolver/checker/CLI entries exist;
- new-project and existing-project examples pass;
- unsafe GitHub Release / Actions artifact bad fixtures fail;
- README and version sources are updated;
- release evidence exists;
- full verification passes;
- no implementation authorizes release, production, CI mutation, artifact
  deletion, or GitHub release asset upload.

## What 1.87 Does Not Mean

`1.87` does not mean:

- stop using Git;
- stop using GitHub as source hosting;
- ban Git tags;
- ban GitHub Releases everywhere;
- ban GitHub Actions everywhere;
- auto-migrate existing release systems;
- delete release artifacts;
- change CI workflows;
- execute deployment;
- approve production;
- force old projects to use IntentOS native assets.

`1.87` means:

```text
Codex must make the release channel explicit, separate Git source identity from
release execution, recommend safer source/evidence-only GitHub usage when
appropriate, and protect zero-experience users from having to make technical
release-infrastructure decisions.
```
