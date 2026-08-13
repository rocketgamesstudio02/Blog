import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import {
  getFirestore,
  doc,
  getDoc,
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

// Optional App Check. Leave the placeholder unchanged until a real
// reCAPTCHA Enterprise site key has been configured in Firebase.
const APP_CHECK_SITE_KEY = "REPLACE_WITH_RECAPTCHA_ENTERPRISE_SITE_KEY";

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

// Expose these for simple browser-console diagnostics and compatibility
// with scripts that expect the Firebase helpers on window.
window.db = db;
window.doc = doc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.increment = increment;

export async function getGameRelease() {
  // Prefer a fresh server read so a stale local cache cannot make a
  // configured release appear missing. Fall back to the normal SDK read
  // only if the forced server request itself cannot be completed.
  let snapshot;

  try {
    snapshot = await getDocFromServer(releaseRef);
  } catch (error) {
    console.warn("Direct Firestore server read failed; falling back to getDoc().", error);
    snapshot = await getDoc(releaseRef);
  }

  if (!snapshot.exists()) {
    throw new Error("No public Life Simulator release is configured.");
  }

  const release = snapshot.data();

  if (!release.storagePath || typeof release.storagePath !== "string") {
    throw new Error("The release document does not contain a storagePath.");
  }

  const downloadUrl = await getDownloadURL(ref(storage, release.storagePath));

  return {
    version: release.version || "1.0",
    status: release.status || "Available",
    downloadCount:
      typeof release.downloadCount === "number" ? release.downloadCount : 0,
    downloadUrl
  };
}

export async function incrementDownloadCount() {
  await updateDoc(releaseRef, {
    downloadCount: increment(1)
  });
}
