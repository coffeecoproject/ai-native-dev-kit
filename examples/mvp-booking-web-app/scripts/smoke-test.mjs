import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "src", "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

const requiredHtml = ["booking-form", "booking-list", "empty-state", "Name", "Phone", "Service", "Date", "Time"];
const requiredJs = ["addEventListener", "FormData", "bookings.push", "renderBookings", "empty.hidden"];

for (const marker of requiredHtml) {
  if (!html.includes(marker)) throw new Error(`Missing HTML marker: ${marker}`);
}

for (const marker of requiredJs) {
  if (!js.includes(marker)) throw new Error(`Missing JS marker: ${marker}`);
}

console.log("MVP booking smoke test passed.");
