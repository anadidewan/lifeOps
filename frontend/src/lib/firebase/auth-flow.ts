import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

export type VerifyTokenOptions = {
  /** When set, persisted by FastAPI as the Canvas integration access token (same POST /auth/verify-token). */
  canvasToken?: string;
};

/**
 * Registers the Firebase session with the FastAPI backend (POST /auth/verify-token).
 * Calls the Next.js route `/api/auth/verify-token`, which proxies to `BACKEND_API_URL`
 * so the browser does not need CORS or a public API URL.
 *
 * Optional `canvasToken` is sent as `canvas_token` so the backend can upsert the Canvas integration in one request.
 */
export async function verifyTokenWithBackend(idToken: string, options?: VerifyTokenOptions): Promise<void> {
  const body: Record<string, string> = { token: idToken };
  const canvas = options?.canvasToken?.trim();
  if (canvas) body.canvas_token = canvas;

  const res = await fetch("/api/auth/verify-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = "Could not verify session with the server.";
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (Array.isArray(body.detail) && body.detail[0] && typeof body.detail[0] === "object") {
        const first = body.detail[0] as { msg?: string };
        if (typeof first.msg === "string") detail = first.msg;
      }
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
    "auth/account-exists-with-different-credential": "An account already exists with a different sign-in method.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase for this project.",
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
