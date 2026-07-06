export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sectionBody(content, heading, options = {}) {
  const fallback = Object.prototype.hasOwnProperty.call(options, "fallback") ? options.fallback : null;
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return fallback;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
}

export function hasSection(content, heading) {
  return sectionBody(content, heading) !== null;
}

export function stripMarkdown(value) {
  return String(value ?? "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

export function splitMarkdownRow(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}
