import { getGameRelease } from "./firebase.js";

const $ = (selector, root = document) => root.querySelector(selector);

function setupNavigation() {
  const button = $("#menuToggle");
  const links = $("#navLinks");

  if (!button || !links) return;

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

function setupWhatsNewDialog() {
  const openButton = $("#whatsNewButton");
  const dialog = $("#whatsNewDialog");
  const closeButton = $("#whatsNewClose");

  if (!openButton || !dialog || !closeButton) return;

  openButton.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  });

  closeButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (clickedBackdrop) dialog.close();
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Not available";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex >= 2 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

async function setupDownload() {
  const button = $("#gameDownload");
  const version = $("#gameVersion");
  const detailsVersion = $("#detailsVersion");
  const lastUpdated = $("#lastUpdated");
  const appSize = $("#appSize");

  if (!button) return;

  button.disabled = true;
  button.textContent = "Checking release…";

  const loadingTimeout = window.setTimeout(() => {
    if (lastUpdated?.textContent.includes("Checking")) lastUpdated.textContent = "Not available";
    if (appSize?.textContent.includes("Checking")) appSize.textContent = "Not available";
  }, 8000);

  try {
    const release = await getGameRelease();
    const releaseVersion = release.version || "1.1";

    if (version) version.textContent = releaseVersion;
    if (detailsVersion) detailsVersion.textContent = releaseVersion;
    if (lastUpdated) lastUpdated.textContent = formatDate(release.updatedAt);
    if (appSize) appSize.textContent = formatBytes(release.sizeBytes);

    button.textContent = "Download Rocket Life";
    button.disabled = false;

    button.addEventListener("click", () => {
      window.location.assign(release.downloadUrl);
    });
  } catch (error) {
    console.error("Failed to load game download:", error);
    button.textContent = "Download unavailable";
    if (lastUpdated) lastUpdated.textContent = "Not available";
    if (appSize) appSize.textContent = "Not available";
  } finally {
    window.clearTimeout(loadingTimeout);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupWhatsNewDialog();
  setupDownload();

  const year = $("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
});
