import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..", "..");

export function loadSchema(projectRoot, relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return JSON.parse(fs.readFileSync(direct, "utf8"));
  const managed = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(managed)) return JSON.parse(fs.readFileSync(managed, "utf8"));
  const source = path.join(kitRoot, relativePath);
  if (fs.existsSync(source)) return JSON.parse(fs.readFileSync(source, "utf8"));
  return null;
}

export function extractMachineReadableEvidence(content) {
  const section = sectionBody(content, "Machine-Readable Evidence");
  if (!section) return null;
  const match = section.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return {
    ok: false,
    errors: ["Machine-Readable Evidence must contain a fenced json block"],
  };
  try {
    return {
      ok: true,
      value: JSON.parse(match[1]),
    };
  } catch (error) {
    return {
      ok: false,
      errors: [`Machine-Readable Evidence JSON is invalid: ${error.message}`],
    };
  }
}

export function validateSchema(value, schema, options = {}) {
  const errors = [];
  validateValue(value, schema, options.label || "$", errors);
  return {
    ok: errors.length === 0,
    errors,
  };
}

export function canonicalJson(value) {
  return JSON.stringify(sortForCanonicalJson(value));
}

export function evidenceDigest(value, omittedKeys = ["plan_digest"]) {
  const normalized = omitKeysDeep(value, new Set(omittedKeys));
  return `sha256:${crypto.createHash("sha256").update(canonicalJson(normalized)).digest("hex")}`;
}

export function validateEvidenceBlock(content, schema, label, options = {}) {
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted) {
    if (options.require) {
      return {
        present: false,
        ok: false,
        value: null,
        errors: [`${label}: Machine-Readable Evidence is required`],
      };
    }
    return {
      present: false,
      ok: true,
      value: null,
      errors: [],
    };
  }
  if (!extracted.ok) {
    return {
      present: true,
      ok: false,
      value: null,
      errors: extracted.errors.map((error) => `${label}: ${error}`),
    };
  }
  if (!schema) {
    return {
      present: true,
      ok: false,
      value: extracted.value,
      errors: [`${label}: schema is missing`],
    };
  }
  const validation = validateSchema(extracted.value, schema, { label });
  const errors = validation.errors.slice();
  if (options.digestField && typeof extracted.value?.[options.digestField] === "string") {
    const expected = evidenceDigest(extracted.value, [options.digestField]);
    if (extracted.value[options.digestField] !== expected) {
      errors.push(`${label}: ${options.digestField} does not match canonical evidence digest`);
    }
  }
  return {
    present: true,
    ok: errors.length === 0,
    value: extracted.value,
    errors,
  };
}

export function resolveEvidenceReference(projectRoot, fromFile, referencePath) {
  if (!referencePath || typeof referencePath !== "string") return null;
  if (path.isAbsolute(referencePath)) return null;
  const candidates = [
    path.resolve(projectRoot, referencePath),
    path.resolve(path.dirname(fromFile), referencePath),
  ];
  for (const candidate of candidates) {
    const relative = path.relative(projectRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function validateValue(value, schema, label, errors) {
  if (!schema || typeof schema !== "object") return;

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${label} must be ${Array.isArray(schema.type) ? schema.type.join(" or ") : schema.type}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${label} must be one of: ${schema.enum.join(", ")}`);
  }

  if (schema.pattern && typeof value === "string") {
    const pattern = new RegExp(schema.pattern);
    if (!pattern.test(value)) errors.push(`${label} must match ${schema.pattern}`);
  }

  if (typeof schema.minItems === "number" && Array.isArray(value) && value.length < schema.minItems) {
    errors.push(`${label} must contain at least ${schema.minItems} item(s)`);
  }

  if (schema.properties && value && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required || []) {
      if (!(required in value)) errors.push(`${label}.${required} is required`);
    }
    for (const [key, childSchema] of Object.entries(schema.properties)) {
      if (key in value) validateValue(value[key], childSchema, `${label}.${key}`, errors);
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) errors.push(`${label}.${key} is not allowed`);
      }
    }
  }

  if (schema.items && Array.isArray(value)) {
    value.forEach((item, index) => validateValue(item, schema.items, `${label}[${index}]`, errors));
  }
}

function matchesType(value, type) {
  if (Array.isArray(type)) return type.some((item) => matchesType(value, item));
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function sortForCanonicalJson(value) {
  if (Array.isArray(value)) return value.map(sortForCanonicalJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value)
    .sort()
    .map((key) => [key, sortForCanonicalJson(value[key])]));
}

function omitKeysDeep(value, omittedKeys) {
  if (Array.isArray(value)) return value.map((item) => omitKeysDeep(item, omittedKeys));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value)
    .filter((key) => !omittedKeys.has(key))
    .sort()
    .map((key) => [key, omitKeysDeep(value[key], omittedKeys)]));
}

function sectionBody(content, heading) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "im");
  const match = content.match(pattern);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^##\s+/m);
  return next === -1 ? rest : rest.slice(0, next);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
