import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Starts Google OAuth via Next.js → FastAPI `GET /integrations/gmail/connect`.
 * Uses a real HTML form POST so the browser follows the 302 to accounts.google.com.
 * (fetch + redirect:manual often returns an opaque redirect with no Location header.)
 */
export async function redirectToGmailOAuth(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to connect Gmail.");
  }
  const idToken = await user.getIdToken();

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/integrations/gmail/connect";
  form.style.display = "none";

  const input = document.createElement("input");
  input.type = "hidden";
  // Not named "id_token" — avoids confusion if a 307 ever re-posted this field to Google.
  input.name = "firebase_id_token";
  input.value = idToken;
  form.appendChild(input);
  document.body.appendChild(form);
  try {
    sessionStorage.setItem("lifeos_pending_gmail_sync", "1");
  } catch {
    /* ignore */
  }
  form.submit();
}
