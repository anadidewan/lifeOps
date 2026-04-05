import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/** Strip whitespace and trailing commas from .env mistakes (invalid lines are ignored by Next; bad paste adds commas). */
function envVal(v: string | undefined): string {
  return (v ?? "").trim().replace(/,+$/g, "");
}

function readConfig() {
  const projectId = envVal(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const authDomainRaw = envVal(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const authDomain =
    authDomainRaw || (projectId ? `${projectId}.firebaseapp.com` : "");

  return {
    apiKey: envVal(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain,
    projectId,
    storageBucket: envVal(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: envVal(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: envVal(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    measurementId: envVal(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
  };
}

export function isFirebaseConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.apiKey && c.authDomain && c.projectId);
}

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing) return existing;

  const c = readConfig();
  if (!c.apiKey || !c.authDomain || !c.projectId) {
    throw new Error(
      "Firebase Web SDK is not configured. In .env or .env.local, set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID from Firebase Console → Project settings → Your apps → Web app. (Admin SDK keys are not used in the browser.)"
    );
  }

  return initializeApp({
    apiKey: c.apiKey,
    authDomain: c.authDomain,
    projectId: c.projectId,
    ...(c.storageBucket ? { storageBucket: c.storageBucket } : {}),
    ...(c.messagingSenderId ? { messagingSenderId: c.messagingSenderId } : {}),
    ...(c.appId ? { appId: c.appId } : {}),
    ...(c.measurementId ? { measurementId: c.measurementId } : {}),
  });
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
