import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAuthoritativeEvidenceReference } from "./evidence-authority.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..", "..");
const trustedArtifactSchemaDigests = {
  "schemas/artifacts/adoption-assurance.schema.json": "sha256:effe7be5473fed2f5eb8c64d2869ef89c62092925eb539a8e5b4c74e2f13252a",
  "schemas/artifacts/apply-execution-receipt.schema.json": "sha256:74eaf49ea6e7ebee5c4aadbc5cf81e6292842e0002c56bf8aba09f29b7e45abe",
  "schemas/artifacts/approval-record.schema.json": "sha256:f0037bb2bf6402b6e57e2bbdd29542f4ab834d35bd2ea0979cc5872a491cd26b",
  "schemas/artifacts/business-rule-closure.schema.json": "sha256:ca65aabb46d8b56162c0a51c1aba3a5142affa81bf20b02cfc7518851d8aeac9",
  "schemas/artifacts/business-universe-coverage.schema.json": "sha256:8f8b4684f4ab262b4bbfe63d72f1f3bbf8777db27c90bdcbb9bb1b892c8b6637",
  "schemas/artifacts/change-impact-coverage.schema.json": "sha256:cb34f5279c6557c6748603d0e1e784e56639eced27ee50e37f920d6564843068",
  "schemas/artifacts/completion-evidence.schema.json": "sha256:34954e4c84c4a0ebee03d9fc3e453e7fca47fef79b8a0594ec7eeeb94ac7fab6",
  "schemas/artifacts/control-effectiveness.schema.json": "sha256:b0304a646d5f1e237904d812cbfec6aa64101f8dd7889062c670db969a063315",
  "schemas/artifacts/controlled-apply-readiness.schema.json": "sha256:66d85e4ef563ec6655e23bd07fc98932486337b2ef0204e653a8a2b89b35ce9a",
  "schemas/artifacts/controlled-native-adoption-review.schema.json": "sha256:f26121fceb31f381402c355af52b10bd1493c9e0321ac8c7c96500839fda539b",
  "schemas/artifacts/eval.schema.json": "sha256:fb926d3be8f7ad2d3ac2a646bdcf5ca2af26f7cd80461513bf8a860ae2b75416",
  "schemas/artifacts/execution-assurance.schema.json": "sha256:4fba2c74b6568b06868c374c87aed7ef70c098d3f2e714dd26e6b61b213062b5",
  "schemas/artifacts/existing-project-adoption-autopilot.schema.json": "sha256:a8d535d4a84b0d97ca1f8a73ea0e4a8db9ab80d226a1616e544dfaab235d17af",
  "schemas/artifacts/existing-rule-reconciliation.schema.json": "sha256:e2d8b747ff4c3c4e44e635c17f00e6964bd58b476b5fa16450b838586f94f552",
  "schemas/artifacts/goal-card.schema.json": "sha256:1ff608263461e0c4939c410441537edd0bcaeb0841857e6234dcd4963f55d4dd",
  "schemas/artifacts/governance-convergence.schema.json": "sha256:1dc688406b62b4bcf7882e5bd9df0a2f868b648ed4dde39e88a303cad69765a8",
  "schemas/artifacts/low-risk-apply-candidate.schema.json": "sha256:6c6f64f687995bad99311732bceed926d2810b19f868fb9c4b0f8b53f5562b9f",
  "schemas/artifacts/native-migration-plan.schema.json": "sha256:16848409604cb6c2b8e0b53bb2e5c8332c2b73e1d18881216b99e613487fb6ac",
  "schemas/artifacts/plan-review.schema.json": "sha256:73037a216c73366b594f56bfe3f75644eb26effda716d8433b809e2e39e3734b",
  "schemas/artifacts/planning-closure.schema.json": "sha256:53a478864361c471318de9232475ed49dfb2cbea4ce65e74965e25e232536d1c",
  "schemas/artifacts/preflight.schema.json": "sha256:d0c928569a2d8c6a4776df78307b310a4c7420e56b5bb89964367f69a251f353",
  "schemas/artifacts/product-completeness-evidence.schema.json": "sha256:71da81e0c9202d4b8b15c409b1d957e2741219dd064301b83fbdea8750c2c7c2",
  "schemas/artifacts/project-entry-trust.schema.json": "sha256:63a571df190fb50e70814fc38bcd079b51824753e54706261322fbc9e0087211",
  "schemas/artifacts/project-entry-calibration.schema.json": "sha256:6d66db878b95e4b6e8dee55e97a61d7030b6d1ab9c47c73cc3f06f2541e60fc2",
  "schemas/artifacts/project-fact-projection.schema.json": "sha256:a27e995302d177659466b44f3b2d609cebdac863d2f9d1617d8a220f2b2623d4",
  "schemas/artifacts/release-approval-record.schema.json": "sha256:2c92a2da448ffb3a96978dac7f5b1a52904f608ec4b70f39de571dd0e19a76a3",
  "schemas/artifacts/release-channel-policy.schema.json": "sha256:755cb9093a51a1ff8a1ccb83831822072225c6c91364631f2c8a0b0168310224",
  "schemas/artifacts/release-evidence-gate.schema.json": "sha256:cef4a9560fe14c666550df4fba0a27a66b67f4b60e1f5a2808c8ba9a3b217f11",
  "schemas/artifacts/launch-review-view.schema.json": "sha256:01ddf6b2f58326eaa4e156cdcd7ad1b3f8d6e01388469ed990c2da786f3c4db9",
  "schemas/artifacts/release-execution-plan.schema.json": "sha256:a0a57706272e112c590a8aba0648bb5e2a2aca0b2e36667bb10ae64d209065e2",
  "schemas/artifacts/release-execution-topology.schema.json": "sha256:188a7aac5cf6cccaf756bdfce352c45c9bc7efa23d9d9aaeec49eb5095d06e11",
  "schemas/artifacts/release-topology-migration.schema.json": "sha256:586265fddb2e87b35a5aa34b21cf49f2aa4956b3581c4b100a7fa362dd26932e",
  "schemas/artifacts/release-handoff-evidence.schema.json": "sha256:fab83cdf8d3fad0e1dfe324240b33d134853480c3fd09b58b3dbec824a936deb",
  "schemas/artifacts/release-plan.schema.json": "sha256:a410c8111e56ed763f15e6c753f2275de31b2510a7b8105f20bf326aa6790781",
  "schemas/artifacts/request.schema.json": "sha256:7210c949f6c9373d1b0edb688f4853504ea982392f2cb6dd6d7ab1ba06ec6d57",
  "schemas/artifacts/request-bound-apply-authority.schema.json": "sha256:62dd16c81518907c603a1fab5df4854032279a2bd0eba19c222680e42ca13fc4",
  "schemas/artifacts/review-loop-report.schema.json": "sha256:2b6b97889061d9018327a0b164c9541c6214788841f2cddc075befb85df0d4d3",
  "schemas/artifacts/runtime-hygiene.schema.json": "sha256:0ab386506d1b42ed355cc3041402a6ac8f243c62ff35ec8c768cc94bfebe64db",
  "schemas/artifacts/spec.schema.json": "sha256:0052829a51f2ca0aa6da86fc3f66bb605801c8f32e0e4fb411ee206278dd7e57",
  "schemas/artifacts/same-run-evidence-envelope.schema.json": "sha256:b4e5a5a3a3b83fd7a3040dcb1955fe44e93d553e9762f72a87ca596ea7f2fada",
  "schemas/artifacts/subagent-run-plan.schema.json": "sha256:f17e70305b6d4245233fa094f6e657dc67d16c13da6decd93d10955b7173d354",
  "schemas/artifacts/task-governance.schema.json": "sha256:a774fed3e8d4b98c360d784ab49d21871c8522e8a120879109ac238d7010f7cb",
  "schemas/artifacts/task.schema.json": "sha256:6e30ca37ab7251a7c1bfd20ce13c387e573b800273b6d45852aaf9a560b5f67c",
  "schemas/artifacts/test-evidence.schema.json": "sha256:cc8894ddc068685a1c3a65c2137bce7733543a2f168b43526df0f63a92512a3a",
  "schemas/artifacts/unified-apply-plan.schema.json": "sha256:03ac3d64e92156d4772256f61d35f1b02b8f05a84760b6473d4a58228e0e9eac",
  "schemas/artifacts/verification-plan.schema.json": "sha256:df472a0490f5969e3872f7bbf39fc1fdf646cfb8f18e34353e290db8cb362a56",
  "schemas/artifacts/verification-run-manifest.schema.json": "sha256:1e764496818e0a3aa05edf6a11ee4cfdbb65ccbd0a94497e7138bcfad90f037c",
  "schemas/artifacts/verification-runtime-lifecycle-plan.schema.json": "sha256:5728eeebb3dd7d35d794c36b7cce5fe0377a34b1cc7d32fcc19276a11c1b8aff",
  "schemas/artifacts/verification-runtime-plan.schema.json": "sha256:8e20158e122c2eaa632f8e24221d65594bebaf0dbe5c9350e8e7ade9c01ac6cd",
  "schemas/artifacts/work-queue-takeover.schema.json": "sha256:0d6c56331085c61c308b9e24cef243ff50febd74f436787d409d867707a9a538",
  "schemas/artifacts/behavioral-adoption-activation.schema.json": "sha256:c4cdbce4d20961eabe550ebdf5b1e33d1b4ef400916398b811eaadd0b3572972",
};

export function loadSchema(projectRoot, relativePath) {
  const source = path.join(kitRoot, relativePath);
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (relativePath.startsWith("schemas/artifacts/")) {
    if (fs.existsSync(source)) return readTrustedArtifactSchema(source, relativePath);
    return fs.existsSync(managed) ? readTrustedArtifactSchema(managed, relativePath) : null;
  }
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return JSON.parse(fs.readFileSync(direct, "utf8"));
  if (fs.existsSync(managed)) return JSON.parse(fs.readFileSync(managed, "utf8"));
  if (fs.existsSync(source)) return JSON.parse(fs.readFileSync(source, "utf8"));
  return null;
}

function readTrustedArtifactSchema(file, relativePath) {
  const content = fs.readFileSync(file);
  const actual = `sha256:${crypto.createHash("sha256").update(content).digest("hex")}`;
  if (!trustedArtifactSchemaDigests[relativePath] || trustedArtifactSchemaDigests[relativePath] !== actual) return null;
  return JSON.parse(content.toString("utf8"));
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
  "maxItems",
  "minProperties",
  "uniqueItems",
  "required",
  "properties",
  "additionalProperties",
  "items",
  "allOf",
  "contains",
  "if",
  "then",
  "else",
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

  if (schema.if && typeof schema.if === "object") {
    const conditionErrors = [];
    validateValue(value, schema.if, `${label}.if`, conditionErrors, rootSchema, seenRefs);
    if (conditionErrors.length === 0 && schema.then && typeof schema.then === "object") {
      validateValue(value, schema.then, `${label}.then`, errors, rootSchema, seenRefs);
    } else if (conditionErrors.length > 0 && schema.else && typeof schema.else === "object") {
      validateValue(value, schema.else, `${label}.else`, errors, rootSchema, seenRefs);
    }
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

  if (typeof schema.maxItems === "number" && Array.isArray(value) && value.length > schema.maxItems) {
    errors.push(`${label} must contain at most ${schema.maxItems} item(s)`);
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

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required || []) {
      if (!(required in value)) errors.push(`${label}.${required} is required`);
    }
    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (key in value) validateValue(value[key], childSchema, `${label}.${key}`, errors, rootSchema, seenRefs);
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
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
