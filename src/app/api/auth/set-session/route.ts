import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body;
    if (!access_token) {
      return NextResponse.json(
        { error: "access_token required" },
        { status: 400 }
      );
    }
    const response = NextResponse.json({ ok: true });
    const cookieOpts = setAuthCookies(
      access_token,
      refresh_token ?? ""
    );
    cookieOpts.forEach((c) => {
      response.cookies.set(c.name, c.value, {
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite,
        path: c.path,
        maxAge: c.maxAge,
      });
    });
    return response;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Set session failed" },
      { status: 500 }
    );
  }
}
