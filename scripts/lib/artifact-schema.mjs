import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAuthoritativeEvidenceReference } from "./evidence-authority.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..", "..");

export function loadSchema(projectRoot, relativePath) {
  const source = path.join(kitRoot, relativePath);
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (relativePath.startsWith("schemas/artifacts/")) {
    if (fs.existsSync(source)) return JSON.parse(fs.readFileSync(source, "utf8"));
    return fs.existsSync(managed) ? JSON.parse(fs.readFileSync(managed, "utf8")) : null;
  }
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return JSON.parse(fs.readFileSync(direct, "utf8"));
  if (fs.existsSync(managed)) return JSON.parse(fs.readFileSync(managed, "utf8"));
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
  validateValue(value, schema, options.label || "$", errors, schema);
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
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, referencePath);
  return resolved.ok ? resolved.file : null;
}

const supportedSchemaKeywords = new Set([
  "$schema",
  "$id",
  "$ref",
  "$defs",
  "schemaVersion",
  "artifactType",
  "title",
  "description",
  "type",
  "const",
  "enum",
  "pattern",
  "minLength",
  "minItems",
  "minProperties",
  "uniqueItems",
  "required",
  "properties",
  "additionalProperties",
  "items",
  "allOf",
  "contains",
]);

function validateValue(value, schema, label, errors, rootSchema = schema, seenRefs = new Set()) {
  if (!schema || typeof schema !== "object") return;

  for (const key of Object.keys(schema)) {
    if (!supportedSchemaKeywords.has(key)) {
      errors.push(`${label} schema uses unsupported keyword: ${key}`);
    }
  }

  if (schema.$ref) {
    const refSchema = resolveLocalRef(rootSchema, schema.$ref);
    if (!refSchema) {
      errors.push(`${label} schema reference does not resolve: ${schema.$ref}`);
      return;
    }
    if (seenRefs.has(schema.$ref)) {
      errors.push(`${label} schema reference cycle detected: ${schema.$ref}`);
      return;
    }
    const nextSeen = new Set(seenRefs);
    nextSeen.add(schema.$ref);
    validateValue(value, refSchema, label, errors, rootSchema, nextSeen);
  }

  if (Array.isArray(schema.allOf)) {
    schema.allOf.forEach((childSchema, index) => validateValue(value, childSchema, `${label}.allOf[${index}]`, errors, rootSchema, seenRefs));
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${label} must be ${Array.isArray(schema.type) ? schema.type.join(" or ") : schema.type}`);
    return;
  }

  if ("const" in schema && !deepEqual(value, schema.const)) {
    errors.push(`${label} must equal ${JSON.stringify(schema.const)}`);
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

  if (typeof schema.minLength === "number" && typeof value === "string" && value.length < schema.minLength) {
    errors.push(`${label} must contain at least ${schema.minLength} character(s)`);
  }

  if (typeof schema.minProperties === "number" && value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length < schema.minProperties) {
    errors.push(`${label} must contain at least ${schema.minProperties} propertie(s)`);
  }

  if (schema.uniqueItems === true && Array.isArray(value)) {
    const seen = new Set();
    for (const [index, item] of value.entries()) {
      const key = canonicalJson(item);
      if (seen.has(key)) errors.push(`${label}[${index}] must be unique`);
      seen.add(key);
    }
  }

  if (schema.contains && Array.isArray(value)) {
    const matched = value.some((item, index) => {
      const nestedErrors = [];
      validateValue(item, schema.contains, `${label}[${index}]`, nestedErrors, rootSchema, seenRefs);
      return nestedErrors.length === 0;
    });
    if (!matched) errors.push(`${label} must contain at least one item matching contains schema`);
  }

  if (schema.properties && value && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required || []) {
      if (!(required in value)) errors.push(`${label}.${required} is required`);
    }
    for (const [key, childSchema] of Object.entries(schema.properties)) {
      if (key in value) validateValue(value[key], childSchema, `${label}.${key}`, errors, rootSchema, seenRefs);
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) errors.push(`${label}.${key} is not allowed`);
      }
    } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      const allowed = new Set(Object.keys(schema.properties || {}));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) validateValue(value[key], schema.additionalProperties, `${label}.${key}`, errors, rootSchema, seenRefs);
      }
    }
  }

  if (schema.items && Array.isArray(value)) {
    value.forEach((item, index) => validateValue(item, schema.items, `${label}[${index}]`, errors, rootSchema, seenRefs));
  }
}

function resolveLocalRef(rootSchema, ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/").map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current = rootSchema;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return null;
    current = current[part];
  }
  return current;
}

function deepEqual(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function matchesType(value, type) {
  if (Array.isArray(type)) return type.some((item) => matchesType(value, item));
  if (type === "null") return value === null;
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
