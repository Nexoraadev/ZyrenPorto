import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { target, message, messageId } = await req.json();
    if (!target || !message) return NextResponse.json({ error: "Missing target or message" }, { status: 400 });

    const token = process.env.FONNTE_TOKEN;
    if (!token) return NextResponse.json({ error: "FONNTE_TOKEN not configured" }, { status: 500 });

    const res = await fetch("https://api.fonnte.com/send", {
      method:  "POST",
      headers: { Authorization: token, "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({ target, message }),
    });
    const json = await res.json();

    if (!res.ok || json.status === false) {
      return NextResponse.json({ error: json.reason ?? "Fonnte send failed" }, { status: 400 });
    }

    // Mark as replied
    if (messageId) {
      await sb.from("messages_wa").update({ replied: true }).eq("id", messageId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
