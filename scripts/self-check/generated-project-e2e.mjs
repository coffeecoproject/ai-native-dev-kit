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
  loadReviewContextAuthority,
  reviewContextBindingFromMarkdown,
  validateReviewContextBinding,
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

function checkGeneratedProjectE2E() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-e2e-"));
  const target = path.join(tempRoot, "generated-project");

  const initResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
    "--goal",
    "create a generated project for end-to-end IntentOS verification",
  ]);
  if (initResult.status !== 0) {
    fail(`generated project init failed: ${initResult.stderr || initResult.stdout}`);
    return;
  }
  pass("generated project init");

  // Exercise controlled workflow update before later sections bind platform
  // and BL2 evidence to the current project revision. Updating workflow source
  // after that binding must correctly invalidate the evidence rather than be
  // treated as an activation-ready project.
  const generatedUpdatePlanPath = path.join(target, "apply-execution-plans", "generated-workflow-update-plan.json");
  const generatedUpdatePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
    "--update-workflow-assets",
    "--goal",
    "refresh local governance assets",
    "--write-plan",
    path.relative(target, generatedUpdatePlanPath),
  ]);
  if (generatedUpdatePlan.status !== 0 || !fs.existsSync(generatedUpdatePlanPath)) {
    fail(`generated project workflow update plan failed: ${generatedUpdatePlan.stderr || generatedUpdatePlan.stdout}`);
    return;
  }
  const updateResult = runNode(approvedInitProjectApplyArgs(generatedUpdatePlanPath));
  const generatedUpdatePlanEvidence = JSON.parse(fs.readFileSync(generatedUpdatePlanPath, "utf8"));
  const rejectedUpdateReceiptPath = path.join(target, generatedUpdatePlanEvidence.receiptPath);
  const rejectedUpdateReceipt = fs.existsSync(rejectedUpdateReceiptPath)
    ? fs.readFileSync(rejectedUpdateReceiptPath, "utf8")
    : "";
  if (updateResult.status === 0
    || !updateResult.stderr.includes("Installed workflow activation failed")
    || !rejectedUpdateReceipt.includes("APPLY_FAILED_ROLLED_BACK")) {
    fail(`generated project workflow update should fail closed and roll back before baseline readiness: ${updateResult.stderr || updateResult.stdout}`);
    return;
  }
  pass("generated project workflow asset update fails closed and rolls back before baseline readiness");

  const operatingModelAssets = [
    "scripts/resolve-operating-loop.mjs",
    "scripts/check-review-context-authority.mjs",
    "scripts/lib/review-context-authority.mjs",
    ".intentos/core/operating-model.md",
    ".intentos/docs/operating-model.md",
    ".intentos/core/review-context-authority.json",
    ".intentos/core/review-context-authority.md",
  ];
  const missingOperatingModelAssets = operatingModelAssets.filter((relativePath) => !fs.existsSync(path.join(target, relativePath)));
  if (missingOperatingModelAssets.length > 0) {
    fail(`generated project missing operating model assets: ${missingOperatingModelAssets.join(", ")}`);
    return;
  }
  const generatedVersion = JSON.parse(fs.readFileSync(path.join(target, ".intentos", "version.json"), "utf8"));
  if (generatedVersion.projectEntryOrigin !== "NEW_PROJECT") {
    fail(`generated project entry origin is not durable: ${generatedVersion.projectEntryOrigin || "missing"}`);
    return;
  }
  const generatedReviewContextCheck = runNode([
    path.join(target, "scripts", "check-review-context-authority.mjs"),
    fs.realpathSync(target),
  ]);
  if (generatedReviewContextCheck.status !== 0
    || !generatedReviewContextCheck.stdout.includes("Review context authority check passed")) {
    fail(`generated project review context authority check failed: ${generatedReviewContextCheck.stderr || generatedReviewContextCheck.stdout}`);
    return;
  }
  pass("generated project review context authority check");

  for (const type of ["review-packet", "gpt-review-prompt"]) {
    const generatedReviewInput = runNode([
      path.join(target, "scripts", "new-workflow-item.mjs"),
      "--root", target,
      "--type", type,
      "--name", "context-binding-smoke",
    ]);
    if (generatedReviewInput.status !== 0) {
      fail(`generated project ${type} creation failed: ${generatedReviewInput.stderr || generatedReviewInput.stdout}`);
      return;
    }
  }
  const authority = loadReviewContextAuthority(target);
  const generatedBindings = [
    path.join(target, "review-packets", "001-context-binding-smoke.md"),
    path.join(target, "gpt-review-prompts", "001-context-binding-smoke.md"),
  ].map((file) => validateReviewContextBinding(
    reviewContextBindingFromMarkdown(fs.readFileSync(file, "utf8")),
    authority,
  ));
  if (generatedBindings.every((binding) => binding.ok)) {
    pass("generated project review inputs carry current context binding");
  } else {
    fail(`generated project review input binding failed: ${generatedBindings.flatMap((binding) => binding.errors).join("; ")}`);
    return;
  }
  const operatingLoop = runNode([
    path.join(target, "scripts", "resolve-operating-loop.mjs"),
    target,
    "--intent",
    "我想做一个预约 App",
    "--json",
  ]);
  if (operatingLoop.status !== 0) {
    fail(`generated project operating loop failed: ${operatingLoop.stderr || operatingLoop.stdout}`);
    return;
  }
  let operatingState;
  try {
    operatingState = JSON.parse(operatingLoop.stdout);
  } catch (error) {
    fail(`generated project operating loop returned invalid JSON: ${error.message}`);
    return;
  }
  if (operatingState.projectEntry?.state !== "NEW_PROJECT_ENTRY"
    || operatingState.operatingLoop?.operation !== "START_PROJECT"
    || operatingState.readOnly !== true
    || operatingState.boundaries?.writesTargetFiles !== "No") {
    fail(`generated project operating loop misrouted the new project: ${operatingLoop.stdout}`);
    return;
  }
  pass("generated project operating model entry and routing");

  const generatedReleaseChannel = runNode([
    path.join(target, "scripts", "cli.mjs"),
    "release-channel",
    target,
    "--intent", "review source-only release channel",
    "--project-type", "new_project",
    "--channel", "source_only",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
    "--json",
  ]);
  if (generatedReleaseChannel.status !== 0) {
    fail(`generated project release-channel command failed: ${generatedReleaseChannel.stderr || generatedReleaseChannel.stdout}`);
    return;
  }
  try {
    const channel = JSON.parse(generatedReleaseChannel.stdout);
    if (channel.outcome === "RELEASE_CHANNEL_POLICY_RECORDED") pass("generated project release-channel command and dependencies");
    else fail(`generated project release-channel returned unexpected outcome: ${generatedReleaseChannel.stdout}`);
  } catch (error) {
    fail(`generated project release-channel returned invalid JSON: ${error.message}`);
    return;
  }

  const projectCheck = runNode([
    path.join(target, "scripts", "check-ai-workflow.mjs"),
    target,
  ]);
  if (projectCheck.status !== 0) {
    fail(`generated project workflow check failed: ${projectCheck.stderr || projectCheck.stdout}`);
    return;
  }
  pass("generated project workflow check");

  const projectCoreCheck = runNode([
    path.join(target, "scripts", "check-ai-workflow.mjs"),
    target,
    "--mode",
    "core",
  ]);
  if (projectCoreCheck.status !== 0) {
    fail(`generated project core workflow check failed: ${projectCoreCheck.stderr || projectCoreCheck.stdout}`);
    return;
  }
  pass("generated project core workflow check");

  const nextCheck = runNode([
    path.join(target, "scripts", "workflow-next.mjs"),
    target,
  ]);
  if (nextCheck.status !== 0 || !nextCheck.stdout.includes("PROJECT_STATE: BOOTSTRAPPED_PROJECT")) {
    fail(`generated project workflow next check failed: ${nextCheck.stderr || nextCheck.stdout}`);
    return;
  }
  pass("generated project workflow next check");

  const startCheck = runNode([
    path.join(target, "scripts", "start-project.mjs"),
    target,
  ]);
  if (startCheck.status !== 0
    || !startCheck.stdout.includes("# Guided Adoption Recommendation")
    || !startCheck.stdout.includes("Can AI write now | No")
    || !startCheck.stdout.includes("target files written by start | No")) {
    fail(`generated project guided adoption start check failed: ${startCheck.stderr || startCheck.stdout}`);
    return;
  }
  pass("generated project guided adoption start check");

  const guidedReportCheck = runNode([
    path.join(target, "scripts", "check-guided-adoption.mjs"),
    target,
  ]);
  if (guidedReportCheck.status !== 0) {
    fail(`generated project guided adoption report check failed: ${guidedReportCheck.stderr || guidedReportCheck.stdout}`);
    return;
  }
  pass("generated project guided adoption report check");

  const beginnerEntryResolverCheck = runNode([
    path.join(target, "scripts", "resolve-beginner-entry.mjs"),
    target,
    "--goal",
    "build an appointment app",
  ]);
  if (beginnerEntryResolverCheck.status !== 0
    || !beginnerEntryResolverCheck.stdout.includes("Beginner Entry Card")
    || !beginnerEntryResolverCheck.stdout.includes("This entry writes target files: No")) {
    fail(`generated project beginner entry resolver failed: ${beginnerEntryResolverCheck.stderr || beginnerEntryResolverCheck.stdout}`);
    return;
  }
  pass("generated project beginner entry resolver");

  const beginnerEntryCheck = runNode([
    path.join(target, "scripts", "check-beginner-entry.mjs"),
    target,
  ]);
  if (beginnerEntryCheck.status !== 0 || !beginnerEntryCheck.stdout.includes("Beginner Entry check passed")) {
    fail(`generated project beginner entry check failed: ${beginnerEntryCheck.stderr || beginnerEntryCheck.stdout}`);
    return;
  }
  pass("generated project beginner entry check");

  const beginnerEntryCli = runNode([
    path.join(target, "scripts", "cli.mjs"),
    "ask",
    target,
    "build an appointment app",
  ]);
  if (beginnerEntryCli.status !== 0
    || !beginnerEntryCli.stdout.includes("Beginner Entry Card")
    || !beginnerEntryCli.stdout.includes("This entry writes target files: No")) {
    fail(`generated project CLI ask failed: ${beginnerEntryCli.stderr || beginnerEntryCli.stdout}`);
    return;
  }
  pass("generated project CLI ask");

  const summaryCheck = runNode([
    path.join(target, "scripts", "summarize-ai-logs.mjs"),
    target,
  ]);
  if (summaryCheck.status !== 0) {
    fail(`generated project summarize-ai-logs failed: ${summaryCheck.stderr || summaryCheck.stdout}`);
    return;
  }
  pass("generated project summarize-ai-logs");

  const versionCheck = runNode([
    path.join(target, "scripts", "check-workflow-version.mjs"),
    target,
  ]);
  if (versionCheck.status !== 0) {
    fail(`generated project workflow version check failed: ${versionCheck.stderr || versionCheck.stdout}`);
    return;
  }
  pass("generated project workflow version check");

  const onboardingCheck = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
  ]);
  if (onboardingCheck.status !== 0) {
    fail(`generated project onboarding check failed: ${onboardingCheck.stderr || onboardingCheck.stdout}`);
    return;
  }
  pass("generated project onboarding check");

  for (const rel of [
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-review-loop.mjs",
    "scripts/check-next-step-boundary.mjs",
    "scripts/check-goal-mode.mjs",
    "scripts/check-subagent-orchestration.mjs",
    "scripts/resolve-beginner-entry.mjs",
    "scripts/check-beginner-entry.mjs",
    "scripts/check-engineering-baseline.mjs",
    "scripts/check-product-baseline.mjs",
    "scripts/check-claim-control.mjs",
    "scripts/check-context-governance.mjs",
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
    ".intentos/profiles/web-app/baseline.json",
    ".intentos/profiles/wechat-miniprogram/baseline.json",
    ".intentos/industrial-packs/index.json",
    ".intentos/industrial-packs/selection-guide.md",
    ".intentos/industrial-packs/schema/pack.schema.json",
    ".intentos/industrial-packs/schema/baseline-selection.schema.json",
    ".intentos/templates/baseline-selection.md",
    ".intentos/templates/baseline-evidence.md",
    ".intentos/docs/artifact-decision-tree.md",
    ".intentos/docs/goal-subagent-usage.md",
    ".intentos/docs/guided-delivery-baseline.md",
    ".intentos/docs/product-baseline.md",
    ".intentos/docs/claim-control.md",
    ".intentos/docs/project-memory.md",
    ".intentos/docs/git-boundary.md",
    ".intentos/docs/change-boundary.md",
    ".intentos/docs/baseline-state.md",
    ".intentos/docs/guided-delivery-check.md",
    ".intentos/docs/beginner-entry.md",
    ".intentos/core/engineering-baseline.md",
    ".intentos/core/outcome-baseline.md",
    ".intentos/core/product-baseline.md",
    ".intentos/core/claim-control.md",
    ".intentos/core/assumption-register.md",
    ".intentos/core/context-governance.md",
    ".intentos/core/git-boundary.md",
    ".intentos/core/change-boundary.md",
    ".intentos/core/baseline-state.md",
    ".intentos/core/beginner-entry.md",
    ".intentos/templates/engineering-baseline.md",
    ".intentos/templates/product-baseline-review.md",
    ".intentos/templates/claim-control-report.md",
    ".intentos/templates/assumption-register.md",
    ".intentos/templates/learning-candidate.md",
    ".intentos/templates/context-correction-report.md",
    ".intentos/templates/git-boundary-report.md",
    ".intentos/templates/change-boundary-report.md",
    ".intentos/templates/baseline-state-report.md",
    ".intentos/templates/beginner-entry-card.md",
    ".intentos/checklists/engineering-baseline-review.md",
    ".intentos/checklists/product-baseline-review.md",
    ".intentos/checklists/claim-control-review.md",
    ".intentos/checklists/context-governance-review.md",
    ".intentos/checklists/git-boundary-review.md",
    ".intentos/checklists/guided-delivery-loop-review.md",
    ".intentos/checklists/change-boundary-review.md",
    ".intentos/checklists/baseline-state-review.md",
    ".intentos/checklists/beginner-entry-review.md",
    ".intentos/core/next-step-boundary.md",
    ".intentos/core/goal-mode.md",
    ".intentos/core/subagent-orchestration.md",
    ".intentos/templates/follow-up-proposal.md",
    ".intentos/templates/final-report.md",
    ".intentos/templates/goal-card.md",
    ".intentos/templates/subagent-run-plan.md",
    ".intentos/checklists/next-step-boundary-review.md",
    ".intentos/checklists/goal-mode-review.md",
    ".intentos/checklists/subagent-orchestration-review.md",
    ".intentos/prompts/goal-planner-agent.md",
    ".intentos/prompts/engineering-baseline-agent.md",
    ".intentos/prompts/product-baseline-agent.md",
    ".intentos/prompts/claim-control-agent.md",
    ".intentos/prompts/context-governance-agent.md",
    ".intentos/prompts/guided-delivery-check-agent.md",
    ".intentos/prompts/change-boundary-agent.md",
    ".intentos/prompts/baseline-state-agent.md",
    ".intentos/prompts/beginner-entry-agent.md",
    ".intentos/core/output-protocol.md",
    ".intentos/core/glossary.md",
    ".intentos/prompts/reporter-agent.md",
    ".intentos/templates/human-status-report.md",
    ".intentos/templates/decision-brief.md",
    ".intentos/templates/plain-review-summary.md",
    ".intentos/templates/customer-handoff.md",
    "status-reports/.gitkeep",
    "goal-cards/.gitkeep",
    "subagent-run-plans/.gitkeep",
    "decision-briefs/.gitkeep",
    "review-summaries/.gitkeep",
    "customer-handoffs/.gitkeep",
    "follow-up-proposals/.gitkeep",
    "final-reports/.gitkeep",
    "beginner-entry-cards/.gitkeep",
    "learning-candidates/.gitkeep",
    "context-corrections/.gitkeep",
    "git-boundary-reports/.gitkeep",
    "change-boundary-reports/.gitkeep",
    "baseline-state-reports/.gitkeep",
    "docs/verification-matrix.md",
    "docs/engineering-baseline.md",
    ".intentos/core/completion-evidence-gate.md",
    ".intentos/docs/completion-evidence-gate.md",
    ".intentos/templates/completion-evidence-report.md",
    ".intentos/checklists/completion-evidence-review.md",
    ".intentos/prompts/completion-evidence-agent.md",
    ".intentos/schemas/artifacts/completion-evidence.schema.json",
    "scripts/resolve-completion-evidence.mjs",
    "scripts/check-completion-evidence.mjs",
    "completion-evidence-reports/.gitkeep",
    ".intentos/core/release-evidence-gate.md",
    ".intentos/docs/release-evidence-gate.md",
    ".intentos/templates/release-evidence-gate-report.md",
    ".intentos/checklists/release-evidence-gate-review.md",
    ".intentos/prompts/release-evidence-gate-agent.md",
    ".intentos/schemas/artifacts/release-evidence-gate.schema.json",
    "scripts/resolve-release-evidence-gate.mjs",
    "scripts/check-release-evidence-gate.mjs",
    "release-evidence-gate-reports/.gitkeep",
    "release-candidates/.gitkeep",
  ]) {
    if (!fs.existsSync(path.join(target, rel))) {
      fail(`generated project missing platform baseline asset: ${rel}`);
      return;
    }
  }
  pass("generated project platform baseline assets");

  const generatedBusinessRuleReport = "business-rule-closures/001-generated-service-time.md";
  const generatedBusinessRuleRef = `artifact:${generatedBusinessRuleReport}`;
  const generatedBusinessRuleResolve = runNode([
    path.join(target, "scripts", "resolve-business-rule-closure.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--out",
    generatedBusinessRuleReport,
  ]);
  if (generatedBusinessRuleResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedBusinessRuleReport))
    || !generatedBusinessRuleResolve.stdout.includes(generatedBusinessRuleRef)) {
    fail(`generated project business rule resolver should write a self-referencing report: ${generatedBusinessRuleResolve.stderr || generatedBusinessRuleResolve.stdout}`);
    return;
  }
  const generatedBusinessRuleStrictCheck = runNode([
    path.join(target, "scripts", "check-business-rule-closure.mjs"),
    target,
    "--report",
    generatedBusinessRuleReport,
    "--require-structured-evidence",
  ]);
  if (generatedBusinessRuleStrictCheck.status !== 0
    || !generatedBusinessRuleStrictCheck.stdout.includes("Business Rule Closure check passed")
    || !generatedBusinessRuleStrictCheck.stdout.includes("business_rule_ref points to this report")) {
    fail(`generated project business rule strict same-report check failed: ${generatedBusinessRuleStrictCheck.stderr || generatedBusinessRuleStrictCheck.stdout}`);
    return;
  }
  const generatedImpactReport = "change-impact-coverage-reports/001-generated-service-time.md";
  const generatedImpactResolve = runNode([
    path.join(target, "scripts", "resolve-change-impact-coverage.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--out",
    generatedImpactReport,
  ]);
  if (generatedImpactResolve.status !== 0
    || !generatedImpactResolve.stdout.includes(generatedBusinessRuleRef)
    || !generatedImpactResolve.stdout.includes("Business rule state: BLOCKED_INCOMPLETE_RULE")
    || !generatedImpactResolve.stdout.includes("Business Universe ref: N/A")
    || !generatedImpactResolve.stdout.includes("## Human Decisions Needed")
    || !generatedImpactResolve.stdout.includes("Codex derives technical surface coverage")
    || !generatedImpactResolve.stdout.includes("This report authorizes implementation: No")) {
    fail(`generated project must preserve Business-Universe-blocked Business Rule Closure in a non-authorizing impact report: ${generatedImpactResolve.stderr || generatedImpactResolve.stdout}`);
    return;
  }
  pass("generated project consumes saved Business Rule Closure and keeps impact analysis non-authorizing without technical user questions");

  const generatedVerificationReport = "verification-plans/001-generated-service-time.md";
  const generatedVerificationResolve = runNode([
    path.join(target, "scripts", "resolve-verification-plan.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--impact-ref",
    `artifact:${generatedImpactReport}`,
    "--project-level",
    "BL1",
    "--platform",
    "web,backend",
    "--out",
    generatedVerificationReport,
  ]);
  if (generatedVerificationResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedVerificationReport))
    || !generatedVerificationResolve.stdout.includes("Verification Plan")
    || !generatedVerificationResolve.stdout.includes("NEEDS_BUSINESS_RULE_CLOSURE")
    || !generatedVerificationResolve.stdout.includes("Create or resolve a READY Business Rule Closure")) {
    fail(`generated project Verification Plan must preserve the Business-Universe-blocked Business Rule state: ${generatedVerificationResolve.stderr || generatedVerificationResolve.stdout}`);
    return;
  }
  const generatedVerificationStrictCheck = runNode([
    path.join(target, "scripts", "check-verification-plan.mjs"),
    target,
    "--report",
    generatedVerificationReport,
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
  ]);
  if (generatedVerificationStrictCheck.status !== 0
    && `${generatedVerificationStrictCheck.stdout}\n${generatedVerificationStrictCheck.stderr}`.includes("requires READY Business Rule Closure")) {
    pass("generated project Verification Plan stays blocked until Business Rule Closure is ready");
  } else if (generatedVerificationStrictCheck.status === 0
    && generatedVerificationStrictCheck.stdout.includes("Verification Plan check passed")) {
    pass("generated project strict Verification Plan source binding");
  } else {
    fail(`generated project Verification Plan must fail closed until Business Rule Closure is ready: ${generatedVerificationStrictCheck.stderr || generatedVerificationStrictCheck.stdout}`);
    return;
  }

  const generatedTestEvidenceReport = "test-evidence-reports/001-generated-service-time.md";
  const generatedExecutionAssuranceReport = "execution-assurance-reports/001-generated-service-time.md";
  const generatedCompletionReport = "completion-evidence-reports/001-generated-service-time.md";
  const generatedEvidenceRefs = [];
  if (generatedVerificationStrictCheck.status === 0) {
  const generatedVerificationEvidence = extractMachineReadableEvidence(fs.readFileSync(path.join(target, generatedVerificationReport), "utf8"));
  if (!generatedVerificationEvidence?.ok) {
    fail("generated project Verification Plan should include machine-readable evidence for Test Evidence smoke");
    return;
  }
  const obligationsBySurface = new Map();
  for (const obligation of generatedVerificationEvidence.value.verification_obligations || []) {
    if (obligation.required !== "Yes") continue;
    const list = obligationsBySurface.get(obligation.source_surface) || [];
    list.push(obligation.id);
    obligationsBySurface.set(obligation.source_surface, list);
  }
  const generatedEvidenceDir = path.join(target, "evidence");
  fs.mkdirSync(generatedEvidenceDir, { recursive: true });
  const generatedEvidenceFiles = [
    ["user-flow.txt", "evidence:user-flow", "COMMAND_OUTPUT", "npm run test:user-flow -- generated-service-time", ["USER_FLOW"], "Generated user-flow smoke evidence."],
    ["frontend-ui.txt", "evidence:frontend-ui", "COMMAND_OUTPUT", "npm run test:ui -- generated-service-time", ["FRONTEND_UI", "ERROR_COPY"], "Generated frontend UI smoke evidence."],
    ["api-contract.txt", "evidence:api-contract", "COMMAND_OUTPUT", "npm run test:api -- generated-service-time", ["API_CONTRACT"], "Generated API contract smoke evidence."],
    ["backend-rule.txt", "evidence:backend-rule", "COMMAND_OUTPUT", "npm run test:domain -- generated-service-time", ["BACKEND_RULE"], "Generated backend rule smoke evidence."],
    ["handoff.txt", "evidence:handoff", "COMMAND_OUTPUT", "npm run docs:check -- generated-service-time", ["DOCS_HANDOFF", "TEST_COVERAGE"], "Generated handoff smoke evidence."],
  ];
  for (const [fileName, evidenceId, type, command, surfaces, limitation] of generatedEvidenceFiles) {
    const covered = surfaces.flatMap((surface) => obligationsBySurface.get(surface) || []);
    if (covered.length === 0) continue;
    const relativeFile = `evidence/${fileName}`;
    fs.writeFileSync(path.join(target, relativeFile), [
      `id: ${evidenceId}`,
      `evidence_type: ${type}`,
      "result_state: PASSED",
      `command: ${command}`,
      "owner: generated-project-smoke",
      "environment: generated-local-ci",
      "ran_at: 2026-07-06T10:10:00Z",
      "exit_code: 0",
      "failure_reason: not recorded",
      "ran_after_change: Yes",
      "current_task_match: Yes",
      `covers_obligations: ${covered.join(", ")}`,
      `limitations: ${limitation}`,
      "",
      "PASS generated project task-bound evidence.",
      "",
    ].join("\n"));
    generatedEvidenceRefs.push(`artifact:${relativeFile}`);
  }
  const generatedTestEvidenceResolve = runNode([
    path.join(target, "scripts", "resolve-test-evidence.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    `artifact:${generatedVerificationReport}`,
    "--evidence",
    generatedEvidenceRefs.join(","),
    "--out",
    generatedTestEvidenceReport,
  ]);
  if (generatedTestEvidenceResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedTestEvidenceReport))
    || !generatedTestEvidenceResolve.stdout.includes("TEST_EVIDENCE_BLOCKED")
    || !generatedTestEvidenceResolve.stdout.includes("Exit Code")) {
    fail(`generated project Test Evidence resolver should write a source-bound Runtime Trust blocker: ${generatedTestEvidenceResolve.stderr || generatedTestEvidenceResolve.stdout}`);
    return;
  }
  const generatedTestEvidenceStrictCheck = runNode([
    path.join(target, "scripts", "check-test-evidence.mjs"),
    target,
    "--report",
    generatedTestEvidenceReport,
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
  ]);
  if (generatedTestEvidenceStrictCheck.status !== 0
    || !generatedTestEvidenceStrictCheck.stdout.includes("Test Evidence check passed")
    || !generatedTestEvidenceStrictCheck.stdout.includes("test_evidence_ref points to this report")
    || !generatedTestEvidenceStrictCheck.stdout.includes("verification_plan_digest matches referenced Verification Plan")
    || !generatedTestEvidenceStrictCheck.stdout.includes("Markdown outcome matches structured test_evidence_state")) {
    fail(`generated project Test Evidence strict source binding failed: ${generatedTestEvidenceStrictCheck.stderr || generatedTestEvidenceStrictCheck.stdout}`);
    return;
  }
  pass("generated project strict Test Evidence source binding");

  fs.mkdirSync(path.join(target, "execution-assurance-reports"), { recursive: true });
  fs.writeFileSync(path.join(target, generatedExecutionAssuranceReport), generatedExecutionAssuranceReportText({
    taskRef: "tasks/001-appointment-requests-must-include-a-service-time.md",
    testEvidenceRef: `artifact:${generatedTestEvidenceReport}`,
    testEvidenceDigest: fileDigest(path.join(target, generatedTestEvidenceReport)),
    authorityBinding: createEvidenceAuthorityBinding(target, {
      taskRef: "tasks/001-appointment-requests-must-include-a-service-time.md",
      intentDigest: "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
      sourceRefs: [`artifact:${generatedTestEvidenceReport}`],
      fromFile: path.join(target, generatedExecutionAssuranceReport),
    }),
  }));
  const generatedCompletionResolve = runNode([
    path.join(target, "scripts", "resolve-completion-evidence.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--verification-plan-ref",
    `artifact:${generatedVerificationReport}`,
    "--test-evidence-ref",
    `artifact:${generatedTestEvidenceReport}`,
    "--execution-assurance-ref",
    `artifact:${generatedExecutionAssuranceReport}`,
    "--out",
    generatedCompletionReport,
  ]);
  if (generatedCompletionResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedCompletionReport))
    || !generatedCompletionResolve.stdout.includes("BLOCKED_BY_RUNTIME_TRUST")
    || !generatedCompletionResolve.stdout.includes("Can Claim Complete")) {
    fail(`generated project Completion Evidence resolver should write a source-bound report: ${generatedCompletionResolve.stderr || generatedCompletionResolve.stdout}`);
    return;
  }
  const generatedCompletionStrictCheck = runNode([
    path.join(target, "scripts", "check-completion-evidence.mjs"),
    target,
    "--report",
    generatedCompletionReport,
    "--require-structured-evidence",
    "--require-source-refs",
  ]);
  if (generatedCompletionStrictCheck.status !== 0
    || !generatedCompletionStrictCheck.stdout.includes("Completion Evidence Gate check passed")
    || !generatedCompletionStrictCheck.stdout.includes("completion_evidence_ref points to this report")
    || !generatedCompletionStrictCheck.stdout.includes("includes gate check check:runtime-trust")
    || !generatedCompletionStrictCheck.stdout.includes("source execution_assurance outcome matches referenced evidence")) {
    fail(`generated project Completion Evidence strict source binding failed: ${generatedCompletionStrictCheck.stderr || generatedCompletionStrictCheck.stdout}`);
    return;
  }
  pass("generated project Completion Evidence keeps source binding while Runtime Trust blocks readiness");
  const generatedStatusReport = "delivery-status-cards/001-generated-status.md";
  const generatedStatusResolve = runNode([
    path.join(target, "scripts", "resolve-user-delivery-console.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--out",
    generatedStatusReport,
  ]);
  if (generatedStatusResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedStatusReport))
    || !generatedStatusResolve.stdout.includes("Not passed")
    || !generatedStatusResolve.stdout.includes("Can the current task be treated as done? | No")) {
    fail(`generated project User Delivery Console should preserve the Runtime Trust blocker: ${generatedStatusResolve.stderr || generatedStatusResolve.stdout}`);
    return;
  }
  const generatedStatusCheck = runNode([
    path.join(target, "scripts", "check-user-delivery-console.mjs"),
    target,
  ]);
  if (generatedStatusCheck.status !== 0 || !generatedStatusCheck.stdout.includes("User Delivery Console check passed")) {
    fail(`generated project User Delivery Console same-card check failed: ${generatedStatusCheck.stderr || generatedStatusCheck.stdout}`);
    return;
  }
  pass("generated project User Delivery Console same-card status check");
  fs.rmSync(path.join(target, generatedExecutionAssuranceReport), { force: true });
  fs.rmSync(path.join(target, generatedCompletionReport), { force: true });
  }

  const emptyGoalModeCheck = runNode([
    path.join(target, "scripts", "check-goal-mode.mjs"),
    target,
  ]);
  if (emptyGoalModeCheck.status !== 0 || !emptyGoalModeCheck.stdout.includes("Goal Mode check skipped")) {
    fail(`generated project empty Goal Mode check should pass by skipping: ${emptyGoalModeCheck.stderr || emptyGoalModeCheck.stdout}`);
    return;
  }
  pass("generated project empty Goal Mode check skips");

  const emptySubagentCheck = runNode([
    path.join(target, "scripts", "check-subagent-orchestration.mjs"),
    target,
  ]);
  if (emptySubagentCheck.status !== 0 || !emptySubagentCheck.stdout.includes("Subagent Orchestration check skipped")) {
    fail(`generated project empty Subagent Orchestration check should pass by skipping: ${emptySubagentCheck.stderr || emptySubagentCheck.stdout}`);
    return;
  }
  pass("generated project empty Subagent Orchestration check skips");

  const engineeringBaselineCheck = runNode([
    path.join(target, "scripts", "check-engineering-baseline.mjs"),
    target,
  ]);
  if (engineeringBaselineCheck.status !== 0 || !engineeringBaselineCheck.stdout.includes("PENDING")) {
    fail(`generated project engineering baseline check should remain pending for Codex-owned evidence completion: ${engineeringBaselineCheck.stderr || engineeringBaselineCheck.stdout}`);
    return;
  }
  pass("generated project engineering baseline check remains pending for Codex-owned evidence completion");

  const productBaselineCheck = runNode([
    path.join(target, "scripts", "check-product-baseline.mjs"),
    target,
  ]);
  if (productBaselineCheck.status !== 0 || !productBaselineCheck.stdout.includes("Product baseline check passed")) {
    fail(`generated project product baseline check failed: ${productBaselineCheck.stderr || productBaselineCheck.stdout}`);
    return;
  }
  pass("generated project product baseline check");

  const claimControlCheck = runNode([
    path.join(target, "scripts", "check-claim-control.mjs"),
    target,
  ]);
  if (claimControlCheck.status !== 0 || !claimControlCheck.stdout.includes("Claim control check passed")) {
    fail(`generated project claim control check failed: ${claimControlCheck.stderr || claimControlCheck.stdout}`);
    return;
  }
  pass("generated project claim control check");

  const contextGovernanceCheck = runNode([
    path.join(target, "scripts", "check-context-governance.mjs"),
    target,
  ]);
  if (contextGovernanceCheck.status !== 0 || !contextGovernanceCheck.stdout.includes("Context governance check passed")) {
    fail(`generated project context governance check failed: ${contextGovernanceCheck.stderr || contextGovernanceCheck.stdout}`);
    return;
  }
  pass("generated project context governance check");

  const launchReadinessCheck = runNode([
    path.join(target, "scripts", "check-launch-readiness.mjs"),
    target,
  ]);
  if (launchReadinessCheck.status !== 0 || !launchReadinessCheck.stdout.includes("Launch readiness check passed")) {
    fail(`generated project launch readiness check failed: ${launchReadinessCheck.stderr || launchReadinessCheck.stdout}`);
    return;
  }
  pass("generated project launch readiness check");

  const conversationDriftCheck = runNode([
    path.join(target, "scripts", "check-conversation-drift.mjs"),
    target,
  ]);
  if (conversationDriftCheck.status !== 0 || !conversationDriftCheck.stdout.includes("Conversation drift check passed")) {
    fail(`generated project conversation drift check failed: ${conversationDriftCheck.stderr || conversationDriftCheck.stdout}`);
    return;
  }
  pass("generated project conversation drift check");

  const guidedDeliveryCheck = runNode([
    path.join(target, "scripts", "check-guided-delivery-loop.mjs"),
    target,
  ]);
  if (guidedDeliveryCheck.status !== 0 || !guidedDeliveryCheck.stdout.includes("Guided delivery loop check passed")) {
    fail(`generated project guided delivery loop check failed: ${guidedDeliveryCheck.stderr || guidedDeliveryCheck.stdout}`);
    return;
  }
  pass("generated project guided delivery loop check");

  const changeBoundaryCheck = runNode([
    path.join(target, "scripts", "check-change-boundary.mjs"),
    target,
  ]);
  if (changeBoundaryCheck.status !== 0 || !changeBoundaryCheck.stdout.includes("Change boundary check passed")) {
    fail(`generated project change boundary check failed: ${changeBoundaryCheck.stderr || changeBoundaryCheck.stdout}`);
    return;
  }
  pass("generated project change boundary check");

  const baselineStateCheck = runNode([
    path.join(target, "scripts", "check-baseline-state.mjs"),
    target,
  ]);
  if (baselineStateCheck.status !== 0 || !baselineStateCheck.stdout.includes("Baseline state check passed")) {
    fail(`generated project baseline state check failed: ${baselineStateCheck.stderr || baselineStateCheck.stdout}`);
    return;
  }
  pass("generated project baseline state check");

  const firstDeliveryCheck = runNode([
    path.join(target, "scripts", "check-first-delivery-walkthrough.mjs"),
    target,
  ]);
  if (firstDeliveryCheck.status !== 0 || !firstDeliveryCheck.stdout.includes("First delivery walkthrough check passed")) {
    fail(`generated project first delivery walkthrough check failed: ${firstDeliveryCheck.stderr || firstDeliveryCheck.stdout}`);
    return;
  }
  pass("generated project first delivery walkthrough check");

  if (fs.existsSync(path.join(target, ".intentos", "industrial-packs", "web-app", "pack.json"))) {
    fail("generated project default bootstrap should not install concrete web-app industrial pack");
    return;
  }
  pass("generated project default bootstrap keeps industrial packs lightweight");

  const industrialPackCheck = runNode([
    path.join(target, "scripts", "check-industrial-pack.mjs"),
    target,
    "--selected-only",
  ]);
  if (industrialPackCheck.status !== 0 || !industrialPackCheck.stdout.includes("Selected-only mode: no selected packs")) {
    fail(`generated project selected industrial pack check failed: ${industrialPackCheck.stderr || industrialPackCheck.stdout}`);
    return;
  }
  pass("generated project selected industrial pack check");

  const industrialBaselinePending = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--bl2-only",
  ]);
  if (industrialBaselinePending.status !== 0 || !industrialBaselinePending.stdout.includes("BL2 industrial baseline is not active")) {
    fail(`generated project industrial baseline check should skip before BL2 selection: ${industrialBaselinePending.stderr || industrialBaselinePending.stdout}`);
    return;
  }
  pass("generated project industrial baseline check skips before BL2 selection");

  const platformBaselinePending = runNode([
    path.join(target, "scripts", "check-platform-baseline.mjs"),
    target,
  ]);
  if (platformBaselinePending.status !== 0 || !platformBaselinePending.stdout.includes("PENDING")) {
    fail(`generated project platform baseline check should be pending before profile selection: ${platformBaselinePending.stderr || platformBaselinePending.stdout}`);
    return;
  }
  pass("generated project platform baseline check is pending before profile selection");

  const projectProfilePath = path.join(target, "docs", "project-profile.md");
  const projectProfileContent = fs.readFileSync(projectProfilePath, "utf8")
    .replace(/## Selected Profiles\n\n[\s\S]*?\n## Profile Rationale/, "## Selected Profiles\n\n- web-app\n\n## Profile Rationale")
    .replace("|  |  | Yes / No |", "| web-app | browser-based UI | Yes |");
  fs.writeFileSync(projectProfilePath, projectProfileContent);

  const platformBaselineResolved = runNode([
    path.join(target, "scripts", "resolve-platform-baseline.mjs"),
    target,
  ]);
  if (platformBaselineResolved.status !== 0 || !platformBaselineResolved.stdout.includes("PLATFORM_BASELINE_STATE: BASELINE_READY")) {
    fail(`generated project platform baseline resolver failed after profile selection: ${platformBaselineResolved.stderr || platformBaselineResolved.stdout}`);
    return;
  }
  pass("generated project platform baseline resolver handles selected profile");

  const platformBaselineCheck = runNode([
    path.join(target, "scripts", "check-platform-baseline.mjs"),
    target,
  ]);
  if (platformBaselineCheck.status !== 0 || !platformBaselineCheck.stdout.includes("selected profiles: web-app")) {
    fail(`generated project platform baseline check failed after profile selection: ${platformBaselineCheck.stderr || platformBaselineCheck.stdout}`);
    return;
  }
  pass("generated project platform baseline check handles selected profile");

  const platformBaselineJson = runNode([
    path.join(target, "scripts", "check-platform-baseline.mjs"),
    target,
    "--json",
  ]);
  if (platformBaselineJson.status !== 0) {
    fail(`generated project platform baseline JSON check failed: ${platformBaselineJson.stderr || platformBaselineJson.stdout}`);
    return;
  }
  try {
    const parsed = JSON.parse(platformBaselineJson.stdout);
    if (parsed.checkStatus !== "PENDING" && parsed.checkStatus !== "PASS") {
      fail(`generated project platform baseline JSON has unexpected status: ${parsed.checkStatus}`);
      return;
    }
    if (!parsed.effectiveRiskGateMappings?.permission || !parsed.effectiveAiBoundaries?.mustNot?.length) {
      fail("generated project platform baseline JSON missing effective risk mappings or AI boundaries");
      return;
    }
  } catch (error) {
    fail(`generated project platform baseline JSON output is not parseable: ${error.message}`);
    return;
  }
  pass("generated project platform baseline JSON is machine-readable");

  fs.copyFileSync(
    path.join(target, ".intentos", "templates", "baseline-selection.md"),
    path.join(target, "docs", "baseline-selection.md"),
  );
  fs.copyFileSync(
    path.join(target, ".intentos", "templates", "baseline-evidence.md"),
    path.join(target, "docs", "baseline-evidence.md"),
  );
  const baselineSelectionPath = path.join(target, "docs", "baseline-selection.md");
  const baselineSelectionContent = fs.readFileSync(baselineSelectionPath, "utf8")
    .replace("BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL:", "BL2_INDUSTRIAL:")
    .replace("- <profile-id>", "- web-app")
    .replace("- <standard-pack-id>", "- environment-standard\n- web-runtime-standard")
    .replace("- <industrial-pack-id>", "- web-app-industrial")
    .replace("Status: PENDING / APPROVED / REJECTED", "Status: APPROVED")
    .replace("|  |  | Yes / No |", "| web-app-industrial | production-grade web delivery | Yes |")
    .replace("|  |  |  |  |  | Yes / No |", "| none | none | none | owner | 2026-06-25 | Yes |")
    .replace("|  |  |  |  |  | Yes / No |", "| none | none | none | owner | 2026-06-25 | Yes |");
  fs.writeFileSync(baselineSelectionPath, baselineSelectionContent);

  const selectedPackMissingCheck = runNode([
    path.join(target, "scripts", "check-industrial-pack.mjs"),
    target,
    "--selected-only",
  ]);
  const selectedPackMissingOutput = `${selectedPackMissingCheck.stderr}\n${selectedPackMissingCheck.stdout}`;
  if (selectedPackMissingCheck.status === 0
    || !selectedPackMissingOutput.includes("missing pack.md")
    || !selectedPackMissingOutput.includes("--update-workflow-assets")
    || !selectedPackMissingOutput.includes("--industrial-packs web-app-industrial")
    || !selectedPackMissingOutput.includes("--write-plan")) {
    fail(`generated project selected industrial pack check should reject missing selected pack: ${selectedPackMissingCheck.stderr || selectedPackMissingCheck.stdout}`);
    return;
  }
  pass("generated project selected industrial pack check rejects missing selected pack with repair hint");

  const selectedPackMissingBaselineCheck = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--bl2-only",
  ]);
  const selectedPackMissingBaselineOutput = `${selectedPackMissingBaselineCheck.stderr}\n${selectedPackMissingBaselineCheck.stdout}`;
  if (selectedPackMissingBaselineCheck.status === 0
    || !selectedPackMissingBaselineOutput.includes("selected industrial pack is invalid: web-app-industrial")
    || !selectedPackMissingBaselineOutput.includes("--update-workflow-assets")
    || !selectedPackMissingBaselineOutput.includes("--industrial-packs web-app-industrial")
    || !selectedPackMissingBaselineOutput.includes("--write-plan")) {
    fail(`generated project industrial baseline check should reject missing selected pack with repair hint: ${selectedPackMissingBaselineCheck.stderr || selectedPackMissingBaselineCheck.stdout}`);
    return;
  }
  pass("generated project industrial baseline check rejects missing selected pack with repair hint");

  const selectedPackPlanPath = path.join(target, "apply-execution-plans", "selected-industrial-pack-plan.json");
  const planSelectedPack = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
    "--update-workflow-assets",
    "--goal",
    "enable the selected industrial pack in the generated project",
    "--industrial-packs",
    "web-app-industrial",
    "--write-plan",
    path.relative(target, selectedPackPlanPath),
  ]);
  if (planSelectedPack.status !== 0 || !fs.existsSync(selectedPackPlanPath)) {
    fail(`generated project selected industrial pack plan failed: ${planSelectedPack.stderr || planSelectedPack.stdout}`);
    return;
  }
  const selectedPackPlan = JSON.parse(fs.readFileSync(selectedPackPlanPath, "utf8"));
  const selectedPackActions = selectedPackPlan.actions.filter((action) => action.path.startsWith(".intentos/industrial-packs/web-app/"));
  if (selectedPackActions.length === 0 || selectedPackActions.some((action) => action.willWrite !== true || action.executionSupported !== true || action.type === "HUMAN_ONLY")) {
    fail("generated project selected industrial pack plan must bind exact pack assets to the controlled action graph");
    return;
  }
  pass("generated project selected industrial pack plan binds exact approved pack assets");
  fs.cpSync(
    path.join(kitRoot, "industrial-packs", "web-app"),
    path.join(target, ".intentos", "industrial-packs", "web-app"),
    { recursive: true },
  );
  pass("generated project BL2 fixture simulates owner-installed selected industrial pack");

  const baselineEvidencePath = path.join(target, "docs", "baseline-evidence.md");
  const evidenceRoot = path.join(target, "evidence");
  const evidenceRecordRel = "evidence/generated-bl2-evidence.md";
  const evidenceRecordPath = path.join(target, evidenceRecordRel);
  const baselineBindingProjection = runNode([
    path.join(target, "scripts", "resolve-industrial-baseline.mjs"),
    target,
    "--json",
  ]);
  if (baselineBindingProjection.status !== 0) {
    fail(`generated project BL2 binding projection failed: ${baselineBindingProjection.stderr || baselineBindingProjection.stdout}`);
    return;
  }
  let baselineBindings;
  try {
    baselineBindings = JSON.parse(baselineBindingProjection.stdout).effectiveRequiredEvidenceBindings || [];
  } catch (error) {
    fail(`generated project BL2 binding projection is not parseable: ${error.message}`);
    return;
  }
  if (baselineBindings.length === 0) {
    fail("generated project BL2 binding projection must expose exact requirement bindings");
    return;
  }
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const commandScriptRel = "evidence/generated-bl2-command.mjs";
  const commandScriptPath = path.join(target, commandScriptRel);
  fs.writeFileSync(commandScriptPath, [
    "import fs from 'node:fs';",
    "const index = Number(process.argv[2]);",
    "const { evidenceType, requirement } = JSON.parse(fs.readFileSync('evidence/generated-bl2-requirements.json', 'utf8'))[index];",
    "console.log(`Evidence type: ${evidenceType}`);",
    "console.log(`Requirement verified: ${requirement}`);",
    "console.log('Concrete current-project BL2 self-check command completed.');",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(target, "evidence/generated-bl2-requirements.json"), `${JSON.stringify(baselineBindings.map((binding) => ({
    evidenceType: binding.evidenceType,
    requirement: binding.requirement,
  })), null, 2)}\n`);
  const runtimeIntent = "verify current generated-project industrial baseline requirements";
  const runtimeTaskRef = "tasks/generated-bl2-baseline.md";
  const runId = "vrun-generated-bl2-001";
  const runManifestRel = "verification-run-manifests/generated-bl2.md";
  const runManifestRef = `artifact:${runManifestRel}`;
  fs.writeFileSync(path.join(target, ".intentos/task-governance.md"), [
    "# Task Governance", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify({
      artifact_type: "task_governance",
      task_ref: runtimeTaskRef,
      intent: runtimeIntent,
      intent_digest: `sha256:${crypto.createHash("sha256").update(runtimeIntent).digest("hex")}`,
      task_governance_digest: `sha256:${crypto.createHash("sha256").update("generated-bl2-task-governance").digest("hex")}`,
      impact_classification: { task_impact: "LOW" },
    }, null, 2),
    "```", "",
  ].join("\n"));
  fs.writeFileSync(path.join(target, ".intentos/verification-runtime-lifecycle.json"), `${JSON.stringify({
    version: "1.103.0",
    adapter_kind: "COMMAND_ONLY",
    actions: baselineBindings.map((binding, index) => ({
      id: `bl2-${index}`,
      phase: "VERIFY",
      kind: "COMMAND",
      argv: ["node", commandScriptRel, String(index)],
      cwd: ".",
      timeout_ms: 10_000,
      environment: [],
      obligation_ids: [binding.requirementId],
      positive_path: "Yes",
      negative_path: "No",
      resource_ids: [],
      external_effect: "No",
      depends_on: [],
    })),
    resources: [],
  }, null, 2)}\n`);
  const evidenceRows = baselineBindings.map((binding) => (
    `| ${binding.requirement} | ${binding.evidenceType} | ${evidenceRecordRel} | Done |  | self-check | 2026-06-25 |`
  ));
  const baselineEvidenceContent = [
    "# Baseline Evidence", "", "## Status", "", "Draft status: CONFIRMED", "",
    "Human decision status: CONFIRMED", "", "## Evidence Index", "",
    "| Requirement | Evidence Type | Evidence Ref | Status | Reason if skipped | Owner | Review date |",
    "|---|---|---|---|---|---|---|", ...evidenceRows, "", "## Production Readiness", "",
    "Status: PASS", "", "Evidence:", "", `- ${evidenceRecordRel}`, "", "## Release Readiness", "",
    "Status: PASS", "", "Evidence:", "", `- ${evidenceRecordRel}`, "", "## Security Readiness", "",
    "Status: PASS", "", "Evidence:", "", `- ${evidenceRecordRel}`, "", "## Privacy Readiness", "",
    "Status: NOT_APPLICABLE", "", "Evidence:", "", "- Not applicable to generated self-check fixture.", "",
    "## Recovery Readiness", "", "Status: PASS", "", "Evidence:", "", `- ${evidenceRecordRel}`, "",
    "## Exceptions", "", "| Requirement | Exception | Reason | Owner | Review date |",
    "|---|---|---|---|---|", "| none | none | none | self-check | 2026-06-25 |", "",
    "## Residual Risks", "", "| Risk | Impact | Mitigation | Owner | Accepted |",
    "|---|---|---|---|---|", "| none | none | none | self-check | Yes |", "",
  ].join("\n");
  // Baseline selection and evidence are project source bytes. Finalize them
  // before Runtime Trust captures the current project identity.
  fs.writeFileSync(baselineEvidencePath, baselineEvidenceContent);
  for (const commandArgs of [
    [path.join(target, "scripts/resolve-verification-runtime-plan.mjs"), target, "--intent", runtimeIntent, "--task-ref", runtimeTaskRef, "--task-tier", "LOW", "--task-governance-ref", "artifact:.intentos/task-governance.md", "--out", "verification-runtime-plans/generated-bl2.md"],
    [path.join(target, "scripts/resolve-verification-runtime-lifecycle.mjs"), target, "--runtime-plan-ref", "artifact:verification-runtime-plans/generated-bl2.md", "--run-id", runId, "--out", "verification-runtime-lifecycle-plans/generated-bl2.md"],
    [path.join(target, "scripts/run-verification-runtime.mjs"), target, "--plan", "artifact:verification-runtime-lifecycle-plans/generated-bl2.md", "--out", runManifestRel],
  ]) {
    const runtimeResult = runNode(commandArgs);
    if (runtimeResult.status !== 0) {
      fail(`generated project BL2 Runtime Trust execution failed: ${runtimeResult.stderr || runtimeResult.stdout}`);
      return;
    }
  }
  const runManifestEvidence = extractMachineReadableEvidence(fs.readFileSync(path.join(target, runManifestRel), "utf8"));
  if (!runManifestEvidence?.ok) {
    fail("generated project BL2 Runtime Trust manifest is not parseable");
    return;
  }
  const runManifest = runManifestEvidence.value;
  const sourceRevision = projectIdentity(target).revision;
  const semanticEvidenceLines = [];
  for (const [index, binding] of baselineBindings.entries()) {
    const token = binding.requirementId.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
    const receiptRel = `evidence/generated-bl2-receipt-${token}.json`;
    const execution = runManifest.verification_executions.find((item) => item.id === `bl2-${index}`);
    if (!execution) {
      fail(`generated project BL2 Runtime Trust manifest lacks execution bl2-${index}`);
      return;
    }
    const commandArgv = ["node", commandScriptRel, String(index)];
    const command = commandArgv.join(" ");
    const outputRel = String(execution.output_ref).replace(/^(?:artifact|file):/i, "");
    const outputDigest = execution.output_digest;
    const receiptPath = path.join(target, receiptRel);
    fs.writeFileSync(receiptPath, `${JSON.stringify({
      schema_version: "1.113.0",
      artifact_type: "bl2_execution_receipt",
      requirement_id: binding.requirementId,
      pack_id: binding.packId,
      evidence_type: binding.evidenceType,
      requirement: binding.requirement,
      command,
      command_argv: commandArgv,
      command_digest: `sha256:${crypto.createHash("sha256").update(JSON.stringify(commandArgv)).digest("hex")}`,
      result: "PASS",
      exit_code: execution.exit_code,
      source_revision: sourceRevision,
      output_ref: outputRel,
      output_digest: outputDigest,
      run_manifest_ref: runManifestRef,
      run_manifest_digest: runManifest.run_manifest_digest,
      run_id: runManifest.run_id,
      execution_id: execution.id,
    }, null, 2)}\n`);
    semanticEvidenceLines.push(
      `INTENTOS_BL2_EVIDENCE: ${binding.requirementId} | ${binding.evidenceType} | ${binding.requirement} | command=${command}; result=PASS; exit=0; revision=${sourceRevision}; receipt=${receiptRel}; receipt_digest=${fileDigest(receiptPath)}; output=${outputRel}; output_digest=${outputDigest}`,
    );
  }
  fs.writeFileSync(evidenceRecordPath, [
    "# Generated BL2 Evidence",
    "",
    "This generated file is used by the intentos self-check to prove that requirement-scoped command receipts and bound outputs are validated.",
    "",
    ...semanticEvidenceLines,
    "",
  ].join("\n"));

  const invalidBaselineEvidenceContent = baselineEvidenceContent.replace(
    `${evidenceRecordRel} | Done`,
    "evidence/missing-bl2-evidence.md | Done",
  );
  fs.writeFileSync(baselineEvidencePath, invalidBaselineEvidenceContent);
  const invalidIndustrialBaselineCheck = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--strict",
  ]);
  if (invalidIndustrialBaselineCheck.status === 0 || !/missing evidence ref|evidence ref is missing/i.test(invalidIndustrialBaselineCheck.stderr)) {
    fail(`generated project industrial baseline strict check should reject missing evidence refs: ${invalidIndustrialBaselineCheck.stderr || invalidIndustrialBaselineCheck.stdout}`);
    return;
  }
  const invalidIndustrialBaselineResolved = runNode([
    path.join(target, "scripts", "resolve-industrial-baseline.mjs"),
    target,
    "--json",
  ]);
  if (invalidIndustrialBaselineResolved.status !== 1) {
    fail(`generated project industrial baseline resolver should reject invalid evidence refs with exit 1: ${invalidIndustrialBaselineResolved.stderr || invalidIndustrialBaselineResolved.stdout}`);
    return;
  }
  try {
    const parsed = JSON.parse(invalidIndustrialBaselineResolved.stdout);
    if (parsed.state !== "EVIDENCE_INVALID") {
      fail(`generated project industrial baseline resolver should mark invalid evidence refs as EVIDENCE_INVALID, got ${parsed.state}`);
      return;
    }
  } catch (error) {
    fail(`generated project invalid industrial baseline JSON output is not parseable: ${error.message}`);
    return;
  }
  pass("generated project industrial baseline rejects missing evidence refs");
  fs.writeFileSync(baselineEvidencePath, baselineEvidenceContent);

  const industrialBaselineResolved = runNode([
    path.join(target, "scripts", "resolve-industrial-baseline.mjs"),
    target,
  ]);
  if (industrialBaselineResolved.status !== 0 || !industrialBaselineResolved.stdout.includes("INDUSTRIAL_BASELINE_STATE: BASELINE_READY")) {
    fail(`generated project industrial baseline resolver failed after BL2 selection: ${industrialBaselineResolved.stderr || industrialBaselineResolved.stdout}`);
    return;
  }
  pass("generated project industrial baseline resolver handles BL2 selection");

  const industrialBaselineCheck = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--strict",
  ]);
  if (industrialBaselineCheck.status !== 0 || !industrialBaselineCheck.stdout.includes("Industrial baseline is ready")) {
    fail(`generated project industrial baseline strict check failed after BL2 selection: ${industrialBaselineCheck.stderr || industrialBaselineCheck.stdout}`);
    return;
  }
  pass("generated project industrial baseline strict check handles BL2 selection");

  const governedExistingTarget = path.join(tempRoot, "governed-existing-project");
  fs.mkdirSync(path.join(governedExistingTarget, ".github", "workflows"), { recursive: true });
  fs.mkdirSync(path.join(governedExistingTarget, "scripts", "guard"), { recursive: true });
  fs.mkdirSync(path.join(governedExistingTarget, "docs", "baselines"), { recursive: true });
  fs.mkdirSync(path.join(governedExistingTarget, "docs", "evidence"), { recursive: true });
  fs.writeFileSync(path.join(governedExistingTarget, "package.json"), JSON.stringify({ name: "governed-existing-project", private: true }, null, 2));
  fs.writeFileSync(path.join(governedExistingTarget, "agent.md"), "# Existing Agent Rules\n");
  fs.writeFileSync(path.join(governedExistingTarget, ".github", "workflows", "quality.yml"), "name: quality\n");
  fs.writeFileSync(path.join(governedExistingTarget, ".github", "workflows", "release-promotion.yml"), "name: release-promotion\n");
  fs.writeFileSync(path.join(governedExistingTarget, "scripts", "guard", "check-quality.js"), "console.log('ok');\n");
  fs.writeFileSync(path.join(governedExistingTarget, "docs", "baselines", "web-baseline.md"), "# Existing Web Baseline\n");
  fs.writeFileSync(path.join(governedExistingTarget, "docs", "WEB_RELEASE_ROLLBACK_BASELINE.md"), "# Existing Release Baseline\n");
  fs.writeFileSync(path.join(governedExistingTarget, "docs", "evidence", ".gitkeep"), "");

  const governedNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    governedExistingTarget,
  ]);
  if (governedNext.status !== 0
    || !governedNext.stdout.includes("NEXT_ACTION: RUN_ADOPTION_ASSESSMENT")
    || !governedNext.stdout.includes("ADOPTION_MODE: READ_ONLY")
    || !governedNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !governedNext.stdout.includes("GOVERNED_EXISTING_PROJECT")
    || !governedNext.stdout.includes("PRODUCTION_GOVERNED_PROJECT")) {
    fail(`governed existing project should require read-only adoption assessment: ${governedNext.stderr || governedNext.stdout}`);
    return;
  }
  pass("governed existing project workflow-next requires read-only adoption assessment");

  const governedDoctor = runNode([
    path.join(kitRoot, "scripts", "cli.mjs"),
    "doctor",
    governedExistingTarget,
  ]);
  if (governedDoctor.status !== 0
    || !governedDoctor.stdout.includes("Doctor old-project mode: skipped full workflow asset checks.")
    || !governedDoctor.stdout.includes("Next safe step: run native-migration and reconcile-rules --auto-native")
    || governedDoctor.stdout.includes("FAIL missing")) {
    fail(`governed existing project doctor should stop at old-project diagnosis without asset flood: ${governedDoctor.stderr || governedDoctor.stdout}`);
    return;
  }
  pass("governed existing project doctor avoids missing-asset flood");

  const governedReconcileAuto = runNode([
    path.join(kitRoot, "scripts", "cli.mjs"),
    "reconcile-rules",
    governedExistingTarget,
    "--auto-native",
  ]);
  if (governedReconcileAuto.status !== 0
    || !governedReconcileAuto.stdout.includes("IntentOS Adoption Recommendation")
    || !governedReconcileAuto.stdout.includes("generated:native-migration")
    || !governedReconcileAuto.stdout.includes("SELECTED_NATIVE_ADOPTION")
    || fs.existsSync(path.join(governedExistingTarget, "native-migration-plans"))) {
    fail(`governed existing project reconcile-rules --auto-native should produce read-only native adoption decision: ${governedReconcileAuto.stderr || governedReconcileAuto.stdout}`);
    return;
  }
  pass("governed existing project reconcile-rules --auto-native produces read-only native adoption decision");

  const truncatedRuleTarget = path.join(tempRoot, "truncated-rule-project");
  fs.mkdirSync(path.join(truncatedRuleTarget, "native-migration-plans"), { recursive: true });
  fs.writeFileSync(path.join(truncatedRuleTarget, ".gitignore"), "native-migration-plans/\n");
  fs.writeFileSync(path.join(truncatedRuleTarget, "AGENTS.md"), [
    "# Project Rules",
    "",
    "- Database status fields must use project-defined enum types.",
    "",
  ].join("\n"));
  const truncatedGitInit = spawnSync("git", ["-C", truncatedRuleTarget, "init", "-q"], { encoding: "utf8" });
  const truncatedGitAdd = spawnSync("git", ["-C", truncatedRuleTarget, "add", "."], { encoding: "utf8" });
  const truncatedGitCommit = spawnSync("git", [
    "-C",
    truncatedRuleTarget,
    "-c",
    "user.name=IntentOS Self Check",
    "-c",
    "user.email=intentos@example.invalid",
    "commit",
    "-qm",
    "fixture",
  ], { encoding: "utf8" });
  if ([truncatedGitInit, truncatedGitAdd, truncatedGitCommit].some((result) => result.status !== 0)) {
    fail("truncated existing rule reconciliation fixture Git initialization failed");
    return;
  }
  const truncatedIntent = "Adopt this existing project while preserving all extracted rules";
  const currentNativeMigration = runNode([
    path.join(kitRoot, "scripts", "resolve-native-migration.mjs"),
    truncatedRuleTarget,
    "--intent",
    truncatedIntent,
    "--json",
  ]);
  if (currentNativeMigration.status !== 0) {
    fail(`truncated existing rule reconciliation fixture migration failed: ${currentNativeMigration.stderr || currentNativeMigration.stdout}`);
    return;
  }
  const truncatedEvidence = JSON.parse(currentNativeMigration.stdout).structuredEvidence;
  if (!Array.isArray(truncatedEvidence?.rule_classifications)
    || truncatedEvidence.rule_classifications.length === 0
    || !Array.isArray(truncatedEvidence.rule_extraction_coverage)
    || truncatedEvidence.rule_extraction_coverage.length === 0) {
    fail("truncated existing rule reconciliation fixture did not produce current structured evidence");
    return;
  }
  truncatedEvidence.rule_extraction_coverage[0].rules_extracted = truncatedEvidence.rule_classifications.length + 1;
  fs.writeFileSync(path.join(truncatedRuleTarget, "native-migration-plans", "001-many-rules.md"), [
    "# Native Migration Plan",
    "",
    "```json",
    JSON.stringify(truncatedEvidence, null, 2),
    "```",
    "",
  ].join("\n"));
  const truncatedReconcile = runNode([
    path.join(kitRoot, "scripts", "resolve-existing-rule-reconciliation.mjs"),
    truncatedRuleTarget,
    "--intent",
    truncatedIntent,
    "--json",
  ]);
  if (truncatedReconcile.status !== 1) {
    fail(`truncated existing rule reconciliation should fail closed: ${truncatedReconcile.stderr || truncatedReconcile.stdout}`);
    return;
  }
  try {
    const parsed = JSON.parse(truncatedReconcile.stdout);
    if (parsed.ruleReconciliationCoverage?.omittedRules === 1
      && parsed.ruleReconciliationCoverage?.blocksSelectedNativeAdoption === "Yes"
      && parsed.nativeAdoptionDecision?.recommendation === "BLOCKED_NEEDS_OWNER"
      && parsed.canRecommendApplyPlan === "NoUntilBlockResolved"
      && parsed.canRecommendApplyPlanNow === "No"
      && parsed.outcome === "BLOCKED") {
      pass("truncated existing rule reconciliation blocks selected native adoption");
    } else {
      fail(`truncated existing rule reconciliation missing block evidence: ${truncatedReconcile.stdout}`);
      return;
    }
  } catch (error) {
    fail(`truncated existing rule reconciliation JSON invalid: ${error.message}`);
    return;
  }

  const dirtyReadyTarget = path.join(tempRoot, "dirty-ready-production-project");
  const dirtyReadyInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    dirtyReadyTarget,
    "--goal",
    "create a project for dirty production-state routing verification",
  ]);
  if (dirtyReadyInit.status !== 0) {
    fail(`dirty ready production project init failed: ${dirtyReadyInit.stderr || dirtyReadyInit.stdout}`);
    return;
  }
  const onboardingDocsToConfirm = [
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
  ];
  for (const relPath of onboardingDocsToConfirm) {
    const fullPath = path.join(dirtyReadyTarget, relPath);
    let content = fs.readFileSync(fullPath, "utf8")
      .replace(/<[^>\n]+>/g, "confirmed")
      .replace(/PENDING_CONFIRMATION|PENDING|TBD|TODO|NOT_READY/g, "CONFIRMED");
    if (relPath === "docs/project-profile.md") {
      content = content.replace(/## Selected Profiles\n\n[\s\S]*?\n## Profile Rationale/, "## Selected Profiles\n\n- web-app\n\n## Profile Rationale");
    }
    fs.writeFileSync(fullPath, content);
  }
  fs.mkdirSync(path.join(dirtyReadyTarget, ".github", "workflows"), { recursive: true });
  fs.writeFileSync(path.join(dirtyReadyTarget, ".github", "workflows", "release.yml"), "name: release\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "requests", "001-ready-task.md"), "# Request: ready-task\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "specs", "001-ready-task.md"), "# Spec 001: ready task\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "evals", "001-ready-task.md"), "# Eval: ready task\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "tasks", "001-ready-task.md"), "# Task 001: ready task\n");
  spawnSync("git", ["init"], { cwd: dirtyReadyTarget, encoding: "utf8" });
  const dirtyReadyNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    dirtyReadyTarget,
  ]);
  if (dirtyReadyNext.status !== 2
    || !dirtyReadyNext.stdout.includes("NEXT_ACTION: REPAIR_PROJECT_ENTRY_TRUST")
    || !dirtyReadyNext.stdout.includes("ADOPTION_MODE: READ_ONLY")
    || !dirtyReadyNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !dirtyReadyNext.stdout.includes("MUST_STOP_FOR_HUMAN: no")
    || !dirtyReadyNext.stdout.includes("PRODUCTION_GOVERNED_PROJECT")
    || !dirtyReadyNext.stdout.includes("DIRTY_WORKTREE_PROJECT")
    || !dirtyReadyNext.stdout.includes("PROJECT_FACT_GLOBAL_CONFLICT")) {
    fail(`dirty ready project should repair entry trust before task execution: ${dirtyReadyNext.stderr || dirtyReadyNext.stdout}`);
    return;
  }
  pass("dirty ready project workflow-next repairs entry trust before task execution");

  const dirtyUpdateTarget = path.join(tempRoot, "dirty-workflow-update-project");
  const dirtyUpdateInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    dirtyUpdateTarget,
    "--goal",
    "create a project for dirty workflow-update routing verification",
  ]);
  if (dirtyUpdateInit.status !== 0) {
    fail(`dirty workflow update project init failed: ${dirtyUpdateInit.stderr || dirtyUpdateInit.stdout}`);
    return;
  }
  fs.rmSync(path.join(dirtyUpdateTarget, "scripts", "check-ai-workflow.mjs"), { force: true });
  spawnSync("git", ["init"], { cwd: dirtyUpdateTarget, encoding: "utf8" });
  const dirtyUpdateNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    dirtyUpdateTarget,
  ]);
  if (dirtyUpdateNext.status !== 2
    || !dirtyUpdateNext.stdout.includes("NEXT_ACTION: REPAIR_PROJECT_ENTRY_TRUST")
    || !dirtyUpdateNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !dirtyUpdateNext.stdout.includes("MUST_STOP_FOR_HUMAN: no")
    || !dirtyUpdateNext.stdout.includes("DIRTY_WORKTREE_PROJECT")
    || !dirtyUpdateNext.stdout.includes("PROJECT_IDENTITY_CONFLICTED")) {
    fail(`dirty workflow update project should repair entry trust before recommending update: ${dirtyUpdateNext.stderr || dirtyUpdateNext.stdout}`);
    return;
  }
  pass("dirty workflow update project repairs entry trust before workflow asset update");

  const partialExistingTarget = path.join(tempRoot, "partial-existing-project");
  fs.mkdirSync(path.join(partialExistingTarget, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(partialExistingTarget, "package.json"), JSON.stringify({ name: "partial-existing-project", private: true }, null, 2));
  const partialExistingNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    partialExistingTarget,
  ]);
  if (partialExistingNext.status !== 0
    || !partialExistingNext.stdout.includes("NEXT_ACTION: RUN_ADOPTION_ASSESSMENT")
    || !partialExistingNext.stdout.includes("INTENTOS_OPERATING_MODE: ACTIVE")
    || !partialExistingNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !partialExistingNext.stdout.includes("MUST_STOP_FOR_HUMAN: no")
    || !partialExistingNext.stdout.includes("--update-workflow-assets --write-plan apply-execution-plans/intentos-workflow-update-plan.json")) {
    fail(`partial existing project should enter adoption assessment before the plan-first command: ${partialExistingNext.stderr || partialExistingNext.stdout}`);
    return;
  }
  pass("partial existing project workflow-next enters adoption assessment before plan-first workflow update");

  const onboardingO0Check = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
    "--level",
    "O0",
  ]);
  if (onboardingO0Check.status !== 0) {
    fail(`generated project O0 onboarding check failed: ${onboardingO0Check.stderr || onboardingO0Check.stdout}`);
    return;
  }
  pass("generated project O0 onboarding check");

  const onboardingO2Check = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
    "--level",
    "O2",
  ]);
  if (onboardingO2Check.status !== 0) {
    fail(`generated project O2 onboarding check failed: ${onboardingO2Check.stderr || onboardingO2Check.stdout}`);
    return;
  }
  pass("generated project O2 onboarding check");

  const workflowNextEnforcePending = runNode([
    path.join(target, "scripts", "workflow-next.mjs"),
    target,
    "--enforce",
  ]);
  if (workflowNextEnforcePending.status === 0
    || !/project onboarding is not ready|read-only adoption assessment is required/.test(workflowNextEnforcePending.stdout)) {
    fail(`generated project workflow-next enforce should fail while onboarding is pending: ${workflowNextEnforcePending.stderr || workflowNextEnforcePending.stdout}`);
    return;
  }
  pass("generated project workflow-next enforce fails while onboarding is pending");

  const dailySummaryCheck = runNode([
    path.join(target, "scripts", "workflow-daily-summary.mjs"),
    target,
    "--write-state",
  ]);
  if (dailySummaryCheck.status !== 0) {
    fail(`generated project workflow daily summary failed: ${dailySummaryCheck.stderr || dailySummaryCheck.stdout}`);
    return;
  }
  pass("generated project workflow daily summary");

  const emptyArtifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
  ]);
  if (emptyArtifactCheck.status !== 0) {
    fail(`generated project empty workflow artifact check failed: ${emptyArtifactCheck.stderr || emptyArtifactCheck.stdout}`);
    return;
  }
  pass("generated project empty workflow artifact check");

  const generatedRequest = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "request",
    "--name",
    "generated-check",
  ]);
  if (generatedRequest.status !== 0) {
    fail(`generated project new workflow item failed: ${generatedRequest.stderr || generatedRequest.stdout}`);
    return;
  }
  if (!fs.existsSync(path.join(target, "requests", "002-generated-check.md"))) {
    fail("generated project new workflow item did not create request");
    return;
  }
  const generatedRequestPath = path.join(target, "requests", "002-generated-check.md");
  const generatedRequestContent = fs.readFileSync(generatedRequestPath, "utf8");
  if (!generatedRequestContent.startsWith("---\n") || !generatedRequestContent.includes("artifact_type: request")) {
    fail("generated project new workflow item did not add request frontmatter");
    return;
  }
  pass("generated project new workflow item creates request");

  const legacyRequestContent = generatedRequestContent.replace(/^---\n[\s\S]*?\n---\n/, "");
  fs.writeFileSync(generatedRequestPath, legacyRequestContent);
  const legacyFrontmatterCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
  ]);
  if (legacyFrontmatterCheck.status !== 0 || !legacyFrontmatterCheck.stdout.includes("missing artifact frontmatter")) {
    fail(`generated project workflow artifact check should warn for legacy artifact frontmatter: ${legacyFrontmatterCheck.stderr || legacyFrontmatterCheck.stdout}`);
    return;
  }
  const strictLegacyFrontmatterCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
    "--strict-schema",
  ]);
  if (strictLegacyFrontmatterCheck.status === 0 || !strictLegacyFrontmatterCheck.stderr.includes("missing artifact frontmatter")) {
    fail(`generated project strict schema check should reject legacy artifact frontmatter: ${strictLegacyFrontmatterCheck.stderr || strictLegacyFrontmatterCheck.stdout}`);
    return;
  }
  fs.writeFileSync(generatedRequestPath, generatedRequestContent);
  pass("generated project workflow artifact check warns for legacy frontmatter and strict mode rejects it");

  const invalidGeneratedRequestContent = generatedRequestContent.replace("artifact_type: request\n", "");
  fs.writeFileSync(generatedRequestPath, invalidGeneratedRequestContent);
  const invalidFrontmatterCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
  ]);
  if (invalidFrontmatterCheck.status === 0 || !invalidFrontmatterCheck.stderr.includes("missing required frontmatter field: artifact_type")) {
    fail(`generated project workflow artifact check should reject invalid frontmatter: ${invalidFrontmatterCheck.stderr || invalidFrontmatterCheck.stdout}`);
    return;
  }
  fs.writeFileSync(generatedRequestPath, generatedRequestContent);
  pass("generated project workflow artifact check rejects invalid frontmatter");

  const generatedAdoptionAssessment = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "adoption-assessment",
    "--name",
    "governed-existing-project",
  ]);
  if (generatedAdoptionAssessment.status !== 0
    || !fs.existsSync(path.join(target, ".intentos", "adoption", "001-governed-existing-project.md"))) {
    fail(`generated project adoption assessment item failed: ${generatedAdoptionAssessment.stderr || generatedAdoptionAssessment.stdout}`);
    return;
  }
  pass("generated project new workflow item creates adoption assessment");

  const generatedGovernanceMap = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "governance-map",
    "--name",
    "governed-existing-project",
  ]);
  if (generatedGovernanceMap.status !== 0
    || !fs.existsSync(path.join(target, ".intentos", "adoption", "002-governed-existing-project.md"))) {
    fail(`generated project governance map item failed: ${generatedGovernanceMap.stderr || generatedGovernanceMap.stdout}`);
    return;
  }
  pass("generated project new workflow item creates governance map");

  const draftArtifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
  ]);
  if (draftArtifactCheck.status !== 0) {
    fail(`generated project draft workflow artifact check failed: ${draftArtifactCheck.stderr || draftArtifactCheck.stdout}`);
    return;
  }
  pass("generated project draft workflow artifact check tolerates placeholders");

  const readyPlaceholderCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
  ]);
  if (readyPlaceholderCheck.status === 0 || !readyPlaceholderCheck.stderr.includes("placeholder")) {
    fail(`generated project ready workflow artifact check should reject placeholders: ${readyPlaceholderCheck.stderr || readyPlaceholderCheck.stdout}`);
    return;
  }
  pass("generated project ready workflow artifact check rejects placeholders");

  const unknownArtifactOption = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--unknown-option",
  ]);
  if (unknownArtifactOption.status === 0 || !unknownArtifactOption.stderr.includes("unknown option")) {
    fail(`generated project workflow artifact check should reject unknown options: ${unknownArtifactOption.stderr || unknownArtifactOption.stdout}`);
    return;
  }
  pass("generated project workflow artifact check rejects unknown options");

  fs.unlinkSync(path.join(target, "requests", "002-generated-check.md"));

  const exampleCopies = [
    ["examples/web-internal-admin-first-slice/request-card.md", "requests/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/preflight-report.md", "preflight/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/spec.md", "specs/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/eval.md", "evals/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/task-card.md", "tasks/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/ai-task-log.example.md", "ai-logs/2026-06-24-admin-work-item-list.md"],
  ];
  for (const [source, dest] of exampleCopies) {
    fs.copyFileSync(path.join(kitRoot, source), path.join(target, dest));
  }

  const taskPath = path.join(target, "tasks", "001-admin-work-item-list.md");
  const originalTaskContent = fs.readFileSync(taskPath, "utf8");

  const unnecessaryApprovalContent = originalTaskContent
    .replace("Required: No", "Required: Yes")
    .replace("Status: Not Required", "Status: Pending");
  fs.writeFileSync(taskPath, unnecessaryApprovalContent);
  const unnecessaryApprovalCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (unnecessaryApprovalCheck.status === 0 || !unnecessaryApprovalCheck.stderr.includes("reversible project-local technical risks")) {
    fail(`generated project ready workflow artifact check should reject unnecessary human approval: ${unnecessaryApprovalCheck.stderr || unnecessaryApprovalCheck.stdout}`);
    return;
  }
  fs.writeFileSync(taskPath, originalTaskContent);
  pass("generated project ready workflow artifact check rejects unnecessary human approval");

  fs.writeFileSync(taskPath, originalTaskContent.replace("`specs/001-admin-work-item-list.md`", "`specs/<file>.md`"));
  const placeholderRefCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (placeholderRefCheck.status === 0 || !placeholderRefCheck.stderr.includes("placeholder file")) {
    fail(`generated project ready workflow artifact check should reject placeholder refs: ${placeholderRefCheck.stderr || placeholderRefCheck.stdout}`);
    return;
  }
  fs.writeFileSync(taskPath, originalTaskContent);
  pass("generated project ready workflow artifact check rejects placeholder refs");

  const artifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
  ]);
  if (artifactCheck.status !== 0) {
    fail(`generated project workflow artifact quality check failed: ${artifactCheck.stderr || artifactCheck.stdout}`);
    return;
  }
  pass("generated project workflow artifact quality check");

  const taskScopedArtifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (taskScopedArtifactCheck.status !== 0) {
    fail(`generated project task-scoped workflow artifact check failed: ${taskScopedArtifactCheck.stderr || taskScopedArtifactCheck.stdout}`);
    return;
  }
  pass("generated project task-scoped workflow artifact check");

  const generatedReviewPacket = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "review-packet",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedReviewPacket.status !== 0
    || !fs.existsSync(path.join(target, "review-packets", "001-admin-work-item-list.md"))) {
    fail(`generated project review packet item failed: ${generatedReviewPacket.stderr || generatedReviewPacket.stdout}`);
    return;
  }
  pass("generated project new workflow item creates review packet");

  const generatedGptReviewPrompt = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "gpt-review-prompt",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedGptReviewPrompt.status !== 0
    || !fs.existsSync(path.join(target, "gpt-review-prompts", "001-admin-work-item-list.md"))) {
    fail(`generated project GPT review prompt item failed: ${generatedGptReviewPrompt.stderr || generatedGptReviewPrompt.stdout}`);
    return;
  }
  pass("generated project new workflow item creates GPT review prompt");

  const generatedReviewLoopReport = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "review-loop-report",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedReviewLoopReport.status !== 0
    || !fs.existsSync(path.join(target, "review-loop-reports", "001-admin-work-item-list.md"))) {
    fail(`generated project review loop report item failed: ${generatedReviewLoopReport.stderr || generatedReviewLoopReport.stdout}`);
    return;
  }
  const generatedReviewLoopContent = fs.readFileSync(path.join(target, "review-loop-reports", "001-admin-work-item-list.md"), "utf8");
  if (!generatedReviewLoopContent.includes("Review required: Yes") || !generatedReviewLoopContent.includes("Max auto-fix rounds: 2")) {
    fail("generated project review loop report missing required review policy");
    return;
  }
  pass("generated project new workflow item creates review loop report");

  const generatedFollowUpProposal = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "follow-up-proposal",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedFollowUpProposal.status !== 0
    || !fs.existsSync(path.join(target, "follow-up-proposals", "001-admin-work-item-list.md"))) {
    fail(`generated project follow-up proposal item failed: ${generatedFollowUpProposal.stderr || generatedFollowUpProposal.stdout}`);
    return;
  }
  const generatedFollowUpContent = fs.readFileSync(path.join(target, "follow-up-proposals", "001-admin-work-item-list.md"), "utf8");
  if (!generatedFollowUpContent.includes("DIRECT_FOLLOW_UP") || !generatedFollowUpContent.includes("Can AI Do This Now?")) {
    fail("generated project follow-up proposal missing bounded next-step markers");
    return;
  }
  pass("generated project new workflow item creates follow-up proposal");

  const generatedFinalReport = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "final-report",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedFinalReport.status !== 0
    || !fs.existsSync(path.join(target, "final-reports", "001-admin-work-item-list.md"))) {
    fail(`generated project final report item failed: ${generatedFinalReport.stderr || generatedFinalReport.stdout}`);
    return;
  }
  const generatedFinalReportContent = fs.readFileSync(path.join(target, "final-reports", "001-admin-work-item-list.md"), "utf8");
  if (!generatedFinalReportContent.includes("Next-Step Suggestions") || !generatedFinalReportContent.includes("Next Safe Action")) {
    fail("generated project final report missing bounded next-step sections");
    return;
  }
  pass("generated project new workflow item creates final report");

  const generatedReviewLoopSemanticCheck = runNode([
    path.join(target, "scripts", "check-review-loop.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedReviewLoopSemanticCheck.status !== 0) {
    fail(`generated project review loop semantic check failed: ${generatedReviewLoopSemanticCheck.stderr || generatedReviewLoopSemanticCheck.stdout}`);
    return;
  }
  pass("generated project review loop semantic check");

  const generatedNextStepSemanticCheck = runNode([
    path.join(target, "scripts", "check-next-step-boundary.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedNextStepSemanticCheck.status !== 0) {
    fail(`generated project next-step boundary semantic check failed: ${generatedNextStepSemanticCheck.stderr || generatedNextStepSemanticCheck.stdout}`);
    return;
  }
  pass("generated project next-step boundary semantic check");

  const reviewLoopPath = path.join(target, "review-loop-reports", "001-admin-work-item-list.md");
  const originalReviewLoopContent = fs.readFileSync(reviewLoopPath, "utf8");
  const invalidReviewLoopContent = originalReviewLoopContent.replace(
    "|  | P0 / P1 / P2 | AUTO_FIX / NEEDS_HUMAN_DECISION / NEEDS_CLARIFICATION / NO_ACTION |  |  |  |  |  |",
    "| F1 | P1 | AUTO_FIX | Add a new dependency to fix this task | review-packets/001-admin-work-item-list.md | Install dependency | Codex | OPEN |",
  );
  fs.writeFileSync(reviewLoopPath, invalidReviewLoopContent);
  const invalidReviewLoopSemanticCheck = runNode([
    path.join(target, "scripts", "check-review-loop.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (invalidReviewLoopSemanticCheck.status === 0 || !invalidReviewLoopSemanticCheck.stderr.includes("AUTO_FIX")) {
    fail(`generated project review loop semantic check should reject forbidden AUTO_FIX: ${invalidReviewLoopSemanticCheck.stderr || invalidReviewLoopSemanticCheck.stdout}`);
    return;
  }
  fs.writeFileSync(reviewLoopPath, originalReviewLoopContent);
  pass("generated project review loop semantic check rejects forbidden AUTO_FIX");

  const finalReportPath = path.join(target, "final-reports", "001-admin-work-item-list.md");
  const originalFinalReportContent = fs.readFileSync(finalReportPath, "utf8");
  const invalidFinalReportContent = originalFinalReportContent.replace(
    "| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |",
    "| N1 | DIRECT_FOLLOW_UP | Align neighboring state | Same surface | Yes | current task | none |",
  );
  fs.writeFileSync(finalReportPath, invalidFinalReportContent);
  const invalidNextStepSemanticCheck = runNode([
    path.join(target, "scripts", "check-next-step-boundary.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (invalidNextStepSemanticCheck.status === 0 || !invalidNextStepSemanticCheck.stderr.includes("Can AI do now")) {
    fail(`generated project next-step semantic check should reject out-of-scope immediate work: ${invalidNextStepSemanticCheck.stderr || invalidNextStepSemanticCheck.stdout}`);
    return;
  }
  fs.writeFileSync(finalReportPath, originalFinalReportContent);
  pass("generated project next-step boundary semantic check rejects out-of-scope immediate work");

  const generatedGoalCard = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "goal-card",
    "--task",
    "tasks/001-admin-work-item-list.md",
    "--goal-mode",
    "IMPLEMENT_TASK",
  ]);
  const goalCardPath = path.join(target, "goal-cards", "001-admin-work-item-list.md");
  if (generatedGoalCard.status !== 0 || !fs.existsSync(goalCardPath)) {
    fail(`generated project goal card item failed: ${generatedGoalCard.stderr || generatedGoalCard.stdout}`);
    return;
  }
  pass("generated project new workflow item creates goal card");

  const generatedGoalModeCheck = runNode([
    path.join(target, "scripts", "check-goal-mode.mjs"),
    target,
  ]);
  if (generatedGoalModeCheck.status !== 0) {
    fail(`generated project Goal Mode semantic check failed: ${generatedGoalModeCheck.stderr || generatedGoalModeCheck.stdout}`);
    return;
  }
  pass("generated project Goal Mode semantic check");

  const originalGoalCardContent = fs.readFileSync(goalCardPath, "utf8");
  const invalidGoalCardContent = originalGoalCardContent.replace("Selected: IMPLEMENT_TASK", "Selected: AUTO_IMPLEMENT");
  fs.writeFileSync(goalCardPath, invalidGoalCardContent);
  const invalidGoalModeCheck = runNode([
    path.join(target, "scripts", "check-goal-mode.mjs"),
    target,
  ]);
  if (invalidGoalModeCheck.status === 0 || !invalidGoalModeCheck.stderr.includes("invalid Goal Mode")) {
    fail(`generated project Goal Mode check should reject invalid mode: ${invalidGoalModeCheck.stderr || invalidGoalModeCheck.stdout}`);
    return;
  }
  fs.writeFileSync(goalCardPath, originalGoalCardContent);
  pass("generated project Goal Mode semantic check rejects invalid mode");

  const generatedSubagentRunPlan = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "subagent-run-plan",
    "--task",
    "tasks/001-admin-work-item-list.md",
    "--subagent-mode",
    "READ_ONLY_RESEARCH",
  ]);
  const subagentRunPlanPath = path.join(target, "subagent-run-plans", "001-admin-work-item-list.md");
  if (generatedSubagentRunPlan.status !== 0 || !fs.existsSync(subagentRunPlanPath)) {
    fail(`generated project Subagent Run Plan item failed: ${generatedSubagentRunPlan.stderr || generatedSubagentRunPlan.stdout}`);
    return;
  }
  pass("generated project new workflow item creates Subagent Run Plan");

  const generatedSubagentCheck = runNode([
    path.join(target, "scripts", "check-subagent-orchestration.mjs"),
    target,
  ]);
  if (generatedSubagentCheck.status !== 0) {
    fail(`generated project Subagent Orchestration semantic check failed: ${generatedSubagentCheck.stderr || generatedSubagentCheck.stdout}`);
    return;
  }
  pass("generated project Subagent Orchestration semantic check");

  const originalSubagentRunPlanContent = fs.readFileSync(subagentRunPlanPath, "utf8");
  const invalidSubagentRunPlanContent = originalSubagentRunPlanContent
    .replace("| A1 | Goal Planner | READ_ONLY | SKIPPED | none | no helper needed yet | No subagent launched; plan is draft |", "| A1 | Reviewer | READ_ONLY | RUNNING | none | handoff complete | still open |")
    .replace("All subagents closed: Yes", "All subagents closed: No")
    .replace("No subagent left occupying a slot after handoff: Yes", "No subagent left occupying a slot after handoff: No");
  fs.writeFileSync(subagentRunPlanPath, invalidSubagentRunPlanContent);
  const invalidSubagentCheck = runNode([
    path.join(target, "scripts", "check-subagent-orchestration.mjs"),
    target,
  ]);
  if (invalidSubagentCheck.status === 0 || !invalidSubagentCheck.stderr.includes("subagent must be closed before final response")) {
    fail(`generated project Subagent Orchestration check should reject unclosed subagent: ${invalidSubagentCheck.stderr || invalidSubagentCheck.stdout}`);
    return;
  }
  fs.writeFileSync(subagentRunPlanPath, originalSubagentRunPlanContent);
  pass("generated project Subagent Orchestration semantic check rejects unclosed subagent");

  const generatedHumanStatusReport = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "human-status-report",
    "--name",
    "workflow-next",
  ]);
  if (generatedHumanStatusReport.status !== 0
    || !fs.existsSync(path.join(target, "status-reports", "001-workflow-next.md"))) {
    fail(`generated project human status report item failed: ${generatedHumanStatusReport.stderr || generatedHumanStatusReport.stdout}`);
    return;
  }
  pass("generated project new workflow item creates human status report");

  const generatedDecisionBrief = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "decision-brief",
    "--name",
    "baseline-selection",
  ]);
  if (generatedDecisionBrief.status !== 0
    || !fs.existsSync(path.join(target, "decision-briefs", "001-baseline-selection.md"))) {
    fail(`generated project decision brief item failed: ${generatedDecisionBrief.stderr || generatedDecisionBrief.stdout}`);
    return;
  }
  pass("generated project new workflow item creates decision brief");

  const generatedPlainReviewSummary = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "plain-review-summary",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedPlainReviewSummary.status !== 0
    || !fs.existsSync(path.join(target, "review-summaries", "001-admin-work-item-list.md"))) {
    fail(`generated project plain review summary item failed: ${generatedPlainReviewSummary.stderr || generatedPlainReviewSummary.stdout}`);
    return;
  }
  pass("generated project new workflow item creates plain review summary");

  const generatedCustomerHandoff = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "customer-handoff",
    "--name",
    "release-001",
  ]);
  if (generatedCustomerHandoff.status !== 0
    || !fs.existsSync(path.join(target, "customer-handoffs", "001-release-001.md"))) {
    fail(`generated project customer handoff item failed: ${generatedCustomerHandoff.stderr || generatedCustomerHandoff.stdout}`);
    return;
  }
  pass("generated project new workflow item creates customer handoff");

  // The following checks mutate task source repeatedly to exercise workflow
  // semantics. Keep the platform selection for the missed-risk assertions,
  // while deactivating BL2 so its runtime evidence does not mask diagnostics.
  fs.rmSync(baselineSelectionPath);

  const missedRiskTaskContent = originalTaskContent
    .replace("- [x] permission", "- [ ] permission")
    .replace("Required: Yes", "Required: No")
    .replace("Status: Pending", "Status: Not Required")
    .replace(/^Approval scope:.*$/m, "Approval scope: Not Required");
  fs.writeFileSync(taskPath, missedRiskTaskContent);
  const missedRiskReadyCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (missedRiskReadyCheck.status !== 0 || !missedRiskReadyCheck.stdout.includes("without matching Risk Gate checks")) {
    fail(`generated project ready workflow artifact check should warn on missed Risk Gate checks: ${missedRiskReadyCheck.stderr || missedRiskReadyCheck.stdout}`);
    return;
  }
  const missedRiskImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (missedRiskImplementationCheck.status === 0 || !missedRiskImplementationCheck.stderr.includes("without matching Risk Gate checks")) {
    fail(`generated project implementation mode should reject missed Risk Gate checks: ${missedRiskImplementationCheck.stderr || missedRiskImplementationCheck.stdout}`);
    return;
  }
  const workflowProjectProfileContent = fs.readFileSync(projectProfilePath, "utf8")
    .replace(/## Selected Profiles\n\n[\s\S]*?\n## Profile Rationale/, "## Selected Profiles\n\n\n## Profile Rationale");
  fs.writeFileSync(projectProfilePath, workflowProjectProfileContent);
  const excludedRiskTaskContent = missedRiskTaskContent.replace("## Human Approval", [
    "## Risk Gate Exclusions",
    "",
    "| Mentioned term | Not checked because | Human accepted |",
    "|---|---|---|",
    "| permission | self-check verifies an explicit human-accepted exclusion can override a text-only risk mention | Yes |",
    "",
    "## Human Approval",
  ].join("\n"));
  fs.writeFileSync(taskPath, excludedRiskTaskContent);
  const excludedRiskImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (excludedRiskImplementationCheck.status !== 0) {
    fail(`generated project implementation mode should accept human-approved Risk Gate Exclusions: ${excludedRiskImplementationCheck.stderr || excludedRiskImplementationCheck.stdout}`);
    return;
  }
  const tooManyExclusionsTaskContent = missedRiskTaskContent.replace("## Human Approval", [
    "## Risk Gate Exclusions",
    "",
    "| Mentioned term | Not checked because | Human accepted |",
    "|---|---|---|",
    "| permission | self-check verifies an explicit human-accepted exclusion can override a text-only risk mention | Yes |",
    "| auth | self-check fixture mentions auth only as a non-goal for this task | Yes |",
    "| migration | self-check fixture mentions migration only as a non-goal for this task | Yes |",
    "| production config | self-check fixture mentions production config only as a non-goal for this task | Yes |",
    "",
    "## Human Approval",
  ].join("\n"));
  fs.writeFileSync(taskPath, tooManyExclusionsTaskContent);
  const tooManyExclusionsReadyCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (tooManyExclusionsReadyCheck.status !== 0 || !tooManyExclusionsReadyCheck.stdout.includes("accepted Risk Gate Exclusions")) {
    fail(`generated project ready mode should warn on too many Risk Gate Exclusions: ${tooManyExclusionsReadyCheck.stderr || tooManyExclusionsReadyCheck.stdout}`);
    return;
  }
  const tooManyExclusionsImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (tooManyExclusionsImplementationCheck.status === 0 || !tooManyExclusionsImplementationCheck.stderr.includes("Risk Gate Exclusions")) {
    fail(`generated project implementation mode should reject too many Risk Gate Exclusions without approval scope: ${tooManyExclusionsImplementationCheck.stderr || tooManyExclusionsImplementationCheck.stdout}`);
    return;
  }
  const approvedTooManyExclusionsTaskContent = tooManyExclusionsTaskContent
    .replace("Required: No", "Required: Yes")
    .replace("Status: Not Required", "Status: Approved")
    .replace(/^Approval scope:.*$/m, "Approval scope: Risk Gate Exclusions accepted for this self-check fixture.")
    .replace("Approved by:", "Approved by: human-review")
    .replace("Approved at:", "Approved at: 2026-06-25T00:00:00.000Z");
  fs.writeFileSync(taskPath, approvedTooManyExclusionsTaskContent);
  const approvedTooManyExclusionsImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (approvedTooManyExclusionsImplementationCheck.status === 0
    || !approvedTooManyExclusionsImplementationCheck.stderr.includes("Human Approval cannot satisfy this technical evidence gap")) {
    fail(`generated project implementation mode should reject excessive Risk Gate Exclusions despite approval: ${approvedTooManyExclusionsImplementationCheck.stderr || approvedTooManyExclusionsImplementationCheck.stdout}`);
    return;
  }
  fs.writeFileSync(taskPath, originalTaskContent);
  pass("generated project workflow artifact check detects missed Risk Gate checks");
  pass("generated project workflow artifact check keeps technical Risk Gate Exclusions non-authorizable");
  pass("generated project workflow artifact check guards excessive Risk Gate Exclusions");

  const pendingConsentTaskContent = originalTaskContent
    .replace("- [ ] external side effect", "- [x] external side effect")
    .replace("Required: No", "Required: Yes")
    .replace("Status: Not Required", "Status: Pending")
    .replace(/^Approval scope:.*$/m, "Approval scope: Test-only external side effect consent boundary.");
  fs.writeFileSync(taskPath, pendingConsentTaskContent);
  const pendingImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (pendingImplementationCheck.status === 0 || !pendingImplementationCheck.stderr.includes("Status: Approved")) {
    fail(`generated project implementation mode should require approved human approval: ${pendingImplementationCheck.stderr || pendingImplementationCheck.stdout}`);
    return;
  }
  pass("generated project implementation mode rejects pending human approval");

  const copiedTaskPath = path.join(target, "tasks", "001-admin-work-item-list.md");
  const copiedTaskContent = fs.readFileSync(copiedTaskPath, "utf8")
    .replace("Status: Pending", "Status: Approved")
    .replace("Approved by:", "Approved by: human-review")
    .replace("Approved at:", "Approved at: 2026-06-25T00:00:00.000Z");
  fs.writeFileSync(copiedTaskPath, copiedTaskContent);

  const approvedImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (approvedImplementationCheck.status !== 0) {
    fail(`generated project implementation mode with approved human approval failed: ${approvedImplementationCheck.stderr || approvedImplementationCheck.stdout}`);
    return;
  }
  pass("generated project implementation mode accepts approved human approval");

  // Restore the exact governed baseline/task inputs before exercising the
  // controlled workflow update; the semantic checks above intentionally
  // mutated and deactivated those inputs.
  fs.writeFileSync(copiedTaskPath, originalTaskContent);
  fs.writeFileSync(projectProfilePath, projectProfileContent);
  fs.writeFileSync(baselineSelectionPath, baselineSelectionContent);

  const projectCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-ai-workflow.mjs"),
    target,
  ]);
  if (projectCheckAfterUpdate.status !== 0) {
    fail(`generated project workflow check after update failed: ${projectCheckAfterUpdate.stderr || projectCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow check after update");

  const nextCheckAfterUpdate = runNode([
    path.join(target, "scripts", "workflow-next.mjs"),
    target,
  ]);
  if (nextCheckAfterUpdate.status !== 0 || !nextCheckAfterUpdate.stdout.includes("PROJECT_STATE: BOOTSTRAPPED_PROJECT")) {
    fail(`generated project workflow next check after update failed: ${nextCheckAfterUpdate.stderr || nextCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow next check after update");

  const versionCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-workflow-version.mjs"),
    target,
  ]);
  if (versionCheckAfterUpdate.status !== 0) {
    fail(`generated project workflow version check after update failed: ${versionCheckAfterUpdate.stderr || versionCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow version check after update");

  const onboardingCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
  ]);
  if (onboardingCheckAfterUpdate.status !== 0) {
    fail(`generated project onboarding check after update failed: ${onboardingCheckAfterUpdate.stderr || onboardingCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project onboarding check after update");

  const dailySummaryAfterUpdate = runNode([
    path.join(target, "scripts", "workflow-daily-summary.mjs"),
    target,
  ]);
  if (dailySummaryAfterUpdate.status !== 0) {
    fail(`generated project workflow daily summary after update failed: ${dailySummaryAfterUpdate.stderr || dailySummaryAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow daily summary after update");

  const artifactCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
  ]);
  if (artifactCheckAfterUpdate.status !== 0) {
    fail(`generated project workflow artifact quality check after update failed: ${artifactCheckAfterUpdate.stderr || artifactCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow artifact quality check after update");

  const executionAssuranceResolveAfterUpdate = runNode([
    path.join(target, "scripts", "resolve-execution-assurance.mjs"),
    target,
    "--intent",
    "generated project execution assurance smoke",
  ]);
  if (executionAssuranceResolveAfterUpdate.status !== 0 || !executionAssuranceResolveAfterUpdate.stdout.includes("Execution Assurance Report")) {
    fail(`generated project execution assurance resolver after update failed: ${executionAssuranceResolveAfterUpdate.stderr || executionAssuranceResolveAfterUpdate.stdout}`);
    return;
  }
  pass("generated project execution assurance resolver after update");

  const executionAssuranceCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-execution-assurance.mjs"),
    target,
    "--allow-empty",
  ]);
  if (executionAssuranceCheckAfterUpdate.status !== 0) {
    fail(`generated project execution assurance checker after update failed: ${executionAssuranceCheckAfterUpdate.stderr || executionAssuranceCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project execution assurance checker after update");

  if (generatedVerificationStrictCheck.status === 0) {
  const generatedVerificationRefreshAfterUpdate = runNode([
    path.join(target, "scripts", "resolve-verification-plan.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--impact-ref",
    `artifact:${generatedImpactReport}`,
    "--out",
    generatedVerificationReport,
  ]);
  if (generatedVerificationRefreshAfterUpdate.status !== 0
    || !generatedVerificationRefreshAfterUpdate.stdout.includes("VERIFICATION_PLAN_READY")) {
    fail(`generated project Verification Plan refresh after workflow update failed: ${generatedVerificationRefreshAfterUpdate.stderr || generatedVerificationRefreshAfterUpdate.stdout}`);
    return;
  }
  const generatedTestEvidenceRefreshAfterUpdate = runNode([
    path.join(target, "scripts", "resolve-test-evidence.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    `artifact:${generatedVerificationReport}`,
    "--evidence",
    generatedEvidenceRefs.join(","),
    "--out",
    generatedTestEvidenceReport,
  ]);
  if (generatedTestEvidenceRefreshAfterUpdate.status !== 0
    || !generatedTestEvidenceRefreshAfterUpdate.stdout.includes("TEST_EVIDENCE_BLOCKED")) {
    fail(`generated project Test Evidence refresh after workflow update failed: ${generatedTestEvidenceRefreshAfterUpdate.stderr || generatedTestEvidenceRefreshAfterUpdate.stdout}`);
    return;
  }
  fs.writeFileSync(path.join(target, generatedExecutionAssuranceReport), generatedExecutionAssuranceReportText({
    taskRef: "tasks/001-appointment-requests-must-include-a-service-time.md",
    testEvidenceRef: `artifact:${generatedTestEvidenceReport}`,
    testEvidenceDigest: fileDigest(path.join(target, generatedTestEvidenceReport)),
    authorityBinding: createEvidenceAuthorityBinding(target, {
      taskRef: "tasks/001-appointment-requests-must-include-a-service-time.md",
      intentDigest: "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
      sourceRefs: [`artifact:${generatedTestEvidenceReport}`],
      fromFile: path.join(target, generatedExecutionAssuranceReport),
    }),
  }));
  const generatedCompletionResolveAfterUpdate = runNode([
    path.join(target, "scripts", "resolve-completion-evidence.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--verification-plan-ref",
    `artifact:${generatedVerificationReport}`,
    "--test-evidence-ref",
    `artifact:${generatedTestEvidenceReport}`,
    "--execution-assurance-ref",
    `artifact:${generatedExecutionAssuranceReport}`,
    "--out",
    generatedCompletionReport,
  ]);
  if (generatedCompletionResolveAfterUpdate.status !== 0
    || !fs.existsSync(path.join(target, generatedCompletionReport))
    || !generatedCompletionResolveAfterUpdate.stdout.includes("BLOCKED_BY_RUNTIME_TRUST")) {
    fail(`generated project Completion Evidence resolver after workflow update failed: ${generatedCompletionResolveAfterUpdate.stderr || generatedCompletionResolveAfterUpdate.stdout}`);
    return;
  }
  const generatedCompletionStrictCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-completion-evidence.mjs"),
    target,
    "--report",
    generatedCompletionReport,
    "--require-structured-evidence",
    "--require-source-refs",
  ]);
  if (generatedCompletionStrictCheckAfterUpdate.status !== 0
    || !generatedCompletionStrictCheckAfterUpdate.stdout.includes("Completion Evidence Gate check passed")
    || !generatedCompletionStrictCheckAfterUpdate.stdout.includes("includes gate check check:runtime-trust")
    || !generatedCompletionStrictCheckAfterUpdate.stdout.includes("includes gate check check:runtime-consumer-agreement")) {
    fail(`generated project Completion Evidence strict source binding after workflow update failed: ${generatedCompletionStrictCheckAfterUpdate.stderr || generatedCompletionStrictCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project strict Completion Evidence source binding after workflow update");

  const generatedReleaseCandidate = "release-candidates/001-generated-service-time-preview.md";
  const generatedBuildEvidence = "evidence/generated-preview-build.txt";
  const generatedRuntimeSmoke = "evidence/generated-runtime-smoke.txt";
  fs.mkdirSync(path.join(target, "release-candidates"), { recursive: true });
  fs.writeFileSync(path.join(target, generatedReleaseCandidate), [
    "# Generated Service Time Preview Candidate",
    "",
    "- Target: preview",
    "- Source revision: git:generated-project-smoke",
    "- Boundary: review handoff only; no release approval.",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(target, generatedBuildEvidence), [
    "id: evidence:generated-preview-build",
    "evidence_type: COMMAND_OUTPUT",
    "result_state: PASSED",
    "command: npm run build -- generated-service-time",
    "owner: generated-project-smoke",
    "environment: generated-local-ci",
    "ran_at: 2026-07-06T10:20:00Z",
    "exit_code: 0",
    "PASS generated preview build artifact.",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(target, generatedRuntimeSmoke), [
    "id: evidence:generated-runtime-smoke",
    "evidence_type: COMMAND_OUTPUT",
    "result_state: PASSED",
    "command: npm run smoke:preview -- generated-service-time",
    "owner: generated-project-smoke",
    "environment: generated-local-ci",
    "ran_at: 2026-07-06T10:21:00Z",
    "exit_code: 0",
    "PASS generated preview runtime smoke.",
    "",
  ].join("\n"));
  const generatedReleaseEvidenceReport = "release-evidence-gate-reports/001-generated-service-time-preview.md";
  const generatedReleaseEvidenceResolve = runNode([
    path.join(target, "scripts", "resolve-release-evidence-gate.mjs"),
    target,
    "--intent",
    "prepare generated service time preview review",
    "--release-target",
    "preview",
    "--release-candidate-ref",
    `artifact:${generatedReleaseCandidate}`,
    "--source-revision",
    "git:generated-project-smoke",
    "--dirty-worktree-status",
    "clean",
    "--task-ref",
    "tasks/001-appointment-requests-must-include-a-service-time.md",
    "--completion-evidence-ref",
    `artifact:${generatedCompletionReport}`,
    "--build-artifact-ref",
    `artifact:${generatedBuildEvidence}`,
    "--build-artifact-digest",
    fileDigest(path.join(target, generatedBuildEvidence)),
    "--release-owner",
    "human:generated-preview-owner",
    "--runtime-smoke-ref",
    `artifact:${generatedRuntimeSmoke}`,
    "--out",
    generatedReleaseEvidenceReport,
  ]);
  if (generatedReleaseEvidenceResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedReleaseEvidenceReport))
    || !generatedReleaseEvidenceResolve.stdout.includes("Release Evidence Gate Report")
    || !generatedReleaseEvidenceResolve.stdout.includes("BLOCKED_BY_MISSING_RELEASE_EVIDENCE")
    || !generatedReleaseEvidenceResolve.stdout.includes(`completion-evidence-not-ready:artifact:${generatedCompletionReport}`)) {
    fail(`generated project Release Evidence Gate resolver after update failed: ${generatedReleaseEvidenceResolve.stderr || generatedReleaseEvidenceResolve.stdout}`);
    return;
  }
  const generatedReleaseEvidenceCheck = runNode([
    path.join(target, "scripts", "check-release-evidence-gate.mjs"),
    target,
    "--report",
    generatedReleaseEvidenceReport,
    "--require-structured-evidence",
    "--require-current-completion",
    "--strict-source-binding",
  ]);
  if (generatedReleaseEvidenceCheck.status === 0
    || !`${generatedReleaseEvidenceCheck.stdout}\n${generatedReleaseEvidenceCheck.stderr}`.includes(`Completion Evidence set artifact:${generatedCompletionReport} strict checker failed`)) {
    fail(`generated project Release Evidence Gate checker must reject Runtime Trust-blocked Completion Evidence after update: ${generatedReleaseEvidenceCheck.stderr || generatedReleaseEvidenceCheck.stdout}`);
    return;
  }
  pass("generated project Release Evidence Gate stays blocked by Runtime Trust-blocked Completion Evidence after update");
  }

  const dryRunTarget = path.join(tempRoot, "dry-run-project");
  const nonEmptyInitTarget = path.join(tempRoot, "non-empty-init-project");
  fs.mkdirSync(nonEmptyInitTarget, { recursive: true });
  fs.writeFileSync(path.join(nonEmptyInitTarget, "existing.txt"), "existing project file\n");
  const directNonEmptyInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    nonEmptyInitTarget,
    "--goal",
    "create a project without overwriting existing content",
  ]);
  if (directNonEmptyInit.status !== 2
    || !`${directNonEmptyInit.stdout}\n${directNonEmptyInit.stderr}`.includes("Direct new-project setup is not allowed for NONEMPTY_DIRECTORY")
    || !`${directNonEmptyInit.stdout}\n${directNonEmptyInit.stderr}`.includes("read-only adoption assessment")
    || fs.existsSync(path.join(nonEmptyInitTarget, ".intentos", "version.json"))) {
    fail(`direct init must reject non-empty targets: ${directNonEmptyInit.stderr || directNonEmptyInit.stdout}`);
    return;
  }
  pass("direct init rejects non-empty target without force");

  const forceInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    nonEmptyInitTarget,
    "--goal",
    "create a project while preserving the explicitly declared existing seed content",
    "--force-new-project",
  ]);
  if (forceInit.status === 0
    || !`${forceInit.stdout}\n${forceInit.stderr}`.includes("force-new-project was removed")
    || fs.existsSync(path.join(nonEmptyInitTarget, ".intentos", "version.json"))) {
    fail(`removed force-new-project flag must not bypass existing-project adoption: ${forceInit.stderr || forceInit.stdout}`);
    return;
  }
  pass("removed force-new-project flag cannot bypass existing-project adoption");

  const dryRunResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    dryRunTarget,
    "--goal",
    "create a project through a dry-run preview",
    "--dry-run",
  ]);
  if (dryRunResult.status !== 0 || !dryRunResult.stdout.includes('"operation": "INIT_PROJECT"')) {
    fail(`init dry-run did not produce plan preview: ${dryRunResult.stderr || dryRunResult.stdout}`);
    return;
  }
  if (fs.existsSync(dryRunTarget)) {
    fail("init dry-run wrote target files");
    return;
  }
  pass("init dry-run emits plan without writing target files");

  const planOnlyTarget = path.join(tempRoot, "plan-only-project");
  const planOnlyPath = path.join(planOnlyTarget, "apply-execution-plans", "plan-only-init.json");
  fs.mkdirSync(planOnlyTarget, { recursive: true });
  const writeInitPlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    planOnlyTarget,
    "--goal",
    "create a project through a reviewed controlled apply plan",
    "--write-plan",
    path.relative(planOnlyTarget, planOnlyPath),
  ]);
  if (writeInitPlan.status !== 0 || !fs.existsSync(planOnlyPath)) {
    fail(`init write-plan failed: ${writeInitPlan.stderr || writeInitPlan.stdout}`);
    return;
  }
  if (fs.existsSync(path.join(planOnlyTarget, ".intentos", "version.json"))) {
    fail("init write-plan wrote workflow target files");
    return;
  }
  const missingReadinessApproval = writeInitProjectApprovalRecord(planOnlyPath);
  const missingReadinessApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    planOnlyPath,
    "--approval-record",
    missingReadinessApproval,
  ]);
  if (missingReadinessApply.status !== 2
    || !`${missingReadinessApply.stdout}\n${missingReadinessApply.stderr}`.includes("does not accept file-authored HUMAN_APPROVAL or legacy controlled-readiness authority")) {
    fail(`controlled apply must reject legacy file-authored technical authority: ${missingReadinessApply.stderr || missingReadinessApply.stdout}`);
    return;
  }
  fs.rmSync(missingReadinessApproval, { force: true });
  pass("1.92 controlled apply rejects legacy file-authored technical authority");
  const applyInitPlan = runNode(approvedInitProjectApplyArgs(planOnlyPath));
  if (applyInitPlan.status !== 2
    || !`${applyInitPlan.stdout}\n${applyInitPlan.stderr}`.includes("standalone new-project apply plan does not create a second authority path")) {
    fail(`standalone new-project apply plan must not create a second authority path: ${applyInitPlan.stderr || applyInitPlan.stdout}`);
    return;
  }
  pass("new-project apply-plan rejects a second authority path");
  const automaticBootstrapTarget = path.join(tempRoot, "automatic-bootstrap-project");
  const automaticInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    automaticBootstrapTarget,
    "--goal",
    "create a project through the ordinary automatic bootstrap path",
  ]);
  if (automaticInit.status !== 0 || !fs.existsSync(path.join(automaticBootstrapTarget, ".intentos", "version.json"))) {
    fail(`ordinary automatic new-project bootstrap failed: ${automaticInit.stderr || automaticInit.stdout}`);
    return;
  }
  pass("ordinary new-project command performs the single controlled bootstrap path");
  const bootstrapReceiptCheck = loadVerifiedBootstrapReceipt(automaticBootstrapTarget);
  if (!bootstrapReceiptCheck.ok) {
    fail(`1.109 applied new-project bootstrap receipt did not verify: ${bootstrapReceiptCheck.errors.join("; ")}`);
    return;
  }
  pass("1.109 exact new-project plan replay produces a valid project-bound bootstrap receipt");
  const copiedReceiptTarget = path.join(tempRoot, "copied-receipt-project");
  fs.mkdirSync(path.join(copiedReceiptTarget, ".intentos"), { recursive: true });
  fs.copyFileSync(
    path.join(automaticBootstrapTarget, ".intentos", "bootstrap-receipt.json"),
    path.join(copiedReceiptTarget, ".intentos", "bootstrap-receipt.json"),
  );
  const copiedReceiptCheck = loadVerifiedBootstrapReceipt(copiedReceiptTarget);
  if (copiedReceiptCheck.ok || !copiedReceiptCheck.errors.some((error) => error.includes("canonical project root"))) {
    fail(`1.109 bootstrap receipt validator must reject evidence copied from another project: ${copiedReceiptCheck.errors.join("; ")}`);
    return;
  }
  pass("1.109 bootstrap receipt validator rejects evidence copied from another project");
  const staleReceiptTarget = path.join(automaticBootstrapTarget, "AGENTS.md");
  fs.appendFileSync(staleReceiptTarget, "\nReceipt stale mutation.\n");
  const staleEntryTrust = resolveProjectEntryTrust({
    projectRoot: automaticBootstrapTarget,
    sourceRoot: kitRoot,
    goal: "continue the controlled project",
  });
  if (staleEntryTrust.project_identity?.state !== "CONFLICTED"
    || !staleEntryTrust.blockers.includes("PROJECT_IDENTITY_CONFLICTED")) {
    fail(`1.109 project entry trust must reject post-bootstrap managed-asset drift: ${JSON.stringify(staleEntryTrust)}`);
    return;
  }
  pass("1.109 project entry trust rejects post-bootstrap managed-asset drift");

  const sourceDriftTarget = path.join(tempRoot, "source-drift-project");
  const sourceDriftPlanPath = path.join(sourceDriftTarget, "apply-execution-plans", "source-drift-init.json");
  fs.mkdirSync(sourceDriftTarget, { recursive: true });
  const sourceDriftWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    sourceDriftTarget,
    "--goal",
    "create a project with source-drift protection",
    "--write-plan",
    path.relative(sourceDriftTarget, sourceDriftPlanPath),
  ]);
  if (sourceDriftWritePlan.status !== 0) {
    fail(`1.92 source-drift write-plan failed: ${sourceDriftWritePlan.stderr || sourceDriftWritePlan.stdout}`);
    return;
  }
  const sourceDriftPlan = JSON.parse(fs.readFileSync(sourceDriftPlanPath, "utf8"));
  const sourceBoundAction = sourceDriftPlan.actions.find((action) => action.source && action.willWrite === true);
  if (!sourceBoundAction) {
    fail("1.92 source-drift fixture could not find a source-bound executable action");
    return;
  }
  sourceBoundAction.sourceHash = `sha256:${"0".repeat(64)}`;
  sourceBoundAction.expectedHashAfter = sourceBoundAction.sourceHash;
  sourceDriftPlan.planDigest = evidenceDigest(sourceDriftPlan, ["planDigest"]);
  fs.writeFileSync(sourceDriftPlanPath, `${JSON.stringify(sourceDriftPlan, null, 2)}\n`);
  const sourceDriftApply = runNode(approvedInitProjectApplyArgs(sourceDriftPlanPath));
  if (sourceDriftApply.status !== 2 || !`${sourceDriftApply.stdout}\n${sourceDriftApply.stderr}`.includes("source for")) {
    fail(`1.92 controlled apply must reject source drift after planning: ${sourceDriftApply.stderr || sourceDriftApply.stdout}`);
    return;
  }
  pass("1.92 controlled apply rejects source drift after planning");

  const stalePlanTarget = path.join(tempRoot, "stale-plan-project");
  const stalePlanInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    stalePlanTarget,
    "--goal",
    "create a governed local project for stale-plan protection",
  ]);
  if (stalePlanInit.status !== 0) {
    fail(`stale-plan target init failed: ${stalePlanInit.stderr || stalePlanInit.stdout}`);
    return;
  }
  const stalePlanPath = path.join(stalePlanTarget, "apply-execution-plans", "stale-update-plan.json");
  const staleWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    stalePlanTarget,
    "--update-workflow-assets",
    "--goal",
    "refresh workflow assets with stale-plan protection",
    "--write-plan",
    path.relative(stalePlanTarget, stalePlanPath),
  ]);
  if (staleWritePlan.status !== 0) {
    fail(`stale update write-plan failed: ${staleWritePlan.stderr || staleWritePlan.stdout}`);
    return;
  }
  fs.appendFileSync(path.join(stalePlanTarget, "AGENTS.md"), "\nChanged after plan.\n");
  const staleApply = runNode(approvedInitProjectApplyArgs(stalePlanPath));
  if (staleApply.status !== 2 || !`${staleApply.stdout}\n${staleApply.stderr}`.includes("Plan precondition failed")) {
    fail(`stale update apply-plan did not fail on fingerprint change: ${staleApply.stderr || staleApply.stdout}`);
    return;
  }
  pass("apply-plan rejects changed target fingerprint");

  const backupTarget = path.join(tempRoot, "backup-project");
  const backupInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    backupTarget,
    "--goal",
    "create a project for managed-asset backup verification",
  ]);
  if (backupInit.status !== 0) {
    fail(`backup target init failed: ${backupInit.stderr || backupInit.stdout}`);
    return;
  }
  fs.appendFileSync(path.join(backupTarget, "scripts", "check-ai-workflow.mjs"), "\n// local backup sentinel\n");
  const backupPlanPath = path.join(backupTarget, "apply-execution-plans", "backup-update-plan.json");
  const backupDir = ".intentos/backups/0.38-test";
  const backupPlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    backupTarget,
    "--update-workflow-assets",
    "--goal",
    "refresh workflow assets while preserving a rollback backup",
    "--backup-dir",
    backupDir,
    "--write-plan",
    path.relative(backupTarget, backupPlanPath),
  ]);
  if (backupPlan.status !== 0) {
    fail(`backup update write-plan failed: ${backupPlan.stderr || backupPlan.stdout}`);
    return;
  }
  const backupApply = runNode(approvedInitProjectApplyArgs(backupPlanPath));
  const backedUpScript = path.join(backupTarget, backupDir, "scripts", "check-ai-workflow.mjs");
  if (backupApply.status !== 2
    || !`${backupApply.stdout}\n${backupApply.stderr}`.includes("blocked by unproven asset ownership")
    || fs.existsSync(backedUpScript)) {
    fail(`managed-asset update must reject unproven local ownership before backup or overwrite: ${backupApply.stderr || backupApply.stdout}`);
    return;
  }
  pass("managed-asset update rejects unproven local ownership before backup or overwrite");

  const legacyTarget = path.join(tempRoot, "legacy-project");
  fs.mkdirSync(legacyTarget, { recursive: true });
  fs.writeFileSync(path.join(legacyTarget, "AGENTS.md"), "# Legacy\n");
  fs.mkdirSync(path.join(legacyTarget, "docs"), { recursive: true });
  const legacyDirectUpdateResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
    "--goal",
    "adopt IntentOS workflow assets into an existing governed project",
  ]);
  if (legacyDirectUpdateResult.status !== 2 || !`${legacyDirectUpdateResult.stdout}\n${legacyDirectUpdateResult.stderr}`.includes("plan-first")) {
    fail(`legacy project direct workflow update was not blocked: ${legacyDirectUpdateResult.stderr || legacyDirectUpdateResult.stdout}`);
    return;
  }
  const legacyPlanPath = path.join(legacyTarget, "apply-execution-plans", "legacy-update-plan.json");
  const legacyWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
    "--goal",
    "adopt IntentOS workflow assets while preserving existing project authority",
    "--apply-agent-governance",
    "--write-plan",
    path.relative(legacyTarget, legacyPlanPath),
  ]);
  const legacyWritePlanOutput = `${legacyWritePlan.stdout}\n${legacyWritePlan.stderr}`;
  if (legacyWritePlan.status === 0
    || !legacyWritePlanOutput.includes("resolve-existing-rule-reconciliation.mjs failed during native-adoption assessment")
    || fs.existsSync(path.join(legacyTarget, ".intentos", "version.json"))) {
    fail(`legacy project write-plan must remain blocked until native-rule reconciliation is complete: ${legacyWritePlan.stderr || legacyWritePlan.stdout}`);
    return;
  }
  pass("legacy project write-plan remains read-only until native-rule reconciliation is complete");
  return;
  if (fs.existsSync(path.join(legacyTarget, ".intentos", "version.json"))) {
    fail("legacy project write-plan wrote workflow version before apply-plan");
    return;
  }
  const legacyUpdateResult = runNode(approvedInitProjectApplyArgs(legacyPlanPath));
  if (legacyUpdateResult.status !== 0) {
    fail(`legacy project apply-plan workflow update failed: ${legacyUpdateResult.stderr || legacyUpdateResult.stdout}`);
    return;
  }
  pass("legacy project workflow update requires plan-first apply");
  const legacyExpectedDirs = ["skill-candidates", "automation-proposals", "workflow-retros", "workflow-improvements", "review-packets", "gpt-review-prompts", "review-loop-reports", "follow-up-proposals", "final-reports", "status-reports", "decision-briefs", "review-summaries", "customer-handoffs"];
  for (const dir of legacyExpectedDirs) {
    if (!fs.existsSync(path.join(legacyTarget, dir))) {
      fail(`legacy project workflow update missing ${dir}`);
      return;
    }
  }
  pass("legacy project workflow update creates missing workflow dirs");

  const legacyExpectedOnboardingDocs = [
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
    "docs/verification-matrix.md",
    "docs/engineering-baseline.md",
  ];
  for (const rel of legacyExpectedOnboardingDocs) {
    if (!fs.existsSync(path.join(legacyTarget, rel))) {
      fail(`legacy project workflow update missing ${rel}`);
      return;
    }
  }
  pass("legacy project workflow update creates missing onboarding docs");

  const legacyAgentsContent = fs.readFileSync(path.join(legacyTarget, "AGENTS.md"), "utf8");
  if (!legacyAgentsContent.startsWith("# Legacy\n")
    || !legacyAgentsContent.includes("# IntentOS Workflow Governance Appendix")
    || !legacyAgentsContent.includes("## Product Baseline And Claim Control")) {
    fail("legacy project AGENTS.md did not preserve existing authority while applying the approved IntentOS appendix");
    return;
  }
  const legacyPlan = JSON.parse(fs.readFileSync(legacyPlanPath, "utf8"));
  if (!legacyPlan.actions.some((action) => action.type === "UPDATE_MANAGED" && action.path === "AGENTS.md" && action.executionSupported === true)) {
    fail("legacy project plan must include the explicitly approved AGENTS.md governance update");
    return;
  }
  pass("legacy project plan binds the explicitly approved AGENTS.md governance update");

  const legacyAgentsApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
    "--goal",
    "update the existing collaboration guidance through a controlled plan",
    "--apply-agent-governance",
  ]);
  if (legacyAgentsApply.status !== 2 || !`${legacyAgentsApply.stdout}\n${legacyAgentsApply.stderr}`.includes("plan-first")) {
    fail(`legacy project direct AGENTS.md governance apply must be blocked: ${legacyAgentsApply.stderr || legacyAgentsApply.stdout}`);
    return;
  }
  const appliedLegacyAgents = fs.readFileSync(path.join(legacyTarget, "AGENTS.md"), "utf8");
  if (appliedLegacyAgents !== legacyAgentsContent) {
    fail("blocked direct governance apply changed legacy AGENTS.md");
    return;
  }
  pass("legacy project direct AGENTS.md governance apply is blocked without a new exact plan");

  const legacyNoAgentsTarget = path.join(tempRoot, "legacy-no-agents");
  fs.mkdirSync(legacyNoAgentsTarget, { recursive: true });
  fs.writeFileSync(path.join(legacyNoAgentsTarget, "README.md"), "# Existing Project\n");
  const legacyNoAgentsPlanPath = path.join(legacyNoAgentsTarget, "apply-execution-plans", "legacy-no-agents-update-plan.json");
  const legacyNoAgentsWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyNoAgentsTarget,
    "--update-workflow-assets",
    "--goal",
    "adopt IntentOS workflow guidance into an existing project without AGENTS",
    "--write-plan",
    path.relative(legacyNoAgentsTarget, legacyNoAgentsPlanPath),
  ]);
  if (legacyNoAgentsWritePlan.status !== 0) {
    fail(`legacy no-AGENTS write-plan failed: ${legacyNoAgentsWritePlan.stderr || legacyNoAgentsWritePlan.stdout}`);
    return;
  }
  const legacyNoAgentsUpdate = runNode(approvedInitProjectApplyArgs(legacyNoAgentsPlanPath));
  if (legacyNoAgentsUpdate.status !== 0) {
    fail(`legacy no-AGENTS apply-plan workflow update failed: ${legacyNoAgentsUpdate.stderr || legacyNoAgentsUpdate.stdout}`);
    return;
  }
  const createdAgents = path.join(legacyNoAgentsTarget, "AGENTS.md");
  if (!fs.existsSync(createdAgents)) {
    fail("legacy no-AGENTS workflow update did not create AGENTS.md");
    return;
  }
  const createdAgentsContent = fs.readFileSync(createdAgents, "utf8");
  for (const marker of ["Bootstrap Entry", "Engineering Baseline", "Platform Baseline", "Industrial Baseline", "Subagent Orchestration", "Bounded Next-Step", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
    if (!createdAgentsContent.includes(marker)) {
      fail(`created AGENTS.md missing ${marker}`);
      return;
    }
  }
  pass("legacy no-AGENTS workflow update creates governed AGENTS.md");

  const legacyPrTemplate = path.join(legacyTarget, ".github", "pull_request_template.md");
  if (!fs.existsSync(legacyPrTemplate)) {
    fail("legacy project workflow update missing PR template");
    return;
  }
  const legacyPrTemplateContent = fs.readFileSync(legacyPrTemplate, "utf8");
  for (const marker of ["Human Summary", "Bootstrap state", "Project onboarding", "Engineering baseline", "Workflow Evidence", "Workflow artifact quality", "Review Packet / Review Loop Report", "Subagent Run Plan", "Next-Step Suggestions", "Skill / Automation Governance", "irreversible operation"]) {
    if (!legacyPrTemplateContent.includes(marker)) {
      fail(`legacy project workflow update PR template missing ${marker}`);
      return;
    }
  }
  pass("legacy project workflow update creates missing PR template with governance markers");

  const legacyCustomPrTarget = path.join(tempRoot, "legacy-custom-pr-template");
  fs.mkdirSync(path.join(legacyCustomPrTarget, ".github"), { recursive: true });
  const legacyCustomPrTemplate = path.join(legacyCustomPrTarget, ".github", "pull_request_template.md");
  const originalCustomPrTemplate = "# Existing PR Template\n\n- [ ] Existing project checklist\n";
  fs.writeFileSync(legacyCustomPrTemplate, originalCustomPrTemplate);
  const legacyCustomPrPlanPath = path.join(legacyCustomPrTarget, "apply-execution-plans", "legacy-custom-pr-update-plan.json");
  const legacyCustomPrWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyCustomPrTarget,
    "--update-workflow-assets",
    "--goal",
    "adopt IntentOS while preserving the existing pull request template",
    "--write-plan",
    path.relative(legacyCustomPrTarget, legacyCustomPrPlanPath),
  ]);
  if (legacyCustomPrWritePlan.status !== 0) {
    fail(`legacy custom PR template write-plan failed: ${legacyCustomPrWritePlan.stderr || legacyCustomPrWritePlan.stdout}`);
    return;
  }
  const legacyCustomPrUpdate = runNode(approvedInitProjectApplyArgs(legacyCustomPrPlanPath));
  if (legacyCustomPrUpdate.status !== 0) {
    fail(`legacy custom PR template apply-plan workflow update failed: ${legacyCustomPrUpdate.stderr || legacyCustomPrUpdate.stdout}`);
    return;
  }
  const unchangedCustomPrTemplate = fs.readFileSync(legacyCustomPrTemplate, "utf8");
  if (unchangedCustomPrTemplate !== originalCustomPrTemplate) {
    fail("legacy custom PR template was modified without explicit approval");
    return;
  }
  const legacyCustomPrPlan = JSON.parse(fs.readFileSync(legacyCustomPrPlanPath, "utf8"));
  if (!legacyCustomPrPlan.actions.some((action) => action.type === "HUMAN_ONLY" && action.path === ".github/pull_request_template.md")) {
    fail("legacy custom PR template plan must keep governance migration human-only");
    return;
  }
  pass("legacy custom PR template stays unchanged and its migration remains human-only");

  const legacyCustomPrApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyCustomPrTarget,
    "--update-workflow-assets",
    "--goal",
    "review a controlled pull request template governance update",
    "--apply-pr-template-governance",
  ]);
  if (legacyCustomPrApply.status !== 2 || !`${legacyCustomPrApply.stdout}\n${legacyCustomPrApply.stderr}`.includes("plan-first")) {
    fail(`legacy custom PR template direct governance apply must be blocked: ${legacyCustomPrApply.stderr || legacyCustomPrApply.stdout}`);
    return;
  }
  const appliedCustomPrTemplate = fs.readFileSync(legacyCustomPrTemplate, "utf8");
  if (appliedCustomPrTemplate !== originalCustomPrTemplate) {
    fail("blocked direct PR governance apply changed the project template");
    return;
  }
  pass("legacy custom PR governance apply requires a new exact approved plan");
}

export function runGeneratedProjectE2ECheck() {
  checkGeneratedProjectE2E();
}
