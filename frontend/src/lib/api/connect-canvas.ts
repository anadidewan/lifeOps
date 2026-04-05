import { verifyTokenWithBackend } from "@/lib/firebase/auth-flow";
import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Persists the Canvas access token via Next.js → FastAPI `POST /auth/verify-token`
 * with `{ token: Firebase ID token, canvas_token: ... }` (see backend auth route).
 */
export async function connectCanvasIntegration(accessToken: string): Promise<void> {
  const trimmed = accessToken.trim();
  if (!trimmed) return;

  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to connect Canvas.");
  }
  const idToken = await user.getIdToken();
  await verifyTokenWithBackend(idToken, { canvasToken: trimmed });
}
