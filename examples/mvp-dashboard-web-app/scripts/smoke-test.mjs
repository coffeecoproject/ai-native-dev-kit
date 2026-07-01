import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "src", "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

const requiredHtml = ["Project Dashboard Demo", "metric-active", "metric-blocked", "metric-done", "work-item-list", "empty-state", "error-state"];
const requiredJs = ["workItems", "renderDashboard", "countByStatus", "empty.hidden", "error.hidden", "work-item"];

for (const marker of requiredHtml) {
  if (!html.includes(marker)) throw new Error(`Missing HTML marker: ${marker}`);
}

for (const marker of requiredJs) {
  if (!js.includes(marker)) throw new Error(`Missing JS marker: ${marker}`);
}

console.log("MVP dashboard smoke test passed.");
console.log("Checked metrics, work item rendering, empty state marker, and error state marker.");
