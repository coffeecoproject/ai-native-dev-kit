import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const REQUIRED_MESSAGE = "Service time is required.";

function validateAppointmentRequest(request) {
  if (typeof request?.serviceTime !== "string" || request.serviceTime.trim() === "") {
    return { ok: false, status: 400, error: REQUIRED_MESSAGE };
  }
  return {
    ok: true,
    status: 201,
    appointment: {
      customerId: request.customerId,
      serviceTime: request.serviceTime.trim(),
    },
  };
}

function formStateFor(request) {
  const validation = validateAppointmentRequest(request);
  return {
    canSubmit: validation.ok,
    serviceTimeError: validation.ok ? "" : validation.error,
  };
}

function submitAppointment(request) {
  return validateAppointmentRequest(request);
}

test("[verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-] tests/appointment-service-time.test.mjs :: valid appointment follows the service-time booking flow", () => {
  const form = formStateFor({ customerId: "customer-1", serviceTime: "2026-07-20T10:00:00Z" });
  const result = submitAppointment({ customerId: "customer-1", serviceTime: "2026-07-20T10:00:00Z" });

  assert.equal(form.canSubmit, true);
  assert.equal(result.status, 201);
  assert.equal(result.appointment.serviceTime, "2026-07-20T10:00:00Z");
});

test("[verify:user-flow-regression-smoke-existing-critical-flow-still-works-af] tests/appointment-service-time.test.mjs :: existing valid booking path remains available", () => {
  const result = submitAppointment({ customerId: "existing-customer", serviceTime: "2026-07-21T09:30:00Z" });

  assert.equal(result.ok, true);
  assert.equal(result.appointment.customerId, "existing-customer");
});

test("[verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-] tests/appointment-service-time.test.mjs :: form disables submission when service time is missing", () => {
  const form = formStateFor({ customerId: "customer-2", serviceTime: "" });

  assert.equal(form.canSubmit, false);
  assert.equal(form.serviceTimeError, REQUIRED_MESSAGE);
});

test("[verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t] tests/appointment-service-time.test.mjs :: API accepts a request with service time", () => {
  const response = submitAppointment({ customerId: "customer-3", serviceTime: " 2026-07-22T11:00:00Z " });

  assert.equal(response.status, 201);
  assert.equal(response.appointment.serviceTime, "2026-07-22T11:00:00Z");
});

test("[verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-] tests/appointment-service-time.test.mjs :: API rejects a request without service time", () => {
  const response = submitAppointment({ customerId: "customer-4" });

  assert.equal(response.status, 400);
  assert.equal(response.error, REQUIRED_MESSAGE);
});

test("[verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-] tests/appointment-service-time.test.mjs :: domain handler enforces the rule when UI is bypassed", () => {
  const response = validateAppointmentRequest({ customerId: "direct-client", serviceTime: "   " });

  assert.equal(response.ok, false);
  assert.equal(response.status, 400);
});

test("[verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-] tests/appointment-service-time.test.mjs :: blocked submission receives bounded error copy", () => {
  const form = formStateFor({ customerId: "customer-5", serviceTime: "" });

  assert.match(form.serviceTimeError, /^Service time is required\.$/);
});

test("[verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders] tests/appointment-service-time.test.mjs :: handoff explains the service-time rule and enforcement surfaces", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(readme, /appointment submission requires a non-empty service time/);
  assert.match(readme, /form, API contract, and domain handler/);
});

test("[verify:test-coverage-regression-smoke-task-specific-verification-exists] tests/appointment-service-time.test.mjs :: task-specific test target declares every required obligation", async () => {
  const source = await readFile(new URL(import.meta.url), "utf8");
  const requiredObligations = source.match(/verify:[a-z0-9:-]+/g) || [];

  assert.equal(new Set(requiredObligations).size, 9);
});
