import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(options.scriptRoot || kitRoot, script), ...args], {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    timeout: 90_000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function output(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

test("1.107.1 generated Codex project passes the effective guidance authority scan", () => {
  const initAssetSource = fs.readFileSync(path.join(kitRoot, "scripts/init-project/assets.mjs"), "utf8");
  assert.doesNotMatch(initAssetSource, /Stop and ask before changing auth, tenant boundaries, data schema, release automation, or production defaults/);
  assert.match(initAssetSource, /Codex must perform the required evidence-backed technical review and continue only when the bounded plan is safe/);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-guidance-new-"));
  try {
    const initialized = run("scripts/init-project.mjs", [
      "--target", root,
      "--starter", "generic-project",
      "--goal", "build a small booking application",
    ]);
    assert.equal(initialized.status, 0, output(initialized));
    assert.match(initialized.stdout, /Codex reads the project, derives the platform and baseline/);
    assert.match(initialized.stdout, /missing business fact, product preference, exact real-world consent, or unavailable external fact/);
    assert.doesNotMatch(initialized.stdout, /confirm only a meaningful product, cost, ownership, or material-risk recommendation/i);
    assert.equal(
      fs.existsSync(path.join(root, ".github", "workflows", "ai-workflow-checks.yml")),
      false,
      "GitHub-hosted workflow must remain an optional adapter",
    );

    const checked = run("scripts/check-review-context-authority.mjs", [root], { cwd: root, scriptRoot: root });
    assert.equal(checked.status, 0, output(checked));
    assert.match(checked.stdout, /Review context authority check passed/);
    for (const name of fs.readdirSync(path.join(kitRoot, "starters", "generic-project", "docs"))
      .filter((value) => value.endsWith(".md"))) {
      assert.match(checked.stdout, new RegExp(`docs/${name.replaceAll(".", "\\.")} is effective and non-conflicting`));
    }

    const generated = run("scripts/new-workflow-item.mjs", [
      "--type", "goal-card",
      "--name", "booking-first-slice",
      "--goal-mode", "DEFINE_WORK",
    ], { cwd: root, scriptRoot: root });
    assert.equal(generated.status, 0, output(generated));
    assert.match(generated.stdout, /user does not choose the internal route/i);
    assert.doesNotMatch(generated.stdout, /confirm the selected goal mode/i);

    const goalCards = fs.readdirSync(path.join(root, "goal-cards"));
    const generatedCard = fs.readFileSync(path.join(root, "goal-cards", goalCards.at(-1)), "utf8");
    assert.match(generatedCard, /Codex-selected route: DEFINE_WORK/);
    assert.match(generatedCard, /NO_USER_ACTION unless project evidence proves/);
    assert.doesNotMatch(generatedCard, /Confirm the selected Goal Mode/i);

    const goalChecked = run("scripts/check-goal-mode.mjs", [root], { cwd: root, scriptRoot: root });
    assert.equal(goalChecked.status, 0, output(goalChecked));

  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("1.113 baseline selection artifacts keep technical decisions with Codex", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-guidance-baseline-output-"));
  try {
    fs.mkdirSync(path.join(root, ".intentos/core"), { recursive: true });
    fs.copyFileSync(
      path.join(kitRoot, "core/review-context-authority.json"),
      path.join(root, ".intentos/core/review-context-authority.json"),
    );
    for (const [type, dir, authorityHeading] of [
      ["baseline-state-report", "baseline-state-reports", "User Input Boundary"],
      ["baseline-pack-selection-report", "baseline-pack-selections"],
      ["standard-baseline-selection-report", "standard-baseline-selections"],
    ]) {
      const selection = run("scripts/new-workflow-item.mjs", [
        "--type", type,
        "--name", `booking-${type}`,
      ], { cwd: root });
      assert.equal(selection.status, 0, output(selection));
      const reports = fs.readdirSync(path.join(root, dir));
      const report = fs.readFileSync(path.join(root, dir, reports.at(-1)), "utf8");
      assert.match(report, new RegExp(`## ${authorityHeading || "Technical Selection Authority"}`));
      assert.match(report, /Technical decision owner: Codex/);
      assert.match(report, /(?:Default user input class|User input class): NO_USER_ACTION/);
      assert.doesNotMatch(report, /## Human Decision|pending human decision|Decision owner:\s*human|\|\s*human\s*\|\s*PENDING|none until approved/i);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("1.109 existing-project setup cannot bypass controlled adoption with force-new-project", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-guidance-existing-"));
  try {
    const existingAgent = "# Existing Project Agent\n\nPreserve project authority.\n";
    const existingPr = "# Existing Pull Request\n\nPreserve project checks.\n";
    fs.mkdirSync(path.join(root, ".github"), { recursive: true });
    fs.writeFileSync(path.join(root, "AGENTS.md"), existingAgent);
    fs.writeFileSync(path.join(root, ".github/pull_request_template.md"), existingPr);

    const initialized = run("scripts/init-project.mjs", [
      "--target",
      root,
      "--starter",
      "generic-project",
      "--force-new-project",
    ]);
    assert.notEqual(initialized.status, 0, output(initialized));
    assert.match(output(initialized), /force-new-project was removed/i);
    assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), existingAgent);
    assert.equal(fs.readFileSync(path.join(root, ".github/pull_request_template.md"), "utf8"), existingPr);
    assert.equal(fs.existsSync(path.join(root, ".intentos")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("1.107.1 manifest exposes Codex as the only formal agent adapter", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(kitRoot, "intentos-manifest.json"), "utf8"));
  const adapters = manifest.groups?.platformAdapters || [];
  assert.ok(adapters.some((value) => value.startsWith("platforms/codex/")));
  assert.ok(!adapters.some((value) => value.startsWith("platforms/claude/")));
  assert.ok(!adapters.some((value) => value.startsWith("platforms/cursor/")));
});

test("1.113 profiles and active industrial packs reserve user confirmation for real-world effects", () => {
  const allowed = new Set([
    "external-account-or-provider-action",
    "irreversible-production-data-effect",
    "paid-service-or-value-transfer",
    "production-or-external-release",
    "real-user-communication",
    "regulated-data-export-to-external-recipient",
  ]);
  for (const family of ["profiles", "industrial-packs"]) {
    for (const entry of fs.readdirSync(path.join(kitRoot, family), { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === "schema") continue;
      const fileName = family === "profiles" ? "baseline.json" : "pack.json";
      const file = path.join(kitRoot, family, entry.name, fileName);
      if (!fs.existsSync(file)) continue;
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      assert.ok(Array.isArray(value.humanApprovalRequiredFor), `${family}/${entry.name}: compatibility consent field`);
      for (const effect of value.humanApprovalRequiredFor) {
        assert.ok(allowed.has(effect), `${family}/${entry.name}: technical choice leaked into user consent: ${effect}`);
      }
      if (family === "profiles") {
        const guidance = [...(value.releaseChecks || []), ...(value.aiBoundaries?.may || []), ...(value.aiBoundaries?.mustNot || [])].join("\n");
        assert.doesNotMatch(guidance, /human approval|human technical|without (?:explicit )?human/i, `${family}/${entry.name}`);
      }
    }
  }

  const schema = JSON.parse(fs.readFileSync(path.join(kitRoot, "industrial-packs/schema/pack.schema.json"), "utf8"));
  assert.deepEqual(new Set(schema.properties.humanApprovalRequiredFor.items.enum), allowed);
  assert.match(schema.properties.humanApprovalRequiredFor.description, /Technical design.*Codex responsibilities/);
});
