import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fonnte sends POST with form data or JSON
export async function POST(req: NextRequest) {
  try {
    let sender = "", senderName = "", message = "";

    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      sender     = body.sender     ?? body.from    ?? "";
      senderName = body.name       ?? body.pushname ?? "";
      message    = body.message    ?? body.text     ?? "";
    } else {
      // form-urlencoded
      const fd   = await req.formData();
      sender     = (fd.get("sender")  ?? fd.get("from")     ?? "") as string;
      senderName = (fd.get("name")    ?? fd.get("pushname")  ?? "") as string;
      message    = (fd.get("message") ?? fd.get("text")      ?? "") as string;
    }

    if (!sender || !message) {
      return NextResponse.json({ ok: false, error: "Missing sender or message" }, { status: 400 });
    }

    // Ignore messages from ourselves (status updates etc)
    const myNumber = process.env.FONNTE_TARGET ?? "";
    if (myNumber && sender.includes(myNumber.replace(/^0/, "62"))) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;

    await sb.from("messages_wa").insert({
      sender,
      sender_name: senderName || null,
      message,
      direction:   "inbound",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WA webhook error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Fonnte may also send GET to verify webhook
export async function GET() {
  return NextResponse.json({ status: "ok", webhook: "zhiyy-portfolio" });
}
