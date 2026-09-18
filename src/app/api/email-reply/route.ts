import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { to, toName, replyText, originalMessage, messageId } = await req.json();

    if (!to || !replyText?.trim()) {
      return NextResponse.json({ error: "Field tidak lengkap." }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "RESEND_API_KEY belum dikonfigurasi." }, { status: 500 });
    }

    // Get admin email from site_settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;
    const { data: settings } = await sb
      .from("site_settings")
      .select("value")
      .eq("key", "contact_info")
      .single();

    const adminEmail: string = (settings?.value?.email as string) ?? "ohmyliinnn@gmail.com";

    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from:    `Zyrenn Portfolio <onboarding@resend.dev>`,
      to:      to,
      replyTo: adminEmail,
      subject: `Re: Pesan dari Portfolio`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e8e8e8;border-radius:12px;border:1px solid #222">
          <h2 style="color:#0891b2;margin-bottom:4px">Balasan dari Zyrenn</h2>
          <p style="color:#666;font-size:13px;margin-top:0">zhiyyporto.vercel.app</p>
          <hr style="border:none;border-top:1px solid #222;margin:20px 0"/>
          <p style="color:#888;font-size:13px;margin-bottom:8px">Hei ${toName},</p>
          <div style="background:#141414;border-radius:8px;padding:16px;border:1px solid #1e1e1e;color:#d0d0d0;line-height:1.7;white-space:pre-wrap">${replyText.trim()}</div>
          ${originalMessage ? `
          <hr style="border:none;border-top:1px solid #222;margin:20px 0"/>
          <p style="color:#555;font-size:12px;margin-bottom:6px">Pesan asli kamu:</p>
          <div style="background:#0d0d0d;border-radius:8px;padding:12px;border:1px solid #181818;color:#666;font-size:13px;line-height:1.6;white-space:pre-wrap">${originalMessage}</div>
          ` : ""}
          <hr style="border:none;border-top:1px solid #222;margin:20px 0"/>
          <p style="color:#444;font-size:12px">— Reavlenia Arezha (Zyrenn)</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark as replied in Supabase
    if (messageId) {
      await sb.from("messages").update({ replied: true }).eq("id", messageId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email reply error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
