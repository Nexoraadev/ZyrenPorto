import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "music")
      .single();

    return NextResponse.json({ url: data?.value?.url ?? null });
  } catch {
    return NextResponse.json({ url: null });
  }
}
