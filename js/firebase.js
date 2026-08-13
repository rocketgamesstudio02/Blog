import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import {
  getFirestore,
  doc,
  getDocFromServer,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

const FALLBACK_RELEASE = {
  version: "1.0",
  status: "Available",
  downloadCount: 0,
  storagePath: "public/game/life-simulator/life-simulator-1.0.apk"
};

const app = initializeApp(firebaseConfig);

if (!APP_CHECK_SITE_KEY.startsWith("REPLACE_")) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

const db = getFirestore(app);
const storage = getStorage(app);
const releaseRef = doc(db, "publicReleases", "life-simulator");

export async function getGameRelease() {
  let release = FALLBACK_RELEASE;

  try {
    const snapshot = await getDocFromServer(releaseRef);

    if (snapshot.exists()) {
      release = {
        ...FALLBACK_RELEASE,
        ...snapshot.data()
      };
    } else {
      console.warn(
        "Firestore release document was not found. Using the verified Firebase Storage release path instead."
      );
    }
  } catch (error) {
    console.warn(
      "Firestore release lookup failed. Using the verified Firebase Storage release path instead.",
      error
    );
  }

  const storagePath =
    typeof release.storagePath === "string" && release.storagePath.length > 0
      ? release.storagePath
      : FALLBACK_RELEASE.storagePath;

  const downloadUrl = await getDownloadURL(ref(storage, storagePath));

  return {
    version: release.version || FALLBACK_RELEASE.version,
    status: release.status || FALLBACK_RELEASE.status,
    downloadCount:
      typeof release.downloadCount === "number"
        ? release.downloadCount
        : FALLBACK_RELEASE.downloadCount,
    downloadUrl
  };
}

export async function incrementDownloadCount() {
  try {
    await updateDoc(releaseRef, {
      downloadCount: increment(1)
    });
    return true;
  } catch (error) {
    console.warn("Firestore download counter is unavailable:", error);
    return false;
  }
}
