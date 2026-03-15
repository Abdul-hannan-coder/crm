import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  await request.json().catch(() => ({}));
  // Stub: in production would send a test email via the given SMTP config
  return NextResponse.json({ ok: true, message: "Test request received" });
}
