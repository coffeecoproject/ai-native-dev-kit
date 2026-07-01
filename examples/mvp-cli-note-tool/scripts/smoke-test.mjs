import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "src", "cli.mjs");
const source = fs.readFileSync(cli, "utf8");

for (const marker of ["note", "add", "list", "empty-state", "help"]) {
  if (!source.toLowerCase().includes(marker)) throw new Error(`Missing CLI marker: ${marker}`);
}

const help = run(["help"]);
const add = run(["add", "call customer"]);
const list = run(["list"]);
if (!help.includes("Commands: help, add <note>, list")) throw new Error("Missing help output");
if (!add.includes("Added note: call customer")) throw new Error("Missing add output");
if (!list.includes("empty-state")) throw new Error("Missing empty-state output");

const evidenceDir = path.join(root, "evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
const textEvidence = [
  "MVP CLI note tool smoke test passed.",
  "Checked help command, add command, list command, and empty-state output.",
].join("\n");
const structuredEvidence = {
  schema_version: "1.47.0",
  artifact_type: "product_completeness_evidence",
  status: "pass",
  command: "npm test",
  checks: ["help_command", "add_command", "list_command", "empty_state"],
  output_file: "evidence/smoke-output.txt",
  summary: "CLI note tool local smoke test passed.",
  authority: {
    approves_release_or_production: false,
    proves_real_users_can_use_product: false,
  },
};

fs.writeFileSync(path.join(evidenceDir, "smoke-output.txt"), `${textEvidence}\n`);
fs.writeFileSync(path.join(evidenceDir, "smoke-output.json"), `${JSON.stringify(structuredEvidence, null, 2)}\n`);

console.log(textEvidence);

function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `command failed: ${args.join(" ")}`);
  return result.stdout || "";
}
