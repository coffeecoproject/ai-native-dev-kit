#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const manifest = readJsonIfExists(path.join(kitRoot, "intentos-manifest.json"))
  || readJsonIfExists(path.join(kitRoot, ".intentos", "intentos-manifest.json"));
const packageJson = readJsonIfExists(path.join(kitRoot, "package.json"));
const installedVersion = readJsonIfExists(path.join(kitRoot, ".intentos", "version.json"));
const version = manifest?.intentOSVersion || installedVersion?.intentOSVersion || packageJson?.version || readVersionFile();

const commandRegistry = {
  work: {
    description: "Let one zero-experience solo developer describe a business goal while IntentOS chooses the technical workflow.",
    script: "scripts/resolve-operating-loop.mjs",
    writes: false,
    buildArgs: (args) => args,
  },
  ask: {
    description: "Accept one natural-language goal and return a beginner-friendly entry card.",
    script: "scripts/resolve-beginner-entry.mjs",
    writes: false,
    buildArgs: (args) => args,
  },
  "ask-check": {
    description: "Check recorded Beginner Entry Cards.",
    script: "scripts/check-beginner-entry.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "solo-model-check": {
    description: "Check that public entry keeps technical judgment inside IntentOS and assumes no team roles.",
    script: "scripts/check-solo-operating-model.mjs",
    writes: false,
    sourceOnly: true,
    buildArgs: (args) => args,
  },
  "conversation-ask-check": {
    description: "Check recorded Conversation Ask Cards for conversation-native entry boundaries.",
    script: "scripts/check-conversation-native-ask.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  guide: {
    description: "Read a project and return one plain-language workflow guidance card.",
    script: "scripts/resolve-workflow-guidance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "guide-check": {
    description: "Check recorded workflow guidance cards.",
    script: "scripts/check-workflow-guidance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "review-surface": {
    description: "Select review surfaces before execution without writing target files.",
    script: "scripts/resolve-review-surface.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "review-surface-check": {
    description: "Check recorded review surface cards.",
    script: "scripts/check-review-surface.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "task-governance": {
    description: "Classify task impact and route required governance without authorizing implementation.",
    script: "scripts/resolve-task-governance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "task-governance-check": {
    description: "Check recorded Task Governance reports for tier rules, source mapping, and no-authorization boundaries.",
    script: "scripts/check-task-governance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "plan-review": {
    description: "Review an implementation plan before coding, especially for permission, data-destructive, workflow, or business-rule changes.",
    script: "scripts/resolve-plan-review.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "plan-review-check": {
    description: "Check recorded Plan Review reports for pre-implementation review coverage and no-authorization boundaries.",
    script: "scripts/check-plan-review.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "impact-coverage": {
    description: "Map affected surfaces for a change so Codex does not complete only one layer.",
    script: "scripts/resolve-change-impact-coverage.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "impact-coverage-check": {
    description: "Check recorded Change Impact Coverage reports.",
    script: "scripts/check-change-impact-coverage.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "verification-plan": {
    description: "Build a read-only verification obligation plan before tests or completion claims.",
    script: "scripts/resolve-verification-plan.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "verification-plan-check": {
    description: "Check recorded Verification Plans for task-bound source refs, obligations, and test-correctness controls.",
    script: "scripts/check-verification-plan.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "test-evidence": {
    description: "Bind actual evidence to a Verification Plan without running tests or approving completion.",
    script: "scripts/resolve-test-evidence.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "test-evidence-check": {
    description: "Check recorded Test Evidence Reports for obligation coverage, evidence freshness, and no-overclaim boundaries.",
    script: "scripts/check-test-evidence.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "completion-evidence": {
    description: "Gate final task completion claims against BRC, Verification Plan, Test Evidence, and Execution Assurance.",
    script: "scripts/resolve-completion-evidence.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "completion-evidence-check": {
    description: "Check recorded Completion Evidence Gate reports before Codex claims a task is complete.",
    script: "scripts/check-completion-evidence.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  status: {
    description: "Show one plain-language delivery status card without asking the user to know internal workflow terms.",
    script: "scripts/resolve-user-delivery-console.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "status-check": {
    description: "Check recorded User Delivery Console cards for plain-language status and no-authority boundaries.",
    script: "scripts/check-user-delivery-console.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "business-rule": {
    description: "Check whether a business rule is clear enough before impact coverage and coding.",
    script: "scripts/resolve-business-rule-closure.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "business-rule-check": {
    description: "Check recorded Business Rule Closure cards.",
    script: "scripts/check-business-rule-closure.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "delivery-path": {
    description: "Report how far a project is from useful use without approving release.",
    script: "scripts/resolve-delivery-path.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "delivery-path-check": {
    description: "Check recorded delivery path reports.",
    script: "scripts/check-delivery-path.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "first-slice": {
    description: "Turn an ordinary user goal into a first useful version scope without writing target files.",
    script: "scripts/resolve-first-slice.mjs",
    writes: false,
    buildArgs: (args) => args,
  },
  "first-slice-check": {
    description: "Check recorded Ordinary User First-Slice Cards.",
    script: "scripts/check-first-slice.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "product-completeness": {
    description: "Report whether a first version is idea-only, runnable MVP, internal-trial ready, or blocked.",
    script: "scripts/resolve-product-completeness.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "product-completeness-check": {
    description: "Check recorded Product Completeness Reports.",
    script: "scripts/check-product-completeness.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "mvp-example-check": {
    description: "Check the built-in booking MVP example evidence.",
    script: "scripts/check-mvp-example.mjs",
    writes: false,
    buildArgs: (args) => args,
  },
  "apply-candidate": {
    description: "Record whether a proposed small change is low risk enough for later human-approved apply planning.",
    script: "scripts/resolve-low-risk-apply-candidate.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "apply-candidate-check": {
    description: "Check recorded Low-Risk Controlled Apply Candidate records.",
    script: "scripts/check-low-risk-apply-candidate.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "debt-handoff": {
    description: "Record debt and knowledge handoff context without forgiving debt or approving work.",
    script: "scripts/resolve-debt-handoff.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "debt-handoff-check": {
    description: "Check recorded Debt & Knowledge Handoff reports.",
    script: "scripts/check-debt-handoff.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  finish: {
    description: "Answer whether a task can be treated as done with one Unified Closure Decision.",
    script: "scripts/resolve-closure-decision.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "finish-check": {
    description: "Check recorded Unified Closure Decisions.",
    script: "scripts/check-closure-decision.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  closure: {
    description: "Close execution with changed scope, verification, debt, and commit-readiness review.",
    script: "scripts/resolve-execution-closure.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "closure-check": {
    description: "Check recorded Execution Closure reports.",
    script: "scripts/check-execution-closure.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "execution-assurance": {
    description: "Build a read-only assurance chain for execution-class work before claiming it is complete.",
    script: "scripts/resolve-execution-assurance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "execution-assurance-check": {
    description: "Check recorded Execution Assurance reports; fails if no report exists unless --allow-empty is explicit.",
    script: "scripts/check-execution-assurance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "done-check": {
    description: "Plain alias for checking recorded Execution Assurance reports; fails if no report exists.",
    script: "scripts/check-execution-assurance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "verify-execution": {
    description: "Plain alias for checking whether execution-class work has a valid recorded assurance chain.",
    script: "scripts/check-execution-assurance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "apply-plan": {
    description: "Turn proposed project writes into one reviewable plan without writing target files.",
    script: "scripts/resolve-apply-plan.mjs",
    writes: false,
    buildArgs: (args) => withDefaultApplyPlanTarget(args),
  },
  "apply-plan-check": {
    description: "Check recorded Unified Apply Plans.",
    script: "scripts/check-apply-plan.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "apply-readiness": {
    description: "Evaluate whether a Unified Apply Plan is ready for future human-approved controlled apply.",
    script: "scripts/resolve-controlled-apply-readiness.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "apply-readiness-check": {
    description: "Check recorded Controlled Apply Readiness Reports.",
    script: "scripts/check-controlled-apply-readiness.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "approval-record-check": {
    description: "Check recorded Approval Records for human-owned bounded approval evidence.",
    script: "scripts/check-approval-record.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "apply-receipt-check": {
    description: "Verify project-bound controlled apply and workflow activation receipts.",
    script: "scripts/check-apply-execution-receipt.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  start: {
    description: "Read-only project orientation; it classifies the target but does not enter adoption or write flow.",
    script: "scripts/start-project.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  baseline: {
    description: "Recommend engineering and environment baseline setup without writing by default.",
    script: "scripts/baseline-project.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "baseline-installation": {
    description: "Verify that the selected project baseline and packs are actually installed.",
    script: "scripts/check-baseline-installation.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "baseline-packs": {
    description: "Show standard baseline packs first, then optional industrial overlays.",
    script: "scripts/resolve-standard-baseline.mjs",
    writes: false,
    buildArgs: (args) => ["--umbrella", ...withDefaultTarget(args)],
  },
  "baseline-decision": {
    description: "Produce a plain-language baseline decision card without writing target files.",
    script: "scripts/resolve-guided-baseline-selection.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "baseline-decision-check": {
    description: "Check recorded baseline decision cards.",
    script: "scripts/check-guided-baseline-selection.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "standard-baseline": {
    description: "Recommend standard baseline packs without enabling packs.",
    script: "scripts/resolve-standard-baseline.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "standard-baseline-selection": {
    description: "Check recorded standard baseline selection reports.",
    script: "scripts/check-standard-baseline-selection.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "baseline-pack-selection": {
    description: "Check recorded baseline pack selection reports.",
    script: "scripts/check-baseline-pack-selection.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "product-baseline": {
    description: "Check guided delivery product boundaries and approval limits.",
    script: "scripts/check-product-baseline.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "claim-control": {
    description: "Check release and report wording against evidence boundaries.",
    script: "scripts/check-claim-control.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "context-governance": {
    description: "Check project memory, context correction, and Git boundary governance.",
    script: "scripts/check-context-governance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "launch-readiness": {
    description: "Check Safe Launch / Delivery Readiness reports.",
    script: "scripts/check-launch-readiness.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "launch-view": {
    description: "Answer whether closed work can enter launch review without approving release.",
    script: "scripts/resolve-launch-review-view.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "launch-view-check": {
    description: "Check recorded Launch Review Views.",
    script: "scripts/check-launch-review-view.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-execution": {
    description: "Plan bounded release execution after launch review and human release approval.",
    script: "scripts/resolve-release-execution.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-execution-check": {
    description: "Check recorded Release Execution Plans.",
    script: "scripts/check-release-execution.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-approval-check": {
    description: "Check project-bound structured human Release Approval Records and their strict authority chain.",
    script: "scripts/check-release-approval-record.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-adapter": {
    description: "Discover and explain a project-specific beginner release path.",
    script: "scripts/resolve-release-adapter.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-adapter-check": {
    description: "Check recorded Release Adapter Profiles.",
    script: "scripts/check-release-adapter.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-guide": {
    description: "Route launch intent through one beginner-friendly release guide.",
    script: "scripts/resolve-release-guide.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-guide-check": {
    description: "Check recorded Release Guide Cards.",
    script: "scripts/check-release-guide.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-recipe": {
    description: "Select or inspect a platform release recipe without executing release commands.",
    script: "scripts/resolve-platform-release-recipe.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-recipe-check": {
    description: "Check recorded Platform Release Recipes.",
    script: "scripts/check-platform-release-recipe.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-handoff": {
    description: "Prepare a bounded release handoff pack without executing release commands.",
    script: "scripts/resolve-release-handoff-pack.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-handoff-check": {
    description: "Check recorded Release Handoff Packs.",
    script: "scripts/check-release-handoff-pack.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-plan": {
    description: "Summarize release source systems into one pure-view Release Plan without approving or executing release.",
    script: "scripts/resolve-release-plan.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-check": {
    description: "Check recorded Release Plans for pure-view, trace, and existing-project rule-comparison boundaries.",
    script: "scripts/check-release-plan.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-evidence": {
    description: "Prepare a Release Evidence Gate report for release-owner review without approving release.",
    script: "scripts/resolve-release-evidence-gate.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-evidence-check": {
    description: "Check recorded Release Evidence Gate reports for release candidate identity, evidence, and no-approval boundaries.",
    script: "scripts/check-release-evidence-gate.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-channel": {
    description: "Prepare a Release Channel Policy report that separates source identity from release package, CI artifact, cost, and owner decisions.",
    script: "scripts/resolve-release-channel-policy.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "release-channel-check": {
    description: "Check recorded Release Channel Policy reports for source/release decoupling, owner, cost, artifact, and no-approval boundaries.",
    script: "scripts/check-release-channel-policy.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "conversation-drift": {
    description: "Check conversation turn routing and scope-change governance.",
    script: "scripts/check-conversation-drift.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "first-delivery": {
    description: "Check First Delivery Walkthrough and adoption trial evidence.",
    script: "scripts/check-first-delivery-walkthrough.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "real-adoption": {
    description: "Check real-project read-only adoption trial evidence.",
    script: "scripts/check-real-adoption-trial.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "patch-classification": {
    description: "Check repair-scale classification before non-trivial fixes.",
    script: "scripts/check-patch-classification.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "workflow-map": {
    description: "Recommend how IntentOS workflow should map to an existing project before writes.",
    script: "scripts/resolve-existing-workflow.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "workflow-map-check": {
    description: "Check recorded workflow adoption maps.",
    script: "scripts/check-workflow-adoption-map.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "native-migration": {
    description: "Switch an existing project into IntentOS Native-First Migration Planning mode without writing target files.",
    script: "scripts/resolve-native-migration.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "native-migration-check": {
    description: "Check recorded Native Migration Plans for authority, approval, restore, and no-write boundaries.",
    script: "scripts/check-native-migration.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "reconcile-rules": {
    description: "Compare existing project rules with IntentOS expectations without writing target files.",
    script: "scripts/resolve-existing-rule-reconciliation.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "reconcile-rules-check": {
    description: "Check recorded Existing Rule Reconciliation reports.",
    script: "scripts/check-existing-rule-reconciliation.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  convergence: {
    description: "Summarize how an existing project can converge toward IntentOS daily governance without writing target files.",
    script: "scripts/resolve-governance-convergence.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "convergence-check": {
    description: "Check recorded Existing Project Governance Convergence reports.",
    script: "scripts/check-governance-convergence.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "adoption-assurance": {
    description: "Verify whether an existing project has actually adopted IntentOS from evidence and read-only simulation.",
    script: "scripts/resolve-adoption-assurance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "adoption-assurance-check": {
    description: "Check recorded Adoption Assurance reports for evidence-bound adoption claims.",
    script: "scripts/check-adoption-assurance.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "adopt": {
    description: "Enter read-only existing-project safe adoption autopilot and print one safe result card.",
    script: "scripts/resolve-existing-project-adoption-autopilot.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "adopt-check": {
    description: "Check recorded Existing Project Adoption Autopilot reports.",
    script: "scripts/check-existing-project-adoption-autopilot.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "adopt-review": {
    description: "Review whether an existing project should stay partial, repair governance, or prepare a deeper adoption plan.",
    script: "scripts/resolve-controlled-native-adoption-review.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "adopt-review-check": {
    description: "Check recorded Controlled Native Adoption Review reports.",
    script: "scripts/check-controlled-native-adoption-review.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "doc-lifecycle": {
    description: "Recommend document lifecycle state without deleting, moving, or archiving files.",
    script: "scripts/resolve-document-lifecycle.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "doc-lifecycle-check": {
    description: "Check recorded document lifecycle reports.",
    script: "scripts/check-document-lifecycle.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "archive-apply": {
    description: "Plan document archive apply actions without moving, deleting, or rewriting files.",
    script: "scripts/resolve-document-archive-apply.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "archive-apply-check": {
    description: "Check recorded Document Archive Apply Plans.",
    script: "scripts/check-document-archive-apply.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "work-queue": {
    description: "Recommend current, paused, backlog, and resume state without changing task state.",
    script: "scripts/resolve-work-queue.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "work-queue-check": {
    description: "Check recorded Work Queue reports and single-current-task rules.",
    script: "scripts/check-work-queue.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "queue-takeover": {
    description: "Review whether an old project's task records should be mapped or taken over by IntentOS Work Queue.",
    script: "scripts/resolve-work-queue-takeover.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "queue-takeover-check": {
    description: "Check recorded Work Queue Takeover reports for old-project task source migration.",
    script: "scripts/check-work-queue-takeover.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "runtime-hygiene": {
    description: "Diagnose Git, push, CI, artifact, bundle, or release-runtime blockers without approving destructive actions.",
    script: "scripts/resolve-runtime-hygiene.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "runtime-hygiene-check": {
    description: "Check recorded Runtime Hygiene reports for safe continuation and non-authorizing boundaries.",
    script: "scripts/check-runtime-hygiene.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "hook-plan": {
    description: "Recommend hook orchestration candidates without installing hooks, changing CI, or adding gates.",
    script: "scripts/resolve-hook-orchestration.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "hook-plan-check": {
    description: "Check recorded Hook Orchestration Plans for plan-first boundaries.",
    script: "scripts/check-hook-orchestration.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "hook-policy": {
    description: "Recommend project hook policy without installing hooks, changing CI, or adding gates.",
    script: "scripts/resolve-hook-policy.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "hook-policy-check": {
    description: "Check recorded Project Hook Policies.",
    script: "scripts/check-hook-policy.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "guided-delivery": {
    description: "Check Guided Decision & Delivery Loop evidence.",
    script: "scripts/check-guided-delivery-loop.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "change-boundary": {
    description: "Check actual changed files against recorded task boundary.",
    script: "scripts/check-change-boundary.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  "baseline-state": {
    description: "Check proposed, evidence-required, and confirmed baseline states.",
    script: "scripts/check-baseline-state.mjs",
    writes: false,
    buildArgs: (args) => withDefaultTarget(args),
  },
  init: {
    description: "Initialize workflow assets in a target project.",
    script: "scripts/init-project.mjs",
    writes: true,
    sourceOnly: true,
    buildArgs: (args) => args,
  },
  update: {
    description: "Update workflow assets in an already configured target project.",
    script: "scripts/init-project.mjs",
    writes: true,
    sourceOnly: true,
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
    description: "Run the right diagnosis for the current path.",
    writes: false,
    displaySequence: (args) => {
      const target = firstPositional(args, new Set()) || ".";
      if (isIntentOSSourceTarget(target)) {
        return [
          { script: "scripts/workflow-next.mjs", args: [target] },
          { script: "scripts/check-intentos.mjs", args: [] },
        ];
      }
      return [
        { script: "scripts/workflow-next.mjs", args: [target] },
        { script: "scripts/check-ai-workflow.mjs", args: [target, "--mode", "core"] },
      ];
    },
    dryRun: (args) => dryRunDoctor(args),
    run: (args) => runDoctor(args),
  },
  new: {
    description: "Create a new workflow artifact using the existing generator.",
    script: "scripts/new-workflow-item.mjs",
    writes: true,
    buildArgs: (args) => args,
  },
  migrate: {
    description: "Inspect a project and produce a non-mutating migration plan.",
    script: "scripts/migrate-project.mjs",
    writes: false,
    sourceOnly: true,
    buildArgs: (args) => args,
  },
  fixtures: {
    description: "Run intentos fixture checks.",
    script: "scripts/check-fixtures.mjs",
    writes: false,
    sourceOnly: true,
    buildArgs: (args) => args,
  },
  "self-check": {
    description: "Run full intentos self-check.",
    script: "scripts/check-intentos.mjs",
    writes: false,
    sourceOnly: true,
    buildArgs: (args) => args,
  },
};

const argv = process.argv.slice(2);
const commandIndex = argv.findIndex((item) => !item.startsWith("-"));
const commandName = commandIndex === -1 ? null : argv[commandIndex];
const commandArgs = commandIndex === -1 ? [] : argv.slice(commandIndex + 1);
const globalArgs = commandIndex === -1 ? argv : argv.slice(0, commandIndex);
const dryRun = globalArgs.includes("--dry-run");
const advancedHelp = globalArgs.includes("--help-advanced");
const unknownGlobalArgs = globalArgs.filter((item) => item !== "--dry-run" && item !== "--help" && item !== "-h" && item !== "--help-advanced" && item !== "--version" && item !== "-v");

if (globalArgs.includes("--version") || globalArgs.includes("-v")) {
  console.log(version);
  process.exit(0);
}

if (advancedHelp) {
  printAdvancedHelp();
  process.exit(0);
}

if (globalArgs.includes("--help") || globalArgs.includes("-h") || !commandName) {
  printHelp();
  process.exit(0);
}

if (unknownGlobalArgs.length > 0) {
  console.error(`Unknown global option: ${unknownGlobalArgs.join(" ")}`);
  printShortUsage();
  process.exit(1);
}

const command = commandRegistry[commandName];
if (!command) {
  console.error(`Unknown command: ${commandName}`);
  printShortUsage();
  process.exit(1);
}
if (command.sourceOnly && !isIntentOSSourceTarget(".")) {
  console.error(`Command ${commandName} is available only in the IntentOS source repository.`);
  process.exit(1);
}

if (commandArgs.includes("--help") || commandArgs.includes("-h")) {
  printCommandHelp(commandName, command);
  process.exit(0);
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

function isIntentOSSourceTarget(target) {
  const targetRoot = path.resolve(process.cwd(), target);
  if (targetRoot !== kitRoot) return false;
  const targetPackage = readJsonIfExists(path.join(targetRoot, "package.json"));
  return targetPackage?.name === "intentos" && fs.existsSync(path.join(targetRoot, "intentos-manifest.json"));
}

function printShortUsage() {
  console.error("Run `node scripts/cli.mjs --help` for usage.");
}

function printHelp() {
  console.log(`IntentOS CLI ${version}`);
  console.log("Command: intentos");
  console.log("");
  console.log("Describe the real business outcome. IntentOS makes the technical decisions and asks only for missing business facts or consent to concrete real-world effects.");
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/cli.mjs work <project> \"<what you want>\"");
  console.log("");
  console.log("Global options:");
  console.log("  --help       Show help");
  console.log("  --help-advanced  Show maintainer, CI, evidence, and debugging commands");
  console.log("  --version    Print intentos version");
  console.log("  --dry-run    Preview command routing without running the selected source command");
  console.log("");
  console.log(`Manifest: ${manifest ? `intentos-manifest.json (${manifest.mode}, ${manifest.intentOSVersion})` : "not found"}`);
  console.log("");
  console.log("One public operating loop:");
  printCommandGroup(["work"]);
  console.log("");
  console.log("Plain-language meanings:");
  console.log("  Start a project       work . \"我想从零做一个预约 App\"");
  console.log("  Continue a task       work . \"继续完成预约时间规则\"");
  console.log("  Check status          work . \"检查当前任务做到哪里了\"");
  console.log("  Finish a task         work . \"这个任务做完了吗\"");
  console.log("  Prepare release       work . \"准备发布内部测试版本\"");
  console.log("  Adopt old project     work ../old-project \"把这个项目接入 IntentOS\"");
  console.log("");
  console.log("Docs:");
  console.log("  docs/start-here.md");
  console.log("  docs/operating-model.md");
  console.log(`  ${isIntentOSSourceTarget(".") ? "core" : ".intentos/core"}/zero-experience-solo-operating-model.md`);
  console.log("");
  console.log("Lower-level commands remain supported. Run `node scripts/cli.mjs --help-advanced` only for maintenance, CI, or debugging.");
}

function printAdvancedHelp() {
  const sourceCheckout = isIntentOSSourceTarget(".");
  console.log(`IntentOS CLI ${version} - Advanced Reference`);
  console.log("Command: intentos");
  console.log("");
  console.log("These commands are implementation details for Codex, maintainers, CI, evidence review, and debugging.");
  console.log("Ordinary users should use: node scripts/cli.mjs work <project> \"<what you want>\"");
  console.log("Advanced commands remain available for exact maintenance and evidence workflows.");
  console.log("");
  console.log("Global options: --help, --help-advanced, --version, --dry-run");
  console.log("");
  console.log(`Manifest: ${manifest ? `intentos-manifest.json (${manifest.mode}, ${manifest.intentOSVersion})` : "not found"}`);
  console.log("");
  console.log("Primary entry commands:");
  printCommandGroup(["work", "start", "adopt", "adopt-review", "next", "doctor"]);
  console.log("");
  console.log("Common user-facing decisions:");
  printCommandGroup(["ask", "guide", "task-governance", "status", "finish", "completion-evidence", "execution-assurance", "runtime-hygiene", "release-guide", "release-plan", "release-evidence", "release-channel", "apply-plan"]);
  console.log("");
  console.log(sourceCheckout
    ? "Advanced commands available in this source checkout:"
    : "Advanced target-project commands available in this installed distribution:");
  printCommandGroup(Object.keys(commandRegistry).filter((name) => ![
    "work", "start", "adopt", "adopt-review", "next", "doctor", "ask", "guide",
    "task-governance", "status", "finish", "completion-evidence", "execution-assurance",
    "runtime-hygiene", "release-guide", "release-plan", "release-evidence", "release-channel", "apply-plan",
  ].includes(name) && (sourceCheckout || !commandRegistry[name].sourceOnly)));
  if (!sourceCheckout) {
    console.log("");
    console.log("Source maintenance commands such as init, update, migrate, fixtures, and self-check must run from the IntentOS source checkout.");
  }
  console.log("");
  console.log("Docs:");
  console.log("  docs/start-here.md");
  console.log("  docs/minimal-adoption.md");
  console.log("  docs/source-only-adoption.md");
  console.log("  docs/for-existing-projects.md");
  console.log("  docs/for-maintainers.md");
  console.log("  docs/reference/scripts.md");
  console.log("");
  console.log("Lower-level scripts remain supported for debugging and exact CI references.");
}

function printCommandGroup(names) {
  for (const name of names) {
    const command = commandRegistry[name];
    if (!command) continue;
    console.log(`  ${name.padEnd(24)} ${command.description}`);
  }
}

function printCommandHelp(name, command) {
  if (name === "work") {
    printWorkHelp();
    return;
  }
  console.log(`IntentOS command: ${name}`);
  console.log("Command: intentos");
  console.log("");
  console.log(command.description);
  console.log("");
  if (command.displaySequence || command.sequence) {
    const sequence = command.displaySequence ? command.displaySequence([]) : command.sequence([]);
    for (const entry of sequence) printDisplayCommand(entry.script, entry.args);
    return;
  }
  printDisplayCommand(command.script, command.buildArgs([]));
}

function printWorkHelp() {
  console.log("IntentOS command: work");
  console.log("Command: intentos");
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/cli.mjs work <project> \"<what you want>\"");
  console.log("  node scripts/cli.mjs work <project> --intent \"<what you want>\" --json");
  console.log("");
  console.log("Meanings: start a project, continue a task, check status, finish a task, prepare release, or adopt an existing project.");
  console.log("");
  console.log("The response contains one derived next action with its reason, blockers, source inputs, and no-authority boundary.");
  console.log("");
  console.log("Output options: --json or --format human|json");
  console.log("");
  console.log("Boundary: read-only. This command does not write files, change task state, authorize implementation or apply, or approve release or production.");
}

function runCommand(name, command, args, options) {
  if (command.run) {
    if (options.dryRun) {
      if (command.dryRun) return command.dryRun(args, options);
      const sequence = command.displaySequence ? command.displaySequence(args) : [];
      for (const entry of sequence) printDisplayCommand(entry.script, entry.args);
      return { status: 0 };
    }
    return command.run(args, options);
  }

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
  if (command.writes || builtArgs.includes("--out")) {
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

function runScriptCapture(script, args) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: kitRoot,
    encoding: "utf8",
  });
}

function runDoctor(args) {
  const target = firstPositional(args, new Set(["--format", "--intent", "--mode"])) || ".";
  if (isIntentOSSourceTarget(target)) {
    const next = runScript("scripts/workflow-next.mjs", [target]);
    if (next.status !== 0) return next;
    return runScript("scripts/check-intentos.mjs", []);
  }

  const next = runScript("scripts/workflow-next.mjs", [target]);
  if (next.status !== 0) return next;

  const diagnosis = runScriptCapture("scripts/workflow-next.mjs", [target, "--format", "json"]);
  const report = parseJsonOrNull(diagnosis.stdout);
  if (diagnosis.status === 0 && shouldStopDoctorAtExistingProjectDiagnosis(report)) {
    console.log("");
    console.log("Doctor old-project mode: skipped full workflow asset checks.");
    console.log("Reason: IntentOS is active for Codex work, but project asset migration is plan-first.");
    console.log("Next safe step: run native-migration and reconcile-rules --auto-native, then prepare a reviewed apply plan only if approved.");
    return { status: 0 };
  }

  return runScript("scripts/check-ai-workflow.mjs", [target, "--mode", "core"]);
}

function dryRunDoctor(args) {
  const target = firstPositional(args, new Set(["--format", "--intent", "--mode"])) || ".";
  printDisplayCommand("scripts/workflow-next.mjs", [target]);
  if (isIntentOSSourceTarget(target)) {
    printDisplayCommand("scripts/check-intentos.mjs", []);
    return { status: 0 };
  }

  const diagnosis = runScriptCapture("scripts/workflow-next.mjs", [target, "--format", "json"]);
  const report = parseJsonOrNull(diagnosis.stdout);
  if (diagnosis.status === 0 && shouldStopDoctorAtExistingProjectDiagnosis(report)) {
    console.log("# then: old governed/production project stops at adoption diagnosis");
    console.log("# next safe step: native-migration + reconcile-rules --auto-native, then reviewed apply plan if approved");
    return { status: 0 };
  }
  console.log("# then: target is not in old-project diagnosis stop path");
  printDisplayCommand("scripts/check-ai-workflow.mjs", [target, "--mode", "core"]);
  return { status: 0 };
}

function shouldStopDoctorAtExistingProjectDiagnosis(report) {
  if (!report || typeof report !== "object") return false;
  const tags = new Set(Array.isArray(report.projectStateTags) ? report.projectStateTags : []);
  const governedExisting = tags.has("GOVERNED_EXISTING_PROJECT")
    || tags.has("PRODUCTION_GOVERNED_PROJECT")
    || report.projectState === "PRODUCTION_SENSITIVE_PROJECT";
  const migrationDepth = String(report.projectAssetMigrationDepth || "");
  const adoptionMode = String(report.adoptionMode || "");
  return report.intentosOperatingMode === "ACTIVE"
    && report.existingRuleComparisonRequired === "yes"
    && governedExisting
    && (adoptionMode === "READ_ONLY" || adoptionMode === "GUARDED")
    && (migrationDepth === "ADAPTER_ONLY" || migrationDepth === "PLAN_REQUIRED");
}

function parseJsonOrNull(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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
  return firstPositional(args, new Set(["--mode", "--format", "--intent", "--task", "--report", "--from-lifecycle"])) ? args : [".", ...args];
}

function withDefaultApplyPlanTarget(args) {
  return firstPositional(args, new Set([
    "--format",
    "--intent",
    "--action",
    "--targets",
    "--risk",
    "--from-guidance",
    "--from-workflow-map",
    "--from-baseline-decision",
    "--from-standard-baseline",
    "--from-baseline-pack-selection",
    "--from-archive-apply",
    "--from-hook-plan",
    "--from-hook-policy",
    "--from-review-surface",
    "--from-change-boundary",
    "--from-debt-handoff",
    "--from-closure",
  ])) ? args : [".", ...args];
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
