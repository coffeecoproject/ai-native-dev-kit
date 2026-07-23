import {
  fillApprovalRecord,
  fillBaselineDecisionCard,
  fillBaselinePackSelectionReport,
  fillBaselineStateReport,
  fillChangeBoundaryReport,
  fillStandardBaselineSelectionReport,
} from "./fillers/baseline.mjs";
import { frontmatterFor } from "./fillers/frontmatter.mjs";
import {
  fillActiveWorkThread,
  fillAdoptionTrialReport,
  fillConversationTurnClassification,
  fillGuidedDecisionSummary,
  fillLaunchReadinessReport,
  fillPatchClassification,
  fillRealAdoptionTrialReport,
  fillScopeChangeReport,
} from "./fillers/governance.mjs";
import {
  fillAdoptionAssessment,
  fillCustomerHandoff,
  fillDecisionBrief,
  fillFinalReport,
  fillFollowUpProposal,
  fillGovernanceMap,
  fillHumanStatusReport,
  fillPlainReviewSummary,
} from "./fillers/reporting.mjs";
import { fillGptReviewPrompt, fillReviewLoopReport, fillReviewPacket } from "./fillers/review.mjs";
import { fillGoalCard, fillSubagentRunPlan } from "./fillers/routing.mjs";
import { fillEval, fillLog, fillPreflight, fillRequest, fillSpec, fillTask } from "./fillers/workflow.mjs";

export { frontmatterFor };

export function fillArtifact(type, content, context) {
  if (type === "request") content = fillRequest(content, context);
  if (type === "preflight") content = fillPreflight(content, context);
  if (type === "spec") content = fillSpec(content, context);
  if (type === "eval") content = fillEval(content, context);
  if (type === "task") content = fillTask(content, context);
  if (type === "log") content = fillLog(content, context);
  if (type === "review-packet") content = fillReviewPacket(content, context);
  if (type === "review-loop-report") content = fillReviewLoopReport(content, context);
  if (type === "gpt-review-prompt") content = fillGptReviewPrompt(content, context);
  if (type === "adoption-assessment") content = fillAdoptionAssessment(content, context);
  if (type === "governance-map") content = fillGovernanceMap(content, context);
  if (type === "human-status-report") content = fillHumanStatusReport(content, context);
  if (type === "decision-brief") content = fillDecisionBrief(content, context);
  if (type === "plain-review-summary") content = fillPlainReviewSummary(content, context);
  if (type === "customer-handoff") content = fillCustomerHandoff(content, context);
  if (type === "follow-up-proposal") content = fillFollowUpProposal(content, context);
  if (type === "final-report") content = fillFinalReport(content, context);
  if (type === "goal-card") content = fillGoalCard(content, context);
  if (type === "subagent-run-plan") content = fillSubagentRunPlan(content, context);
  if (type === "launch-readiness-report") content = fillLaunchReadinessReport(content, context);
  if (type === "conversation-turn-classification") content = fillConversationTurnClassification(content, context);
  if (type === "scope-change-report") content = fillScopeChangeReport(content, context);
  if (type === "adoption-trial-report") content = fillAdoptionTrialReport(content, context);
  if (type === "real-adoption-trial-report") content = fillRealAdoptionTrialReport(content, context);
  if (type === "patch-classification") content = fillPatchClassification(content, context);
  if (type === "active-work-thread") content = fillActiveWorkThread(content, context);
  if (type === "guided-decision-summary") content = fillGuidedDecisionSummary(content, context);
  if (type === "change-boundary-report") content = fillChangeBoundaryReport(content, context);
  if (type === "baseline-state-report") content = fillBaselineStateReport(content, context);
  if (type === "baseline-pack-selection-report") content = fillBaselinePackSelectionReport(content, context);
  if (type === "standard-baseline-selection-report") content = fillStandardBaselineSelectionReport(content, context);
  if (type === "baseline-decision-card") content = fillBaselineDecisionCard(content, context);
  if (type === "approval-record") content = fillApprovalRecord(content, context);
  return content;
}
