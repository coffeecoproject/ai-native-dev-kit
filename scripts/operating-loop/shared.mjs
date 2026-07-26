import { createHash } from "node:crypto";

export function sha256(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}
export function arrayValue(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

export function humanDecisionTexts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" || item?.required_now === "Yes")
    .map((item) => typeof item === "string"
      ? item
      : item.plain_question || item.question || item.id || "human decision required")
    .filter(Boolean);
}

export function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

export function firstUsefulLine(value) {
  return String(value || "").split("\n").map((line) => line.trim()).find(Boolean) || "unknown error";
}
