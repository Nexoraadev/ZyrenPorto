import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
  ?? "https://miss-marry.app.n8n.cloud/webhook/ce3d2547-b163-4dbe-b845-eaca02151704/chat";

export async function POST(req: NextRequest) {
  try {
    const { chatInput, sessionId } = await req.json();

    if (!chatInput?.trim()) {
      return NextResponse.json({ error: "Pesan kosong." }, { status: 400 });
    }

    let res: Response;
    try {
      // n8n Chat Trigger node expects this exact format
      res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept":        "application/json",
        },
        body: JSON.stringify({
          // n8n @n8n/chat widget standard format
          action:    "sendMessage",
          chatInput: chatInput.trim(),
          sessionId: sessionId ?? `web_${Date.now()}`,
        }),
      });
    } catch (fetchErr) {
      console.error("[chat] fetch failed:", fetchErr);
      return NextResponse.json({ output: "OFFLINE" });
    }

    const rawText = await res.text();
    console.log("[chat] n8n status:", res.status, "| body:", rawText.slice(0, 400));

    if (res.status === 404) {
      return NextResponse.json({
        output: "OFFLINE",
      });
    }

    if (!res.ok) {
      return NextResponse.json({
        output: "OFFLINE",
      });
    }

    // Parse response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      // Plain text response
      return NextResponse.json({ output: rawText.trim() || "OK" });
    }

    // n8n can return various shapes
    const d = Array.isArray(data) ? data[0] : data;
    const reply =
      d?.output   ??
      d?.text     ??
      d?.reply    ??
      d?.response ??
      d?.message  ??
      d?.content  ??
      d?.answer   ??
      (typeof d === "string" ? d : null) ??
      rawText ??
      "Maaf, tidak ada respons dari AI.";

    return NextResponse.json({ output: String(reply) });

  } catch (err) {
    console.error("[chat] error:", err);
    return NextResponse.json({ output: "OFFLINE" });
  }
}
