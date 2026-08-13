import { MODS } from "./data.js";

const $ = (selector, root = document) => root.querySelector(selector);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function changelogHtml(items) {
  return items.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("");
}

function renderMods() {
  const grid = $("#modGrid");

  grid.innerHTML = MODS.map((mod) => `
    <article class="mod-card${mod.isLatestUpdate ? " latest" : ""}">
      <div class="mod-top">
        <div class="mod-meta">
          <span>${escapeHtml(mod.version)} · ${escapeHtml(mod.date)}</span>
          ${mod.isLatestUpdate ? '<span class="new-badge">LATEST</span>' : ""}
        </div>
      </div>

      <h3>${escapeHtml(mod.title)}</h3>
      <p class="mod-platform">${escapeHtml(mod.platform)}</p>

      <details>
        <summary>Release details</summary>
        <div class="mod-details">
          <p class="requires-tag">${escapeHtml(mod.requires)}</p>
          <ul>
            ${changelogHtml(mod.changelog)}
          </ul>
          <div class="mod-links">
            <a class="button primary" href="${escapeHtml(mod.downloadUrl)}" rel="noopener noreferrer">Main link</a>
            ${mod.mirrorUrl ? `<a class="button secondary" href="${escapeHtml(mod.mirrorUrl)}" rel="noopener noreferrer">Mirror</a>` : ""}
          </div>
        </div>
      </details>
    </article>
  `).join("");

  $("#modsCount").textContent = `${MODS.length} release${MODS.length === 1 ? "" : "s"}`;
}

function setupNavigation() {
  const button = $("#menuToggle");
  const links = $("#navLinks");

  button.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      links.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderMods();
  setupNavigation();
  $("#year").textContent = new Date().getFullYear();
});
