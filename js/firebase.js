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
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const GAME_RELEASE_FALLBACK = {
  version: "1.2",
  status: "Available",
  storagePath: "public/game/life-simulator/life-simulator-1.2.apk",
  fallbackUpdatedAt: "2026-09-04T00:00:00Z",
  fallbackSizeBytes: 0
};

const app = initializeApp(firebaseConfig);

if (!APP_CHECK_SITE_KEY.startsWith("REPLACE_")) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

const storage = getStorage(app);
const db = getFirestore(app);
let releaseDocumentPromise = null;

function withTimeout(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Firebase request timed out")), milliseconds);
    })
  ]);
}

async function getReleaseDocument() {
  if (!releaseDocumentPromise) {
    releaseDocumentPromise = withTimeout(
      getDoc(doc(db, "publicReleases", "life-simulator")),
      8000
    ).then((snapshot) => snapshot.exists() ? snapshot.data() : {})
     .catch((error) => {
       releaseDocumentPromise = null;
       throw error;
     });
  }
  return releaseDocumentPromise;
}

export async function getGameRelease() {
  let releaseDocument = {};
  try {
    releaseDocument = await getReleaseDocument();
  } catch (error) {
    console.warn("Firestore release document unavailable; using website fallbacks.", error);
  }

  const version = GAME_RELEASE_FALLBACK.version;
  const status = GAME_RELEASE_FALLBACK.status;
  const storagePath = GAME_RELEASE_FALLBACK.storagePath;
  const fallbackUpdatedAt = releaseDocument.updatedAt ?? GAME_RELEASE_FALLBACK.fallbackUpdatedAt;
  const fallbackSizeBytes = Number(
    releaseDocument.sizeBytes ??
    releaseDocument.fallbackSizeBytes ??
    GAME_RELEASE_FALLBACK.fallbackSizeBytes
  );

  const fileRef = ref(storage, storagePath);
  const downloadUrl = await withTimeout(getDownloadURL(fileRef), 10000);

  let sizeBytes = fallbackSizeBytes;
  let updatedAt = fallbackUpdatedAt;

  try {
    const metadata = await withTimeout(getMetadata(fileRef), 6000);
    sizeBytes = Number(metadata.size || sizeBytes);
    updatedAt = metadata.updated || metadata.timeCreated || updatedAt;
  } catch (error) {
    console.warn("Firebase Storage metadata unavailable; using release fallbacks.", error);
  }

  return {
    ...releaseDocument,
    version,
    status,
    storagePath,
    downloadCount: Number(releaseDocument.downloadCount || 0),
    downloadUrl,
    sizeBytes,
    updatedAt
  };
}

export async function incrementDownloadCount() {
  return false;
}
