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

function checkProfiles() {
  const profileRoot = path.join(kitRoot, "profiles");
  const requiredSections = [
    "## Purpose",
    "## Applies To",
    "## Does Not Apply To",
    "## Default Task Level",
    "## Required Project Docs",
    "## Focus Areas",
    "## Platform / Project-type Risks",
    "## High-risk Boundaries",
    "## Required Verification",
    "## Release / Distribution Checks",
    "## AI Boundaries",
    "## Starter Expectations",
  ];

  for (const entry of fs.readdirSync(profileRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const profilePath = path.join(profileRoot, entry.name, "profile.md");
    const baselinePath = path.join(profileRoot, entry.name, "baseline.json");
    if (!fs.existsSync(profilePath)) {
      fail(`profile missing profile.md: profiles/${entry.name}`);
      continue;
    }
    if (!fs.existsSync(baselinePath)) {
      fail(`profile missing baseline.json: profiles/${entry.name}`);
      continue;
    }
    const content = fs.readFileSync(profilePath, "utf8");
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        fail(`profiles/${entry.name}/profile.md missing ${section}`);
      }
    }
    if (!content.includes("L0") && !content.includes("L1") && !content.includes("L2") && !content.includes("L3")) {
      fail(`profiles/${entry.name}/profile.md missing task level reference`);
    }
    let baseline;
    try {
      baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    } catch (error) {
      fail(`profiles/${entry.name}/baseline.json invalid JSON: ${error.message}`);
      continue;
    }
    for (const key of [
      "id",
      "defaultTaskLevel",
      "escalationRules",
      "requiredDocs",
      "riskGateMappings",
      "requiredVerification",
      "verificationKeywords",
      "verifyScriptKeywords",
      "highRiskKeywords",
      "humanApprovalRequiredFor",
      "releaseChecks",
      "aiBoundaries",
      "compatibleStarters",
    ]) {
      if (!(key in baseline)) {
        fail(`profiles/${entry.name}/baseline.json missing ${key}`);
      }
    }
    for (const key of [
      "escalationRules",
      "requiredDocs",
      "requiredVerification",
      "verificationKeywords",
      "verifyScriptKeywords",
      "highRiskKeywords",
      "humanApprovalRequiredFor",
      "releaseChecks",
      "compatibleStarters",
    ]) {
      if (key in baseline && !Array.isArray(baseline[key])) {
        fail(`profiles/${entry.name}/baseline.json ${key} must be an array`);
      }
    }
    if (baseline.riskGateMappings && typeof baseline.riskGateMappings !== "object") {
      fail(`profiles/${entry.name}/baseline.json riskGateMappings must be an object`);
    }
    if (!baseline.aiBoundaries
      || typeof baseline.aiBoundaries !== "object"
      || !Array.isArray(baseline.aiBoundaries.may)
      || !Array.isArray(baseline.aiBoundaries.mustNot)) {
      fail(`profiles/${entry.name}/baseline.json aiBoundaries must include may and mustNot arrays`);
    }
    if (baseline.id !== entry.name) {
      fail(`profiles/${entry.name}/baseline.json id must match directory name`);
    }
    pass(`profile structure checked: ${entry.name}`);
  }
}
function checkIndustrialPacks() {
  const requiredDocs = [
    "docs/bl2-industrial-baseline-deepening.md",
    "docs/reference/bl2-industrial-pack-depth-matrix.md",
    "examples/1.16-bl2-industrial-deepening/README.md",
    "test-fixtures/bad/bad-industrial-pack-missing-depth/industrial-packs/index.json",
    "test-fixtures/bad/bad-industrial-selects-all/docs/baseline-selection.md",
    "test-fixtures/bad/bad-industrial-risk-overlay-no-evidence/docs/baseline-selection.md",
  ];
  for (const file of requiredDocs) {
    if (exists(file)) pass(`1.16 industrial depth asset exists ${file}`);
    else fail(`1.16 industrial depth asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/bl2-industrial-baseline-deepening-1.16-plan.md"),
    read("docs/bl2-industrial-baseline-deepening.md"),
    read("docs/reference/bl2-industrial-pack-depth-matrix.md"),
    read("docs/reference/industrial-packs.md"),
    read("industrial-packs/README.md"),
    read("industrial-packs/selection-guide.md"),
    read("scripts/check-industrial-pack.mjs"),
    read("scripts/check-industrial-baseline.mjs"),
    read("scripts/resolve-industrial-baseline.mjs"),
  ].join("\n");
  for (const marker of [
    "Does Not Cover By Itself",
    "Scope Boundary",
    "Evidence Template",
    "Codex Forbidden Actions",
    "Maturity Limits",
    "risk-specific evidence",
    "BL2 selects all industrial packs by default",
    "selected without risk-specific evidence",
    "Pack files define standards",
  ]) {
    if (combined.includes(marker)) pass(`1.16 industrial depth protocol includes ${marker}`);
    else fail(`1.16 industrial depth protocol missing ${marker}`);
  }

  const result = runNode(["scripts/check-industrial-pack.mjs", kitRoot, "--json"]);
  if (result.status !== 0) {
    fail(`industrial pack check failed: ${result.stderr || result.stdout}`);
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    fail(`industrial pack check JSON is not parseable: ${error.message}`);
    return;
  }
  if (parsed.status !== "PASS") {
    fail(`industrial pack check status is ${parsed.status}`);
    return;
  }
  if (!parsed.checkedPacks || parsed.checkedPacks < 11) {
    fail(`industrial pack check validated ${parsed.checkedPacks || 0} concrete pack(s), expected at least 11`);
    return;
  }
  if (parsed.plannedPacks?.length > 0) {
    fail(`industrial pack check still has planned packs: ${parsed.plannedPacks.join(", ")}`);
    return;
  }
  pass("industrial pack structure checked");

  for (const example of [
    "web-admin-data-auth",
    "miniprogram-cloud-auth",
    "mobile-api",
    "payment-risk-overlay",
  ]) {
    const exampleResult = runNode([
      "scripts/check-industrial-baseline.mjs",
      `examples/1.16-bl2-industrial-deepening/${example}`,
      "--strict",
    ]);
    const combinedExampleOutput = `${exampleResult.stdout}\n${exampleResult.stderr}`;
    if (exampleResult.status !== 0
      && /missing semantic evidence binding|exact real-world consent evidence/i.test(combinedExampleOutput)) {
      pass(`1.16 historical industrial example fails closed without current requirement-scoped execution receipts ${example}`);
    } else {
      fail(`1.16 historical industrial example must not satisfy the current strict evidence contract ${example}: ${exampleResult.stderr || exampleResult.stdout}`);
    }
  }

  const badDepth = runNode(["scripts/check-industrial-pack.mjs", "test-fixtures/bad/bad-industrial-pack-missing-depth"]);
  if (badDepth.status !== 0 && `${badDepth.stdout}\n${badDepth.stderr}`.includes("missing BL2 depth section")) {
    pass("industrial pack checker rejects missing BL2 depth contract");
  } else {
    fail(`industrial pack checker must reject missing BL2 depth contract: ${badDepth.stderr || badDepth.stdout}`);
  }

  const badAll = runNode(["scripts/check-industrial-baseline.mjs", "test-fixtures/bad/bad-industrial-selects-all", "--strict"]);
  if (badAll.status !== 0 && `${badAll.stdout}\n${badAll.stderr}`.includes("BL2 selects all industrial packs by default")) {
    pass("industrial baseline checker rejects all-pack BL2 default");
  } else {
    fail(`industrial baseline checker must reject all-pack BL2 default: ${badAll.stderr || badAll.stdout}`);
  }

  const badRisk = runNode(["scripts/check-industrial-baseline.mjs", "test-fixtures/bad/bad-industrial-risk-overlay-no-evidence", "--strict"]);
  if (badRisk.status !== 0 && `${badRisk.stdout}\n${badRisk.stderr}`.includes("selected without risk-specific evidence")) {
    pass("industrial baseline checker rejects risk overlay without risk evidence");
  } else {
    fail(`industrial baseline checker must reject risk overlay without risk evidence: ${badRisk.stderr || badRisk.stdout}`);
  }
}
function checkIndustrialBaselineResolver() {
  const result = runNode(["scripts/check-industrial-baseline.mjs", kitRoot, "--json"]);
  if (result.status !== 0) {
    fail(`industrial baseline check failed: ${result.stderr || result.stdout}`);
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    fail(`industrial baseline check JSON is not parseable: ${error.message}`);
    return;
  }
  if (parsed.checkStatus !== "PENDING" || parsed.state !== "NOT_SELECTED") {
    fail(`intentos source industrial baseline should be pending/not selected, got ${parsed.checkStatus}/${parsed.state}`);
    return;
  }
  pass("industrial baseline resolver checked");
}
function checkStarters() {
  const starterRoot = path.join(kitRoot, "starters");
  const required = [
    "AGENTS.md",
    "README.md",
    "docs/ai-workflow.md",
    "docs/product-vision.md",
    "docs/engineering-principles.md",
    "docs/engineering-baseline.md",
    "docs/risk-policy.md",
    "docs/architecture.md",
    "docs/domain-model.md",
    "docs/permission-model.md",
    "docs/test-strategy.md",
    "requests/.gitkeep",
    "preflight/.gitkeep",
    "specs/.gitkeep",
    "evals/.gitkeep",
    "tasks/.gitkeep",
    "ai-logs/.gitkeep",
    "workflow-retros/.gitkeep",
    "workflow-improvements/.gitkeep",
    "skill-candidates/.gitkeep",
    "automation-proposals/.gitkeep",
    "intentos-proposals/.gitkeep",
    "review-packets/.gitkeep",
    "review-surface-cards/.gitkeep",
    "business-rule-closures/.gitkeep",
    "change-impact-coverage-reports/.gitkeep",
    "gpt-review-prompts/.gitkeep",
    "review-loop-reports/.gitkeep",
    "goal-cards/.gitkeep",
    "subagent-run-plans/.gitkeep",
    "follow-up-proposals/.gitkeep",
    "final-reports/.gitkeep",
    "status-reports/.gitkeep",
    "decision-briefs/.gitkeep",
    "review-summaries/.gitkeep",
    "customer-handoffs/.gitkeep",
    "releases/.gitkeep",
    "scripts/verify.sh",
    ".github/pull_request_template.md",
  ];

  for (const entry of fs.readdirSync(starterRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const file of required) {
      const full = path.join(starterRoot, entry.name, file);
      if (fs.existsSync(full)) {
        pass(`starter ${entry.name}: ${file}`);
      } else {
        fail(`starter ${entry.name} missing ${file}`);
      }
    }
    for (const injectedScript of ["scripts/summarize-ai-logs.mjs", "scripts/check-workflow-version.mjs", "scripts/check-ai-workflow.mjs", "scripts/check-guided-adoption.mjs", "scripts/workflow-daily-summary.mjs", "scripts/check-project-onboarding.mjs", "scripts/check-engineering-baseline.mjs", "scripts/check-platform-baseline.mjs", "scripts/resolve-platform-baseline.mjs", "scripts/check-industrial-pack.mjs", "scripts/resolve-industrial-baseline.mjs", "scripts/check-industrial-baseline.mjs", "scripts/check-workflow-artifacts.mjs", "scripts/check-review-loop.mjs", "scripts/check-next-step-boundary.mjs", "scripts/check-goal-mode.mjs", "scripts/check-subagent-orchestration.mjs", "scripts/resolve-beginner-entry.mjs", "scripts/check-beginner-entry.mjs", "scripts/resolve-work-queue.mjs", "scripts/check-work-queue.mjs", "scripts/resolve-hook-orchestration.mjs", "scripts/check-hook-orchestration.mjs", "scripts/resolve-hook-policy.mjs", "scripts/check-hook-policy.mjs", "scripts/resolve-review-surface.mjs", "scripts/check-review-surface.mjs", "scripts/resolve-business-rule-closure.mjs", "scripts/check-business-rule-closure.mjs", "scripts/resolve-change-impact-coverage.mjs", "scripts/check-change-impact-coverage.mjs", "scripts/resolve-delivery-path.mjs", "scripts/check-delivery-path.mjs", "scripts/resolve-debt-handoff.mjs", "scripts/check-debt-handoff.mjs", "scripts/resolve-document-archive-apply.mjs", "scripts/check-document-archive-apply.mjs", "scripts/resolve-apply-plan.mjs", "scripts/check-apply-plan.mjs", "scripts/new-workflow-item.mjs", "scripts/start-project.mjs", "scripts/workflow-next.mjs"]) {
      const full = path.join(starterRoot, entry.name, injectedScript);
      if (fs.existsSync(full)) {
        fail(`starter ${entry.name} should not duplicate injected workflow script ${injectedScript}`);
      }
    }
    const agents = path.join(starterRoot, entry.name, "AGENTS.md");
    if (fs.existsSync(agents)) {
      const content = fs.readFileSync(agents, "utf8");
      for (const section of ["Mission", "Zero-Experience Solo Developer", "Core Rules", "Bootstrap Entry", "Beginner Entry", "Natural Language Workflow Guidance", "Delivery Path Governance", "Debt & Knowledge Handoff", "Document Archive Apply", "Unified Apply Plan", "Project Hook Policy", "Project Onboarding", "Engineering Baseline", "Environment Baseline", "Platform Baseline", "Industrial Baseline", "Product Baseline", "Claim Control", "Workflow Artifact Generation", "Guided Decision & Delivery Loop", "Change Boundary And Baseline State", "Goal Mode", "Subagent Orchestration", "Review Surface Governance", "Business Rule Closure", "Change Impact Coverage", "Review Loop", "Bounded Next-Step", "Output Experience", "Task Execution Rules", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
        if (!content.includes(section)) {
          fail(`starter ${entry.name} AGENTS.md missing ${section}`);
        }
      }
    }
    const prTemplate = path.join(starterRoot, entry.name, ".github", "pull_request_template.md");
    if (fs.existsSync(prTemplate)) {
      const content = fs.readFileSync(prTemplate, "utf8");
      for (const marker of ["Human Summary", "Workflow Guidance", "Beginner Entry", "Delivery Path", "Debt / Knowledge Handoff", "Document Archive Apply", "Unified Apply Plan", "Project Hook Policy", "Bootstrap state", "Project onboarding", "Engineering baseline", "Environment baseline", "Product baseline", "Claim control", "Context governance", "Git Boundary", "Assumptions", "Workflow Evidence", "Guided Delivery Loop", "Change Boundary Report", "Baseline State Report", "Workflow artifact quality", "Review Surface Card", "Business Rule Closure Card", "Change Impact Coverage Report", "Review Packet / Review Loop Report", "Subagent Run Plan", "Next-Step Suggestions", "Skill / Automation Governance", "irreversible operation"]) {
        if (!content.includes(marker)) {
          fail(`starter ${entry.name} PR template missing ${marker}`);
        }
      }
    }
    const verifyScript = path.join(starterRoot, entry.name, "scripts", "verify.sh");
    if (fs.existsSync(verifyScript)) {
      const result = spawnSync("bash", ["-n", verifyScript], { encoding: "utf8" });
      if (result.status === 0) {
        pass(`starter ${entry.name}: verify.sh syntax`);
      } else {
        fail(`starter ${entry.name}: verify.sh syntax failed: ${result.stderr || result.stdout}`);
      }
      const emptyProject = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-${entry.name}-verify-`));
      const negative = spawnSync("bash", [verifyScript], { cwd: emptyProject, encoding: "utf8" });
      fs.rmSync(emptyProject, { recursive: true, force: true });
      if (negative.status !== 0) {
        pass(`starter ${entry.name}: verify.sh fails closed without a runnable verification path`);
      } else {
        fail(`starter ${entry.name}: verify.sh must fail when no runnable verification path exists`);
      }
    }
  }
}
function checkPlatformAdapters() {
  const cursorRules = read("platforms/cursor/rules-template.md");
  const claudeInstructions = read("platforms/claude/instructions.md");
  const githubPr = read("platforms/github/pull_request_template.md");
  const githubCi = read("platforms/github/ci-ai-workflow.yml");

  for (const [name, content] of [
    ["platforms/cursor/rules-template.md", cursorRules],
    ["platforms/claude/instructions.md", claudeInstructions],
    ["platforms/github/pull_request_template.md", githubPr],
  ]) {
    const normalized = content.toLowerCase();
    for (const marker of ["bootstrap", "onboarding", "artifact", "skill", "automation", "daily summary", "human summary", "next-step", "subagent", "product baseline", "claim control", "assumption", "context governance", "git boundary", "safe launch", "conversation drift", "first delivery", "guided delivery", "delivery path", "debt", "archive apply", "apply plan", "beginner entry", "change boundary", "baseline state", "baseline pack", "workflow guidance", "review surface"]) {
      if (normalized.includes(marker)) {
        pass(`${name} includes ${marker}`);
      } else {
        fail(`${name} missing ${marker}`);
      }
    }
  }

  for (const command of [
    "check-ai-workflow.mjs",
    "check-guided-adoption.mjs",
    "check-workflow-version.mjs",
    "summarize-ai-logs.mjs",
    "workflow-daily-summary.mjs",
    "check-project-onboarding.mjs",
    "check-engineering-baseline.mjs",
    "check-environment-baseline.mjs",
    "check-baseline-enforcement.mjs",
    "check-product-baseline.mjs",
    "check-claim-control.mjs",
    "check-context-governance.mjs",
    "check-launch-readiness.mjs",
    "check-conversation-drift.mjs",
    "check-guided-delivery-loop.mjs",
    "check-first-delivery-walkthrough.mjs",
    "check-real-adoption-trial.mjs",
    "check-patch-classification.mjs",
    "check-workflow-adoption-map.mjs",
    "resolve-existing-workflow.mjs",
    "check-document-lifecycle.mjs",
    "resolve-document-lifecycle.mjs",
    "check-document-archive-apply.mjs",
    "resolve-document-archive-apply.mjs",
    "check-apply-plan.mjs",
    "resolve-apply-plan.mjs",
    "check-beginner-entry.mjs",
    "resolve-beginner-entry.mjs",
    "check-work-queue.mjs",
    "resolve-work-queue.mjs",
    "check-hook-orchestration.mjs",
    "resolve-hook-orchestration.mjs",
    "check-workflow-guidance.mjs",
    "resolve-workflow-guidance.mjs",
    "check-review-surface.mjs",
    "resolve-review-surface.mjs",
    "check-change-impact-coverage.mjs",
    "resolve-change-impact-coverage.mjs",
    "check-delivery-path.mjs",
    "resolve-delivery-path.mjs",
    "check-debt-handoff.mjs",
    "resolve-debt-handoff.mjs",
    "check-change-boundary.mjs",
    "check-baseline-state.mjs",
    "resolve-standard-baseline.mjs",
    "check-standard-baseline-pack.mjs",
    "check-standard-baseline-selection.mjs",
    "resolve-baseline-packs.mjs",
    "check-baseline-pack-selection.mjs",
    "check-platform-baseline.mjs",
    "resolve-platform-baseline.mjs",
    "check-industrial-pack.mjs",
    "resolve-industrial-baseline.mjs",
    "check-industrial-baseline.mjs",
    "check-workflow-artifacts.mjs",
    "check-review-loop.mjs",
    "check-next-step-boundary.mjs",
    "check-goal-mode.mjs",
    "check-subagent-orchestration.mjs",
    "new-workflow-item.mjs",
    "start-project.mjs",
    "workflow-next.mjs",
  ]) {
    if (githubCi.includes(command)) {
      pass(`platforms/github/ci-ai-workflow.yml runs ${command}`);
    } else {
      fail(`platforms/github/ci-ai-workflow.yml missing ${command}`);
    }
  }

  for (const marker of ["fetch-depth: 0", "workflow_dispatch:", "Resolve comparison base", "consumer-base.outputs.base", "--mode core", "--selected-only", "--bl2-only", "--mode ready", "--changed-only"]) {
    if (githubCi.includes(marker)) {
      pass(`platforms/github/ci-ai-workflow.yml includes ${marker}`);
    } else {
      fail(`platforms/github/ci-ai-workflow.yml missing ${marker}`);
    }
  }
}
function checkScriptSyntax() {
  const scripts = [
    "scripts/lib/artifact-schema.mjs",
    "scripts/init-project.mjs",
    "scripts/check-ai-workflow.mjs",
    "scripts/check-guided-adoption.mjs",
    "scripts/check-intentos.mjs",
    "scripts/summarize-ai-logs.mjs",
    "scripts/check-workflow-version.mjs",
    "scripts/workflow-daily-summary.mjs",
    "scripts/check-project-onboarding.mjs",
    "scripts/check-engineering-baseline.mjs",
    "scripts/check-environment-baseline.mjs",
    "scripts/check-baseline-enforcement.mjs",
    "scripts/check-product-baseline.mjs",
    "scripts/check-claim-control.mjs",
    "scripts/check-context-governance.mjs",
    "scripts/check-launch-readiness.mjs",
    "scripts/check-conversation-drift.mjs",
    "scripts/check-first-delivery-walkthrough.mjs",
    "scripts/check-real-adoption-trial.mjs",
    "scripts/check-patch-classification.mjs",
    "scripts/resolve-existing-workflow.mjs",
    "scripts/check-workflow-adoption-map.mjs",
    "scripts/resolve-document-lifecycle.mjs",
    "scripts/check-document-lifecycle.mjs",
    "scripts/resolve-work-queue.mjs",
    "scripts/check-work-queue.mjs",
    "scripts/resolve-hook-orchestration.mjs",
    "scripts/check-hook-orchestration.mjs",
    "scripts/resolve-workflow-guidance.mjs",
    "scripts/check-workflow-guidance.mjs",
    "scripts/resolve-guided-closure.mjs",
    "scripts/check-guided-closure.mjs",
    "scripts/resolve-execution-assurance.mjs",
    "scripts/check-execution-assurance.mjs",
    "scripts/resolve-change-impact-coverage.mjs",
    "scripts/check-change-impact-coverage.mjs",
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
    "scripts/resolve-first-slice.mjs",
    "scripts/check-first-slice.mjs",
    "scripts/resolve-product-completeness.mjs",
    "scripts/check-product-completeness.mjs",
    "scripts/check-mvp-example.mjs",
    "scripts/resolve-low-risk-apply-candidate.mjs",
    "scripts/check-low-risk-apply-candidate.mjs",
    "scripts/resolve-platform-release-recipe.mjs",
    "scripts/check-platform-release-recipe.mjs",
    "scripts/resolve-release-handoff-pack.mjs",
    "scripts/check-release-handoff-pack.mjs",
    "scripts/resolve-delivery-path.mjs",
    "scripts/check-delivery-path.mjs",
    "scripts/resolve-debt-handoff.mjs",
    "scripts/check-debt-handoff.mjs",
    "scripts/check-approval-record.mjs",
    "scripts/resolve-standard-baseline.mjs",
    "scripts/check-standard-baseline-pack.mjs",
    "scripts/check-standard-baseline-selection.mjs",
    "scripts/resolve-guided-baseline-selection.mjs",
    "scripts/check-guided-baseline-selection.mjs",
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-workflow-artifacts.mjs",
    "scripts/check-review-loop.mjs",
    "scripts/check-next-step-boundary.mjs",
    "scripts/check-goal-mode.mjs",
    "scripts/check-subagent-orchestration.mjs",
    "scripts/cli.mjs",
    "scripts/start-project.mjs",
    "scripts/baseline-project.mjs",
    "scripts/migrate-project.mjs",
    "scripts/lib/args.mjs",
    "scripts/lib/check-result.mjs",
    "scripts/lib/frontmatter.mjs",
    "scripts/lib/git.mjs",
    "scripts/lib/manifest.mjs",
    "scripts/lib/markdown.mjs",
    "scripts/lib/project-signals.mjs",
    "scripts/check-manifest.mjs",
    "scripts/check-fixtures.mjs",
    "scripts/score-output-quality.mjs",
    "scripts/check-glossary-usage.mjs",
    "scripts/new-workflow-item.mjs",
    "scripts/workflow-next.mjs",
  ];
  for (const script of scripts) {
    const result = spawnSync(process.execPath, ["--check", path.join(kitRoot, script)], {
      encoding: "utf8",
    });
    if (result.status === 0) {
      pass(`syntax ${script}`);
    } else {
      fail(`syntax ${script}: ${result.stderr || result.stdout}`);
    }
  }
}
function checkReadmePointers() {
  const readme = read("README.md");
  const zhReadme = read("README.zh-CN.md");
  const requiredReadmePointers = [
    "IntentOS",
    "An AI-native system for guided software delivery",
    "Current release",
    "Start In 30 Seconds",
    "You describe the goal",
    "node scripts/cli.mjs work",
    "How It Works",
    "What IntentOS Covers",
    "New, Existing, And Production Projects",
    "Safety Boundaries",
    "Release History",
    "core/review-context-authority.md",
    "docs/start-here.md",
    "docs/operating-model.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "docs/reference/scripts.md",
    "docs/reference/artifacts.md",
    "docs/reference/checkers.md",
    "npm run verify",
    "VERSION.md",
    "License",
  ];
  for (const pointer of requiredReadmePointers) {
    if (readme.includes(pointer)) pass(`README entry mentions ${pointer}`);
    else fail(`README entry missing ${pointer}`);
  }
  const currentReleasePointer = `releases/${currentVersion()}/release-record.md`;
  if (readme.includes(currentReleasePointer) && zhReadme.includes(currentReleasePointer)) {
    pass("README files mention current release record");
  } else {
    fail(`README files must mention current release record: ${currentReleasePointer}`);
  }

  for (const pointer of [
    "IntentOS 中文说明",
    "面向 AI 协作开发的项目交付系统",
    "当前版本",
    "30 秒开始",
    "你只说真实业务",
    "node scripts/cli.mjs work",
    "版本历史",
    "core/review-context-authority.md",
    "3 分钟理解",
    "适合什么场景",
    "项目分级",
    "安全边界",
    "docs/start-here.md",
    "docs/operating-model.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "docs/reference/scripts.md",
    "docs/reference/artifacts.md",
    "docs/reference/checkers.md",
    "npm run verify",
    currentReleasePointer,
    "VERSION.md",
  ]) {
    if (zhReadme.includes(pointer)) pass(`README.zh-CN mentions ${pointer}`);
    else fail(`README.zh-CN missing ${pointer}`);
  }

  const requiredDocs = [
    "docs/start-here.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "docs/README.md",
    "docs/index.md",
    "docs/repository-structure.md",
    "docs/document-ownership.md",
    "docs/artifact-lifecycle.md",
    "docs/structured-evidence-schema.md",
    "docs/o0-bl0-lightweight-path.md",
    "docs/plans/README.md",
    "docs/plans/repository-information-architecture-1.36-plan.md",
    "docs/plans/existing-project-native-adoption-decision-1.69-plan.md",
    "docs/plans/product-adoption-trust-finalization-1.68.2-plan.md",
    "docs/plans/product-adoption-trust-hardening-1.68.1-plan.md",
    "docs/plans/product-adoption-simplification-1.68-plan.md",
    "docs/plans/execution-assurance-chain-1.72-plan.md",
    "docs/plans/conversation-native-ask-1.37-plan.md",
    "docs/roadmaps/README.md",
    "docs/operator-manual.md",
    "docs/natural-language-orchestrator.md",
    "docs/unified-closure-model.md",
    "docs/decision-explain-trace.md",
    "docs/execution-assurance-chain.md",
    "docs/launch-review-view.md",
    "docs/release-adapter.md",
    "docs/release-execution-protocol.md",
    "docs/review-surface-governance.md",
    "docs/change-impact-coverage.md",
    "docs/delivery-path-governance.md",
    "docs/first-hour.md",
    "docs/reference/scripts.md",
    "docs/reference/artifacts.md",
    "docs/reference/checkers.md",
    "docs/reference/standard-baseline-packs.md",
    "docs/reference/industrial-packs.md",
    "docs/guided-delivery-baseline.md",
    "docs/product-baseline.md",
    "docs/claim-control.md",
    "docs/project-memory.md",
    "docs/git-boundary.md",
    "docs/context-governance-usage.md",
    "docs/minimal-commit-set.md",
    "docs/safe-launch.md",
    "docs/conversation-drift-control.md",
    "docs/conversation-native-ask.md",
    "docs/first-delivery-walkthrough.md",
    "docs/change-boundary.md",
    "docs/baseline-state.md",
    "docs/guided-delivery-check.md",
    "docs/standard-baseline-pack-registry.md",
    "docs/existing-project-workflow-adapter.md",
    "docs/document-lifecycle.md",
    "docs/document-archive-apply.md",
    "docs/work-queue.md",
    "docs/hook-policy.md",
    "docs/baseline-pack-system.md",
    "docs/adoption-playbooks/new-project.md",
    "docs/adoption-playbooks/existing-light-project.md",
    "docs/adoption-playbooks/governed-project-read-only.md",
    "docs/adoption-playbooks/production-project-adapter.md",
    "docs/migrations/index.md",
    "docs/migrations/0.33-to-1.0.md",
    "docs/troubleshooting.md",
    "docs/faq.md",
  ];
  for (const doc of requiredDocs) {
    if (exists(doc)) pass(`docs IA file exists ${doc}`);
    else fail(`docs IA file missing ${doc}`);
  }

  const rootDocs = fs.readdirSync(path.join(kitRoot, "docs"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
  const misplacedPlans = rootDocs.filter((name) => /-\d+(?:\.\d+)*-plan\.md$/.test(name));
  const misplacedRoadmaps = rootDocs.filter((name) => /roadmap/i.test(name));
  if (misplacedPlans.length === 0) pass("docs IA keeps historical plan files out of docs root");
  else fail(`docs IA has plan files in docs root: ${misplacedPlans.join(", ")}`);
  if (misplacedRoadmaps.length === 0) pass("docs IA keeps roadmap files out of docs root");
  else fail(`docs IA has roadmap files in docs root: ${misplacedRoadmaps.join(", ")}`);

  const plans = fs.readdirSync(path.join(kitRoot, "docs", "plans"))
    .filter((name) => name.endsWith(".md"))
    .sort();
  const roadmaps = fs.readdirSync(path.join(kitRoot, "docs", "roadmaps"))
    .filter((name) => name.endsWith(".md"))
    .sort();
  if (plans.includes("repository-information-architecture-1.36-plan.md")
    && plans.includes("beginner-entry-1.35-plan.md")
    && plans.includes("productization-hardcut-1.0-plan.md")) {
    pass("docs IA has historical plans under docs/plans");
  } else {
    fail(`docs IA missing expected plans under docs/plans: ${plans.join(", ")}`);
  }
  if (roadmaps.includes("governance-hardening-roadmap.md")
    && roadmaps.includes("delivery-governance-roadmap-1.26-1.29.md")) {
    pass("docs IA has roadmap docs under docs/roadmaps");
  } else {
    fail(`docs IA missing expected roadmaps under docs/roadmaps: ${roadmaps.join(", ")}`);
  }

  const repositoryStructure = read("docs/repository-structure.md");
  for (const marker of [
    "Root Directory Classes",
    "Why Many Root Artifact Directories Remain Flat",
    "workflow artifact contract",
    "Do not move root workflow artifact directories",
  ]) {
    if (repositoryStructure.includes(marker)) pass(`repository structure docs include ${marker}`);
    else fail(`repository structure docs missing ${marker}`);
  }

  const ownership = read("docs/document-ownership.md");
  for (const marker of [
    "Source Of Truth",
    "Historical plans",
    "Roadmaps",
    "When Docs Disagree",
    "does not authorize deletion",
  ]) {
    if (ownership.includes(marker)) pass(`document ownership docs include ${marker}`);
    else fail(`document ownership docs missing ${marker}`);
  }

  const referenceContent = [
    readme,
    zhReadme,
    ...requiredDocs.filter(exists).map(read),
    read("docs/quickstart.md"),
    read("docs/codex-usage.md"),
    read("docs/mental-model.md"),
    read("docs/artifact-decision-tree.md"),
    read("docs/goal-subagent-usage.md"),
    read("docs/roadmaps/governance-hardening-roadmap.md"),
  ].join("\n");
  const requiredReferencePointers = [
    "Start Here",
    "Minimal Adoption",
    "Source-Only Adoption",
    "For Existing Projects",
    "For Maintainers",
    "Primary Public Entry",
    "generic-project",
    "codex-ios-app",
    "codex-android-app",
    "Goal Mode",
    "Subagent Orchestration",
    "Many readers, one writer",
    "CLOSED",
    "SKIPPED",
    "DISCUSS_ONLY",
    "ADOPT_PROJECT",
    "DEFINE_WORK",
    "IMPLEMENT_TASK",
    "REVIEW_TASK",
    "REPAIR_TASK",
    "BASELINE_DECISION",
    "HANDOFF_OR_REPORT",
    "Human Approval",
    "Risk Gate Exclusions",
    "O0",
    "O1",
    "O2",
    "BL0",
    "BL1",
    "BL2",
    "workflow-next",
    "start-project",
    "Guided Adoption Recommendation",
    "adoption-recommendations",
    "ADOPTION_MODE",
    "RUN_ADOPTION_ASSESSMENT",
    "REVIEW_DIRTY_WORKTREE",
    "PROJECT_STATE_TAGS",
    "adoption-assessment",
    "existing-governance-map",
    "review-packet",
    "gpt-review-prompt",
    "review-loop-report",
    "Safe Launch",
    "Launch Readiness Report",
    "Conversation Drift Control",
    "Conversation Turn Classification",
    "Scope Change Report",
    "First Delivery Walkthrough",
    "Adoption Trial Report",
    "Workflow Adoption Map",
    "Document Lifecycle",
    "Guided Delivery Check",
    "Change Boundary",
    "Baseline State",
    "Unified Apply Plan",
    "Beginner Entry",
    "beginner-entry-cards",
    "apply-plans",
    "change-boundary-reports",
    "baseline-state-reports",
    "launch-readiness",
    "conversation-turns",
    "scope-change-reports",
    "adoption-trial-reports",
    "workflow-adoption-maps",
    "doc-lifecycle-reports",
    "work-queue",
    "follow-up-proposal",
    "final-report",
    "human-status-report",
    "decision-brief",
    "plain-review-summary",
    "customer-handoff",
    "skill-candidates",
    "automation-proposals",
    "platform baseline",
    "industrial-packs",
    "selection-guide",
    "--selected-only",
    "--bl2-only",
    "--mode core",
    "--mode full",
    "--mode ready",
    "--mode implementation",
    "--task",
    "--changed-only",
    "--enforce",
    "--apply-pr-template-governance",
    "--apply-agent-governance",
    "migration-reports",
    "workflow-daily-summary",
    "profiles/",
    "platforms/",
  ];
  for (const pointer of requiredReferencePointers) {
    if (referenceContent.includes(pointer)) pass(`docs references mention ${pointer}`);
    else fail(`docs references missing ${pointer}`);
  }
}
function checkFixtureSuite() {
  const result = runNode([
    path.join(kitRoot, "scripts", "check-fixtures.mjs"),
  ]);
  if (result.status !== 0) {
    fail(`fixture suite failed: ${result.stderr || result.stdout}`);
    return;
  }
  pass("fixture suite");
}
function checkReviewLoopL2DogfoodExample() {
  const exampleRoot = path.join(kitRoot, "examples", "review-loop-l2-first-slice");
  const requiredMarkers = [
    ["review-loop-reports/001-review-loop-l2-slice.md", "AUTO_FIX"],
    ["review-loop-reports/001-review-loop-l2-slice.md", "NEEDS_HUMAN_DECISION"],
    ["review-loop-reports/001-review-loop-l2-slice.md", "DIRECT_FOLLOW_UP"],
    ["review-loop-reports/001-review-loop-l2-slice.md", "DO_NOT_PROCEED"],
    ["final-reports/001-review-loop-l2-slice.md", "DIRECT_FOLLOW_UP"],
    ["final-reports/001-review-loop-l2-slice.md", "DO_NOT_PROCEED"],
  ];
  for (const [file, marker] of requiredMarkers) {
    const content = fs.readFileSync(path.join(exampleRoot, file), "utf8");
    if (!content.includes(marker)) {
      fail(`Review Loop L2 dogfood example missing ${marker} in ${file}`);
      return;
    }
  }

  const artifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-review-loop-l2-slice.md",
  ]);
  if (artifactCheck.status !== 0) {
    fail(`Review Loop L2 dogfood workflow artifact check failed: ${artifactCheck.stderr || artifactCheck.stdout}`);
    return;
  }
  pass("Review Loop L2 dogfood workflow artifact check");

  const reviewLoopCheck = runNode([
    path.join(kitRoot, "scripts", "check-review-loop.mjs"),
    exampleRoot,
    "--mode",
    "ready",
    "--task",
    "tasks/001-review-loop-l2-slice.md",
  ]);
  if (reviewLoopCheck.status !== 0) {
    fail(`Review Loop L2 dogfood review loop check failed: ${reviewLoopCheck.stderr || reviewLoopCheck.stdout}`);
    return;
  }
  pass("Review Loop L2 dogfood review loop check");

  const nextStepCheck = runNode([
    path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-review-loop-l2-slice.md",
  ]);
  if (nextStepCheck.status !== 0) {
    fail(`Review Loop L2 dogfood next-step boundary check failed: ${nextStepCheck.stderr || nextStepCheck.stdout}`);
    return;
  }
  pass("Review Loop L2 dogfood next-step boundary check");
}
function checkGoalSubagentL2FeatureExample() {
  const exampleRoot = path.join(kitRoot, "examples", "goal-subagent-l2-feature");
  const requiredMarkers = [
    ["README.md", "simulated dogfood"],
    ["README.md", "not real project validation"],
    ["goal-cards/001-project-status-filter.md", "IMPLEMENT_TASK"],
    ["subagent-run-plans/001-project-status-filter.md", "Many readers, one writer: Yes"],
    ["subagent-run-plans/001-project-status-filter.md", "All subagents closed: Yes"],
    ["review-loop-reports/001-project-status-filter.md", "AUTO_FIX"],
    ["review-loop-reports/001-project-status-filter.md", "NEEDS_HUMAN_DECISION"],
    ["review-loop-reports/001-project-status-filter.md", "DIRECT_FOLLOW_UP"],
    ["review-loop-reports/001-project-status-filter.md", "DO_NOT_PROCEED"],
    ["final-reports/001-project-status-filter.md", "DIRECT_FOLLOW_UP"],
    ["follow-up-proposals/001-status-filter-lookup-admin.md", "Can AI Do This Now?"],
  ];
  for (const [file, marker] of requiredMarkers) {
    const content = fs.readFileSync(path.join(exampleRoot, file), "utf8");
    if (!content.includes(marker)) {
      fail(`Goal + Subagent L2 feature example missing ${marker} in ${file}`);
      return;
    }
  }

  const checks = [
    ["Goal + Subagent L2 feature Goal Mode check", [
      path.join(kitRoot, "scripts", "check-goal-mode.mjs"),
      exampleRoot,
    ]],
    ["Goal + Subagent L2 feature Subagent Orchestration check", [
      path.join(kitRoot, "scripts", "check-subagent-orchestration.mjs"),
      exampleRoot,
    ]],
    ["Goal + Subagent L2 feature Engineering Baseline strict check", [
      path.join(kitRoot, "scripts", "check-engineering-baseline.mjs"),
      exampleRoot,
      "--strict",
    ]],
    ["Goal + Subagent L2 feature workflow artifact check", [
      path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
      exampleRoot,
      "--mode",
      "ready",
      "--task",
      "tasks/001-project-status-filter.md",
    ]],
    ["Goal + Subagent L2 feature review loop check", [
      path.join(kitRoot, "scripts", "check-review-loop.mjs"),
      exampleRoot,
      "--task",
      "tasks/001-project-status-filter.md",
    ]],
    ["Goal + Subagent L2 feature next-step boundary check", [
      path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
      exampleRoot,
      "--task",
      "tasks/001-project-status-filter.md",
    ]],
    ["Goal + Subagent L2 feature output quality check", [
      path.join(kitRoot, "scripts", "score-output-quality.mjs"),
      exampleRoot,
      "--min-score",
      "80",
    ]],
  ];

  for (const [label, args] of checks) {
    const result = runNode(args);
    if (result.status !== 0) {
      fail(`${label} failed: ${result.stderr || result.stdout}`);
      return;
    }
    pass(label);
  }
}
function checkWebBl2ExampleArtifacts() {
  const exampleRoot = path.join(kitRoot, "examples", "web-industrial-bl2-first-slice");
  const readyArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "ready",
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (readyArtifactCheck.status !== 0) {
    fail(`web BL2 example ready artifact check failed: ${readyArtifactCheck.stderr || readyArtifactCheck.stdout}`);
    return;
  }
  pass("web BL2 example ready artifact check");

  const implementationArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (implementationArtifactCheck.status !== 0) {
    fail(`web BL2 example implementation artifact check failed: ${implementationArtifactCheck.stderr || implementationArtifactCheck.stdout}`);
    return;
  }
  pass("web BL2 example implementation artifact check");

  const reviewLoopCheck = runNode([
    path.join(kitRoot, "scripts", "check-review-loop.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (reviewLoopCheck.status !== 0) {
    fail(`web BL2 example review loop check failed: ${reviewLoopCheck.stderr || reviewLoopCheck.stdout}`);
    return;
  }
  pass("web BL2 example review loop check");

  const nextStepCheck = runNode([
    path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (nextStepCheck.status !== 0) {
    fail(`web BL2 example next-step boundary check failed: ${nextStepCheck.stderr || nextStepCheck.stdout}`);
    return;
  }
  pass("web BL2 example next-step boundary check");
}
function checkMiniProgramBl2ExampleArtifacts() {
  const exampleRoot = path.join(kitRoot, "examples", "miniprogram-industrial-bl2-first-slice");
  const readyArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "ready",
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (readyArtifactCheck.status !== 0) {
    fail(`Mini Program BL2 example ready artifact check failed: ${readyArtifactCheck.stderr || readyArtifactCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example ready artifact check");

  const implementationArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (implementationArtifactCheck.status !== 0) {
    fail(`Mini Program BL2 example implementation artifact check failed: ${implementationArtifactCheck.stderr || implementationArtifactCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example implementation artifact check");

  const reviewLoopCheck = runNode([
    path.join(kitRoot, "scripts", "check-review-loop.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (reviewLoopCheck.status !== 0) {
    fail(`Mini Program BL2 example review loop check failed: ${reviewLoopCheck.stderr || reviewLoopCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example review loop check");

  const nextStepCheck = runNode([
    path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (nextStepCheck.status !== 0) {
    fail(`Mini Program BL2 example next-step boundary check failed: ${nextStepCheck.stderr || nextStepCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example next-step boundary check");

  const baselineCheck = runNode([
    path.join(kitRoot, "scripts", "check-industrial-baseline.mjs"),
    exampleRoot,
    "--strict",
  ]);
  if (baselineCheck.status !== 0 || !baselineCheck.stdout.includes("Industrial baseline is ready")) {
    fail(`Mini Program BL2 example strict baseline check failed: ${baselineCheck.stderr || baselineCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example strict baseline check");
}

export function runDistributionChecks() {
  checkProfiles();
  checkIndustrialPacks();
  checkIndustrialBaselineResolver();
  checkStarters();
  checkPlatformAdapters();
  checkScriptSyntax();
  checkReadmePointers();
  checkFixtureSuite();
  checkReviewLoopL2DogfoodExample();
  checkGoalSubagentL2FeatureExample();
  checkWebBl2ExampleArtifacts();
  checkMiniProgramBl2ExampleArtifacts();
}
