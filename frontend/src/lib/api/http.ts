import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Authenticated fetch to FastAPI via `/api/backend/...` proxy (Bearer Firebase ID token).
 */
export async function apiFetch(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<Response> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in.");
  }
  const token = await user.getIdToken();
  const p = path.startsWith("/") ? path : `/${path}`;
  const { json, headers: hdrs, body, ...rest } = init;
  const headers = new Headers(hdrs);
  headers.set("Authorization", `Bearer ${token}`);
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`/api/backend${p}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : body,
  });
}

export async function apiJson<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const b = (await res.json()) as { detail?: unknown };
      if (typeof b.detail === "string") detail = b.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
