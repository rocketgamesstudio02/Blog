import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import {
  getStorage,
  ref,
  getDownloadURL
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

const GAME_RELEASE = {
  version: "1.0",
  status: "Available",
  storagePath: "public/game/life-simulator/life-simulator-1.0.apk"
};

const app = initializeApp(firebaseConfig);

if (!APP_CHECK_SITE_KEY.startsWith("REPLACE_")) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

const storage = getStorage(app);

export async function getGameRelease() {
  const downloadUrl = await getDownloadURL(
    ref(storage, GAME_RELEASE.storagePath)
  );

  return {
    version: GAME_RELEASE.version,
    status: GAME_RELEASE.status,
    downloadUrl
  };
}
