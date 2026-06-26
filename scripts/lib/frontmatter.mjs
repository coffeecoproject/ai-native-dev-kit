export function parseFrontmatter(content) {
  if (!String(content || "").startsWith("---\n")) {
    return { hasFrontmatter: false, data: {}, body: content, errors: [] };
  }
  const end = content.indexOf("\n---", 4);
  if (end === -1) {
    return { hasFrontmatter: false, data: {}, body: content, errors: ["frontmatter closing marker not found"] };
  }
  const raw = content.slice(4, end).trim();
  const bodyStart = content.indexOf("\n", end + 4);
  const body = bodyStart === -1 ? "" : content.slice(bodyStart + 1);
  const data = {};
  const errors = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const index = line.indexOf(":");
    if (index === -1) {
      errors.push(`invalid frontmatter line: ${line}`);
      continue;
    }
    const key = line.slice(0, index).trim();
    const value = parseScalar(line.slice(index + 1).trim());
    if (!key) errors.push(`empty frontmatter key: ${line}`);
    else data[key] = value;
  }
  return { hasFrontmatter: true, data, body, errors };
}

export function addFrontmatter(content, metadata) {
  const { hasFrontmatter } = parseFrontmatter(content);
  if (hasFrontmatter) return content;
  return `${formatFrontmatter(metadata)}\n${content.trimStart()}`;
}

export function formatFrontmatter(metadata) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null || value === "") continue;
    lines.push(`${key}: ${formatScalar(value)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

export function validateFrontmatter(data, schema) {
  const errors = [];
  for (const field of schema.required || []) {
    if (data[field] === undefined || data[field] === null || String(data[field]).trim() === "") {
      errors.push(`missing required frontmatter field: ${field}`);
    }
  }
  for (const [field, definition] of Object.entries(schema.properties || {})) {
    const value = data[field];
    if (value === undefined || value === null || value === "") continue;
    if (definition.type === "string" && typeof value !== "string") {
      errors.push(`frontmatter field ${field} must be a string`);
    }
    if (definition.enum && !definition.enum.includes(value)) {
      errors.push(`frontmatter field ${field} must be one of: ${definition.enum.join(", ")}`);
    }
    if (definition.pattern && typeof value === "string" && !(new RegExp(definition.pattern).test(value))) {
      errors.push(`frontmatter field ${field} does not match pattern ${definition.pattern}`);
    }
  }
  return errors;
}

function parseScalar(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function formatScalar(value) {
  if (typeof value === "boolean") return value ? "true" : "false";
  const text = String(value);
  if (/^[A-Za-z0-9_./:-]+$/.test(text)) return text;
  return JSON.stringify(text);
}
