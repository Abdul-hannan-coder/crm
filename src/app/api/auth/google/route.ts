import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const { data, error } = await supabaseServer.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes:
          "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email",
      },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data.url) {
      return NextResponse.json(
        { error: "No redirect URL" },
        { status: 500 }
      );
    }
    return NextResponse.json({ url: data.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "OAuth failed" },
      { status: 500 }
    );
  }
}
