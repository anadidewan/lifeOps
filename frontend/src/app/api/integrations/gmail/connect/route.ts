import { NextResponse } from "next/server";

function backendBaseUrl(): string | null {
  const explicit = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:8000";
  return null;
}

async function proxyGmailConnectToBackend(authorizationBearer: string): Promise<Response> {
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

  try {
    const res = await fetch(`${base}/integrations/gmail/connect`, {
      method: "GET",
      headers: { Authorization: authorizationBearer },
      redirect: "manual",
    });

    const loc = res.headers.get("Location");
    if (res.status >= 300 && res.status < 400 && loc) {
      // Backend may return 307. After our POST (form with token), 307 would re-POST that body
      // to Google and trigger: "Parameter not allowed for this message type: id_token".
      // 303 forces a GET to the OAuth URL.
      return NextResponse.redirect(loc, 303);
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[api/integrations/gmail/connect] proxy failed:", e);
    return NextResponse.json(
      { detail: "Could not reach the backend. Is it running?" },
      { status: 502 }
    );
  }
}

/** Proxies GET /integrations/gmail/connect with Bearer → FastAPI (302 to Google OAuth). */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json({ detail: "Authorization Bearer token required" }, { status: 401 });
  }
  return proxyGmailConnectToBackend(authHeader);
}

/**
 * Same proxy, but accepts the Firebase ID token in the body so the browser can use a real
 * form POST + full-page redirect. (fetch() + redirect:manual often yields an opaque redirect
 * with no Location header, so OAuth never starts.)
 */
export async function POST(request: Request) {
  let token: string | undefined;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { firebase_id_token?: string; id_token?: string; token?: string };
      token = body.firebase_id_token ?? body.id_token ?? body.token;
    } catch {
      return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
    }
  } else {
    const form = await request.formData();
    const raw = form.get("firebase_id_token") ?? form.get("id_token") ?? form.get("token");
    token = typeof raw === "string" ? raw : undefined;
  }

  if (!token?.trim()) {
    return NextResponse.json(
      { detail: "firebase_id_token (or id_token / token) is required" },
      { status: 400 }
    );
  }

  return proxyGmailConnectToBackend(`Bearer ${token.trim()}`);
}
