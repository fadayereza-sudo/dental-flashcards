import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, constantTimeEqual, sha256Hex } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "APP_PASSWORD is not set on the server" },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const submitted = String(form.get("password") ?? "");
  if (!constantTimeEqual(submitted, expected)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "1");
    const from = String(form.get("from") ?? "");
    if (from) url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await sha256Hex(expected);
  const from = String(form.get("from") ?? "/");
  const safeFrom = from.startsWith("/") && !from.startsWith("//") ? from : "/";
  const dest = req.nextUrl.clone();
  dest.pathname = safeFrom.split("?")[0];
  dest.search = safeFrom.includes("?") ? "?" + safeFrom.split("?")[1] : "";

  const res = NextResponse.redirect(dest, { status: 303 });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
