#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { sourceItemDigest } from "./lib/work-queue-transition.mjs";
import { parseWorkQueueReport } from "./resolve-work-queue.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "predecessor", "successor", "sequence", "decision-ref", "out", "json",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");

if (unknown.length > 0) abort(`unknown option: --${unknown.join(", --")}`);

const predecessorRef = String(args.predecessor || "").trim();
const successorRef = String(args.successor || "").trim();
const sequence = Number(args.sequence || 0);
const decisionRef = String(args["decision-ref"] || "").trim();
const outputRef = String(args.out || "").trim().replaceAll("\\", "/");

if (!predecessorRef || !successorRef) abort("--predecessor and --successor are required");
if (!Number.isInteger(sequence) || sequence < 1) abort("--sequence must be a positive integer");
if (!decisionRef) abort("--decision-ref is required and must identify the explicit current user decision");
if (!/^work-queue-transitions\/.+\.md$/.test(outputRef)) abort("--out must be a work-queue-transitions/*.md path");

const predecessor = resolveBinding(predecessorRef, "predecessor");
const successor = resolveBinding(successorRef, "successor");
if (predecessor.ref === successor.ref) abort("predecessor and successor must differ");

const base = {
  schema_version: "1.114.0",
  artifact_type: "work_queue_state_transition",
  transition_ref: outputRef,
  transition_digest: "",
  sequence,
  predecessor: bindingEvidence(predecessor),
  successor: bindingEvidence(successor),
  decision: {
    authority: "EXPLICIT_CURRENT_USER_DECISION",
    decided_by: "Human",
    decision_ref: decisionRef,
  },
  boundaries: {
    rewrites_history: "No",
    authorizes_implementation: "No",
    approves_commit_or_push: "No",
    approves_release_or_production: "No",
  },
  outcome: "TASK_STATE_TRANSITION_RECORDED",
};
const evidence = { ...base, transition_digest: evidenceDigest(base, ["transition_digest"]) };
const markdown = renderMarkdown(evidence);
const outputFile = path.resolve(projectRoot, outputRef);
if (!inside(projectRoot, outputFile)) abort("--out escapes the project root");
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, markdown);
process.stdout.write(args.json ? `${JSON.stringify(evidence, null, 2)}\n` : markdown);

function resolveBinding(reference, label) {
  const source = sourceItemDigest(projectRoot, reference);
  if (!source.ok) abort(`${label} ${source.error}`);
  const content = fs.readFileSync(source.file, "utf8");
  const parsed = parseWorkQueueReport({ path: source.relativePath, title: source.relativePath, content });
  const taskId = source.ref.split("#")[1];
  const matches = parsed.items.filter((item) => item.taskId === taskId);
  if (matches.length === 0) abort(`${label} task id does not exist in its Work Queue source`);
  const states = [...new Set(matches.map((item) => item.state))];
  const intentDigests = [...new Set(matches.map((item) => item.intentDigest).filter(Boolean))];
  if (states.length !== 1 || states[0] !== "CURRENT") abort(`${label} source snapshot must record CURRENT`);
  if (intentDigests.length !== 1) abort(`${label} source snapshot must record one canonical intent digest`);
  return { ...source, taskId, intentDigest: intentDigests[0] };
}

function bindingEvidence(binding) {
  return {
    source_ref: binding.ref,
    source_digest: binding.digest,
    task_id: binding.taskId,
    intent_digest: binding.intentDigest,
    state: "CURRENT",
  };
}

function renderMarkdown(value) {
  return `# Work Queue State Transition\n\n## Human Summary\n\nThe exact predecessor task is closed and the exact successor task becomes current without rewriting either Work Queue snapshot.\n\n## Transition\n\n- Sequence: \`${value.sequence}\`\n- Predecessor: \`${value.predecessor.source_ref}\`\n- State: \`CURRENT -> DONE\`\n- Successor: \`${value.successor.source_ref}\`\n- State: \`CURRENT\`\n- Human decision: \`${value.decision.decision_ref}\`\n\n## Boundaries\n\n- Rewrites history: No\n- Authorizes implementation: No\n- Approves commit or push: No\n- Approves release or production: No\n\n## Machine-Readable Evidence\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n\n## Outcome\n\n\`${value.outcome}\`\n`;
}

function inside(root, candidate) {
  const relative = path.relative(path.resolve(root), candidate);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function abort(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
