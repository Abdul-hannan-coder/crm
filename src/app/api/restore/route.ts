import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { supabaseServer } from "@/lib/supabase-server";

const ALLOWED_COLLECTIONS = [
  "candidates",
  "contacts",
  "companies",
  "opportunities",
  "tasks",
  "deals",
  "pipelines",
] as const;

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const { id } = body as { id?: string };
  if (!id) {
    return NextResponse.json(
      { error: "Missing deleted item id" },
      { status: 400 }
    );
  }
  const { data: deleted, error: fetchError } = await supabaseServer
    .from("deleted_items")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !deleted) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Deleted item not found" },
      { status: 404 }
    );
  }
  const collection = deleted.original_collection as string;
  if (!ALLOWED_COLLECTIONS.includes(collection as (typeof ALLOWED_COLLECTIONS)[number])) {
    return NextResponse.json(
      { error: "Invalid original_collection" },
      { status: 400 }
    );
  }
  const originalData = deleted.original_data as Record<string, unknown>;
  const { error: insertError } = await supabaseServer
    .from(collection)
    .insert(originalData);
  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }
  const { error: deleteError } = await supabaseServer
    .from("deleted_items")
    .delete()
    .eq("id", id);
  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
