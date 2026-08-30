import { getApps, initializeApp, cert, applicationDefault, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

// When using emulators, FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST
// env vars (set in package.json dev:emulator script) make the Admin SDK talk
// to the local emulators automatically - no service account needed.
if (USE_EMULATORS) {
  process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
}

function buildApp(): App {
  if (getApps().length) return getApps()[0]!;

  if (USE_EMULATORS) {
    return initializeApp({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "s8-lms-dev" });
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

  if (clientEmail && privateKey && projectId) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  // Falls back to Application Default Credentials (e.g. when deployed on
  // Firebase App Hosting / Cloud Run, which provide these automatically).
  return initializeApp({ credential: applicationDefault() });
}

const app = buildApp();
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
