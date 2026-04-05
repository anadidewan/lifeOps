import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

/** Optional: same FastAPI base URL as your backend (e.g. http://127.0.0.1:8000). */
export async function verifyTokenWithBackend(idToken: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!base) return;

  const res = await fetch(`${base}/auth/verify-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken }),
  });

  if (!res.ok) {
    let detail = "Could not verify session with the server.";
    try {
      const body = (await res.json()) as { detail?: string };
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function signInWithApple(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const provider = new OAuthProvider("apple.com");
  return signInWithPopup(auth, provider);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email.trim());
}

function firebaseErrorMessage(code: string, fallback: string): string {
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address does not look valid.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found for that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Pop-up was blocked. Allow pop-ups for this site.",
    "auth/account-exists-with-different-credential": "An account already exists with a different sign-in method.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase.",
  };
  return map[code] ?? fallback;
}

export function formatAuthError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && typeof (err as { code: string }).code === "string") {
    return firebaseErrorMessage((err as { code: string }).code, "Something went wrong. Please try again.");
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
