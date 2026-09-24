import { GAMES } from "./data.js?v=20260924-2";

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

function previewHtml(mod) {
  const previewUrl = typeof mod.previewUrl === "string" ? mod.previewUrl.trim() : "";

  if (!previewUrl) {
    return '<p class="requires-tag">Preview unavailable.</p>';
  }

  const safeUrl = escapeHtml(previewUrl);
  const safeTitle = escapeHtml(mod.title);
  const isVideo = /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(previewUrl);

  if (isVideo) {
    return `<video controls preload="metadata" style="display:block;width:100%;max-height:520px;border-radius:14px;background:#000;" src="${safeUrl}">Your browser does not support video previews.</video>`;
  }

  return `<img src="${safeUrl}" alt="${safeTitle} preview" loading="lazy" style="width:100%;border-radius:14px;">`;
}

function downloadLinksHtml(mod, isSupported) {
  if (!isSupported) {
    return '<p class="requires-tag">Support has ended for this release. Download links are no longer available.</p>';
  }

  return `
    <div class="mod-links">
      <a class="button primary" href="${escapeHtml(mod.downloadUrl)}" rel="noopener noreferrer">Main link</a>
      ${mod.mirrorUrl ? `<a class="button secondary" href="${escapeHtml(mod.mirrorUrl)}" rel="noopener noreferrer">Mirror</a>` : ""}
    </div>
  `;
}

function releaseCard(mod) {
  // Support is controlled explicitly per release. Older releases stay downloadable
  // unless isSupported is deliberately set to false in data.js.
  const isSupported = mod.isSupported !== false;
  const statusBadge = !isSupported
    ? '<span class="new-badge">SUPPORT ENDED</span>'
    : (mod.isLatestUpdate ? '<span class="new-badge">LATEST</span>' : "");

  return `
    <article class="mod-card${mod.isLatestUpdate ? " latest" : ""}">
      <div class="mod-top">
        <div class="mod-meta">
          <span>${escapeHtml(mod.version)} · ${escapeHtml(mod.date)}</span>
          ${statusBadge}
        </div>
      </div>

      <h3>${escapeHtml(mod.title)}</h3>
      <p class="mod-platform">${escapeHtml(mod.platform)}</p>

      <details>
        <summary>Preview</summary>
        <div class="mod-details">
          ${previewHtml(mod)}
        </div>
      </details>

      <details>
        <summary>Release details</summary>
        <div class="mod-details">
          <p class="requires-tag">${escapeHtml(mod.requires)}</p>
          <ul>${changelogHtml(mod.changelog)}</ul>
          ${downloadLinksHtml(mod, isSupported)}
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
