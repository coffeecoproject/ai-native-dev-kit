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

    const checked = run("scripts/check-review-context-authority.mjs", [root], { cwd: root, scriptRoot: root });
    assert.equal(checked.status, 0, output(checked));
    assert.match(checked.stdout, /Review context authority check passed/);

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
