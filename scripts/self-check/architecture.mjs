import * as runtime from "./runtime.mjs";

const {
  fs,
  path,
  crypto,
  spawnSync,
  os,
  sourceRequiredPaths,
  walkProjectFiles,
  analyzeRiskSurfaces,
  evidenceDigest,
  extractMachineReadableEvidence,
  validateSchema,
  initExecutableActions,
  loadVerifiedBootstrapReceipt,
  buildCurrentTrustFixture,
  prepareCurrentTrustFixtureSource,
  canonicalFileDigest,
  createEvidenceAuthorityBinding,
  projectIdentity,
  resolveProjectEntryTrust,
  sectionBody,
  stripMarkdown,
  kitRoot,
  approvedInitProjectApplyArgs,
  checkRiskSurfaceCalibration,
  currentVersion,
  exists,
  fail,
  fileDigest,
  generatedExecutionAssuranceReportText,
  hasCompleteAdoptionAssuranceEvidence,
  hasCompleteGovernanceConvergenceEvidence,
  mutateVerificationPlan,
  pass,
  read,
  rel,
  reportNameForTakeoverExample,
  rewriteMachineEvidence,
  runNode,
  walkSourceFiles,
  writeInitProjectApprovalRecord,
  writeInitProjectReadinessRecord,
} = runtime;

function checkApplyAdoptionClosureProtocol() {
  const required = [
    "docs/plans/apply-adoption-closure-1.92-plan.md",
    "core/apply-execution-receipt.md",
    "docs/apply-execution-receipt.md",
    "templates/apply-execution-receipt.md",
    "schemas/artifacts/apply-execution-receipt.schema.json",
    "scripts/check-apply-execution-receipt.mjs",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.92 apply and adoption closure asset exists ${file}`);
    else fail(`1.92 apply and adoption closure asset missing ${file}`);
  }
  const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.92-empty-receipt-"));
  const strictEmpty = runNode([
    "scripts/check-apply-execution-receipt.mjs",
    emptyRoot,
    "--require-structured-evidence",
  ]);
  if (strictEmpty.status !== 0 && `${strictEmpty.stdout}\n${strictEmpty.stderr}`.includes("receipt is required")) {
    pass("1.92 strict apply receipt check fails closed when evidence is absent");
  } else {
    fail(`1.92 strict apply receipt check must fail closed when absent: ${strictEmpty.stderr || strictEmpty.stdout}`);
  }
}
function checkReleaseTrustClosureProtocol() {
  for (const file of [
    "docs/plans/release-trust-closure-1.93-plan.md",
    "core/release-approval-record.md",
    "docs/release-approval-record.md",
    "templates/release-approval-record.md",
    "schemas/artifacts/release-approval-record.schema.json",
    "schemas/artifacts/release-execution-plan.schema.json",
    "scripts/lib/release-trust.mjs",
    "scripts/check-release-approval-record.mjs",
  ]) {
    if (exists(file)) pass(`1.93 release trust closure asset exists ${file}`);
    else fail(`1.93 release trust closure asset missing ${file}`);
  }

  const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-empty-approval-"));
  const emptyCheck = runNode(["scripts/check-release-approval-record.mjs", emptyRoot, "--require-approved"]);
  if (emptyCheck.status !== 0 && `${emptyCheck.stdout}\n${emptyCheck.stderr}`.includes("record is required")) pass("1.93 release approval fails closed when evidence is absent");
  else fail(`1.93 release approval must fail closed when evidence is absent: ${emptyCheck.stderr || emptyCheck.stdout}`);

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-release-trust-"));
  fs.cpSync(path.join(kitRoot, "examples", "1.80-release-evidence-gate", "web-preview-handoff"), root, { recursive: true });
  fs.rmSync(path.join(root, "tasks"), { recursive: true, force: true });
  for (const [relative, content] of [
    ["docs/release-sop.md", "# Release SOP\n\nRelease procedure: the current user performs the provider handoff after preflight verification.\n"],
    ["docs/environment-readiness.md", "# Environment Readiness\n\nTarget: isolated preview runtime.\n\nVerification: run the environment preflight before handoff.\n"],
    ["evidence/rollback-current.md", "# Rollback\n\nTrigger: preview smoke failure. Restore the previous preview candidate, then verify recovery.\n"],
    ["evidence/monitoring-current.md", "# Monitoring\n\nObserve preview health and error logs. The current operator records the monitoring result.\n"],
    ["evidence/post-release-smoke-current.md", "# Post-release Smoke\n\nRead-only preview smoke procedure. Expected result: PASS before observation closes.\n"],
    [".github/workflows/release.yml", "name: Preview release verification\non:\n  workflow_dispatch:\nconcurrency: preview-release-lock\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo 'preview test rollback monitoring cleanup retention'\n"],
  ]) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), content);
  }
  fs.mkdirSync(path.join(root, "release-channel-policies"), { recursive: true });
  fs.copyFileSync(
    path.join(kitRoot, "release-channel-policies", "113-cross-domain-trust-closure.md"),
    path.join(root, "release-channel-policies", "000-topology-source.md"),
  );
  prepareCurrentTrustFixtureSource(root);
  const closureFixtureRoot = path.join(kitRoot, "examples", "1.49-structured-impact-coverage", "contract-input-rule");
  for (const relative of ["change-impact-coverage-reports", "closure-decisions", "evidence", "execution-closures"]) {
    fs.cpSync(path.join(closureFixtureRoot, relative), path.join(root, relative), { recursive: true });
  }
  for (const gitArgs of [
    ["init"],
    ["config", "user.email", "intentos-self-check@example.com"],
    ["config", "user.name", "IntentOS Self Check"],
    ["add", "."],
    ["commit", "-m", "release candidate"],
  ]) {
    const result = spawnSync("git", ["-C", root, ...gitArgs], { encoding: "utf8" });
    if (result.status !== 0) {
      fail(`1.93 release trust fixture Git setup failed: ${result.stderr || result.stdout}`);
      return;
    }
  }
  const candidateRef = "release-candidates/001-web-preview.md";
  const candidateFile = path.join(root, candidateRef);
  let currentTrust;
  try {
    currentTrust = buildCurrentTrustFixture(kitRoot, root);
  } catch (error) {
    fail(`1.113 current strict trust fixture failed: ${error.message}`);
    return;
  }
  fs.appendFileSync(candidateFile, "\nExact staged release candidate for trust validation.\n");
  const stagedCandidate = spawnSync("git", ["-C", root, "add", "--all"], { encoding: "utf8" });
  if (stagedCandidate.status !== 0) {
    fail(`1.113 release trust fixture candidate staging failed: ${stagedCandidate.stderr || stagedCandidate.stdout}`);
    return;
  }
  try {
    // The clean first pass establishes strict Work Queue and Task Governance
    // lineage. Rebuild every downstream consumer after staging the exact
    // release candidate so Completion authority binds the candidate revision.
    currentTrust = buildCurrentTrustFixture(kitRoot, root);
  } catch (error) {
    fail(`1.113 staged-candidate current trust fixture failed: ${error.message}`);
    return;
  }
  pass("1.113 current Task Governance -> Work Queue -> Plan Review -> Test Evidence -> Execution Assurance -> Completion chain passes");
  const authorityRevision = projectIdentity(root).revision;

  const topologyRef = "release-execution-topologies/001-preview.md";
  fs.mkdirSync(path.join(root, "release-execution-topologies"), { recursive: true });
  const topologyResolve = runNode([
    "scripts/resolve-release-execution-topology.mjs", root,
    "--intent", "prepare preview release handoff",
    "--out", topologyRef,
  ]);
  if (topologyResolve.status !== 0) {
    fail(`1.93 release trust fixture Release Execution Topology resolver failed: ${topologyResolve.stderr || topologyResolve.stdout}`);
    return;
  }
  const topologyCheck = runNode([
    "scripts/check-release-execution-topology.mjs", root, "--report", topologyRef,
    "--require-report", "--require-structured-evidence", "--require-current-project", "--require-ready",
  ]);
  if (topologyCheck.status !== 0) {
    fail(`1.93 release trust fixture Release Execution Topology failed: ${topologyCheck.stderr || topologyCheck.stdout}`);
    return;
  }
  const topologyDigest = canonicalFileDigest(path.join(root, topologyRef));

  const candidateOriginal = fs.readFileSync(candidateFile, "utf8");
  const candidateDigest = canonicalFileDigest(candidateFile);
  const releasePreflightRef = "evidence/release-preflight.json";
  const releasePreflight = {
    schema_version: "1.113.0",
    artifact_type: "release_preflight_receipt",
    operation: "release_preflight",
    task_ref: currentTrust.taskRef,
    intent_digest: currentTrust.completion.intent_digest,
    release_candidate_ref: `artifact:${candidateRef}`,
    release_candidate_digest: candidateDigest,
    source_revision: authorityRevision,
    lane_state: "PREFLIGHT_ONLY",
    command: "git diff --cached --check",
    result: "PASS",
    exit_code: 0,
    external_effects_executed: "No",
    production_touched: "No",
    receipt_digest: "",
  };
  releasePreflight.receipt_digest = evidenceDigest(releasePreflight, ["receipt_digest"]);
  fs.writeFileSync(path.join(root, releasePreflightRef), `${JSON.stringify(releasePreflight, null, 2)}\n`);
  const releaseEvidenceRef = "release-evidence-gate-reports/001-web-preview.md";
  const releaseEvidenceFile = path.join(root, releaseEvidenceRef);
  const releaseEvidenceResolve = runNode([
    "scripts/resolve-release-evidence-gate.mjs", root,
    "--intent", "prepare preview release handoff",
    "--release-target", "preview",
    "--release-candidate-ref", `artifact:${candidateRef}`,
    "--source-revision", authorityRevision,
    "--dirty-worktree-status", "clean",
    "--task-ref", currentTrust.taskRef,
    "--completion-evidence-ref", `artifact:${currentTrust.refs.completion}`,
    "--test-evidence-ref", `artifact:${currentTrust.refs.testEvidence}`,
    "--execution-assurance-ref", `artifact:${currentTrust.refs.executionAssurance}`,
    "--release-topology-ref", `artifact:${topologyRef}`,
    "--build-artifact-ref", "artifact:evidence/preview-build.txt",
    "--build-artifact-digest", fileDigest(path.join(root, "evidence/preview-build.txt")),
    "--release-owner", "human:web-preview-release-owner",
    "--release-owner-review-ref", "pending",
    "--runtime-smoke-ref", "artifact:evidence/runtime-smoke.txt",
    "--runtime-smoke-digest", fileDigest(path.join(root, "evidence/runtime-smoke.txt")),
    "--runtime-smoke-type", "artifact",
    "--runtime-smoke-user-note-only", "No",
    "--rollback-ref", "artifact:evidence/rollback-current.md",
    "--rollback-digest", fileDigest(path.join(root, "evidence/rollback-current.md")),
    "--rollback-window", "current-preview",
    "--monitoring-ref", "artifact:evidence/monitoring-current.md",
    "--monitoring-digest", fileDigest(path.join(root, "evidence/monitoring-current.md")),
    "--incident-owner-ref", "human:release-owner",
    "--support-handoff-ref", "artifact:docs/release-sop.md",
    "--target-environment", "preview",
    "--config-owner", "human:release-owner",
    "--secrets-required", "No",
    "--dns-or-callback-required", "No",
    "--migration-required", "No",
    "--cost-owner-ref", "not_applicable",
    "--out", releaseEvidenceRef,
  ]);
  if (releaseEvidenceResolve.status !== 0) {
    fail(`1.93 release trust fixture Release Evidence resolver failed: ${releaseEvidenceResolve.stderr || releaseEvidenceResolve.stdout}`);
    return;
  }
  const releaseEvidenceCheck = runNode([
    "scripts/check-release-evidence-gate.mjs", root, "--report", releaseEvidenceRef,
    "--require-report", "--require-structured-evidence", "--require-ready", "--strict-source-binding",
  ]);
  if (releaseEvidenceCheck.status !== 0) {
    fail(`1.93 release trust fixture Release Evidence failed: ${releaseEvidenceCheck.stderr || releaseEvidenceCheck.stdout}`);
    return;
  }

  const runtimeRef = "runtime-hygiene-reports/001-release-ready.md";
  fs.mkdirSync(path.join(root, "runtime-hygiene-reports"), { recursive: true });
  const runtimeResolve = runNode([
    "scripts/resolve-runtime-hygiene.mjs", root,
    "--task-ref", currentTrust.taskRef,
    "--intent-digest", currentTrust.completion.intent_digest,
    "--operation", "release",
    "--release-lane", "PREFLIGHT_ONLY",
    "--release-event", releasePreflightRef,
    "--release-event-ref", `artifact:${releasePreflightRef}`,
    "--release-candidate-ref", `artifact:${candidateRef}`,
    "--release-candidate-digest", candidateDigest,
    "--source-revision", authorityRevision,
    "--release-topology-ref", `artifact:${topologyRef}`,
    "--release-topology-digest", topologyDigest,
    "--out", runtimeRef,
  ]);
  if (runtimeResolve.status !== 0) {
    fail(`1.93 release trust fixture Runtime Hygiene resolver failed: ${runtimeResolve.stderr || runtimeResolve.stdout}`);
    return;
  }
  const runtimeCheck = runNode([
    "scripts/check-runtime-hygiene.mjs", root, "--report", runtimeRef,
    "--require-report", "--require-structured-evidence", "--require-runtime-sources",
  ]);
  if (runtimeCheck.status !== 0) {
    fail(`1.93 release trust fixture Runtime Hygiene failed: ${runtimeCheck.stderr || runtimeCheck.stdout}`);
    return;
  }

  const channelRef = "release-channel-policies/001-current-preview.md";
  fs.mkdirSync(path.join(root, "release-channel-policies"), { recursive: true });
  const channelResolve = runNode([
    "scripts/resolve-release-channel-policy.mjs", root,
    "--intent", "select source-only preview release channel",
    "--project-type", "existing_project",
    "--channel", "source_only",
    "--recommendation-class", "KEEP_EXISTING_APPROVED_CHANNEL",
    "--release-owner-ref", "human:release-owner",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
    "--release-candidate-ref", `artifact:${candidateRef}`,
    "--release-evidence-gate-ref", `file:${releaseEvidenceRef}`,
    "--runtime-hygiene-ref", `file:${runtimeRef}`,
    "--project-sop-ref", "file:docs/release-sop.md",
    "--out", channelRef,
  ]);
  if (channelResolve.status !== 0) {
    fail(`1.93 release trust fixture Release Channel resolver failed: ${channelResolve.stderr || channelResolve.stdout}`);
    return;
  }
  const channelCheck = runNode([
    "scripts/check-release-channel-policy.mjs", root, "--report", channelRef,
    "--require-report", "--require-structured-evidence", "--strict-source-binding",
  ]);
  if (channelCheck.status !== 0) {
    fail(`1.93 release trust fixture Release Channel failed: ${channelCheck.stderr || channelCheck.stdout}`);
    return;
  }

  const approvalRef = "release-approval-records/001-preview.md";
  fs.mkdirSync(path.join(root, "release-approval-records"), { recursive: true });
  const providerRequest = {
    action: "deploy",
    candidate_ref: `artifact:${candidateRef}`,
    environment: "preview",
    platform: "preview-provider",
  };
  const deploymentRequest = JSON.stringify({ request_type: "provider_request", provider_request: providerRequest });
  const approval = {
    schema_version: "1.93.0",
    artifact_type: "release_approval_record",
    artifact_id: "preview-release-approval",
    release_approval_digest: "sha256:pending",
    project_identity: projectIdentity(root),
    release_candidate: {
      release_target: "preview",
      candidate_ref: `artifact:${candidateRef}`,
      candidate_digest: candidateDigest,
      source_revision: authorityRevision,
      package_identity_type: "none",
      package_identity_ref: "not_applicable",
      package_identity_digest_or_id: "not_applicable",
    },
    trust_sources: {
      release_evidence_gate: { ref: `artifact:${releaseEvidenceRef}`, digest: fileDigest(releaseEvidenceFile) },
      runtime_hygiene: { ref: `artifact:${runtimeRef}`, digest: fileDigest(path.join(root, runtimeRef)) },
      release_channel_policy: { ref: `artifact:${channelRef}`, digest: fileDigest(path.join(root, channelRef)) },
      release_execution_topology: { ref: `artifact:${topologyRef}`, digest: topologyDigest },
      platform_recipe: { required: "No", ref: "N/A", digest: "N/A" },
      release_handoff_pack: { required: "No", ref: "N/A", digest: "N/A" },
    },
    release_controls: {
      release_owner_ref: "human:release-owner",
      release_sop_ref: "artifact:docs/release-sop.md",
      release_sop_digest: fileDigest(path.join(root, "docs/release-sop.md")),
      rollback_ref: "artifact:evidence/rollback-current.md",
      rollback_digest: fileDigest(path.join(root, "evidence/rollback-current.md")),
      monitoring_ref: "artifact:evidence/monitoring-current.md",
      monitoring_digest: fileDigest(path.join(root, "evidence/monitoring-current.md")),
      post_release_smoke_ref: "artifact:evidence/post-release-smoke-current.md",
      post_release_smoke_digest: fileDigest(path.join(root, "evidence/post-release-smoke-current.md")),
    },
    human_approval: {
      approval_status: "APPROVED",
      approval_owner_type: "HUMAN",
      approved_by: "Release Owner Dana",
      approved_at: "2026-07-10T10:00:00Z",
      expires_at: "2099-12-31T23:59:00Z",
      approved_scope: JSON.stringify({
        effect_id: "preview-provider-deploy-001",
        action: "PROVIDER_DEPLOY",
        platform: "preview-provider",
        environment: "preview",
        candidate_ref: `artifact:${candidateRef}`,
        candidate_digest: candidateDigest,
        package_identity_type: "none",
        package_identity_ref: "not_applicable",
        package_identity_digest_or_id: "not_applicable",
        command_or_request_digest: `sha256:${crypto.createHash("sha256").update(JSON.stringify(providerRequest)).digest("hex")}`,
        cost_boundary: { cost_class: "NO_INCREMENTAL_COST", currency: "N/A", maximum_amount: "N/A" },
        rollback_ref: "artifact:evidence/rollback-current.md",
        rollback_digest: fileDigest(path.join(root, "evidence/rollback-current.md")),
      }),
    },
    allowed_codex_actions: ["VERIFY", "BUILD", "EVIDENCE_CAPTURE", "HANDOFF_PREPARATION", "POST_RELEASE_READ_ONLY_SMOKE"],
    blocked_actions: ["PRODUCTION_DEPLOY", "STORE_SUBMISSION", "MINI_PROGRAM_RELEASE", "PRODUCTION_MIGRATION", "SECRETS", "DNS", "PAYMENT", "PERMISSIONS", "PRODUCTION_CONFIG", "ROLLBACK_EXECUTION"],
    boundaries: {
      codex_release_owner: "No",
      automatic_production_deploy: "No",
      codex_store_or_mini_program_submission: "No",
      codex_high_risk_production_changes: "No",
      proves_product_or_production_safety: "No",
    },
    outcome: "RELEASE_APPROVAL_VALID",
  };
  approval.release_approval_digest = evidenceDigest(approval, ["release_approval_digest"]);
  fs.writeFileSync(path.join(root, approvalRef), [
    "# Release Approval Record: preview-release-approval", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(approval, null, 2), "```", "", "## Outcome", "", "`RELEASE_APPROVAL_VALID`", "",
  ].join("\n"));
  const approvalCheck = runNode([
    "scripts/check-release-approval-record.mjs", root, "--report", approvalRef,
    "--require-structured-evidence", "--require-approved", "--require-release-topology",
  ]);
  if (approvalCheck.status !== 0) {
    fail(`1.93 release trust fixture approval failed: ${approvalCheck.stderr || approvalCheck.stdout}`);
    return;
  }
  pass("1.93 current project-bound Release Approval Record passes strict authority chain");

  const closureRef = "closure-decisions/113-current.md";
  const closureResolve = runNode([
    "scripts/resolve-closure-decision.mjs", root,
    "--intent", currentTrust.intent,
    "--intent-digest", currentTrust.completion.intent_digest,
    "--task", currentTrust.taskRef,
    "--verification", "Current strict trust fixture passed",
    "--impact-report", `artifact:${currentTrust.refs.impact}`,
    "--completion-evidence", `artifact:${currentTrust.refs.completion}`,
  ]);
  if (closureResolve.status !== 0) {
    fail(`1.93 release trust fixture Unified Closure resolver failed: ${closureResolve.stderr || closureResolve.stdout}`);
    return;
  }
  fs.writeFileSync(path.join(root, closureRef), closureResolve.stdout);
  const closureCheck = runNode([
    "scripts/check-closure-decision.mjs", root, "--report", closureRef,
    "--require-report", "--require-current-authority", "--require-done", "--strict",
    "--require-task-governance", "--require-work-queue", "--strict-task-consumer",
  ]);
  if (closureCheck.status !== 0) {
    fail(`1.93 release trust fixture Unified Closure failed: ${closureCheck.stderr || closureCheck.stdout}`);
    return;
  }
  const launchViewRef = "launch-review-views/001-preview-ready.md";
  fs.mkdirSync(path.join(root, "launch-review-views"), { recursive: true });
  const launchViewEvidence = {
    schema_version: "1.98.1",
    artifact_type: "launch_review_view",
    artifact_id: "preview-launch-review",
    launch_review_digest: "sha256:pending",
    project_identity: projectIdentity(root),
    intent: "prepare preview release handoff",
    closure_input: {
      ref: `artifact:${closureRef}`,
      digest: fileDigest(path.join(root, closureRef)),
      decision: "DONE",
      can_count_as_done: "Yes",
      durable: "Yes",
    },
    safe_launch_label: "READY_FOR_RELEASE_REVIEW",
    launch_review_can_proceed: "Yes",
    surfaces: {
      environment: "PASS",
      monitoring: "PASS",
      rollback: "PASS",
      release_ownership: "PASS",
      post_launch_smoke: "PASS",
    },
    surface_evidence: {
      environment: { ref: "docs/environment-readiness.md", digest: fileDigest(path.join(root, "docs/environment-readiness.md")) },
      monitoring: { ref: "evidence/monitoring-current.md", digest: fileDigest(path.join(root, "evidence/monitoring-current.md")) },
      rollback: { ref: "evidence/rollback-current.md", digest: fileDigest(path.join(root, "evidence/rollback-current.md")) },
      release_ownership: { ref: "human:release-owner", digest: "N/A" },
      post_launch_smoke: { ref: "evidence/post-release-smoke-current.md", digest: fileDigest(path.join(root, "evidence/post-release-smoke-current.md")) },
    },
    boundaries: {
      approves_release: "No",
      executes_release: "No",
      changes_production: "No",
      replaces_closure: "No",
    },
    outcome: "LAUNCH_REVIEW_VIEW_RECORDED",
  };
  launchViewEvidence.launch_review_digest = evidenceDigest(launchViewEvidence, ["launch_review_digest"]);
  fs.writeFileSync(path.join(root, launchViewRef), [
    "# Launch Review View", "", "## Human Summary", "", "Launch review view: READY_FOR_RELEASE_REVIEW", "",
    "## Unified Closure Input", "", "| Field | Value |", "|---|---|", "| Closure Decision | `DONE` |", "| Can count as done | Yes |", "",
    "## Safe Launch View", "", "| Field | Value |", "|---|---|", "| Safe Launch Label | `READY_FOR_RELEASE_REVIEW` |", "| Launch review can proceed | Yes |", "| Release approval | No |", "",
    "## Platform View", "", "| Field | Value |", "|---|---|", "| Platform | `web` |", "",
    "## Launch Surface Gaps", "", "| Surface | Status | Evidence / Decision | Finding |", "|---|---|---|---|",
    "| Environment | `PASS` | docs/environment-readiness.md | ready |", "| Monitoring | `PASS` | evidence/monitoring-current.md | ready |",
    "| Rollback | `PASS` | evidence/rollback-current.md | ready |", "| Release ownership | `PASS` | human:release-owner | ready |",
    "| Post-launch smoke | `PASS` | evidence/post-release-smoke-current.md | ready |", "",
    "## Human Release Decisions", "", "Human release approval remains external.", "", "## Evidence Map", "", "Current project evidence only.", "",
    "## Recommended Next Step", "", "Hand off to the human release owner.", "", "## Boundaries", "",
    "- This view writes target files: No", "- This view deploys, publishes, or submits release: No", "- This view approves release or production: No",
    "- This view modifies CI/CD or hooks: No", "- This view changes production config, secrets, DNS, app-store state, payment, permissions, or migrations: No",
    "- This view replaces Unified Closure: No", "- This view replaces Safe Launch: No", "- This view replaces project release SOPs: No",
    "- This view approves security/privacy/compliance/legal/tax/finance/payment decisions: No", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(launchViewEvidence, null, 2), "```", "", "## Outcome", "", "`LAUNCH_REVIEW_VIEW_RECORDED`", "",
  ].join("\n"));

  const launchViewCheck = runNode([
    "scripts/check-launch-review-view.mjs", root,
    "--report", launchViewRef,
    "--require-structured-evidence",
  ]);
  if (launchViewCheck.status !== 0) {
    fail(`1.93 strict Launch Review fixture failed before Release Execution: ${launchViewCheck.stderr || launchViewCheck.stdout}`);
    return;
  }
  pass("1.98 Launch Review consumes an exact strictly validated Unified Closure chain");

  const executionRef = "release-execution-plans/001-preview.md";
  fs.mkdirSync(path.join(root, "release-execution-plans"), { recursive: true });
  const executionResolve = runNode([
    "scripts/resolve-release-execution.mjs", root,
    "--intent", "prepare preview release handoff",
    "--mode", "ASSISTED_EXECUTION",
    "--platform", "preview-provider",
    "--deployment", deploymentRequest,
    "--require-release-topology",
    "--approval-ref", `artifact:${approvalRef}`,
    "--launch-view-ref", `artifact:${launchViewRef}`,
  ]);
  fs.writeFileSync(path.join(root, executionRef), executionResolve.stdout);
  const executionCheck = runNode([
    "scripts/check-release-execution.mjs", root, "--report", executionRef, "--require-release-trust",
  ]);
  if (executionResolve.status !== 0 || executionCheck.status !== 0 || !executionResolve.stdout.includes("READY_FOR_ASSISTED_EXECUTION")) {
    fail(`1.93 trusted Release Execution failed: ${executionResolve.stderr || executionCheck.stderr || executionCheck.stdout}`);
    return;
  }
  pass("1.93 Release Execution consumes the exact strict release authority chain");

  const missingLaunch = runNode([
    "scripts/resolve-release-execution.mjs", root,
    "--intent", "prepare preview release handoff",
    "--mode", "ASSISTED_EXECUTION",
    "--approval-ref", `artifact:${approvalRef}`,
  ]);
  if (missingLaunch.status === 0
    && missingLaunch.stdout.includes("BLOCKED_PENDING_LAUNCH_REVIEW")
    && !missingLaunch.stdout.includes("READY_FOR_ASSISTED_EXECUTION")) {
    pass("1.98 approval cannot substitute for an independent Launch Review View");
  } else {
    fail(`1.98 missing Launch Review must block release execution: ${missingLaunch.stderr || missingLaunch.stdout}`);
  }

  const weakRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-weak-approval-"));
  fs.mkdirSync(path.join(weakRoot, "release-execution-plans"), { recursive: true });
  const weakResolve = runNode([
    "scripts/resolve-release-execution.mjs", weakRoot,
    "--intent", "prepare release", "--mode", "ASSISTED_EXECUTION", "--approval-status", "APPROVED",
  ]);
  fs.writeFileSync(path.join(weakRoot, "release-execution-plans/001.md"), weakResolve.stdout);
  const weakCheck = runNode(["scripts/check-release-execution.mjs", weakRoot, "--require-release-trust"]);
  if (weakCheck.status !== 0 && weakResolve.stdout.includes("BLOCKED_PENDING_LAUNCH_REVIEW")) pass("1.93 self-declared CLI approval cannot unlock Release Execution");
  else fail(`1.93 weak CLI approval must fail closed: ${weakCheck.stderr || weakCheck.stdout}`);

  const copiedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-copied-approval-"));
  fs.mkdirSync(path.join(copiedRoot, "release-approval-records"), { recursive: true });
  fs.copyFileSync(path.join(root, approvalRef), path.join(copiedRoot, approvalRef));
  const copiedCheck = runNode(["scripts/check-release-approval-record.mjs", copiedRoot, "--report", approvalRef, "--require-approved"]);
  if (copiedCheck.status !== 0 && `${copiedCheck.stdout}\n${copiedCheck.stderr}`.includes("project_identity")) pass("1.93 copied release approval is rejected");
  else fail(`1.93 copied release approval must be rejected: ${copiedCheck.stderr || copiedCheck.stdout}`);

  const unsafeApprovalRef = "release-approval-records/002-unsafe-action.md";
  const unsafeApproval = structuredClone(approval);
  unsafeApproval.artifact_id = "unsafe-release-approval";
  unsafeApproval.allowed_codex_actions.push("PRODUCTION_DEPLOY");
  unsafeApproval.release_approval_digest = evidenceDigest(unsafeApproval, ["release_approval_digest"]);
  fs.writeFileSync(path.join(root, unsafeApprovalRef), [
    "# Release Approval Record: unsafe-release-approval", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(unsafeApproval, null, 2), "```", "", "## Outcome", "", "`RELEASE_APPROVAL_VALID`", "",
  ].join("\n"));
  const unsafeApprovalCheck = runNode([
    "scripts/check-release-approval-record.mjs", root, "--report", unsafeApprovalRef, "--require-approved",
  ]);
  if (unsafeApprovalCheck.status !== 0 && `${unsafeApprovalCheck.stdout}\n${unsafeApprovalCheck.stderr}`.includes("allowed_codex_actions")) pass("1.93 approval cannot assign high-risk release actions to Codex");
  else fail(`1.93 high-risk Codex release action must be rejected: ${unsafeApprovalCheck.stderr || unsafeApprovalCheck.stdout}`);

  const expiredApprovalRef = "release-approval-records/003-expired.md";
  const expiredApproval = structuredClone(approval);
  expiredApproval.artifact_id = "expired-release-approval";
  expiredApproval.human_approval.expires_at = "2020-01-01T00:00:00Z";
  expiredApproval.release_approval_digest = evidenceDigest(expiredApproval, ["release_approval_digest"]);
  fs.writeFileSync(path.join(root, expiredApprovalRef), [
    "# Release Approval Record: expired-release-approval", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(expiredApproval, null, 2), "```", "", "## Outcome", "", "`RELEASE_APPROVAL_VALID`", "",
  ].join("\n"));
  const expiredApprovalCheck = runNode([
    "scripts/check-release-approval-record.mjs", root, "--report", expiredApprovalRef, "--require-approved",
  ]);
  if (expiredApprovalCheck.status !== 0 && `${expiredApprovalCheck.stdout}\n${expiredApprovalCheck.stderr}`.includes("expired")) pass("1.93 expired release approval is rejected");
  else fail(`1.93 expired release approval must be rejected: ${expiredApprovalCheck.stderr || expiredApprovalCheck.stdout}`);

  fs.appendFileSync(candidateFile, "\nCandidate changed after approval.\n");
  const staleCandidateCheck = runNode(["scripts/check-release-approval-record.mjs", root, "--report", approvalRef, "--require-approved"]);
  if (staleCandidateCheck.status !== 0 && `${staleCandidateCheck.stdout}\n${staleCandidateCheck.stderr}`.includes("release candidate digest")) pass("1.93 candidate drift invalidates release approval");
  else fail(`1.93 candidate drift must invalidate approval: ${staleCandidateCheck.stderr || staleCandidateCheck.stdout}`);
  fs.writeFileSync(candidateFile, candidateOriginal);

  fs.appendFileSync(path.join(root, "docs/release-sop.md"), "\nRelease procedure changed after approval.\n");
  const stagedChange = spawnSync("git", ["-C", root, "add", "docs/release-sop.md"], { encoding: "utf8" });
  const headChange = stagedChange.status === 0
    ? spawnSync("git", ["-C", root, "commit", "-m", "revision changed"], { encoding: "utf8" })
    : stagedChange;
  const staleRevisionCheck = runNode(["scripts/check-release-approval-record.mjs", root, "--report", approvalRef, "--require-approved"]);
  if (headChange.status === 0 && staleRevisionCheck.status !== 0 && `${staleRevisionCheck.stdout}\n${staleRevisionCheck.stderr}`.includes("project_identity")) pass("1.93 project revision change invalidates release approval");
  else fail(`1.93 project revision drift must invalidate approval: ${headChange.stderr || staleRevisionCheck.stderr || staleRevisionCheck.stdout}`);
}
function checkBaselineManifestPublicEntryConsolidationProtocol() {
  const plan = read("docs/plans/baseline-manifest-public-entry-consolidation-1.94-plan.md");
  for (const marker of [
    "BL1_STANDARD",
    "Managed IntentOS assets",
    "controlled init/update plan",
    "real schema validation",
    "The user is not expected",
  ]) {
    if (plan.toLowerCase().includes(marker.toLowerCase())) pass(`1.94 plan includes ${marker}`);
    else fail(`1.94 plan missing ${marker}`);
  }

  const bl1Root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-bl1-"));
  fs.mkdirSync(path.join(bl1Root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(bl1Root, "docs/baseline-selection.md"), "# Baseline Selection\n\n## Baseline Level\n\nBL1_STANDARD\n");
  const bl1Check = runNode(["scripts/check-baseline-enforcement.mjs", bl1Root, "--json"]);
  let bl1Evidence = null;
  try { bl1Evidence = JSON.parse(bl1Check.stdout); } catch {}
  if (bl1Check.status === 0 && bl1Evidence?.baselineLevel === "BL1") pass("1.94 BL1_STANDARD is enforced as BL1");
  else fail(`1.94 BL1_STANDARD classification failed: ${bl1Check.stderr || bl1Check.stdout}`);

  const managedSignalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-managed-signals-"));
  fs.mkdirSync(path.join(managedSignalRoot, ".intentos", "managed-web-app"), { recursive: true });
  fs.writeFileSync(path.join(managedSignalRoot, ".intentos/managed-web-app/package.json"), JSON.stringify({ dependencies: { react: "1.0.0" } }));
  const signalCheck = runNode(["scripts/baseline-project.mjs", managedSignalRoot, "--json"]);
  let signalEvidence = null;
  try { signalEvidence = JSON.parse(signalCheck.stdout); } catch {}
  if (signalCheck.status === 0 && signalEvidence?.detectedProfileCandidates?.every((item) => item.id !== "web-app")) {
    pass("1.94 managed .intentos assets do not classify the host platform");
  } else {
    fail(`1.94 managed asset signal isolation failed: ${signalCheck.stderr || signalCheck.stdout}`);
  }

  const bl2Root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-bl2-missing-pack-"));
  fs.mkdirSync(bl2Root, { recursive: true });
  const bl2Plan = path.join(bl2Root, "apply-execution-plans", `intentos-1.94-bl2-${Date.now()}.json`);
  const bl2Check = runNode([
    "scripts/init-project.mjs", "--starter", "codex-web-app", "--target", bl2Root,
    "--goal", "create a web project for BL2 baseline validation",
    "--profiles", "web-app", "--baseline-level", "BL2_INDUSTRIAL", "--write-plan", path.relative(bl2Root, bl2Plan),
  ]);
  if (bl2Check.status !== 0 && `${bl2Check.stdout}\n${bl2Check.stderr}`.includes("requires at least one concrete selected industrial pack")) {
    pass("1.94 BL2 without a concrete industrial pack fails closed");
  } else {
    fail(`1.94 BL2 missing-pack path must fail: ${bl2Check.stderr || bl2Check.stdout}`);
  }

  const legacyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-legacy-baseline-"));
  const legacyPlan = path.join(legacyRoot, "baseline-plan.json");
  fs.writeFileSync(legacyPlan, JSON.stringify({
    planType: "BASELINE_WRITE_PLAN",
    targetRoot: legacyRoot,
    writes: [{ path: "docs/should-not-exist.md", content: "forbidden legacy write" }],
  }));
  const legacyApply = runNode(["scripts/baseline-project.mjs", "--apply-plan", legacyPlan]);
  if (legacyApply.status !== 0 && !fs.existsSync(path.join(legacyRoot, "docs/should-not-exist.md"))) {
    pass("1.94 retired direct baseline apply performs no target write");
  } else {
    fail("1.94 retired direct baseline apply wrote a target file");
  }

  const outsideProposal = path.join(path.dirname(legacyRoot), `${path.basename(legacyRoot)}-outside.json`);
  const unsafeProposal = runNode([
    "scripts/baseline-project.mjs", legacyRoot, "--write-plan", `../${path.basename(outsideProposal)}`,
  ]);
  if (unsafeProposal.status !== 0 && !fs.existsSync(outsideProposal)) {
    pass("1.94 baseline proposal output cannot escape the target project");
  } else {
    fail("1.94 baseline proposal output escaped the target project");
  }

  const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-install-"));
  const installPlan = path.join(installRoot, "apply-execution-plans", `intentos-1.94-install-${Date.now()}.json`);
  const planResult = runNode([
    "scripts/init-project.mjs", "--starter", "codex-web-app", "--target", installRoot,
    "--goal", "create a web project for controlled baseline installation validation",
    "--profiles", "web-app", "--baseline-level", "BL1_STANDARD", "--write-plan", path.relative(installRoot, installPlan),
  ]);
  if (planResult.status !== 0) {
    fail(`1.94 controlled baseline plan generation failed: ${planResult.stderr || planResult.stdout}`);
    return;
  }
  const generatedPlan = JSON.parse(fs.readFileSync(installPlan, "utf8"));
  const generatedDocs = new Set(generatedPlan.actions
    .filter((action) => action.willWrite && typeof action.inlineContentBase64 === "string")
    .map((action) => action.path));
  if (["docs/project-profile.md", "docs/baseline-selection.md", "docs/baseline-evidence.md"].every((item) => generatedDocs.has(item))) {
    pass("1.94 controlled plan binds generated baseline records");
  } else {
    fail("1.94 controlled plan is missing generated baseline records");
  }
  const applyResult = runNode(approvedInitProjectApplyArgs(installPlan));
  if (applyResult.status === 2
    && `${applyResult.stdout}\n${applyResult.stderr}`.includes("ordinary new-project command")
    && !fs.existsSync(path.join(installRoot, "docs/project-profile.md"))) {
    pass("1.94 standalone new-project baseline apply is retired in favor of the request-bound ordinary entry");
  } else {
    fail(`1.94 standalone new-project baseline apply must fail closed without creating target files: ${applyResult.stderr || applyResult.stdout}`);
  }
}
function checkOperatingModelConsolidationProtocol() {
  const plan = read("docs/plans/operating-model-consolidation-1.95-plan.md");
  const core = read("core/operating-model.md");
  const usage = read("docs/operating-model.md");
  const resolver = read("scripts/resolve-operating-loop.mjs");
  const prWorkflow = read(".github/workflows/intentos-pr-checks.yml");
  const releaseWorkflow = read(".github/workflows/intentos-release-checks.yml");

  for (const marker of [
    "Project Entry",
    "Operating Loop",
    "Evidence Trace",
    "Authority Recommendation",
    "BL2 must not automatically classify every task as HIGH",
    "does not add a new governance authority",
  ]) {
    if (plan.includes(marker)) pass(`1.95 plan includes ${marker}`);
    else fail(`1.95 plan missing ${marker}`);
  }
  for (const marker of [
    "START_PROJECT",
    "CONTINUE_TASK",
    "CHECK_STATUS",
    "FINISH_TASK",
    "PREPARE_RELEASE",
    "ADOPT_PROJECT",
    "derived read-only view",
  ]) {
    if (`${core}\n${resolver}`.includes(marker)) pass(`1.95 operating model includes ${marker}`);
    else fail(`1.95 operating model missing ${marker}`);
  }
  if (usage.includes("cli.mjs work") && usage.includes("--help-advanced")) {
    pass("1.95 usage exposes one natural-language work entry and advanced maintenance help");
  } else {
    fail("1.95 usage must expose work and explicit advanced help");
  }
  for (const forbidden of ["evidence-graph-reports", "operating-state-reports", "authority-recommendation-records"]) {
    if (!read("intentos-manifest.json").includes(forbidden)) pass(`1.95 does not add parallel artifact directory ${forbidden}`);
    else fail(`1.95 must not add parallel artifact directory ${forbidden}`);
  }
  if (prWorkflow.includes("CHECK_STATUS")
    && releaseWorkflow.includes("CHECK_STATUS")
    && prWorkflow.includes("Operating Decision status route failed")
    && releaseWorkflow.includes("Operating Decision status route failed")) {
    pass("1.95 PR and release CI assert the Operating Model route instead of only its exit code");
  } else {
    fail("1.95 PR and release CI must assert the CHECK_STATUS route");
  }
  if (releaseWorkflow.includes("candidate_git_revision")
    && releaseWorkflow.includes("candidate_digest")
    && releaseWorkflow.includes("check-release-acceptance.mjs")
    && releaseWorkflow.includes("package.json")) {
    pass("1.95 release CI binds the accepted candidate revision and package version evidence");
  } else {
    fail("1.95 release CI must bind the accepted candidate revision and package version evidence");
  }

  const tests = runNode(["--test", "tests/operating-model.test.mjs"]);
  const testCount = Number(tests.stdout.match(/^(?:#|ℹ) tests (\d+)$/m)?.[1] || 0);
  const passCount = Number(tests.stdout.match(/^(?:#|ℹ) pass (\d+)$/m)?.[1] || 0);
  const failCount = Number(tests.stdout.match(/^(?:#|ℹ) fail (\d+)$/m)?.[1] ?? -1);
  if (tests.status === 0 && testCount >= 38 && passCount === testCount && failCount === 0) {
    pass("1.95 Operating Model and current decision-contract regression tests");
  } else {
    fail(`1.95 Operating Model tests failed: ${tests.stderr || tests.stdout}`);
  }
}
function checkOperatingDecisionContractProtocol() {
  const plan = read("docs/plans/operating-decision-contract-1.96-plan.md");
  const core = read("core/operating-model.md");
  const usage = read("docs/operating-model.md");
  const resolver = read("scripts/resolve-operating-loop.mjs");
  const manifest = read("intentos-manifest.json");
  const workflows = `${read(".github/workflows/intentos-pr-checks.yml")}\n${read(".github/workflows/intentos-release-checks.yml")}`;

  for (const marker of [
    "Operating Decision Contract",
    "exactly one `actionCode`",
    "materialActionAuthorized",
    "sourceInputs",
    "Project Identity Projection belongs to 1.97",
    "Internal surface consolidation",
  ]) {
    if (plan.includes(marker)) pass(`1.96 plan includes ${marker}`);
    else fail(`1.96 plan missing ${marker}`);
  }
  for (const marker of [
    "operatingDecision",
    "PREPARE_PROJECT_PLAN",
    "INSPECT_TASK_RISK",
    "PREPARE_BUSINESS_RULE_CLOSURE",
    "COMPLETE_CLOSURE_EVIDENCE",
    "REPORT_TASK_COMPLETE",
    "materialActionAuthorized: \"No\"",
    "decisionDigest",
  ]) {
    if (`${core}\n${usage}\n${resolver}`.includes(marker)) pass(`1.96 Operating Decision includes ${marker}`);
    else fail(`1.96 Operating Decision missing ${marker}`);
  }
  for (const forbidden of ["operating-decision-reports", "decision-engine-reports", "authority-decision-records"]) {
    if (!manifest.includes(forbidden)) pass(`1.96 does not add parallel artifact directory ${forbidden}`);
    else fail(`1.96 must not add parallel artifact directory ${forbidden}`);
  }
  if (workflows.includes("SUMMARIZE_CURRENT_STATUS")
    && workflows.includes("PREPARE_PROJECT_PLAN")
    && workflows.includes("materialActionAuthorized")) {
    pass("1.96 PR and release CI assert structured Operating Decisions");
  } else {
    fail("1.96 PR and release CI must assert structured Operating Decisions");
  }

  const operating = runNode(["scripts/cli.mjs", "work", ".", "检查当前项目状态", "--json"]);
  try {
    const parsed = JSON.parse(operating.stdout);
    const decision = parsed.operatingDecision;
    const sourceNames = new Set((parsed.sourceSystemTrace || []).map((source) => source.sourceSystem));
    if (operating.status === 0
      && parsed.schemaVersion === "1.99.0"
      && decision?.contractVersion === "1.99.0"
      && decision?.actionCode === "SUMMARIZE_CURRENT_STATUS"
      && decision?.materialActionAuthorized === "No"
      && parsed.humanSummary?.nextSafeAction === decision?.plainAction
      && Array.isArray(decision?.sourceInputs)
      && decision.sourceInputs.every((source) => sourceNames.has(source.sourceSystem))
      && decision.sourceInputs.every((source) => /^sha256:[a-f0-9]{64}$/.test(source.semanticDigest || ""))
      && /^sha256:[a-f0-9]{64}$/.test(decision?.decisionDigest || "")) {
      pass("1.96 work returns one traceable, non-authorizing Operating Decision");
    } else {
      fail(`1.96 work returned an invalid Operating Decision: ${operating.stderr || operating.stdout}`);
    }
  } catch (error) {
    fail(`1.96 work output is not valid JSON: ${error.message}`);
  }
}
function checkProjectIdentityProjectionProtocol() {
  const plan = read("docs/plans/project-identity-projection-1.97-plan.md");
  const core = read("core/operating-model.md");
  const usage = read("docs/operating-model.md");
  const resolver = read("scripts/resolve-operating-loop.mjs");
  const workflowNext = read("scripts/workflow-next.mjs");
  const manifest = read("intentos-manifest.json");
  const workflows = `${read(".github/workflows/intentos-pr-checks.yml")}\n${read(".github/workflows/intentos-release-checks.yml")}`;

  for (const marker of [
    "Project Identity Projection",
    "Evidence Authority keeps responsibility",
    "NO_PRODUCTION_EVIDENCE",
    "Operating Decision Binding",
    "Internal command and source-system surface consolidation belongs to 1.98",
  ]) {
    if (plan.includes(marker)) pass(`1.97 plan includes ${marker}`);
    else fail(`1.97 plan missing ${marker}`);
  }
  for (const marker of [
    "projectIdentityProjection",
    "projectKind",
    "governancePosture",
    "productionPosture",
    "worktreePosture",
    "evidenceIdentity",
    "projectionDigest",
    "grantsAuthority: \"No\"",
  ]) {
    if (`${core}\n${usage}\n${resolver}`.includes(marker)) pass(`1.97 Project Identity Projection includes ${marker}`);
    else fail(`1.97 Project Identity Projection missing ${marker}`);
  }
  if (workflowNext.includes("selectedProfiles: platformBaseline.selectedProfiles")) {
    pass("1.97 Workflow Next exposes selected profiles as structured source data");
  } else {
    fail("1.97 Workflow Next must expose selected profiles as structured source data");
  }
  for (const forbidden of ["project-identity-reports", "project-projection-reports", "project-classification-records"]) {
    if (!manifest.includes(forbidden)) pass(`1.97 does not add parallel artifact directory ${forbidden}`);
    else fail(`1.97 must not add parallel artifact directory ${forbidden}`);
  }
  if (workflows.includes("projectIdentityProjection")
    && workflows.includes("INTENTOS_SOURCE")
    && workflows.includes("NOT_ESTABLISHED")
    && workflows.includes("grantsAuthority")) {
    pass("1.97 PR and release CI assert source and generated Project Identity projections");
  } else {
    fail("1.97 PR and release CI must assert source and generated Project Identity projections");
  }

  const operating = runNode(["scripts/cli.mjs", "work", ".", "检查当前项目状态", "--json"]);
  try {
    const parsed = JSON.parse(operating.stdout);
    const projection = parsed.projectIdentityProjection;
    const actualIdentity = projectIdentity(kitRoot);
    if (operating.status === 0
      && parsed.schemaVersion === "1.99.0"
      && projection?.contractVersion === "1.109.0"
      && projection?.projectKind === "INTENTOS_SOURCE"
      && projection?.governancePosture === "INTENTOS_SOURCE_GOVERNANCE"
      && projection?.evidenceIdentity?.fingerprint === actualIdentity.fingerprint
      && projection?.evidenceIdentity?.revision === actualIdentity.revision
      && projection?.grantsAuthority === "No"
      && projection?.writesProjectFiles === "No"
      && Array.isArray(projection?.sourceInputs)
      && projection.sourceInputs.every((source) => /^sha256:[a-f0-9]{64}$/.test(source.semanticDigest || ""))
      && /^sha256:[a-f0-9]{64}$/.test(projection?.projectionDigest || "")
      && parsed.operatingDecision?.contractVersion === "1.99.0"
      && /^sha256:[a-f0-9]{64}$/.test(parsed.operatingDecision?.decisionDigest || "")
      && parsed.humanSummary?.projectIdentity
      && !Object.hasOwn(projection, "changedFilesSample")) {
      pass("1.97 work returns one current, traceable, non-authorizing Project Identity Projection");
    } else {
      fail(`1.97 work returned an invalid Project Identity Projection: ${operating.stderr || operating.stdout}`);
    }
  } catch (error) {
    fail(`1.97 work output is not valid JSON: ${error.message}`);
  }
}
function checkReviewContextAuthorityProtocol() {
  const required = [
    "core/review-context-authority.md",
    "core/review-context-authority.json",
    "docs/plans/review-context-authority-1.99.1-plan.md",
    "docs/plans/review-context-enforcement-1.99.2-plan.md",
    "scripts/lib/review-context-authority.mjs",
    "scripts/check-review-context-authority.mjs",
    "tests/review-context-authority.test.mjs",
    "releases/1.99.1/release-record.md",
    "releases/1.99.1/known-limitations.md",
    "releases/1.99.1/self-check-report.md",
    "releases/1.99.2/release-record.md",
    "releases/1.99.2/known-limitations.md",
    "releases/1.99.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.99.2 review-context authority asset exists: ${file}`);
    else fail(`1.99.2 review-context authority asset missing: ${file}`);
  }

  const combined = [
    read("core/review-context-authority.md"),
    read("core/review-context-authority.json"),
    read("prompts/reviewer-agent.md"),
    read("templates/gpt-review-prompt.md"),
    read("platforms/codex/AGENTS.template.md"),
    read("starters/codex-web-app/AGENTS.md"),
    read("README.md"),
    read("README.zh-CN.md"),
  ].join("\n");
  for (const marker of [
    "CURRENT_PRODUCT_CONTRACT",
    "COMPATIBILITY_SCHEMA",
    "HISTORICAL_RECORD",
    "UNCLASSIFIED",
    "CONFLICTING",
    "ZERO_EXPERIENCE_SOLO_DEVELOPER",
    "North-Star Alignment",
    "Compatibility / History Notes",
    "CURRENT_CONVERSATION_USER",
    "Industrial depth does not imply",
  ]) {
    if (combined.includes(marker)) pass(`1.99.2 review-context authority includes ${marker}`);
    else fail(`1.99.2 review-context authority missing ${marker}`);
  }

  const checker = runNode(["scripts/check-review-context-authority.mjs"]);
  if (checker.status === 0 && checker.stdout.includes("Review context authority check passed")) {
    pass("1.99.2 review-context authority checker");
  } else {
    fail(`1.99.2 review-context authority checker failed: ${checker.stderr || checker.stdout}`);
  }

  const tests = runNode(["--test", "tests/review-context-authority.test.mjs"]);
  if (tests.status === 0) pass("1.99.2 review-context authority regression tests");
  else fail(`1.99.2 review-context authority regression tests failed: ${tests.stderr || tests.stdout}`);
}
function checkActiveGuidanceSemanticHardcutProtocol() {
  const required = [
    "docs/plans/active-guidance-semantic-hardcut-1.104.1-plan.md",
    "tests/active-guidance-semantic-hardcut.test.mjs",
    "releases/1.104.1/release-record.md",
    "releases/1.104.1/known-limitations.md",
    "releases/1.104.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.104.1 semantic hardcut asset exists: ${file}`);
    else fail(`1.104.1 semantic hardcut asset missing: ${file}`);
  }

  const authority = JSON.parse(read("core/review-context-authority.json"));
  const expectedClasses = [
    "NO_USER_ACTION",
    "BUSINESS_FACT_NEEDED",
    "REAL_WORLD_CONSENT_NEEDED",
    "EXTERNAL_FACT_NEEDED",
  ];
  if (authority.schemaVersion === currentVersion()) pass("1.104.1 review-context authority follows the current product version");
  else fail("1.104.1 review-context authority does not follow the current product version");
  if (JSON.stringify(authority.currentProductContract?.userDecisionClasses) === JSON.stringify(expectedClasses)) {
    pass("1.104.1 user decision classes are exact");
  } else {
    fail("1.104.1 user decision classes drifted");
  }

  for (const marker of [
    "TECHNICAL_DECISION_DELEGATED_TO_USER",
    "TECHNICAL_CONFIRMATION_REQUIRED",
    "TECHNICAL_CHOICE_QUESTION",
    "TECHNICAL_CHOICE_TABLE",
    "BLANKET_TECHNICAL_APPROVAL_GATE",
  ]) {
    if (authority.forbiddenReviewInferences?.includes(marker)) pass(`1.104.1 authority forbids ${marker}`);
    else fail(`1.104.1 authority does not forbid ${marker}`);
  }

  const focused = runNode(["--test", "tests/active-guidance-semantic-hardcut.test.mjs"]);
  if (focused.status === 0) pass("1.104.1 active-guidance semantic regressions");
  else fail(`1.104.1 active-guidance semantic regressions failed: ${focused.stderr || focused.stdout}`);
}
function checkActiveGuidanceDistributionCloseoutProtocol() {
  for (const file of [
    "docs/plans/active-guidance-distribution-closeout-1.107.1-plan.md",
    "tests/active-guidance-distribution-closeout.test.mjs",
    "releases/1.107.1/release-record.md",
    "releases/1.107.1/known-limitations.md",
    "releases/1.107.1/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.107.1 guidance distribution asset exists: ${file}`);
    else fail(`1.107.1 guidance distribution asset missing: ${file}`);
  }

  const authority = JSON.parse(read("core/review-context-authority.json"));
  const formal = authority.currentProductContract?.formalAgentPlatforms || [];
  const compatibility = authority.currentProductContract?.compatibilityAgentPlatforms || [];
  if (JSON.stringify(formal) === JSON.stringify(["CODEX"])) pass("1.107.1 Codex is the only formal agent platform");
  else fail("1.107.1 formal agent platform set drifted");
  if (JSON.stringify(compatibility) === JSON.stringify(["CLAUDE", "CURSOR"])) pass("1.107.1 Claude and Cursor are compatibility-only");
  else fail("1.107.1 compatibility platform set drifted");
  if ((authority.activeGuidanceProducers || []).some((row) => row.source === "scripts/init-project.mjs")) {
    pass("1.107.1 init-project is an active guidance producer");
  } else {
    fail("1.107.1 init-project is missing from active guidance producers");
  }

  const manifest = JSON.parse(read("intentos-manifest.json"));
  const adapters = manifest.groups?.platformAdapters || [];
  if (adapters.some((value) => value.startsWith("platforms/codex/"))
    && !adapters.some((value) => value.startsWith("platforms/claude/") || value.startsWith("platforms/cursor/"))) {
    pass("1.107.1 manifest exposes Codex without Claude/Cursor parity claims");
  } else {
    fail("1.107.1 formal platform adapter distribution drifted");
  }

  const focused = runNode(["--test", "tests/active-guidance-distribution-closeout.test.mjs"]);
  if (focused.status === 0) pass("1.107.1 source and generated guidance distribution regressions");
  else fail(`1.107.1 guidance distribution regressions failed: ${focused.stderr || focused.stdout}`);
}
function checkBusinessUniverseCoverageProtocol() {
  const assets = [
    "core/business-universe-coverage.md",
    "docs/business-universe-coverage.md",
    "docs/plans/business-universe-coverage-1.108-plan.md",
    "checklists/business-universe-coverage-review.md",
    "prompts/business-universe-coverage-agent.md",
    "templates/business-universe-coverage-report.md",
    "schemas/artifacts/business-universe-coverage.schema.json",
    "scripts/lib/business-universe.mjs",
    "scripts/resolve-business-universe-coverage.mjs",
    "scripts/check-business-universe-coverage.mjs",
    "tests/business-universe-consumer-chain.test.mjs",
    "tests/business-universe-coverage.test.mjs",
    "tests/business-universe-existing-project-scan.test.mjs",
    "tests/verification-runtime-consumer.test.mjs",
    "business-universe-coverage-reports/.gitkeep",
    "examples/1.108-business-universe-coverage/README.md",
    "releases/1.108.0/release-record.md",
    "releases/1.108.0/known-limitations.md",
    "releases/1.108.0/self-check-report.md",
  ];
  for (const file of assets) {
    if (exists(file)) pass(`1.108 business universe asset exists: ${file}`);
    else fail(`1.108 business universe asset missing: ${file}`);
  }

  const core = read("core/business-universe-coverage.md");
  for (const marker of [
    "conditional internal evidence",
    "NOT_REQUIRED_WITH_REASON",
    "Business Rule Closure",
    "Unified Closure",
    "zero-experience",
  ]) {
    if (core.includes(marker)) pass(`1.108 business universe core includes ${marker}`);
    else fail(`1.108 business universe core missing ${marker}`);
  }

  const focused = runNode(["--test", "tests/business-universe-coverage.test.mjs"]);
  if (focused.status === 0) pass("1.108 business universe regressions");
  else fail(`1.108 business universe regressions failed: ${focused.stderr || focused.stdout}`);
  const consumerFocused = runNode(["--test", "tests/business-universe-consumer-chain.test.mjs"]);
  if (consumerFocused.status === 0) pass("1.108 risk-proportionate consumer-chain regressions");
  else fail(`1.108 consumer-chain regressions failed: ${consumerFocused.stderr || consumerFocused.stdout}`);
  const existingProjectFocused = runNode(["--test", "tests/business-universe-existing-project-scan.test.mjs"]);
  if (existingProjectFocused.status === 0) pass("1.108 existing-project discovery regressions");
  else fail(`1.108 existing-project discovery regressions failed: ${existingProjectFocused.stderr || existingProjectFocused.stdout}`);
  const runtimeConsumerFocused = runNode(["--test", "tests/verification-runtime-consumer.test.mjs"]);
  if (runtimeConsumerFocused.status === 0) pass("1.108 proof-strength runtime consumer regressions");
  else fail(`1.108 runtime consumer regressions failed: ${runtimeConsumerFocused.stderr || runtimeConsumerFocused.stdout}`);

  const compatibilityEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "business-universe-empty-"));
  const compatibilityEmpty = runNode(["scripts/check-business-universe-coverage.mjs", compatibilityEmptyRoot, "--allow-empty"]);
  if (compatibilityEmpty.status === 0) pass("1.108 explicit compatibility empty state remains readable");
  else fail(`1.108 compatibility empty-state check failed: ${compatibilityEmpty.stderr || compatibilityEmpty.stdout}`);
  const strictEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.108-strict-empty-"));
  const strictEmpty = runNode([
    "scripts/check-business-universe-coverage.mjs", strictEmptyRoot, "--allow-empty", "--require-ready",
  ]);
  if (strictEmpty.status !== 0) pass("1.108 strict business universe requirement cannot be bypassed by allow-empty");
  else fail("1.108 strict business universe requirement was bypassed by allow-empty");

  const generatedAssets = [
    ".intentos/core/business-universe-coverage.md",
    ".intentos/docs/business-universe-coverage.md",
    ".intentos/checklists/business-universe-coverage-review.md",
    ".intentos/prompts/business-universe-coverage-agent.md",
    ".intentos/templates/business-universe-coverage-report.md",
    ".intentos/schemas/artifacts/business-universe-coverage.schema.json",
    "scripts/lib/business-universe.mjs",
    "scripts/resolve-business-universe-coverage.mjs",
    "scripts/check-business-universe-coverage.mjs",
    "business-universe-coverage-reports/.gitkeep",
  ];
  for (const starter of ["generic-project", "codex-web-app", "codex-ios-app", "codex-android-app"]) {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-1.108-${starter}-`));
    const init = runNode([
      path.join(kitRoot, "scripts/init-project.mjs"),
      "--target", target,
      "--starter", starter,
      "--goal", `create a ${starter} project for business universe distribution verification`,
    ]);
    if (init.status !== 0) {
      fail(`1.108 ${starter} initialization failed: ${init.stderr || init.stdout}`);
      continue;
    }
    const missing = generatedAssets.filter((file) => !fs.existsSync(path.join(target, file)));
    if (missing.length === 0) pass(`1.108 ${starter} distributes complete business universe assets`);
    else fail(`1.108 ${starter} is missing generated assets: ${missing.join(", ")}`);
  }

  const profileFixtures = [
    ["wechat-miniprogram", "miniprogram/pages/form/index.js"],
    ["backend-api", "services/api/handlers/rule.ts"],
    ["internal-admin", "src/admin/workflows/rule.ts"],
  ];
  for (const [profile, sourcePath] of profileFixtures) {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-1.108-${profile}-`));
    const init = runNode([
      path.join(kitRoot, "scripts/init-project.mjs"),
      "--target", target,
      "--starter", "generic-project",
      "--goal", `create a ${profile} project for business universe routing verification`,
    ]);
    if (init.status !== 0) {
      fail(`1.108 ${profile} generated profile fixture initialization failed: ${init.stderr || init.stdout}`);
      continue;
    }
    const sourceFile = path.join(target, sourcePath);
    fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
    fs.writeFileSync(sourceFile, "export function validateAlphaBeta() { return 'alpha beta shared validation'; }\n");
    if (profile === "wechat-miniprogram") {
      fs.writeFileSync(path.join(target, "project.config.json"), "{\"miniprogramRoot\":\"miniprogram\"}\n");
    }
    const intent = "Update label: alpha and beta entries share the same display copy";
    const governanceRef = "task-governance-reports/1.108-profile-smoke.md";
    const governance = runNode([
      path.join(target, "scripts/resolve-task-governance.mjs"), target,
      "--intent", intent,
      "--task-kind", "code_behavior",
      "--out", governanceRef,
    ]);
    const governanceEvidence = governance.status === 0
      ? extractMachineReadableEvidence(fs.readFileSync(path.join(target, governanceRef), "utf8"))
      : null;
    const coverageRef = "business-universe-coverage-reports/1.108-profile-smoke.md";
    const coverage = runNode([
      path.join(target, "scripts/resolve-business-universe-coverage.mjs"), target,
      "--intent", intent,
      "--task-governance-ref", `artifact:${governanceRef}`,
      "--out", coverageRef,
    ]);
    const coverageEvidence = coverage.status === 0
      ? extractMachineReadableEvidence(fs.readFileSync(path.join(target, coverageRef), "utf8"))
      : null;
    if (governanceEvidence?.ok
      && governanceEvidence.value.impact_classification?.task_impact === "MEDIUM"
      && governanceEvidence.value.business_universe_routing?.routing_result === "REQUIRED_WITH_EVIDENCE"
      && coverageEvidence?.ok
      && coverageEvidence.value.outcome === "BLOCKED_INCOMPLETE_UNIVERSE"
      && (coverageEvidence.value.discovery_projection?.candidate_sources || []).some((ref) => ref.endsWith(sourcePath))) {
      pass(`1.108 ${profile} generated profile fixture executes routing and semantic discovery`);
    } else {
      fail(`1.108 ${profile} generated profile fixture did not execute the Business Universe contract: ${governance.stderr || coverage.stderr || governance.stdout || coverage.stdout}`);
    }
  }
}
function checkControlEffectivenessProtocol() {
  const assets = [
    "core/control-effectiveness.md",
    "docs/control-effectiveness.md",
    "docs/plans/control-effectiveness-1.110-plan.md",
    "checklists/control-effectiveness-review.md",
    "prompts/control-effectiveness-agent.md",
    "templates/control-effectiveness-report.md",
    "schemas/artifacts/control-effectiveness.schema.json",
    "scripts/lib/control-effectiveness.mjs",
    "scripts/resolve-control-effectiveness.mjs",
    "scripts/check-control-effectiveness.mjs",
    "tests/control-effectiveness.test.mjs",
    "tests/control-effectiveness-consumer-chain.test.mjs",
    "tests/control-effectiveness-adoption.test.mjs",
    "control-effectiveness-reports/.gitkeep",
    "releases/1.110.0/release-record.md",
    "releases/1.110.0/known-limitations.md",
    "releases/1.110.0/self-check-report.md",
  ];
  for (const file of assets) {
    if (exists(file)) pass(`1.110 control effectiveness asset exists: ${file}`);
    else fail(`1.110 control effectiveness asset missing: ${file}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const command of ["control-effectiveness", "control-effectiveness-check"]) {
    if (cli.includes(`\"${command}\"`)) pass(`1.110 advanced CLI exposes ${command}`);
    else fail(`1.110 advanced CLI missing ${command}`);
  }
  if (cli.includes("work:") && !cli.match(/work:[\s\S]{0,500}control-effectiveness/)) {
    pass("1.110 keeps Control Effectiveness behind the existing public work entry");
  } else {
    fail("1.110 must not add Control Effectiveness as an ordinary-user workflow choice");
  }

  const focused = runNode([
    "--test",
    "tests/control-effectiveness.test.mjs",
    "tests/control-effectiveness-consumer-chain.test.mjs",
    "tests/control-effectiveness-adoption.test.mjs",
  ]);
  if (focused.status === 0) pass("1.110 control effectiveness and consumer-chain regressions");
  else fail(`1.110 control effectiveness regressions failed: ${focused.stderr || focused.stdout}`);

  const compatibilityEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "control-effectiveness-empty-"));
  const compatibilityEmpty = runNode(["scripts/check-control-effectiveness.mjs", compatibilityEmptyRoot, "--allow-empty"]);
  if (compatibilityEmpty.status === 0) pass("1.110 explicit non-strict empty state remains readable");
  else fail(`1.110 compatibility empty-state check failed: ${compatibilityEmpty.stderr || compatibilityEmpty.stdout}`);
  const strictEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.110-strict-empty-"));
  const strictEmpty = runNode(["scripts/check-control-effectiveness.mjs", strictEmptyRoot, "--allow-empty", "--require-effective"]);
  if (strictEmpty.status !== 0) pass("1.110 strict effectiveness cannot be bypassed by allow-empty");
  else fail("1.110 strict effectiveness was bypassed by allow-empty");

  const generatedAssets = [
    ".intentos/core/control-effectiveness.md",
    ".intentos/docs/control-effectiveness.md",
    ".intentos/checklists/control-effectiveness-review.md",
    ".intentos/prompts/control-effectiveness-agent.md",
    ".intentos/templates/control-effectiveness-report.md",
    ".intentos/schemas/artifacts/control-effectiveness.schema.json",
    "scripts/lib/control-effectiveness.mjs",
    "scripts/resolve-control-effectiveness.mjs",
    "scripts/check-control-effectiveness.mjs",
    "control-effectiveness-reports/.gitkeep",
  ];
  for (const starter of ["generic-project", "codex-web-app", "codex-ios-app", "codex-android-app"]) {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-1.110-${starter}-`));
    const init = runNode([
      path.join(kitRoot, "scripts/init-project.mjs"),
      "--target", target,
      "--starter", starter,
      "--goal", "build a bounded appointment product",
    ]);
    if (init.status !== 0) {
      fail(`1.110 ${starter} initialization failed: ${init.stderr || init.stdout}`);
      continue;
    }
    const missing = generatedAssets.filter((file) => !fs.existsSync(path.join(target, file)));
    if (missing.length === 0) pass(`1.110 ${starter} distributes complete Control Effectiveness assets`);
    else fail(`1.110 ${starter} is missing generated assets: ${missing.join(", ")}`);
    const installed = spawnSync(process.execPath, [path.join(target, "scripts/check-control-effectiveness.mjs"), target, "--allow-empty"], {
      cwd: target,
      encoding: "utf8",
    });
    if (installed.status === 0) pass(`1.110 ${starter} installed checker runs without source checkout dependencies`);
    else fail(`1.110 ${starter} installed checker failed: ${installed.stderr || installed.stdout}`);
  }
}
function checkUnderstandingPlanningClosureProtocol() {
  const assets = [
    "core/understanding-planning-closure.md",
    "docs/understanding-planning-closure.md",
    "docs/plans/understanding-planning-closure-1.111-plan.md",
    "checklists/planning-closure-review.md",
    "prompts/planning-closure-agent.md",
    "templates/planning-closure-report.md",
    "schemas/artifacts/planning-closure.schema.json",
    "scripts/lib/planning-closure.mjs",
    "scripts/resolve-planning-closure.mjs",
    "scripts/check-planning-closure.mjs",
    "scripts/check-execution-entry-contract.mjs",
    "tests/understanding-planning-closure.test.mjs",
    "tests/understanding-planning-consumer-chain.test.mjs",
    "tests/understanding-planning-public-ux.test.mjs",
    "planning-closure-reports/.gitkeep",
    "releases/1.111.0/release-record.md",
    "releases/1.111.0/known-limitations.md",
    "releases/1.111.0/self-check-report.md",
  ];
  for (const file of assets) {
    if (exists(file)) pass(`1.111 Planning Closure asset exists: ${file}`);
    else fail(`1.111 Planning Closure asset missing: ${file}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const command of ["planning-closure", "planning-closure-check", "execution-entry-contract-check"]) {
    if (cli.includes(`\"${command}\"`)) pass(`1.111 advanced CLI exposes ${command}`);
    else fail(`1.111 advanced CLI missing ${command}`);
  }
  if (cli.includes("work:") && !cli.match(/work:[\s\S]{0,500}planning-closure/)) {
    pass("1.111 keeps Planning Closure behind the existing public work entry");
  } else {
    fail("1.111 must not add Planning Closure as an ordinary-user workflow choice");
  }

  const focused = runNode([
    "--test",
    "tests/understanding-planning-closure.test.mjs",
    "tests/understanding-planning-consumer-chain.test.mjs",
    "tests/understanding-planning-public-ux.test.mjs",
  ]);
  if (focused.status === 0) pass("1.111 Planning Closure and public-entry regressions");
  else fail(`1.111 Planning Closure regressions failed: ${focused.stderr || focused.stdout}`);

  const compatibilityEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "planning-closure-empty-"));
  const compatibilityEmpty = runNode(["scripts/check-planning-closure.mjs", compatibilityEmptyRoot, "--allow-empty"]);
  if (compatibilityEmpty.status === 0) pass("1.111 explicit non-strict empty state remains readable");
  else fail(`1.111 compatibility empty-state check failed: ${compatibilityEmpty.stderr || compatibilityEmpty.stdout}`);
  const strictEmpty = runNode(["scripts/check-planning-closure.mjs", compatibilityEmptyRoot, "--allow-empty", "--require-ready"]);
  if (strictEmpty.status !== 0) pass("1.111 strict planning readiness cannot be bypassed by allow-empty");
  else fail("1.111 strict planning readiness was bypassed by allow-empty");

  const generatedAssets = [
    ".intentos/core/understanding-planning-closure.md",
    ".intentos/docs/understanding-planning-closure.md",
    ".intentos/checklists/planning-closure-review.md",
    ".intentos/prompts/planning-closure-agent.md",
    ".intentos/templates/planning-closure-report.md",
    ".intentos/schemas/artifacts/planning-closure.schema.json",
    "scripts/lib/planning-closure.mjs",
    "scripts/resolve-planning-closure.mjs",
    "scripts/check-planning-closure.mjs",
    "scripts/check-execution-entry-contract.mjs",
    "planning-closure-reports/.gitkeep",
  ];
  for (const starter of ["generic-project", "codex-web-app", "codex-ios-app", "codex-android-app"]) {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-1.111-${starter}-`));
    const init = runNode([
      path.join(kitRoot, "scripts/init-project.mjs"),
      "--target", target,
      "--starter", starter,
      "--goal", "build a bounded appointment product",
    ]);
    if (init.status !== 0) {
      fail(`1.111 ${starter} initialization failed: ${init.stderr || init.stdout}`);
      continue;
    }
    const missing = generatedAssets.filter((file) => !fs.existsSync(path.join(target, file)));
    if (missing.length === 0) pass(`1.111 ${starter} distributes complete Planning Closure assets`);
    else fail(`1.111 ${starter} is missing generated assets: ${missing.join(", ")}`);
    const installed = spawnSync(process.execPath, [path.join(target, "scripts/check-planning-closure.mjs"), target, "--allow-empty"], {
      cwd: target,
      encoding: "utf8",
    });
    if (installed.status === 0) pass(`1.111 ${starter} installed checker runs without source checkout dependencies`);
    else fail(`1.111 ${starter} installed checker failed: ${installed.stderr || installed.stdout}`);
  }
}
function checkZeroExperienceSoloOperatingModelProtocol() {
  const required = [
    "core/zero-experience-solo-operating-model.md",
    "docs/plans/zero-experience-solo-operating-model-1.99-plan.md",
    "scripts/lib/solo-operating-model.mjs",
    "scripts/check-solo-operating-model.mjs",
    "releases/1.99.0/release-record.md",
    "releases/1.99.0/known-limitations.md",
    "releases/1.99.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.99 solo operating-model asset exists: ${file}`);
    else fail(`1.99 solo operating-model asset missing: ${file}`);
  }

  const combined = [
    read("core/zero-experience-solo-operating-model.md"),
    read("docs/plans/zero-experience-solo-operating-model-1.99-plan.md"),
    read("scripts/lib/solo-operating-model.mjs"),
    read("scripts/resolve-operating-loop.mjs"),
    read("scripts/resolve-beginner-entry.mjs"),
    read("platforms/codex/AGENTS.template.md"),
    read("templates/approval-record.md"),
    read("README.md"),
    read("README.zh-CN.md"),
  ].join("\n");
  for (const marker of [
    "ZERO_EXPERIENCE_SOLO_DEVELOPER",
    "NO_USER_ACTION",
    "BUSINESS_FACT_NEEDED",
    "REAL_WORLD_CONSENT_NEEDED",
    "EXTERNAL_FACT_NEEDED",
    "technicalDecisionRequiredFromUser",
    "internalRoleSelectionRequiredFromUser",
    "capabilityCoverage",
    "CURRENT_CONVERSATION_USER",
    "Silence is not consent",
  ]) {
    if (combined.includes(marker)) pass(`1.99 solo operating model includes ${marker}`);
    else fail(`1.99 solo operating model missing ${marker}`);
  }

  const checker = runNode(["scripts/check-solo-operating-model.mjs"]);
  if (checker.status === 0 && checker.stdout.includes("Zero-experience solo operating model check passed")) {
    pass("1.99 zero-experience solo operating-model checker");
  } else {
    fail(`1.99 zero-experience solo operating-model checker failed: ${checker.stderr || checker.stdout}`);
  }
}
function checkExecutionAuthorityConsumerHardcutProtocol() {
  for (const file of [
    "docs/plans/execution-authority-consumer-hardcut-1.100-plan.md",
    "scripts/lib/release-action-authority.mjs",
    "scripts/check-consumer-chain.mjs",
    "tests/execution-distribution-trust.test.mjs",
  ]) {
    if (exists(file)) pass(`1.100 execution authority asset exists: ${file}`);
    else fail(`1.100 execution authority asset missing: ${file}`);
  }

  const generatedCi = read("platforms/github/ci-ai-workflow.yml");
  if (generatedCi.includes("scripts/check-consumer-chain.mjs")) pass("1.100 installed CI consumes the current task/completion/release chain");
  else fail("1.100 installed CI is missing the current task/completion/release consumer chain");

  const focused = runNode(["--test", "tests/execution-distribution-trust.test.mjs"]);
  if (focused.status === 0) pass("1.100 execution and distribution trust regressions");
  else fail(`1.100 execution and distribution trust regressions failed: ${focused.stderr || focused.stdout}`);

  const atomic = runNode([
    "--test",
    "--test-name-pattern", "a predeclared action graph safely recovers a partially attempted batch",
    "tests/controlled-apply-transaction.test.mjs",
  ]);
  if (atomic.status === 0) pass("1.100 controlled apply restores a partially attempted action graph atomically");
  else fail(`1.100 controlled apply atomic rollback regression failed: ${atomic.stderr || atomic.stdout}`);
}
function checkReleaseExecutionTopologyProtocol() {
  const assets = [
    "core/release-execution-topology.md",
    "docs/release-execution-topology.md",
    "templates/release-execution-topology-report.md",
    "checklists/release-execution-topology-review.md",
    "prompts/release-execution-topology-agent.md",
    "schemas/artifacts/release-execution-topology.schema.json",
    "scripts/lib/release-execution-topology.mjs",
    "scripts/resolve-release-execution-topology.mjs",
    "scripts/check-release-execution-topology.mjs",
    "tests/release-execution-topology.test.mjs",
    "release-execution-topologies/.gitkeep",
    "core/release-topology-consumer-binding.md",
    "docs/release-topology-consumer-binding.md",
    "checklists/release-topology-consumer-review.md",
    "scripts/lib/release-topology-consumer.mjs",
    "tests/release-topology-consumer.test.mjs",
    "core/release-topology-migration.md",
    "docs/release-topology-migration.md",
    "templates/release-topology-migration-report.md",
    "checklists/release-topology-migration-review.md",
    "prompts/release-topology-migration-agent.md",
    "schemas/artifacts/release-topology-migration.schema.json",
    "scripts/lib/release-topology-migration.mjs",
    "scripts/resolve-release-topology-migration.mjs",
    "scripts/check-release-topology-migration.mjs",
    "tests/release-topology-migration.test.mjs",
    "release-topology-migrations/.gitkeep",
  ];
  for (const file of assets) {
    if (exists(file)) pass(`1.105 release topology asset exists: ${file}`);
    else fail(`1.105 release topology asset missing: ${file}`);
  }

  const core = read("core/release-execution-topology.md");
  for (const marker of ["Source Control", "Orchestrator", "Execution Backend", "Package Transport", "Evidence Store", "Production Target", "zero-experience", "read-only"]) {
    if (core.includes(marker)) pass(`1.105 release topology core includes ${marker}`);
    else fail(`1.105 release topology core missing ${marker}`);
  }
  if (/user[^\n]{0,80}(choose|select|confirm)[^\n]{0,80}(runner|orchestrator|backend|transport|store|protocol)/i.test(core)) {
    fail("1.105 release topology asks the user to choose technical topology");
  } else {
    pass("1.105 release topology keeps technical topology Codex-owned");
  }

  const cli = read("scripts/cli.mjs");
  for (const command of ["release-topology", "release-topology-check"]) {
    if (cli.includes(`\"${command}\"`)) pass(`1.105 advanced CLI exposes ${command}`);
    else fail(`1.105 advanced CLI missing ${command}`);
  }
  const focused = runNode(["--test", "tests/release-execution-topology.test.mjs"]);
  if (focused.status === 0) pass("1.105 release topology regressions");
  else fail(`1.105 release topology regressions failed: ${focused.stderr || focused.stdout}`);
  const consumerFocused = runNode(["--test", "tests/release-topology-consumer.test.mjs"]);
  if (consumerFocused.status === 0) pass("1.106 release topology consumer regressions");
  else fail(`1.106 release topology consumer regressions failed: ${consumerFocused.stderr || consumerFocused.stdout}`);
  const migrationFocused = runNode(["--test", "tests/release-topology-migration.test.mjs"]);
  if (migrationFocused.status === 0) pass("1.107 release topology migration regressions");
  else fail(`1.107 release topology migration regressions failed: ${migrationFocused.stderr || migrationFocused.stdout}`);

  const compatibilityEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "release-topology-empty-"));
  const empty = runNode(["scripts/check-release-execution-topology.mjs", compatibilityEmptyRoot, "--allow-empty"]);
  if (empty.status === 0) pass("1.105 release topology accepts explicit compatibility empty state");
  else fail(`1.105 release topology empty-state check failed: ${empty.stderr || empty.stdout}`);
  const strictEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.105-strict-empty-"));
  const strictEmpty = runNode(["scripts/check-release-execution-topology.mjs", strictEmptyRoot, "--allow-empty", "--require-structured-evidence"]);
  if (strictEmpty.status !== 0) pass("1.105 strict topology cannot be bypassed by allow-empty");
  else fail("1.105 strict topology was bypassed by allow-empty");

  const target = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.105-generated-"));
  const init = runNode([
    path.join(kitRoot, "scripts/init-project.mjs"), "--target", target, "--starter", "generic-project",
    "--goal", "create a generic project for release topology validation",
  ]);
  if (init.status !== 0) {
    fail(`1.105 generated project initialization failed: ${init.stderr || init.stdout}`);
    return;
  }
  for (const file of [
    ".intentos/core/release-execution-topology.md",
    ".intentos/schemas/artifacts/release-execution-topology.schema.json",
    "scripts/lib/release-execution-topology.mjs",
    "scripts/lib/release-topology-consumer.mjs",
    "scripts/lib/release-topology-migration.mjs",
    "scripts/resolve-release-execution-topology.mjs",
    "scripts/check-release-execution-topology.mjs",
    "scripts/resolve-release-topology-migration.mjs",
    "scripts/check-release-topology-migration.mjs",
    "release-execution-topologies/.gitkeep",
    "release-topology-migrations/.gitkeep",
    ".intentos/core/release-topology-consumer-binding.md",
    ".intentos/core/release-topology-migration.md",
    ".intentos/docs/release-topology-consumer-binding.md",
    ".intentos/docs/release-topology-migration.md",
    ".intentos/schemas/artifacts/release-topology-migration.schema.json",
  ]) {
    if (fs.existsSync(path.join(target, file))) pass(`1.105 generated project includes ${file}`);
    else fail(`1.105 generated project missing ${file}`);
  }
  fs.mkdirSync(path.join(target, ".github/workflows"), { recursive: true });
  fs.writeFileSync(path.join(target, ".github/workflows/release.yml"), "runs-on: ubuntu-latest\nenvironment: production\nconcurrency: release\n- uses: actions/upload-artifact@v4\n");
  fs.writeFileSync(path.join(target, "docs/release-sop.md"), "staging rollback smoke monitoring cleanup retention\n");
  const resolved = runNode([path.join(target, "scripts/resolve-release-execution-topology.mjs"), target, "--out", "release-execution-topologies/generated.md"]);
  const checked = runNode([path.join(target, "scripts/check-release-execution-topology.mjs"), target, "--report", "release-execution-topologies/generated.md", "--require-structured-evidence", "--require-current-project"]);
  if (resolved.status === 0 && checked.status === 0) pass("1.105 generated project resolves and verifies current topology evidence");
  else fail(`1.105 generated project topology parity failed: ${resolved.stderr || resolved.stdout || checked.stderr || checked.stdout}`);
  const migrated = runNode([
    path.join(target, "scripts/resolve-release-topology-migration.mjs"), target,
    "--stage", "DISCOVERY",
    "--topology-ref", "release-execution-topologies/generated.md",
    "--out", "release-topology-migrations/generated.md",
  ]);
  const migrationChecked = runNode([
    path.join(target, "scripts/check-release-topology-migration.mjs"), target,
    "--report", "release-topology-migrations/generated.md",
    "--require-structured-evidence", "--require-current-project",
  ]);
  if (migrated.status === 0 && migrationChecked.status === 0) pass("1.107 generated project resolves and verifies current migration evidence");
  else fail(`1.107 generated project migration parity failed: ${migrated.stderr || migrated.stdout || migrationChecked.stderr || migrationChecked.stdout}`);
  for (const script of ["check-release-evidence-gate.mjs", "check-release-approval-record.mjs", "check-release-execution.mjs", "check-runtime-hygiene.mjs"]) {
    const strict = runNode([path.join(target, "scripts", script), target, "--allow-empty", "--require-release-topology"]);
    if (strict.status !== 0) pass(`1.106 generated strict topology consumer fails closed: ${script}`);
    else fail(`1.106 generated strict topology consumer passed empty evidence: ${script}`);
  }
}
function checkVerificationRuntimeTrustProtocol() {
  const assets = [
    "core/verification-runtime-trust.md",
    "core/verification-runtime-adapters.md",
    "core/verification-runtime-lifecycle.md",
    "core/runtime-trust-consumer-hardcut.md",
    "docs/verification-runtime-trust.md",
    "docs/verification-runtime-adapters.md",
    "docs/verification-runtime-lifecycle.md",
    "docs/runtime-trust-consumer-hardcut.md",
    "checklists/verification-runtime-trust-review.md",
    "checklists/verification-runtime-adapter-review.md",
    "checklists/verification-runtime-lifecycle-review.md",
    "checklists/runtime-trust-consumer-review.md",
    "templates/verification-runtime-plan.md",
    "templates/verification-run-manifest.md",
    "templates/verification-runtime-lifecycle-plan.md",
    "schemas/artifacts/verification-runtime-plan.schema.json",
    "schemas/artifacts/verification-run-manifest.schema.json",
    "schemas/artifacts/verification-runtime-lifecycle-plan.schema.json",
    "scripts/lib/verification-runtime-trust.mjs",
    "scripts/lib/verification-runtime-adapters.mjs",
    "scripts/lib/verification-runtime-lifecycle.mjs",
    "scripts/lib/verification-runtime-consumer.mjs",
    "scripts/resolve-verification-runtime-plan.mjs",
    "scripts/check-verification-runtime-plan.mjs",
    "scripts/check-verification-run-manifest.mjs",
    "scripts/resolve-verification-runtime-lifecycle.mjs",
    "scripts/check-verification-runtime-lifecycle.mjs",
    "scripts/run-verification-runtime.mjs",
    "tests/verification-runtime-trust.test.mjs",
    "tests/verification-runtime-lifecycle.test.mjs",
    "tests/verification-runtime-consumer.test.mjs",
    "verification-runtime-plans/.gitkeep",
    "verification-run-manifests/.gitkeep",
    "verification-runtime-lifecycle-plans/.gitkeep",
  ];
  for (const file of assets) {
    if (exists(file)) pass(`1.103 verification runtime chain asset exists: ${file}`);
    else fail(`1.103 verification runtime chain asset missing: ${file}`);
  }

  const core = read("core/verification-runtime-trust.md");
  for (const marker of [
    "SOURCE_OUTPUT_BINDING",
    "TARGETED_SERVICE_IDENTITY",
    "ISOLATED_RUNTIME",
    "POSSIBLE_HIGH",
    "run_id",
    "owner_token_digest",
    "Codex",
  ]) {
    if (core.includes(marker)) pass(`1.102 runtime trust core includes ${marker}`);
    else fail(`1.102 runtime trust core missing ${marker}`);
  }
  if (/user[^\n]{0,80}(choose|select)[^\n]{0,80}(port|database|runtime|adapter|container)/i.test(core)) {
    fail("1.102 runtime trust core asks the user to make a technical runtime choice");
  } else {
    pass("1.102 runtime trust keeps technical runtime selection Codex-owned");
  }

  const adapters = read("core/verification-runtime-adapters.md");
  for (const marker of ["LOCAL_PROCESS", "DOCKER_CONTAINER", "KUBERNETES_WORKLOAD", "SERVERLESS_DEPLOYMENT", "STATIC_BUILD", "PROJECT_NATIVE", "OBSERVE_AND_PLAN_ONLY"]) {
    if (adapters.includes(marker)) pass(`1.102 runtime adapter core includes ${marker}`);
    else fail(`1.102 runtime adapter core missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const command of ["verification-runtime-plan", "verification-runtime-plan-check", "verification-runtime-lifecycle", "verification-runtime-lifecycle-check", "verification-runtime-run", "verification-run-check"]) {
    if (cli.includes(`\"${command}\"`)) pass(`1.103 advanced CLI exposes ${command}`);
    else fail(`1.103 advanced CLI missing ${command}`);
  }

  const installedCi = read("platforms/github/ci-ai-workflow.yml");
  for (const checker of ["check-verification-runtime-plan.mjs", "check-verification-runtime-lifecycle.mjs", "check-verification-run-manifest.mjs"]) {
    if (installedCi.includes(checker)) pass(`1.103 installed CI includes ${checker}`);
    else fail(`1.103 installed CI missing ${checker}`);
  }
  for (const strictFlag of [
    "check-test-evidence.mjs . --require-runtime-trust",
    "check-execution-assurance.mjs . --require-runtime-trust",
    "check-completion-evidence.mjs . --require-runtime-trust",
    "check-closure-decision.mjs . --require-runtime-trust",
  ]) {
    if (installedCi.includes(strictFlag)) pass(`1.104 installed CI includes ${strictFlag}`);
    else fail(`1.104 installed CI missing ${strictFlag}`);
  }

  const consumerAuthority = read("scripts/lib/verification-runtime-consumer.mjs");
  for (const marker of ["check-verification-run-manifest.mjs", "--require-complete", "runtimeTrustBindingsAgree", "current_verification_plan_match"]) {
    if (consumerAuthority.includes(marker)) pass(`1.104 Runtime Trust consumer authority includes ${marker}`);
    else fail(`1.104 Runtime Trust consumer authority missing ${marker}`);
  }
  for (const [file, marker] of [
    ["scripts/check-test-evidence.mjs", "require-runtime-trust"],
    ["scripts/check-execution-assurance.mjs", "require-runtime-trust"],
    ["scripts/check-completion-evidence.mjs", "require-runtime-trust"],
    ["scripts/resolve-closure-decision.mjs", "Runtime Trust"],
  ]) {
    if (read(file).includes(marker)) pass(`1.104 ${file} consumes Runtime Trust`);
    else fail(`1.104 ${file} does not consume Runtime Trust`);
  }

  const focused = runNode(["--test", "tests/verification-runtime-trust.test.mjs"]);
  if (focused.status === 0) pass("1.102 verification runtime trust regressions");
  else fail(`1.102 verification runtime trust regressions failed: ${focused.stderr || focused.stdout}`);
  const lifecycleFocused = runNode(["--test", "tests/verification-runtime-lifecycle.test.mjs"]);
  if (lifecycleFocused.status === 0) pass("1.103 verification runtime lifecycle regressions");
  else fail(`1.103 verification runtime lifecycle regressions failed: ${lifecycleFocused.stderr || lifecycleFocused.stdout}`);
  const consumerFocused = runNode(["--test", "tests/verification-runtime-consumer.test.mjs"]);
  if (consumerFocused.status === 0) pass("1.104 verification runtime consumer regressions");
  else fail(`1.104 verification runtime consumer regressions failed: ${consumerFocused.stderr || consumerFocused.stdout}`);

  const compatibilityEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "verification-runtime-empty-"));
  for (const args of [
    ["scripts/check-verification-runtime-plan.mjs", compatibilityEmptyRoot, "--allow-empty"],
    ["scripts/check-verification-runtime-lifecycle.mjs", compatibilityEmptyRoot, "--allow-empty"],
    ["scripts/check-verification-run-manifest.mjs", compatibilityEmptyRoot, "--allow-empty"],
  ]) {
    const result = runNode(args);
    if (result.status === 0) pass(`1.103 ${args[0]} accepts an explicitly empty repository state`);
    else fail(`1.103 ${args[0]} empty-state check failed: ${result.stderr || result.stdout}`);
  }
  const strictEmptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.104-strict-empty-"));
  for (const checker of ["check-test-evidence.mjs", "check-execution-assurance.mjs", "check-completion-evidence.mjs"]) {
    const result = runNode([`scripts/${checker}`, strictEmptyRoot, "--allow-empty", "--require-runtime-trust"]);
    if (result.status !== 0) pass(`1.104 ${checker} rejects allow-empty under strict Runtime Trust`);
    else fail(`1.104 ${checker} allowed strict Runtime Trust to be bypassed by allow-empty`);
  }
}

export function runArchitectureChecks() {
  checkApplyAdoptionClosureProtocol();
  checkReleaseTrustClosureProtocol();
  checkBaselineManifestPublicEntryConsolidationProtocol();
  checkOperatingModelConsolidationProtocol();
  checkOperatingDecisionContractProtocol();
  checkProjectIdentityProjectionProtocol();
  checkReviewContextAuthorityProtocol();
  checkActiveGuidanceSemanticHardcutProtocol();
  checkActiveGuidanceDistributionCloseoutProtocol();
  checkBusinessUniverseCoverageProtocol();
  checkControlEffectivenessProtocol();
  checkUnderstandingPlanningClosureProtocol();
  checkZeroExperienceSoloOperatingModelProtocol();
  checkExecutionAuthorityConsumerHardcutProtocol();
  checkReleaseExecutionTopologyProtocol();
  checkVerificationRuntimeTrustProtocol();
}
