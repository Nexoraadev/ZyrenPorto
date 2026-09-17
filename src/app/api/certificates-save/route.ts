import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, payload } = body;

    // INSERT or UPDATE certificate
    if (action === "upsert_certificate") {
      const { certData, certId } = payload;
      if (certId) {
        const { error } = await sb.from("certificates").update(certData).eq("id", certId);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ ok: true });
      } else {
        const { data, error } = await sb.from("certificates").insert(certData).select("id").single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ ok: true, id: data.id });
      }
    }

    // DELETE certificate (also removes file from storage if path given)
    if (action === "delete_certificate") {
      const { certId } = payload;
      // Fetch file_storage_path from DB first, then delete from storage
      const { data: certRow } = await sb
        .from("certificates")
        .select("file_storage_path")
        .eq("id", certId)
        .single();
      if (certRow?.file_storage_path) {
        await sb.storage.from("certificates").remove([certRow.file_storage_path]);
      }
      const { error } = await sb.from("certificates").delete().eq("id", certId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Public GET — list all certificates
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;
    const { data, error } = await sb
      .from("certificates")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
