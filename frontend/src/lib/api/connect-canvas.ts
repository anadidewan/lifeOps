import { getFirebaseAuth } from "@/lib/firebase/client";

function formatApiErrorMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object") {
    const first = detail[0] as { msg?: string };
    if (typeof first.msg === "string") return first.msg;
  }
  return "Could not save your Canvas token.";
}

/**
 * Persists the Canvas access token via Next.js → FastAPI `POST /integrations`
 * (Bearer: Firebase ID token, body matches IntegrationCreate).
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

  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      provider: "canvas",
      status: "connected",
      access_token: trimmed,
    }),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "The API server has no POST /integrations route yet. Add it on the backend to save your Canvas token."
      );
    }
    let detail: unknown;
    try {
      const body = (await res.json()) as { detail?: unknown };
      detail = body.detail;
    } catch {
      detail = undefined;
    }
    throw new Error(formatApiErrorMessage(detail));
  }
}
