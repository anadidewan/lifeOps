import { NextResponse } from "next/server";

function backendBaseUrl(): string | null {
  const explicit = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:8000";
  return null;
}

async function proxy(request: Request, pathSegments: string[]): Promise<Response> {
  const base = backendBaseUrl();
  if (!base) {
    return NextResponse.json(
      { detail: "BACKEND_API_URL is not configured. Set it in the environment for production builds." },
      { status: 503 }
    );
  }

  const pathname = "/" + pathSegments.join("/");
  const incoming = new URL(request.url);
  const targetUrl = `${base}${pathname}${incoming.search}`;

  const auth = request.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json({ detail: "Authorization Bearer token required" }, { status: 401 });
  }

  const headers = new Headers();
  headers.set("Authorization", auth);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const method = request.method.toUpperCase();
  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(targetUrl, init);
    const outHeaders = new Headers();
    const ct = res.headers.get("content-type");
    if (ct) outHeaders.set("Content-Type", ct);
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, { status: res.status, headers: outHeaders });
  } catch (e) {
    console.error("[api/backend] proxy failed:", e);
    return NextResponse.json(
      { detail: "Could not reach the backend. Is it running?" },
      { status: 502 }
    );
  }
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function DELETE(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
