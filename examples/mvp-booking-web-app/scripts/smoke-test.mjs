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

console.log("MVP booking smoke test passed.");
console.log("Checked required fields, empty state marker, submit handler, and local operator list rendering.");
