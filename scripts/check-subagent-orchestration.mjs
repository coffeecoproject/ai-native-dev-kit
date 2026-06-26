#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const knownFlags = new Set(["run-plan", "json"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

const allowedModes = new Set([
  "READ_ONLY_RESEARCH",
  "PLAN_THEN_BUILD",
  "REVIEW_LOOP",
  "AUTO_FIX_REPAIR",
  "REPORTING",
]);

const allowedAuthorities = new Set(["READ_ONLY", "READ_ONLY_DRAFT", "WRITER", "WRITER_LIMITED"]);
const allowedStatuses = new Set(["PLANNED", "RUNNING", "CLOSED", "SKIPPED"]);
const writerAuthorities = new Set(["WRITER", "WRITER_LIMITED"]);
const activeStatuses = new Set(["RUNNING"]);

const requiredSections = [
  "Human Summary",
  "Goal",
  "Orchestration Mode",
  "Role Roster",
  "Writer Control",
  "Lifecycle Closure",
  "Allowed Actions",
  "Forbidden Actions",
  "Handoff / Findings",
  "Human Decisions Needed",
  "Next Safe Step",
  "Technical Details",
  "Audit Notes",
];

let failed = false;
const results = [];

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      parsed._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
}

function listRunPlans() {
  if (args["run-plan"]) {
    const rel = String(args["run-plan"]);
    const full = path.resolve(projectRoot, rel);
    if (!fs.existsSync(full)) return [{ rel, missing: true }];
    return [{ rel: path.relative(projectRoot, full).replaceAll(path.sep, "/"), full }];
  }

  const dir = path.join(projectRoot, "subagent-run-plans");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => ({
      rel: path.join("subagent-run-plans", file).replaceAll(path.sep, "/"),
      full: path.join(dir, file),
    }));
}

function selectedMode(content) {
  const body = sectionBody(content, "Orchestration Mode") || "";
  const selected = body.match(/\bSelected:\s*([A-Z_]+)/)?.[1];
  if (selected) return selected;
  const firstLegalMode = body.match(new RegExp(`\\b(${[...allowedModes].join("|")})\\b`))?.[1];
  return firstLegalMode || null;
}

function hasConcreteBody(content, heading) {
  const body = sectionBody(content, heading);
  if (body === null) return false;
  const cleaned = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\|[-:\s|]+\|/g, "")
    .replace(/[-*]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0;
}

function parseRoleRows(content) {
  const roster = sectionBody(content, "Role Roster") || "";
  const rows = [];
  for (const line of roster.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    if (/^\|\s*-+/.test(line) || /\bAgent ID\b/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 7) continue;
    rows.push({
      agentId: cells[0],
      role: cells[1],
      authority: cells[2],
      status: cells[3],
      writeScope: cells[4],
      closeCondition: cells[5],
      closureEvidence: cells[6],
    });
  }
  return rows;
}

function containsAny(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function isPlaceholder(value) {
  return !String(value || "").trim()
    || /^(none|n\/a|pending|tbd|todo|not_ready|yes \/ no)$/i.test(String(value || "").trim())
    || String(value || "").includes("<");
}

function validateRunPlan(plan) {
  if (plan.missing) {
    return {
      file: plan.rel,
      status: "FAIL",
      issues: [`subagent run plan does not exist: ${plan.rel}`],
    };
  }

  const content = fs.readFileSync(plan.full, "utf8");
  const issues = [];

  for (const section of requiredSections) {
    if (sectionBody(content, section) === null) {
      issues.push(`missing section: ${section}`);
    } else if (!hasConcreteBody(content, section)) {
      issues.push(`section has no concrete content: ${section}`);
    }
  }

  const mode = selectedMode(content);
  if (!mode) {
    issues.push("Orchestration Mode missing Selected value");
  } else if (!allowedModes.has(mode)) {
    issues.push(`invalid Orchestration Mode: ${mode}`);
  }

  const rows = parseRoleRows(content);
  if (rows.length === 0) {
    issues.push("Role Roster must include at least one agent row");
  }

  const activeWriters = [];
  for (const row of rows) {
    if (!row.agentId || isPlaceholder(row.agentId)) issues.push("Role Roster row missing Agent ID");
    if (!allowedAuthorities.has(row.authority)) issues.push(`invalid authority for ${row.agentId || "unknown"}: ${row.authority}`);
    if (!allowedStatuses.has(row.status)) issues.push(`invalid status for ${row.agentId || "unknown"}: ${row.status}`);
    if (writerAuthorities.has(row.authority) && activeStatuses.has(row.status)) activeWriters.push(row);
    if (row.status === "RUNNING") {
      issues.push(`subagent must be closed before final response: ${row.agentId || "unknown"}`);
    }
    if ((row.status === "CLOSED" || row.status === "SKIPPED") && isPlaceholder(row.closureEvidence)) {
      issues.push(`closed or skipped subagent needs closure evidence: ${row.agentId || "unknown"}`);
    }
    if (row.authority === "READ_ONLY" && !/none/i.test(row.writeScope)) {
      issues.push(`READ_ONLY subagent must have write scope none: ${row.agentId || "unknown"}`);
    }
  }

  if (activeWriters.length > 1) {
    issues.push("more than one active writer is not allowed");
  }

  const writerControl = sectionBody(content, "Writer Control") || "";
  if (!/Many readers,\s*one writer:\s*Yes/i.test(writerControl)) {
    issues.push("Writer Control must record Many readers, one writer: Yes");
  }
  if (/Single active writer:\s*No/i.test(writerControl)) {
    issues.push("Single active writer must not be No");
  }
  if (/Disjoint write ownership used:\s*Yes/i.test(writerControl)
    && !containsAny(writerControl, [/human-approved/i, /Owner/i, /Expiry/i])) {
    issues.push("disjoint write ownership needs human-approved owner and expiry");
  }

  const lifecycle = sectionBody(content, "Lifecycle Closure") || "";
  if (/All subagents closed:\s*No/i.test(lifecycle)) {
    issues.push("all subagents must be closed or skipped before final response");
  }
  if (!/Closure required before final response:\s*Yes/i.test(lifecycle)) {
    issues.push("Lifecycle Closure must require closure before final response");
  }
  if (!/No background or standing agents:\s*Yes/i.test(lifecycle)) {
    issues.push("Lifecycle Closure must forbid background or standing agents");
  }
  if (/No subagent left occupying a slot after handoff:\s*No/i.test(lifecycle)) {
    issues.push("subagents must not be left occupying slots after handoff");
  }

  const forbidden = sectionBody(content, "Forbidden Actions") || "";
  for (const pattern of [
    /leave subagents running/i,
    /`?RUNNING`? agents/i,
    /standby subagents/i,
    /multiple active writers/i,
    /reviewer agents edit files/i,
    /NEEDS_HUMAN_DECISION/i,
    /persistent monitors/i,
    /automations/i,
    /external GPT\/API/i,
  ]) {
    if (!pattern.test(forbidden)) issues.push(`Forbidden Actions missing guard: ${pattern}`);
  }

  return {
    file: plan.rel,
    status: issues.length > 0 ? "FAIL" : "PASS",
    mode,
    roleCount: rows.length,
    issues,
  };
}

const plans = listRunPlans();
if (plans.length === 0) {
  if (outputJson) {
    console.log(JSON.stringify({
      status: "PASS",
      checkedRunPlans: 0,
      results: [],
    }, null, 2));
  } else {
    console.log("PASS no Subagent Run Plans found; Subagent Orchestration check skipped.");
  }
  process.exit(0);
}

for (const plan of plans) {
  const result = validateRunPlan(plan);
  results.push(result);
  if (result.status === "FAIL") failed = true;
  if (!outputJson) {
    if (result.status === "PASS") {
      console.log(`PASS ${result.file} (${result.mode}, ${result.roleCount} role(s))`);
    } else {
      for (const issue of result.issues) {
        console.error(`FAIL ${result.file}: ${issue}`);
      }
    }
  }
}

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : "PASS",
    checkedRunPlans: results.length,
    results,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log(`Subagent Orchestration check passed (${results.length} run plan(s)).`);
}
