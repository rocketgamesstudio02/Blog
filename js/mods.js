import { GAMES } from "./data.js";

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

function releaseCard(mod) {
  return `
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
          <ul>${changelogHtml(mod.changelog)}</ul>
          <div class="mod-links">
            <a class="button primary" href="${escapeHtml(mod.downloadUrl)}" rel="noopener noreferrer">Main link</a>
            ${mod.mirrorUrl ? `<a class="button secondary" href="${escapeHtml(mod.mirrorUrl)}" rel="noopener noreferrer">Mirror</a>` : ""}
          </div>
        </div>
      </details>
    </article>
  `;
}

function renderGameSelector() {
  const selector = $("#gameSelector");
  selector.innerHTML = GAMES.map((game) => `
    <button class="game-card" type="button" data-game-id="${escapeHtml(game.id)}">
      <img src="${escapeHtml(game.icon)}" alt="${escapeHtml(game.name)} icon">
      <span class="game-card-copy">
        <strong>${escapeHtml(game.name)}</strong>
        <small>${escapeHtml(game.description)}</small>
      </span>
      <span class="game-card-arrow" aria-hidden="true">›</span>
    </button>
  `).join("");
}

function showGame(gameId) {
  const game = GAMES.find((item) => item.id === gameId);
  if (!game) return;

  $("#gameSelectorView").hidden = true;
  $("#gameReleaseView").hidden = false;
  $("#selectedGameName").textContent = game.name;
  $("#selectedGameIcon").src = game.icon;
  $("#selectedGameIcon").alt = `${game.name} icon`;
  $("#modGrid").innerHTML = game.releases.map(releaseCard).join("");
  $("#modsCount").textContent = `${game.releases.length} release${game.releases.length === 1 ? "" : "s"}`;
}

function showGameSelector() {
  $("#gameReleaseView").hidden = true;
  $("#gameSelectorView").hidden = false;
  $("#modsCount").textContent = `${GAMES.length} game${GAMES.length === 1 ? "" : "s"}`;
}

function setupGameSelection() {
  $("#gameSelector").addEventListener("click", (event) => {
    const button = event.target.closest("[data-game-id]");
    if (button) showGame(button.dataset.gameId);
  });

  $("#backToGames").addEventListener("click", showGameSelector);
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
  renderGameSelector();
  setupGameSelection();
  setupNavigation();
  showGameSelector();
  $("#year").textContent = new Date().getFullYear();
});
