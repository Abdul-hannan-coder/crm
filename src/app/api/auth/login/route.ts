import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { setAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }
    const {
      data: { session },
      error,
    } = await supabaseServer.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }
    const response = NextResponse.json({
      user: session.user,
    });
    const cookieOpts = setAuthCookies(
      session.access_token,
      session.refresh_token ?? ""
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
      { error: e instanceof Error ? e.message : "Login failed" },
      { status: 500 }
    );
  }
}
