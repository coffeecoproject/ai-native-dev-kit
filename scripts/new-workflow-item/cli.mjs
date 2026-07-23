import path from "node:path";
import { addFrontmatter } from "../lib/frontmatter.mjs";
import { canonicalFileDigest, projectIdentity } from "../lib/evidence-authority.mjs";
import { loadReviewContextAuthority, reviewContextBinding } from "../lib/review-context-authority.mjs";
import { fillArtifact, frontmatterFor } from "./fillers.mjs";
import {
  inferRefsFromTask,
  localDate,
  nextNumber,
  numberFromPath,
  parseNameFromPath,
  readCurrentIntentOSVersion,
  readTemplate,
  resolveRef,
  siblingArtifactRef,
  slugify,
  titleFromSlug,
  writeArtifact,
} from "./references.mjs";
import { aliases, typeMap } from "./registry.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function usage() {
  console.error("Usage:");
  console.error("  node scripts/new-workflow-item.mjs --type request --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type preflight --from requests/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type spec --request requests/001-first-slice.md --preflight preflight/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type eval --spec specs/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type task --spec specs/001-first-slice.md --eval evals/001-first-slice.md --level L1");
  console.error("  node scripts/new-workflow-item.mjs --type ai-log --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type review-packet --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type gpt-review-prompt --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type review-loop-report --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type adoption-assessment --name existing-project");
  console.error("  node scripts/new-workflow-item.mjs --type governance-map --name existing-project");
  console.error("  node scripts/new-workflow-item.mjs --type human-status-report --name workflow-next");
  console.error("  node scripts/new-workflow-item.mjs --type decision-brief --name baseline-selection");
  console.error("  node scripts/new-workflow-item.mjs --type plain-review-summary --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type customer-handoff --name release-001");
  console.error("  node scripts/new-workflow-item.mjs --type follow-up-proposal --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type final-report --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type goal-card --name first-slice --goal-mode DEFINE_WORK");
  console.error("  node scripts/new-workflow-item.mjs --type subagent-run-plan --name first-slice --subagent-mode READ_ONLY_RESEARCH");
  console.error("  node scripts/new-workflow-item.mjs --type launch-readiness-report --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type conversation-turn-classification --name user-scope-change");
  console.error("  node scripts/new-workflow-item.mjs --type scope-change-report --name add-payments");
  console.error("  node scripts/new-workflow-item.mjs --type adoption-trial-report --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type real-adoption-trial-report --name governed-web-readonly");
  console.error("  node scripts/new-workflow-item.mjs --type patch-classification --name governed-web-repair-scale");
  console.error("  node scripts/new-workflow-item.mjs --type workflow-adoption-map --name governed-project");
  console.error("  node scripts/new-workflow-item.mjs --type native-migration-plan --name governed-project");
  console.error("  node scripts/new-workflow-item.mjs --type document-lifecycle-report --name stale-docs");
  console.error("  node scripts/new-workflow-item.mjs --type document-archive-apply-plan --name stale-docs-archive-plan");
  console.error("  node scripts/new-workflow-item.mjs --type controlled-apply-readiness-report --name workflow-assets");
  console.error("  node scripts/new-workflow-item.mjs --type approval-record --name workflow-assets");
  console.error("  node scripts/new-workflow-item.mjs --type beginner-entry-card --name first-user-goal");
  console.error("  node scripts/new-workflow-item.mjs --type conversation-ask-card --name first-conversation-goal");
  console.error("  node scripts/new-workflow-item.mjs --type work-queue-report --name current-work");
  console.error("  node scripts/new-workflow-item.mjs --type hook-orchestration-plan --name project-hooks");
  console.error("  node scripts/new-workflow-item.mjs --type project-hook-policy --name project-hooks");
  console.error("  node scripts/new-workflow-item.mjs --type active-work-thread --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type guided-decision-summary --name status-model");
  console.error("  node scripts/new-workflow-item.mjs --type change-boundary-report --name task-scope");
  console.error("  node scripts/new-workflow-item.mjs --type baseline-state-report --name no-code-baseline");
  console.error("  node scripts/new-workflow-item.mjs --type baseline-pack-selection-report --name project-baseline-packs");
  console.error("  node scripts/new-workflow-item.mjs --type standard-baseline-selection-report --name project-standard-baseline");
  console.error("  node scripts/new-workflow-item.mjs --type baseline-decision-card --name project-baseline-decision");
  console.error("  node scripts/new-workflow-item.mjs --type workflow-guidance-card --name first-guidance");
  console.error("  node scripts/new-workflow-item.mjs --type review-surface-card --name task-review-surface");
  console.error("  node scripts/new-workflow-item.mjs --type change-impact-coverage-report --name contract-input-rule");
  console.error("  node scripts/new-workflow-item.mjs --type delivery-path-report --name current-delivery-path");
  console.error("  node scripts/new-workflow-item.mjs --type debt-knowledge-handoff-report --name interrupted-task");
  console.error("  node scripts/new-workflow-item.mjs --type execution-closure-report --name task-closure");
  console.error("  node scripts/new-workflow-item.mjs --type user-decision-card --name first-decision");
  console.error("  node scripts/new-workflow-item.mjs --type control-effectiveness-report --name current-control-claim");
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}


const args = parseArgs(process.argv.slice(2));
const rawType = args.type ? String(args.type) : "";
const type = aliases[rawType] || rawType;

if (!type || !typeMap[type]) {
  usage();
  fail("missing or invalid --type");
}

const projectRoot = path.resolve(process.cwd(), args.root || ".");
const config = typeMap[type];
const taskBasedTypes = new Set(["log", "review-packet", "review-loop-report", "gpt-review-prompt", "follow-up-proposal", "final-report", "goal-card", "subagent-run-plan", "change-boundary-report", "baseline-state-report", "change-impact-coverage-report"]);

let requestRef = resolveRef(projectRoot, args.request || (type === "preflight" ? args.from : null), "request");
let preflightRef = resolveRef(projectRoot, args.preflight, "preflight");
let specRef = resolveRef(projectRoot, args.spec || (type === "eval" || type === "task" ? args.from : null), "spec");
let evalRef = resolveRef(projectRoot, args.eval, "eval");
let taskRef = resolveRef(projectRoot, args.task || (taskBasedTypes.has(type) ? args.from : null), "task");
const logRef = resolveRef(projectRoot, args.log, "log");
let level = args.level;

const inferredRefs = inferRefsFromTask(projectRoot, {
  evalRef,
  level,
  preflightRef,
  requestRef,
  specRef,
  taskRef,
});
requestRef = inferredRefs.requestRef;
preflightRef = inferredRefs.preflightRef;
specRef = inferredRefs.specRef;
evalRef = inferredRefs.evalRef;
level = inferredRefs.level;

if (type === "preflight" && !requestRef) fail("preflight requires --from or --request");
if (type === "spec" && !requestRef) fail("spec requires --request");
if (type === "eval" && !specRef) fail("eval requires --spec or --from");
if (type === "task" && !specRef) fail("task requires --spec or --from");
if (type === "task" && !evalRef) fail("task requires --eval");
if (type === "log" && !taskRef) fail("ai-log requires --task or --from");
if (["review-packet", "review-loop-report", "gpt-review-prompt", "follow-up-proposal", "final-report"].includes(type) && !taskRef && !args.name) {
  fail(`${type} requires --task, --from, or --name`);
}

const sourceForName = taskBasedTypes.has(type)
  ? taskRef || specRef || requestRef || logRef
  : requestRef || specRef || taskRef || logRef;
const slug = slugify(args.name || (sourceForName ? parseNameFromPath(sourceForName) : config.defaultName || "workflow-item"));
const title = titleFromSlug(slug);
const explicitNumber = args.number ? String(args.number) : "";
if (explicitNumber && !/^\d+$/.test(explicitNumber)) {
  fail("--number must contain digits only");
}
const number = args.number
  ? explicitNumber.padStart(3, "0")
  : numberFromPath(sourceForName || "") || nextNumber(projectRoot, config.dir);
const date = localDate();
const filename = type === "log" ? `${date}-${slug}.md` : `${number}-${slug}.md`;
const reviewPacketRef = resolveRef(projectRoot, args["review-packet"] || args.packet, "review packet")
  || siblingArtifactRef(projectRoot, "review-packets", number, slug);
const gptReviewPromptRef = resolveRef(projectRoot, args["gpt-review-prompt"] || args.prompt, "GPT review prompt")
  || siblingArtifactRef(projectRoot, "gpt-review-prompts", number, slug);
const reviewLoopReportRef = resolveRef(projectRoot, args["review-loop-report"] || args["loop-report"], "review loop report")
  || siblingArtifactRef(projectRoot, "review-loop-reports", number, slug);
const finalReportRef = resolveRef(projectRoot, args["final-report"], "final report")
  || siblingArtifactRef(projectRoot, "final-reports", number, slug);
const baseContext = {
  date,
  intentOSVersion: readCurrentIntentOSVersion(projectRoot),
  evalRef,
  level,
  number,
  preflightRef,
  priority: args.priority,
  projectRoot,
  requestRef,
  slug,
  specRef,
  taskRef,
  logRef,
  reviewPacketRef,
  gptReviewPromptRef,
  reviewLoopReportRef,
  finalReportRef,
  title,
  agent: args.agent,
  goalMode: args["goal-mode"] || args.mode,
  subagentMode: args["subagent-mode"] || args.mode,
  reviewContextBinding: reviewContextBinding(loadReviewContextAuthority(projectRoot)),
  projectIdentity: projectIdentity(projectRoot),
  taskDigest: taskRef ? canonicalFileDigest(path.join(projectRoot, taskRef)) : "N/A",
};

let content = fillArtifact(type, readTemplate(projectRoot, config.template), baseContext);

const frontmatter = frontmatterFor(type, baseContext);
if (frontmatter) content = addFrontmatter(content, frontmatter);

const created = writeArtifact(projectRoot, config.dir, filename, content);

console.log(`created ${created}`);
console.log("");
console.log("Next steps:");
if (type === "review-packet") {
  console.log("- Fill diff summary, commands run, evidence refs, known risks, and open questions.");
  console.log("- Send this packet to a human reviewer, GPT Pro, or a second model when independent review is needed.");
  console.log("- Do not treat the packet itself as approval.");
} else if (type === "gpt-review-prompt") {
  console.log("- Pair this prompt with the matching Review Packet for GPT Pro, a second model, or another read-only reviewer.");
  console.log("- Do not paste secrets, credentials, production tokens, or sensitive runtime data.");
  console.log("- Feed findings back into a Review Loop Report before Codex fixes anything.");
} else if (type === "review-loop-report") {
  console.log("- Record review findings, AUTO_FIX attempts, verification, repeated issues, and human-decision items.");
  console.log("- AUTO_FIX is limited to 2 rounds and must stay inside approved task scope.");
  console.log("- Return technical scope, architecture, migration, dependency, verification, and rollback gaps to Codex; ask the user only through a permitted input class.");
} else if (type === "adoption-assessment" || type === "governance-map") {
  console.log("- Keep this read-only until the controlled apply chain proves the exact target and authority.");
  console.log("- Do not use this file as permission to run init-project or update workflow assets.");
} else if (type === "baseline-pack-selection-report") {
  console.log("- Fill project classification, BL level, selected profiles, recommended packs, not-selected packs, evidence, and any permitted user input.");
  console.log("- Run node scripts/check-baseline-pack-selection.mjs . --report <report> before treating the technical recommendation as ready.");
  console.log("- Do not treat this report as target-project write, implementation, release, production, or draft-pack stability approval.");
} else if (type === "standard-baseline-selection-report") {
  console.log("- Fill project classification, selected profiles, BL level, standard packs, optional industrial overlays, evidence, and any permitted user input.");
  console.log("- Run node scripts/check-standard-baseline-selection.mjs . --report <report> before treating the technical recommendation as ready.");
  console.log("- Do not treat this report as target-project write, implementation, release, production, or compliance/security/privacy approval.");
} else if (type === "human-status-report") {
  console.log("- Start with status, risk, whether AI can continue, and the next safe step.");
  console.log("- Keep technical fields and command output under Technical Details.");
} else if (type === "decision-brief") {
  console.log("- Fill one plain outcome, the Codex recommendation, evidence, and any permitted user input still missing.");
  console.log("- Do not expose raw technical options or treat this brief as authority by itself.");
} else if (type === "plain-review-summary") {
  console.log("- Summarize Review Loop results for a human before listing technical findings.");
  console.log("- Return technical findings to Codex; surface only missing business facts, exact real-world consent, or unavailable external facts.");
} else if (type === "customer-handoff") {
  console.log("- Summarize delivered scope, verification, exclusions, risks, and decisions needed.");
  console.log("- Do not treat this handoff summary as release approval by itself.");
} else if (type === "follow-up-proposal") {
  console.log("- Classify the suggestion as IN_SCOPE_NEXT_STEP, DIRECT_FOLLOW_UP, RISK_DECISION, OUT_OF_SCOPE_OBSERVATION, or DO_NOT_PROCEED.");
  console.log("- Do not implement the proposal until it enters a valid request, task, and evidence-backed authority path.");
} else if (type === "final-report") {
  console.log("- Fill Completed, Verified, Not Changed, Risks Remaining, Next-Step Suggestions, permitted user input, and Next Safe Action.");
  console.log("- Keep next-step suggestions bounded, classified, and actionable.");
} else if (type === "goal-card") {
  console.log("- Codex validates the selected Goal Mode against current evidence before execution; the user does not choose the internal route.");
  console.log("- Run node scripts/check-goal-mode.mjs . after filling the card.");
  console.log("- Do not treat the Goal Card as implementation approval.");
} else if (type === "subagent-run-plan") {
  console.log("- Use the smallest needed helper-agent set and keep the main thread as owner.");
  console.log("- Close or skip every subagent after handoff; do not leave RUNNING agents occupying slots.");
  console.log("- Run node scripts/check-subagent-orchestration.mjs . before final response or commit.");
} else if (type === "launch-readiness-report") {
  console.log("- Fill verification, permitted user input, release boundary, rollback, and known limitations before claiming readiness.");
  console.log("- Run node scripts/check-launch-readiness.mjs . after filling the report.");
} else if (type === "conversation-turn-classification" || type === "scope-change-report") {
  console.log("- Fill routing, scope impact, risk impact, and human decision fields before acting on the turn.");
  console.log("- Run node scripts/check-conversation-drift.mjs . after filling the report.");
} else if (type === "adoption-trial-report") {
  console.log("- Fill the starting idea, Codex routing, baseline path, artifact path, human decisions, drift events, verification, and delivery boundary.");
  console.log("- Label simulated evidence as simulated; do not claim real-project or production validation without evidence.");
  console.log("- Run node scripts/check-first-delivery-walkthrough.mjs . after filling the report.");
} else if (type === "real-adoption-trial-report") {
  console.log("- Keep the target project read-only; record git status before and after if a real target was inspected.");
  console.log("- Do not include private target names in public evidence unless explicitly approved.");
  console.log("- Run node scripts/check-real-adoption-trial.mjs . after filling the report.");
} else if (type === "patch-classification") {
  console.log("- Classify repair scale before proposing or applying a non-trivial fix.");
  console.log("- Do not treat patch classification as implementation authorization.");
  console.log("- Run node scripts/check-patch-classification.mjs . after filling the report.");
} else if (type === "patch-classification-false-positive") {
  console.log("- Use this only when a high-risk keyword appears to be background context after review.");
  console.log("- Do not use false-positive records to approve implementation or weaken gates.");
  console.log("- Run node scripts/check-patch-classification.mjs . after filling the report.");
} else if (type === "active-work-thread") {
  console.log("- Keep exactly one Current Mainline visible and move side ideas into Parking Lot.");
  console.log("- Do not treat parking-lot items as approved backlog or implementation scope.");
  console.log("- Use this artifact only when broad conversation or drift makes the mainline unclear.");
} else if (type === "guided-decision-summary") {
  console.log("- Translate raw technical choices into product, effort, or risk choices the human can own.");
  console.log("- Recommend one smallest safe path and record what Codex must not do without further approval.");
  console.log("- Do not treat this summary as approval for release, production, migration, payment, privacy, or high-risk work.");
} else if (type === "change-boundary-report") {
  console.log("- Compare actual changed files with the approved task boundary.");
  console.log("- Do not mark PASS when forbidden or out-of-scope files changed.");
  console.log("- Run node scripts/check-change-boundary.mjs . --report <this-file> after filling the report.");
} else if (type === "change-impact-coverage-report") {
  console.log("- Close every affected surface as DONE, NOT_APPLICABLE, OUT_OF_SCOPE, or NEEDS_HUMAN_DECISION.");
  console.log("- Do not claim a cross-surface rule is complete after backend-only or frontend-only work.");
  console.log("- Run node scripts/check-change-impact-coverage.mjs . after filling the report.");
  console.log("- For completed strict close-out records, run node scripts/check-change-impact-coverage.mjs . --require-structured-evidence --mode closure --strict-evidence.");
} else if (type === "baseline-state-report") {
  console.log("- Keep no-code and evidence-required baselines separate from confirmed project facts.");
  console.log("- Do not claim production-ready or industrial-grade status without evidence.");
  console.log("- Run node scripts/check-baseline-state.mjs . --report <this-file> after filling the report.");
} else if (type === "approval-record") {
  console.log("- Keep this as DRAFT until a human approves exact action IDs and bounded target paths.");
  console.log("- Fill plan hash, expiry, rollback acknowledgement, and verification acknowledgement before marking APPROVED.");
  console.log("- Run node scripts/check-approval-record.mjs . after filling the record.");
} else {
  console.log("- Fill all placeholder sections from project conversation and evidence.");
  console.log("- Keep exactly one request/preflight/spec/eval/task chain for the current implementation task.");
  console.log("- Run node scripts/check-workflow-artifacts.mjs . --mode ready before implementation.");
  console.log("- If any Risk Gate item is checked, run node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card> after approval.");
}
