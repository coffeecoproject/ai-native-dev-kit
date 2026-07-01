const workItems = [
  { title: "Confirm first-slice scope", status: "active", owner: "Product" },
  { title: "Run local smoke evidence", status: "active", owner: "Codex" },
  { title: "Decide release boundary", status: "blocked", owner: "Human" },
  { title: "Draft demo handoff note", status: "done", owner: "Codex" },
];

const list = document.querySelector("#work-item-list");
const empty = document.querySelector("#empty-state");
const error = document.querySelector("#error-state");

function renderDashboard(items) {
  if (!Array.isArray(items)) {
    error.hidden = false;
    return;
  }
  document.querySelector("#metric-active").textContent = countByStatus(items, "active");
  document.querySelector("#metric-blocked").textContent = countByStatus(items, "blocked");
  document.querySelector("#metric-done").textContent = countByStatus(items, "done");
  list.innerHTML = "";
  empty.hidden = items.length > 0;
  for (const item of items) {
    const row = document.createElement("li");
    row.className = "work-item";
    row.innerHTML = `<strong>${item.title}</strong><p><span class="status">${item.status}</span> · ${item.owner}</p>`;
    list.appendChild(row);
  }
}

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length;
}

renderDashboard(workItems);
