import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const { ids } = body as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "ids array required" },
      { status: 400 }
    );
  }
  const { error } = await supabaseServer
    .from("deals")
    .delete()
    .in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
