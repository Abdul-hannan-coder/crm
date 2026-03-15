import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { clearAuthCookies } from "@/lib/auth";

export async function POST() {
  try {
    await supabaseServer.auth.signOut();
  } catch {
    // ignore
  }
  const response = NextResponse.json({ ok: true });
  clearAuthCookies().forEach((c) => {
    response.cookies.set(c.name, c.value, { path: c.path, maxAge: c.maxAge });
  });
  return response;
}
