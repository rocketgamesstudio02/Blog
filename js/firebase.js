import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import {
  getStorage,
  ref,
  getDownloadURL,
  getMetadata
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBS-0SKs7ATLoiGWDl6gBsoHpLH7AlJDsI",
  authDomain: "rocket-website-9609a.firebaseapp.com",
  projectId: "rocket-website-9609a",
  storageBucket: "rocket-website-9609a.firebasestorage.app",
  messagingSenderId: "1096330868914",
  appId: "1:1096330868914:web:4caa954ae70169ef7731ab",
  measurementId: "G-PERE0FXK4M"
};

const APP_CHECK_SITE_KEY = "REPLACE_WITH_RECAPTCHA_ENTERPRISE_SITE_KEY";

// Keep these fallback values in sync with the currently published APK.
// Firebase metadata automatically replaces them when the metadata request succeeds.
const GAME_RELEASE = {
  version: "1.1",
  status: "Available",
  storagePath: "public/game/life-simulator/life-simulator-1.1.apk",
  fallbackUpdatedAt: "2026-08-21T00:00:00Z",
  fallbackSizeBytes: 22775071
};

const app = initializeApp(firebaseConfig);

if (!APP_CHECK_SITE_KEY.startsWith("REPLACE_")) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

const storage = getStorage(app);

function withTimeout(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Firebase request timed out")), milliseconds);
    })
  ]);
}

export async function getGameRelease() {
  const fileRef = ref(storage, GAME_RELEASE.storagePath);

  // The download URL is required for the button. Metadata is optional and
  // must never prevent the release from loading.
  const downloadUrl = await withTimeout(getDownloadURL(fileRef), 10000);

  let sizeBytes = GAME_RELEASE.fallbackSizeBytes;
  let updatedAt = GAME_RELEASE.fallbackUpdatedAt;

  try {
    const metadata = await withTimeout(getMetadata(fileRef), 6000);
    sizeBytes = Number(metadata.size || sizeBytes);
    updatedAt = metadata.updated || metadata.timeCreated || updatedAt;
  } catch (error) {
    console.warn("Firebase metadata unavailable; using release fallback values.", error);
  }

  return {
    version: GAME_RELEASE.version,
    status: GAME_RELEASE.status,
    downloadCount: 0,
    downloadUrl,
    sizeBytes,
    updatedAt
  };
}

// Kept only for compatibility with older website code.
// The website no longer records or displays a download counter.
export async function incrementDownloadCount() {
  return false;
}
