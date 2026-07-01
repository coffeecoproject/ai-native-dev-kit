#!/usr/bin/env node

const [command = "help", ...input] = process.argv.slice(2);
const text = input.join(" ").trim();

if (command === "help") {
  console.log("Note Tool Demo");
  console.log("Commands: help, add <note>, list");
  console.log("This local demo keeps note data in the current command only.");
} else if (command === "add") {
  if (!text) {
    console.log("Cannot add an empty note.");
    process.exitCode = 1;
  } else {
    console.log(`Added note: ${text}`);
  }
} else if (command === "list") {
  console.log("No notes yet. empty-state");
} else {
  console.log(`Unknown command: ${command}`);
  console.log("Run: node src/cli.mjs help");
  process.exitCode = 1;
}
