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

function checkDecisionExplainTraceProtocol() {
  const required = [
    "core/decision-explain-trace.md",
    "docs/decision-explain-trace.md",
    "docs/plans/decision-explain-trace-1.54-plan.md",
    "examples/1.54-decision-explain-trace/README.md",
    "examples/1.54-decision-explain-trace/closure-decisions/001-contract-approval-rule.md",
    "test-fixtures/bad/bad-closure-decision-missing-explain-trace/closure-decisions/001-bad.md",
    "releases/1.54.0/release-record.md",
    "releases/1.54.0/known-limitations.md",
    "releases/1.54.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.54 decision explain trace asset exists ${file}`);
    else fail(`1.54 decision explain trace asset missing ${file}`);
  }

  const combined = [
    read("core/decision-explain-trace.md"),
    read("docs/decision-explain-trace.md"),
    read("templates/closure-decision.md"),
    read("scripts/resolve-closure-decision.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("releases/1.54.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Decision Explain Trace",
    "Decision Trace",
    "Dominant Reason",
    "Conflict Summary",
    "why the single Unified Closure Decision was selected",
    "does not create a second final closure source",
  ]) {
    if (combined.includes(marker)) pass(`1.54 decision explain trace includes ${marker}`);
    else fail(`1.54 decision explain trace missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure explanation", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("## Decision Trace")
    && resolver.stdout.includes("## Dominant Reason")
    && resolver.stdout.includes("## Conflict Summary")) {
    pass("1.54 closure resolver prints explain trace sections");
  } else {
    fail(`1.54 closure resolver missing explain trace sections: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure explanation", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (Array.isArray(parsed.decisionTrace)
        && parsed.decisionTrace.length >= 3
        && parsed.dominantReason?.whyThisDecides
        && parsed.conflictSummary?.summary) {
        pass("1.54 closure resolver JSON includes explain trace fields");
      } else {
        fail(`1.54 closure resolver JSON missing explain trace fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.54 closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.54 closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-closure-decision.mjs", "examples/1.54-decision-explain-trace", "--historical-audit"]);
  if (example.status === 0 && example.stdout.includes("Unified Closure Decision check passed")) {
    pass("1.54 decision explain trace example passes checker");
  } else {
    fail(`1.54 decision explain trace example failed: ${example.stderr || example.stdout}`);
  }

  const bad = runNode(["scripts/check-closure-decision.mjs", "test-fixtures/bad/bad-closure-decision-missing-explain-trace"]);
  const badOutput = `${bad.stdout}\n${bad.stderr}`;
  if (bad.status !== 0 && badOutput.includes("missing section Decision Trace")) {
    pass("1.54 decision explain trace rejects missing trace");
  } else {
    fail(`1.54 decision explain trace must reject missing trace: ${badOutput}`);
  }
}
function checkLaunchReviewViewProtocol() {
  const required = [
    "core/launch-review-view.md",
    "docs/launch-review-view.md",
    "templates/launch-review-view-card.md",
    "checklists/launch-review-view-review.md",
    "prompts/launch-review-view-agent.md",
    "launch-review-views/.gitkeep",
    "scripts/resolve-launch-review-view.mjs",
    "scripts/check-launch-review-view.mjs",
    "docs/plans/launch-review-view-1.55-plan.md",
    "examples/1.55-launch-review-view/web-internal-handoff/README.md",
    "examples/1.55-launch-review-view/web-internal-handoff/launch-review-views/001-web-mvp.md",
    "test-fixtures/bad/bad-launch-view-missing-closure/launch-review-views/001-bad.md",
    "test-fixtures/bad/bad-launch-view-release-review-missing-rollback/launch-review-views/001-bad.md",
    "test-fixtures/bad/bad-launch-view-claims-production-approval/launch-review-views/001-bad.md",
    "releases/1.55.0/release-record.md",
    "releases/1.55.0/known-limitations.md",
    "releases/1.55.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.55 launch review view asset exists ${file}`);
    else fail(`1.55 launch review view asset missing ${file}`);
  }

  const combined = [
    read("core/launch-review-view.md"),
    read("docs/launch-review-view.md"),
    read("templates/launch-review-view-card.md"),
    read("scripts/resolve-launch-review-view.mjs"),
    read("scripts/check-launch-review-view.mjs"),
    read("docs/plans/launch-review-view-1.55-plan.md"),
    read("releases/1.55.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Launch Review View",
    "Unified Closure Decision",
    "Safe Launch readiness labels",
    "Current-user consent to the concrete external effect",
    "must not override Unified Closure",
    "does not create a second launch decision system",
    "READY_FOR_RELEASE_REVIEW",
    "This view approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.55 launch review view includes ${marker}`);
    else fail(`1.55 launch review view missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-launch-review-view.mjs", ".", "--intent", "prepare release review", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Launch Review View")
    && resolver.stdout.includes("## Unified Closure Input")
    && resolver.stdout.includes("## Safe Launch View")
    && resolver.stdout.includes("This view approves release or production: No")) {
    pass("1.55 launch review resolver prints safe view");
  } else {
    fail(`1.55 launch review resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-launch-review-view.mjs", ".", "--intent", "prepare release review", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "LAUNCH_REVIEW_VIEW"
        && parsed.unifiedClosureInput?.closureDecision
        && parsed.safeLaunchView?.safeLaunchLabel
        && parsed.boundaries?.approvesReleaseOrProduction === "No") {
        pass("1.55 launch review resolver JSON includes closure input, label, and boundary");
      } else {
        fail(`1.55 launch review resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.55 launch review resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.55 launch review resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-launch-review-view.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Launch Review View check passed")) {
    pass("1.55 launch review checker passes source repo");
  } else {
    fail(`1.55 launch review checker failed: ${source.stderr || source.stdout}`);
  }

  const example = runNode(["scripts/check-launch-review-view.mjs", "examples/1.55-launch-review-view/web-internal-handoff"]);
  if (example.status === 0 && example.stdout.includes("Launch Review View check passed")) {
    pass("1.55 launch review example passes checker");
  } else {
    fail(`1.55 launch review example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected, extraArgs = []] of [
    ["missing closure", "test-fixtures/bad/bad-launch-view-missing-closure", "must reference Unified Closure input"],
    ["release review missing rollback", "test-fixtures/bad/bad-launch-view-release-review-missing-rollback", "requires Rollback PASS"],
    ["production approval claim", "test-fixtures/bad/bad-launch-view-claims-production-approval", "forbidden launch review claim"],
  ]) {
    const result = runNode(["scripts/check-launch-review-view.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.55 launch review rejects ${name}`);
    } else {
      fail(`1.55 launch review must reject ${name}: ${output}`);
    }
  }
}
function checkReleaseAdapterProtocol() {
  const required = [
    "core/release-adapter.md",
    "docs/release-adapter.md",
    "templates/release-adapter-profile.md",
    "checklists/release-adapter-review.md",
    "prompts/release-adapter-agent.md",
    "release-adapters/.gitkeep",
    "scripts/resolve-release-adapter.mjs",
    "scripts/check-release-adapter.mjs",
    "docs/plans/guided-release-adapter-1.57-plan.md",
    "examples/1.57-guided-release-adapter/web-vercel-preview/README.md",
    "examples/1.57-guided-release-adapter/web-vercel-preview/release-adapters/001-release-adapter.md",
    "test-fixtures/bad/bad-release-adapter-missing-beginner-card/release-adapters/001-bad.md",
    "test-fixtures/bad/bad-release-adapter-codex-auto-production/release-adapters/001-bad.md",
    "test-fixtures/bad/bad-release-adapter-secret-request/release-adapters/001-bad.md",
    "releases/1.57.0/release-record.md",
    "releases/1.57.0/known-limitations.md",
    "releases/1.57.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.57 release adapter asset exists ${file}`);
    else fail(`1.57 release adapter asset missing ${file}`);
  }

  const combined = [
    read("core/release-adapter.md"),
    read("docs/release-adapter.md"),
    read("templates/release-adapter-profile.md"),
    read("scripts/resolve-release-adapter.mjs"),
    read("scripts/check-release-adapter.mjs"),
    read("docs/plans/guided-release-adapter-1.57-plan.md"),
    read("releases/1.57.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Guided Release Adapter",
    "Beginner Release Card",
    "Project Release Profile",
    "Release Execution Protocol",
    "This adapter approves release: No",
    "This adapter deploys by itself: No",
    "does not ask for or store secrets",
    "does not treat beginner confirmation as production approval",
  ]) {
    if (combined.includes(marker)) pass(`1.57 release adapter includes ${marker}`);
    else fail(`1.57 release adapter missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-adapter.mjs", ".", "--intent", "prepare release adapter"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Adapter Profile")
    && resolver.stdout.includes("## Beginner Release Card")
    && resolver.stdout.includes("This adapter approves release: No")
    && resolver.stdout.includes("This adapter deploys by itself: No")) {
    pass("1.57 release adapter resolver prints safe profile");
  } else {
    fail(`1.57 release adapter resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-adapter.mjs", ".", "--intent", "prepare release adapter", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_ADAPTER_PROFILE"
        && parsed.humanSummary?.adapterState
        && parsed.beginnerReleaseCard?.recommendedChoice
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.deploysByItself === "No") {
        pass("1.57 release adapter resolver JSON includes state, beginner card, and boundaries");
      } else {
        fail(`1.57 release adapter resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.57 release adapter resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.57 release adapter resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-release-adapter.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Adapter check passed")) {
    pass("1.57 release adapter checker passes source repo");
  } else {
    fail(`1.57 release adapter checker failed: ${source.stderr || source.stdout}`);
  }

  const example = runNode(["scripts/check-release-adapter.mjs", "examples/1.57-guided-release-adapter/web-vercel-preview"]);
  if (example.status === 0 && example.stdout.includes("Release Adapter check passed")) {
    pass("1.57 release adapter example passes checker");
  } else {
    fail(`1.57 release adapter example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing beginner card", "test-fixtures/bad/bad-release-adapter-missing-beginner-card", "must include Beginner Release Card"],
    ["codex auto production", "test-fixtures/bad/bad-release-adapter-codex-auto-production", "assigns high-risk release action to Codex"],
    ["secret request", "test-fixtures/bad/bad-release-adapter-secret-request", "contains secret-like content"],
  ]) {
    const result = runNode(["scripts/check-release-adapter.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.57 release adapter rejects ${name}`);
    } else {
      fail(`1.57 release adapter must reject ${name}: ${output}`);
    }
  }
}
function checkReleaseGuideProtocol() {
  const required = [
    "core/release-guide.md",
    "docs/release-guide.md",
    "templates/release-guide-card.md",
    "templates/release-approval-record.md",
    "checklists/release-guide-review.md",
    "prompts/release-guide-agent.md",
    "release-guides/.gitkeep",
    "scripts/resolve-release-guide.mjs",
    "scripts/check-release-guide.mjs",
    "docs/plans/release-path-consolidation-1.58-plan.md",
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "examples/1.58-release-guide-consolidation/web-preview-release-guide/README.md",
    "examples/1.58-release-guide-consolidation/web-preview-release-guide/release-guides/001-release-guide.md",
    "test-fixtures/bad/bad-release-guide-unstructured-approval/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-codex-production/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-remote-local/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-weak-evidence/release-guides/001-bad.md",
    "releases/1.58.0/release-record.md",
    "releases/1.58.0/known-limitations.md",
    "releases/1.58.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.58 release guide asset exists ${file}`);
    else fail(`1.58 release guide asset missing ${file}`);
  }

  const combined = [
    read("core/release-guide.md"),
    read("docs/release-guide.md"),
    read("templates/release-guide-card.md"),
    read("templates/release-approval-record.md"),
    read("scripts/resolve-release-guide.mjs"),
    read("scripts/check-release-guide.mjs"),
    read("docs/plans/release-path-consolidation-1.58-plan.md"),
    read("docs/plans/release-path-consolidation-1.58-1.60-plan.md"),
    read("releases/1.58.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Guide",
    "Structured Approval",
    "Assist Levels",
    "Command Risk Classes",
    "Evidence Quality",
    "This guide approves release: No",
    "This guide deploys or publishes by itself: No",
    "Unknown commands default to NO_RUN",
    "does not call provider APIs",
    "does not request, store, print, or infer secrets",
  ]) {
    if (combined.includes(marker)) pass(`1.58 release guide includes ${marker}`);
    else fail(`1.58 release guide missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Guide Card")
    && resolver.stdout.includes("## Structured Release Approval Gate")
    && resolver.stdout.includes("## Assist Level Classification")
    && resolver.stdout.includes("This guide approves release: No")
    && resolver.stdout.includes("This guide deploys or publishes by itself: No")) {
    pass("1.58 release guide resolver prints safe guide");
  } else {
    fail(`1.58 release guide resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_GUIDE_CARD"
        && parsed.humanSummary?.guideState
        && Array.isArray(parsed.structuredReleaseApprovalGate)
        && parsed.assistLevelClassification?.some((item) => item.level === "PREVIEW_ASSIST")
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.deploysOrPublishesByItself === "No") {
        pass("1.58 release guide resolver JSON includes approval, assist, and boundaries");
      } else {
        fail(`1.58 release guide resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.58 release guide resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.58 release guide resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-release-guide.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Guide check passed")) {
    pass("1.58 release guide checker passes source repo");
  } else {
    fail(`1.58 release guide checker failed: ${source.stderr || source.stdout}`);
  }

  const example = runNode(["scripts/check-release-guide.mjs", "examples/1.58-release-guide-consolidation/web-preview-release-guide"]);
  if (example.status === 0 && example.stdout.includes("Release Guide check passed")) {
    pass("1.58 release guide example passes checker");
  } else {
    fail(`1.58 release guide example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["unstructured approval", "test-fixtures/bad/bad-release-guide-unstructured-approval", "requires structured approval field"],
    ["codex production", "test-fixtures/bad/bad-release-guide-codex-production", "production handoff must be human"],
    ["remote local", "test-fixtures/bad/bad-release-guide-remote-local", "remote side-effect"],
    ["weak evidence", "test-fixtures/bad/bad-release-guide-weak-evidence", "PASS without concrete ref"],
  ]) {
    const result = runNode(["scripts/check-release-guide.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.58 release guide rejects ${name}`);
    } else {
      fail(`1.58 release guide must reject ${name}: ${output}`);
    }
  }
}
function checkPlatformReleaseRecipeProtocol() {
  const required = [
    "core/platform-release-recipes.md",
    "docs/platform-release-recipes.md",
    "templates/platform-release-recipe.md",
    "checklists/platform-release-recipe-review.md",
    "prompts/platform-release-recipe-agent.md",
    "release-recipes/.gitkeep",
    "release-recipes/web-hosted-preview.md",
    "release-recipes/backend-api-handoff.md",
    "release-recipes/mini-program-review-handoff.md",
    "release-recipes/draft-ios-testflight.md",
    "release-recipes/draft-android-internal-testing.md",
    "release-recipes/draft-internal-admin-rollout.md",
    "release-recipes/draft-web-container-release.md",
    "scripts/resolve-platform-release-recipe.mjs",
    "scripts/check-platform-release-recipe.mjs",
    "docs/plans/platform-release-recipes-1.59-plan.md",
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "examples/1.59-platform-release-recipes/web-hosted-preview/README.md",
    "examples/1.59-platform-release-recipes/web-hosted-preview/release-recipes/001-web-hosted-preview.md",
    "examples/1.59-platform-release-recipes/mini-program-review/README.md",
    "examples/1.59-platform-release-recipes/mini-program-review/release-recipes/001-mini-program-review.md",
    "examples/1.59-platform-release-recipes/backend-api-handoff/README.md",
    "examples/1.59-platform-release-recipes/backend-api-handoff/release-recipes/001-backend-api-handoff.md",
    "test-fixtures/bad/bad-release-recipe-codex-production/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-secret-request/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-rollback/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-monitoring/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-owner/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-provider-certainty/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-draft-strict/release-recipes/001-bad.md",
    "releases/1.59.0/release-record.md",
    "releases/1.59.0/known-limitations.md",
    "releases/1.59.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.59 platform release recipe asset exists ${file}`);
    else fail(`1.59 platform release recipe asset missing ${file}`);
  }

  const combined = [
    read("core/platform-release-recipes.md"),
    read("docs/platform-release-recipes.md"),
    read("templates/platform-release-recipe.md"),
    read("scripts/resolve-platform-release-recipe.mjs"),
    read("scripts/check-platform-release-recipe.mjs"),
    read("docs/plans/platform-release-recipes-1.59-plan.md"),
    read("docs/plans/release-path-consolidation-1.58-1.60-plan.md"),
    read("releases/1.59.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Platform Release Recipes",
    "Strict And Draft Recipes",
    "web-hosted-preview",
    "backend-api-handoff",
    "mini-program-review-handoff",
    "DRAFT",
    "does not approve release",
    "does not execute release commands",
    "provider APIs",
    "secrets",
    "draft recipes",
  ]) {
    if (combined.includes(marker)) pass(`1.59 platform release recipe includes ${marker}`);
    else fail(`1.59 platform release recipe missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-platform-release-recipe.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Platform Release Recipe Selection")
    && resolver.stdout.includes("## Beginner Recipe Card")
    && resolver.stdout.includes("This recipe approves release: No")
    && resolver.stdout.includes("This recipe deploys or publishes by itself: No")) {
    pass("1.59 platform release recipe resolver prints safe selection");
  } else {
    fail(`1.59 platform release recipe resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-platform-release-recipe.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "PLATFORM_RELEASE_RECIPE_SELECTION"
        && parsed.humanSummary?.selectedRecipeId
        && parsed.boundaries?.approvesRelease === "No"
        && Array.isArray(parsed.codexAllowedActions)) {
        pass("1.59 platform release recipe resolver JSON includes recipe, boundaries, and allowed actions");
      } else {
        fail(`1.59 platform release recipe resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.59 platform release recipe resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.59 platform release recipe resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-platform-release-recipe.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Platform Release Recipe check passed")) {
    pass("1.59 platform release recipe checker passes source repo");
  } else {
    fail(`1.59 platform release recipe checker failed: ${source.stderr || source.stdout}`);
  }

  for (const target of [
    "examples/1.59-platform-release-recipes/web-hosted-preview",
    "examples/1.59-platform-release-recipes/mini-program-review",
    "examples/1.59-platform-release-recipes/backend-api-handoff",
  ]) {
    const result = runNode(["scripts/check-platform-release-recipe.mjs", target, "--strict"]);
    if (result.status === 0 && result.stdout.includes("Platform Release Recipe check passed")) {
      pass(`1.59 platform release recipe example passes ${target}`);
    } else {
      fail(`1.59 platform release recipe example failed ${target}: ${result.stderr || result.stdout}`);
    }
  }

  const guideJson = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch", "--json"]);
  if (guideJson.status === 0) {
    try {
      const parsed = JSON.parse(guideJson.stdout);
      if (Array.isArray(parsed.platformReleaseRecipe)
        && parsed.releaseGuideRouting?.some((item) => item.stage === "Platform Release Recipe")) {
        pass("1.59 release guide consumes platform release recipe selection");
      } else {
        fail(`1.59 release guide missing platform release recipe bridge: ${guideJson.stdout}`);
      }
    } catch (error) {
      fail(`1.59 release guide platform recipe JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.59 release guide platform recipe bridge failed: ${guideJson.stderr || guideJson.stdout}`);
  }

  for (const [name, target, expected, mode] of [
    ["codex production", "test-fixtures/bad/bad-release-recipe-codex-production", "Codex Allowed Actions", ""],
    ["secret request", "test-fixtures/bad/bad-release-recipe-secret-request", "secret", ""],
    ["missing rollback", "test-fixtures/bad/bad-release-recipe-missing-rollback", "Rollback Requirements", ""],
    ["missing monitoring", "test-fixtures/bad/bad-release-recipe-missing-monitoring", "Monitoring Requirements", ""],
    ["missing owner", "test-fixtures/bad/bad-release-recipe-missing-owner", "Release Owner", ""],
    ["provider certainty", "test-fixtures/bad/bad-release-recipe-provider-certainty", "provider assumptions", ""],
    ["draft strict", "test-fixtures/bad/bad-release-recipe-draft-strict", "cannot pass --strict", "--strict"],
  ]) {
    const command = ["scripts/check-platform-release-recipe.mjs", target];
    if (mode) command.push(mode);
    const result = runNode(command);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.59 platform release recipe rejects ${name}`);
    } else {
      fail(`1.59 platform release recipe must reject ${name}: ${output}`);
    }
  }
}
function checkReleaseHandoffPackProtocol() {
  const required = [
    "core/release-handoff-packs.md",
    "docs/release-handoff-packs.md",
    "templates/release-handoff-pack.md",
    "checklists/release-handoff-pack-review.md",
    "prompts/release-handoff-pack-agent.md",
    "release-handoff-packs/.gitkeep",
    "scripts/resolve-release-handoff-pack.mjs",
    "scripts/check-release-handoff-pack.mjs",
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "docs/plans/release-path-hardening-1.61-plan.md",
    "core/release-path-hardening.md",
    "docs/release-path-hardening.md",
    "schemas/artifacts/release-handoff-evidence.schema.json",
    "examples/1.60-release-handoff-packs/web-hosted-preview/README.md",
    "examples/1.60-release-handoff-packs/web-hosted-preview/release-handoff-packs/001-web-hosted-preview.md",
    "examples/1.60-release-handoff-packs/mini-program-review/README.md",
    "examples/1.60-release-handoff-packs/mini-program-review/release-handoff-packs/001-mini-program-review.md",
    "examples/1.60-release-handoff-packs/backend-api-release/README.md",
    "examples/1.60-release-handoff-packs/backend-api-release/release-handoff-packs/001-backend-api-release.md",
    "test-fixtures/bad/bad-release-handoff-codex-production/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-approval/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-owner/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-rollback/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-monitoring/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-secret-request/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-remote-state/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-store-assigned-to-codex/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-migration-assigned-to-codex/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-structured-evidence/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-execution-redefines-evidence/release-handoff-packs/001-bad.md",
    "releases/1.60.0/release-record.md",
    "releases/1.60.0/known-limitations.md",
    "releases/1.60.0/self-check-report.md",
    "releases/1.61.0/release-record.md",
    "releases/1.61.0/known-limitations.md",
    "releases/1.61.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.61 release path hardening asset exists ${file}`);
    else fail(`1.61 release path hardening asset missing ${file}`);
  }

  const combined = [
    read("core/release-path-hardening.md"),
    read("core/release-handoff-packs.md"),
    read("docs/release-path-hardening.md"),
    read("docs/release-handoff-packs.md"),
    read("templates/release-handoff-pack.md"),
    read("schemas/artifacts/release-handoff-evidence.schema.json"),
    read("scripts/resolve-release-handoff-pack.mjs"),
    read("scripts/check-release-handoff-pack.mjs"),
    read("scripts/resolve-release-guide.mjs"),
    read("docs/plans/release-path-hardening-1.61-plan.md"),
    read("releases/1.61.0/release-record.md"),
    read("releases/1.60.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Handoff Packs",
    "Release Path Hardening",
    "bounded runbooks",
    "Codex May Run",
    "does not approve release",
    "does not execute release commands",
    "structured approval",
    "Machine-Readable Evidence",
    "release_handoff_evidence",
    "--require-structured-evidence",
    "DEFERRED_UNTIL_RELEASE_GUIDE_READY",
    "Ready for handoff review, not release approval",
    "handoff_is_execution_input",
    "execution_redefines_owner_evidence",
    "external-system",
  ]) {
    if (combined.includes(marker)) pass(`1.61 release path hardening includes ${marker}`);
    else fail(`1.61 release path hardening missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-handoff-pack.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Handoff Pack")
    && resolver.stdout.includes("## Codex May Run")
    && resolver.stdout.includes("## Machine-Readable Evidence")
    && resolver.stdout.includes("release_handoff_evidence")
    && resolver.stdout.includes("This pack approves release: No")
    && resolver.stdout.includes("This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No")) {
    pass("1.61 release handoff pack resolver prints safe structured handoff");
  } else {
    fail(`1.61 release handoff pack resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-handoff-pack.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_HANDOFF_PACK"
        && parsed.humanSummary?.packId
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.machineReadableEvidence?.artifact_type === "release_handoff_evidence"
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.handoff_is_execution_input === true
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.execution_redefines_owner_evidence === false
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.approves_release === false
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.executes_release_commands === false
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.codex_release_owner === false
        && Array.isArray(parsed.codexMayRun)
        && Array.isArray(parsed.humanMustRun)
        && Array.isArray(parsed.externalSystemMustRun)) {
        pass("1.61 release handoff pack resolver JSON includes structured evidence and boundaries");
      } else {
        fail(`1.61 release handoff pack resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.61 release handoff pack resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.61 release handoff pack resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const readyResolver = runNode([
    "scripts/resolve-release-handoff-pack.mjs",
    ".",
    "--intent",
    "help me launch",
    "--release-target",
    "web-hosted-preview",
    "--recipe-id",
    "web-hosted-preview",
    "--approval-type",
    "RELEASE_APPROVAL",
    "--approval-status",
    "APPROVED",
    "--approval-scope",
    "web-hosted-preview handoff review",
    "--approval-time",
    "2026-07-03T00:00:00Z",
    "--allowed-codex-actions",
    "LOCAL_READ_ONLY",
    "--blocked-actions",
    "PRODUCTION_DEPLOY,SECRET_ACCESS,REMOTE_STATE_MUTATION",
    "--approval-expiry",
    "2026-07-10",
    "--release-owner",
    "human:release-owner",
    "--evidence-path",
    "approval-records/demo-release-approval.md",
    "--release-sop",
    "docs/release-sop.md owned by human:release-owner",
    "--rollback",
    "docs/release-rollback.md owned by human:release-owner restore when smoke fails",
    "--monitoring",
    "docs/monitoring.md owned by human:release-owner smoke dashboard",
    "--environment",
    "docs/environment.md",
    "--post-launch-smoke",
    "docs/post-release-smoke.md owned by human:release-owner read-only smoke check",
  ]);
  if (readyResolver.status === 0
    && readyResolver.stdout.includes("READY_FOR_HANDOFF_REVIEW")
    && readyResolver.stdout.includes("Ready for handoff review, not release approval")) {
    pass("1.61 release handoff ready wording is handoff review only");
  } else {
    fail(`1.61 release handoff ready wording failed: ${readyResolver.stderr || readyResolver.stdout}`);
  }

  const source = runNode(["scripts/check-release-handoff-pack.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Handoff Pack check passed")) {
    pass("1.61 release handoff pack checker passes source repo");
  } else {
    fail(`1.61 release handoff pack checker failed: ${source.stderr || source.stdout}`);
  }

  const guideJson = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch", "--json"]);
  if (guideJson.status === 0) {
    try {
      const parsed = JSON.parse(guideJson.stdout);
      const handoffRoute = parsed.releaseGuideRouting?.find((row) => row.stage === "Release Handoff Pack");
      const handoffStatus = parsed.releaseHandoffPack?.find?.((row) => row.field === "Status")?.value || "";
      const handoffState = parsed.releaseHandoffPack?.find?.((row) => row.field === "Handoff State")?.value || "";
      const handoffDeferred = handoffStatus.includes("DEFERRED")
        && handoffState.includes("DEFERRED_UNTIL_RELEASE_GUIDE_READY")
        && handoffRoute?.status === "DEFERRED";
      if (handoffDeferred) {
        pass("1.61 release guide defers handoff pack until route prerequisites are ready");
      } else {
        fail(`1.61 release guide missing deferred handoff bridge: ${guideJson.stdout}`);
      }
    } catch (error) {
      fail(`1.61 release guide handoff JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.61 release guide handoff bridge failed: ${guideJson.stderr || guideJson.stdout}`);
  }

  for (const target of [
    "examples/1.60-release-handoff-packs/web-hosted-preview",
    "examples/1.60-release-handoff-packs/mini-program-review",
    "examples/1.60-release-handoff-packs/backend-api-release",
  ]) {
    const result = runNode(["scripts/check-release-handoff-pack.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0 && result.stdout.includes("Release Handoff Pack check passed")) {
      pass(`1.61 release handoff pack strict example passes: ${target}`);
    } else {
      fail(`1.61 release handoff pack strict example failed ${target}: ${result.stderr || result.stdout}`);
    }
  }

  for (const [name, target, expected, extraArgs = []] of [
    ["codex production", "test-fixtures/bad/bad-release-handoff-codex-production", "Codex May Run"],
    ["missing approval", "test-fixtures/bad/bad-release-handoff-missing-approval", "Approval Type"],
    ["missing owner", "test-fixtures/bad/bad-release-handoff-missing-owner", "Release Owner"],
    ["missing rollback", "test-fixtures/bad/bad-release-handoff-missing-rollback", "Rollback Evidence"],
    ["missing monitoring", "test-fixtures/bad/bad-release-handoff-missing-monitoring", "Monitoring Evidence"],
    ["secret request", "test-fixtures/bad/bad-release-handoff-secret-request", "secret"],
    ["remote state", "test-fixtures/bad/bad-release-handoff-remote-state", "Codex May Run"],
    ["store assigned to Codex", "test-fixtures/bad/bad-release-handoff-store-assigned-to-codex", "Codex May Run"],
    ["migration assigned to Codex", "test-fixtures/bad/bad-release-handoff-migration-assigned-to-codex", "Codex May Run"],
    ["missing structured evidence", "test-fixtures/bad/bad-release-handoff-missing-structured-evidence", "Machine-Readable Evidence is required", ["--require-structured-evidence"]],
    ["execution redefines evidence", "test-fixtures/bad/bad-release-handoff-execution-redefines-evidence", "execution_redefines_owner_evidence", ["--require-structured-evidence"]],
  ]) {
    const result = runNode(["scripts/check-release-handoff-pack.mjs", target, ...extraArgs]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.61 release handoff pack rejects ${name}`);
    } else {
      fail(`1.61 release handoff pack must reject ${name}: ${output}`);
    }
  }
}
function checkReleaseExecutionProtocol() {
  const required = [
    "core/release-execution-protocol.md",
    "docs/release-execution-protocol.md",
    "templates/release-execution-plan.md",
    "checklists/release-execution-review.md",
    "prompts/release-execution-agent.md",
    "release-execution-plans/.gitkeep",
    "scripts/resolve-release-execution.mjs",
    "scripts/check-release-execution.mjs",
    "docs/plans/release-execution-protocol-1.56-plan.md",
    "examples/1.56-release-execution/web-assisted-handoff/README.md",
    "examples/1.56-release-execution/web-assisted-handoff/release-execution-plans/001-web-release.md",
    "test-fixtures/bad/bad-release-execution-missing-launch-view/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-assisted-without-approval/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-auto-production-deploy/release-execution-plans/001-bad.md",
    "releases/1.56.0/release-record.md",
    "releases/1.56.0/known-limitations.md",
    "releases/1.56.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.56 release execution asset exists ${file}`);
    else fail(`1.56 release execution asset missing ${file}`);
  }

  const combined = [
    read("core/release-execution-protocol.md"),
    read("docs/release-execution-protocol.md"),
    read("templates/release-execution-plan.md"),
    read("scripts/resolve-release-execution.mjs"),
    read("scripts/check-release-execution.mjs"),
    read("docs/plans/release-execution-protocol-1.56-plan.md"),
    read("releases/1.56.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Execution Protocol",
    "Launch Review View",
    "current user consented to the exact external effect",
    "ASSISTED_EXECUTION",
    "does not mean technical readiness automatically publishes or deploys",
    "This plan approves release: No",
    "This plan executes release by itself: No",
    "does not make Codex the release owner",
  ]) {
    if (combined.includes(marker)) pass(`1.56 release execution includes ${marker}`);
    else fail(`1.56 release execution missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-execution.mjs", ".", "--intent", "prepare release execution"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Execution Plan")
    && resolver.stdout.includes("## Execution Mode")
    && resolver.stdout.includes("This plan approves release: No")
    && resolver.stdout.includes("This plan executes release by itself: No")) {
    pass("1.56 release execution resolver prints safe plan");
  } else {
    fail(`1.56 release execution resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-execution.mjs", ".", "--intent", "prepare release execution", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_EXECUTION_PLAN"
        && parsed.executionMode?.mode
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.executesReleaseByItself === "No") {
        pass("1.56 release execution resolver JSON includes mode and boundaries");
      } else {
        fail(`1.56 release execution resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.56 release execution resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.56 release execution resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-release-execution.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Execution check passed")) {
    pass("1.56 release execution checker passes source repo");
  } else {
    fail(`1.56 release execution checker failed: ${source.stderr || source.stdout}`);
  }

  const example = runNode(["scripts/check-release-execution.mjs", "examples/1.56-release-execution/web-assisted-handoff"]);
  if (example.status !== 0 && `${example.stdout}\n${example.stderr}`.includes("real release execution requires structured release trust evidence")) {
    pass("1.56 legacy text-only real execution example remains readable but cannot authorize execution");
  } else {
    fail(`1.56 legacy text-only real execution example must fail closed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing launch view", "test-fixtures/bad/bad-release-execution-missing-launch-view", "must reference Launch Review input"],
    ["assisted without approval", "test-fixtures/bad/bad-release-execution-assisted-without-approval", "requires scoped structured release consent"],
    ["auto production deploy", "test-fixtures/bad/bad-release-execution-auto-production-deploy", "assigns high-risk release step to Codex"],
  ]) {
    const result = runNode(["scripts/check-release-execution.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.56 release execution rejects ${name}`);
    } else {
      fail(`1.56 release execution must reject ${name}: ${output}`);
    }
  }
}
function checkReleasePlanProtocol() {
  const required = [
    "core/release-core-model.md",
    "docs/release-core-model.md",
    "templates/release-plan.md",
    "schemas/artifacts/release-plan.schema.json",
    "checklists/release-plan-review.md",
    "prompts/release-plan-agent.md",
    "release-plans/.gitkeep",
    "scripts/resolve-release-plan.mjs",
    "scripts/check-release-plan.mjs",
    "docs/plans/release-core-model-consolidation-1.67-plan.md",
    "examples/1.67-release-core-model/README.md",
    "examples/1.67-release-core-model/web-preview/README.md",
    "examples/1.67-release-core-model/web-preview/release-plans/001-web-preview.md",
    "examples/1.67-release-core-model/mini-program-review/README.md",
    "examples/1.67-release-core-model/mini-program-review/release-plans/001-mini-program-review.md",
    "examples/1.67-release-core-model/backend-api-handoff/README.md",
    "examples/1.67-release-core-model/backend-api-handoff/release-plans/001-backend-api-handoff.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/README.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/AGENTS.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/docs/WEB_ENGINEERING_BASELINE.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/docs/WEB_ENVIRONMENT_BASELINE.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/release-plans/001-governed-existing-project.md",
    "test-fixtures/bad/bad-release-plan-approves-production/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-codex-owner/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-secret-request/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-provider-exec/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-skips-native-migration/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-missing-trace/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-replaces-lower-level-system/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-asset-migration-maximize-governed-project/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-trace-controls-execution/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-state-drives-execution/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-operating-mode-writes-files/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-ignores-existing-rules/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-extra-dangerous-field/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-chinese-forbidden-claim/release-plans/001-bad.md",
    "releases/1.67.0/release-record.md",
    "releases/1.67.0/known-limitations.md",
    "releases/1.67.0/self-check-report.md",
    "releases/1.67.1/release-record.md",
    "releases/1.67.1/known-limitations.md",
    "releases/1.67.1/self-check-report.md",
    "releases/1.67.2/release-record.md",
    "releases/1.67.2/known-limitations.md",
    "releases/1.67.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.67 release plan asset exists ${file}`);
    else fail(`1.67 release plan asset missing ${file}`);
  }

  const combined = [
    read("core/release-core-model.md"),
    read("docs/release-core-model.md"),
    read("templates/release-plan.md"),
    read("schemas/artifacts/release-plan.schema.json"),
    read("scripts/resolve-release-plan.mjs"),
    read("scripts/check-release-plan.mjs"),
    read("docs/plans/release-core-model-consolidation-1.67-plan.md"),
    read("releases/1.67.0/release-record.md"),
    read("releases/1.67.1/release-record.md"),
    read("releases/1.67.2/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Core Model",
    "Release Plan",
    "pure view model",
    "Source Systems Stay Authoritative",
    "IntentOS Operating Mode",
    "Project Asset Migration Depth",
    "Existing Rule Comparison Contract",
    "This plan approves release: No",
    "This plan treats IntentOS Operating Mode as write permission: No",
    "trace_controls_execution",
    "summary_state_drives_execution",
    "release_plan_evidence",
    "release_plan_digest",
    "additionalProperties",
  ]) {
    if (combined.includes(marker)) pass(`1.67 release plan includes ${marker}`);
    else fail(`1.67 release plan missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-plan.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Plan")
    && resolver.stdout.includes("## Release Plan Trace")
    && resolver.stdout.includes("## Existing Project Rule Comparison")
    && resolver.stdout.includes("This plan approves release: No")
    && resolver.stdout.includes("This plan treats IntentOS Operating Mode as write permission: No")) {
    pass("1.67 release plan resolver prints pure-view release plan");
  } else {
    fail(`1.67 release plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-plan.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_PLAN"
        && parsed.humanSummary?.summaryStateKind === "SUMMARY_ONLY"
        && parsed.humanSummary?.intentosOperatingMode === "ACTIVE"
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.treatsIntentosOperatingModeAsWritePermission === "No"
        && parsed.releasePlanTrace?.every((item) => item.controlAuthority === "No")
        && parsed.existingProjectRuleComparison?.length > 0) {
        pass("1.67 release plan resolver JSON includes pure view, trace, and rule comparison");
      } else {
        fail(`1.67 release plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.67 release plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.67 release plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-release-plan.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Plan check passed")) {
    pass("1.67 release plan checker passes source repo");
  } else {
    fail(`1.67 release plan checker failed: ${source.stderr || source.stdout}`);
  }

  for (const target of [
    "examples/1.67-release-core-model/web-preview",
    "examples/1.67-release-core-model/mini-program-review",
    "examples/1.67-release-core-model/backend-api-handoff",
    "examples/1.67-release-core-model/governed-existing-project-readonly",
  ]) {
    const example = runNode(["scripts/check-release-plan.mjs", target, "--require-structured-evidence"]);
    if (example.status === 0 && example.stdout.includes("Release Plan check passed")) {
      pass(`1.67 release plan example passes checker ${target}`);
    } else {
      fail(`1.67 release plan example failed ${target}: ${example.stderr || example.stdout}`);
    }
  }

  for (const [name, target, expected] of [
    ["approves production", "test-fixtures/bad/bad-release-plan-approves-production", "forbidden release plan claim"],
    ["codex owner", "test-fixtures/bad/bad-release-plan-codex-owner", "forbidden release plan claim"],
    ["secret request", "test-fixtures/bad/bad-release-plan-secret-request", "forbidden release plan claim"],
    ["provider execution", "test-fixtures/bad/bad-release-plan-provider-exec", "forbidden release plan claim"],
    ["skips native migration", "test-fixtures/bad/bad-release-plan-skips-native-migration", "forbidden release plan claim"],
    ["missing trace", "test-fixtures/bad/bad-release-plan-missing-trace", "at least three trace rows"],
    ["replaces lower-level system", "test-fixtures/bad/bad-release-plan-replaces-lower-level-system", "forbidden release plan claim"],
    ["asset migration maximize", "test-fixtures/bad/bad-release-plan-asset-migration-maximize-governed-project", "must not maximize"],
    ["trace controls execution", "test-fixtures/bad/bad-release-plan-trace-controls-execution", "forbidden release plan claim"],
    ["state drives execution", "test-fixtures/bad/bad-release-plan-state-drives-execution", "forbidden release plan claim"],
    ["operating mode writes files", "test-fixtures/bad/bad-release-plan-operating-mode-writes-files", "forbidden release plan claim"],
    ["ignores existing rules", "test-fixtures/bad/bad-release-plan-ignores-existing-rules", "forbidden release plan claim"],
    ["extra dangerous field", "test-fixtures/bad/bad-release-plan-extra-dangerous-field", "is not allowed"],
    ["Chinese forbidden claim", "test-fixtures/bad/bad-release-plan-chinese-forbidden-claim", "forbidden release plan claim"],
  ]) {
    const result = runNode(["scripts/check-release-plan.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.67 release plan rejects ${name}`);
    } else {
      fail(`1.67 release plan must reject ${name}: ${output}`);
    }
  }
}
function checkGuidedClosureExperienceProtocol() {
  const required = [
    "core/guided-closure-experience.md",
    "docs/guided-closure-experience.md",
    "templates/guided-closure-card.md",
    "checklists/guided-closure-review.md",
    "prompts/guided-closure-agent.md",
    "guided-closure-cards/.gitkeep",
    "scripts/resolve-guided-closure.mjs",
    "scripts/check-guided-closure.mjs",
    "examples/1.52-guided-closure-experience/README.md",
    "examples/1.52-guided-closure-experience/guided-closure-cards/001-booking-validation.md",
    "test-fixtures/bad/bad-guided-closure-technical-burden/guided-closure-cards/001-bad.md",
    "test-fixtures/bad/bad-guided-closure-overclaim/guided-closure-cards/001-bad.md",
    "releases/1.52.0/release-record.md",
    "releases/1.52.0/known-limitations.md",
    "releases/1.52.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.52 guided closure asset exists ${file}`);
    else fail(`1.52 guided closure asset missing ${file}`);
  }

  const combined = [
    read("core/guided-closure-experience.md"),
    read("docs/guided-closure-experience.md"),
    read("templates/guided-closure-card.md"),
    read("scripts/resolve-guided-closure.mjs"),
    read("scripts/check-guided-closure.mjs"),
    read("releases/1.52.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Guided Closure Experience",
    "Guided Closure Card",
    "Users should not need to choose",
    "NO_TASK_TO_CLOSE",
    "NEEDS_IMPACT_COVERAGE",
    "READY_FOR_REVIEW",
    "This card writes target files: No",
    "This card approves commit or push: No",
    "This card approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.52 guided closure includes ${marker}`);
    else fail(`1.52 guided closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-guided-closure.mjs", ".", "--intent", "maintain IntentOS close-out experience", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Guided Closure Card")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.52 guided closure resolver prints safe card");
  } else {
    fail(`1.52 guided closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-guided-closure.mjs", ".", "--intent", "maintain IntentOS close-out experience", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "GUIDED_CLOSURE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.plainCloseOutStatus?.closureState
        && Array.isArray(parsed.whatIChecked)) {
        pass("1.52 guided closure resolver JSON includes state, checks, and boundaries");
      } else {
        fail(`1.52 guided closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.52 guided closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.52 guided closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-guided-closure.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Guided Closure check passed")) {
    pass("1.52 guided closure checker passes source repo");
  } else {
    fail(`1.52 guided closure checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-guided-closure.mjs", "examples/1.52-guided-closure-experience"]);
  if (example.status === 0 && example.stdout.includes("Guided Closure check passed")) {
    pass("1.52 guided closure example passes checker");
  } else {
    fail(`1.52 guided closure example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["technical burden", ["scripts/check-guided-closure.mjs", "test-fixtures/bad/bad-guided-closure-technical-burden"], "internal close-out command burden"],
    ["overclaim", ["scripts/check-guided-closure.mjs", "test-fixtures/bad/bad-guided-closure-overclaim"], "forbidden guided closure claim"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.52 guided closure rejects ${name}`);
    } else {
      fail(`1.52 guided closure must reject ${name}: ${output}`);
    }
  }
}
function checkExecutionReviewClosureProtocol() {
  const required = [
    "core/execution-review-closure.md",
    "docs/execution-review-closure.md",
    "templates/execution-closure-report.md",
    "checklists/execution-review-closure-review.md",
    "prompts/execution-closure-agent.md",
    "execution-closures/.gitkeep",
    "scripts/resolve-execution-closure.mjs",
    "scripts/check-execution-closure.mjs",
    "docs/plans/evidence-linked-closure-1.33-plan.md",
    "docs/plans/closeout-evidence-precision-1.51-plan.md",
    "examples/1.32-execution-review-closure/README.md",
    "examples/1.32-execution-review-closure/execution-closures/001-booking-validation-closure.md",
    "examples/1.33-evidence-linked-closure/README.md",
    "examples/1.33-evidence-linked-closure/execution-closures/001-booking.md",
    "examples/1.33-evidence-linked-closure/review-surface-cards/001-booking.md",
    "examples/1.33-evidence-linked-closure/review-loop-reports/001-booking.md",
    "examples/1.33-evidence-linked-closure/change-boundary-reports/001-booking.md",
    "examples/1.33-evidence-linked-closure/reports/verify-output.txt",
    "examples/1.33-evidence-linked-closure/debt-handoff-reports/001-booking.md",
    "examples/1.33-evidence-linked-closure/delivery-path-reports/001-booking.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/execution-closures/001-contract-input-rule.md",
    "test-fixtures/bad/bad-execution-closure-approves-implementation/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-missing-verification/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-changed-files-pass/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-ready-without-evidence/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-missing-impact-coverage/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/change-impact-coverage-reports/001-contract-input-rule.md",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/api-contract-title-validation.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/backend-contract-validation.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/docs-contract-input-rule.md",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/error-copy-title-required.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/frontend-contract-form-validation.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/test-contract-input-rule.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/user-flow-contract-title-required.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/execution-closures/001-contract-input-rule.md",
    "releases/1.32.0/release-record.md",
    "releases/1.32.0/known-limitations.md",
    "releases/1.32.0/self-check-report.md",
    "releases/1.33.0/release-record.md",
    "releases/1.33.0/known-limitations.md",
    "releases/1.33.0/self-check-report.md",
    "releases/1.50.0/release-record.md",
    "releases/1.50.0/known-limitations.md",
    "releases/1.50.0/self-check-report.md",
    "releases/1.51.0/release-record.md",
    "releases/1.51.0/known-limitations.md",
    "releases/1.51.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.32 execution closure asset exists ${file}`);
    else fail(`1.32 execution closure asset missing ${file}`);
  }

  const combined = [
    read("core/execution-review-closure.md"),
    read("docs/execution-review-closure.md"),
    read("templates/execution-closure-report.md"),
    read("scripts/resolve-execution-closure.mjs"),
    read("scripts/check-execution-closure.mjs"),
    read("docs/plans/closeout-evidence-precision-1.51-plan.md"),
    read("releases/1.32.0/release-record.md"),
    read("releases/1.33.0/release-record.md"),
    read("releases/1.50.0/release-record.md"),
    read("releases/1.51.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Execution Review Closure",
    "Execution Closure Report",
    "READY_FOR_COMMIT_REVIEW",
    "Verification Closure",
    "Commit Readiness",
    "Evidence Links",
    "changed files are not proof",
    "--review-surface-ref",
    "--verification-file",
    "require-impact-coverage",
    "require-precise-evidence",
    "Change Impact Coverage Report",
    "This closure approves implementation: No",
    "This closure authorizes commit or push: No",
    "This closure replaces Safe Launch: No",
  ]) {
    if (combined.includes(marker)) pass(`1.32 execution closure includes ${marker}`);
    else fail(`1.32 execution closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish IntentOS closure", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Execution Closure Report")
    && resolver.stdout.includes("Commit Readiness")
    && resolver.stdout.includes("This closure authorizes commit or push: No")) {
    pass("1.32 execution closure resolver prints safe report");
  } else {
    fail(`1.32 execution closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish IntentOS closure", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXECUTION_REVIEW_CLOSURE"
        && parsed.boundaries?.authorizesCommitOrPush === "No"
        && parsed.commitReadiness?.closureState
        && Array.isArray(parsed.reviewSurfaceClosure)) {
        pass("1.32 execution closure resolver JSON includes closure state, surfaces, and boundary");
      } else {
        fail(`1.32 execution closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.32 execution closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.32 execution closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-execution-closure.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Execution Review Closure check passed")) {
    pass("1.32 execution closure checker passes source repo");
  } else {
    fail(`1.32 execution closure checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-execution-closure.mjs", "examples/1.32-execution-review-closure"]);
  if (example.status === 0 && example.stdout.includes("Execution Review Closure check passed")) {
    pass("1.32 execution closure example passes checker");
  } else {
    fail(`1.32 execution closure example failed: ${example.stderr || example.stdout}`);
  }

  const evidenceExample = runNode(["scripts/check-execution-closure.mjs", "examples/1.33-evidence-linked-closure"]);
  if (evidenceExample.status === 0 && evidenceExample.stdout.includes("Execution Review Closure check passed")) {
    pass("1.33 evidence-linked closure example passes checker");
  } else {
    fail(`1.33 evidence-linked closure example failed: ${evidenceExample.stderr || evidenceExample.stdout}`);
  }

  const impactCoverageExample = runNode(["scripts/check-execution-closure.mjs", "examples/1.49-structured-impact-coverage/contract-input-rule", "--require-impact-coverage", "--require-precise-evidence"]);
  if (impactCoverageExample.status === 0
    && impactCoverageExample.stdout.includes("linked Change Impact Coverage Report passes strict closure evidence checks")
    && impactCoverageExample.stdout.includes("precise linked report matches current closure task or intent")
    && impactCoverageExample.stdout.includes("Execution Review Closure check passed")) {
    pass("1.51 execution closure example requires linked precise impact coverage");
  } else {
    fail(`1.50 execution closure impact coverage example failed: ${impactCoverageExample.stderr || impactCoverageExample.stdout}`);
  }

  const evidenceResolver = runNode([
    "scripts/resolve-execution-closure.mjs",
    "examples/1.33-evidence-linked-closure",
    "--intent",
    "finish booking validation",
    "--review-surface-ref",
    "review-surface-cards/001-booking.md",
    "--review-loop-ref",
    "review-loop-reports/001-booking.md",
    "--change-boundary-ref",
    "change-boundary-reports/001-booking.md",
    "--verification-file",
    "reports/verify-output.txt",
    "--debt-handoff-ref",
    "debt-handoff-reports/001-booking.md",
    "--delivery-path-ref",
    "delivery-path-reports/001-booking.md",
    "--json",
  ]);
  if (evidenceResolver.status === 0) {
    try {
      const parsed = JSON.parse(evidenceResolver.stdout);
      if (parsed.commitReadiness?.closureState === "READY_FOR_COMMIT_REVIEW"
        && Array.isArray(parsed.evidenceLinks)
        && parsed.evidenceLinks.some((item) => item.type === "Review Loop / Reviewer Evidence" && item.status === "found")
        && parsed.reviewSurfaceClosure?.some((item) => item.surface === "CODE_REVIEW" && item.result === "pass" && /review-loop evidence/.test(item.evidence))) {
        pass("1.33 evidence-linked resolver reaches ready state with linked evidence");
      } else {
        fail(`1.33 evidence-linked resolver JSON missing expected evidence-linked readiness: ${evidenceResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.33 evidence-linked resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.33 evidence-linked resolver failed: ${evidenceResolver.stderr || evidenceResolver.stdout}`);
  }

  for (const [name, args, expected] of [
    ["approval overclaim", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-approves-implementation"], "forbidden execution closure claim"],
    ["missing verification", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-missing-verification"], "requires passing verification commands"],
    ["changed files pass", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-changed-files-pass"], "changed files as the only evidence"],
    ["ready without evidence", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-ready-without-evidence"], "requires Review Surface Card found"],
    ["missing impact coverage", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-missing-impact-coverage", "--require-impact-coverage"], "requires Change Impact Coverage Report found"],
    ["stale impact report", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-stale-impact-report", "--require-impact-coverage", "--require-precise-evidence"], "precise linked report must match current closure task or intent"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.32 execution closure rejects ${name}`);
    } else {
      fail(`1.32 execution closure must reject ${name}: ${output}`);
    }
  }
}
function checkOrdinaryUserProductLoopProtocol() {
  const required = [
    "docs/roadmaps/ordinary-user-product-loop-1.42-1.45.md",
    "docs/plans/ordinary-user-product-loop-hardening-1.46-plan.md",
    "docs/plans/evidence-reliability-risk-calibration-1.47-plan.md",
    "baseline-calibration-reports/risk-surface-false-positives.md",
    "core/ordinary-user-first-slice.md",
    "docs/ordinary-user-first-slice.md",
    "templates/ordinary-user-first-slice-card.md",
    "checklists/ordinary-user-first-slice-review.md",
    "prompts/ordinary-user-first-slice-agent.md",
    "ordinary-first-slices/.gitkeep",
    "scripts/resolve-first-slice.mjs",
    "scripts/check-first-slice.mjs",
    "core/product-completeness-gate.md",
    "docs/product-completeness-gate.md",
    "templates/product-completeness-report.md",
    "checklists/product-completeness-gate-review.md",
    "prompts/product-completeness-agent.md",
    "product-completeness-reports/.gitkeep",
    "scripts/resolve-product-completeness.mjs",
    "scripts/check-product-completeness.mjs",
    "core/real-mvp-example-evidence.md",
    "docs/real-mvp-example-evidence.md",
    "templates/real-mvp-example-record.md",
    "checklists/real-mvp-example-review.md",
    "prompts/real-mvp-example-agent.md",
    "mvp-example-reports/.gitkeep",
    "scripts/check-mvp-example.mjs",
    "core/low-risk-controlled-apply-candidate.md",
    "docs/low-risk-controlled-apply-candidate.md",
    "templates/low-risk-controlled-apply-candidate.md",
    "checklists/low-risk-controlled-apply-candidate-review.md",
    "prompts/low-risk-controlled-apply-candidate-agent.md",
    "controlled-apply-candidates/.gitkeep",
    "schemas/artifacts/product-completeness-evidence.schema.json",
    "schemas/artifacts/low-risk-apply-candidate.schema.json",
    "scripts/lib/risk-surfaces.mjs",
    "scripts/resolve-low-risk-apply-candidate.mjs",
    "scripts/check-low-risk-apply-candidate.mjs",
    "examples/1.42-ordinary-user-first-slice/README.md",
    "examples/1.42-ordinary-user-first-slice/ordinary-first-slices/001-booking-app.md",
    "examples/1.43-product-completeness-gate/README.md",
    "examples/1.43-product-completeness-gate/product-completeness-reports/001-booking-mvp.md",
    "examples/mvp-booking-web-app/README.md",
    "examples/mvp-booking-web-app/package.json",
    "examples/mvp-booking-web-app/src/index.html",
    "examples/mvp-booking-web-app/src/styles.css",
    "examples/mvp-booking-web-app/src/app.js",
    "examples/mvp-booking-web-app/scripts/smoke-test.mjs",
    "examples/mvp-booking-web-app/evidence/smoke-output.txt",
    "examples/mvp-booking-web-app/evidence/smoke-output.json",
    "examples/mvp-booking-web-app/docs/product-brief.md",
    "examples/mvp-booking-web-app/ordinary-first-slices/001-booking-web-app.md",
    "examples/mvp-booking-web-app/product-completeness-reports/001-booking-web-app.md",
    "examples/mvp-booking-web-app/final-reports/001-booking-web-app.md",
    "examples/mvp-dashboard-web-app/README.md",
    "examples/mvp-dashboard-web-app/package.json",
    "examples/mvp-dashboard-web-app/src/index.html",
    "examples/mvp-dashboard-web-app/src/styles.css",
    "examples/mvp-dashboard-web-app/src/app.js",
    "examples/mvp-dashboard-web-app/scripts/smoke-test.mjs",
    "examples/mvp-dashboard-web-app/evidence/smoke-output.txt",
    "examples/mvp-dashboard-web-app/evidence/smoke-output.json",
    "examples/mvp-dashboard-web-app/docs/product-brief.md",
    "examples/mvp-dashboard-web-app/ordinary-first-slices/001-dashboard-web-app.md",
    "examples/mvp-dashboard-web-app/product-completeness-reports/001-dashboard-web-app.md",
    "examples/mvp-dashboard-web-app/final-reports/001-dashboard-web-app.md",
    "examples/mvp-cli-note-tool/README.md",
    "examples/mvp-cli-note-tool/package.json",
    "examples/mvp-cli-note-tool/src/cli.mjs",
    "examples/mvp-cli-note-tool/scripts/smoke-test.mjs",
    "examples/mvp-cli-note-tool/evidence/smoke-output.txt",
    "examples/mvp-cli-note-tool/evidence/smoke-output.json",
    "examples/mvp-cli-note-tool/docs/product-brief.md",
    "examples/mvp-cli-note-tool/ordinary-first-slices/001-cli-note-tool.md",
    "examples/mvp-cli-note-tool/product-completeness-reports/001-cli-note-tool.md",
    "examples/mvp-cli-note-tool/final-reports/001-cli-note-tool.md",
    "examples/1.45-low-risk-apply-candidate/README.md",
    "examples/1.45-low-risk-apply-candidate/controlled-apply-candidates/001-booking-demo.md",
    "test-fixtures/bad/bad-first-slice-authorizes-write/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-first-slice-jargon/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-first-slice-too-many-questions/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-product-completeness-release-overclaim/product-completeness-reports/001-bad.md",
    "test-fixtures/bad/bad-product-completeness-missing-run/product-completeness-reports/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-authorizes-run/controlled-apply-candidates/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-broad-path/controlled-apply-candidates/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-high-risk/controlled-apply-candidates/001-bad.md",
    "releases/1.42.0/release-record.md",
    "releases/1.42.0/known-limitations.md",
    "releases/1.42.0/self-check-report.md",
    "releases/1.43.0/release-record.md",
    "releases/1.43.0/known-limitations.md",
    "releases/1.43.0/self-check-report.md",
    "releases/1.44.0/release-record.md",
    "releases/1.44.0/known-limitations.md",
    "releases/1.44.0/self-check-report.md",
    "releases/1.45.0/release-record.md",
    "releases/1.45.0/known-limitations.md",
    "releases/1.45.0/self-check-report.md",
    "releases/1.46.0/release-record.md",
    "releases/1.46.0/known-limitations.md",
    "releases/1.46.0/self-check-report.md",
    "releases/1.47.0/release-record.md",
    "releases/1.47.0/known-limitations.md",
    "releases/1.47.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.42-1.47 ordinary user product loop asset exists ${file}`);
    else fail(`1.42-1.47 ordinary user product loop asset missing ${file}`);
  }

  const combined = [
    read("docs/roadmaps/ordinary-user-product-loop-1.42-1.45.md"),
    read("docs/plans/ordinary-user-product-loop-hardening-1.46-plan.md"),
    read("docs/plans/evidence-reliability-risk-calibration-1.47-plan.md"),
    read("baseline-calibration-reports/risk-surface-false-positives.md"),
    read("core/ordinary-user-first-slice.md"),
    read("core/product-completeness-gate.md"),
    read("core/real-mvp-example-evidence.md"),
    read("core/low-risk-controlled-apply-candidate.md"),
    read("templates/ordinary-user-first-slice-card.md"),
    read("templates/product-completeness-report.md"),
    read("templates/low-risk-controlled-apply-candidate.md"),
    read("schemas/artifacts/product-completeness-evidence.schema.json"),
    read("schemas/artifacts/low-risk-apply-candidate.schema.json"),
    read("scripts/lib/risk-surfaces.mjs"),
    read("scripts/resolve-first-slice.mjs"),
    read("scripts/resolve-product-completeness.mjs"),
    read("scripts/resolve-low-risk-apply-candidate.mjs"),
    read("examples/mvp-booking-web-app/product-completeness-reports/001-booking-web-app.md"),
    read("examples/mvp-booking-web-app/evidence/smoke-output.json"),
    read("examples/mvp-dashboard-web-app/README.md"),
    read("examples/mvp-dashboard-web-app/evidence/smoke-output.json"),
    read("examples/mvp-cli-note-tool/README.md"),
    read("examples/mvp-cli-note-tool/evidence/smoke-output.json"),
    read("docs/reference/scripts.md"),
    read("docs/reference/checkers.md"),
    read("docs/reference/artifacts.md"),
    read("scripts/cli.mjs"),
  ].join("\n");

  for (const marker of [
    "Ordinary User First-Slice",
    "Product Completeness",
    "Real MVP Example",
    "Low-Risk Controlled Apply Candidate",
    "Machine-Readable Evidence",
    "product_completeness_evidence",
    "analyzeRiskSurfaces",
    "evidence/smoke-output.txt",
    "evidence/smoke-output.json",
    "MVP Dashboard Web App",
    "MVP CLI Note Tool",
    "This card writes target files: No",
    "This report approves release or production: No",
    "This candidate authorizes apply: No",
    "first-slice",
    "product-completeness",
    "mvp-example-check",
    "apply-candidate",
  ]) {
    if (combined.includes(marker)) pass(`1.42-1.47 ordinary user product loop includes ${marker}`);
    else fail(`1.42-1.47 ordinary user product loop missing ${marker}`);
  }

  const firstSliceResolver = runNode(["scripts/resolve-first-slice.mjs", ".", "我想做一个预约 App"]);
  if (firstSliceResolver.status === 0
    && firstSliceResolver.stdout.includes("Ordinary User First-Slice Card")
    && firstSliceResolver.stdout.includes("This card writes target files: No")) {
    pass("1.42 first-slice resolver prints safe card");
  } else {
    fail(`1.42 first-slice resolver failed: ${firstSliceResolver.stderr || firstSliceResolver.stdout}`);
  }

  const firstSliceExample = runNode(["scripts/check-first-slice.mjs", "examples/1.42-ordinary-user-first-slice"]);
  if (firstSliceExample.status === 0 && firstSliceExample.stdout.includes("Ordinary User First-Slice check passed")) {
    pass("1.42 first-slice example passes checker");
  } else {
    fail(`1.42 first-slice example failed: ${firstSliceExample.stderr || firstSliceExample.stdout}`);
  }

  for (const [name, target, expected] of [
    ["first-slice write authorization", "test-fixtures/bad/bad-first-slice-authorizes-write", "boundary This card writes target files must be No"],
    ["first-slice jargon", "test-fixtures/bad/bad-first-slice-jargon", "internal jargon"],
    ["first-slice too many questions", "test-fixtures/bad/bad-first-slice-too-many-questions", "must ask 1-3 questions"],
  ]) {
    const result = runNode(["scripts/check-first-slice.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.42 rejects ${name}`);
    else fail(`1.42 must reject ${name}: ${output}`);
  }

  const productResolver = runNode(["scripts/resolve-product-completeness.mjs", "examples/mvp-booking-web-app", "--evidence", "evidence/smoke-output.json"]);
  if (productResolver.status === 0
    && productResolver.stdout.includes("Product Completeness Report")
    && productResolver.stdout.includes("Explicit evidence: evidence/smoke-output.json")
    && productResolver.stdout.includes("structured evidence:")
    && productResolver.stdout.includes("This report approves release or production: No")) {
    pass("1.47 product completeness resolver prints safe structured evidence-linked report");
  } else {
    fail(`1.47 product completeness resolver failed: ${productResolver.stderr || productResolver.stdout}`);
  }

  const productExample = runNode(["scripts/check-product-completeness.mjs", "examples/1.43-product-completeness-gate"]);
  if (productExample.status === 0 && productExample.stdout.includes("Product Completeness check passed")) {
    pass("1.43 product completeness example passes checker");
  } else {
    fail(`1.43 product completeness example failed: ${productExample.stderr || productExample.stdout}`);
  }

  for (const [name, target, expected] of [
    ["product release overclaim", "test-fixtures/bad/bad-product-completeness-release-overclaim", "boundary This report approves release or production must be No"],
    ["product missing run", "test-fixtures/bad/bad-product-completeness-missing-run", "checklist missing Local run or demo instructions"],
  ]) {
    const result = runNode(["scripts/check-product-completeness.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.43 rejects ${name}`);
    else fail(`1.43 must reject ${name}: ${output}`);
  }

  const mvpExample = runNode(["scripts/check-mvp-example.mjs", "examples/mvp-booking-web-app"]);
  if (mvpExample.status === 0 && mvpExample.stdout.includes("MVP Example check passed")) {
    pass("1.44 booking MVP example passes checker and local smoke test");
  } else {
    fail(`1.44 booking MVP example failed: ${mvpExample.stderr || mvpExample.stdout}`);
  }

  const dashboardExample = runNode(["scripts/check-mvp-example.mjs", "examples/mvp-dashboard-web-app"]);
  if (dashboardExample.status === 0 && dashboardExample.stdout.includes("MVP Example check passed")) {
    pass("1.46 dashboard MVP example passes checker and local smoke test");
  } else {
    fail(`1.46 dashboard MVP example failed: ${dashboardExample.stderr || dashboardExample.stdout}`);
  }

  const cliExample = runNode(["scripts/check-mvp-example.mjs", "examples/mvp-cli-note-tool"]);
  if (cliExample.status === 0 && cliExample.stdout.includes("MVP Example check passed")) {
    pass("1.47 CLI MVP example passes checker and local smoke test");
  } else {
    fail(`1.47 CLI MVP example failed: ${cliExample.stderr || cliExample.stdout}`);
  }

  const applyResolver = runNode(["scripts/resolve-low-risk-apply-candidate.mjs", ".", "--intent", "update local booking demo copy", "--path", "examples/mvp-booking-web-app/src/app.js"]);
  if (applyResolver.status === 0
    && applyResolver.stdout.includes("Low-Risk Controlled Apply Candidate")
    && applyResolver.stdout.includes("This candidate authorizes apply: No")) {
    pass("1.46 structured apply candidate resolver prints safe record");
  } else {
    fail(`1.46 structured apply candidate resolver failed: ${applyResolver.stderr || applyResolver.stdout}`);
  }

  const applyExample = runNode(["scripts/check-low-risk-apply-candidate.mjs", "examples/1.45-low-risk-apply-candidate", "--require-structured-evidence"]);
  if (applyExample.status === 0 && applyExample.stdout.includes("Low-Risk Controlled Apply Candidate check passed")) {
    pass("1.46 structured apply candidate example passes strict structured checker");
  } else {
    fail(`1.46 structured apply candidate example failed: ${applyExample.stderr || applyExample.stdout}`);
  }

  for (const [name, target, expected] of [
    ["apply authorization", "test-fixtures/bad/bad-apply-candidate-authorizes-run", "boundary This candidate authorizes apply must be No"],
    ["broad path", "test-fixtures/bad/bad-apply-candidate-broad-path", "unsafe target path"],
    ["high risk", "test-fixtures/bad/bad-apply-candidate-high-risk", "mentions high-risk surface without explicit no-authority boundary"],
  ]) {
    const result = runNode(["scripts/check-low-risk-apply-candidate.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`structured apply candidate rejects ${name}`);
    else fail(`structured apply candidate must reject ${name}: ${output}`);
  }

  checkRiskSurfaceCalibration();
}

export function runReleaseChecks() {
  checkDecisionExplainTraceProtocol();
  checkLaunchReviewViewProtocol();
  checkReleaseAdapterProtocol();
  checkReleaseGuideProtocol();
  checkPlatformReleaseRecipeProtocol();
  checkReleaseHandoffPackProtocol();
  checkReleaseExecutionProtocol();
  checkReleasePlanProtocol();
  checkGuidedClosureExperienceProtocol();
  checkExecutionReviewClosureProtocol();
  checkOrdinaryUserProductLoopProtocol();
}
