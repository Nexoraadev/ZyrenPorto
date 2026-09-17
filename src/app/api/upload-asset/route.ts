import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;

    // Auth check
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData  = await req.formData();
    const file      = formData.get("file") as File | null;
    const bucket    = formData.get("bucket") as string | null;
    const oldPath   = formData.get("oldPath") as string | null;

    if (!file || !bucket) {
      return NextResponse.json({ error: "Missing file or bucket" }, { status: 400 });
    }

    // Delete old file if provided
    if (oldPath) {
      await sb.storage.from(bucket).remove([oldPath]);
    }

    // Upload new file
    const ext     = file.name.split(".").pop() ?? "png";
    const path    = `${bucket === "logos" ? "logo" : bucket}-${Date.now()}.${ext}`;
    const buffer  = await file.arrayBuffer();

    const { error: uploadError } = await sb.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: pub } = sb.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl, path });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
