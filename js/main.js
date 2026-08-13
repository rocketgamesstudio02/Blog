import { getGameRelease, incrementDownloadCount } from "./firebase.js";

const $ = (selector, root = document) => root.querySelector(selector);

function formatCount(value) {
  return new Intl.NumberFormat().format(value);
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

async function setupDownload() {
  const button = $("#gameDownload");
  const version = $("#gameVersion");
  const downloadCount = $("#downloadCount");

  button.disabled = true;
  button.textContent = "Checking release…";

  try {
    const release = await getGameRelease();

    version.textContent = release.version || "1.0";
    downloadCount.textContent = formatCount(release.downloadCount);
    button.textContent = "Download";
    button.disabled = false;

    button.addEventListener("click", async () => {
      // Open immediately so browsers don't block the download navigation.
      const url = release.downloadUrl;

      // Increment separately. Failure should never stop a valid download.
      try {
        await incrementDownloadCount();
        release.downloadCount += 1;
        downloadCount.textContent = formatCount(release.downloadCount);
      } catch (error) {
        console.warn("Could not update download count:", error);
      }

      window.location.assign(url);
    });
  } catch (error) {
    console.error(error);
    button.textContent = "Download unavailable";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupDownload();
  $("#year").textContent = new Date().getFullYear();
});
