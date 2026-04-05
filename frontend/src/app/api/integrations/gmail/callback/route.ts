import { NextResponse } from "next/server";

function backendBaseUrl(): string | null {
  const explicit = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:8000";
  return null;
}

/**
 * Proxies Google's OAuth redirect to FastAPI `GET /integrations/gmail/callback`.
 *
 * Set backend `GOOGLE_REDIRECT_URI` and Google Cloud "Authorized redirect URIs" to this URL, e.g.:
 *   http://127.0.0.1:3001/api/integrations/gmail/callback
 * (Use your real Next dev host/port.) Must match exactly — no extra `/api` on the FastAPI side.
 */
export async function GET(request: Request) {
  const base = backendBaseUrl();
  if (!base) {
    return NextResponse.json(
      { detail: "BACKEND_API_URL is not configured. Set it for production builds." },
      { status: 503 }
    );
  }

  const incoming = new URL(request.url);
  const target = new URL(`${base}/integrations/gmail/callback`);
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  try {
    const res = await fetch(target.toString(), {
      method: "GET",
      redirect: "manual",
    });

    const loc = res.headers.get("Location");
    if (res.status >= 300 && res.status < 400 && loc) {
      return NextResponse.redirect(loc, 303);
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { detail: text || "Unknown error" };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[api/integrations/gmail/callback] proxy failed:", e);
    return NextResponse.json(
      { detail: "Could not reach the backend. Is it running?" },
      { status: 502 }
    );
  }
}
