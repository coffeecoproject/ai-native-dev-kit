export const REPORT_AUTHORITY_MODE = Object.freeze({
  CURRENT_SELECTED: "CURRENT_SELECTED",
  HISTORICAL_SELECTED: "HISTORICAL_SELECTED",
  HISTORICAL_BATCH: "HISTORICAL_BATCH",
});

export function resolveReportAuthorityMode({ explicitReport = "", historicalAudit = false } = {}) {
  if (historicalAudit && explicitReport) return REPORT_AUTHORITY_MODE.HISTORICAL_SELECTED;
  if (historicalAudit || !explicitReport) return REPORT_AUTHORITY_MODE.HISTORICAL_BATCH;
  return REPORT_AUTHORITY_MODE.CURRENT_SELECTED;
}

export function hasCurrentReportAuthority(mode) {
  return mode === REPORT_AUTHORITY_MODE.CURRENT_SELECTED;
}

export function isHistoricalReportAudit(mode) {
  return !hasCurrentReportAuthority(mode);
}

export function historicalEvidenceSourceErrors(content, source, {
  digestField,
  fileDigest,
  outcomeField,
} = {}) {
  const errors = [];
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok) return ["referenced source lacks valid machine-readable evidence"];
  const evidence = extracted.value;
  const recordedDigest = source?.digest || source?.report_digest || "";
  const sourceDigest = digestField ? evidence?.[digestField] : fileDigest;
  if (digestField && (!sourceDigest || sourceDigest !== evidenceDigest(evidence, [digestField]))) {
    errors.push(`referenced source ${digestField} is not canonical`);
  }
  if (!digestField && !fileDigest) errors.push("referenced source file digest is unavailable");
  if (recordedDigest !== sourceDigest) errors.push("recorded source digest does not match the referenced artifact");
  const recordedTask = source?.task_ref || source?.source_task_ref || "";
  if (recordedTask && recordedTask !== evidence.task_ref) errors.push("recorded source task does not match the referenced artifact");
  const recordedOutcome = source?.source_outcome || "";
  if (recordedOutcome && outcomeField && recordedOutcome !== evidence[outcomeField]) {
    errors.push("recorded source outcome does not match the referenced artifact");
  }
  return errors;
}
import { evidenceDigest, extractMachineReadableEvidence } from "./artifact-schema.mjs";
