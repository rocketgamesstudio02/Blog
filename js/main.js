import { getGameRelease } from "./firebase.js";

const $ = (selector, root = document) => root.querySelector(selector);

const FALLBACK_WHATS_NEW = [
  "Major UI rework + Dark Mode",
  "Improved character visuals",
  "Expanded childhood and family legacy simulation",
  "Major Military and Politics expansions",
  "Military coups and Military → Politics progression",
  "Expanded Real Estate + Tenants",
  "Farming added",
  "Major Vehicle Expansion with modifications, Off-Roading, and Race Tracks",
  "Expanded Crime and Prison gameplay",
  "Illegal Businesses",
  "Reworked Investments and a new fictional market",
  "Gambling added",
  "Cloud Saves and improved Account/community systems",
  "Sandbox and Mod Studio reworks",
  "NPC, government, immigration, balancing, and bug fixes"
];

const FALLBACK_CHANGELOG = [
  {
    version: "1.2",
    subtitle: "Major expansion",
    groups: [
      ["UI & Character Improvements", ["Major UI rework", "Added Dark Mode", "Improved Character Icons", "Expanded and improved character appearance assets", "Improved age-based character presentation", "General interface polish across the game"]],
      ["Child Life & Family Legacy", ["Expanded childhood simulation", "Childhood is now more connected to family background and circumstances", "Improved connections between children and family legacy", "Expanded early-life progression"]],
      ["Military Expansion", ["Significantly expanded Military careers", "Rebalanced military progression and promotions", "Expanded Officer career progression", "Added deeper military career activities", "Added the ability to transition from Military service into Politics", "Added Coups", "Expanded military leadership and high-ranking career paths"]],
      ["Politics Expansion", ["Significantly expanded the Politics system", "Political careers are now more personalized", "Expanded political progression", "Improved elections and political activities", "Expanded government simulation", "Improved connections between political careers and other life paths", "Fixed minor Politics issues"]],
      ["Real Estate Expansion", ["Added Tenants", "Added new Real Estate properties", "Expanded property ownership gameplay", "Improved Real Estate management"]],
      ["Farming", ["Added Farming", "Players can now own and operate farms", "Farming introduces a new property and business-oriented life path"]],
      ["Vehicle Expansion", ["Significantly expanded vehicle properties and statistics", "Added Vehicle Modification", "Expanded vehicle customization", "Added different vehicle build possibilities", "Added Off-Roading", "Added Race Track activities", "Vehicle setup now has a greater effect on vehicle performance"]],
      ["Crime Expansion", ["Expanded criminal life paths", "Added more Crime gameplay", "Expanded Prison gameplay", "Improved connections between Crime and other systems"]],
      ["Business Expansion", ["Expanded business ownership and management", "Added Illegal Businesses", "Illegal Businesses are directly connected to the Crime system", "Expanded alternative ways of building wealth"]],
      ["Investment Expansion", ["Completely reworked the Investment system", "Introduced a new fictional financial market", "Expanded investment gameplay and financial progression"]],
      ["Gambling", ["Added Gambling", "Introduced new risk-based financial activities"]],
      ["Account & Community System", ["Expanded the Account system", "Improved community connectivity", "Added Cloud Saves", "Added integration between Accounts and Mods", "Improved access to community-created content"]],
      ["Sandbox Rework", ["Reworked Sandbox Mode", "Improved character and simulation customization", "Expanded Sandbox functionality"]],
      ["Mod Studio Rework", ["Reworked Mod Studio", "Improved mod creation and management", "Improved integration between Mods and the Account system"]],
      ["NPC Improvements", ["Minor NPC Friend system rework", "Improved NPC interactions and relationship behavior"]],
      ["Government Improvements", ["Improved Government simulation", "Expanded interactions between Politics and government systems"]],
      ["Bug Fixes & Polish", ["Fixed minor Politics bugs", "Fixed an Immigration bug", "Various UI improvements", "General balancing improvements", "Minor simulation fixes and polish"]]
    ]
  },
  {
    version: "1.1",
    subtitle: "Foundation expansion",
    groups: [
      ["Life Simulation", ["Expanded general life progression and life events", "Improved long-term character progression", "Improved education and career simulation", "Expanded family and relationship interactions", "Improved NPC interactions and life continuity"]],
      ["Economy & Careers", ["Expanded financial gameplay", "Improved career progression and income systems", "Expanded early Business, Investment, and Real Estate systems"]],
      ["Major Life Paths", ["Expanded the foundations of Military gameplay", "Expanded the foundations of Politics", "Improved Crime-related gameplay", "Expanded vehicle ownership and lifestyle activities"]],
      ["Sandbox & Modding", ["Improved Sandbox functionality", "Expanded the foundations of Mod Studio and custom content support"]],
      ["General Improvements", ["UI improvements", "Balance adjustments", "Simulation improvements", "Performance improvements", "Various bug fixes"]]
    ]
  }
];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map(v => typeof v === "string" ? v.replace(/^[•*\-–—]+\s*/, "").trim() : "").filter(Boolean);
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    try { const parsed = JSON.parse(text); if (Array.isArray(parsed)) return normalizeList(parsed); } catch (_) {}
    return text.split(/\r?\n/).map(v => v.replace(/^[•*\-–—]+\s*/, "").trim()).filter(Boolean);
  }
  return [];
}

function normalizeChangelog(value) {
  if (!value) return [];
  if (typeof value === "string") {
    try { return normalizeChangelog(JSON.parse(value)); } catch (_) { return []; }
  }
  const releases = Array.isArray(value) ? value : Object.entries(value).map(([version, data]) => ({version, ...data}));
  return releases.map(release => {
    if (!release || typeof release !== "object") return null;
    const version = String(release.version || release.name || "").replace(/_/g, ".").trim();
    const subtitle = String(release.subtitle || release.label || "").trim();
    const rawGroups = release.groups || release.sections || release.categories || [];
    const groups = Array.isArray(rawGroups) ? rawGroups.map(group => {
      if (Array.isArray(group) && group.length >= 2) return [String(group[0]), normalizeList(group[1])];
      if (!group || typeof group !== "object") return null;
      return [String(group.title || group.name || "Updates"), normalizeList(group.items || group.changes || group.entries)];
    }).filter(g => g && g[1].length) : [];
    return version && groups.length ? {version, subtitle, groups} : null;
  }).filter(Boolean);
}

function injectReleaseStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .release-grid{grid-template-columns:1fr!important}.release-card{width:100%}
    .rocket-changelog{padding-top:48px}.rocket-changelog-stack{display:flex;flex-direction:column;gap:14px}
    .rocket-changelog details{background:var(--panel,#fff);border:1px solid var(--line,#e4e8f0);border-radius:20px;overflow:hidden;box-shadow:var(--shadow,0 18px 40px rgba(20,25,39,.08))}
    .rocket-changelog summary{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;cursor:pointer;list-style:none}.rocket-changelog summary::-webkit-details-marker{display:none}
    .rocket-changelog summary span{display:flex;flex-direction:column}.rocket-changelog summary small{color:var(--muted,#687386)}
    .rocket-changelog-body{padding:18px;border-top:1px solid var(--line,#e4e8f0);background:var(--panel-2,#f8f9fd)}
    .rocket-changelog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.rocket-changelog-grid article{padding:16px;border:1px solid var(--line,#e4e8f0);border-radius:16px;background:var(--panel,#fff)}
    .rocket-changelog-grid h3{margin:0 0 8px;font-size:.96rem}.rocket-changelog-grid ul{margin:0;padding-left:18px;color:var(--muted,#687386);font-size:.87rem}.rocket-changelog-grid li{margin:5px 0}
    .theme-toggle-fab{position:fixed;right:18px;bottom:18px;z-index:100;width:52px;height:52px;border-radius:50%;border:1px solid var(--line,#d7ddea);background:var(--panel,#fff);color:var(--text,#151821);box-shadow:0 14px 34px rgba(15,23,42,.18);display:flex;align-items:center;justify-content:center;cursor:pointer}.theme-toggle-fab svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
    html[data-theme="dark"]{--bg:#0e1117;--bg-soft:#131821;--panel:#171c25;--panel-2:#1d2430;--line:#2a3442;--line-strong:#3a4657;--text:#f4f7fb;--muted:#9aa7b8;--accent:#5d9eff;--accent-strong:#77adff;--green:#55cf88;--shadow:0 18px 42px rgba(0,0,0,.28);color-scheme:dark}
    html[data-theme="dark"] body,html[data-theme="dark"] .home-page{background:#0e1117!important;color:#f4f7fb}
    html[data-theme="dark"] .site-header{background:rgba(14,17,23,.9)!important;border-color:#2a3442!important}
    html[data-theme="dark"] .app-store-card,html[data-theme="dark"] .contact-card,html[data-theme="dark"] .release-card,html[data-theme="dark"] .release-dialog,html[data-theme="dark"] .release-dialog-header{background:#171c25!important;border-color:#2a3442!important;color:#f4f7fb!important}
    html[data-theme="dark"] .meta-pill,html[data-theme="dark"] .whats-new-button,html[data-theme="dark"] .release-dialog-close,html[data-theme="dark"] .contact-links a{background:#1d2430!important;border-color:#2a3442!important;color:#f4f7fb!important}
    html[data-theme="dark"] .app-description,html[data-theme="dark"] .about-lead,html[data-theme="dark"] .about-copy,html[data-theme="dark"] .safety-intro,html[data-theme="dark"] .safety-item span,html[data-theme="dark"] .release-intro,html[data-theme="dark"] .release-card li,html[data-theme="dark"] .publisher-line,html[data-theme="dark"] .app-version-line{color:#9aa7b8!important}
    html[data-theme="dark"] .footer{background:#0e1117!important;border-color:#2a3442!important}
    @media(max-width:720px){.rocket-changelog-grid{grid-template-columns:1fr}.theme-toggle-fab{right:14px;bottom:14px;width:50px;height:50px}}
  `;
  document.head.appendChild(style);
}

function setupTheme() {
  const key = "rocket-games-theme";
  const root = document.documentElement;
  const saved = (() => { try { return localStorage.getItem(key); } catch (_) { return null; } })();
  const initial = saved === "dark" || saved === "light" ? saved : (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const button = document.createElement("button");
  button.className = "theme-toggle-fab";
  button.type = "button";
  document.body.appendChild(button);
  const apply = theme => {
    root.dataset.theme = theme;
    const dark = theme === "dark";
    button.innerHTML = dark ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path></svg>' : '<svg viewBox="0 0 24 24"><path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z"></path></svg>';
    button.title = dark ? "Switch to light mode" : "Switch to dark mode";
    button.setAttribute("aria-label", button.title);
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = dark ? "#0e1117" : "#f5f6fa";
  };
  apply(initial);
  button.addEventListener("click", () => { const next = root.dataset.theme === "dark" ? "light" : "dark"; apply(next); try { localStorage.setItem(key,next); } catch (_) {} });
}

function setupNavigation() {
  const button = $("#menuToggle"), links = $("#navLinks");
  if (!button || !links) return;
  button.addEventListener("click", () => { const open = links.classList.toggle("open"); button.setAttribute("aria-expanded", String(open)); });
  links.addEventListener("click", e => { if (e.target.closest("a")) { links.classList.remove("open"); button.setAttribute("aria-expanded","false"); } });
  if (!links.querySelector('a[href="#changelog"]')) {
    const about = links.querySelector('a[href="#about"]');
    const a = document.createElement("a"); a.href = "#changelog"; a.textContent = "Changelog";
    links.insertBefore(a, about || links.firstChild);
  }
}

function setupWhatsNewDialog() {
  const openButton = $("#whatsNewButton"), dialog = $("#whatsNewDialog"), closeButton = $("#whatsNewClose");
  if (!openButton || !dialog || !closeButton) return;
  openButton.addEventListener("click", () => typeof dialog.showModal === "function" ? dialog.showModal() : dialog.setAttribute("open", ""));
  closeButton.addEventListener("click", () => typeof dialog.close === "function" ? dialog.close() : dialog.removeAttribute("open"));
  dialog.addEventListener("click", e => { const r = dialog.getBoundingClientRect(); if ((e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) && typeof dialog.close === "function") dialog.close(); });
}

function renderWhatsNew(data) {
  const body = $("#whatsNewDialog .release-dialog-body"), title = $("#whatsNewTitle");
  if (!body) return;
  const items = normalizeList(data.whatsNew ?? data.whatIsNew ?? data.highlights ?? data.releaseHighlights);
  const finalItems = items.length ? items : FALLBACK_WHATS_NEW;
  if (title) title.textContent = "Rocket Life — Version 1.2";
  body.innerHTML = `<p class="release-intro">Version 1.2 is a major expansion across the interface, simulation, life paths, assets, finance, accounts and modding.</p><article class="release-card"><ul>${finalItems.map(v=>`<li>${escapeHtml(v)}</li>`).join("")}</ul></article><p class="release-cta"><a href="#changelog" id="fullChangelogLink">View full changelog</a></p>`;
  $("#fullChangelogLink")?.addEventListener("click", () => $("#whatsNewDialog")?.close?.());
}

function renderChangelog(data) {
  let section = $("#changelog");
  if (!section) {
    section = document.createElement("section");
    section.id = "changelog";
    section.className = "shell content-section rocket-changelog";
    $("#about")?.before(section);
  }
  const firebaseReleases = normalizeChangelog(data.changelog ?? data.versionChangelog ?? data.changelogs);
  const releases = firebaseReleases.length ? firebaseReleases : FALLBACK_CHANGELOG;
  section.innerHTML = `<div class="section-header"><div><div class="section-caption">Release history</div><h2>Version Changelog</h2></div></div><div class="rocket-changelog-stack">${releases.map((r,i)=>`<details ${i===0?"open":""}><summary><span><strong>Version ${escapeHtml(r.version)}</strong>${r.subtitle?`<small>${escapeHtml(r.subtitle)}</small>`:""}</span><b>${i===0?"−":"+"}</b></summary><div class="rocket-changelog-body"><div class="rocket-changelog-grid">${r.groups.map(g=>`<article><h3>${escapeHtml(g[0])}</h3><ul>${g[1].map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></article>`).join("")}</div></div></details>`).join("")}</div>`;
  section.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => { const b=d.querySelector("summary b"); if(b)b.textContent=d.open?"−":"+"; }));
}

function updateDataSafety() {
  const section = $("#data-safety");
  if (!section) return;
  const content = section.querySelector(".safety-content");
  if (!content) return;
  content.innerHTML = `<p class="safety-intro">Rocket Life can still be played without creating a Rocket Games account. Version 1.2 adds optional account, Cloud Save and community features, so information used by those online features may be processed separately from normal on-device gameplay.</p><div class="safety-list"><div class="safety-item"><span class="safety-icon">✓</span><div><strong>Local gameplay remains available</strong><span>Normal life simulation progress is kept on your device unless you choose an online feature such as Cloud Saves.</span></div></div><div class="safety-item"><span class="safety-icon">@</span><div><strong>Optional accounts and sign-in</strong><span>Account features may use Firebase Authentication and supported sign-in providers to process account identifiers and information needed to sign you in.</span></div></div><div class="safety-item"><span class="safety-icon">☁</span><div><strong>Cloud Saves and community features</strong><span>When you use Cloud Saves, account-linked backups and supported community or Mod Studio content may be stored online to provide those features.</span></div></div><div class="safety-item"><span class="safety-icon">i</span><div><strong>Firebase, diagnostics and advertising</strong><span>Firebase and Google advertising services may process technical, diagnostic, consent, device or advertising-related information according to the features you use and the choices shown on your device.</span></div></div></div><div class="contact-links"><a href="./privacy.html">Privacy Policy</a><a href="./account-deletion.html">Account Deletion</a></div>`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Not available";
  const units=["B","KB","MB","GB"]; let value=bytes,i=0; while(value>=1024&&i<units.length-1){value/=1024;i++;} return `${value.toFixed(i>=2?1:0)} ${units[i]}`;
}
function formatDate(value) {
  if (!value) return "Not available"; const d=typeof value?.toDate==="function"?value.toDate():new Date(value); if(Number.isNaN(d.getTime())) return "Not available"; return new Intl.DateTimeFormat(undefined,{year:"numeric",month:"long",day:"numeric"}).format(d);
}

async function setupRelease() {
  const button=$("#gameDownload"), version=$("#gameVersion"), details=$("#detailsVersion"), updated=$("#lastUpdated"), size=$("#appSize");
  if(version)version.textContent="1.2"; if(details)details.textContent="1.2";
  renderWhatsNew({}); renderChangelog({});
  if (!button) return;
  button.disabled=true; button.textContent="Checking release…";
  try {
    const release=await getGameRelease();
    renderWhatsNew(release); renderChangelog(release);
    if(updated)updated.textContent=formatDate(release.updatedAt); if(size)size.textContent=formatBytes(release.sizeBytes);
    button.textContent="Download Rocket Life"; button.disabled=false; button.addEventListener("click",()=>window.location.assign(release.downloadUrl));
  } catch (error) {
    console.error("Failed to load Firebase release:",error); button.textContent="Download unavailable"; if(updated)updated.textContent="Not available"; if(size)size.textContent="Not available";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.title = "Rocket Life 1.2 – Android Life Simulator | Rocket Games";
  injectReleaseStyles(); setupTheme(); setupNavigation(); setupWhatsNewDialog(); updateDataSafety(); setupRelease();
  const year=$("#year"); if(year)year.textContent=new Date().getFullYear();
});
