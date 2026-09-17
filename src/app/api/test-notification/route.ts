import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { channel, target } = await req.json();

    if (channel === "email") {
      const key = process.env.RESEND_API_KEY;
      if (!key) return NextResponse.json({ error: "RESEND_API_KEY belum dikonfigurasi di Vercel env vars." }, { status: 400 });
      if (!target) return NextResponse.json({ error: "Email target wajib diisi." }, { status: 400 });

      const resend = new Resend(key);
      const { error } = await resend.emails.send({
        from:    "Portfolio Test <onboarding@resend.dev>",
        to:      target,
        subject: "✅ Test Email — Portfolio Notification",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e8e8e8;border-radius:12px;border:1px solid #222">
            <h2 style="color:#c81c1c">Test Berhasil! ✅</h2>
            <p>Email notifikasi dari <strong>zhiyyporto.vercel.app</strong> berfungsi dengan baik.</p>
            <p style="color:#888;font-size:13px">Pesan ini dikirim sebagai test dari dashboard admin.</p>
          </div>
        `,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, message: `Test email berhasil dikirim ke ${target}` });
    }

    if (channel === "wa") {
      const token = process.env.FONNTE_TOKEN;
      if (!token) return NextResponse.json({ error: "FONNTE_TOKEN belum dikonfigurasi." }, { status: 400 });
      if (!target) return NextResponse.json({ error: "Nomor WA target wajib diisi." }, { status: 400 });

      const res = await fetch("https://api.fonnte.com/send", {
        method:  "POST",
        headers: { Authorization: token, "Content-Type": "application/x-www-form-urlencoded" },
        body:    new URLSearchParams({
          target,
          message: "✅ *Test Berhasil!*\n\nNotifikasi WhatsApp dari portfolio kamu berfungsi dengan baik.",
        }),
      });
      const json = await res.json();
      if (!res.ok || json.status === false) {
        return NextResponse.json({ error: json.reason ?? "Fonnte error" }, { status: 400 });
      }
      return NextResponse.json({ ok: true, message: `Test WA berhasil dikirim ke ${target}` });
    }

    return NextResponse.json({ error: "Channel tidak valid" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
