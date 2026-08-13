import { getGameRelease } from "./firebase.js";

const $ = (selector, root = document) => root.querySelector(selector);

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

async function setupDownload() {
  const button = $("#gameDownload");
  const version = $("#gameVersion");

  button.disabled = true;
  button.textContent = "Checking release…";

  try {
    const release = await getGameRelease();

    if (version) {
      version.textContent = release.version || "1.0";
    }

    button.textContent = "Download";
    button.disabled = false;

    button.addEventListener("click", () => {
      window.location.assign(release.downloadUrl);
    });
  } catch (error) {
    console.error("Failed to load game download:", error);
    button.textContent = "Download unavailable";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupDownload();

  const year = $("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
});
