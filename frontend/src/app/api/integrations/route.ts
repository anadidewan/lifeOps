import { NextResponse } from "next/server";

function backendBaseUrl(): string | null {
  const explicit = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:8000";
  return null;
}

/** Proxies authenticated Canvas (and other) integration payloads to FastAPI POST /integrations. */
export async function POST(request: Request) {
  const base = backendBaseUrl();
  if (!base) {
    return NextResponse.json(
      {
        detail:
          "BACKEND_API_URL is not configured. Set it in the environment for production builds.",
      },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json({ detail: "Authorization Bearer token required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${base}/integrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[api/integrations] proxy failed:", e);
    return NextResponse.json(
      { detail: "Could not reach the backend. Is it running?" },
      { status: 502 }
    );
  }
}
