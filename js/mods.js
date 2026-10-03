import { GAMES } from "./data.js?v=20261004-1";

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

function previewHtml(game) {
  const previews = Array.isArray(game.previews) ? game.previews.filter((preview) => {
    const url = typeof preview === "string" ? preview : preview?.url;
    return typeof url === "string" && url.trim();
  }) : [];
  if (!previews.length) return '<p class="requires-tag">Preview unavailable.</p>';
  return `<div class="game-preview-gallery">${previews.map((preview, index) => {
    const url = typeof preview === "string" ? preview.trim() : preview.url.trim();
    const alt = typeof preview === "string" ? `${game.name} screenshot ${index + 1}` : (preview.alt || `${game.name} screenshot ${index + 1}`);
    const safeUrl = escapeHtml(url);
    if (/\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url)) {
      return `<div class="game-preview-item"><video controls preload="metadata" src="${safeUrl}">Your browser does not support video previews.</video></div>`;
    }
    return `<figure class="game-preview-item"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(alt)}"><img src="${safeUrl}" alt="${escapeHtml(alt)}" loading="lazy"></a></figure>`;
  }).join("")}</div>`;
}

function downloadLinksHtml(mod, game, isSupported) {
  if (!isSupported) {
    return '<p class="requires-tag">Support has ended for this release. Download links are no longer available.</p>';
  }

  return `
    <div class="mod-links">
      <a class="button primary" href="${escapeHtml(mod.downloadUrl)}" rel="noopener noreferrer">Main link</a>
      ${mod.mirrorUrl ? `<a class="button secondary" href="${escapeHtml(mod.mirrorUrl)}" rel="noopener noreferrer">Mirror</a>` : ""}
      ${game.playStoreUrl ? `<a class="button secondary" href="${escapeHtml(game.playStoreUrl)}" target="_blank" rel="noopener noreferrer">Google Play</a>` : ""}
    </div>
  `;
}

function releaseCard(mod, game) {
  const isSupported = mod.isSupported !== false;
  const statusBadge = !isSupported
    ? '<span class="unavailable-badge">UNAVAILABLE</span>'
    : (mod.isLatestUpdate ? '<span class="new-badge">LATEST</span>' : "");
  return `
    <article class="mod-card${mod.isLatestUpdate && isSupported ? " latest" : ""}${!isSupported ? " unavailable" : ""}">
      <div class="mod-top">
        <div class="mod-meta">
          <span>${escapeHtml(mod.version)} · ${escapeHtml(mod.date)}</span>
          ${statusBadge}
        </div>
      </div>
      <h3>${escapeHtml(mod.title)}</h3>
      <p class="mod-platform">${escapeHtml(mod.platform)}</p>
      <details>
        <summary>Release details</summary>
        <div class="mod-details">
          <p class="requires-tag">${escapeHtml(mod.requires)}</p>
          ${mod.changelog?.length ? `<ul>${changelogHtml(mod.changelog)}</ul>` : ""}
          ${downloadLinksHtml(mod, game, isSupported)}
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
  $("#gamePreviewContent").innerHTML = previewHtml(game);
  $("#gamePreviewPanel").open = Array.isArray(game.previews) && game.previews.length > 0;
  $("#modGrid").innerHTML = game.releases.map((mod) => releaseCard(mod, game)).join("");
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

function setupTheme() {
  const key = "rocket-games-theme";
  const root = document.documentElement;
  const button = document.createElement("button");
  button.className = "theme-toggle-fab";
  button.type = "button";
  document.body.appendChild(button);
  const saved = (() => { try { return localStorage.getItem(key); } catch (_) { return null; } })();
  const initial = saved === "dark" || saved === "light"
    ? saved : (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const apply = (theme) => {
    const dark = theme === "dark";
    root.dataset.theme = theme;
    button.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z"></path></svg>';
    button.title = dark ? "Switch to light mode" : "Switch to dark mode";
    button.setAttribute("aria-label", button.title);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#0e1117" : "#f5f6fa";
  };
  apply(initial);
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem(key, next); } catch (_) {}
  });
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
  setupTheme();
  showGameSelector();
  $("#year").textContent = new Date().getFullYear();
});
