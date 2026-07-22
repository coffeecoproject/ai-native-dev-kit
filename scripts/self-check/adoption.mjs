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

function checkExistingProjectWorkflowAdapterProtocol() {
  const required = [
    "core/existing-project-workflow-adapter.md",
    "docs/existing-project-workflow-adapter.md",
    "templates/workflow-adoption-map.md",
    "checklists/workflow-adoption-map-review.md",
    "prompts/workflow-adapter-agent.md",
    "workflow-adoption-maps/.gitkeep",
    "scripts/resolve-existing-workflow.mjs",
    "scripts/check-workflow-adoption-map.mjs",
    "examples/1.20-existing-project-workflow-adapter/README.md",
    "examples/1.20-existing-project-workflow-adapter/workflow-adoption-maps/001-governed-web-workflow-map.md",
    "test-fixtures/bad/bad-workflow-adoption-authorizes-write/workflow-adoption-maps/001-bad.md",
    "test-fixtures/bad/bad-workflow-adoption-missing-use/workflow-adoption-maps/001-bad.md",
    "releases/1.20.0/release-record.md",
    "releases/1.20.0/known-limitations.md",
    "releases/1.20.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.20 workflow adapter asset exists ${file}`);
    else fail(`1.20 workflow adapter asset missing ${file}`);
  }

  const combined = [
    read("core/existing-project-workflow-adapter.md"),
    read("docs/existing-project-workflow-adapter.md"),
    read("templates/workflow-adoption-map.md"),
    read("scripts/resolve-existing-workflow.mjs"),
    read("scripts/check-workflow-adoption-map.mjs"),
    read("releases/1.20.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Existing Project Workflow Adapter",
    "Workflow Adoption Map",
    "READ_ONLY_MAP",
    "DOCS_ONLY_BRIDGE",
    "THIN_OPERATIONAL_BRIDGE",
    "BLOCKED_NEEDS_OWNER",
    "For existing projects, Codex must recommend a workflow adapter path before recommending file writes",
    "Recommended IntentOS Workflow Use",
    "Native Migration Plan",
    "What Not To Touch",
    "does not install target-project workflow assets",
    "does not change hooks or CI",
    "does not approve implementation",
  ]) {
    if (combined.includes(marker)) pass(`1.20 workflow adapter includes ${marker}`);
    else fail(`1.20 workflow adapter missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-existing-workflow.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Workflow Adoption Map Recommendation")
    && resolver.stdout.includes("Native Migration Recommendation")
    && resolver.stdout.includes("This report authorizes target-project writes: No")) {
    pass("1.20 workflow adapter resolver passes source repo");
  } else {
    fail(`1.20 workflow adapter resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-existing-workflow.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORKFLOW_ADOPTION_MAP_RECOMMENDATION"
        && parsed.boundary?.authorizesTargetProjectWrites === "No"
        && Array.isArray(parsed.recommendedIntentOSWorkflowUse)
        && parsed.nativeMigrationRecommendation?.nextStep
        && parsed.nativeMigrationRecommendation?.posture
        && parsed.nativeMigrationRecommendation?.writes === "No") {
        pass("1.20 workflow adapter resolver JSON includes map and boundary");
      } else {
        fail(`1.20 workflow adapter resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.20 workflow adapter resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.20 workflow adapter resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-workflow-adoption-map.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Workflow adoption map check passed")) {
    pass("1.20 workflow adoption map checker passes source repo");
  } else {
    fail(`1.20 workflow adoption map checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-workflow-adoption-map.mjs", "examples/1.20-existing-project-workflow-adapter"]);
  if (example.status === 0 && example.stdout.includes("Workflow adoption map check passed")) {
    pass("1.20 workflow adoption map example passes checker");
  } else {
    fail(`1.20 workflow adoption map example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes write", ["scripts/check-workflow-adoption-map.mjs", "test-fixtures/bad/bad-workflow-adoption-authorizes-write"], "authorizes target-project writes"],
    ["missing workflow use", ["scripts/check-workflow-adoption-map.mjs", "test-fixtures/bad/bad-workflow-adoption-missing-use"], "Request / Spec / Task Card"],
    ["adapter endpoint", ["scripts/check-workflow-adoption-map.mjs", "test-fixtures/bad/bad-workflow-map-adapter-endpoint"], "final adoption endpoint"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.20 workflow adapter rejects ${name}`);
    } else {
      fail(`1.20 workflow adapter must reject ${name}: ${output}`);
    }
  }
}
function checkNativeFirstMigrationProtocol() {
  const required = [
    "docs/plans/native-first-existing-project-migration-1.62-plan.md",
    "docs/plans/native-migration-precision-hardening-1.63-plan.md",
    "docs/plans/native-migration-parser-calibration-1.64-plan.md",
    "docs/plans/native-migration-classification-calibration-1.65-plan.md",
    "core/native-first-existing-project-migration.md",
    "docs/native-first-existing-project-migration.md",
    "templates/native-migration-plan.md",
    "schemas/artifacts/native-migration-plan.schema.json",
    "scripts/lib/native-rule-extraction.mjs",
    "checklists/native-migration-review.md",
    "prompts/native-migration-agent.md",
    "native-migration-plans/.gitkeep",
    "scripts/resolve-native-migration.mjs",
    "scripts/check-native-migration.mjs",
    "examples/1.62-native-first-existing-project/README.md",
    "examples/1.62-native-first-existing-project/light-web/native-migration-plans/001-light-web.md",
    "examples/1.62-native-first-existing-project/governed-admin/native-migration-plans/001-governed-admin.md",
    "examples/1.62-native-first-existing-project/production-maintained/native-migration-plans/001-production-maintained.md",
    "examples/1.62-native-first-existing-project/dirty-worktree/native-migration-plans/001-dirty-worktree.md",
    "examples/1.63-native-migration-precision/README.md",
    "examples/1.63-native-migration-precision/mixed-agent-rules/native-migration-plans/001-mixed-agent-rules.md",
    "examples/1.64-native-migration-parser-calibration/README.md",
    "examples/1.64-native-migration-parser-calibration/table-long-bilingual/AGENTS.md",
    "examples/1.64-native-migration-parser-calibration/table-long-bilingual/docs/GOVERNANCE.md",
    "examples/1.64-native-migration-parser-calibration/table-long-bilingual/native-migration-plans/001-table-long-bilingual.md",
    "examples/1.65-native-migration-classification-calibration/README.md",
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/AGENTS.md",
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/docs/GOVERNANCE.md",
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/native-migration-plans/001-mixed-domain-bilingual.md",
    "releases/1.62.0/release-record.md",
    "releases/1.62.0/known-limitations.md",
    "releases/1.62.0/self-check-report.md",
    "test-fixtures/bad/bad-native-migration-drops-business-rule/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-direct-agents-overwrite/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-keeps-split-authority/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-auto-ci-hook/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-production-config/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-human-approval/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-restore-plan/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-approves-implementation/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-unknown-owner/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-business-rule-as-workflow-rule/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-production-control-as-baseline/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-source-excerpt/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-broad-target-path/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-authority-transition/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-mixed-rules-collapsed/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-missing-line-range/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-structured-evidence-mismatch/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-schema-invalid/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-rule-json-mismatch/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-line-range-mismatch/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-missing-skipped-block-reporting/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-structured-action-writes/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-mixed-business-engineering-as-baseline/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-chinese-production-as-business/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-simple-table-no-line-range/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-complex-table-no-warning/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-proposed-action-mismatch/native-migration-plans/001-bad.md",
    "releases/1.65.0/release-record.md",
    "releases/1.65.0/known-limitations.md",
    "releases/1.65.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.62 native migration asset exists ${file}`);
    else fail(`1.62 native migration asset missing ${file}`);
  }

  const combined = [
    read("core/native-first-existing-project-migration.md"),
    read("docs/native-first-existing-project-migration.md"),
    read("templates/native-migration-plan.md"),
    read("scripts/resolve-native-migration.mjs"),
    read("scripts/check-native-migration.mjs"),
    read("scripts/lib/native-rule-extraction.mjs"),
    read("schemas/artifacts/native-migration-plan.schema.json"),
    read("releases/1.62.0/release-record.md"),
    read("releases/1.63.0/release-record.md"),
    read("releases/1.64.0/release-record.md"),
    read("releases/1.65.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Native-First Existing Project Migration",
    "Native-First Migration Planning mode",
    "IntentOS may become the workflow authority",
    "IntentOS must not become the business",
    "intentOsWorkflowAuthority",
    "targetFileWriteAuthority",
    "businessAuthority",
    "productionAuthority",
    "Unified Apply Plan",
    "Controlled Apply Readiness",
    "Approval Record",
    "This plan writes target files: No",
    "Rule Extraction Coverage",
    "Machine-Readable Evidence",
    "require-structured-evidence",
    "parser_warnings",
    "skipped_blocks",
    "low_signal_blocks",
    "proposed_actions",
    "Markdown/JSON",
    "classification calibration",
    "mixed business + engineering",
    "Chinese",
    "simple Markdown table",
    "proposed-action",
  ]) {
    if (combined.includes(marker)) pass(`native migration includes ${marker}`);
    else fail(`native migration missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-native-migration.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("I have switched to IntentOS Native-First Migration Planning mode.")
    && resolver.stdout.includes("This plan writes target files: No")
    && resolver.stdout.includes("Unified Apply Plan")) {
    pass("1.62 native migration resolver prints safe plan");
  } else {
    fail(`1.62 native migration resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-native-migration.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION"
        && parsed.canCodexWriteNow === "No"
        && parsed.businessAuthority === "PROJECT_OWNED"
        && parsed.productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM"
        && parsed.boundary?.writesTargetFiles === "No") {
        pass("1.62 native migration resolver JSON includes safe authority fields");
      } else {
        fail(`1.62 native migration resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.62 native migration resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.62 native migration resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-native-migration.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Native Migration check passed")) {
    pass("1.62 native migration checker passes source repo");
  } else {
    fail(`1.62 native migration checker failed: ${source.stderr || source.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "native-migration", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Native-First Migration Planning mode")) {
    pass("CLI native-migration delegates to native migration resolver");
  } else {
    fail(`CLI native-migration failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "native-migration-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Native Migration check passed")) {
    pass("CLI native-migration-check delegates to native migration checker");
  } else {
    fail(`CLI native-migration-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const target of [
    "examples/1.62-native-first-existing-project/light-web",
    "examples/1.62-native-first-existing-project/governed-admin",
    "examples/1.62-native-first-existing-project/production-maintained",
    "examples/1.62-native-first-existing-project/dirty-worktree",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", target]);
    if (result.status === 0) pass(`1.62 native migration example passes ${target}`);
    else fail(`1.62 native migration example failed ${target}: ${result.stderr || result.stdout}`);
  }

  const strictExample = runNode(["scripts/check-native-migration.mjs", "examples/1.63-native-migration-precision/mixed-agent-rules", "--require-structured-evidence"]);
  if (strictExample.status === 0) pass("1.63 native migration precision example passes strict checker");
  else fail(`1.63 native migration precision example failed: ${strictExample.stderr || strictExample.stdout}`);

  const strictCalibrationExample = runNode(["scripts/check-native-migration.mjs", "examples/1.64-native-migration-parser-calibration/table-long-bilingual", "--require-structured-evidence"]);
  if (strictCalibrationExample.status === 0) pass("1.64 native migration parser calibration example passes strict checker");
  else fail(`1.64 native migration parser calibration example failed: ${strictCalibrationExample.stderr || strictCalibrationExample.stdout}`);

  const strictClassificationExample = runNode(["scripts/check-native-migration.mjs", "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual", "--require-structured-evidence"]);
  if (strictClassificationExample.status === 0) pass("1.65 native migration classification calibration example passes strict checker");
  else fail(`1.65 native migration classification calibration example failed: ${strictClassificationExample.stderr || strictClassificationExample.stdout}`);

  for (const target of [
    "bad-native-migration-drops-business-rule",
    "bad-native-migration-direct-agents-overwrite",
    "bad-native-migration-keeps-split-authority",
    "bad-native-migration-auto-ci-hook",
    "bad-native-migration-production-config",
    "bad-native-migration-no-human-approval",
    "bad-native-migration-no-restore-plan",
    "bad-native-migration-approves-implementation",
    "bad-native-migration-unknown-owner",
    "bad-native-migration-business-rule-as-workflow-rule",
    "bad-native-migration-production-control-as-baseline",
    "bad-native-migration-no-source-excerpt",
    "bad-native-migration-broad-target-path",
    "bad-native-migration-no-authority-transition",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`]);
    if (result.status !== 0) pass(`1.62 native migration rejects ${target}`);
    else fail(`1.62 native migration must reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-mixed-rules-collapsed",
    "bad-native-migration-missing-line-range",
    "bad-native-migration-structured-evidence-mismatch",
    "bad-native-migration-schema-invalid",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.63 native migration rejects ${target}`);
    else fail(`1.63 native migration must reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-rule-json-mismatch",
    "bad-native-migration-line-range-mismatch",
    "bad-native-migration-missing-skipped-block-reporting",
    "bad-native-migration-structured-action-writes",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.64 native migration rejects ${target}`);
    else fail(`1.64 native migration must reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-mixed-business-engineering-as-baseline",
    "bad-native-migration-chinese-production-as-business",
    "bad-native-migration-simple-table-no-line-range",
    "bad-native-migration-complex-table-no-warning",
    "bad-native-migration-proposed-action-mismatch",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.65 native migration rejects ${target}`);
    else fail(`1.65 native migration must reject ${target}`);
  }
}
function checkExistingRuleReconciliationProtocol() {
  const badFixtures = [
    "bad-rule-reconciliation-replaces-release-sop",
    "bad-rule-reconciliation-business-as-engineering",
    "bad-rule-reconciliation-approves-target-write",
    "bad-rule-reconciliation-skips-approval-chain",
    "bad-rule-reconciliation-production-intentos-wins",
    "bad-rule-reconciliation-missing-protected-owner",
    "bad-rule-reconciliation-fake-gap-evidence",
    "bad-rule-reconciliation-release-adopt-intentos",
    "bad-rule-reconciliation-merge-without-preserved-terms",
    "bad-rule-reconciliation-gap-suggestion-as-approval",
    "bad-rule-reconciliation-missing-source-ref",
  ];
  const required = [
    "docs/plans/existing-rule-reconciliation-calibration-1.66-plan.md",
    "core/existing-rule-reconciliation.md",
    "docs/existing-rule-reconciliation.md",
    "templates/existing-rule-reconciliation-report.md",
    "schemas/artifacts/existing-rule-reconciliation.schema.json",
    "checklists/existing-rule-reconciliation-review.md",
    "prompts/existing-rule-reconciliation-agent.md",
    "existing-rule-reconciliations/.gitkeep",
    "rule-reconciliation-calibration-reports/.gitkeep",
    "rule-reconciliation-calibration-reports/2026-07-04-anonymized-existing-project.md",
    "scripts/resolve-existing-rule-reconciliation.mjs",
    "scripts/check-existing-rule-reconciliation.mjs",
    "examples/1.66-existing-rule-reconciliation/README.md",
    "examples/1.66-existing-rule-reconciliation/governed-web-admin/README.md",
    "examples/1.66-existing-rule-reconciliation/governed-web-admin/existing-rule-reconciliations/001-governed-web-admin.md",
    "releases/1.66.0/release-record.md",
    "releases/1.66.0/known-limitations.md",
    "releases/1.66.0/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/existing-rule-reconciliations/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.66 existing rule reconciliation asset exists ${file}`);
    else fail(`1.66 existing rule reconciliation asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/existing-rule-reconciliation-calibration-1.66-plan.md"),
    read("core/existing-rule-reconciliation.md"),
    read("docs/existing-rule-reconciliation.md"),
    read("templates/existing-rule-reconciliation-report.md"),
    read("schemas/artifacts/existing-rule-reconciliation.schema.json"),
    read("scripts/resolve-existing-rule-reconciliation.mjs"),
    read("scripts/check-existing-rule-reconciliation.mjs"),
    exists("releases/1.66.0/release-record.md") ? read("releases/1.66.0/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Existing Rule Reconciliation",
    "recommendation report, not permission to change files",
    "RECOMMENDATION_ONLY",
    "PROJECT_OWNED",
    "HUMAN_OR_EXTERNAL_SYSTEM",
    "ADOPT_INTENTOS",
    "GAP_SUGGESTION",
    "MERGE means",
    "release / production surfaces cannot use",
    "Native Migration Plan",
    "Unified Apply Plan",
    "Controlled Apply Readiness",
    "Approval Record",
    "Machine-Readable Evidence",
    "existing_rule_reconciliation_report",
    "can_codex_write_now",
    "protected_constraints",
    "release_production_gaps",
    "rule_reconciliation_coverage",
    "native_adoption_decision",
    "can_recommend_apply_plan_now",
    "NoUntilBlockResolved",
    "evidence_profile",
    "existing_rule_source",
    "intentos_reference_source",
    "IntentOS Adoption Recommendation",
    "false positive",
    "false negative",
  ]) {
    if (combined.includes(marker)) pass(`1.66 existing rule reconciliation includes ${marker}`);
    else fail(`1.66 existing rule reconciliation missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-existing-rule-reconciliation.mjs",
    "node --check scripts/check-existing-rule-reconciliation.mjs",
    "node scripts/cli.mjs reconcile-rules .",
    "node scripts/cli.mjs reconcile-rules . --auto-native",
    "node scripts/cli.mjs reconcile-rules-check .",
    "node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.66 package verify surface includes ${marker}`);
    else fail(`1.66 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-existing-rule-reconciliation.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Existing Rule Reconciliation Report")
    && resolver.stdout.includes("This is a recommendation report, not permission to change files.")
    && resolver.stdout.includes("Unified Apply Plan")) {
    pass("1.66 existing rule reconciliation resolver prints safe report");
  } else {
    fail(`1.66 existing rule reconciliation resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-existing-rule-reconciliation.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXISTING_RULE_RECONCILIATION"
        && parsed.canCodexWriteNow === "No"
        && parsed.reconciliationAuthority === "RECOMMENDATION_ONLY"
        && parsed.businessAuthority === "PROJECT_OWNED"
        && parsed.productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM"
        && parsed.boundary?.writesTargetFiles === "No") {
        pass("1.66 existing rule reconciliation resolver JSON includes safe authority fields");
      } else {
        fail(`1.66 existing rule reconciliation resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.66 existing rule reconciliation resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.66 existing rule reconciliation resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-existing-rule-reconciliation.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Existing Rule Reconciliation check passed")) {
    pass("1.66 existing rule reconciliation checker passes source repo");
  } else {
    fail(`1.66 existing rule reconciliation checker failed: ${source.stderr || source.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "reconcile-rules", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Existing Rule Reconciliation Report")) {
    pass("CLI reconcile-rules delegates to existing rule reconciliation resolver");
  } else {
    fail(`CLI reconcile-rules failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "reconcile-rules-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Existing Rule Reconciliation check passed")) {
    pass("CLI reconcile-rules-check delegates to existing rule reconciliation checker");
  } else {
    fail(`CLI reconcile-rules-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  const strictExample = runNode(["scripts/check-existing-rule-reconciliation.mjs", "examples/1.66-existing-rule-reconciliation/governed-web-admin", "--require-structured-evidence"]);
  if (strictExample.status === 0) pass("1.66 existing rule reconciliation example passes strict checker");
  else fail(`1.66 existing rule reconciliation example failed: ${strictExample.stderr || strictExample.stdout}`);

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-existing-rule-reconciliation.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.66 existing rule reconciliation rejects ${target}`);
    else fail(`1.66 existing rule reconciliation must reject ${target}`);
  }
}
function checkGovernanceConvergenceProtocol() {
  const badFixtures = [
    "bad-governance-convergence-writes-target-files",
    "bad-governance-convergence-rewrites-history",
    "bad-governance-convergence-replaces-release-sop",
    "bad-governance-convergence-mutates-ci-hooks",
    "bad-governance-convergence-ai-log-spam",
    "bad-governance-convergence-claims-production-approval",
    "bad-governance-convergence-maximizes-migration",
    "bad-governance-convergence-ignores-omitted-rules",
    "bad-governance-convergence-upstream-ready",
    "bad-governance-convergence-summary-json-state-mismatch",
    "bad-governance-convergence-dimensions-mismatch",
    "bad-governance-convergence-schema-one-dimension",
  ];
  const required = [
    "docs/plans/existing-project-governance-convergence-1.70-plan.md",
    "core/existing-project-governance-convergence.md",
    "docs/existing-project-governance-convergence.md",
    "templates/governance-convergence-report.md",
    "schemas/artifacts/governance-convergence.schema.json",
    "checklists/governance-convergence-review.md",
    "prompts/governance-convergence-agent.md",
    "governance-convergence-reports/.gitkeep",
    "scripts/resolve-governance-convergence.mjs",
    "scripts/check-governance-convergence.mjs",
    "examples/1.70-existing-project-governance-convergence/README.md",
    "examples/1.70-existing-project-governance-convergence/governed-web-admin/governance-convergence-reports/001-governed-web-admin.md",
    "examples/1.70-existing-project-governance-convergence/production-multiplatform/governance-convergence-reports/001-production-multiplatform.md",
    "examples/1.70-existing-project-governance-convergence/dirty-worktree-blocked/governance-convergence-reports/001-dirty-worktree.md",
    "releases/1.70.0/release-record.md",
    "releases/1.70.0/known-limitations.md",
    "releases/1.70.0/self-check-report.md",
    "releases/1.70.1/release-record.md",
    "releases/1.70.1/known-limitations.md",
    "releases/1.70.1/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/governance-convergence-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.70 governance convergence asset exists ${file}`);
    else fail(`1.70 governance convergence asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/existing-project-governance-convergence-1.70-plan.md"),
    read("core/existing-project-governance-convergence.md"),
    read("docs/existing-project-governance-convergence.md"),
    read("templates/governance-convergence-report.md"),
    read("schemas/artifacts/governance-convergence.schema.json"),
    read("scripts/resolve-governance-convergence.mjs"),
    read("scripts/check-governance-convergence.mjs"),
    exists("releases/1.70.0/release-record.md") ? read("releases/1.70.0/release-record.md") : "",
    exists("releases/1.70.1/release-record.md") ? read("releases/1.70.1/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Existing Project Governance Convergence",
    "IntentOS Operating Mode",
    "does not mean Codex can write project assets",
    "Governance Convergence Report",
    "governance_convergence_report",
    "workflow",
    "baseline",
    "audit",
    "release",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs",
    "risk_authority",
    "Audit Bridge",
    "AI Log Boundary",
    "CONVERGENCE_READY_FOR_PLAN",
    "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE",
    "CONVERGENCE_BLOCKED_BY_UPSTREAM_EVIDENCE",
    "upstream source requires input",
    "KEEP_EXISTING_STRICTER",
    "MERGE_AFTER_REVIEW",
    "MAP_TO_INTENTOS_ARTIFACT",
    "source_systems",
    "workflow_next",
    "native_migration",
    "existing_rule_reconciliation",
    "release_plan",
    "Human Summary",
    "Machine-Readable Evidence",
    "Unified Apply Plan",
    "Approval Record",
    "Controlled Apply Readiness",
    "This report is a derived read-only view",
    "This report maximizes migration: No",
  ]) {
    if (combined.includes(marker)) pass(`1.70 governance convergence includes ${marker}`);
    else fail(`1.70 governance convergence missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-governance-convergence.mjs",
    "node --check scripts/check-governance-convergence.mjs",
    "node scripts/cli.mjs convergence .",
    "node scripts/cli.mjs convergence-check .",
    "node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/governed-web-admin --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.70 package verify surface includes ${marker}`);
    else fail(`1.70 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-governance-convergence.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Governance Convergence Report")
    && resolver.stdout.includes("This report is a derived read-only view")
    && resolver.stdout.includes("## Convergence Dimensions")
    && resolver.stdout.includes("## AI Log Policy")) {
    pass("1.70 governance convergence resolver prints safe report");
  } else {
    fail(`1.70 governance convergence resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-governance-convergence.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "GOVERNANCE_CONVERGENCE_REPORT"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.70.1"
        && parsed.humanSummary?.intentosOperatingMode === "ACTIVE"
        && parsed.humanSummary?.canCodexWriteNow === "No"
        && parsed.humanSummary?.convergenceAuthority === "DERIVED_READ_ONLY"
        && parsed.boundaries?.writes_target_files === "No"
        && parsed.structuredEvidence?.artifact_type === "governance_convergence_report"
        && parsed.structuredEvidence?.boundary?.maximizes_migration === "No"
        && hasCompleteGovernanceConvergenceEvidence(parsed)) {
        pass("1.70 governance convergence resolver JSON includes safe authority fields");
      } else {
        fail(`1.70 governance convergence resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.70 governance convergence resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.70 governance convergence resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-governance-convergence.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Governance Convergence check passed")) {
    pass("1.70 governance convergence checker passes source repo");
  } else {
    fail(`1.70 governance convergence checker failed: ${source.stderr || source.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "governance-convergence-report-"));
  const explicitReportPath = path.join(explicitReportDir, "generated.md");
  fs.writeFileSync(explicitReportPath, resolver.stdout);
  const explicitReport = runNode([
    "scripts/check-governance-convergence.mjs",
    ".",
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (explicitReport.status === 0 && explicitReport.stdout.includes("Governance Convergence check passed")) {
    pass("1.70 governance convergence checker validates generated explicit report");
  } else {
    fail(`1.70 governance convergence explicit report check failed: ${explicitReport.stderr || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "convergence", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Governance Convergence Report")) {
    pass("CLI convergence delegates to governance convergence resolver");
  } else {
    fail(`CLI convergence failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "convergence-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Governance Convergence check passed")) {
    pass("CLI convergence-check delegates to governance convergence checker");
  } else {
    fail(`CLI convergence-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const target of [
    "examples/1.70-existing-project-governance-convergence/governed-web-admin",
    "examples/1.70-existing-project-governance-convergence/production-multiplatform",
    "examples/1.70-existing-project-governance-convergence/dirty-worktree-blocked",
  ]) {
    const example = runNode(["scripts/check-governance-convergence.mjs", target, "--require-structured-evidence"]);
    if (example.status === 0) pass(`1.70 governance convergence example passes strict checker ${target}`);
    else fail(`1.70 governance convergence example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-governance-convergence.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.70 governance convergence rejects ${target}`);
    else fail(`1.70 governance convergence must reject ${target}`);
  }
}
function checkAdoptionExecutionAssuranceProtocol() {
  const badFixtures = [
    "bad-adoption-assurance-full-without-simulation",
    "bad-adoption-assurance-missing-rule-coverage",
    "bad-adoption-assurance-unresolved-evidence",
    "bad-adoption-assurance-authorizes-write",
    "bad-adoption-assurance-claims-production-approval",
    "bad-adoption-assurance-mutates-ci-hooks",
    "bad-adoption-assurance-replaces-release-sop",
    "bad-adoption-assurance-stale-diff",
    "bad-adoption-assurance-ai-log-spam",
    "bad-adoption-assurance-empty-na-reason",
    "bad-adoption-assurance-verified-production-approved",
    "bad-adoption-assurance-summary-json-state-mismatch",
    "bad-adoption-assurance-surface-table-json-mismatch",
    "bad-adoption-assurance-source-blocked-verified",
    "bad-adoption-assurance-gitkeep-apply-chain-verified",
    "bad-adoption-assurance-simulation-missing-exit-code",
    "bad-adoption-assurance-simulation-target-diff-changed",
    "bad-adoption-assurance-unresolved-generated-evidence",
    "bad-adoption-assurance-unknown-evidence-prefix",
    "bad-adoption-assurance-surface-evidence-not-in-evidence-refs",
  ];
  const required = [
    "docs/plans/adoption-execution-assurance-1.71-plan.md",
    "core/adoption-execution-assurance.md",
    "docs/adoption-execution-assurance.md",
    "templates/adoption-assurance-report.md",
    "schemas/artifacts/adoption-assurance.schema.json",
    "checklists/adoption-assurance-review.md",
    "prompts/adoption-assurance-agent.md",
    "adoption-assurance-reports/.gitkeep",
    "scripts/resolve-adoption-assurance.mjs",
    "scripts/check-adoption-assurance.mjs",
    "examples/1.71-adoption-execution-assurance/README.md",
    "examples/1.71-adoption-execution-assurance/verified-existing-project/adoption-assurance-reports/001-verified.md",
    "examples/1.71-adoption-execution-assurance/partial-existing-project/adoption-assurance-reports/001-partial.md",
    "examples/1.71-adoption-execution-assurance/blocked-production-project/adoption-assurance-reports/001-blocked.md",
    "examples/1.71-adoption-execution-assurance/failed-assurance/adoption-assurance-reports/001-failed.md",
    "releases/1.71.0/release-record.md",
    "releases/1.71.0/known-limitations.md",
    "releases/1.71.0/self-check-report.md",
    "releases/1.71.1/release-record.md",
    "releases/1.71.1/known-limitations.md",
    "releases/1.71.1/self-check-report.md",
    "releases/1.71.2/release-record.md",
    "releases/1.71.2/known-limitations.md",
    "releases/1.71.2/self-check-report.md",
    "releases/1.71.3/release-record.md",
    "releases/1.71.3/known-limitations.md",
    "releases/1.71.3/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/adoption-assurance-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.71 adoption assurance asset exists ${file}`);
    else fail(`1.71 adoption assurance asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/adoption-execution-assurance-1.71-plan.md"),
    read("core/adoption-execution-assurance.md"),
    read("docs/adoption-execution-assurance.md"),
    read("templates/adoption-assurance-report.md"),
    read("schemas/artifacts/adoption-assurance.schema.json"),
    read("scripts/resolve-adoption-assurance.mjs"),
    read("scripts/check-adoption-assurance.mjs"),
    read("releases/1.71.3/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Adoption Execution Assurance",
    "Adoption Assurance Report",
    "adoption_assurance_report",
    "VERIFIED_ACTIVE",
    "PARTIAL_ADOPTION",
    "BLOCKED_BY_PROJECT_AUTHORITY",
    "BLOCKED_BY_UPSTREAM_EVIDENCE",
    "SIMULATION_PASSED",
    "PRESENT_UNVERIFIED",
    "source_systems",
    "steps",
    "exit_code",
    "output_digest",
    "target_diff_status",
    "UNCHANGED",
    "unknown evidence ref prefix",
    "surface ${surface.surface || \"<unknown>\"} evidence is listed in evidence_refs",
    "--out requires a relative report path",
    "read-only simulated task",
    "does not write target files",
    "does not approve release or production",
    "does not replace project-owned release SOP",
    "can_claim_full_adoption",
    "can_codex_write_now",
    "workflow_entry",
    "ai_rules_agents",
    "engineering_baseline",
    "environment_baseline",
    "release_rollback",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs_audit",
    "risk_authority",
    "apply_chain",
    "simulation_task",
  ]) {
    if (combined.includes(marker)) pass(`1.71 adoption assurance includes ${marker}`);
    else fail(`1.71 adoption assurance missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-adoption-assurance.mjs",
    "node --check scripts/check-adoption-assurance.mjs",
    "node scripts/cli.mjs adoption-assurance .",
    "node scripts/cli.mjs adoption-assurance-check .",
    "node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.71 package verify surface includes ${marker}`);
    else fail(`1.71 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-adoption-assurance.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Adoption Assurance Report")
    && resolver.stdout.includes("read-only evidence-bound verification view")
    && resolver.stdout.includes("## Adoption Surface Coverage")
    && resolver.stdout.includes("## Simulation Task Result")) {
    pass("1.71 adoption assurance resolver prints safe report");
  } else {
    fail(`1.71 adoption assurance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-adoption-assurance.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "ADOPTION_ASSURANCE_REPORT"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.110.0"
        && parsed.humanSummary?.canCodexWriteNow === "No"
        && parsed.structuredEvidence?.artifact_type === "adoption_assurance_report"
        && parsed.structuredEvidence?.schema_version === "1.110.0"
        && parsed.structuredEvidence?.can_codex_write_now === "No"
        && parsed.structuredEvidence?.control_effectiveness_binding?.requirement === "REQUIRED"
        && parsed.structuredEvidence?.control_effectiveness_binding?.status === "BLOCKED"
        && hasCompleteAdoptionAssuranceEvidence(parsed)) {
        pass("1.71 adoption assurance resolver JSON includes safe evidence fields");
      } else {
        fail(`1.71 adoption assurance resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.71 adoption assurance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.71 adoption assurance resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-adoption-assurance.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Adoption Assurance check passed")) {
    pass("1.71 adoption assurance checker passes source repo");
  } else {
    fail(`1.71 adoption assurance checker failed: ${source.stderr || source.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "adoption-assurance-target-"));
  const generatedReport = runNode([
    "scripts/resolve-adoption-assurance.mjs",
    explicitReportDir,
    "--out",
    "adoption-assurance-reports/generated.md",
  ]);
  const explicitReportPath = path.join(explicitReportDir, "adoption-assurance-reports", "generated.md");
  const explicitReport = runNode([
    "scripts/check-adoption-assurance.mjs",
    explicitReportDir,
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (generatedReport.status === 0
    && fs.existsSync(explicitReportPath)
    && explicitReport.status === 0
    && explicitReport.stdout.includes("Adoption Assurance check passed")) {
    pass("1.71 adoption assurance --out report is generated and checked as the same file");
  } else {
    fail(`1.71 adoption assurance --out explicit report check failed: ${generatedReport.stderr || explicitReport.stderr || generatedReport.stdout || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "adoption-assurance", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Adoption Assurance Report")) {
    pass("CLI adoption-assurance delegates to resolver");
  } else {
    fail(`CLI adoption-assurance failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "adoption-assurance-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Adoption Assurance check passed")) {
    pass("CLI adoption-assurance-check delegates to checker");
  } else {
    fail(`CLI adoption-assurance-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const [target, extraFlags] of [
    ["examples/1.71-adoption-execution-assurance/verified-existing-project", ["--require-simulation"]],
    ["examples/1.71-adoption-execution-assurance/partial-existing-project", []],
    ["examples/1.71-adoption-execution-assurance/blocked-production-project", []],
    ["examples/1.71-adoption-execution-assurance/failed-assurance", []],
  ]) {
    const example = runNode(["scripts/check-adoption-assurance.mjs", target, "--require-structured-evidence", ...extraFlags]);
    if (example.status === 0) pass(`1.71 adoption assurance example passes strict checker ${target}`);
    else fail(`1.71 adoption assurance example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-adoption-assurance.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.71 adoption assurance rejects ${target}`);
    else fail(`1.71 adoption assurance must reject ${target}`);
  }
}
function checkExistingProjectAdoptionAutopilotProtocol() {
  const badFixtures = [
    "bad-adoption-autopilot-technical-user-burden",
    "bad-adoption-autopilot-claims-full-adoption",
    "bad-adoption-autopilot-writes-performed",
    "bad-adoption-autopilot-authority-changed",
  ];
  const required = [
    "docs/plans/existing-project-safe-adoption-autopilot-1.81-plan.md",
    "core/existing-project-safe-adoption-autopilot.md",
    "docs/existing-project-safe-adoption-autopilot.md",
    "templates/existing-project-adoption-autopilot-report.md",
    "schemas/artifacts/existing-project-adoption-autopilot.schema.json",
    "checklists/existing-project-adoption-autopilot-review.md",
    "prompts/existing-project-adoption-autopilot-agent.md",
    "adoption-autopilot-reports/.gitkeep",
    "scripts/resolve-existing-project-adoption-autopilot.mjs",
    "scripts/check-existing-project-adoption-autopilot.mjs",
    "examples/1.81-existing-project-adoption-autopilot/governed-readonly/adoption-autopilot-reports/001-adoption.md",
    "examples/1.81-existing-project-adoption-autopilot/light-existing/adoption-autopilot-reports/001-adoption.md",
    "examples/1.81-existing-project-adoption-autopilot/dirty-blocked/adoption-autopilot-reports/001-adoption.md",
    "docs/plans/public-entry-adoption-integration-1.81.2-plan.md",
    "docs/plans/adoption-autopilot-plain-language-reference-1.81.3-plan.md",
    "releases/1.81.0/release-record.md",
    "releases/1.81.0/known-limitations.md",
    "releases/1.81.0/self-check-report.md",
    "releases/1.81.2/release-record.md",
    "releases/1.81.2/known-limitations.md",
    "releases/1.81.2/self-check-report.md",
    "releases/1.81.3/release-record.md",
    "releases/1.81.3/known-limitations.md",
    "releases/1.81.3/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/adoption-autopilot-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.81 adoption autopilot asset exists ${file}`);
    else fail(`1.81 adoption autopilot asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/existing-project-safe-adoption-autopilot-1.81-plan.md"),
    read("core/existing-project-safe-adoption-autopilot.md"),
    read("docs/existing-project-safe-adoption-autopilot.md"),
    read("templates/existing-project-adoption-autopilot-report.md"),
    read("schemas/artifacts/existing-project-adoption-autopilot.schema.json"),
    read("scripts/resolve-existing-project-adoption-autopilot.mjs"),
    read("scripts/check-existing-project-adoption-autopilot.mjs"),
    read("docs/start-here.md"),
    read("docs/for-existing-projects.md"),
    read("docs/reference/scripts.md"),
    read("docs/plans/public-entry-adoption-integration-1.81.2-plan.md"),
    read("docs/plans/adoption-autopilot-plain-language-reference-1.81.3-plan.md"),
    read("releases/1.81.0/release-record.md"),
    read("releases/1.81.2/release-record.md"),
    read("releases/1.81.3/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Existing Project Safe Adoption Autopilot",
    "Adoption Autopilot Plain-Language",
    "Public Entry Adoption Integration",
    "existing_project_adoption_autopilot",
    "AVAILABLE_FOR_SAFE_USE",
    "S0_READ_ONLY_ONLY",
    "project_authority_changed",
    "native_assets_installed",
    "full_adoption_claim",
    "adopt",
    "adopt-check",
    "does not write target-project files",
    "does not claim full adoption",
    "Technical Trace",
    "read-only orientation only",
    "safe adoption entry",
    "Maintainers may use `adopt`",
    "node scripts/cli.mjs adopt <existing-project> --intent",
    "node scripts/cli.mjs adopt-check <project>",
    "plain-language adoption state",
  ]) {
    if (combined.includes(marker)) pass(`1.81 adoption autopilot includes ${marker}`);
    else fail(`1.81 adoption autopilot missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-existing-project-adoption-autopilot.mjs",
    "node --check scripts/check-existing-project-adoption-autopilot.mjs",
    "node scripts/cli.mjs adopt . --intent",
    "node scripts/cli.mjs adopt-check . --allow-empty",
    "node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/governed-readonly --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.81 package verify surface includes ${marker}`);
    else fail(`1.81 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-existing-project-adoption-autopilot.mjs", ".", "--intent", "connect existing project"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Existing Project Adoption Autopilot Report")
    && resolver.stdout.includes("This report is a read-only adoption view")
    && resolver.stdout.includes("## Human Summary")
    && resolver.stdout.includes("## Technical Trace")) {
    pass("1.81 adoption autopilot resolver prints read-only result card");
  } else {
    fail(`1.81 adoption autopilot resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverHumanSummary = sectionBody(resolver.stdout, "Human Summary", { fallback: "" }) || "";
  const rawSummaryEnums = [
    "SAFE_READ_ONLY_ADOPTION_COMPLETE",
    "READY_FOR_RULE_ENTRY_REVIEW",
    "BLOCKED_BY_PROJECT_AUTHORITY",
    "BLOCKED_BY_UNSAFE_PROJECT_STATE",
    "BLOCKED_BY_PROJECT_NOT_FOUND",
    "FAILED_INVALID_EVIDENCE",
    "AVAILABLE_FOR_SAFE_USE",
    "READ_ONLY_DIAGNOSIS_ONLY",
    "NOT_AVAILABLE",
  ];
  const exposesRawSummaryEnum = rawSummaryEnums.some((marker) => resolverHumanSummary.includes(marker));
  if (resolver.status === 0
    && resolverHumanSummary.includes("Current state")
    && resolverHumanSummary.includes("IntentOS working mode")
    && /The project can|The project has authority rules|The project has an unsafe current state|The target project path was not found|The evidence is invalid or incomplete/.test(stripMarkdown(resolverHumanSummary))
    && /Available as a read-only working method|Read-only diagnosis only|Not available until/.test(stripMarkdown(resolverHumanSummary))
    && !exposesRawSummaryEnum
    && resolver.stdout.includes('"adoption_state"')
    && resolver.stdout.includes('"intentos_working_mode"')) {
    pass("1.81.3 adoption autopilot Human Summary uses plain language while JSON keeps technical state");
  } else {
    fail(`1.81.3 adoption autopilot Human Summary plain-language regression failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-existing-project-adoption-autopilot.mjs", ".", "--json", "--intent", "connect existing project"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXISTING_PROJECT_ADOPTION_AUTOPILOT"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.81.0"
        && parsed.structuredEvidence?.artifact_type === "existing_project_adoption_autopilot"
        && parsed.structuredEvidence?.project_authority_changed === "No"
        && parsed.structuredEvidence?.native_assets_installed === "No"
        && parsed.structuredEvidence?.full_adoption_claim === "No"
        && parsed.structuredEvidence?.writes_performed === "No"
        && parsed.structuredEvidence?.runtime_changes_performed === "No") {
        pass("1.81 adoption autopilot resolver JSON includes safe evidence fields");
      } else {
        fail(`1.81 adoption autopilot resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.81 adoption autopilot resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.81 adoption autopilot resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-existing-project-adoption-autopilot.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Existing Project Adoption Autopilot check passed")) {
    pass("1.81 adoption autopilot checker passes source repo with explicit allow-empty");
  } else {
    fail(`1.81 adoption autopilot checker failed source repo: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "adoption-autopilot-target-"));
  const generatedReport = runNode([
    "scripts/resolve-existing-project-adoption-autopilot.mjs",
    explicitReportDir,
    "--out",
    "adoption-autopilot-reports/generated.md",
  ]);
  const explicitReportPath = path.join(explicitReportDir, "adoption-autopilot-reports", "generated.md");
  const explicitReport = runNode([
    "scripts/check-existing-project-adoption-autopilot.mjs",
    explicitReportDir,
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (generatedReport.status === 0
    && fs.existsSync(explicitReportPath)
    && explicitReport.status === 0
    && explicitReport.stdout.includes("Existing Project Adoption Autopilot check passed")) {
    pass("1.81 adoption autopilot --out report is generated and checked as the same file");
  } else {
    fail(`1.81 adoption autopilot --out explicit report check failed: ${generatedReport.stderr || explicitReport.stderr || generatedReport.stdout || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "adopt", ".", "--intent", "connect existing project"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Existing Project Adoption Autopilot Report")) {
    pass("CLI adopt delegates to adoption autopilot resolver");
  } else {
    fail(`CLI adopt failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "adopt-check", ".", "--allow-empty"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Existing Project Adoption Autopilot check passed")) {
    pass("CLI adopt-check delegates to adoption autopilot checker");
  } else {
    fail(`CLI adopt-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const target of [
    "examples/1.81-existing-project-adoption-autopilot/governed-readonly",
    "examples/1.81-existing-project-adoption-autopilot/light-existing",
    "examples/1.81-existing-project-adoption-autopilot/dirty-blocked",
  ]) {
    const example = runNode(["scripts/check-existing-project-adoption-autopilot.mjs", target, "--require-structured-evidence"]);
    if (example.status === 0) pass(`1.81 adoption autopilot example passes strict checker ${target}`);
    else fail(`1.81 adoption autopilot example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-existing-project-adoption-autopilot.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.81 adoption autopilot rejects ${target}`);
    else fail(`1.81 adoption autopilot must reject ${target}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("Primary entry commands:")
    && cliHelp.stdout.includes("adopt")
    && cliHelp.stdout.includes("Read-only project orientation")
    && cliHelp.stdout.includes("Enter read-only existing-project safe adoption autopilot")) {
    pass("1.81.2 advanced entry reference preserves start/adopt distinction");
  } else {
    fail(`1.81.2 advanced entry reference missing start/adopt distinction: ${cliHelp.stderr || cliHelp.stdout}`);
  }

  const startHuman = runNode(["scripts/cli.mjs", "start", "."]);
  const forbiddenStartPhrases = [
    "Apply reviewed init plan",
    "--apply-plan adoption-plan.json",
    "init-project.mjs --apply-plan",
    "Write adoption plan",
    "Write init plan",
  ];
  const hasForbiddenStartPhrase = forbiddenStartPhrases.some((phrase) => startHuman.stdout.includes(phrase));
  if (startHuman.status === 0
    && startHuman.stdout.includes("## Public Entry Boundary")
    && startHuman.stdout.includes("`start` only reads and classifies the target")
    && startHuman.stdout.includes("Use `adopt <project> --intent")
    && !hasForbiddenStartPhrase) {
    pass("1.81.2 start output stays read-only and does not recommend direct apply actions");
  } else {
    fail(`1.81.2 start output boundary failed: ${startHuman.stderr || startHuman.stdout}`);
  }

  const startJson = runNode(["scripts/cli.mjs", "start", ".", "--json"]);
  if (startJson.status === 0) {
    try {
      const parsed = JSON.parse(startJson.stdout);
      if (parsed.startIsReadOnlyByDefault === true
        && parsed.publicEntryBoundary?.writesTargetProjectFiles === "No"
        && parsed.publicEntryBoundary?.startsAdoptionAutopilot === "No"
        && parsed.publicEntryBoundary?.appliesWorkflowAssets === "No"
        && String(parsed.publicEntryBoundary?.adopt || "").includes("existing-project safe adoption entry")) {
        pass("1.81.2 start JSON records public entry boundary");
      } else {
        fail(`1.81.2 start JSON missing public entry boundary: ${startJson.stdout}`);
      }
    } catch (error) {
      fail(`1.81.2 start JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.81.2 start JSON failed: ${startJson.stderr || startJson.stdout}`);
  }
}
function checkControlledNativeAdoptionReviewProtocol() {
  const examples = [
    "strong-governed-stay-partial",
    "weak-governance-repair",
    "messy-production-repair-only",
    "light-plan-only",
  ];
  const badFixtures = [
    "bad-controlled-native-adoption-review-dirty-plan-only",
    "bad-controlled-native-adoption-review-unknown-owner-repair",
    "bad-controlled-native-adoption-review-messy-selected-plan",
    "bad-controlled-native-adoption-review-maturity-depth-drift",
  ];
  const required = [
    "docs/plans/controlled-native-adoption-autopilot-review-1.82-plan.md",
    "core/controlled-native-adoption-autopilot-review.md",
    "docs/controlled-native-adoption-autopilot-review.md",
    "templates/controlled-native-adoption-review-report.md",
    "schemas/artifacts/controlled-native-adoption-review.schema.json",
    "checklists/controlled-native-adoption-review.md",
    "prompts/controlled-native-adoption-review-agent.md",
    "native-adoption-review-reports/.gitkeep",
    "scripts/resolve-controlled-native-adoption-review.mjs",
    "scripts/check-controlled-native-adoption-review.mjs",
    "examples/1.82-controlled-native-adoption-review/README.md",
    ...examples.map((example) => `examples/1.82-controlled-native-adoption-review/${example}/native-adoption-review-reports/001-review.md`),
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/native-adoption-review-reports/001-bad.md`),
    "releases/1.82.0/release-record.md",
    "releases/1.82.0/known-limitations.md",
    "releases/1.82.0/self-check-report.md",
    "releases/1.82.1/release-record.md",
    "releases/1.82.1/known-limitations.md",
    "releases/1.82.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.82 controlled native adoption review asset exists ${file}`);
    else fail(`1.82 controlled native adoption review asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/controlled-native-adoption-autopilot-review-1.82-plan.md"),
    read("core/controlled-native-adoption-autopilot-review.md"),
    read("docs/controlled-native-adoption-autopilot-review.md"),
    read("templates/controlled-native-adoption-review-report.md"),
    read("schemas/artifacts/controlled-native-adoption-review.schema.json"),
    read("checklists/controlled-native-adoption-review.md"),
    read("prompts/controlled-native-adoption-review-agent.md"),
    read("scripts/resolve-controlled-native-adoption-review.mjs"),
    read("scripts/check-controlled-native-adoption-review.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("docs/reference/scripts.md"),
    read("releases/1.82.0/release-record.md"),
    read("releases/1.82.1/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Controlled Native Adoption Review",
    "controlled_native_adoption_review",
    "adopt-review",
    "adopt-review-check",
    "review-only",
    "does not write target-project files",
    "source evidence",
    "derived_view",
    "source_outcome",
    "current_project_match",
    "blocker_class",
    "maturity adoption depth matches recommendation class",
    "native_apply_allowed",
    "STRONG_GOVERNED_PROJECT",
    "WEAK_GOVERNANCE_PROJECT",
    "MESSY_PRODUCTION_PROJECT",
    "LIGHT_LOW_RISK_PROJECT",
    "RECOMMEND_STAY_PARTIAL",
    "RECOMMEND_GOVERNANCE_REPAIR",
    "READY_FOR_SELECTED_NATIVE_PLAN_ONLY",
    "BLOCKED_BY_UNSAFE_PROJECT_STATE",
    "full_adoption_claim",
  ]) {
    if (combined.includes(marker)) pass(`1.82 controlled native adoption review includes ${marker}`);
    else fail(`1.82 controlled native adoption review missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-controlled-native-adoption-review.mjs",
    "node --check scripts/check-controlled-native-adoption-review.mjs",
    "node scripts/cli.mjs adopt-review . --intent",
    "node scripts/cli.mjs adopt-review-check . --allow-empty",
    "node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/strong-governed-stay-partial --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.82 package verify surface includes ${marker}`);
    else fail(`1.82 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-controlled-native-adoption-review.mjs", ".", "--intent", "review deeper IntentOS adoption"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Controlled Native Adoption Review Report")
    && resolver.stdout.includes("read-only maturity and adoption-depth recommendation")
    && resolver.stdout.includes("Native apply allowed")
    && resolver.stdout.includes("Full adoption claim")) {
    pass("1.82 controlled native adoption review resolver prints read-only result card");
  } else {
    fail(`1.82 controlled native adoption review resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-controlled-native-adoption-review.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Controlled Native Adoption Review check passed")) {
    pass("1.82 controlled native adoption review checker passes source repo with explicit allow-empty");
  } else {
    fail(`1.82 controlled native adoption review source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "adopt-review", ".", "--intent", "review deeper IntentOS adoption"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Controlled Native Adoption Review Report")) {
    pass("CLI adopt-review delegates to controlled native adoption review resolver");
  } else {
    fail(`CLI adopt-review failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "adopt-review-check", ".", "--allow-empty"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Controlled Native Adoption Review check passed")) {
    pass("CLI adopt-review-check delegates to controlled native adoption review checker");
  } else {
    fail(`CLI adopt-review-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.82-controlled-native-adoption-review/${example}`;
    const result = runNode(["scripts/check-controlled-native-adoption-review.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.82 controlled native adoption review example passes strict checker ${target}`);
    else fail(`1.82 controlled native adoption review example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-controlled-native-adoption-review.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.82 controlled native adoption review rejects ${fixture}`);
    else fail(`1.82 controlled native adoption review must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("adopt-review")
    && cliHelp.stdout.includes("Review whether an existing project should stay partial")) {
    pass("1.82 CLI help exposes adopt-review as primary entry");
  } else {
    fail(`1.82 CLI help missing adopt-review: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}
function checkTaskGovernanceProtocol() {
  const examples = [
    "low-copy-change",
    "medium-list-filter",
    "medium-frontend-interaction",
    "review-required-step-policy",
    "db-api-ui-change",
    "last-step-settlement",
    "permission-sensitive-workflow",
    "possible-high-downgraded",
    "project-native-rfc-mapping",
    "project-native-qa-checklist-mapping",
  ];
  const badFixtures = [
    "bad-task-governance-low-hidden-api-change",
    "bad-task-governance-low-no-reason",
    "bad-task-governance-medium-no-short-plan",
    "bad-task-governance-medium-hidden-permission-impact",
    "bad-task-governance-possible-high-no-clarification",
    "bad-task-governance-no-business-rule-closure",
    "bad-task-governance-no-change-impact-coverage",
    "bad-task-governance-no-execution-plan",
    "bad-task-governance-no-verification-plan",
    "bad-task-governance-closeout-without-evidence",
    "bad-task-governance-authorizes-implementation",
    "bad-task-governance-ignores-1.82-blocker",
    "bad-task-governance-technical-user-prompt",
    "bad-task-governance-stronger-rule-not-preserved",
    "bad-task-governance-project-native-digest-mismatch",
    "bad-task-governance-low-wrong-review-policy",
    "bad-task-governance-low-hidden-intent-api",
  ];
  const required = [
    "docs/plans/behavior-complete-existing-project-adoption-1.83-plan.md",
    "core/behavior-complete-existing-project-adoption.md",
    "docs/behavior-complete-existing-project-adoption.md",
    "templates/task-governance-report.md",
    "schemas/artifacts/task-governance.schema.json",
    "checklists/task-governance-review.md",
    "prompts/task-governance-agent.md",
    "task-governance-reports/.gitkeep",
    "scripts/resolve-task-governance.mjs",
    "scripts/check-task-governance.mjs",
    "examples/1.83-task-governance/README.md",
    ...examples.map((example) => `examples/1.83-task-governance/${example}/task-governance-reports/001-task-governance.md`),
    "examples/1.83-task-governance/project-native-rfc-mapping/docs/rfc-approval-review-workflow.md",
    "examples/1.83-task-governance/project-native-qa-checklist-mapping/docs/qa-permission-approval-checklist.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/task-governance-reports/001-bad.md`),
    "releases/1.83.0/release-record.md",
    "releases/1.83.0/known-limitations.md",
    "releases/1.83.0/self-check-report.md",
    "releases/1.83.1/release-record.md",
    "releases/1.83.1/known-limitations.md",
    "releases/1.83.1/self-check-report.md",
    "releases/1.83.2/release-record.md",
    "releases/1.83.2/known-limitations.md",
    "releases/1.83.2/self-check-report.md",
    "releases/1.83.3/release-record.md",
    "releases/1.83.3/known-limitations.md",
    "releases/1.83.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.83 task governance asset exists ${file}`);
    else fail(`1.83 task governance asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/behavior-complete-existing-project-adoption-1.83-plan.md"),
    read("core/behavior-complete-existing-project-adoption.md"),
    read("docs/behavior-complete-existing-project-adoption.md"),
    read("templates/task-governance-report.md"),
    read("schemas/artifacts/task-governance.schema.json"),
    read("checklists/task-governance-review.md"),
    read("prompts/task-governance-agent.md"),
    read("scripts/resolve-task-governance.mjs"),
    read("scripts/check-task-governance.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("releases/1.83.0/release-record.md"),
    read("releases/1.83.1/release-record.md"),
    read("releases/1.83.2/release-record.md"),
    read("releases/1.83.3/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Behavior-Complete Existing Project Adoption",
    "task_governance",
    "task-governance",
    "task-governance-check",
    "LOW",
    "MEDIUM",
    "POSSIBLE_HIGH",
    "HIGH",
    "required_before_implementation_review",
    "required_before_completion_claim",
    "review_policy",
    "review_level",
    "minimal_verification_status",
    "targeted_verification_status",
    "plain_user_summary",
    "LIGHTWEIGHT",
    "TARGETED",
    "BLOCKING_CLARIFICATION",
    "FULL",
    "implementation_authorized_by_this_report",
    "project-native evidence",
    "project_native_evidence_digest",
    "project_native_evidence_owner",
    "project_native_task_match",
    "STRONGER",
    "does not authorize implementation",
  ]) {
    if (combined.includes(marker)) pass(`1.83 task governance includes ${marker}`);
    else fail(`1.83 task governance missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-task-governance.mjs",
    "node --check scripts/check-task-governance.mjs",
    "node scripts/cli.mjs task-governance . --intent",
    "node scripts/cli.mjs task-governance-check . --allow-empty",
    "node scripts/check-task-governance.mjs examples/1.83-task-governance/low-copy-change --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.83 package verify surface includes ${marker}`);
    else fail(`1.83 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-task-governance.mjs", ".", "--intent", "change approval review workflow state transition"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Task Governance Report")
    && resolver.stdout.includes("Task impact")
    && resolver.stdout.includes("Plain user summary")
    && resolver.stdout.includes("Minimal verification status")
    && resolver.stdout.includes("Implementation authorized by this report")
    && resolver.stdout.includes("No")) {
    pass("1.83 task governance resolver prints non-authorizing task card");
  } else {
    fail(`1.83 task governance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const absoluteOut = runNode(["scripts/resolve-task-governance.mjs", ".", "--intent", "update README copy", "--out", "/tmp/task-governance.md"]);
  if (absoluteOut.status !== 0 && (absoluteOut.stderr || absoluteOut.stdout).includes("--out must be a relative path")) {
    pass("1.83 task governance rejects absolute --out path");
  } else {
    fail("1.83 task governance must reject absolute --out path");
  }

  const sourceCheck = runNode(["scripts/check-task-governance.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0) {
    pass("1.83 task governance checker passes source repo with existing evidence or explicit empty allowance");
  } else {
    fail(`1.83 task governance source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "task-governance", ".", "--intent", "change approval review workflow state transition"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Task Governance Report")) {
    pass("CLI task-governance delegates to resolver");
  } else {
    fail(`CLI task-governance failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "task-governance-check", ".", "--allow-empty"]);
  if (cliChecker.status === 0) {
    pass("CLI task-governance-check delegates to checker");
  } else {
    fail(`CLI task-governance-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.83-task-governance/${example}`;
    const result = runNode(["scripts/check-task-governance.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.83 task governance example passes strict checker ${target}`);
    else fail(`1.83 task governance example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-task-governance.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.83 task governance rejects ${fixture}`);
    else fail(`1.83 task governance must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("task-governance")
    && cliHelp.stdout.includes("Classify task impact")) {
    pass("1.83 CLI help exposes task-governance");
  } else {
    fail(`1.83 CLI help missing task-governance: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}
function checkWorkQueueTakeoverProtocol() {
  const examples = [
    "reliable-existing-system",
    "messy-todo-migration",
    "missing-task-system",
    "unsafe-dirty-project",
  ];
  const badFixtures = [
    "bad-work-queue-takeover-activates-all-todos",
    "bad-work-queue-takeover-multiple-current",
    "bad-work-queue-takeover-current-without-task-governance",
    "bad-work-queue-takeover-deletes-old-source",
    "bad-work-queue-takeover-claims-full-adoption",
    "bad-work-queue-takeover-backlog-executable",
    "bad-work-queue-takeover-stale-current",
    "bad-work-queue-takeover-approves-implementation",
  ];
  const required = [
    "docs/plans/work-queue-takeover-hardening-1.84.1-plan.md",
    "docs/plans/existing-project-work-queue-takeover-1.84-plan.md",
    "docs/plans/task-governance-consumer-integration-1.85-plan.md",
    "core/existing-project-work-queue-takeover.md",
    "docs/existing-project-work-queue-takeover.md",
    "templates/work-queue-takeover-report.md",
    "schemas/artifacts/work-queue-takeover.schema.json",
    "checklists/work-queue-takeover-review.md",
    "prompts/work-queue-takeover-agent.md",
    "work-queue-takeover-reports/.gitkeep",
    "scripts/resolve-work-queue-takeover.mjs",
    "scripts/check-work-queue-takeover.mjs",
    "examples/1.84-work-queue-takeover/README.md",
    ...examples.map((example) => `examples/1.84-work-queue-takeover/${example}/work-queue-takeover-reports/001-${reportNameForTakeoverExample(example)}.md`),
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/work-queue-takeover-reports/001-bad.md`),
    "releases/1.84.0/release-record.md",
    "releases/1.84.0/known-limitations.md",
    "releases/1.84.0/self-check-report.md",
    "releases/1.84.1/release-record.md",
    "releases/1.84.1/known-limitations.md",
    "releases/1.84.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.84 work queue takeover asset exists ${file}`);
    else fail(`1.84 work queue takeover asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/work-queue-takeover-hardening-1.84.1-plan.md"),
    read("docs/plans/existing-project-work-queue-takeover-1.84-plan.md"),
    read("core/existing-project-work-queue-takeover.md"),
    read("docs/existing-project-work-queue-takeover.md"),
    read("templates/work-queue-takeover-report.md"),
    read("schemas/artifacts/work-queue-takeover.schema.json"),
    read("checklists/work-queue-takeover-review.md"),
    read("prompts/work-queue-takeover-agent.md"),
    read("scripts/resolve-work-queue-takeover.mjs"),
    read("scripts/check-work-queue-takeover.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("releases/1.84.0/release-record.md"),
    read("releases/1.84.1/release-record.md"),
    read("releases/1.84.1/self-check-report.md"),
  ].join("\n");
  for (const marker of [
    "Existing Project Work Queue Takeover",
    "work_queue_takeover",
    "queue-takeover",
    "queue-takeover-check",
    "RELIABLE_EXISTING_TASK_SYSTEM",
    "MESSY_TASK_SYSTEM",
    "MISSING_TASK_SYSTEM",
    "UNSAFE_TO_TAKE_OVER",
    "MAP_EXISTING_TASK_SYSTEM",
    "ESTABLISH_INTENTOS_WORK_QUEUE",
    "BLOCK_TAKEOVER",
    "MIGRATE_CURRENT",
    "MIGRATE_BACKLOG",
    "ARCHIVE_SOURCE_ONLY",
    "source_digest",
    "source_item_digest",
    "task_governance_binding_status",
    "execution_review_eligible_after_task_governance",
    "takeover_review_ready",
    "can_execute_from_old_todo_directly",
    "task_governance_ref",
    "npm run verify:baseline",
    "npm run verify:industrial",
    "npm run verify:release",
    "does not authorize implementation",
  ]) {
    if (combined.includes(marker)) pass(`1.84 work queue takeover includes ${marker}`);
    else fail(`1.84 work queue takeover missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-work-queue-takeover.mjs",
    "node --check scripts/check-work-queue-takeover.mjs",
    "node scripts/cli.mjs queue-takeover . --intent",
    "node scripts/cli.mjs queue-takeover-check . --allow-empty",
    "node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/reliable-existing-system --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.84 package verify surface includes ${marker}`);
    else fail(`1.84 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-work-queue-takeover.mjs", "examples/1.84-work-queue-takeover/messy-todo-migration", "--intent", "continue old project tasks"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Work Queue Takeover Report")
    && resolver.stdout.includes("MESSY_TASK_SYSTEM")
    && resolver.stdout.includes("Can Codex execute tasks from old TODO directly")
    && resolver.stdout.includes("No")
    && resolver.stdout.includes("This report approves implementation: No")) {
    pass("1.84 work queue takeover resolver prints non-authorizing takeover report");
  } else {
    fail(`1.84 work queue takeover resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const absoluteOut = runNode(["scripts/resolve-work-queue-takeover.mjs", ".", "--intent", "continue old project tasks", "--out", "/tmp/work-queue-takeover.md"]);
  if (absoluteOut.status !== 0 && (absoluteOut.stderr || absoluteOut.stdout).includes("--out must be a relative path")) {
    pass("1.84 work queue takeover rejects absolute --out path");
  } else {
    fail("1.84 work queue takeover must reject absolute --out path");
  }

  const sourceCheck = runNode(["scripts/check-work-queue-takeover.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && (
    sourceCheck.stdout.includes("work queue takeover check skipped by explicit --allow-empty")
    || sourceCheck.stdout.includes("Work queue takeover check passed")
  )) {
    pass("1.84 work queue takeover checker accepts either explicit empty compatibility or validated current source evidence");
  } else {
    fail(`1.84 work queue takeover source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "queue-takeover", "examples/1.84-work-queue-takeover/messy-todo-migration", "--intent", "continue old project tasks"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Work Queue Takeover Report")) {
    pass("CLI queue-takeover delegates to resolver");
  } else {
    fail(`CLI queue-takeover failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "queue-takeover-check", "examples/1.84-work-queue-takeover/messy-todo-migration", "--require-structured-evidence"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Work queue takeover check passed")) {
    pass("CLI queue-takeover-check delegates to checker");
  } else {
    fail(`CLI queue-takeover-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.84-work-queue-takeover/${example}`;
    const result = runNode(["scripts/check-work-queue-takeover.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.84 work queue takeover example passes strict checker ${target}`);
    else fail(`1.84 work queue takeover example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-work-queue-takeover.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.84 work queue takeover rejects ${fixture}`);
    else fail(`1.84 work queue takeover must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("queue-takeover")
    && cliHelp.stdout.includes("old project's task records")) {
    pass("1.84 CLI help exposes queue-takeover");
  } else {
    fail(`1.84 CLI help missing queue-takeover: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}
function checkTaskGovernanceConsumerIntegrationProtocol() {
  const required = [
    "docs/plans/task-governance-consumer-integration-1.85-plan.md",
    "core/task-governance-consumer-integration.md",
    "docs/task-governance-consumer-integration.md",
    "scripts/lib/task-entry-binding.mjs",
    "examples/1.85-task-governance-consumer-integration/README.md",
    "examples/1.85-task-governance-consumer-integration/high-workflow-rule/task-governance-reports/001-task-governance.md",
    "examples/1.85-task-governance-consumer-integration/high-workflow-rule/work-queue-takeover-reports/001-current.md",
    "examples/1.85-task-governance-consumer-integration/high-workflow-rule/execution-assurance-reports/001-high-workflow-rule.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/task-governance-reports/001-task-governance.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/work-queue-takeover-reports/001-current.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/completion-evidence-reports/001-possible-high-blocked.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/closure-decisions/001-possible-high-blocked.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/delivery-status-cards/001-possible-high-blocked.md",
    "test-fixtures/bad/bad-task-consumer-missing-task-entry/closure-decisions/001-bad.md",
    "test-fixtures/bad/bad-task-consumer-possible-high-done/closure-decisions/001-bad.md",
    "releases/1.85.0/release-record.md",
    "releases/1.85.0/known-limitations.md",
    "releases/1.85.0/self-check-report.md",
    "releases/1.85.1/release-record.md",
    "releases/1.85.1/known-limitations.md",
    "releases/1.85.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.85 task governance consumer asset exists ${file}`);
    else fail(`1.85 task governance consumer asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/task-governance-consumer-integration-1.85-plan.md"),
    read("core/task-governance-consumer-integration.md"),
    read("docs/task-governance-consumer-integration.md"),
    read("docs/execution-assurance-chain.md"),
    read("docs/completion-evidence-gate.md"),
    read("docs/unified-closure-model.md"),
    read("docs/user-delivery-console.md"),
    read("scripts/lib/task-entry-binding.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("scripts/check-user-delivery-console.mjs"),
    read("releases/1.85.0/release-record.md"),
    read("releases/1.85.1/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Task Governance Consumer Integration",
    "task_entry_binding",
    "Task Entry Binding",
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
    "work_queue_item_ref",
    "work_queue_item_digest",
    "task_governance_ref",
    "task_governance_digest",
    "validateEvidenceBlock",
    "checkJointBinding",
    "resume_review_ref",
    "strict task consumer requires consumer task_ref",
    "referenced Work Queue report has valid structured evidence",
    "referenced Task Governance report has valid structured evidence",
    "POSSIBLE_HIGH",
    "plain user blocker",
    "does not authorize implementation",
    "does not approve release or production",
  ]) {
    if (combined.includes(marker)) pass(`1.85 task governance consumer includes ${marker}`);
    else fail(`1.85 task governance consumer missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/lib/task-entry-binding.mjs",
    "node scripts/check-execution-assurance.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --require-structured-evidence",
    "node scripts/check-completion-evidence.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --report completion-evidence-reports/001-possible-high-blocked.md --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer",
    "node scripts/check-closure-decision.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer --historical-audit",
    "node scripts/check-user-delivery-console.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.85 package verify surface includes ${marker}`);
    else fail(`1.85 package verify surface missing ${marker}`);
  }

  for (const [name, args] of [
    ["execution assurance high task consumer", ["scripts/check-execution-assurance.mjs", "examples/1.85-task-governance-consumer-integration/high-workflow-rule", "--require-structured-evidence"]],
    ["completion evidence possible-high blocked consumer", ["scripts/check-completion-evidence.mjs", "examples/1.85-task-governance-consumer-integration/possible-high-blocked", "--report", "completion-evidence-reports/001-possible-high-blocked.md", "--require-structured-evidence", "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]],
    ["closure possible-high blocked consumer", ["scripts/check-closure-decision.mjs", "examples/1.85-task-governance-consumer-integration/possible-high-blocked", "--require-task-governance", "--require-work-queue", "--strict-task-consumer", "--historical-audit"]],
    ["user delivery possible-high blocked consumer", ["scripts/check-user-delivery-console.mjs", "examples/1.85-task-governance-consumer-integration/possible-high-blocked", "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]],
  ]) {
    const result = runNode(args);
    if (result.status === 0) pass(`1.85 ${name} passes strict checker`);
    else fail(`1.85 ${name} failed: ${result.stderr || result.stdout}`);
  }

  for (const [name, target] of [
    ["missing task entry", "test-fixtures/bad/bad-task-consumer-missing-task-entry"],
    ["possible-high done claim", "test-fixtures/bad/bad-task-consumer-possible-high-done"],
  ]) {
    const result = runNode(["scripts/check-closure-decision.mjs", target, "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]);
    if (result.status !== 0) pass(`1.85 task consumer rejects ${name}`);
    else fail(`1.85 task consumer must reject ${name}`);
  }
}
function checkRuntimeHygieneProtocol() {
  const examples = [
    "git-old-branch-rebase-plan",
    "pre-push-structure-gate",
    "ci-environment-retry",
    "release-artifact-quota-preflight",
    "release-bundle-evidence-bloat",
    "strict-task-entry",
  ];
  const badFixtures = [
    "bad-runtime-hygiene-force-push-without-approval",
    "bad-runtime-hygiene-bypasses-pre-push",
    "bad-runtime-hygiene-claims-done-after-gate-fail",
    "bad-runtime-hygiene-artifact-delete-without-approval",
    "bad-runtime-hygiene-deletes-release-evidence",
    "bad-runtime-hygiene-reuses-release-id-after-prod-touch",
    "bad-runtime-hygiene-unknown-production-side-effect-continues",
    "bad-runtime-hygiene-bundle-slimming-deletes-evidence",
    "bad-runtime-hygiene-technical-user-burden",
    "bad-runtime-hygiene-ci-auto-without-safety-proof",
  ];
  const required = [
    "docs/plans/execution-release-runtime-hygiene-1.86-plan.md",
    "core/execution-release-runtime-hygiene.md",
    "docs/execution-release-runtime-hygiene.md",
    "templates/runtime-hygiene-report.md",
    "schemas/artifacts/runtime-hygiene.schema.json",
    "checklists/runtime-hygiene-review.md",
    "prompts/runtime-hygiene-agent.md",
    "runtime-hygiene-reports/.gitkeep",
    "scripts/resolve-runtime-hygiene.mjs",
    "scripts/check-runtime-hygiene.mjs",
    "examples/1.86-runtime-hygiene/README.md",
    "examples/1.86-runtime-hygiene/git-old-branch-rebase-plan/runtime-hygiene-reports/001-git-old-branch.md",
    "examples/1.86-runtime-hygiene/pre-push-structure-gate/runtime-hygiene-reports/001-pre-push-structure-gate.md",
    "examples/1.86-runtime-hygiene/ci-environment-retry/runtime-hygiene-reports/001-ci-environment-retry.md",
    "examples/1.86-runtime-hygiene/release-artifact-quota-preflight/runtime-hygiene-reports/001-artifact-quota.md",
    "examples/1.86-runtime-hygiene/release-bundle-evidence-bloat/runtime-hygiene-reports/001-bundle-evidence-bloat.md",
    "examples/1.86-runtime-hygiene/strict-task-entry/runtime-hygiene-reports/001-strict-task-entry.md",
    "examples/1.86-runtime-hygiene/strict-task-entry/work-queue-takeover-reports/001-current.md",
    "examples/1.86-runtime-hygiene/strict-task-entry/task-governance-reports/001-task-governance.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/runtime-hygiene-reports/001-bad.md`),
    "releases/1.86.0/release-record.md",
    "releases/1.86.0/known-limitations.md",
    "releases/1.86.0/self-check-report.md",
    "releases/1.86.1/release-record.md",
    "releases/1.86.1/known-limitations.md",
    "releases/1.86.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.86 runtime hygiene asset exists ${file}`);
    else fail(`1.86 runtime hygiene asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/execution-release-runtime-hygiene-1.86-plan.md"),
    read("core/execution-release-runtime-hygiene.md"),
    read("docs/execution-release-runtime-hygiene.md"),
    read("templates/runtime-hygiene-report.md"),
    read("schemas/artifacts/runtime-hygiene.schema.json"),
    read("checklists/runtime-hygiene-review.md"),
    read("prompts/runtime-hygiene-agent.md"),
    read("scripts/resolve-runtime-hygiene.mjs"),
    read("scripts/check-runtime-hygiene.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("releases/1.86.0/release-record.md"),
    read("releases/1.86.0/known-limitations.md"),
    read("releases/1.86.0/self-check-report.md"),
    read("releases/1.86.1/release-record.md"),
    read("releases/1.86.1/known-limitations.md"),
    read("releases/1.86.1/self-check-report.md"),
  ].join("\n");
  for (const marker of [
    "Execution And Release Runtime Hygiene",
    "runtime_hygiene",
    "runtime-hygiene",
    "runtime-hygiene-check",
    "GIT_LINEAGE_DIRTY",
    "COMMIT_SCOPE_MIXED",
    "PRE_PUSH_GATE_FAILED",
    "STRUCTURE_BUDGET_EXCEEDED",
    "CI_CODE_FAILURE",
    "CI_ENVIRONMENT_FAILURE",
    "RELEASE_PREFLIGHT_FAILED",
    "ARTIFACT_QUOTA_BLOCKED",
    "RELEASE_BUNDLE_OVERSIZED",
    "PRODUCTION_SIDE_EFFECT_UNKNOWN",
    "PRODUCTION_SIDE_EFFECT_PRESENT",
    "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR",
    "NEEDS_RELEASE_OWNER_APPROVAL",
    "NEEDS_PLAIN_USER_APPROVAL",
    "BLOCKED_BY_PRODUCTION_SIDE_EFFECT",
    "BLOCKED_BY_UNCLEAR_TASK_SCOPE",
    "runtime_hygiene_digest",
    "runtime_source_trace",
    "task_entry_binding",
    "retry_policy_allowed",
    "production_side_effect_checked",
    "strict-task-entry",
    "require-runtime-sources",
    "technical_terms_required",
    "approves commit or push: No",
    "approves release or production: No",
    "bypasses gates: No",
    "deletes artifacts: No",
    "force pushes: No",
    "does not approve commit",
  ]) {
    if (combined.includes(marker)) pass(`1.86 runtime hygiene includes ${marker}`);
    else fail(`1.86 runtime hygiene missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-runtime-hygiene.mjs",
    "node --check scripts/check-runtime-hygiene.mjs",
    "node scripts/cli.mjs runtime-hygiene . --intent",
    "node scripts/cli.mjs runtime-hygiene-check . --allow-empty",
    "node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/git-old-branch-rebase-plan --require-structured-evidence",
    "node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/strict-task-entry --require-structured-evidence --require-runtime-sources --strict-task-entry",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.86 package verify surface includes ${marker}`);
    else fail(`1.86 package verify surface missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-runtime-hygiene.mjs",
    "examples/1.86-runtime-hygiene/pre-push-structure-gate",
    "--intent",
    "pre-push structure budget gate failed",
    "--gate-output",
    "structure budget failed",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Runtime Hygiene Report")
    && resolver.stdout.includes("STRUCTURE_BUDGET_EXCEEDED")
    && resolver.stdout.includes("CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR")
    && resolver.stdout.includes("This report approves commit or push: No")
    && resolver.stdout.includes("This report bypasses gates: No")) {
    pass("1.86 runtime hygiene resolver prints non-authorizing gate report");
  } else {
    fail(`1.86 runtime hygiene resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const absoluteOut = runNode(["scripts/resolve-runtime-hygiene.mjs", ".", "--intent", "push current task", "--out", "/tmp/runtime-hygiene.md"]);
  if (absoluteOut.status !== 0 && (absoluteOut.stderr || absoluteOut.stdout).includes("--out must be a relative path")) {
    pass("1.86 runtime hygiene rejects absolute --out path");
  } else {
    fail("1.86 runtime hygiene must reject absolute --out path");
  }

  const emptyRuntimeHygieneRoot = fs.mkdtempSync(path.join(os.tmpdir(), "runtime-hygiene-empty-"));
  const sourceCheck = runNode(["scripts/check-runtime-hygiene.mjs", emptyRuntimeHygieneRoot, "--allow-empty"]);
  if (sourceCheck.status === 0 && (
    sourceCheck.stdout.includes("runtime hygiene check skipped by explicit --allow-empty")
    || sourceCheck.stdout.includes("Runtime hygiene check passed.")
  )) {
    pass("1.86 runtime hygiene checker passes source repo with explicit allow-empty or current evidence");
  } else {
    fail(`1.86 runtime hygiene source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "runtime-hygiene", ".", "--intent", "push current task"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Runtime Hygiene Report")) {
    pass("CLI runtime-hygiene delegates to resolver");
  } else {
    fail(`CLI runtime-hygiene failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "runtime-hygiene-check", emptyRuntimeHygieneRoot, "--allow-empty"]);
  if (cliChecker.status === 0 && (
    cliChecker.stdout.includes("runtime hygiene check skipped by explicit --allow-empty")
    || cliChecker.stdout.includes("Runtime hygiene check passed.")
  )) {
    pass("CLI runtime-hygiene-check delegates to checker");
  } else {
    fail(`CLI runtime-hygiene-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.86-runtime-hygiene/${example}`;
    const result = example === "strict-task-entry"
      ? runNode(["scripts/check-runtime-hygiene.mjs", target, "--require-structured-evidence", "--require-runtime-sources", "--strict-task-entry"])
      : runNode(["scripts/check-runtime-hygiene.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.86 runtime hygiene example passes strict checker ${target}`);
    else fail(`1.86 runtime hygiene example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-runtime-hygiene.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.86 runtime hygiene rejects ${fixture}`);
    else fail(`1.86 runtime hygiene must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("runtime-hygiene")
    && cliHelp.stdout.includes("Git, push, CI, artifact, bundle, or release-runtime blockers")) {
    pass("1.86 CLI help exposes runtime-hygiene");
  } else {
    fail(`1.86 CLI help missing runtime-hygiene: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}
function checkExecutionAssuranceChainProtocol() {
  const badFixtures = [
    "bad-execution-assurance-no-completion-contract",
    "bad-execution-assurance-missing-actual-diff",
    "bad-execution-assurance-unresolved-evidence",
    "bad-execution-assurance-stale-evidence",
    "bad-execution-assurance-patch-smell-verified",
    "bad-execution-assurance-unexpected-ci-hook",
    "bad-execution-assurance-safe-patch-broad-diff",
    "bad-execution-assurance-controlled-patch-no-debt",
    "bad-execution-assurance-missing-review",
    "bad-execution-assurance-adoption-without-source",
    "bad-execution-assurance-release-overclaim",
    "bad-execution-assurance-source-task-mismatch",
    "bad-execution-assurance-planned-path-mismatch",
    "bad-execution-assurance-source-digest-mismatch",
    "bad-execution-assurance-declarative-precise-evidence",
    "bad-execution-assurance-unresolved-plan-ref",
    "bad-execution-assurance-markdown-json-plan-mismatch",
  ];
  const required = [
    "docs/plans/execution-assurance-log-markdown-consistency-1.74.3-plan.md",
    "docs/plans/execution-assurance-runtime-plan-ref-binding-1.74.2-plan.md",
    "docs/plans/execution-assurance-vocabulary-docs-sync-1.74.1-plan.md",
    "docs/plans/execution-assurance-strict-binding-1.74-plan.md",
    "docs/plans/execution-assurance-empty-report-hardening-1.72.1-plan.md",
    "docs/plans/execution-assurance-chain-1.72-plan.md",
    "core/execution-assurance-chain.md",
    "docs/execution-assurance-chain.md",
    "templates/execution-assurance-report.md",
    "schemas/artifacts/execution-assurance.schema.json",
    "checklists/execution-assurance-review.md",
    "prompts/execution-assurance-agent.md",
    "execution-assurance-reports/.gitkeep",
    "scripts/resolve-execution-assurance.mjs",
    "scripts/check-execution-assurance.mjs",
    "examples/1.72-execution-assurance-chain/README.md",
    "examples/1.72-execution-assurance-chain/feature-contract-validation/execution-assurance-reports/001-contract-validation.md",
    "examples/1.72-execution-assurance-chain/old-project-intentos-adoption/execution-assurance-reports/001-adoption.md",
    "examples/1.72-execution-assurance-chain/safe-copy-patch/execution-assurance-reports/001-copy.md",
    "examples/1.72-execution-assurance-chain/safe-copy-patch/tasks/001-copy.md",
    "examples/1.72-execution-assurance-chain/patch-smell-backend-only/execution-assurance-reports/001-backend-only.md",
    "releases/1.72.0/release-record.md",
    "releases/1.72.0/known-limitations.md",
    "releases/1.72.0/self-check-report.md",
    "releases/1.72.1/release-record.md",
    "releases/1.72.1/known-limitations.md",
    "releases/1.72.1/self-check-report.md",
    "releases/1.74.0/release-record.md",
    "releases/1.74.0/known-limitations.md",
    "releases/1.74.0/self-check-report.md",
    "releases/1.74.1/release-record.md",
    "releases/1.74.1/known-limitations.md",
    "releases/1.74.1/self-check-report.md",
    "releases/1.74.2/release-record.md",
    "releases/1.74.2/known-limitations.md",
    "releases/1.74.2/self-check-report.md",
    "releases/1.74.3/release-record.md",
    "releases/1.74.3/known-limitations.md",
    "releases/1.74.3/self-check-report.md",
    "test-fixtures/bad/bad-execution-assurance-unresolved-plan-ref/evidence/copy-smoke.txt",
    "test-fixtures/bad/bad-execution-assurance-markdown-json-plan-mismatch/evidence/copy-smoke.txt",
    "test-fixtures/bad/bad-execution-assurance-markdown-json-plan-mismatch/tasks/001-copy.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/execution-assurance-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.72-1.74 execution assurance asset exists ${file}`);
    else fail(`1.72-1.74 execution assurance asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/execution-assurance-log-markdown-consistency-1.74.3-plan.md"),
    read("docs/plans/execution-assurance-empty-report-hardening-1.72.1-plan.md"),
    read("docs/plans/execution-assurance-chain-1.72-plan.md"),
    read("docs/plans/execution-assurance-strict-binding-1.74-plan.md"),
    read("docs/plans/execution-assurance-vocabulary-docs-sync-1.74.1-plan.md"),
    read("docs/plans/execution-assurance-runtime-plan-ref-binding-1.74.2-plan.md"),
    read("core/execution-assurance-chain.md"),
    read("docs/execution-assurance-chain.md"),
    read("templates/execution-assurance-report.md"),
    read("schemas/artifacts/execution-assurance.schema.json"),
    read("scripts/resolve-execution-assurance.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("releases/1.72.0/release-record.md"),
    read("releases/1.72.1/release-record.md"),
    read("releases/1.74.0/release-record.md"),
    read("releases/1.74.1/release-record.md"),
    read("releases/1.74.2/release-record.md"),
    read("releases/1.74.3/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Execution Assurance Chain",
    "Execution Assurance Report",
    "execution_assurance_report",
    "VERIFIED_DONE",
    "PARTIAL_DONE",
    "BLOCKED_BY_MISSING_EVIDENCE",
    "BLOCKED_BY_PATCH_SMELL",
    "NEEDS_HUMAN_DECISION",
    "FEATURE_IMPLEMENTATION",
    "ADOPTION_MIGRATION",
    "RELEASE_PREPARATION",
    "completion_contract",
    "planned_impact_map",
    "actual_diff",
    "evidence_bindings",
    "patch_assessment",
    "source_systems",
    "intent_digest",
    "source_system_ref",
    "source_task_ref",
    "current_task_match",
    "report_digest",
    "evidence_digest",
    "REQUIRES_EXPLICIT_EXECUTION_PLAN",
    "actual diff changed files are outside planned target paths",
    "No evidence chain, no verified completion",
    "no execution assurance reports found",
    "--allow-empty",
    "does not write target-project files",
    "does not approve commit or push",
    "does not approve release or production",
    "schema enum",
    "uppercase legacy identity tokens",
    "legacy source-kit identity drift",
    "execution_plan.plan_ref",
    "resolvable execution plan reference",
    "unresolved plan refs",
    "Execution Plan Binding Plan Ref",
    "Evidence Binding row count",
    "same-report generated-project smoke",
    "generated-project smoke",
  ]) {
    if (combined.includes(marker)) pass(`1.72-1.74 execution assurance includes ${marker}`);
    else fail(`1.72-1.74 execution assurance missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-execution-assurance.mjs",
    "node --check scripts/check-execution-assurance.mjs",
    "node scripts/cli.mjs execution-assurance . --intent \"verify execution completion\"",
    "node scripts/cli.mjs execution-assurance-check . --allow-empty",
    "node scripts/cli.mjs done-check .",
    "node scripts/cli.mjs verify-execution .",
    "node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.72-1.74 package verify surface includes ${marker}`);
    else fail(`1.72-1.74 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-execution-assurance.mjs", ".", "--intent", "verify execution completion"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Execution Assurance Report")
    && resolver.stdout.includes("## Completion Contract")
    && resolver.stdout.includes("## Actual Diff Binding")
    && resolver.stdout.includes("## Patch Assessment")) {
    pass("1.72-1.74 execution assurance resolver prints safe report");
  } else {
    fail(`1.72-1.74 execution assurance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-execution-assurance.mjs", ".", "--intent", "verify execution completion", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXECUTION_ASSURANCE"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.113.0"
        && parsed.structuredEvidence?.artifact_type === "execution_assurance_report"
        && parsed.structuredEvidence?.schema_version === "1.113.0"
        && parsed.structuredEvidence?.can_codex_write_now === "No"
        && parsed.structuredEvidence?.completion_contract
        && parsed.structuredEvidence?.planned_impact_map
        && parsed.structuredEvidence?.actual_diff
        && parsed.structuredEvidence?.patch_assessment
        && parsed.structuredEvidence?.runtime_trust_binding?.requirement === "NOT_REQUIRED"
        && parsed.structuredEvidence?.runtime_trust_binding?.status === "NOT_REQUIRED"
        && parsed.structuredEvidence?.business_universe_binding?.coverage_mapping_status === "BLOCKED"
        && parsed.structuredEvidence?.control_effectiveness_binding?.requirement === "REQUIRED"
        && parsed.structuredEvidence?.control_effectiveness_binding?.status === "BLOCKED"
        && parsed.structuredEvidence?.boundary?.approves_commit_or_push === "No") {
        pass("1.72-1.74 execution assurance resolver JSON includes safe evidence fields");
      } else {
        fail(`1.72-1.74 execution assurance resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.72-1.74 execution assurance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.72-1.74 execution assurance resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const emptyExecutionAssuranceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "execution-assurance-source-empty-"));
  const source = runNode(["scripts/check-execution-assurance.mjs", emptyExecutionAssuranceRoot, "--allow-empty"]);
  if (source.status === 0 && source.stdout.includes("Execution assurance check passed")) {
    pass("1.72-1.74 execution assurance checker allows explicit source asset check without reports");
  } else {
    fail(`1.72-1.74 execution assurance checker failed: ${source.stderr || source.stdout}`);
  }

  const emptyReportTarget = fs.mkdtempSync(path.join(os.tmpdir(), "execution-assurance-empty-"));
  const emptyReportCheck = runNode(["scripts/check-execution-assurance.mjs", emptyReportTarget]);
  if (emptyReportCheck.status !== 0 && /no execution assurance reports found/.test(emptyReportCheck.stderr || emptyReportCheck.stdout)) {
    pass("1.72.1 execution assurance rejects no-report completion checks by default");
  } else {
    fail(`1.72.1 execution assurance must reject no-report checks: ${emptyReportCheck.stderr || emptyReportCheck.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "execution-assurance-target-"));
  const generatedReport = runNode([
    "scripts/resolve-execution-assurance.mjs",
    explicitReportDir,
    "--intent",
    "verify execution completion",
    "--out",
    "execution-assurance-reports/generated.md",
  ]);
  const explicitReportPath = path.join(explicitReportDir, "execution-assurance-reports", "generated.md");
  const explicitReport = runNode([
    "scripts/check-execution-assurance.mjs",
    explicitReportDir,
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (generatedReport.status === 0
    && fs.existsSync(explicitReportPath)
    && explicitReport.status !== 0
    && `${explicitReport.stdout}\n${explicitReport.stderr}`.includes("does not bind Task Governance authority")) {
    pass("1.113 execution assurance --out report is checked as the same file and fails closed without current Task Governance");
  } else {
    fail(`1.72-1.74 execution assurance --out explicit report check failed: ${generatedReport.stderr || explicitReport.stderr || generatedReport.stdout || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "execution-assurance", ".", "--intent", "verify execution completion"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Execution Assurance Report")) {
    pass("CLI execution-assurance delegates to resolver");
  } else {
    fail(`CLI execution-assurance failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  for (const commandName of ["execution-assurance-check", "done-check", "verify-execution"]) {
    const cliChecker = runNode(["scripts/cli.mjs", commandName, "examples/1.72-execution-assurance-chain/feature-contract-validation"]);
    if (cliChecker.status === 0 && cliChecker.stdout.includes("Execution assurance check passed")) {
      pass(`CLI ${commandName} delegates to checker`);
    } else {
      fail(`CLI ${commandName} failed: ${cliChecker.stderr || cliChecker.stdout}`);
    }
  }

  for (const [target, extraFlags] of [
    ["examples/1.72-execution-assurance-chain/feature-contract-validation", ["--require-evidence-refs", "--require-review", "--require-actual-diff"]],
    ["examples/1.72-execution-assurance-chain/old-project-intentos-adoption", ["--require-evidence-refs", "--require-review", "--require-actual-diff"]],
    ["examples/1.72-execution-assurance-chain/safe-copy-patch", ["--require-evidence-refs", "--require-actual-diff"]],
    ["examples/1.72-execution-assurance-chain/patch-smell-backend-only", []],
  ]) {
    const example = runNode(["scripts/check-execution-assurance.mjs", target, "--require-structured-evidence", ...extraFlags]);
    if (example.status === 0) pass(`1.72-1.74 execution assurance example passes strict checker ${target}`);
    else fail(`1.72-1.74 execution assurance example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-execution-assurance.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.72-1.74 execution assurance rejects ${target}`);
    else fail(`1.72-1.74 execution assurance must reject ${target}`);
  }
}
function checkDocumentLifecycleProtocol() {
  const required = [
    "core/document-lifecycle.md",
    "docs/document-lifecycle.md",
    "docs/work-queue.md",
    "templates/document-lifecycle-report.md",
    "checklists/document-lifecycle-review.md",
    "prompts/document-lifecycle-agent.md",
    "doc-lifecycle-reports/.gitkeep",
    "scripts/resolve-document-lifecycle.mjs",
    "scripts/check-document-lifecycle.mjs",
    "scripts/resolve-work-queue.mjs",
    "scripts/check-work-queue.mjs",
    "examples/1.21-document-lifecycle/README.md",
    "examples/1.21-document-lifecycle/doc-lifecycle-reports/001-doc-lifecycle.md",
    "test-fixtures/bad/bad-document-lifecycle-authorizes-delete/doc-lifecycle-reports/001-bad.md",
    "test-fixtures/bad/bad-document-lifecycle-missing-source-of-truth/doc-lifecycle-reports/001-bad.md",
    "releases/1.21.0/release-record.md",
    "releases/1.21.0/known-limitations.md",
    "releases/1.21.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.21 document lifecycle asset exists ${file}`);
    else fail(`1.21 document lifecycle asset missing ${file}`);
  }

  const combined = [
    read("core/document-lifecycle.md"),
    read("docs/document-lifecycle.md"),
    read("templates/document-lifecycle-report.md"),
    read("scripts/resolve-document-lifecycle.mjs"),
    read("scripts/check-document-lifecycle.mjs"),
    read("releases/1.21.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Document Lifecycle Governance",
    "Document Lifecycle Report",
    "ACTIVE_SOURCE_OF_TRUTH",
    "DUPLICATE_CANDIDATE",
    "ARCHIVE_CANDIDATE",
    "DEPRECATION_CANDIDATE",
    "Codex must recommend archive review before recommending deletion",
    "Source Of Truth Map",
    "Archive Suggestions",
    "What Not To Delete",
    "does not delete files",
    "does not authorize deletion",
    "does not move or archive files",
    "does not change source of truth",
  ]) {
    if (combined.includes(marker)) pass(`1.21 document lifecycle includes ${marker}`);
    else fail(`1.21 document lifecycle missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-document-lifecycle.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Document Lifecycle Recommendation")
    && resolver.stdout.includes("This report deletes files: No")
    && resolver.stdout.includes("Archive Suggestions")) {
    pass("1.21 document lifecycle resolver passes source repo");
  } else {
    fail(`1.21 document lifecycle resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-document-lifecycle.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DOCUMENT_LIFECYCLE_RECOMMENDATION"
        && parsed.boundary?.deletesFiles === "No"
        && Array.isArray(parsed.sourceOfTruthMap)) {
        pass("1.21 document lifecycle resolver JSON includes map and boundary");
      } else {
        fail(`1.21 document lifecycle resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.21 document lifecycle resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.21 document lifecycle resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-document-lifecycle.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Document lifecycle check passed")) {
    pass("1.21 document lifecycle checker passes source repo");
  } else {
    fail(`1.21 document lifecycle checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-document-lifecycle.mjs", "examples/1.21-document-lifecycle"]);
  if (example.status === 0 && example.stdout.includes("Document lifecycle check passed")) {
    pass("1.21 document lifecycle example passes checker");
  } else {
    fail(`1.21 document lifecycle example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes deletion", ["scripts/check-document-lifecycle.mjs", "test-fixtures/bad/bad-document-lifecycle-authorizes-delete"], "authorizes deletion"],
    ["missing source of truth", ["scripts/check-document-lifecycle.mjs", "test-fixtures/bad/bad-document-lifecycle-missing-source-of-truth"], "source-of-truth map"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.21 document lifecycle rejects ${name}`);
    } else {
      fail(`1.21 document lifecycle must reject ${name}: ${output}`);
    }
  }
}
function checkDocumentArchiveApplyProtocol() {
  const required = [
    "core/document-archive-apply.md",
    "docs/document-archive-apply.md",
    "templates/document-archive-apply-plan.md",
    "templates/archive-index.md",
    "checklists/document-archive-apply-review.md",
    "prompts/document-archive-agent.md",
    "archive-apply-plans/.gitkeep",
    "scripts/resolve-document-archive-apply.mjs",
    "scripts/check-document-archive-apply.mjs",
    "examples/1.28-document-archive-apply/README.md",
    "examples/1.28-document-archive-apply/archive-apply-plans/001-archive-plan.md",
    "test-fixtures/bad/bad-archive-apply-authorizes-archive/archive-apply-plans/001-bad.md",
    "test-fixtures/bad/bad-archive-apply-missing-index/archive-apply-plans/001-bad.md",
    "releases/1.28.0/release-record.md",
    "releases/1.28.0/known-limitations.md",
    "releases/1.28.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.28 document archive apply asset exists ${file}`);
    else fail(`1.28 document archive apply asset missing ${file}`);
  }

  const combined = [
    read("core/document-archive-apply.md"),
    read("docs/document-archive-apply.md"),
    read("templates/document-archive-apply-plan.md"),
    read("templates/archive-index.md"),
    read("scripts/resolve-document-archive-apply.mjs"),
    read("scripts/check-document-archive-apply.mjs"),
    read("releases/1.28.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Document Archive Apply Governance",
    "Document Archive Apply Plan",
    "Archive Apply States",
    "Link Check Plan",
    "Archive Index",
    "Rollback Plan",
    "This plan authorizes archive apply: No",
    "This plan replaces Document Lifecycle: No",
  ]) {
    if (combined.includes(marker)) pass(`1.28 document archive apply includes ${marker}`);
    else fail(`1.28 document archive apply missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-document-archive-apply.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Document Archive Apply Plan")
    && resolver.stdout.includes("Link Check Plan")
    && resolver.stdout.includes("This plan authorizes archive apply: No")) {
    pass("1.28 document archive apply resolver prints safe plan");
  } else {
    fail(`1.28 document archive apply resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-document-archive-apply.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DOCUMENT_ARCHIVE_APPLY_PLAN"
        && parsed.boundaries?.authorizesArchiveApply === "No"
        && parsed.boundaries?.movesOrArchivesFilesNow === "No"
        && parsed.linkCheckPlan
        && parsed.archiveIndex) {
        pass("1.28 document archive apply resolver JSON includes boundaries, link check, and index");
      } else {
        fail(`1.28 document archive apply resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.28 document archive apply resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.28 document archive apply resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-document-archive-apply.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Document Archive Apply check passed")) {
    pass("1.28 document archive apply checker passes source repo");
  } else {
    fail(`1.28 document archive apply checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-document-archive-apply.mjs", "examples/1.28-document-archive-apply"]);
  if (example.status === 0 && example.stdout.includes("Document Archive Apply check passed")) {
    pass("1.28 document archive apply example passes checker");
  } else {
    fail(`1.28 document archive apply example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes archive apply", ["scripts/check-document-archive-apply.mjs", "test-fixtures/bad/bad-archive-apply-authorizes-archive"], "forbidden archive apply claim"],
    ["missing archive index", ["scripts/check-document-archive-apply.mjs", "test-fixtures/bad/bad-archive-apply-missing-index"], "missing Archive Index"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.28 document archive apply rejects ${name}`);
    } else {
      fail(`1.28 document archive apply must reject ${name}: ${output}`);
    }
  }
}
function checkUnifiedApplyPlanProtocol() {
  const required = [
    "core/unified-apply-plan.md",
    "docs/unified-apply-plan.md",
    "docs/plans/unified-apply-plan-1.34-plan.md",
    "templates/unified-apply-plan.md",
    "checklists/unified-apply-plan-review.md",
    "prompts/apply-plan-agent.md",
    "apply-plans/.gitkeep",
    "scripts/resolve-apply-plan.mjs",
    "scripts/check-apply-plan.mjs",
    "examples/1.34-unified-apply-plan/README.md",
    "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md",
    "test-fixtures/bad/bad-apply-plan-authorizes-apply/apply-plans/001-bad.md",
    "test-fixtures/bad/bad-apply-plan-writes-now/apply-plans/001-bad.md",
    "releases/1.34.0/release-record.md",
    "releases/1.34.0/known-limitations.md",
    "releases/1.34.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.34 unified apply plan asset exists ${file}`);
    else fail(`1.34 unified apply plan asset missing ${file}`);
  }

  const combined = [
    read("core/unified-apply-plan.md"),
    read("docs/unified-apply-plan.md"),
    read("templates/unified-apply-plan.md"),
    read("scripts/resolve-apply-plan.mjs"),
    read("scripts/check-apply-plan.mjs"),
    read("releases/1.34.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Unified Apply Plan Governance",
    "Unified Apply Plan",
    "Apply States",
    "Planned Actions",
    "Human-Only / Blocked Actions",
    "Backup / Rollback Plan",
    "This plan writes files now: No",
    "This plan authorizes apply: No",
    "This plan approves implementation: No",
    "This plan approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.34 unified apply plan includes ${marker}`);
    else fail(`1.34 unified apply plan missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain IntentOS apply plan", "--action", "workflow-assets"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Apply Plan")
    && resolver.stdout.includes("This plan authorizes apply: No")
    && resolver.stdout.includes("Can Codex write now: No")) {
    pass("1.34 unified apply plan resolver prints safe plan");
  } else {
    fail(`1.34 unified apply plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain IntentOS apply plan", "--action", "workflow-assets", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "UNIFIED_APPLY_PLAN"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.boundary?.writesFilesNow === "No"
        && Array.isArray(parsed.plannedActions)
        && parsed.plannedActions.every((action) => action.willWriteNow === "No")) {
        pass("1.34 unified apply plan resolver JSON includes actions and boundaries");
      } else {
        fail(`1.34 unified apply plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.34 unified apply plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.34 unified apply plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-apply-plan.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Unified Apply Plan check passed")) {
    pass("1.34 unified apply plan checker passes source repo");
  } else {
    fail(`1.34 unified apply plan checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-apply-plan.mjs", "examples/1.34-unified-apply-plan"]);
  if (example.status === 0 && example.stdout.includes("Unified Apply Plan check passed")) {
    pass("1.34 unified apply plan example passes checker");
  } else {
    fail(`1.34 unified apply plan example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes apply", ["scripts/check-apply-plan.mjs", "test-fixtures/bad/bad-apply-plan-authorizes-apply"], "forbidden apply plan claim"],
    ["writes now", ["scripts/check-apply-plan.mjs", "test-fixtures/bad/bad-apply-plan-writes-now"], "planned actions must not write now"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.34 unified apply plan rejects ${name}`);
    } else {
      fail(`1.34 unified apply plan must reject ${name}: ${output}`);
    }
  }
}
function checkControlledApplyReadinessProtocol() {
  const required = [
    "core/controlled-apply-readiness.md",
    "docs/controlled-apply-readiness.md",
    "docs/plans/controlled-apply-readiness-1.38-plan.md",
    "templates/controlled-apply-readiness-report.md",
    "checklists/controlled-apply-readiness-review.md",
    "prompts/controlled-apply-readiness-agent.md",
    "apply-readiness-reports/.gitkeep",
    "scripts/resolve-controlled-apply-readiness.mjs",
    "scripts/check-controlled-apply-readiness.mjs",
    "examples/1.38-controlled-apply-readiness/README.md",
    "examples/1.38-controlled-apply-readiness/apply-readiness-reports/001-workflow-assets.md",
    "test-fixtures/bad/bad-controlled-apply-authorizes-apply/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-controlled-apply-high-risk-ready/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-controlled-apply-proceeds-without-approval/apply-readiness-reports/001-bad.md",
    "releases/1.38.0/release-record.md",
    "releases/1.38.0/known-limitations.md",
    "releases/1.38.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.38 controlled apply readiness asset exists ${file}`);
    else fail(`1.38 controlled apply readiness asset missing ${file}`);
  }

  const combined = [
    read("core/controlled-apply-readiness.md"),
    read("docs/controlled-apply-readiness.md"),
    read("templates/controlled-apply-readiness-report.md"),
    read("scripts/resolve-controlled-apply-readiness.mjs"),
    read("scripts/check-controlled-apply-readiness.mjs"),
    read("releases/1.38.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Controlled Apply Readiness Governance",
    "It does not execute the plan",
    "READY_FOR_HUMAN_APPROVED_APPLY",
    "Human-Only Actions",
    "This readiness report writes files now: No",
    "This readiness report authorizes apply: No",
    "This readiness report approves implementation: No",
    "This readiness report approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.38 controlled apply readiness includes ${marker}`);
    else fail(`1.38 controlled apply readiness missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "apply-readiness",
    "apply-readiness-check",
    "scripts/resolve-controlled-apply-readiness.mjs",
    "scripts/check-controlled-apply-readiness.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports controlled apply readiness marker ${marker}`);
    else fail(`CLI missing controlled apply readiness marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "controlled-apply-readiness-report",
    "apply-readiness-reports",
    "controlled-apply-readiness-report.md",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports controlled apply readiness marker ${marker}`);
    else fail(`new-workflow-item missing controlled apply readiness marker ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-controlled-apply-readiness.mjs", ".", "--plan", "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md", "--git-state", "clean"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Controlled Apply Readiness Report")
    && resolver.stdout.includes("Can Codex apply now")
    && resolver.stdout.includes("This readiness report authorizes apply: No")) {
    pass("1.38 controlled apply readiness resolver prints safe report");
  } else {
    fail(`1.38 controlled apply readiness resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-controlled-apply-readiness.mjs", ".", "--plan", "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md", "--git-state", "clean", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "CONTROLLED_APPLY_READINESS"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.boundary?.writesFilesNow === "No"
        && parsed.readinessState?.canProceedWithoutNewApproval === "No") {
        pass("1.38 controlled apply readiness resolver JSON includes boundaries");
      } else {
        fail(`1.38 controlled apply readiness resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.38 controlled apply readiness resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.38 controlled apply readiness resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-controlled-apply-readiness.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Controlled Apply Readiness check passed")) {
    pass("1.38 controlled apply readiness checker passes source repo");
  } else {
    fail(`1.38 controlled apply readiness checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-controlled-apply-readiness.mjs", "examples/1.38-controlled-apply-readiness"]);
  if (example.status === 0 && example.stdout.includes("Controlled Apply Readiness check passed")) {
    pass("1.38 controlled apply readiness example passes checker");
  } else {
    fail(`1.38 controlled apply readiness example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes apply", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-authorizes-apply"], "forbidden controlled apply readiness claim"],
    ["high-risk ready", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-high-risk-ready"], "cannot be READY_FOR_HUMAN_APPROVED_APPLY"],
    ["proceeds without approval", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-proceeds-without-approval"], "must state it cannot proceed without new approval"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.38 controlled apply readiness rejects ${name}`);
    } else {
      fail(`1.38 controlled apply readiness must reject ${name}: ${output}`);
    }
  }
}
function checkApprovalRecordGovernanceProtocol() {
  const required = [
    "core/approval-record-governance.md",
    "docs/approval-record-governance.md",
    "docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md",
    "docs/plans/approval-record-governance-1.40-plan.md",
    "docs/plans/approval-record-hardening-1.40.1-plan.md",
    "docs/plans/structured-evidence-schema-1.41-plan.md",
    "docs/plans/structured-evidence-hardening-1.41.1-plan.md",
    "docs/artifact-lifecycle.md",
    "docs/o0-bl0-lightweight-path.md",
    "docs/structured-evidence-schema.md",
    "templates/approval-record.md",
    "templates/controlled-apply-readiness-report.md",
    "templates/unified-apply-plan.md",
    "checklists/approval-record-review.md",
    "prompts/approval-record-agent.md",
    "approval-records/.gitkeep",
    "schemas/artifacts/approval-record.schema.json",
    "schemas/artifacts/controlled-apply-readiness.schema.json",
    "schemas/artifacts/unified-apply-plan.schema.json",
    "scripts/lib/artifact-schema.mjs",
    "scripts/check-apply-plan.mjs",
    "scripts/check-controlled-apply-readiness.mjs",
    "scripts/check-approval-record.mjs",
    "examples/1.40-approval-record-governance/README.md",
    "examples/1.40-approval-record-governance/approval-records/001-workflow-assets.md",
    "examples/1.41-structured-evidence-schema/README.md",
    "examples/1.41-structured-evidence-schema/apply-plans/001-structured-workflow-assets.md",
    "examples/1.41-structured-evidence-schema/apply-readiness-reports/001-structured-workflow-assets.md",
    "examples/1.41-structured-evidence-schema/approval-records/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-approval-record-ai-owner/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-missing-plan-hash/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-all-actions/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-auto-apply/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-high-risk/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-wildcard-path/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-parent-traversal/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-symlink-path/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-expired/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-ambiguous-owner/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-mismatched-action-id/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-plan-changed/approval-records/001-bad.md",
    "test-fixtures/bad/bad-structured-apply-plan-digest/apply-plans/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-plan-digest/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-approval-plan-digest/approval-records/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-missing-plan-ref/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-empty-actions/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-approval-missing-plan-ref/approval-records/001-bad.md",
    "releases/1.40.0/release-record.md",
    "releases/1.40.0/known-limitations.md",
    "releases/1.40.0/self-check-report.md",
    "releases/1.40.1/release-record.md",
    "releases/1.40.1/known-limitations.md",
    "releases/1.40.1/self-check-report.md",
    "releases/1.41.0/release-record.md",
    "releases/1.41.0/known-limitations.md",
    "releases/1.41.0/self-check-report.md",
    "releases/1.41.1/release-record.md",
    "releases/1.41.1/known-limitations.md",
    "releases/1.41.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.40 approval record asset exists ${file}`);
    else fail(`1.40 approval record asset missing ${file}`);
  }

  const combined = [
    read("core/approval-record-governance.md"),
    read("docs/approval-record-governance.md"),
    read("templates/approval-record.md"),
    read("scripts/check-approval-record.mjs"),
    read("scripts/lib/artifact-schema.mjs"),
    read("releases/1.40.0/release-record.md"),
    read("releases/1.40.1/release-record.md"),
    read("releases/1.41.0/release-record.md"),
    read("releases/1.41.1/release-record.md"),
    read("docs/artifact-lifecycle.md"),
    read("docs/o0-bl0-lightweight-path.md"),
    read("docs/structured-evidence-schema.md"),
  ].join("\n");

  for (const marker of [
    "Approval Record Governance",
    "Which exact low-risk actions remain inside the current user's explicit business request?",
    "Approval owner type",
    "Plan hash",
    "Approved action IDs must be explicit",
    "Artifact Lifecycle Map",
    "O0 / BL0 Lightweight Path",
    "Structured Evidence Schema",
    "Machine-Readable Evidence",
    "require-structured-evidence",
    "plan_digest",
    "canonical evidence digest",
    "wildcard paths",
    "parent directory traversal",
    "symlink aliases",
    "This approval record authorizes automatic apply: No",
    "This approval record approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.40 approval record includes ${marker}`);
    else fail(`1.40 approval record missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "approval-record-check",
    "scripts/check-approval-record.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports approval record marker ${marker}`);
    else fail(`CLI missing approval record marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "approval-record",
    "approval-records",
    "approval-record.md",
    "Approval status: `DRAFT`",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports approval record marker ${marker}`);
    else fail(`new-workflow-item missing approval record marker ${marker}`);
  }

  const check = runNode(["scripts/check-approval-record.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Approval Record check passed")) {
    pass("1.40 approval record checker passes source repo");
  } else {
    fail(`1.40 approval record checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-approval-record.mjs", "examples/1.40-approval-record-governance"]);
  if (example.status === 0 && example.stdout.includes("Approval Record check passed")) {
    pass("1.40 approval record example passes checker");
  } else {
    fail(`1.40 approval record example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["structured apply plan", ["scripts/check-apply-plan.mjs", "examples/1.41-structured-evidence-schema"], "structured apply plan evidence matches schema"],
    ["structured readiness", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.41-structured-evidence-schema"], "structured readiness evidence matches schema"],
    ["structured approval", ["scripts/check-approval-record.mjs", "examples/1.41-structured-evidence-schema"], "structured approval evidence matches schema"],
    ["strict structured apply plan", ["scripts/check-apply-plan.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"], "structured apply plan evidence matches schema"],
    ["strict structured readiness", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"], "structured readiness references matching apply plan digest"],
    ["strict structured approval", ["scripts/check-approval-record.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"], "structured approval references matching apply plan digest"],
  ]) {
    const result = runNode(args);
    if (result.status === 0 && result.stdout.includes(expected)) {
      pass(`1.41 ${name} example passes checker`);
    } else {
      fail(`1.41 ${name} example failed: ${result.stderr || result.stdout}`);
    }
  }

  for (const [name, args, expected] of [
    ["AI owner", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-ai-owner"], "current conversation user or another specific human confirmer"],
    ["missing plan hash", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-missing-plan-hash"], "must include a plan hash"],
    ["all actions", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-all-actions"], "approved action ids must be explicit"],
    ["auto apply", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-auto-apply"], "forbidden approval record claim"],
    ["high risk", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-high-risk"], "cannot approve high-risk actions"],
    ["wildcard path", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-wildcard-path"], "must use exact bounded target paths"],
    ["parent traversal", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-parent-traversal"], "must use exact bounded target paths"],
    ["symlink path", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-symlink-path"], "must use exact bounded target paths"],
    ["expired approval", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-expired"], "is expired and must be re-approved"],
    ["ambiguous owner", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-ambiguous-owner"], "current conversation user or another specific human confirmer"],
    ["mismatched action ID", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-mismatched-action-id"], "human approval statement must match approved action IDs"],
    ["plan changed", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-plan-changed"], "plan changed after approval"],
    ["structured apply digest", ["scripts/check-apply-plan.mjs", "test-fixtures/bad/bad-structured-apply-plan-digest"], "plan_digest does not match canonical evidence digest"],
    ["structured readiness digest", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-structured-readiness-plan-digest"], "apply_plan.plan_digest does not match referenced apply plan evidence"],
    ["structured approval digest", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-structured-approval-plan-digest"], "approved_plan.plan_digest does not match referenced apply plan evidence"],
    ["strict apply missing structured evidence", ["scripts/check-apply-plan.mjs", "examples/1.34-unified-apply-plan", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict readiness missing structured evidence", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.38-controlled-apply-readiness", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict approval missing structured evidence", ["scripts/check-approval-record.mjs", "examples/1.40-approval-record-governance", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict readiness missing plan reference", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-structured-readiness-missing-plan-ref", "--require-structured-evidence"], "plan reference must resolve"],
    ["strict approval missing plan reference", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-structured-approval-missing-plan-ref", "--require-structured-evidence"], "plan reference must resolve"],
    ["structured readiness empty actions", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-structured-readiness-empty-actions"], "structured readiness actions must not be empty"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.40 approval record rejects ${name}`);
    } else {
      fail(`1.40 approval record must reject ${name}: ${output}`);
    }
  }
}
function checkBeginnerEntryProtocol() {
  const required = [
    "core/beginner-entry.md",
    "docs/beginner-entry.md",
    "docs/plans/beginner-entry-1.35-plan.md",
    "templates/beginner-entry-card.md",
    "checklists/beginner-entry-review.md",
    "prompts/beginner-entry-agent.md",
    "beginner-entry-cards/.gitkeep",
    "scripts/resolve-beginner-entry.mjs",
    "scripts/check-beginner-entry.mjs",
    "examples/1.35-beginner-entry/README.md",
    "examples/1.35-beginner-entry/beginner-entry-cards/001-appointment-app.md",
    "test-fixtures/bad/bad-beginner-entry-authorizes-write/beginner-entry-cards/001-bad.md",
    "test-fixtures/bad/bad-beginner-entry-jargon/beginner-entry-cards/001-bad.md",
    "test-fixtures/bad/bad-beginner-entry-too-many-questions/beginner-entry-cards/001-bad.md",
    "releases/1.35.0/release-record.md",
    "releases/1.35.0/known-limitations.md",
    "releases/1.35.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.35 beginner entry asset exists ${file}`);
    else fail(`1.35 beginner entry asset missing ${file}`);
  }

  const combined = [
    read("core/beginner-entry.md"),
    read("docs/beginner-entry.md"),
    read("templates/beginner-entry-card.md"),
    read("scripts/resolve-beginner-entry.mjs"),
    read("scripts/check-beginner-entry.mjs"),
    read("releases/1.35.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Beginner Entry Governance",
    "users who should not need to know IntentOS workflow commands",
    "ask at most 2 plain business questions by default",
    "Beginner Entry Card",
    "What Codex Must Not Do Yet",
    "This entry writes target files: No",
    "This entry authorizes apply: No",
    "This entry approves implementation: No",
    "This entry approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.35 beginner entry includes ${marker}`);
    else fail(`1.35 beginner entry missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "ask",
    "ask-check",
    "scripts/resolve-beginner-entry.mjs",
    "scripts/check-beginner-entry.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports beginner entry marker ${marker}`);
    else fail(`CLI missing beginner entry marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "beginner-entry-card",
    "beginner-entry-cards",
    "beginner-entry-card.md",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports beginner entry marker ${marker}`);
    else fail(`new-workflow-item missing beginner entry marker ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-beginner-entry.mjs", ".", "--goal", "维护 IntentOS 小白入口"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Beginner Entry Card")
    && resolver.stdout.includes("This entry writes target files: No")
    && resolver.stdout.includes("Can Codex change files now: No")) {
    pass("1.35 beginner entry resolver prints safe card");
  } else {
    fail(`1.35 beginner entry resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const positionalResolver = runNode(["scripts/resolve-beginner-entry.mjs", "我想把当前项目接入 IntentOS"]);
  if (positionalResolver.status === 0
    && positionalResolver.stdout.includes("Beginner Entry Card")
    && positionalResolver.stdout.includes("This entry writes target files: No")) {
    pass("1.35 beginner entry resolver accepts one-sentence goal");
  } else {
    fail(`1.35 beginner entry one-sentence goal failed: ${positionalResolver.stderr || positionalResolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-beginner-entry.mjs", ".", "--goal", "维护 IntentOS 小白入口", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "BEGINNER_ENTRY_CARD"
        && parsed.boundary?.writesTargetFiles === "No"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.routingEvidence?.technicalEvidenceAvailable === "yes"
        && Array.isArray(parsed.questionsForHuman)
        && parsed.questionsForHuman.length <= 3) {
        pass("1.35 beginner entry resolver JSON includes bounded decisions and boundaries");
      } else {
        fail(`1.35 beginner entry resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.35 beginner entry resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.35 beginner entry resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-beginner-entry.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Beginner Entry check passed")) {
    pass("1.35 beginner entry checker passes source repo");
  } else {
    fail(`1.35 beginner entry checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-beginner-entry.mjs", "examples/1.35-beginner-entry"]);
  if (example.status === 0 && example.stdout.includes("Beginner Entry check passed")) {
    pass("1.35 beginner entry example passes checker");
  } else {
    fail(`1.35 beginner entry example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes write", ["scripts/check-beginner-entry.mjs", "test-fixtures/bad/bad-beginner-entry-authorizes-write"], "forbidden beginner entry claim"],
    ["jargon", ["scripts/check-beginner-entry.mjs", "test-fixtures/bad/bad-beginner-entry-jargon"], "internal workflow jargon"],
    ["too many questions", ["scripts/check-beginner-entry.mjs", "test-fixtures/bad/bad-beginner-entry-too-many-questions"], "too many questions"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.35 beginner entry rejects ${name}`);
    } else {
      fail(`1.35 beginner entry must reject ${name}: ${output}`);
    }
  }
}
function checkConversationNativeAskProtocol() {
  const required = [
    "core/conversation-native-ask.md",
    "docs/conversation-native-ask.md",
    "docs/plans/conversation-native-ask-1.37-plan.md",
    "templates/conversation-ask-card.md",
    "checklists/conversation-native-ask-review.md",
    "prompts/conversation-native-ask-agent.md",
    "conversation-ask-cards/.gitkeep",
    "scripts/check-conversation-native-ask.mjs",
    "examples/1.37-conversation-native-ask/README.md",
    "examples/1.37-conversation-native-ask/conversation-ask-cards/001-appointment-app.md",
    "test-fixtures/bad/bad-conversation-ask-authorizes-write/conversation-ask-cards/001-bad.md",
    "test-fixtures/bad/bad-conversation-ask-cli-burden/conversation-ask-cards/001-bad.md",
    "test-fixtures/bad/bad-conversation-ask-too-many-questions/conversation-ask-cards/001-bad.md",
    "releases/1.37.0/release-record.md",
    "releases/1.37.0/known-limitations.md",
    "releases/1.37.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.37 conversation-native ask asset exists ${file}`);
    else fail(`1.37 conversation-native ask asset missing ${file}`);
  }

  const combined = [
    read("core/conversation-native-ask.md"),
    read("docs/conversation-native-ask.md"),
    read("templates/conversation-ask-card.md"),
    read("scripts/check-conversation-native-ask.mjs"),
    read("releases/1.37.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Conversation-Native Ask Governance",
    "default conversational behavior",
    "Codex should not require the user to first run",
    "does not replace Beginner Entry",
    "This conversation ask writes target files: No",
    "This conversation ask authorizes apply: No",
    "This conversation ask approves implementation: No",
    "This conversation ask requires the user to run CLI commands first: No",
  ]) {
    if (combined.includes(marker)) pass(`1.37 conversation-native ask includes ${marker}`);
    else fail(`1.37 conversation-native ask missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "conversation-ask-check",
    "scripts/check-conversation-native-ask.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports conversation-native ask marker ${marker}`);
    else fail(`CLI missing conversation-native ask marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "conversation-ask-card",
    "conversation-ask-cards",
    "conversation-ask-card.md",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports conversation-native ask marker ${marker}`);
    else fail(`new-workflow-item missing conversation-native ask marker ${marker}`);
  }

  const check = runNode(["scripts/check-conversation-native-ask.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Conversation-Native Ask check passed")) {
    pass("1.37 conversation-native ask checker passes source repo");
  } else {
    fail(`1.37 conversation-native ask checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-conversation-native-ask.mjs", "examples/1.37-conversation-native-ask"]);
  if (example.status === 0 && example.stdout.includes("Conversation-Native Ask check passed")) {
    pass("1.37 conversation-native ask example passes checker");
  } else {
    fail(`1.37 conversation-native ask example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes write", ["scripts/check-conversation-native-ask.mjs", "test-fixtures/bad/bad-conversation-ask-authorizes-write"], "forbidden conversation ask claim"],
    ["CLI burden", ["scripts/check-conversation-native-ask.mjs", "test-fixtures/bad/bad-conversation-ask-cli-burden"], "requires CLI command burden"],
    ["too many questions", ["scripts/check-conversation-native-ask.mjs", "test-fixtures/bad/bad-conversation-ask-too-many-questions"], "too many questions"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.37 conversation-native ask rejects ${name}`);
    } else {
      fail(`1.37 conversation-native ask must reject ${name}: ${output}`);
    }
  }
}
function checkWorkQueueProtocol() {
  const required = [
    "core/work-queue.md",
    "docs/work-queue.md",
    "templates/work-queue-report.md",
    "checklists/work-queue-review.md",
    "prompts/work-queue-agent.md",
    "work-queue/.gitkeep",
    "scripts/resolve-work-queue.mjs",
    "scripts/check-work-queue.mjs",
    "examples/1.22-work-queue/README.md",
    "examples/1.22-work-queue/work-queue/001-work-queue.md",
    "test-fixtures/bad/bad-work-queue-multiple-current/work-queue/001-bad.md",
    "test-fixtures/bad/bad-work-queue-resume-without-review/work-queue/001-bad.md",
    "releases/1.22.0/release-record.md",
    "releases/1.22.0/known-limitations.md",
    "releases/1.22.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.22 work queue asset exists ${file}`);
    else fail(`1.22 work queue asset missing ${file}`);
  }

  const combined = [
    read("core/work-queue.md"),
    read("docs/work-queue.md"),
    read("templates/work-queue-report.md"),
    read("scripts/resolve-work-queue.mjs"),
    read("scripts/check-work-queue.mjs"),
    read("releases/1.22.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Work Queue Governance",
    "Work Queue Report",
    "There must be at most one `CURRENT` task",
    "PAUSED",
    "BACKLOG",
    "Resume Review",
    "Interruption Rules",
    "This report approves implementation: No",
    "This report approves target-project writes: No",
    "This report approves scope expansion: No",
    "This report approves release or production: No",
    "This report resumes stale work without review: No",
  ]) {
    if (combined.includes(marker)) pass(`1.22 work queue includes ${marker}`);
    else fail(`1.22 work queue missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-work-queue.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Work Queue Recommendation")
    && resolver.stdout.includes("CURRENT task count")
    && resolver.stdout.includes("This report approves implementation: No")) {
    pass("1.22 work queue resolver passes source repo");
  } else {
    fail(`1.22 work queue resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-work-queue.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORK_QUEUE_RECOMMENDATION"
        && parsed.boundary?.approvesImplementation === "No"
        && Number.isFinite(parsed.currentTaskCount)
        && Array.isArray(parsed.recommendedQueueActions)) {
        pass("1.22 work queue resolver JSON includes task count, actions, and boundary");
      } else {
        fail(`1.22 work queue resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.22 work queue resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.22 work queue resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-work-queue.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Work queue check passed")) {
    pass("1.22 work queue checker passes source repo");
  } else {
    fail(`1.22 work queue checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-work-queue.mjs", "examples/1.22-work-queue"]);
  if (example.status === 0 && example.stdout.includes("Work queue check passed")) {
    pass("1.22 work queue example passes checker");
  } else {
    fail(`1.22 work queue example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["multiple current", ["scripts/check-work-queue.mjs", "test-fixtures/bad/bad-work-queue-multiple-current"], "multiple CURRENT"],
    ["resume without review", ["scripts/check-work-queue.mjs", "test-fixtures/bad/bad-work-queue-resume-without-review"], "Resume without review"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.22 work queue rejects ${name}`);
    } else {
      fail(`1.22 work queue must reject ${name}: ${output}`);
    }
  }
}
function checkHookOrchestrationProtocol() {
  const required = [
    "core/hook-orchestration.md",
    "docs/hook-orchestration.md",
    "templates/hook-orchestration-plan.md",
    "checklists/hook-orchestration-review.md",
    "prompts/hook-orchestration-agent.md",
    "hook-orchestration-plans/.gitkeep",
    "scripts/resolve-hook-orchestration.mjs",
    "scripts/check-hook-orchestration.mjs",
    "examples/1.23-hook-orchestration/README.md",
    "examples/1.23-hook-orchestration/hook-orchestration-plans/001-hook-plan.md",
    "test-fixtures/bad/bad-hook-orchestration-installs-hook/hook-orchestration-plans/001-bad.md",
    "test-fixtures/bad/bad-hook-orchestration-blocking-gate/hook-orchestration-plans/001-bad.md",
    "releases/1.23.0/release-record.md",
    "releases/1.23.0/known-limitations.md",
    "releases/1.23.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.23 hook orchestration asset exists ${file}`);
    else fail(`1.23 hook orchestration asset missing ${file}`);
  }

  const combined = [
    read("core/hook-orchestration.md"),
    read("docs/hook-orchestration.md"),
    read("templates/hook-orchestration-plan.md"),
    read("scripts/resolve-hook-orchestration.mjs"),
    read("scripts/check-hook-orchestration.mjs"),
    read("releases/1.23.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Hook Orchestration Governance",
    "Hook Orchestration Plan",
    "H0_AUTO_READ_ONLY",
    "H1_AUTO_SUGGESTION",
    "H2_REQUIRES_CONFIRMATION",
    "H3_EXPLICIT_APPROVAL_REQUIRED",
    "Hook orchestration is plan-first",
    "Codex must not automatically install hooks",
    "This plan installs hooks: No",
    "This plan modifies CI: No",
    "This plan adds blocking gates: No",
    "This plan calls external APIs: No",
  ]) {
    if (combined.includes(marker)) pass(`1.23 hook orchestration includes ${marker}`);
    else fail(`1.23 hook orchestration missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-hook-orchestration.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Hook Orchestration Recommendation")
    && resolver.stdout.includes("Proposed Hook Candidates")
    && resolver.stdout.includes("This plan installs hooks: No")) {
    pass("1.23 hook orchestration resolver passes source repo");
  } else {
    fail(`1.23 hook orchestration resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-hook-orchestration.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "HOOK_ORCHESTRATION_RECOMMENDATION"
        && parsed.boundary?.installsHooks === "No"
        && Array.isArray(parsed.proposedHookCandidates)
        && parsed.proposedHookCandidates.some((item) => item.level === "H3_EXPLICIT_APPROVAL_REQUIRED")) {
        pass("1.23 hook orchestration resolver JSON includes candidates and boundary");
      } else {
        fail(`1.23 hook orchestration resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.23 hook orchestration resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.23 hook orchestration resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-hook-orchestration.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Hook orchestration check passed")) {
    pass("1.23 hook orchestration checker passes source repo");
  } else {
    fail(`1.23 hook orchestration checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-hook-orchestration.mjs", "examples/1.23-hook-orchestration"]);
  if (example.status === 0 && example.stdout.includes("Hook orchestration check passed")) {
    pass("1.23 hook orchestration example passes checker");
  } else {
    fail(`1.23 hook orchestration example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["installs hook", ["scripts/check-hook-orchestration.mjs", "test-fixtures/bad/bad-hook-orchestration-installs-hook"], "installs hooks"],
    ["blocking gate", ["scripts/check-hook-orchestration.mjs", "test-fixtures/bad/bad-hook-orchestration-blocking-gate"], "adds blocking gates"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.23 hook orchestration rejects ${name}`);
    } else {
      fail(`1.23 hook orchestration must reject ${name}: ${output}`);
    }
  }
}
function checkHookPolicyProtocol() {
  const required = [
    "core/hook-policy.md",
    "docs/hook-policy.md",
    "templates/project-hook-policy.md",
    "checklists/hook-policy-review.md",
    "prompts/hook-policy-agent.md",
    "hook-policies/.gitkeep",
    "scripts/resolve-hook-policy.mjs",
    "scripts/check-hook-policy.mjs",
    "examples/1.29-hook-policy-hardening/README.md",
    "examples/1.29-hook-policy-hardening/hook-policies/001-project-hook-policy.md",
    "test-fixtures/bad/bad-hook-policy-installs-hook/hook-policies/001-bad.md",
    "test-fixtures/bad/bad-hook-policy-missing-rollback/hook-policies/001-bad.md",
    "releases/1.29.0/release-record.md",
    "releases/1.29.0/known-limitations.md",
    "releases/1.29.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.29 hook policy asset exists ${file}`);
    else fail(`1.29 hook policy asset missing ${file}`);
  }

  const combined = [
    read("core/hook-policy.md"),
    read("docs/hook-policy.md"),
    read("templates/project-hook-policy.md"),
    read("scripts/resolve-hook-policy.mjs"),
    read("scripts/check-hook-policy.mjs"),
    read("releases/1.29.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Project Hook Policy Governance",
    "Project Hook Policy",
    "Hook policy is authorization planning only",
    "POLICY_REVIEW_REQUIRED",
    "H0_AUTO_READ_ONLY",
    "H1_AUTO_SUGGESTION",
    "H2_REQUIRES_CONFIRMATION",
    "H3_EXPLICIT_APPROVAL_REQUIRED",
    "Approval Matrix",
    "Rollback / Disable Policy",
    "This policy installs hooks: No",
    "This policy modifies CI: No",
    "This policy adds blocking gates: No",
    "This policy calls external APIs: No",
    "This policy stores tokens or secrets: No",
    "This policy enables auto-fix: No",
    "This policy replaces Hook Orchestration: No",
  ]) {
    if (combined.includes(marker)) pass(`1.29 hook policy includes ${marker}`);
    else fail(`1.29 hook policy missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-hook-policy.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Project Hook Policy")
    && resolver.stdout.includes("Allowed Hook Classes")
    && resolver.stdout.includes("This policy installs hooks: No")) {
    pass("1.29 hook policy resolver passes source repo");
  } else {
    fail(`1.29 hook policy resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-hook-policy.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "PROJECT_HOOK_POLICY"
        && parsed.boundaries?.installsHooks === "No"
        && Array.isArray(parsed.allowedHookClasses)
        && parsed.allowedHookClasses.some((item) => item.class === "H3_EXPLICIT_APPROVAL_REQUIRED")) {
        pass("1.29 hook policy resolver JSON includes classes and boundary");
      } else {
        fail(`1.29 hook policy resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.29 hook policy resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.29 hook policy resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-hook-policy.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Project Hook Policy check passed")) {
    pass("1.29 hook policy checker passes source repo");
  } else {
    fail(`1.29 hook policy checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-hook-policy.mjs", "examples/1.29-hook-policy-hardening"]);
  if (example.status === 0 && example.stdout.includes("Project Hook Policy check passed")) {
    pass("1.29 hook policy example passes checker");
  } else {
    fail(`1.29 hook policy example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["installs hook", ["scripts/check-hook-policy.mjs", "test-fixtures/bad/bad-hook-policy-installs-hook"], "This policy installs hooks"],
    ["missing rollback", ["scripts/check-hook-policy.mjs", "test-fixtures/bad/bad-hook-policy-missing-rollback"], "rollback policy"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.29 hook policy rejects ${name}`);
    } else {
      fail(`1.29 hook policy must reject ${name}: ${output}`);
    }
  }
}
function checkNaturalLanguageOrchestratorProtocol() {
  const required = [
    "core/natural-language-orchestrator.md",
    "docs/natural-language-orchestrator.md",
    "templates/workflow-guidance-card.md",
    "templates/user-decision-card.md",
    "checklists/workflow-guidance-review.md",
    "prompts/workflow-concierge-agent.md",
    "workflow-guidance-cards/.gitkeep",
    "scripts/resolve-workflow-guidance.mjs",
    "scripts/check-workflow-guidance.mjs",
    "examples/1.24-natural-language-orchestrator/README.md",
    "examples/1.24-natural-language-orchestrator/workflow-guidance-cards/001-existing-project.md",
    "examples/1.30-deep-guide-orchestration/README.md",
    "examples/1.30-deep-guide-orchestration/workflow-guidance-cards/001-deep-guide.md",
    "examples/1.31-intent-aware-deep-guide/README.md",
    "examples/1.31-intent-aware-deep-guide/workflow-guidance-cards/001-payment-booking-intent.md",
    "test-fixtures/bad/bad-workflow-guidance-too-many-questions/workflow-guidance-cards/001-bad.md",
    "test-fixtures/bad/bad-workflow-guidance-overclaim/workflow-guidance-cards/001-bad.md",
    "releases/1.24.0/release-record.md",
    "releases/1.24.0/known-limitations.md",
    "releases/1.24.0/self-check-report.md",
    "releases/1.30.0/release-record.md",
    "releases/1.30.0/known-limitations.md",
    "releases/1.30.0/self-check-report.md",
    "releases/1.31.0/release-record.md",
    "releases/1.31.0/known-limitations.md",
    "releases/1.31.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.24 workflow guidance asset exists ${file}`);
    else fail(`1.24 workflow guidance asset missing ${file}`);
  }

  const combined = [
    read("core/natural-language-orchestrator.md"),
    read("docs/natural-language-orchestrator.md"),
    read("templates/workflow-guidance-card.md"),
    read("scripts/resolve-workflow-guidance.mjs"),
    read("scripts/check-workflow-guidance.mjs"),
    read("releases/1.24.0/release-record.md"),
    exists("releases/1.30.0/release-record.md") ? read("releases/1.30.0/release-record.md") : "",
    exists("releases/1.31.0/release-record.md") ? read("releases/1.31.0/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Natural Language Workflow Orchestrator",
    "Workflow Guidance Card",
    "Default output mode is `plain`",
    "Delivery Path State",
    "Codex asks at most one plain business question in one turn",
    "This guidance writes target files: No",
    "This guidance modifies CI: No",
    "This guidance installs hooks: No",
    "--deep",
    "--intent",
    "Intent-Aware Deep Guide",
    "intentUnderstanding",
    "Deep Guide Orchestration",
    "selective-read-only",
  ]) {
    if (combined.includes(marker)) pass(`1.24 workflow guidance includes ${marker}`);
    else fail(`1.24 workflow guidance missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-workflow-guidance.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Workflow Guidance Card")
    && resolver.stdout.includes("Delivery Path State")
    && resolver.stdout.includes("This guidance writes target files: No")) {
    pass("1.24 workflow guidance resolver prints safe card");
  } else {
    fail(`1.24 workflow guidance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORKFLOW_GUIDANCE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.deliveryPathState?.current
        && Array.isArray(parsed.questionsForHuman)) {
        pass("1.24 workflow guidance resolver JSON includes boundaries, state, and questions");
      } else {
        fail(`1.24 workflow guidance resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.24 workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.24 workflow guidance resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const deepResolver = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep"]);
  if (deepResolver.status === 0
    && deepResolver.stdout.includes("Workflow Guidance Card")
    && (deepResolver.stdout.includes("What I Checked") || deepResolver.stdout.includes("Deep Orchestration"))
    && deepResolver.stdout.includes("This guidance writes target files: No")) {
    pass("1.30 deep workflow guidance resolver prints safe card");
  } else {
    fail(`1.30 deep workflow guidance resolver failed: ${deepResolver.stderr || deepResolver.stdout}`);
  }

  const deepResolverJson = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep", "--json"]);
  if (deepResolverJson.status === 0) {
    try {
      const parsed = JSON.parse(deepResolverJson.stdout);
      const selected = parsed.deepOrchestration?.selectedCapabilities || [];
      const summaries = parsed.deepOrchestration?.summaries || [];
      if (parsed.deepOrchestration?.enabled === true
        && parsed.deepOrchestration?.mode === "selective-read-only"
        && selected.includes("review-surface")
        && selected.includes("delivery-path")
        && summaries.every((item) => item.readOnly === true)
        && parsed.deepOrchestration?.boundaries?.writesTargetFiles === "No") {
        pass("1.30 deep workflow guidance resolver JSON includes selective read-only orchestration");
      } else {
        fail(`1.30 deep workflow guidance resolver JSON missing expected fields: ${deepResolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.30 deep workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.30 deep workflow guidance resolver JSON failed: ${deepResolverJson.stderr || deepResolverJson.stdout}`);
  }

  const intentResolver = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep", "--intent", "我要加支付预约", "--json"]);
  if (intentResolver.status === 0) {
    try {
      const parsed = JSON.parse(intentResolver.stdout);
      const selected = parsed.deepOrchestration?.selectedCapabilities || [];
      if (parsed.intentUnderstanding?.classification === "ADD_PAYMENT_OR_VALUE_TRANSFER"
        && parsed.intentUnderstanding?.riskLevel === "high"
        && parsed.deepOrchestration?.intentAware === true
        && parsed.deepOrchestration?.intentClassification === "ADD_PAYMENT_OR_VALUE_TRANSFER"
        && selected.includes("review-surface")
        && selected.includes("delivery-path")
        && parsed.boundaries?.writesTargetFiles === "No") {
        pass("1.31 intent-aware workflow guidance resolver JSON classifies and routes payment intent");
      } else {
        fail(`1.31 intent-aware workflow guidance resolver JSON missing expected fields: ${intentResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.31 intent-aware workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.31 intent-aware workflow guidance resolver JSON failed: ${intentResolver.stderr || intentResolver.stdout}`);
  }

  const check = runNode(["scripts/check-workflow-guidance.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Workflow guidance check passed")) {
    pass("1.24 workflow guidance checker passes source repo");
  } else {
    fail(`1.24 workflow guidance checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.24-natural-language-orchestrator"]);
  if (example.status === 0 && example.stdout.includes("Workflow guidance check passed")) {
    pass("1.24 workflow guidance example passes checker");
  } else {
    fail(`1.24 workflow guidance example failed: ${example.stderr || example.stdout}`);
  }

  const deepExample = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.30-deep-guide-orchestration"]);
  if (deepExample.status === 0 && deepExample.stdout.includes("Workflow guidance check passed")) {
    pass("1.30 deep workflow guidance example passes checker");
  } else {
    fail(`1.30 deep workflow guidance example failed: ${deepExample.stderr || deepExample.stdout}`);
  }

  const intentExample = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.31-intent-aware-deep-guide"]);
  if (intentExample.status === 0 && intentExample.stdout.includes("Workflow guidance check passed")) {
    pass("1.31 intent-aware workflow guidance example passes checker");
  } else {
    fail(`1.31 intent-aware workflow guidance example failed: ${intentExample.stderr || intentExample.stdout}`);
  }

  for (const [name, args, expected] of [
    ["too many questions", ["scripts/check-workflow-guidance.mjs", "test-fixtures/bad/bad-workflow-guidance-too-many-questions"], "too many questions"],
    ["overclaim", ["scripts/check-workflow-guidance.mjs", "test-fixtures/bad/bad-workflow-guidance-overclaim"], "forbidden workflow guidance claim"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.24 workflow guidance rejects ${name}`);
    } else {
      fail(`1.24 workflow guidance must reject ${name}: ${output}`);
    }
  }
}

export function runAdoptionChecks() {
  checkExistingProjectWorkflowAdapterProtocol();
  checkNativeFirstMigrationProtocol();
  checkExistingRuleReconciliationProtocol();
  checkGovernanceConvergenceProtocol();
  checkAdoptionExecutionAssuranceProtocol();
  checkExistingProjectAdoptionAutopilotProtocol();
  checkControlledNativeAdoptionReviewProtocol();
  checkTaskGovernanceProtocol();
  checkWorkQueueTakeoverProtocol();
  checkTaskGovernanceConsumerIntegrationProtocol();
  checkRuntimeHygieneProtocol();
  checkExecutionAssuranceChainProtocol();
  checkDocumentLifecycleProtocol();
  checkDocumentArchiveApplyProtocol();
  checkUnifiedApplyPlanProtocol();
  checkControlledApplyReadinessProtocol();
  checkApprovalRecordGovernanceProtocol();
  checkBeginnerEntryProtocol();
  checkConversationNativeAskProtocol();
  checkWorkQueueProtocol();
  checkHookOrchestrationProtocol();
  checkHookPolicyProtocol();
  checkNaturalLanguageOrchestratorProtocol();
}
