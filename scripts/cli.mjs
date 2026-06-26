#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const manifest = readJsonIfExists(path.join(kitRoot, "dev-kit-manifest.json"));
const packageJson = readJsonIfExists(path.join(kitRoot, "package.json"));
const version = manifest?.devKitVersion || packageJson?.version || readVersionFile();

const commandRegistry = {
  init: {
    description: "Initialize workflow assets in a target project.",
    script: "scripts/init-project.mjs",
    writes: true,
    buildArgs: (args) => args,
  },
  update: {
    description: "Update workflow assets in an already configured target project.",
    script: "scripts/init-project.mjs",
    writes: true,
    buildArgs: (args) => ["--update-workflow-assets", ...args],
  },
  next: {
    description: "Inspect current project state and report the next safe workflow action.",
    script: "scripts/workflow-next.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  check: {
    description: "Run AI workflow checks for a target project.",
    script: "scripts/check-ai-workflow.mjs",
    writes: false,
    buildArgs: (args) => withDefaultMode(withDefaultTarget(args), "core"),
  },
  doctor: {
    description: "Run workflow-next followed by core workflow checks.",
    writes: false,
    sequence: (args) => {
      const target = firstPositional(args, new Set()) || ".";
      return [
        { script: "scripts/workflow-next.mjs", args: [target] },
        { script: "scripts/check-ai-workflow.mjs", args: [target, "--mode", "core"] },
      ];
    },
  },
  new: {
    description: "Create a new workflow artifact using the existing generator.",
    script: "scripts/new-workflow-item.mjs",
    writes: true,
    buildArgs: (args) => args,
  },
  migrate: {
    description: "Planned migration facade for a later productization phase.",
    planned: true,
  },
  fixtures: {
    description: "Run dev-kit fixture checks.",
    script: "scripts/check-fixtures.mjs",
    writes: false,
    buildArgs: (args) => args,
  },
  "self-check": {
    description: "Run full dev-kit self-check.",
    script: "scripts/check-dev-kit.mjs",
    writes: false,
    buildArgs: (args) => args,
  },
};

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const cleanArgv = argv.filter((item) => item !== "--dry-run");
const commandIndex = cleanArgv.findIndex((item) => !item.startsWith("-"));
const commandName = commandIndex === -1 ? null : cleanArgv[commandIndex];
const commandArgs = commandIndex === -1 ? [] : cleanArgv.slice(commandIndex + 1);
const globalArgs = commandIndex === -1 ? cleanArgv : cleanArgv.slice(0, commandIndex);

if (globalArgs.includes("--version") || globalArgs.includes("-v")) {
  console.log(version);
  process.exit(0);
}

if (globalArgs.includes("--help") || globalArgs.includes("-h") || !commandName) {
  printHelp();
  process.exit(0);
}

if (globalArgs.length > 0) {
  console.error(`Unknown global option: ${globalArgs.join(" ")}`);
  printShortUsage();
  process.exit(1);
}

const command = commandRegistry[commandName];
if (!command) {
  console.error(`Unknown command: ${commandName}`);
  printShortUsage();
  process.exit(1);
}

if (commandArgs.includes("--help") || commandArgs.includes("-h")) {
  printCommandHelp(commandName, command);
  process.exit(0);
}

if (command.planned) {
  console.error(`Command '${commandName}' is planned but not implemented in ${version}.`);
  console.error("Use the underlying migration guidance in a later productization phase when it is available.");
  process.exit(2);
}

const result = runCommand(commandName, command, commandArgs, { dryRun });
process.exit(result.status);

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readVersionFile() {
  const versionPath = path.join(kitRoot, "VERSION.md");
  if (!fs.existsSync(versionPath)) return "0.0.0";
  const match = fs.readFileSync(versionPath, "utf8").match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : "0.0.0";
}

function printShortUsage() {
  console.error("Run `node scripts/cli.mjs --help` for usage.");
}

function printHelp() {
  console.log(`AI Native Dev Kit CLI ${version}`);
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/cli.mjs <command> [args]");
  console.log("");
  console.log("Global options:");
  console.log("  --help       Show help");
  console.log("  --version    Print dev-kit version");
  console.log("  --dry-run    Print the underlying command without running it");
  console.log("");
  console.log(`Manifest: ${manifest ? `dev-kit-manifest.json (${manifest.mode}, ${manifest.devKitVersion})` : "not found"}`);
  console.log("");
  console.log("Commands:");
  for (const [name, command] of Object.entries(commandRegistry)) {
    const label = command.planned ? `${name} (planned)` : name;
    console.log(`  ${label.padEnd(18)} ${command.description}`);
  }
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/cli.mjs init --starter generic-project --target ../my-project");
  console.log("  node scripts/cli.mjs update --target ../my-project");
  console.log("  node scripts/cli.mjs next ../my-project");
  console.log("  node scripts/cli.mjs check ../my-project --mode core");
  console.log("  node scripts/cli.mjs self-check");
  console.log("");
  console.log("Lower-level scripts remain supported for debugging and exact CI references.");
}

function printCommandHelp(name, command) {
  console.log(`ai-native ${name}`);
  console.log("");
  console.log(command.description);
  console.log("");
  if (command.planned) {
    console.log("Status: planned for a later productization phase.");
    return;
  }
  if (command.sequence) {
    for (const entry of command.sequence([])) printDisplayCommand(entry.script, entry.args);
    return;
  }
  printDisplayCommand(command.script, command.buildArgs([]));
}

function runCommand(name, command, args, options) {
  if (command.sequence) {
    const sequence = command.sequence(args);
    if (options.dryRun) {
      for (const entry of sequence) printDisplayCommand(entry.script, entry.args);
      return { status: 0 };
    }
    for (const entry of sequence) {
      const result = runScript(entry.script, entry.args, { showCommand: false });
      if (result.status !== 0) return result;
    }
    return { status: 0 };
  }

  const builtArgs = command.buildArgs(args);
  if (options.dryRun) {
    printDisplayCommand(command.script, builtArgs);
    return { status: 0 };
  }
  if (command.writes) {
    console.log(`Underlying command: ${displayCommand(command.script, builtArgs)}`);
  }
  return runScript(command.script, builtArgs, { showCommand: false, commandName: name });
}

function runScript(script, args) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: kitRoot,
    encoding: "utf8",
    stdio: "inherit",
  });
}

function printDisplayCommand(script, args) {
  console.log(displayCommand(script, args));
}

function displayCommand(script, args) {
  return ["node", script, ...args].map(shellQuote).join(" ");
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, "'\\''")}'`;
}

function withDefaultTarget(args) {
  return firstPositional(args, new Set(["--mode"])) ? args : [".", ...args];
}

function withDefaultMode(args, defaultMode) {
  return args.includes("--mode") ? args : [...args, "--mode", defaultMode];
}

function firstPositional(args, valueOptions) {
  for (let index = 0; index < args.length; index += 1) {
    const item = args[index];
    if (valueOptions.has(item)) {
      index += 1;
      continue;
    }
    if (!item.startsWith("-")) return item;
  }
  return null;
}
