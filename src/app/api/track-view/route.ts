import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path || path.startsWith("/nexoraa")) {
      return NextResponse.json({ ok: true }); // jangan track admin pages
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;
    await sb.from("page_views").insert({
      path:       path,
      referrer:   req.headers.get("referer") ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 200) ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
