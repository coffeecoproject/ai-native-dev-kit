import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";

const proofTarget = "tests/113-task-obligation-evidence.test.mjs";
const verificationPlanRef = "verification-plans/113-cross-domain-trust-closure.md";
const groups = [
  {
    name: "task-chain-and-evidence",
    defaultTarget: "tests/typed-consumer-contract.test.mjs",
    targetRules: [
      { pattern: /work queue|task governance|task ref|task entry/i, target: "tests/task-obligation-hardcut.test.mjs" },
      { pattern: /source|stale|revision|digest|copied evidence|wrong project|authority/i, target: "tests/current-trust-fixture.test.mjs" },
      { pattern: /runtime trust|runtime behavior/i, target: "tests/verification-runtime-consumer.test.mjs" },
      { pattern: /test evidence|test-specific|test coverage|verification obligation/i, target: "tests/test-evidence-obligation-proof.test.mjs" },
      { pattern: /api contract|api request|frontend ui|visible form|error copy|bounded feedback|backend rule|server\/domain logic/i, target: "tests/test-evidence-obligation-proof.test.mjs" },
      { pattern: /data model|schema|historical records|migration/i, target: "tests/typed-consumer-contract.test.mjs" },
    ],
    obligationIds: [
        "verify:universe-01b5deae-expected",
        "verify:universe-01b5deae-negative",
        "verify:universe-370c5a1e-expected",
        "verify:universe-370c5a1e-negative",
        "verify:universe-9f9fa3e5-expected",
        "verify:universe-9f9fa3e5-negative",
        "verify:universe-d5cda5ec-expected",
        "verify:universe-d5cda5ec-negative",
        "verify:universe-909edc85-expected",
        "verify:universe-909edc85-negative",
        "verify:universe-868d4b91-expected",
        "verify:universe-868d4b91-negative",
        "verify:universe-133bfd71-expected",
        "verify:universe-133bfd71-negative",
        "verify:universe-a238de93-expected",
        "verify:universe-a238de93-negative",
        "verify:universe-230f46e1-expected",
        "verify:universe-230f46e1-negative",
        "verify:data-model-data-model-check-data-model-historical-records-migrat",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
    ],
    testTargets: [
        "tests/typed-consumer-contract.test.mjs",
        "tests/task-obligation-hardcut.test.mjs",
        "tests/current-trust-fixture.test.mjs",
        "tests/test-evidence-obligation-proof.test.mjs",
        "tests/verification-runtime-consumer.test.mjs"
    ],
  },
  {
    name: "atomic-apply-and-recovery",
    defaultTarget: "tests/controlled-apply-transaction.test.mjs",
    targetRules: [
      { pattern: /approved action graph|approval|request-bound|authority/i, target: "tests/request-bound-apply-authority.test.mjs" },
    ],
    obligationIds: [
        "verify:universe-6a3c13eb-expected",
        "verify:universe-6a3c13eb-negative",
        "verify:universe-bb4f1e0b-expected",
        "verify:universe-bb4f1e0b-negative",
        "verify:universe-f7ab67ee-expected",
        "verify:universe-f7ab67ee-negative",
        "verify:universe-dfbddc4b-expected",
        "verify:universe-dfbddc4b-negative",
        "verify:universe-ca9f9831-expected",
        "verify:universe-ca9f9831-negative",
        "verify:universe-8dca8d52-expected",
        "verify:universe-8dca8d52-negative",
        "verify:universe-0ad03c62-expected",
        "verify:universe-0ad03c62-negative",
        "verify:universe-88185f96-expected",
        "verify:universe-88185f96-negative",
        "verify:universe-ab243239-expected",
        "verify:universe-ab243239-negative",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
    ],
    testTargets: [
        "tests/controlled-apply-transaction.test.mjs",
        "tests/request-bound-apply-authority.test.mjs"
    ],
  },
  {
    name: "existing-project-adoption",
    defaultTarget: "tests/existing-adoption-activation-hardening.test.mjs",
    targetRules: [
      { pattern: /fresh session|project entry|operating route|work queue/i, target: "tests/project-entry-adoption-consumer-chain.test.mjs" },
      { pattern: /generated|installed|distribution|starter/i, target: "tests/project-entry-generated-parity.test.mjs" },
      { pattern: /user flow|interaction|critical flow/i, target: "tests/project-entry-generated-parity.test.mjs" },
      { pattern: /permission|role|tenant|visibility|privacy|audit boundary/i, target: "tests/request-bound-apply-authority.test.mjs" },
    ],
    obligationIds: [
        "verify:universe-eafe80a3-expected",
        "verify:universe-eafe80a3-negative",
        "verify:universe-7bea42b3-expected",
        "verify:universe-7bea42b3-negative",
        "verify:universe-4cd77b0a-expected",
        "verify:universe-4cd77b0a-negative",
        "verify:universe-6f5a5aa3-expected",
        "verify:universe-6f5a5aa3-negative",
        "verify:universe-94a115a4-expected",
        "verify:universe-94a115a4-negative",
        "verify:universe-4087f54e-expected",
        "verify:universe-4087f54e-negative",
        "verify:universe-3ad67323-expected",
        "verify:universe-3ad67323-negative",
        "verify:universe-95d747e1-expected",
        "verify:universe-95d747e1-negative",
        "verify:universe-00218482-expected",
        "verify:universe-00218482-negative",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:permission-risk-permission-boundary-test-role-tenant-visibility-"
    ],
    testTargets: [
        "tests/existing-adoption-activation-hardening.test.mjs",
        "tests/project-entry-adoption-consumer-chain.test.mjs",
        "tests/project-entry-generated-parity.test.mjs",
        "tests/request-bound-apply-authority.test.mjs"
    ],
  },
  {
    name: "baseline-integrity",
    defaultTarget: "tests/execution-distribution-trust.test.mjs",
    targetRules: [
      { pattern: /generated|starter|installed|fresh project/i, target: "tests/project-entry-generated-parity.test.mjs" },
    ],
    obligationIds: [
        "verify:universe-72c3bacf-expected",
        "verify:universe-72c3bacf-negative",
        "verify:universe-a0707b63-expected",
        "verify:universe-a0707b63-negative",
        "verify:universe-a4833a0b-expected",
        "verify:universe-a4833a0b-negative",
        "verify:universe-8331c5ae-expected",
        "verify:universe-8331c5ae-negative",
        "verify:universe-aa4f5177-expected",
        "verify:universe-aa4f5177-negative",
        "verify:universe-d36e2a76-expected",
        "verify:universe-d36e2a76-negative",
        "verify:universe-610c7460-expected",
        "verify:universe-610c7460-negative",
        "verify:universe-9a3804d1-expected",
        "verify:universe-9a3804d1-negative",
        "verify:universe-48f98d4e-expected",
        "verify:universe-48f98d4e-negative"
    ],
    testTargets: [
        "tests/execution-distribution-trust.test.mjs",
        "tests/project-entry-generated-parity.test.mjs"
    ],
  },
  {
    name: "release-trust",
    defaultTarget: "tests/release-trust-boundary.test.mjs",
    targetRules: [
      { pattern: /topology|recipe|channel|platform route/i, target: "tests/release-topology-consumer.test.mjs" },
      { pattern: /execution topology|handoff topology/i, target: "tests/release-execution-topology.test.mjs" },
      { pattern: /scheduled|queued|retried|asynchronous|worker/i, target: "tests/release-topology-consumer.test.mjs" },
    ],
    obligationIds: [
        "verify:universe-9a1bf08b-expected",
        "verify:universe-9a1bf08b-negative",
        "verify:universe-e710bac0-expected",
        "verify:universe-e710bac0-negative",
        "verify:universe-66ba9a71-expected",
        "verify:universe-66ba9a71-negative",
        "verify:universe-211b9347-expected",
        "verify:universe-211b9347-negative",
        "verify:universe-3e9d296e-expected",
        "verify:universe-3e9d296e-negative",
        "verify:universe-4ea05a71-expected",
        "verify:universe-4ea05a71-negative",
        "verify:universe-0a935c21-expected",
        "verify:universe-0a935c21-negative",
        "verify:universe-ce319ca9-expected",
        "verify:universe-ce319ca9-negative",
        "verify:universe-010135e0-expected",
        "verify:universe-010135e0-negative",
        "verify:external-integration-integration-contract-check-external-integra",
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
    ],
    testTargets: [
        "tests/release-trust-boundary.test.mjs",
        "tests/release-topology-consumer.test.mjs",
        "tests/release-execution-topology.test.mjs"
    ],
  },
  {
    name: "distribution-parity",
    defaultTarget: "tests/execution-distribution-trust.test.mjs",
    targetRules: [
      { pattern: /manifest/i, target: "tests/manifest-authority.test.mjs" },
      { pattern: /guidance|responsibility|semantic/i, target: "tests/active-guidance-distribution-closeout.test.mjs" },
      { pattern: /generated|installed|fresh.session|consumer route/i, target: "tests/project-entry-generated-parity.test.mjs" },
    ],
    obligationIds: [
        "verify:universe-7e9a2282-expected",
        "verify:universe-7e9a2282-negative",
        "verify:universe-1a4fabb1-expected",
        "verify:universe-1a4fabb1-negative",
        "verify:universe-68b60ab3-expected",
        "verify:universe-68b60ab3-negative",
        "verify:universe-6a0a12c4-expected",
        "verify:universe-6a0a12c4-negative",
        "verify:universe-3b1e8f43-expected",
        "verify:universe-3b1e8f43-negative",
        "verify:universe-0adf81f2-expected",
        "verify:universe-0adf81f2-negative",
        "verify:universe-41c23483-expected",
        "verify:universe-41c23483-negative",
        "verify:universe-06b86b13-expected",
        "verify:universe-06b86b13-negative",
        "verify:universe-d6fb92e1-expected",
        "verify:universe-d6fb92e1-negative",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
    ],
    testTargets: [
        "tests/manifest-authority.test.mjs",
        "tests/active-guidance-distribution-closeout.test.mjs",
        "tests/project-entry-generated-parity.test.mjs",
        "tests/execution-distribution-trust.test.mjs"
    ],
  },
];

const verificationPlan = readVerificationPlan();
const obligationById = new Map(verificationPlan.verification_obligations.map((item) => [item.id, item]));

const defaultProofTestByTarget = new Map([
  ["tests/typed-consumer-contract.test.mjs", "1.113 evidence authority binds an exact item inside a file-backed artifact"],
  ["tests/task-obligation-hardcut.test.mjs", "1.113 Plan Review only accepts the exact current Task Governance identity"],
  ["tests/current-trust-fixture.test.mjs", "current strict trust fixture reaches Completion only through current task evidence"],
  ["tests/test-evidence-obligation-proof.test.mjs", "strict Test Evidence rejects a nine-target local command declaring all 119 obligations"],
  ["tests/verification-runtime-consumer.test.mjs", "1.113 accepts exact observed BL2 obligation proof from the bound Runtime Trust command"],
  ["tests/controlled-apply-transaction.test.mjs", "a predeclared action graph safely recovers a partially attempted batch"],
  ["tests/request-bound-apply-authority.test.mjs", "request-bound local authority accepts an exact reversible existing-project adoption graph"],
  ["tests/existing-adoption-activation-hardening.test.mjs", "a governed Work Queue takeover requires one durable CURRENT and survives a fresh process"],
  ["tests/project-entry-adoption-consumer-chain.test.mjs", "1.109 same-run evidence is consumable only for the exact project, task, facts, guidance, authority, and revision"],
  ["tests/project-entry-generated-parity.test.mjs", "an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption"],
  ["tests/execution-distribution-trust.test.mjs", "workflow entry consumes strict platform and industrial baseline states"],
  ["tests/release-trust-boundary.test.mjs", "structured release acceptance binds a candidate and rejects prose-only acceptance"],
  ["tests/release-topology-consumer.test.mjs", "candidate, package, source, and action bindings must agree"],
  ["tests/release-execution-topology.test.mjs", "documentation-only production facts cannot establish strict readiness"],
  ["tests/manifest-authority.test.mjs", "1.113 manifest closes imported and runtime-script distribution dependencies"],
  ["tests/active-guidance-distribution-closeout.test.mjs", "1.107.1 generated Codex project passes the effective guidance authority scan"],
]);

const exactProofRules = [
  proof("tests/task-obligation-hardcut.test.mjs", /work queue/i, "1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree"),
  proof("tests/current-trust-fixture.test.mjs", /mutation|stale|candidate mutation/i, "1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims"),
  proof("tests/current-trust-fixture.test.mjs", /actual diff|changed surfaces|candidate/i, "actual diff authority rejects empty feature, omitted untracked, and forged file sets"),
  proof("tests/typed-consumer-contract.test.mjs", /missing|malformed/i, "1.113 strict Change Boundary fails when the required artifact is missing"),
  proof("tests/typed-consumer-contract.test.mjs", /data model|historical records|migration/i, "1.113 historical completion evidence is readable but cannot satisfy current readiness"),
  proof("tests/test-evidence-obligation-proof.test.mjs", /runtime trust|runtime behavior/i, "strict high-trust Test Evidence rejects even complete hand-written command output without Runtime Trust"),
  proof("tests/test-evidence-obligation-proof.test.mjs", /test-specific|broad command|verification obligation|test coverage/i, "strict Test Evidence rejects a nine-target local command declaring all 119 obligations"),
  proof("tests/verification-runtime-consumer.test.mjs", /cannot turn|broad declaration/i, "1.113 Runtime Trust cannot turn a broad declaration into per-obligation BL2 proof"),

  proof("tests/request-bound-apply-authority.test.mjs", /durably|reuse|single.use/i, "request-bound authority is durably consumed outside the target before replay"),
  proof("tests/request-bound-apply-authority.test.mjs", /stale plan|request text/i, "request-bound authority rejects a stale plan even when the request text still matches"),
  proof("tests/request-bound-apply-authority.test.mjs", /widen|external.effect/i, "request-bound readiness cannot widen the exact action graph or external-effect boundary"),
  proof("tests/controlled-apply-transaction.test.mjs", /lock ownership|concurrent/i, "a target lock prevents two controlled applies from starting concurrently"),
  proof("tests/controlled-apply-transaction.test.mjs", /symlink|unsafe path/i, "staged write fails closed when its checked parent is swapped to an out-of-root symlink"),
  proof("tests/controlled-apply-transaction.test.mjs", /inode|foreign mutation|unrelated post.crash/i, "rollback refuses to delete a target whose inode is replaced after validation"),
  proof("tests/controlled-apply-transaction.test.mjs", /APPLY_VERIFIED|activation validation/i, "APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages"),
  proof("tests/controlled-apply-transaction.test.mjs", /receipt phases|receipt path|receipt phase/i, "receipt writing refuses to overwrite an external change made after transaction start"),
  proof("tests/controlled-apply-transaction.test.mjs", /interruption|rollback|recovery|failure/i, "hard process interruption restores every journaled target and the prior receipt"),

  proof("tests/project-entry-adoption-consumer-chain.test.mjs", /natural-language request|goal digest|same-run/i, "1.109 same-run evidence is consumable only for the exact project, task, facts, guidance, authority, and revision"),
  proof("tests/project-entry-adoption-consumer-chain.test.mjs", /assessment|allowed local action|technical sequencing/i, "1.109 adoption autopilot consumes one strict same-run chain for a light existing project"),
  proof("tests/project-entry-adoption-consumer-chain.test.mjs", /work queue|synthetic current task/i, "1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items"),
  proof("tests/project-entry-generated-parity.test.mjs", /changed request|invalidates the plan|expires/i, "an existing-project plan expires when any project source changes outside its action graph"),
  proof("tests/project-entry-generated-parity.test.mjs", /fresh project-local process|receipt-bound activation|canonical IntentOS entry/i, "an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption"),
  proof("tests/project-entry-generated-parity.test.mjs", /primary user flow|critical flow/i, "generated project cold-starts from its own cwd and exercises the strict operating route"),
  proof("tests/request-bound-apply-authority.test.mjs", /permission|role|tenant|visibility|privacy|audit boundary/i, "request-bound authority rejects business code and a fabricated legacy-agent bridge"),
  proof("tests/existing-adoption-activation-hardening.test.mjs", /nested agent|project rule|authority weakening/i, "all root and nested agent authorities participate in identity and semantic conflict checks"),
  proof("tests/existing-adoption-activation-hardening.test.mjs", /blocked assessment|failed activation|durable blocked/i, "Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof"),

  proof("tests/execution-distribution-trust.test.mjs", /natural-language goal|platform profiles/i, "natural-language goals derive platform profiles and block conflicting starters"),
  proof("tests/execution-distribution-trust.test.mjs", /mutually compatible|incompatible pack/i, "baseline pack must apply to the selected platform profile"),
  proof("tests/execution-distribution-trust.test.mjs", /installs every selected|controlled plan|environment pack/i, "baseline planning augments explicit packs to complete environment and profile coverage"),
  proof("tests/execution-distribution-trust.test.mjs", /strict baseline states|effective and strict/i, "workflow entry consumes strict platform and industrial baseline states"),
  proof("tests/execution-distribution-trust.test.mjs", /unknown|incomplete|empty|symlinked|truncation/i, "project evidence failures and truncation are visible and block baseline selection"),
  proof("tests/execution-distribution-trust.test.mjs", /registry|entry\.path|manifest symlink/i, "industrial pack authority rejects a symlinked registry root"),
  proof("tests/execution-distribution-trust.test.mjs", /auditable parity|project-local baseline/i, "installed and source-side baseline checks resolve the same target authority"),
  proof("tests/project-entry-generated-parity.test.mjs", /generated and installed|generated assets/i, "every supported starter reaches verified project-entry activation"),

  proof("tests/release-trust-boundary.test.mjs", /current release candidate|Git revision|candidate/i, "release preflight receipt replays one non-empty staged exact candidate check"),
  proof("tests/release-trust-boundary.test.mjs", /changed candidate|stale revision|invalidates/i, "candidate revision, symlink, and finding-count drift fail closed"),
  proof("tests/release-trust-boundary.test.mjs", /approved external.effect|structured consent|prose-only/i, "structured release acceptance binds a candidate and rejects prose-only acceptance"),
  proof("tests/release-topology-consumer.test.mjs", /topology|recipe|channel|platform route/i, "strict topology source accepts current evidence and rejects copied evidence"),
  proof("tests/release-topology-consumer.test.mjs", /scheduled|queued|retried|asynchronous|worker/i, "workflow package scripts recursively expose provider deploys and explicit source_only stays blocked"),
  proof("tests/release-topology-consumer.test.mjs", /external integration|timeout|retry|partial failure|replay/i, "execution requests normalize argv and provider requests and reject shell expansion"),
  proof("tests/release-execution-topology.test.mjs", /source-only|production|rollback|post-release/i, "documentation-only production facts cannot establish strict readiness"),

  proof("tests/manifest-authority.test.mjs", /manifest copy rules|authoritative distribution/i, "1.113 manifest closes imported and runtime-script distribution dependencies"),
  proof("tests/manifest-authority.test.mjs", /safe target|exact digest|missing, extra, stale, conflicting, unsafe/i, "manifest checker fails closed when a distributed import is omitted"),
  proof("tests/active-guidance-distribution-closeout.test.mjs", /guidance|responsibility|semantics/i, "1.107.1 generated Codex project passes the effective guidance authority scan"),
  proof("tests/project-entry-generated-parity.test.mjs", /transactional bootstrap|controlled update|generated smoke|fresh-session/i, "a generated project remains trusted during and after an exact controlled workflow update"),
  proof("tests/execution-distribution-trust.test.mjs", /installed asset|consumer|project-compatible route/i, "installed local consumer chain blocks implementation without current evidence"),
];

test("1.113 proof map exactly covers every current required Verification Plan obligation", () => {
  const required = verificationPlan.verification_obligations
    .filter((item) => item.required === "Yes" && !requiresRuntimeTrust(item))
    .map((item) => item.id)
    .sort();
  const mapped = groups.flatMap((group) => group.obligationIds).sort();
  assert.deepEqual(mapped, required);
  assert.equal(new Set(mapped).size, mapped.length, "each obligation must belong to exactly one proof group");
  for (const group of groups) {
    const selectedCases = new Map(group.obligationIds.map((id) => {
      const selected = proofCaseFor(group, id);
      return [`${selected.target}\0${selected.testName}`, selected];
    }));
    for (const { target, testName } of selectedCases.values()) {
      assert.ok(group.testTargets.includes(target), `${group.name} routes an obligation to undeclared target ${target}`);
      const source = fs.readFileSync(path.resolve(target), "utf8");
      assert.ok(source.includes(`test("${testName}"`), `${target} must contain exact project-native proof test: ${testName}`);
    }
  }
});

test("1.113 exact proof output accepts supported Node reporters and fails closed on weak summaries", () => {
  const name = "one exact project-native proof";
  const tap = [
    "TAP version 13",
    `ok 1 - ${name}`,
    "1..1",
    "# tests 1",
    "# pass 1",
    "# fail 0",
    "# cancelled 0",
    "# skipped 0",
    "# todo 0",
  ].join("\n");
  const spec = [
    `✔ ${name} (12.3ms)`,
    "ℹ tests 1",
    "ℹ pass 1",
    "ℹ fail 0",
    "ℹ cancelled 0",
    "ℹ skipped 0",
    "ℹ todo 0",
  ].join("\n");

  assertObservedExactPass(tap, name, "TAP proof");
  assertObservedExactPass(spec, name, "spec proof");
  assert.throws(() => assertObservedExactPass(spec.replace(name, "another proof"), name, "wrong-name proof"));
  assert.throws(() => assertObservedExactPass(spec.replace("ℹ pass 1", "ℹ pass 0"), name, "zero-pass proof"));
  assert.throws(() => assertObservedExactPass(spec.replace("ℹ fail 0", "ℹ fail 1"), name, "failed proof"));
  assert.throws(() => assertObservedExactPass(spec.replace("ℹ skipped 0", "ℹ skipped 1"), name, "skipped proof"));
});

function requiresRuntimeTrust(obligation) {
  return obligation.source_surface === "RUNTIME_BEHAVIOR"
    || obligation.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF";
}

for (const group of groups) {
  test(`1.113 ${group.name} project-native proof suite`, { concurrency: false }, async (t) => {
    const childEnv = { ...process.env };
    delete childEnv.NODE_TEST_CONTEXT;
    const selectedCases = new Map(group.obligationIds.map((id) => {
      const selected = proofCaseFor(group, id);
      return [`${selected.target}\0${selected.testName}`, selected];
    }));
    const results = new Map();
    for (const [caseKey, selected] of selectedCases) {
      const pattern = `^${escapeRegExp(selected.testName)}$`;
      const result = spawnSync(process.execPath, ["--test", "--test-concurrency=1", `--test-name-pattern=${pattern}`, selected.target], {
        cwd: process.cwd(),
        encoding: "utf8",
        env: childEnv,
        timeout: 600_000,
        maxBuffer: 64 * 1024 * 1024,
      });
      results.set(caseKey, result);
      assert.equal(result.status, 0, `${selected.target} :: ${selected.testName}\n${result.stdout}\n${result.stderr}`);
      assertObservedExactPass(result.stdout, selected.testName, selected.target);
    }
    for (const obligationId of group.obligationIds) {
      const selected = proofCaseFor(group, obligationId);
      const result = results.get(`${selected.target}\0${selected.testName}`);
      await t.test(`[${obligationId}] ${proofTarget} :: ${selected.target} :: ${selected.testName}`, () => {
        assert.equal(result.status, 0);
        assertObservedExactPass(result.stdout, selected.testName, selected.target);
      });
    }
  });
}

function assertObservedExactPass(output, testName, label) {
  const escaped = escapeRegExp(testName);
  const tapPass = new RegExp(`^ok \\d+ - ${escaped}$`, "m").test(output);
  const specPass = new RegExp(`^✔ ${escaped}(?: \\([^\\r\\n]+\\))?$`, "m").test(output);
  assert.ok(tapPass || specPass, `${label} must emit an observed PASS for the exact proof test`);
  for (const [field, expected] of [
    ["tests", 1],
    ["pass", 1],
    ["fail", 0],
    ["cancelled", 0],
    ["skipped", 0],
    ["todo", 0],
  ]) {
    assert.match(output, new RegExp(`^(?:#|ℹ)\\s*${field}\\s+${expected}$`, "mi"), `${label} must report ${field} ${expected}`);
  }
}

function readVerificationPlan() {
  const content = fs.readFileSync(path.resolve(verificationPlanRef), "utf8");
  const parsed = extractMachineReadableEvidence(content);
  assert.equal(parsed?.ok, true, parsed?.errors?.join("; "));
  return parsed.value;
}

function proofTargetFor(group, obligationId) {
  const obligation = obligationById.get(obligationId);
  assert.ok(obligation, `unknown Verification Plan obligation ${obligationId}`);
  const pairedId = obligationId.endsWith("-negative")
    ? `${obligationId.slice(0, -"-negative".length)}-expected`
    : obligationId;
  const paired = obligationById.get(pairedId) || obligation;
  const routeText = [
    paired.behavior_under_test,
    paired.expected_evidence,
    paired.source_surface,
    paired.verification_type,
    ...(paired.source_refs || []),
  ].join(" ");
  return group.targetRules.find((rule) => rule.pattern.test(routeText))?.target || group.defaultTarget;
}

function proofCaseFor(group, obligationId) {
  const target = proofTargetFor(group, obligationId);
  const obligation = obligationById.get(obligationId);
  const pairedId = obligationId.endsWith("-negative")
    ? `${obligationId.slice(0, -"-negative".length)}-expected`
    : obligationId;
  const paired = obligationById.get(pairedId) || obligation;
  const routeText = [
    paired.behavior_under_test,
    paired.expected_evidence,
    paired.source_surface,
    paired.verification_type,
    ...(paired.source_refs || []),
  ].join(" ");
  const testName = exactProofRules.find((rule) => rule.target === target && rule.pattern.test(routeText))?.testName
    || defaultProofTestByTarget.get(target);
  assert.ok(testName, `no exact proof test is registered for ${target}`);
  return { target, testName };
}

function proof(target, pattern, testName) {
  return { target, pattern, testName };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
