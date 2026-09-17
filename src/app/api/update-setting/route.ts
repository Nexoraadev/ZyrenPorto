import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;
    await sb.from("site_settings").upsert({ key, value }, { onConflict: "key" });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
