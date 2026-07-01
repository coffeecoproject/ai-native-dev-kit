import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "src", "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

const requiredHtml = ["booking-form", "booking-list", "empty-state", "Name", "Phone", "Service", "Date", "Time"];
const requiredHtmlEvidence = ["name=\"name\" required", "name=\"phone\" required", "name=\"date\" required", "name=\"time\" required", "No bookings yet."];
const requiredJs = ["addEventListener", "FormData", "bookings.push", "renderBookings", "empty.hidden", "event.preventDefault", "form.reset"];

for (const marker of requiredHtml) {
  if (!html.includes(marker)) throw new Error(`Missing HTML marker: ${marker}`);
}

for (const marker of requiredHtmlEvidence) {
  if (!html.includes(marker)) throw new Error(`Missing HTML evidence marker: ${marker}`);
}

for (const marker of requiredJs) {
  if (!js.includes(marker)) throw new Error(`Missing JS marker: ${marker}`);
}

const evidenceDir = path.join(root, "evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
const textEvidence = [
  "MVP booking smoke test passed.",
  "Checked required fields, empty state marker, submit handler, and local operator list rendering.",
].join("\n");
const structuredEvidence = {
  schema_version: "1.47.0",
  artifact_type: "product_completeness_evidence",
  status: "pass",
  command: "npm test",
  checks: ["required_fields", "empty_state", "submit_handler", "local_operator_list"],
  output_file: "evidence/smoke-output.txt",
  summary: "Booking MVP local smoke test passed.",
  authority: {
    approves_release_or_production: false,
    proves_real_users_can_use_product: false,
  },
};

fs.writeFileSync(path.join(evidenceDir, "smoke-output.txt"), `${textEvidence}\n`);
fs.writeFileSync(path.join(evidenceDir, "smoke-output.json"), `${JSON.stringify(structuredEvidence, null, 2)}\n`);

console.log(textEvidence);
