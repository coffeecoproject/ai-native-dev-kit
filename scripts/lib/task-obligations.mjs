const nonBehavioralKinds = new Set(["docs_only", "test_docs_only", "copy", "visual_only"]);

const implementationObligationSources = Object.freeze({
  scope_check_required: "plan",
  short_plan_required: "plan",
  business_universe_coverage_required: "business_universe",
  control_effectiveness_required: "control_effectiveness",
  business_rule_closure_required: "business_rule_closure",
  change_impact_coverage_required: "change_impact_coverage",
  execution_plan_required: "plan",
  verification_plan_required: "verification_plan",
});

const routingProjectionFields = Object.freeze([
  {
    routing: "business_universe_routing",
    projection: "business_universe_coverage_required",
    option: "businessUniverseRequired",
  },
  {
    routing: "control_effectiveness_routing",
    projection: "control_effectiveness_required",
    option: "controlEffectivenessRequired",
  },
]);

export function taskBehaviorClass(taskKind) {
  return nonBehavioralKinds.has(String(taskKind || "")) ? "NON_BEHAVIORAL" : "BEHAVIORAL";
}

export function minimumTaskObligations({ taskImpact, taskKind }) {
  const impact = String(taskImpact || "POSSIBLE_HIGH");
  const requiresBehaviorChain = taskBehaviorClass(taskKind) === "BEHAVIORAL" || impact !== "LOW";
  return {
    beforeImplementation: {
      scope_check_required: "Yes",
      short_plan_required: impact === "LOW" ? "No" : "Yes",
      business_universe_coverage_required: "No",
      control_effectiveness_required: "No",
      business_rule_closure_required: requiresBehaviorChain ? "Yes" : "No",
      change_impact_coverage_required: requiresBehaviorChain ? "Yes" : "No",
      execution_plan_required: impact === "HIGH" ? "Yes" : "No",
      verification_plan_required: requiresBehaviorChain ? "Yes" : "No",
    },
    beforeCompletion: {
      test_evidence_required: requiresBehaviorChain ? "Yes" : "No",
      execution_assurance_required: "Yes",
      completion_evidence_required: "Yes",
    },
  };
}

export function applyMonotonicTaskDepth(minimum, { businessUniverseRequired = "No", controlEffectivenessRequired = "No" } = {}) {
  return {
    beforeImplementation: {
      ...minimum.beforeImplementation,
      business_universe_coverage_required: businessUniverseRequired,
      control_effectiveness_required: controlEffectivenessRequired,
    },
    beforeCompletion: { ...minimum.beforeCompletion },
  };
}

export function taskObligationsFromAuthority(evidence) {
  const minimum = minimumTaskObligations({
    taskImpact: evidence?.impact_classification?.task_impact,
    taskKind: evidence?.impact_classification?.task_kind,
  });
  if (evidence?.schema_version !== "1.113.0") {
    return {
      obligations: {
        beforeImplementation: {
          ...minimum.beforeImplementation,
          ...(evidence?.required_before_implementation_review || {}),
        },
        beforeCompletion: {
          ...minimum.beforeCompletion,
          ...(evidence?.required_before_completion_claim || {}),
        },
      },
      minimum,
      errors: [],
    };
  }

  const errors = [];
  const routingRequirements = {};
  for (const field of routingProjectionFields) {
    const required = evidence?.[field.routing]?.required;
    if (["Yes", "No", "Unknown"].includes(required)) {
      routingRequirements[field.option] = required;
    } else {
      routingRequirements[field.option] = "Unknown";
      errors.push(`${field.routing}.required is missing or invalid`);
    }
  }
  const projectedImplementation = evidence?.required_before_implementation_review || {};
  const projectedCompletion = evidence?.required_before_completion_claim || {};
  const monotonicMinimum = {
    beforeImplementation: Object.fromEntries(Object.entries(minimum.beforeImplementation)
      .map(([field, required]) => [field, projectedImplementation[field] === "Yes" ? "Yes" : required])),
    beforeCompletion: Object.fromEntries(Object.entries(minimum.beforeCompletion)
      .map(([field, required]) => [field, projectedCompletion[field] === "Yes" ? "Yes" : required])),
  };
  return {
    obligations: applyMonotonicTaskDepth(monotonicMinimum, routingRequirements),
    minimum,
    errors,
  };
}

export function validateTaskObligationProjection(evidence) {
  const derived = taskObligationsFromAuthority(evidence);
  const { minimum } = derived;
  const actualImplementation = evidence?.required_before_implementation_review || {};
  const actualCompletion = evidence?.required_before_completion_claim || {};
  const missing = [];
  const mismatched = [];
  for (const [field, expected] of Object.entries(minimum.beforeImplementation)) {
    if (expected === "Yes" && actualImplementation[field] !== "Yes") missing.push(`required_before_implementation_review.${field}`);
  }
  for (const [field, expected] of Object.entries(minimum.beforeCompletion)) {
    if (expected === "Yes" && actualCompletion[field] !== "Yes") missing.push(`required_before_completion_claim.${field}`);
  }
  if (evidence?.schema_version === "1.113.0") {
    for (const field of routingProjectionFields) {
      const expected = derived.obligations.beforeImplementation[field.projection];
      const actual = actualImplementation[field.projection];
      if (actual !== expected) {
        const path = `required_before_implementation_review.${field.projection}`;
        missing.push(path);
        mismatched.push(`${path} must equal ${field.routing}.required (${expected}), observed ${actual ?? "<missing>"}`);
      }
    }
  }
  for (const error of derived.errors) missing.push(error.split(" is ")[0]);
  return {
    ok: missing.length === 0,
    missing: [...new Set(missing)],
    mismatched,
    errors: [...derived.errors, ...mismatched],
    minimum,
    expected: derived.obligations,
  };
}

export function requiredImplementationSources(taskGovernance) {
  const currentAuthority = taskGovernance?.schema_version === "1.113.0";
  const requirements = currentAuthority
    ? taskObligationsFromAuthority(taskGovernance).obligations.beforeImplementation
    : taskGovernance?.required_before_implementation_review || {};
  return Object.entries(implementationObligationSources)
    .filter(([field]) => currentAuthority ? requirements[field] !== "No" : requirements[field] === "Yes")
    .map(([field, source]) => ({ field, source }));
}

export function completionSourceRequirements(taskGovernance) {
  const authoritative = taskGovernance?.schema_version === "1.113.0"
    ? taskObligationsFromAuthority(taskGovernance).obligations
    : null;
  const beforeImplementation = authoritative?.beforeImplementation
    || taskGovernance?.required_before_implementation_review
    || {};
  const beforeCompletion = authoritative?.beforeCompletion
    || taskGovernance?.required_before_completion_claim
    || {};
  return {
    business_rule_closure: beforeImplementation.business_rule_closure_required === "Yes",
    verification_plan: beforeImplementation.verification_plan_required === "Yes",
    test_evidence: beforeCompletion.test_evidence_required === "Yes",
    execution_assurance: beforeCompletion.execution_assurance_required !== "No",
  };
}

export function planContainsCurrentIntent(planContent, { intent = "", intentDigest = "" } = {}) {
  const content = normalizeIntentText(planContent);
  const expectedIntent = normalizeIntentText(intent);
  const expectedDigest = String(intentDigest || "").trim().toLowerCase();
  if (expectedDigest && content.includes(expectedDigest)) return true;
  return expectedIntent.length > 0 && content.includes(expectedIntent);
}

export function normalizeIntentText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
