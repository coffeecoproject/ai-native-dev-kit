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

function checkReviewSurfaceGovernanceProtocol() {
  const required = [
    "core/review-surface-governance.md",
    "docs/review-surface-governance.md",
    "templates/review-surface-card.md",
    "checklists/review-surface-review.md",
    "prompts/review-surface-agent.md",
    "review-surface-cards/.gitkeep",
    "scripts/resolve-review-surface.mjs",
    "scripts/check-review-surface.mjs",
    "examples/1.25-review-surface-governance/README.md",
    "examples/1.25-review-surface-governance/review-surface-cards/001-booking-review-surface.md",
    "test-fixtures/bad/bad-review-surface-approves-implementation/review-surface-cards/001-bad.md",
    "test-fixtures/bad/bad-review-surface-missing-debt/review-surface-cards/001-bad.md",
    "releases/1.25.0/release-record.md",
    "releases/1.25.0/known-limitations.md",
    "releases/1.25.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.25 review surface asset exists ${file}`);
    else fail(`1.25 review surface asset missing ${file}`);
  }

  const combined = [
    read("core/review-surface-governance.md"),
    read("docs/review-surface-governance.md"),
    read("templates/review-surface-card.md"),
    read("scripts/resolve-review-surface.mjs"),
    read("scripts/check-review-surface.mjs"),
    read("releases/1.25.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Review Surface Governance",
    "Review Surface Card",
    "Codex selects review surfaces",
    "DEBT_REVIEW is always required",
    "Post-Execution Review Contract",
    "This card writes target files: No",
    "This card approves implementation: No",
    "This card approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.25 review surface includes ${marker}`);
    else fail(`1.25 review surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-review-surface.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Review Surface Card")
    && resolver.stdout.includes("Selected Review Surfaces")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.25 review surface resolver prints safe card");
  } else {
    fail(`1.25 review surface resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-review-surface.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "REVIEW_SURFACE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.selectedReviewSurfaces?.some((item) => item.surface === "DEBT_REVIEW")
        && Array.isArray(parsed.postExecutionReviewContract)) {
        pass("1.25 review surface resolver JSON includes boundaries, debt review, and post-execution contract");
      } else {
        fail(`1.25 review surface resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.25 review surface resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.25 review surface resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-review-surface.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Review surface check passed")) {
    pass("1.25 review surface checker passes source repo");
  } else {
    fail(`1.25 review surface checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-review-surface.mjs", "examples/1.25-review-surface-governance"]);
  if (example.status === 0 && example.stdout.includes("Review surface check passed")) {
    pass("1.25 review surface example passes checker");
  } else {
    fail(`1.25 review surface example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["approval overclaim", ["scripts/check-review-surface.mjs", "test-fixtures/bad/bad-review-surface-approves-implementation"], "forbidden review surface claim"],
    ["missing debt", ["scripts/check-review-surface.mjs", "test-fixtures/bad/bad-review-surface-missing-debt"], "missing required review surface: DEBT_REVIEW"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.25 review surface rejects ${name}`);
    } else {
      fail(`1.25 review surface must reject ${name}: ${output}`);
    }
  }
}
function checkBusinessRuleClosureProtocol() {
  const required = [
    "core/business-rule-closure.md",
    "docs/business-rule-closure.md",
    "docs/plans/business-rule-closure-1.75-plan.md",
    "templates/business-rule-closure-card.md",
    "checklists/business-rule-closure-review.md",
    "prompts/business-rule-closure-agent.md",
    "schemas/artifacts/business-rule-closure.schema.json",
    "business-rule-closures/.gitkeep",
    "scripts/resolve-business-rule-closure.mjs",
    "scripts/check-business-rule-closure.mjs",
    "examples/1.75-business-rule-closure/README.md",
    "examples/1.75-business-rule-closure/appointment-service-time/README.md",
    "examples/1.75-business-rule-closure/appointment-service-time/business-rule-closures/001-appointment-requests-must-include-a-service-time.md",
    "test-fixtures/bad/bad-business-rule-authorizes-implementation/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-codex-approves-tax-decision/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-cross-platform-single-surface/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-effective-time-missing/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-exception-policy-ambiguous/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-existing-rule-conflict-ready/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-historical-data-auto-change/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-markdown-json-mismatch/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-missing-actor/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-missing-digest/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-production-verified-without-evidence/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-ready-with-blocking-decision/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-ready-with-domain-owner-pending/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-safe-default-treated-as-approval/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-tax-field-claims-tax-compliance/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-too-many-user-questions/business-rule-closures/001-bad.md",
    "releases/1.75.0/release-record.md",
    "releases/1.75.0/known-limitations.md",
    "releases/1.75.0/self-check-report.md",
    "releases/1.75.1/release-record.md",
    "releases/1.75.1/known-limitations.md",
    "releases/1.75.1/self-check-report.md",
    "releases/1.75.2/release-record.md",
    "releases/1.75.2/known-limitations.md",
    "releases/1.75.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.75 business rule closure asset exists ${file}`);
    else fail(`1.75 business rule closure asset missing ${file}`);
  }

  const combined = [
    read("core/business-rule-closure.md"),
    read("docs/business-rule-closure.md"),
    read("templates/business-rule-closure-card.md"),
    read("checklists/business-rule-closure-review.md"),
    read("prompts/business-rule-closure-agent.md"),
    read("schemas/artifacts/business-rule-closure.schema.json"),
    read("scripts/resolve-business-rule-closure.mjs"),
    read("scripts/check-business-rule-closure.mjs"),
    read("scripts/check-change-impact-coverage.mjs"),
    read("docs/plans/business-rule-closure-1.75-plan.md"),
    read("releases/1.75.0/release-record.md"),
    read("releases/1.75.1/release-record.md"),
    read("releases/1.75.2/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Business Rule Closure",
    "READY_FOR_IMPACT_COVERAGE",
    "NEEDS_USER_CONFIRMATION",
    "NEEDS_DOMAIN_OWNER",
    "business_rule_digest",
    "closure_digest",
    "business_rule_ref",
    "business_rule_digest",
    "business_rule_state",
    "source_request_digest",
    "safe defaults",
    "limited user questions",
    "Real-Environment Validation",
    "This closure writes target files: No",
    "This closure authorizes implementation: No",
    "This closure approves release or production: No",
    "contract, tax, finance, HR, legal",
    "generic task-communication layer",
    "require-business-rule-ready",
    "now require Change Impact Coverage machine-readable evidence",
    "generated-project smoke now write a Business Rule",
  ]) {
    if (combined.includes(marker)) pass(`1.75 business rule closure includes ${marker}`);
    else fail(`1.75 business rule closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-business-rule-closure.mjs", "examples/mvp-booking-web-app", "--intent", "appointment requests must include a service time"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Business Rule Closure")
    && resolver.stdout.includes("READY_FOR_IMPACT_COVERAGE")
    && resolver.stdout.includes("User Confirmation Card")
    && resolver.stdout.includes("No user confirmation is required")
    && resolver.stdout.includes("This closure writes target files: No")) {
    pass("1.75 business rule closure resolver prints safe appointment rule closure");
  } else {
    fail(`1.75 business rule closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-business-rule-closure.mjs", "examples/mvp-booking-web-app", "--intent", "appointment requests must include a service time", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "BUSINESS_RULE_CLOSURE"
        && parsed.structuredEvidence?.artifact_type === "business_rule_closure"
        && parsed.structuredEvidence?.business_rule_digest
        && parsed.structuredEvidence?.closure_digest
        && parsed.structuredEvidence?.can_codex_write_now === "No"
        && parsed.boundaries?.writesTargetFiles === "No") {
        pass("1.75 business rule closure resolver JSON includes structured non-authorizing evidence");
      } else {
        fail(`1.75 business rule closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.75 business rule closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.75 business rule closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const emptyBusinessRuleRoot = fs.mkdtempSync(path.join(os.tmpdir(), "business-rule-empty-"));
  const check = runNode(["scripts/check-business-rule-closure.mjs", emptyBusinessRuleRoot, "--allow-empty"]);
  if (check.status === 0 && check.stdout.includes("Business Rule Closure check passed")) {
    pass("1.75 business rule closure checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.75 business rule closure checker failed: ${check.stderr || check.stdout}`);
  }

  const strictExample = runNode([
    "scripts/check-business-rule-closure.mjs",
    "examples/1.75-business-rule-closure/appointment-service-time",
    "--require-structured-evidence",
  ]);
  if (strictExample.status === 0
    && strictExample.stdout.includes("has valid structured evidence")
    && strictExample.stdout.includes("Business Rule Closure check passed")) {
    pass("1.75 business rule closure strict example passes checker");
  } else {
    fail(`1.75 business rule closure strict example failed: ${strictExample.stderr || strictExample.stdout}`);
  }

  const impactWithBusinessRule = runNode([
    "scripts/resolve-change-impact-coverage.mjs",
    "examples/1.75-business-rule-closure/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md",
    "--json",
  ]);
  if (impactWithBusinessRule.status === 0) {
    try {
      const parsed = JSON.parse(impactWithBusinessRule.stdout);
      if (parsed.businessRuleRef === "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md"
        && parsed.businessRuleDigest === "sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee"
        && parsed.businessRuleState === "READY_FOR_IMPACT_COVERAGE"
        && parsed.machineReadableEvidence?.business_rule_ref === "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md"
        && parsed.machineReadableEvidence?.business_rule_digest === "sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee"
        && parsed.machineReadableEvidence?.business_rule_state === "READY_FOR_IMPACT_COVERAGE") {
        pass("1.75 business rule ref, digest, and state carry into change impact coverage");
      } else {
        fail(`1.75 business rule binding missing from change impact coverage: ${impactWithBusinessRule.stdout}`);
      }
    } catch (error) {
      fail(`1.75 business-rule-linked impact coverage JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.75 business-rule-linked impact coverage failed: ${impactWithBusinessRule.stderr || impactWithBusinessRule.stdout}`);
  }

  const bindingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-business-rule-binding-"));
  fs.mkdirSync(path.join(bindingRoot, "business-rule-closures"), { recursive: true });
  fs.mkdirSync(path.join(bindingRoot, "change-impact-coverage-reports"), { recursive: true });
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.75-business-rule-closure/appointment-service-time/business-rule-closures/001-appointment-requests-must-include-a-service-time.md"),
    path.join(bindingRoot, "business-rule-closures/001-appointment-requests-must-include-a-service-time.md"),
  );
  const generatedImpact = runNode([
    "scripts/resolve-change-impact-coverage.mjs",
    bindingRoot,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md",
  ]);
  if (generatedImpact.status !== 0) {
    fail(`1.75 business-rule-linked impact coverage report generation failed: ${generatedImpact.stderr || generatedImpact.stdout}`);
  } else {
    fs.writeFileSync(path.join(bindingRoot, "change-impact-coverage-reports/001-appointment-service-time.md"), generatedImpact.stdout);
    const strictImpact = runNode([
      "scripts/check-change-impact-coverage.mjs",
      bindingRoot,
      "--report",
      "change-impact-coverage-reports/001-appointment-service-time.md",
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-business-rule-ready",
    ]);
    if (strictImpact.status !== 0
      && `${strictImpact.stderr}\n${strictImpact.stdout}`.includes("requires exact Business Universe bindings")) {
      pass("1.108 current Change Impact refuses a historical Business Rule that lacks exact Business Universe routing evidence");
    } else {
      fail(`1.108 current Change Impact must fail closed on a historical Business Rule without exact Business Universe routing evidence: ${strictImpact.stderr || strictImpact.stdout}`);
    }
  }

  const badFixtures = [
    "test-fixtures/bad/bad-business-rule-authorizes-implementation",
    "test-fixtures/bad/bad-business-rule-codex-approves-tax-decision",
    "test-fixtures/bad/bad-business-rule-cross-platform-single-surface",
    "test-fixtures/bad/bad-business-rule-effective-time-missing",
    "test-fixtures/bad/bad-business-rule-exception-policy-ambiguous",
    "test-fixtures/bad/bad-business-rule-existing-rule-conflict-ready",
    "test-fixtures/bad/bad-business-rule-historical-data-auto-change",
    "test-fixtures/bad/bad-business-rule-markdown-json-mismatch",
    "test-fixtures/bad/bad-business-rule-missing-actor",
    "test-fixtures/bad/bad-business-rule-missing-digest",
    "test-fixtures/bad/bad-business-rule-production-verified-without-evidence",
    "test-fixtures/bad/bad-business-rule-ready-with-blocking-decision",
    "test-fixtures/bad/bad-business-rule-ready-with-domain-owner-pending",
    "test-fixtures/bad/bad-business-rule-safe-default-treated-as-approval",
    "test-fixtures/bad/bad-business-rule-tax-field-claims-tax-compliance",
    "test-fixtures/bad/bad-business-rule-too-many-user-questions",
  ];
  for (const target of badFixtures) {
    const result = runNode(["scripts/check-business-rule-closure.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) {
      pass(`1.75 business rule closure rejects ${target}`);
    } else {
      fail(`1.75 business rule closure must reject ${target}`);
    }
  }
}
function checkChangeImpactCoverageProtocol() {
  const required = [
    "core/change-impact-coverage.md",
    "docs/change-impact-coverage.md",
    "docs/plans/change-impact-coverage-1.48-plan.md",
    "docs/plans/structured-impact-coverage-1.49-plan.md",
    "docs/plans/evidence-reference-resolution-1.50-plan.md",
    "docs/plans/closeout-evidence-precision-1.51-plan.md",
    "templates/change-impact-coverage-report.md",
    "checklists/change-impact-coverage-review.md",
    "prompts/change-impact-coverage-agent.md",
    "schemas/artifacts/change-impact-coverage.schema.json",
    "change-impact-coverage-reports/.gitkeep",
    "scripts/resolve-change-impact-coverage.mjs",
    "scripts/check-change-impact-coverage.mjs",
    "examples/1.48-change-impact-coverage/contract-input-rule/README.md",
    "examples/1.48-change-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/README.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/user-flow-contract-title-required.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/frontend-contract-form-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/api-contract-title-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/backend-contract-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/error-copy-title-required.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/test-contract-input-rule.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/docs-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/execution-closures/001-contract-input-rule.md",
    "examples/1.50-evidence-reference-resolution/README.md",
    "test-fixtures/bad/bad-change-impact-backend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-frontend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-api-without-tests/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-high-risk-na/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-approves-implementation/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-missing-structured-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-placeholder-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-closure-not-started/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-missing-evidence-ref/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-weak-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-weak-evidence/evidence/weak.txt",
    "test-fixtures/bad/bad-change-impact-unresolved-artifact-ref/change-impact-coverage-reports/001-bad.md",
    "releases/1.48.0/release-record.md",
    "releases/1.48.0/known-limitations.md",
    "releases/1.48.0/self-check-report.md",
    "releases/1.49.0/release-record.md",
    "releases/1.49.0/known-limitations.md",
    "releases/1.49.0/self-check-report.md",
    "releases/1.50.0/release-record.md",
    "releases/1.50.0/known-limitations.md",
    "releases/1.50.0/self-check-report.md",
    "releases/1.51.0/release-record.md",
    "releases/1.51.0/known-limitations.md",
    "releases/1.51.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.49 change impact coverage asset exists ${file}`);
    else fail(`1.49 change impact coverage asset missing ${file}`);
  }

  const combined = [
    read("core/change-impact-coverage.md"),
    read("docs/change-impact-coverage.md"),
    read("templates/change-impact-coverage-report.md"),
    read("checklists/change-impact-coverage-review.md"),
    read("scripts/resolve-change-impact-coverage.mjs"),
    read("scripts/check-change-impact-coverage.mjs"),
    read("docs/plans/change-impact-coverage-1.48-plan.md"),
    read("docs/plans/structured-impact-coverage-1.49-plan.md"),
    read("docs/plans/evidence-reference-resolution-1.50-plan.md"),
    read("docs/plans/closeout-evidence-precision-1.51-plan.md"),
    read("releases/1.48.0/release-record.md"),
    read("releases/1.49.0/release-record.md"),
    read("releases/1.50.0/release-record.md"),
    read("releases/1.51.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Change Impact Coverage",
    "prevents partial implementation",
    "Machine-Readable Evidence",
    "require-structured-evidence",
    "strict-evidence",
    "resolve-evidence-refs",
    "require-precise-evidence",
    "--report",
    "from-git-diff",
    "closure mode",
    "USER_FLOW",
    "FRONTEND_UI",
    "API_CONTRACT",
    "BACKEND_RULE",
    "DATA_MODEL",
    "ERROR_COPY",
    "TEST_COVERAGE",
    "DOCS_HANDOFF",
    "PERMISSION_RISK",
    "RELEASE_IMPACT",
    "This report authorizes implementation: No",
    "This report approves release or production: No",
    "backend-only",
    "frontend-only",
  ]) {
    if (combined.includes(marker)) pass(`1.49 change impact coverage includes ${marker}`);
    else fail(`1.49 change impact coverage missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-change-impact-coverage.mjs", "examples/mvp-booking-web-app", "--intent", "add contract input restriction"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Change Impact Coverage Report")
    && resolver.stdout.includes("FRONTEND_UI")
    && resolver.stdout.includes("BACKEND_RULE")
    && resolver.stdout.includes("This report writes target files: No")) {
    pass("1.49 change impact coverage resolver prints safe cross-surface report");
  } else {
    fail(`1.49 change impact coverage resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-change-impact-coverage.mjs", "examples/mvp-booking-web-app", "--intent", "add contract input restriction", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "CHANGE_IMPACT_COVERAGE_REPORT"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.machineReadableEvidence?.artifact_type === "change_impact_coverage"
        && parsed.affectedSurfaceMap?.some((item) => item.surface === "FRONTEND_UI")
        && parsed.affectedSurfaceMap?.some((item) => item.surface === "BACKEND_RULE")) {
        pass("1.49 change impact coverage resolver JSON includes boundaries, structured evidence, and cross-surface map");
      } else {
        fail(`1.49 change impact coverage resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.49 change impact coverage resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.49 change impact coverage resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-change-impact-coverage.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.49 change impact coverage checker passes source repo");
  } else {
    fail(`1.49 change impact coverage checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-change-impact-coverage.mjs", "examples/1.48-change-impact-coverage/contract-input-rule"]);
  if (example.status === 0 && example.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.48 legacy change impact coverage example passes checker");
  } else {
    fail(`1.48 change impact coverage example failed: ${example.stderr || example.stdout}`);
  }

  const strictExample = runNode([
    "scripts/check-change-impact-coverage.mjs",
    "examples/1.49-structured-impact-coverage/contract-input-rule",
    "--require-structured-evidence",
    "--mode",
    "closure",
    "--strict-evidence",
    "--resolve-evidence-refs",
    "--require-precise-evidence",
    "--report",
    "change-impact-coverage-reports/001-contract-input-rule.md",
  ]);
  if (strictExample.status === 0
    && strictExample.stdout.includes("has valid structured evidence")
    && strictExample.stdout.includes("precise evidence refs pass")
    && strictExample.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.51 structured change impact coverage example passes strict precision checker");
  } else {
    fail(`1.49 structured change impact coverage example failed: ${strictExample.stderr || strictExample.stdout}`);
  }

  for (const [name, target, expected, extraArgs] of [
    ["backend-only rule", "test-fixtures/bad/bad-change-impact-backend-only", "backend rule change must close FRONTEND_UI", []],
    ["frontend-only rule", "test-fixtures/bad/bad-change-impact-frontend-only", "frontend rule change must close BACKEND_RULE", []],
    ["API without tests", "test-fixtures/bad/bad-change-impact-api-without-tests", "API contract change needs DONE test coverage evidence", []],
    ["high-risk not applicable", "test-fixtures/bad/bad-change-impact-high-risk-na", "high-risk surface PERMISSION_RISK cannot be NOT_APPLICABLE", []],
    ["approval overclaim", "test-fixtures/bad/bad-change-impact-approves-implementation", "forbidden change impact claim", []],
    ["missing structured evidence", "test-fixtures/bad/bad-change-impact-missing-structured-evidence", "Machine-Readable Evidence is required", ["--require-structured-evidence", "--mode", "closure"]],
    ["placeholder evidence", "test-fixtures/bad/bad-change-impact-placeholder-evidence", "uses placeholder evidence", ["--strict-evidence", "--mode", "closure"]],
    ["closure not started", "test-fixtures/bad/bad-change-impact-closure-not-started", "closure mode cannot leave required surface FRONTEND_UI NOT_STARTED", ["--mode", "closure"]],
    ["missing evidence ref", "test-fixtures/bad/bad-change-impact-missing-evidence-ref", "evidence ref is not resolvable", ["--mode", "closure", "--resolve-evidence-refs"]],
    ["weak precise evidence", "test-fixtures/bad/bad-change-impact-weak-evidence", "resolved evidence file is empty or too short", ["--mode", "closure", "--resolve-evidence-refs", "--require-precise-evidence"]],
    ["unresolved artifact ref", "test-fixtures/bad/bad-change-impact-unresolved-artifact-ref", "artifact record was not found", ["--mode", "closure", "--resolve-evidence-refs", "--require-precise-evidence"]],
  ]) {
    const result = runNode(["scripts/check-change-impact-coverage.mjs", target, ...extraArgs]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.49 change impact coverage rejects ${name}`);
    } else {
      fail(`1.49 change impact coverage must reject ${name}: ${output}`);
    }
  }
}
function checkVerificationPlanGovernanceProtocol() {
  const required = [
    "core/verification-test-governance.md",
    "docs/verification-test-governance.md",
    "docs/plans/verification-test-governance-1.76-plan.md",
    "templates/verification-plan.md",
    "checklists/verification-plan-review.md",
    "prompts/verification-plan-agent.md",
    "schemas/artifacts/verification-plan.schema.json",
    "verification-plans/.gitkeep",
    "scripts/resolve-verification-plan.mjs",
    "scripts/check-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time/business-rule-closures/001-service-time.md",
    "examples/1.76-verification-plan/appointment-service-time/change-impact-coverage-reports/001-service-time.md",
    "examples/1.76-verification-plan/appointment-service-time/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-impact-bound-to-different-business-rule/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-impact-missing-business-rule-binding/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-source-systems-digest-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-source-systems-ref-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-source-digest-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-identity-digest-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-surface-status-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-obligation-missing/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-outcome-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-obligation/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-source-system/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-surface/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-not-applicable/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-test-control-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-test-control-missing/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-ready-with-unresolved-source-system/verification-plans/001-service-time.md",
    "releases/1.76.0/release-record.md",
    "releases/1.76.0/known-limitations.md",
    "releases/1.76.0/self-check-report.md",
    "releases/1.76.1/release-record.md",
    "releases/1.76.1/known-limitations.md",
    "releases/1.76.1/self-check-report.md",
    "releases/1.76.2/release-record.md",
    "releases/1.76.2/known-limitations.md",
    "releases/1.76.2/self-check-report.md",
    "releases/1.76.3/release-record.md",
    "releases/1.76.3/known-limitations.md",
    "releases/1.76.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.76 verification plan asset exists ${file}`);
    else fail(`1.76 verification plan asset missing ${file}`);
  }

  const combined = [
    read("core/verification-test-governance.md"),
    read("docs/verification-test-governance.md"),
    read("docs/plans/verification-test-governance-1.76-plan.md"),
    read("templates/verification-plan.md"),
    read("checklists/verification-plan-review.md"),
    read("prompts/verification-plan-agent.md"),
    read("schemas/artifacts/verification-plan.schema.json"),
    read("scripts/resolve-verification-plan.mjs"),
    read("scripts/check-verification-plan.mjs"),
    read("scripts/resolve-change-impact-coverage.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.76.0/release-record.md") ? read("releases/1.76.0/release-record.md") : "",
    exists("releases/1.76.1/release-record.md") ? read("releases/1.76.1/release-record.md") : "",
    exists("releases/1.76.2/release-record.md") ? read("releases/1.76.2/release-record.md") : "",
    exists("releases/1.76.3/release-record.md") ? read("releases/1.76.3/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Verification Plan Governance",
    "Verification And Test Governance",
    "verification_plan_digest",
    "verification_plan_ref",
    "source_systems",
    "intent_digest",
    "Test Correctness",
    "broad-command",
    "API_NEGATIVE_TEST",
    "BACKEND_RULE_TEST",
    "does not execute tests",
    "does not approve release or production",
    "verification-plan",
    "verification-plan-check",
    "--out",
    "impact report business_rule_ref matches Verification Plan",
    "checkSourceSystemsConsistency",
    "matches top-level binding",
    "checkMarkdownJsonConsistency",
    "Markdown Verification Obligations missing",
    "Markdown outcome matches structured verification_state",
    "READY source_systems",
    "Markdown Test Correctness Controls",
    "has extra row",
  ]) {
    if (combined.includes(marker)) pass(`1.76 verification plan includes ${marker}`);
    else fail(`1.76 verification plan missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--impact-ref",
    "artifact:change-impact-coverage-reports/001-service-time.md",
    "--project-level",
    "BL1",
    "--platform",
    "web,backend",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("Verification Plan")
    && resolver.stdout.includes("VERIFICATION_PLAN_READY")
    && resolver.stdout.includes("This plan executes tests: No")) {
    pass("1.76 verification plan resolver prints safe plan");
  } else {
    fail(`1.76 verification plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode([
    "scripts/resolve-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--impact-ref",
    "artifact:change-impact-coverage-reports/001-service-time.md",
    "--project-level",
    "BL1",
    "--platform",
    "web,backend",
    "--json",
  ]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "VERIFICATION_PLAN"
        && parsed.structuredEvidence?.artifact_type === "verification_plan"
        && parsed.structuredEvidence?.verification_plan_digest
        && parsed.structuredEvidence?.source_systems?.some((item) => item.name === "business_rule_closure")
        && parsed.structuredEvidence?.source_systems?.some((item) => item.name === "change_impact_coverage")
        && parsed.structuredEvidence?.verification_obligations?.some((item) => item.verification_type === "API_NEGATIVE_TEST")
        && parsed.boundaries?.executes_tests === "No") {
        pass("1.76 verification plan resolver JSON includes source-bound obligations");
      } else {
        fail(`1.76 verification plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.76 verification plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.76 verification plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const emptyVerificationPlanRoot = fs.mkdtempSync(path.join(os.tmpdir(), "verification-plan-empty-"));
  const sourceCheck = runNode(["scripts/check-verification-plan.mjs", emptyVerificationPlanRoot, "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Verification Plan check passed")) {
    pass("1.76 verification plan checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.76 verification plan source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const exampleCheck = runNode([
    "scripts/check-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time",
    "--report",
    "verification-plans/001-service-time.md",
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
  ]);
  if (exampleCheck.status === 0
    && exampleCheck.stdout.includes("Verification Plan check passed")
    && exampleCheck.stdout.includes("verification_plan_ref points to this report")
    && exampleCheck.stdout.includes("business_rule_digest matches referenced Business Rule Closure")
    && exampleCheck.stdout.includes("impact_digest matches referenced Change Impact Coverage")
    && exampleCheck.stdout.includes("API_CONTRACT includes API_NEGATIVE_TEST")) {
    pass("1.76 verification plan strict example passes checker");
  } else {
    fail(`1.76 verification plan strict example failed: ${exampleCheck.stderr || exampleCheck.stdout}`);
  }

  const cliResolver = runNode([
    "scripts/cli.mjs",
    "verification-plan",
    "examples/1.76-verification-plan/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--impact-ref",
    "artifact:change-impact-coverage-reports/001-service-time.md",
  ]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Verification Plan")) {
    pass("CLI verification-plan delegates to resolver");
  } else {
    fail(`CLI verification-plan failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliCheck = runNode([
    "scripts/cli.mjs",
    "verification-plan-check",
    "examples/1.76-verification-plan/appointment-service-time",
    "--report",
    "verification-plans/001-service-time.md",
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
  ]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("Verification Plan check passed")) {
    pass("CLI verification-plan-check delegates to checker");
  } else {
    fail(`CLI verification-plan-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-verification-plan-"));
  fs.mkdirSync(path.join(tempRoot, "business-rule-closures"), { recursive: true });
  fs.mkdirSync(path.join(tempRoot, "change-impact-coverage-reports"), { recursive: true });
  fs.mkdirSync(path.join(tempRoot, "verification-plans"), { recursive: true });
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time/business-rule-closures/001-service-time.md"),
    path.join(tempRoot, "business-rule-closures/001-service-time.md"),
  );
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time/change-impact-coverage-reports/001-service-time.md"),
    path.join(tempRoot, "change-impact-coverage-reports/001-service-time.md"),
  );
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time/verification-plans/001-service-time.md"),
    path.join(tempRoot, "verification-plans/001-service-time.md"),
  );

  const badCases = [
    {
      name: "missing API negative test",
      expected: "API_CONTRACT requires API_NEGATIVE_TEST",
      mutate(evidence) {
        evidence.verification_obligations = evidence.verification_obligations.filter((item) => item.verification_type !== "API_NEGATIVE_TEST");
      },
    },
    {
      name: "broad command as required business proof",
      expected: "cannot be broad-command-only",
      mutate(evidence) {
        const target = evidence.verification_obligations.find((item) => item.verification_type === "BACKEND_RULE_TEST");
        target.broad_command_only = "Yes";
        target.suggested_command = "npm test";
      },
    },
    {
      name: "task ref mismatch",
      expected: "must match Business Rule Closure task_ref",
      mutate(evidence) {
        evidence.task_ref = "tasks/001-other-task.md";
      },
    },
    {
      name: "manual verification without owner",
      expected: "needs owner",
      mutate(evidence) {
        evidence.manual_verification = [{
          id: "manual:bad",
          owner: "",
          decision_ref: "human-decision:missing-owner",
          expected_manual_evidence: "Owner evidence is required.",
          blocking: "Yes",
        }];
      },
    },
  ];

  for (const badCase of badCases) {
    const badRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-bad-verification-plan-"));
    fs.cpSync(tempRoot, badRoot, { recursive: true });
    const reportFile = path.join(badRoot, "verification-plans/001-service-time.md");
    mutateVerificationPlan(reportFile, badCase.mutate);
    const result = runNode([
      "scripts/check-verification-plan.mjs",
      badRoot,
      "--report",
      "verification-plans/001-service-time.md",
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-impact-ref",
      "--strict-source-binding",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(badCase.expected)) {
      pass(`1.76 verification plan rejects ${badCase.name}`);
    } else {
      fail(`1.76 verification plan must reject ${badCase.name}: ${output}`);
    }
  }

  const badFixtureCases = [
    {
      target: "test-fixtures/bad/bad-verification-plan-impact-bound-to-different-business-rule",
      expected: "impact report business_rule_ref",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-impact-missing-business-rule-binding",
      expected: "impact report business_rule_ref",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-source-systems-digest-mismatch",
      expected: "source_systems business_rule_closure.digest",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-source-systems-ref-mismatch",
      expected: "source_systems change_impact_coverage.ref",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-source-digest-mismatch",
      expected: "Markdown source business_rule_closure digest",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-identity-digest-mismatch",
      expected: "Markdown identity verification_plan_digest",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-surface-status-mismatch",
      expected: "Markdown affected surface DATA_MODEL status",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-obligation-missing",
      expected: "Markdown Verification Obligations missing",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-outcome-mismatch",
      expected: "Markdown outcome",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-obligation",
      expected: "Markdown Verification Obligations has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-source-system",
      expected: "Markdown Source Systems has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-surface",
      expected: "Markdown Affected Surface Inputs has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-not-applicable",
      expected: "Markdown Not Applicable Obligations has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-test-control-mismatch",
      expected: "Markdown test correctness control",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-test-control-missing",
      expected: "Markdown Test Correctness Controls missing",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-ready-with-unresolved-source-system",
      expected: "READY source_systems business_rule_closure.status must be RECORDED",
    },
  ];
  for (const badCase of badFixtureCases) {
    const result = runNode([
      "scripts/check-verification-plan.mjs",
      badCase.target,
      "--report",
      "verification-plans/001-service-time.md",
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-impact-ref",
      "--strict-source-binding",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(badCase.expected)) {
      pass(`1.76 verification plan rejects ${badCase.target}`);
    } else {
      fail(`1.76 verification plan must reject ${badCase.target}: ${output}`);
    }
  }
}
function checkTestEvidenceBindingProtocol() {
  const required = [
    "core/test-evidence-binding.md",
    "docs/test-evidence-binding.md",
    "docs/plans/test-evidence-binding-1.77-plan.md",
    "docs/plans/test-evidence-identity-hardening-1.77.1-plan.md",
    "docs/plans/test-evidence-installation-schema-contract-1.77.2-plan.md",
    "templates/test-evidence-report.md",
    "checklists/test-evidence-review.md",
    "prompts/test-evidence-agent.md",
    "schemas/artifacts/test-evidence.schema.json",
    "test-evidence-reports/.gitkeep",
    "scripts/resolve-test-evidence.mjs",
    "scripts/check-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/README.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/README.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/business-rule-closures/001-service-time.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/change-impact-coverage-reports/001-service-time.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/verification-plans/001-service-time.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/api-contract-negative.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/api-contract.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/backend-rule.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/error-copy.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/frontend-ui.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/handoff.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/test-coverage.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/user-flow-regression.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/user-flow.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/test-evidence-reports/001-service-time.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/tests/appointment-service-time.test.mjs",
    "test-fixtures/bad/bad-test-evidence-missing-verification-plan-ref/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-verification-plan-digest-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-missing-required-obligation/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-covered-with-failed-evidence/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-covered-with-skipped-evidence/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-stale-ran-before-change/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-current-task-no/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-output-digest-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-broad-command-only/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-manual-owner-ai/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-waiver-missing-human-decision/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-markdown-result-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-markdown-extra-coverage-row/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-source-system-digest-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-passed-unresolved-nonartifact-ref/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-passed-missing-ref/test-evidence-reports/001-service-time.md",
    "releases/1.77.0/release-record.md",
    "releases/1.77.0/known-limitations.md",
    "releases/1.77.0/self-check-report.md",
    "releases/1.77.1/release-record.md",
    "releases/1.77.1/known-limitations.md",
    "releases/1.77.1/self-check-report.md",
    "releases/1.77.2/release-record.md",
    "releases/1.77.2/known-limitations.md",
    "releases/1.77.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.77 test evidence asset exists ${file}`);
    else fail(`1.77 test evidence asset missing ${file}`);
  }

  const observedExample = runNode([
    "--test",
    "examples/1.77-test-evidence-binding/appointment-service-time/tests/appointment-service-time.test.mjs",
  ]);
  if (observedExample.status === 0 && /(?:#|ℹ) pass 9\b/.test(observedExample.stdout)) {
    pass("1.77 distributed example executes all nine task-specific verification obligations");
  } else {
    fail(`1.77 distributed example verification failed: ${observedExample.stderr || observedExample.stdout}`);
  }

  const combined = [
    read("core/test-evidence-binding.md"),
    read("docs/test-evidence-binding.md"),
    read("docs/plans/test-evidence-binding-1.77-plan.md"),
    read("docs/plans/test-evidence-identity-hardening-1.77.1-plan.md"),
    read("docs/plans/test-evidence-installation-schema-contract-1.77.2-plan.md"),
    read("templates/test-evidence-report.md"),
    read("checklists/test-evidence-review.md"),
    read("prompts/test-evidence-agent.md"),
    read("schemas/artifacts/test-evidence.schema.json"),
    read("scripts/resolve-test-evidence.mjs"),
    read("scripts/check-test-evidence.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.77.0/release-record.md") ? read("releases/1.77.0/release-record.md") : "",
    exists("releases/1.77.2/release-record.md") ? read("releases/1.77.2/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Test Evidence Binding",
    "Test Evidence Report",
    "test_evidence_digest",
    "test_evidence_ref",
    "verification_plan_ref",
    "verification_plan_digest",
    "coverage_map",
    "covers_obligations",
    "PASSED",
    "FAILED",
    "SKIPPED_WITH_REASON",
    "FLAKY_REQUIRES_REVIEW",
    "WAIVED_BY_HUMAN_DECISION",
    "does not execute tests",
    "does not approve release or production",
    "test-evidence",
    "test-evidence-check",
    "schemaVersion",
    "1.77.1",
    "--out",
    "--require-current-evidence",
    "--require-test-quality-controls",
    "Markdown Evidence Items",
    "output_digest matches",
    "exit_code",
    "failure_reason",
    "required Verification Plan control",
    "passed evidence",
    "Markdown coverage",
    "Markdown quality control",
    "Markdown known gap",
    "Markdown manual verification",
    "Markdown existing project reason",
    "Generated-project PR smoke",
  ]) {
    if (combined.includes(marker)) pass(`1.77 test evidence includes ${marker}`);
    else fail(`1.77 test evidence missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--evidence",
    "artifact:evidence/user-flow.txt,artifact:evidence/user-flow-regression.txt,artifact:evidence/frontend-ui.txt,artifact:evidence/api-contract.txt,artifact:evidence/api-contract-negative.txt,artifact:evidence/backend-rule.txt,artifact:evidence/error-copy.txt,artifact:evidence/handoff.txt,artifact:evidence/test-coverage.txt",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("Test Evidence Report")
    && resolver.stdout.includes("TEST_EVIDENCE_COMPLETE")
    && resolver.stdout.includes("This report executes tests: No")) {
    pass("1.108 historical Verification Plan keeps bounded NOT_REQUIRED Runtime Trust semantics");
  } else {
    fail(`1.77 test evidence resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode([
    "scripts/resolve-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--evidence",
    "artifact:evidence/user-flow.txt,artifact:evidence/user-flow-regression.txt,artifact:evidence/frontend-ui.txt,artifact:evidence/api-contract.txt,artifact:evidence/api-contract-negative.txt,artifact:evidence/backend-rule.txt,artifact:evidence/error-copy.txt,artifact:evidence/handoff.txt,artifact:evidence/test-coverage.txt",
    "--json",
  ]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "TEST_EVIDENCE_REPORT"
        && parsed.schemaVersion === "1.110.0"
        && parsed.structuredEvidence?.artifact_type === "test_evidence"
        && parsed.structuredEvidence?.schema_version === "1.110.0"
        && parsed.structuredEvidence?.test_evidence_digest
        && parsed.structuredEvidence?.runtime_trust_binding?.requirement === "NOT_REQUIRED"
        && parsed.structuredEvidence?.runtime_trust_binding?.status === "NOT_REQUIRED"
        && parsed.structuredEvidence?.business_universe_binding?.required === "No"
        && parsed.structuredEvidence?.business_universe_binding?.routing_result === "NOT_REQUIRED_WITH_REASON"
        && parsed.structuredEvidence?.control_effectiveness_binding?.requirement === "NOT_REQUIRED"
        && parsed.structuredEvidence?.control_effectiveness_binding?.status === "NOT_REQUIRED"
        && parsed.structuredEvidence?.scenario_coverage_map?.length === 0
        && parsed.structuredEvidence?.evidence_items?.every((item) => item.exit_code === 0
          && new Set(["N/A", "not recorded"]).has(item.failure_reason))
        && parsed.structuredEvidence?.source_systems?.some((item) => item.name === "verification_plan")
        && parsed.structuredEvidence?.coverage_map?.every((item) => item.coverage_state === "COVERED")
        && parsed.boundaries?.executes_tests === "No") {
        pass("1.77 test evidence resolver JSON includes source-bound coverage");
      } else {
        fail(`1.77 test evidence resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.77 test evidence resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.77 test evidence resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const emptyTestEvidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "test-evidence-empty-"));
  const sourceCheck = runNode(["scripts/check-test-evidence.mjs", emptyTestEvidenceRoot, "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Test Evidence check passed")) {
    pass("1.77 test evidence checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.77 test evidence source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const exampleCheck = runNode([
    "scripts/check-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--report",
    "test-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
  ]);
  if (exampleCheck.status === 0
    && exampleCheck.stdout.includes("Test Evidence check passed")
    && exampleCheck.stdout.includes("test_evidence_ref points to this report")
    && exampleCheck.stdout.includes("verification_plan_digest matches referenced Verification Plan")
    && exampleCheck.stdout.includes("TEST_EVIDENCE_COMPLETE covers every required obligation")
    && exampleCheck.stdout.includes("output_digest matches")
    && exampleCheck.stdout.includes("Markdown coverage")
    && exampleCheck.stdout.includes("reason matches structured evidence")) {
    pass("1.77 test evidence strict example passes checker");
  } else {
    fail(`1.77 test evidence strict example failed: ${exampleCheck.stderr || exampleCheck.stdout}`);
  }

  const cliResolver = runNode([
    "scripts/cli.mjs",
    "test-evidence",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
  ]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Test Evidence Report")) {
    pass("CLI test-evidence delegates to resolver");
  } else {
    fail(`CLI test-evidence failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliCheck = runNode([
    "scripts/cli.mjs",
    "test-evidence-check",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--report",
    "test-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
  ]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("Test Evidence check passed")) {
    pass("CLI test-evidence-check delegates to checker");
  } else {
    fail(`CLI test-evidence-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const badFixtureCases = [
    ["bad-test-evidence-missing-verification-plan-ref", "verification_plan_ref is required"],
    ["bad-test-evidence-verification-plan-digest-mismatch", "verification_plan_digest"],
    ["bad-test-evidence-missing-required-obligation", "coverage_map missing required obligation"],
    ["bad-test-evidence-covered-with-failed-evidence", "cannot use FAILED"],
    ["bad-test-evidence-covered-with-skipped-evidence", "cannot use SKIPPED_WITH_REASON"],
    ["bad-test-evidence-stale-ran-before-change", "must run after change"],
    ["bad-test-evidence-current-task-no", "must match current task"],
    ["bad-test-evidence-output-digest-mismatch", "output_digest"],
    ["bad-test-evidence-broad-command-only", "cannot rely on broad command only"],
    ["bad-test-evidence-manual-owner-ai", "needs a real owner"],
    ["bad-test-evidence-waiver-missing-human-decision", "requires human-decision ref"],
    ["bad-test-evidence-markdown-result-mismatch", "Markdown evidence evidence:api-contract result"],
    ["bad-test-evidence-markdown-extra-coverage-row", "Markdown Coverage Map has extra row"],
    ["bad-test-evidence-source-system-digest-mismatch", "source_systems business_rule_closure.digest"],
    ["bad-test-evidence-passed-unresolved-nonartifact-ref", "passed evidence evidence:user-flow requires artifact ref"],
    ["bad-test-evidence-passed-missing-ref", "passed evidence evidence:user-flow requires artifact ref"],
  ];
  for (const [name, expected] of badFixtureCases) {
    const result = runNode([
      "scripts/check-test-evidence.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      "test-evidence-reports/001-service-time.md",
      "--require-structured-evidence",
      "--require-verification-plan-ref",
      "--strict-source-binding",
      "--require-current-evidence",
      "--require-test-quality-controls",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.77 test evidence rejects ${name}`);
    } else {
      fail(`1.77 test evidence must reject ${name}: ${output}`);
    }
  }
}
function checkCompletionEvidenceGateProtocol() {
  const required = [
    "core/completion-evidence-gate.md",
    "docs/completion-evidence-gate.md",
    "docs/plans/completion-evidence-gate-1.78-plan.md",
    "templates/completion-evidence-report.md",
    "checklists/completion-evidence-review.md",
    "prompts/completion-evidence-agent.md",
    "schemas/artifacts/completion-evidence.schema.json",
    "completion-evidence-reports/.gitkeep",
    "scripts/resolve-completion-evidence.mjs",
    "scripts/check-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/README.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/README.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/business-rule-closures/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/change-impact-coverage-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/verification-plans/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/test-evidence-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/execution-assurance-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/completion-evidence-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/tasks/001-appointment-requests-must-include-a-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/review-loop-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-missing-test-evidence/completion-evidence-reports/001-bad.md",
    "test-fixtures/bad/bad-completion-evidence-task-mismatch/completion-evidence-reports/001-bad.md",
    "test-fixtures/bad/bad-completion-evidence-execution-not-verified/completion-evidence-reports/001-bad.md",
    "test-fixtures/bad/bad-completion-evidence-vp-bound-to-different-brc/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-test-evidence-bound-to-different-plan/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-ea-missing-test-evidence-ref/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-source-digest-mismatch/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-source-schema-invalid/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-intent-digest-mismatch/completion-evidence-reports/001-service-time.md",
    "releases/1.78.0/release-record.md",
    "releases/1.78.0/known-limitations.md",
    "releases/1.78.0/self-check-report.md",
    "releases/1.78.1/release-record.md",
    "releases/1.78.1/known-limitations.md",
    "releases/1.78.1/self-check-report.md",
    "releases/1.78.2/release-record.md",
    "releases/1.78.2/known-limitations.md",
    "releases/1.78.2/self-check-report.md",
    "releases/1.78.3/release-record.md",
    "releases/1.78.3/known-limitations.md",
    "releases/1.78.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.78 completion evidence asset exists ${file}`);
    else fail(`1.78 completion evidence asset missing ${file}`);
  }

  const combined = [
    read("core/completion-evidence-gate.md"),
    read("docs/completion-evidence-gate.md"),
    read("docs/plans/completion-evidence-gate-1.78-plan.md"),
    read("templates/completion-evidence-report.md"),
    read("checklists/completion-evidence-review.md"),
    read("prompts/completion-evidence-agent.md"),
    read("schemas/artifacts/completion-evidence.schema.json"),
    read("scripts/resolve-completion-evidence.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.78.0/release-record.md") ? read("releases/1.78.0/release-record.md") : "",
    exists("releases/1.78.1/release-record.md") ? read("releases/1.78.1/release-record.md") : "",
    exists("releases/1.78.2/release-record.md") ? read("releases/1.78.2/release-record.md") : "",
    exists("releases/1.78.3/release-record.md") ? read("releases/1.78.3/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Completion Evidence Gate",
    "Completion Evidence Gate Report",
    "completion_evidence_gate",
    "completion_gate_digest",
    "can_claim_complete",
    "source_chain",
    "Business Rule Closure",
    "Verification Plan",
    "Test Evidence",
    "Execution Assurance",
    "COMPLETION_EVIDENCE_READY",
    "BLOCKED_BY_TEST_EVIDENCE",
    "BLOCKED_BY_EXECUTION_ASSURANCE",
    "BLOCKED_BY_TASK_MISMATCH",
    "check:source-digest-consistency",
    "check:intent-consistency",
    "check:source-chain-binding",
    "source_chain[].intent_digest",
    "canonical task intent",
    "1.78.0 / 1.78.1 Completion Evidence reports",
    "Execution Assurance reports now expose top-level",
    "top-level `intent_digest`",
    "Execution Assurance intent directly",
    "does not run tests",
    "does not approve release or production",
    "completion-evidence",
    "completion-evidence-check",
    "--require-ready",
    "No source chain, no completion claim",
  ]) {
    if (combined.includes(marker)) pass(`1.78 completion evidence includes ${marker}`);
    else fail(`1.78 completion evidence missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--test-evidence-ref",
    "artifact:test-evidence-reports/001-service-time.md",
    "--execution-assurance-ref",
    "artifact:execution-assurance-reports/001-service-time.md",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("Completion Evidence Gate Report")
    && resolver.stdout.includes("BLOCKED_BY_BUSINESS_UNIVERSE")
    && resolver.stdout.includes("This report runs tests: No")) {
    pass("1.108 current completion fails closed when historical sources lack exact Business Universe evidence");
  } else {
    fail(`1.78 completion evidence resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode([
    "scripts/resolve-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--test-evidence-ref",
    "artifact:test-evidence-reports/001-service-time.md",
    "--execution-assurance-ref",
    "artifact:execution-assurance-reports/001-service-time.md",
    "--json",
  ]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "COMPLETION_EVIDENCE_GATE"
        && parsed.schemaVersion === "1.113.0"
        && parsed.structuredEvidence?.artifact_type === "completion_evidence_gate"
        && parsed.structuredEvidence?.schema_version === "1.113.0"
        && parsed.structuredEvidence?.completion_state === "BLOCKED_BY_BUSINESS_UNIVERSE"
        && parsed.structuredEvidence?.can_claim_complete === "No"
        && parsed.structuredEvidence?.runtime_trust_binding?.requirement === "NOT_REQUIRED"
        && parsed.structuredEvidence?.runtime_trust_binding?.status === "NOT_REQUIRED"
        && parsed.structuredEvidence?.business_universe_binding?.coverage_mapping_status === "BLOCKED"
        && parsed.structuredEvidence?.control_effectiveness_binding?.requirement === "REQUIRED"
        && parsed.structuredEvidence?.control_effectiveness_binding?.status === "BLOCKED"
        && parsed.structuredEvidence?.source_chain?.length === 4
        && parsed.structuredEvidence?.source_chain?.every((item) => typeof item.intent_digest === "string" && item.intent_digest.startsWith("sha256:"))
        && parsed.structuredEvidence?.gate_checks?.some((item) => item.id === "check:business-universe" && item.status === "FAIL")
        && parsed.structuredEvidence?.boundary?.runs_tests === "No") {
        pass("1.108 completion evidence JSON includes Business-Universe-blocked historical source chain");
      } else {
        fail(`1.78 completion evidence resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.78 completion evidence resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.78 completion evidence resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const emptyCompletionEvidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "completion-evidence-empty-"));
  const sourceCheck = runNode(["scripts/check-completion-evidence.mjs", emptyCompletionEvidenceRoot, "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Completion Evidence Gate check passed")) {
    pass("1.78 completion evidence checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.78 completion evidence source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const exampleCheck = runNode([
    "scripts/check-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--report",
    "completion-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-source-refs",
  ]);
  if (exampleCheck.status === 0
    && exampleCheck.stdout.includes("Completion Evidence Gate check passed")
    && exampleCheck.stdout.includes("completion_evidence_ref points to this report")
    && exampleCheck.stdout.includes("historical ready evidence remains readable but is not current completion authority")
    && exampleCheck.stdout.includes("ready gate can claim complete")
    && exampleCheck.stdout.includes("source test_evidence outcome matches referenced evidence")
    && exampleCheck.stdout.includes("source execution_assurance outcome matches referenced evidence")) {
    pass("1.78 historical completion evidence remains readable without becoming current authority");
  } else {
    fail(`1.78 historical completion evidence compatibility check failed: ${exampleCheck.stderr || exampleCheck.stdout}`);
  }

  const cliResolver = runNode([
    "scripts/cli.mjs",
    "completion-evidence",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--test-evidence-ref",
    "artifact:test-evidence-reports/001-service-time.md",
    "--execution-assurance-ref",
    "artifact:execution-assurance-reports/001-service-time.md",
  ]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Completion Evidence Gate Report")) {
    pass("CLI completion-evidence delegates to resolver");
  } else {
    fail(`CLI completion-evidence failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliCheck = runNode([
    "scripts/cli.mjs",
    "completion-evidence-check",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--report",
    "completion-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-source-refs",
  ]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("Completion Evidence Gate check passed")) {
    pass("CLI completion-evidence-check delegates to checker");
  } else {
    fail(`CLI completion-evidence-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const badFixtureCases = [
    ["bad-completion-evidence-missing-test-evidence", "ready gate requires a valid recorded source decision for test_evidence", "completion-evidence-reports/001-bad.md"],
    ["bad-completion-evidence-task-mismatch", "source chain task refs must be consistent", "completion-evidence-reports/001-bad.md"],
    ["bad-completion-evidence-execution-not-verified", "ready gate requires a valid recorded source decision for execution_assurance", "completion-evidence-reports/001-bad.md"],
    ["bad-completion-evidence-vp-bound-to-different-brc", "Verification Plan business_rule_ref", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-test-evidence-bound-to-different-plan", "Test Evidence verification_plan_ref", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-ea-missing-test-evidence-ref", "Execution Assurance must bind referenced Test Evidence", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-source-digest-mismatch", "source test_evidence digest", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-source-schema-invalid", "source business_rule_closure.artifact_type", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-intent-digest-mismatch", "source verification_plan intent_digest", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-ea-intent-digest-mismatch", "source execution_assurance intent_digest", "completion-evidence-reports/001-service-time.md"],
  ];
  for (const [name, expected, report] of badFixtureCases) {
    const result = runNode([
      "scripts/check-completion-evidence.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      report,
      "--require-structured-evidence",
      "--require-ready",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.78 completion evidence rejects ${name}`);
    } else {
      fail(`1.78 completion evidence must reject ${name}: ${output}`);
    }
  }

  const completionPackage = JSON.parse(read("package.json"));
  const completionVerifySurface = Object.entries(completionPackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-completion-evidence.mjs",
    "node --check scripts/check-completion-evidence.mjs",
    "node scripts/cli.mjs completion-evidence . --intent \"verify task completion\"",
    "node scripts/cli.mjs completion-evidence-check . --allow-empty",
    "node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs",
  ]) {
    if (completionVerifySurface.includes(marker)) pass(`1.78 package verify includes ${marker}`);
    else fail(`1.78 package verify missing ${marker}`);
  }
}
function checkReleaseEvidenceGateProtocol() {
  const required = [
    "core/release-evidence-gate.md",
    "docs/release-evidence-gate.md",
    "docs/plans/release-evidence-gate-1.80-plan.md",
    "docs/plans/release-owner-completion-set-binding-1.80.3-plan.md",
    "templates/release-evidence-gate-report.md",
    "checklists/release-evidence-gate-review.md",
    "prompts/release-evidence-gate-agent.md",
    "schemas/artifacts/release-evidence-gate.schema.json",
    "release-evidence-gate-reports/.gitkeep",
    "release-candidates/.gitkeep",
    "scripts/resolve-release-evidence-gate.mjs",
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/README.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/release-evidence-gate-reports/001-web-preview.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/completion-evidence-reports/001-web-preview-completion.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/completion-evidence-reports/002-web-preview-completion.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/business-rule-closures/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/verification-plans/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/test-evidence-reports/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/execution-assurance-reports/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/evidence/preview-build.txt",
    "examples/1.80-release-evidence-gate/web-preview-handoff/evidence/runtime-smoke.txt",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff/release-evidence-gate-reports/001-mini-program-review.md",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff/completion-evidence-reports/001-mini-program-completion.md",
    "examples/1.80-release-evidence-gate/admin-production-review-blocked/release-evidence-gate-reports/001-admin-production-blocked.md",
    "test-fixtures/bad/bad-release-evidence-release-approved-claim/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-no-release-owner/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-missing-rollback-production/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-user-note-treated-as-smoke/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-source-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-runtime-smoke-unresolved/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-build-artifact-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-runtime-smoke-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-markdown-json-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-completion-evidence-strict-check-fails/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-second-completion-unchecked/release-evidence-gate-reports/001-web-preview.md",
    "test-fixtures/bad/bad-release-evidence-completion-task-not-in-release-scope/release-evidence-gate-reports/001-web-preview.md",
    "test-fixtures/bad/bad-release-evidence-production-without-risk-owner-ref/release-evidence-gate-reports/001-mini-program-review.md",
    "test-fixtures/bad/bad-release-evidence-approval-ref-implies-release-approved/release-evidence-gate-reports/001-web-preview.md",
    "releases/1.80.0/release-record.md",
    "releases/1.80.0/known-limitations.md",
    "releases/1.80.0/self-check-report.md",
    "releases/1.80.1/release-record.md",
    "releases/1.80.1/known-limitations.md",
    "releases/1.80.1/self-check-report.md",
    "releases/1.80.2/release-record.md",
    "releases/1.80.2/known-limitations.md",
    "releases/1.80.2/self-check-report.md",
    "releases/1.80.3/release-record.md",
    "releases/1.80.3/known-limitations.md",
    "releases/1.80.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.80 release evidence gate asset exists ${file}`);
    else fail(`1.80 release evidence gate asset missing ${file}`);
  }

  const combined = [
    read("README.md"),
    read("README.zh-CN.md"),
    read("docs/README.md"),
    read("docs/index.md"),
    read("core/release-evidence-gate.md"),
    read("docs/release-evidence-gate.md"),
    read("docs/plans/release-evidence-gate-1.80-plan.md"),
    read("docs/plans/release-owner-completion-set-binding-1.80.3-plan.md"),
    read("templates/release-evidence-gate-report.md"),
    read("checklists/release-evidence-gate-review.md"),
    read("prompts/release-evidence-gate-agent.md"),
    read("schemas/artifacts/release-evidence-gate.schema.json"),
    read("scripts/resolve-release-evidence-gate.mjs"),
    read("scripts/check-release-evidence-gate.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.80.1/release-record.md") ? read("releases/1.80.1/release-record.md") : "",
  ].join("\n");
  for (const marker of [
    "Release Evidence Gate",
    "release_evidence_gate",
    "release-evidence",
    "release-evidence-check",
    "Completion Evidence strict checker",
    "source_chain",
    "build_artifact_digest",
    "runtime_smoke_digest",
    "rollback_digest",
    "monitoring_digest",
    "completion_evidence_set",
    "owner_readiness",
    "Completion Evidence Set",
    "Release Owner Ref",
    "Risk Owner Ref",
    "Environment Owner Ref",
    "Markdown/JSON",
    "runtime_smoke_ref",
    "human release owner",
    "not release approval",
    "does not deploy",
    "does not submit app-store or mini-program review",
    "User Delivery Console is not a source authority",
  ]) {
    if (combined.includes(marker)) pass(`1.80 release evidence includes ${marker}`);
    else fail(`1.80 release evidence missing ${marker}`);
  }

  const web = runNode([
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/web-preview-handoff",
    "--require-structured-evidence",
    "--compatibility-only",
  ]);
  if (web.status === 0
    && web.stdout.includes("Completion Evidence set count matches release scope")
    && web.stdout.includes("historical ready release evidence remains readable but is not current release authority")) {
    pass("1.80 historical web preview release evidence remains readable without current authority");
  } else {
    fail(`1.80 historical web preview compatibility check failed: ${web.stderr || web.stdout}`);
  }

  const mini = runNode([
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff",
    "--require-structured-evidence",
    "--compatibility-only",
    "--require-platform-recipe",
  ]);
  if (mini.status === 0
    && mini.stdout.includes("required source release_handoff_pack digest matches resolved artifact")
    && mini.stdout.includes("required source platform_release_recipe digest matches resolved artifact")
    && mini.stdout.includes("production-like target has rollback evidence")
    && mini.stdout.includes("production-like target has concrete risk owner ref")
    && mini.stdout.includes("production-like target has concrete environment owner ref")) {
    pass("1.80 release evidence mini-program handoff example passes checker");
  } else {
    fail(`1.80 release evidence mini-program example failed: ${mini.stderr || mini.stdout}`);
  }

  const blocked = runNode([
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/admin-production-review-blocked",
    "--require-structured-evidence",
  ]);
  if (blocked.status === 0 && blocked.stdout.includes("blocked production-like report records missing rollback")) {
    pass("1.80 release evidence blocked production example stays non-ready");
  } else {
    fail(`1.80 release evidence blocked production example failed: ${blocked.stderr || blocked.stdout}`);
  }

  const badFixtureCases = [
    ["bad-release-evidence-release-approved-claim", "release-evidence-gate-reports/001-bad.md", "contains forbidden release evidence claim", []],
    ["bad-release-evidence-no-release-owner", "release-evidence-gate-reports/001-bad.md", "release-evidence-gate-reports/001-bad.md.intent is required", []],
    ["bad-release-evidence-missing-rollback-production", "release-evidence-gate-reports/001-bad.md", "required evidence rollback must record artifact ref", []],
    ["bad-release-evidence-user-note-treated-as-smoke", "release-evidence-gate-reports/001-bad.md", "release-evidence-gate-reports/001-bad.md.runtime_readiness.runtime_smoke_ref is required", []],
    ["bad-release-evidence-source-digest-mismatch", "release-evidence-gate-reports/001-bad.md", "source completion_evidence digest", ["--strict-source-binding"]],
    ["bad-release-evidence-runtime-smoke-unresolved", "release-evidence-gate-reports/001-bad.md", "required evidence runtime-smoke does not resolve", ["--strict-source-binding"]],
    ["bad-release-evidence-build-artifact-digest-mismatch", "release-evidence-gate-reports/001-bad.md", "required evidence build-or-preview-evidence digest", ["--strict-source-binding"]],
    ["bad-release-evidence-runtime-smoke-digest-mismatch", "release-evidence-gate-reports/001-bad.md", "required evidence runtime-smoke digest", ["--strict-source-binding"]],
    ["bad-release-evidence-markdown-json-mismatch", "release-evidence-gate-reports/001-bad.md", "Release Scope Build Artifact", ["--strict-source-binding"]],
    ["bad-release-evidence-completion-evidence-strict-check-fails", "release-evidence-gate-reports/001-bad.md", "Completion Evidence set artifact:completion-evidence-reports/001-web-preview-completion.md strict checker failed", ["--require-current-completion", "--strict-source-binding"]],
    ["bad-release-evidence-second-completion-unchecked", "release-evidence-gate-reports/001-web-preview.md", "Completion Evidence set must record strict check PASS", ["--strict-source-binding"]],
    ["bad-release-evidence-completion-task-not-in-release-scope", "release-evidence-gate-reports/001-web-preview.md", "Completion Evidence task must be included in release scope", ["--strict-source-binding"]],
    ["bad-release-evidence-production-without-risk-owner-ref", "release-evidence-gate-reports/001-mini-program-review.md", "production-like target requires concrete risk owner ref", ["--require-platform-recipe"]],
    ["bad-release-evidence-approval-ref-implies-release-approved", "release-evidence-gate-reports/001-web-preview.md", "release approval ref must be out_of_scope, pending, or human-decision:* without approving release", []],
  ];
  for (const [name, report, expected, extra] of badFixtureCases) {
    const result = runNode([
      "scripts/check-release-evidence-gate.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      report,
      "--require-structured-evidence",
      ...extra,
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.80 release evidence rejects ${name}`);
    } else {
      fail(`1.80 release evidence must reject ${name}: ${output}`);
    }
  }

  const releasePackage = JSON.parse(read("package.json"));
  const releaseVerifySurface = Object.entries(releasePackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-release-evidence-gate.mjs",
    "node --check scripts/check-release-evidence-gate.mjs",
    "node scripts/cli.mjs release-evidence . --intent \"prepare release review\"",
    "node scripts/cli.mjs release-evidence-check . --allow-empty",
    "node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --compatibility-only",
  ]) {
    if (releaseVerifySurface.includes(marker)) pass(`1.80 package verify includes ${marker}`);
    else fail(`1.80 package verify missing ${marker}`);
  }
}
function checkReleaseChannelDecouplingProtocol() {
  const required = [
    "core/release-channel-decoupling.md",
    "docs/release-channel-decoupling.md",
    "docs/plans/release-channel-decoupling-1.87-plan.md",
    "templates/release-channel-policy-report.md",
    "checklists/release-channel-policy-review.md",
    "prompts/release-channel-policy-agent.md",
    "schemas/artifacts/release-channel-policy.schema.json",
    "release-channel-policies/.gitkeep",
    "scripts/resolve-release-channel-policy.mjs",
    "scripts/check-release-channel-policy.mjs",
    "examples/1.87-release-channel-decoupling/README.md",
    "examples/1.87-release-channel-decoupling/new-project-source-only/release-channel-policies/001-source-only.md",
    "examples/1.87-release-channel-decoupling/existing-provider-release-sop/release-channel-policies/001-provider-sop.md",
    "examples/1.87-release-channel-decoupling/github-release-assets-review-needed/release-channel-policies/001-github-release-assets.md",
    "examples/1.87-release-channel-decoupling/actions-artifact-package-blocked/release-channel-policies/001-actions-artifact-blocked.md",
    "examples/1.87-release-channel-decoupling/tag-source-identity-only/release-channel-policies/001-tag-identity-only.md",
    "examples/1.87-release-channel-decoupling/strict-source-binding/docs/release-sop.md",
    "examples/1.87-release-channel-decoupling/strict-source-binding/release-channel-policies/001-strict-source-binding.md",
    "test-fixtures/bad/bad-release-channel-github-release-auto-approved/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-actions-artifact-long-lived/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-tag-push-production/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-missing-cost-owner/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-deletes-evidence/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-technical-user-burden/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-source-release-confusion/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-notes-only-release-workflow/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-github-source-only-conflict/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-provider-owner-missing/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-package-identity-unknown/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-source-digest-mismatch/docs/release-sop.md",
    "test-fixtures/bad/bad-release-channel-source-digest-mismatch/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-required-source-missing/release-channel-policies/001-bad.md",
    "releases/1.87.0/release-record.md",
    "releases/1.87.0/known-limitations.md",
    "releases/1.87.0/self-check-report.md",
    "releases/1.87.1/release-record.md",
    "releases/1.87.1/known-limitations.md",
    "releases/1.87.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.87 release channel asset exists ${file}`);
    else fail(`1.87 release channel asset missing ${file}`);
  }

  const combined = [
    read("README.md"),
    read("README.zh-CN.md"),
    read("VERSION.md"),
    read("core/release-channel-decoupling.md"),
    read("docs/release-channel-decoupling.md"),
    read("docs/plans/release-channel-decoupling-1.87-plan.md"),
    read("templates/release-channel-policy-report.md"),
    read("checklists/release-channel-policy-review.md"),
    read("prompts/release-channel-policy-agent.md"),
    read("schemas/artifacts/release-channel-policy.schema.json"),
    read("scripts/resolve-release-channel-policy.mjs"),
    read("scripts/check-release-channel-policy.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.87.0/release-record.md") ? read("releases/1.87.0/release-record.md") : "",
    exists("releases/1.87.1/release-record.md") ? read("releases/1.87.1/release-record.md") : "",
  ].join("\n");
  for (const marker of [
    "Release Channel Decoupling",
    "release_channel_policy",
    "release-channel",
    "release-channel-check",
    "source identity",
    "GitHub source and evidence",
    "GitHub Release Policy",
    "GitHub Actions Policy",
    "GitHub Release assets",
    "Actions artifacts",
    "tag-triggered release workflow",
    "release package identity",
    "cost owner",
    "retention policy",
    "strict-source-binding",
    "source_digest",
    "release_owner_required_for_policy",
    "does not approve release",
    "does not execute release",
    "does not upload GitHub Release assets",
    "does not run GitHub-hosted release workflows",
    "does not delete artifacts",
  ]) {
    if (combined.includes(marker)) pass(`1.87 release channel includes ${marker}`);
    else fail(`1.87 release channel missing ${marker}`);
  }

  const examples = [
    ["new-project-source-only", "release-channel-policies/001-source-only.md", []],
    ["existing-provider-release-sop", "release-channel-policies/001-provider-sop.md", []],
    ["github-release-assets-review-needed", "release-channel-policies/001-github-release-assets.md", []],
    ["actions-artifact-package-blocked", "release-channel-policies/001-actions-artifact-blocked.md", []],
    ["tag-source-identity-only", "release-channel-policies/001-tag-identity-only.md", []],
    ["strict-source-binding", "release-channel-policies/001-strict-source-binding.md", ["--strict-source-binding"]],
  ];
  for (const [name, report, extra] of examples) {
    const result = runNode([
      "scripts/check-release-channel-policy.mjs",
      `examples/1.87-release-channel-decoupling/${name}`,
      "--report",
      report,
      "--require-structured-evidence",
      ...extra,
    ]);
    if (result.status === 0 && result.stdout.includes("has valid structured evidence")) {
      pass(`1.87 release channel example ${name} passes checker`);
    } else {
      fail(`1.87 release channel example ${name} failed: ${result.stderr || result.stdout}`);
    }
  }

  const badFixtureCases = [
    ["bad-release-channel-github-release-auto-approved", "GitHub Release assets require release owner policy"],
    ["bad-release-channel-actions-artifact-long-lived", "Actions artifact release package requires retention policy"],
    ["bad-release-channel-missing-cost-owner", "cost-risk channel must have cost owner or block release review"],
    ["bad-release-channel-deletes-evidence", "release evidence must not be deleted to reduce bundle"],
    ["bad-release-channel-technical-user-burden", "plain summary must not ask user to choose technical release channel primitives"],
    ["bad-release-channel-source-release-confusion", "cannot claim GitHub source/evidence-only while release assets are uploaded"],
    ["bad-release-channel-notes-only-release-workflow", "notes-only GitHub Release with on: release workflow requires release owner review"],
    ["bad-release-channel-github-source-only-conflict", "cannot claim GitHub source/evidence-only while release assets are uploaded"],
    ["bad-release-channel-provider-owner-missing", "provider_direct_deploy requires release owner or blocked state"],
    ["bad-release-channel-package-identity-unknown", "release package channel requires package identity before ready state", []],
    ["bad-release-channel-source-digest-mismatch", "source project_sop digest mismatch", ["--strict-source-binding"]],
    ["bad-release-channel-required-source-missing", "strict source binding requires project_sop with resolved ref", ["--strict-source-binding"]],
  ];
  const boundedTagTrigger = runNode([
    "scripts/check-release-channel-policy.mjs",
    "test-fixtures/bad/bad-release-channel-tag-push-production",
    "--report",
    "release-channel-policies/001-bad.md",
    "--require-structured-evidence",
  ]);
  if (boundedTagTrigger.status === 0
    && boundedTagTrigger.stdout.includes("tag-triggered release remains blocked until a release confirmer exists")) {
    pass("1.87 legacy tag-trigger fixture is accepted only as a non-authorizing blocked policy");
  } else {
    fail(`1.87 legacy tag-trigger fixture must remain non-authorizing and blocked: ${boundedTagTrigger.stderr || boundedTagTrigger.stdout}`);
  }
  for (const [name, expected, extra = []] of badFixtureCases) {
    const result = runNode([
      "scripts/check-release-channel-policy.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      "release-channel-policies/001-bad.md",
      "--require-structured-evidence",
      ...extra,
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.87 release channel rejects ${name}`);
    } else {
      fail(`1.87 release channel must reject ${name}: ${output}`);
    }
  }

  const releaseChannelPackage = JSON.parse(read("package.json"));
  const releaseChannelVerifySurface = Object.entries(releaseChannelPackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-release-channel-policy.mjs",
    "node --check scripts/check-release-channel-policy.mjs",
    "node scripts/cli.mjs release-channel . --intent \"decide release channel policy\"",
    "node scripts/cli.mjs release-channel-check . --allow-empty",
    "node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/new-project-source-only --require-structured-evidence",
    "node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/strict-source-binding --require-structured-evidence --strict-source-binding",
  ]) {
    if (releaseChannelVerifySurface.includes(marker)) pass(`1.87 package verify includes ${marker}`);
    else fail(`1.87 package verify missing ${marker}`);
  }
}
function checkPlanReviewGateProtocol() {
  const required = [
    "core/plan-review-gate.md",
    "docs/plan-review-gate.md",
    "docs/plans/plan-review-gate-1.88-plan.md",
    "docs/plans/plan-review-gate-hardening-1.88.1-plan.md",
    "docs/plans/plan-review-consumer-integration-1.88.2-plan.md",
    "docs/plans/plan-review-binding-hardening-1.88.3-plan.md",
    "templates/plan-review-report.md",
    "checklists/plan-review-gate-review.md",
    "prompts/plan-review-gate-agent.md",
    "schemas/artifacts/plan-review.schema.json",
    "plan-review-reports/.gitkeep",
    "scripts/resolve-plan-review.mjs",
    "scripts/check-plan-review.mjs",
    "scripts/lib/plan-review-binding.mjs",
    "examples/1.88-plan-review-gate/README.md",
    "examples/1.88-plan-review-gate/low-docs-plan-skip/plan-review-reports/001-low-skip.md",
    "examples/1.88-plan-review-gate/medium-ui-plan-reviewed/docs/example-plan.md",
    "examples/1.88-plan-review-gate/medium-ui-plan-reviewed/plan-review-reports/001-medium-ui.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-revision/docs/example-plan.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-revision/plan-review-reports/001-revision.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-passed/docs/example-plan.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-passed/plan-review-reports/001-passed.md",
    "examples/1.88-plan-review-gate/high-business-rule-plan-stale/docs/example-plan.md",
    "examples/1.88-plan-review-gate/high-business-rule-plan-stale/plan-review-reports/001-stale.md",
    "examples/1.88-plan-review-consumer-integration/README.md",
    "examples/1.88-plan-review-consumer-integration/high-execution-assurance/execution-assurance-reports/001-plan-reviewed.md",
    "examples/1.88-plan-review-consumer-integration/completion-evidence-plan-reviewed/completion-evidence-reports/001-service-time.md",
    "examples/1.88-plan-review-consumer-integration/apply-readiness-plan-reviewed/apply-readiness-reports/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-plan-review-high-without-task-governance/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-high-without-review-surface-analysis/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-missing-review-surface-matrix/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-required-surface-not-reviewed/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-authorizes-implementation/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-passed-without-prerequisite-satisfied/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-passed-claims-full-authority/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-unresolved-p1-passed/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-unstructured-p2-acceptance/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-codex-accepted-p2/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-output-treated-as-authority/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-writer-used-for-review/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-left-running/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-missing-source-chain/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-source-chain-digest-mismatch/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-source-chain-contradiction/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-fake-test-command/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-claims-test-executed/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-stale-plan-digest/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-rewrites-original-plan/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-repeated-failure-not-blocked/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-technical-user-burden/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-derived-surface-pass/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-missing-source-verification/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-fallback-pass/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-execution-assurance-missing-plan-review-binding/execution-assurance-reports/001-plan-reviewed.md",
    "test-fixtures/bad/bad-completion-evidence-missing-plan-review-binding/completion-evidence-reports/001-possible-high-blocked.md",
    "test-fixtures/bad/bad-controlled-apply-plan-review-not-passed/apply-readiness-reports/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-execution-assurance-plan-review-digest-drift/execution-assurance-reports/001-plan-reviewed.md",
    "test-fixtures/bad/bad-controlled-apply-plan-review-other-plan/apply-readiness-reports/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-completion-evidence-plan-review-for-other-task/completion-evidence-reports/001-service-time.md",
    "releases/1.88.0/release-record.md",
    "releases/1.88.0/known-limitations.md",
    "releases/1.88.0/self-check-report.md",
    "releases/1.88.1/release-record.md",
    "releases/1.88.1/known-limitations.md",
    "releases/1.88.1/self-check-report.md",
    "releases/1.88.2/release-record.md",
    "releases/1.88.2/known-limitations.md",
    "releases/1.88.2/self-check-report.md",
    "releases/1.88.3/release-record.md",
    "releases/1.88.3/known-limitations.md",
    "releases/1.88.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.88 plan review asset exists ${file}`);
    else fail(`1.88 plan review asset missing ${file}`);
  }

  const combined = [
    read("README.md"),
    read("README.zh-CN.md"),
    read("VERSION.md"),
    read("core/plan-review-gate.md"),
    read("docs/plan-review-gate.md"),
    read("docs/plans/plan-review-gate-1.88-plan.md"),
    read("docs/plans/plan-review-gate-hardening-1.88.1-plan.md"),
    read("docs/plans/plan-review-consumer-integration-1.88.2-plan.md"),
    read("docs/plans/plan-review-binding-hardening-1.88.3-plan.md"),
    read("templates/plan-review-report.md"),
    read("templates/execution-assurance-report.md"),
    read("templates/completion-evidence-report.md"),
    read("templates/controlled-apply-readiness-report.md"),
    read("checklists/plan-review-gate-review.md"),
    read("prompts/plan-review-gate-agent.md"),
    read("schemas/artifacts/plan-review.schema.json"),
    read("schemas/artifacts/execution-assurance.schema.json"),
    read("schemas/artifacts/completion-evidence.schema.json"),
    read("schemas/artifacts/controlled-apply-readiness.schema.json"),
    read("scripts/resolve-plan-review.mjs"),
    read("scripts/check-plan-review.mjs"),
    read("scripts/lib/plan-review-binding.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/check-controlled-apply-readiness.mjs"),
    read("scripts/cli.mjs"),
    read("releases/1.88.0/release-record.md"),
    read("releases/1.88.1/release-record.md"),
    read("releases/1.88.2/release-record.md"),
    read("releases/1.88.3/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Plan Review Gate",
    "plan_review",
    "plan-review",
    "plan-review-check",
    "PLAN_REVIEW_PASSED",
    "NO_PLAN_REQUIRED",
    "PLAN_REVISION_REQUIRED",
    "Task Governance remains the source of truth",
    "Review Surface Governance remains the source of truth",
    "derived review surface matrix cannot satisfy high-impact PLAN_REVIEW_PASSED",
    "Review Surface authority",
    "pre-implementation plan-review prerequisite",
    "does not authorize implementation",
    "does not execute tests",
    "commands_executed_by_this_report",
    "subagent_output_is_authority",
    "PLAN_REVIEW_PASSED cannot use fallback as substitute",
    "rewrites_original_plan",
    "plan_review_binding",
    "--require-plan-review",
    "Plan Review Consumer Integration",
    "Plan Review Binding Hardening",
    "referenced Plan Review schema and digest are valid",
    "must match plan_review_binding.plan_ref",
    "required plan review must be PLAN_REVIEW_PASSED",
  ]) {
    if (combined.includes(marker)) pass(`1.88 plan review includes ${marker}`);
    else fail(`1.88 plan review missing ${marker}`);
  }

  const examples = [
    "low-docs-plan-skip",
    "medium-ui-plan-reviewed",
    "high-permission-delete-plan-revision",
    "high-permission-delete-plan-passed",
    "high-business-rule-plan-stale",
  ];
  for (const name of examples) {
    const result = runNode([
      "scripts/check-plan-review.mjs",
      `examples/1.88-plan-review-gate/${name}`,
      "--require-structured-evidence",
    ]);
    if (result.status === 0 && result.stdout.includes("Plan review check passed")) {
      pass(`1.88 plan review example ${name} passes checker`);
    } else {
      fail(`1.88 plan review example ${name} failed: ${result.stderr || result.stdout}`);
    }
  }

  const consumerExamples = [
    ["execution assurance consumer", ["scripts/check-execution-assurance.mjs", "examples/1.88-plan-review-consumer-integration/high-execution-assurance", "--require-structured-evidence", "--require-plan-review", "--require-actual-diff", "--require-precise-evidence", "--historical-audit"], "Execution assurance check passed"],
    ["historical completion evidence plan-review consumer", ["scripts/check-completion-evidence.mjs", "examples/1.88-plan-review-consumer-integration/completion-evidence-plan-reviewed", "--report", "completion-evidence-reports/001-service-time.md", "--require-structured-evidence", "--require-source-refs", "--require-plan-review", "--historical-audit"], "historical ready evidence remains readable but is not current completion authority"],
    ["controlled apply readiness consumer", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.88-plan-review-consumer-integration/apply-readiness-plan-reviewed", "--require-structured-evidence", "--require-plan-review", "--historical-audit"], "Controlled Apply Readiness check passed"],
  ];
  for (const [name, command, expected] of consumerExamples) {
    const result = runNode(command);
    if (result.status === 0 && result.stdout.includes(expected)) {
      pass(`1.88.2 plan review ${name} passes strict consumer checker`);
    } else {
      fail(`1.88.2 plan review ${name} failed: ${result.stderr || result.stdout}`);
    }
  }

  const badFixtureCases = [
    ["bad-plan-review-high-without-task-governance", "high-impact review requires Task Governance ref"],
    ["bad-plan-review-high-without-review-surface-analysis", "high-impact review requires review surface analysis"],
    ["bad-plan-review-missing-review-surface-matrix", "high-impact review requires review surface matrix"],
    ["bad-plan-review-required-surface-not-reviewed", "required surface not reviewed"],
    ["bad-plan-review-authorizes-implementation", "implementation_authorized_by_this_report must be No"],
    ["bad-plan-review-passed-without-prerequisite-satisfied", "PLAN_REVIEW_PASSED requires pre_implementation_review_prerequisite_satisfied Yes"],
    ["bad-plan-review-passed-claims-full-authority", "PLAN_REVIEW_PASSED must not claim full implementation authority"],
    ["bad-plan-review-unresolved-p1-passed", "PLAN_REVIEW_PASSED has unresolved P0/P1 findings"],
    ["bad-plan-review-unstructured-p2-acceptance", "acceptance is not structured owner acceptance"],
    ["bad-plan-review-codex-accepted-p2", "Codex cannot accept blocking P2"],
    ["bad-plan-review-subagent-output-treated-as-authority", "subagent output must not be authority"],
    ["bad-plan-review-subagent-writer-used-for-review", "must not use writer subagent"],
    ["bad-plan-review-subagent-left-running", "cannot leave recommended subagent review unknown"],
    ["bad-plan-review-missing-source-chain", "high-impact PLAN_REVIEW_PASSED requires source chain"],
    ["bad-plan-review-source-chain-digest-mismatch", "digest mismatch sentinel is blocked"],
    ["bad-plan-review-source-chain-contradiction", "contradicts plan"],
    ["bad-plan-review-fake-test-command", "PLAN_REVIEW_PASSED cannot contain fake or unstable verification command"],
    ["bad-plan-review-claims-test-executed", "plan review must not claim tests were executed"],
    ["bad-plan-review-stale-plan-digest", "plan_digest does not match plan file"],
    ["bad-plan-review-rewrites-original-plan", "review loop must not rewrite original plan"],
    ["bad-plan-review-repeated-failure-not-blocked", "repeated plan review failure must be blocked after max rounds"],
    ["bad-plan-review-technical-user-burden", "user-facing text exposes technical workflow burden"],
    ["bad-plan-review-derived-surface-pass", "derived review surface matrix cannot satisfy high-impact PLAN_REVIEW_PASSED"],
    ["bad-plan-review-missing-source-verification", "requires source_chain kind verification_plan"],
    ["bad-plan-review-subagent-fallback-pass", "cannot use fallback as substitute"],
  ];
  for (const [name, expected] of badFixtureCases) {
    const result = runNode([
      "scripts/check-plan-review.mjs",
      `test-fixtures/bad/${name}`,
      "--require-structured-evidence",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.88 plan review rejects ${name}`);
    } else {
      fail(`1.88 plan review must reject ${name}: ${output}`);
    }
  }

  const badConsumerCases = [
    ["bad-execution-assurance-missing-plan-review-binding", ["scripts/check-execution-assurance.mjs", "test-fixtures/bad/bad-execution-assurance-missing-plan-review-binding", "--require-structured-evidence", "--require-plan-review", "--require-actual-diff", "--require-precise-evidence"], "requires plan_review_binding"],
    ["bad-completion-evidence-missing-plan-review-binding", ["scripts/check-completion-evidence.mjs", "test-fixtures/bad/bad-completion-evidence-missing-plan-review-binding", "--report", "completion-evidence-reports/001-possible-high-blocked.md", "--require-structured-evidence", "--require-plan-review"], "requires plan_review_binding"],
    ["bad-controlled-apply-plan-review-not-passed", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-plan-review-not-passed", "--require-structured-evidence", "--require-plan-review"], "required plan review must be PLAN_REVIEW_PASSED"],
    ["bad-execution-assurance-plan-review-digest-drift", ["scripts/check-execution-assurance.mjs", "test-fixtures/bad/bad-execution-assurance-plan-review-digest-drift", "--require-structured-evidence", "--require-plan-review", "--require-actual-diff", "--require-precise-evidence"], "plan_review_digest does not match canonical evidence digest"],
    ["bad-controlled-apply-plan-review-other-plan", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-plan-review-other-plan", "--require-structured-evidence", "--require-plan-review"], "must match plan_review_binding.plan_ref"],
    ["bad-completion-evidence-plan-review-for-other-task", ["scripts/check-completion-evidence.mjs", "test-fixtures/bad/bad-completion-evidence-plan-review-for-other-task", "--report", "completion-evidence-reports/001-service-time.md", "--require-structured-evidence", "--require-source-refs", "--require-ready", "--require-plan-review"], "Completion Evidence plan_review_binding task_ref"],
  ];
  for (const [name, command, expected] of badConsumerCases) {
    const result = runNode(command);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.88.2 plan review consumer rejects ${name}`);
    } else {
      fail(`1.88.2 plan review consumer must reject ${name}: ${output}`);
    }
  }

  const planReviewPackage = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(planReviewPackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-plan-review.mjs",
    "node --check scripts/check-plan-review.mjs",
    "node --check scripts/lib/plan-review-binding.mjs",
    "node scripts/cli.mjs plan-review . --intent \"review implementation plan before coding\"",
    "node scripts/cli.mjs plan-review-check . --allow-empty",
    "node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/high-permission-delete-plan-passed --require-structured-evidence",
    "node scripts/check-execution-assurance.mjs examples/1.88-plan-review-consumer-integration/high-execution-assurance --require-structured-evidence --require-plan-review --require-actual-diff --require-precise-evidence --historical-audit",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.88 package verify includes ${marker}`);
    else fail(`1.88 package verify missing ${marker}`);
  }
}
function checkSafetyEvidenceHardeningProtocol() {
  const required = [
    "docs/plans/safety-evidence-hardening-1.89-plan.md",
    "scripts/lib/path-safety.mjs",
    "scripts/lib/approval-record-validation.mjs",
    "scripts/lib/adoption-apply-chain.mjs",
    "releases/1.89.0/release-record.md",
    "releases/1.89.0/known-limitations.md",
    "releases/1.89.0/self-check-report.md",
    "releases/1.89.1/release-record.md",
    "releases/1.89.1/known-limitations.md",
    "releases/1.89.1/self-check-report.md",
    "releases/1.89.2/release-record.md",
    "releases/1.89.2/known-limitations.md",
    "releases/1.89.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.89 safety/evidence hardening asset exists ${file}`);
    else fail(`1.89 safety/evidence hardening asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/safety-evidence-hardening-1.89-plan.md"),
    read("scripts/lib/path-safety.mjs"),
    read("scripts/lib/approval-record-validation.mjs"),
    read("scripts/lib/adoption-apply-chain.mjs"),
    read("scripts/init-project.mjs"),
    read("scripts/check-manifest.mjs"),
    read("scripts/new-workflow-item.mjs"),
    read("scripts/lib/artifact-schema.mjs"),
    read("scripts/check-adoption-assurance.mjs"),
    read("scripts/resolve-adoption-assurance.mjs"),
    read("scripts/resolve-work-queue-takeover.mjs"),
    read("scripts/check-plan-review.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/check-controlled-apply-readiness.mjs"),
    read("scripts/cli.mjs"),
    read("templates/release-handoff-pack.md"),
    read("releases/1.89.0/release-record.md"),
    read("releases/1.89.0/known-limitations.md"),
    read("releases/1.89.0/self-check-report.md"),
    read("releases/1.89.1/release-record.md"),
    read("releases/1.89.1/known-limitations.md"),
    read("releases/1.89.1/self-check-report.md"),
    read("releases/1.89.2/release-record.md"),
    read("releases/1.89.2/known-limitations.md"),
    read("releases/1.89.2/self-check-report.md"),
  ].join("\n");
  for (const marker of [
    "Path And Evidence Hardening",
    "assertSafeWritePath",
    "assertNoSymlinkInPath",
    "planDigest",
    "planDigest is missing or does not match current plan content",
    "safe relative path",
    "no Controlled Apply Readiness reports found while strict evidence",
    "no Plan Review reports found",
    "apply_chain",
    "VERIFIED_ACTIVE requires verified apply chain",
    "structured approval",
    "current conversation user or another specific human confirmer",
    "expires_at must be a parseable date/time",
    "approved_action_ids must exactly match approved_action_paths row IDs",
    "Adoption Assurance apply-chain helper rejects forged apply-plan digest",
    "Underlying command:",
  ]) {
    if (combined.includes(marker)) pass(`1.89 hardening includes ${marker}`);
    else fail(`1.89 hardening missing ${marker}`);
  }

  const syntax = runNode(["--check", "scripts/lib/path-safety.mjs"]);
  if (syntax.status === 0) {
    pass("path-safety helper syntax check");
  } else {
    fail(`path-safety helper syntax failed: ${syntax.stderr || syntax.stdout}`);
  }
  const approvalSyntax = runNode(["--check", "scripts/lib/approval-record-validation.mjs"]);
  if (approvalSyntax.status === 0) {
    pass("approval-record-validation helper syntax check");
  } else {
    fail(`approval-record-validation helper syntax failed: ${approvalSyntax.stderr || approvalSyntax.stdout}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1-89-"));
  try {
    const unsafeManifestPath = path.join(tempRoot, "unsafe-manifest.json");
    const manifest = JSON.parse(read("intentos-manifest.json"));
    manifest.copyRules.files.push({
      source: "README.md",
      target: "../escape.md",
    });
    fs.writeFileSync(unsafeManifestPath, JSON.stringify(manifest, null, 2));
    const unsafeManifest = runNode(["scripts/check-manifest.mjs", kitRoot, "--manifest", unsafeManifestPath]);
    const unsafeManifestOutput = `${unsafeManifest.stdout}\n${unsafeManifest.stderr}`;
    if (unsafeManifest.status !== 0 && unsafeManifestOutput.includes("safe relative path")) {
      pass("manifest rejects unsafe copy rule target path");
    } else {
      fail(`manifest must reject unsafe copy rule target path: ${unsafeManifestOutput}`);
    }

    const target = path.join(tempRoot, "target");
    const writePlanPath = path.join(target, "apply-execution-plans", "plan.json");
    fs.mkdirSync(target, { recursive: true });
    const writePlan = runNode([
      "scripts/init-project.mjs",
      "--target",
      target,
      "--goal",
      "create a project for apply-plan digest hardening verification",
      "--write-plan",
      path.relative(target, writePlanPath),
    ]);
    if (writePlan.status !== 0) {
      fail(`init-project write-plan failed during digest hardening smoke: ${writePlan.stderr || writePlan.stdout}`);
      return;
    }
    const plan = JSON.parse(fs.readFileSync(writePlanPath, "utf8"));
    plan.actions.push({ id: "tampered", type: "noop", description: "tamper after digest" });
    fs.writeFileSync(writePlanPath, JSON.stringify(plan, null, 2));
    const applyTampered = runNode(approvedInitProjectApplyArgs(writePlanPath));
    const applyTamperedOutput = `${applyTampered.stdout}\n${applyTampered.stderr}`;
    if (applyTampered.status !== 0 && applyTamperedOutput.includes("planDigest is missing or does not match")) {
      pass("init-project rejects tampered apply plan digest");
    } else {
      fail(`init-project must reject tampered apply plan digest: ${applyTamperedOutput}`);
    }

    for (const [name, mutate] of [
      ["non-human approval owner", (approval) => ({ ...approval, approved_by: "Codex" })],
      ["ambiguous approval owner", (approval) => ({ ...approval, approved_by: "human" })],
      ["unparseable approval expiry", (approval) => ({ ...approval, expires_at: "next week maybe" })],
      ["extra approval path row", (approval) => ({
        ...approval,
        approved_action_paths: [
          ...approval.approved_action_paths,
          { id: "A-999999", target_paths: ["docs/extra.md"] },
        ],
      })],
    ]) {
      const caseTarget = path.join(tempRoot, `approval-runtime-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`);
      const casePlanPath = path.join(caseTarget, "apply-execution-plans", `approval-runtime-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`);
      fs.mkdirSync(caseTarget, { recursive: true });
      const casePlan = runNode([
        "scripts/init-project.mjs",
        "--target",
        caseTarget,
        "--goal",
        `create a project for ${name} approval validation`,
        "--write-plan",
        path.relative(caseTarget, casePlanPath),
      ]);
      if (casePlan.status !== 0) {
        fail(`init-project write-plan failed during ${name} smoke: ${casePlan.stderr || casePlan.stdout}`);
        continue;
      }
      const caseApprovalPath = writeInitProjectApprovalRecord(casePlanPath, { mutate });
      const caseApply = runNode(["scripts/init-project.mjs", "--apply-plan", casePlanPath, "--approval-record", caseApprovalPath]);
      const caseApplyOutput = `${caseApply.stdout}\n${caseApply.stderr}`;
      const localAuthorityRejection = "Project-local init/update does not accept file-authored HUMAN_APPROVAL";
      if (caseApply.status !== 0 && caseApplyOutput.includes(localAuthorityRejection)) {
        pass(`init-project rejects file-authored ${name} before apply`);
      } else {
        fail(`init-project must reject file-authored ${name} before apply: ${caseApplyOutput}`);
      }
    }

    const forgedApplyChain = path.join(tempRoot, "forged-apply-chain");
    fs.mkdirSync(forgedApplyChain, { recursive: true });
    for (const dir of ["apply-plans", "approval-records", "apply-readiness-reports"]) {
      fs.cpSync(
        path.join(kitRoot, "examples", "1.41-structured-evidence-schema", dir),
        path.join(forgedApplyChain, dir),
        { recursive: true },
      );
    }
    for (const file of [
      "apply-plans/001-structured-workflow-assets.md",
      "approval-records/001-structured-workflow-assets.md",
      "apply-readiness-reports/001-structured-workflow-assets.md",
    ]) {
      rewriteMachineEvidence(path.join(forgedApplyChain, file), (evidence) => {
        const forgedDigest = "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        if (evidence.plan_digest) evidence.plan_digest = forgedDigest;
        if (evidence.approved_plan?.plan_digest) evidence.approved_plan.plan_digest = forgedDigest;
        if (evidence.apply_plan?.plan_digest) evidence.apply_plan.plan_digest = forgedDigest;
        return evidence;
      });
    }
    const forgedAdoption = runNode(["scripts/resolve-adoption-assurance.mjs", forgedApplyChain, "--json"]);
    const forgedOutput = `${forgedAdoption.stdout}\n${forgedAdoption.stderr}`;
    try {
      const parsed = JSON.parse(forgedAdoption.stdout);
      const applySurface = (parsed.surfaces || []).find((item) => item.surface === "apply_chain");
      if (forgedAdoption.status === 0 && applySurface?.status !== "VERIFIED" && parsed.humanSummary?.canClaimFullAdoption === "No") {
        pass("Adoption Assurance helper rejects forged apply plan digest before VERIFIED_ACTIVE");
      } else {
        fail(`Adoption Assurance helper must reject forged apply plan digest: ${forgedOutput}`);
      }
    } catch (error) {
      fail(`forged adoption assurance JSON invalid: ${error.message}: ${forgedOutput}`);
    }

    const symlinkTarget = path.join(tempRoot, "symlink-target");
    const symlinkEscape = path.join(tempRoot, "outside.txt");
    fs.mkdirSync(path.join(symlinkTarget, "scripts"), { recursive: true });
    fs.writeFileSync(symlinkEscape, "outside");
    fs.symlinkSync(symlinkEscape, path.join(symlinkTarget, "scripts", "check-ai-workflow.mjs"));
    const symlinkPlanPath = path.join(symlinkTarget, "apply-execution-plans", "symlink-update-plan.json");
    const symlinkPlan = runNode([
      "scripts/init-project.mjs",
      "--target",
      symlinkTarget,
      "--update-workflow-assets",
      "--goal",
      "adopt IntentOS while verifying symlink write boundaries",
      "--write-plan",
      path.relative(symlinkTarget, symlinkPlanPath),
    ]);
    const symlinkUpdate = symlinkPlan.status === 0
      ? runNode(approvedInitProjectApplyArgs(symlinkPlanPath))
      : symlinkPlan;
    const symlinkUpdateOutput = `${symlinkUpdate.stdout}\n${symlinkUpdate.stderr}`;
    if (symlinkUpdate.status !== 0 && symlinkUpdateOutput.includes("symlink")) {
      pass("init-project refuses workflow asset write through symlink path");
    } else {
      fail(`init-project must refuse workflow asset write through symlink path: ${symlinkUpdateOutput}`);
    }

    const strictNoReport = runNode([
      "scripts/check-plan-review.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictNoReportOutput = `${strictNoReport.stdout}\n${strictNoReport.stderr}`;
    if (strictNoReport.status !== 0 && strictNoReportOutput.includes("no Plan Review reports found")) {
      pass("strict plan review fails closed when reports are absent");
    } else {
      fail(`strict plan review must fail closed when reports are absent: ${strictNoReportOutput}`);
    }

    const strictImpactNoReport = runNode([
      "scripts/check-change-impact-coverage.mjs",
      tempRoot,
      "--require-structured-evidence",
      "--mode",
      "closure",
      "--strict-evidence",
    ]);
    const strictImpactNoReportOutput = `${strictImpactNoReport.stdout}\n${strictImpactNoReport.stderr}`;
    if (strictImpactNoReport.status !== 0 && strictImpactNoReportOutput.includes("no Change Impact Coverage reports found")) {
      pass("strict change impact coverage fails closed when reports are absent");
    } else {
      fail(`strict change impact coverage must fail closed when reports are absent: ${strictImpactNoReportOutput}`);
    }

    const strictApplyPlanNoReport = runNode([
      "scripts/check-apply-plan.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictApplyPlanNoReportOutput = `${strictApplyPlanNoReport.stdout}\n${strictApplyPlanNoReport.stderr}`;
    if (strictApplyPlanNoReport.status !== 0 && strictApplyPlanNoReportOutput.includes("no Unified Apply Plan reports found")) {
      pass("strict unified apply plan fails closed when reports are absent");
    } else {
      fail(`strict unified apply plan must fail closed when reports are absent: ${strictApplyPlanNoReportOutput}`);
    }

    const strictReleaseHandoffNoReport = runNode([
      "scripts/check-release-handoff-pack.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictReleaseHandoffNoReportOutput = `${strictReleaseHandoffNoReport.stdout}\n${strictReleaseHandoffNoReport.stderr}`;
    if (strictReleaseHandoffNoReport.status !== 0 && strictReleaseHandoffNoReportOutput.includes("no Release Handoff Pack reports found")) {
      pass("strict release handoff pack fails closed when reports are absent");
    } else {
      fail(`strict release handoff pack must fail closed when reports are absent: ${strictReleaseHandoffNoReportOutput}`);
    }

    const strictCompletionNoReport = runNode([
      "scripts/check-completion-evidence.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictCompletionNoReportOutput = `${strictCompletionNoReport.stdout}\n${strictCompletionNoReport.stderr}`;
    if (strictCompletionNoReport.status !== 0 && strictCompletionNoReportOutput.includes("no Completion Evidence Gate reports found")) {
      pass("strict completion evidence fails closed when reports are absent");
    } else {
      fail(`strict completion evidence must fail closed when reports are absent: ${strictCompletionNoReportOutput}`);
    }

    const strictApplyReadinessNoReport = runNode([
      "scripts/check-controlled-apply-readiness.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictApplyReadinessOutput = `${strictApplyReadinessNoReport.stdout}\n${strictApplyReadinessNoReport.stderr}`;
    if (strictApplyReadinessNoReport.status !== 0 && strictApplyReadinessOutput.includes("no Controlled Apply Readiness reports found")) {
      pass("strict controlled apply readiness fails closed when reports are absent");
    } else {
      fail(`strict controlled apply readiness must fail closed when reports are absent: ${strictApplyReadinessOutput}`);
    }

    const strictApprovalNoReport = runNode([
      "scripts/check-approval-record.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictApprovalOutput = `${strictApprovalNoReport.stdout}\n${strictApprovalNoReport.stderr}`;
    if (strictApprovalNoReport.status !== 0 && strictApprovalOutput.includes("no approval records found")) {
      pass("strict approval record check fails closed when reports are absent");
    } else {
      fail(`strict approval record check must fail closed when reports are absent: ${strictApprovalOutput}`);
    }

    const allowEmptyApproval = runNode([
      "scripts/check-approval-record.mjs",
      tempRoot,
      "--require-structured-evidence",
      "--allow-empty",
    ]);
    const allowEmptyApprovalOutput = `${allowEmptyApproval.stdout}\n${allowEmptyApproval.stderr}`;
    if (allowEmptyApproval.status !== 0 && allowEmptyApprovalOutput.includes("no approval records found")) {
      pass("strict approval evidence cannot be bypassed by --allow-empty");
    } else {
      fail(`strict approval evidence was bypassed by --allow-empty: ${allowEmptyApprovalOutput}`);
    }

    const schema = {
      type: "object",
      required: ["kind", "items"],
      additionalProperties: false,
      properties: {
        kind: { const: "demo" },
        items: {
          type: "array",
          minItems: 1,
          uniqueItems: true,
          contains: { const: "required" },
          items: { type: "string", minLength: 3 },
        },
      },
    };
    const goodSchema = validateSchema({ kind: "demo", items: ["required", "other"] }, schema);
    const badSchema = validateSchema({ kind: "wrong", items: ["x"] }, schema);
    if (goodSchema.ok && !badSchema.ok && badSchema.errors.some((error) => error.includes("must equal"))) {
      pass("artifact schema validator enforces const/minLength/contains/uniqueItems");
    } else {
      fail(`artifact schema validator must enforce stricter keywords: ${badSchema.errors.join("; ")}`);
    }

    const adoption = runNode([
      "scripts/check-adoption-assurance.mjs",
      "examples/1.71-adoption-execution-assurance/verified-existing-project",
      "--require-structured-evidence",
    ]);
    const adoptionOutput = `${adoption.stdout}\n${adoption.stderr}`;
    if (adoption.status === 0 && adoptionOutput.includes("Adoption Assurance check passed")) {
      pass("read-only adoption assurance example remains partial and valid");
    } else {
      fail(`read-only adoption assurance example should remain valid partial adoption: ${adoptionOutput}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}
function checkUserDeliveryConsoleProtocol() {
  const required = [
    "core/user-delivery-console.md",
    "docs/user-delivery-console.md",
    "docs/plans/user-delivery-console-1.79-plan.md",
    "docs/plans/user-delivery-console-evidence-validation-1.79.1-plan.md",
    "docs/plans/user-delivery-console-current-task-binding-1.79.2-plan.md",
    "docs/plans/user-delivery-console-verification-note-1.79.3-plan.md",
    "docs/plans/user-delivery-console-source-signal-calibration-1.79.4-plan.md",
    "templates/user-delivery-console-card.md",
    "checklists/user-delivery-console-review.md",
    "prompts/user-delivery-console-agent.md",
    "delivery-status-cards/.gitkeep",
    "scripts/resolve-user-delivery-console.mjs",
    "scripts/check-user-delivery-console.mjs",
    "examples/1.79-user-delivery-console/README.md",
    "examples/1.79-user-delivery-console/appointment-app/delivery-status-cards/001-status.md",
    "test-fixtures/bad/bad-user-delivery-console-internal-jargon/delivery-status-cards/001-bad.md",
    "test-fixtures/bad/bad-user-delivery-console-overclaim/delivery-status-cards/001-bad.md",
    "test-fixtures/bad/bad-user-delivery-console-too-many-decisions/delivery-status-cards/001-bad.md",
    "releases/1.79.0/release-record.md",
    "releases/1.79.0/known-limitations.md",
    "releases/1.79.0/self-check-report.md",
    "releases/1.79.1/release-record.md",
    "releases/1.79.1/known-limitations.md",
    "releases/1.79.1/self-check-report.md",
    "releases/1.79.2/release-record.md",
    "releases/1.79.2/known-limitations.md",
    "releases/1.79.2/self-check-report.md",
    "releases/1.79.3/release-record.md",
    "releases/1.79.3/known-limitations.md",
    "releases/1.79.3/self-check-report.md",
    "releases/1.79.4/release-record.md",
    "releases/1.79.4/known-limitations.md",
    "releases/1.79.4/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.79 user delivery console asset exists ${file}`);
    else fail(`1.79 user delivery console asset missing ${file}`);
  }

  const combined = [
    read("core/user-delivery-console.md"),
    read("docs/user-delivery-console.md"),
    read("docs/plans/user-delivery-console-1.79-plan.md"),
    read("docs/plans/user-delivery-console-evidence-validation-1.79.1-plan.md"),
    read("docs/plans/user-delivery-console-current-task-binding-1.79.2-plan.md"),
    read("docs/plans/user-delivery-console-verification-note-1.79.3-plan.md"),
    read("docs/plans/user-delivery-console-source-signal-calibration-1.79.4-plan.md"),
    read("templates/user-delivery-console-card.md"),
    read("checklists/user-delivery-console-review.md"),
    read("prompts/user-delivery-console-agent.md"),
    read("scripts/resolve-user-delivery-console.mjs"),
    read("scripts/check-user-delivery-console.mjs"),
    read("scripts/cli.mjs"),
    read(".github/workflows/intentos-pr-checks.yml"),
    read("releases/1.79.0/release-record.md"),
    read("releases/1.79.1/release-record.md"),
    read("releases/1.79.2/release-record.md"),
    read("releases/1.79.3/release-record.md"),
    read("releases/1.79.4/release-record.md"),
  ].join("\n");

  for (const marker of [
    "User Delivery Console",
    "User Delivery Console Card",
    "derived view only",
    "What are we building first?",
    "Can this task be treated as done",
    "Technical Trace",
    "status",
    "status-check",
    "STRICT_CHECK_PASSED",
    "NEEDS_COMPLETION_EVIDENCE_CHECK",
    "verificationPlanPrepared",
    "testCheckEvidenceRecorded",
    "userVerificationNoteProvided",
    "sourceSignals",
    "currentTaskMatches",
    "completionEvidenceStrictCheck",
    "PROJECT_HAS_OTHER_COMPLETION_RECORD",
    "currentIntentMatch",
    "delivery-status-cards/001-generated-status.md",
    "does not approve implementation",
    "does not approve release or production",
    "does not write target files",
    "does not prove real-user stability",
  ]) {
    if (combined.includes(marker)) pass(`1.79 user delivery console includes ${marker}`);
    else fail(`1.79 user delivery console missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-user-delivery-console.mjs", ".", "--intent", "maintain IntentOS ordinary user delivery status"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# User Delivery Console Card")
    && resolver.stdout.includes("## Human Summary")
    && resolver.stdout.includes("Can this task be treated as done")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.79 user delivery console resolver prints safe status card");
  } else {
    fail(`1.79 user delivery console resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-user-delivery-console.mjs", ".", "--intent", "maintain IntentOS ordinary user delivery status", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "USER_DELIVERY_CONSOLE_CARD"
        && parsed.schemaVersion === "1.79.4"
        && parsed.readOnly === true
        && parsed.deliveryStatus?.currentState
        && parsed.deliveryStatus?.currentStateLabel
        && parsed.taskCompletion?.verificationPlanPrepared
        && parsed.taskCompletion?.testCheckEvidenceRecorded
        && parsed.taskCompletion?.userVerificationNoteProvided
        && parsed.taskCompletion?.completionEvidenceStrictCheck
        && "currentIntentMatch" in parsed.taskCompletion
        && parsed.sourceSignals?.verificationPlan
        && parsed.sourceSignals?.testEvidence
        && parsed.sourceSignals?.executionAssurance
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.boundaries?.approvesReleaseOrProduction === "No") {
        pass("1.79 user delivery console resolver JSON includes split verification fields, strict completion status, and no-authority boundaries");
      } else {
        fail(`1.79 user delivery console resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const noteJson = runNode([
    "scripts/resolve-user-delivery-console.mjs",
    ".",
    "--intent",
    "maintain IntentOS ordinary user delivery status",
    "--verification",
    "npm run verify passed",
    "--json",
  ]);
  if (noteJson.status === 0) {
    try {
      const parsed = JSON.parse(noteJson.stdout);
      if (parsed.taskCompletion?.testCheckEvidenceRecorded === "No"
        && parsed.taskCompletion?.userVerificationNoteProvided === "Yes") {
        pass("1.79 user delivery console keeps user verification note separate from Test Evidence reports");
      } else {
        fail(`1.79 user delivery console verification note must not count as Test Evidence: ${noteJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console verification note JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console verification note JSON failed: ${noteJson.stderr || noteJson.stdout}`);
  }

  const otherTaskJson = runNode([
    "scripts/resolve-user-delivery-console.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "different task",
    "--json",
  ]);
  if (otherTaskJson.status === 0) {
    try {
      const parsed = JSON.parse(otherTaskJson.stdout);
      if (parsed.taskCompletion?.verificationPlanPrepared === "No"
        && parsed.taskCompletion?.testCheckEvidenceRecorded === "No"
        && parsed.taskCompletion?.executionProofRecorded === "No"
        && parsed.sourceSignals?.verificationPlan?.otherTaskRecords > 0
        && parsed.sourceSignals?.testEvidence?.otherTaskRecords > 0
        && parsed.sourceSignals?.executionAssurance?.otherTaskRecords > 0) {
        pass("1.79 user delivery console keeps other-task source signals out of current-task status");
      } else {
        fail(`1.79 user delivery console must not count other-task source signals as current-task evidence: ${otherTaskJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console other-task source signal JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console other-task source signal JSON failed: ${otherTaskJson.stderr || otherTaskJson.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "status", ".", "--intent", "maintain IntentOS ordinary user delivery status"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("# User Delivery Console Card")) {
    pass("CLI status delegates to user delivery console resolver");
  } else {
    fail(`CLI status failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-user-delivery-console.mjs", "."]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("User Delivery Console check passed")) {
    pass("1.79 user delivery console checker passes source repo");
  } else {
    fail(`1.79 user delivery console checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliCheck = runNode(["scripts/cli.mjs", "status-check", "."]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("User Delivery Console check passed")) {
    pass("CLI status-check delegates to user delivery console checker");
  } else {
    fail(`CLI status-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const example = runNode(["scripts/check-user-delivery-console.mjs", "examples/1.79-user-delivery-console/appointment-app"]);
  if (example.status === 0 && example.stdout.includes("User Delivery Console check passed")) {
    pass("1.79 user delivery console example passes checker");
  } else {
    fail(`1.79 user delivery console example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["internal jargon", "test-fixtures/bad/bad-user-delivery-console-internal-jargon", "internal evidence jargon"],
    ["overclaim", "test-fixtures/bad/bad-user-delivery-console-overclaim", "forbidden user delivery console claim"],
    ["too many decisions", "test-fixtures/bad/bad-user-delivery-console-too-many-decisions", "invalid number of human decisions"],
  ]) {
    const result = runNode(["scripts/check-user-delivery-console.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.79 user delivery console rejects ${name}`);
    } else {
      fail(`1.79 user delivery console must reject ${name}: ${output}`);
    }
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-user-delivery-console.mjs",
    "node --check scripts/check-user-delivery-console.mjs",
    "node scripts/cli.mjs status . --intent \"维护 IntentOS 普通用户交付状态\"",
    "node scripts/cli.mjs status-check .",
    "node scripts/check-user-delivery-console.mjs examples/1.79-user-delivery-console/appointment-app",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.79 package verify includes ${marker}`);
    else fail(`1.79 package verify missing ${marker}`);
  }
}
function checkDeliveryPathGovernanceProtocol() {
  const required = [
    "docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md",
    "core/delivery-path-governance.md",
    "docs/delivery-path-governance.md",
    "templates/delivery-path-report.md",
    "checklists/delivery-path-review.md",
    "prompts/delivery-path-agent.md",
    "delivery-path-reports/.gitkeep",
    "scripts/resolve-delivery-path.mjs",
    "scripts/check-delivery-path.mjs",
    "examples/1.26-delivery-path-governance/README.md",
    "examples/1.26-delivery-path-governance/delivery-path-reports/001-booking-delivery-path.md",
    "test-fixtures/bad/bad-delivery-path-release-overclaim/delivery-path-reports/001-bad.md",
    "test-fixtures/bad/bad-delivery-path-missing-state/delivery-path-reports/001-bad.md",
    "releases/1.26.0/release-record.md",
    "releases/1.26.0/known-limitations.md",
    "releases/1.26.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.26 delivery path asset exists ${file}`);
    else fail(`1.26 delivery path asset missing ${file}`);
  }

  const combined = [
    read("core/delivery-path-governance.md"),
    read("docs/delivery-path-governance.md"),
    read("templates/delivery-path-report.md"),
    read("scripts/resolve-delivery-path.mjs"),
    read("scripts/check-delivery-path.mjs"),
    read("releases/1.26.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Delivery Path Governance",
    "Delivery Path Report",
    "READY_FOR_SELF_TEST",
    "BLOCKED_BY_DIRTY_WORK",
    "This report writes target files: No",
    "This report approves release or production: No",
    "This report replaces Safe Launch: No",
  ]) {
    if (combined.includes(marker)) pass(`1.26 delivery path includes ${marker}`);
    else fail(`1.26 delivery path missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-delivery-path.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Delivery Path Report")
    && resolver.stdout.includes("Delivery Path State")
    && resolver.stdout.includes("This report writes target files: No")) {
    pass("1.26 delivery path resolver prints safe report");
  } else {
    fail(`1.26 delivery path resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-delivery-path.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DELIVERY_PATH_REPORT"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.deliveryPathState?.currentState
        && Array.isArray(parsed.distanceToUsefulUse)) {
        pass("1.26 delivery path resolver JSON includes state, distance, and boundaries");
      } else {
        fail(`1.26 delivery path resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.26 delivery path resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.26 delivery path resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-delivery-path.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Delivery path check passed")) {
    pass("1.26 delivery path checker passes source repo");
  } else {
    fail(`1.26 delivery path checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-delivery-path.mjs", "examples/1.26-delivery-path-governance"]);
  if (example.status === 0 && example.stdout.includes("Delivery path check passed")) {
    pass("1.26 delivery path example passes checker");
  } else {
    fail(`1.26 delivery path example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["release overclaim", ["scripts/check-delivery-path.mjs", "test-fixtures/bad/bad-delivery-path-release-overclaim"], "forbidden delivery path claim"],
    ["missing state", ["scripts/check-delivery-path.mjs", "test-fixtures/bad/bad-delivery-path-missing-state"], "invalid current state"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.26 delivery path rejects ${name}`);
    } else {
      fail(`1.26 delivery path must reject ${name}: ${output}`);
    }
  }
}
function checkDebtKnowledgeHandoffProtocol() {
  const required = [
    "core/debt-knowledge-handoff.md",
    "docs/debt-knowledge-handoff.md",
    "templates/debt-knowledge-handoff-report.md",
    "checklists/debt-knowledge-handoff-review.md",
    "prompts/debt-handoff-agent.md",
    "debt-handoff-reports/.gitkeep",
    "scripts/resolve-debt-handoff.mjs",
    "scripts/check-debt-handoff.mjs",
    "examples/1.27-debt-knowledge-handoff/README.md",
    "examples/1.27-debt-knowledge-handoff/debt-handoff-reports/001-booking-handoff.md",
    "test-fixtures/bad/bad-debt-handoff-forgives-debt/debt-handoff-reports/001-bad.md",
    "test-fixtures/bad/bad-debt-handoff-missing-handoff/debt-handoff-reports/001-bad.md",
    "releases/1.27.0/release-record.md",
    "releases/1.27.0/known-limitations.md",
    "releases/1.27.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.27 debt handoff asset exists ${file}`);
    else fail(`1.27 debt handoff asset missing ${file}`);
  }

  const combined = [
    read("core/debt-knowledge-handoff.md"),
    read("docs/debt-knowledge-handoff.md"),
    read("templates/debt-knowledge-handoff-report.md"),
    read("scripts/resolve-debt-handoff.mjs"),
    read("scripts/check-debt-handoff.mjs"),
    read("releases/1.27.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Debt & Knowledge Handoff",
    "D0_NO_DEBT_FOUND",
    "D4_HIGH_RISK_DEBT",
    "How To Verify",
    "Do Not Touch Without Approval",
    "This report forgives debt: No",
    "This report approves release or production: No",
    "This report replaces Safe Launch: No",
  ]) {
    if (combined.includes(marker)) pass(`1.27 debt handoff includes ${marker}`);
    else fail(`1.27 debt handoff missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-debt-handoff.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Debt & Knowledge Handoff Report")
    && resolver.stdout.includes("This report forgives debt: No")) {
    pass("1.27 debt handoff resolver prints safe report");
  } else {
    fail(`1.27 debt handoff resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-debt-handoff.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DEBT_KNOWLEDGE_HANDOFF_REPORT"
        && parsed.boundaries?.forgivesDebt === "No"
        && parsed.debtRegister?.[0]?.level
        && parsed.knowledgeHandoff?.howToVerify) {
        pass("1.27 debt handoff resolver JSON includes debt, handoff, and boundaries");
      } else {
        fail(`1.27 debt handoff resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.27 debt handoff resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.27 debt handoff resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-debt-handoff.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Debt & Knowledge Handoff check passed")) {
    pass("1.27 debt handoff checker passes source repo");
  } else {
    fail(`1.27 debt handoff checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-debt-handoff.mjs", "examples/1.27-debt-knowledge-handoff"]);
  if (example.status === 0 && example.stdout.includes("Debt & Knowledge Handoff check passed")) {
    pass("1.27 debt handoff example passes checker");
  } else {
    fail(`1.27 debt handoff example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["debt forgiven", ["scripts/check-debt-handoff.mjs", "test-fixtures/bad/bad-debt-handoff-forgives-debt"], "forbidden debt handoff claim"],
    ["missing handoff", ["scripts/check-debt-handoff.mjs", "test-fixtures/bad/bad-debt-handoff-missing-handoff"], "handoff missing How To Verify"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.27 debt handoff rejects ${name}`);
    } else {
      fail(`1.27 debt handoff must reject ${name}: ${output}`);
    }
  }
}
function checkUnifiedClosureModelProtocol() {
  const required = [
    "core/unified-closure-model.md",
    "docs/unified-closure-model.md",
    "templates/closure-decision.md",
    "checklists/closure-decision-review.md",
    "prompts/closure-decision-agent.md",
    "closure-decisions/.gitkeep",
    "scripts/resolve-closure-decision.mjs",
    "scripts/check-closure-decision.mjs",
    "examples/1.53-unified-closure-model/README.md",
    "examples/1.53-unified-closure-model/closure-decisions/001-booking-validation.md",
    "test-fixtures/bad/bad-closure-decision-done-without-evidence/closure-decisions/001-bad.md",
    "test-fixtures/bad/bad-closure-decision-split-truth/closure-decisions/001-bad.md",
    "releases/1.53.0/release-record.md",
    "releases/1.53.0/known-limitations.md",
    "releases/1.53.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.53 unified closure asset exists ${file}`);
    else fail(`1.53 unified closure asset missing ${file}`);
  }

  const combined = [
    read("core/unified-closure-model.md"),
    read("docs/unified-closure-model.md"),
    read("templates/closure-decision.md"),
    read("scripts/resolve-closure-decision.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("releases/1.53.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Unified Closure Model",
    "Unified Closure Decision",
    "single closure source",
    "UNIFIED_CLOSURE_DECISION",
    "NEEDS_IMPACT_COVERAGE",
    "This decision writes target files: No",
    "This decision approves commit or push: No",
    "This decision approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.53 unified closure includes ${marker}`);
    else fail(`1.53 unified closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Closure Decision")
    && resolver.stdout.includes("This decision writes target files: No")) {
    pass("1.53 unified closure resolver prints safe decision");
  } else {
    fail(`1.53 unified closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "UNIFIED_CLOSURE_DECISION"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.closureDecision?.finalClosureSource === "UNIFIED_CLOSURE_DECISION"
        && Array.isArray(parsed.decisionInputs)) {
        pass("1.53 unified closure resolver JSON includes decision inputs and boundaries");
      } else {
        fail(`1.53 unified closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.53 unified closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.53 unified closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode([
    "scripts/check-closure-decision.mjs",
    "examples/1.54-decision-explain-trace",
    "--historical-audit",
  ]);
  if (check.status === 0 && check.stdout.includes("Unified Closure Decision check passed")) {
    pass("1.53 unified closure checker passes source repo");
  } else {
    fail(`1.53 unified closure checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-closure-decision.mjs", "examples/1.53-unified-closure-model"]);
  if (example.status !== 0 && `${example.stdout}\n${example.stderr}`.includes("DONE requires Input Verification")) {
    pass("1.53 legacy unified closure example cannot claim verified DONE after 1.90");
  } else {
    fail(`1.53 legacy unified closure example must be rejected as unverified DONE: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["done without evidence", ["scripts/check-closure-decision.mjs", "test-fixtures/bad/bad-closure-decision-done-without-evidence"], "DONE requires Input Verification"],
    ["split truth", ["scripts/check-closure-decision.mjs", "test-fixtures/bad/bad-closure-decision-split-truth"], "must confirm single closure source"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.53 unified closure rejects ${name}`);
    } else {
      fail(`1.53 unified closure must reject ${name}: ${output}`);
    }
  }
}
function checkExecutionTruthHardcutProtocol() {
  const required = [
    "docs/plans/execution-truth-hardcut-1.90-plan.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/closure-decisions/001-contract-input-rule.md",
    "releases/1.90.0/release-record.md",
    "releases/1.90.0/known-limitations.md",
    "releases/1.90.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.90 execution truth asset exists ${file}`);
    else fail(`1.90 execution truth asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/execution-truth-hardcut-1.90-plan.md"),
    read("templates/closure-decision.md"),
    read("scripts/resolve-closure-decision.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("scripts/check-execution-closure.mjs"),
  ].join("\n");
  for (const marker of [
    "Execution Truth Hardcut",
    "Input Verification",
    "selected execution closure report",
    "--require-precise-evidence",
    "verified Execution Closure",
  ]) {
    if (combined.includes(marker)) pass(`1.90 execution truth includes ${marker}`);
    else fail(`1.90 execution truth missing ${marker}`);
  }

  const exampleRoot = "examples/1.49-structured-impact-coverage/contract-input-rule";
  const exactClosure = runNode([
    "scripts/check-execution-closure.mjs",
    exampleRoot,
    "--report",
    "execution-closures/001-contract-input-rule.md",
    "--require-impact-coverage",
    "--require-precise-evidence",
  ]);
  if (exactClosure.status === 0 && exactClosure.stdout.includes("selected execution closure report found")) {
    pass("1.90 exact Execution Closure report passes strict validation");
  } else {
    fail(`1.90 exact Execution Closure report failed: ${exactClosure.stderr || exactClosure.stdout}`);
  }

  const closureDecision = runNode(["scripts/check-closure-decision.mjs", exampleRoot, "--historical-audit"]);
  if (closureDecision.status === 0 && closureDecision.stdout.includes("verified Execution Closure passes exact strict checker")) {
    pass("1.90 recorded DONE requires verified upstream sources");
  } else {
    fail(`1.90 verified Closure Decision example failed: ${closureDecision.stderr || closureDecision.stdout}`);
  }

  const validIntent = "Add a contract input restriction that rejects blank contract titles.";
  const validResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    exampleRoot,
    "--intent",
    validIntent,
    "--task",
    exampleRoot,
    "--intent-digest",
    `sha256:${crypto.createHash("sha256").update(validIntent).digest("hex")}`,
    "--verification",
    "targeted contract validation checks passed",
    "--execution-closure",
    "execution-closures/001-contract-input-rule.md",
    "--impact-report",
    "change-impact-coverage-reports/001-contract-input-rule.md",
    "--json",
  ]);
  if (validResolver.status === 0) {
    try {
      const parsed = JSON.parse(validResolver.stdout);
      if (parsed.closureDecision?.decision === "NEEDS_EVIDENCE"
        && parsed.inputVerification?.some((item) => item.input === "Execution Closure" && item.verified === "Yes")
        && parsed.inputVerification?.some((item) => item.input === "Change Impact Coverage" && item.verified === "Yes")
        && parsed.decisionInputs?.some((item) => item.input === "Runtime Trust" && item.status === "MISSING")) {
        pass("1.104 resolver preserves verified historical inputs but blocks DONE without Runtime Trust");
      } else {
        fail(`1.90 resolver valid decision missing verified inputs: ${validResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.90 resolver valid decision JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.90 resolver valid decision failed: ${validResolver.stderr || validResolver.stdout}`);
  }

  const staleResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report",
    "--intent",
    "unrelated current task",
    "--verification",
    "passed",
    "--execution-closure",
    "execution-closures/001-contract-input-rule.md",
    "--human-decision",
    "execution-closures/001-contract-input-rule.md",
    "--json",
  ]);
  if (staleResolver.status === 0) {
    try {
      const parsed = JSON.parse(staleResolver.stdout);
      if (parsed.closureDecision?.decision !== "DONE"
        && parsed.decisionInputs?.some((item) => item.input === "Execution Closure" && item.status === "FAIL")) {
        pass("1.90 stale Execution Closure cannot produce DONE");
      } else {
        fail(`1.90 stale Execution Closure must not produce DONE: ${staleResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.90 stale resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.90 stale resolver failed unexpectedly: ${staleResolver.stderr || staleResolver.stdout}`);
  }

  const lowRiskResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    exampleRoot,
    "--intent",
    "Clarify a documentation sentence.",
    "--verification",
    "documentation review passed",
    "--json",
  ]);
  if (lowRiskResolver.status === 0) {
    try {
      const parsed = JSON.parse(lowRiskResolver.stdout);
      const humanDecision = parsed.decisionInputs?.find((item) => item.input === "Human Decision");
      const executionClosure = parsed.decisionInputs?.find((item) => item.input === "Execution Closure");
      const impactCoverage = parsed.decisionInputs?.find((item) => item.input === "Change Impact Coverage");
      if (humanDecision?.status === "N/A" && executionClosure?.status === "MISSING" && impactCoverage?.status === "N/A") {
        pass("1.90 low-risk intent is not escalated or bound to unrelated historical evidence");
      } else {
        fail(`1.90 low-risk intent must not require Human Decision or consume unrelated historical evidence: ${lowRiskResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.90 low-risk resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.90 low-risk resolver failed unexpectedly: ${lowRiskResolver.stderr || lowRiskResolver.stdout}`);
  }

  const scopedGitRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-closure-git-scope-"));
  const scopedProjectRoot = path.join(scopedGitRoot, "target-project");
  fs.mkdirSync(scopedProjectRoot, { recursive: true });
  fs.writeFileSync(path.join(scopedProjectRoot, "README.md"), "# Scoped target project\n");
  spawnSync("git", ["init"], { cwd: scopedGitRoot, encoding: "utf8" });
  spawnSync("git", ["add", "."], { cwd: scopedGitRoot, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=IntentOS Self Check", "-c", "user.email=intentos@example.invalid", "commit", "-m", "initial"], {
    cwd: scopedGitRoot,
    encoding: "utf8",
  });
  fs.writeFileSync(path.join(scopedGitRoot, "release-workflow-draft.md"), "dirty parent-only release note\n");
  const scopedLowRiskResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    scopedProjectRoot,
    "--intent",
    "Clarify a documentation sentence.",
    "--verification",
    "documentation review passed",
    "--json",
  ]);
  if (scopedLowRiskResolver.status === 0) {
    try {
      const parsed = JSON.parse(scopedLowRiskResolver.stdout);
      const humanDecision = parsed.decisionInputs?.find((item) => item.input === "Human Decision");
      const gitWorktree = parsed.decisionInputs?.find((item) => item.input === "Git worktree");
      if (humanDecision?.status === "N/A" && gitWorktree?.status === "PASS") {
        pass("1.91.1 closure Git risk signals stay scoped to the target subproject");
      } else {
        fail(`1.91.1 closure Git risk signals must ignore dirty parent-only files: ${scopedLowRiskResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.91.1 scoped Git closure JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.91.1 scoped Git closure resolver failed: ${scopedLowRiskResolver.stderr || scopedLowRiskResolver.stdout}`);
  }

  const unsafeReport = runNode([
    "scripts/check-execution-closure.mjs",
    exampleRoot,
    "--report",
    "../execution-closures/001-contract-input-rule.md",
  ]);
  if (unsafeReport.status !== 0 && `${unsafeReport.stdout}\n${unsafeReport.stderr}`.includes("path is unsafe")) {
    pass("1.90 exact report checker rejects traversal");
  } else {
    fail(`1.90 exact report checker must reject traversal: ${unsafeReport.stderr || unsafeReport.stdout}`);
  }
}
function checkEvidenceAuthorityCoreProtocol() {
  const required = [
    "docs/plans/evidence-authority-core-1.91-plan.md",
    "scripts/lib/evidence-authority.mjs",
    "releases/1.91.0/release-record.md",
    "releases/1.91.0/known-limitations.md",
    "releases/1.91.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.91 evidence authority asset exists ${file}`);
    else fail(`1.91 evidence authority asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/evidence-authority-core-1.91-plan.md"),
    read("scripts/lib/evidence-authority.mjs"),
    read("scripts/lib/artifact-schema.mjs"),
    read("scripts/lib/path-safety.mjs"),
    read("scripts/check-verification-plan.mjs"),
    read("scripts/check-test-evidence.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("scripts/check-completion-evidence.mjs"),
  ].join("\n");
  for (const marker of [
    "Evidence Authority Core",
    "--require-evidence-authority",
    "authority_binding",
    "raw_file_digest",
    "must not pass through or overwrite a symlink",
  ]) {
    if (combined.includes(marker)) pass(`1.91 evidence authority includes ${marker}`);
    else fail(`1.91 evidence authority missing ${marker}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-evidence-authority-"));
  try {
    fs.cpSync(path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time"), tempRoot, { recursive: true });
    const planReport = "verification-plans/001-authority.md";
    const resolve = runNode([
      "scripts/resolve-verification-plan.mjs",
      tempRoot,
      "--intent",
      "appointment requests must include a service time",
      "--business-rule-ref",
      "artifact:business-rule-closures/001-service-time.md",
      "--impact-ref",
      "artifact:change-impact-coverage-reports/001-service-time.md",
      "--project-level",
      "BL1",
      "--platform",
      "web,backend",
      "--out",
      planReport,
    ]);
    const strictArgs = [
      "scripts/check-verification-plan.mjs",
      tempRoot,
      "--report",
      planReport,
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-impact-ref",
      "--strict-source-binding",
      "--require-evidence-authority",
    ];
    const strictCheck = runNode(strictArgs);
    if (resolve.status === 0 && strictCheck.status === 0 && strictCheck.stdout.includes("authority binding matches the current project")) {
      pass("1.91 generated Verification Plan passes strict evidence authority validation");
    } else {
      fail(`1.91 generated Verification Plan strict authority validation failed: ${strictCheck.stderr || strictCheck.stdout || resolve.stderr || resolve.stdout}`);
      return;
    }

    const shadowPath = path.join(tempRoot, "schemas", "artifacts", "verification-plan.schema.json");
    fs.mkdirSync(path.dirname(shadowPath), { recursive: true });
    fs.writeFileSync(shadowPath, JSON.stringify({ type: "object" }, null, 2));
    const shadowCheck = runNode(strictArgs);
    if (shadowCheck.status === 0) pass("1.91 target schema shadow cannot weaken the authoritative artifact schema");
    else fail(`1.91 target schema shadow must not affect authority: ${shadowCheck.stderr || shadowCheck.stdout}`);

    const reportPath = path.join(tempRoot, planReport);
    const original = fs.readFileSync(reportPath, "utf8");
    rewriteMachineEvidence(reportPath, (evidence) => {
      evidence.authority_binding.sources[0].raw_file_digest = `sha256:${"0".repeat(64)}`;
      evidence.verification_plan_digest = evidenceDigest(evidence, ["verification_plan_digest"]);
      return evidence;
    });
    const staleDigestCheck = runNode(strictArgs);
    if (staleDigestCheck.status !== 0 && `${staleDigestCheck.stdout}\n${staleDigestCheck.stderr}`.includes("raw_file_digest does not match")) {
      pass("1.91 strict authority rejects a stale source file digest");
    } else {
      fail(`1.91 strict authority must reject stale source digest: ${staleDigestCheck.stderr || staleDigestCheck.stdout}`);
    }

    fs.writeFileSync(reportPath, original);
    rewriteMachineEvidence(reportPath, (evidence) => {
      evidence.authority_binding.task.task_ref = "tasks/other-task.md";
      evidence.verification_plan_digest = evidenceDigest(evidence, ["verification_plan_digest"]);
      return evidence;
    });
    const taskMismatchCheck = runNode(strictArgs);
    if (taskMismatchCheck.status !== 0 && `${taskMismatchCheck.stdout}\n${taskMismatchCheck.stderr}`.includes("authority_binding.task.task_ref")) {
      pass("1.91 strict authority rejects a task-mismatched binding");
    } else {
      fail(`1.91 strict authority must reject task mismatch: ${taskMismatchCheck.stderr || taskMismatchCheck.stdout}`);
    }

    fs.writeFileSync(reportPath, original);
    const sourcePath = path.join(tempRoot, "business-rule-closures", "001-service-time.md");
    const external = path.join(tempRoot, "..", `${path.basename(tempRoot)}-outside-evidence.md`);
    fs.writeFileSync(external, "outside project evidence\n");
    fs.rmSync(sourcePath);
    fs.symlinkSync(external, sourcePath);
    const symlinkCheck = runNode(strictArgs);
    if (symlinkCheck.status !== 0 && `${symlinkCheck.stdout}\n${symlinkCheck.stderr}`.includes("symlink")) {
      pass("1.91 strict authority rejects an evidence symlink escape");
    } else {
      fail(`1.91 strict authority must reject symlink evidence escape: ${symlinkCheck.stderr || symlinkCheck.stdout}`);
    }
    fs.rmSync(external, { force: true });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

export function runEvidenceChecks() {
  checkReviewSurfaceGovernanceProtocol();
  checkBusinessRuleClosureProtocol();
  checkChangeImpactCoverageProtocol();
  checkVerificationPlanGovernanceProtocol();
  checkTestEvidenceBindingProtocol();
  checkCompletionEvidenceGateProtocol();
  checkReleaseEvidenceGateProtocol();
  checkReleaseChannelDecouplingProtocol();
  checkPlanReviewGateProtocol();
  checkSafetyEvidenceHardeningProtocol();
  checkUserDeliveryConsoleProtocol();
  checkDeliveryPathGovernanceProtocol();
  checkDebtKnowledgeHandoffProtocol();
  checkUnifiedClosureModelProtocol();
  checkExecutionTruthHardcutProtocol();
  checkEvidenceAuthorityCoreProtocol();
}
