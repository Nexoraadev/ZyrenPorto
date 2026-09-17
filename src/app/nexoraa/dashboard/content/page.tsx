import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/admin/ContentEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Content" };

export default async function ContentPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any;

  const keys = ["hero_name","hero_roles","hero_bio","hero_stats","hero_image","about_bio","about_stats","about_traits","about_profile","about_personality","contact_info","site_logo","skills_heading"];
  const { data } = await sb.from("site_settings").select("key,value").in("key", keys);

  // Build a map key→value
  const settings: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value ?? {};
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Edit Konten</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// ubah teks & foto yang tampil di website`}
        </p>
      </div>
      <ContentEditor initialSettings={settings} />
    </div>
  );
}
